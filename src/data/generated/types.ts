import type { TableInsertRow, TableUpdateRow } from 'on-zero'
import type * as schema from './tables'

export type Follow = TableInsertRow<typeof schema.follow>
export type FollowUpdate = TableUpdateRow<typeof schema.follow>

export type LeaderboardEntry = TableInsertRow<typeof schema.leaderboardEntry>
export type LeaderboardEntryUpdate = TableUpdateRow<typeof schema.leaderboardEntry>

export type Match = TableInsertRow<typeof schema.match>
export type MatchUpdate = TableUpdateRow<typeof schema.match>

export type Prediction = TableInsertRow<typeof schema.prediction>
export type PredictionUpdate = TableUpdateRow<typeof schema.prediction>

export type Todo = TableInsertRow<typeof schema.todo>
export type TodoUpdate = TableUpdateRow<typeof schema.todo>

export type User = TableInsertRow<typeof schema.userPublic>
export type UserUpdate = TableUpdateRow<typeof schema.userPublic>

export type UserState = TableInsertRow<typeof schema.userState>
export type UserStateUpdate = TableUpdateRow<typeof schema.userState>
