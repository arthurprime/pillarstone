import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useToast } from '../components/Toast'
import Logo from '../components/Logo'

export default function RegisterPage() {
  const { signUp, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast('Passwords do not match.', 'error')
      return
    }
    if (form.password.length < 6) {
      toast('Password must be at least 6 characters.', 'error')
      return
    }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName)
    setLoading(false)
    if (error) {
      toast(error, 'error')
    } else {
      toast('Account created successfully. Welcome!', 'success')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-warm-white"><Logo /></Link>
        </div>
        <div className="bg-warm-white p-8">
          <h1 className="font-display text-2xl text-ink-900 mb-6 text-center">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Full Name</label>
              <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
            </div>
            <div>
              <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
            </div>
            <div>
              <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
            </div>
            <div>
              <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account? <Link to="/login" className="text-ink-900 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
