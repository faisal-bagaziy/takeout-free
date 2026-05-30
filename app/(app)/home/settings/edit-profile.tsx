import { useRouter } from 'one'
import { useState } from 'react'
import { ScrollView, SizableText, XStack, YStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { authClient } from '~/features/auth/client/authClient'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { PageLayout } from '~/interface/pages/PageLayout'
import { SepHeading } from '~/interface/text/Headings'

const WC2026_COUNTRIES = [
  '🇺🇸 USA', '🇲🇽 Mexico', '🇨🇦 Canada',
  '🇧🇷 Brazil', '🇦🇷 Argentina', '🇺🇾 Uruguay', '🇨🇴 Colombia', '🇨🇱 Chile', '🇵🇦 Panama',
  '🇩🇪 Germany', '🇫🇷 France', '🇪🇸 Spain', '🇬🇧 England', '🇵🇹 Portugal', '🇳🇱 Netherlands',
  '🇧🇪 Belgium', '🇮🇹 Italy', '🇨🇭 Switzerland', '🇦🇹 Austria', '🇸🇪 Sweden', '🇩🇰 Denmark',
  '🇸🇦 Saudi Arabia', '🇯🇵 Japan', '🇰🇷 South Korea', '🇮🇷 Iran', '🇦🇺 Australia',
  '🇳🇬 Nigeria', '🇸🇳 Senegal', '🇲🇦 Morocco', '🇪🇬 Egypt', '🇨🇲 Cameroon', '🇬🇭 Ghana',
]

export default function EditProfilePage() {
  const router = useRouter()
  const auth = useAuth()
  const user = auth?.user

  const [name, setName] = useState(user?.name ?? '')
  const [country, setCountry] = useState(user?.name ? '' : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      // Update display name via Better Auth
      await authClient.updateUser({ name: name.trim() })

      // Update country via API
      if (country) {
        const res = await fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ country }),
        })
        if (!res.ok) throw new Error('Failed to update country')
      }

      setSaved(true)
      setTimeout(() => router.back(), 800)
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout>
      <ScrollView flex={1} contentInsetAdjustmentBehavior="automatic">
        <YStack flex={1} px="$4" pb="$10" gap="$2">
          <SepHeading>Display Name</SepHeading>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
          />

          <SepHeading>Your Nation</SepHeading>
          <SizableText size="$2" color="$color9" mb="$2">
            Pick your country — it shows next to your name across the app
          </SizableText>

          <YStack gap="$1.5">
            {WC2026_COUNTRIES.map((c) => (
              <XStack
                key={c}
                bg={country === c ? '$blue3' : '$color2'}
                borderWidth={1}
                borderColor={country === c ? '$blue7' : '$borderColor'}
                rounded="$3"
                px="$3"
                py="$2.5"
                items="center"
                cursor="pointer"
                hoverStyle={{ bg: '$color3' }}
                onPress={() => setCountry(country === c ? '' : c)}
              >
                <SizableText size="$3" flex={1}>{c}</SizableText>
                {country === c && (
                  <SizableText size="$3" color="$blue10" fontWeight="700">✓</SizableText>
                )}
              </XStack>
            ))}
          </YStack>

          {error && (
            <SizableText size="$2" color="$red10" mt="$2">{error}</SizableText>
          )}

          <Button
            theme={saved ? 'green' : 'blue'}
            size="$4"
            mt="$4"
            disabled={saving || !name.trim()}
            onPress={handleSave}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
          </Button>
        </YStack>
      </ScrollView>
    </PageLayout>
  )
}
