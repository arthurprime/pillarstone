import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Building, Users,
  MapPin, Mail, Settings, FileEdit, Landmark, LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../components/Toast'
import Logo from '../../components/Logo'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/developments', label: 'Developments', icon: Building },
  { to: '/admin/agents', label: 'Agents', icon: Users },
  { to: '/admin/locations', label: 'Locations', icon: MapPin },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Mail },
  { to: '/admin/sell-requests', label: 'Sell Requests', icon: Landmark },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/content', label: 'Content', icon: FileEdit },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function AdminLogin() {
  const { signIn } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast(error, 'error')
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-warm-white"><Logo /></Link>
        </div>
        <div className="bg-warm-white p-8">
          <h1 className="font-display text-2xl text-ink-900 mb-2 text-center">Dashboard</h1>
          <p className="text-sm text-stone-500 text-center mb-6">Staff sign in only. Visitors do not need an account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
            </div>
            <div>
              <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in to dashboard'}
            </button>
          </form>
          <p className="mt-6 text-center">
            <Link to="/" className="text-sm text-stone-500 hover:text-ink-900">Back to the site</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && user && profile && profile.role !== 'admin' && profile.role !== 'editor') {
      toast('This area is for staff only.', 'error')
      signOut()
    }
  }, [user, profile, loading, signOut, toast])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50"><p className="text-stone-400">Loading...</p></div>
  }

  if (!user || (profile && profile.role !== 'admin' && profile.role !== 'editor')) {
    return <AdminLogin />
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50"><p className="text-stone-400">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-ink-950 text-stone-300 flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-800">
          <Link to="/admin" className="text-warm-white"><Logo /></Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-stone-400"><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive ? 'bg-ink-800 text-warm-white' : 'text-stone-400 hover:text-warm-white hover:bg-ink-900'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-ink-700 text-warm-white flex items-center justify-center text-sm">
              {profile?.full_name?.charAt(0) ?? 'A'}
            </div>
            <div>
              <p className="text-sm text-warm-white">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-xs text-stone-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-stone-400 hover:text-warm-white w-full">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-ink-950/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-warm-white border-b border-stone-200 h-16 flex items-center justify-between px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink-700"><Menu size={24} /></button>
          <h1 className="font-display text-lg text-ink-900 hidden lg:block">Dashboard</h1>
          <Link to="/" className="text-sm text-stone-500 hover:text-ink-900">View Site →</Link>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
