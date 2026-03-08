import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SaaSLayout } from '@/components/saas/SaaSLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  QrCode, Users, ShieldCheck, Mic2, BarChart3, Cloud,
  ArrowRight, CheckCircle2, Timer, AlertTriangle, Handshake,
  MessageSquare, Smartphone, ListOrdered, Volume2, Fingerprint,
  Star, ThumbsUp, Vote, Zap
} from 'lucide-react';
import animeMicHero from '@/assets/anime-mic-hero.png';
import animeCrowd from '@/assets/anime-crowd.png';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const problems = [
  { icon: Timer, title: 'Mic Passing Delays', desc: 'Physical mics waste minutes being passed around large audiences.' },
  { icon: AlertTriangle, title: 'No Speaker Order', desc: 'Without a queue, Q&A sessions become chaotic and unfair.' },
  { icon: ShieldCheck, title: 'Hygiene Concerns', desc: 'Shared microphones pose health risks in large gatherings.' },
  { icon: MessageSquare, title: 'Poor Interaction', desc: 'Audiences disengage when speaking is difficult or disorganized.' },
];

const steps = [
  { icon: QrCode, title: 'Display QR Code', desc: 'Auditorium screen shows a session-specific QR code.' },
  { icon: Smartphone, title: 'Scan on Phone', desc: 'Attendees scan the code with their smartphone camera.' },
  { icon: Fingerprint, title: 'Auto Identification', desc: 'System recognizes the device automatically.' },
  { icon: Handshake, title: 'Request to Speak', desc: 'User taps a button to join the speaking queue.' },
  { icon: ListOrdered, title: 'Queue Manages Order', desc: 'Fair first-come-first-served queue system.' },
  { icon: Volume2, title: 'Voice on Speakers', desc: 'Audio streams directly to the auditorium speakers.' },
];

const features = [
  { icon: Fingerprint, title: 'Auto User ID', desc: 'Devices are remembered across sessions.', color: 'anime-pink' },
  { icon: ListOrdered, title: 'Queue-Based Mic', desc: 'Orderly, fair speaker management.', color: 'anime-cyan' },
  { icon: ShieldCheck, title: 'Contactless', desc: 'No physical mic needed.', color: 'anime-yellow' },
  { icon: BarChart3, title: 'Admin Dashboard', desc: 'Full control over sessions.', color: 'anime-purple' },
  { icon: ThumbsUp, title: 'Upvote Questions', desc: 'Submit & upvote top questions.', color: 'anime-pink' },
  { icon: Mic2, title: 'Live Polls', desc: 'Real-time polls for instant feedback.', color: 'anime-cyan' },
];

const testimonials = [
  {
    quote: "SmartMic transformed our Q&A sessions. No more mic passing delays, and our students actually engage now.",
    author: "Dr. Sarah Chen",
    role: "Dean of Academic Affairs",
    institution: "Stanford University"
  },
  {
    quote: "Perfect for our large auditorium events. The setup was literally 2 minutes, and our team is saving hours.",
    author: "Michael Rodriguez",
    role: "Event Manager",
    institution: "Google Campus"
  },
  {
    quote: "The polls and Q&A features are game changers. Conference attendance jumped 40% because people actually speak up now.",
    author: "Jennifer Patel",
    role: "VP of Operations",
    institution: "TechCorp Annual Summit"
  }
];

const institutions = [
  "Stanford University", "MIT", "Google Campus", "Microsoft", "Harvard Law School", "Yale School of Management"
];

