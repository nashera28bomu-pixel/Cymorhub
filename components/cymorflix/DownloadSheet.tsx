'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Download, HardDrive, LoaderCircle, Lock, X } from 'lucide-react'
import type { Movie, Source } from '@/lib/framex'
import { useDetail } from '@/lib/useDetail'
import { useStore } from '@/lib/store'
import { Art } from './Art'

const TIERS = [
  { height: 2160, name: '4K Ultra HD', note: 'Best picture · biggest file' },
  { height: 1080, name: 'Full HD', note: 'Sharp on any screen' },
  { height: 720, name: 'HD', note: 'Balanced quality and size' },
  { height: 480, name: 'Standard', note: 'Saves data and storage' },
]

const PHASES = ['Contacting source…', 'Securing your file…', 'Handing off to your device…']

type Phase = 'choose' | 'preparing' | 'done'

export function DownloadSheet({ movie: base, onClose, onGoDownloads }: { movie: Movie; onClose: () => void; onGoDownloads: () => void }) {
  const { movie, loading } = useDetail(base)
  const { settings, addDownload } = useStore()
  const [phase, setPhase] = useState<Phase>('choose')
  const [chosen, setChosen] = useState<Source | null>(null)
  const [progress, setProgress] = useState(0)
  const card = useRef<HTMLDivElement>(null)

  const files = useMemo(() => movie.sources.filter((s) => s.kind === 'file'), [movie.sources])
  const streamOnly = movie.sources.length > 0 && files.length === 0

  const options = useMemo(() => {
    const list = TIERS.map((t) => ({ ...t, source: files.find((s) => s.height === t.height) }))
    const unknown = files.filter((s) => !TIERS.some((t) => t.height === s.height))
    unknown.forEach((s, i) => list.push({ height: s.height, name: s.height ? s.quality : 'Original quality', note: 'Direct file', source: s }))
    return list.filter((o, i) => o.source || i < TIERS.length)
  }, [files])

  const start = (source: Source) => {
    setChosen(source)
    setProgress(0)
    setPhase('preparing')
  }

  useEffect(() => {
    if (phase !== 'preparing' || !chosen) return
    const begin = performance.now()
    const total = 2600
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - begin) / total)
      setProgress(1 - Math.pow(1 - p, 2.2))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        try {
          const a = document.createElement('a')
          a.href = chosen.url
          a.download = `${movie.title}${movie.year ? ` (${movie.year})` : ''} - ${chosen.quality}.mp4`.replace(/[\\/:*?"<>|]/g, '')
          a.rel = 'noopener'
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          a.remove()
        } catch {
          window.open(chosen.url, '_blank', 'noopener')
        }
        addDownload({ movieId: movie.id, title: movie.title, poster: movie.poster, quality: chosen.quality, size: chosen.size, url: chosen.url })
        setPhase('done')
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, chosen])

  const tilt = (e: React.MouseEvent) => {
    const el = card.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 12).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(2)}deg`)
  }

  const ring = 2 * Math.PI * 54
  const phaseText = PHASES[Math.min(PHASES.length - 1, Math.floor(progress * PHASES.length))]

  return (
    <div className="dl" role="dialog" aria-label={`Download ${movie.title}`}>
      <div className="dl-bg"><Art src={movie.backdrop || movie.poster} title={movie.title} /></div>
      <div className="dl-aurora" />
      <button className="dl-close" onClick={onClose} aria-label="Close"><X size={22} /></button>

      <div className="dl-inner">
        <div className="dl-poster-wrap" onMouseMove={tilt} onMouseLeave={() => { card.current?.style.setProperty('--rx', '0deg'); card.current?.style.setProperty('--ry', '0deg') }}>
          <div className="dl-poster" ref={card}>
            <Art src={movie.poster} title={movie.title} eager />
            <span className="poster-shine" />
          </div>
        </div>

        <div className="dl-panel">
          {phase === 'choose' && (
            <>
              <span className="section-kicker">OFFLINE VIEWING</span>
              <h2>Download {movie.title}</h2>
              <p className="dl-sub">Pick a quality. Your file goes straight to your device&apos;s download manager.</p>

              {loading && <div className="dl-loading"><LoaderCircle className="spin" size={18} /> Checking available qualities…</div>}

              <div className="dl-options">
                {options.map((o) => {
                  const ok = !!o.source
                  const isDefault = ok && String(o.height) === settings.downloadQuality
                  return (
                    <button
                      key={`${o.name}-${o.height}`}
                      className={ok ? 'dl-opt' : 'dl-opt dl-opt-off'}
                      disabled={!ok}
                      onClick={() => o.source && start(o.source)}
                    >
                      <span className="dl-opt-badge">{o.height >= 2160 ? '4K' : o.height ? `${o.height}p` : 'HD'}</span>
                      <span className="dl-opt-text">
                        <strong>{o.name}{isDefault ? <em>Your default</em> : null}</strong>
                        <small>{ok ? o.note : 'Not offered for this title'}</small>
                      </span>
                      <span className="dl-opt-end">
                        {ok ? <>{o.source?.size ? <b>{o.source.size}</b> : null}<Download size={18} /></> : <Lock size={15} />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {!loading && files.length === 0 && (
                <p className="dl-note">
                  {streamOnly
                    ? 'This title is available to stream, but the source does not offer downloadable files.'
                    : 'No downloadable files were returned for this title by your catalog source.'}
                </p>
              )}
            </>
          )}

          {phase === 'preparing' && chosen && (
            <div className="dl-center">
              <div className="dl-ring">
                <svg viewBox="0 0 120 120" width="190" height="190">
                  <defs>
                    <linearGradient id="dlg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#ff5b66" />
                      <stop offset="1" stopColor="#e50914" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="54" className="dl-ring-track" />
                  <circle cx="60" cy="60" r="54" className="dl-ring-fill" strokeDasharray={ring} strokeDashoffset={ring * (1 - progress)} />
                </svg>
                <div className="dl-ring-num">{Math.round(progress * 100)}<small>%</small></div>
              </div>
              <h2>Preparing {chosen.quality}</h2>
              <p className="dl-sub">{phaseText}</p>
            </div>
          )}

          {phase === 'done' && chosen && (
            <div className="dl-center">
              <div className="dl-done"><Check size={46} strokeWidth={3} /></div>
              <h2>Download started</h2>
              <p className="dl-sub"><strong>{movie.title}</strong> · {chosen.quality}{chosen.size ? ` · ${chosen.size}` : ''}<br />Track it in your browser&apos;s downloads. It&apos;s also listed in your CymorFlix library.</p>
              <div className="dl-actions">
                <button className="primary-btn" onClick={onGoDownloads}><HardDrive size={16} /> View downloads</button>
                <button className="glass-btn" onClick={onClose}>Keep browsing</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
