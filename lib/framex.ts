/**
 * FrameX adapter.
 * The FrameX payload shape can vary, so everything that touches the raw API response
 * lives in this one file. If your FrameX plan names a field differently, add the
 * alias to the lists below and nothing else needs to change.
 */

export type Source = {
  url: string
  kind: 'file' | 'hls'
  quality: string // "1080p", "720p", "4K" ...
  height: number // 2160, 1080, 720 ... (0 = unknown)
  size?: string
}

export type CastMember = { name: string; character?: string }

export type Movie = {
  id: string
  title: string
  year?: string
  genres: string[]
  poster?: string
  backdrop?: string
  overview?: string
  rating?: string
  runtime?: string
  cast: CastMember[]
  sources: Source[]
}

const TMDB = 'https://image.tmdb.org/t/p/'

type Raw = Record<string, any>

const pick = (o: Raw, keys: string[]): any => {
  for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]
  return undefined
}

const img = (v: unknown, size: 'w500' | 'w1280'): string | undefined => {
  if (typeof v !== 'string' || !v) return undefined
  if (/^https?:\/\//i.test(v) || v.startsWith('data:')) return v
  if (v.startsWith('/')) return `${TMDB}${size}${v}`
  return undefined
}

export function extractList(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload as Raw[]
  if (payload && typeof payload === 'object') {
    const p = payload as Raw
    for (const k of ['results', 'data', 'movies', 'items', 'films']) {
      if (Array.isArray(p[k])) return p[k]
      if (p[k] && typeof p[k] === 'object' && Array.isArray(p[k].results)) return p[k].results
    }
  }
  return []
}

export function heightFrom(text: string): number {
  const t = text.toLowerCase()
  if (/(2160|4k|uhd)/.test(t)) return 2160
  if (/1440/.test(t)) return 1440
  if (/1080/.test(t)) return 1080
  if (/720/.test(t)) return 720
  if (/480/.test(t)) return 480
  if (/360/.test(t)) return 360
  if (/240/.test(t)) return 240
  return 0
}

export const labelFor = (h: number) => (h >= 2160 ? '4K' : h > 0 ? `${h}p` : 'Auto')

const formatBytes = (n: number) => {
  if (!isFinite(n) || n <= 0) return undefined
  const gb = n / 1024 ** 3
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(n / 1024 ** 2)} MB`
}

export function normalizeSources(raw: Raw): Source[] {
  const out: Source[] = []
  const seen = new Set<string>()

  const add = (item: unknown, hint = '') => {
    let url: string | undefined
    let meta: Raw = {}
    if (typeof item === 'string') url = item
    else if (item && typeof item === 'object') {
      meta = item as Raw
      url = pick(meta, ['url', 'src', 'link', 'file', 'stream', 'stream_url', 'streamUrl', 'download_url', 'downloadUrl', 'href'])
    }
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url) || seen.has(url)) return
    seen.add(url)
    const qualityText = String(pick(meta, ['quality', 'resolution', 'label', 'name', 'height', 'res']) ?? '') + ' ' + hint + ' ' + url
    const height = heightFrom(qualityText)
    const isHls = /\.m3u8(\?|$)/i.test(url) || /hls|m3u8/i.test(String(meta.type ?? meta.format ?? ''))
    const isEmbed = /embed|iframe/i.test(String(meta.type ?? ''))
    if (isEmbed) return
    const sizeRaw = pick(meta, ['size', 'filesize', 'file_size', 'bytes'])
    out.push({
      url,
      kind: isHls ? 'hls' : 'file',
      height,
      quality: labelFor(height),
      size: typeof sizeRaw === 'number' ? formatBytes(sizeRaw) : typeof sizeRaw === 'string' ? sizeRaw : undefined,
    })
  }

  for (const key of ['sources', 'streams', 'links', 'downloads', 'files', 'videos', 'qualities']) {
    const v = raw[key]
    if (Array.isArray(v)) v.forEach((i) => add(i))
    else if (v && typeof v === 'object') Object.entries(v as Raw).forEach(([q, i]) => add(i, q))
  }
  for (const key of ['stream_url', 'streamUrl', 'video_url', 'videoUrl', 'hls', 'm3u8', 'download_url', 'downloadUrl', 'mp4']) add(raw[key])

  return out.sort((a, b) => b.height - a.height)
}

export function normalizeMovie(raw: Raw): Movie | null {
  if (!raw || typeof raw !== 'object') return null
  const src: Raw = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? { ...raw, ...raw.data } : raw
  const title = pick(src, ['title', 'name', 'original_title'])
  const id = pick(src, ['id', '_id', 'slug', 'tmdb_id', 'tmdbId', 'imdb_id', 'imdbId'])
  if (!title || id === undefined) return null

  const genresRaw = pick(src, ['genres', 'genre', 'categories', 'category'])
  const genres: string[] = Array.isArray(genresRaw)
    ? genresRaw.map((g: any) => (typeof g === 'string' ? g : g?.name)).filter(Boolean)
    : typeof genresRaw === 'string'
      ? genresRaw.split(/[,/|]/).map((s) => s.trim()).filter(Boolean)
      : []

  const yearRaw = pick(src, ['year', 'release_year', 'release_date', 'releaseDate', 'first_air_date'])
  const ratingRaw = pick(src, ['rating', 'vote_average', 'imdb_rating', 'score'])
  const runtimeRaw = pick(src, ['runtime', 'duration'])
  const castRaw = pick(src, ['cast', 'actors', 'credits'])
  const cast: CastMember[] = Array.isArray(castRaw)
    ? castRaw
        .map((c: any) => (typeof c === 'string' ? { name: c } : { name: c?.name, character: c?.character || c?.role }))
        .filter((c: CastMember) => c.name)
    : []

  let runtime: string | undefined
  if (typeof runtimeRaw === 'number') runtime = `${Math.floor(runtimeRaw / 60)}h ${runtimeRaw % 60}m`
  else if (typeof runtimeRaw === 'string') runtime = runtimeRaw

  const poster = img(pick(src, ['poster', 'poster_url', 'posterUrl', 'poster_path', 'image', 'thumbnail', 'cover']), 'w500')
  const backdrop = img(pick(src, ['backdrop', 'backdrop_url', 'backdropUrl', 'backdrop_path', 'banner', 'background']), 'w1280')

  return {
    id: String(id),
    title: String(title),
    year: yearRaw ? String(yearRaw).slice(0, 4) : undefined,
    genres,
    poster: poster || backdrop,
    backdrop: backdrop || poster,
    overview: pick(src, ['overview', 'description', 'synopsis', 'plot']),
    rating: typeof ratingRaw === 'number' ? ratingRaw.toFixed(1) : ratingRaw ? String(ratingRaw).slice(0, 4) : undefined,
    runtime,
    cast,
    sources: normalizeSources(src),
  }
}

export function normalizeList(payload: unknown): Movie[] {
  return extractList(payload).map(normalizeMovie).filter((m): m is Movie => !!m)
}

/* ---------- client helpers ---------- */

async function call(params: Record<string, string>): Promise<unknown> {
  const res = await fetch(`/api/framex?${new URLSearchParams(params)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`FrameX ${res.status}`)
  return res.json()
}

export const fetchTrending = async () => normalizeList(await call({ type: 'trending' }))
export const searchMovies = async (q: string) => normalizeList(await call({ type: 'search', q }))
export async function fetchDetail(id: string): Promise<Movie | null> {
  return normalizeMovie((await call({ type: 'detail', id })) as Raw)
}
