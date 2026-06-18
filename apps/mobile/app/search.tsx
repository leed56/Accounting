import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useMobileStore } from '@/stores/app-store';
import {
  globalSearch,
  queryKeys,
  SAMPLE_COMPANY_ID,
  type GlobalSearchResult,
} from '@bizmanager/supabase-client';
import { spacing, radius } from '@bizmanager/design-tokens';

const typeIcons: Record<GlobalSearchResult['type'], keyof typeof Ionicons.glyphMap> = {
  customer: 'people-outline',
  supplier: 'car-outline',
  transaction: 'receipt-outline',
  staff: 'person-outline',
};

function getMobileRoute(result: GlobalSearchResult): string {
  if (result.type === 'staff') return '/(tabs)/staff';
  if (result.type === 'transaction') return '/(tabs)/finance';
  return '/(tabs)/finance';
}

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, screen } = useMobileTheme();
  const companyId = useMobileStore((s) => s.companyId) ?? SAMPLE_COMPANY_ID;
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: queryKeys.search(companyId, debounced),
    queryFn: () => globalSearch(companyId, debounced),
    enabled: debounced.length >= 2,
  });

  return (
    <SafeAreaView style={screen} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.text.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.text.muted}
            style={[styles.input, { color: colors.text.primary }]}
            autoFocus
            returnKeyType="search"
          />
        </View>
      </View>

      {debounced.length < 2 ? (
        <Text style={[styles.hint, { color: colors.text.secondary }]}>{t('searchHint')}</Text>
      ) : isFetching ? (
        <ActivityIndicator style={styles.loader} color={colors.primary.DEFAULT} />
      ) : results.length === 0 ? (
        <Text style={[styles.hint, { color: colors.text.secondary }]}>{t('noSearchResults')}</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                router.back();
                router.push(getMobileRoute(item) as never);
              }}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.primary.light }]}>
                <Ionicons name={typeIcons[item.type]} size={20} color={colors.primary.DEFAULT} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={[styles.subtitle, { color: colors.text.secondary }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.type, { color: colors.text.muted }]}>{item.type}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  backBtn: { padding: spacing[2] },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    minHeight: 44,
  },
  input: { flex: 1, fontSize: 16 },
  hint: {
    textAlign: 'center',
    marginTop: spacing[8],
    paddingHorizontal: spacing[4],
  },
  loader: { marginTop: spacing[8] },
  list: { padding: spacing[4] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  rowText: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
  type: { fontSize: 11, textTransform: 'capitalize' },
});
