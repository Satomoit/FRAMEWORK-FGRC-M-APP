// [integração] aba "Mensagens de suporte" da administração
// mostra as mensagens que as prefeituras mandaram pela tela Falar com o suporte
// a administração abre a mensagem, marca "em atendimento" ou "resolvida" e vê o histórico de mudanças
// [suporte] agora dá pra RESPONDER pelo painel: a resposta fica gravada no Supabase e a pessoa lê em Meus chamados
// (só pra mensagens enviadas com login; quem mandou sem login continua recebendo a resposta por e-mail)
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
// [integração B11] link de e-mail com corpo preenchido (sem o "undefined" do Gmail)
import { linkDeRespostaPorEmail } from '@/lib/email-resposta-suporte';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import {
  NOME_STATUS_SUPORTE,
  historicoDoRegistro,
  listarMensagens,
  listarRespostas,
  mudarStatusMensagem,
  responderChamado,
  type MensagemSuporte,
  type RegistroHistorico,
  type RespostaSuporte,
  type StatusSuporte,
} from '@/lib/admin';
import { CampoBusca, Cartao, Etiqueta, Filtros, Linha, TextoVazio, combinaBusca, dataHora } from './ui-admin';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

type Filtro = StatusSuporte | 'todos';

const tomDoStatus = (s: StatusSuporte) => (s === 'resolvido' ? 'bom' : s === 'em_atendimento' ? 'neutro' : 'alerta');

