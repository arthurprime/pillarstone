import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Upload, X, Star, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { supabase, STORAGE_BUCKETS, getPublicImageUrl } from '../../lib/supabase'
import { useToast } from '../../components/Toast'
import { slugify } from '../../lib/utils'
import type { PropertyType, Location, Agent } from '../../lib/types'

interface ImageRecord {
  id?: string
  path: string
  is_primary: boolean
  sort_order: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_IMAGES = 40
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export default function AdminPropertyEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = !!id
  const dropRef = useRef<HTMLLabelElement>(null)

  const [form, setForm] = useState({
    title: '', slug: '', description: '', property_type_id: '', listing_type: 'sale',
    status: 'draft', price: '', currency: 'USD', location_id: '', bedrooms: '', bathrooms: '',
    area: '', land_area: '', year_built: '', reference_number: '', latitude: '', longitude: '',
    agent_id: '', whatsapp_number: '', is_featured: false,
  })
  const [types, setTypes] = useState<PropertyType[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [images, setImages] = useState<ImageRecord[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('property_types').select('*').order('sort_order'),
      supabase.from('locations').select('*').order('city'),
      supabase.from('agents').select('*').order('name'),
    ]).then(([t, l, a]) => {
      setTypes(t.data ?? [])
      setLocations(l.data ?? [])
      setAgents(a.data ?? [])
    })

