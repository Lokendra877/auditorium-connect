import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Mic2 } from 'lucide-react';
import animeMicHero from '@/assets/anime-mic-hero.png';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Use Cases', path: '/use-cases' },
  { label: 'Architecture', path: '/architecture' },
  { label: 'Contact', path: '/contact' },
];

export function SaaSNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b-2 border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img src={animeMicHero} alt="SmartMic" className="w-full h-full object-contain" />
          </div>
          <span className="font-heading text-2xl tracking-wide">SmartMic</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? 'text-primary bg-primary/10 border-2 border-primary/30 shadow-anime'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/saas-login">
            <Button variant="ghost" size="sm" className="font-heading tracking-wide">Log In</Button>
          </Link>
          <Link to="/saas-login?mode=signup">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading tracking-wide shadow-anime">
              Start Free Trial ✨
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t-2 border-border/50 bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Link to="/saas-login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full border-2 font-heading tracking-wide">Log In</Button>
                </Link>
                <Link to="/saas-login?mode=signup" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground font-heading tracking-wide shadow-anime">Start Free Trial ✨</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
