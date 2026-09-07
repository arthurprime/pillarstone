export default function YouTubePlayOverlay({ size = 68 }: { size?: number }) {
  const height = Math.round(size * (48 / 68))
  return (
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        width={size}
        height={height}
        viewBox="0 0 68 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="drop-shadow-lg group-hover:scale-105 transition-transform origin-center"
      >
        <path
          d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.31 34 .31 34 .31S12.21.31 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.31 13.05.31 24 .31 24s0 10.95 1.17 16.26c.79 2.93 2.49 5.41 5.42 6.19C12.21 47.69 34 47.69 34 47.69s21.79 0 27.1-1.24c2.93-.78 4.64-3.26 5.42-6.19C67.69 34.95 67.69 24 67.69 24s0-10.95-1.17-16.26z"
          fill="#FF0000"
        />
        <path d="M45 24 27 14.5v19z" fill="#fff" />
      </svg>
    </span>
  )
}
