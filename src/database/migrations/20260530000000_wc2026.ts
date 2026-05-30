import type { PoolClient } from 'pg'

const sql = `
ALTER TABLE "userPublic" ADD COLUMN IF NOT EXISTS "country" text;

CREATE TABLE IF NOT EXISTS "match" (
  "id" text PRIMARY KEY NOT NULL,
  "homeTeam" text NOT NULL,
  "awayTeam" text NOT NULL,
  "homeFlag" text NOT NULL,
  "awayFlag" text NOT NULL,
  "kickoffAt" bigint NOT NULL,
  "homeScore" integer,
  "awayScore" integer,
  "avgHomeScore" integer,
  "avgAwayScore" integer,
  "status" text NOT NULL DEFAULT 'scheduled',
  "matchday" integer,
  "stage" text NOT NULL,
  "group" text,
  "venue" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "prediction" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "matchId" text NOT NULL,
  "homeScore" integer NOT NULL,
  "awayScore" integer NOT NULL,
  "pointsAwarded" integer,
  "createdAt" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "leaderboardEntry" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL UNIQUE,
  "totalPoints" integer NOT NULL DEFAULT 0,
  "exactScores" integer NOT NULL DEFAULT 0,
  "correctResults" integer NOT NULL DEFAULT 0,
  "predictionsMade" integer NOT NULL DEFAULT 0,
  "updatedAt" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "follow" (
  "id" text PRIMARY KEY NOT NULL,
  "followerId" text NOT NULL,
  "followingId" text NOT NULL,
  "createdAt" bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS "match_status_idx" ON "match" ("status");
CREATE INDEX IF NOT EXISTS "match_matchday_idx" ON "match" ("matchday");
CREATE INDEX IF NOT EXISTS "prediction_userId_idx" ON "prediction" ("userId");
CREATE INDEX IF NOT EXISTS "prediction_matchId_idx" ON "prediction" ("matchId");
CREATE INDEX IF NOT EXISTS "follow_followerId_idx" ON "follow" ("followerId");
CREATE INDEX IF NOT EXISTS "follow_followingId_idx" ON "follow" ("followingId");
`

export async function up(client: PoolClient) {
  await client.query(sql)
}
