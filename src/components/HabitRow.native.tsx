import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { DayGrid } from './DayGrid';
import { light, medium } from '@/lib/haptics';
import { colors, radii, shadow, spacing, type } from '@/lib/theme';
import type { Habit } from '@/lib/types';

type Props = {
  habit: Habit;
  index: number;
  completed: boolean;
  onToggle: (id: string) => boolean; // returns true if newly completed
  onDelete: (id: string) => void;
};

const RIGHT_ACTION_WIDTH = 96;

function RightActions({
  progress,
  swipeable,
  habitId,
  onConfirm,
}: {
  progress: SharedValue<number>;
  swipeable: React.RefObject<SwipeableMethods | null>;
  habitId: string;
  onConfirm: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [RIGHT_ACTION_WIDTH, 0],
    );
    return { transform: [{ translateX }] };
  });

  return (
    <Animated.View style={[styles.actionContainer, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete habit"
        testID={`habit-row-${habitId}-delete`}
        style={styles.actionPressable}
        onPress={() => {
          swipeable.current?.close();
          onConfirm();
        }}
      >
        <Ionicons name="trash-outline" size={22} color={colors.white} />
        <Text style={styles.actionLabel}>Delete</Text>
      </Pressable>
    </Animated.View>
  );
}

export function HabitRow({ habit, index, completed, onToggle, onDelete }: Props) {
  const swipeRef = useRef<SwipeableMethods | null>(null);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.6);
  const fillProgress = useSharedValue(completed ? 1 : 0);

  // Keep fill in sync if state changes externally.
  useDerivedValue(() => {
    fillProgress.value = withTiming(completed ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [completed]);

  const handleTap = () => {
    const nowCompleted = onToggle(habit.id);
    if (nowCompleted) {
      light();
      checkScale.value = 0.6;
      checkOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withSpring(1, { damping: 10, stiffness: 180 });
      // hold then fade out
      checkOpacity.value = withTiming(1, { duration: 200 }, () => {
        checkOpacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.quad),
        });
      });
      setTimeout(() => {
        checkOpacity.value = withTiming(0, { duration: 200 });
      }, 1000);
    } else {
      checkOpacity.value = withTiming(0, { duration: 150 });
    }
  };

  const handleDelete = () => {
    medium();
    onDelete(habit.id);
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={(progress) => (
        <RightActions
          progress={progress}
          swipeable={swipeRef}
          habitId={habit.id}
          onConfirm={handleDelete}
        />
      )}
      friction={2}
      rightThreshold={48}
      overshootRight={false}
    >
      <Pressable
        onPress={handleTap}
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}${completed ? ', done today' : ''}`}
        accessibilityState={{ selected: completed }}
        testID={`habit-row-${index}`}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <View style={styles.rowInner}>
          <View style={styles.left}>
            <Text style={styles.name} numberOfLines={1}>
              {habit.name}
            </Text>
          </View>
          <DayGrid
            completions={habit.completions}
            testIdPrefix={`habit-row-${index}`}
          />
        </View>
        <Animated.View
          pointerEvents="none"
          style={[styles.checkOverlay, overlayStyle]}
        >
          <Ionicons name="checkmark-circle" size={44} color={colors.accent} />
        </Animated.View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.xs,
    minHeight: 64,
    ...shadow.card,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPressed: {
    opacity: 0.92,
  },
  left: {
    flex: 1,
    paddingRight: spacing.base,
  },
  name: {
    ...type.body,
    color: colors.textPrimary,
  },
  actionContainer: {
    width: RIGHT_ACTION_WIDTH,
    marginVertical: spacing.xs,
    marginRight: spacing.xl,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  actionPressable: {
    flex: 1,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  checkOverlay: {
    position: 'absolute',
    right: spacing.lg,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
