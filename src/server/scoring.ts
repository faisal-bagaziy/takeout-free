import { eq, sql } from 'drizzle-orm'

import { getDb } from '~/database'
import { leaderboardEntry, match, prediction } from '~/database/schema-public'

type Result = 'home' | 'draw' | 'away'

export function getResult(home: number, away: number): Result {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

export function calcPoints(
  predicted: { home: number; away: number },
  actual: { home: number; away: number },
): number {
  if (predicted.home === actual.home && predicted.away === actual.away) return 3
  if (getResult(predicted.home, predicted.away) === getResult(actual.home, actual.away)) return 1
  return 0
}

export async function scoreMatch(matchId: string): Promise<void> {
  const db = getDb()

  const [m] = await db.select().from(match).where(eq(match.id, matchId)).limit(1)
  if (!m || m.homeScore == null || m.awayScore == null) {
    throw new Error(`Match ${matchId} has no scores`)
  }

  const predictions = await db
    .select()
    .from(prediction)
    .where(eq(prediction.matchId, matchId))

  for (const p of predictions) {
    const points = calcPoints(
      { home: p.homeScore, away: p.awayScore },
      { home: m.homeScore, away: m.awayScore },
    )

    await db
      .update(prediction)
      .set({ pointsAwarded: points })
      .where(eq(prediction.id, p.id))

    await db
      .insert(leaderboardEntry)
      .values({
        id: p.userId,
        userId: p.userId,
        totalPoints: points,
        exactScores: points === 3 ? 1 : 0,
        correctResults: points === 1 ? 1 : 0,
        predictionsMade: 1,
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: leaderboardEntry.id,
        set: {
          totalPoints: sql`${leaderboardEntry.totalPoints} + ${points}`,
          exactScores: sql`${leaderboardEntry.exactScores} + ${points === 3 ? 1 : 0}`,
          correctResults: sql`${leaderboardEntry.correctResults} + ${points === 1 ? 1 : 0}`,
          predictionsMade: sql`${leaderboardEntry.predictionsMade} + 1`,
          updatedAt: Date.now(),
        },
      })
  }

  // compute and store community averages
  if (predictions.length > 0) {
    const avgHome = Math.round(
      predictions.reduce((sum, p) => sum + p.homeScore, 0) / predictions.length,
    )
    const avgAway = Math.round(
      predictions.reduce((sum, p) => sum + p.awayScore, 0) / predictions.length,
    )
    await db
      .update(match)
      .set({ avgHomeScore: avgHome, avgAwayScore: avgAway })
      .where(eq(match.id, matchId))
  }
}
