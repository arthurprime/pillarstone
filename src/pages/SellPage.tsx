import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitSellRequest, getPropertyTypes } from '../lib/data'
import { useToast } from '../components/Toast'
import type { PropertyType } from '../lib/types'

export default function SellPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [types, setTypes] = useState<PropertyType[]>([])
  const [form, setForm] = useState({
    name: '', email: '', phone: '', property_type: '', location: '',
    estimated_price: '', description: '', bedrooms: '', bathrooms: '',
    area: '', land_area: '', additional_message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getPropertyTypes().then(setTypes).catch(() => {})
  }, [])

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.description) {
      toast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    const { error } = await submitSellRequest({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      property_type: form.property_type || undefined,
      location: form.location || undefined,
      estimated_price: form.estimated_price ? Number(form.estimated_price) : undefined,
      description: form.description || undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      area: form.area ? Number(form.area) : undefined,
      land_area: form.land_area ? Number(form.land_area) : undefined,
      additional_message: form.additional_message || undefined,
    })
    setSubmitting(false)
    if (error) {
      toast('Could not submit request. Please try again.', 'error')
    } else {
      toast('Your property request has been submitted. Our team will contact you soon.', 'success')
      navigate('/contact')
    }
  }

  return (
    <div className="pt-20">
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Sell</p>
          <h1 className="font-display text-4xl md:text-5xl">Sell Your Property</h1>
          <p className="text-stone-300 mt-4 max-w-lg">Tell us about your property and our team will review your request and get in touch to discuss listing options.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-2xl mx-auto container-px">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name *">
                <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} className="form-input" />
              </Field>
              <Field label="Email *">
                <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="form-input" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone">
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="form-input" />
              </Field>
              <Field label="Property Type">
                <select value={form.property_type} onChange={(e) => update('property_type', e.target.value)} className="form-input">
                  <option value="">Select type</option>
                  {types.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location">
                <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} className="form-input" />
              </Field>
              <Field label="Estimated Price">
                <input type="number" value={form.estimated_price} onChange={(e) => update('estimated_price', e.target.value)} className="form-input" placeholder="0" />
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Bedrooms">
                <input type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="form-input" />
              </Field>
              <Field label="Bathrooms">
                <input type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className="form-input" />
              </Field>
              <Field label="Area (m²)">
                <input type="number" value={form.area} onChange={(e) => update('area', e.target.value)} className="form-input" />
              </Field>
              <Field label="Land (m²)">
                <input type="number" value={form.land_area} onChange={(e) => update('land_area', e.target.value)} className="form-input" />
              </Field>
            </div>

            <Field label="Description *">
              <textarea required rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="form-input resize-none" />
            </Field>

            <Field label="Additional Message">
              <textarea rows={3} value={form.additional_message} onChange={(e) => update('additional_message', e.target.value)} className="form-input resize-none" />
            </Field>

            <button type="submit" disabled={submitting} className="px-8 py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </section>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d6cfc1;
          font-size: 0.875rem;
          background: #fdfcfb;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #2a2a2a; }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
