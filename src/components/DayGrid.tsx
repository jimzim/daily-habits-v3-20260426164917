import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, type } from '@/lib/theme';
import { dayLetterFor, isToday, lastNDates } from '@/lib/types';

const CELL_SIZE = 18;
const GAP = 6;

type Props = {
  /** ISO dates this habit was completed on. */
  completions: string[];
  /** Optional rowIndex used for testID composition (e.g. habit-row-N-today-cell). */
  testIdPrefix?: string;
};

function Cell({
  completed,
  today,
  testID,
}: {
  completed: boolean;
  today: boolean;
  testID?: string;
}) {
  const fill = useDerivedValue(
    () => withTiming(completed ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    }),
    [completed],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      fill.value > 0
        ? `rgba(14, 124, 123, ${fill.value})`
        : 'transparent',
    borderColor:
      fill.value > 0.5
        ? colors.accent
        : today
          ? colors.borderStrong
          : colors.border,
  }));

  return (
    <Animated.View
      testID={testID}
      accessibilityState={{ selected: completed }}
      style={[
        styles.cell,
        today && styles.cellToday,
        animatedStyle,
      ]}
    />
  );
}

export function DayGrid({ completions, testIdPrefix }: Props) {
  const days = lastNDates(7);
  const set = new Set(completions);

  return (
    <View style={styles.row}>
      {days.map((date, idx) => {
        const completed = set.has(date);
        const today = isToday(date);
        const isLast = idx === days.length - 1;
        const cellTestId = today && testIdPrefix
          ? `${testIdPrefix}-today-cell`
          : undefined;

        return (
          <View key={date} style={[styles.cellWrap, !isLast && styles.gap]}>
            <Cell completed={completed} today={today} testID={cellTestId} />
            <Text
              style={[styles.label, today && styles.labelToday]}
              accessibilityElementsHidden
            >
              {dayLetterFor(date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cellWrap: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  gap: {
    marginRight: GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellToday: {
    borderWidth: 2,
  },
  label: {
    ...type.caption,
    fontSize: 10,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  labelToday: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
