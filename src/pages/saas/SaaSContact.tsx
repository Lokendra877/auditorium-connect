import { useState } from 'react';
import { motion } from 'framer-motion';
import { SaaSLayout } from '@/components/saas/SaaSLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Phone, Building2, User, Send } from 'lucide-react';

export default function SaaSContact() {
  const [form, setForm] = useState({
    institution: '',
    contact: '',
    email: '',
    phone: '',
    auditoriums: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institution || !form.email || !form.contact) {
      toast.error('Please fill in the required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Demo request submitted! We will contact you within 24 hours.');
      setForm({ institution: '', contact: '', email: '', phone: '', auditoriums: '' });
      setSubmitting(false);
    }, 1200);
  };

  return (
    <SaaSLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Request a Demo</h1>
              <p className="text-muted-foreground text-lg">
                See how SmartMic can transform your auditorium experience. Fill in the form and our team will reach out.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-[var(--shadow-lg)]">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="institution" className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" /> Institution Name *
                      </Label>
                      <Input
                        id="institution"
                        placeholder="e.g., MIT, Google, City Council Hall"
                        value={form.institution}
                        onChange={e => setForm(p => ({ ...p, institution: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="contact" className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" /> Contact Person *
                        </Label>
                        <Input
                          id="contact"
                          placeholder="Your full name"
                          value={form.contact}
                          onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" /> Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@institution.edu"
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" /> Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auditoriums" className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-muted-foreground" /> Number of Auditoriums
                        </Label>
                        <Input
                          id="auditoriums"
                          type="number"
                          min={1}
                          placeholder="e.g., 3"
                          value={form.auditoriums}
                          onChange={e => setForm(p => ({ ...p, auditoriums: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : (
                        <>
                          <Send className="w-4 h-4 mr-2" /> Request Demo
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </SaaSLayout>
  );
}
