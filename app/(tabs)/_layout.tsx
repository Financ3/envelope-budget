import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { colors } from '../../src/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 82 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Envelopes',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
