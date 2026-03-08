import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronDown, ChevronUp, Users, User, XCircle, Download, FileText, Timer } from 'lucide-react';
import { usePollCountdown, formatCountdown } from '@/hooks/usePollCountdown';
import { toast } from 'sonner';
import { exportPollResultsCSV, exportPollResultsPDF } from '@/lib/exportPollData';

interface Poll {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
  is_multi_select: boolean;
  closes_at: string | null;
  created_at: string;
}

interface VoteDetail {
  device_id: string;
  option_index: number;
  user_name?: string;
  user_email?: string;
}

interface AdminPollResultsProps {
  sessionId: string;
}

export function AdminPollResults({ sessionId }: AdminPollResultsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollVotes, setPollVotes] = useState<Record<string, VoteDetail[]>>({});
  const [expandedPoll, setExpandedPoll] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);

  useEffect(() => {
    fetchPolls();

    const channel = supabase
      .channel(`admin-polls-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_polls', filter: `session_id=eq.${sessionId}` }, () => fetchPolls())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, () => fetchPolls())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const fetchPolls = async () => {
    const { data: pollsData } = await supabase
      .from('session_polls')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (!pollsData) return;

    const parsed = pollsData.map(p => ({
      ...p,
      options: (p.options as unknown as string[]) || [],
      is_multi_select: (p as any).is_multi_select ?? false,
    }));
    setPolls(parsed);

    const pollIds = parsed.map(p => p.id);
    if (pollIds.length === 0) return;

    const { data: votesData } = await supabase
      .from('poll_votes')
      .select('poll_id, device_id, option_index')
      .in('poll_id', pollIds);

    const { data: queueData } = await supabase
      .from('speaker_queue')
      .select('device_id, user_name, user_email')
      .eq('session_id', sessionId);

    const deviceMap: Record<string, { user_name: string; user_email?: string }> = {};
    queueData?.forEach(q => {
      deviceMap[q.device_id] = { user_name: q.user_name, user_email: q.user_email || undefined };
    });

    const grouped: Record<string, VoteDetail[]> = {};
    votesData?.forEach(v => {
      if (!grouped[v.poll_id]) grouped[v.poll_id] = [];
      grouped[v.poll_id].push({
        device_id: v.device_id,
        option_index: v.option_index,
        user_name: deviceMap[v.device_id]?.user_name,
        user_email: deviceMap[v.device_id]?.user_email,
      });
    });
    setPollVotes(grouped);
  };

  const closePoll = async (pollId: string) => {
    setClosing(pollId);
    const { error } = await supabase
      .from('session_polls')
      .update({ is_active: false })
      .eq('id', pollId);
    if (error) {
      toast.error('Failed to close poll');
    } else {
      toast.success('Poll closed! No more votes accepted.');
    }
    setClosing(null);
  };

  const reopenPoll = async (pollId: string) => {
    const { error } = await supabase
      .from('session_polls')
      .update({ is_active: true })
      .eq('id', pollId);
    if (error) {
      toast.error('Failed to reopen poll');
    } else {
      toast.success('Poll reopened!');
    }
  };

  if (polls.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No polls created yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {polls.map(poll => {
          const votes = pollVotes[poll.id] || [];
          const uniqueVoters = new Set(votes.map(v => v.device_id)).size;
          const totalVotes = votes.length;
          const isExpanded = expandedPoll === poll.id;

          const optionCounts: Record<number, number> = {};
          poll.options.forEach((_, idx) => { optionCounts[idx] = 0; });
          votes.forEach(v => { optionCounts[v.option_index] = (optionCounts[v.option_index] || 0) + 1; });

          const votersByOption: Record<number, VoteDetail[]> = {};
          poll.options.forEach((_, idx) => { votersByOption[idx] = []; });
          votes.forEach(v => {
            if (!votersByOption[v.option_index]) votersByOption[v.option_index] = [];
            votersByOption[v.option_index].push(v);
          });

          return (
            <motion.div key={poll.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className={`shadow-sm border overflow-hidden ${!poll.is_active ? 'opacity-80' : ''}`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      {poll.question}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {uniqueVoters} voter{uniqueVoters !== 1 ? 's' : ''}
                        {poll.is_multi_select && <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded ml-1">Multi-select</span>}
                      </span>
                      {!poll.is_active && (
                        <span className="text-[10px] bg-destructive/15 text-destructive px-1.5 py-0.5 rounded font-medium">Closed</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {/* Percentage bars */}
                  {poll.options.map((option, idx) => {
                    const count = optionCounts[idx] || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isWinning = totalVotes > 0 && count === Math.max(...Object.values(optionCounts));

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${isWinning ? 'text-primary' : 'text-foreground'}`}>{option}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {pct}% ({count})
                          </span>
                        </div>
                        <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${isWinning ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Action buttons row */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border">
                    {/* Close / Reopen */}
                    {poll.is_active ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => closePoll(poll.id)}
                        disabled={closing === poll.id}
                      >
                        <XCircle className="w-3 h-3" />
                        {closing === poll.id ? 'Closing...' : 'Close Poll'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => reopenPoll(poll.id)}
                      >
                        Reopen Poll
                      </Button>
                    )}

                    {/* Export CSV */}
                    {totalVotes > 0 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => exportPollResultsCSV(poll, votes, votersByOption)}
                        >
                          <Download className="w-3 h-3" /> CSV
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => exportPollResultsPDF(poll, votes, votersByOption, optionCounts)}
                        >
                          <FileText className="w-3 h-3" /> PDF
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Expand/collapse voter details */}
                  {totalVotes > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setExpandedPoll(isExpanded ? null : poll.id)}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                      {isExpanded ? 'Hide voter details' : 'Show voter details'}
                    </Button>
                  )}

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border pt-3 mt-1 space-y-3">
                          {poll.options.map((option, idx) => {
                            const voters = votersByOption[idx] || [];
                            if (voters.length === 0) return null;
                            return (
                              <div key={idx}>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                  {option} ({voters.length})
                                </p>
                                <div className="space-y-1">
                                  {voters.map((voter, vIdx) => (
                                    <div key={vIdx} className="flex items-center gap-2 text-xs bg-muted/20 rounded px-2 py-1.5">
                                      <User className="w-3 h-3 text-muted-foreground shrink-0" />
                                      <span className="font-medium truncate">
                                        {voter.user_name || `Anonymous (${voter.device_id.slice(0, 8)}...)`}
                                      </span>
                                      {voter.user_email && (
                                        <span className="text-muted-foreground truncate ml-auto">{voter.user_email}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}