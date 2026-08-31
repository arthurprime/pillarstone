import { supabase, STORAGE_BUCKETS, getPublicImageUrl } from './supabase'
import type {
  Property, PropertyType, PropertyFeature, Location, Agent,
  PropertyImage, Development, DevelopmentUnit, Article, ArticleCategory,
  Inquiry, Favorite, SellRequest, SiteContent, SiteSetting,
  PropertySearchParams,
} from './types'

// ============ PROPERTIES ============

export async function getProperties(params: PropertySearchParams = {}): Promise<{ data: Property[]; total: number }> {
  const {
    listing, type, location, minPrice, maxPrice,
    bedrooms, bathrooms, minArea, minLandArea,
    sort = 'newest', page = 1, pageSize = 12,
  } = params

  let query = supabase
    .from('properties')
    .select(`
      *,
      property_types (*),
      locations (*),
      agents (*),
      property_images (*)
    `, { count: 'exact' })
    .eq('status', 'published')

  if (listing && listing !== 'all') query = query.eq('listing_type', listing)
  if (type && type !== 'all') query = query.eq('property_types.slug', type)
  if (location) query = query.or(`locations.city.ilike.%${location}%,locations.district.ilike.%${location}%,locations.neighborhood.ilike.%${location}%`)
  if (minPrice !== undefined) query = query.gte('price', minPrice)
  if (maxPrice !== undefined) query = query.lte('price', maxPrice)
  if (bedrooms !== undefined) query = query.gte('bedrooms', bedrooms)
  if (bathrooms !== undefined) query = query.gte('bathrooms', bathrooms)
  if (minArea !== undefined) query = query.gte('area', minArea)
  if (minLandArea !== undefined) query = query.gte('land_area', minLandArea)

  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'area_desc': query = query.order('area', { ascending: false }); break
    case 'featured': query = query.order('is_featured', { ascending: false }).order('published_at', { ascending: false }); break
    default: query = query.order('published_at', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data as Property[]) ?? [], total: count ?? 0 }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_types (*),
      locations (*),
      agents (*),
      property_images (*),
      property_feature_links (property_features (*))
    `)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as Property | null
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_types (*),
      locations (*),
      property_images (*)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as Property[]) ?? []
}

export async function getLatestProperties(limit = 6): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_types (*),
      locations (*),
      property_images (*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as Property[]) ?? []
}

export async function getSimilarProperties(property: Property, limit = 3): Promise<Property[]> {
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_types (*),
      locations (*),
      property_images (*)
    `)
    .eq('status', 'published')
    .neq('id', property.id)
    .limit(limit)

  if (property.property_type_id) {
    query = query.eq('property_type_id', property.property_type_id)
  } else {
    query = query.eq('listing_type', property.listing_type)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as Property[]) ?? []
}

// ============ PROPERTY TYPES ============

export async function getPropertyTypes(): Promise<PropertyType[]> {
  const { data, error } = await supabase
    .from('property_types')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ============ PROPERTY FEATURES ============

export async function getPropertyFeatures(): Promise<PropertyFeature[]> {
  const { data, error } = await supabase
    .from('property_features')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ============ LOCATIONS ============

export async function getLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('city', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ============ AGENTS ============

export async function getAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ============ DEVELOPMENTS ============

export async function getDevelopments(): Promise<Development[]> {
  const { data, error } = await supabase
    .from('developments')
    .select(`
      *,
      locations (*),
      development_images (*),
      development_units (*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data as Development[]) ?? []
}

export async function getDevelopmentBySlug(slug: string): Promise<Development | null> {
  const { data, error } = await supabase
    .from('developments')
    .select(`
      *,
      locations (*),
      development_images (*),
      development_units (*)
    `)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as Development | null
}

export async function getFeaturedDevelopment(): Promise<Development | null> {
  const { data, error } = await supabase
    .from('developments')
    .select(`
      *,
      locations (*),
      development_images (*)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as Development | null
}

// ============ ARTICLES ============

export async function getArticles(limit?: number): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(`
      *,
      article_categories (*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return (data as Article[]) ?? []
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      article_categories (*)
    `)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as Article | null
}

export async function getArticleCategories(): Promise<ArticleCategory[]> {
  const { data, error } = await supabase
    .from('article_categories')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ============ INQUIRIES ============

export async function submitInquiry(inquiry: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  property_id?: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('inquiries').insert(inquiry)
  return { error: error?.message ?? null }
}

export async function submitWhatsAppInquiry(inquiry: {
  property_id: string
  user_id?: string
  name?: string
  phone?: string
  generated_message: string
  property_reference?: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('inquiries').insert({
    name: inquiry.name || 'WhatsApp Inquiry',
    email: 'whatsapp@inquiry.local',
    phone: inquiry.phone ?? null,
    message: inquiry.generated_message,
    property_id: inquiry.property_id,
    user_id: inquiry.user_id ?? null,
    channel: 'whatsapp',
    generated_message: inquiry.generated_message,
    property_reference: inquiry.property_reference ?? null,
    status: 'new',
  })
  return { error: error?.message ?? null }
}

// ============ FAVORITES ============

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      properties (
        *,
        property_types (*),
        locations (*),
        property_images (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Favorite[]) ?? []
}

export async function isFavorited(userId: string, propertyId: string): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle()
  return !!data
}

export async function saveFavorite(userId: string, propertyId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, property_id: propertyId })
  return { error: error?.message ?? null }
}

export async function removeFavorite(userId: string, propertyId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId)
  return { error: error?.message ?? null }
}

// ============ SELL REQUESTS ============

export async function submitSellRequest(req: {
  name: string
  email: string
  phone?: string
  property_type?: string
  location?: string
  estimated_price?: number
  description?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  land_area?: number
  additional_message?: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('sell_requests').insert(req)
  return { error: error?.message ?? null }
}

// ============ SITE CONTENT ============

export async function getSiteContent(section: string): Promise<Record<string, any> | null> {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('section', section)
    .maybeSingle()
  if (error) throw error
  return (data as any)?.content ?? null
}

export async function getAllSiteContent(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('site_content')
    .select('section, content')
  if (error) throw error
  const result: Record<string, any> = {}
  for (const item of data ?? []) {
    result[item.section] = item.content
  }
  return result
}

// ============ SITE SETTINGS ============

export async function getSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
  if (error) throw error
  const result: Record<string, string> = {}
  for (const item of data ?? []) {
    result[item.key] = item.value
  }
  return result
}

// ============ IMAGE HELPERS ============

export function getPropertyPrimaryImage(property: Property): string {
  if (property.property_images && property.property_images.length > 0) {
    const primary = property.property_images.find(img => img.is_primary)
    const first = primary ?? property.property_images[0]
    return first.image_path
  }
  return ''
}

export { STORAGE_BUCKETS, getPublicImageUrl }
