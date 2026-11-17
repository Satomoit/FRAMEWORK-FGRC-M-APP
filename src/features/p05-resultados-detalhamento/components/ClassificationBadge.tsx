import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { Classification } from '../types';

const palette: Record<Classification, { bg: string; fg: string }> = {
  Baixo: { bg: '#C9DDD3', fg: '#1B6B3A' },
  Intermediário: { bg: colors.warningBg, fg: colors.warning },
  Alto: { bg: colors.dangerBg, fg: colors.danger },
};

export function ClassificationBadge({ value }: { value: Classification }) {
  const { bg, fg } = palette[value];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.badge },
  text: { fontSize: 14, fontWeight: '700' },
});
