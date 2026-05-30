import { Tabs } from 'one'

export function TabsLayout() {
  return (
    <Tabs
      initialRouteName="predict"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="predict" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  )
}
