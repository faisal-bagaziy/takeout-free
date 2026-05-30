import { router } from 'one'
import { SizableText, XStack, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { useMyLeaderboardEntry } from '~/features/leaderboard/useLeaderboard'
import { Button } from '~/interface/buttons/Button'

export function ProfileHeader() {
  const auth = useAuth()
  const user = auth?.user
  const { myEntry } = useMyLeaderboardEntry()

  if (!user) return null

  const name = user.name || 'Anonymous'
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <YStack
      bg="$color2"
      borderBottomWidth={1}
      borderColor="$borderColor"
      px="$5"
      pt="$6"
      pb="$5"
      gap="$4"
    >
      <XStack items="center" gap="$4">
        {/* Avatar */}
        <XStack
          width={64}
          height={64}
          rounded={32 as any}
          bg="$blue8"
          items="center"
          justify="center"
          flexShrink={0}
        >
          <SizableText fontSize={22} fontWeight="800" color="white">
            {initials || '?'}
          </SizableText>
        </XStack>

        {/* Name + email */}
        <YStack flex={1} gap="$0.5">
          <XStack items="center" gap="$2" flexWrap="wrap">
            <SizableText size="$5" fontWeight="800" color="$color12">
              {name}
            </SizableText>
          </XStack>
          <SizableText size="$2" color="$color9" numberOfLines={1}>
            {user.email}
          </SizableText>
        </YStack>

        <Button
          size="$2"
          chromeless
          rounded="$10"
          borderWidth={1}
          borderColor="$borderColor"
          onPress={() => router.push('/home/settings/edit-profile')}
        >
          Edit
        </Button>
      </XStack>

      {/* Stats */}
      {myEntry && (
        <XStack
          bg="$color3"
          rounded="$3"
          px="$4"
          py="$3"
          justify="space-around"
        >
          <YStack items="center" gap="$0.5">
            <SizableText size="$5" fontWeight="800" color="$color12">
              {myEntry.totalPoints}
            </SizableText>
            <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={0.5}>
              Points
            </SizableText>
          </YStack>

          <YStack width={1} bg="$borderColor" />

          <YStack items="center" gap="$0.5">
            <SizableText size="$5" fontWeight="800" color="$green10">
              {myEntry.exactScores}
            </SizableText>
            <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={0.5}>
              Exact
            </SizableText>
          </YStack>

          <YStack width={1} bg="$borderColor" />

          <YStack items="center" gap="$0.5">
            <SizableText size="$5" fontWeight="800" color="$color12">
              {myEntry.predictionsMade}
            </SizableText>
            <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={0.5}>
              Played
            </SizableText>
          </YStack>
        </XStack>
      )}
    </YStack>
  )
}
