import { useState } from 'react'
import { FlatList } from 'react-native'
import { isWeb, SizableText, Spinner, XStack, YStack } from 'tamagui'

import { useMatches } from '~/features/predictions/usePredictions'
import { H1 } from '~/interface/text/Headings'
import { Button } from '~/interface/buttons/Button'
import { ScoreInput } from '~/features/predictions/ScoreInput'
import type { Match } from '~/data/models/match'

function AdminMatchRow({ match }: { match: Match }) {
  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<'ok' | 'error' | null>(null)

  const isFinished = match.status === 'finished'

  const kickoffLabel = new Date(match.kickoffAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const stageLabel =
    match.stage === 'group'
      ? `Group ${match.group} · MD${match.matchday}`
      : match.stage.toUpperCase()

  const handleSave = async () => {
    setSaving(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/score-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matchId: match.id, homeScore, awayScore }),
      })
      setResult(res.ok ? 'ok' : 'error')
    } catch {
      setResult('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <YStack
      bg="$color2"
      rounded="$4"
      borderWidth={1}
      borderColor={isFinished ? '$green7' : '$borderColor'}
      p="$3"
      gap="$2"
    >
      <XStack items="center" justify="space-between">
        <SizableText size="$1" color="$color9" textTransform="uppercase" letterSpacing={1}>
          {stageLabel}
        </SizableText>
        <SizableText size="$1" color="$color8">
          {kickoffLabel}
        </SizableText>
        {isFinished && (
          <XStack bg="$green3" borderColor="$green7" borderWidth={1} rounded="$10" px="$2" py="$0.5">
            <SizableText size="$1" color="$green10" fontWeight="600">✓ Finished</SizableText>
          </XStack>
        )}
      </XStack>

      <XStack items="center" gap="$3">
        <XStack flex={1} justify="flex-end" items="center" gap="$2">
          <SizableText size="$3" fontWeight="600" color="$color12" style={{ textAlign: 'right' }}>
            {match.homeTeam}
          </SizableText>
          <SizableText size="$5">{match.homeFlag}</SizableText>
        </XStack>

        <XStack items="center" gap="$2">
          <ScoreInput value={homeScore} onChange={setHomeScore} />
          <SizableText color="$color8" size="$4">–</SizableText>
          <ScoreInput value={awayScore} onChange={setAwayScore} />
        </XStack>

        <XStack flex={1} justify="flex-start" items="center" gap="$2">
          <SizableText size="$5">{match.awayFlag}</SizableText>
          <SizableText size="$3" fontWeight="600" color="$color12">
            {match.awayTeam}
          </SizableText>
        </XStack>
      </XStack>

      <XStack items="center" justify="center" gap="$3">
        <Button
          size="$2"
          theme={result === 'ok' ? 'green' : result === 'error' ? 'red' : 'blue'}
          rounded="$10"
          disabled={saving}
          onPress={handleSave}
        >
          {saving ? 'Saving…' : result === 'ok' ? '✓ Saved' : result === 'error' ? '✗ Error' : isFinished ? 'Re-score' : 'Mark as Finished'}
        </Button>
      </XStack>
    </YStack>
  )
}

export function AdminScreen() {
  const { matches, isLoading } = useMatches()

  return (
    <YStack
      bg="$background"
      pt={isWeb ? 70 : 0}
      style={isWeb ? { height: '100vh', display: 'flex', flexDirection: 'column' } : { flex: 1 }}
    >
      <YStack px="$4" maxW={860} width="100%" mx="auto">
        <H1 py="$3" size="$6">Admin · Match Scores</H1>
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12, maxWidth: 860, alignSelf: 'center', width: '100%' }}
          renderItem={({ item }) => <AdminMatchRow match={item} />}
          ListEmptyComponent={
            <YStack items="center" justify="center" py="$8">
              <SizableText color="$color9">No matches found</SizableText>
            </YStack>
          }
        />
      )}
    </YStack>
  )
}
