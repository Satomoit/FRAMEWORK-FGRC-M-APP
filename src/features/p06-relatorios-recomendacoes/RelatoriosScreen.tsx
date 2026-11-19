// Tela 15 - Relatórios
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// [correção Android] três ações separadas com o mesmo arquivo PDF (antes "Gerar PDF" já abria o compartilhar)
import { abrirRelatorioPdf, baixarRelatorioPdf, compartilharRelatorioPdf, type ResultadoPdf } from './pdf';
import { FgrcButton } from '@/components/fgrc-ui';
import { radius, useCoresP06, type CoresP06 } from './theme';
import { Report } from './types';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

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
  const estilosBase = useMemo(() => criarEstilos(colors), [colors]);
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // [correção Android] qual botão ta trabalhando (pra mostrar "Gerando..." só nele)
  const [acaoAtual, setAcaoAtual] = useState<Acao | null>(null);
  // [integração] aviso que aparece na própria tela (o Alert não aparece no navegador)
  const [aviso, setAviso] = useState('');

  // [correção Android] Baixar, Abrir e Compartilhar usam o PDF de verdade (o mesmo nos três)
  // o aviso embaixo do título conta o que aconteceu (ex: em qual pasta salvou)
  async function handlePdf(report: Report, acao: Acao) {
    if (loadingId) return;
    setAviso('');
    try {
      setLoadingId(report.id);
      setAcaoAtual(acao);
      const fazer = acao === 'baixar' ? baixarRelatorioPdf : acao === 'abrir' ? abrirRelatorioPdf : compartilharRelatorioPdf;
      const resultado: ResultadoPdf = await fazer(report, recommendationsFor(report));
      if (resultado.mensagem) setAviso(resultado.mensagem);
    } catch (erro) {
      // fechou a janela de compartilhar: não é erro, então não mostra nada
      if (erro instanceof Error && erro.name === 'AbortError') return;
      Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
      // [integração] no navegador o Alert não aparece, então mostra aqui também
      setAviso('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setLoadingId(null);
      setAcaoAtual(null);
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

          {/* [integração 19/11] acessibilidade: área de toque de 48 e o leitor de tela fala de qual relatório é */}
          <Pressable style={[styles.row, styles.alvoDeToque]} onPress={() => onOpenReport?.(r)} accessibilityRole="button" accessibilityLabel={`Visualizar relatório de ${r.date}`}>
            <Text style={styles.link}>Visualizar relatório</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>

          {/* [correção Android] eram 2 botões (Gerar PDF abria o compartilhar e Compartilhar mandava só um texto)
              agora são 3, cada um faz uma coisa só, sempre com o arquivo PDF completo */}
          <View style={[styles.row, styles.acoes]}>
            {ACOES.map((a) => (
              <Pressable
                key={a.acao}
                style={styles.action}
                onPress={() => { void handlePdf(r, a.acao); }}
                disabled={loadingId !== null}
                accessibilityRole="button"
                accessibilityLabel={`${a.rotulo} o relatório de ${r.date}`}
              >
                <Ionicons name={a.icone} size={20} color={colors.primary} />
                <Text style={styles.actionText}>{loadingId === r.id && acaoAtual === a.acao ? 'Gerando...' : a.rotulo}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// [correção Android] os três botões do PDF
type Acao = 'baixar' | 'abrir' | 'compartilhar';
const ACOES: { acao: Acao; rotulo: string; icone: 'download-outline' | 'open-outline' | 'share-social-outline' }[] = [
  { acao: 'baixar', rotulo: 'Baixar PDF', icone: 'download-outline' },
  { acao: 'abrir', rotulo: 'Abrir', icone: 'open-outline' },
  { acao: 'compartilhar', rotulo: 'Compartilhar', icone: 'share-social-outline' },
];

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
  // [integração 19/11] minHeight 48 nos botões Visualizar/Baixar/Compartilhar (antes eram só texto + ícone, difícil de acertar)
  action: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: 4 },
  alvoDeToque: { minHeight: 48 },
  // [correção Android] 3 botões: quebram linha sozinhos em celular estreito
  acoes: { marginTop: 16, flexWrap: 'wrap', rowGap: 12, columnGap: 16, justifyContent: 'flex-start' },
  actionText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
