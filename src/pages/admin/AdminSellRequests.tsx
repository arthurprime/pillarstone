import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import { formatDate } from '../../lib/utils'
import type { SellRequest } from '../../lib/types'

export default function AdminSellRequests() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<SellRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    setLoading(true)
    const { data } = await supabase.from('sell_requests').select('*').order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('sell_requests').update({ status }).eq('id', id)
    if (error) { toast('Could not update status.', 'error') } else { toast('Status updated.', 'success'); loadRequests() }
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink-900 mb-6">Sell Requests</h2>

      <div className="space-y-4">
        {loading ? (
          <p className="text-stone-400 text-center py-8">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-stone-400 text-center py-8">No sell requests found.</p>
        ) : requests.map(r => (
          <div key={r.id} className="bg-warm-white border border-stone-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-ink-900">{r.name}</p>
                <p className="text-sm text-stone-500">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600">{r.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
              {r.property_type && <p className="text-stone-600"><span className="text-stone-400">Type:</span> {r.property_type}</p>}
              {r.location && <p className="text-stone-600"><span className="text-stone-400">Location:</span> {r.location}</p>}
              {r.estimated_price && <p className="text-stone-600"><span className="text-stone-400">Est. Price:</span> {r.estimated_price.toLocaleString()}</p>}
              {r.bedrooms && <p className="text-stone-600"><span className="text-stone-400">Beds:</span> {r.bedrooms}</p>}
              {r.bathrooms && <p className="text-stone-600"><span className="text-stone-400">Baths:</span> {r.bathrooms}</p>}
              {r.area && <p className="text-stone-600"><span className="text-stone-400">Area:</span> {r.area} m²</p>}
              {r.land_area && <p className="text-stone-600"><span className="text-stone-400">Land:</span> {r.land_area} m²</p>}
            </div>
            {r.description && <p className="text-sm text-stone-600 mb-2">{r.description}</p>}
            {r.additional_message && <p className="text-sm text-stone-500 italic">Note: {r.additional_message}</p>}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-stone-400">{formatDate(r.created_at)}</p>
              <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="px-3 py-1 border border-stone-300 text-xs bg-warm-white">
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
