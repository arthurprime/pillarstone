import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useToast } from '../components/Toast'
import Logo from '../components/Logo'

export default function LoginPage() {
  const { signIn, user, profile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' || profile.role === 'editor' ? '/admin' : '/')
    }
  }, [user, profile, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast(error, 'error')
    } else {
      toast('Welcome back!', 'success')
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast('Enter your email address.', 'error')
      return
    }
    setLoading(true)
    const { supabase } = await import('../lib/supabase')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) {
      toast('Could not send reset email. Please try again.', 'error')
    } else {
      toast('Password reset link sent to your email.', 'success')
      setResetMode(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-warm-white"><Logo /></Link>
        </div>
        <div className="bg-warm-white p-8">
          <h1 className="font-display text-2xl text-ink-900 mb-6 text-center">
            {resetMode ? 'Reset Password' : 'Sign In'}
          </h1>
          {resetMode ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs tracking-wide uppercase text-stone-500 mb-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:border-ink-700" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => setResetMode(false)} className="w-full text-sm text-stone-500 hover:text-ink-900">
                Back to sign in
              </button>
            </form>
          ) : (
            <>
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
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <div className="mt-6 text-center space-y-2">
                <button onClick={() => setResetMode(true)} className="text-sm text-stone-500 hover:text-ink-900 block w-full">
                  Forgot password?
                </button>
                <p className="text-sm text-stone-500">
                  Don't have an account? <Link to="/register" className="text-ink-900 font-medium hover:underline">Create one</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
