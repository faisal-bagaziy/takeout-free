import { useMemo } from 'react'

import { leaderboardAll, leaderboardByUserId, followingByUser } from '~/data/queries/leaderboard'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery } from '~/zero/client'

export type LeaderboardEntryWithUser = {
  id: string
  userId: string
  totalPoints: number
  exactScores: number
  correctResults: number
  predictionsMade: number
  user: { id: string; name: string | null | undefined; country: string | null | undefined } | null | undefined
}

export function useLeaderboard(limit = 200) {
  const [entries, { type }] = useQuery(leaderboardAll, { limit })
  return {
    entries: (entries ?? []) as LeaderboardEntryWithUser[],
    isLoading: type === 'unknown',
  }
}

export function useMyLeaderboardEntry() {
  const auth = useAuth()
  const userId = auth?.user?.id ?? ''
  const [entry, { type }] = useQuery(leaderboardByUserId, { userId }, { enabled: !!userId })
  return { myEntry: entry as LeaderboardEntryWithUser | null, isLoading: type === 'unknown' }
}

export function useFriendsLeaderboard() {
  const auth = useAuth()
  const userId = auth?.user?.id ?? ''

  const [follows, { type: followType }] = useQuery(followingByUser, { followerId: userId }, { enabled: !!userId })
  const [allEntries, { type: entriesType }] = useQuery(leaderboardAll, { limit: 1000 })

  const followingIds = useMemo(
    () => new Set((follows ?? []).map((f) => f.followingId).concat(userId ? [userId] : [])),
    [follows, userId],
  )

  const friendEntries = useMemo(
    () => ((allEntries ?? []) as LeaderboardEntryWithUser[]).filter((e) => followingIds.has(e.userId)),
    [allEntries, followingIds],
  )

  return {
    entries: friendEntries,
    isLoading: followType === 'unknown' || entriesType === 'unknown',
  }
}
