# Feed & Follow UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the todo-demo Feed tab with a live activity feed showing recent predictions from followed users, and add follow/unfollow buttons on the Leaderboard.

**Architecture:** Zero syncs `prediction`, `match`, `userPublic`, and `follow` tables to every client. We query all recent predictions globally (Zero caches locally, so this is cheap) and filter client-side by the current user's following set — the same pattern `useFriendsLeaderboard` already uses. Follow/unfollow is a single `zero.mutate.follow.insert/delete` call with optimistic update built in.

**Tech Stack:** React Native / Tamagui, @rocicorp/zero (on-zero), One file-based routing. All data via ZQL queries — no new API routes needed.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/data/queries/feed.ts` | **Create** | ZQL query for recent predictions with user + match |
| `src/data/queries/leaderboard.ts` | **Modify** | Add `followsByUser` query that returns full follow rows (id included) |
| `src/features/social/useFollow.ts` | **Create** | `useFollowMap` hook (Map of followingId→followId) + `useFollowActions` (follow/unfollow) |
| `src/features/feed/FeedItem.tsx` | **Create** | Single feed card: avatar, name, match, predicted score, result badge |
| `src/features/feed/FeedScreen.tsx` | **Create** | Full feed screen with `useFeed` hook, empty state, FlatList |
| `src/features/leaderboard/LeaderboardRow.tsx` | **Modify** | Add optional `isFollowing` + `onFollowToggle` props → Follow button |
| `src/features/leaderboard/screen.tsx` | **Modify** | Wire follow map + actions into each row |
| `app/(app)/home/(tabs)/feed/index.tsx` | **Modify** | Replace todo demo with `<FeedScreen />` |

---

### Task 1: Feed query

**Files:**
- Create: `src/data/queries/feed.ts`

- [ ] **Step 1: Create the query file**

```typescript
// src/data/queries/feed.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/data/queries/feed.ts
git commit -m "feat: add recentPredictions ZQL query with user + match relations"
```

---

### Task 2: Extend leaderboard queries with full follow rows

The existing `followingByUser` only returns `followingId` — we also need `id` for delete. The query already returns full rows (Zero returns all columns), so we just need to confirm the return type. Also add `followsByUser` as a clearer-named alias used in social hooks.

**Files:**
- Modify: `src/data/queries/leaderboard.ts`

- [ ] **Step 1: Add `followsByUser` export** (keeps existing `followingByUser` for leaderboard back-compat)

Replace the content of `src/data/queries/leaderboard.ts` with:

```typescript
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

// Returns full follow rows (id, followerId, followingId, createdAt)
export const followsByUser = (props: { followerId: string }) => {
  return zql.follow
    .where(followPermission)
    .where('followerId', props.followerId)
}

// Alias kept for existing useFriendsLeaderboard usage
export const followingByUser = followsByUser
```

- [ ] **Step 2: Commit**

```bash
git add src/data/queries/leaderboard.ts
git commit -m "feat: add followsByUser query alias with full follow rows"
```

---

### Task 3: `useFollow` hook

**Files:**
- Create: `src/features/social/useFollow.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// src/features/social/useFollow.ts
import { useCallback, useMemo } from 'react'

import { followsByUser } from '~/data/queries/leaderboard'
import { useAuth } from '~/features/auth/client/authClient'
import { useQuery, zero } from '~/zero/client'

// Returns a Map of followingId → follow row id for the current user.
// Used to cheaply check isFollowing(userId) and get the row id for delete.
export function useFollowMap() {
  const auth = useAuth()
  const userId = auth?.user?.id ?? ''
  const [follows] = useQuery(followsByUser, { followerId: userId }, { enabled: !!userId })

  const followMap = useMemo(
    () => new Map((follows ?? []).map((f) => [f.followingId, f.id])),
    [follows],
  )

  return followMap
}

