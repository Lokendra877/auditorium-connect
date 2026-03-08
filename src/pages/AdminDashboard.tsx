import { useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '@/hooks/useSession';
import { useQueueActions } from '@/hooks/useQueueActions';
import { useWebRTC, type EQBand } from '@/hooks/useWebRTC';
import { useSessionAnalytics } from '@/hooks/useSessionAnalytics';
import { QRDisplay } from '@/components/QRDisplay';
import { QueueList } from '@/components/QueueList';
import { MicStatus } from '@/components/MicStatus';
import { SpeakerTimer } from '@/components/SpeakerTimer';
import { AudioStatus } from '@/components/AudioStatus';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { AudioEqualizer } from '@/components/AudioEqualizer';
import { AdminPollCreator } from '@/components/AdminPollCreator';
import { AdminQuestionsList } from '@/components/AdminQuestionsList';
import { SessionPolls } from '@/components/SessionPolls';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Power, PlayCircle, Users, Clock, Volume2, Download, FileText, FileSpreadsheet, MessageCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { RecordingsList } from '@/components/RecordingsList';
import { LiveSubtitles } from '@/components/LiveSubtitles';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranscriptListener } from '@/hooks/useTranslation';
import { exportAllCSV, exportSessionPDF } from '@/lib/exportData';

