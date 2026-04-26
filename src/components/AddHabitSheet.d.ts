import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type AddHabitSheetHandle = {
  open: () => void;
  close: () => void;
};

export type AddHabitSheetProps = {
  onSave: (name: string) => void;
};

export declare const AddHabitSheet: ForwardRefExoticComponent<
  AddHabitSheetProps & RefAttributes<AddHabitSheetHandle>
>;
