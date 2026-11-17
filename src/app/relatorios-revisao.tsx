// a P06 continua com as telas da Aline, mas os dados agora vêm da avaliação que vc terminou
import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RelatoriosScreen } from '@/features/p06-relatorios-recomendacoes/RelatoriosScreen';
import { RecomendacoesScreen } from '@/features/p06-relatorios-recomendacoes/RecomendacoesScreen';
import type { Recommendation, Report } from '@/features/p06-relatorios-recomendacoes/types';
import { listarAvaliacoes, type AvaliacaoRegistrada } from '@/lib/avaliacoes-reais';
import { paraRelatorio, recomendacoesDaAvaliacao } from '@/lib/calcular-relatorio';

export default function RelatoriosRevisao() {
  const { avaliacaoId } = useLocalSearchParams<{ avaliacaoId?: string }>();
  const [registros, setRegistros] = useState<AvaliacaoRegistrada[]>([]);
  const [selecionado, setSelecionado] = useState<Report | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    listarAvaliacoes().then(lista => {
      if (!ativo) return;
      setRegistros(lista);
      // se veio pela tela de detalhes já abre as recomendações desse relatório
      if (avaliacaoId) {
        const encontrado = lista.find(a => a.id === avaliacaoId);
        setSelecionado(encontrado ? paraRelatorio(encontrado) : null);
      }
    }).catch(() => { if (ativo) setErro('Não foi possível abrir o histórico de relatórios'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [avaliacaoId]));

  const paraRecomendacoes = (report: Report): Recommendation[] => {
    const registro = registros.find(a => a.id === report.id);
    return registro ? recomendacoesDaAvaliacao(registro) : [];
  };

  if (carregando) return <ActivityIndicator size="large" style={styles.raiz} />;
  return <View style={styles.raiz}>
    {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    {selecionado ? (
      <RecomendacoesScreen
        report={selecionado}
        recommendations={paraRecomendacoes(selecionado)}
        onBack={() => setSelecionado(null)}
      />
    ) : (
      <RelatoriosScreen
        reports={registros.map(paraRelatorio)}
        recommendationsFor={paraRecomendacoes}
        onOpenReport={setSelecionado}
      />
    )}
  </View>;
}
const styles = StyleSheet.create({ raiz: { flex: 1 }, erro: { color: '#B42318', padding: 12 } });
