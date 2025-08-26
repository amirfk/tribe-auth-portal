import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageCircle, Shield, Heart, BookOpen, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Hero gradient background */}
      <div className="absolute inset-0 bg-hero-gradient"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-warm-beige/20 to-soft-peach/30"></div>
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="backdrop-blur-sm bg-white/90 border-b border-white/20 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                  alt="Mina's Tribe Logo" 
                  className="h-12 w-auto object-contain animate-float"
                />
                <h2 className="text-2xl font-heading bg-cta-gradient bg-clip-text text-transparent">
                  Mina's Tribe
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-dark-slate hover:bg-white/20 font-body">
                    ورود
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-cta-gradient hover:opacity-90 text-white font-body btn-glow shadow-lg">
                    <UserPlus className="ml-2 h-4 w-4" />
                    عضویت
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-32 w-auto object-contain animate-glow"
              />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-heading text-white mb-6 animate-fade-in-up drop-shadow-lg">
              به خانواده مینا خوش آمدید
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed font-body animate-fade-in-up drop-shadow-md">
              جایی که رشد شخصی، کوچینگ حرفه‌ای و حمایت روانی در کنار هم قرار دارند
            </p>
            
            <div className="flex justify-center gap-6 flex-wrap animate-fade-in-up">
              <Link to={user ? "/ai-coach" : "/register"}>
                <Button 
                  size="lg" 
                  className="bg-cta-gradient hover:opacity-90 text-white text-lg px-10 py-4 rounded-full shadow-xl btn-glow font-body"
                >
                  <MessageCircle className="ml-3 h-6 w-6" />
                  مشاور هوشمند
                </Button>
              </Link>
              <Link to="/store">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-dark-slate text-lg px-10 py-4 rounded-full backdrop-blur-sm bg-white/10 shadow-xl font-body"
                >
                  <BookOpen className="ml-3 h-6 w-6" />
                  مشاهده محصولات
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 text-center bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
              <div className="w-16 h-16 bg-cta-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-glow">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading text-dark-slate mb-4">کوچینگ هوشمند</h3>
              <p className="text-cool-gray font-body leading-relaxed">
                مشاور هوشمند ما به شما کمک می‌کند تا بهترین نوع مشاوره را برای نیازهایتان پیدا کنید
              </p>
            </Card>

            <Card className="p-8 text-center bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up [animation-delay:200ms]">
              <div className="w-16 h-16 bg-turquoise-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-glow">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading text-dark-slate mb-4">حمایت روانی</h3>
              <p className="text-cool-gray font-body leading-relaxed">
                محیط امن و حرفه‌ای برای دریافت حمایت روانی و مشاوره‌های تخصصی
              </p>
            </Card>

            <Card className="p-8 text-center bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up [animation-delay:400ms]">
              <div className="w-16 h-16 bg-gradient-to-br from-soft-peach to-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-glow">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-heading text-dark-slate mb-4">محرمانگی کامل</h3>
              <p className="text-cool-gray font-body leading-relaxed">
                تمام اطلاعات شما با بالاترین استانداردهای امنیتی محفوظ نگهداری می‌شود
              </p>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-l from-warm-beige to-soft-peach border-t border-white/20 py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-3 mb-6">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina's Tribe Logo" 
                className="h-10 w-auto object-contain"
              />
              <span className="text-lg font-heading text-dark-slate">Mina's Tribe</span>
            </div>
            <p className="text-cool-gray font-body mb-2">
              پلتفرم حرفه‌ای رشد شخصی و کوچینگ
            </p>
            <p className="text-sm text-cool-gray/80 font-body">
              © ۲۰۲۴ Mina's Tribe - تمامی حقوق محفوظ است
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;