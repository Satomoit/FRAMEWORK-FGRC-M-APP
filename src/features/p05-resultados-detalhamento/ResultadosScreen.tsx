// Tela 13 - Resultados (histórico das avaliações)
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClassificationBadge } from './components/ClassificationBadge';
import { results } from './mockData';
import { colors, radius } from './theme';
import { AssessmentResult } from './types';

interface Props {
  onOpenDetails?: (result: AssessmentResult) => void;
}

export function ResultadosScreen({ onOpenDetails }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Resultados</Text>
      <Text style={styles.subtitle}>Histórico das avaliações da prefeitura.</Text>

      {results.map((r) => (
        <Pressable
          key={r.id}
          style={styles.card}
          onPress={() => onOpenDetails?.(r)}
          accessibilityRole="button"
          accessibilityLabel={`Avaliação de ${r.date}, ${r.score} de 100, ${r.classification}. Ver detalhes`}
        >
          <View style={styles.row}>
            <Text style={styles.date}>{r.date}</Text>
            <ClassificationBadge value={r.classification} />
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <View>
              <Text style={styles.index}>{r.index}</Text>
              <Text style={styles.score}>{r.score}/100</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.points}>{r.attentionPoints.length} pontos de atenção</Text>
            <Text style={styles.link}>Ver detalhes</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 56 },
  title: { fontSize: 30, fontWeight: '800', color: colors.title },
  subtitle: { fontSize: 15, color: colors.text, marginTop: 4, marginBottom: 18 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 20,
    marginBottom: 18,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 18, fontWeight: '700', color: colors.text },
  index: { fontSize: 15, color: colors.text },
  score: { fontSize: 20, fontWeight: '800', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 14 },
  points: { fontSize: 15, color: colors.text },
  link: { fontSize: 15, fontWeight: '700', color: colors.primary },
});
