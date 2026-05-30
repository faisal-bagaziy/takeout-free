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
  stage: string
  group?: string | null
  matchday?: number | null
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

function stageLabel(stage: string, group?: string | null, matchday?: number | null): string {
  if (stage === 'group') return `Group ${group ?? ''} · MD${matchday ?? ''}`
  const labels: Record<string, string> = {
    'round-of-32': 'Round of 32',
    'round-of-16': 'Round of 16',
    quarterfinal: 'Quarterfinal',
    semifinal: 'Semifinal',
    'third-place': 'Third Place',
    final: '🏆 Final',
  }
  return labels[stage] ?? stage.toUpperCase()
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
  stage,
  group,
  matchday,
  createdAt,
}: FeedItemProps) {
  const isLive = status === 'live'
  const isFinished = status === 'finished'
  const hasResult = isFinished && actualHome != null && actualAway != null
  const name = userName || 'Anonymous'
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')

  const isExact = pointsAwarded === 3
  const isPartial = pointsAwarded === 1
  const isMissed = hasResult && pointsAwarded === 0

  return (
    <YStack
      bg="$color2"
      rounded="$4"
      borderWidth={1}
      borderColor={isExact ? '$green6' : isPartial ? '$blue6' : '$borderColor'}
      overflow="hidden"
    >
      {/* Top accent bar for exact score */}
      {isExact && <YStack height={3} bg="$green8" />}
      {isPartial && <YStack height={3} bg="$blue8" />}

      <YStack p="$3" gap="$3">
        {/* Header: avatar + name + stage + time */}
        <XStack items="center" gap="$2">
          <XStack
            width={32}
            height={32}
            rounded={16 as any}
            bg="$color7"
            items="center"
            justify="center"
            style={{ flexShrink: 0 }}
          >
            <SizableText size="$1" fontWeight="700" color="white">
              {initials || '?'}
            </SizableText>
          </XStack>

          <YStack flex={1}>
            <XStack items="center" gap="$1.5">
              <SizableText size="$3" fontWeight="700" color="$color12" numberOfLines={1}>
                {name}
              </SizableText>
              {userCountry && <SizableText size="$3">{userCountry}</SizableText>}
            </XStack>
            <SizableText size="$1" color="$color8">
              {stageLabel(stage, group, matchday)}
            </SizableText>
          </YStack>

          <XStack items="center" gap="$1">
            {isLive && (
              <XStack bg="$red3" borderColor="$red7" borderWidth={1} rounded="$10" px="$2" py="$0.5">
                <SizableText size="$1" color="$red10" fontWeight="700">● LIVE</SizableText>
              </XStack>
            )}
            <SizableText size="$1" color="$color8">{timeAgo(createdAt)}</SizableText>
          </XStack>
        </XStack>

        {/* Match */}
        <XStack items="center" gap="$2">
          {/* Home */}
          <XStack flex={1} items="center" justify="flex-end" gap="$1.5">
            <SizableText
              size="$2"
              fontWeight="600"
              color="$color12"
              numberOfLines={1}
              style={{ textAlign: 'right' }}
            >
              {homeTeam}
            </SizableText>
            <SizableText size="$4">{homeFlag}</SizableText>
          </XStack>

          {/* Scores */}
          <YStack items="center" gap="$1">
            <XStack items="center" gap="$1">
              <XStack
                width={32}
                height={32}
                bg={hasResult && actualHome === predictedHome ? '$green3' : hasResult ? '$red3' : '$color3'}
                borderWidth={hasResult ? 1 : 0}
                borderColor={hasResult && actualHome === predictedHome ? '$green7' : '$red7'}
                rounded="$2"
                items="center"
                justify="center"
              >
                <SizableText
                  size="$4"
                  fontWeight="800"
                  color={hasResult && actualHome === predictedHome ? '$green10' : hasResult ? '$red10' : '$color12'}
                >
                  {predictedHome}
                </SizableText>
              </XStack>
              <SizableText color="$color7" size="$3" fontWeight="300">–</SizableText>
              <XStack
                width={32}
                height={32}
                bg={hasResult && actualAway === predictedAway ? '$green3' : hasResult ? '$red3' : '$color3'}
                borderWidth={hasResult ? 1 : 0}
                borderColor={hasResult && actualAway === predictedAway ? '$green7' : '$red7'}
                rounded="$2"
                items="center"
                justify="center"
              >
                <SizableText
                  size="$4"
                  fontWeight="800"
                  color={hasResult && actualAway === predictedAway ? '$green10' : hasResult ? '$red10' : '$color12'}
                >
                  {predictedAway}
                </SizableText>
              </XStack>
            </XStack>
            {hasResult && (
              <SizableText size="$1" color="$color8">
                Final {actualHome}–{actualAway}
              </SizableText>
            )}
            {!hasResult && (
              <SizableText size="$1" color="$color8">predicted</SizableText>
            )}
          </YStack>

          {/* Away */}
          <XStack flex={1} items="center" justify="flex-start" gap="$1.5">
            <SizableText size="$4">{awayFlag}</SizableText>
            <SizableText size="$2" fontWeight="600" color="$color12" numberOfLines={1}>
              {awayTeam}
            </SizableText>
          </XStack>
        </XStack>

        {/* Result badge */}
        {(isExact || isPartial || isMissed) && (
          <XStack justify="center">
            <XStack
              bg={isExact ? '$green3' : isPartial ? '$blue3' : '$color3'}
              borderColor={isExact ? '$green7' : isPartial ? '$blue7' : '$color6'}
              borderWidth={1}
              rounded="$10"
              px="$3"
              py="$0.5"
              gap="$1"
            >
              <SizableText
                size="$1"
                fontWeight="700"
                color={isExact ? '$green10' : isPartial ? '$blue10' : '$color9'}
              >
                {isExact ? '🎯 Exact score · +3 pts' : isPartial ? '✓ One correct · +1 pt' : '✗ No points'}
              </SizableText>
            </XStack>
          </XStack>
        )}
      </YStack>
    </YStack>
  )
}
