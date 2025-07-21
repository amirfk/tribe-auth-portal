import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, ExternalLink } from 'lucide-react';

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
      text: 'سلام! من مشاور هوشمند شما هستم. من اینجا هستم تا به شما کمک کنم تا مشخص کنیم کدام نوع مشاوره برای شما مناسب‌تر است. لطفاً درباره وضعیت فعلی خود و چالش‌هایی که با آنها روبرو هستید صحبت کنید.',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [result, setResult] = useState<ChatResult | null>(null);
  const [webhookUrl] = useState('https://wekohmrtrrebcdprvzza.functions.supabase.co/ai-coach-proxy');
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
    if (!currentMessage.trim() || !webhookUrl.trim()) {
      if (!webhookUrl.trim()) {
        toast({
          title: 'خطا',
          description: 'لطفاً ابتدا آدرس webhook را وارد کنید',
          variant: 'destructive'
        });
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          user_id: user?.id,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      // Check if this is the final result
      if (data.status === 'done' && data.result) {
        setResult(data);
        setChatEnded(true);
        
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getResultMessage(data.result),
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, finalMessage]);
      } else {
        // Handle different response formats from n8n
        let aiResponseText = '';
        
        if (Array.isArray(data) && data.length > 0 && data[0].output) {
          // New n8n format: [{ output: "text" }]
          aiResponseText = data[0].output;
        } else if (data.response || data.message) {
          // Old format: { response: "text" } or { message: "text" }
          aiResponseText = data.response || data.message;
        } else {
          aiResponseText = 'متأسفم، نتوانستم پاسخ مناسبی دریافت کنم.';
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
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
    // Replace with actual Telegram chat URL
    const telegramUrl = 'https://t.me/your_coaching_bot'; // Update this with actual Telegram URL
    window.open(telegramUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">مشاور هوشمند</h1>
          <p className="text-muted-foreground">بیایید باهم مشخص کنیم کدام نوع مشاوره برای شما مناسب است</p>
        </div>


        <Card className="h-[600px] flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <p className="text-sm leading-relaxed" style={{ direction: 'rtl' }}>
                      {message.text}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('fa-IR')}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {chatEnded && result?.result === 'کوچینگ' && (
            <div className="p-4 border-t bg-secondary/50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  برای ادامه کوچینگ با یکی از مربیان ما در تلگرام صحبت کنید
                </p>
                <Button onClick={handleTelegramRedirect} className="gap-2">
                  <ExternalLink size={16} />
                  ورود به چت تلگرام
                </Button>
              </div>
            </div>
          )}

          {!chatEnded && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="پیام خود را بنویسید..."
                  disabled={isLoading || !webhookUrl}
                  className="flex-1"
                  style={{ direction: 'rtl' }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !currentMessage.trim() || !webhookUrl}
                  size="icon"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {chatEnded && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              رفتن به داشبورد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiCoach;