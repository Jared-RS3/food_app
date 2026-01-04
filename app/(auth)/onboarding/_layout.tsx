import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="eating-style" />
      <Stack.Screen name="food-mood" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="location" />
      <Stack.Screen name="celebration" />
    </Stack>
  );
}
