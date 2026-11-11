import { useId } from 'react'

export function LogoMark({ size = 40, glow = false }: { size?: number; glow?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" style={glow ? { filter: 'drop-shadow(0 0 14px rgba(255,45,58,.65))' } : undefined}>
      <defs>
        <linearGradient id={`g${id}`} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff4b57" />
          <stop offset=".55" stopColor="#e50914" />
          <stop offset="1" stopColor="#8f0610" />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a1b22" />
          <stop offset="1" stopColor="#0a0b0e" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="97" height="97" rx="26" fill={`url(#b${id})`} stroke="rgba(255,255,255,.14)" strokeWidth="1.5" />
      <path d="M71 29.5A30 30 0 1 0 71 70.5" stroke={`url(#g${id})`} strokeWidth="11" strokeLinecap="round" />
      <path d="M45 37.5v25a2 2 0 0 0 3 1.7l20-12.5a2 2 0 0 0 0-3.4l-20-12.5a2 2 0 0 0-3 1.7Z" fill="#fff" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      CYMOR<span className="wordmark-red">FLIX</span>
    </span>
  )
}
