import { FlatList } from 'react-native'
import { isWeb, SizableText, Spinner, YStack } from 'tamagui'

import { H1 } from '~/interface/text/Headings'
import { MatchCard } from './MatchCard'
import { PredictionSheet } from './PredictionSheet'
import { useMatches, useSubmitPrediction, useUserPredictions } from './usePredictions'
import { useState } from 'react'

export function PredictionsScreen() {
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

  const { matches, isLoading } = useMatches()
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
    setSheetState(null)
  }

  return (
    <YStack bg="$background" pt={isWeb ? 70 : 0} style={isWeb ? { height: '100vh', display: 'flex', flexDirection: 'column' } : { flex: 1 }}>
      <YStack px="$4" maxW={860} width="100%" mx="auto">
        <H1 py="$3" size="$6">Predict</H1>
      </YStack>

      {isLoading ? (
        <YStack flex={1} items="center" justify="center">
          <Spinner size="large" />
        </YStack>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
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
              <SizableText color="$color9">No matches available</SizableText>
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
