import { Link, Slot } from 'one'
import { Spacer, XStack } from 'tamagui'

import { MainHeader } from '~/features/app/MainHeader'

export function TabsLayout() {
  return (
    <>
      <MainHeader />
      <XStack gap="$4" paddingHorizontal="$4" paddingTop="$2" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Link href="/home/predict" style={{ textDecoration: 'none' }}>
          Predict
        </Link>
        <Link href="/home/leaderboard" style={{ textDecoration: 'none' }}>
          Leaderboard
        </Link>
        <Link href="/home/feed" style={{ textDecoration: 'none' }}>
          Feed
        </Link>
      </XStack>
      <Spacer height={8} />
      <Slot />
    </>
  )
}
