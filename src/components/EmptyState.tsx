import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/lib/theme';

export function EmptyState() {
  return (
    <View style={styles.container} testID="empty-state">
      <View style={styles.iconWrap}>
        <Ionicons name="leaf-outline" size={48} color={colors.accent} />
      </View>
      <Text style={styles.title}>Start a daily habit</Text>
      <Text style={styles.subtitle}>Tap the + below to add your first one</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...type.title,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...type.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
