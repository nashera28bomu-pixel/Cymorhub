'use client'

import { useEffect, useState } from 'react'
import { fetchDetail, type Movie } from './framex'

const cache = new Map<string, Movie>()

const merge = (base: Movie, full: Movie): Movie => ({
  ...base,
  ...Object.fromEntries(Object.entries(full).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))),
  id: base.id,
  sources: full.sources.length ? full.sources : base.sources,
  cast: full.cast.length ? full.cast : base.cast,
  genres: full.genres.length ? full.genres : base.genres,
}) as Movie

/** Enriches a movie (cast, sources, runtime...) from the FrameX detail endpoint. */
export function useDetail(movie: Movie) {
  const [full, setFull] = useState<Movie>(() => (cache.has(movie.id) ? merge(movie, cache.get(movie.id)!) : movie))
  const [loading, setLoading] = useState(!cache.has(movie.id))

  useEffect(() => {
    let cancelled = false
    if (cache.has(movie.id)) {
      setFull(merge(movie, cache.get(movie.id)!))
      setLoading(false)
      return
    }
    setLoading(true)
    fetchDetail(movie.id)
      .then((d) => {
        if (cancelled || !d) return
        cache.set(movie.id, d)
        setFull(merge(movie, d))
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [movie])

  return { movie: full, loading }
}
