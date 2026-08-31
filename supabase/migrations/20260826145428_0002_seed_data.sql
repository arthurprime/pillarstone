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
('Rwanda', 'Kigali', 'Gasabo', 'Nyandungu', -1.9350, 30.1450)
ON CONFLICT DO NOTHING;

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
('company_name', 'Estate'),
('company_email', 'hello@estate.rw'),
('company_phone', '+250 788 100 100'),
('company_address', 'KG 11 Avenue, Kimihurura, Kigali, Rwanda'),
('facebook_url', 'https://facebook.com'),
('twitter_url', 'https://twitter.com'),
('linkedin_url', 'https://linkedin.com'),
('instagram_url', 'https://instagram.com'),
('seo_default_title', 'Estate — Find a place worth coming home to'),
('seo_default_description', 'Homes, land and properties selected with care in Kigali, Rwanda.'),
('footer_text', 'Estate is a real estate platform helping people find homes, land, and commercial properties across Rwanda.')
ON CONFLICT (key) DO NOTHING;
