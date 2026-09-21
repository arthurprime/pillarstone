CREATE TABLE IF NOT EXISTS public.service_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('construction', 'interior')),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  location text,
  image_path text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order int NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_projects_select_published" ON public.service_projects;
CREATE POLICY "service_projects_select_published" ON public.service_projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "service_projects_manage_admin" ON public.service_projects;
CREATE POLICY "service_projects_manage_admin" ON public.service_projects FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS service_projects_category_status_idx
  ON public.service_projects (category, status, sort_order);
