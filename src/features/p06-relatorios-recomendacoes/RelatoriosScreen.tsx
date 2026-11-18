// Tela 15 - Relatórios
import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { generateReportPdf } from './pdf';
import { FgrcButton } from '@/components/fgrc-ui';
import { radius, useCoresP06, type CoresP06 } from './theme';
import { Report } from './types';

interface Props {
  reports: Report[];
  recommendationsFor: (report: Report) => import('./types').Recommendation[];
  onOpenReport?: (report: Report) => void;
  // [integração] sem relatório ainda, o botão leva pra tela de Avaliações
  onStartAssessment?: () => void;
}

export function RelatoriosScreen({ reports, recommendationsFor, onOpenReport, onStartAssessment }: Props) {
  // [integração] cores seguem o tema do app (claro, escuro e alto contraste das Configurações)
  const colors = useCoresP06();
  const styles = useMemo(() => criarEstilos(colors), [colors]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // [integração] aviso que aparece na própria tela (o Alert não aparece no navegador)
  const [aviso, setAviso] = useState('');

  async function handlePdf(report: Report) {
    try {
      setLoadingId(report.id);
      await generateReportPdf(report, recommendationsFor(report));
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
      // [integração] no navegador o Alert não aparece, então mostra aqui também
      setAviso('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setLoadingId(null);
    }
  }

  // [integração] o Share do React Native não existe no navegador e derrubava a tela
  // no celular continua igual; no navegador usa o compartilhar do próprio navegador
  // e se ele não tiver, copia o resumo pra vc colar onde quiser
  async function handleShare(report: Report) {
    const message = `FGRC-M • Avaliação de ${report.date}: ${report.index} ${report.score}/100 (${report.classification}).`;
    setAviso('');
    try {
      if (Platform.OS !== 'web') {
        await Share.share({ message });
        return;
      }
      const nav = globalThis.navigator as Navigator | undefined;
      if (nav?.share) {
        await nav.share({ text: message });
      } else if (nav?.clipboard) {
        await nav.clipboard.writeText(message);
        setAviso('Resumo copiado. Agora é só colar onde você quiser. Para enviar o relatório completo, use Baixar PDF.');
      } else {
        setAviso('Este navegador não permite compartilhar. Use Baixar PDF e envie o arquivo.');
      }
    } catch (erro) {
      // se a pessoa fechar a janela de compartilhar não é erro, então não mostra nada
      if (erro instanceof Error && erro.name === 'AbortError') return;
      setAviso('Não foi possível compartilhar agora. Use Baixar PDF e envie o arquivo.');
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Relatórios</Text>
      <Text style={styles.subtitle}>Consulte e exporte os relatórios das avaliações municipais.</Text>
      {/* [integração] avisos de PDF e compartilhar (aparecem também no navegador) */}
      {aviso ? <Text style={styles.subtitle} accessibilityLiveRegion="polite">{aviso}</Text> : null}

      {/* só entram relatórios de avaliações salvas */}
      {reports.length === 0 ? <Text style={styles.subtitle}>Nenhum relatório ainda. Finalize uma avaliação para gerar o PDF.</Text> : null}
      {/* [integração] atalho pra começar (ou continuar) a avaliação que vai gerar o relatório */}
      {reports.length === 0 && onStartAssessment ? <FgrcButton label="Fazer uma avaliação" onPress={onStartAssessment} /> : null}
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
            <Text style={styles.link}>Visualizar relatório</Text>
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

// [integração] os estilos viraram uma função pra receber as cores do tema que ta ativo
const criarEstilos = (colors: CoresP06) => StyleSheet.create({
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
