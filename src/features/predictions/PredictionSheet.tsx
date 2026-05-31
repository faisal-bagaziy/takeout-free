import { Button, Sheet, SizableText, XStack, YStack } from 'tamagui'

interface PredictionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  homeScore: number
  awayScore: number
  onConfirm: () => void
}

export function PredictionSheet({
  open,
  onOpenChange,
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  homeScore,
  awayScore,
  onConfirm,
}: PredictionSheetProps) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[35]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame p="$5" gap="$4" bg="$color1">
        <SizableText size="$6" fontWeight="700" style={{ textAlign: 'center' }}>
          Confirm Prediction
        </SizableText>

        <XStack items="center" justify="center" gap="$4">
          <XStack flex={1} justify="flex-end" items="center" gap="$2">
            <SizableText size="$4" fontWeight="600">{homeTeam}</SizableText>
            <SizableText size="$6">{homeFlag}</SizableText>
          </XStack>

          <XStack items="center" gap="$2">
            <SizableText size="$8" fontWeight="800" color="$blue10">{homeScore}</SizableText>
            <SizableText size="$6" color="$color8">–</SizableText>
            <SizableText size="$8" fontWeight="800" color="$color12">{awayScore}</SizableText>
          </XStack>

          <XStack flex={1} justify="flex-start" items="center" gap="$2">
            <SizableText size="$6">{awayFlag}</SizableText>
            <SizableText size="$4" fontWeight="600">{awayTeam}</SizableText>
          </XStack>
        </XStack>

        <XStack gap="$3">
          <Button flex={1} onPress={() => onOpenChange(false)} chromeless>
            Cancel
          </Button>
          <Button
            flex={2}
            theme="blue"
            onPress={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Lock it in
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  )
}
