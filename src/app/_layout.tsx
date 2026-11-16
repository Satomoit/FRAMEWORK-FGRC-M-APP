
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor="#F4F7FC"
      />

      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: '#F4F7FC',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
      </Stack>
    </>
  );
}
