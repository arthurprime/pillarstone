/*
# Real Estate Platform — Initial Schema

Creates the complete database schema for a real estate marketplace platform.
Tables: profiles, property_types, property_features, locations, agents, properties,
property_images, property_feature_links, developments, development_images,
development_units, article_categories, articles, inquiries, favorites,
sell_requests, site_content, site_settings.

Security: RLS on every table. Public read for published content. Authenticated
users manage own favorites/profile, submit inquiries/sell requests. Admin/editor
manage all content via is_admin() helper.
*/

-- ============ PROFILES TABLE (no policies yet) ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor', 'agent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ IS_ADMIN HELPER (depends on profiles) ============
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
$$;

-- ============ PROFILE POLICIES (now is_admin exists) ============
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============ PROPERTY TYPES ============
CREATE TABLE IF NOT EXISTS public.property_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "property_types_select_public" ON public.property_types;
CREATE POLICY "property_types_select_public" ON public.property_types FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "property_types_manage_admin" ON public.property_types;
CREATE POLICY "property_types_manage_admin" ON public.property_types FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ PROPERTY FEATURES ============
CREATE TABLE IF NOT EXISTS public.property_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "property_features_select_public" ON public.property_features;
CREATE POLICY "property_features_select_public" ON public.property_features FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "property_features_manage_admin" ON public.property_features;
CREATE POLICY "property_features_manage_admin" ON public.property_features FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ LOCATIONS ============
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL DEFAULT 'Rwanda',
  city text NOT NULL,
  district text,
  neighborhood text,
  address text,
  latitude float8,
  longitude float8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "locations_select_public" ON public.locations;
CREATE POLICY "locations_select_public" ON public.locations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "locations_manage_admin" ON public.locations;
CREATE POLICY "locations_manage_admin" ON public.locations FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ AGENTS ============
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  email text,
  phone text,
  bio text,
  role text,
  facebook_url text,
  twitter_url text,
  linkedin_url text,
  instagram_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agents_select_public" ON public.agents;
CREATE POLICY "agents_select_public" ON public.agents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "agents_manage_admin" ON public.agents;
CREATE POLICY "agents_manage_admin" ON public.agents FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ PROPERTIES ============
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  property_type_id uuid REFERENCES public.property_types(id) ON DELETE SET NULL,
  listing_type text NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'sold', 'rented', 'pending')),
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  bedrooms int,
  bathrooms int,
  area float8,
  land_area float8,
  year_built int,
  features text[],
  amenities text[],
  reference_number text UNIQUE,
  latitude float8,
  longitude float8,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_published_at ON public.properties(published_at DESC);

DROP POLICY IF EXISTS "properties_select_published" ON public.properties;
CREATE POLICY "properties_select_published" ON public.properties FOR SELECT
  TO anon, authenticated USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "properties_manage_admin" ON public.properties;
CREATE POLICY "properties_manage_admin" ON public.properties FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ PROPERTY IMAGES ============
CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_sort ON public.property_images(sort_order);

DROP POLICY IF EXISTS "property_images_select_public" ON public.property_images;
CREATE POLICY "property_images_select_public" ON public.property_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "property_images_manage_admin" ON public.property_images;
CREATE POLICY "property_images_manage_admin" ON public.property_images FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ PROPERTY FEATURE LINKS ============
CREATE TABLE IF NOT EXISTS public.property_feature_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.property_features(id) ON DELETE CASCADE,
  UNIQUE (property_id, feature_id)
);
ALTER TABLE public.property_feature_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "property_feature_links_select_public" ON public.property_feature_links;
CREATE POLICY "property_feature_links_select_public" ON public.property_feature_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "property_feature_links_manage_admin" ON public.property_feature_links;
CREATE POLICY "property_feature_links_manage_admin" ON public.property_feature_links FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ DEVELOPMENTS ============
CREATE TABLE IF NOT EXISTS public.developments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  developer text,
  description text,
  main_image_path text,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  starting_price numeric(12,2),
  currency text NOT NULL DEFAULT 'USD',
  completion_date date,
  amenities text[],
  latitude float8,
  longitude float8,
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.developments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_developments_slug ON public.developments(slug);
CREATE INDEX IF NOT EXISTS idx_developments_status ON public.developments(status);

