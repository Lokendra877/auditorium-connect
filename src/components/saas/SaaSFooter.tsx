import { Link } from 'react-router-dom';
import { Mic2 } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', path: '/features' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Use Cases', path: '/use-cases' },
      { label: 'Architecture', path: '/architecture' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact', path: '/contact' },
      { label: 'Request Demo', path: '/contact' },
    ],
  },
  {
    title: 'Admin',
    links: [
      { label: 'Admin Login', path: '/admin-login' },
      { label: 'Demo Dashboard', path: '/admin-demo' },
    ],
  },
];

export function SaaSFooter() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Mic2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold">SmartMic</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart, contactless microphone system for modern auditoriums. Turn any smartphone into a controlled mic.
            </p>
            <p className="text-xs text-muted-foreground">
              Smart &bull; Contactless &bull; Scalable
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map(group => (
            <div key={group.title}>
              <h4 className="font-heading font-semibold text-sm mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 QR-Based Smart Auditorium Interaction System. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Founder: <span className="font-medium text-foreground">Lokendra Dubey</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
