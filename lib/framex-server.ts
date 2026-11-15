const API_BASE = 'https://framex.wolvarex.com/api'

export class FramexNotConfiguredError extends Error {
  constructor() {
    super('FrameX is not configured')
    this.name = 'FramexNotConfiguredError'
  }
}

export async function fetchFramex(path: string): Promise<Response> {
  const key = process.env.FRAMEX_API_KEY
  if (!key) throw new FramexNotConfiguredError()

  const vercelHost = process.env.VERCEL_URL?.replace(/^https?:\/\//i, '')
  const siteUrl = process.env.SITE_URL || (vercelHost ? `https://${vercelHost}` : 'https://www.cymortechservices.my.id')
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
