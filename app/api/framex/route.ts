import { NextRequest, NextResponse } from 'next/server'

// Paths below already start with /api/v1, so the base must NOT end in /api
const API_BASE = 'https://framex.wolvarex.com'
const slugPattern = /^[\w-]{1,120}$/

function originCandidates(request: NextRequest): string[] {
  const origins: string[] = []

  const addOne = (value: string, skipDeploymentHosts: boolean) => {
    const raw = value.trim()
    if (!raw) return

    try {
      const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
      if (parsed.protocol !== 'https:') return

      const hostname = parsed.hostname.toLowerCase()
      const isLocal =
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('127.') ||
        hostname === '[::1]'
      const isVercelDeployment = hostname === 'vercel.app' || hostname.endsWith('.vercel.app')
      const isCymorHost = hostname === 'cymortechservices.my.id' || hostname.endsWith('.cymortechservices.my.id')
      if (isLocal || (skipDeploymentHosts && (isVercelDeployment || !isCymorHost))) return
      // only accept real hostnames (no commas, spaces or stray characters)
      if (!/^[a-z0-9.-]+$/.test(hostname)) return

      if (!origins.includes(parsed.origin) && origins.length < 5) origins.push(parsed.origin)
    } catch {
      // Ignore malformed optional and proxy host values.
    }
  }

  // A value may hold several entries separated by commas or spaces
  const add = (value: string | null | undefined, skipDeploymentHosts = false) => {
    if (!value) return
    for (const part of value.split(/[\s,]+/)) addOne(part, skipDeploymentHosts)
  }

  add(process.env.SITE_URL)
  add(request.headers.get('x-forwarded-host'), true)
  add(request.headers.get('host'), true)
  add('https://www.cymortechservices.my.id')
  add('https://cymortechservices.my.id')

  return origins
}

function safeDetails(payload: unknown, key: string): string | undefined {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return undefined
  const record = payload as Record<string, unknown>
  const nestedError = record.error && typeof record.error === 'object'
    ? record.error as Record<string, unknown>
    : undefined
  const detail = [
    record.message,
    typeof record.error === 'string' ? record.error : undefined,
    nestedError?.message,
    record.detail,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0)

  if (!detail) return undefined
  return detail
    .replaceAll(key, '[redacted]')
    .replace(/\b(?:fxk|sk|pk)_[A-Za-z0-9_-]{8,}\b/gi, '[redacted]')
    .replace(/((?:x-api-key|api[-_ ]?key|authorization|token)\s*[:=]\s*)[^\s,;]+/gi, '$1[redacted]')
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 300)
}

async function fetchCatalog(path: string, request: NextRequest) {
  const key = process.env.FRAMEX_API_KEY?.trim().replace(/^["']|["']$/g, '').trim()
  if (!key) return { configured: false as const }

  const triedOrigins: string[] = []
  let lastStatus = 502
  let lastDetails: string | undefined

  for (const origin of originCandidates(request)) {
    triedOrigins.push(origin)
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'X-API-Key': key,
        Accept: 'application/json',
        Origin: origin,
        Referer: `${origin}/`,
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(12000),
    })
    const payload = await response.json().catch(() => null)

    if (response.ok) return { configured: true as const, payload }

    lastStatus = response.status
    lastDetails = safeDetails(payload, key)
    if (response.status !== 401 && response.status !== 403) break
  }

  return { configured: true as const, status: lastStatus, details: lastDetails, triedOrigins }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const type = params.get('type') || 'trending'
  const query = params.get('q')?.trim().slice(0, 120) || ''
  // the app sends the slug as `id` (details) or `g` (genre rows); accept both
  const id = (params.get('id') || params.get('g') || '').trim()
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
    const result = await fetchCatalog(path, request)
    if (!result.configured) {
      return NextResponse.json({ error: 'FrameX is not configured' }, { status: 503 })
    }
    if ('status' in result) {
      const error = result.status === 401
        ? 'FrameX rejected the API key or request origin.'
        : result.status === 403
          ? 'FrameX denied the API key or request origin.'
          : 'FrameX catalog request failed.'
      return NextResponse.json(
        { error, details: result.details, triedOrigins: result.triedOrigins },
        { status: result.status, headers: { 'Cache-Control': 'no-store' } },
      )
    }
    return NextResponse.json(result.payload, { headers: { 'Cache-Control': 'private, max-age=60' } })
  } catch {
    return NextResponse.json({ error: 'FrameX could not be reached' }, { status: 502 })
  }
}
