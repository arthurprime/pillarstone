import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllSiteContent, getAgents } from '../lib/data'
import type { Agent } from '../lib/types'
import { Mail, Phone } from 'lucide-react'

export default function AboutPage() {
  const [content, setContent] = useState<Record<string, any>>({})
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllSiteContent(), getAgents()]).then(([c, a]) => {
      setContent(c)
      setAgents(a)
    }).finally(() => setLoading(false))
  }, [])

  const about = content.about ?? {}

  return (
    <div className="pt-20">
      <section className="bg-ink-950 text-warm-white py-16">
        <div className="max-w-site container-px">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">About</p>
          <h1 className="font-display text-4xl md:text-5xl">{about.title ?? 'A different kind of property company.'}</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <p className="text-ink-600 leading-relaxed text-lg">{about.body ?? 'We believe finding a home should feel considered, not transactional. Our team works closely with each client to understand what they truly need, whether it is a family home, an investment plot, or a commercial space.'}</p>
            </div>
            {about.image && (
              <div className="aspect-[4/3] overflow-hidden">
                <img src={about.image} alt="About" className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
          </div>

          {/* Agents */}
          {!loading && agents.length > 0 && (
            <div>
              <h2 className="font-display text-3xl text-ink-900 mb-8 text-center">Our Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {agents.map(agent => (
                  <div key={agent.id} className="text-center">
                    {agent.photo_url ? (
                      <img src={agent.photo_url} alt={agent.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-stone-200 mx-auto mb-4 flex items-center justify-center font-display text-3xl text-stone-500">
                        {agent.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-display text-lg text-ink-900 mb-1">{agent.name}</h3>
                    {agent.role && <p className="text-sm text-stone-500 mb-2">{agent.role}</p>}
                    {agent.bio && <p className="text-sm text-stone-500 leading-relaxed mb-3">{agent.bio}</p>}
                    <div className="flex justify-center gap-3">
                      {agent.email && <a href={`mailto:${agent.email}`} className="text-stone-400 hover:text-ink-900"><Mail size={16} /></a>}
                      {agent.phone && <a href={`tel:${agent.phone}`} className="text-stone-400 hover:text-ink-900"><Phone size={16} /></a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link to="/contact" className="inline-block px-8 py-3 bg-ink-900 text-warm-white text-sm tracking-wide hover:bg-ink-800 transition-colors">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
