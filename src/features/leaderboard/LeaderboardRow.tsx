import { SizableText, XStack, YStack } from 'tamagui'

import type { LeaderboardEntryWithUser } from './useLeaderboard'

const RANK_COLORS: Record<number, string> = { 1: '#f59e0b', 2: '#9ca3af', 3: '#cd7f32' }

interface LeaderboardRowProps {
  entry: LeaderboardEntryWithUser
  rank: number
  isMe: boolean
}

export function LeaderboardRow({ entry, rank, isMe }: LeaderboardRowProps) {
  const name = entry.user?.name || 'Anonymous'
  const country = entry.user?.country
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const rankColor = RANK_COLORS[rank] ?? (isMe ? '$blue10' : '$color11')

  return (
    <YStack
      backgroundColor={isMe ? '$blue2' : '$color2'}
      borderWidth={1}
      borderColor={isMe ? '$blue6' : '$borderColor'}
      borderRadius="$4"
      paddingHorizontal="$3"
      paddingVertical="$2"
      gap="$1"
    >
      <XStack items="center" gap="$3">
        {/* Rank */}
        <SizableText
          width={24}
          textAlign="center"
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
          borderRadius={16}
          backgroundColor={isMe ? '$blue8' : '$color8'}
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
          color={isMe ? '$blue10' : rank <= 3 ? rankColor : '$color12'}
        >
          {entry.totalPoints} pts
        </SizableText>
      </XStack>

      {/* Stats sub-row */}
      <XStack gap="$3" paddingLeft={56}>
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
