import { number, string, table } from '@rocicorp/zero'

import type { TableInsertRow } from 'on-zero'

export type LeaderboardEntry = TableInsertRow<typeof schema>

export const schema = table('leaderboardEntry')
  .columns({
    id: string(),
    userId: string(),
    totalPoints: number(),
    exactScores: number(),
    correctResults: number(),
    predictionsMade: number(),
    updatedAt: number(),
  })
  .primaryKey('id')

// No client mutations — server-only upserts in scoring job
