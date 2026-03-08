import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '@/hooks/useSession';
import { useQueueActions } from '@/hooks/useQueueActions';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSpeechTranscription, useTranscriptListener } from '@/hooks/useTranslation';
import { QueueList } from '@/components/QueueList';
import { MicStatus } from '@/components/MicStatus';
import { SpeakerTimer } from '@/components/SpeakerTimer';
import { AudioStatus } from '@/components/AudioStatus';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LiveSubtitles } from '@/components/LiveSubtitles';
import { SessionPolls } from '@/components/SessionPolls';
import { AudienceQuestions } from '@/components/AudienceQuestions';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hand, Loader2, Mic, Mic2, MessageCircle, BarChart3, StopCircle, Mail } from 'lucide-react';

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, queue, loading } = useSession(sessionId);
  const { requestToSpeak, revokeMic, deviceId } = useQueueActions(sessionId);

  const savedName = getCookie('smartmic_user_name') || '';
  const savedEmail = getCookie('smartmic_user_email') || '';

  const [userName, setUserName] = useState(savedName);
  const [userEmail, setUserEmail] = useState(savedEmail);
  const [hasJoined, setHasJoined] = useState(!!savedName && !!savedEmail);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const myEntry = useMemo(() => queue.find(e => e.device_id === deviceId), [queue, deviceId]);
  const amISpeaking = myEntry?.status === 'speaking' || false;
  const { isStreaming, isReceiving, micError } = useWebRTC(sessionId, amISpeaking);

  useSpeechTranscription(sessionId, amISpeaking);
  const { subtitle, translatedSubtitle, isTranslating } = useTranscriptListener(sessionId, targetLanguage, ttsEnabled);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background gradient-hero">
        <Card className="max-w-md shadow-lg border">
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground text-sm">This session may have ended or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background gradient-hero">
        <Card className="max-w-md shadow-lg border">
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-2">Session Ended</h2>
            <p className="text-muted-foreground text-sm">This session is no longer active.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSpeaker = queue.find(e => e.status === 'speaking');
  const waitingQueue = queue.filter(e => e.status === 'waiting');
  const myPosition = myEntry && myEntry.status === 'waiting'
    ? waitingQueue.findIndex(e => e.id === myEntry.id) + 1
    : null;

  const handleJoin = () => {
    if (!userName.trim() || !userEmail.trim()) return;
    setCookie('smartmic_user_name', userName.trim());
    setCookie('smartmic_user_email', userEmail.trim());
    setHasJoined(true);
  };

  const handleRequestSpeak = async () => {
    await requestToSpeak(userName);
  };

  const handleStopSpeaking = async () => {
    if (myEntry) {
      await revokeMic(myEntry.id);
    }
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero px-4 relative overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 blob-shape blur-[80px]" />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-secondary/10 blob-shape-2 blur-[80px]" />
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="relative z-10">
          <Card className="w-full max-w-sm shadow-xl border">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-colored mb-3">
                <Mic2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="font-heading text-2xl">{session.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Enter your name to join</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
                className="text-center text-lg"
              />
              <Button className="w-full gradient-primary text-primary-foreground font-heading font-semibold text-lg shadow-colored hover:opacity-90 transition-opacity h-12" onClick={handleJoin} disabled={!userName.trim()}>
                Join Session
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-hero" />

      <div className="container mx-auto px-4 py-6 max-w-lg relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold truncate">{session.title}</h1>
            <p className="text-sm text-muted-foreground">Welcome, {userName}</p>
          </div>
          <UserNotificationBell sessionId={sessionId!} />
        </motion.div>

        {/* Audio Status */}
        <AudioStatus isSpeaker={amISpeaking} isStreaming={isStreaming} isReceiving={isReceiving} micError={micError} />

        {/* Language Selector */}
        <div className="my-3">
          <LanguageSelector selectedLanguage={targetLanguage} onSelect={setTargetLanguage} />
        </div>

        {/* Live Subtitles */}
        {(subtitle || translatedSubtitle) && (
          <div className="mb-3">
            <LiveSubtitles originalText={subtitle} translatedText={translatedSubtitle} isTranslating={isTranslating} targetLanguage={targetLanguage} ttsEnabled={ttsEnabled} onToggleTts={() => setTtsEnabled(prev => !prev)} />
          </div>
        )}

        {/* Current Speaker */}
        <Card className="mb-4 shadow-md border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <MicStatus isActive={!!currentSpeaker} speakerName={currentSpeaker?.user_name} />
              {currentSpeaker && session.speaker_started_at && (
                <SpeakerTimer totalSeconds={session.speaking_time_seconds} startedAt={session.speaker_started_at} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Status */}
        {myEntry && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
            <Card className={`shadow-md ${
              myEntry.status === 'speaking' ? 'bg-success/5 border-2 border-success/30' : 'bg-primary/5 border-2 border-primary/20'
            }`}>
              <CardContent className="p-4 text-center space-y-3">
                {myEntry.status === 'speaking' ? (
                  <>
                    <p className="font-heading text-xl font-bold text-success">🎙️ You are speaking!</p>
                    <Button variant="destructive" size="lg" onClick={handleStopSpeaking} className="w-full font-heading font-semibold text-lg">
                      <StopCircle className="w-5 h-5 mr-2" /> Stop Speaking
                    </Button>
                  </>
                ) : (
                  <p className="font-heading text-lg font-bold text-primary">
                    Your position: <span className="text-3xl">#{myPosition}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Request Button */}
        {!myEntry && (
          <Button
            size="lg"
            className="w-full mb-6 h-14 text-lg font-heading font-semibold gradient-primary text-primary-foreground shadow-colored hover:opacity-90 transition-opacity"
            onClick={handleRequestSpeak}
          >
            <Hand className="w-5 h-5 mr-2" />
            Request to Speak
          </Button>
        )}

        {/* Tabbed content */}
        <Tabs defaultValue="queue" className="mb-6">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50">
            <TabsTrigger value="queue" className="font-medium text-sm gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Mic className="w-3.5 h-3.5" /> Queue
            </TabsTrigger>
            <TabsTrigger value="questions" className="font-medium text-sm gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <MessageCircle className="w-3.5 h-3.5" /> Q&A
            </TabsTrigger>
            <TabsTrigger value="polls" className="font-medium text-sm gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <BarChart3 className="w-3.5 h-3.5" /> Polls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Speaker Queue ({queue.length})
            </h2>
            <QueueList queue={queue} currentDeviceId={deviceId} />
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <AudienceQuestions sessionId={sessionId!} userName={userName} />
          </TabsContent>

          <TabsContent value="polls" className="mt-4">
            <SessionPolls sessionId={sessionId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}