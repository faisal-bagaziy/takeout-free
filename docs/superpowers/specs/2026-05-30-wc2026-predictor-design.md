# WC2026 Score Predictor + Leaderboard — Design Spec

**Date:** 2026-05-30  
**Scope:** Score Predictor (v1 core loop) + Global/Friends Leaderboard  
**Out of scope:** Push notifications, mini-leagues, admin UI

---

## Project Context

Built on top of `tamagui/takeout-free` — a universal Expo + Web app using:
- **Framework:** One (vxrn) with Expo Router file-based routing
- **Auth:** Better Auth (`@better-auth/expo`)
- **Sync:** @rocicorp/zero (real-time data sync)
- **DB:** Postgres + Drizzle ORM
- **UI:** Tamagui 2.0 RC, dark-theme first
- **Build:** Bun

---

## Feature Scope (v1)

### Score Predictor
- Users predict exact scorelines (home goals / away goals) for WC2026 matches
- Predictions lock at kickoff (`match.kickoffAt`)
- Scoring: 3 pts exact score · 1 pt correct result · 0 pts wrong result
- One prediction per user per match
- After lock: show community average prediction on the card

### Leaderboard
- **All Tournament** — all users ranked by total points
- **This Matchday** — filtered to current matchday's predictions
- **Friends** — filtered to users you follow
- Row shows: rank, avatar (initials), display name, country flag emoji, total points, exact score count, correct result count, predictions played
- Signed-in user's row pinned at bottom when not in top view, highlighted in blue

### User Profile (minimal)
- Display name, country (WC2026 nation), avatar initials fallback
- Stats visible on leaderboard row only in v1

---

## Architecture Decision

**Approach: Full Zero + Materialized Leaderboard**

- Predictions use Zero optimistic mutations — instant UI, offline-capable
- Leaderboard is a materialized `leaderboardEntry` table: one row per user, updated server-side by the scoring job
- Zero CDC propagates Postgres changes to all clients in real time — leaderboard moves live when results come in
- Score updates arrive via a secured webhook API route; no client can write match scores

---

## Data Layer

### Zero Tables (4 new tables)

**`match`**
```
id: string (PK)
homeTeam: string          // "United States"
awayTeam: string
homeFlag: string          // emoji "🇺🇸"
awayFlag: string
kickoffAt: number         // Unix ms
homeScore: number | null  // null until finished
awayScore: number | null
avgHomeScore: number | null  // community average, set at lock
avgAwayScore: number | null
status: "scheduled" | "live" | "finished"
matchday: number | null   // 1–3 group stage, null for knockouts
stage: "group" | "r16" | "qf" | "sf" | "final"
group: string | null      // "A"–"L" for group stage
venue: string
```
Permissions: read-all, no client mutations (server-only writes via Drizzle).

**`prediction`**
```
id: string (PK)
userId: string
matchId: string
homeScore: number
awayScore: number
pointsAwarded: number | null   // null until scored
createdAt: number
```
Permissions: `serverWhere` → `userId === auth.id` for writes; additionally rejects if `match.kickoffAt <= Date.now()`. Readable by owner always; readable by all after kickoff (for community average).

**`leaderboardEntry`**
```
id: string (PK)           // userId (1:1)
userId: string
totalPoints: number
exactScores: number
correctResults: number
predictionsMade: number
updatedAt: number
```
Permissions: read-all, no client mutations (server-only upserts).

**`follow`**
```
id: string (PK)
followerId: string
followingId: string
createdAt: number
```
Permissions: `serverWhere` → `followerId === auth.id` for writes.

---

## File Structure

```
src/data/models/
  match.ts
  prediction.ts
  leaderboardEntry.ts
  follow.ts

src/data/queries/
  predictions.ts      // matchesByMatchday, predictionsByUser, communityAverage
  leaderboard.ts      // leaderboardAll, leaderboardByMatchday, leaderboardFriends

src/features/predictions/
  screen.tsx          // match list grouped by matchday, tab-filtered
  MatchCard.tsx       // compact horizontal: flag + name | input – input | name + flag
  ScoreInput.tsx      // number input, works iOS/Android/Web, no DOM APIs
  PredictionSheet.tsx // Tamagui Sheet confirmation before submitting
  usePredictions.ts   // useQuery + zero.mutate wrappers

src/features/leaderboard/
  screen.tsx          // tab bar (All / Matchday / Friends) + FlatList
  LeaderboardRow.tsx  // rank · avatar · name + flag · pts · exact/result/played
  useLeaderboard.ts   // useQuery wrappers, current-user row detection

src/server/
  scoring.ts          // scoreMatch(matchId): points calc + prediction updates + leaderboard upserts

app/(app)/home/(tabs)/
  predict.tsx         // mounts PredictionsScreen
  leaderboard.tsx     // mounts LeaderboardScreen
  _layout.native.tsx  // add Predict + Leaderboard tabs
  _layout.tsx         // web tab layout

app/api/scores/
  update+api.ts       // POST webhook endpoint

scripts/
  seed-matches.ts     // all 104 WC2026 fixtures via Drizzle insert
```

