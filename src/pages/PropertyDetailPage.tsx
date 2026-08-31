import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Bed, Bath, Maximize, MapPin, Share2, Check, ArrowLeft, X, Phone, Mail, Calendar, Ruler, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPropertyBySlug, getSimilarProperties, submitInquiry, submitWhatsAppInquiry, getSiteSettings } from '../lib/data'
import { useToast } from '../components/Toast'
import FavoriteButton from '../components/FavoriteButton'
import PropertyCard from '../components/PropertyCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import type { Property } from '../lib/types'
import { formatPrice, getLocationString, formatDate } from '../lib/utils'

export default function PropertyDetailPage() {
  const { slug } = useParams()
  const { toast } = useToast()
  const [property, setProperty] = useState<Property | null>(null)
  const [similar, setSimilar] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [whatsappInquiring, setWhatsappInquiring] = useState(false)
  const [siteWhatsapp, setSiteWhatsapp] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getPropertyBySlug(slug).then(p => {
      setProperty(p)
      if (p) getSimilarProperties(p, 3).then(setSimilar).catch(() => {})
    }).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    getSiteSettings().then(settings => {
      setSiteWhatsapp(settings.whatsapp_number ?? '')
    }).catch(() => {})
  }, [])

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast('Link copied to clipboard.', 'success')
    }
  }

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    const { error } = await submitInquiry({
      ...form,
      property_id: property?.id,
    })
    setSubmitting(false)
    if (error) {
      toast('Could not submit inquiry. Please try again.', 'error')
    } else {
      toast('Inquiry submitted successfully. We will contact you soon.', 'success')
      setForm({ name: '', email: '', phone: '', message: '' })
    }
  }

  async function handleWhatsAppInquiry() {
    if (!property) return
    setWhatsappInquiring(true)

    const message = buildWhatsAppMessage(property)
    const { error } = await submitWhatsAppInquiry({
      property_id: property.id,
      name: form.name || undefined,
      phone: form.phone || undefined,
      generated_message: message,
      property_reference: property.reference_number ?? undefined,
    })

    setWhatsappInquiring(false)

    if (error) {
      toast('Could not create inquiry record, but opening WhatsApp anyway.', 'error')
    }

    const number = resolveWhatsappNumber(property, siteWhatsapp)
    if (!number) {
      toast('No WhatsApp number is configured for this property or the site.', 'error')
      return
    }

    const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-site container-px py-10">
          <LoadingSkeleton count={1} />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="pt-20">
        <EmptyState
          title="Property not found"
          description="This property may have been removed or is no longer available."
          action={{ label: 'Browse properties', href: '/properties' }}
        />
      </div>
    )
  }

  const images = property.property_images?.sort((a, b) => a.sort_order - b.sort_order) ?? []
  const features = (property as any).property_feature_links?.map((l: any) => l.property_features?.name).filter(Boolean) ?? property.features ?? []
  const location = getLocationString(property)
  const isForRent = property.listing_type === 'rent'
  const hasWhatsapp = !!resolveWhatsappNumber(property, siteWhatsapp)

  return (
    <div className="pt-20">
      {/* Breadcrumb */}
      <div className="max-w-site container-px py-4">
        <Link to="/properties" className="flex items-center gap-2 text-sm text-stone-500 hover:text-ink-900 transition-colors">
          <ArrowLeft size={16} /> Back to properties
        </Link>
      </div>

      {/* Gallery */}
      <div className="max-w-site container-px">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 mb-8">
          <div className="aspect-[16/10] overflow-hidden bg-stone-100 cursor-pointer" onClick={() => { setGalleryIndex(0); setGalleryOpen(true) }}>
            {images[0] && <img src={images[0].image_path} alt={property.title} className="w-full h-full object-cover" />}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((img, i) => (
              <div
                key={img.id}
                className="aspect-square overflow-hidden bg-stone-100 cursor-pointer relative"
                onClick={() => { setGalleryIndex(i + 1); setGalleryOpen(true) }}
              >
                <img src={img.image_path} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" />
                {i === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-ink-950/60 flex items-center justify-center text-warm-white text-sm">
                    +{images.length - 5} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen gallery */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[100] bg-ink-950 flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
          <button type="button" className="absolute top-4 right-4 text-warm-white" onClick={() => setGalleryOpen(false)} aria-label="Close gallery">
            <X size={24} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-ink-950/70 text-warm-white"
                onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => (i - 1 + images.length) % images.length) }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={22} className="mx-auto" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-ink-950/70 text-warm-white"
                onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => (i + 1) % images.length) }}
                aria-label="Next photo"
              >
                <ChevronRight size={22} className="mx-auto" />
              </button>
            </>
          )}
          <div className="max-w-5xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img src={images[galleryIndex]?.image_path} alt={property.title} className="w-full max-h-[80vh] object-contain" />
            <p className="text-center text-stone-400 text-sm mt-3">{galleryIndex + 1} / {images.length}</p>
            <div className="flex justify-center gap-2 mt-4 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setGalleryIndex(i)}
                  className={`w-16 h-16 shrink-0 overflow-hidden border-2 ${i === galleryIndex ? 'border-warm-white' : 'border-transparent'}`}
                >
                  <img src={img.image_path} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-site container-px pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          <div>
            {/* Title section */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-ink-900 text-warm-white text-xs tracking-wide">
                    {isForRent ? 'For Rent' : 'For Sale'}
                  </span>
                  <span className="text-sm text-stone-500">{property.property_types?.name}</span>
                  {property.reference_number && <span className="text-sm text-stone-400">Ref: {property.reference_number}</span>}
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-ink-900 mb-2">{property.title}</h1>
                {location && (
                  <p className="flex items-center gap-1 text-stone-500"><MapPin size={16} /> {location}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton propertyId={property.id} variant="detail" />
                <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center border border-stone-300 hover:bg-stone-100 transition-colors" aria-label="Share">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-stone-200 mb-8">
              {property.bedrooms !== null && (
                <Spec icon={<Bed size={20} />} label="Bedrooms" value={property.bedrooms} />
              )}
              {property.bathrooms !== null && (
                <Spec icon={<Bath size={20} />} label="Bathrooms" value={property.bathrooms} />
              )}
              {property.area !== null && (
                <Spec icon={<Maximize size={20} />} label="Area" value={`${property.area} m²`} />
              )}
              {property.land_area !== null && (
                <Spec icon={<Ruler size={20} />} label="Land" value={`${property.land_area} m²`} />
              )}
            </div>

            {/* Price */}
            <p className="font-display text-3xl text-ink-900 mb-8">
              {formatPrice(property.price, property.currency)}
              {isForRent && <span className="text-base text-stone-500 font-sans"> /month</span>}
            </p>

            {/* Description */}
            {property.description && (
              <div className="mb-8">
                <h2 className="font-display text-xl text-ink-900 mb-4">Description</h2>
                <p className="text-ink-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-xl text-ink-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-ink-600">
                      <Check size={16} className="text-accent" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property details */}
            <div className="mb-8">
              <h2 className="font-display text-xl text-ink-900 mb-4">Property Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                <DetailRow label="Property Type" value={property.property_types?.name} />
                <DetailRow label="Listing Type" value={isForRent ? 'For Rent' : 'For Sale'} />
                <DetailRow label="Status" value={property.status.charAt(0).toUpperCase() + property.status.slice(1)} />
                <DetailRow label="Reference" value={property.reference_number} />
                {property.year_built && <DetailRow label="Year Built" value={String(property.year_built)} />}
                {property.latitude && property.longitude && (
                  <DetailRow label="Coordinates" value={`${property.latitude.toFixed(4)}, ${property.longitude.toFixed(4)}`} />
                )}
                <DetailRow label="Published" value={formatDate(property.published_at)} />
              </dl>
            </div>

            {/* Map placeholder */}
            {property.latitude && property.longitude && (
              <div className="mb-8">
                <h2 className="font-display text-xl text-ink-900 mb-4">Location</h2>
                <div className="aspect-[16/8] bg-stone-100 border border-stone-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={32} className="text-stone-400 mx-auto mb-2" />
                    <p className="text-sm text-stone-500">{location || 'Location on map'}</p>
                    <p className="text-xs text-stone-400 mt-1">{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* WhatsApp inquiry — prominent */}
            {hasWhatsapp && (
              <div className="bg-warm-white border border-stone-200 p-6 mb-6">
                <h3 className="font-display text-lg text-ink-900 mb-2">Interested in this property?</h3>
                <p className="text-sm text-stone-500 mb-4">Contact us directly on WhatsApp for a quick response.</p>
                <button
                  onClick={handleWhatsAppInquiry}
                  disabled={whatsappInquiring}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white text-sm font-medium tracking-wide hover:bg-[#1da851] transition-colors disabled:opacity-50"
                >
                  <MessageCircle size={20} />
                  {whatsappInquiring ? 'Preparing...' : 'Inquire on WhatsApp'}
                </button>
                <p className="text-xs text-stone-400 mt-3 text-center">
                  Opens WhatsApp with a pre-filled message. You review and send it yourself.
                </p>
              </div>
            )}

            {/* Agent card */}
            {property.agents && (
              <div className="bg-stone-50 border border-stone-200 p-6 mb-6">
                <h3 className="font-display text-lg text-ink-900 mb-4">Contact Agent</h3>
                <div className="flex items-center gap-3 mb-4">
                  {property.agents.photo_url ? (
                    <img src={property.agents.photo_url} alt={property.agents.name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-ink-700 text-warm-white flex items-center justify-center font-display text-lg">
                      {property.agents.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-ink-900">{property.agents.name}</p>
                    {property.agents.role && <p className="text-xs text-stone-500">{property.agents.role}</p>}
                  </div>
                </div>
                {property.agents.phone && (
                  <a href={`tel:${property.agents.phone}`} className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 mb-2">
                    <Phone size={16} /> {property.agents.phone}
                  </a>
                )}
                {property.agents.email && (
                  <a href={`mailto:${property.agents.email}`} className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900">
                    <Mail size={16} /> {property.agents.email}
                  </a>
                )}
              </div>
            )}

            {/* Inquiry form */}
            <div className="bg-warm-white border border-stone-200 p-6">
              <h3 className="font-display text-lg text-ink-900 mb-4">Or send a message</h3>
              <form onSubmit={handleInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Message *</label>
                  <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700 resize-none" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </aside>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl text-ink-900 mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function resolveWhatsappNumber(property: Property, siteWhatsapp: string): string | null {
  const source = property.whatsapp_number || siteWhatsapp
  if (!source) return null
  const cleaned = source.replace(/[^0-9]/g, '')
  return cleaned || null
}

function buildWhatsAppMessage(property: Property): string {
  const location = getLocationString(property)
  const price = formatPrice(property.price, property.currency)
  const propertyUrl = typeof window !== 'undefined' ? window.location.href : ''

  return [
    'Hello, I am interested in this property.',
    '',
    `Property: ${property.title}`,
    `Reference: ${property.reference_number ?? 'N/A'}`,
    `Location: ${location || 'N/A'}`,
    `Price: ${price}`,
    '',
    'I would like to get more information about this property.',
    '',
    `Property link: ${propertyUrl}`,
  ].join('\n')
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-stone-400">{icon}</div>
      <div>
        <p className="text-xs text-stone-500">{label}</p>
        <p className="text-sm font-medium text-ink-900">{value}</p>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-2 border-b border-stone-100">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-ink-900 font-medium">{value}</dd>
    </div>
  )
}
