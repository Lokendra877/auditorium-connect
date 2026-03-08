import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '@/hooks/useSession';
import { useQueueActions } from '@/hooks/useQueueActions';
import { useWebRTC } from '@/hooks/useWebRTC';
import { QueueList } from '@/components/QueueList';
import { MicStatus } from '@/components/MicStatus';
import { SpeakerTimer } from '@/components/SpeakerTimer';
import { AudioStatus } from '@/components/AudioStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hand, Loader2 } from 'lucide-react';

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, queue, loading } = useSession(sessionId);
  const { requestToSpeak, deviceId } = useQueueActions(sessionId);
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md gradient-card border-0 shadow-[var(--shadow-lg)]">
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-xl font-bold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground text-sm">This session may have ended or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md gradient-card border-0 shadow-[var(--shadow-lg)]">
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-xl font-bold mb-2">Session Ended</h2>
            <p className="text-muted-foreground text-sm">This session is no longer active.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSpeaker = queue.find(e => e.status === 'speaking');
  const myEntry = queue.find(e => e.device_id === deviceId);
  const amISpeaking = myEntry?.status === 'speaking';
  const { isStreaming, isReceiving, micError } = useWebRTC(sessionId, amISpeaking);
  const waitingQueue = queue.filter(e => e.status === 'waiting');
  const myPosition = myEntry && myEntry.status === 'waiting'
    ? waitingQueue.findIndex(e => e.id === myEntry.id) + 1
    : null;

  const handleJoin = () => {
    if (!userName.trim()) return;
    setHasJoined(true);
  };

  const handleRequestSpeak = async () => {
    await requestToSpeak(userName);
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-sm gradient-card border-0 shadow-[var(--shadow-lg)]">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-xl">{session.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Enter your name to join</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
              <Button variant="hero" className="w-full" onClick={handleJoin} disabled={!userName.trim()}>
                Join Session
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-heading text-xl font-bold truncate">{session.title}</h1>
          <p className="text-sm text-muted-foreground">Welcome, {userName}</p>
        </motion.div>

        {/* Current Speaker */}
        <Card className="mb-4 gradient-card border-0 shadow-[var(--shadow-md)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <MicStatus
                isActive={!!currentSpeaker}
                speakerName={currentSpeaker?.user_name}
              />
              {currentSpeaker && session.speaker_started_at && (
                <SpeakerTimer
                  totalSeconds={session.speaking_time_seconds}
                  startedAt={session.speaker_started_at}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Status */}
        {myEntry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <Card className={`border-0 shadow-[var(--shadow-sm)] ${
              myEntry.status === 'speaking' ? 'bg-success/10' : 'bg-primary/5'
            }`}>
              <CardContent className="p-4 text-center">
                {myEntry.status === 'speaking' ? (
                  <p className="font-heading font-semibold text-success">🎙️ You are speaking!</p>
                ) : (
                  <p className="font-heading text-sm text-primary">
                    Your position: <span className="font-bold text-lg">#{myPosition}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Request Button */}
        {!myEntry && (
          <Button
            variant="hero"
            size="lg"
            className="w-full mb-6 h-14 text-base"
            onClick={handleRequestSpeak}
          >
            <Hand className="w-5 h-5 mr-2" />
            Request to Speak
          </Button>
        )}

        {/* Queue */}
        <div>
          <h2 className="font-heading font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
            Speaker Queue ({queue.length})
          </h2>
          <QueueList queue={queue} currentDeviceId={deviceId} />
        </div>
      </div>
    </div>
  );
}
