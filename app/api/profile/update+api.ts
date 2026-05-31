import type { Endpoint } from 'one'
import { eq } from 'drizzle-orm'

import { getDb } from '~/database'
import { userPublic } from '~/database/schema-public'
import { ensureAuth } from '~/features/auth/server/ensureAuth'

export const POST: Endpoint = async (req) => {
  let session: Awaited<ReturnType<typeof ensureAuth>>
  try {
    session = await ensureAuth(req)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { country?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { country } = body
  const db = getDb()

  await db
    .update(userPublic)
    .set({ country: country ?? null })
    .where(eq(userPublic.id, session.user.id))

  return Response.json({ ok: true })
}
