'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Movie } from '@/lib/framex'
import { PosterCard } from './PosterCard'

export function MovieRow({ title, movies, onOpen, ranked = false }: { title: string; movies: Movie[]; onOpen: (m: Movie) => void; ranked?: boolean }) {
  const track = useRef<HTMLDivElement>(null)
  if (!movies.length) return null
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: 'smooth' })
  return (
    <section className="movie-row" aria-label={title}>
      <div className="row-heading">
        <h3>{title}</h3>
        <div className="row-arrows">
          <button onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}><ChevronLeft size={16} /></button>
          <button onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className={ranked ? 'poster-track poster-track-ranked' : 'poster-track'} ref={track}>
        {movies.map((m, i) => (
          <PosterCard key={`${m.id}-${i}`} movie={m} onOpen={onOpen} rank={ranked ? i + 1 : undefined} />
        ))}
      </div>
    </section>
  )
}
