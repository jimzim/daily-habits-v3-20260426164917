import * as Haptics from 'expo-haptics';

export function light(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function medium(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
