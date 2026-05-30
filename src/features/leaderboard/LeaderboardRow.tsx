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
        <SizableText
          width={24}
          style={{ textAlign: 'center' }}
          size="$3"
          fontWeight="800"
          color={rankColor}
        >
          {rank}
        </SizableText>

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

        <XStack flex={1} items="center" gap="$2">
          <SizableText size="$3" fontWeight="600" color={isMe ? '$blue11' : '$color12'} numberOfLines={1}>
            {name}
          </SizableText>
          {country && <SizableText size="$4">{country}</SizableText>}
        </XStack>

        <SizableText
          size="$4"
          fontWeight="800"
          color={isMe ? '$blue10' : rank <= 3 ? (rankColor as any) : '$color12'}
        >
          {entry.totalPoints} pts
        </SizableText>

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
