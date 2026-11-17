// Tela 15 - Relatórios
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { recommendations, reports } from './mockData';
import { generateReportPdf } from './pdf';
import { colors, radius } from './theme';
import { Report } from './types';

interface Props {
  onOpenReport?: (report: Report) => void;
}

export function RelatoriosScreen({ onOpenReport }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handlePdf(report: Report) {
    try {
      setLoadingId(report.id);
      await generateReportPdf(report, recommendations);
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setLoadingId(null);
    }
  }

  function handleShare(report: Report) {
    Share.share({
      message: `FGRC-M • Avaliação de ${report.date}: ${report.index} ${report.score}/100 (${report.classification}).`,
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.subtitle}>Consulte e exporte os relatórios das avaliações municipais.</Text>

      {reports.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.date}>{r.date}</Text>
              <Text style={styles.meta}>
                {r.index} • {r.score}/100 • {r.classification}
              </Text>
            </View>
            <MaterialCommunityIcons name="file-document-check-outline" size={30} color={colors.primary} />
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.row} onPress={() => onOpenReport?.(r)} accessibilityRole="button">
            <Text style={styles.link}>Vizualizar relatório</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>

          <View style={[styles.row, { marginTop: 16 }]}>
            <Pressable
              style={styles.action}
              onPress={() => handlePdf(r)}
              disabled={loadingId === r.id}
              accessibilityRole="button"
            >
              <Ionicons name="download-outline" size={20} color={colors.primary} />
              <Text style={styles.actionText}>{loadingId === r.id ? 'Gerando...' : 'Gerar PDF'}</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={() => handleShare(r)} accessibilityRole="button">
              <Ionicons name="share-social-outline" size={20} color={colors.primary} />
              <Text style={styles.actionText}>Compartilhar</Text>
            </Pressable>
          </View>
        </View>
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
  meta: { fontSize: 15, color: colors.text, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 14 },
  link: { fontSize: 16, fontWeight: '700', color: colors.primary },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
