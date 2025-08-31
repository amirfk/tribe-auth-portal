import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageCircle, Shield, Heart, BookOpen, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Vibrant hero background */}
      <div className="absolute inset-0 bg-hero-gradient"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,theme(colors.accent/20),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,theme(colors.peach/15),transparent_60%)]"></div>
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-white/20 bg-white/10 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-1.5 sm:p-2 border border-white/20 shadow-lg">
                    <img 
                      src="/lovable-uploads/87f18587-d472-4831-a300-99843cc45cfe.png" 
                      alt="لوگو خانواده مینا" 
                      className="h-8 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg">
                  خانواده مینا
                </h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30 btn-glow text-sm sm:text-base px-3 sm:px-4 py-2">
                    ورود
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-button-gradient hover:shadow-glow-lg text-white font-semibold btn-glow text-sm sm:text-base px-3 sm:px-4 py-2">
                    <UserPlus className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    عضویت
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20 animate-fade-in">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative group animate-scale-in">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-3xl opacity-60"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-white/30 shadow-2xl hover-scale">
                  <img 
                    src="/lovable-uploads/87f18587-d472-4831-a300-99843cc45cfe.png" 
                    alt="لوگو خانواده مینا" 
                    className="h-24 sm:h-32 md:h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 drop-shadow-2xl leading-tight">
              به خانواده مینا خوش آمدید
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 leading-relaxed drop-shadow-lg font-medium px-2">
              جایی که رشد شخصی، کوچینگ حرفه‌ای و حمایت روانی در کنار هم قرار دارند
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-slide-up px-4">
              <Link to={user ? "/ai-coach" : "/register"} className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/30 hover:shadow-glow text-lg sm:text-xl px-8 sm:px-10 py-3 sm:py-4 font-bold btn-glow min-h-[48px]"
                >
                  <MessageCircle className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                  مشاور هوشمند
                </Button>
              </Link>
              <Link to="/courses" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-button-gradient hover:shadow-glow-lg text-white text-lg sm:text-xl px-8 sm:px-10 py-3 sm:py-4 font-bold btn-glow min-h-[48px]"
                >
                  <BookOpen className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                  مشاهده دوره‌ها
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto animate-slide-up">
            <Card className="p-6 sm:p-8 text-center bg-white/95 backdrop-blur-md border-0 shadow-glow card-hover">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-button-gradient rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">کوچینگ هوشمند</h3>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                مشاور هوشمند ما به شما کمک می‌کند تا بهترین نوع مشاوره را برای نیازهایتان پیدا کنید
              </p>
            </Card>

            <Card className="p-6 sm:p-8 text-center bg-white/95 backdrop-blur-md border-0 shadow-glow card-hover">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-teal to-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">حمایت روانی</h3>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                محیط امن و حرفه‌ای برای دریافت حمایت روانی و مشاوره‌های تخصصی
              </p>
            </Card>

            <Card className="p-6 sm:p-8 text-center bg-white/95 backdrop-blur-md border-0 shadow-glow card-hover sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">محرمانگی کامل</h3>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                تمام اطلاعات شما با بالاترین استانداردهای امنیتی محفوظ نگهداری می‌شود
              </p>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/20 bg-gradient-to-r from-warm-beige/90 to-peach/90 backdrop-blur-md py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-lg blur-sm opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-white/30 shadow-md hover-scale">
                  <img 
                    src="/lovable-uploads/87f18587-d472-4831-a300-99843cc45cfe.png" 
                    alt="لوگو خانواده مینا" 
                    className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">خانواده مینا © ۱۴۰۳</span>
            </div>
            <p className="text-muted-foreground font-medium">
              پلتفرم حرفه‌ای رشد شخصی و کوچینگ
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;