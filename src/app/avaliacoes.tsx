// [integração] rota /avaliacoes: junta as telas da P03 (lista + questionário)
// aqui fica a parte "invisível": guardar o rascunho no aparelho, recuperar quando volta
// e, no fim, salvar a avaliação completa no histórico (src/lib/avaliacoes-reais.ts)
// nada disso vai pro Supabase: as respostas ficam só no aparelho (requisito RNF-001/RNF-002)
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import AvaliacoesScreen from '@/features/p03-avaliacoes-questionario/AvaliacoesScreen';
import QuestionarioScreen from '@/features/p03-avaliacoes-questionario/QuestionarioScreen';
import { finalizarAvaliacao } from '@/lib/avaliacoes-reais';
import { prefeituraDaSessao } from '@/lib/conta';
// esse rascunho é local e separado por conta (não manda as respostas pra prefeitura nem pro Supabase)
import { lerRascunho, limparRascunho, salvarRascunho, type Respostas } from '@/lib/armazenamento-local';

export default function Avaliacoes() {
  const router = useRouter();
  // [integração] cores do tema (o aviso de cima era sempre claro, até no modo escuro)
  const { colors } = useFgrcTheme();
  const [tela, setTela] = useState<'lista' | 'questionario'>('lista');
  const [respostas, setRespostas] = useState<Respostas>({});
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    let ativo = true;
    // quando abre, tenta recuperar o que vc respondeu antes (só da conta que ta logada)
    // a validação das notas (0 a 4, só perguntas que existem) fica no armazenamento-local.ts
    lerRascunho()
      .then(({ respostas: salvas, danificado }) => {
        if (!ativo) return;
        if (danificado) setAviso('Não consegui ler o rascunho antigo, então vou começar sem respostas');
        else setRespostas(salvas);
      })
      .catch(() => { if (ativo) setAviso('Não consegui recuperar o rascunho deste aparelho'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (carregando) return;
    // quando muda uma resposta guarda no armazenamento local automaticamente
    salvarRascunho(respostas).catch(() => {
      setAviso('Não consegui salvar as respostas neste aparelho');
    });
  }, [respostas, carregando]);

  if (carregando) {
    return <View style={[styles.carregando, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.blue} /></View>;
  }

  return (
    <View style={[styles.raiz, { backgroundColor: colors.background }]}>
      <Text style={[styles.aviso, { backgroundColor: colors.infoBackground, color: colors.text }]}>
Avaliação em andamento: as respostas são salvas neste aparelho; ao finalizar, os resultados e o PDF serão calculados a partir delas
      </Text>
      {aviso ? <Text style={[styles.alerta, { color: colors.error }]}>{aviso}</Text> : null}
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
              // [integração RF-003] grava a prefeitura da conta junto (só no aparelho, igual as respostas)
              // se não conseguir ler, finaliza do mesmo jeito, só sem a prefeitura
              const prefeitura = await prefeituraDaSessao().catch(() => null);
              await finalizarAvaliacao(respostas, prefeitura);
              await limparRascunho();
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
