import { Link } from 'react-router-dom';
import animeMicHero from '@/assets/anime-mic-hero.png';

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
    <footer className="border-t-2 border-border/50 bg-card/50 relative">
      {/* Subtle anime sparkle */}
      <div className="absolute top-6 right-12 w-2 h-2 bg-anime-yellow rounded-full animate-sparkle opacity-40" />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src={animeMicHero} alt="SmartMic" className="w-full h-full object-contain" />
              </div>
              <span className="font-heading text-2xl tracking-wide">SmartMic</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart, contactless microphone system for modern auditoriums. Turn any smartphone into a controlled mic. ✨
            </p>
            <p className="text-xs text-muted-foreground">
              Smart &bull; Contactless &bull; Scalable
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map(group => (
            <div key={group.title}>
              <h4 className="font-heading text-lg tracking-wide mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t-2 border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 SmartMic — QR-Based Auditorium Interaction System. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Founder: <span className="font-medium text-foreground">Lokendra Dubey</span> 🎙️
          </p>
        </div>
      </div>
    </footer>
  );
}
