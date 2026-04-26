import { useRef } from 'react';
import { LayoutAnimation, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddHabitFAB } from '@/components/AddHabitFAB';
import {
  AddHabitSheet,
  type AddHabitSheetHandle,
} from '@/components/AddHabitSheet';
import { EmptyState } from '@/components/EmptyState';
import { HabitList } from '@/components/HabitList';
import { Header } from '@/components/Header';
import { useHabits } from '@/hooks/useHabits';
import { colors } from '@/lib/theme';

export default function Index() {
  const sheetRef = useRef<AddHabitSheetHandle>(null);
  const {
    habits,
    isLoaded,
    addHabit,
    toggleToday,
    deleteHabit,
    isCompletedToday,
    doneCountToday,
  } = useHabits();

  const handleSave = (name: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    addHabit(name);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    deleteHabit(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Header doneCount={doneCountToday()} totalCount={habits.length} />
      {isLoaded && habits.length === 0 ? (
        <EmptyState />
      ) : (
        <HabitList
          habits={habits}
          isCompletedToday={isCompletedToday}
          onToggle={toggleToday}
          onDelete={handleDelete}
        />
      )}
      <AddHabitFAB onPress={() => sheetRef.current?.open()} />
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <AddHabitSheet ref={sheetRef} onSave={handleSave} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
