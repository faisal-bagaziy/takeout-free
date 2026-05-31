import { isWeb } from 'tamagui'
import { SizableText, XStack } from 'tamagui'

// Special-case flags that don't follow the standard 2-letter emoji pattern
const EMOJI_OVERRIDES: Record<string, string> = {
  '🏴󠁧󠁢󠁥󠁮󠁧󠁿': 'gb-eng',
  '🏴󠁧󠁢󠁳󠁣󠁴󠁿': 'gb-sct',
  '🏴󠁧󠁢󠁷󠁬󠁳󠁿': 'gb-wls',
}

function emojiToFlagcdnCode(emoji: string): string | null {
  if (EMOJI_OVERRIDES[emoji]) return EMOJI_OVERRIDES[emoji]

  const chars = [...emoji]
  if (chars.length < 2) return null

  const cp0 = chars[0]?.codePointAt(0) ?? 0
  const cp1 = chars[1]?.codePointAt(0) ?? 0

  // Regional Indicator letters: 🇦 = 0x1F1E6
  if (cp0 >= 0x1f1e6 && cp0 <= 0x1f1ff && cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff) {
    const l1 = String.fromCharCode(cp0 - 0x1f1e6 + 65).toLowerCase()
    const l2 = String.fromCharCode(cp1 - 0x1f1e6 + 65).toLowerCase()
    return `${l1}${l2}`
  }

  return null
}

interface FlagChipProps {
  flag: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { width: 40, height: 27, radius: 6 },
  md: { width: 56, height: 38, radius: 9 },
  lg: { width: 72, height: 48, radius: 12 },
}

export function FlagChip({ flag, size = 'md' }: FlagChipProps) {
  const { width, height, radius } = SIZES[size]
  const code = emojiToFlagcdnCode(flag)

  if (isWeb && code) {
    return (
      <img
        src={`https://flagcdn.com/w160/${code}.png`}
        width={width}
        height={height}
        style={{
          borderRadius: radius,
          border: '2px solid rgba(247,247,248,0.9)',
          objectFit: 'cover',
          display: 'block',
          flexShrink: 0,
        }}
        alt=""
      />
    )
  }

  // Native fallback: emoji in a styled box
  return (
    <XStack
      width={width}
      height={height}
      rounded={radius as any}
      borderWidth={2}
      borderColor="rgba(247,247,248,0.9)"
      bg="$color4"
      items="center"
      justify="center"
      style={{ flexShrink: 0 }}
    >
      <SizableText style={{ fontSize: size === 'sm' ? 16 : size === 'md' ? 22 : 28 }}>
        {flag}
      </SizableText>
    </XStack>
  )
}
