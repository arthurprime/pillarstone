import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Heart } from 'lucide-react'
import Logo from './Logo'

const navLinks = [
  { label: 'Properties', to: '/properties' },
  { label: 'Buy', to: '/buy' },
  { label: 'Rent', to: '/rent' },
  { label: 'Sell', to: '/sell' },
  { label: 'Land', to: '/land' },
  { label: 'Developments', to: '/developments' },
  { label: 'About', to: '/about' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? 'bg-ink-950/95 backdrop-blur-md shadow-lg'
            : 'bg-gradient-to-b from-ink-950/70 to-transparent'
        }`}
      >
        <div className="max-w-site container-px">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="text-warm-white hover:opacity-90 transition-opacity">
              <Logo />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm tracking-wide transition-colors ${
                      isActive ? 'text-warm-white' : 'text-stone-300 hover:text-warm-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-5">
              <Link to="/contact" className="text-sm tracking-wide text-stone-300 hover:text-warm-white transition-colors">
                Contact
              </Link>
              <Link to="/favorites" className="text-stone-300 hover:text-warm-white transition-colors" aria-label="Saved properties">
                <Heart size={20} />
              </Link>
            </div>

            <button
              className="lg:hidden text-warm-white"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-warm-white overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between px-6 h-16 border-b border-stone-200">
              <span className="font-display text-lg text-ink-900">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-ink-400 hover:text-ink-900" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col py-2">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-6 py-3 text-base border-b border-stone-100 transition-colors ${
                      isActive ? 'text-ink-900 font-medium' : 'text-ink-600 hover:text-ink-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/contact" className="px-6 py-3 text-base text-ink-600 border-b border-stone-100 hover:text-ink-900">Contact</Link>
              <Link to="/favorites" className="px-6 py-3 text-base text-ink-600 hover:text-ink-900">Saved</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
