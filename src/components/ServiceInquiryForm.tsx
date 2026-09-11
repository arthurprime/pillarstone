import { useState } from 'react'
import { submitInquiry } from '../lib/data'
import { useToast } from './Toast'

interface ServiceInquiryFormProps {
  defaultSubject: string
}

export default function ServiceInquiryForm({ defaultSubject }: ServiceInquiryFormProps) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: defaultSubject,
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast('Please fill in all required fields.', 'error')
      return
    }
    setSubmitting(true)
    const { error } = await submitInquiry(form)
    setSubmitting(false)
    if (error) {
      toast('Could not send message. Please try again.', 'error')
    } else {
      toast('Request sent. We will get back to you soon.', 'success')
      setForm({ name: '', email: '', phone: '', subject: defaultSubject, message: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700"
          />
        </div>
        <div>
          <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700"
        />
      </div>
      <div>
        <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Message *</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your project, location, and timeline."
          className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-8 py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Sending...' : 'Request a consultation'}
      </button>
    </form>
  )
}
