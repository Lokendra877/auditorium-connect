import { useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '@/hooks/useSession';
import { useQueueActions } from '@/hooks/useQueueActions';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import { QRDisplay } from '@/components/QRDisplay';
import { QueueList } from '@/components/QueueList';
import { MicStatus } from '@/components/MicStatus';
import { SpeakerTimer } from '@/components/SpeakerTimer';
import { AudioStatus } from '@/components/AudioStatus';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Power, PlayCircle, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const adminCode = searchParams.get('code');
  const { session, queue, loading } = useSession(sessionId);
  const { grantMic, revokeMic, skipSpeaker, removeFromQueue, grantNextSpeaker } = useQueueActions(sessionId);
  const { isReceiving } = useWebRTC(sessionId, false);
  const analyticsData = useSessionAnalytics(sessionId, session?.created_at);

  const currentSpeaker = queue.find(e => e.status === 'speaking');
  const waitingCount = queue.filter(e => e.status === 'waiting').length;

  const handleTimeUp = useCallback(async () => {
    if (currentSpeaker) {
      await revokeMic(currentSpeaker.id);
      // Auto-grant next
      setTimeout(() => grantNextSpeaker(), 500);
    }
  }, [currentSpeaker, revokeMic, grantNextSpeaker]);

  const endSession = async () => {
    if (!sessionId) return;
    await supabase.from('sessions').update({ is_active: false }).eq('id', sessionId);
    toast.success('Session ended');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || session.admin_code !== adminCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md"><CardContent className="p-8 text-center">
          <h2 className="font-heading text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">Invalid admin code.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold">{session.title}</h1>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>
          <Button variant="destructive" size="sm" onClick={endSession}>
            <Power className="w-4 h-4 mr-1" /> End Session
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: QR + Stats */}
          <div className="space-y-4">
            <QRDisplay sessionId={session.id} />

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-[var(--shadow-sm)]">
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-heading text-2xl font-bold">{queue.length}</p>
                  <p className="text-xs text-muted-foreground">In Queue</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-[var(--shadow-sm)]">
                <CardContent className="p-4 text-center">
                  <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
                  <p className="font-heading text-2xl font-bold">{session.speaking_time_seconds}s</p>
                  <p className="text-xs text-muted-foreground">Per Speaker</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-[var(--shadow-sm)]">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Session ID</p>
                <p className="font-mono text-xs break-all select-all">{session.id}</p>
              </CardContent>
            </Card>
          </div>

          {/* Center: Current Speaker */}
          <div className="space-y-4">
            <AudioStatus
              isSpeaker={false}
              isStreaming={false}
              isReceiving={isReceiving}
              micError={null}
            />
            <Card className="gradient-card border-0 shadow-[var(--shadow-lg)]">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Current Speaker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MicStatus isActive={!!currentSpeaker} speakerName={currentSpeaker?.user_name} />

                {currentSpeaker && session.speaker_started_at ? (
                  <>
                    <SpeakerTimer
                      totalSeconds={session.speaking_time_seconds}
                      startedAt={session.speaker_started_at}
                      onTimeUp={handleTimeUp}
                    />
                    <div className="flex gap-2">
                      <Button variant="warning" size="sm" className="flex-1" onClick={() => skipSpeaker(currentSpeaker.id).then(() => setTimeout(grantNextSpeaker, 500))}>
                        Skip
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => revokeMic(currentSpeaker.id)}>
                        Revoke Mic
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={grantNextSpeaker}
                    disabled={waitingCount === 0}
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Grant Next Speaker ({waitingCount})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Queue */}
          <div>
            <Card className="border-0 shadow-[var(--shadow-sm)]">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Speaker Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <QueueList
                  queue={queue}
                  isAdmin
                  onSkip={(id) => skipSpeaker(id).then(() => setTimeout(grantNextSpeaker, 500))}
                  onRemove={removeFromQueue}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
