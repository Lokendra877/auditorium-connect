import { motion } from 'framer-motion';
import { SaaSLayout } from '@/components/saas/SaaSLayout';
import { Card, CardContent } from '@/components/ui/card';
import lectureHallImage from '@/assets/lecture-hall.jpg';
import {
  Fingerprint, ListOrdered, ShieldCheck, BarChart3, Mic2, Cloud,
  Headphones, Globe, FileText, Zap, Lock, Smartphone
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const features = [
  { icon: Fingerprint, title: 'Automatic User Identification', desc: 'Devices are remembered using unique IDs — no login required for attendees. Returning users are recognized instantly.' },
  { icon: ListOrdered, title: 'Queue-Based Mic Control', desc: 'First-come, first-served queue with admin override. Skip, revoke, or reorder speakers in real time.' },
  { icon: ShieldCheck, title: 'Contactless & Hygienic', desc: 'No shared physical microphone. Each person uses their own smartphone — safe and sanitary.' },
  { icon: BarChart3, title: 'Admin Control Dashboard', desc: 'Monitor live queue, grant/revoke mic access, view analytics, manage recordings — all from one screen.' },
  { icon: Mic2, title: 'Real-Time Audio Streaming', desc: 'WebRTC-powered low-latency audio from phone to auditorium speakers with equalizer controls.' },
  { icon: Cloud, title: 'Cloud-Based & Scalable', desc: 'Scales from a 50-seat classroom to a 5,000-seat auditorium. No server setup required.' },
  { icon: Headphones, title: 'Audio Recording & Export', desc: 'Automatically record each speaker. Download recordings or export full session data as CSV or PDF.' },
  { icon: Globe, title: 'Live Translation & Subtitles', desc: 'Real-time speech-to-text with translation support for multilingual audiences.' },
  { icon: FileText, title: 'Session Analytics & Reports', desc: 'Track total speakers, speaking times, participation rates, and generate detailed reports.' },
  { icon: Zap, title: 'Instant Setup', desc: 'Create a session, display the QR, and go. No hardware installation, no app downloads.' },
  { icon: Lock, title: 'Enterprise Security', desc: 'Row-level security, admin authentication, and encrypted data at rest and in transit.' },
  { icon: Smartphone, title: 'Mobile-First Design', desc: 'Optimized for every screen size. Works perfectly on any modern smartphone browser.' },
];

export default function SaaSFeatures() {
  return (
    <SaaSLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Features Built for Scale</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything your institution needs to run professional, organized auditorium sessions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.06, duration: 0.5 }}>
                <Card className="border-0 shadow-[var(--shadow-sm)] h-full hover:shadow-[var(--shadow-md)] transition-shadow">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SaaSLayout>
  );
}
