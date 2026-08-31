import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, MapPin, Building2 } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import DevelopmentCard from '../components/DevelopmentCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import {
  getFeaturedProperties, getLatestProperties,
  getFeaturedDevelopment,
  getAllSiteContent, getSiteSettings, getPropertyTypes,
} from '../lib/data'
import type { Property, Development, PropertyType } from '../lib/types'

export default function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<Property[]>([])
  const [latest, setLatest] = useState<Property[]>([])
  const [dev, setDev] = useState<Development | null>(null)
  const [content, setContent] = useState<Record<string, any>>({})
  const [types, setTypes] = useState<PropertyType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchListing, setSearchListing] = useState('sale')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchType, setSearchType] = useState('all')

  useEffect(() => {
    Promise.all([
      getFeaturedProperties(6),
      getLatestProperties(3),
      getFeaturedDevelopment(),
      getAllSiteContent(),
      getPropertyTypes(),
    ]).then(([f, l, d, c, t]) => {
      setFeatured(f)
      setLatest(l)
      setDev(d)
      setContent(c)
      setTypes(t)
    }).catch((err) => {
      console.error(err)
    }).finally(() => setLoading(false))
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchListing) params.set('listing', searchListing)
    if (searchLocation) params.set('location', searchLocation)
    if (searchType !== 'all') params.set('type', searchType)
    navigate(`/properties?${params.toString()}`)
  }

  const hero = content.hero ?? {}
  const about = content.about ?? {}
  const why = content.why_choose_us ?? {}
  const cta = content.cta ?? {}

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero.image ?? 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920'}
            alt="Real estate"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/40 to-ink-950/70" />
        </div>
        <div className="relative max-w-site container-px w-full pt-20">
          <div className="max-w-2xl">
            <p className="text-warm-white/70 text-sm tracking-[0.2em] uppercase mb-4 animate-fade-in">Real Estate</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-warm-white leading-[1.1] mb-4 text-balance animate-fade-up">
              {hero.title ?? 'Find a place worth coming home to.'}
            </h1>
            <p className="text-lg text-stone-200 mb-8 max-w-lg animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {hero.subtitle ?? 'Homes, land and properties selected with care.'}
            </p>
            <div className="flex gap-3 mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/buy"
                className="px-6 py-3 bg-warm-white text-ink-900 text-sm tracking-wide hover:bg-stone-100 transition-colors"
              >
                {hero.cta_buy_label ?? 'Buy'}
              </Link>
              <Link
                to="/rent"
                className="px-6 py-3 border border-warm-white/40 text-warm-white text-sm tracking-wide hover:bg-warm-white/10 transition-colors"
              >
                {hero.cta_rent_label ?? 'Rent'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section className="bg-warm-white border-b border-stone-200">
        <div className="max-w-site container-px py-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-300 text-sm focus:outline-none focus:border-ink-700 transition-colors"
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-3 border border-stone-300 text-sm focus:outline-none focus:border-ink-700 bg-warm-white"
            >
              <option value="all">All Types</option>
              {types.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </select>
            <select
              value={searchListing}
              onChange={(e) => setSearchListing(e.target.value)}
              className="px-4 py-3 border border-stone-300 text-sm focus:outline-none focus:border-ink-700 bg-warm-white"
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors">
              <Search size={18} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-20">
        <div className="max-w-site container-px">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Featured</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900">Featured Properties</h2>
            </div>
            <Link to="/properties" className="hidden md:flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <EmptyState title="No featured properties" description="Check back soon for new listings." />
          )}
        </div>
      </section>

      {/* PROPERTY TYPES */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-site container-px">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Browse</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900">Property Types</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {types.slice(0, 6).map(t => (
              <Link
                key={t.id}
                to={`/properties?type=${t.slug}`}
                className="group flex flex-col items-center justify-center p-8 bg-warm-white border border-stone-200 hover:border-ink-300 transition-all"
              >
                <Building2 size={28} className="text-stone-400 group-hover:text-ink-700 transition-colors mb-3" />
                <span className="text-sm font-medium text-ink-700 group-hover:text-ink-900">{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      {about.title && (
        <section className="py-20">
          <div className="max-w-site container-px">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">About</p>
                <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-6">{about.title}</h2>
                <p className="text-ink-500 leading-relaxed mb-8">{about.body}</p>
                <Link to="/about" className="inline-flex items-center gap-2 text-sm text-ink-900 border-b border-ink-900 pb-1 hover:gap-3 transition-all">
                  Learn more about us <ArrowRight size={16} />
                </Link>
              </div>
              {about.image && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={about.image} alt="About" className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED DEVELOPMENT */}
      {dev && (
        <section className="py-20 bg-ink-950 text-warm-white">
          <div className="max-w-site container-px">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {dev.main_image_path && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={dev.main_image_path} alt={dev.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Featured Development</p>
                <h2 className="font-display text-3xl md:text-4xl mb-4">{dev.name}</h2>
                {dev.developer && <p className="text-stone-400 mb-4">By {dev.developer}</p>}
                {dev.description && <p className="text-stone-300 leading-relaxed mb-6">{dev.description}</p>}
                {dev.starting_price !== null && (
                  <p className="mb-6">From <span className="font-display text-2xl">{dev.currency} {dev.starting_price.toLocaleString()}</span></p>
                )}
                <Link to={`/development/${dev.slug}`} className="inline-flex items-center gap-2 px-6 py-3 border border-warm-white/30 text-sm tracking-wide hover:bg-warm-white/10 transition-colors">
                  View Development <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      {why.title && why.items && (
        <section className="py-20">
          <div className="max-w-site container-px">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Why Estate</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900">{why.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {why.items.map((item: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-stone-300 text-ink-700">
                    <span className="font-display text-lg">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-display text-lg text-ink-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LATEST PROPERTIES */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-site container-px">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Just Listed</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900">Latest Properties</h2>
            </div>
            <Link to="/properties" className="hidden md:flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <LoadingSkeleton count={3} />
          ) : latest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <EmptyState title="No properties yet" />
          )}
        </div>
      </section>

      {/* CTA */}
      {cta.title && (
        <section className="py-20 bg-ink-950 text-warm-white">
          <div className="max-w-site container-px text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4">{cta.title}</h2>
            <p className="text-stone-300 mb-8 max-w-xl mx-auto">{cta.subtitle}</p>
            <Link to={cta.button_link ?? '/contact'} className="inline-block px-8 py-3 bg-warm-white text-ink-900 text-sm tracking-wide hover:bg-stone-100 transition-colors">
              {cta.button_label ?? 'Get in touch'}
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
