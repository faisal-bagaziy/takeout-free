import { useMemo, useState } from 'react'
import { FlatList } from 'react-native'
import { Button, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
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

  return (
    <YStack flex={1} backgroundColor="$background">
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
              <YStack paddingTop="$2">
                <SizableText size="$1" color="$color9" textAlign="center" pb="$2">
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
