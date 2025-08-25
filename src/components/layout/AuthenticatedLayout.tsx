import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LogOut, MessageCircle, LayoutDashboard, User, Shield, BookOpen } from 'lucide-react';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-office-accent/20">
      {/* Navigation Header */}
      <header className="border-b border-primary/10 bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-10 w-auto object-contain"
              />
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mina's Tribe
              </h2>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  className={`gap-2 ${isActive('/dashboard') 
                    ? 'bg-gradient-to-r from-primary to-accent text-white' 
                    : 'text-primary hover:bg-primary/10'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  داشبورد
                </Button>
              </Link>
              
              <Link to="/ai-coach">
                <Button 
                  variant={isActive('/ai-coach') ? 'default' : 'ghost'}
                  className={`gap-2 ${isActive('/ai-coach') 
                    ? 'bg-gradient-to-r from-primary to-accent text-white' 
                    : 'text-primary hover:bg-primary/10'
                  }`}
                >
                  <MessageCircle size={16} />
                  مشاور هوشمند
                </Button>
              </Link>

              <Link to="/courses">
                <Button 
                  variant={isActive('/courses') ? 'default' : 'ghost'}
                  className={`gap-2 ${isActive('/courses') 
                    ? 'bg-gradient-to-r from-primary to-accent text-white' 
                    : 'text-primary hover:bg-primary/10'
                  }`}
                >
                  <BookOpen size={16} />
                  دوره‌ها
                </Button>
              </Link>

              {isAdmin && (
                <Link to="/admin">
                  <Button 
                    variant={isActive('/admin') ? 'default' : 'ghost'}
                    className={`gap-2 ${isActive('/admin') 
                      ? 'bg-gradient-to-r from-primary to-accent text-white' 
                      : 'text-primary hover:bg-primary/10'
                    }`}
                  >
                    <Shield size={16} />
                    پنل مدیریت
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-primary" />
                  <span className="text-muted-foreground">
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={16} />
                  خروج
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};