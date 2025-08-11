-- 1) Add email column to profiles and index
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2) Backfill emails from auth.users once
DO $$
BEGIN
  -- Only attempt backfill if we have any NULL emails
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email IS NULL) THEN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE u.id = p.id AND (p.email IS DISTINCT FROM u.email);
  END IF;
END $$;

-- 3) Keep the helper function updated to also insert email on future signups (no trigger changes here)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$;