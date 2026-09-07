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

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id?.slice(0, 11) || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = parsed.searchParams.get('v')
      if (fromQuery) return fromQuery
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) {
        return parts[1] || null
      }
    }
  } catch {
    return null
  }
  return null
}

export function getYouTubeThumbnailUrl(url: string | null | undefined): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const id = getYouTubeVideoId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}
