import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, ArrowLeft, Check, Calendar, Maximize, Bed, Bath } from 'lucide-react'
import { getDevelopmentBySlug } from '../lib/data'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { formatPrice } from '../lib/utils'
import type { Development } from '../lib/types'

export default function DevelopmentDetailPage() {
  const { slug } = useParams()
  const [dev, setDev] = useState<Development | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    getDevelopmentBySlug(slug).then(setDev).finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <div className="pt-20"><div className="max-w-site container-px py-10"><LoadingSkeleton count={1} /></div></div>
  }

  if (!dev) {
    return <div className="pt-20"><EmptyState title="Development not found" action={{ label: 'Browse developments', href: '/developments' }} /></div>
  }

  const images = dev.development_images?.sort((a, b) => a.sort_order - b.sort_order) ?? []
  const units = dev.development_units ?? []
  const location = dev.locations ? [dev.locations.neighborhood, dev.locations.city].filter(Boolean).join(', ') : ''

  return (
    <div className="pt-20">
      <div className="max-w-site container-px py-4">
        <Link to="/developments" className="flex items-center gap-2 text-sm text-stone-500 hover:text-ink-900 transition-colors">
          <ArrowLeft size={16} /> Back to developments
        </Link>
      </div>

      {/* Hero image */}
      <div className="max-w-site container-px">
        <div className="aspect-[21/9] overflow-hidden bg-stone-100 mb-8">
          {dev.main_image_path && <img src={dev.main_image_path} alt={dev.name} className="w-full h-full object-cover" />}
        </div>
      </div>

      <div className="max-w-site container-px pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-accent text-warm-white text-xs tracking-wide">Development</span>
              {dev.is_featured && <span className="text-sm text-stone-500">Featured</span>}
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-ink-900 mb-2">{dev.name}</h1>
            {dev.developer && <p className="text-stone-500 mb-2">By {dev.developer}</p>}
            {location && <p className="flex items-center gap-1 text-stone-500 mb-6"><MapPin size={16} /> {location}</p>}

            {dev.starting_price !== null && (
              <p className="font-display text-2xl text-ink-900 mb-8">
                From {formatPrice(dev.starting_price, dev.currency)}
              </p>
            )}

            {dev.description && (
              <div className="mb-8">
                <h2 className="font-display text-xl text-ink-900 mb-4">About this development</h2>
                <p className="text-ink-600 leading-relaxed whitespace-pre-line">{dev.description}</p>
              </div>
            )}

            {dev.amenities && dev.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-xl text-ink-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dev.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-ink-600"><Check size={16} className="text-accent" /> {a}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {images.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-xl text-ink-900 mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map(img => (
                    <div key={img.id} className="aspect-square overflow-hidden bg-stone-100">
                      <img src={img.image_path} alt={dev.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Units */}
            {units.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-xl text-ink-900 mb-4">Available Units</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-300 text-left text-stone-500">
                        <th className="py-3 pr-4">Unit</th>
                        <th className="py-3 pr-4">Type</th>
                        <th className="py-3 pr-4">Beds</th>
                        <th className="py-3 pr-4">Baths</th>
                        <th className="py-3 pr-4">Area</th>
                        <th className="py-3 pr-4">Floor</th>
                        <th className="py-3 pr-4">Price</th>
                        <th className="py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map(u => (
                        <tr key={u.id} className="border-b border-stone-100">
                          <td className="py-3 pr-4 font-medium text-ink-900">{u.unit_number}</td>
                          <td className="py-3 pr-4 text-ink-600">{u.unit_type ?? '-'}</td>
                          <td className="py-3 pr-4 text-ink-600">{u.bedrooms ?? '-'}</td>
                          <td className="py-3 pr-4 text-ink-600">{u.bathrooms ?? '-'}</td>
                          <td className="py-3 pr-4 text-ink-600">{u.area ? `${u.area} m²` : '-'}</td>
                          <td className="py-3 pr-4 text-ink-600">{u.floor ?? '-'}</td>
                          <td className="py-3 pr-4 text-ink-900 font-medium">{u.price ? formatPrice(u.price, dev.currency) : '-'}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 ${u.availability === 'available' ? 'bg-green-100 text-green-700' : u.availability === 'reserved' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {u.availability}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="bg-stone-50 border border-stone-200 p-6 mb-6">
              <h3 className="font-display text-lg text-ink-900 mb-4">Development Details</h3>
              <dl className="space-y-3 text-sm">
                {dev.developer && <div className="flex justify-between"><dt className="text-stone-500">Developer</dt><dd className="text-ink-900">{dev.developer}</dd></div>}
                {dev.completion_date && <div className="flex justify-between"><dt className="text-stone-500">Completion</dt><dd className="text-ink-900">{new Date(dev.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</dd></div>}
                {dev.starting_price !== null && <div className="flex justify-between"><dt className="text-stone-500">Starting Price</dt><dd className="text-ink-900 font-medium">{formatPrice(dev.starting_price, dev.currency)}</dd></div>}
                {units.length > 0 && <div className="flex justify-between"><dt className="text-stone-500">Total Units</dt><dd className="text-ink-900">{units.length}</dd></div>}
              </dl>
            </div>
            <div className="bg-ink-950 text-warm-white p-6">
              <h3 className="font-display text-lg mb-2">Interested in this development?</h3>
              <p className="text-sm text-stone-300 mb-4">Contact us to learn more about available units and pricing.</p>
              <Link to="/contact" className="inline-block px-6 py-3 bg-warm-white text-ink-900 text-sm tracking-wide hover:bg-stone-100 transition-colors">
                Get in touch
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
