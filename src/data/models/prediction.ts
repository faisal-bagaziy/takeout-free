import { number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

import type { TableInsertRow } from 'on-zero'

export type Prediction = TableInsertRow<typeof schema>

export const schema = table('prediction')
  .columns({
    id: string(),
    userId: string(),
    matchId: string(),
    homeScore: number(),
    awayScore: number(),
    pointsAwarded: number().optional(),
    finalHomeScore: number().optional(),
    finalAwayScore: number().optional(),
    createdAt: number(),
  })
  .primaryKey('id')

const permissions = serverWhere('prediction', (_, auth) => {
  return _.cmp('userId', auth?.id || '')
})

export const mutate = mutations(schema, permissions, {
  insert: async ({ authData, can, tx, server }, prediction: Prediction) => {
    if (!authData) throw new Error('Unauthorized')
    if (prediction.userId !== authData.id) throw new Error('Unauthorized')

    // DB validation only runs server-side — these imports are not available in the browser
    if (server) {
      const { getDb } = await import('~/database')
      const { eq } = await import('drizzle-orm')
      const { match: matchTable } = await import('~/database/schema-public')

      const db = getDb()
      const [m] = await db
        .select({ kickoffAt: matchTable.kickoffAt, status: matchTable.status })
        .from(matchTable)
        .where(eq(matchTable.id, prediction.matchId))
        .limit(1)

      if (!m) throw new Error('Match not found')
      if (m.kickoffAt - 3_600_000 <= Date.now()) throw new Error('Predictions locked for this match')
    }

    await tx.mutate.prediction.insert(prediction)
  },
  update: async (
    { authData, can, tx },
    prediction: Partial<Prediction> & { id: string },
  ) => {
    if (!authData) throw new Error('Unauthorized')
    await can(permissions, prediction.id)

    const { pointsAwarded: _p, finalHomeScore: _fh, finalAwayScore: _fa, ...safe } = prediction
    await tx.mutate.prediction.update(safe)
  },
})
