// essa rota usa os resultados que saíram do questionário real, não do mockData.ts
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ResultadosScreen } from '@/features/p05-resultados-detalhamento/ResultadosScreen';
import { DetalhesResultadoScreen } from '@/features/p05-resultados-detalhamento/DetalhesResultadoScreen';
import type { AssessmentResult } from '@/features/p05-resultados-detalhamento/types';
import { listarAvaliacoes } from '@/lib/avaliacoes-reais';
import { paraResultado } from '@/lib/calcular-relatorio';

export default function ResultadosRevisao() {
  const router = useRouter();
  const [resultados, setResultados] = useState<AssessmentResult[]>([]);
  const [selecionado, setSelecionado] = useState<AssessmentResult | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useFocusEffect(useCallback(() => {
    let ativo = true;
    // atualiza o histórico toda vez que vc entra nessa aba
    listarAvaliacoes().then(lista => {
      if (ativo) setResultados(lista.map(paraResultado));
    }).catch(() => { if (ativo) setErro('Não foi possível carregar as avaliações salvas'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []));

  if (carregando) return <ActivityIndicator size="large" style={styles.raiz} />;
  return <View style={styles.raiz}>
    {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    {selecionado ? (
      <DetalhesResultadoScreen
        result={selecionado}
        onBack={() => setSelecionado(null)}
        onOpenReport={(item) => router.push(`/relatorios-revisao?avaliacaoId=${encodeURIComponent(item.id)}` as Href)}
      />
    ) : <ResultadosScreen results={resultados} onOpenDetails={setSelecionado} />}
  </View>;
}
const styles = StyleSheet.create({ raiz: { flex: 1 }, erro: { padding: 12, color: '#B42318' } });
