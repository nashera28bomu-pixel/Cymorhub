'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, Gauge, LoaderCircle, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Settings, Volume2, VolumeX, Film } from 'lucide-react'
import type { Movie, Source } from '@/lib/framex'
import { useDetail } from '@/lib/useDetail'
import { getResume, saveResume, useStore } from '@/lib/store'
import { Art } from './Art'

const HLS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js'
let hlsLoader: Promise<any> | null = null
const loadHls = (): Promise<any> => {
  if (typeof window === 'undefined') return Promise.reject()
  if ((window as any).Hls) return Promise.resolve((window as any).Hls)
  if (!hlsLoader) {
    hlsLoader = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = HLS_URL
      s.async = true
      s.onload = () => resolve((window as any).Hls)
      s.onerror = () => {
        hlsLoader = null
        reject(new Error('hls.js failed to load'))
      }
      document.head.appendChild(s)
    })
  }
  return hlsLoader
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function defaultSource(sources: Source[], pref: string): Source | undefined {
  if (!sources.length) return undefined
  if (pref === 'auto') return sources[0]
  const target = Number(pref)
  return sources.find((s) => s.height > 0 && s.height <= target) ?? sources[sources.length - 1]
}

export function Player({ movie: base, onClose }: { movie: Movie; onClose: () => void }) {
  const { movie, loading: detailLoading } = useDetail(base)
  const { settings } = useStore()
  const sources = movie.sources

  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const hls = useRef<any>(null)
  const hideTimer = useRef<number | undefined>(undefined)
  const tapTimer = useRef<number | undefined>(undefined)
  const lastTap = useRef(0)
  const seekTo = useRef<number | null>(null)
  const started = useRef(false)

  const [picked, setPicked] = useState<string | null>(null)
  const current = useMemo(() => sources.find((s) => s.url === picked) ?? defaultSource(sources, settings.playbackQuality), [sources, picked, settings.playbackQuality])

  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [error, setError] = useState('')
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [menu, setMenu] = useState(false)
  const [show, setShow] = useState(true)
  const [full, setFull] = useState(false)
  const [flash, setFlash] = useState<'back' | 'fwd' | null>(null)

  /* ---------- controls visibility ---------- */
  const poke = useCallback(() => {
    setShow(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setShow(false), 3200)
  }, [])
  useEffect(() => {
    poke()
    return () => {
      window.clearTimeout(hideTimer.current)
      window.clearTimeout(tapTimer.current)
    }
  }, [poke])
  useEffect(() => {
    if (!playing || menu) {
      window.clearTimeout(hideTimer.current)
      setShow(true)
    } else poke()
  }, [playing, menu, poke])

  /* ---------- attach source ---------- */
  useEffect(() => {
    const el = video.current
    if (!el || !current) return
    let cancelled = false
    setError('')
    setBuffering(true)
    if (started.current && el.currentTime > 0) seekTo.current = el.currentTime
    else if (settings.resume) seekTo.current = getResume(movie.id) || null

    hls.current?.destroy?.()
    hls.current = null

    const begin = () => el.play().catch(() => setPlaying(false))

    if (current.kind === 'hls') {
      if (el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = current.url
        begin()
      } else {
        loadHls()
          .then((Hls) => {
            if (cancelled) return
            if (!Hls?.isSupported?.()) return setError('This browser cannot play this stream.')
            const h = new Hls({ enableWorker: true, lowLatencyMode: false })
            hls.current = h
            h.on(Hls.Events.ERROR, (_: unknown, data: any) => {
              if (data?.fatal) setError('Playback error. Try another quality or check your connection.')
            })
            h.loadSource(current.url)
            h.attachMedia(el)
            begin()
          })
          .catch(() => !cancelled && setError('Could not load the video engine. Check your connection.'))
      }
    } else {
      el.src = current.url
      begin()
    }
    return () => {
      cancelled = true
      hls.current?.destroy?.()
      hls.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.url])

  /* ---------- persist position ---------- */
  useEffect(() => {
    const id = movie.id
    const t = window.setInterval(() => {
      const el = video.current
      if (el && settings.resume && el.duration && el.currentTime < el.duration - 30) saveResume(id, el.currentTime)
    }, 5000)
    return () => {
      window.clearInterval(t)
      const el = video.current
      if (el && settings.resume && el.duration) saveResume(id, el.currentTime > el.duration - 30 ? 0 : el.currentTime)
    }
  }, [movie.id, settings.resume])

  /* ---------- fullscreen state ---------- */
  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  /* ---------- actions ---------- */
  const toggle = useCallback(() => {
    const el = video.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }, [])
  const skip = useCallback((d: number) => {
    const el = video.current
    if (!el) return
    el.currentTime = Math.max(0, Math.min(el.duration || Infinity, el.currentTime + d))
    setFlash(d < 0 ? 'back' : 'fwd')
    window.setTimeout(() => setFlash(null), 450)
    poke()
  }, [poke])
  const toggleMute = useCallback(() => {
    const el = video.current
    if (el) el.muted = !el.muted
  }, [])
  const toggleFull = useCallback(async () => {
    const el = box.current
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (el?.requestFullscreen) {
        await el.requestFullscreen()
        ;(screen.orientation as any)?.lock?.('landscape').catch(() => {})
      } else v?.webkitEnterFullscreen?.()
    } catch {
      /* fullscreen not permitted */
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle() }
      else if (e.key === 'ArrowRight') skip(10)
      else if (e.key === 'ArrowLeft') skip(-10)
      else if (e.key === 'm') toggleMute()
      else if (e.key === 'f') toggleFull()
      poke()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, skip, toggleMute, toggleFull, poke])

  /* ---------- tap handling (double-tap to seek on touch) ---------- */
  const onSurface = (e: React.MouseEvent<HTMLDivElement>) => {
    if (menu) return setMenu(false)
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const rect = e.currentTarget.getBoundingClientRect()
    const side = (e.clientX - rect.left) / rect.width
    const now = Date.now()
    if (now - lastTap.current < 300 && (side < 0.35 || side > 0.65)) {
      window.clearTimeout(tapTimer.current)
      lastTap.current = 0
      skip(side < 0.5 ? -10 : 10)
      return
    }
    lastTap.current = now
    window.clearTimeout(tapTimer.current)
    tapTimer.current = window.setTimeout(() => {
      if (coarse) {
        if (show && playing) setShow(false)
        else poke()
      } else toggle()
    }, coarse ? 280 : 220)
  }

  const pct = duration ? (time / duration) * 100 : 0
  const bufPct = duration ? (buffered / duration) * 100 : 0
  const hasSources = sources.length > 0

  return (
    <div
      ref={box}
      className={`player ${show || !playing ? 'player-ui' : ''}`}
      onMouseMove={poke}
      role="dialog"
      aria-label={`Playing ${movie.title}`}
    >
      <video
        ref={video}
        className="player-video"
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          const el = e.currentTarget
          setDuration(el.duration)
          if (seekTo.current) {
            el.currentTime = Math.min(seekTo.current, Math.max(0, el.duration - 5))
            seekTo.current = null
          }
          started.current = true
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget
          setTime(el.currentTime)
          if (el.buffered.length) setBuffered(el.buffered.end(el.buffered.length - 1))
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onPlaying={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onError={() => setError('This file could not be played. Try another quality.')}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume)
          setMuted(e.currentTarget.muted)
        }}
        onRateChange={(e) => setSpeed(e.currentTarget.playbackRate)}
        onEnded={() => { saveResume(movie.id, 0); setPlaying(false) }}
      />

      {!hasSources && (
        <div className="player-empty">
          <div className="player-empty-bg"><Art src={movie.backdrop || movie.poster} title={movie.title} /></div>
          <div className="player-empty-card">
            {detailLoading ? (
              <>
                <LoaderCircle className="spin" size={34} />
                <h2>Getting {movie.title} ready…</h2>
              </>
            ) : (
              <>
                <div className="player-empty-icon"><Film size={26} /></div>
                <h2>No stream available yet</h2>
                <p>FrameX didn&apos;t return a playable source for <strong>{movie.title}</strong>. Try another title, or check what your FrameX plan includes.</p>
                <button className="primary-btn" onClick={onClose}>Go back</button>
              </>
            )}
          </div>
        </div>
      )}

      {hasSources && (
        <div className="player-surface" onClick={onSurface}>
          {buffering && !error && <div className="player-spinner"><LoaderCircle className="spin" size={54} /></div>}
          {flash && <div className={`seek-flash seek-${flash}`}>{flash === 'back' ? <RotateCcw size={34} /> : <RotateCw size={34} />}<span>10s</span></div>}
          {error && (
            <div className="player-error" onClick={(e) => e.stopPropagation()}>
              <p>{error}</p>
              <button className="glass-btn" onClick={() => { setError(''); const el = video.current; if (el && current) { el.load(); el.play().catch(() => {}) } }}>Retry</button>
            </div>
          )}
        </div>
      )}

      {/* top bar */}
      <div className="player-top">
        <button className="player-btn" onClick={onClose} aria-label="Back"><ArrowLeft size={26} /></button>
        <div className="player-title"><strong>{movie.title}</strong>{movie.year ? <span>{movie.year}</span> : null}</div>
      </div>

      {/* centre */}
      {hasSources && (
        <div className="player-centre">
          <button className="player-btn big" onClick={() => skip(-10)} aria-label="Back 10 seconds"><RotateCcw size={34} /><b>10</b></button>
          <button className="player-btn huge" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" />}
          </button>
          <button className="player-btn big" onClick={() => skip(10)} aria-label="Forward 10 seconds"><RotateCw size={34} /><b>10</b></button>
        </div>
      )}

      {/* bottom */}
      {hasSources && (
        <div className="player-bottom">
          <div className="seek-row">
            <input
              className="seek"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(time, duration || 0)}
              aria-label="Seek"
              style={{ ['--p' as string]: `${pct}%`, ['--b' as string]: `${bufPct}%` }}
              onChange={(e) => {
                const el = video.current
                if (el) el.currentTime = Number(e.target.value)
                setTime(Number(e.target.value))
                poke()
              }}
            />
            <span className="seek-time">-{fmt(Math.max(duration - time, 0))}</span>
          </div>
          <div className="controls-row">
            <button className="player-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}</button>
            <button className="player-btn" onClick={() => skip(-10)} aria-label="Back 10 seconds"><RotateCcw size={22} /></button>
            <button className="player-btn" onClick={() => skip(10)} aria-label="Forward 10 seconds"><RotateCw size={22} /></button>
            <div className="vol">
              <button className="player-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>{muted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}</button>
              <input
                type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} aria-label="Volume"
                style={{ ['--p' as string]: `${(muted ? 0 : volume) * 100}%` }}
                onChange={(e) => { const el = video.current; if (!el) return; el.volume = Number(e.target.value); el.muted = Number(e.target.value) === 0 }}
              />
            </div>
            <span className="controls-title">{movie.title}</span>
            <div className="menu-wrap">
              <button className={menu ? 'player-btn player-btn-on' : 'player-btn'} onClick={() => setMenu((v) => !v)} aria-label="Quality and speed" aria-expanded={menu}>
                <Settings size={22} />{current ? <i>{current.quality}</i> : null}
              </button>
              {menu && (
                <div className="player-menu" onClick={(e) => e.stopPropagation()}>
                  <h4>Quality</h4>
                  {sources.map((s) => (
                    <button key={s.url} className={s.url === current?.url ? 'menu-item menu-on' : 'menu-item'} onClick={() => { setPicked(s.url); setMenu(false) }}>
                      <span>{s.quality}{s.kind === 'hls' ? ' · Stream' : ''}</span>{s.url === current?.url ? <Check size={16} /> : null}
                    </button>
                  ))}
                  <h4><Gauge size={13} /> Speed</h4>
                  <div className="speed-grid">
                    {SPEEDS.map((s) => (
                      <button key={s} className={s === speed ? 'speed speed-on' : 'speed'} onClick={() => { const el = video.current; if (el) el.playbackRate = s }}>{s}×</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="player-btn" onClick={toggleFull} aria-label={full ? 'Exit full screen' : 'Full screen'}>{full ? <Minimize size={22} /> : <Maximize size={22} />}</button>
          </div>
        </div>
      )}
    </div>
  )
}
