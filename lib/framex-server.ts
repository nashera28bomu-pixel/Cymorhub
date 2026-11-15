const API_BASE = 'https://framex.wolvarex.com/api'
const DEFAULT_FRAMEX_ORIGIN = 'https://cymortechservices.my.id'

export class FramexNotConfiguredError extends Error {
  constructor() {
    super('FrameX is not configured')
    this.name = 'FramexNotConfiguredError'
  }
}

function framexOrigin(): string {
  // VERCEL_URL is a per-deployment hostname and can be an ephemeral preview
  // domain. FrameX keys may be restricted to the registered site origin, so
  // use the site's canonical domain unless an explicit FrameX override exists.
  const configured = process.env.FRAMEX_SITE_ORIGIN?.trim()
  if (!configured) return DEFAULT_FRAMEX_ORIGIN

  try {
    const parsed = new URL(configured)
    if (parsed.protocol !== 'https:') return DEFAULT_FRAMEX_ORIGIN
    return parsed.origin
  } catch {
    return DEFAULT_FRAMEX_ORIGIN
  }
}

export async function fetchFramex(path: string): Promise<Response> {
  const key = process.env.FRAMEX_API_KEY
  if (!key) throw new FramexNotConfiguredError()

  const siteUrl = framexOrigin()
  return fetch(`${API_BASE}${path}`, {
    headers: {
      'X-API-Key': key,
      Accept: 'application/json',
      Origin: siteUrl,
      Referer: `${siteUrl}/`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  })
}
