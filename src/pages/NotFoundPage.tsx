import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl md:text-9xl text-warm-white mb-4">404</p>
        <h1 className="font-display text-2xl text-stone-300 mb-2">Page not found</h1>
        <p className="text-stone-400 mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="px-6 py-3 bg-warm-white text-ink-900 text-sm tracking-wide hover:bg-stone-100 transition-colors">
            Return Home
          </Link>
          <Link to="/properties" className="px-6 py-3 border border-warm-white/30 text-warm-white text-sm tracking-wide hover:bg-warm-white/10 transition-colors">
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  )
}
