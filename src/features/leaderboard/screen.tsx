import { useCallback, useMemo } from 'react'
import { FlatList } from 'react-native'
import { isWeb, SizableText, Spinner, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { useFollowActions, useFollowMap } from '~/features/social/useFollow'
import { H1 } from '~/interface/text/Headings'
import { LeaderboardRow } from './LeaderboardRow'
import { useLeaderboard, useMyLeaderboardEntry } from './useLeaderboard'

export function LeaderboardScreen() {
  const auth = useAuth()
  const myUserId = auth?.user?.id
  const { entries, isLoading } = useLeaderboard()
  const { myEntry } = useMyLeaderboardEntry()
  const followMap = useFollowMap()
  const { follow, unfollow } = useFollowActions()

  const myRank = useMemo(() => {
    if (!myUserId) return null
    const idx = entries.findIndex((e) => e.userId === myUserId)
    return idx >= 0 ? idx + 1 : null
  }, [entries, myUserId])

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
    <YStack
      bg="$background"
      pt={isWeb ? 70 : 0}
      style={isWeb ? { height: '100vh', display: 'flex', flexDirection: 'column' } : { flex: 1 }}
    >
      <YStack px="$4" maxW={860} width="100%" mx="auto">
        <H1 py="$3" size="$6">Leaderboard</H1>
      </YStack>

      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" />
        </YStack>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
            gap: 4,
            maxWidth: 860,
            alignSelf: 'center',
            width: '100%',
          }}
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
              <SizableText color="$color9">No predictions yet</SizableText>
            </YStack>
          }
          ListFooterComponent={
            myEntry && myUserId && !entries.some((e) => e.userId === myUserId) ? (
              <YStack pt="$4" borderTopWidth={1} borderColor="$borderColor" mt="$2">
                <SizableText size="$1" color="$color9" style={{ textAlign: 'center' }} pb="$2">
                  Your position
                </SizableText>
                <LeaderboardRow entry={myEntry} rank={myRank ?? 0} isMe />
              </YStack>
            ) : null
          }
        />
      )}
    </YStack>
  )
}
