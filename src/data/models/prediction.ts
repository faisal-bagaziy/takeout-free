import { number, string, table } from '@rocicorp/zero'
import { eq } from 'drizzle-orm'
import { mutations, serverWhere } from 'on-zero'

import type { TableInsertRow } from 'on-zero'

import { getDb } from '~/database'
import { match as matchTable } from '~/database/schema-public'

export type Prediction = TableInsertRow<typeof schema>

export const schema = table('prediction')
  .columns({
    id: string(),
    userId: string(),
    matchId: string(),
    homeScore: number(),
    awayScore: number(),
    pointsAwarded: number().optional(),
    createdAt: number(),
  })
  .primaryKey('id')

const permissions = serverWhere('prediction', (_, auth) => {
  return _.cmp('userId', auth?.id || '')
})

export const mutate = mutations(schema, permissions, {
  insert: async ({ authData, can, tx }, prediction: Prediction) => {
    if (!authData) throw new Error('Unauthorized')
    await can(permissions, authData.id)

    const db = getDb()
    const [m] = await db
      .select({ kickoffAt: matchTable.kickoffAt, status: matchTable.status })
      .from(matchTable)
      .where(eq(matchTable.id, prediction.matchId))
      .limit(1)

    if (!m) throw new Error('Match not found')
    if (m.kickoffAt <= Date.now()) throw new Error('Predictions locked for this match')

    await tx.mutate.prediction.insert(prediction)
  },
  update: async ({ authData, can, tx }, prediction: Partial<Prediction> & { id: string }) => {
    if (!authData) throw new Error('Unauthorized')
    await can(permissions, authData.id)

    // Only allow updating scores (not pointsAwarded — that's server-only)
    const { pointsAwarded: _ignored, ...safe } = prediction
    await tx.mutate.prediction.update(safe)
  },
})
