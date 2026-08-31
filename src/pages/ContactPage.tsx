import { useEffect, useState } from 'react'
import { MapPin, Mail, Phone, Clock } from 'lucide-react'
import { getSiteSettings, submitInquiry } from '../lib/data'
import { useToast } from '../components/Toast'

export default function ContactPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {})
  }, [])

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
      toast('Message sent successfully. We will get back to you soon.', 'success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    }
  }

  const email = settings.company_email ?? 'hello@estate.rw'
  const phone = settings.company_phone ?? '+250 788 100 100'
  const address = settings.company_address ?? 'KG 11 Avenue, Kimihurura, Kigali, Rwanda'

  return (
    <div className="pt-20">
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Contact</p>
          <h1 className="font-display text-4xl md:text-5xl">Get in touch</h1>
          <p className="text-stone-300 mt-4 max-w-lg">We're here to help you find your next property. Reach out with any questions and our team will respond promptly.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12">
            {/* Contact info */}
            <div>
              <h2 className="font-display text-2xl text-ink-900 mb-6">Contact Information</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-stone-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">Address</p>
                    <p className="text-sm text-stone-500">{address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-stone-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">Phone</p>
                    <a href={`tel:${phone}`} className="text-sm text-stone-500 hover:text-ink-900">{phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-stone-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">Email</p>
                    <a href={`mailto:${email}`} className="text-sm text-stone-500 hover:text-ink-900">{email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-stone-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">Business Hours</p>
                    <p className="text-sm text-stone-500">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-sm text-stone-500">Saturday: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-8 aspect-[16/10] bg-stone-100 border border-stone-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-stone-400 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">{address}</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="font-display text-2xl text-ink-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Subject</label>
                    <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Message *</label>
                  <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700 resize-none" />
                </div>
                <button type="submit" disabled={submitting} className="px-8 py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50">
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
