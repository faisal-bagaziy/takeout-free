import { useMemo, useState } from 'react'
import { FlatList } from 'react-native'
import { Button, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { PageContainer } from '~/interface/layout/PageContainer'
import { H1 } from '~/interface/text/Headings'
import { MatchCard } from './MatchCard'
import { PredictionSheet } from './PredictionSheet'
import { useMatches, useSubmitPrediction, useUserPredictions } from './usePredictions'

const MATCHDAYS = [1, 2, 3]

export function PredictionsScreen() {
  const auth = useAuth()
  const [selectedMatchday, setSelectedMatchday] = useState<number>(1)
  const [sheetState, setSheetState] = useState<{
    open: boolean
    matchId: string
    homeTeam: string
    awayTeam: string
    homeFlag: string
    awayFlag: string
    homeScore: number
    awayScore: number
    existingId?: string
  } | null>(null)

  const { matches, isLoading } = useMatches(selectedMatchday)
  const { predictionsMap } = useUserPredictions()
  const { submitPrediction, updatePrediction } = useSubmitPrediction()

  const handleConfirm = (
    matchId: string,
    homeScore: number,
    awayScore: number,
    existingId?: string,
  ) => {
    const m = matches.find((x) => x.id === matchId)
    if (!m) return
    setSheetState({
      open: true,
      matchId,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag,
      homeScore,
      awayScore,
      existingId,
    })
  }

  const handleSheetConfirm = () => {
    if (!sheetState) return
    const { matchId, homeScore, awayScore, existingId } = sheetState
    if (existingId) {
      updatePrediction(existingId, homeScore, awayScore)
    } else {
      submitPrediction(matchId, homeScore, awayScore)
    }
  }

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => a.kickoffAt - b.kickoffAt),
    [matches],
  )

  return (
    <YStack flex={1} bg="$background">
      <PageContainer>
        <H1 py="$3" size="$6">Predict</H1>

        {/* Matchday tabs */}
        <XStack gap="$2" mb="$4" flexWrap="wrap">
          {MATCHDAYS.map((day) => (
            <Button
              key={day}
              size="$3"
              theme={selectedMatchday === day ? 'blue' : undefined}
              chromeless={selectedMatchday !== day}
              onPress={() => setSelectedMatchday(day)}
            >
              Matchday {day}
            </Button>
          ))}
          <Button
            size="$3"
            theme={selectedMatchday === 0 ? 'blue' : undefined}
            chromeless={selectedMatchday !== 0}
            onPress={() => setSelectedMatchday(0)}
          >
            Knockouts
          </Button>
        </XStack>
      </PageContainer>

      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" />
        </YStack>
      ) : (
        <FlatList
          data={sortedMatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              existingPrediction={predictionsMap.get(item.id) ?? null}
              onSubmit={submitPrediction}
              onConfirm={handleConfirm}
            />
          )}
          ListEmptyComponent={
            <YStack items="center" justify="center" py="$8">
              <SizableText color="$color9">No matches for this matchday</SizableText>
            </YStack>
          }
        />
      )}

      {sheetState && (
        <PredictionSheet
          open={sheetState.open}
          onOpenChange={(open) => setSheetState((s) => s && { ...s, open })}
          homeTeam={sheetState.homeTeam}
          awayTeam={sheetState.awayTeam}
          homeFlag={sheetState.homeFlag}
          awayFlag={sheetState.awayFlag}
          homeScore={sheetState.homeScore}
          awayScore={sheetState.awayScore}
          onConfirm={handleSheetConfirm}
        />
      )}
    </YStack>
  )
}
