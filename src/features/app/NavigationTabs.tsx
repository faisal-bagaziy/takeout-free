import { Link, usePathname } from 'one'
import { SizableText, XStack } from 'tamagui'

import { Pressable } from '~/interface/buttons/Pressable'
import { HouseIcon } from '~/interface/icons/phosphor/HouseIcon'
import { UserCircleIcon } from '~/interface/icons/phosphor/UserCircleIcon'

import type { Href } from 'one'

type TabRoute = {
  name: string
  href: Href
  label?: string
  icon?: any
  match?: string
}

const routes: TabRoute[] = [
  { name: 'feed', href: '/home/feed', label: 'Feed', icon: HouseIcon, match: '/home/feed' },
  { name: 'predict', href: '/home/predict', label: 'Predict', match: '/home/predict' },
  { name: 'leaderboard', href: '/home/leaderboard', label: 'Leaderboard', match: '/home/leaderboard' },
  { name: 'profile', href: '/home/settings', icon: UserCircleIcon, match: '/home/settings' },
]

export function NavigationTabs() {
  const pathname = usePathname()

  return (
    <XStack gap="$1">
      {routes.map((route) => {
        const Icon = route.icon
        const isActive = pathname.startsWith(route.match ?? (route.href as string))
        return (
          <Link key={route.name} href={route.href}>
            <Pressable
              px="$3"
              py="$2"
              rounded="$4"
              bg={isActive ? '$color3' : 'transparent'}
              hoverStyle={{ bg: '$color2' }}
              flexDirection="row"
              gap="$1.5"
              items="center"
            >
              {Icon && <Icon size={18} color={isActive ? '$color12' : '$color10'} />}
              {route.label && (
                <SizableText
                  size="$2"
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? '$color12' : '$color10'}
                >
                  {route.label}
                </SizableText>
              )}
            </Pressable>
          </Link>
        )
      })}
    </XStack>
  )
}
