import { useEffect, useRef, useState } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Button, SizableText, XStack, YStack } from 'tamagui'

import type { Match } from '~/data/models/match'
import { ScoreInput } from './ScoreInput'

interface MatchCardProps {
  match: Match
  existingPrediction: { id: string; homeScore: number; awayScore: number; pointsAwarded: number | null | undefined } | null
  onSubmit: (matchId: string, homeScore: number, awayScore: number) => void
  onConfirm: (matchId: string, homeScore: number, awayScore: number, existingId?: string) => void
}

export function MatchCard({ match, existingPrediction, onSubmit, onConfirm }: MatchCardProps) {
  const isLocked = match.kickoffAt <= Date.now() || match.status !== 'scheduled'
  const isFinished = match.status === 'finished'

  const [homeScore, setHomeScore] = useState(existingPrediction?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(existingPrediction?.awayScore ?? 0)

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
      ? `Group ${match.group} · Matchday ${match.matchday}`
      : match.stage.toUpperCase()

  const kickoffLabel = new Date(match.kickoffAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <YStack
      backgroundColor="$color2"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      padding="$3"
      gap="$2"
    >
      <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={1}>
        {stageLabel}
      </SizableText>

      <XStack items="center" gap="$3">
        {/* Home team */}
        <XStack flex={1} justify="flex-end" items="center" gap="$2">
          <SizableText size="$3" fontWeight="600" color="$color12" textAlign="right">
            {match.homeTeam}
          </SizableText>
          <SizableText size="$5">{match.homeFlag}</SizableText>
        </XStack>

        {/* Score inputs */}
        <XStack items="center" gap="$2">
          {isLocked ? (
            <>
              <XStack
                width={36}
                height={36}
                backgroundColor="$color3"
                borderRadius="$2"
                items="center"
                justify="center"
              >
                <SizableText size="$5" fontWeight="700" color="$color9">
                  {existingPrediction?.homeScore ?? '–'}
                </SizableText>
              </XStack>
              <SizableText color="$color8" size="$4">–</SizableText>
              <XStack
                width={36}
                height={36}
                backgroundColor="$color3"
                borderRadius="$2"
                items="center"
                justify="center"
              >
                <SizableText size="$5" fontWeight="700" color="$color9">
                  {existingPrediction?.awayScore ?? '–'}
                </SizableText>
              </XStack>
            </>
          ) : (
            <>
              <ScoreInput value={homeScore} onChange={setHomeScore} />
              <SizableText color="$color8" size="$4">–</SizableText>
              <ScoreInput value={awayScore} onChange={setAwayScore} />
            </>
          )}
        </XStack>

        {/* Away team */}
        <XStack flex={1} justify="flex-start" items="center" gap="$2">
          <SizableText size="$5">{match.awayFlag}</SizableText>
          <SizableText size="$3" fontWeight="600" color="$color12">
            {match.awayTeam}
          </SizableText>
        </XStack>
      </XStack>

      <SizableText size="$1" color="$color8" textAlign="center">
        {kickoffLabel} · {match.venue.split(',')[0]}
      </SizableText>

      {/* Action area */}
      {isFinished && existingPrediction?.pointsAwarded != null ? (
        <XStack justify="center" gap="$3" items="center">
          <Animated.View style={animatedStyle}>
            <XStack
              backgroundColor={existingPrediction.pointsAwarded === 3 ? '$green3' : existingPrediction.pointsAwarded === 1 ? '$blue3' : '$color3'}
              borderColor={existingPrediction.pointsAwarded === 3 ? '$green7' : existingPrediction.pointsAwarded === 1 ? '$blue7' : '$color6'}
              borderWidth={1}
              borderRadius="$10"
              paddingHorizontal="$3"
              paddingVertical="$1"
            >
              <SizableText
                size="$2"
                color={existingPrediction.pointsAwarded === 3 ? '$green10' : existingPrediction.pointsAwarded === 1 ? '$blue10' : '$color9'}
                fontWeight="600"
              >
                {existingPrediction.pointsAwarded === 3
                  ? '✓ Exact score · +3 pts'
                  : existingPrediction.pointsAwarded === 1
                  ? '✓ Correct result · +1 pt'
                  : '✗ Wrong · +0 pts'}
              </SizableText>
            </XStack>
          </Animated.View>
          {match.avgHomeScore != null && (
            <SizableText size="$1" color="$color8">
              Community avg: {match.avgHomeScore}–{match.avgAwayScore}
            </SizableText>
          )}
        </XStack>
      ) : isLocked ? (
        match.avgHomeScore != null ? (
          <SizableText size="$1" color="$color8" textAlign="center">
            Community avg: {match.avgHomeScore}–{match.avgAwayScore}
          </SizableText>
        ) : null
      ) : (
        <Button
          size="$2"
          theme="blue"
          borderRadius="$10"
          onPress={() => onConfirm(match.id, homeScore, awayScore, existingPrediction?.id)}
        >
          {existingPrediction ? 'Update Prediction' : 'Submit Prediction'}
        </Button>
      )}
    </YStack>
  )
}
