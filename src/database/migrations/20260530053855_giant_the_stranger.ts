import type { PoolClient } from 'pg'

const sql = `CREATE TABLE "follow" (
	"id" text PRIMARY KEY,
	"followerId" text NOT NULL,
	"followingId" text NOT NULL,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboardEntry" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL UNIQUE,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"exactScores" integer DEFAULT 0 NOT NULL,
	"correctResults" integer DEFAULT 0 NOT NULL,
	"predictionsMade" integer DEFAULT 0 NOT NULL,
	"updatedAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" text PRIMARY KEY,
	"homeTeam" text NOT NULL,
	"awayTeam" text NOT NULL,
	"homeFlag" text NOT NULL,
	"awayFlag" text NOT NULL,
	"kickoffAt" bigint NOT NULL,
	"homeScore" integer,
	"awayScore" integer,
	"avgHomeScore" integer,
	"avgAwayScore" integer,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"matchday" integer,
	"stage" text NOT NULL,
	"group" text,
	"venue" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction" (
	"id" text PRIMARY KEY,
	"userId" text NOT NULL,
	"matchId" text NOT NULL,
	"homeScore" integer NOT NULL,
	"awayScore" integer NOT NULL,
	"pointsAwarded" integer,
	"createdAt" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userPublic" ADD COLUMN "country" text;--> statement-breakpoint
CREATE INDEX "follow_followerId_idx" ON "follow" ("followerId");--> statement-breakpoint
CREATE INDEX "follow_followingId_idx" ON "follow" ("followingId");--> statement-breakpoint
CREATE INDEX "match_status_idx" ON "match" ("status");--> statement-breakpoint
CREATE INDEX "match_matchday_idx" ON "match" ("matchday");--> statement-breakpoint
CREATE INDEX "prediction_userId_idx" ON "prediction" ("userId");--> statement-breakpoint
CREATE INDEX "prediction_matchId_idx" ON "prediction" ("matchId");`

export async function up(client: PoolClient) {
  await client.query(sql)
}
