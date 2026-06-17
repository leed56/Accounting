import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '@/hooks/useOffline';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing } from '@bizmanager/design-tokens';

export function OfflineBanner() {
  const isOffline = useOffline();
  const { t } = useTranslation();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t('offlineMode')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning.DEFAULT,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
