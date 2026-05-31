import { useEffect, useRef, useState } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { isWeb, SizableText, XStack, YStack } from 'tamagui'

import type { Match } from '~/data/models/match'
import { FlagChip } from '~/interface/flags/FlagChip'
import { ScoreInput } from './ScoreInput'

// FWC2026 brand colors (hardcoded — not in Tamagui theme)
const C = {
  ink: '#151519',
  card: '#1d1d22',
  lime: '#adeb03',
  limeDark: '#8fc400',
  paper: '#f7f7f8',
  divider: 'rgba(112,114,135,0.5)',
  muted: '#707287',
}

interface ExistingPrediction {
  id: string
  homeScore: number
  awayScore: number
  pointsAwarded?: number | null
  finalHomeScore?: number | null
  finalAwayScore?: number | null
}

interface MatchCardProps {
  match: Match
  existingPrediction: ExistingPrediction | null
  onSubmit: (matchId: string, homeScore: number, awayScore: number) => void
  onConfirm: (matchId: string, homeScore: number, awayScore: number, existingId?: string) => void
}

function ScoreBox({
  value,
  correct,
  wrong,
}: {
  value: number | null | undefined
  correct?: boolean
  wrong?: boolean
}) {
  const bg = correct ? '#1a3a0f' : wrong ? '#3a0f10' : C.paper
  const fg = correct ? '#6ee048' : wrong ? '#f87171' : C.ink
  const border = correct ? '#4caf50' : wrong ? '#ef4444' : 'transparent'
  return (
    <XStack
      width={48}
      height={44}
      rounded={10 as any}
      borderWidth={correct || wrong ? 1.5 : 0}
      items="center"
      justify="center"
      style={{ backgroundColor: bg, borderColor: border, flexShrink: 0 }}
    >
      <SizableText
        style={{
          fontFamily: 'var(--fwc-font-display, system-ui)',
          fontWeight: '800',
          fontSize: 22,
          lineHeight: 1,
          color: fg,
        }}
      >
        {value != null ? String(value) : '–'}
      </SizableText>
    </XStack>
  )
}

