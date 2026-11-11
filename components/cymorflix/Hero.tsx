'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Info, Play, Star } from 'lucide-react'
import type { Movie } from '@/lib/framex'
import { Art } from './Art'

const ROTATE_MS = 7000

export function Hero({ movies, autoRotate, onPlay, onInfo, onDownload }: {
  movies: Movie[]
  autoRotate: boolean
  onPlay: (m: Movie) => void
  onInfo: (m: Movie) => void
  onDownload: (m: Movie) => void
}) {
  const slides = movies.slice(0, 5)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touch = useRef<number | null>(null)
  const card = useRef<HTMLDivElement>(null)

  const go = useCallback((i: number) => setIndex((i + slides.length) % Math.max(slides.length, 1)), [slides.length])

  useEffect(() => {
    if (index >= slides.length) setIndex(0)
  }, [index, slides.length])

  useEffect(() => {
    if (!autoRotate || paused || slides.length < 2) return
    const t = window.setTimeout(() => go(index + 1), ROTATE_MS)
    return () => window.clearTimeout(t)
  }, [index, autoRotate, paused, slides.length, go])

  if (!slides.length) return null
  const active = slides[Math.min(index, slides.length - 1)]

  const tilt = (e: React.MouseEvent) => {
    const el = card.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`)
  }
  const untilt = () => {
    card.current?.style.setProperty('--rx', '0deg')
    card.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        touch.current = null
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
      }}
    >
      {slides.map((m, i) => (
        <div key={m.id} className={i === index ? 'hero-bg hero-bg-on' : 'hero-bg'} aria-hidden="true">
          <Art src={m.backdrop || m.poster} title={m.title} eager={i === 0} />
        </div>
      ))}
      <div className="hero-shade" />

      <div className="hero-content" key={active.id}>
        <div className="eyebrow"><span className="live-dot" /> CYMORFLIX <span className="eyebrow-divider">/</span> TRENDING #{index + 1}</div>
        <h1>{active.title}</h1>
        <div className="hero-meta">
          {active.rating ? <span className="rating"><Star size={12} fill="currentColor" /> {active.rating}</span> : null}
          {active.year ? <span>{active.year}</span> : null}
          <span className="hd-badge">HD</span>
          {active.runtime ? <span>{active.runtime}</span> : null}
          {active.genres[0] ? <span>{active.genres.slice(0, 2).join(' · ')}</span> : null}
        </div>
        {active.overview ? <p>{active.overview}</p> : null}
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => onPlay(active)}><Play size={17} fill="currentColor" /> Play</button>
          <button className="glass-btn" onClick={() => onInfo(active)}><Info size={17} /> More info</button>
          <button className="glass-btn glass-icon" onClick={() => onDownload(active)} aria-label={`Download ${active.title}`}><Download size={17} /></button>
        </div>
      </div>

      <div className="hero-poster-wrap" onMouseMove={tilt} onMouseLeave={untilt}>
        <div className="hero-poster" ref={card} key={`p-${active.id}`}>
          <Art src={active.poster} title={active.title} eager />
          <span className="poster-shine" />
        </div>
      </div>

      <div className="hero-dots" role="tablist" aria-label="Featured titles">
        {slides.map((m, i) => (
          <button key={m.id} role="tab" aria-selected={i === index} aria-label={`Show ${m.title}`} className={i === index ? 'dot dot-active' : 'dot'} onClick={() => go(i)}>
            {i === index && autoRotate && !paused ? <span className="dot-fill" style={{ animationDuration: `${ROTATE_MS}ms` }} key={`${index}-${paused}`} /> : null}
          </button>
        ))}
      </div>
    </section>
  )
}
