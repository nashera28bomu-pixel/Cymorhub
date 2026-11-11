'use client'

import { useState } from 'react'

const hue = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}

/** Image with an elegant generated fallback when the poster is missing or fails to load. */
export function Art({ src, title, className = '', eager = false }: { src?: string; title: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  const h = hue(title)
  if (!src || failed) {
    return (
      <div className={`art-fallback ${className}`} style={{ background: `linear-gradient(145deg, hsl(${h} 55% 24%), hsl(${(h + 50) % 360} 60% 9%))` }}>
        <span>{title}</span>
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={title} loading={eager ? 'eager' : 'lazy'} draggable={false} onError={() => setFailed(true)} />
}
