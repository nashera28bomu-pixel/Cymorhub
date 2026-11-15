import { NextRequest, NextResponse } from 'next/server'
import { fetchFramex, FramexNotConfiguredError } from '@/lib/framex-server'

const idPattern = /^[\w-]{1,160}$/
const resolutions = new Set(['auto', '2160', '1440', '1080', '720', '480', '360'])

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const subjectId = params.get('subjectId')?.trim() || ''
  const mode = params.get('mode') || 'stream'
  const resolution = params.get('resolution') || 'auto'
  const season = params.get('season')?.trim()
  const episode = params.get('episode')?.trim()

  if (!idPattern.test(subjectId)) return NextResponse.json({ error: 'A valid content ID is required' }, { status: 400 })
  if (mode !== 'stream' && mode !== 'download') return NextResponse.json({ error: 'Unsupported playback request' }, { status: 400 })
  if (!resolutions.has(resolution)) return NextResponse.json({ error: 'Unsupported resolution' }, { status: 400 })

  const apiParams = new URLSearchParams({ subjectId })
  if (resolution !== 'auto') apiParams.set('resolution', resolution)
  if (season && /^\d{1,3}$/.test(season)) apiParams.set('se', season)
  if (episode && /^\d{1,4}$/.test(episode)) apiParams.set('ep', episode)
  if (mode === 'download') apiParams.set('download', '1')

  try {
    const response = await fetchFramex(`/api/v1/stream-url?${apiParams.toString()}`)
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) return NextResponse.json({ error: 'FrameX could not create a playback link' }, { status: response.status })

    const data = payload && typeof payload === 'object' && 'data' in payload
      ? (payload as Record<string, any>).data
      : payload
    const url = data && typeof data === 'object'
      ? data.url || data.streamUrl || data.stream_url || data.downloadUrl || data.download_url
      : undefined

    if (typeof url !== 'string' || !/^https:\/\//i.test(url)) {
      return NextResponse.json({ error: 'FrameX did not return a secure media URL' }, { status: 502 })
    }

    return NextResponse.json({
      url,
      expiresAt: data.expiresAt || data.expires_at,
      expiresIn: Number(data.expiresIn || data.expires_in) || 600,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof FramexNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json({ error: 'FrameX could not be reached' }, { status: 502 })
  }
}
