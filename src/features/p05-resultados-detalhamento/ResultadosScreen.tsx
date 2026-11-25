// Tela 13 - Resultados (histórico das avaliações)
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClassificationBadge } from './components/ClassificationBadge';
import { FgrcButton } from '@/components/fgrc-ui';
import { radius, useCoresP05, type CoresP05 } from './theme';
import { AssessmentResult } from './types';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';
// [integração 25/11] escolhe singular ou plural ("1 ponto de atenção", "3 pontos de atenção")
import { contagem } from '@/lib/textos';

interface Props {
  results: AssessmentResult[];
  onOpenDetails?: (result: AssessmentResult) => void;
  // [integração] sem avaliação ainda, o botão leva pra tela de Avaliações
  onStartAssessment?: () => void;
}

export function ResultadosScreen({ results, onOpenDetails, onStartAssessment }: Props) {
  // [integração] cores seguem o tema do app (claro, escuro e alto contraste das Configurações)
  const colors = useCoresP05();
  const estilosBase = useMemo(() => criarEstilos(colors), [colors]);
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Resultados</Text>
      <Text style={styles.subtitle}>Histórico das avaliações da prefeitura.</Text>

      {/* sem avaliação finalizada, mostramos um estado vazio (nada de dados inventados) */}
      {results.length === 0 ? <Text style={styles.subtitle}>Nenhuma avaliação concluída neste aparelho. Finalize o questionário para ver os resultados aqui.</Text> : null}
      {/* [integração] atalho pra começar (ou continuar) a avaliação */}
      {results.length === 0 && onStartAssessment ? <FgrcButton label="Fazer uma avaliação" onPress={onStartAssessment} /> : null}
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
            {/* [integração 25/11] antes aparecia "1 pontos de atenção" quando só tinha um */}
            <Text style={styles.points}>{contagem(r.attentionPoints.length, 'ponto de atenção', 'pontos de atenção')}</Text>
            <Text style={styles.link}>Ver detalhes</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// [integração] os estilos viraram uma função pra receber as cores do tema que ta ativo
const criarEstilos = (colors: CoresP05) => StyleSheet.create({
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
