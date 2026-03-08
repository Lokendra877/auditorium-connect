import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Users, QrCode, Timer, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import animeMicHero from '@/assets/anime-mic-hero.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [speakingTime, setSpeakingTime] = useState(30);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const createSession = async () => {
    if (!title.trim()) {
      toast.error('Please enter a session title');
      return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from('sessions')
      .insert({ title: title.trim(), speaking_time_seconds: speakingTime })
      .select()
      .single();

    if (error || !data) {
      toast.error('Failed to create session');
      setCreating(false);
      return;
    }

    toast.success('Session created!');
    navigate(`/admin/${data.id}?code=${data.admin_code}`);
  };

  const joinSession = () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a session ID');
      return;
    }
    navigate(`/session/${joinCode.trim()}`);
  };

  const features = [
    { icon: QrCode, title: 'QR Code Access', desc: 'Scan to join instantly', color: 'anime-cyan' },
    { icon: Users, title: 'Smart Queue', desc: 'Fair, automated ordering', color: 'anime-pink' },
    { icon: Timer, title: 'Timed Speaking', desc: 'Configurable time limits', color: 'anime-yellow' },
    { icon: Shield, title: 'Admin Controls', desc: 'Full session management', color: 'anime-purple' },
    { icon: Zap, title: 'Real-time Updates', desc: 'Live queue status for all', color: 'anime-cyan' },
    { icon: Mic, title: 'Mic Management', desc: 'One speaker at a time', color: 'anime-pink' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 retro-grid" />
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-anime-pink/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-anime-cyan/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Top nav */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={animeMicHero} alt="SmartMic" className="w-full h-full object-contain" />
            </div>
            <span className="font-heading text-xl tracking-wider neon-text">SmartMic</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin-login')} className="border-2 border-anime-cyan/40 text-anime-cyan hover:bg-anime-cyan/10 font-heading tracking-wide">
            <Shield className="w-4 h-4 mr-1" /> Admin Login
          </Button>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto pt-8 pb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto w-24 h-24 mb-6 relative"
          >
            <div className="absolute inset-0 bg-anime-pink/20 rounded-full blur-2xl animate-glow-pulse" />
            <img src={animeMicHero} alt="" className="w-full h-full object-contain relative z-10 animate-float" />
          </motion.div>
          <div className="inline-flex items-center gap-2 rounded-full bg-anime-pink/10 px-5 py-2 mb-6 neon-border">
            <Mic className="w-4 h-4 text-anime-pink" />
            <span className="font-pixel text-[8px] text-anime-pink tracking-wider uppercase">Smart Auditorium</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading tracking-wider mb-4">
            <span className="text-gradient">Digital Mic</span>
            <span className="text-foreground"> for</span>
            <br />
            <span className="text-anime-cyan neon-text-cyan">Modern Auditoriums</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Eliminate physical microphone passing. Let your audience request speaking
            access digitally with automatic queue management.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="anime-card h-full neon-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl tracking-wider flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  Create Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Session title (e.g., CS101 Lecture)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/30 border-2 border-border focus:border-anime-pink"
                />
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground whitespace-nowrap">Speaking time:</label>
                  <Input
                    type="number"
                    min={10}
                    max={300}
                    value={speakingTime}
                    onChange={(e) => setSpeakingTime(Number(e.target.value))}
                    className="w-20 bg-muted/30 border-2 border-border focus:border-anime-pink"
                  />
                  <span className="text-sm text-muted-foreground">sec</span>
                </div>
                <Button className="w-full bg-anime-pink text-primary-foreground hover:bg-anime-pink/90 font-heading text-lg tracking-wider shadow-glow" onClick={createSession} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Session ⚡'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="anime-card h-full neon-border-cyan">
              <CardHeader>
                <CardTitle className="font-heading text-xl tracking-wider flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center shadow-glow-cyan">
                    <Users className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  Join Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Paste session ID"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="bg-muted/30 border-2 border-border focus:border-anime-cyan"
                />
                <p className="text-xs text-muted-foreground">
                  Or scan the QR code displayed by the session admin.
                </p>
                <Button variant="outline" className="w-full border-2 border-anime-cyan/50 text-anime-cyan hover:bg-anime-cyan/10 font-heading text-lg tracking-wider" onClick={joinSession}>
                  Join Session 🎤
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto pb-16">
          <h2 className="font-heading text-3xl tracking-wider text-center mb-8">
            <span className="font-pixel text-[10px] text-anime-yellow tracking-widest uppercase block mb-3 neon-text-yellow">★ HOW IT WORKS ★</span>
            Powerful Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="anime-card p-5 flex flex-col items-center text-center group"
              >
                <div className={`w-12 h-12 rounded-xl bg-${f.color}/10 flex items-center justify-center mb-3 border border-${f.color}/30 group-hover:shadow-[0_0_16px_hsl(var(--${f.color})/0.3)] transition-shadow`}>
                  <f.icon className={`w-6 h-6 text-${f.color}`} />
                </div>
                <h3 className="font-heading text-base tracking-wider mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}