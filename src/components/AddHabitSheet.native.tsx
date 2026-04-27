import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radii, spacing, type } from '@/lib/theme';

export type AddHabitSheetHandle = {
  open: () => void;
  close: () => void;
};

type Props = {
  onSave: (name: string) => void;
};

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.4}
    pressBehavior="close"
  />
);

export const AddHabitSheet = forwardRef<AddHabitSheetHandle, Props>(
  function AddHabitSheet({ onSave }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [value, setValue] = useState('');

    useImperativeHandle(ref, () => ({
      open: () => {
        setValue('');
        sheetRef.current?.present();
      },
      close: () => {
        sheetRef.current?.dismiss();
      },
    }));

    const handleSave = useCallback(() => {
      const trimmed = value.trim();
      if (!trimmed) return;
      onSave(trimmed);
      setValue('');
      sheetRef.current?.dismiss();
    }, [value, onSave]);

    const canSave = value.trim().length > 0;

    return (
      <BottomSheetModal
        ref={sheetRef}
        backdropComponent={Backdrop}
        snapPoints={['55%']}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        enableDynamicSizing={false}
      >
        <BottomSheetView style={styles.body}>
          <Text style={styles.heading}>Add habit</Text>
          <View testID="add-habit-input" accessibilityLabel="add-habit-input">
            <TextInput
              autoFocus
              value={value}
              onChangeText={setValue}
              placeholder="e.g. Drink water"
              placeholderTextColor={colors.textDim}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              maxLength={80}
            />
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              accessibilityRole="button"
              testID="add-habit-cancel"
              style={({ pressed }) => [
                styles.btn,
                styles.cancelBtn,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
              testID="add-habit-save"
              style={({ pressed }) => [
                styles.btn,
                styles.saveBtn,
                !canSave && styles.saveBtnDisabled,
                pressed && canSave && styles.btnPressed,
              ]}
            >
              <Text
                style={[
                  styles.saveLabel,
                  !canSave && styles.saveLabelDisabled,
                ]}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg * 2,
    borderTopRightRadius: radii.lg * 2,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  heading: {
    ...type.title,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  input: {
    ...type.body,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    height: 48,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  btn: {
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  btnPressed: {
    opacity: 0.85,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
  },
  cancelLabel: {
    ...type.body,
    color: colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: colors.accent,
  },
  saveBtnDisabled: {
    backgroundColor: colors.border,
  },
  saveLabel: {
    ...type.body,
    color: colors.white,
    fontWeight: '600',
  },
  saveLabelDisabled: {
    color: colors.textDim,
  },
});
