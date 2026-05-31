import { SizableText, XStack, YStack } from 'tamagui'

import { FlagChip } from '~/interface/flags/FlagChip'

const C = {
  ink:     '#151519',
  card:    '#1d1d22',
  lime:    '#adeb03',
  blue:    '#4f91c5',
  paper:   '#f7f7f8',
  muted:   '#707287',
  divider: 'rgba(112,114,135,0.4)',
}

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
  if (stage === 'group') return `GROUP ${group ?? ''} · MD${matchday ?? ''}`
  const labels: Record<string, string> = {
    r32: 'ROUND OF 32', r16: 'ROUND OF 16',
    qf: 'QUARTERFINAL', sf: 'SEMIFINAL',
    'third-place': 'THIRD PLACE', final: 'FINAL',
  }
  return labels[stage] ?? stage.toUpperCase()
}

function ScoreTile({
  value,
  correct,
  wrong,
}: {
  value: number
  correct: boolean
  wrong: boolean
}) {
  const bg = correct ? 'rgba(173,235,3,0.12)' : wrong ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)'
  const border = correct ? C.lime : wrong ? '#ef4444' : 'rgba(112,114,135,0.4)'
  const color = correct ? C.lime : wrong ? '#f87171' : C.paper
  return (
    <XStack
      width={36}
      height={36}
      rounded={8 as any}
      items="center"
      justify="center"
      style={{ backgroundColor: bg, borderWidth: 1.5, borderColor: border }}
    >
      <SizableText
        style={{
          fontFamily: 'var(--fwc-font-display, system-ui)',
          fontWeight: '800',
          fontSize: 18,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </SizableText>
    </XStack>
  )
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

  const isExact   = pointsAwarded === 3
  const isPartial = pointsAwarded === 1
  const isMissed  = hasResult && pointsAwarded === 0

  const homeCorrect = hasResult && actualHome === predictedHome
  const homeWrong   = hasResult && actualHome !== predictedHome
  const awayCorrect = hasResult && actualAway === predictedAway
  const awayWrong   = hasResult && actualAway !== predictedAway

  const name = userName || 'Anonymous'
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')

  // Accent color for left border
  const accentColor = isExact ? C.lime : isPartial ? C.blue : isMissed ? C.muted : 'transparent'

  return (
    <YStack
      overflow="hidden"
      rounded={14 as any}
      style={{
        backgroundColor: C.card,
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
      }}
    >
      {/* Header: user + stage + time */}
      <XStack
        px="$3"
        pt="$2.5"
        pb="$2"
        items="center"
        gap="$2"
        style={{ borderBottomWidth: 1, borderBottomColor: C.divider }}
      >
        {/* Avatar */}
        <XStack
          width={28}
          height={28}
          rounded={14 as any}
          items="center"
          justify="center"
          style={{ backgroundColor: 'rgba(173,235,3,0.15)', flexShrink: 0 }}
        >
          <SizableText
            style={{
              fontFamily: 'var(--fwc-font-display, system-ui)',
              fontWeight: '800',
              fontSize: 11,
              color: C.lime,
            }}
          >
            {initials || '?'}
          </SizableText>
        </XStack>

        <YStack flex={1} gap={1}>
          <XStack items="center" gap="$1.5">
            <SizableText
              numberOfLines={1}
              style={{
                fontFamily: 'var(--fwc-font-display, system-ui)',
                fontWeight: '700',
                fontSize: 14,
                color: C.paper,
              }}
            >
              {name}
            </SizableText>
            {userCountry && (
              <SizableText style={{ fontSize: 13 }}>{userCountry}</SizableText>
            )}
          </XStack>
          <SizableText
            style={{
              fontFamily: 'var(--fwc-font-condensed, system-ui)',
              fontWeight: '700',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: C.muted,
            }}
          >
            {stageLabel(stage, group, matchday)}
          </SizableText>
        </YStack>

        <XStack items="center" gap="$1.5">
          {isLive && (
            <XStack
              rounded={999 as any}
              px="$1.5"
              py="$0.5"
              style={{ backgroundColor: 'rgba(229,16,46,0.15)', borderWidth: 1, borderColor: '#e5102e' }}
            >
              <SizableText
                style={{
                  fontFamily: 'var(--fwc-font-condensed, system-ui)',
                  fontWeight: '700',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: '#e5102e',
                }}
              >
                LIVE
              </SizableText>
            </XStack>
          )}
          <SizableText style={{ fontSize: 11, color: C.muted }}>{timeAgo(createdAt)}</SizableText>
        </XStack>
      </XStack>

      {/* Match pill body */}
      <XStack px="$3" py="$2.5" items="center" gap="$2">
        {/* Home */}
        <XStack flex={1} items="center" justify="flex-end" gap="$1.5">
          <SizableText
            numberOfLines={1}
            style={{
              fontFamily: 'var(--fwc-font-display, system-ui)',
              fontWeight: '800',
              fontSize: 14,
              textTransform: 'uppercase',
              color: C.paper,
              textAlign: 'right',
            }}
          >
            {homeTeam}
          </SizableText>
          <FlagChip flag={homeFlag} size="sm" />
        </XStack>

        {/* Scores */}
        <XStack items="center" gap="$1.5">
          <ScoreTile value={predictedHome} correct={homeCorrect} wrong={homeWrong} />
          <SizableText style={{ color: C.muted, fontSize: 14, fontWeight: '300' }}>–</SizableText>
          <ScoreTile value={predictedAway} correct={awayCorrect} wrong={awayWrong} />
        </XStack>

        {/* Away */}
        <XStack flex={1} items="center" gap="$1.5">
          <FlagChip flag={awayFlag} size="sm" />
          <SizableText
            numberOfLines={1}
            style={{
              fontFamily: 'var(--fwc-font-display, system-ui)',
              fontWeight: '800',
              fontSize: 14,
              textTransform: 'uppercase',
              color: C.paper,
            }}
          >
            {awayTeam}
          </SizableText>
        </XStack>
      </XStack>

      {/* Footer: final result + points badge */}
      {(hasResult || isExact || isPartial || isMissed) && (
        <XStack
          px="$3"
          pb="$2.5"
          pt="$0.5"
          items="center"
          justify="space-between"
          style={{ borderTopWidth: 1, borderTopColor: C.divider }}
        >
          {hasResult ? (
            <SizableText
              style={{
                fontFamily: 'var(--fwc-font-condensed, system-ui)',
                fontWeight: '600',
                fontSize: 12,
                color: C.muted,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Final {actualHome} – {actualAway}
            </SizableText>
          ) : <XStack />}

          {(isExact || isPartial || isMissed) && (
            <XStack
              rounded={999 as any}
              px="$2"
              py="$0.5"
              style={{
                backgroundColor:
                  isExact ? 'rgba(173,235,3,0.12)' :
                  isPartial ? 'rgba(79,145,197,0.12)' :
                  'rgba(112,114,135,0.12)',
                borderWidth: 1,
                borderColor: isExact ? C.lime : isPartial ? C.blue : C.muted,
              }}
            >
              <SizableText
                style={{
                  fontFamily: 'var(--fwc-font-condensed, system-ui)',
                  fontWeight: '700',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: isExact ? C.lime : isPartial ? C.blue : C.muted,
                }}
              >
                {isExact ? '+ 3 PTS EXACT' : isPartial ? '+ 1 PT' : '+ 0 PTS'}
              </SizableText>
            </XStack>
          )}
        </XStack>
      )}
    </YStack>
  )
}
