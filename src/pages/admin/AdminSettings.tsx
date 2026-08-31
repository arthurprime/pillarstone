import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/Toast'

const settingKeys = [
  { key: 'company_name', label: 'Company Name', type: 'text' },
  { key: 'company_email', label: 'Contact Email', type: 'text' },
  { key: 'company_phone', label: 'Contact Phone', type: 'text' },
  { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text' },
  { key: 'company_address', label: 'Office Address', type: 'text' },
  { key: 'facebook_url', label: 'Facebook URL', type: 'text' },
  { key: 'twitter_url', label: 'Twitter URL', type: 'text' },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
  { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
  { key: 'tiktok_url', label: 'TikTok URL', type: 'text' },
  { key: 'youtube_url', label: 'YouTube URL', type: 'text' },
  { key: 'seo_default_title', label: 'SEO Default Title', type: 'text' },
  { key: 'seo_default_description', label: 'SEO Default Description', type: 'textarea' },
  { key: 'footer_text', label: 'Footer Text', type: 'textarea' },
]

export default function AdminSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      const result: Record<string, string> = {}
      for (const item of data ?? []) result[item.key] = item.value
      setSettings(result)
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const upserts = settingKeys.map(s => ({
      key: s.key,
      value: settings[s.key] ?? '',
    }))
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
    setSaving(false)
    if (error) { toast('Could not save settings.', 'error') } else { toast('Settings saved.', 'success') }
  }

  if (loading) return <p className="text-stone-400">Loading...</p>

  return (
    <div>
      <h2 className="font-display text-2xl text-ink-900 mb-6">Settings</h2>

      <div className="bg-warm-white border border-stone-200 p-6">
        <div className="space-y-4">
          {settingKeys.map(s => (
            <div key={s.key}>
              <label className="block text-xs uppercase text-stone-500 mb-1">{s.label}</label>
              {s.type === 'textarea' ? (
                <textarea rows={3} value={settings[s.key] ?? ''} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm resize-none" />
              ) : (
                <input type="text" value={settings[s.key] ?? ''} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm" />
              )}
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-6 px-6 py-3 bg-ink-900 text-warm-white text-sm hover:bg-ink-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
