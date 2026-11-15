'use client'

import { useMemo, useRef, useState } from 'react'
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

type Phase = 'choose' | 'preparing' | 'done'

export function DownloadSheet({ movie: base, onClose, onGoDownloads }: { movie: Movie; onClose: () => void; onGoDownloads: () => void }) {
  const { movie, loading } = useDetail(base)
  const { settings, addDownload } = useStore()
  const [phase, setPhase] = useState<Phase>('choose')
  const [chosen, setChosen] = useState<Source | null>(null)
  const [downloadError, setDownloadError] = useState('')
  const card = useRef<HTMLDivElement>(null)

  const files = useMemo(() => movie.sources.filter((s) => s.kind === 'file'), [movie.sources])
  const streamOnly = movie.sources.length > 0 && files.length === 0

  const options = useMemo(() => {
    const list = TIERS.map((t) => ({
      ...t,
      source: files.find((s) => s.height === t.height),
      available: !!movie.canResolve || files.some((s) => s.height === t.height),
    }))
    const unknown = files.filter((s) => !TIERS.some((t) => t.height === s.height))
    unknown.forEach((s) => list.push({ height: s.height, name: s.height ? s.quality : 'Original quality', note: 'Direct file', source: s, available: true }))
    return list
  }, [files, movie.canResolve])

  const start = async (source: Source) => {
    setDownloadError('')
    setChosen(source)
    setPhase('preparing')
    const downloadWindow = window.open('about:blank', '_blank')
    if (downloadWindow) downloadWindow.opener = null
    try {
      let url = source.url
      if (movie.canResolve && movie.contentId) {
        const params = new URLSearchParams({
          subjectId: movie.contentId,
          mode: 'download',
          resolution: source.height ? String(source.height) : 'auto',
        })
        if (movie.season) params.set('season', movie.season)
        if (movie.episode) params.set('episode', movie.episode)
        const response = await fetch(`/api/framex/play?${params}`, { cache: 'no-store' })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || typeof payload.url !== 'string') throw new Error(payload.error || 'FrameX could not prepare the download.')
        url = payload.url
      }
      if (!/^https:\/\//i.test(url)) throw new Error('No downloadable file is available for this quality.')

      addDownload({
        movieId: movie.id,
        title: movie.title,
        poster: movie.poster,
        quality: source.quality,
        size: source.size,
        url: '',
      })
      if (downloadWindow) downloadWindow.location.replace(url)
      else window.location.assign(url)
      setPhase('done')
    } catch (reason) {
      downloadWindow?.close()
      setDownloadError(reason instanceof Error ? reason.message : 'The download could not be started.')
      setPhase('choose')
    }
  }

  const tilt = (e: React.MouseEvent) => {
    const el = card.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 12).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(2)}deg`)
  }

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
                  const ok = o.available
                  const isDefault = ok && String(o.height) === settings.downloadQuality
                  return (
                    <button
                      key={`${o.name}-${o.height}`}
                      className={ok ? 'dl-opt' : 'dl-opt dl-opt-off'}
                      disabled={!ok}
                      onClick={() => ok && start(o.source || { url: '', kind: 'file', height: o.height, quality: o.height ? `${o.height}p` : 'Auto' })}
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

              {downloadError && <p className="dl-note dl-error">{downloadError}</p>}
              {!loading && files.length === 0 && !movie.canResolve && (
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
                <LoaderCircle className="spin" size={62} />
              </div>
              <h2>Preparing {chosen.quality}</h2>
              <p className="dl-sub">Requesting a fresh, time-limited download link from FrameX…</p>
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
