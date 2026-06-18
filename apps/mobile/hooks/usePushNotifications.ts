import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { getSupabase, getCurrentProfile } from '@bizmanager/supabase-client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

async function persistPushToken(token: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return;
    const supabase = getSupabase();
    await supabase.from('device_push_tokens').upsert(
      {
        profile_id: profile.id,
        company_id: profile.company_id,
        expo_push_token: token,
        platform: Platform.OS,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,expo_push_token' }
    );
  } catch {
    /* optional until migration applied */
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId || projectId === 'REPLACE_WITH_EAS_PROJECT_ID') return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'BizManager',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    await persistPushToken(token.data);
    return token.data;
  } catch {
    return null;
  }
}

export function usePushNotifications() {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;
    registerForPushNotifications();
  }, []);
}
