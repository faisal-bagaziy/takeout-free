import { relationships } from '@rocicorp/zero'

import * as tables from './generated/tables'

export const userRelationships = relationships(tables.userPublic, ({ many, one }) => ({
  state: one({
    sourceField: ['id'],
    destSchema: tables.userState,
    destField: ['userId'],
  }),
  todos: many({
    sourceField: ['id'],
    destSchema: tables.todo,
    destField: ['userId'],
  }),
  predictions: many({
    sourceField: ['id'],
    destSchema: tables.prediction,
    destField: ['userId'],
  }),
  leaderboardEntry: one({
    sourceField: ['id'],
    destSchema: tables.leaderboardEntry,
    destField: ['userId'],
  }),
  following: many({
    sourceField: ['id'],
    destSchema: tables.follow,
    destField: ['followerId'],
  }),
  followers: many({
    sourceField: ['id'],
    destSchema: tables.follow,
    destField: ['followingId'],
  }),
}))

export const todoRelationships = relationships(tables.todo, ({ one }) => ({
  user: one({
    sourceField: ['userId'],
    destSchema: tables.userPublic,
    destField: ['id'],
  }),
}))

export const userStateRelationships = relationships(tables.userState, ({ one }) => ({
  user: one({
    sourceField: ['userId'],
    destSchema: tables.userPublic,
    destField: ['id'],
  }),
}))

export const matchRelationships = relationships(tables.match, ({ many }) => ({
  predictions: many({
    sourceField: ['id'],
    destSchema: tables.prediction,
    destField: ['matchId'],
  }),
}))

export const predictionRelationships = relationships(tables.prediction, ({ one }) => ({
  user: one({
    sourceField: ['userId'],
    destSchema: tables.userPublic,
    destField: ['id'],
  }),
  match: one({
    sourceField: ['matchId'],
    destSchema: tables.match,
    destField: ['id'],
  }),
}))

export const leaderboardEntryRelationships = relationships(
  tables.leaderboardEntry,
  ({ one }) => ({
    user: one({
      sourceField: ['userId'],
      destSchema: tables.userPublic,
      destField: ['id'],
    }),
  }),
)

export const followRelationships = relationships(tables.follow, ({ one }) => ({
  follower: one({
    sourceField: ['followerId'],
    destSchema: tables.userPublic,
    destField: ['id'],
  }),
  following: one({
    sourceField: ['followingId'],
    destSchema: tables.userPublic,
    destField: ['id'],
  }),
}))

export const allRelationships = [
  userRelationships,
  todoRelationships,
  userStateRelationships,
  matchRelationships,
  predictionRelationships,
  leaderboardEntryRelationships,
  followRelationships,
]
