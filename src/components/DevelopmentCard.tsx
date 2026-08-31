import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { Development } from '../lib/types'
import { formatPrice } from '../lib/utils'

interface DevelopmentCardProps {
  development: Development
}

export default function DevelopmentCard({ development }: DevelopmentCardProps) {
  const image = development.main_image_path
  const location = development.locations
    ? [development.locations.neighborhood, development.locations.city].filter(Boolean).join(', ')
    : ''

  return (
    <Link to={`/development/${development.slug}`} className="group block bg-warm-white border border-stone-200 hover:border-stone-400 hover:-translate-y-1 hover:soft-shadow transition-all duration-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <div className="absolute inset-0 image-wash pointer-events-none z-10" />
        {image ? (
          <img
            src={image}
            alt={development.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-stone-200" />
        )}
        {development.is_featured && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1.5 bg-accent text-warm-white text-[10px] uppercase tracking-[0.14em]">Featured</span>
          </div>
        )}
      </div>

      <div className="p-7">
        <h3 className="font-display text-xl text-ink-900 mb-2 group-hover:text-ink-700 transition-colors">
          {development.name}
        </h3>
        {location && (
          <p className="flex items-center gap-1 text-sm text-stone-500 mb-3">
            <MapPin size={14} /> {location}
          </p>
        )}
        {development.description && (
          <p className="text-sm text-ink-500 line-clamp-2 mb-4">{development.description}</p>
        )}
        {development.starting_price !== null && (
          <p className="text-sm text-stone-500">
            From <span className="font-display text-lg text-ink-900">{formatPrice(development.starting_price, development.currency)}</span>
          </p>
        )}
      </div>
    </Link>
  )
}
