import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/device-id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart3, Check, Send, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { usePollCountdown, formatCountdown } from '@/hooks/usePollCountdown';

interface Poll {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
  is_multi_select: boolean;
  closes_at: string | null;
}

interface SessionPollsProps {
  sessionId: string;
}

export function SessionPolls({ sessionId }: SessionPollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number[]>>({});
  const [pendingSelections, setPendingSelections] = useState<Record<string, Set<number>>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<number, number>>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
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
        is_multi_select: (p as any).is_multi_select ?? false,
      }));
      setPolls(parsed);
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
      const map: Record<string, number[]> = {};
      data.forEach(v => {
        if (!map[v.poll_id]) map[v.poll_id] = [];
        map[v.poll_id].push(v.option_index);
      });
      setMyVotes(map);
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

  const handleSingleVote = async (pollId: string, optionIndex: number) => {
    if (myVotes[pollId]?.length) return;
    const { error } = await supabase
      .from('poll_votes')
      .insert({ poll_id: pollId, device_id: deviceId, option_index: optionIndex });
    if (!error) {
      setMyVotes(prev => ({ ...prev, [pollId]: [optionIndex] }));
    }
  };

  const togglePendingSelection = (pollId: string, optionIndex: number) => {
    setPendingSelections(prev => {
      const current = new Set(prev[pollId] || []);
      if (current.has(optionIndex)) current.delete(optionIndex);
      else current.add(optionIndex);
      return { ...prev, [pollId]: current };
    });
  };

  const submitMultiVote = async (pollId: string) => {
    const selected = pendingSelections[pollId];
    if (!selected || selected.size === 0) {
      toast.error('Select at least one option');
      return;
    }
    setSubmitting(pollId);
    const inserts = Array.from(selected).map(idx => ({
      poll_id: pollId,
      device_id: deviceId,
      option_index: idx,
    }));
    const { error } = await supabase.from('poll_votes').insert(inserts);
    if (!error) {
      setMyVotes(prev => ({ ...prev, [pollId]: Array.from(selected) }));
      setPendingSelections(prev => { const n = { ...prev }; delete n[pollId]; return n; });
    }
    setSubmitting(null);
  };

  if (polls.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <BarChart3 className="w-4 h-4" /> Active Polls
      </h3>
      <AnimatePresence>
        {polls.map(poll => {
          const voted = myVotes[poll.id]?.length > 0;
          const counts = voteCounts[poll.id] || {};
          const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
          const pending = pendingSelections[poll.id] || new Set();

          return (
            <motion.div key={poll.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="anime-card overflow-hidden">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="font-heading text-base">{poll.question}</CardTitle>
                  {poll.is_multi_select && !voted && (
                    <p className="text-xs text-muted-foreground">✅ Select multiple options</p>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {poll.options.map((option, idx) => {
                    const count = counts[idx] || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isMyVote = myVotes[poll.id]?.includes(idx);
                    const isSelected = pending.has(idx);

                    if (poll.is_multi_select && !voted) {
                      // Checkbox mode before voting
                      return (
                        <button
                          key={idx}
                          onClick={() => togglePendingSelection(poll.id, idx)}
                          className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all border-2 flex items-center gap-3 ${
                            isSelected
                              ? 'bg-primary/15 border-primary'
                              : 'bg-muted/10 border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          {option}
                        </button>
                      );
                    }

                    // Single select or already voted view
                    return (
                      <button
                        key={idx}
                        onClick={() => !poll.is_multi_select && handleSingleVote(poll.id, idx)}
                        disabled={voted}
                        className={`w-full relative rounded-lg px-4 py-3 text-left text-sm font-medium transition-all overflow-hidden ${
                          isMyVote
                            ? 'bg-primary/15 border-2 border-primary'
                            : voted
                            ? 'bg-muted/10 border-2 border-border'
                            : 'bg-muted/10 border-2 border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                        }`}
                      >
                        {voted && (
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
                          {voted && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {pct}% ({count})
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}

                  {/* Submit button for multi-select */}
                  {poll.is_multi_select && !voted && (
                    <Button
                      onClick={() => submitMultiVote(poll.id)}
                      disabled={submitting === poll.id || pending.size === 0}
                      className="w-full mt-1 bg-primary text-primary-foreground"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      {submitting === poll.id ? 'Submitting...' : `Submit Vote (${pending.size} selected)`}
                    </Button>
                  )}

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