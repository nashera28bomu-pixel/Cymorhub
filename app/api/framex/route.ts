import { NextRequest, NextResponse } from 'next/server'

const baseUrl = 'https://framex.wolvarex.com/api/v1'

export async function GET(request: NextRequest) {
  const key = process.env.FRAMEX_API_KEY
  if (!key) return NextResponse.json({ error: 'FrameX is not configured' }, { status: 503 })

  const type = request.nextUrl.searchParams.get('type') || 'trending'
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 120)
  const id = request.nextUrl.searchParams.get('id')?.trim().slice(0, 120)

  let path: string
  if (type === 'search' && query) path = `/search?q=${encodeURIComponent(query)}`
  else if (type === 'categories') path = '/categories'
  else if (type === 'detail' && id && /^[\w-]+$/.test(id)) path = `/movies/${encodeURIComponent(id)}`
  else path = '/movies/trending'

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'X-API-Key': key, Accept: 'application/json' },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) return NextResponse.json({ error: 'FrameX request failed', details: payload }, { status: response.status })
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'private, max-age=60' } })
  } catch {
    return NextResponse.json({ error: 'FrameX could not be reached' }, { status: 502 })
  }
}
