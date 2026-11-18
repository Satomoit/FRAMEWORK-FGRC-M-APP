// [integração] área da administração (só aparece pra quem é admin)
// aqui a administração vê os pedidos de acesso e as mensagens de suporte
//   * Aprovar com senha provisória = a função "aprovar-pedido" (no servidor do Supabase) cria a conta
//     e devolve uma senha provisória sorteada. A administração passa pra pessoa (telefone, ofício...)
//     e no primeiro acesso o app obriga a trocar. Não precisa de e-mail configurado
//   * Aprovar e enviar código = a mesma função convida por e-mail (o Supabase cria o código sozinho,
//     ninguém escolhe). Só funciona com o envio de e-mail (SMTP) configurado no Supabase
//   * Recusar = marca o pedido como recusado, com o motivo
// segurança: esconder o botão não protege nada sozinho. Quem protege são as regras (RLS)
// do arquivo supabase/fgrcm-admin.sql e a conferência de admin dentro da função
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice, Page } from '@/components/fgrc-ui';
import { eAdmin } from '@/lib/conta';
import { supabase } from '@/lib/supabase';

type Pedido = {
  id: string;
  nome: string;
  email: string;
  prefeitura: string;
  municipio: string;
  estado: string;
  criado_em: string;
};

type MensagemSuporte = {
  id: string;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  criado_em: string;
};

