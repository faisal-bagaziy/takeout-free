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
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')

  const pointsBg = pointsAwarded === 3 ? '$green3' : pointsAwarded === 1 ? '$blue3' : '$color3'
  const pointsBorder = pointsAwarded === 3 ? '$green7' : pointsAwarded === 1 ? '$blue7' : '$color6'
  const pointsColor = pointsAwarded === 3 ? '$green10' : pointsAwarded === 1 ? '$blue10' : '$color9'
  const pointsLabel =
    pointsAwarded === 3
      ? '🎯 Exact · +3 pts'
      : pointsAwarded === 1
        ? '✓ One correct · +1 pt'
        : hasResult
          ? '✗ Missed · +0 pts'
          : null

  return (
    <YStack bg="$color2" rounded="$4" borderWidth={1} borderColor="$borderColor" p="$3" gap="$2">
      {/* Header */}
      <XStack items="center" gap="$2">
        <XStack
          width={28}
          height={28}
          rounded={14 as any}
          bg="$color7"
          items="center"
          justify="center"
        >
          <SizableText size="$1" fontWeight="700" color="white">
            {initials || '?'}
          </SizableText>
        </XStack>
        <SizableText size="$2" fontWeight="600" color="$color12" flex={1}>
          {name}
          {userCountry ? `  ${userCountry}` : ''}
        </SizableText>
        <SizableText size="$1" color="$color8">
          {timeAgo(createdAt)}
        </SizableText>
      </XStack>

      {/* Match + scores */}
      <XStack items="center" gap="$2">
        <XStack flex={1} justify="flex-end" items="center" gap="$1">
          <SizableText
            size="$2"
            fontWeight="600"
            color="$color11"
            style={{ textAlign: 'right' }}
            numberOfLines={1}
          >
            {homeTeam}
          </SizableText>
          <SizableText size="$3">{homeFlag}</SizableText>
        </XStack>

        <YStack items="center" gap="$0.5" minWidth={90}>
          <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={1}>
            Predicted
          </SizableText>
          <XStack items="center" gap="$1">
            <XStack width={28} height={28} bg="$color3" rounded="$2" items="center" justify="center">
              <SizableText size="$3" fontWeight="700" color="$color12">
                {predictedHome}
              </SizableText>
            </XStack>
            <SizableText color="$color8" size="$3">–</SizableText>
            <XStack width={28} height={28} bg="$color3" rounded="$2" items="center" justify="center">
              <SizableText size="$3" fontWeight="700" color="$color12">
                {predictedAway}
              </SizableText>
            </XStack>
          </XStack>
          {hasResult && (
            <SizableText size="$1" color="$color8">
              Final: {actualHome}–{actualAway}
            </SizableText>
          )}
        </YStack>

        <XStack flex={1} justify="flex-start" items="center" gap="$1">
          <SizableText size="$3">{awayFlag}</SizableText>
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
            px="$3"
            py="$0.5"
          >
            <SizableText size="$1" color={pointsColor} fontWeight="600">
              {pointsLabel}
            </SizableText>
          </XStack>
        </XStack>
      )}
    </YStack>
  )
}
