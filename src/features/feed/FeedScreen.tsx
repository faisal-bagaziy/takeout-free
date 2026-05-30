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
    return predictions.filter((p) => p.userId !== myUserId && followMap.has(p.userId))
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
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 32,
            gap: 12,
            maxWidth: 860,
            alignSelf: 'center',
            width: '100%',
          }}
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
            <YStack items="center" justify="center" py="$12" gap="$3">
              <SizableText size="$8">⚽</SizableText>
              <YStack items="center" gap="$1">
                <SizableText fontWeight="600" color="$color11">
                  {hasFollows
                    ? 'No predictions yet from people you follow'
                    : 'Your feed is empty'}
                </SizableText>
                <SizableText size="$2" color="$color9" style={{ textAlign: 'center' }}>
                  {hasFollows
                    ? 'Check back after matches kick off'
                    : 'Go to Leaderboard and follow players to see their predictions here'}
                </SizableText>
              </YStack>
            </YStack>
          }
        />
      )}
    </YStack>
  )
}
