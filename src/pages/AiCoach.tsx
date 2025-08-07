import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, ExternalLink, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatResult {
  status: string;
  result: 'تراپی' | 'کوچینگ' | 'منتورینگ';
}

const AiCoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'سلام! من مشاور هوشمند شما هستم. هدفم اینه که با چند سؤال ساده کمک کنم مشخص کنیم آیا کوچینگ می‌تونه به شما کمک کنه یا شاید گزینه‌ی دیگه‌ای مثل روان‌درمانی یا منتورشیپ مناسب‌تر باشه.\n\nدوست دارم اول بدونم: در حال حاضر چه چیزی بیشتر از همه ذهن‌تون رو درگیر کرده یا می‌خواید چه تغییری توی زندگی یا شغل‌تون ایجاد کنید؟',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [result, setResult] = useState<ChatResult | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message via Supabase edge function:', {
        message: currentMessage,
        user_id: user?.id
      });

      const { data, error } = await supabase.functions.invoke('ai-coach-proxy', {
        body: {
          message: messageText,
          user_id: user?.id,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Response data from edge function:', data);

      // Handle different response formats from n8n
      let aiResponseText = '';
      
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        // New n8n format: [{ output: "text" }]
        aiResponseText = data[0].output;
      } else if (data.response || data.message) {
        // Old format: { response: "text" } or { message: "text" }
        aiResponseText = data.response || data.message;
      } else {
        console.log('Unexpected response format:', data);
        aiResponseText = 'متأسفم، نتوانستم پاسخ مناسبی دریافت کنم.';
      }

      // Check if the response contains a JSON result at the end
      const jsonPattern = /```json\s*\{\s*"status":\s*"done",\s*"result":\s*"([^"]+)"\s*\}\s*```/;
      const jsonMatch = aiResponseText.match(jsonPattern);
      
      if (jsonMatch) {
        // Extract the result and clean the message
        const result = jsonMatch[1];
        const cleanMessage = aiResponseText.replace(jsonPattern, '').trim();
        
        setResult({ status: 'done', result: result as 'تراپی' | 'کوچینگ' | 'منتورینگ' });
        setChatEnded(true);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: cleanMessage,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Add final result message
        const finalMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: getResultMessage(result as 'تراپی' | 'کوچینگ' | 'منتورینگ'),
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, finalMessage]);
      } else {
        // Regular message without final result
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }

      // Save message to database
      try {
        await supabase.from('chat_messages').insert({
          user_id: user?.id,
          message: messageText,
          response: aiResponseText,
          session_id: `session_${Date.now()}`
        });
      } catch (dbError) {
        console.error('Error saving message to database:', dbError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'متأسفم، خطایی در ارتباط رخ داد. لطفاً دوباره تلاش کنید.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'خطا در ارتباط',
        description: 'لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultMessage = (result: string) => {
    switch (result) {
      case 'کوچینگ':
        return 'بر اساس صحبت‌های شما، کوچینگ برای شما مناسب است. کوچینگ به شما کمک می‌کند تا اهداف خود را مشخص کرده و مسیر رسیدن به آنها را طراحی کنید.';
      case 'تراپی':
        return 'بر اساس صحبت‌های شما، درمان روان‌شناختی (تراپی) برای شما توصیه می‌شود. تراپی به شما کمک می‌کند تا با مسائل عمیق‌تر روانی خود کار کنید.';
      case 'منتورینگ':
        return 'بر اساس صحبت‌های شما، منتورینگ برای شما مناسب است. منتورینگ به شما کمک می‌کند تا از تجربیات و راهنمایی‌های یک متخصص با تجربه بهره‌مند شوید.';
      default:
        return 'متشکرم از صحبت‌هایتان. بر اساس بررسی، راهنمایی مناسب برای شما مشخص شده است.';
    }
  };

  const handleTelegramRedirect = () => {
    const telegramUrl = 'https://t.me/Minastribe_coaching';
    window.open(telegramUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Professional office background with warm lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/5),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,theme(colors.accent/10),transparent_60%)]"></div>
      
      <div className="relative z-10 p-4">
        <div className="mx-auto max-w-4xl">
          {/* Professional header with logo */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/lovable-uploads/636ebeb2-12fd-4466-b7ef-38352bd27b8a.png" 
                alt="Mina Coaching Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              مشاور هوشمند مینا
            </h1>
            <p className="text-muted-foreground text-lg">
              بیایید باهم مشخص کنیم کدام نوع مشاوره برای شما مناسب است
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>محیط امن و حرفه‌ای برای گفتگو</span>
            </div>
          </div>

          {/* Professional chat interface */}
          <Card className="h-[600px] flex flex-col shadow-xl border-2 border-primary/10 bg-card/95 backdrop-blur-sm">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' 
                      : 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground'
                  }`}>
                    {message.sender === 'user' ? (
                      <User size={18} />
                    ) : (
                      <MessageCircle size={18} />
                    )}
                  </div>
                  <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm'
                      : 'bg-card border border-primary/10 text-card-foreground rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed font-medium" style={{ direction: 'rtl' }}>
                      {message.text}
                    </p>
                    <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
                      <span>{message.timestamp.toLocaleTimeString('fa-IR')}</span>
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 text-accent-foreground flex items-center justify-center shadow-md">
                    <MessageCircle size={18} />
                  </div>
                  <div className="bg-card border border-primary/10 text-card-foreground p-4 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">در حال تایپ...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {chatEnded && result?.result === 'کوچینگ' && (
            <div className="p-6 border-t border-primary/10 bg-gradient-to-r from-office-accent/20 to-accent/20">
              <div className="text-center">
                <div className="mb-4">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground mb-1 font-medium">
                    🎉 بر اساس بررسی، کوچینگ برای شما مناسب است
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    برای ادامه کوچینگ با مربی حرفه‌ای مینا در تلگرام صحبت کنید
                  </p>
                </div>
                <Button 
                  onClick={handleTelegramRedirect} 
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                >
                  <ExternalLink size={16} />
                  شروع کوچینگ با مینا
                </Button>
              </div>
            </div>
          )}

          {!chatEnded && (
            <div className="p-6 border-t border-primary/10 bg-muted/30">
              <div className="flex gap-3">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="پیام خود را بنویسید..."
                  disabled={isLoading}
                  className="flex-1 bg-background/80 border-primary/20 focus:border-primary/40 text-base rounded-xl"
                  style={{ direction: 'rtl' }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !currentMessage.trim()}
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                >
                  <Send size={18} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                اطلاعات شما محرمانه و امن نگهداری می‌شود
              </p>
            </div>
          )}
        </Card>

          {chatEnded && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="border-primary/30 hover:bg-primary/5"
              >
                بازگشت به داشبورد
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiCoach;