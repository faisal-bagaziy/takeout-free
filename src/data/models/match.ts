import { number, string, table } from '@rocicorp/zero'

import type { TableInsertRow } from 'on-zero'

export type Match = TableInsertRow<typeof schema>

export const schema = table('match')
  .columns({
    id: string(),
    homeTeam: string(),
    awayTeam: string(),
    homeFlag: string(),
    awayFlag: string(),
    kickoffAt: number(),
    homeScore: number().optional(),
    awayScore: number().optional(),
    avgHomeScore: number().optional(),
    avgAwayScore: number().optional(),
    status: string(),
    matchday: number().optional(),
    stage: string(),
    group: string().optional(),
    venue: string(),
  })
  .primaryKey('id')

// No client mutations — server-only writes via Drizzle in the scoring job
export const mutate = {}
