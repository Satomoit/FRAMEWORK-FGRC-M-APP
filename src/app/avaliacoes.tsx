import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AvaliacoesScreen from '@/features/p03-avaliacoes-questionario/AvaliacoesScreen';
import QuestionarioScreen from '@/features/p03-avaliacoes-questionario/QuestionarioScreen';
import { TODAS_QUESTOES_FGRC } from '@/features/p03-avaliacoes-questionario/questionarioData';
import { finalizarAvaliacao } from '@/lib/avaliacoes-reais';

// esse rascunho é local (não manda as respostas pra prefeitura nem pro Supabase)
const CHAVE_RASCUNHO = 'fgrcm:p03:rascunho-local-v1';
const idsValidos = new Set(TODAS_QUESTOES_FGRC.map(q => q.id));

type Respostas = Record<string, number>;

export default function Avaliacoes() {
  const router = useRouter();
  const [tela, setTela] = useState<'lista' | 'questionario'>('lista');
  const [respostas, setRespostas] = useState<Respostas>({});
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    let ativo = true;
    // quando abre, tenta recuperar o que vc respondeu antes
    AsyncStorage.getItem(CHAVE_RASCUNHO)
      .then(texto => {
        if (!ativo || !texto) return;
        try {
          const dados: unknown = JSON.parse(texto);
          // ignora entradas estranhas e aceita só questões válidas com notas de 0 a 4
          if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return;
          const validos = Object.entries(dados).filter(
            ([id, valor]) => idsValidos.has(id) && typeof valor === 'number' && Number.isInteger(valor) && valor >= 0 && valor <= 4
          );
          setRespostas(Object.fromEntries(validos));
        } catch {
          setAviso('Não consegui ler o rascunho antigo, então vou começar sem respostas');
        }
      })
      .catch(() => { if (ativo) setAviso('Não consegui recuperar o rascunho deste aparelho'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (carregando) return;
    // quando muda uma resposta guarda no armazenamento local automaticamente
    AsyncStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(respostas)).catch(() => {
      setAviso('Não consegui salvar as respostas neste aparelho');
    });
  }, [respostas, carregando]);

  if (carregando) {
    return <View style={styles.carregando}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.raiz}>
      <Text style={styles.aviso}>
Avaliação em andamento: as respostas são salvas neste aparelho; ao finalizar, os resultados e o PDF serão calculados a partir delas
      </Text>
      {aviso ? <Text style={styles.alerta}>{aviso}</Text> : null}
      {tela === 'lista' ? (
        <AvaliacoesScreen
          respostas={respostas}
          onIniciarNova={() => {
            // começar de novo limpa as respostas da avaliação anterior
            setRespostas({});
            setAviso('');
            setTela('questionario');
          }}
          onContinuar={() => setTela('questionario')}
        />
      ) : (
        <QuestionarioScreen
          respostas={respostas}
          onResponder={(id, valor) => setRespostas(atuais => ({ ...atuais, [id]: valor }))}
          onSalvarESair={() => setTela('lista')}
          onFinalizarAvaliacao={async () => {
            // a finalização só dá certo se todas as respostas forem gravadas no histórico
            try {
              await finalizarAvaliacao(respostas);
              await AsyncStorage.removeItem(CHAVE_RASCUNHO);
              setRespostas({});
              setAviso('Avaliação salva! O resultado e o PDF estão disponíveis nas abas correspondentes.');
            } catch (error) {
              setAviso('Falha ao salvar a avaliação. As respostas continuam no rascunho.');
              // devolve o erro pra P03 não anunciar conclusão sem salvar de verdade
              throw error;
            }
          }}
          onVoltarHome={() => router.replace('/')}
          onVerResultados={() => router.push('/resultados-revisao')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#F4F7FC' },
  carregando: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  aviso: { fontSize: 12, padding: 12, backgroundColor: '#E8F0F8', color: '#17395B' },
  alerta: { fontSize: 12, paddingHorizontal: 12, color: '#8B2C19' },
});
