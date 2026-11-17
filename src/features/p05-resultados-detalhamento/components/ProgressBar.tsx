import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  value: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color = colors.primary, height = 6 }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.track, overflow: 'hidden' },
});
