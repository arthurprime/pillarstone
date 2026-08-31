import { Link } from 'react-router-dom'
import Logo from './Logo'
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react'

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12z" />
    </svg>
  )
}

function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
    </svg>
  )
}

interface FooterProps {
  settings?: Record<string, string>
}

export default function Footer({ settings }: FooterProps) {
  const companyName = settings?.company_name ?? 'Pillarstone'
  const email = settings?.company_email ?? 'hello@estate.rw'
  const phone = settings?.company_phone ?? '+250 788 100 100'
  const address = settings?.company_address ?? 'KG 11 Avenue, Kimihurura, Kigali, Rwanda'
  const footerText = settings?.footer_text ?? 'Pillarstone helps people find homes, land, and commercial properties with a more considered approach to real estate.'

  return (
    <footer className="bg-ink-950 text-stone-300">
      <div className="max-w-site container-px py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="text-warm-white mb-4">
              <Logo showTagline />
            </div>
            <p className="text-sm leading-relaxed text-stone-400">{footerText}</p>
          </div>

          <div>
            <h4 className="text-warm-white text-sm font-medium mb-4 tracking-wide">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties" className="hover:text-warm-white transition-colors">All Properties</Link></li>
              <li><Link to="/buy" className="hover:text-warm-white transition-colors">Buy</Link></li>
              <li><Link to="/rent" className="hover:text-warm-white transition-colors">Rent</Link></li>
              <li><Link to="/land" className="hover:text-warm-white transition-colors">Land</Link></li>
              <li><Link to="/developments" className="hover:text-warm-white transition-colors">Developments</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-warm-white text-sm font-medium mb-4 tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-warm-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-warm-white transition-colors">Contact</Link></li>
              <li><Link to="/sell" className="hover:text-warm-white transition-colors">Sell Your Property</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-warm-white text-sm font-medium mb-4 tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5 text-stone-500" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-stone-500" />
                <a href={`tel:${phone}`} className="hover:text-warm-white transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-stone-500" />
                <a href={`mailto:${email}`} className="hover:text-warm-white transition-colors">{email}</a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-warm-white transition-colors" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {settings?.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-warm-white transition-colors" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
              )}
              {settings?.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-warm-white transition-colors" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-warm-white transition-colors" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {settings?.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-warm-white transition-colors" aria-label="TikTok">
                  <TikTokIcon size={18} />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-warm-white transition-colors" aria-label="YouTube">
                  <YouTubeIcon size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-ink-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          <p className="text-xs text-stone-500">Designed with care for finding places worth coming home to.</p>
        </div>
      </div>
    </footer>
  )
}