export default function AbaSuporte() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const [mensagens, setMensagens] = useState<MensagemSuporte[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('aberto');
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState<MensagemSuporte | null>(null);
  const [historico, setHistorico] = useState<RegistroHistorico[]>([]);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  // [suporte] respostas já enviadas pelo painel e o texto que ta sendo escrito
  const [respostas, setRespostas] = useState<RespostaSuporte[]>([]);
  const [textoResposta, setTextoResposta] = useState('');

  const carregar = useCallback(async () => {
    try {
      const lista = await listarMensagens();
      setMensagens(lista);
      return lista;
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const visiveis = useMemo(() => mensagens.filter(m =>
    (filtro === 'todos' || m.status === filtro) &&
    combinaBusca(busca, m.nome, m.email, m.assunto, m.mensagem)), [mensagens, filtro, busca]);

  async function abrir(m: MensagemSuporte) {
    setAberta(m);
    setHistorico([]);
    setRespostas([]);
    try { setHistorico(await historicoDoRegistro(m.id)); } catch { /* sem histórico a tela continua */ }
    try { setRespostas(await listarRespostas(m.id)); } catch { /* sem respostas a tela continua */ }
  }

  // [suporte] grava a resposta no Supabase (a pessoa vê em Meus chamados)
  async function responder() {
    if (!aberta || ocupado) return;
    setOcupado(true);
    setAviso(null);
    try {
      await responderChamado(aberta.id, textoResposta);
      setTextoResposta('');
      setAviso({ texto: 'Resposta enviada. A pessoa vê a resposta em Mais > Meus chamados.', tipo: 'success' });
      // recarrega: o banco pode ter mudado o status pra "em atendimento" e gravado no histórico
      const lista = await carregar();
      const atual = lista?.find(m => m.id === aberta.id);
      if (atual) await abrir(atual);
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setOcupado(false);
    }
  }

  async function mudar(status: StatusSuporte) {
    if (!aberta || ocupado) return;
    setOcupado(true);
    setAviso(null);
    try {
      await mudarStatusMensagem(aberta.id, status);
      setAviso({ texto: `Mensagem marcada como "${NOME_STATUS_SUPORTE[status]}".`, tipo: 'success' });
      // recarrega pra pegar quem atendeu e o horário que o banco gravou
      const lista = await carregar();
      const atual = lista?.find(m => m.id === aberta.id);
      if (atual) await abrir(atual);
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setOcupado(false);
    }
  }

  if (carregando) return <ActivityIndicator size="large" style={styles.carregando} />;

  if (aberta) {
    // abre o programa de e-mail do aparelho já com o endereço e o assunto preenchidos
    const responderPorEmail = () => {
      // [integração B11] agora vai com saudação e a mensagem original no corpo (antes o Gmail mostrava "undefined")
      void Linking.openURL(linkDeRespostaPorEmail(aberta));
    };
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={() => { setAberta(null); setTextoResposta(''); }}>
          <Text style={[styles.link, { color: colors.blue }]}>← Voltar para a lista</Text>
        </Pressable>
        {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
        <Cartao>
          <Etiqueta texto={NOME_STATUS_SUPORTE[aberta.status]} tom={tomDoStatus(aberta.status)} />
          <Linha rotulo="Assunto" valor={aberta.assunto} />
          <Linha rotulo="Nome" valor={aberta.nome} />
          <Linha rotulo="E-mail para resposta" valor={aberta.email} />
          <Linha rotulo="Enviada em" valor={dataHora(aberta.criado_em)} />
          <Linha rotulo="Enviada por" valor={aberta.user_id ? 'pessoa com conta no app' : 'pessoa sem login (tela de entrada)'} />
          <Text style={[styles.rotulo, { color: colors.muted }]}>Mensagem</Text>
          <Text selectable style={[styles.mensagem, { color: colors.text }]}>{aberta.mensagem}</Text>
          {aberta.atendido_por_email ? <Linha rotulo="Último atendimento por" valor={aberta.atendido_por_email} /> : null}
        </Cartao>

        {/* [suporte] responder pelo painel (só faz sentido se a pessoa mandou com login) */}
        <Text style={[styles.titulo, { color: colors.text }]}>Respostas da equipe</Text>
        {respostas.length === 0 ? <TextoVazio>Nenhuma resposta enviada pelo painel ainda.</TextoVazio> : null}
        {respostas.map(r => (
          <View key={r.id} style={[styles.resposta, { borderColor: colors.blue }]}>
            <Text style={{ color: colors.muted }}>{dataHora(r.criado_em)} · {r.autor_email ?? 'administração'}</Text>
            <Text selectable style={[styles.mensagem, { color: colors.text }]}>{r.texto}</Text>
          </View>
        ))}
        {aberta.user_id ? (
          <View style={styles.acoes}>
            <TextInput
              accessibilityLabel="Escrever resposta"
              multiline
              maxLength={2000}
              value={textoResposta}
              onChangeText={setTextoResposta}
              placeholder="Escreva a resposta para a pessoa..."
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
              style={[styles.campo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
            />
            <FgrcButton
              label={ocupado ? 'Aguarde...' : 'Enviar resposta'}
              disabled={ocupado || textoResposta.trim().length < 2}
              onPress={() => { void responder(); }}
            />
            <Text style={[styles.rotulo, { color: colors.muted }]}>
              A resposta fica salva aqui e aparece para a pessoa em Mais &gt; Meus chamados. Nenhum e-mail é enviado.
            </Text>
          </View>
        ) : (
          <Text style={[styles.rotulo, { color: colors.muted }]}>
            Essa mensagem foi enviada sem login (pela tela de entrada), então a pessoa não consegue ver respostas no app.
            Responda pelo e-mail informado.
          </Text>
        )}

        <View style={styles.acoes}>
          {/* abre o programa de e-mail DESTE aparelho (Gmail, Outlook...) com o endereço preenchido
              o app não manda esse e-mail sozinho e ele não fica registrado aqui */}
          <FgrcButton label="Responder por e-mail (abre seu programa de e-mail)" variant="outlined" icon="mail-outline" onPress={responderPorEmail} />
          {aberta.status !== 'em_atendimento' ? (
            <FgrcButton label={ocupado ? 'Aguarde...' : 'Marcar como em atendimento'} icon="hourglass-outline" disabled={ocupado} onPress={() => { void mudar('em_atendimento'); }} />
          ) : null}
          {aberta.status !== 'resolvido' ? (
            <FgrcButton label={ocupado ? 'Aguarde...' : 'Marcar como resolvida'} variant="success" icon="checkmark-done-outline" disabled={ocupado} onPress={() => { void mudar('resolvido'); }} />
          ) : (
            <FgrcButton label="Reabrir mensagem" variant="outlined" icon="arrow-undo-outline" disabled={ocupado} onPress={() => { void mudar('aberto'); }} />
          )}
        </View>

        <Text style={[styles.titulo, { color: colors.text }]}>Histórico</Text>
        {historico.length === 0 ? <TextoVazio>Nenhuma mudança registrada ainda.</TextoVazio> : null}
        {historico.map(h => (
          <Text key={h.id} style={[styles.historico, { color: colors.text }]}>
            {h.acao === 'suporte_resposta'
              ? `${dataHora(h.criado_em)}: resposta enviada pelo painel (${h.admin_email ?? 'administração'})`
              : `${dataHora(h.criado_em)}: ${NOME_STATUS_SUPORTE[h.de as StatusSuporte] ?? h.de ?? '—'} → ${NOME_STATUS_SUPORTE[h.para as StatusSuporte] ?? h.para ?? '—'} (${h.admin_email ?? 'administração'})`}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View>
      {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
      <Filtros<Filtro>
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: 'aberto', rotulo: `Aguardando (${mensagens.filter(m => m.status === 'aberto').length})` },
          { valor: 'em_atendimento', rotulo: 'Em atendimento' },
          { valor: 'resolvido', rotulo: 'Resolvidas' },
          { valor: 'todos', rotulo: 'Todas' },
        ]}
      />
      <CampoBusca valor={busca} onChange={setBusca} dica="Pesquisar por nome, e-mail ou texto da mensagem" />
      <Pressable accessibilityRole="button" onPress={() => { setCarregando(true); void carregar(); }}>
        <Text style={[styles.link, { color: colors.blue }]}>Atualizar</Text>
      </Pressable>

      {visiveis.length === 0 ? <TextoVazio>Nenhuma mensagem encontrada com esse filtro.</TextoVazio> : null}
      {visiveis.map(m => (
        <Cartao key={m.id} onPress={() => { void abrir(m); }} rotulo={`Mensagem de ${m.nome}`}>
          <Etiqueta texto={NOME_STATUS_SUPORTE[m.status]} tom={tomDoStatus(m.status)} />
          <Text style={[styles.titulo, { color: colors.text }]}>{m.assunto}</Text>
          <Text style={{ color: colors.text }}>{m.nome} ({m.email})</Text>
          <Text numberOfLines={2} style={{ color: colors.muted }}>{m.mensagem}</Text>
          <Text style={{ color: colors.muted }}>Enviada em {dataHora(m.criado_em)}</Text>
        </Cartao>
      ))}
    </View>
  );
}

const estilosBase = StyleSheet.create({
  carregando: { marginTop: 30 },
  titulo: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  link: { fontSize: 15, fontWeight: '600', marginVertical: 8 },
  acoes: { gap: 8, marginBottom: 14 },
  rotulo: { fontSize: 13 },
  mensagem: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  historico: { fontSize: 14, marginBottom: 4 },
  resposta: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 10 },
  campo: { minHeight: 110, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 15 },
});