export default function AdminDashboard() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const adminCode = searchParams.get('code');
  const [volume, setVolume] = useState(100);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const { session, queue, loading } = useSession(sessionId);
  const { grantMic, revokeMic, skipSpeaker, removeFromQueue, grantNextSpeaker } = useQueueActions(sessionId);
  const { isReceiving, remoteAudioRef, remoteStreamRef, setEQ } = useWebRTC(sessionId, false);
  const analyticsData = useSessionAnalytics(sessionId, session?.created_at);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(sessionId);
  const [recordings, setRecordings] = useState<any[]>([]);
  const { subtitle, translatedSubtitle, isTranslating } = useTranscriptListener(sessionId, targetLanguage, ttsEnabled);

  const prevSpeakerRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('audio_recordings')
        .select('*')
        .eq('session_id', sessionId)
        .order('recorded_at', { ascending: false });
      if (data) setRecordings(data);
    };
    fetch();
    const channel = supabase
      .channel(`export-recordings-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audio_recordings', filter: `session_id=eq.${sessionId}` }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const handleExportCSV = () => {
    if (!session) return;
    exportAllCSV(analyticsData, recordings, session);
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    if (!session) return;
    exportSessionPDF(analyticsData, recordings, session);
    toast.success('PDF report exported');
  };

  const currentSpeaker = queue.find(e => e.status === 'speaking');
  const waitingCount = queue.filter(e => e.status === 'waiting').length;

  useEffect(() => {
    const currentId = currentSpeaker?.id || null;
    const prevId = prevSpeakerRef.current;

    if (currentId && currentId !== prevId) {
      setTimeout(() => {
        if (remoteStreamRef?.current) {
          startRecording(remoteStreamRef.current, currentSpeaker!.user_name);
        }
      }, 1000);
    } else if (!currentId && prevId && isRecording) {
      stopRecording();
    }

    prevSpeakerRef.current = currentId;
  }, [currentSpeaker?.id]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (remoteAudioRef?.current) {
      remoteAudioRef.current.volume = newVolume / 100;
    }
  };

  const handleTimeUp = useCallback(async () => {
    if (currentSpeaker) {
      await revokeMic(currentSpeaker.id);
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
      <div className="min-h-screen flex items-center justify-center retro-grid">
        <div className="relative">
          <div className="absolute inset-0 bg-anime-pink/20 rounded-full blur-2xl animate-glow-pulse" />
          <Loader2 className="w-10 h-10 animate-spin text-anime-pink relative z-10" />
        </div>
      </div>
    );
  }

  if (!session || session.admin_code !== adminCode) {
    return (
      <div className="min-h-screen flex items-center justify-center retro-grid">
        <Card className="max-w-md anime-card neon-border"><CardContent className="p-8 text-center">
          <h2 className="font-heading text-2xl tracking-wider mb-2 neon-text">Access Denied</h2>
          <p className="text-muted-foreground text-sm">Invalid admin code.</p>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 retro-grid opacity-30" />
      {/* Neon background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-anime-pink/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-anime-cyan/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-anime-purple/3 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl tracking-wider neon-text">{session.title}</h1>
            <p className="font-pixel text-[8px] text-anime-cyan tracking-widest uppercase mt-1">Admin Dashboard</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-2 border-anime-cyan/40 text-anime-cyan hover:bg-anime-cyan/10">
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-2 border-border">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-2" /> Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="destructive" size="sm" onClick={endSession} className="shadow-[0_0_12px_hsl(0_85%_55%/0.3)]">
              <Power className="w-4 h-4 mr-1" /> End Session
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left: QR + Stats */}
          <div className="space-y-4">
            <Card className="anime-card overflow-hidden neon-border">
              <CardContent className="p-4">
                <QRDisplay sessionId={session.id} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="anime-card">
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 text-anime-pink mx-auto mb-1" />
                  <p className="font-heading text-3xl neon-text">{queue.length}</p>
                  <p className="font-pixel text-[7px] text-muted-foreground tracking-wider uppercase">In Queue</p>
                </CardContent>
              </Card>
              <Card className="anime-card">
                <CardContent className="p-4 text-center">
                  <Clock className="w-5 h-5 text-anime-cyan mx-auto mb-1" />
                  <p className="font-heading text-3xl neon-text-cyan">{session.speaking_time_seconds}s</p>
                  <p className="font-pixel text-[7px] text-muted-foreground tracking-wider uppercase">Per Speaker</p>
                </CardContent>
              </Card>
            </div>

            <Card className="anime-card">
              <CardContent className="p-4">
                <p className="font-pixel text-[7px] text-muted-foreground tracking-wider uppercase mb-1">Session ID</p>
                <p className="font-mono text-[10px] break-all select-all text-anime-cyan/70">{session.id}</p>
              </CardContent>
            </Card>
          </div>

          {/* Center: Current Speaker + Audio */}
          <div className="space-y-4">
            <AudioStatus isSpeaker={false} isStreaming={false} isReceiving={isReceiving} micError={null} />
            <Card className="anime-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-anime-cyan" />
                  <Label htmlFor="volume" className="text-xs text-muted-foreground">Speaker Volume</Label>
                </div>
                <Slider id="volume" min={0} max={100} step={1} value={[volume]} onValueChange={handleVolumeChange} />
                <p className="text-xs text-muted-foreground text-right">{volume}%</p>
              </CardContent>
            </Card>
            <AudioEqualizer onEQChange={setEQ} />
            <LanguageSelector selectedLanguage={targetLanguage} onSelect={setTargetLanguage} />
            <LiveSubtitles
              originalText={subtitle}
              translatedText={translatedSubtitle}
              isTranslating={isTranslating}
              targetLanguage={targetLanguage}
              ttsEnabled={ttsEnabled}
              onToggleTts={() => setTtsEnabled(prev => !prev)}
            />
            <Card className="anime-card neon-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl tracking-wider">Current Speaker 🎤</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MicStatus isActive={!!currentSpeaker} speakerName={currentSpeaker?.user_name} />
                {currentSpeaker && session.speaker_started_at ? (
                  <>
                    <SpeakerTimer totalSeconds={session.speaking_time_seconds} startedAt={session.speaker_started_at} onTimeUp={handleTimeUp} />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-anime-yellow text-accent-foreground hover:bg-anime-yellow/90 font-heading tracking-wide" onClick={() => skipSpeaker(currentSpeaker.id).then(() => setTimeout(grantNextSpeaker, 500))}>
                        Skip ⏭️
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1 font-heading tracking-wide" onClick={() => revokeMic(currentSpeaker.id)}>
                        Revoke 🔇
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button className="w-full bg-success text-success-foreground hover:bg-success/90 font-heading tracking-wider shadow-[0_0_12px_hsl(150_80%_45%/0.3)]" onClick={grantNextSpeaker} disabled={waitingCount === 0}>
                    <PlayCircle className="w-4 h-4 mr-1" /> Grant Next ({waitingCount})
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Queue + Q&A + Polls */}
          <div className="space-y-4">
            <Tabs defaultValue="queue">
              <TabsList className="w-full grid grid-cols-3 bg-card border-2 border-border">
                <TabsTrigger value="queue" className="font-heading text-xs tracking-wide data-[state=active]:bg-anime-pink data-[state=active]:text-primary-foreground">Queue</TabsTrigger>
                <TabsTrigger value="questions" className="font-heading text-xs tracking-wide data-[state=active]:bg-anime-cyan data-[state=active]:text-secondary-foreground">
                  <MessageCircle className="w-3 h-3 mr-1" /> Q&A
                </TabsTrigger>
                <TabsTrigger value="polls" className="font-heading text-xs tracking-wide data-[state=active]:bg-anime-yellow data-[state=active]:text-accent-foreground">
                  <BarChart3 className="w-3 h-3 mr-1" /> Polls
                </TabsTrigger>
              </TabsList>

              <TabsContent value="queue" className="mt-3">
                <Card className="anime-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-lg tracking-wider">Speaker Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QueueList queue={queue} isAdmin onSkip={(id) => skipSpeaker(id).then(() => setTimeout(grantNextSpeaker, 500))} onRemove={removeFromQueue} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="mt-3">
                <Card className="anime-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-lg tracking-wider">Audience Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AdminQuestionsList sessionId={sessionId!} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="polls" className="mt-3 space-y-3">
                <AdminPollCreator sessionId={sessionId!} />
                <SessionPolls sessionId={sessionId!} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Analytics */}
          <div className="space-y-4">
            <AnalyticsPanel analytics={analyticsData} />
            <RecordingsList sessionId={session.id} />
          </div>
        </div>
      </div>
    </div>
  );
}