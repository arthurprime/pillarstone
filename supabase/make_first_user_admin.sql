-- Run this once in Supabase Dashboard → SQL Editor (not on the website).
-- Makes the first signup an admin. Safe to run even if you already pasted complete_setup.sql.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- If you already registered and cannot open /admin, promote yourself here.
-- Replace the email, then Run.
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
