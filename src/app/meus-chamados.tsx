// [suporte] tela "Meus chamados" (abre pelo Mais e depois de mandar uma mensagem no suporte)
// mostra só os chamados de quem ta logado, com as respostas que a equipe escreveu no painel
// não existe no protótipo: foi pedida depois do teste no Android ("não consigo acompanhar o suporte")
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice, OrangeLink, Page } from '@/components/fgrc-ui';
import { NOME_STATUS_CHAMADO, listarMeusChamados, protocoloDo, type Chamado, type StatusChamado } from '@/lib/chamados';
import { dataHoraDa } from '@/lib/datas';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

export default function MeusChamados() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  const { colors } = useFgrcTheme();
  const [chamados, setChamados] = useState<Chamado[] | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  // qual chamado ta aberto (mostrando mensagem, respostas e histórico)
  const [aberto, setAberto] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setChamados(await listarMeusChamados());
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar os seus chamados.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  // voltar funciona mesmo se a pessoa abriu essa página direto pelo endereço
  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/mais' as Href);
  }

  // cor da etiqueta de status (verde = resolvido, laranja = esperando a equipe)
  const corDoStatus = (s: StatusChamado) => (s === 'resolvido' ? colors.success : s === 'em_atendimento' ? colors.blue : colors.orange);

  return (
    <Page title="Meus chamados" subtitle="Acompanhe as mensagens que você enviou ao suporte." onBack={voltar}>
      <View style={styles.topo}>
        <FgrcButton label="Enviar nova mensagem" onPress={() => router.push('/suporte' as Href)} />
        <OrangeLink label={carregando ? 'Atualizando...' : 'Atualizar'} onPress={() => { void carregar(); }} />
      </View>

      {erro ? <Notice message={erro} kind="error" onClose={() => setErro('')} /> : null}
      {carregando && !chamados ? <ActivityIndicator size="large" color={colors.blue} style={styles.carregando} /> : null}

      {chamados && chamados.length === 0 ? (
        <Text style={[styles.vazio, { color: colors.muted }]}>
          Você ainda não tem chamados. Mensagens enviadas pela tela de entrada, sem estar com a conta aberta,
          não aparecem aqui: a resposta delas chega pelo e-mail informado.
        </Text>
      ) : null}

      {(chamados ?? []).map((c) => {
        const estaAberto = aberto === c.id;
        return (
          <View key={c.id} style={[styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: estaAberto }}
              accessibilityLabel={`Chamado ${protocoloDo(c.id)}, ${c.assunto}, ${NOME_STATUS_CHAMADO[c.status]}`}
              onPress={() => setAberto(estaAberto ? null : c.id)}
            >
              <View style={styles.linha}>
                <Text style={[styles.protocolo, { color: colors.muted }]}>{protocoloDo(c.id)}</Text>
                <Text style={[styles.status, { color: corDoStatus(c.status), borderColor: corDoStatus(c.status) }]}>
                  {NOME_STATUS_CHAMADO[c.status] ?? c.status}
                </Text>
              </View>
              <Text style={[styles.assunto, { color: colors.text }]}>{c.assunto}</Text>
              <Text style={[styles.data, { color: colors.muted }]}>Enviado em {dataHoraDa(c.criado_em)}</Text>
              {c.atualizado_em && c.atualizado_em !== c.criado_em ? (
                <Text style={[styles.data, { color: colors.muted }]}>Última atualização: {dataHoraDa(c.atualizado_em)}</Text>
              ) : null}
              <Text style={[styles.data, { color: colors.muted }]}>
                {c.respostas.length === 0 ? 'Sem resposta ainda' : c.respostas.length === 1 ? '1 resposta da equipe' : `${c.respostas.length} respostas da equipe`}
                {estaAberto ? ' · toque para fechar' : ' · toque para ver'}
              </Text>
            </Pressable>

            {estaAberto ? (
              <View style={styles.detalhes}>
                <Text style={[styles.rotulo, { color: colors.text }]}>Sua mensagem</Text>
                <Text selectable style={[styles.texto, { color: colors.text }]}>{c.mensagem}</Text>

                <Text style={[styles.rotulo, { color: colors.text }]}>Respostas da equipe</Text>
                {c.respostas.length === 0 ? (
                  <Text style={[styles.texto, { color: colors.muted }]}>A equipe ainda não respondeu. Volte aqui mais tarde.</Text>
                ) : null}
                {c.respostas.map((r, i) => (
                  <View key={`${c.id}-r${i}`} style={[styles.resposta, { borderColor: colors.blue, backgroundColor: colors.infoBackground }]}>
                    <Text style={[styles.data, { color: colors.muted }]}>Equipe FGRC-M · {dataHoraDa(r.criado_em)}</Text>
                    <Text selectable style={[styles.texto, { color: colors.text }]}>{r.texto}</Text>
                  </View>
                ))}

                {c.historico.length > 0 ? (
                  <>
                    <Text style={[styles.rotulo, { color: colors.text }]}>Histórico</Text>
                    <Text style={[styles.data, { color: colors.muted }]}>{dataHoraDa(c.criado_em)}: enviado</Text>
                    {c.historico.map((h, i) => (
                      <Text key={`${c.id}-h${i}`} style={[styles.data, { color: colors.muted }]}>
                        {dataHoraDa(h.em)}: {NOME_STATUS_CHAMADO[h.status as StatusChamado] ?? h.status ?? 'atualizado'}
                      </Text>
                    ))}
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </Page>
  );
}

const estilosBase = StyleSheet.create({
  topo: { gap: 4, marginBottom: 12 },
  carregando: { marginTop: 24 },
  vazio: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  cartao: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  protocolo: { fontSize: 13, fontWeight: '700' },
  status: { fontSize: 12, fontWeight: '700', borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  assunto: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  data: { fontSize: 13, marginTop: 2 },
  detalhes: { marginTop: 10, gap: 4 },
  rotulo: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  texto: { fontSize: 15, lineHeight: 22 },
  resposta: { borderLeftWidth: 3, borderRadius: 8, padding: 10, marginTop: 6 },
});
