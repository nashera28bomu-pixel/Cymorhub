import { NextRequest, NextResponse } from 'next/server'
import { fetchFramex, FramexNotConfiguredError } from '@/lib/framex-server'

const slugPattern = /^[\w-]{1,120}$/

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const type = params.get('type') || 'trending'
  const query = params.get('q')?.trim().slice(0, 120) || ''
  const id = params.get('id')?.trim() || ''
  const pageRaw = Number(params.get('page') || '1')
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 100) : 1
  const pageQuery = `?page=${page}`
  let path: string

  switch (type) {
    case 'trending':
      path = `/api/v1/movies/trending${pageQuery}`
      break
    case 'popular':
      path = `/api/v1/movies/popular${pageQuery}`
      break
    case 'latest':
      path = `/api/v1/movies/latest${pageQuery}`
      break
    case 'series':
      path = `/api/v1/series/popular${pageQuery}`
      break
    case 'upcoming':
      path = '/api/v1/movies/upcoming'
      break
    case 'search':
      if (!query) return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
      path = `/api/v1/search?q=${encodeURIComponent(query)}&page=${page}`
      break
    case 'categories':
      path = '/api/v1/categories'
      break
    case 'category':
      if (!slugPattern.test(id)) return NextResponse.json({ error: 'A valid category slug is required' }, { status: 400 })
      path = `/api/v1/categories/${encodeURIComponent(id)}${pageQuery}`
      break
    case 'genres':
      path = '/api/v1/genres'
      break
    case 'genre':
      if (!slugPattern.test(id)) return NextResponse.json({ error: 'A valid genre slug is required' }, { status: 400 })
      path = `/api/v1/genres/${encodeURIComponent(id)}${pageQuery}`
      break
    case 'detail':
      if (!slugPattern.test(id)) return NextResponse.json({ error: 'A valid title slug is required' }, { status: 400 })
      path = `/api/v1/movies/${encodeURIComponent(id)}`
      break
    default:
      return NextResponse.json({ error: 'Unsupported catalog request' }, { status: 400 })
  }

  try {
    const response = await fetchFramex(path)
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) return NextResponse.json({ error: 'FrameX catalog request failed' }, { status: response.status })
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'private, max-age=60' } })
  } catch (error) {
    if (error instanceof FramexNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json({ error: 'FrameX could not be reached' }, { status: 502 })
  }
}
