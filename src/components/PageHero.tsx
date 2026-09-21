interface PageHeroProps {
  eyebrow: string
  title: string
  description?: string
  image: string
  imageAlt?: string
}

export default function PageHero({ eyebrow, title, description, image, imageAlt }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-warm-white min-h-[280px] md:min-h-[360px] flex items-end">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={imageAlt ?? ''}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/70 to-ink-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-ink-950/50" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>
      <div className="relative max-w-site container-px w-full pt-28 md:pt-36 pb-14 md:pb-20">
        <p className="text-xs tracking-[0.22em] uppercase text-stone-300 mb-3">{eyebrow}</p>
        <h1 className="font-display text-4xl md:text-5xl max-w-3xl leading-[1.08] text-balance">{title}</h1>
        {description && (
          <p className="text-stone-200 mt-4 max-w-xl text-lg leading-relaxed">{description}</p>
        )}
        <div className="mt-8 h-px w-24 bg-warm-white/50" />
      </div>
    </section>
  )
}
