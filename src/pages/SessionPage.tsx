import { useState, useMemo } from 'react';
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
import { Hand, Loader2, Mic, MessageCircle, BarChart3, StopCircle } from 'lucide-react';
import animeMicHero from '@/assets/anime-mic-hero.png';

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, queue, loading } = useSession(sessionId);
  const { requestToSpeak, revokeMic, deviceId } = useQueueActions(sessionId);
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const myEntry = useMemo(() => queue.find(e => e.device_id === deviceId), [queue, deviceId]);
  const amISpeaking = myEntry?.status === 'speaking' || false;
  const { isStreaming, isReceiving, micError } = useWebRTC(sessionId, amISpeaking);

  useSpeechTranscription(sessionId, amISpeaking);
  const { subtitle, translatedSubtitle, isTranslating } = useTranscriptListener(sessionId, targetLanguage, ttsEnabled);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background retro-grid">
        <div className="relative">
          <div className="absolute inset-0 bg-anime-pink/20 rounded-full blur-2xl animate-glow-pulse" />
          <Loader2 className="w-10 h-10 animate-spin text-anime-pink relative z-10" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background retro-grid">
        <Card className="max-w-md anime-card neon-border">
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-2xl tracking-wider mb-2 neon-text">Session Not Found</h2>
            <p className="text-muted-foreground text-sm">This session may have ended or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background retro-grid">
        <Card className="max-w-md anime-card neon-border-cyan">
          <CardContent className="p-8 text-center">
            <h2 className="font-heading text-2xl tracking-wider mb-2 neon-text-cyan">Session Ended</h2>
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
    if (!userName.trim()) return;
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
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 retro-grid" />
        <div className="absolute inset-0 gradient-hero" />
        {/* Decorative anime elements */}
        <div className="absolute top-10 right-10 w-32 h-32 opacity-20 animate-float">
          <img src={animeMicHero} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute bottom-20 left-10 w-4 h-4 bg-anime-yellow rounded-full animate-sparkle" />
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-anime-cyan rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-anime-pink rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="relative z-10">
          <Card className="w-full max-w-sm anime-card neon-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 mb-3 relative">
                <div className="absolute inset-0 bg-anime-pink/20 rounded-full blur-xl animate-glow-pulse" />
                <img src={animeMicHero} alt="SmartMic" className="w-full h-full object-contain animate-float relative z-10" />
              </div>
              <CardTitle className="font-heading text-3xl tracking-wider neon-text">{session.title}</CardTitle>
              <p className="font-pixel text-[8px] text-anime-cyan tracking-wider uppercase mt-2">Enter your name to join</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
                className="bg-muted/30 border-2 border-border focus:border-anime-pink text-center text-lg"
              />
              <Button className="w-full bg-anime-pink text-primary-foreground hover:bg-anime-pink/90 font-heading text-xl tracking-wider shadow-glow animate-glow-pulse h-12" onClick={handleJoin} disabled={!userName.trim()}>
                Join Session 🎤
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 retro-grid opacity-50" />
      {/* Neon background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-anime-pink/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-anime-cyan/5 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl tracking-wider neon-text truncate">{session.title}</h1>
            <p className="font-pixel text-[7px] text-anime-cyan tracking-wider uppercase mt-1">Welcome, {userName}</p>
          </div>
          <UserNotificationBell sessionId={sessionId!} />
        </motion.div>

        {/* Audio Status */}
        <AudioStatus
          isSpeaker={amISpeaking}
          isStreaming={isStreaming}
          isReceiving={isReceiving}
          micError={micError}
        />

        {/* Language Selector */}
        <div className="my-3">
          <LanguageSelector selectedLanguage={targetLanguage} onSelect={setTargetLanguage} />
        </div>

        {/* Live Subtitles */}
        {(subtitle || translatedSubtitle) && (
          <div className="mb-3">
            <LiveSubtitles
              originalText={subtitle}
              translatedText={translatedSubtitle}
              isTranslating={isTranslating}
              targetLanguage={targetLanguage}
              ttsEnabled={ttsEnabled}
              onToggleTts={() => setTtsEnabled(prev => !prev)}
            />
          </div>
        )}

        {/* Current Speaker */}
        <Card className="mb-4 anime-card neon-border">
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
            <Card className={`border-2 ${
              myEntry.status === 'speaking' ? 'bg-success/10 neon-border-cyan' : 'bg-anime-pink/5 neon-border'
            }`} style={{ boxShadow: myEntry.status === 'speaking' ? 'var(--shadow-glow-cyan)' : 'var(--shadow-glow)' }}>
              <CardContent className="p-4 text-center space-y-3">
                {myEntry.status === 'speaking' ? (
                  <>
                    <p className="font-heading text-2xl text-anime-cyan neon-text-cyan">🎙️ You are speaking!</p>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleStopSpeaking}
                      className="w-full font-heading text-lg tracking-wider"
                    >
                      <StopCircle className="w-5 h-5 mr-2" /> Stop Speaking
                    </Button>
                  </>
                ) : (
                  <p className="font-heading text-xl text-anime-pink neon-text">
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
            className="w-full mb-6 h-14 text-lg font-heading tracking-wider bg-anime-pink text-primary-foreground hover:bg-anime-pink/90 shadow-glow animate-glow-pulse"
            onClick={handleRequestSpeak}
          >
            <Hand className="w-5 h-5 mr-2" />
            Request to Speak ✋
          </Button>
        )}

        {/* Tabbed content */}
        <Tabs defaultValue="queue" className="mb-6">
          <TabsList className="w-full grid grid-cols-3 bg-card border-2 border-border">
            <TabsTrigger value="queue" className="font-heading text-sm gap-1.5 tracking-wide data-[state=active]:bg-anime-pink data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
              <Mic className="w-3.5 h-3.5" /> Queue
            </TabsTrigger>
            <TabsTrigger value="questions" className="font-heading text-sm gap-1.5 tracking-wide data-[state=active]:bg-anime-cyan data-[state=active]:text-secondary-foreground data-[state=active]:shadow-glow-cyan">
              <MessageCircle className="w-3.5 h-3.5" /> Q&A
            </TabsTrigger>
            <TabsTrigger value="polls" className="font-heading text-sm gap-1.5 tracking-wide data-[state=active]:bg-anime-yellow data-[state=active]:text-accent-foreground data-[state=active]:shadow-glow-yellow">
              <BarChart3 className="w-3.5 h-3.5" /> Polls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-4">
            <h2 className="font-pixel text-[8px] text-anime-pink tracking-widest uppercase mb-3">
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