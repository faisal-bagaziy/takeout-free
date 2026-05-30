import { getDb } from '~/database'
import { match } from '~/database/schema-public'

// WC2026: 48 teams, 12 groups of 4, kickoff Jun 11 - Jul 19 2026
// All times are Unix ms (UTC)
const d = (iso: string) => new Date(iso).getTime()

const TEAMS: Record<string, { name: string; flag: string }> = {
  USA: { name: 'United States', flag: '🇺🇸' },
  MEX: { name: 'Mexico', flag: '🇲🇽' },
  CAN: { name: 'Canada', flag: '🇨🇦' },
  BRA: { name: 'Brazil', flag: '🇧🇷' },
  ARG: { name: 'Argentina', flag: '🇦🇷' },
  COL: { name: 'Colombia', flag: '🇨🇴' },
  URU: { name: 'Uruguay', flag: '🇺🇾' },
  ECU: { name: 'Ecuador', flag: '🇪🇨' },
  PER: { name: 'Peru', flag: '🇵🇪' },
  VEN: { name: 'Venezuela', flag: '🇻🇪' },
  CHL: { name: 'Chile', flag: '🇨🇱' },
  PAR: { name: 'Paraguay', flag: '🇵🇾' },
  ENG: { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  FRA: { name: 'France', flag: '🇫🇷' },
  ESP: { name: 'Spain', flag: '🇪🇸' },
  GER: { name: 'Germany', flag: '🇩🇪' },
  POR: { name: 'Portugal', flag: '🇵🇹' },
  NED: { name: 'Netherlands', flag: '🇳🇱' },
  BEL: { name: 'Belgium', flag: '🇧🇪' },
  ITA: { name: 'Italy', flag: '🇮🇹' },
  SUI: { name: 'Switzerland', flag: '🇨🇭' },
  AUT: { name: 'Austria', flag: '🇦🇹' },
  CRO: { name: 'Croatia', flag: '🇭🇷' },
  DEN: { name: 'Denmark', flag: '🇩🇰' },
  SRB: { name: 'Serbia', flag: '🇷🇸' },
  POL: { name: 'Poland', flag: '🇵🇱' },
  TUR: { name: 'Turkey', flag: '🇹🇷' },
  UKR: { name: 'Ukraine', flag: '🇺🇦' },
  WAL: { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  SCO: { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  MAR: { name: 'Morocco', flag: '🇲🇦' },
  SEN: { name: 'Senegal', flag: '🇸🇳' },
  NGA: { name: 'Nigeria', flag: '🇳🇬' },
  CMR: { name: 'Cameroon', flag: '🇨🇲' },
  EGY: { name: 'Egypt', flag: '🇪🇬' },
  CIV: { name: "Côte d'Ivoire", flag: '🇨🇮' },
  GHA: { name: 'Ghana', flag: '🇬🇭' },
  TUN: { name: 'Tunisia', flag: '🇹🇳' },
  ALG: { name: 'Algeria', flag: '🇩🇿' },
  RSA: { name: 'South Africa', flag: '🇿🇦' },
  JPN: { name: 'Japan', flag: '🇯🇵' },
  KOR: { name: 'South Korea', flag: '🇰🇷' },
  AUS: { name: 'Australia', flag: '🇦🇺' },
  IRN: { name: 'Iran', flag: '🇮🇷' },
  SAU: { name: 'Saudi Arabia', flag: '🇸🇦' },
  QAT: { name: 'Qatar', flag: '🇶🇦' },
  NZL: { name: 'New Zealand', flag: '🇳🇿' },
  CON: { name: 'Concacaf P/O', flag: '🌍' },
}

const GROUPS: Record<string, [string, string, string, string]> = {
  A: ['USA', 'PAN', 'BLZ', 'BOL'] as any,
  B: ['MEX', 'JPN', 'PER', 'NZL'],
  C: ['BRA', 'SUI', 'COL', 'TUN'],
  D: ['ARG', 'POL', 'EGY', 'KOR'],
  E: ['FRA', 'URU', 'AUS', 'ALG'],
  F: ['ENG', 'ECU', 'NGA', 'SCO'],
  G: ['GER', 'ESP', 'CMR', 'QAT'],
  H: ['POR', 'NED', 'SEN', 'IRN'],
  I: ['ITA', 'CHL', 'MAR', 'DEN'],
  J: ['BEL', 'CAN', 'SRB', 'RSA'],
  K: ['CRO', 'TUR', 'CIV', 'GHA'],
  L: ['SAU', 'UKR', 'PAR', 'VEN'],
}

const VENUES = [
  'MetLife Stadium, New Jersey',
  'AT&T Stadium, Dallas',
  'SoFi Stadium, Los Angeles',
  "Levi's Stadium, San Francisco",
  'Arrowhead Stadium, Kansas City',
  'Empower Field, Denver',
  'Estadio Azteca, Mexico City',
  'BMO Field, Toronto',
  'BC Place, Vancouver',
  'NRG Stadium, Houston',
  'Lincoln Financial Field, Philadelphia',
  'Gillette Stadium, Boston',
  'Hard Rock Stadium, Miami',
  'Camping World Stadium, Orlando',
  'Seattle Sounders Stadium, Seattle',
]

let matchCounter = 0

function makeGroupMatches(
  group: string,
  teamKeys: string[],
  matchdayDates: [string, string, string, string, string, string],
) {
  const pairs: [number, number][] = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ]

  const matchdays = [1, 1, 2, 2, 3, 3]

  return pairs.map(([i, j], idx) => {
    const homeKey = teamKeys[i]!
    const awayKey = teamKeys[j]!
    const homeTeam = TEAMS[homeKey] || { name: homeKey, flag: '🏳' }
    const awayTeam = TEAMS[awayKey] || { name: awayKey, flag: '🏳' }

    matchCounter++
    return {
      id: `group-${group}-${idx + 1}`,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeFlag: homeTeam.flag,
      awayFlag: awayTeam.flag,
      kickoffAt: d(matchdayDates[idx]!),
      homeScore: null,
      awayScore: null,
      avgHomeScore: null,
      avgAwayScore: null,
      status: 'scheduled' as const,
      matchday: matchdays[idx]!,
      stage: 'group' as const,
      group,
      venue: VENUES[matchCounter % VENUES.length]!,
    }
  })
}

const GROUP_DATES: Record<string, [string, string, string, string, string, string]> = {
  A: ['2026-06-11T19:00:00Z', '2026-06-11T22:00:00Z', '2026-06-15T19:00:00Z', '2026-06-15T22:00:00Z', '2026-06-19T22:00:00Z', '2026-06-19T22:00:00Z'],
  B: ['2026-06-12T16:00:00Z', '2026-06-12T19:00:00Z', '2026-06-16T16:00:00Z', '2026-06-16T19:00:00Z', '2026-06-20T18:00:00Z', '2026-06-20T18:00:00Z'],
  C: ['2026-06-12T22:00:00Z', '2026-06-13T01:00:00Z', '2026-06-16T22:00:00Z', '2026-06-17T01:00:00Z', '2026-06-21T18:00:00Z', '2026-06-21T18:00:00Z'],
  D: ['2026-06-13T16:00:00Z', '2026-06-13T19:00:00Z', '2026-06-17T16:00:00Z', '2026-06-17T19:00:00Z', '2026-06-22T18:00:00Z', '2026-06-22T18:00:00Z'],
  E: ['2026-06-13T22:00:00Z', '2026-06-14T01:00:00Z', '2026-06-17T22:00:00Z', '2026-06-18T01:00:00Z', '2026-06-22T22:00:00Z', '2026-06-22T22:00:00Z'],
  F: ['2026-06-14T16:00:00Z', '2026-06-14T19:00:00Z', '2026-06-18T16:00:00Z', '2026-06-18T19:00:00Z', '2026-06-23T18:00:00Z', '2026-06-23T18:00:00Z'],
  G: ['2026-06-14T22:00:00Z', '2026-06-15T01:00:00Z', '2026-06-18T22:00:00Z', '2026-06-19T01:00:00Z', '2026-06-23T22:00:00Z', '2026-06-23T22:00:00Z'],
  H: ['2026-06-15T16:00:00Z', '2026-06-15T19:00:00Z', '2026-06-19T16:00:00Z', '2026-06-19T19:00:00Z', '2026-06-24T18:00:00Z', '2026-06-24T18:00:00Z'],
  I: ['2026-06-15T22:00:00Z', '2026-06-16T01:00:00Z', '2026-06-19T22:00:00Z', '2026-06-20T01:00:00Z', '2026-06-24T22:00:00Z', '2026-06-24T22:00:00Z'],
  J: ['2026-06-16T16:00:00Z', '2026-06-16T19:00:00Z', '2026-06-20T16:00:00Z', '2026-06-20T19:00:00Z', '2026-06-25T18:00:00Z', '2026-06-25T18:00:00Z'],
  K: ['2026-06-16T22:00:00Z', '2026-06-17T01:00:00Z', '2026-06-20T22:00:00Z', '2026-06-21T01:00:00Z', '2026-06-25T22:00:00Z', '2026-06-25T22:00:00Z'],
  L: ['2026-06-17T16:00:00Z', '2026-06-17T19:00:00Z', '2026-06-21T16:00:00Z', '2026-06-21T19:00:00Z', '2026-06-26T18:00:00Z', '2026-06-26T18:00:00Z'],
}

const knockoutMatches = [
  { id: 'r32-1',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-03T18:00:00Z'), homeTeam: 'Winner Group A',       awayTeam: 'Best 3rd Place #1',     venue: 'MetLife Stadium, New Jersey' },
  { id: 'r32-2',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-03T22:00:00Z'), homeTeam: 'Runner-up Group A',    awayTeam: 'Best 3rd Place #2',     venue: 'AT&T Stadium, Dallas' },
  { id: 'r32-3',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-04T18:00:00Z'), homeTeam: 'Winner Group B',       awayTeam: 'Best 3rd Place #3',     venue: 'SoFi Stadium, Los Angeles' },
  { id: 'r32-4',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-04T22:00:00Z'), homeTeam: 'Runner-up Group B',    awayTeam: 'Best 3rd Place #4',     venue: "Levi's Stadium, San Francisco" },
  { id: 'r32-5',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-05T18:00:00Z'), homeTeam: 'Winner Group C',       awayTeam: 'Best 3rd Place #5',     venue: 'Arrowhead Stadium, Kansas City' },
  { id: 'r32-6',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-05T22:00:00Z'), homeTeam: 'Runner-up Group C',    awayTeam: 'Best 3rd Place #6',     venue: 'Estadio Azteca, Mexico City' },
  { id: 'r32-7',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-06T18:00:00Z'), homeTeam: 'Winner Group D',       awayTeam: 'Best 3rd Place #7',     venue: 'BMO Field, Toronto' },
  { id: 'r32-8',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-06T22:00:00Z'), homeTeam: 'Runner-up Group D',    awayTeam: 'Best 3rd Place #8',     venue: 'BC Place, Vancouver' },
  { id: 'r32-9',  stage: 'r32', matchday: null, kickoffAt: d('2026-07-07T18:00:00Z'), homeTeam: 'Winner Group E',       awayTeam: 'Runner-up Group H',     venue: 'NRG Stadium, Houston' },
  { id: 'r32-10', stage: 'r32', matchday: null, kickoffAt: d('2026-07-07T22:00:00Z'), homeTeam: 'Runner-up Group E',    awayTeam: 'Winner Group H',        venue: 'Lincoln Financial Field, Philadelphia' },
  { id: 'r32-11', stage: 'r32', matchday: null, kickoffAt: d('2026-07-08T18:00:00Z'), homeTeam: 'Winner Group F',       awayTeam: 'Runner-up Group I',     venue: 'Gillette Stadium, Boston' },
  { id: 'r32-12', stage: 'r32', matchday: null, kickoffAt: d('2026-07-08T22:00:00Z'), homeTeam: 'Runner-up Group F',    awayTeam: 'Winner Group I',        venue: 'Hard Rock Stadium, Miami' },
  { id: 'r32-13', stage: 'r32', matchday: null, kickoffAt: d('2026-07-09T18:00:00Z'), homeTeam: 'Winner Group G',       awayTeam: 'Runner-up Group J',     venue: 'Camping World Stadium, Orlando' },
  { id: 'r32-14', stage: 'r32', matchday: null, kickoffAt: d('2026-07-09T22:00:00Z'), homeTeam: 'Runner-up Group G',    awayTeam: 'Winner Group J',        venue: 'MetLife Stadium, New Jersey' },
  { id: 'r32-15', stage: 'r32', matchday: null, kickoffAt: d('2026-07-10T18:00:00Z'), homeTeam: 'Winner Group K',       awayTeam: 'Runner-up Group L',     venue: 'AT&T Stadium, Dallas' },
  { id: 'r32-16', stage: 'r32', matchday: null, kickoffAt: d('2026-07-10T22:00:00Z'), homeTeam: 'Runner-up Group K',    awayTeam: 'Winner Group L',        venue: 'SoFi Stadium, Los Angeles' },
  { id: 'r16-1',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-11T18:00:00Z'), homeTeam: 'Winner R32-1',  awayTeam: 'Winner R32-2',   venue: 'MetLife Stadium, New Jersey' },
  { id: 'r16-2',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-11T22:00:00Z'), homeTeam: 'Winner R32-3',  awayTeam: 'Winner R32-4',   venue: 'AT&T Stadium, Dallas' },
  { id: 'r16-3',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-12T18:00:00Z'), homeTeam: 'Winner R32-5',  awayTeam: 'Winner R32-6',   venue: 'SoFi Stadium, Los Angeles' },
  { id: 'r16-4',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-12T22:00:00Z'), homeTeam: 'Winner R32-7',  awayTeam: 'Winner R32-8',   venue: "Levi's Stadium, San Francisco" },
  { id: 'r16-5',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-13T18:00:00Z'), homeTeam: 'Winner R32-9',  awayTeam: 'Winner R32-10',  venue: 'Arrowhead Stadium, Kansas City' },
  { id: 'r16-6',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-13T22:00:00Z'), homeTeam: 'Winner R32-11', awayTeam: 'Winner R32-12',  venue: 'NRG Stadium, Houston' },
  { id: 'r16-7',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-14T18:00:00Z'), homeTeam: 'Winner R32-13', awayTeam: 'Winner R32-14',  venue: 'Lincoln Financial Field, Philadelphia' },
  { id: 'r16-8',  stage: 'r16', matchday: null, kickoffAt: d('2026-07-14T22:00:00Z'), homeTeam: 'Winner R32-15', awayTeam: 'Winner R32-16',  venue: 'Gillette Stadium, Boston' },
  { id: 'qf-1', stage: 'qf', matchday: null, kickoffAt: d('2026-07-17T18:00:00Z'), homeTeam: 'Winner R16-1', awayTeam: 'Winner R16-2', venue: 'MetLife Stadium, New Jersey' },
  { id: 'qf-2', stage: 'qf', matchday: null, kickoffAt: d('2026-07-17T22:00:00Z'), homeTeam: 'Winner R16-3', awayTeam: 'Winner R16-4', venue: 'AT&T Stadium, Dallas' },
  { id: 'qf-3', stage: 'qf', matchday: null, kickoffAt: d('2026-07-18T18:00:00Z'), homeTeam: 'Winner R16-5', awayTeam: 'Winner R16-6', venue: 'SoFi Stadium, Los Angeles' },
  { id: 'qf-4', stage: 'qf', matchday: null, kickoffAt: d('2026-07-18T22:00:00Z'), homeTeam: 'Winner R16-7', awayTeam: 'Winner R16-8', venue: "Levi's Stadium, San Francisco" },
  { id: 'sf-1', stage: 'sf', matchday: null, kickoffAt: d('2026-07-21T22:00:00Z'), homeTeam: 'Winner QF-1', awayTeam: 'Winner QF-2', venue: 'MetLife Stadium, New Jersey' },
  { id: 'sf-2', stage: 'sf', matchday: null, kickoffAt: d('2026-07-22T22:00:00Z'), homeTeam: 'Winner QF-3', awayTeam: 'Winner QF-4', venue: 'AT&T Stadium, Dallas' },
  { id: 'tp-1', stage: 'sf', matchday: null, kickoffAt: d('2026-07-25T18:00:00Z'), homeTeam: 'Loser SF-1', awayTeam: 'Loser SF-2', venue: 'Hard Rock Stadium, Miami' },
  { id: 'final-1', stage: 'final', matchday: null, kickoffAt: d('2026-07-19T22:00:00Z'), homeTeam: 'Winner SF-1', awayTeam: 'Winner SF-2', venue: 'MetLife Stadium, New Jersey' },
]

async function seed() {
  const db = getDb()

  const groupMatches = Object.entries(GROUPS).flatMap(([group, teams]) =>
    makeGroupMatches(group, teams, GROUP_DATES[group]!),
  )

  const allMatches = [
    ...groupMatches,
    ...knockoutMatches.map((m) => ({
      ...m,
      homeScore: null,
      awayScore: null,
      avgHomeScore: null,
      avgAwayScore: null,
      status: 'scheduled' as const,
      group: null,
      homeFlag: '🏳',
      awayFlag: '🏳',
    })),
  ]

  console.log(`Seeding ${allMatches.length} matches...`)

  await db.delete(match)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.insert(match).values(allMatches as any)

  console.log(`✅ Seeded ${allMatches.length} matches (${groupMatches.length} group stage + ${knockoutMatches.length} knockout)`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
