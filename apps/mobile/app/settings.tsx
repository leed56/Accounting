import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import { spacing, radius } from '@bizmanager/design-tokens';
import { languages } from '@bizmanager/i18n';

function SettingRow({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useMobileTheme>['colors'];
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{label}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const darkMode = useMobileStore((s) => s.darkMode);
  const setDarkMode = useMobileStore((s) => s.setDarkMode);
  const notificationPrefs = useMobileStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useMobileStore((s) => s.setNotificationPrefs);

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t('settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{t('languagePreference')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.langRow}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langBtn,
                  { borderColor: colors.border },
                  language === lang.code && { backgroundColor: colors.primary.light, borderColor: colors.primary.DEFAULT },
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.langText,
                    { color: colors.text.secondary },
                    language === lang.code && { color: colors.primary.DEFAULT, fontWeight: '700' },
                  ]}
                >
                  {lang.nativeLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{t('appearance')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow label={t('darkMode')} colors={colors}>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.primary.DEFAULT }} />
          </SettingRow>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{t('notificationPreferences')}</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow label={t('notifyApprovals')} colors={colors}>
            <Switch
              value={notificationPrefs.notifyApprovals}
              onValueChange={(v) => setNotificationPrefs({ notifyApprovals: v })}
              trackColor={{ true: colors.primary.DEFAULT }}
            />
          </SettingRow>
          <SettingRow label={t('notifyPayroll')} colors={colors}>
            <Switch
              value={notificationPrefs.notifyPayroll}
              onValueChange={(v) => setNotificationPrefs({ notifyPayroll: v })}
              trackColor={{ true: colors.primary.DEFAULT }}
            />
          </SettingRow>
          <SettingRow label={t('notifyLeave')} colors={colors}>
            <Switch
              value={notificationPrefs.notifyLeave}
              onValueChange={(v) => setNotificationPrefs({ notifyLeave: v })}
              trackColor={{ true: colors.primary.DEFAULT }}
            />
          </SettingRow>
        </View>

        <Text style={[styles.footer, { color: colors.text.muted }]}>BizManager v1.7</Text>
      </ScrollView>
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
  backBtn: { padding: spacing[2], marginRight: spacing[2] },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    marginTop: spacing[2],
  },
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: spacing[4] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  rowLabel: { fontSize: 15, flex: 1, paddingRight: spacing[3] },
  langRow: { flexDirection: 'row', gap: spacing[2], padding: spacing[4] },
  langBtn: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  langText: { fontSize: 14, fontWeight: '500' },
  footer: { textAlign: 'center', fontSize: 12, marginTop: spacing[4] },
});
