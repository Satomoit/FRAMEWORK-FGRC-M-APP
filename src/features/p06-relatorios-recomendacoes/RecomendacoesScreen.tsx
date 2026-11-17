// Tela 16 - Recomendações
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recommendations as mockRecs, reports } from './mockData';
import { generateReportPdf } from './pdf';
import { colors, radius } from './theme';
import { Recommendation, Report } from './types';

interface Props {
  report?: Report;
  recommendations?: Recommendation[];
  onBack?: () => void;
}

export function RecomendacoesScreen({
  report = reports[0],
  recommendations = mockRecs,
  onBack,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePdf() {
    try {
      setLoading(true);
      await generateReportPdf(report, recommendations);
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar">
        <Ionicons name="arrow-back" size={26} color={colors.title} />
      </Pressable>

      <Text style={styles.title}>Recomendações</Text>
      <Text style={styles.subtitle}>
        Avaliação de {report.date} • {recommendations.length} recomendações
      </Text>

      {recommendations.map((r) => {
        const high = r.priority === 'alta';
        return (
          <View key={r.code} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{r.code}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: high ? colors.dangerBg : colors.warningBg },
                ]}
              >
                <Text style={[styles.badgeText, { color: high ? colors.danger : colors.warning }]}>
                  Prioridade {r.priority}
                </Text>
              </View>
            </View>

            <Text style={styles.answer}>
              <Text style={styles.bold}>Resposta registrada: {r.answerValue}</Text> — {r.answerLabel}
            </Text>

            <View style={styles.divider} />

            <View style={[styles.row, { justifyContent: 'flex-start', gap: 10 }]}>
              <Ionicons name="bulb-outline" size={22} color={colors.accent} />
              <Text style={styles.solutionTitle}>Solução recomendada</Text>
            </View>
            <Text style={styles.solution}>{r.solution}</Text>
            <Text style={styles.reference}>Referência: {r.reference}</Text>
          </View>
        );
      })}

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handlePdf}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{loading ? 'Gerando PDF...' : 'Gerar PDF'}</Text>
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
    marginBottom: 18,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeBox: {
    backgroundColor: colors.accentBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  code: { fontSize: 16, fontWeight: '700', color: colors.accent },
  badge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.badge },
  badgeText: { fontSize: 14, fontWeight: '700' },
  answer: { fontSize: 14, color: colors.text, marginTop: 18 },
  bold: { fontWeight: '700', color: colors.title },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 12 },
  solutionTitle: { fontSize: 17, fontWeight: '800', color: colors.title },
  solution: { fontSize: 16, lineHeight: 24, color: colors.text, marginTop: 10 },
  reference: { fontSize: 14, color: colors.text, marginTop: 14 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
