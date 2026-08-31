-- Pillarstone complete database setup
-- Paste this entire file into Supabase -> SQL Editor -> Run
-- After Auth signup, promote yourself:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';


-- ========== supabase\migrations\20260826145347_0001_initial_schema.sql ==========
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

-- ========== supabase\migrations\20260826145428_0002_seed_data.sql ==========
/*
# Seed Data — Demo Content

## Overview
Inserts clearly-identifiable demo data for interface development:
- Property types (House, Villa, Apartment, Townhouse, Land, Commercial, Office, Shop, Warehouse, Other)
- Property features (Pool, Parking, Garden, Security, Balcony, Gym, Generator, Solar, Furnished, AC)
- Locations (Kigali districts)
- Sample agents
- Demo properties with images
- Article categories + demo articles
- Site content (hero, about, CTA sections)
- Site settings (company info, contact, social)

All demo records use realistic property examples only. No fake reviews or awards.
*/

-- ============ PROPERTY TYPES ============
INSERT INTO public.property_types (name, slug, sort_order) VALUES
('House', 'house', 1),
('Villa', 'villa', 2),
('Apartment', 'apartment', 3),
('Townhouse', 'townhouse', 4),
('Land', 'land', 5),
('Commercial', 'commercial', 6),
('Office', 'office', 7),
('Shop', 'shop', 8),
('Warehouse', 'warehouse', 9),
('Other', 'other', 10)
ON CONFLICT (name) DO NOTHING;

-- ============ PROPERTY FEATURES ============
INSERT INTO public.property_features (name, slug) VALUES
('Swimming Pool', 'swimming-pool'),
('Parking', 'parking'),
('Garden', 'garden'),
('Security', 'security'),
('Balcony', 'balcony'),
('Gym', 'gym'),
('Generator', 'generator'),
('Solar', 'solar'),
('Furnished', 'furnished'),
('Air Conditioning', 'air-conditioning')
ON CONFLICT (name) DO NOTHING;

-- ============ LOCATIONS ============
INSERT INTO public.locations (country, city, district, neighborhood, latitude, longitude) VALUES
('Rwanda', 'Kigali', 'Gasabo', 'Kimihurura', -1.9577, 30.1027),
('Rwanda', 'Kigali', 'Nyarugenge', 'Nyarutarama', -1.9405, 30.1168),
('Rwanda', 'Kigali', 'Gasabo', 'Remera', -1.9443, 30.1302),
('Rwanda', 'Kigali', 'Kicukiro', 'Kagarama', -1.9706, 30.1512),
('Rwanda', 'Kigali', 'Nyarugenge', 'Gikondo', -1.9550, 30.0620),
('Rwanda', 'Kigali', 'Gasabo', 'Nyandungu', -1.9350, 30.1450);

-- ============ AGENTS ============
INSERT INTO public.agents (name, email, phone, bio, role, is_active, sort_order) VALUES
('Claudine Uwase', 'claudine@estate.rw', '+250 788 100 200', 'Senior property consultant specializing in residential properties in Kigali.', 'Senior Consultant', true, 1),
('Eric Mugisha', 'eric@estate.rw', '+250 788 100 201', 'Commercial property specialist with expertise in retail and office spaces.', 'Commercial Specialist', true, 2),
('Diane Iradukunda', 'diane@estate.rw', '+250 788 100 202', 'Land and development advisor focused on investment opportunities.', 'Land Advisor', true, 3)
ON CONFLICT DO NOTHING;

