import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow, sizes } from '@/lib/theme';

type Props = {
  onPress: () => void;
};

export function AddHabitFAB({ onPress }: Props) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 16) + 12;

  return (
    <View style={[styles.wrap, { bottom: bottomOffset }]} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add habit"
        testID="add-habit-fab"
        hitSlop={12}
        style={styles.fab}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 24,
  },
  fab: {
    width: sizes.fab,
    height: sizes.fab,
    borderRadius: sizes.fab / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