DROP POLICY IF EXISTS "developments_select_published" ON public.developments;
CREATE POLICY "developments_select_published" ON public.developments FOR SELECT
  TO anon, authenticated USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "developments_manage_admin" ON public.developments;
CREATE POLICY "developments_manage_admin" ON public.developments FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ DEVELOPMENT IMAGES ============
CREATE TABLE IF NOT EXISTS public.development_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  development_id uuid NOT NULL REFERENCES public.developments(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.development_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "development_images_select_public" ON public.development_images;
CREATE POLICY "development_images_select_public" ON public.development_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "development_images_manage_admin" ON public.development_images;
CREATE POLICY "development_images_manage_admin" ON public.development_images FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ DEVELOPMENT UNITS ============
CREATE TABLE IF NOT EXISTS public.development_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  development_id uuid NOT NULL REFERENCES public.developments(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  unit_type text,
  bedrooms int,
  bathrooms int,
  area float8,
  price numeric(12,2),
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'reserved', 'sold')),
  floor int,
  image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.development_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "development_units_select_public" ON public.development_units;
CREATE POLICY "development_units_select_public" ON public.development_units FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "development_units_manage_admin" ON public.development_units;
CREATE POLICY "development_units_manage_admin" ON public.development_units FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ ARTICLE CATEGORIES ============
CREATE TABLE IF NOT EXISTS public.article_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "article_categories_select_public" ON public.article_categories;
CREATE POLICY "article_categories_select_public" ON public.article_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "article_categories_manage_admin" ON public.article_categories;
CREATE POLICY "article_categories_manage_admin" ON public.article_categories FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ ARTICLES ============
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image_path text,
  category_id uuid REFERENCES public.article_categories(id) ON DELETE SET NULL,
  author text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  meta_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);

DROP POLICY IF EXISTS "articles_select_published" ON public.articles;
CREATE POLICY "articles_select_published" ON public.articles FOR SELECT
  TO anon, authenticated USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "articles_manage_admin" ON public.articles;
CREATE POLICY "articles_manage_admin" ON public.articles FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ INQUIRIES ============
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

DROP POLICY IF EXISTS "inquiries_insert_public" ON public.inquiries;
CREATE POLICY "inquiries_insert_public" ON public.inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_manage_admin" ON public.inquiries;
CREATE POLICY "inquiries_manage_admin" ON public.inquiries FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ FAVORITES ============
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON public.favorites(property_id);

DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ SELL REQUESTS ============
CREATE TABLE IF NOT EXISTS public.sell_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  property_type text,
  location text,
  estimated_price numeric(12,2),
  description text,
  bedrooms int,
  bathrooms int,
  area float8,
  land_area float8,
  additional_message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sell_requests_status ON public.sell_requests(status);

DROP POLICY IF EXISTS "sell_requests_insert_public" ON public.sell_requests;
CREATE POLICY "sell_requests_insert_public" ON public.sell_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sell_requests_manage_admin" ON public.sell_requests;
CREATE POLICY "sell_requests_manage_admin" ON public.sell_requests FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ SITE CONTENT ============
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_select_public" ON public.site_content;
CREATE POLICY "site_content_select_public" ON public.site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_content_manage_admin" ON public.site_content;
CREATE POLICY "site_content_manage_admin" ON public.site_content FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ SITE SETTINGS ============
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public" ON public.site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_manage_admin" ON public.site_settings;
CREATE POLICY "site_settings_manage_admin" ON public.site_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ UPDATED_AT TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','locations','agents','properties','property_images','developments','development_units','articles','inquiries','sell_requests','site_content','site_settings'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t);
  END LOOP;
END $$;
