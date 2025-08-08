-- Ensure triggers exist to populate profiles and roles on signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class rel ON rel.oid = t.tgrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE t.tgname = 'on_auth_user_created'
      AND nsp.nspname = 'auth'
      AND rel.relname = 'users'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class rel ON rel.oid = t.tgrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE t.tgname = 'on_auth_user_created_role'
      AND nsp.nspname = 'auth'
      AND rel.relname = 'users'
  ) THEN
    CREATE TRIGGER on_auth_user_created_role
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();
  END IF;
END $$;

-- Backfill any missing profiles
INSERT INTO public.profiles (id, full_name)
SELECT u.id, COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Ensure unique constraint on user_roles (user_id, role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE c.contype = 'u'
      AND c.conname = 'user_roles_user_role_unique'
      AND n.nspname = 'public'
      AND r.relname = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role);
  END IF;
END $$;

-- Backfill missing roles as 'user' by default
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::public.app_role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
