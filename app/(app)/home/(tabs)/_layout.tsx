import { Link, Slot } from 'one'
import { Spacer, XStack } from 'tamagui'

import { MainHeader } from '~/features/app/MainHeader'

export function TabsLayout() {
  return (
    <>
      <MainHeader />
      <XStack gap="$4" px="$4" pt="$2" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Link href="/home/predict">
          Predict
        </Link>
        <Link href="/home/leaderboard">
          Leaderboard
        </Link>
        <Link href="/home/feed">
          Feed
        </Link>
      </XStack>
      <Spacer height={8} />
      <Slot />
    </>
  )
}