-- ============ PROPERTIES ============
INSERT INTO public.properties (title, slug, description, property_type_id, listing_type, status, price, currency, location_id, bedrooms, bathrooms, area, land_area, year_built, reference_number, agent_id, is_featured, published_at) VALUES
(
  'Modern Four-Bedroom Villa in Kimihurura',
  'modern-four-bedroom-villa-kimihurura',
  'A contemporary villa featuring open-plan living, floor-to-ceiling windows, and a landscaped garden. The ground floor offers a spacious living room, dining area, and a fitted kitchen. Upstairs, four en-suite bedrooms include a master suite with a private balcony overlooking the city.',
  (SELECT id FROM public.property_types WHERE slug='villa'),
  'sale', 'published', 850000, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Kimihurura' LIMIT 1),
  4, 5, 320, 500, 2023, 'EST-001',
  (SELECT id FROM public.agents WHERE name='Claudine Uwase' LIMIT 1),
  true, now()
),
(
  'Two-Bedroom Apartment with City Views',
  'two-bedroom-apartment-city-views-nyarutarama',
  'A bright apartment on the upper floor with panoramic views of Kigali. Features an open kitchen, two bedrooms, and a covered balcony. Located in a secure compound with parking.',
  (SELECT id FROM public.property_types WHERE slug='apartment'),
  'rent', 'published', 1200, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Nyarutarama' LIMIT 1),
  2, 2, 110, null, 2022, 'EST-002',
  (SELECT id FROM public.agents WHERE name='Claudine Uwase' LIMIT 1),
  true, now()
),
(
  'Residential Land Plot in Remera',
  'residential-land-plot-remera',
  'A well-located residential plot in Remera with a title deed. Suitable for a family home or small residential development. The land is flat, fenced, and connected to utilities.',
  (SELECT id FROM public.property_types WHERE slug='land'),
  'sale', 'published', 95000, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Remera' LIMIT 1),
  null, null, null, 800, null, 'EST-003',
  (SELECT id FROM public.agents WHERE name='Diane Iradukunda' LIMIT 1),
  false, now()
),
(
  'Five-Bedroom Family House in Kagarama',
  'five-bedroom-family-house-kagarama',
  'A spacious family home with a large garden, double garage, and servant quarters. The house features a formal living room, family room, fitted kitchen, and five bedrooms across two floors.',
  (SELECT id FROM public.property_types WHERE slug='house'),
  'sale', 'published', 420000, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Kagarama' LIMIT 1),
  5, 4, 380, 700, 2021, 'EST-004',
  (SELECT id FROM public.agents WHERE name='Claudine Uwase' LIMIT 1),
  true, now()
),
(
  'Commercial Retail Space in Gikondo',
  'commercial-retail-space-gikondo',
  'Ground-floor retail space on a busy road with high foot traffic. Includes a storefront, storage room, and dedicated parking. Suitable for a shop, showroom, or restaurant.',
  (SELECT id FROM public.property_types WHERE slug='commercial'),
  'rent', 'published', 2500, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Gikondo' LIMIT 1),
  null, null, 180, null, 2020, 'EST-005',
  (SELECT id FROM public.agents WHERE name='Eric Mugisha' LIMIT 1),
  false, now()
),
(
  'Three-Bedroom Townhouse in Nyandungu',
  'three-bedroom-townhouse-nyandungu',
  'A modern townhouse in a gated community with shared gardens and 24-hour security. Features three bedrooms, a fitted kitchen, and an enclosed parking space.',
  (SELECT id FROM public.property_types WHERE slug='townhouse'),
  'sale', 'published', 180000, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Nyandungu' LIMIT 1),
  3, 3, 160, 200, 2023, 'EST-006',
  (SELECT id FROM public.agents WHERE name='Claudine Uwase' LIMIT 1),
  false, now()
),
(
  'Luxury Villa with Pool and Garden',
  'luxury-villa-pool-garden-kimihurura',
  'An architect-designed villa with a swimming pool, landscaped garden, and outdoor entertainment area. The interior features high ceilings, premium finishes, and a state-of-the-art kitchen.',
  (SELECT id FROM public.property_types WHERE slug='villa'),
  'sale', 'published', 1250000, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Kimihurura' LIMIT 1),
  5, 6, 450, 600, 2024, 'EST-007',
  (SELECT id FROM public.agents WHERE name='Claudine Uwase' LIMIT 1),
  true, now()
),
(
  'Office Space in Nyarutarama Business District',
  'office-space-nyarutarama-business-district',
  'Modern office space in a commercial building with elevator access. Includes open-plan work areas, two private offices, a meeting room, and a kitchenette. Ample parking available.',
  (SELECT id FROM public.property_types WHERE slug='office'),
  'rent', 'published', 3500, 'USD',
  (SELECT id FROM public.locations WHERE neighborhood='Nyarutarama' LIMIT 1),
  null, null, 220, null, 2022, 'EST-008',
  (SELECT id FROM public.agents WHERE name='Eric Mugisha' LIMIT 1),
  false, now()
)
ON CONFLICT (slug) DO NOTHING;

