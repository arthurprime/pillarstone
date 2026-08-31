import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/** Dummy URL used only so the module can load if env vars were not set at build time. */
const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'public-anon-key'

export const supabase: SupabaseClient = createClient(
  supabaseUrl || FALLBACK_URL,
  supabaseAnonKey || FALLBACK_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  DEVELOPMENT_IMAGES: 'development-images',
  ARTICLE_IMAGES: 'article-images',
  SITE_ASSETS: 'site-assets',
} as const

export function getPublicImageUrl(bucket: string, path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = supabaseUrl || FALLBACK_URL
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}
