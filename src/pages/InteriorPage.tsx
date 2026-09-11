import { Sofa, Palette, Layout, Lamp, Store, Sparkles } from 'lucide-react'
import ServiceInquiryForm from '../components/ServiceInquiryForm'

const offerings = [
  {
    icon: Palette,
    title: 'Interior design',
    description: 'A full design direction for your home or workspace — materials, colour, light, and how rooms actually get used.',
  },
  {
    icon: Layout,
    title: 'Space planning',
    description: 'Layouts that make small rooms feel generous and large rooms feel purposeful, without wasting square metres.',
  },
  {
    icon: Lamp,
    title: 'Kitchens & bathrooms',
    description: 'The rooms you use every day, specified for durability, storage, and a finish that still looks considered years later.',
  },
  {
    icon: Sofa,
    title: 'Furniture & styling',
    description: 'Sourcing, custom pieces, and a final layer of styling so the space is ready to live in, not just photographed.',
  },
  {
    icon: Store,
    title: 'Commercial interiors',
    description: 'Offices, showrooms, and hospitality spaces that support how your team and clients actually move through them.',
  },
  {
    icon: Sparkles,
    title: 'Turnkey fit-out',
    description: 'From concept to installation: we coordinate contractors, joinery, and finishes so you get one accountable result.',
  },
]

export default function InteriorPage() {
  return (
    <div className="pt-20">
      <section className="relative overflow-hidden bg-ink-950 text-warm-white">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Interior living space"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/55 to-ink-950" />
        </div>
        <div className="relative max-w-site container-px py-20 md:py-28">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">Interiors</p>
          <h1 className="font-display text-4xl md:text-5xl max-w-3xl leading-[1.1] mb-4">
            Rooms that feel finished, not staged.
          </h1>
          <p className="text-stone-300 mt-4 max-w-xl text-lg">
            Pillarstone interiors are designed for how people live and work — calm materials, practical layouts, and details that hold up after the photos are taken.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-site container-px">
          <div className="max-w-2xl mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">What we design</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-4">Homes and workplaces, considered inside</h2>
            <p className="text-ink-500 leading-relaxed">
              We work on new builds alongside our construction team, and on existing properties that need a clearer layout, better light, or a complete interior refresh.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offerings.map(item => (
              <div key={item.title} className="border border-stone-200 p-8 bg-warm-white">
                <item.icon size={28} className="text-stone-400 mb-4" />
                <h3 className="font-display text-xl text-ink-900 mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] overflow-hidden order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Interior details"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Approach</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-6">Design that belongs to the building</h2>
              <p className="text-ink-500 leading-relaxed mb-4">
                Interiors work best when they are planned with the architecture, not applied after. We start with how you use each room, then choose finishes, joinery, and furniture that suit the light and the climate.
              </p>
              <p className="text-ink-500 leading-relaxed">
                For clients buying or building with Pillarstone, we can take the project from empty shell to a space you can move into — one conversation, one team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-site container-px">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-stone-500 mb-2">Start a project</p>
              <h2 className="font-display text-3xl text-ink-900 mb-4">Tell us about the space</h2>
              <p className="text-ink-500 leading-relaxed mb-6">
                Share the property type, what is not working today, and whether you need a full redesign or a focused update. We will follow up to arrange a consultation.
              </p>
            </div>
            <ServiceInquiryForm defaultSubject="Interior design consultation" />
          </div>
        </div>
      </section>
    </div>
  )
}
