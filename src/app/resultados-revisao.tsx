// essa rota usa os resultados que saíram do questionário real, não do mockData.ts
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ResultadosScreen } from '@/features/p05-resultados-detalhamento/ResultadosScreen';
import { DetalhesResultadoScreen } from '@/features/p05-resultados-detalhamento/DetalhesResultadoScreen';
import type { AssessmentResult } from '@/features/p05-resultados-detalhamento/types';
import { listarAvaliacoes } from '@/lib/avaliacoes-reais';
import { paraResultado } from '@/lib/calcular-relatorio';
import { trazerDadosAntigosParaConta, verificarDadosAntigos } from '@/lib/armazenamento-local';
import { useFgrcTheme } from '@/components/fgrc-colors';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

export default function ResultadosRevisao() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  // [integração] cores do tema (antes o aviso e o erro eram sempre claros, até no modo escuro)
  const { colors } = useFgrcTheme();
  const [resultados, setResultados] = useState<AssessmentResult[]>([]);
  const [selecionado, setSelecionado] = useState<AssessmentResult | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  // [integração] avaliações feitas antes da separação por conta (ficam sem dono até alguém confirmar)
  const [antigas, setAntigas] = useState(0);
  const [trazendo, setTrazendo] = useState(false);

  // busca o histórico da conta e confere se sobrou coisa antiga no aparelho
  const carregar = useCallback(async () => {
    const [lista, sobra] = await Promise.all([listarAvaliacoes(), verificarDadosAntigos()]);
    setResultados(lista.map(paraResultado));
    setAntigas(sobra.avaliacoes);
  }, []);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    // atualiza o histórico toda vez que vc entra nessa aba
    carregar()
      .catch(() => { if (ativo) setErro('Não foi possível carregar as avaliações salvas'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [carregar]));

  // a pessoa confirmou que as avaliações antigas são dela: traz pra conta e recarrega
  async function trazerAntigas() {
    setTrazendo(true);
    try {
      await trazerDadosAntigosParaConta();
      await carregar();
    } catch {
      setErro('Não foi possível trazer as avaliações antigas. Tente de novo.');
    } finally {
      setTrazendo(false);
    }
  }

  if (carregando) return <ActivityIndicator size="large" color={colors.blue} style={[styles.raiz, { backgroundColor: colors.background }]} />;
  return <View style={[styles.raiz, { backgroundColor: colors.background }]}>
    {erro ? <Text style={[styles.erro, { color: colors.error }]}>{erro}</Text> : null}
    {/* [integração] só aparece se tiver avaliação de antes da separação por conta neste aparelho */}
    {antigas > 0 && !selecionado ? (
      <View style={[styles.antigas, { backgroundColor: colors.infoBackground }]}>
        <Text style={[styles.antigasTexto, { color: colors.text }]}>
          Encontramos {antigas} {antigas === 1 ? 'avaliação feita' : 'avaliações feitas'} neste aparelho antes da separação por conta.
          Se foi você quem fez, toque abaixo para trazer para a sua conta.
        </Text>
        <Pressable accessibilityRole="button" disabled={trazendo} onPress={() => { void trazerAntigas(); }}>
          <Text style={[styles.antigasBotao, { color: colors.blue }]}>{trazendo ? 'Trazendo...' : 'Trazer para a minha conta'}</Text>
        </Pressable>
      </View>
    ) : null}
    {selecionado ? (
      <DetalhesResultadoScreen
        result={selecionado}
        onBack={() => setSelecionado(null)}
        onOpenReport={(item) => router.push(`/relatorios-revisao?avaliacaoId=${encodeURIComponent(item.id)}` as Href)}
      />
    ) : (
      <ResultadosScreen
        results={resultados}
        onOpenDetails={setSelecionado}
        // [integração] sem resultado ainda: botão "Fazer uma avaliação" leva pra aba Avaliações
        onStartAssessment={() => router.push('/avaliacoes' as Href)}
      />
    )}
  </View>;
}
const estilosBase = StyleSheet.create({
  raiz: { flex: 1 },
  erro: { padding: 12, color: '#B42318' },
  antigas: { margin: 12, padding: 12, borderRadius: 12, backgroundColor: '#E8F0F8', gap: 8 },
  antigasTexto: { fontSize: 14, lineHeight: 20, color: '#17395B' },
  antigasBotao: { fontSize: 15, fontWeight: '700', color: '#10558D' },
});
