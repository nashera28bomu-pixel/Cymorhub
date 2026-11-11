'use client'

import { useRef, useState } from 'react'
import { Check, ChevronRight, Download, Play, RefreshCw, Search as SearchIcon, Sparkles, Trash2, Trophy, X } from 'lucide-react'
import type { Movie } from '@/lib/framex'
import { useSearch, type ApiState } from '@/lib/useCatalog'
import { useStore, type Settings } from '@/lib/store'
import { APP_BUILD, APP_NAME, APP_VERSION, COMPANY, DEVELOPER, LOCATION } from '@/lib/app'
import { Art } from './Art'
import { LogoMark } from './Logo'
import { PosterCard } from './PosterCard'

/* ---------------------------------- Search ---------------------------------- */
export function SearchView({ onOpen }: { onOpen: (m: Movie) => void }) {
  const [q, setQ] = useState('')
  const { results, loading } = useSearch(q)
  return (
    <section className="inner-page">
      <span className="section-kicker">DISCOVER</span>
      <h1>Search</h1>
      <label className="search-field">
        <SearchIcon size={18} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titles, genres, people" aria-label="Search movies" />
        {q ? <button onClick={() => setQ('')} aria-label="Clear search"><X size={16} /></button> : null}
      </label>
      {loading && <p className="page-intro">Searching…</p>}
      {!loading && q.trim().length >= 2 && results.length === 0 && <p className="page-intro">No titles found for “{q}”.</p>}
      {q.trim().length < 2 && <p className="page-intro">Type at least two letters to search the catalog.</p>}
      <div className="poster-grid">
        {results.map((m, i) => <PosterCard key={`${m.id}-${i}`} movie={m} onOpen={onOpen} />)}
      </div>
    </section>
  )
}

/* --------------------------------- Football --------------------------------- */
export function FootballView({ onHome }: { onHome: () => void }) {
  return (
    <section className="inner-page football">
      <span className="section-kicker">MATCHDAY</span>
      <h1>Football</h1>
      <p className="page-intro">Fixtures, live scores and match streams.</p>
      <div className="ball-stage" aria-hidden="true">
        <div className="pitch" />
        <div className="ball"><i /><i /><i /><i /><i /><i /></div>
        <div className="ball-shadow" />
      </div>
      <div className="empty-state">
        <div className="empty-icon"><Trophy size={26} /></div>
        <h2>The pitch is being prepared</h2>
        <p>Live matches and fixtures haven&apos;t been connected to CymorFlix yet. Meanwhile, there&apos;s a whole cinema waiting for you.</p>
        <button className="glass-btn" onClick={onHome}>Explore movies</button>
      </div>
    </section>
  )
}

