import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { OfflineBanner } from '@/components/offline-banner';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { View } from 'react-native';

function AppProviders({ children }: { children: React.ReactNode }) {
  usePushNotifications();
  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      {children}
    </View>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="add-income" />
        <Stack.Screen name="add-expense" />
        <Stack.Screen name="search" />
        <Stack.Screen name="(tabs)" />
        </Stack>
      </AppProviders>
    </QueryClientProvider>
  );
}
