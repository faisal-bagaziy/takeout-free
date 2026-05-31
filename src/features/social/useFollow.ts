import { useCallback, useMemo } from 'react'

import { followsByUser } from '~/data/queries/leaderboard'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery, zero } from '~/zero/client'

export function useFollowMap() {
  const auth = useAuth()
  const userId = auth?.user?.id ?? ''
  const [follows] = useQuery(followsByUser, { followerId: userId }, { enabled: !!userId })

  return useMemo(
    () => new Map((follows ?? []).map((f) => [f.followingId, f.id])),
    [follows],
  )
}

export function useFollowActions() {
  const auth = useAuth()

  const follow = useCallback(
    (targetUserId: string) => {
      const myId = auth?.user?.id
      if (!myId) return
      zero.mutate.follow.insert({
        id: crypto.randomUUID(),
        followerId: myId,
        followingId: targetUserId,
        createdAt: Date.now(),
      })
    },
    [auth],
  )

  const unfollow = useCallback((followId: string) => {
    zero.mutate.follow.delete({ id: followId })
  }, [])

  return { follow, unfollow }
}
