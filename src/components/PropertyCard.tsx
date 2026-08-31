import { Link } from 'react-router-dom'
import { Bed, Bath, Maximize, MapPin } from 'lucide-react'
import type { Property } from '../lib/types'
import { formatPrice, getLocationString } from '../lib/utils'
import { getPropertyPrimaryImage } from '../lib/data'
import FavoriteButton from './FavoriteButton'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const image = getPropertyPrimaryImage(property)
  const location = getLocationString(property)
  const isForRent = property.listing_type === 'rent'
  const statusLabel = isForRent ? 'For Rent' : 'For Sale'

  return (
    <Link to={`/property/${property.slug}`} className="group block bg-warm-white border border-stone-200 hover:border-stone-400 hover:-translate-y-1 hover:soft-shadow transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {image ? (
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <Maximize size={32} />
          </div>
        )}
        <div className="absolute inset-0 image-wash pointer-events-none" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-ink-950/90 text-warm-white text-[10px] uppercase tracking-[0.14em]">
            {statusLabel}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <FavoriteButton propertyId={property.id} />
        </div>
        {property.is_featured && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1.5 bg-accent text-warm-white text-[10px] uppercase tracking-[0.14em]">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] tracking-[0.18em] text-stone-500 uppercase">
            {property.property_types?.name ?? 'Property'}
          </span>
          {property.reference_number && (
            <span className="text-xs text-stone-400">{property.reference_number}</span>
          )}
        </div>

        <h3 className="font-display text-lg text-ink-900 mb-2 group-hover:text-ink-700 transition-colors line-clamp-2">
          {property.title}
        </h3>

        {location && (
          <p className="flex items-center gap-1 text-[13px] text-stone-500 mb-5">
            <MapPin size={14} className="shrink-0" />
            {location}
          </p>
        )}

        <div className="flex items-center gap-4 text-[13px] text-ink-600 mb-5">
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <Bed size={16} className="text-stone-400" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <Bath size={16} className="text-stone-400" />
              {property.bathrooms}
            </span>
          )}
          {property.area !== null && (
            <span className="flex items-center gap-1">
              <Maximize size={16} className="text-stone-400" />
              {property.area} m²
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-stone-200/80">
          <p className="font-display text-xl text-ink-900">
            {formatPrice(property.price, property.currency)}
            {isForRent && <span className="text-sm text-stone-500 font-sans"> /month</span>}
          </p>
        </div>
      </div>
    </Link>
  )
}
