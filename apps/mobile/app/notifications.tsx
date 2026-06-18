import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileProfileId } from '@/hooks/useMobileProfile';
import { useMobileStore } from '@/stores/app-store';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  queryKeys,
} from '@bizmanager/supabase-client';
import type { Notification } from '@bizmanager/types';
import { formatDateTime, filterNotificationsByPrefs } from '@bizmanager/utils';
import { spacing, radius } from '@bizmanager/design-tokens';

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  approval: 'checkmark-circle-outline',
  expense: 'receipt-outline',
  payroll: 'cash-outline',
  salary: 'cash-outline',
  leave: 'calendar-outline',
};

function getMobileRoute(relatedType: string | null): string {
  if (relatedType === 'payment_request') return '/(tabs)/approvals';
  if (relatedType === 'leave_request') return '/(tabs)/staff';
  if (relatedType === 'payroll_run') return '/(tabs)/staff';
  return '/(tabs)/home';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const queryClient = useQueryClient();
  const notificationPrefs = useMobileStore((s) => s.notificationPrefs);
  const { data: profileId, isLoading: profileLoading } = useMobileProfileId();

  const { data: notifications, isLoading } = useQuery({
    queryKey: queryKeys.notifications(profileId ?? ''),
    queryFn: () => getNotifications(profileId!),
    enabled: !!profileId,
    refetchInterval: 60_000,
  });

  const filtered = filterNotificationsByPrefs(notifications ?? [], notificationPrefs);
  const unread = filtered.filter((n) => !n.is_read).length;

  const invalidate = () => {
    if (profileId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(profileId) });
    }
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      if (!profileId) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications(profileId) });
      const previous = queryClient.getQueryData<Notification[]>(queryKeys.notifications(profileId));
      queryClient.setQueryData<Notification[]>(queryKeys.notifications(profileId), (old) =>
        old?.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (profileId && context?.previous) {
        queryClient.setQueryData(queryKeys.notifications(profileId), context.previous);
      }
    },
    onSettled: invalidate,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      if (!profileId) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications(profileId) });
      const previous = queryClient.getQueryData<Notification[]>(queryKeys.notifications(profileId));
      queryClient.setQueryData<Notification[]>(queryKeys.notifications(profileId), (old) =>
        old?.map((n) => ({ ...n, is_read: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (profileId && context?.previous) {
        queryClient.setQueryData(queryKeys.notifications(profileId), context.previous);
      }
    },
    onSettled: invalidate,
  });

  const handlePress = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    router.back();
    router.push(getMobileRoute(notification.related_type) as never);
  };

  const loading = profileLoading || isLoading;

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t('notifications')}</Text>
        {unread > 0 ? (
          <TouchableOpacity
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            style={styles.markAllBtn}
          >
            <Text style={[styles.markAllText, { color: colors.primary.DEFAULT }]}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary.DEFAULT} />
      ) : !filtered.length ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={40} color={colors.text.muted} />
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>{t('noNotifications')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const icon = typeIcons[item.type.toLowerCase()] ?? 'notifications-outline';
            return (
              <TouchableOpacity
                style={[
                  styles.row,
                  {
                    backgroundColor: item.is_read ? colors.surface : colors.primary.light,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handlePress(item)}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
                  <Ionicons name={icon} size={20} color={colors.primary.DEFAULT} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.body, { color: colors.text.secondary }]} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={[styles.time, { color: colors.text.muted }]}>{formatDateTime(item.created_at)}</Text>
                </View>
                {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary.DEFAULT }]} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  backBtn: { padding: spacing[2], marginRight: spacing[1] },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  markAllBtn: { minWidth: 72, alignItems: 'flex-end' },
  markAllText: { fontSize: 13, fontWeight: '600' },
  loader: { marginTop: spacing[8] },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6], gap: spacing[3] },
  emptyText: { fontSize: 15, textAlign: 'center' },
  list: { padding: spacing[4], paddingBottom: spacing[8] },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  body: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, marginTop: spacing[1] },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: spacing[1] },
});
