'use client'

import { Download, LoaderCircle, Play, Star, X } from 'lucide-react'
import type { Movie } from '@/lib/framex'
import { useDetail } from '@/lib/useDetail'
import { Art } from './Art'

export function Detail({ movie: base, onClose, onPlay, onDownload }: { movie: Movie; onClose: () => void; onPlay: (m: Movie) => void; onDownload: (m: Movie) => void }) {
  const { movie, loading } = useDetail(base)
  const playable = movie.sources.length > 0
  return (
    <div className="detail" role="dialog" aria-label={movie.title}>
      <div className="detail-sheet">
        <div className="detail-cover">
          <Art src={movie.backdrop || movie.poster} title={movie.title} eager />
          <div className="detail-cover-shade" />
          <button className="detail-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
          <div className="detail-cover-content">
            <h2>{movie.title}</h2>
            <div className="detail-actions">
              <button className="primary-btn" onClick={() => onPlay(movie)}><Play size={17} fill="currentColor" /> Play</button>
              <button className="glass-btn" onClick={() => onDownload(movie)}><Download size={17} /> Download</button>
            </div>
          </div>
        </div>

        <div className="detail-body">
          <div className="hero-meta">
            {movie.rating ? <span className="rating"><Star size={12} fill="currentColor" /> {movie.rating}</span> : null}
            {movie.year ? <span>{movie.year}</span> : null}
            {movie.runtime ? <span>{movie.runtime}</span> : null}
            <span className="hd-badge">HD</span>
            {loading ? <LoaderCircle className="spin" size={14} /> : playable ? <span className="avail">Streaming available</span> : null}
          </div>
          {movie.genres.length > 0 && <div className="chips">{movie.genres.map((g) => <span key={g}>{g}</span>)}</div>}
          <p className="detail-overview">{movie.overview || `Discover ${movie.title} on CymorFlix.`}</p>

          {movie.cast.length > 0 && (
            <>
              <h3 className="cast-heading">Cast</h3>
              <div className="cast-grid">
                {movie.cast.slice(0, 8).map((p, i) => (
                  <div className="cast-person" key={`${p.name}-${i}`}>
                    <div className="cast-avatar">{p.name.slice(0, 1)}</div>
                    <strong>{p.name}</strong>
                    {p.character ? <span>{p.character}</span> : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
