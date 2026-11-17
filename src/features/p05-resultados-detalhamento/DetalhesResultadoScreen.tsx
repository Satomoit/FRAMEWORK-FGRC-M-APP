// Tela 14 - Detalhes do resultado
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ClassificationBadge } from './components/ClassificationBadge';
import { ProgressBar } from './components/ProgressBar';
import { results } from './mockData';
import { colors, radius } from './theme';
import { AssessmentResult } from './types';

interface Props {
  result?: AssessmentResult;
  onBack?: () => void;
  onOpenReport?: (result: AssessmentResult) => void;
}

export function DetalhesResultadoScreen({ result = results[0], onBack, onOpenReport }: Props) {
  const [showAll, setShowAll] = useState(false);
  const dimensions = showAll ? result.dimensions : result.dimensions.slice(0, 3);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar">
        <Ionicons name="arrow-back" size={26} color={colors.title} />
      </Pressable>

      <Text style={styles.title}>Detalhes do resultado</Text>
      <Text style={styles.subtitle}>
        Avaliação de {result.date} • {result.index}
      </Text>

      {/* Índice geral */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Índice de exposição cibernética municipal</Text>
        <View style={[styles.row, { marginVertical: 10 }]}>
          <Text style={styles.bigScore}>{result.score}/100</Text>
          <ClassificationBadge value={result.classification} />
        </View>
        <ProgressBar value={result.score} color={colors.accent} height={8} />
      </View>

      {/* Dimensões */}
      <Text style={styles.section}>Resultados por dimensão</Text>
      <View style={styles.card}>
        {dimensions.map((d) => (
          <View key={d.code} style={styles.dimension}>
            <View style={styles.row}>
              <Text style={styles.dimName}>
                {d.name} ({d.code})
              </Text>
              <Text style={styles.dimScore}>{d.score}/100</Text>
            </View>
            <ProgressBar value={d.score} />
          </View>
        ))}
        <Pressable
          style={styles.toggle}
          onPress={() => setShowAll((v) => !v)}
          accessibilityRole="button"
        >
          <Text style={styles.link}>{showAll ? 'Ver menos' : 'Ver todas as dimensões'}</Text>
          {!showAll && <Ionicons name="arrow-forward" size={16} color={colors.primary} />}
        </Pressable>
      </View>

      {/* Pontos de atenção */}
      <Text style={styles.section}>Pontos de atenção</Text>
      <View style={styles.card}>
        {result.attentionPoints.map((p, i) => {
          const high = p.priority === 'alta';
          const tint = high ? colors.danger : colors.warning;
          return (
            <View key={p.title}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.pointRow}>
                <MaterialCommunityIcons
                  name={high ? 'shield-alert-outline' : 'alert-circle-outline'}
                  size={24}
                  color={tint}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.pointTitle}>{p.title}</Text>
                  <Text style={[styles.pointPriority, { color: tint }]}>
                    Prioridade {p.priority}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.button} onPress={() => onOpenReport?.(result)} accessibilityRole="button">
        <Text style={styles.buttonText}>Ver relatório</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 48, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.title, marginTop: 14 },
  subtitle: { fontSize: 15, color: colors.text, marginTop: 4, marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 20,
  },
  cardLabel: { fontSize: 15, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bigScore: { fontSize: 34, fontWeight: '800', color: colors.primary },
  section: { fontSize: 20, fontWeight: '800', color: colors.title, marginTop: 24, marginBottom: 10 },
  dimension: { marginBottom: 14 },
  dimName: { fontSize: 16, color: colors.text, marginBottom: 6 },
  dimScore: { fontSize: 13, fontWeight: '700', color: colors.primary },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  link: { fontSize: 16, fontWeight: '600', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 12 },
  pointRow: { flexDirection: 'row', alignItems: 'center' },
  pointTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  pointPriority: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
