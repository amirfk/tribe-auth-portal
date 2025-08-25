import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageCircle, Shield, Heart, BookOpen, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-office-accent/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/5),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.accent/10),transparent_60%)]"></div>
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-primary/10 bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-primary hover:bg-primary/10">
                    ورود
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    عضویت
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-24 w-auto object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
              به خانواده مینا خوش آمدید
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              جایی که رشد شخصی، کوچینگ حرفه‌ای و حمایت روانی در کنار هم قرار دارند
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to={user ? "/dashboard" : "/register"}>
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-3 shadow-lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  شروع سفر رشد
                </Button>
              </Link>
              <Link to={user ? "/ai-coach" : "/register"}>
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 text-lg px-8 py-3">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  مشاور هوشمند
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary" className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-lg px-8 py-3 shadow-lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  مشاهده دوره‌ها
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 text-center bg-card/95 backdrop-blur-sm border-primary/10 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">کوچینگ هوشمند</h3>
              <p className="text-muted-foreground">
                مشاور هوشمند ما به شما کمک می‌کند تا بهترین نوع مشاوره را برای نیازهایتان پیدا کنید
              </p>
            </Card>

            <Card className="p-6 text-center bg-card/95 backdrop-blur-sm border-primary/10 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">حمایت روانی</h3>
              <p className="text-muted-foreground">
                محیط امن و حرفه‌ای برای دریافت حمایت روانی و مشاوره‌های تخصصی
              </p>
            </Card>

            <Card className="p-6 text-center bg-card/95 backdrop-blur-sm border-primary/10 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">محرمانگی کامل</h3>
              <p className="text-muted-foreground">
                تمام اطلاعات شما با بالاترین استانداردهای امنیتی محفوظ نگهداری می‌شود
              </p>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-primary/10 bg-card/95 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-8 w-auto object-contain"
              />
              <span className="text-sm text-muted-foreground">Mina's Tribe © 2024</span>
            </div>
            <p className="text-xs text-muted-foreground">
              پلتفرم حرفه‌ای رشد شخصی و کوچینگ
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;