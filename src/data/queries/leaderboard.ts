import { serverWhere, zql } from 'on-zero'

const leaderboardPermission = serverWhere('leaderboardEntry', () => true)
const followPermission = serverWhere('follow', () => true)

export const leaderboardAll = (props: { limit?: number }) => {
  return zql.leaderboardEntry
    .where(leaderboardPermission)
    .orderBy('totalPoints', 'desc')
    .limit(props.limit ?? 200)
    .related('user', (q) =>
      q.where(serverWhere('userPublic', () => true)).one(),
    )
}

export const leaderboardByUserId = (props: { userId: string }) => {
  return zql.leaderboardEntry
    .where(leaderboardPermission)
    .where('userId', props.userId)
    .one()
    .related('user', (q) =>
      q.where(serverWhere('userPublic', () => true)).one(),
    )
}

export const followingByUser = (props: { followerId: string }) => {
  return zql.follow
    .where(followPermission)
    .where('followerId', props.followerId)
}
