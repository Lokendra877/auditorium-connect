import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Session = Omit<Tables<'sessions'>, 'admin_code'>;
type QueueEntry = Tables<'speaker_queue'>;

const QUEUE_PUBLIC_COLUMNS =
  'id, session_id, user_name, device_id, position, status, requested_at, started_speaking_at, finished_speaking_at, is_moderator';

export function useSession(sessionId: string | undefined, includeEmails = false) {
  const [session, setSession] = useState<Session | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('sessions')
      .select('id, title, is_active, created_at, updated_at, speaking_time_seconds, current_speaker_id, speaker_started_at, user_id')
      .eq('id', sessionId)
      .single();
    if (data) setSession(data);
    setLoading(false);
  }, [sessionId]);

  const fetchQueue = useCallback(async () => {
    if (!sessionId) return;
    const columns = includeEmails ? `${QUEUE_PUBLIC_COLUMNS}, user_email` : QUEUE_PUBLIC_COLUMNS;
    const { data } = await supabase
      .from('speaker_queue')
      .select(columns)
      .eq('session_id', sessionId)
      .in('status', ['waiting', 'speaking'])
      .order('position', { ascending: true });
    if (data) setQueue(data as unknown as QueueEntry[]);
  }, [sessionId, includeEmails]);


  useEffect(() => {
    fetchSession();
    fetchQueue();
  }, [fetchSession, fetchQueue]);

  // Real-time subscriptions
  useEffect(() => {
    if (!sessionId) return;

    const sessionChannel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        if (payload.new) setSession(payload.new as Session);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'speaker_queue',
        filter: `session_id=eq.${sessionId}`,
      }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, fetchQueue]);

  return { session, queue, loading, refetch: fetchQueue, refetchSession: fetchSession };
}
