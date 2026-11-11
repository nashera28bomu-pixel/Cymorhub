'use client'

import { useEffect, useMemo, useState } from 'react'
import { LogoMark } from './Logo'

const LETTERS = 'CYMORFLIX'.split('')

export function Intro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const leave = window.setTimeout(() => setLeaving(true), reduce ? 600 : 4300)
    const done = window.setTimeout(onDone, reduce ? 900 : 5000)
    return () => {
      window.clearTimeout(leave)
      window.clearTimeout(done)
    }
  }, [onDone])

  const sparks = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        size: 2 + ((i * 7) % 4),
        delay: `${((i * 13) % 30) / 10}s`,
        dur: `${3.2 + ((i * 5) % 28) / 10}s`,
        drift: `${((i * 17) % 60) - 30}px`,
      })),
    [],
  )

  return (
    <div className={`intro ${leaving ? 'intro-leave' : ''}`} role="presentation">
      <div className="intro-rays" />
      <div className="intro-glow" />
      <div className="intro-grid" />
      {sparks.map((s, i) => (
        <i key={i} className="intro-spark" style={{ left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur, ['--drift' as string]: s.drift }} />
      ))}

      <p className="intro-presents">LEGENDARY SMILEY CYMOR PRESENTS</p>

      <div className="intro-stage">
        <div className="intro-logo">
          <div className="intro-logo-ring" />
          <LogoMark size={104} glow />
        </div>
        <div className="intro-word" aria-label="CymorFlix">
          {LETTERS.map((l, i) => (
            <span key={i} className={i >= 5 ? 'intro-letter intro-letter-red' : 'intro-letter'} style={{ animationDelay: `${1.7 + i * 0.09}s` }}>
              {l}
            </span>
          ))}
          <span className="intro-sweep" />
        </div>
        <p className="intro-tag">MOVIES · MADE CINEMATIC</p>
      </div>

      <div className="intro-bar"><span /></div>
      <button className="intro-skip" onClick={onDone}>Skip</button>
    </div>
  )
}
