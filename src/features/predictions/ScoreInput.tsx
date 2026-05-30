import { Input, type InputProps } from 'tamagui'

interface ScoreInputProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  value: number | null
  onChange: (value: number) => void
  disabled?: boolean
}

export function ScoreInput({ value, onChange, disabled, ...props }: ScoreInputProps) {
  return (
    <Input
      width={36}
      height={36}
      textAlign="center"
      fontSize="$5"
      fontWeight="700"
      padding={0}
      borderWidth={1.5}
      borderColor={disabled ? '$borderColor' : '$blue8'}
      backgroundColor={disabled ? '$color2' : '$color1'}
      color={disabled ? '$color9' : '$color12'}
      keyboardType="number-pad"
      maxLength={2}
      selectTextOnFocus
      editable={!disabled}
      value={value != null ? String(value) : ''}
      onChangeText={(text) => {
        const num = parseInt(text, 10)
        if (!isNaN(num) && num >= 0) {
          onChange(Math.min(num, 99))
        } else if (text === '') {
          onChange(0)
        }
      }}
      {...props}
    />
  )
}
