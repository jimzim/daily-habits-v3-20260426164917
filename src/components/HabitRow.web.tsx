import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { DayGrid } from './DayGrid';
import { colors, radii, shadow, spacing, type } from '@/lib/theme';
import type { Habit } from '@/lib/types';

type Props = {
  habit: Habit;
  index: number;
  completed: boolean;
  onToggle: (id: string) => boolean;
  onDelete: (id: string) => void;
};

const CONFIRM_TIMEOUT_MS = 3000;

export function HabitRow({ habit, index, completed, onToggle, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.6);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  const handleTap = () => {
    const nowCompleted = onToggle(habit.id);
    if (nowCompleted) {
      checkScale.value = 0.6;
      checkOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withSpring(1, { damping: 10, stiffness: 180 });
      setTimeout(() => {
        checkOpacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.quad),
        });
      }, 1000);
    } else {
      checkOpacity.value = withTiming(0, { duration: 150 });
    }
  };

  const handleDeletePress = () => {
    if (!confirming) {
      setConfirming(true);
      confirmTimer.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirming(false);
    onDelete(habit.id);
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const showDelete = hovered || confirming;

  return (
    <View
      style={styles.outer}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        if (!confirming) return;
        // keep confirm visible briefly even on leave
      }}
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
          <View style={styles.right}>
            <DayGrid
              completions={habit.completions}
              testIdPrefix={`habit-row-${index}`}
            />
          </View>
        </View>

        <Animated.View
          pointerEvents="none"
          style={[styles.checkOverlay, overlayStyle]}
        >
          <Ionicons name="checkmark-circle" size={36} color={colors.accent} />
        </Animated.View>

        {showDelete && (
          <Pressable
            onPress={handleDeletePress}
            accessibilityRole="button"
            accessibilityLabel={
              confirming ? 'Tap again to delete' : 'Delete habit'
            }
            testID={`habit-row-${index}-delete`}
            style={[styles.deleteBtn, confirming && styles.deleteBtnConfirming]}
          >
            <Ionicons
              name={confirming ? 'alert-circle' : 'trash-outline'}
              size={18}
              color={confirming ? colors.white : colors.danger}
            />
            {confirming && (
              <Text style={styles.deleteConfirmText}>Tap again to delete</Text>
            )}
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.xs,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...type.body,
    color: colors.textPrimary,
  },
  checkOverlay: {
    position: 'absolute',
    right: spacing.lg,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...shadow.card,
  },
  deleteBtnConfirming: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  deleteConfirmText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
