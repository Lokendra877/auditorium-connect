import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SaaSLayout } from '@/components/saas/SaaSLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  QrCode, Users, ShieldCheck, Mic2, BarChart3, Cloud,
  ArrowRight, CheckCircle2, Timer, AlertTriangle, Handshake,
  MessageSquare, Smartphone, ListOrdered, Volume2, Fingerprint,
  Star
} from 'lucide-react';

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
  { icon: Mic2, title: 'Real-Time Audio Streaming', desc: 'WebRTC-powered low-latency audio.' },
  { icon: Cloud, title: 'Cloud-Based & Scalable', desc: 'Works for 50 or 5,000 attendees.' },
];

const testimonials = [
  {
    quote: "SmartMic transformed our Q&A sessions. No more mic passing delays, and our students actually engage now.",
    author: "Dr. Sarah Chen",
    role: "Dean of Academic Affairs",
    institution: "Stanford University"
  },
  {
    quote: "Perfect for our large auditorium events. The setup was literally 2 minutes, and our team is saving hours on session management.",
    author: "Michael Rodriguez",
    role: "Event Manager",
    institution: "Google Campus"
  },
  {
    quote: "Enterprise-ready and genuinely easy to use. Our conference attendance jumped 40% because people actually speak up now.",
    author: "Jennifer Patel",
    role: "VP of Operations",
    institution: "TechCorp Annual Summit"
  }
];

const institutions = [
  "Stanford University",
  "MIT",
  "Google Campus",
  "Microsoft",
  "Harvard Law School",
  "Yale School of Management"
];

export default function SaaSHome() {
  return (
    <SaaSLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="container mx-auto px-4 pt-20 pb-24 lg:pt-28 lg:pb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Mic2 className="w-4 h-4" />
              Enterprise-Grade Auditorium Solution
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Smart, Contactless{' '}
              <span className="text-gradient">Microphone System</span>{' '}
              for Auditoriums
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Turn smartphones into controlled microphones using QR-based access. 
              Eliminate mic passing, maintain hygiene, and bring order to every session.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12">
                  Start Free Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-base px-8 h-12">
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
               <Card key={i} className="border-0 bg-white/50 backdrop-blur-sm shadow-[var(--shadow-md)]">
                 <CardContent className="p-6 space-y-4">
                   <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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

           {/* Institution Logos / Trust Badges */}
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
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">The Problem with Traditional Mics</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Every large venue faces these challenges during audience interaction.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {problems.map((p, i) => (
              <motion.div key={p.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Card className="border border-destructive/20 bg-destructive/5 h-full">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
                      <p.icon className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="font-heading font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">How SmartMic Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A simple 6-step flow from QR scan to voice output.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card className="border-0 shadow-[var(--shadow-md)] h-full hover:shadow-[var(--shadow-lg)] transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <s.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Step {i + 1}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to run professional auditorium sessions.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Card className="border-0 shadow-[var(--shadow-sm)] h-full">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/features">
              <Button variant="outline" size="lg">
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
            <Card className="border-0 bg-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(0_0%_100%/0.1),transparent_60%)]" />
              <CardContent className="p-10 md:p-16 text-center relative">
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Ready to Modernize Your Auditorium?</h2>
                <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                  Join institutions that have already eliminated mic-passing delays and improved audience engagement.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/contact">
                    <Button size="lg" variant="secondary" className="text-base px-8 h-12">
                      Request a Demo
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 h-12">
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
