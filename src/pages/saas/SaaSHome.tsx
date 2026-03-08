import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SaaSLayout } from '@/components/saas/SaaSLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  QrCode, Users, ShieldCheck, Mic2, BarChart3, Cloud,
  ArrowRight, CheckCircle2, Timer, AlertTriangle, Handshake,
  MessageSquare, Smartphone, ListOrdered, Volume2, Fingerprint,
  Star, ThumbsUp, Vote
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
  { icon: Fingerprint, title: 'Auto User Identification', desc: 'Devices are remembered across sessions.' },
  { icon: ListOrdered, title: 'Queue-Based Mic Control', desc: 'Orderly, fair speaker management.' },
  { icon: ShieldCheck, title: 'Contactless & Hygienic', desc: 'No physical mic needed.' },
  { icon: BarChart3, title: 'Admin Dashboard', desc: 'Full control over speakers and sessions.' },
  { icon: ThumbsUp, title: 'Upvote Questions', desc: 'Audience can submit & upvote top questions.' },
  { icon: Mic2, title: 'Live Polls & Voting', desc: 'Create real-time polls for instant feedback.' },
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        {/* Anime sparkle decorations */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-anime-yellow rounded-full animate-sparkle" />
        <div className="absolute top-40 right-20 w-4 h-4 bg-anime-cyan rounded-full animate-sparkle" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-anime-pink rounded-full animate-sparkle" style={{ animationDelay: '1.4s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-anime-purple rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }} />

        <div className="container mx-auto px-4 pt-20 pb-24 lg:pt-28 lg:pb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Anime mic hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mx-auto w-32 h-32 md:w-40 md:h-40 mb-6"
            >
              <img src={animeMicHero} alt="SmartMic" className="w-full h-full object-contain animate-float drop-shadow-2xl" />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-bold mb-6 border-2 border-primary/30 shadow-anime">
              <Mic2 className="w-4 h-4" />
              Enterprise-Grade Auditorium Solution ⚡
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-wide leading-tight mb-6">
              Smart, Contactless{' '}
              <span className="text-gradient">Microphone System</span>{' '}
              for Auditoriums
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Turn smartphones into controlled microphones using QR-based access. 
              Eliminate mic passing, maintain hygiene, and bring order to every session. ✨
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 font-heading text-lg tracking-wide shadow-anime">
                  Start Free Demo 🚀
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 border-2 font-heading text-lg tracking-wide">
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
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> No hardware needed</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Works on any smartphone</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Setup in under 2 minutes</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Enterprise-ready security</div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-20 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="anime-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm italic text-foreground">&quot;{testimonial.quote}&quot;</p>
                  <div className="pt-2 border-t border-border">
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary font-medium mt-1">{testimonial.institution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Institution Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-16"
          >
            <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-6">Trusted by leading institutions</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {institutions.map((inst, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">{inst}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-card/50 relative">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-4xl md:text-5xl tracking-wide mb-4">The Problem with Traditional Mics 😤</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Every large venue faces these challenges during audience interaction.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {problems.map((p, i) => (
              <motion.div key={p.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Card className="anime-card border-2 border-destructive/20 bg-destructive/5 h-full">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
                      <p.icon className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="font-heading text-lg tracking-wide">{p.title}</h3>
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
        {/* Anime crowd decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-10 overflow-hidden">
          <img src={animeCrowd} alt="" className="w-full h-full object-cover object-top" />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-4xl md:text-5xl tracking-wide mb-4">How SmartMic Works ✨</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A simple 6-step flow from QR scan to voice output.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card className="anime-card h-full">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/20">
                        <s.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-pixel text-[8px] text-primary/60 uppercase tracking-widest">Step {i + 1}</span>
                    </div>
                    <h3 className="font-heading text-xl tracking-wide">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-4xl md:text-5xl tracking-wide mb-4">Powerful Features 🔥</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to run professional auditorium sessions.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card className="anime-card h-full">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl tracking-wide">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-2 font-heading text-lg tracking-wide">
                See All Features <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp}>
            <Card className="border-0 overflow-hidden relative gradient-primary">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(0_0%_100%/0.15),transparent_60%)]" />
              {/* Sparkle decorations */}
              <div className="absolute top-8 left-12 w-3 h-3 bg-anime-yellow rounded-full animate-sparkle" />
              <div className="absolute bottom-12 right-16 w-4 h-4 bg-anime-cyan rounded-full animate-sparkle" style={{ animationDelay: '0.8s' }} />
              <CardContent className="p-10 md:p-16 text-center relative">
                <h2 className="font-heading text-4xl md:text-5xl tracking-wide text-primary-foreground mb-4">Ready to Modernize Your Auditorium? 🚀</h2>
                <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                  Join institutions that have already eliminated mic-passing delays and improved audience engagement.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/contact">
                    <Button size="lg" variant="secondary" className="text-base px-8 h-12 font-heading text-lg tracking-wide shadow-anime">
                      Request a Demo
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 h-12 font-heading text-lg tracking-wide">
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
