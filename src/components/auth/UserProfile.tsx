
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { MessageCircle, Settings, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { ProductRecommendations } from '@/components/ui/product-recommendations';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const UserProfile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      await fetchProfile();
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  if (fetchingProfile) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-office-accent/20"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-office-accent/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/5),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.accent/10),transparent_60%)]"></div>
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        {/* Header */}
        <header className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-10 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                داشبورد شخصی
              </h1>
            </div>
            <div className="flex gap-2">
              <Link to="/ai-coach" className="flex-1">
                <Button className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <MessageCircle className="h-4 w-4" />
                  مشاور هوشمند
                </Button>
              </Link>
              <Link to="/store">
                <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/5">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card className="bg-card/95 backdrop-blur-sm border-primary/10 shadow-xl">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/20">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                    {fullName ? getInitials(fullName) : 'MT'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{fullName || 'عضو خانواده مینا'}</CardTitle>
                <CardDescription className="text-muted-foreground">{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/ai-coach" className="block">
                  <Button className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    <MessageCircle className="h-4 w-4" />
                    شروع مشاوره
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  خروج از حساب
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <Card className="bg-card/95 backdrop-blur-sm border-primary/10 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>تنظیمات پروفایل</CardTitle>
                </div>
                <CardDescription>
                  اطلاعات حساب کاربری خود را مدیریت کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">نام کامل</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="نام کامل خود را وارد کنید"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="focus:ring-primary focus:border-primary text-right"
                      style={{ direction: 'rtl' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">آدرس تصویر پروفایل</Label>
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="آدرس تصویر پروفایل خود را وارد کنید"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    disabled={loading}
                  >
                    {loading ? 'در حال بروزرسانی...' : 'بروزرسانی پروفایل'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Welcome Message */}
            <Card className="mt-6 bg-gradient-to-r from-office-accent/20 to-accent/20 border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">به خانواده مینا خوش آمدید!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      شما اکنون عضو جامعه‌ای هستید که متعهد به رشد شخصی و حمایت از یکدیگر است. 
                      برای شروع سفر رشد خود، از مشاور هوشمند ما استفاده کنید.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Recommendations */}
            <div className="mt-6">
              <ProductRecommendations 
                limit={4} 
                title="محصولات پیشنهادی برای شما" 
                showHeader={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
