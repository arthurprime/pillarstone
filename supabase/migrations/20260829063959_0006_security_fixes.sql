-- Fix is_admin() function: set immutable search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid()
  AND role IN ('admin', 'editor')
);
$function$;

-- Fix update_updated_at() function: set immutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Restrict profiles: anon should NOT be able to SELECT profiles
-- Only authenticated users can see their own profile, admins can see all
REVOKE SELECT ON public.profiles FROM anon;

-- Fix favorites INSERT policy: remove empty USING clause
DROP POLICY IF EXISTS favorites_insert_own ON public.favorites;
CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
