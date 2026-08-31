interface LogoProps {
  className?: string
  showTagline?: boolean
}

export default function Logo({ className = '', showTagline = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center leading-none ${className}`}>
      <svg width="116" height="30" viewBox="0 0 116 30" fill="none" aria-hidden="true">
        <path d="M3 28H113" stroke="currentColor" strokeWidth=".8" />
        <path d="M22 25V16L34 7L46 16V25M55 25V11L66 3L78 11V25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M34 7V1L41 5V11M66 3V.5L74 5.5V11" stroke="currentColor" strokeWidth="1.1" />
        <path d="M27 25V19H31V25M37 25V19H41V25M60 25V16H64V25M69 25V16H73V25" stroke="currentColor" strokeWidth=".95" />
        <path d="M30 18H32M39 18H41M62 15H64M71 15H73" stroke="currentColor" strokeWidth=".7" />
      </svg>
      <div className="flex items-center gap-2.5 mt-0.5">
        <span className="h-px w-5 bg-current opacity-80" />
        <span className="font-display text-[17px] md:text-[19px] font-semibold tracking-[0.14em]">PILLARSTONE</span>
        <span className="h-px w-5 bg-current opacity-80" />
      </div>
      {showTagline && <span className="mt-1 text-[7px] tracking-[0.1em] uppercase opacity-70">Real Estate · Construction · Interiors</span>}
    </div>
  )
}
