import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Modal,
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

export const AddHabitSheet = forwardRef<AddHabitSheetHandle, Props>(
  function AddHabitSheet({ onSave }, ref) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      open: () => {
        setValue('');
        setOpen(true);
      },
      close: () => setOpen(false),
    }));

    useEffect(() => {
      if (!open) return;
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }, [open]);

    // Web Esc-to-close
    useEffect(() => {
      if (!open) return;
      if (typeof window === 'undefined') return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [open]);

    const handleSave = useCallback(() => {
      const trimmed = value.trim();
      if (!trimmed) return;
      onSave(trimmed);
      setValue('');
      setOpen(false);
    }, [value, onSave]);

    const canSave = value.trim().length > 0;

    return (
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close add habit"
        >
          <Pressable
            style={styles.card}
            onPress={(e) => e.stopPropagation()}
            // wrap with Pressable to swallow backdrop press
          >
            <Text style={styles.heading}>Add habit</Text>
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={setValue}
              placeholder="e.g. Drink water"
              placeholderTextColor={colors.textDim}
              style={styles.input}
              testID="add-habit-input"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              maxLength={80}
            />
            <View style={styles.actions}>
              <Pressable
                onPress={() => setOpen(false)}
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
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
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
    borderWidth: 1,
    borderColor: colors.border,
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
