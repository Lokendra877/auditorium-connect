import { Link } from 'react-router-dom';
import animeMicHero from '@/assets/anime-mic-hero.png';

export function SaaSFooter() {
  return (
    <footer className="border-t-2 border-anime-pink/20 bg-card/50 relative overflow-hidden">
      <div className="absolute inset-0 retro-grid opacity-30" />
      <div className="absolute top-6 right-12 w-2 h-2 bg-anime-yellow rounded-full animate-sparkle opacity-40" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src={animeMicHero} alt="SmartMic" className="w-full h-full object-contain" />
              </div>
              <span className="font-heading text-xl tracking-wider neon-text">SmartMic</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart, contactless microphone system for modern auditoriums.
            </p>
            <p className="font-pixel text-[7px] text-anime-pink/50 tracking-wider">★ BUILT FOR THE FUTURE ★</p>
          </div>

          <div>
            <h4 className="font-heading text-base tracking-wider text-foreground mb-3">Product</h4>
            <div className="space-y-2 text-sm">
              <Link to="/features" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Features</Link>
              <Link to="/pricing" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Pricing</Link>
              <Link to="/use-cases" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Use Cases</Link>
              <Link to="/architecture" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Architecture</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-base tracking-wider text-foreground mb-3">Company</h4>
            <div className="space-y-2 text-sm">
              <Link to="/contact" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Contact</Link>
              <Link to="/saas-login" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Login</Link>
              <Link to="/app" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Launch App</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-base tracking-wider text-foreground mb-3">Admin</h4>
            <div className="space-y-2 text-sm">
              <Link to="/admin-login" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Admin Login</Link>
              <Link to="/admin-demo" className="block text-muted-foreground hover:text-anime-cyan transition-colors">Demo Dashboard</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SmartMic — All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Founder: <span className="font-medium text-anime-cyan">Lokendra Dubey</span> 🎙️
          </p>
          <p className="font-pixel text-[7px] text-anime-pink/40 tracking-wider">RETRO ★ FUTURE ★ AUDIO</p>
        </div>
      </div>
    </footer>
  );
}