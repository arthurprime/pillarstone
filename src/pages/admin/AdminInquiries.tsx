import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import { MessageCircle } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import type { Inquiry } from '../../lib/types'

export default function AdminInquiries() {
  const { toast } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { loadInquiries() }, [])

  async function loadInquiries() {
    setLoading(true)
    const { data } = await supabase.from('inquiries').select(`*, properties (title)`).order('created_at', { ascending: false })
    setInquiries(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id)
    if (error) { toast('Could not update status.', 'error') } else { toast('Status updated.', 'success'); loadInquiries() }
  }

  const filtered = statusFilter ? inquiries.filter(i => i.status === statusFilter) : inquiries

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-orange-100 text-orange-700',
    closed: 'bg-green-100 text-green-700',
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink-900 mb-6">Inquiries</h2>

      <div className="flex gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-stone-300 text-sm bg-warm-white">
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-stone-400 text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-stone-400 text-center py-8">No inquiries found.</p>
        ) : filtered.map(i => (
          <div key={i.id} className="bg-warm-white border border-stone-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-ink-900">{i.name}</p>
                <p className="text-sm text-stone-500">{i.email}{i.phone ? ` · ${i.phone}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {i.channel === 'whatsapp' && (
                  <span className="text-xs px-2 py-1 bg-[#25D366]/10 text-[#1da851] flex items-center gap-1">
                    <MessageCircle size={12} /> WhatsApp
                  </span>
                )}
                <span className={`text-xs px-2 py-1 ${statusColors[i.status] ?? 'bg-stone-100'}`}>{i.status.replace('_', ' ')}</span>
              </div>
            </div>
            {i.subject && <p className="text-sm font-medium text-ink-700 mb-1">{i.subject}</p>}
            {i.properties?.title && <p className="text-xs text-stone-400 mb-2">Re: {i.properties.title}</p>}
            <p className="text-sm text-stone-600 mb-3">{i.message}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-400">{formatDate(i.created_at)}</p>
              <select value={i.status} onChange={(e) => updateStatus(i.id, e.target.value)} className="px-3 py-1 border border-stone-300 text-xs bg-warm-white">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
