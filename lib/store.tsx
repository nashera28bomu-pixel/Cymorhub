'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Settings = {
  intro: boolean
  heroAutoRotate: boolean
  effects3d: boolean
  resume: boolean
  playbackQuality: 'auto' | '2160' | '1080' | '720' | '480'
  downloadQuality: 'ask' | '2160' | '1080' | '720' | '480'
}

export const defaultSettings: Settings = {
  intro: true,
  heroAutoRotate: true,
  effects3d: true,
  resume: true,
  playbackQuality: 'auto',
  downloadQuality: 'ask',
}

export type DownloadRecord = {
  key: string
  movieId: string
  title: string
  poster?: string
  quality: string
  size?: string
  url: string
  at: number
}

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? { ...(typeof fallback === 'object' && !Array.isArray(fallback) ? fallback : {}), ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}
const readArray = <T,>(key: string): T[] => {
  try {
    const v = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked */
  }
}

type Ctx = {
  ready: boolean
  settings: Settings
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  downloads: DownloadRecord[]
  addDownload: (d: Omit<DownloadRecord, 'key' | 'at'>) => void
  removeDownload: (key: string) => void
  clearDownloads: () => void
  resetAll: () => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [downloads, setDownloads] = useState<DownloadRecord[]>([])

  useEffect(() => {
    setSettings(read('cymorflix:settings', defaultSettings))
    setDownloads(readArray<DownloadRecord>('cymorflix:downloads'))
    setReady(true)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.fx = settings.effects3d ? 'on' : 'off'
  }, [settings.effects3d])

  const setSetting = useCallback<Ctx['setSetting']>((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      write('cymorflix:settings', next)
      return next
    })
  }, [])

  const addDownload = useCallback<Ctx['addDownload']>((d) => {
    setDownloads((prev) => {
      const key = `${d.movieId}-${d.quality}`
      const next = [{ ...d, key, at: Date.now() }, ...prev.filter((x) => x.key !== key)].slice(0, 100)
      write('cymorflix:downloads', next)
      return next
    })
  }, [])

  const removeDownload = useCallback((key: string) => {
    setDownloads((prev) => {
      const next = prev.filter((d) => d.key !== key)
      write('cymorflix:downloads', next)
      return next
    })
  }, [])

  const clearDownloads = useCallback(() => {
    setDownloads([])
    write('cymorflix:downloads', [])
  }, [])

  const resetAll = useCallback(() => {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('cymorflix:'))
        .forEach((k) => window.localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
    setSettings(defaultSettings)
    setDownloads([])
  }, [])

  const value = useMemo(
    () => ({ ready, settings, setSetting, downloads, addDownload, removeDownload, clearDownloads, resetAll }),
    [ready, settings, setSetting, downloads, addDownload, removeDownload, clearDownloads, resetAll],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/* playback resume positions */
export const getResume = (id: string): number => {
  try {
    return Number(window.localStorage.getItem(`cymorflix:pos:${id}`)) || 0
  } catch {
    return 0
  }
}
export const saveResume = (id: string, seconds: number) => {
  try {
    if (seconds > 5) window.localStorage.setItem(`cymorflix:pos:${id}`, String(Math.floor(seconds)))
    else window.localStorage.removeItem(`cymorflix:pos:${id}`)
  } catch {
    /* ignore */
  }
}
