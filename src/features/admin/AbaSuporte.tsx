// [integração] aba "Mensagens de suporte" da administração
// mostra as mensagens que as prefeituras mandaram pela tela Falar com o suporte
// a administração abre a mensagem, marca "em atendimento" ou "resolvida" e vê o histórico de mudanças
// (a resposta em si é feita por e-mail, respondendo pro endereço que a pessoa informou)
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import {
  NOME_STATUS_SUPORTE,
  historicoDoRegistro,
  listarMensagens,
  mudarStatusMensagem,
  type MensagemSuporte,
  type RegistroHistorico,
  type StatusSuporte,
} from '@/lib/admin';
import { CampoBusca, Cartao, Etiqueta, Filtros, Linha, TextoVazio, combinaBusca, dataHora } from './ui-admin';

type Filtro = StatusSuporte | 'todos';

const tomDoStatus = (s: StatusSuporte) => (s === 'resolvido' ? 'bom' : s === 'em_atendimento' ? 'neutro' : 'alerta');

export default function AbaSuporte() {
  const { colors } = useFgrcTheme();
  const [mensagens, setMensagens] = useState<MensagemSuporte[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('aberto');
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState<MensagemSuporte | null>(null);
  const [historico, setHistorico] = useState<RegistroHistorico[]>([]);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  const [ocupado, setOcupado] = useState(false);

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
    try { setHistorico(await historicoDoRegistro(m.id)); } catch { /* sem histórico a tela continua */ }
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
    const responder = () => {
      const assunto = encodeURIComponent(`Re: ${aberta.assunto} (FGRC-M)`);
      void Linking.openURL(`mailto:${aberta.email}?subject=${assunto}`);
    };
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={() => setAberta(null)}>
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

        <View style={styles.acoes}>
          <FgrcButton label="Responder por e-mail" variant="outlined" onPress={responder} />
          {aberta.status !== 'em_atendimento' ? (
            <FgrcButton label={ocupado ? 'Aguarde...' : 'Marcar como em atendimento'} disabled={ocupado} onPress={() => { void mudar('em_atendimento'); }} />
          ) : null}
          {aberta.status !== 'resolvido' ? (
            <FgrcButton label={ocupado ? 'Aguarde...' : 'Marcar como resolvida'} disabled={ocupado} onPress={() => { void mudar('resolvido'); }} />
          ) : (
            <FgrcButton label="Reabrir mensagem" variant="outlined" disabled={ocupado} onPress={() => { void mudar('aberto'); }} />
          )}
        </View>

        <Text style={[styles.titulo, { color: colors.text }]}>Histórico</Text>
        {historico.length === 0 ? <TextoVazio>Nenhuma mudança registrada ainda.</TextoVazio> : null}
        {historico.map(h => (
          <Text key={h.id} style={[styles.historico, { color: colors.text }]}>
            {dataHora(h.criado_em)}: {NOME_STATUS_SUPORTE[h.de as StatusSuporte] ?? h.de ?? '—'} → {NOME_STATUS_SUPORTE[h.para as StatusSuporte] ?? h.para ?? '—'} ({h.admin_email ?? 'administração'})
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

const styles = StyleSheet.create({
  carregando: { marginTop: 30 },
  titulo: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  link: { fontSize: 15, fontWeight: '600', marginVertical: 8 },
  acoes: { gap: 8, marginBottom: 14 },
  rotulo: { fontSize: 13 },
  mensagem: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  historico: { fontSize: 14, marginBottom: 4 },
});