export function useFollowActions() {
  const auth = useAuth()

  const follow = useCallback(
    (targetUserId: string) => {
      const myId = auth?.user?.id
      if (!myId) return
      zero.mutate.follow.insert({
        id: crypto.randomUUID(),
        followerId: myId,
        followingId: targetUserId,
        createdAt: Date.now(),
      })
    },
    [auth],
  )

  const unfollow = useCallback((followId: string) => {
    zero.mutate.follow.delete({ id: followId })
  }, [])

  return { follow, unfollow }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/social/useFollow.ts
git commit -m "feat: useFollowMap and useFollowActions hooks"
```

---

### Task 4: FeedItem component

**Files:**
- Create: `src/features/feed/FeedItem.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/features/feed/FeedItem.tsx
import { SizableText, XStack, YStack } from 'tamagui'

interface FeedItemProps {
  userName: string | null | undefined
  userCountry: string | null | undefined
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  predictedHome: number
  predictedAway: number
  actualHome?: number | null
  actualAway?: number | null
  pointsAwarded?: number | null
  status: string
  createdAt: number
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function FeedItem({
  userName,
  userCountry,
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  predictedHome,
  predictedAway,
  actualHome,
  actualAway,
  pointsAwarded,
  status,
  createdAt,
}: FeedItemProps) {
  const isFinished = status === 'finished'
  const hasResult = isFinished && actualHome != null && actualAway != null
  const name = userName || 'Anonymous'
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')

  const pointsBg = pointsAwarded === 3 ? '$green3' : pointsAwarded === 1 ? '$blue3' : '$color3'
  const pointsBorder = pointsAwarded === 3 ? '$green7' : pointsAwarded === 1 ? '$blue7' : '$color6'
  const pointsColor = pointsAwarded === 3 ? '$green10' : pointsAwarded === 1 ? '$blue10' : '$color9'
  const pointsLabel =
    pointsAwarded === 3 ? '🎯 +3 pts' : pointsAwarded === 1 ? '✓ +1 pt' : hasResult ? '✗ +0 pts' : null

  return (
    <YStack bg="$color2" rounded="$4" borderWidth={1} borderColor="$borderColor" p="$3" gap="$2">
      {/* Header: avatar + name + time */}
      <XStack items="center" gap="$2">
        <XStack
          width={28}
          height={28}
          rounded={14 as any}
          bg="$color8"
          items="center"
          justify="center"
        >
          <SizableText size="$1" fontWeight="700" color="white">{initials || '?'}</SizableText>
        </XStack>
        <SizableText size="$2" fontWeight="600" color="$color12" flex={1}>
          {name}{userCountry ? ` ${userCountry}` : ''}
        </SizableText>
        <SizableText size="$1" color="$color8">{timeAgo(createdAt)}</SizableText>
      </XStack>

      {/* Match */}
      <XStack items="center" gap="$2" justify="center">
        <XStack flex={1} justify="flex-end" items="center" gap="$1">
          <SizableText size="$2" fontWeight="600" color="$color11" style={{ textAlign: 'right' }} numberOfLines={1}>
            {homeTeam}
          </SizableText>
          <SizableText size="$4">{homeFlag}</SizableText>
        </XStack>

        <YStack items="center" gap="$0.5">
          <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={1}>
            Predicted
          </SizableText>
          <XStack items="center" gap="$1">
            <XStack width={28} height={28} bg="$color3" rounded="$2" items="center" justify="center">
              <SizableText size="$3" fontWeight="700" color="$color12">{predictedHome}</SizableText>
            </XStack>
            <SizableText color="$color8" size="$3">–</SizableText>
            <XStack width={28} height={28} bg="$color3" rounded="$2" items="center" justify="center">
              <SizableText size="$3" fontWeight="700" color="$color12">{predictedAway}</SizableText>
            </XStack>
          </XStack>
          {hasResult && (
            <SizableText size="$1" color="$color8">
              Final: {actualHome}–{actualAway}
            </SizableText>
          )}
        </YStack>

        <XStack flex={1} justify="flex-start" items="center" gap="$1">
          <SizableText size="$4">{awayFlag}</SizableText>
          <SizableText size="$2" fontWeight="600" color="$color11" numberOfLines={1}>
            {awayTeam}
          </SizableText>
        </XStack>
      </XStack>

      {/* Points badge */}
      {pointsLabel && (
        <XStack justify="center">
          <XStack
            bg={pointsBg}
            borderColor={pointsBorder}
            borderWidth={1}
            rounded="$10"
            px="$2"
            py="$0.5"
          >
            <SizableText size="$1" color={pointsColor} fontWeight="600">{pointsLabel}</SizableText>
          </XStack>
        </XStack>
      )}
    </YStack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/feed/FeedItem.tsx
git commit -m "feat: FeedItem card component with match, prediction, and points"
```

---

### Task 5: FeedScreen

**Files:**
- Create: `src/features/feed/FeedScreen.tsx`

- [ ] **Step 1: Create the screen**

```typescript
// src/features/feed/FeedScreen.tsx
import { useMemo } from 'react'
import { FlatList } from 'react-native'
import { isWeb, SizableText, Spinner, YStack } from 'tamagui'

import { recentPredictions } from '~/data/queries/feed'
import { useAuth } from '~/features/auth/client/authClient'
import { useFollowMap } from '~/features/social/useFollow'
import { H1 } from '~/interface/text/Headings'
import { useQuery } from '~/zero/client'
import { FeedItem } from './FeedItem'

function useFeed() {
  const auth = useAuth()
  const myUserId = auth?.user?.id ?? ''
  const followMap = useFollowMap()

  const [predictions, { type }] = useQuery(recentPredictions, { limit: 200 })

  const feedItems = useMemo(() => {
    if (!predictions) return []
    // Show predictions from followed users only (exclude own)
    return predictions.filter(
      (p) => p.userId !== myUserId && followMap.has(p.userId),
    )
  }, [predictions, followMap, myUserId])

  return { feedItems, isLoading: type === 'unknown', hasFollows: followMap.size > 0 }
}

export function FeedScreen() {
  const { feedItems, isLoading, hasFollows } = useFeed()

  return (
    <YStack
      bg="$background"
      pt={isWeb ? 70 : 0}
      style={isWeb ? { height: '100vh', display: 'flex', flexDirection: 'column' } : { flex: 1 }}
    >
      <YStack px="$4" maxW={860} width="100%" mx="auto">
        <H1 py="$3" size="$6">Feed</H1>
      </YStack>

      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" />
        </YStack>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12, maxWidth: 860, alignSelf: 'center', width: '100%' }}
          renderItem={({ item }) => (
            <FeedItem
              userName={item.user?.name}
              userCountry={item.user?.country}
              homeTeam={item.match?.homeTeam ?? ''}
              awayTeam={item.match?.awayTeam ?? ''}
              homeFlag={item.match?.homeFlag ?? ''}
              awayFlag={item.match?.awayFlag ?? ''}
              predictedHome={item.homeScore}
              predictedAway={item.awayScore}
              actualHome={item.match?.homeScore}
              actualAway={item.match?.awayScore}
              pointsAwarded={item.pointsAwarded}
              status={item.match?.status ?? 'scheduled'}
              createdAt={item.createdAt}
            />
          )}
          ListEmptyComponent={
            <YStack items="center" justify="center" py="$12" gap="$2">
              <SizableText size="$6">⚽</SizableText>
              <SizableText color="$color10" fontWeight="600">
                {hasFollows ? 'No predictions yet from people you follow' : 'Follow people to see their predictions here'}
              </SizableText>
              <SizableText size="$2" color="$color8" style={{ textAlign: 'center' }}>
                {hasFollows ? 'Check back after matches kick off' : 'Go to Leaderboard and hit Follow'}
              </SizableText>
            </YStack>
          }
        />
      )}
    </YStack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/feed/FeedScreen.tsx
git commit -m "feat: FeedScreen with live activity feed from followed users"
```

---

### Task 6: Follow button on LeaderboardRow

**Files:**
- Modify: `src/features/leaderboard/LeaderboardRow.tsx`

- [ ] **Step 1: Add follow button to the row**

Replace the full content of `src/features/leaderboard/LeaderboardRow.tsx` with:

```typescript
import { SizableText, XStack, YStack } from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import type { LeaderboardEntryWithUser } from './useLeaderboard'

const RANK_COLORS: Record<number, string> = { 1: '#f59e0b', 2: '#9ca3af', 3: '#cd7f32' }

interface LeaderboardRowProps {
  entry: LeaderboardEntryWithUser
  rank: number
  isMe: boolean
  isFollowing?: boolean
  onFollowToggle?: () => void
}

export function LeaderboardRow({ entry, rank, isMe, isFollowing, onFollowToggle }: LeaderboardRowProps) {
  const name = entry.user?.name || 'Anonymous'
  const country = entry.user?.country
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const rankColor = (RANK_COLORS[rank] ?? (isMe ? '$blue10' : '$color11')) as '$blue10' | '$color11'

  return (
    <YStack
      bg={isMe ? '$blue2' : '$color2'}
      borderWidth={1}
      borderColor={isMe ? '$blue6' : '$borderColor'}
      rounded="$4"
      px="$3"
      py="$2"
      gap="$1"
    >
      <XStack items="center" gap="$3">
        {/* Rank */}
        <SizableText
          width={24}
          style={{ textAlign: 'center' }}
          size="$3"
          fontWeight="800"
          color={rankColor}
        >
          {rank}
        </SizableText>

        {/* Avatar */}
        <XStack
          width={32}
          height={32}
          rounded={16 as any}
          bg={isMe ? '$blue8' : '$color8'}
          items="center"
          justify="center"
        >
          <SizableText size="$1" fontWeight="700" color="white">
            {initials || '?'}
          </SizableText>
        </XStack>

        {/* Name + flag */}
        <XStack flex={1} items="center" gap="$2">
          <SizableText
            size="$3"
            fontWeight="600"
            color={isMe ? '$blue11' : '$color12'}
            numberOfLines={1}
          >
            {name}
          </SizableText>
          {country && <SizableText size="$4">{country}</SizableText>}
        </XStack>

        {/* Points */}
        <SizableText
          size="$4"
          fontWeight="800"
          color={isMe ? '$blue10' : rank <= 3 ? (rankColor as any) : '$color12'}
        >
          {entry.totalPoints} pts
        </SizableText>

        {/* Follow button — hidden for own row */}
        {!isMe && onFollowToggle && (
          <Button
            size="$2"
            theme={isFollowing ? undefined : 'blue'}
            chromeless={isFollowing}
            rounded="$10"
            onPress={onFollowToggle}
            px="$2"
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </XStack>

      {/* Stats sub-row */}
      <XStack gap="$3" pl={56 as any}>
        <SizableText size="$1" color={isMe ? '$blue9' : '$color9'}>
          🎯 {entry.exactScores} exact
        </SizableText>
        <SizableText size="$1" color={isMe ? '$blue9' : '$color9'}>
          ✓ {entry.correctResults} result
        </SizableText>
        <SizableText size="$1" color={isMe ? '$blue9' : '$color9'}>
          {entry.predictionsMade} played
        </SizableText>
      </XStack>
    </YStack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/leaderboard/LeaderboardRow.tsx
git commit -m "feat: add Follow/Following button to LeaderboardRow"
```

---

### Task 7: Wire follow actions into LeaderboardScreen

**Files:**
- Modify: `src/features/leaderboard/screen.tsx`

- [ ] **Step 1: Update screen to pass follow state + handlers**

Replace the full content of `src/features/leaderboard/screen.tsx` with:

```typescript
import { useCallback, useMemo, useState } from 'react'
import { FlatList } from 'react-native'
import { Button, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { useFollowActions, useFollowMap } from '~/features/social/useFollow'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1 } from '~/interface/text/Headings'
import { LeaderboardRow } from './LeaderboardRow'
import { useFriendsLeaderboard, useLeaderboard, useMyLeaderboardEntry } from './useLeaderboard'

type Tab = 'all' | 'friends'

export function LeaderboardScreen() {
  const auth = useAuth()
  const myUserId = auth?.user?.id
  const [tab, setTab] = useState<Tab>('all')

  const { entries: allEntries, isLoading: allLoading } = useLeaderboard()
  const { entries: friendEntries, isLoading: friendsLoading } = useFriendsLeaderboard()
  const { myEntry } = useMyLeaderboardEntry()
  const followMap = useFollowMap()
  const { follow, unfollow } = useFollowActions()

  const entries = tab === 'all' ? allEntries : friendEntries
  const isLoading = tab === 'all' ? allLoading : friendsLoading

  const myRank = useMemo(() => {
    if (!myUserId) return null
    const idx = allEntries.findIndex((e) => e.userId === myUserId)
    return idx >= 0 ? idx + 1 : null
  }, [allEntries, myUserId])

  const myFriendsRank = useMemo(() => {
    if (!myUserId) return null
    const idx = friendEntries.findIndex((e) => e.userId === myUserId)
    return idx >= 0 ? idx + 1 : null
  }, [friendEntries, myUserId])

  const currentRank = tab === 'all' ? myRank : myFriendsRank

  const handleFollowToggle = useCallback(
    (userId: string) => {
      const followId = followMap.get(userId)
      if (followId) {
        unfollow(followId)
      } else {
        follow(userId)
      }
    },
    [followMap, follow, unfollow],
  )

  return (
    <YStack flex={1} bg="$background">
      <PageContainer>
        <H1 py="$3" size="$6">Leaderboard</H1>

        {/* Tab bar */}
        <XStack gap="$2" mb="$4">
          <Button
            size="$3"
            theme={tab === 'all' ? 'blue' : undefined}
            chromeless={tab !== 'all'}
            onPress={() => setTab('all')}
          >
            Global
          </Button>
          <Button
            size="$3"
            theme={tab === 'friends' ? 'blue' : undefined}
            chromeless={tab !== 'friends'}
            onPress={() => setTab('friends')}
          >
            Friends
          </Button>
        </XStack>
      </PageContainer>

      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" />
        </YStack>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 4 }}
          renderItem={({ item, index }) => (
            <LeaderboardRow
              entry={item}
              rank={index + 1}
              isMe={item.userId === myUserId}
              isFollowing={followMap.has(item.userId)}
              onFollowToggle={() => handleFollowToggle(item.userId)}
            />
          )}
          ListEmptyComponent={
            <YStack items="center" justify="center" py="$8">
              <SizableText color="$color9">
                {tab === 'friends' ? 'Follow people to see their scores here' : 'No predictions yet'}
              </SizableText>
            </YStack>
          }
          ListFooterComponent={
            myEntry && myUserId && !entries.some((e) => e.userId === myUserId) ? (
              <YStack pt="$2">
                <SizableText size="$1" color="$color9" style={{ textAlign: 'center' }} pb="$2">
                  Your rank
                </SizableText>
                <LeaderboardRow
                  entry={myEntry}
                  rank={currentRank ?? 0}
                  isMe
                />
              </YStack>
            ) : null
          }
        />
      )}
    </YStack>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/leaderboard/screen.tsx
git commit -m "feat: wire follow/unfollow actions into LeaderboardScreen"
```

---

### Task 8: Replace feed tab + remove todo demo

**Files:**
- Modify: `app/(app)/home/(tabs)/feed/index.tsx`

- [ ] **Step 1: Replace todo demo with FeedScreen**

Replace the full content of `app/(app)/home/(tabs)/feed/index.tsx` with:

```typescript
import { FeedScreen } from '~/features/feed/FeedScreen'

export function HomePage() {
  return <FeedScreen />
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/home/(tabs)/feed/index.tsx"
git commit -m "feat: replace todo demo with FeedScreen on Feed tab"
```

---

### Task 9: TypeScript check

- [ ] **Step 1: Run type check**

```bash
bun run env:dev tko check types
```

Expected: no errors. If there are errors, they will be in one of the new files — fix the type mismatch (typically a `null | undefined` not being narrowed, or a missing property on the ZQL result type) and recommit.

Common fixes:
- `item.match?.homeTeam ?? ''` — ZQL related results are optional
- `item.user?.name` — may be `null | undefined`, handled by `|| 'Anonymous'` in FeedItem

- [ ] **Step 2: Commit fix if needed**

```bash
git add <files>
git commit -m "fix: TypeScript errors in feed and follow components"
```

---

## Testing checklist

After all tasks complete:

1. Open Leaderboard → should see **Follow** button on every row except your own
2. Click Follow on a user → button immediately changes to **Following** (optimistic update)
3. Click Following → unfollows immediately
4. Switch to Friends tab → only followed users appear
5. Open Feed tab → if you follow users who have predictions, their predictions appear as cards
6. Feed empty state: no follows → "Follow people to see their predictions here"
7. Feed empty state: has follows but no predictions yet → "No predictions yet from people you follow"
