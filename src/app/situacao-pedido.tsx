// [integração] "Status da solicitação" (aparece no Mapeamento de Funcionalidades do grupo)
// quem pediu acesso digita o e-mail do pedido e vê se ta em análise, aprovado ou recusado
// o banco (função situacao_do_pedido) devolve SÓ a situação, nenhum outro dado do pedido
// (assim ninguém descobre nome, prefeitura etc de outra pessoa digitando o e-mail dela)
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, FormField, Notice, Page } from '@/components/fgrc-ui';
import { formatoDeEmailValido } from '@/lib/email-institucional';
import { supabase } from '@/lib/supabase';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

type Situacao = 'pendente' | 'aprovado' | 'recusado' | 'nao_encontrado';

export default function SituacaoDoPedido() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  const { colors } = useFgrcTheme();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [situacao, setSituacao] = useState<Situacao | null>(null);

  async function consultar() {
    if (consultando) return;
    setErro('');
    setSituacao(null);
    const emailLimpo = email.trim().toLowerCase();
    if (!formatoDeEmailValido(emailLimpo)) {
      setErro('Digite o mesmo e-mail que você usou no pedido.');
      return;
    }
    setConsultando(true);
    try {
      const { data, error } = await supabase.rpc('situacao_do_pedido', { p_email: emailLimpo });
      if (error) {
        setErro('Não foi possível consultar agora. Tente de novo em alguns minutos.');
        return;
      }
      setSituacao(data === 'pendente' || data === 'aprovado' || data === 'recusado' ? data : 'nao_encontrado');
    } catch {
      setErro('Sem conexão. Verifique a internet e tente de novo.');
    } finally {
      setConsultando(false);
    }
  }

  return (
    <Page title="Situação do pedido" subtitle="Veja se o seu pedido de acesso já foi analisado." onBack={() => router.replace('/' as Href)}>
      <FormField label="E-mail usado no pedido" value={email} onChangeText={setEmail} email placeholder="nome@prefeitura.gov.br" />
      {erro ? <Notice kind="error" message={erro} onClose={() => setErro('')} /> : null}
      <FgrcButton label={consultando ? 'Consultando...' : 'Consultar'} disabled={consultando} onPress={() => { void consultar(); }} />

      {situacao ? (
        <View style={[styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLiveRegion="polite">
          {situacao === 'pendente' ? (
            <>
              <Text style={[styles.titulo, { color: colors.orange }]}>Em análise</Text>
              <Text style={[styles.texto, { color: colors.text }]}>
                A administração ainda não respondeu. Volte a consultar mais tarde.
              </Text>
            </>
          ) : null}
          {situacao === 'aprovado' ? (
            <>
              <Text style={[styles.titulo, { color: colors.success }]}>Aprovado</Text>
              <Text style={[styles.texto, { color: colors.text }]}>
                Seu acesso foi liberado. Se você recebeu uma senha provisória, entre pela tela de login.
                Se recebeu um código por e-mail, use Ativar acesso.
              </Text>
              <View style={styles.acoes}>
                {/* [entrada nova] o Login agora fica em /entrar */}
                <FgrcButton label="Ir para o login" onPress={() => router.replace('/entrar' as Href)} />
                <FgrcButton label="Ativar acesso com código" variant="outlined" onPress={() => router.push('/ativar-acesso' as Href)} />
              </View>
            </>
          ) : null}
          {situacao === 'recusado' ? (
            <>
              <Text style={[styles.titulo, { color: colors.error }]}>Recusado</Text>
              <Text style={[styles.texto, { color: colors.text }]}>
                O pedido não foi aprovado. Se você acha que foi um engano, fale com o suporte.
              </Text>
              <FgrcButton label="Falar com o suporte" variant="outlined" onPress={() => router.push('/suporte' as Href)} />
            </>
          ) : null}
          {situacao === 'nao_encontrado' ? (
            <>
              <Text style={[styles.titulo, { color: colors.text }]}>Nenhum pedido encontrado</Text>
              <Text style={[styles.texto, { color: colors.text }]}>
                Confira se o e-mail está igual ao do pedido. Se ainda não pediu acesso, faça o pedido.
              </Text>
              <FgrcButton label="Solicitar acesso" variant="outlined" onPress={() => router.push('/solicitar-acesso' as Href)} />
            </>
          ) : null}
        </View>
      ) : null}
    </Page>
  );
}

const estilosBase = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 16, gap: 6 },
  titulo: { fontSize: 18, fontWeight: '800' },
  texto: { fontSize: 15, lineHeight: 22, marginBottom: 6 },
  acoes: { gap: 8 },
});
