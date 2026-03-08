import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/device-id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Check } from 'lucide-react';

interface Poll {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
}

interface Vote {
  poll_id: string;
  option_index: number;
}

interface SessionPollsProps {
  sessionId: string;
}

export function SessionPolls({ sessionId }: SessionPollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<number, number>>>({});
  const deviceId = getDeviceId();

  useEffect(() => {
    fetchPolls();
    fetchMyVotes();

    const channel = supabase
      .channel(`polls-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_polls', filter: `session_id=eq.${sessionId}` }, () => fetchPolls())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, () => { fetchVoteCounts(); fetchMyVotes(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const fetchPolls = async () => {
    const { data } = await supabase
      .from('session_polls')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) {
      const parsed = data.map(p => ({
        ...p,
        options: (p.options as unknown as string[]) || [],
      }));
      setPolls(parsed);
      // Fetch counts for these polls
      for (const p of parsed) {
        fetchVoteCountsForPoll(p.id);
      }
    }
  };

  const fetchMyVotes = async () => {
    const { data } = await supabase
      .from('poll_votes')
      .select('poll_id, option_index')
      .eq('device_id', deviceId);
    if (data) {
      const map: Record<string, Vote> = {};
      data.forEach(v => { map[v.poll_id] = v; });
      setVotes(map);
    }
  };

  const fetchVoteCounts = async () => {
    for (const p of polls) {
      await fetchVoteCountsForPoll(p.id);
    }
  };

  const fetchVoteCountsForPoll = async (pollId: string) => {
    const { data } = await supabase
      .from('poll_votes')
      .select('option_index')
      .eq('poll_id', pollId);
    if (data) {
      const counts: Record<number, number> = {};
      data.forEach(v => { counts[v.option_index] = (counts[v.option_index] || 0) + 1; });
      setVoteCounts(prev => ({ ...prev, [pollId]: counts }));
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (votes[pollId]) return;
    const { error } = await supabase
      .from('poll_votes')
      .insert({ poll_id: pollId, device_id: deviceId, option_index: optionIndex });
    if (!error) {
      setVotes(prev => ({ ...prev, [pollId]: { poll_id: pollId, option_index: optionIndex } }));
    }
  };

  if (polls.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <BarChart3 className="w-4 h-4" /> Active Polls
      </h3>
      <AnimatePresence>
        {polls.map(poll => {
          const myVote = votes[poll.id];
          const counts = voteCounts[poll.id] || {};
          const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

          return (
            <motion.div key={poll.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="anime-card overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="font-heading text-base">{poll.question}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {poll.options.map((option, idx) => {
                    const count = counts[idx] || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isMyVote = myVote?.option_index === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleVote(poll.id, idx)}
                        disabled={!!myVote}
                        className={`w-full relative rounded-lg px-4 py-3 text-left text-sm font-medium transition-all overflow-hidden ${
                          isMyVote
                            ? 'bg-primary/15 border-2 border-primary'
                            : myVote
                            ? 'bg-muted/10 border-2 border-border'
                            : 'bg-muted/10 border-2 border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                        }`}
                      >
                        {myVote && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-y-0 left-0 bg-primary/10 rounded-lg"
                          />
                        )}
                        <span className="relative flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {isMyVote && <Check className="w-4 h-4 text-primary" />}
                            {option}
                          </span>
                          {myVote && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {pct}% ({count})
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                  {totalVotes > 0 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
