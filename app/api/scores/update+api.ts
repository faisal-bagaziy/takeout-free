import type { Endpoint } from 'one'
import { eq } from 'drizzle-orm'

import { getDb } from '~/database'
import { match } from '~/database/schema-public'
import { SCORE_UPDATE_SECRET } from '~/server/env-server'
import { scoreMatch } from '~/server/scoring'

export const POST: Endpoint = async (req) => {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${SCORE_UPDATE_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { matchId: string; homeScore: number; awayScore: number; status: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { matchId, homeScore, awayScore, status } = body
  if (!matchId || homeScore == null || awayScore == null || !status) {
    return Response.json({ error: 'Missing required fields: matchId, homeScore, awayScore, status' }, { status: 400 })
  }

  const db = getDb()

  const [existing] = await db.select().from(match).where(eq(match.id, matchId)).limit(1)
  if (!existing) {
    return Response.json({ error: 'Match not found' }, { status: 404 })
  }

  await db
    .update(match)
    .set({ homeScore, awayScore, status })
    .where(eq(match.id, matchId))

  if (status === 'finished') {
    try {
      await scoreMatch(matchId)
    } catch (err) {
      console.error(`[scoring] failed to score match ${matchId}:`, err)
      return Response.json({ error: 'Score update saved but scoring job failed' }, { status: 500 })
    }
  }

  return Response.json({ ok: true, matchId, status })
}
