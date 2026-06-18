import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { signIn, bootstrapSession } from '@bizmanager/supabase-client';
import { useMobileStore } from '@/stores/app-store';
import { PRIVACY_POLICY_URL } from '@/constants/urls';
import { spacing, radius } from '@bizmanager/design-tokens';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const setCompanyId = useMobileStore((s) => s.setCompanyId);
  const [email, setEmail] = useState('appleview778@gmail.com');
  const [password, setPassword] = useState('BizManager2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    const { profile } = await bootstrapSession();
    setCompanyId(profile?.company_id ?? null);
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={screen}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('login')}</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Royal Travels Office</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>{t('email')}</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.text.muted}
          />
          <Text style={[styles.label, { color: colors.text.secondary }]}>{t('password')}</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text.primary }]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={colors.text.muted}
          />
          {error ? <Text style={[styles.error, { color: colors.danger.DEFAULT }]}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary.DEFAULT }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('signIn')}</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} style={styles.privacyLink}>
          <Text style={[styles.privacyText, { color: colors.text.muted }]}>{t('privacyPolicy')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing[6], justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginBottom: spacing[6] },
  card: { borderRadius: radius.lg, padding: spacing[6] },
  label: { fontSize: 14, fontWeight: '500', marginBottom: spacing[1], marginTop: spacing[3] },
  input: { borderWidth: 1, borderRadius: radius.md, padding: spacing[3], fontSize: 16, minHeight: 44 },
  btn: { borderRadius: radius.md, padding: spacing[4], marginTop: spacing[6], alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { marginTop: spacing[3], fontSize: 13 },
  privacyLink: { marginTop: spacing[6], alignItems: 'center' },
  privacyText: { fontSize: 13 },
});