-- ============ PROPERTY IMAGES (using Pexels URLs) ============
INSERT INTO public.property_images (property_id, image_path, sort_order, is_primary) VALUES
((SELECT id FROM public.properties WHERE slug='modern-four-bedroom-villa-kimihurura'), 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
((SELECT id FROM public.properties WHERE slug='modern-four-bedroom-villa-kimihurura'), 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200', 1, false),
((SELECT id FROM public.properties WHERE slug='modern-four-bedroom-villa-kimihurura'), 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200', 2, false),
((SELECT id FROM public.properties WHERE slug='two-bedroom-apartment-city-views-nyarutarama'), 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
((SELECT id FROM public.properties WHERE slug='two-bedroom-apartment-city-views-nyarutarama'), 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1200', 1, false),
((SELECT id FROM public.properties WHERE slug='residential-land-plot-remera'), 'https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
((SELECT id FROM public.properties WHERE slug='five-bedroom-family-house-kagarama'), 'https://images.pexels.com/photos/2287310/pexels-photo-2287310.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
((SELECT id FROM public.properties WHERE slug='five-bedroom-family-house-kagarama'), 'https://images.pexels.com/photos/2029661/pexels-photo-2029661.jpeg?auto=compress&cs=tinysrgb&w=1200', 1, false),
((SELECT id FROM public.properties WHERE slug='commercial-retail-space-gikondo'), 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
((SELECT id FROM public.properties WHERE slug='three-bedroom-townhouse-nyandungu'), 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
((SELECT id FROM public.properties WHERE slug='luxury-villa-pool-garden-kimihurura'), 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
((SELECT id FROM public.properties WHERE slug='luxury-villa-pool-garden-kimihurura'), 'https://images.pexels.com/photos/261428/pexels-photo-261428.jpeg?auto=compress&cs=tinysrgb&w=1200', 1, false),
((SELECT id FROM public.properties WHERE slug='luxury-villa-pool-garden-kimihurura'), 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200', 2, false),
((SELECT id FROM public.properties WHERE slug='office-space-nyarutarama-business-district'), 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true)
ON CONFLICT DO NOTHING;

-- ============ PROPERTY FEATURE LINKS ============
INSERT INTO public.property_feature_links (property_id, feature_id)
SELECT p.id, f.id FROM public.properties p, public.property_features f
WHERE p.slug = 'modern-four-bedroom-villa-kimihurura' AND f.slug IN ('parking', 'garden', 'security', 'balcony')
ON CONFLICT DO NOTHING;

INSERT INTO public.property_feature_links (property_id, feature_id)
SELECT p.id, f.id FROM public.properties p, public.property_features f
WHERE p.slug = 'luxury-villa-pool-garden-kimihurura' AND f.slug IN ('swimming-pool', 'parking', 'garden', 'security', 'air-conditioning', 'generator')
ON CONFLICT DO NOTHING;

INSERT INTO public.property_feature_links (property_id, feature_id)
SELECT p.id, f.id FROM public.properties p, public.property_features f
WHERE p.slug = 'five-bedroom-family-house-kagarama' AND f.slug IN ('parking', 'garden', 'security')
ON CONFLICT DO NOTHING;

INSERT INTO public.property_feature_links (property_id, feature_id)
SELECT p.id, f.id FROM public.properties p, public.property_features f
WHERE p.slug = 'three-bedroom-townhouse-nyandungu' AND f.slug IN ('parking', 'security')
ON CONFLICT DO NOTHING;

-- ============ DEVELOPMENTS ============
INSERT INTO public.developments (name, slug, developer, description, main_image_path, location_id, status, starting_price, currency, completion_date, amenities, is_featured, published_at) VALUES
(
  'The Heights at Kimihurura',
  'the-heights-at-kimihurura',
  'Estate Developments Ltd',
  'A premium residential development of 48 apartments in the heart of Kimihurura. Units range from one to three bedrooms, all with modern finishes and access to shared amenities including a pool, gym, and landscaped gardens.',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
  (SELECT id FROM public.locations WHERE neighborhood='Kimihurura' LIMIT 1),
  'published', 180000, 'USD', '2025-12-01',
  ARRAY['Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Backup Generator'],
  true, now()
)
ON CONFLICT (slug) DO NOTHING;

-- ============ DEVELOPMENT UNITS ============
INSERT INTO public.development_units (development_id, unit_number, unit_type, bedrooms, bathrooms, area, price, availability, floor) VALUES
((SELECT id FROM public.developments WHERE slug='the-heights-at-kimihurura'), 'A-101', '1 Bedroom', 1, 1, 65, 180000, 'available', 1),
((SELECT id FROM public.developments WHERE slug='the-heights-at-kimihurura'), 'A-201', '2 Bedroom', 2, 2, 95, 260000, 'available', 2),
((SELECT id FROM public.developments WHERE slug='the-heights-at-kimihurura'), 'A-301', '3 Bedroom Penthouse', 3, 3, 145, 420000, 'reserved', 3),
((SELECT id FROM public.developments WHERE slug='the-heights-at-kimihurura'), 'B-102', '1 Bedroom', 1, 1, 65, 185000, 'sold', 1)
ON CONFLICT DO NOTHING;

-- ============ ARTICLE CATEGORIES ============
INSERT INTO public.article_categories (name, slug, description) VALUES
('Market Insights', 'market-insights', 'Analysis and trends in the real estate market'),
('Buying Guide', 'buying-guide', 'Tips and advice for property buyers'),
('Selling Guide', 'selling-guide', 'Guidance for selling your property'),
('Neighborhoods', 'neighborhoods', 'Exploring areas and communities')
ON CONFLICT (name) DO NOTHING;

-- ============ ARTICLES ============
INSERT INTO public.articles (title, slug, excerpt, content, cover_image_path, category_id, author, status, meta_description, published_at) VALUES
(
  'Understanding Property Values in Kigali',
  'understanding-property-values-in-kigali',
  'A look at what drives property prices in Kigali and how to evaluate whether a listing is fairly priced.',
  'Property values in Kigali are influenced by location, land size, construction quality, and proximity to amenities. In this article, we explore the key factors that determine value and what buyers should look for when comparing properties.',
  'https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=1200',
  (SELECT id FROM public.article_categories WHERE slug='market-insights' LIMIT 1),
  'Claudine Uwase', 'published',
  'A guide to understanding what drives property prices in Kigali.',
  now()
),
(
  'First-Time Buyer Checklist',
  'first-time-buyer-checklist',
  'Everything you need to prepare before purchasing your first property in Rwanda.',
  'Buying your first property is a significant milestone. This checklist covers budgeting, financing, property viewings, legal checks, and closing the deal.',
  'https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=1200',
  (SELECT id FROM public.article_categories WHERE slug='buying-guide' LIMIT 1),
  'Eric Mugisha', 'published',
  'A practical checklist for first-time property buyers in Rwanda.',
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- ============ SITE CONTENT ============
INSERT INTO public.site_content (section, content) VALUES
('hero', jsonb_build_object(
  'title', 'Find a place worth coming home to.',
  'subtitle', 'Homes, land and properties selected with care.',
  'image', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'cta_buy_label', 'Buy',
  'cta_rent_label', 'Rent'
)),
('about', jsonb_build_object(
  'title', 'A different kind of property company.',
  'body', 'We believe finding a home should feel considered, not transactional. Our team works closely with each client to understand what they truly need, whether it is a family home, an investment plot, or a commercial space.',
  'image', 'https://images.pexels.com/photos/2029661/pexels-photo-2029661.jpeg?auto=compress&cs=tinysrgb&w=1200'
)),
('why_choose_us', jsonb_build_object(
  'title', 'Why work with us',
  'items', jsonb_build_array(
    jsonb_build_object('title', 'Curated listings', 'description', 'Every property is visited and verified before it reaches our listings.'),
    jsonb_build_object('title', 'Local expertise', 'description', 'Our consultants know Kigali and its neighborhoods inside out.'),
    jsonb_build_object('title', 'Transparent process', 'description', 'Clear information, honest advice, and no hidden fees.'),
    jsonb_build_object('title', 'Full support', 'description', 'From first viewing to closing, we are with you at every step.')
  )
)),
('cta', jsonb_build_object(
  'title', 'Ready to find your next property?',
  'subtitle', 'Tell us what you are looking for and we will match you with the right options.',
  'button_label', 'Get in touch',
  'button_link', '/contact'
))
ON CONFLICT (section) DO NOTHING;

-- ============ SITE SETTINGS ============
INSERT INTO public.site_settings (key, value) VALUES
('company_name', 'Pillarstone'),
('company_email', 'hello@estate.rw'),
('company_phone', '+250 788 100 100'),
('company_address', 'KG 11 Avenue, Kimihurura, Kigali, Rwanda'),
('facebook_url', 'https://facebook.com'),
('twitter_url', 'https://twitter.com'),
('linkedin_url', 'https://linkedin.com'),
('instagram_url', 'https://instagram.com'),
('seo_default_title', 'Pillarstone - Find a place worth coming home to'),
('seo_default_description', 'Homes, land and properties selected with care in Kigali, Rwanda.'),
('footer_text', 'Pillarstone helps people find homes, land, and commercial properties with a more considered approach to real estate.')
ON CONFLICT (key) DO NOTHING;

-- ========== supabase\migrations\20260826145443_0003_storage_buckets.sql ==========
/*
# Storage Buckets and Policies

## Overview
Creates storage buckets for property images, development images, article images, and site assets.
Sets up public read access and admin-only write access.

## Buckets
1. property-images — property photos
2. development-images — development photos
3. article-images — article cover images
4. site-assets — homepage/company images

## Policies
- Public can read all buckets
- Authenticated admin/editor can upload/update/delete
*/

INSERT INTO storage.buckets (id, name, public) VALUES
('property-images', 'property-images', true),
('development-images', 'development-images', true),
('article-images', 'article-images', true),
('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Property images policies
DROP POLICY IF EXISTS "property_images_read_public" ON storage.objects;
CREATE POLICY "property_images_read_public" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "property_images_write_admin" ON storage.objects;
CREATE POLICY "property_images_write_admin" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'property-images' AND public.is_admin());

-- Development images policies
DROP POLICY IF EXISTS "development_images_read_public" ON storage.objects;
CREATE POLICY "development_images_read_public" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'development-images');

DROP POLICY IF EXISTS "development_images_write_admin" ON storage.objects;
CREATE POLICY "development_images_write_admin" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'development-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'development-images' AND public.is_admin());

-- Article images policies
DROP POLICY IF EXISTS "article_images_read_public" ON storage.objects;
CREATE POLICY "article_images_read_public" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "article_images_write_admin" ON storage.objects;
CREATE POLICY "article_images_write_admin" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'article-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'article-images' AND public.is_admin());

-- Site assets policies
DROP POLICY IF EXISTS "site_assets_read_public" ON storage.objects;
CREATE POLICY "site_assets_read_public" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "site_assets_write_admin" ON storage.objects;
CREATE POLICY "site_assets_write_admin" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

-- ========== supabase\migrations\20260827052011_0004_add_whatsapp_to_properties.sql ==========
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- ========== supabase\migrations\20260828031720_0005_add_whatsapp_inquiry_columns.sql ==========
/*
# Add WhatsApp inquiry columns to inquiries table

1. Modified Tables
- `inquiries`
  - `user_id` (uuid, nullable) — references auth.users, links inquiry to logged-in user
  - `channel` (text, default 'form') — how the inquiry was initiated ('form' or 'whatsapp')
  - `generated_message` (text, nullable) — the pre-filled WhatsApp message text
  - `property_reference` (text, nullable) — the property reference number at time of inquiry

2. Security
- No RLS policy changes needed — existing `inquiries_insert_public` policy already allows
  anon + authenticated inserts with `WITH CHECK (true)`, which is correct for a public contact form.
- The new columns are all nullable so existing rows are unaffected.

3. Notes
- `user_id` is nullable because visitors may not be logged in when they click the WhatsApp button.
- `channel` defaults to 'form' so existing inquiries (created via the contact form) are unaffected.
- `property_reference` captures the reference at inquiry time in case the property is later deleted.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'channel'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN channel text NOT NULL DEFAULT 'form' CHECK (channel IN ('form', 'whatsapp'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'generated_message'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN generated_message text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inquiries' AND column_name = 'property_reference'
  ) THEN
    ALTER TABLE public.inquiries ADD COLUMN property_reference text;
  END IF;
END $$;

-- ========== supabase\migrations\20260829063959_0006_security_fixes.sql ==========
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

-- ========== supabase\migrations\20260831120000_0007_profile_on_signup.sql ==========
-- Auto-create a public.profiles row when someone signs up in Auth.
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
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- After you create your first Auth user, run this in SQL Editor (change the email):
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