export function MatchCard({ match, existingPrediction, onSubmit, onConfirm }: MatchCardProps) {
  const isLocked = match.kickoffAt - 3_600_000 <= Date.now() || match.status !== 'scheduled'
  const isFinished = match.status === 'finished'
  const hasActualScore = match.homeScore != null && match.awayScore != null

  const [homeScore, setHomeScore] = useState(existingPrediction?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(existingPrediction?.awayScore ?? 0)

  const syncedPredictionId = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (existingPrediction && existingPrediction.id !== syncedPredictionId.current) {
      setHomeScore(existingPrediction.homeScore)
      setAwayScore(existingPrediction.awayScore)
      syncedPredictionId.current = existingPrediction.id
    }
  }, [existingPrediction])

  const pointsScale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
  }))
  const prevPoints = useRef<number | null | undefined>(undefined)
  useEffect(() => {
    const pts = existingPrediction?.pointsAwarded
    if (pts != null && pts !== prevPoints.current) {
      pointsScale.value = withSequence(withTiming(1.4, { duration: 200 }), withTiming(1, { duration: 200 }))
      prevPoints.current = pts
    }
  }, [existingPrediction?.pointsAwarded, pointsScale])

  const stageLabel =
    match.stage === 'group'
      ? `GROUP ${match.group} · MD${match.matchday}`
      : match.stage.replace(/-/g, ' ').toUpperCase()

  const kickoffLabel = new Date(match.kickoffAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const homeCorrect = isFinished && hasActualScore && existingPrediction != null && existingPrediction.homeScore === match.homeScore
  const homeWrong   = isFinished && hasActualScore && existingPrediction != null && existingPrediction.homeScore !== match.homeScore
  const awayCorrect = isFinished && hasActualScore && existingPrediction != null && existingPrediction.awayScore === match.awayScore
  const awayWrong   = isFinished && hasActualScore && existingPrediction != null && existingPrediction.awayScore !== match.awayScore

  const pts = existingPrediction?.pointsAwarded
  const hasPts = isFinished && pts != null

  return (
    <YStack
      overflow="hidden"
      rounded={16 as any}
      style={{
        backgroundColor: C.card,
        borderLeftWidth: 3,
        borderLeftColor: hasPts
          ? pts === 3 ? C.lime : pts === 1 ? '#4f91c5' : C.muted
          : existingPrediction && !isLocked
          ? C.lime
          : 'transparent',
      }}
    >
      {/* Stage + kickoff header */}
      <XStack
        px="$3"
        pt="$2.5"
        pb="$1.5"
        items="center"
        justify="space-between"
        style={{ borderBottomWidth: 1, borderBottomColor: C.divider }}
      >
        <SizableText
          style={{
            fontFamily: 'var(--fwc-font-condensed, system-ui)',
            fontWeight: '700',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            color: C.muted,
          }}
        >
          {stageLabel}
        </SizableText>
        <SizableText
          style={{
            fontFamily: 'var(--fwc-font-condensed, system-ui)',
            fontWeight: '600',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            color: C.muted,
          }}
        >
          {kickoffLabel}
        </SizableText>
      </XStack>

      {/* Home team row */}
      <XStack px="$3" py="$2.5" items="center" gap="$2.5">
        <FlagChip flag={match.homeFlag} size="sm" />
        <SizableText
          flex={1}
          style={{
            fontFamily: 'var(--fwc-font-display, system-ui)',
            fontWeight: '800',
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            color: C.paper,
            lineHeight: 1,
          }}
          numberOfLines={1}
        >
          {match.homeTeam}
        </SizableText>
        {isLocked ? (
          <ScoreBox value={existingPrediction?.homeScore} correct={homeCorrect} wrong={homeWrong} />
        ) : (
          <ScoreInput
            value={homeScore}
            onChange={setHomeScore}
            style={{ backgroundColor: C.paper, borderColor: C.lime, borderWidth: 2, color: C.ink }}
          />
        )}
      </XStack>

      {/* Divider */}
      <YStack style={{ height: 1, backgroundColor: C.divider, marginHorizontal: 12 }} />

      {/* Away team row */}
      <XStack px="$3" py="$2.5" items="center" gap="$2.5">
        <FlagChip flag={match.awayFlag} size="sm" />
        <SizableText
          flex={1}
          style={{
            fontFamily: 'var(--fwc-font-display, system-ui)',
            fontWeight: '800',
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: 0.3,
            color: C.paper,
            lineHeight: 1,
          }}
          numberOfLines={1}
        >
          {match.awayTeam}
        </SizableText>
        {isLocked ? (
          <ScoreBox value={existingPrediction?.awayScore} correct={awayCorrect} wrong={awayWrong} />
        ) : (
          <ScoreInput
            value={awayScore}
            onChange={setAwayScore}
            style={{ backgroundColor: C.paper, borderColor: C.lime, borderWidth: 2, color: C.ink }}
          />
        )}
      </XStack>

      {/* Footer: final score / points badge / submit button */}
      <XStack
        px="$3"
        pb="$3"
        pt="$1"
        items="center"
        justify="space-between"
        gap="$2"
      >
        {/* Final result */}
        {isFinished && hasActualScore ? (
          <XStack items="center" gap="$1.5" rounded={999 as any} px="$2" py="$0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <SizableText
              style={{
                fontFamily: 'var(--fwc-font-condensed, system-ui)',
                fontWeight: '700',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: C.muted,
              }}
            >
              FINAL
            </SizableText>
            <SizableText
              style={{
                fontFamily: 'var(--fwc-font-display, system-ui)',
                fontWeight: '800',
                fontSize: 15,
                color: C.paper,
              }}
            >
              {match.homeScore} – {match.awayScore}
            </SizableText>
          </XStack>
        ) : (
          <SizableText style={{ color: C.muted, fontSize: 11 }}>
            {match.venue.split(',')[0]}
          </SizableText>
        )}

        {/* Points badge or submit button */}
        {hasPts ? (
          <Animated.View style={animatedStyle}>
            <XStack
              rounded={999 as any}
              px="$2.5"
              py="$1"
              style={{
                backgroundColor:
                  pts === 3 ? 'rgba(173,235,3,0.15)' :
                  pts === 1 ? 'rgba(79,145,197,0.15)' :
                  'rgba(112,114,135,0.15)',
                borderWidth: 1,
                borderColor:
                  pts === 3 ? C.lime :
                  pts === 1 ? '#4f91c5' :
                  C.muted,
              }}
            >
              <SizableText
                style={{
                  fontFamily: 'var(--fwc-font-condensed, system-ui)',
                  fontWeight: '700',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color:
                    pts === 3 ? C.lime :
                    pts === 1 ? '#4f91c5' :
                    C.muted,
                }}
              >
                {pts === 3 ? '+ 3 PTS EXACT' : pts === 1 ? '+ 1 PT' : '+ 0 PTS'}
              </SizableText>
            </XStack>
          </Animated.View>
        ) : !isLocked ? (
          <XStack
            rounded={999 as any}
            px="$3"
            py="$1.5"
            cursor="pointer"
            onPress={() => onConfirm(match.id, homeScore, awayScore, existingPrediction?.id)}
            style={{ backgroundColor: C.lime }}
            hoverStyle={{ backgroundColor: C.limeDark } as any}
            pressStyle={{ opacity: 0.85 } as any}
          >
            <SizableText
              style={{
                fontFamily: 'var(--fwc-font-display, system-ui)',
                fontWeight: '800',
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: C.ink,
              }}
            >
              {existingPrediction ? 'UPDATE' : 'PREDICT'}
            </SizableText>
          </XStack>
        ) : existingPrediction && !isFinished ? (
          <XStack
            rounded={999 as any}
            px="$2.5"
            py="$0.5"
            style={{ backgroundColor: 'rgba(173,235,3,0.1)', borderWidth: 1, borderColor: C.lime }}
          >
            <SizableText
              style={{
                fontFamily: 'var(--fwc-font-condensed, system-ui)',
                fontWeight: '700',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                color: C.lime,
              }}
            >
              LOCKED IN
            </SizableText>
          </XStack>
        ) : null}
      </XStack>
    </YStack>
  )
}