---

## UI Design

### Match Card (compact horizontal)
```
[Group A · Matchday 1]
🇺🇸 USA   [2] – [1]   ENG 🏴󠁧󠁢󠁥󠁮󠁧󠁿
        Jun 15 · 18:00 EST
        [Submit Prediction]
```
- Inputs: `width:36, height:36`, numeric keyboard, `maxLength:2`
- Lock state: inputs replaced with static `<Text>` nodes (disabled look), badge shows points awarded in green
- Result reveal: brief scale animation on the points badge using Reanimated
- Community average shown below inputs after lock: `"Community avg: 1–1"`

### Leaderboard Row (stats-rich)
```
14  [ME]  You 🇺🇸                54 pts
          🎯 5 exact  ✓ 9 result  24 played
```
- Top 3 ranks use gold/silver/bronze color
- Signed-in user row: blue background `$blue2`, blue border, pinned at list bottom
- Tab bar: All · Matchday · Friends — `XStack` of `Button` toggles

### Platform Notes
- No `StyleSheet.create` — all Tamagui primitives
- No DOM-specific code in shared components; platform splits via `.native.tsx` / `.web.tsx` only where needed
- `ScoreInput` uses Tamagui `Input` with `keyboardType="number-pad"` — works universally

---

## Scoring Job & Data Flow

### Webhook → Results Flow
1. `POST /api/scores/update+api.ts` receives `{ matchId, homeScore, awayScore, status }`
2. Bearer token validated against `SCORE_UPDATE_SECRET` env var
3. Drizzle updates `match` row (direct Postgres, bypasses Zero client)
4. If `status === "finished"`: `scoreMatch(matchId)` runs
5. Scoring job:
   - Fetches all `prediction` rows for match
   - For each: `exactScore → 3pts`, `correctResult → 1pt`, else `0`
   - Bulk-updates `prediction.pointsAwarded`
   - Upserts each user's `leaderboardEntry` (increments totals)
6. Zero CDC detects Postgres changes → pushes diffs to all connected clients
7. Leaderboard updates live; match cards reveal results in real time

### Lock Enforcement (two layers)
- **Client:** inputs disabled when `match.kickoffAt <= Date.now()`
- **Server:** Zero `serverWhere` rejects prediction mutations where kickoff has passed

### Community Average
- Computed server-side when the webhook fires with `status: "live"` or `status: "finished"`
- `AVG(homeScore), AVG(awayScore)` over all predictions for that match via Drizzle query
- Stored as `match.avgHomeScore / avgAwayScore` via Drizzle update
- Displayed on card after `match.kickoffAt` has passed

### "This Matchday" Filter
- Applies only to group stage (matchdays 1–3); knockout matches have `matchday: null`
- Current matchday = highest matchday number where at least one match has `status !== "scheduled"`
- Leaderboard points for "This Matchday" = sum of `pointsAwarded` from predictions on matches in that matchday

---

## Match Seed Data

`scripts/seed-matches.ts` inserts all 104 fixtures:
- **48 group stage matches** — all real team names, kickoff times from official WC2026 schedule (Jun 11–Jul 2, 2026), venues across USA/Canada/Mexico
- **56 knockout matches** — placeholder team names (`"Winner Group A"`, `"Runner-up Group B"`, etc.), kickoff times set per official bracket schedule
- Teams include all 48 qualified nations with flag emojis and ISO codes

---

## Auth Integration

- Predictions require authenticated user (Better Auth session)
- Leaderboard reads are public (Zero permissions: read-all for `leaderboardEntry`)
- Follow writes require auth (`followerId === auth.id`)
- Webhook uses static bearer token, not user auth

---

## Scoring Logic (pure function)

```ts
type Result = "home" | "draw" | "away"

function getResult(home: number, away: number): Result {
  if (home > away) return "home"
  if (away > home) return "away"
  return "draw"
}

function calcPoints(
  predicted: { home: number; away: number },
  actual: { home: number; away: number }
): number {
  if (predicted.home === actual.home && predicted.away === actual.away) return 3
  if (getResult(predicted.home, predicted.away) === getResult(actual.home, actual.away)) return 1
  return 0
}
```
