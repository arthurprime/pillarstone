-- Paste this in Supabase → SQL Editor → Run
-- Fixes missing construction/interior tables and photo gallery.

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

CREATE TABLE IF NOT EXISTS public.service_project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.service_projects(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_project_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_projects_select_published" ON public.service_projects;
CREATE POLICY "service_projects_select_published" ON public.service_projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "service_projects_manage_admin" ON public.service_projects;
CREATE POLICY "service_projects_manage_admin" ON public.service_projects FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "service_project_images_select" ON public.service_project_images;
CREATE POLICY "service_project_images_select" ON public.service_project_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_projects p
      WHERE p.id = project_id
        AND (p.status = 'published' OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "service_project_images_manage_admin" ON public.service_project_images;
CREATE POLICY "service_project_images_manage_admin" ON public.service_project_images FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS service_projects_category_status_idx
  ON public.service_projects (category, status, sort_order);

CREATE INDEX IF NOT EXISTS service_project_images_project_idx
  ON public.service_project_images (project_id, sort_order);

GRANT SELECT ON public.service_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_projects TO authenticated;
GRANT SELECT ON public.service_project_images TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_project_images TO authenticated;

NOTIFY pgrst, 'reload schema';
