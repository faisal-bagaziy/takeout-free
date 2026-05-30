import { serverWhere, zql } from 'on-zero'

const predictionPublic = serverWhere('prediction', () => true)
const userPublic = serverWhere('userPublic', () => true)
const matchPublic = serverWhere('match', () => true)

export const recentPredictions = (props: { limit?: number }) => {
  return zql.prediction
    .where(predictionPublic)
    .orderBy('createdAt', 'desc')
    .limit(props.limit ?? 200)
    .related('user', (q) => q.where(userPublic).one())
    .related('match', (q) => q.where(matchPublic).one())
}
