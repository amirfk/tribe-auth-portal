-- Add WordPress integration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wordpress_user_id bigint,
ADD COLUMN IF NOT EXISTS wordpress_username text,
ADD COLUMN IF NOT EXISTS sync_source text DEFAULT 'supabase' CHECK (sync_source IN ('wordpress', 'supabase')),
ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone;

-- Create index for WordPress user ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wordpress_user_id ON public.profiles (wordpress_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_wordpress_username ON public.profiles (wordpress_username);

-- Create integration settings table
CREATE TABLE IF NOT EXISTS public.integration_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  encrypted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on integration_settings
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access integration settings
CREATE POLICY "Admins can manage integration settings" 
ON public.integration_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_integration_settings_updated_at
BEFORE UPDATE ON public.integration_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();