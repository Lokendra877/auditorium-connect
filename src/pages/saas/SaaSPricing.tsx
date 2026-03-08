import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SaaSLayout } from '@/components/saas/SaaSLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const plans = [
  {
    name: 'Basic',
    price: '$29',
    period: '/month',
    desc: 'Perfect for single-room setups.',
    popular: false,
    features: [
      '1 Auditorium',
      'Up to 50 speakers per session',
      'Basic admin controls',
      'QR code generation',
      'Email support',
    ],
  },
  {
    name: 'Standard',
    price: '$79',
    period: '/month',
    desc: 'For institutions with multiple halls.',
    popular: true,
    features: [
      'Up to 5 Auditoriums',
      'Unlimited speakers per session',
      'Full queue management',
      'Speaker analytics & reports',
      'Audio recordings',
      'CSV & PDF export',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale deployments.',
    popular: false,
    features: [
      'Unlimited Auditoriums',
      'Custom integrations & API',
      'Advanced analytics dashboard',
      'Live translation & subtitles',
      'Dedicated account manager',
      'SSO & role management',
      '99.9% SLA',
    ],
  },
];

export default function SaaSPricing() {
  return (
    <SaaSLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Choose the plan that fits your institution. Upgrade anytime as you scale.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Card className={`relative overflow-hidden h-full ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-[var(--shadow-lg)]' 
                    : 'border shadow-[var(--shadow-sm)]'
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to={plan.name === 'Enterprise' ? '/contact' : '/saas-login?mode=signup'}>
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                      </Button>
                    </Link>
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
