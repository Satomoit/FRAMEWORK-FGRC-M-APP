import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, useCoresP05, type CoresP05 } from '../theme';
import { Classification } from '../types';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

// [integração] a paleta virou função pra seguir o tema (claro/escuro); as cores do claro são as mesmas de antes
const paletaDo = (colors: CoresP05): Record<Classification, { bg: string; fg: string }> => ({
  Baixo: { bg: colors.successBg, fg: colors.success },
  Intermediário: { bg: colors.warningBg, fg: colors.warning },
  Alto: { bg: colors.dangerBg, fg: colors.danger },
});

export function ClassificationBadge({ value }: { value: Classification }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const colors = useCoresP05();
  const { bg, fg } = paletaDo(colors)[value];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{value}</Text>
    </View>
  );
}

const estilosBase = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.badge },
  text: { fontSize: 14, fontWeight: '700' },
});
