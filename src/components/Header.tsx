import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/lib/theme';
import { formatHeaderDate } from '@/lib/types';

type Props = {
  doneCount: number;
  totalCount: number;
};

export function Header({ doneCount, totalCount }: Props) {
  const showProgress = totalCount > 0;

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        accessibilityRole="header"
        testID="header-date"
      >
        {formatHeaderDate()}
      </Text>
      {showProgress && (
        <Text style={styles.subtitle} testID="header-progress">
          {doneCount} of {totalCount} done
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...type.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.secondary,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
