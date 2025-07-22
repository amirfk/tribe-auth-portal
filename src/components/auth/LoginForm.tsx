
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, LogIn } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/ai-coach');
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Navigation will be handled by the redirect
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-office-accent/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/5),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.accent/10),transparent_60%)]"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-primary/10 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              به خانواده مینا خوش آمدید
            </CardTitle>
            <CardDescription>
              برای ادامه وارد حساب کاربری خود شوید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  ایمیل
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ایمیل خود را وارد کنید"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus:ring-primary focus:border-primary text-right"
                  style={{ direction: 'rtl' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  رمز عبور
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:ring-primary focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                disabled={loading}
              >
                <LogIn className="h-4 w-4" />
                {loading ? 'در حال ورود...' : 'ورود'}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-3">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-accent underline block"
              >
                رمز عبور خود را فراموش کرده‌اید؟
              </Link>
              <p className="text-sm text-muted-foreground">
                حساب کاربری ندارید؟{' '}
                <Link
                  to="/register"
                  className="text-primary hover:text-accent font-medium"
                >
                  ثبت نام کنید
                </Link>
              </p>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    یا ادامه دهید با
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-primary/30 hover:bg-primary/10"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleLoading ? 'در حال ورود...' : 'ورود با گوگل'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
