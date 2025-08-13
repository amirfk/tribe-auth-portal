import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminStats } from '@/components/admin/AdminStats';
import { UserManagement } from '@/components/admin/UserManagement';
import { ChatHistory } from '@/components/admin/ChatHistory';
import { IntegrationSettings } from '@/components/admin/IntegrationSettings';
import { BarChart3, Users, MessageSquare, Settings } from 'lucide-react';

const AdminPanel = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">پنل مدیریت</h1>
        <p className="text-muted-foreground">
          مدیریت کاربران و نظارت بر فعالیت‌های سیستم
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            داشبورد
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            کاربران
          </TabsTrigger>
          <TabsTrigger value="chats" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            چت‌ها
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            تنظیمات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="chats" className="space-y-6">
          <ChatHistory />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <IntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;