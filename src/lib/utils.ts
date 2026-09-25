export function formatPrice(price: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', RWF: 'RWF ', EUR: '€' }
  const symbol = symbols[currency] ?? currency + ' '
  if (currency === 'RWF') {
    return `${symbol}${Math.round(price).toLocaleString()}`
  }
  return `${symbol}${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function formatPriceShort(price: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = { USD: '$', RWF: 'RWF ', EUR: '€' }
  const symbol = symbols[currency] ?? currency + ' '
  if (price >= 1000000) return `${symbol}${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `${symbol}${(price / 1000).toFixed(0)}K`
  return `${symbol}${price}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function getLocationString(property: any): string {
  const loc = property.locations
  if (!loc) return ''
  const parts = [loc.neighborhood, loc.district, loc.city].filter(Boolean)
  return parts.join(', ')
}

function normalizeYouTubeId(value: string | null | undefined): string | null {
  if (!value) return null
  const id = value.replace(/[^a-zA-Z0-9_-].*$/, '').slice(0, 11)
  return /^[\w-]{11}$/.test(id) ? id : null
}

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null
  let trimmed = url.trim().replace(/^<|>$/g, '').replace(/^['"]|['"]$/g, '')
  if (trimmed.startsWith('__yt__:')) trimmed = trimmed.slice('__yt__:'.length).trim()
  if (!trimmed) return null
  const direct = normalizeYouTubeId(trimmed)
  if (direct && !trimmed.includes('/') && !trimmed.includes('=')) return direct

  const candidates = [trimmed]
  if (!/^https?:\/\//i.test(trimmed)) {
    candidates.push(`https://${trimmed.replace(/^\/\//, '')}`)
  }

  for (const raw of candidates) {
    try {
      const parsed = new URL(raw)
      const host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '')
      if (host === 'youtu.be') {
        const id = normalizeYouTubeId(parsed.pathname.split('/').filter(Boolean)[0])
        if (id) return id
      }
      if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
        const fromQuery = normalizeYouTubeId(parsed.searchParams.get('v'))
        if (fromQuery) return fromQuery
        const parts = parsed.pathname.split('/').filter(Boolean)
        if (parts[0] === 'watch') {
          const id = normalizeYouTubeId(parts[1])
          if (id) return id
        }
        if (['embed', 'shorts', 'live', 'v', 'e'].includes(parts[0])) {
          const id = normalizeYouTubeId(parts[1])
          if (id) return id
        }
      }
    } catch {
      continue
    }
  }

  return normalizeYouTubeId(trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/)?.[1])
}

export function getYouTubeThumbnailUrl(url: string | null | undefined): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export function getYouTubeWatchUrl(url: string | null | undefined): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://www.youtube.com/watch?v=${id}` : null
}

export function getYouTubeEmbedUrl(
  url: string | null | undefined,
  options: { autoplay?: boolean } = {},
): string | null {
  const id = getYouTubeVideoId(url)
  if (!id) return null
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })
  if (options.autoplay) params.set('autoplay', '1')
  if (typeof window !== 'undefined' && window.location?.origin) {
    params.set('origin', window.location.origin)
    params.set('widget_referrer', window.location.origin)
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

const YOUTUBE_AMENITY_PREFIX = '__yt__:'

export function youtubeUrlFromProperty(row: {
  youtube_url?: string | null
  amenities?: string[] | null
}): string | null {
  const direct = row.youtube_url?.trim()
  if (direct) return direct
  const encoded = (row.amenities ?? []).find((item) => item.startsWith(YOUTUBE_AMENITY_PREFIX))
  const url = encoded?.slice(YOUTUBE_AMENITY_PREFIX.length).trim()
  return url || null
}

export function amenitiesWithYoutubeUrl(
  amenities: string[] | null | undefined,
  youtubeUrl: string | null,
): string[] {
  const rest = (amenities ?? []).filter((item) => !item.startsWith(YOUTUBE_AMENITY_PREFIX))
  if (!youtubeUrl) return rest
  return [...rest, `${YOUTUBE_AMENITY_PREFIX}${youtubeUrl}`]
}

export function isMissingYoutubeUrlColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  return error.code === 'PGRST204' || error.code === '42703' || /youtube_url/i.test(error.message ?? '')
}

export function visiblePropertyFeatures(names: string[]): string[] {
  return names.filter((name) => !name.startsWith(YOUTUBE_AMENITY_PREFIX))
}
