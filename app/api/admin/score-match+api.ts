import type { Endpoint } from 'one'

import { ensureAuth } from '~/features/auth/server/ensureAuth'
import { getDb } from '~/database'
import { eq } from 'drizzle-orm'
import { match } from '~/database/schema-public'
import { ADMIN_WHITELIST } from '~/server/constants-server'
import { scoreMatch } from '~/server/scoring'

export const POST: Endpoint = async (req) => {
  let session: Awaited<ReturnType<typeof ensureAuth>>
  try {
    session = await ensureAuth(req)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin =
    session.user.role === 'admin' || ADMIN_WHITELIST.has(session.user.email || '')
  if (!isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { matchId: string; homeScore: number; awayScore: number }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { matchId, homeScore, awayScore } = body
  if (!matchId || homeScore == null || awayScore == null) {
    return Response.json({ error: 'Missing fields: matchId, homeScore, awayScore' }, { status: 400 })
  }

  const db = getDb()
  const [existing] = await db.select().from(match).where(eq(match.id, matchId)).limit(1)
  if (!existing) {
    return Response.json({ error: 'Match not found' }, { status: 404 })
  }

  await db
    .update(match)
    .set({ homeScore, awayScore, status: 'finished' })
    .where(eq(match.id, matchId))

  try {
    await scoreMatch(matchId)
  } catch (err) {
    console.error(`[admin] scoring failed for match ${matchId}:`, err)
    return Response.json({ error: 'Score saved but scoring failed' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