export default function SaaSHome() {
  return (
    <SaaSLayout>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Retro grid + scanlines */}
        <div className="absolute inset-0 retro-grid" />
        <div className="absolute inset-0 scanlines" />
        <div className="absolute inset-0 gradient-hero" />
        
        {/* Floating neon orbs */}
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-anime-pink/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-anime-cyan/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-anime-purple/5 rounded-full blur-[150px]" />

        {/* Anime sparkle decorations */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-anime-yellow rounded-full animate-sparkle" />
        <div className="absolute top-40 right-20 w-4 h-4 bg-anime-cyan rounded-full animate-sparkle" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-anime-pink rounded-full animate-sparkle" style={{ animationDelay: '1.4s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-anime-purple rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-1/4 right-[15%] w-2 h-2 bg-anime-yellow rounded-full animate-sparkle" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Anime mic hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mx-auto w-36 h-36 md:w-48 md:h-48 mb-8 relative"
            >
              <div className="absolute inset-0 bg-anime-pink/20 rounded-full blur-3xl animate-glow-pulse" />
              <img src={animeMicHero} alt="SmartMic" className="w-full h-full object-contain animate-float drop-shadow-2xl relative z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-anime-pink/10 text-anime-pink text-sm font-bold mb-8 neon-border"
            >
              <Zap className="w-4 h-4" />
              <span className="font-pixel text-[9px] tracking-wider uppercase">Enterprise Auditorium Solution</span>
              <Zap className="w-4 h-4" />
            </motion.div>

            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-wider leading-none mb-8">
              <span className="block text-foreground neon-text">Smart, Contactless</span>
              <span className="block text-gradient mt-2">Microphone System</span>
              <span className="block text-anime-cyan neon-text-cyan mt-2">for Auditoriums</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Turn smartphones into controlled microphones using QR-based access. 
              Eliminate mic passing, maintain hygiene, and bring order to every session.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app">
                <Button size="lg" className="bg-anime-pink text-primary-foreground hover:bg-anime-pink/90 text-base px-10 h-14 font-heading text-xl tracking-wider shadow-glow animate-glow-pulse relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Demo
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-base px-10 h-14 border-2 border-anime-cyan/50 text-anime-cyan hover:bg-anime-cyan/10 font-heading text-xl tracking-wider">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            {[
              'No hardware needed',
              'Works on any smartphone',
              'Setup in under 2 minutes',
              'Enterprise-ready security'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative dot-matrix">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="font-pixel text-[10px] text-anime-yellow tracking-widest uppercase neon-text-yellow">★ TESTIMONIALS ★</span>
            <h2 className="font-heading text-4xl md:text-5xl tracking-wider mt-4 mb-4 text-foreground">
              Loved by <span className="text-gradient">Educators</span> Worldwide
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Card className="anime-card h-full group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-anime-yellow text-anime-yellow" />
                      ))}
                    </div>
                    <p className="text-sm italic text-foreground/80">&quot;{testimonial.quote}&quot;</p>
                    <div className="pt-3 border-t border-border/50">
                      <p className="font-heading text-base tracking-wide text-foreground">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-anime-cyan font-medium mt-1">{testimonial.institution}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Institution Trust */}
          <motion.div {...fadeUp} className="mt-16">
            <p className="text-center font-pixel text-[8px] text-muted-foreground uppercase tracking-widest mb-6">Trusted by leading institutions</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {institutions.map((inst, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-anime-cyan transition-colors">
                  <div className="w-2 h-2 rounded-full bg-anime-pink" />
                  <span className="font-medium">{inst}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-anime-red/3" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="font-pixel text-[10px] text-anime-red tracking-widest uppercase">⚠ THE PROBLEM ⚠</span>
            <h2 className="font-heading text-4xl md:text-5xl tracking-wider mt-4 mb-4">
              Traditional Mics Are <span className="text-destructive neon-text">Broken</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Every large venue faces these challenges during audience interaction.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {problems.map((p, i) => (
              <motion.div key={p.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Card className="bg-card border-2 border-destructive/30 hover:border-destructive/60 transition-colors h-full group" style={{ boxShadow: '4px 4px 0px hsl(0 85% 55% / 0.2)' }}>
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-xl bg-destructive/15 flex items-center justify-center mx-auto border border-destructive/20 group-hover:shadow-[0_0_16px_hsl(0_85%_55%/0.3)] transition-shadow">
                      <p.icon className="w-7 h-7 text-destructive" />
                    </div>
                    <h3 className="font-heading text-xl tracking-wider">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="absolute inset-0 retro-grid opacity-50" />
        {/* Anime crowd decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-8 overflow-hidden">
          <img src={animeCrowd} alt="" className="w-full h-full object-cover object-top" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="font-pixel text-[10px] text-anime-cyan tracking-widest uppercase neon-text-cyan">✦ HOW IT WORKS ✦</span>
            <h2 className="font-heading text-4xl md:text-5xl tracking-wider mt-4 mb-4">
              <span className="text-gradient-cyan">6 Simple Steps</span> to Digital Mic
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A simple flow from QR scan to voice output.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card className="anime-card h-full relative overflow-hidden group">
                  <CardContent className="p-6 space-y-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-anime-cyan/10 flex items-center justify-center shrink-0 neon-border-cyan group-hover:shadow-glow-cyan transition-shadow">
                        <s.icon className="w-6 h-6 text-anime-cyan" />
                      </div>
                      <span className="font-pixel text-[8px] text-anime-pink/60 uppercase tracking-widest">Step {i + 1}</span>
                    </div>
                    <h3 className="font-heading text-xl tracking-wider">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                  {/* Step number watermark */}
                  <div className="absolute -bottom-4 -right-2 font-heading text-[80px] text-foreground/3 leading-none select-none">
                    {i + 1}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative dot-matrix">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="font-pixel text-[10px] text-anime-yellow tracking-widest uppercase neon-text-yellow">🔥 FEATURES 🔥</span>
            <h2 className="font-heading text-4xl md:text-5xl tracking-wider mt-4 mb-4">
              Powerful <span className="text-gradient">Features</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to run professional auditorium sessions.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card className="anime-card h-full group">
                  <CardContent className="p-6 space-y-3">
                    <div className={`w-12 h-12 rounded-xl bg-${f.color}/10 flex items-center justify-center border-2 border-${f.color}/30 group-hover:shadow-[0_0_16px_hsl(var(--${f.color})/0.3)] transition-shadow`}>
                      <f.icon className={`w-6 h-6 text-${f.color}`} />
                    </div>
                    <h3 className="font-heading text-xl tracking-wider">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-2 border-anime-pink/50 text-anime-pink hover:bg-anime-pink/10 font-heading text-xl tracking-wider">
                See All Features <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp}>
            <Card className="border-0 overflow-hidden relative">
              <div className="absolute inset-0 gradient-primary" />
              <div className="absolute inset-0 retro-grid opacity-30" />
              <div className="absolute inset-0 scanlines" />
              {/* Sparkle decorations */}
              <div className="absolute top-8 left-12 w-3 h-3 bg-anime-yellow rounded-full animate-sparkle" />
              <div className="absolute bottom-12 right-16 w-4 h-4 bg-anime-cyan rounded-full animate-sparkle" style={{ animationDelay: '0.8s' }} />
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-foreground rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }} />
              <CardContent className="p-12 md:p-20 text-center relative z-10">
                <h2 className="font-heading text-4xl md:text-6xl tracking-wider text-primary-foreground mb-6 neon-text">
                  Ready to Modernize Your Auditorium?
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-10">
                  Join institutions that have already eliminated mic-passing delays and improved audience engagement.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/contact">
                    <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 text-base px-10 h-14 font-heading text-xl tracking-wider shadow-anime">
                      Request a Demo
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 text-base px-10 h-14 font-heading text-xl tracking-wider">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </SaaSLayout>
  );
}