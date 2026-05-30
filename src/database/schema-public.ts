import { bigint, boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userPublic = pgTable(
  'userPublic',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    username: text('username'),
    image: text('image'),
    country: text('country'),
    joinedAt: timestamp('joinedAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [index('userPublic_username_idx').on(table.username)],
)

export const userState = pgTable('userState', {
  userId: text('userId').primaryKey(),
  darkMode: boolean('darkMode').notNull().default(false),
})

export const todo = pgTable(
  'todo',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    text: text('text').notNull(),
    completed: boolean('completed').notNull().default(false),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [index('todo_userId_idx').on(table.userId)],
)

export const match = pgTable(
  'match',
  {
    id: text('id').primaryKey(),
    homeTeam: text('homeTeam').notNull(),
    awayTeam: text('awayTeam').notNull(),
    homeFlag: text('homeFlag').notNull(),
    awayFlag: text('awayFlag').notNull(),
    kickoffAt: bigint('kickoffAt', { mode: 'number' }).notNull(),
    homeScore: integer('homeScore'),
    awayScore: integer('awayScore'),
    avgHomeScore: integer('avgHomeScore'),
    avgAwayScore: integer('avgAwayScore'),
    status: text('status').notNull().default('scheduled'),
    matchday: integer('matchday'),
    stage: text('stage').notNull(),
    group: text('group'),
    venue: text('venue').notNull(),
  },
  (table) => [
    index('match_status_idx').on(table.status),
    index('match_matchday_idx').on(table.matchday),
  ],
)

export const prediction = pgTable(
  'prediction',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    matchId: text('matchId').notNull(),
    homeScore: integer('homeScore').notNull(),
    awayScore: integer('awayScore').notNull(),
    pointsAwarded: integer('pointsAwarded'),
    createdAt: bigint('createdAt', { mode: 'number' }).notNull(),
  },
  (table) => [
    index('prediction_userId_idx').on(table.userId),
    index('prediction_matchId_idx').on(table.matchId),
  ],
)

export const leaderboardEntry = pgTable('leaderboardEntry', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  totalPoints: integer('totalPoints').notNull().default(0),
  exactScores: integer('exactScores').notNull().default(0),
  correctResults: integer('correctResults').notNull().default(0),
  predictionsMade: integer('predictionsMade').notNull().default(0),
  updatedAt: bigint('updatedAt', { mode: 'number' }).notNull(),
})

export const follow = pgTable(
  'follow',
  {
    id: text('id').primaryKey(),
    followerId: text('followerId').notNull(),
    followingId: text('followingId').notNull(),
    createdAt: bigint('createdAt', { mode: 'number' }).notNull(),
  },
  (table) => [
    index('follow_followerId_idx').on(table.followerId),
    index('follow_followingId_idx').on(table.followingId),
  ],
)
