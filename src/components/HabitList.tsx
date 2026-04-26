import { FlatList, StyleSheet, View } from 'react-native';
import { HabitRow } from './HabitRow';
import { spacing } from '@/lib/theme';
import type { Habit } from '@/lib/types';

type Props = {
  habits: Habit[];
  isCompletedToday: (id: string) => boolean;
  onToggle: (id: string) => boolean;
  onDelete: (id: string) => void;
};

export function HabitList({ habits, isCompletedToday, onToggle, onDelete }: Props) {
  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <HabitRow
          habit={item}
          index={index}
          completed={isCompletedToday(item.id)}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      )}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
      testID="habit-list"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  separator: {
    height: 0,
  },
});
