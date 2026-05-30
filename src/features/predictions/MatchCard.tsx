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

export function MatchCard({ match, existingPrediction, onSubmit, onConfirm }: MatchCardProps) {
  const isLocked = match.kickoffAt - 3_600_000 <= Date.now() || match.status !== 'scheduled'
  const isFinished = match.status === 'finished'
  const hasActualScore = match.homeScore != null && match.awayScore != null

  const [homeScore, setHomeScore] = useState(existingPrediction?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(existingPrediction?.awayScore ?? 0)

  // Sync inputs when prediction loads from Zero after mount (e.g. navigating back)
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
      bg="$color2"
      rounded="$4"
      borderWidth={1}
      borderColor="$borderColor"
      p="$3"
      gap="$2"
    >
      {/* Stage + confirmed badge row */}
      <XStack items="center" justify="space-between">
        <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={1}>
          {stageLabel}
        </SizableText>
        {existingPrediction && !isLocked && (
          <XStack
            bg="$green3"
            borderColor="$green7"
            borderWidth={1}
            rounded="$10"
            px="$2"
            py="$0.5"
            items="center"
            gap="$1"
          >
            <SizableText size="$1" color="$green10" fontWeight="600">
              ✓ Confirmed
            </SizableText>
          </XStack>
        )}
      </XStack>

      {/* Teams + scores */}
      <XStack items="center" gap="$3">
        {/* Home team */}
        <XStack flex={1} justify="flex-end" items="center" gap="$2">
          <SizableText size="$3" fontWeight="600" color="$color12" style={{ textAlign: 'right' }}>
            {match.homeTeam}
          </SizableText>
          <SizableText size="$5">{match.homeFlag}</SizableText>
        </XStack>

        {/* Score inputs or static prediction */}
        <XStack items="center" gap="$2">
          {isLocked ? (
            <>
              {(() => {
                const homeCorrect = isFinished && hasActualScore && existingPrediction != null && existingPrediction.homeScore === match.homeScore
                const homeWrong = isFinished && hasActualScore && existingPrediction != null && existingPrediction.homeScore !== match.homeScore
                const awayCorrect = isFinished && hasActualScore && existingPrediction != null && existingPrediction.awayScore === match.awayScore
                const awayWrong = isFinished && hasActualScore && existingPrediction != null && existingPrediction.awayScore !== match.awayScore
                return (
                  <>
                    <XStack
                      width={36}
                      height={36}
                      bg={homeCorrect ? '$green3' : homeWrong ? '$red3' : '$color3'}
                      borderWidth={homeCorrect || homeWrong ? 1 : 0}
                      borderColor={homeCorrect ? '$green7' : homeWrong ? '$red7' : 'transparent'}
                      rounded="$2"
                      items="center"
                      justify="center"
                    >
                      <SizableText size="$5" fontWeight="700" color={homeCorrect ? '$green10' : homeWrong ? '$red10' : '$color9'}>
                        {existingPrediction?.homeScore ?? '–'}
                      </SizableText>
                    </XStack>
                    <SizableText color="$color8" size="$4">–</SizableText>
                    <XStack
                      width={36}
                      height={36}
                      bg={awayCorrect ? '$green3' : awayWrong ? '$red3' : '$color3'}
                      borderWidth={awayCorrect || awayWrong ? 1 : 0}
                      borderColor={awayCorrect ? '$green7' : awayWrong ? '$red7' : 'transparent'}
                      rounded="$2"
                      items="center"
                      justify="center"
                    >
                      <SizableText size="$5" fontWeight="700" color={awayCorrect ? '$green10' : awayWrong ? '$red10' : '$color9'}>
                        {existingPrediction?.awayScore ?? '–'}
                      </SizableText>
                    </XStack>
                  </>
                )
              })()}
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

      {/* Final score row (shown when match is finished and actual score exists) */}
      {isFinished && hasActualScore && (
        <XStack
          bg="$color3"
          rounded="$3"
          px="$3"
          py="$1.5"
          items="center"
          justify="center"
          gap="$2"
        >
          <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={1}>
            Final
          </SizableText>
          <SizableText size="$4" fontWeight="800" color="$color12">
            {match.homeScore} – {match.awayScore}
          </SizableText>
        </XStack>
      )}

      <SizableText size="$1" color="$color8" style={{ textAlign: 'center' }}>
        {kickoffLabel} · {match.venue.split(',')[0]}
      </SizableText>

      {/* Action area */}
      {isFinished && existingPrediction?.pointsAwarded != null ? (
        <XStack justify="center" gap="$3" items="center">
          <Animated.View style={animatedStyle}>
            <XStack
              bg={existingPrediction.pointsAwarded === 3 ? '$green3' : existingPrediction.pointsAwarded === 1 ? '$blue3' : '$color3'}
              borderColor={existingPrediction.pointsAwarded === 3 ? '$green7' : existingPrediction.pointsAwarded === 1 ? '$blue7' : '$color6'}
              borderWidth={1}
              rounded="$10"
              px="$3"
              py="$1"
            >
              <SizableText
                size="$2"
                color={existingPrediction.pointsAwarded === 3 ? '$green10' : existingPrediction.pointsAwarded === 1 ? '$blue10' : '$color9'}
                fontWeight="600"
              >
                {existingPrediction.pointsAwarded === 3
                  ? '✓ Exact score · +3 pts'
                  : existingPrediction.pointsAwarded === 1
                  ? '✓ One score correct · +1 pt'
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
          <SizableText size="$1" color="$color8" style={{ textAlign: 'center' }}>
            Community avg: {match.avgHomeScore}–{match.avgAwayScore}
          </SizableText>
        ) : null
      ) : (
        <Button
          size="$2"
          theme="blue"
          rounded="$10"
          onPress={() => onConfirm(match.id, homeScore, awayScore, existingPrediction?.id)}
        >
          {existingPrediction ? 'Update Prediction' : 'Submit Prediction'}
        </Button>
      )}
    </YStack>
  )
}