/* -------------------------------- Downloads --------------------------------- */
export function DownloadsView({ onHome, onPlayId }: { onHome: () => void; onPlayId: (id: string) => void }) {
  const { downloads, removeDownload, clearDownloads } = useStore()
  return (
    <section className="inner-page">
      <span className="section-kicker">YOUR LIBRARY</span>
      <div className="page-head">
        <h1>Downloads</h1>
        {downloads.length > 0 && <button className="text-btn" onClick={clearDownloads}>Clear all</button>}
      </div>
      {downloads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Download size={26} /></div>
          <h2>Nothing downloaded yet</h2>
          <p>Tap Download on any movie, pick a quality, and it will be listed here.</p>
          <button className="glass-btn" onClick={onHome}>Browse titles</button>
        </div>
      ) : (
        <>
          <p className="page-intro">Files are saved by your device&apos;s download manager. This list is your history on this device.</p>
          <ul className="dl-list">
            {downloads.map((d) => (
              <li key={d.key} className="dl-item">
                <div className="dl-item-art"><Art src={d.poster} title={d.title} /></div>
                <div className="dl-item-text">
                  <strong>{d.title}</strong>
                  <span>{d.quality}{d.size ? ` · ${d.size}` : ''} · {new Date(d.at).toLocaleDateString()}</span>
                </div>
                <button className="icon-btn" onClick={() => onPlayId(d.movieId)} aria-label={`Play ${d.title}`}><Play size={18} /></button>
                <button className="icon-btn" onClick={() => removeDownload(d.key)} aria-label={`Remove ${d.title}`}><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

/* --------------------------------- Settings --------------------------------- */
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={on ? 'switch switch-on' : 'switch'} onClick={() => onChange(!on)}>
      <i />
    </button>
  )
}

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div><span>{title}</span>{hint ? <small>{hint}</small> : null}</div>
      <div className="settings-ctl">{children}</div>
    </div>
  )
}

function Select<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <select className="select" value={value} aria-label={label} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

export function SettingsView({ apiState, onReload, onReplayIntro }: { apiState: ApiState; onReload: () => void; onReplayIntro: () => void }) {
  const { settings, setSetting, resetAll, downloads } = useStore()
  const card = useRef<HTMLDivElement>(null)
  const [confirm, setConfirm] = useState(false)
  const [reloaded, setReloaded] = useState(false)

  const tilt = (e: React.MouseEvent | React.TouchEvent) => {
    const el = card.current
    if (!el) return
    const p = 'touches' in e ? e.touches[0] : e
    const r = el.getBoundingClientRect()
    el.style.setProperty('--rx', `${(-((p.clientY - r.top) / r.height - 0.5) * 16).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(((p.clientX - r.left) / r.width - 0.5) * 22).toFixed(2)}deg`)
  }
  const untilt = () => {
    card.current?.style.setProperty('--rx', '0deg')
    card.current?.style.setProperty('--ry', '0deg')
  }

  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => setSetting(k, v)
  const status = apiState === 'online' ? 'FrameX connected' : apiState === 'connecting' ? 'Connecting…' : 'Preview mode'

  return (
    <section className="inner-page settings">
      <span className="section-kicker">YOUR EXPERIENCE</span>
      <h1>Settings</h1>

      {/* developer credit */}
      <div className="dev-stage" onMouseMove={tilt} onMouseLeave={untilt} onTouchMove={tilt} onTouchEnd={untilt}>
        <div className="dev-card" ref={card}>
          <div className="dev-orbit" aria-hidden="true"><i /><i /><i /></div>
          <div className="dev-logo"><LogoMark size={74} glow /></div>
          <p className="dev-kicker"><Sparkles size={12} /> DESIGNED &amp; DEVELOPED BY</p>
          <h2 className="dev-name">{DEVELOPER}</h2>
          <p className="dev-role">Founder &amp; Lead Developer · {COMPANY}</p>
          <p className="dev-loc">Crafted with passion in {LOCATION}</p>
          <div className="dev-version"><b>{APP_NAME}</b><span>Version {APP_VERSION}</span></div>
          <span className="dev-shine" />
        </div>
      </div>

      <h3 className="settings-heading">Playback</h3>
      <div className="settings-card">
        <Row title="Preferred quality" hint="Used when a movie starts">
          <Select label="Preferred playback quality" value={settings.playbackQuality} onChange={set('playbackQuality')} options={[{ v: 'auto', l: 'Best available' }, { v: '2160', l: '4K' }, { v: '1080', l: '1080p' }, { v: '720', l: '720p' }, { v: '480', l: '480p' }]} />
        </Row>
        <Row title="Resume where you left off" hint="Remember your position in each movie"><Toggle label="Resume playback" on={settings.resume} onChange={set('resume')} /></Row>
      </div>

      <h3 className="settings-heading">Downloads</h3>
      <div className="settings-card">
        <Row title="Default quality" hint="Highlighted in the download screen">
          <Select label="Default download quality" value={settings.downloadQuality} onChange={set('downloadQuality')} options={[{ v: 'ask', l: 'Always ask' }, { v: '2160', l: '4K' }, { v: '1080', l: '1080p' }, { v: '720', l: '720p' }, { v: '480', l: '480p' }]} />
        </Row>
        <Row title="Download history" hint={`${downloads.length} item${downloads.length === 1 ? '' : 's'} on this device`}>
          <span className="settings-muted">Manage in Downloads</span>
        </Row>
      </div>

      <h3 className="settings-heading">Appearance</h3>
      <div className="settings-card">
        <Row title="3D effects" hint="Tilt, depth and motion"><Toggle label="3D effects" on={settings.effects3d} onChange={set('effects3d')} /></Row>
        <Row title="Rotate featured titles" hint="Auto-advance the home banner"><Toggle label="Rotate featured titles" on={settings.heroAutoRotate} onChange={set('heroAutoRotate')} /></Row>
        <Row title="Show intro on launch" hint="The CymorFlix opening animation"><Toggle label="Show intro on launch" on={settings.intro} onChange={set('intro')} /></Row>
        <Row title="Replay intro"><button className="pill-btn" onClick={onReplayIntro}><Play size={13} fill="currentColor" /> Play</button></Row>
      </div>

      <h3 className="settings-heading">Catalog</h3>
      <div className="settings-card">
        <Row title="Source"><strong className={apiState === 'online' ? 'ok' : ''}>{status}</strong></Row>
        <Row title="Refresh catalog" hint="Reload trending and categories">
          <button className="pill-btn" onClick={() => { onReload(); setReloaded(true); window.setTimeout(() => setReloaded(false), 1800) }}>
            {reloaded ? <><Check size={13} /> Refreshed</> : <><RefreshCw size={13} /> Refresh</>}
          </button>
        </Row>
      </div>

      <h3 className="settings-heading">About</h3>
      <div className="settings-card">
        <Row title="App"><strong>{APP_NAME}</strong></Row>
        <Row title="Version"><strong>{APP_VERSION}</strong></Row>
        <Row title="Build"><strong>{APP_BUILD}</strong></Row>
        <Row title="Developer"><strong>{DEVELOPER}</strong></Row>
        <Row title="Company"><strong>{COMPANY}</strong></Row>
      </div>

      <h3 className="settings-heading">Data</h3>
      <div className="settings-card">
        <Row title="Reset CymorFlix" hint="Clears settings, history and saved positions on this device">
          {confirm ? (
            <span className="confirm"><button className="pill-btn pill-danger" onClick={() => { resetAll(); setConfirm(false) }}>Confirm</button><button className="pill-btn" onClick={() => setConfirm(false)}>Cancel</button></span>
          ) : (
            <button className="pill-btn pill-danger" onClick={() => setConfirm(true)}><ChevronRight size={13} /> Reset</button>
          )}
        </Row>
      </div>

      <p className="legal">© {new Date().getFullYear()} {COMPANY}. All rights reserved.<br />{APP_NAME} {APP_VERSION} · by {DEVELOPER}</p>
    </section>
  )
}
