import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  || 'https://cfbbuzacgezdmejjsetc.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYmJ1emFjZ2V6ZG1lampzZXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzk5NzQsImV4cCI6MjEwMzc1NTk3NH0.2CKWdIBaKwuzI_AL5NHFmgtIPwkT_9cNexp7SzMByp8'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images',
  DEVELOPMENT_IMAGES: 'development-images',
  ARTICLE_IMAGES: 'article-images',
  SITE_ASSETS: 'site-assets',
} as const

export function getPublicImageUrl(bucket: string, path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
