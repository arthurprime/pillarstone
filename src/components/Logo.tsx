interface LogoProps {
  className?: string
  showTagline?: boolean
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex flex-col items-center leading-none ${className}`}>
      <img
        src="/logo.png?v=3"
        alt="PILLARSTONE"
        width={116}
        height={52}
        className="h-[52px] w-auto object-contain mix-blend-screen"
      />
    </div>
  )
}
