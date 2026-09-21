import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight, Check } from 'lucide-react'
import { getDevelopments } from '../lib/data'
import DevelopmentCard from '../components/DevelopmentCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import type { Development } from '../lib/types'
import PageHero from '../components/PageHero'
import Seo from '../components/Seo'
import { HERO_IMAGES, PAGE_SEO } from '../lib/pageContent'

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<Development[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDevelopments().then(setDevelopments).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Seo {...PAGE_SEO.developments} />
      <PageHero
        eyebrow="New developments"
        title="Residential and commercial developments in Kigali"
        description="Explore housing and mixed-use projects in Kigali — unit types, starting prices and amenities."
        image={HERO_IMAGES.developments}
        imageAlt="Property development in Kigali"
      />

      <section className="py-12">
        <div className="max-w-site container-px">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[16/10] skeleton" />
              <div className="aspect-[16/10] skeleton" />
            </div>
          ) : developments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {developments.map(d => <DevelopmentCard key={d.id} development={d} />)}
            </div>
          ) : (
            <EmptyState title="No developments available" description="Check back soon for new development projects." />
          )}
        </div>
      </section>
    </div>
  )
}
