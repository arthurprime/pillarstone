import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, LogOut, Heart, Settings } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { getFavorites } from '../lib/data'
import PropertyCard from '../components/PropertyCard'
import type { Favorite } from '../lib/types'

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [favorites, setFavorites] = useState<Favorite[]>([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setForm({
      full_name: profile?.full_name ?? (user as any)?.user_metadata?.full_name ?? '',
      phone: profile?.phone ?? '',
    })
    getFavorites(user.id).then(setFavorites).catch(() => {})
  }, [user, profile, navigate])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      toast('Could not update profile. Please try again.', 'error')
    } else {
      toast('Profile updated successfully.', 'success')
      refreshProfile()
    }
  }

  if (!user) return null

  return (
    <div className="pt-20">
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Account</p>
          <h1 className="font-display text-4xl">My Profile</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
            {/* Sidebar */}
            <aside>
              <div className="bg-warm-white border border-stone-200 p-6 mb-4">
                <div className="w-16 h-16 rounded-full bg-ink-700 text-warm-white flex items-center justify-center font-display text-2xl mb-3">
                  {form.full_name?.charAt(0) ?? user.email?.charAt(0)}
                </div>
                <p className="font-medium text-ink-900">{form.full_name || 'User'}</p>
                <p className="text-sm text-stone-500">{user.email}</p>
                {profile?.role && profile.role !== 'user' && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-accent/10 text-accent capitalize">{profile.role}</span>
                )}
              </div>
              <nav className="space-y-1">
                <Link to="/favorites" className="flex items-center gap-2 px-4 py-3 text-sm text-ink-700 hover:bg-stone-100 transition-colors">
                  <Heart size={16} /> Favorites ({favorites.length})
                </Link>
                {(profile?.role === 'admin' || profile?.role === 'editor') && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-ink-700 hover:bg-stone-100 transition-colors">
                    <Settings size={16} /> Dashboard
                  </Link>
                )}
                <button onClick={() => signOut().then(() => navigate('/'))} className="flex items-center gap-2 px-4 py-3 text-sm text-ink-700 hover:bg-stone-100 transition-colors w-full text-left">
                  <LogOut size={16} /> Sign Out
                </button>
              </nav>
            </aside>

            {/* Profile form */}
            <div>
              <div className="bg-warm-white border border-stone-200 p-6 mb-6">
                <h2 className="font-display text-xl text-ink-900 mb-6">Account Information</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Full Name</label>
                    <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Email</label>
                    <input type="email" value={user.email ?? ''} disabled className="w-full px-3 py-2 border border-stone-200 text-sm bg-stone-50 text-stone-500" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
                  </div>
                  <button type="submit" disabled={saving} className="px-6 py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Saved properties */}
              {favorites.length > 0 && (
                <div>
                  <h2 className="font-display text-xl text-ink-900 mb-6">Saved Properties</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {favorites.map(f => f.properties && <PropertyCard key={f.id} property={f.properties} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
