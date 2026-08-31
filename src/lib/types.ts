export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'user' | 'admin' | 'editor' | 'agent'
  created_at: string
  updated_at: string
}

export interface PropertyType {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface PropertyFeature {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface PropertyFeatureLink {
  property_id: string
  feature_id: string
}

export interface Location {
  id: string
  country: string
  city: string
  district: string | null
  neighborhood: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  name: string
  photo_url: string | null
  email: string | null
  phone: string | null
  bio: string | null
  role: string | null
  facebook_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  image_path: string
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface Property {
  id: string
  title: string
  slug: string
  description: string | null
  property_type_id: string | null
  listing_type: 'sale' | 'rent'
  status: 'draft' | 'published' | 'archived' | 'sold' | 'rented' | 'pending'
  price: number
  currency: string
  location_id: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  land_area: number | null
  year_built: number | null
  features: string[] | null
  amenities: string[] | null
  reference_number: string | null
  latitude: number | null
  longitude: number | null
  agent_id: string | null
  whatsapp_number: string | null
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  property_types?: PropertyType
  locations?: Location
  agents?: Agent
  property_images?: PropertyImage[]
}

export interface Development {
  id: string
  name: string
  slug: string
  developer: string | null
  description: string | null
  main_image_path: string | null
  location_id: string | null
  status: 'draft' | 'published' | 'archived'
  starting_price: number | null
  currency: string
  completion_date: string | null
  amenities: string[] | null
  latitude: number | null
  longitude: number | null
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  locations?: Location
  development_images?: DevelopmentImage[]
  development_units?: DevelopmentUnit[]
}

export interface DevelopmentImage {
  id: string
  development_id: string
  image_path: string
  sort_order: number
  created_at: string
}

export interface DevelopmentUnit {
  id: string
  development_id: string
  unit_number: string
  unit_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  price: number | null
  availability: 'available' | 'reserved' | 'sold'
  floor: number | null
  image_path: string | null
  created_at: string
  updated_at: string
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_path: string | null
  category_id: string | null
  author: string | null
  status: 'draft' | 'published' | 'archived'
  meta_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  article_categories?: ArticleCategory
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  property_id: string | null
  user_id: string | null
  channel: 'form' | 'whatsapp'
  generated_message: string | null
  property_reference: string | null
  status: 'new' | 'contacted' | 'in_progress' | 'closed'
  created_at: string
  updated_at: string
  properties?: Property
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at: string
  properties?: Property
}

export interface SellRequest {
  id: string
  name: string
  email: string
  phone: string | null
  property_type: string | null
  location: string | null
  estimated_price: number | null
  description: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  land_area: number | null
  additional_message: string | null
  status: 'new' | 'reviewed' | 'contacted' | 'closed'
  created_at: string
  updated_at: string
}

export interface SiteContent {
  id: string
  section: string
  content: Record<string, any>
  updated_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface PropertySearchParams {
  listing?: string
  type?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  minLandArea?: number
  sort?: string
  page?: number
  pageSize?: number
}
