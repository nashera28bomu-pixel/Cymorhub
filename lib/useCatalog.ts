'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchTrending, searchMovies, type Movie } from './framex'
import { samples } from './samples'

export const ROW_CATEGORIES = ['Action', 'Nollywood', 'Adventure', 'Drama', 'Comedy', 'Animation', 'Sci-Fi'] as const

export type ApiState = 'connecting' | 'online' | 'offline'

export function useCatalog() {
  const [trending, setTrending] = useState<Movie[]>(samples)
  const [rows, setRows] = useState<Record<string, Movie[]>>({})
  const [apiState, setApiState] = useState<ApiState>('connecting')
  const alive = useRef(true)

  const load = useCallback(async () => {
    setApiState('connecting')
    try {
      const list = await fetchTrending()
      if (!alive.current) return
      if (!list.length) throw new Error('empty')
      setTrending(list)
      setApiState('online')
      const results = await Promise.allSettled(ROW_CATEGORIES.map((c) => searchMovies(c)))
      if (!alive.current) return
      const next: Record<string, Movie[]> = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value.length) next[ROW_CATEGORIES[i]] = r.value.slice(0, 20)
      })
      setRows(next)
    } catch {
      if (!alive.current) return
      setTrending(samples)
      setRows({})
      setApiState('offline')
    }
  }, [])

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  /** Preview mode: build rows from the sample set so the layout is always full. */
  const rowFor = useCallback(
    (category: string): Movie[] => {
      if (rows[category]?.length) return rows[category]
      if (apiState === 'online') {
        const byGenre = trending.filter((m) => m.genres.some((g) => g.toLowerCase() === category.toLowerCase()))
        return byGenre
      }
      const matches = samples.filter((m) => m.genres.some((g) => g.toLowerCase() === category.toLowerCase()))
      return matches.length >= 3 ? matches : [...matches, ...samples.filter((m) => !matches.includes(m))]
    },
    [rows, apiState, trending],
  )

  return { trending, rowFor, apiState, reload: load }
}

export function useSearch(query: string) {
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const list = await searchMovies(q)
        if (!cancelled) setResults(list)
      } catch {
        if (!cancelled) setResults(samples.filter((m) => m.title.toLowerCase().includes(q.toLowerCase())))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 350)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  return { results, loading }
}
