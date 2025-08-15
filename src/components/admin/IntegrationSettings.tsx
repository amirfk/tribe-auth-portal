import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, TestTube, RefreshCw, AlertCircle, Package, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IntegrationSetting {
  setting_key: string;
  setting_value: string;
}

export const IntegrationSettings = () => {
  const [settings, setSettings] = useState({
    wordpress_url: '',
    wordpress_api_key: '',
    wordpress_api_secret: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [isTestingProducts, setIsTestingProducts] = useState(false);
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);
  const [productsConnected, setProductsConnected] = useState(false);
  const [productsCount, setProductsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['wordpress_url', 'wordpress_api_key', 'wordpress_api_secret']);

      if (error) throw error;

      const settingsMap = data?.reduce((acc: any, setting: IntegrationSetting) => {
        acc[setting.setting_key] = setting.setting_value || '';
        return acc;
      }, {}) || {};

      setSettings({
        wordpress_url: settingsMap.wordpress_url || '',
        wordpress_api_key: settingsMap.wordpress_api_key || '',
        wordpress_api_secret: settingsMap.wordpress_api_secret || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگیری تنظیمات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save each setting
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('integration_settings')
          .upsert({
            setting_key: key,
            setting_value: value,
          }, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }

      toast({
        title: "موفقیت",
        description: "تنظیمات ذخیره شد",
      });
      
      // Reset connection status since settings changed
      setConnectionStatus('unknown');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!settings.wordpress_url) {
      toast({
        title: "خطا",
        description: "لطفا آدرس وردپرس را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      // Test basic WordPress REST API connectivity
      const response = await fetch(`${settings.wordpress_url}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${btoa(`${settings.wordpress_api_key}:${settings.wordpress_api_secret}`)}`
        }
      });

      if (response.ok) {
        setConnectionStatus('connected');
        toast({
          title: "موفقیت",
          description: "اتصال به وردپرس برقرار شد",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "خطا",
          description: "خطا در اتصال به وردپرس - لطفا اطلاعات API را بررسی کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "خطا",
        description: "خطا در اتصال به وردپرس",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const testProductsConnection = async () => {
    setIsTestingProducts(true);
    try {
      const { data, error } = await supabase.functions.invoke('wordpress-sync', {
        body: { action: 'test_products_connection' }
      });

      if (error) throw error;

      if (data.success) {
        setProductsConnected(true);
        toast({
          title: "موفقیت",
          description: "اتصال به API محصولات WooCommerce برقرار شد",
        });
      } else {
        setProductsConnected(false);
        toast({
          title: "خطا",
          description: data.error || "خطا در اتصال به API محصولات WooCommerce",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Products connection test error:', error);
      setProductsConnected(false);
      toast({
        title: "خطا",
        description: "خطا در تست اتصال محصولات: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingProducts(false);
    }
  };

  const syncWooCommerceProducts = async () => {
    setIsSyncingProducts(true);
    try {
      const { data, error } = await supabase.functions.invoke('wordpress-sync', {
        body: { action: 'sync_woocommerce_products' }
      });

      if (error) throw error;

      setProductsCount(data.successful_syncs || 0);
      toast({
        title: "موفقیت",
        description: `${data.successful_syncs} محصول با موفقیت از WooCommerce همگام‌سازی شد!`,
      });
      
      if (data.failed_syncs > 0) {
        toast({
          title: "هشدار",
          description: `${data.failed_syncs} محصول در همگام‌سازی ناموفق بود. جزئیات را در کنسول بررسی کنید.`,
          variant: "destructive",
        });
      }

      // Reload products count after sync
      await loadProductsCount();
    } catch (error: any) {
      console.error('Products sync error:', error);
      toast({
        title: "خطا",
        description: "خطا در همگام‌سازی محصولات: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncingProducts(false);
    }
  };

  const loadProductsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('woocommerce_products')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setProductsCount(count || 0);
    } catch (error) {
      console.error('Error loading products count:', error);
    }
  };

  useEffect(() => {
    loadProductsCount();
  }, []);

  const syncSupabaseToWordPress = async () => {
    if (!settings.wordpress_url || !settings.wordpress_api_key || !settings.wordpress_api_secret) {
      toast({
        title: "خطا",
        description: "لطفا تمام تنظیمات وردپرس را تکمیل کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "شروع همگام‌سازی",
        description: "همگام‌سازی کاربران از Supabase به WordPress شروع شد...",
      });

      // Get all Supabase users without WordPress user_id
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .is('wordpress_user_id', null);

      if (error) throw error;

      if (!users || users.length === 0) {
        toast({
          title: "اطلاع",
          description: "کاربری برای همگام‌سازی یافت نشد",
        });
        return;
      }

      // Sync each user to WordPress
      for (const user of users) {
        try {
          const { error: syncError } = await supabase.functions.invoke('wordpress-sync', {
            body: {
              action: 'sync_supabase_user_to_wordpress',
              data: {
                user_id: user.id,
                email: user.email,
                display_name: user.full_name || user.email?.split('@')[0],
              }
            }
          });

          if (syncError) {
            console.error('Error syncing user:', user.email, syncError);
          }
        } catch (userError) {
          console.error('Error syncing individual user:', user.email, userError);
        }
      }

      toast({
        title: "موفقیت",
        description: `همگام‌سازی ${users.length} کاربر به WordPress تکمیل شد`,
      });
    } catch (error) {
      console.error('Error syncing users to WordPress:', error);
      toast({
        title: "خطا",
        description: "خطا در همگام‌سازی کاربران به WordPress",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                تنظیمات ادغام وردپرس
              </CardTitle>
              <CardDescription>
                تنظیم اتصال به سایت وردپرس برای همگام‌سازی کاربران
              </CardDescription>
            </div>
            {connectionStatus !== 'unknown' && (
              <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                {connectionStatus === 'connected' ? 'متصل' : 'خطا در اتصال'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              برای فعال‌سازی همگام‌سازی، باید پلاگین مخصوص روی سایت وردپرس نصب کنید.
              پس از تنظیم اطلاعات زیر، فایل پلاگین در بخش راهنما در دسترس خواهد بود.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="wordpress_url">آدرس سایت وردپرس</Label>
              <Input
                id="wordpress_url"
                placeholder="https://yoursite.com"
                value={settings.wordpress_url}
                onChange={(e) => setSettings(prev => ({ ...prev, wordpress_url: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="wordpress_api_key">نام کاربری API (Application Password)</Label>
              <Input
                id="wordpress_api_key"
                placeholder="username"
                value={settings.wordpress_api_key}
                onChange={(e) => setSettings(prev => ({ ...prev, wordpress_api_key: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="wordpress_api_secret">رمز عبور API (Application Password)</Label>
              <Input
                id="wordpress_api_secret"
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={settings.wordpress_api_secret}
                onChange={(e) => setSettings(prev => ({ ...prev, wordpress_api_secret: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </Button>
            
            <Button variant="outline" onClick={testConnection} disabled={testing}>
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? 'در حال تست...' : 'تست اتصال'}
            </Button>

            {connectionStatus === 'connected' && (
              <Button variant="secondary" onClick={syncSupabaseToWordPress}>
                <RefreshCw className="h-4 w-4 mr-2" />
                همگام‌سازی کاربران به WordPress
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {connectionStatus === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle>راهنمای نصب پلاگین وردپرس</CardTitle>
            <CardDescription>
              برای تکمیل ادغام، باید پلاگین زیر را روی سایت وردپرس نصب کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>۱. فایل پلاگین را از لینک زیر دانلود کنید</p>
                  <p>۲. فایل ZIP را در پنل مدیریت وردپرس در بخش Plugins آپلود کنید</p>
                  <p>۳. پلاگین را فعال کنید</p>
                  <p>۴. URL این سایت و کلید API را در تنظیمات پلاگین وارد کنید</p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button variant="outline" asChild>
                <a href="#" download="supabase-user-sync.zip">
                  دانلود پلاگین وردپرس
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WooCommerce Products Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            ادغام محصولات WooCommerce
          </CardTitle>
          <CardDescription>
            همگام‌سازی و مدیریت محصولات WooCommerce برای نمایش در چت AI و سایر قابلیت‌ها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">محصولات در دیتابیس: {productsCount}</span>
            </div>
            {productsConnected && (
              <Badge variant="default">
                API محصولات متصل
              </Badge>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={testProductsConnection}
              disabled={isTestingProducts || saving}
              variant="outline"
              size="sm"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTestingProducts ? "در حال تست..." : "تست API محصولات"}
            </Button>

            <Button
              onClick={syncWooCommerceProducts}
              disabled={isSyncingProducts || !settings.wordpress_url || !settings.wordpress_api_key || !settings.wordpress_api_secret}
              size="sm"
            >
              <Package className="h-4 w-4 mr-2" />
              {isSyncingProducts ? "در حال همگام‌سازی..." : "همگام‌سازی محصولات"}
            </Button>
          </div>

          {productsCount > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ {productsCount} محصول برای نمایش در چت AI و پیشنهادات در دسترس است.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};