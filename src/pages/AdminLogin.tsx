import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName || email.split('@')[0] } },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success('Account created! Redirecting...');
      navigate('/admin-home');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success('Logged in!');
      navigate('/admin-home');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <Card className="gradient-card border-0 shadow-[var(--shadow-lg)]">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-heading text-2xl">
              {isSignUp ? 'Create Admin Account' : 'Admin Login'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Sign up to manage your auditorium sessions' : 'Sign in to manage your sessions'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