    if (isEdit && id) {
      supabase.from('properties').select('*').eq('id', id).maybeSingle().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title ?? '', slug: data.slug ?? '', description: data.description ?? '',
            property_type_id: data.property_type_id ?? '', listing_type: data.listing_type ?? 'sale',
            status: data.status ?? 'draft', price: String(data.price ?? ''), currency: data.currency ?? 'USD',
            location_id: data.location_id ?? '', bedrooms: String(data.bedrooms ?? ''), bathrooms: String(data.bathrooms ?? ''),
            area: String(data.area ?? ''), land_area: String(data.land_area ?? ''), year_built: String(data.year_built ?? ''),
            reference_number: data.reference_number ?? '', latitude: String(data.latitude ?? ''), longitude: String(data.longitude ?? ''),
            agent_id: data.agent_id ?? '', whatsapp_number: data.whatsapp_number ?? '', is_featured: data.is_featured ?? false,
          })
        }
      })
      supabase.from('property_images').select('*').eq('property_id', id).order('sort_order').then(({ data }) => {
        setImages((data ?? []).map(img => ({ id: img.id, path: img.image_path, is_primary: img.is_primary, sort_order: img.sort_order })))
      })
    }
  }, [id, isEdit])

  function update(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList)
    if (incoming.length === 0) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      toast(`You can add up to ${MAX_IMAGES} photos per property.`, 'error')
      return
    }

    const files = incoming.slice(0, remaining)
    if (incoming.length > remaining) {
      toast(`Only ${remaining} more photo(s) can be added (limit ${MAX_IMAGES}).`, 'error')
    }

    setUploading(true)
    const folder = id ?? 'temp'
    const uploaded: ImageRecord[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Uploading ${i + 1} of ${files.length}…`)

      if (!file.type.startsWith('image/') && !ACCEPTED_TYPES.includes(file.type)) {
        toast(`${file.name} is not a supported image.`, 'error')
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast(`${file.name} exceeds the 10MB limit.`, 'error')
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${folder}/${fileName}`
      const { error } = await supabase.storage.from(STORAGE_BUCKETS.PROPERTY_IMAGES).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })
      if (error) {
        toast(`Could not upload ${file.name}: ${error.message}`, 'error')
      } else {
        const url = getPublicImageUrl(STORAGE_BUCKETS.PROPERTY_IMAGES, path)
        uploaded.push({
          path: url,
          is_primary: false,
          sort_order: images.length + uploaded.length,
        })
      }
    }

    if (uploaded.length > 0) {
      setImages(prev => {
        const next = [...prev, ...uploaded]
        if (!next.some(img => img.is_primary)) next[0].is_primary = true
        return next.map((img, i) => ({ ...img, sort_order: i }))
      })
      toast(`${uploaded.length} photo(s) added. Save the property to keep them.`, 'success')
    }

    setUploading(false)
    setUploadProgress('')
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files)
  }

  function removeImage(idx: number) {
    const img = images[idx]
    if (img.id) setRemovedIds(prev => [...prev, img.id!])
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sort_order: i }))
      if (next.length > 0 && !next.some(img => img.is_primary)) next[0].is_primary = true
      return next
    })
  }

  function setPrimary(idx: number) {
    setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === idx })))
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const next = idx + dir
    if (next < 0 || next >= images.length) return
    setImages(prev => {
      const copy = [...prev]
      const [item] = copy.splice(idx, 1)
      copy.splice(next, 0, item)
      return copy.map((img, i) => ({ ...img, sort_order: i }))
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) { toast('Title is required.', 'error'); return }
    setSaving(true)

    const slug = form.slug || slugify(form.title)
    const payload: Record<string, unknown> = {
      title: form.title,
      slug,
      description: form.description || null,
      property_type_id: form.property_type_id || null,
      listing_type: form.listing_type,
      status: form.status,
      price: Number(form.price) || 0,
      currency: form.currency,
      location_id: form.location_id || null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      area: form.area ? Number(form.area) : null,
      land_area: form.land_area ? Number(form.land_area) : null,
      year_built: form.year_built ? Number(form.year_built) : null,
      reference_number: form.reference_number || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      agent_id: form.agent_id || null,
      whatsapp_number: form.whatsapp_number || null,
      is_featured: form.is_featured,
    }
    if (form.status === 'published' && !isEdit) payload.published_at = new Date().toISOString()

    let propertyId = id

    if (isEdit && id) {
      const { error } = await supabase.from('properties').update(payload).eq('id', id)
      if (error) { toast('Could not save property.', 'error'); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('properties').insert(payload).select('id').single()
      if (error) { toast('Could not create property.', 'error'); setSaving(false); return }
      propertyId = data.id
    }

    if (propertyId) {
      if (removedIds.length > 0) {
        await supabase.from('property_images').delete().in('id', removedIds)
      }

      const ordered = images.map((img, i) => ({
        ...img,
        sort_order: i,
        is_primary: img.is_primary || (i === 0 && !images.some(x => x.is_primary)),
      }))

      const existing = ordered.filter(img => img.id)
      const created = ordered.filter(img => !img.id)

      for (const img of existing) {
        await supabase.from('property_images').update({
          image_path: img.path,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        }).eq('id', img.id)
      }

      if (created.length > 0) {
        const { error: imgError } = await supabase.from('property_images').insert(
          created.map(img => ({
            property_id: propertyId,
            image_path: img.path,
            sort_order: img.sort_order,
            is_primary: img.is_primary,
          })),
        )
        if (imgError) {
          toast('Property saved, but some photos could not be linked.', 'error')
          setSaving(false)
          return
        }
      }
    }

    setSaving(false)
    toast('Property saved successfully.', 'success')
    navigate('/admin/properties')
  }

  return (
    <div>
      <Link to="/admin/properties" className="flex items-center gap-2 text-sm text-stone-500 hover:text-ink-900 mb-4">
        <ArrowLeft size={16} /> Back to properties
      </Link>

      <h2 className="font-display text-2xl text-ink-900 mb-6">{isEdit ? 'Edit Property' : 'Add Property'}</h2>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-warm-white border border-stone-200 p-6">
          <h3 className="font-display text-lg text-ink-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminField label="Title *">
              <input type="text" required value={form.title} onChange={(e) => { update('title', e.target.value); if (!isEdit) update('slug', slugify(e.target.value)) }} className="admin-input" />
            </AdminField>
            <AdminField label="Slug">
              <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value)} className="admin-input" />
            </AdminField>
          </div>
          <AdminField label="Description">
            <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="admin-input resize-none" />
          </AdminField>
        </div>

        <div className="bg-warm-white border border-stone-200 p-6">
          <h3 className="font-display text-lg text-ink-900 mb-4">Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminField label="Property Type">
              <select value={form.property_type_id} onChange={(e) => update('property_type_id', e.target.value)} className="admin-input">
                <option value="">Select type</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </AdminField>
            <AdminField label="Listing Type">
              <select value={form.listing_type} onChange={(e) => update('listing_type', e.target.value)} className="admin-input">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </AdminField>
            <AdminField label="Status">
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="admin-input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="pending">Pending</option>
              </select>
            </AdminField>
          </div>
        </div>

        <div className="bg-warm-white border border-stone-200 p-6">
          <h3 className="font-display text-lg text-ink-900 mb-4">Pricing & Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminField label="Price">
              <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className="admin-input" />
            </AdminField>
            <AdminField label="Currency">
              <select value={form.currency} onChange={(e) => update('currency', e.target.value)} className="admin-input">
                <option value="USD">USD</option>
                <option value="RWF">RWF</option>
                <option value="EUR">EUR</option>
              </select>
            </AdminField>
            <AdminField label="Bedrooms">
              <input type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="admin-input" />
            </AdminField>
            <AdminField label="Bathrooms">
              <input type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className="admin-input" />
            </AdminField>
            <AdminField label="Area (m²)">
              <input type="number" value={form.area} onChange={(e) => update('area', e.target.value)} className="admin-input" />
            </AdminField>
            <AdminField label="Land Area (m²)">
              <input type="number" value={form.land_area} onChange={(e) => update('land_area', e.target.value)} className="admin-input" />
            </AdminField>
            <AdminField label="Year Built">
              <input type="number" value={form.year_built} onChange={(e) => update('year_built', e.target.value)} className="admin-input" />
            </AdminField>
            <AdminField label="Reference #">
              <input type="text" value={form.reference_number} onChange={(e) => update('reference_number', e.target.value)} className="admin-input" />
            </AdminField>
          </div>
        </div>

        <div className="bg-warm-white border border-stone-200 p-6">
          <h3 className="font-display text-lg text-ink-900 mb-4">Location & Agent</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminField label="Location">
              <select value={form.location_id} onChange={(e) => update('location_id', e.target.value)} className="admin-input">
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{[l.neighborhood, l.city].filter(Boolean).join(', ')}</option>)}
              </select>
            </AdminField>
            <AdminField label="Agent">
              <select value={form.agent_id} onChange={(e) => update('agent_id', e.target.value)} className="admin-input">
                <option value="">No agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </AdminField>
            <AdminField label="WhatsApp Number">
              <input type="text" value={form.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} className="admin-input" placeholder="e.g. +250 788 123 456" />
            </AdminField>
            <AdminField label="Featured">
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-ink-700">Mark as featured</span>
              </label>
            </AdminField>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <AdminField label="Latitude">
              <input type="number" step="any" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} className="admin-input" />
            </AdminField>
            <AdminField label="Longitude">
              <input type="number" step="any" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} className="admin-input" />
            </AdminField>
          </div>
        </div>

        <div className="bg-warm-white border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-ink-900">Photos</h3>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Images size={14} /> {images.length} / {MAX_IMAGES}
            </span>
          </div>
          <p className="text-sm text-stone-500 mb-4">
            Select or drag multiple files at once. Star a photo to use it as the listing cover. Use the arrows to change gallery order.
          </p>
          <label
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 px-4 py-10 border border-dashed cursor-pointer transition-colors mb-4 ${
              dragOver ? 'border-ink-900 bg-stone-100' : 'border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Upload size={22} className="text-stone-400" />
            <span className="text-sm text-ink-700">
              {uploading ? uploadProgress || 'Uploading…' : 'Drop photos here or click to choose several'}
            </span>
            <span className="text-xs text-stone-400">JPEG, PNG, WebP, GIF · up to 10MB each · up to {MAX_IMAGES} photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img, i) => (
                <div key={img.id ?? img.path} className="relative group aspect-square overflow-hidden bg-stone-100 border border-stone-200">
                  <img src={img.path} alt="" className="w-full h-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 text-[10px] uppercase tracking-wide bg-accent text-warm-white px-1.5 py-0.5">Cover</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="w-7 h-7 text-warm-white disabled:opacity-30" aria-label="Move earlier">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={() => setPrimary(i)} className="w-7 h-7 text-warm-white" aria-label="Set as cover">
                      <Star size={14} className={img.is_primary ? 'fill-warm-white' : ''} />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="w-7 h-7 text-warm-white disabled:opacity-30" aria-label="Move later">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-ink-950/70 text-warm-white flex items-center justify-center" aria-label="Remove image">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 px-6 py-3 bg-ink-900 text-warm-white text-sm hover:bg-ink-800 transition-colors disabled:opacity-50">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Property'}
          </button>
          <Link to="/admin/properties" className="px-6 py-3 border border-stone-300 text-sm text-ink-700 hover:bg-stone-100 transition-colors">
            Cancel
          </Link>
        </div>
      </form>

      <style>{`
        .admin-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d6cfc1;
          font-size: 0.875rem;
          background: #fdfcfb;
          outline: none;
          transition: border-color 0.2s;
        }
        .admin-input:focus { border-color: #2a2a2a; }
      `}</style>
    </div>
  )
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
