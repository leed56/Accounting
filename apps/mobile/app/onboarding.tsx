import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, spacing, radius } from '@bizmanager/design-tokens';
import type { Language } from '@bizmanager/i18n';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, languages, language, setLanguage } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('selectLanguage')}</Text>
          <View style={styles.langRow}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langBtn, language === lang.code && styles.langBtnActive]}
                onPress={() => setLanguage(lang.code as Language)}
              >
                <Text style={[styles.langText, language === lang.code && styles.langTextActive]}>
                  {lang.code.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>{t('continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing[6], justifyContent: 'center' },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: colors.text.primary },
  tagline: { fontSize: 16, color: colors.text.secondary, textAlign: 'center', marginTop: spacing[2], marginBottom: spacing[8] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[6], shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing[4] },
  langRow: { flexDirection: 'row', gap: spacing[2] },
  langBtn: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.md, backgroundColor: '#f3f4f6', minHeight: 44, justifyContent: 'center' },
  langBtnActive: { backgroundColor: colors.primary.DEFAULT },
  langText: { fontWeight: '600', color: colors.text.secondary },
  langTextActive: { color: '#fff' },
  btn: { backgroundColor: colors.primary.DEFAULT, borderRadius: radius.md, padding: spacing[4], marginTop: spacing[6], alignItems: 'center', minHeight: 52 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
