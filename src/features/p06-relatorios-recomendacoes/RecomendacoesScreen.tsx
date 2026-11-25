// Tela 16 - Recomendações
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// [correção Android] o botão daqui também salva o PDF de verdade (escolhendo a pasta no Android)
// [integração 25/11] + compartilhar: manda o arquivo PDF direto pra janela de compartilhar (WhatsApp, e-mail...)
import { baixarRelatorioPdf, compartilharRelatorioPdf } from './pdf';
import { radius, useCoresP06, type CoresP06 } from './theme';
import { Recommendation, Report } from './types';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';
// [integração 25/11] escolhe singular ou plural ("1 recomendação", "3 recomendações")
import { contagem } from '@/lib/textos';

// [integração 25/11] os dois botões do fim da tela
type AcaoPdf = 'baixar' | 'compartilhar';

interface Props {
  report: Report;
  recommendations: Recommendation[];
  onBack?: () => void;
}

export function RecomendacoesScreen({
  report,
  recommendations,
  onBack,
}: Props) {
  // [integração] cores seguem o tema do app (claro, escuro e alto contraste das Configurações)
  const colors = useCoresP06();
  const estilosBase = useMemo(() => criarEstilos(colors), [colors]);
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const [loading, setLoading] = useState(false);
  // [correção Android] mostra onde o PDF foi salvo (ou por que não salvou)
  const [aviso, setAviso] = useState('');
  // [integração 25/11] guarda quais recomendações estão com a explicação simples aberta (pelo código, ex: 01-GOV)
  // começa tudo fechado pra tela não ficar gigante; a pessoa abre só a que tiver dúvida
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  const abrirOuFechar = (codigo: string) => setAbertas((atual) => ({ ...atual, [codigo]: !atual[codigo] }));

  // [integração 25/11] qual dos dois botões ta trabalhando (pra mostrar "Gerando PDF..." só nele)
  const [acao, setAcao] = useState<AcaoPdf | null>(null);

  // [integração 25/11] agora recebe qual botão foi tocado:
  //  - 'compartilhar' abre a janela de compartilhar do celular já com o ARQUIVO PDF (igual o comprovante do app do banco)
  //  - 'baixar' continua salvando numa pasta que a pessoa escolhe
  async function handlePdf(qual: AcaoPdf) {
    if (loading) return;
    setAviso('');
    try {
      setLoading(true);
      setAcao(qual);
      const fazer = qual === 'compartilhar' ? compartilharRelatorioPdf : baixarRelatorioPdf;
      const resultado = await fazer(report, recommendations);
      if (resultado.mensagem) setAviso(resultado.mensagem);
    } catch (erro) {
      // fechou a janela de compartilhar sem escolher nada: não é erro, então não mostra aviso
      if (erro instanceof Error && erro.name === 'AbortError') return;
      Alert.alert('Erro', 'Não foi possível gerar o PDF. Tente novamente.');
      // no navegador o Alert não aparece, então mostra aqui também
      setAviso('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setLoading(false);
      setAcao(null);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar">
        <Ionicons name="arrow-back" size={26} color={colors.title} />
      </Pressable>

      <Text style={styles.title}>Recomendações</Text>
      <Text style={styles.subtitle}>
        Avaliação de {report.date} • {contagem(recommendations.length, 'recomendação', 'recomendações')}
      </Text>

      {recommendations.map((r, i) => {
        const high = r.priority === 'alta';
        // [integração 25/11] a lista já chega com as de prioridade alta primeiro (calcular-relatorio.ts)
        // quando muda de grupo entra um título dizendo qual é a prioridade e o que ela significa
        const comecaGrupo = i === 0 || recommendations[i - 1].priority !== r.priority;
        const quantasDoGrupo = recommendations.filter((x) => x.priority === r.priority).length;
        return (
          <React.Fragment key={r.code}>
          {comecaGrupo ? (
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle} accessibilityRole="header">
                Prioridade {r.priority} ({quantasDoGrupo})
              </Text>
              <Text style={styles.groupHint}>
                {high ? 'Respostas com nota 0 ou 1. Comece por estas.' : 'Respostas com nota 2 ou 3.'}
              </Text>
            </View>
          ) : null}
          <View style={styles.card}>
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
            {/* [integração 25/11] "Ficou com dúvida em como resolver?": abre a mesma solução explicada em palavras simples
                (pedido do grupo: muita gente da prefeitura não é da área de informática) */}
            {r.simpleExplanation ? (
              <View style={styles.helpBox}>
                <Pressable
                  onPress={() => abrirOuFechar(r.code)}
                  style={styles.helpButton}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: Boolean(abertas[r.code]) }}
                  accessibilityHint="Mostra a solução explicada em palavras simples"
                >
                  <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
                  <Text style={styles.helpButtonText}>Ficou com dúvida em como resolver?</Text>
                  <Ionicons name={abertas[r.code] ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
                </Pressable>
                {abertas[r.code] ? (
                  <View style={styles.helpContent} accessibilityLiveRegion="polite">
                    <Text style={styles.helpTitle}>Explicando de um jeito simples</Text>
                    <Text style={styles.helpText}>{r.simpleExplanation}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            <Text style={styles.reference}>Referência: {r.reference}</Text>
          </View>
          </React.Fragment>
        );
      })}

      {/* [integração 25/11] Compartilhar vem primeiro: abre a janela de compartilhar do celular já com o PDF
          (WhatsApp, e-mail, Drive...), sem precisar salvar antes. O Baixar PDF continua pra quem quer guardar numa pasta */}
      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={() => { void handlePdf('compartilhar'); }}
        disabled={loading}
        accessibilityRole="button"
      >
        <Ionicons name="share-social-outline" size={22} color={colors.onPrimary} />
        <Text style={styles.buttonText}>{loading && acao === 'compartilhar' ? 'Gerando PDF...' : 'Compartilhar PDF'}</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonOutline, loading && { opacity: 0.6 }]}
        onPress={() => { void handlePdf('baixar'); }}
        disabled={loading}
        accessibilityRole="button"
      >
        <Ionicons name="download-outline" size={22} color={colors.primary} />
        <Text style={[styles.buttonText, styles.buttonOutlineText]}>{loading && acao === 'baixar' ? 'Gerando PDF...' : 'Baixar PDF'}</Text>
      </Pressable>
      {/* [correção Android] aviso de onde salvou (aparece também no navegador) */}
      {aviso ? <Text style={styles.subtitle} accessibilityLiveRegion="polite">{aviso}</Text> : null}
    </ScrollView>
  );
}

// [integração] os estilos viraram uma função pra receber as cores do tema que ta ativo
const criarEstilos = (colors: CoresP06) => StyleSheet.create({
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
  // [integração 25/11] caixa do "Ficou com dúvida em como resolver?" (minHeight 48 = tamanho bom pra tocar com o dedo)
  helpBox: { marginTop: 14, borderWidth: 1.2, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background },
  helpButton: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: 12, paddingVertical: 8 },
  // o texto usa a cor do título (e não o azul) pq no modo escuro o azul em cima do fundo fica com pouco contraste
  helpButtonText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.title },
  helpContent: { paddingHorizontal: 12, paddingBottom: 14 },
  helpTitle: { fontSize: 14, fontWeight: '800', color: colors.title, marginBottom: 6 },
  helpText: { fontSize: 16, lineHeight: 24, color: colors.text },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 18,
    alignItems: 'center',
    // [integração 25/11] ícone e texto lado a lado, no meio do botão
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  // [integração 25/11] era branco fixo ('#FFFFFF'); no alto contraste escuro o botão fica azul claro e o branco sumia
  buttonText: { color: colors.onPrimary, fontSize: 17, fontWeight: '700' },
  // [integração 25/11] segundo botão (Baixar PDF): só o contorno, pra não brigar com o Compartilhar
  buttonOutline: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primary, marginTop: 12 },
  buttonOutlineText: { color: colors.primary },
  // [integração 25/11] título de cada grupo de prioridade
  groupHeader: { marginTop: 6, marginBottom: 12 },
  groupTitle: { fontSize: 20, fontWeight: '800', color: colors.title },
  groupHint: { fontSize: 14, lineHeight: 20, color: colors.text, marginTop: 2 },
});
