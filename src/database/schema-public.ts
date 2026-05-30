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
