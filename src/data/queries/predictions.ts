import { serverWhere, zql } from 'on-zero'

const matchReadPermission = serverWhere('match', () => true)
const predictionOwnerPermission = serverWhere('prediction', (_, auth) => {
  return _.cmp('userId', auth?.id || '')
})
const predictionPublicPermission = serverWhere('prediction', () => true)

export const matchesByMatchday = (props: { matchday: number | null }) => {
  const q = zql.match.where(matchReadPermission)
  if (props.matchday != null) {
    return q.where('matchday', props.matchday).orderBy('kickoffAt', 'asc')
  }
  return q.orderBy('kickoffAt', 'asc')
}

export const allMatches = () => {
  return zql.match.where(matchReadPermission).orderBy('kickoffAt', 'asc')
}

export const predictionsByUser = (props: { userId: string }) => {
  return zql.prediction
    .where(predictionOwnerPermission)
    .where('userId', props.userId)
    .orderBy('createdAt', 'desc')
}

export const predictionByUserAndMatch = (props: { userId: string; matchId: string }) => {
  return zql.prediction
    .where(predictionOwnerPermission)
    .where('userId', props.userId)
    .where('matchId', props.matchId)
    .one()
}

export const communityPredictionsForMatch = (props: { matchId: string }) => {
  return zql.prediction
    .where(predictionPublicPermission)
    .where('matchId', props.matchId)
}
