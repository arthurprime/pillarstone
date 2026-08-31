import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'

const sections = [
  { key: 'hero', label: 'Hero Section', fields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'image', label: 'Image URL', type: 'text' },
    { name: 'cta_buy_label', label: 'Buy Button Label', type: 'text' },
    { name: 'cta_rent_label', label: 'Rent Button Label', type: 'text' },
  ]},
  { key: 'about', label: 'About Section', fields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'body', label: 'Body Text', type: 'textarea' },
    { name: 'image', label: 'Image URL', type: 'text' },
  ]},
  { key: 'cta', label: 'Call to Action', fields: [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'button_label', label: 'Button Label', type: 'text' },
    { name: 'button_link', label: 'Button Link', type: 'text' },
  ]},
]

export default function AdminContent() {
  const { toast } = useToast()
  const [content, setContent] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('site_content').select('section, content').then(({ data }) => {
      const result: Record<string, any> = {}
      for (const item of data ?? []) result[item.section] = item.content
      setContent(result)
      setLoading(false)
    })
  }, [])

  async function handleSave(section: string) {
    setSaving(true)
    const { error } = await supabase.from('site_content').upsert({
      section,
      content: content[section] ?? {},
    }, { onConflict: 'section' })
    setSaving(false)
    if (error) { toast('Could not save content.', 'error') } else { toast('Content saved.', 'success') }
  }

  function updateField(section: string, field: string, value: string) {
    setContent(prev => ({
      ...prev,
      [section]: { ...(prev[section] ?? {}), [field]: value },
    }))
  }

  if (loading) return <p className="text-stone-400">Loading...</p>

  return (
    <div>
      <h2 className="font-display text-2xl text-ink-900 mb-6">Site Content</h2>

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.key} className="bg-warm-white border border-stone-200 p-6">
            <h3 className="font-display text-lg text-ink-900 mb-4">{section.label}</h3>
            <div className="space-y-4">
              {section.fields.map(field => (
                <div key={field.name}>
                  <label className="block text-xs uppercase text-stone-500 mb-1">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea rows={4} value={content[section.key]?.[field.name] ?? ''} onChange={(e) => updateField(section.key, field.name, e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm resize-none" />
                  ) : (
                    <input type="text" value={content[section.key]?.[field.name] ?? ''} onChange={(e) => updateField(section.key, field.name, e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm" />
                  )}
                </div>
              ))}
              <button onClick={() => handleSave(section.key)} disabled={saving} className="px-4 py-2 bg-ink-900 text-warm-white text-sm hover:bg-ink-800 disabled:opacity-50">
                Save {section.label}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
