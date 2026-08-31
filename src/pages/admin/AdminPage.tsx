import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Mail, Users, Building, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Stats {
  totalProperties: number
  publishedProperties: number
  draftProperties: number
  forSale: number
  forRent: number
  developments: number
  inquiries: number
  users: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const [props, pubs, drafts, sale, rent, devs, inq, users] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('listing_type', 'sale'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('listing_type', 'rent'),
        supabase.from('developments').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        totalProperties: props.count ?? 0,
        publishedProperties: pubs.count ?? 0,
        draftProperties: drafts.count ?? 0,
        forSale: sale.count ?? 0,
        forRent: rent.count ?? 0,
        developments: devs.count ?? 0,
        inquiries: inq.count ?? 0,
        users: users.count ?? 0,
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading || !stats) {
    return <div className="text-stone-400">Loading dashboard...</div>
  }

  const cards = [
    { label: 'Total Properties', value: stats.totalProperties, icon: Building2, link: '/admin/properties' },
    { label: 'Published', value: stats.publishedProperties, icon: CheckCircle, link: '/admin/properties' },
    { label: 'Drafts', value: stats.draftProperties, icon: Clock, link: '/admin/properties' },
    { label: 'For Sale', value: stats.forSale, icon: DollarSign, link: '/admin/properties' },
    { label: 'For Rent', value: stats.forRent, icon: Building2, link: '/admin/properties' },
    { label: 'Developments', value: stats.developments, icon: Building, link: '/admin/developments' },
    { label: 'Inquiries', value: stats.inquiries, icon: Mail, link: '/admin/inquiries' },
    { label: 'Users', value: stats.users, icon: Users, link: '/admin/users' },
  ]

  return (
    <div>
      <h2 className="font-display text-2xl text-ink-900 mb-6">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-warm-white border border-stone-200 p-5 hover:border-stone-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={20} className="text-stone-400" />
              <span className="font-display text-2xl text-ink-900">{card.value}</span>
            </div>
            <p className="text-sm text-stone-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-warm-white border border-stone-200 p-6">
        <h3 className="font-display text-lg text-ink-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/properties/new" className="px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800 transition-colors">Add Property</Link>
          <Link to="/admin/inquiries" className="px-4 py-2 border border-stone-300 text-sm text-ink-700 hover:bg-stone-100 transition-colors">View Inquiries</Link>
        </div>
      </div>
    </div>
  )
}
