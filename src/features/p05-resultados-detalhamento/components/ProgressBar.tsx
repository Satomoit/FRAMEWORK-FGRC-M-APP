import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCoresP05, type CoresP05 } from '../theme';

interface Props {
  value: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 6 }: Props) {
  // [integração] cores seguem o tema do app (claro, escuro e alto contraste das Configurações)
  const colors = useCoresP05();
  const styles = useMemo(() => criarEstilos(colors), [colors]);
  // [integração] a cor padrão (azul) agora vem do tema, por isso saiu do parâmetro
  const cor = color ?? colors.primary;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: cor }} />
    </View>
  );
}

// [integração] os estilos viraram uma função pra receber as cores do tema que ta ativo
const criarEstilos = (colors: CoresP05) => StyleSheet.create({
  track: { backgroundColor: colors.track, overflow: 'hidden' },
});
