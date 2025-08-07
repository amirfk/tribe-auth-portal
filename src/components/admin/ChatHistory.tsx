import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { MessageSquare, Eye } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string | null;
  session_id: string | null;
  created_at: string;
  user_name: string;
}

export const ChatHistory = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  const fetchChatHistory = async () => {
    try {
      // Fetch chat messages
      const { data: chatData, error: chatError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (chatError) throw chatError;

      // Fetch user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Combine data
      const messagesWithUserNames = chatData?.map(msg => {
        const profile = profilesData?.find(p => p.id === msg.user_id);
        return {
          ...msg,
          user_name: profile?.full_name || 'نام تنظیم نشده'
        };
      }) || [];

      setMessages(messagesWithUserNames);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('خطا در بارگذاری تاریخچه چت‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          تاریخچه چت‌ها
        </CardTitle>
        <CardDescription>
          مشاهده تمام گفتگوهای کاربران با هوش مصنوعی
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>پیام</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="font-medium">
                  {message.user_name}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {message.message}
                </TableCell>
                <TableCell>
                  {new Date(message.created_at).toLocaleDateString('fa-IR')}
                </TableCell>
                <TableCell>
                  <Badge variant={message.response ? 'default' : 'secondary'}>
                    {message.response ? 'پاسخ داده شده' : 'در انتظار'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMessage(message)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>جزئیات گفتگو</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">کاربر:</h4>
                          <p className="text-sm text-muted-foreground">{message.user_name}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">پیام:</h4>
                          <ScrollArea className="h-32 w-full rounded border p-3">
                            <p className="text-sm">{message.message}</p>
                          </ScrollArea>
                        </div>
                        {message.response && (
                          <div>
                            <h4 className="font-semibold mb-2">پاسخ هوش مصنوعی:</h4>
                            <ScrollArea className="h-32 w-full rounded border p-3">
                              <p className="text-sm">{message.response}</p>
                            </ScrollArea>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold mb-2">تاریخ:</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(message.created_at).toLocaleString('fa-IR')}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};