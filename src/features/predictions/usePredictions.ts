import { useCallback } from 'react'

import {
  allMatches,
  matchesByMatchday,
  predictionByUserAndMatch,
  predictionsByUser,
} from '~/data/queries/predictions'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery, zero } from '~/zero/client'

export function useMatches(matchday?: number | null) {
  const [matchesByDay, { type: type1 }] = useQuery(
    matchesByMatchday,
    { matchday: matchday ?? null },
    { enabled: matchday != null },
  )
  const [allMatchesList, { type: type2 }] = useQuery(allMatches, {
    enabled: matchday == null,
  })
  const matches = matchday != null ? matchesByDay : allMatchesList
  const type = matchday != null ? type1 : type2
  return { matches: matches ?? [], isLoading: type === 'unknown' }
}

export function useUserPredictions() {
  const auth = useAuth()
  const userId = auth?.user?.id ?? ''
  const [predictions, { type }] = useQuery(predictionsByUser, { userId }, { enabled: !!userId })
  const map = new Map((predictions ?? []).map((p) => [p.matchId, p]))
  return { predictionsMap: map, isLoading: type === 'unknown' }
}

export function usePredictionForMatch(matchId: string) {
  const auth = useAuth()
  const userId = auth?.user?.id ?? ''
  const [prediction, { type }] = useQuery(
    predictionByUserAndMatch,
    { userId, matchId },
    { enabled: !!userId },
  )
  return { prediction: prediction ?? null, isLoading: type === 'unknown' }
}

export function useSubmitPrediction() {
  const auth = useAuth()

  const submitPrediction = useCallback(
    (matchId: string, homeScore: number, awayScore: number) => {
      const userId = auth?.user?.id
      if (!userId) throw new Error('Not authenticated')

      zero.mutate.prediction.insert({
        id: crypto.randomUUID(),
        userId,
        matchId,
        homeScore,
        awayScore,
        pointsAwarded: null,
        createdAt: Date.now(),
      })
    },
    [auth],
  )

  const updatePrediction = useCallback(
    (predictionId: string, homeScore: number, awayScore: number) => {
      zero.mutate.prediction.update({ id: predictionId, homeScore, awayScore })
    },
    [],
  )

  return { submitPrediction, updatePrediction }
}
