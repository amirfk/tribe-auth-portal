-- Promote specific email to admin: remove existing roles and insert admin
DO $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id
  FROM auth.users
  WHERE lower(email) = lower('arsalan.farhady@gmail.com')
  LIMIT 1;

  IF target_id IS NOT NULL THEN
    -- Remove any existing roles for this user to avoid duplicates/ambiguity
    DELETE FROM public.user_roles
    WHERE user_id = target_id;

    -- Insert the admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;