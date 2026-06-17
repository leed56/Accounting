import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { signIn, bootstrapSession } from '@bizmanager/supabase-client';
import { useMobileStore } from '@/stores/app-store';
import { colors, spacing, radius } from '@bizmanager/design-tokens';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('login')}</Text>
        <Text style={styles.subtitle}>Royal Travels Office</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('signIn')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing[6] },
  title: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  subtitle: { color: colors.text.secondary, marginBottom: spacing[6] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing[6] },
  label: { fontSize: 14, fontWeight: '500', color: colors.text.secondary, marginBottom: spacing[1], marginTop: spacing[3] },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing[3], fontSize: 16, minHeight: 44 },
  btn: { backgroundColor: colors.primary.DEFAULT, borderRadius: radius.md, padding: spacing[4], marginTop: spacing[6], alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: colors.danger.DEFAULT, marginTop: spacing[3], fontSize: 13 },
});
