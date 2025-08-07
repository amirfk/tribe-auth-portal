import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalMessages: number;
  todayMessages: number;
  weeklyUsers: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalMessages: 0,
    todayMessages: 0,
    weeklyUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total messages
      const { count: totalMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

      // Today's messages
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Weekly new users
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weeklyUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalMessages: totalMessages || 0,
        todayMessages: todayMessages || 0,
        weeklyUsers: weeklyUsers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'کل کاربران',
      value: stats.totalUsers,
      description: 'تعداد کل کاربران ثبت‌نام شده',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'کل پیام‌ها',
      value: stats.totalMessages,
      description: 'تعداد کل پیام‌های ارسال شده',
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      title: 'پیام‌های امروز',
      value: stats.todayMessages,
      description: 'پیام‌های ارسال شده امروز',
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      title: 'کاربران جدید',
      value: stats.weeklyUsers,
      description: 'کاربران جدید هفته گذشته',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString('fa-IR')}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};