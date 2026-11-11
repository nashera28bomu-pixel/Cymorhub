'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Movie } from '@/lib/framex'
import { ROW_CATEGORIES, useCatalog } from '@/lib/useCatalog'
import { useStore } from '@/lib/store'
import { APP_NAME, APP_VERSION, DEVELOPER } from '@/lib/app'
import { Intro } from './Intro'
import { Hero } from './Hero'
import { MovieRow } from './MovieRow'
import { BottomNav, TopBar, type Tab } from './Nav'
import { Detail } from './Detail'
import { Player } from './Player'
import { DownloadSheet } from './DownloadSheet'
import { DownloadsView, FootballView, SearchView, SettingsView } from './Views'

type Overlay = { type: 'detail' | 'player' | 'download'; movie: Movie }

export function App() {
  const { ready, settings, downloads } = useStore()
  const { trending, rowFor, apiState, reload } = useCatalog()
  const [intro, setIntro] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('home')
  const [stack, setStack] = useState<Overlay[]>([])
  const stackRef = useRef<Overlay[]>([])
  const [scrolled, setScrolled] = useState(false)

  /* decide once whether the intro should play */
  useEffect(() => {
    if (ready && intro === null) setIntro(settings.intro)
  }, [ready, intro, settings.intro])

  /* overlay stack, wired to the browser/Android back button */
  const open = useCallback((type: Overlay['type'], movie: Movie) => {
    const next = [...stackRef.current, { type, movie }]
    stackRef.current = next
    setStack(next)
    window.history.pushState({ depth: next.length }, '')
  }, [])
  const close = useCallback(() => {
    if (stackRef.current.length) window.history.back()
  }, [])
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const depth = (e.state && typeof e.state.depth === 'number' ? e.state.depth : 0) as number
      stackRef.current = stackRef.current.slice(0, depth)
      setStack(stackRef.current)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.body.style.overflow = stack.length || intro ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [stack.length, intro])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTab = useCallback((t: Tab) => {
    setTab(t)
    window.scrollTo({ top: 0 })
  }, [])

  const goDownloads = useCallback(() => {
    const n = stackRef.current.length
    stackRef.current = []
    setStack([])
    if (n) window.history.go(-n)
    goTab('downloads')
  }, [goTab])

  const openDetail = useCallback((m: Movie) => open('detail', m), [open])
  const play = useCallback((m: Movie) => open('player', m), [open])
  const download = useCallback((m: Movie) => open('download', m), [open])
  const playId = useCallback((id: string) => {
    const rec = downloads.find((d) => d.movieId === id)
    if (rec) open('player', { id, title: rec.title, poster: rec.poster, backdrop: rec.poster, genres: [], cast: [], sources: [] })
  }, [downloads, open])

  if (intro === null) return <div className="boot" />

  return (
    <>
      {intro && <Intro onDone={() => setIntro(false)} />}
      <main className="app-shell" aria-hidden={stack.length > 0 || undefined}>
        <TopBar tab={tab} onTab={goTab} scrolled={scrolled} badge={downloads.length} />

        {tab === 'home' && (
          <>
            <Hero movies={trending} autoRotate={settings.heroAutoRotate} onPlay={play} onInfo={openDetail} onDownload={download} />
            <div className="catalog">
              {apiState === 'offline' && <div className="notice">Preview catalog · add your <code>FRAMEX_API_KEY</code> in Vercel to load the live library.</div>}
              <MovieRow title="Trending Now" movies={trending.slice(0, 20)} onOpen={openDetail} />
              <MovieRow title="Top 10 Today" movies={trending.slice(0, 10)} onOpen={openDetail} ranked />
              {ROW_CATEGORIES.map((c) => <MovieRow key={c} title={c} movies={rowFor(c)} onOpen={openDetail} />)}
              <p className="legal">{APP_NAME} {APP_VERSION} · by {DEVELOPER}</p>
            </div>
          </>
        )}
        {tab === 'search' && <SearchView onOpen={openDetail} />}
        {tab === 'football' && <FootballView onHome={() => goTab('home')} />}
        {tab === 'downloads' && <DownloadsView onHome={() => goTab('home')} onPlayId={playId} />}
        {tab === 'settings' && <SettingsView apiState={apiState} onReload={reload} onReplayIntro={() => setIntro(true)} />}

        <BottomNav tab={tab} onTab={goTab} badge={downloads.length} />
      </main>

      {stack.map((o, i) =>
        o.type === 'detail' ? <Detail key={i} movie={o.movie} onClose={close} onPlay={play} onDownload={download} />
        : o.type === 'player' ? <Player key={i} movie={o.movie} onClose={close} />
        : <DownloadSheet key={i} movie={o.movie} onClose={close} onGoDownloads={goDownloads} />,
      )}
    </>
  )
}
