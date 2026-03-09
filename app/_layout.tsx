import { Stack } from 'expo-router';
import { BudgetProvider } from '../src/BudgetContext';

export default function RootLayout() {
  return (
    <BudgetProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </BudgetProvider>
  );
}
