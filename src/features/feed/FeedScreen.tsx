import { useMemo } from 'react'
import { FlatList } from 'react-native'
import { isWeb, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { recentPredictions } from '~/data/queries/feed'
import { useAuth } from '~/features/auth/client/authClient'
import { useFollowMap } from '~/features/social/useFollow'
import { useQuery } from '~/zero/client'
import { FeedItem } from './FeedItem'

type FeedRow =
  | { type: 'header'; label: string; key: string }
  | { type: 'item'; data: ReturnType<typeof useFeedItems>['feedItems'][number]; key: string }

function dayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function useFeedItems() {
  const auth = useAuth()
  const myUserId = auth?.user?.id ?? ''
  const followMap = useFollowMap()
  const [predictions, { type }] = useQuery(recentPredictions, { limit: 200 })

  const feedItems = useMemo(() => {
    if (!predictions) return []
    return predictions.filter((p) => p.userId !== myUserId && followMap.has(p.userId))
  }, [predictions, followMap, myUserId])

  return { feedItems, isLoading: type === 'unknown', hasFollows: followMap.size > 0 }
}

function buildRows(feedItems: ReturnType<typeof useFeedItems>['feedItems']): FeedRow[] {
  const rows: FeedRow[] = []
  let lastLabel = ''

  for (const item of feedItems) {
    const label = dayLabel(item.createdAt)
    if (label !== lastLabel) {
      rows.push({ type: 'header', label, key: `header-${label}` })
      lastLabel = label
    }
    rows.push({ type: 'item', data: item, key: item.id })
  }

  return rows
}

export function FeedScreen() {
  const { feedItems, isLoading, hasFollows } = useFeedItems()
  const rows = useMemo(() => buildRows(feedItems), [feedItems])

  return (
    <YStack
      bg="$background"
      pt={isWeb ? 70 : 0}
      style={isWeb ? { height: '100vh', display: 'flex', flexDirection: 'column' } : { flex: 1 }}
    >
      {/* WC2026 Header */}
      <YStack
        px="$4"
        pt="$3"
        pb="$3"
        maxW={860}
        width="100%"
        mx="auto"
        gap="$0.5"
      >
        <XStack items="center" gap="$2">
          <SizableText size="$7" fontWeight="800" color="$color12" letterSpacing={-0.5}>
            Feed
          </SizableText>
          <XStack
            bg="$yellow3"
            borderColor="$yellow7"
            borderWidth={1}
            rounded="$10"
            px="$2"
            py="$0.5"
          >
            <SizableText size="$1" color="$yellow10" fontWeight="700" letterSpacing={0.5}>
              ⚽ WC2026
            </SizableText>
          </XStack>
        </XStack>
        <SizableText size="$2" color="$color9">
          Predictions from people you follow
        </SizableText>
      </YStack>

      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" />
        </YStack>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.key}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 40,
            gap: 8,
            maxWidth: 860,
            alignSelf: 'center',
            width: '100%',
          }}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <XStack items="center" gap="$3" pt="$2" pb="$1">
                  <SizableText size="$2" fontWeight="700" color="$color9" textTransform="uppercase" letterSpacing={1}>
                    {item.label}
                  </SizableText>
                  <YStack flex={1} height={1} bg="$borderColor" />
                </XStack>
              )
            }
            const p = item.data
            return (
              <FeedItem
                userName={p.user?.name}
                userCountry={p.user?.country}
                homeTeam={p.match?.homeTeam ?? ''}
                awayTeam={p.match?.awayTeam ?? ''}
                homeFlag={p.match?.homeFlag ?? ''}
                awayFlag={p.match?.awayFlag ?? ''}
                predictedHome={p.homeScore}
                predictedAway={p.awayScore}
                actualHome={p.match?.homeScore}
                actualAway={p.match?.awayScore}
                pointsAwarded={p.pointsAwarded}
                status={p.match?.status ?? 'scheduled'}
                stage={p.match?.stage ?? 'group'}
                group={p.match?.group}
                matchday={p.match?.matchday}
                createdAt={p.createdAt}
              />
            )
          }}
          ListEmptyComponent={
            <YStack items="center" justify="center" py="$12" gap="$4">
              <SizableText fontSize={56}>⚽</SizableText>
              <YStack items="center" gap="$2">
                <SizableText size="$5" fontWeight="800" color="$color12" style={{ textAlign: 'center' }}>
                  {hasFollows ? 'No activity yet' : 'Your feed is empty'}
                </SizableText>
                <SizableText size="$3" color="$color9" style={{ textAlign: 'center', maxWidth: 280 }}>
                  {hasFollows
                    ? 'People you follow haven\'t predicted yet. Check back when matches kick off.'
                    : 'Follow players on the Leaderboard to see their predictions here.'}
                </SizableText>
              </YStack>
            </YStack>
          }
        />
      )}
    </YStack>
  )
}
