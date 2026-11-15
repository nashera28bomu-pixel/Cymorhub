import { NextRequest, NextResponse } from 'next/server'
import { fetchFramex, FramexNotConfiguredError } from '@/lib/framex-server'

const idPattern = /^[\w.-]{1,160}$/

function collectObjects(value: unknown, depth = 0): Record<string, any>[] {
  if (depth > 5 || !value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap((item) => collectObjects(item, depth + 1))
  const record = value as Record<string, any>
  const found: Record<string, any>[] = []
  if (['id', 'matchId', 'match_id', 'fixtureId', 'fixture_id'].some((key) => record[key] !== undefined)) found.push(record)
  for (const [key, child] of Object.entries(record)) {
    if (['data', 'results', 'matches', 'events', 'items', 'records', 'fixtures'].includes(key)) {
      found.push(...collectObjects(child, depth + 1))
    }
  }
  return found
}

function getMediaUrl(value: unknown, depth = 0, allowDirectUrl = false): string | undefined {
  if (depth > 4 || !value) return undefined
  if (typeof value === 'string') return allowDirectUrl && /^https:\/\//i.test(value) ? value : undefined
  if (typeof value !== 'object') return undefined
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = getMediaUrl(item, depth + 1, true)
      if (url) return url
    }
    return undefined
  }
  const record = value as Record<string, any>
  for (const key of ['proxyUrl', 'proxy_url', 'streamUrl', 'stream_url', 'hlsUrl', 'hls_url', 'playUrl', 'play_url', 'mediaUrl', 'videoUrl']) {
    if (typeof record[key] === 'string' && /^https:\/\//i.test(record[key])) return record[key]
  }
  if (allowDirectUrl && typeof record.url === 'string' && /^https:\/\//i.test(record.url)) return record.url
  for (const key of ['stream', 'streams', 'media', 'playback', 'source', 'sources', 'links', 'video']) {
    const child = record[key]
    const url = getMediaUrl(child, depth + 1, true)
    if (url) return url
  }
  return undefined
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const view = params.get('view') || 'ongoing'
  const matchId = params.get('matchId')?.trim()
  const endpoints: Record<string, string> = {
    ongoing: '/api/v1/sports/ongoing',
    matches: '/api/v1/sports/matches',
    replays: '/api/v1/sports/replays',
  }

  if (view === 'stream') {
    if (!matchId || !idPattern.test(matchId)) {
      return NextResponse.json({ error: 'A valid match ID is required' }, { status: 400 })
    }
  } else if (!endpoints[view]) {
    return NextResponse.json({ error: 'Unsupported sports request' }, { status: 400 })
  }

  try {
    const path = view === 'stream' ? endpoints.ongoing : endpoints[view]
    const response = await fetchFramex(path)
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) return NextResponse.json({ error: 'FrameX sports request failed' }, { status: response.status })

    if (view === 'stream') {
      const matches = collectObjects(payload)
      const match = matches.find((item) =>
        [item.id, item.matchId, item.match_id, item.fixtureId, item.fixture_id]
          .some((id) => id !== undefined && String(id) === matchId),
      )
      const url = match && getMediaUrl(match)
      if (!url) return NextResponse.json({ error: 'No live stream is available for this match' }, { status: 404 })
      return NextResponse.json({ url, expiresIn: 600 }, { headers: { 'Cache-Control': 'no-store' } })
    }

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof FramexNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json({ error: 'FrameX could not be reached' }, { status: 502 })
  }
}
