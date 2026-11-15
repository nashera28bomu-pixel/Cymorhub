export type FootballMatch = {
  id: string
  home: string
  away: string
  competition?: string
  status?: string
  startTime?: string
  score?: string
  streamUrl?: string
}

type Raw = Record<string, any>

function collect(value: unknown, depth = 0): Raw[] {
  if (depth > 5 || !value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap((item) => collect(item, depth + 1))
  const record = value as Raw
  if (['id', 'matchId', 'match_id', 'fixtureId', 'fixture_id'].some((key) => record[key] !== undefined)) return [record]
  const found: Raw[] = []
  for (const key of ['data', 'results', 'matches', 'events', 'items', 'records', 'fixtures']) {
    if (record[key] !== undefined) found.push(...collect(record[key], depth + 1))
  }
  return found
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') {
    const item = value as Raw
    for (const key of ['name', 'teamName', 'team_name', 'title', 'shortName', 'short_name', 'label']) {
      if (typeof item[key] === 'string' && item[key].trim()) return item[key].trim()
    }
  }
  return undefined
}

function pick(record: Raw, keys: string[]) {
  for (const key of keys) if (record[key] !== undefined && record[key] !== null && record[key] !== '') return record[key]
  return undefined
}

function getMediaUrl(value: unknown, depth = 0, allowDirectUrl = false): string | undefined {
  if (depth > 4 || !value) return undefined
  if (typeof value === 'string') return allowDirectUrl && /^https:\/\//i.test(value) ? value : undefined
  if (typeof value !== 'object') return undefined
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = getMediaUrl(item, depth + 1, true)
      if (found) return found
    }
    return undefined
  }
  const record = value as Raw
  for (const key of ['proxyUrl', 'proxy_url', 'streamUrl', 'stream_url', 'hlsUrl', 'hls_url', 'playUrl', 'play_url', 'mediaUrl', 'videoUrl']) {
    if (typeof record[key] === 'string' && /^https:\/\//i.test(record[key])) return record[key]
  }
  if (allowDirectUrl && typeof record.url === 'string' && /^https:\/\//i.test(record.url)) return record.url
  for (const key of ['stream', 'streams', 'media', 'playback', 'source', 'sources', 'links', 'video']) {
    const child = record[key]
    const found = getMediaUrl(child, depth + 1, true)
    if (found) return found
  }
  return undefined
}

function normalize(record: Raw): FootballMatch | null {
  const id = pick(record, ['matchId', 'match_id', 'fixtureId', 'fixture_id', 'id'])
  if (id === undefined) return null
  const teams = record.teams && typeof record.teams === 'object' ? record.teams : {}
  const home = text(pick(record, ['homeTeam', 'home_team', 'home', 'localTeam', 'local_team', 'team1']) ?? teams.home ?? teams.local)
  const away = text(pick(record, ['awayTeam', 'away_team', 'away', 'visitorTeam', 'visitor_team', 'team2']) ?? teams.away ?? teams.visitor)
  if (!home && !away) return null

  const score = record.score ?? record.scores
  const scoreHome = pick(record, ['homeScore', 'home_score', 'scoreHome']) ?? (score && typeof score === 'object' ? pick(score, ['home', 'local', 'team1']) : undefined)
  const scoreAway = pick(record, ['awayScore', 'away_score', 'scoreAway']) ?? (score && typeof score === 'object' ? pick(score, ['away', 'visitor', 'team2']) : undefined)
  const scoreText = scoreHome !== undefined && scoreAway !== undefined ? `${scoreHome} – ${scoreAway}` : text(score)
  const start = pick(record, ['startTime', 'start_time', 'kickoff', 'kickoffTime', 'date', 'scheduledAt'])

  return {
    id: String(id),
    home: home || 'Home team',
    away: away || 'Away team',
    competition: text(pick(record, ['competition', 'league', 'tournament', 'competitionName'])),
    status: text(pick(record, ['status', 'state', 'matchStatus'])),
    startTime: typeof start === 'string' || typeof start === 'number' ? String(start) : undefined,
    score: scoreText,
    streamUrl: getMediaUrl(record),
  }
}

export function normalizeMatches(payload: unknown): FootballMatch[] {
  return collect(payload).map(normalize).filter((item): item is FootballMatch => !!item)
}

export async function fetchSports(view: 'ongoing' | 'matches' | 'replays'): Promise<FootballMatch[]> {
  const response = await fetch(`/api/framex/sports?view=${view}`, { cache: 'no-store' })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error || 'Could not load football data')
  return normalizeMatches(payload)
}
