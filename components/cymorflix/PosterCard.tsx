'use client'

import { Play, Star } from 'lucide-react'
import type { Movie } from '@/lib/framex'
import { Art } from './Art'

export function PosterCard({ movie, onOpen, rank }: { movie: Movie; onOpen: (m: Movie) => void; rank?: number }) {
  return (
    <button className={rank ? 'poster-card poster-ranked' : 'poster-card'} onClick={() => onOpen(movie)} aria-label={`Open ${movie.title}`}>
      {rank ? <span className="rank-num" aria-hidden="true">{rank}</span> : null}
      <span className="poster-3d">
        <span className="poster-art">
          <Art src={movie.poster} title={movie.title} />
          <span className="poster-shine" />
          <span className="poster-play"><Play fill="currentColor" size={18} /></span>
          {movie.rating ? <span className="poster-rating"><Star size={9} fill="currentColor" /> {movie.rating}</span> : null}
        </span>
      </span>
      <span className="poster-title">{movie.title}</span>
      <span className="poster-info">{movie.year || '—'} <span>•</span> {movie.genres[0] || 'Film'}</span>
    </button>
  )
}
