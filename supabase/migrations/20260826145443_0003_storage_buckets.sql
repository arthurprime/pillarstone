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