const dataCurta = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function Admin() {
  const router = useRouter();
  const { colors } = useFgrcTheme();
  const [situacao, setSituacao] = useState<'carregando' | 'negado' | 'ok'>('carregando');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mensagens, setMensagens] = useState<MensagemSuporte[]>([]);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  // qual pedido ta com a caixinha de motivo aberta (pra recusar)
  const [recusando, setRecusando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState<string | null>(null);
  // senha provisória que acabou de ser criada (aparece uma vez só, pra administração anotar)
  const [senhaCriada, setSenhaCriada] = useState<{ email: string; senha: string } | null>(null);

  // busca tudo de novo (quando abre a tela e depois de cada ação)
  const carregar = useCallback(async () => {
    // getUser confere no servidor (não confia só no que ta salvo no aparelho)
    const { data } = await supabase.auth.getUser();
    if (!eAdmin(data.user)) { setSituacao('negado'); return; }

    const [p, m] = await Promise.all([
      supabase.from('access_requests')
        .select('id, nome, email, prefeitura, municipio, estado, criado_em')
        .eq('status', 'pendente').order('criado_em', { ascending: true }),
      supabase.from('support_requests')
        .select('id, nome, email, assunto, mensagem, criado_em')
        .eq('status', 'aberto').order('criado_em', { ascending: true }),
    ]);
    if (p.error || m.error) {
      setAviso({ texto: 'Não foi possível carregar. Confira se os arquivos SQL foram rodados no Supabase.', tipo: 'error' });
    }
    setPedidos((p.data ?? []) as Pedido[]);
    setMensagens((m.data ?? []) as MensagemSuporte[]);
    setSituacao('ok');
  }, []);

  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  // chama a função do servidor (aprovar manda o convite com o código por e-mail)
  async function decidir(pedido: Pedido, acao: 'aprovar' | 'recusar', modo: 'senha' | 'convite' = 'senha') {
    if (ocupado) return;
    setOcupado(pedido.id);
    setAviso(null);
    setSenhaCriada(null);
    try {
      const { data, error } = await supabase.functions.invoke('aprovar-pedido', {
        body: { pedidoId: pedido.id, acao, modo, observacao: acao === 'recusar' ? motivo.trim() || null : null },
      });
      if (error) {
        // tenta ler a mensagem que a função mandou (ex: "Esse e-mail já tem conta")
        let texto = 'Não foi possível concluir. Confira se a função aprovar-pedido foi publicada no Supabase.';
        try {
          const corpo = await (error as { context?: Response }).context?.json();
          if (corpo?.erro) texto = corpo.erro;
        } catch { /* fica a mensagem padrão */ }
        setAviso({ texto, tipo: 'error' });
        return;
      }
      setAviso({ texto: data?.mensagem ?? 'Pronto.', tipo: 'success' });
      if (data?.senhaProvisoria) setSenhaCriada({ email: pedido.email, senha: data.senhaProvisoria });
      setRecusando(null);
      setMotivo('');
      await carregar();
    } catch {
      setAviso({ texto: 'Sem conexão. Verifique a internet e tente de novo.', tipo: 'error' });
    } finally {
      setOcupado(null);
    }
  }

  // marca a mensagem de suporte como respondida (a resposta em si vai pelo e-mail da equipe)
  async function marcarRespondida(id: string) {
    setOcupado(id);
    const { error } = await supabase.from('support_requests')
      .update({ status: 'respondido', respondido_em: new Date().toISOString() }).eq('id', id);
    setOcupado(null);
    if (error) setAviso({ texto: 'Não foi possível atualizar a mensagem.', tipo: 'error' });
    else await carregar();
  }

  if (situacao === 'carregando') {
    return <View style={[styles.centro, { backgroundColor: colors.background }]}><ActivityIndicator size="large" /></View>;
  }

  if (situacao === 'negado') {
    return (
      <Page title="Administração" onBack={() => router.back()}>
        <Notice message="Esta área é só para a administração do FGRC-M." kind="error" />
      </Page>
    );
  }

  const cartao = [styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }];

  return (
    <Page title="Administração" subtitle="Pedidos de acesso e mensagens de suporte." onBack={() => router.back()}>
      {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
      {/* a senha provisória aparece só agora: anote e passe pra pessoa por um canal seguro */}
      {senhaCriada ? (
        <View style={[styles.cartao, { backgroundColor: colors.infoBackground, borderColor: colors.blue }]}>
          <Text style={[styles.nome, { color: colors.text }]}>Senha provisória de {senhaCriada.email}</Text>
          <Text selectable style={[styles.senha, { color: colors.text }]}>{senhaCriada.senha}</Text>
          <Text style={{ color: colors.muted }}>
            Anote agora: ela não aparece de novo. Passe para a pessoa por telefone ou pessoalmente (não mande junto com o e-mail).
            No primeiro acesso o app pede para ela criar uma senha nova.
          </Text>
          <Pressable accessibilityRole="button" onPress={() => setSenhaCriada(null)}>
            <Text style={[styles.link, { color: colors.blue }]}>Já anotei</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={[styles.secao, { color: colors.text }]}>Pedidos de acesso ({pedidos.length})</Text>
      {pedidos.length === 0 ? <Text style={{ color: colors.muted }}>Nenhum pedido esperando análise.</Text> : null}
      {pedidos.map(p => (
        <View key={p.id} style={cartao}>
          <Text style={[styles.nome, { color: colors.text }]}>{p.nome}</Text>
          <Text style={{ color: colors.text }}>{p.email}</Text>
          <Text style={{ color: colors.muted }}>{p.prefeitura} - {p.municipio}/{p.estado}</Text>
          <Text style={[styles.data, { color: colors.muted }]}>Pedido em {dataCurta(p.criado_em)}</Text>

          {recusando === p.id ? (
            <>
              <TextInput
                accessibilityLabel="Motivo da recusa"
                placeholder="Motivo (opcional)"
                placeholderTextColor={colors.muted}
                value={motivo}
                onChangeText={setMotivo}
                style={[styles.motivo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
              />
              <FgrcButton label={ocupado === p.id ? 'Aguarde...' : 'Confirmar recusa'} variant="danger" disabled={!!ocupado} onPress={() => { void decidir(p, 'recusar'); }} />
              <Pressable accessibilityRole="button" onPress={() => { setRecusando(null); setMotivo(''); }}>
                <Text style={[styles.link, { color: colors.blue }]}>Cancelar</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.acoes}>
              <FgrcButton label={ocupado === p.id ? 'Aguarde...' : 'Aprovar com senha provisória'} disabled={!!ocupado} onPress={() => { void decidir(p, 'aprovar', 'senha'); }} />
              <FgrcButton label="Aprovar e enviar código por e-mail" variant="outlined" disabled={!!ocupado} onPress={() => { void decidir(p, 'aprovar', 'convite'); }} />
              <FgrcButton label="Recusar" variant="danger" disabled={!!ocupado} onPress={() => { setRecusando(p.id); setMotivo(''); }} />
            </View>
          )}
        </View>
      ))}

      <Text style={[styles.secao, { color: colors.text }]}>Mensagens de suporte ({mensagens.length})</Text>
      {mensagens.length === 0 ? <Text style={{ color: colors.muted }}>Nenhuma mensagem aberta.</Text> : null}
      {mensagens.map(m => (
        <View key={m.id} style={cartao}>
          <Text style={[styles.nome, { color: colors.text }]}>{m.assunto}</Text>
          <Text style={{ color: colors.text }}>{m.nome} ({m.email})</Text>
          <Text style={[styles.data, { color: colors.muted }]}>Enviada em {dataCurta(m.criado_em)}</Text>
          <Text style={[styles.texto, { color: colors.text }]}>{m.mensagem}</Text>
          <Text style={[styles.data, { color: colors.muted }]}>Responda pelo e-mail da equipe e depois marque aqui.</Text>
          <FgrcButton label={ocupado === m.id ? 'Aguarde...' : 'Marcar como respondida'} variant="outlined" disabled={!!ocupado} onPress={() => { void marcarRespondida(m.id); }} />
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  secao: { fontSize: 19, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  cartao: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12, gap: 3 },
  nome: { fontSize: 16, fontWeight: '700' },
  data: { fontSize: 13, marginTop: 2 },
  texto: { fontSize: 15, lineHeight: 21, marginVertical: 8 },
  acoes: { gap: 8, marginTop: 10 },
  senha: { fontSize: 26, fontWeight: '800', letterSpacing: 1, marginVertical: 8 },
  motivo: { borderWidth: 1, borderRadius: 10, padding: 10, marginVertical: 8, fontSize: 15 },
  link: { textAlign: 'center', fontWeight: '600', marginTop: 8 },
});
