// [integração] aba "Solicitações de acesso" da administração
// lista os pedidos que chegaram pelo app (de qualquer celular ou computador), com filtro, busca e ordem
// ao abrir um pedido dá pra aprovar (cria a conta) ou recusar (com motivo); tudo fica no histórico
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import {
  NOME_STATUS_PEDIDO,
  aprovarPedido,
  historicoDoRegistro,
  listarPedidos,
  recusarPedido,
  type Pedido,
  type RegistroHistorico,
  type StatusPedido,
} from '@/lib/admin';
import { CaixaDeAcesso, NovoAcesso, type AcessoGerado } from './AcessoDaPessoa';
import { CampoBusca, Cartao, Etiqueta, Filtros, Linha, TextoVazio, combinaBusca, dataHora } from './ui-admin';

type Filtro = StatusPedido | 'todos';

const tomDoStatus = (s: StatusPedido) => (s === 'aprovado' ? 'bom' : s === 'recusado' ? 'ruim' : 'alerta');

export default function AbaSolicitacoes() {
  const { colors } = useFgrcTheme();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('pendente');
  const [busca, setBusca] = useState('');
  const [maisRecentes, setMaisRecentes] = useState(true);
  const [aberto, setAberto] = useState<Pedido | null>(null);
  const [historico, setHistorico] = useState<RegistroHistorico[]>([]);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  const [recusando, setRecusando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  // a senha provisória ou o código aparece uma vez só, logo depois de aprovar
  const [acessoCriado, setAcessoCriado] = useState<AcessoGerado | null>(null);

  // pega os pedidos que chegaram no banco
  const carregar = useCallback(async () => {
    try {
      setPedidos(await listarPedidos());
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  // filtro + busca + ordem (tudo aqui no aparelho, a lista já veio filtrada pelo banco por permissão)
  const visiveis = useMemo(() => {
    const lista = pedidos.filter(p =>
      (filtro === 'todos' || p.status === filtro) &&
      combinaBusca(busca, p.nome, p.email, p.prefeitura, p.municipio, p.estado));
    return lista.sort((a, b) => (maisRecentes ? b.criado_em.localeCompare(a.criado_em) : a.criado_em.localeCompare(b.criado_em)));
  }, [pedidos, filtro, busca, maisRecentes]);

  async function abrir(p: Pedido) {
    setAberto(p);
    setRecusando(false);
    setMotivo('');
    setHistorico([]);
    try { setHistorico(await historicoDoRegistro(p.id)); } catch { /* histórico é complemento: se falhar a tela continua */ }
  }

  async function decidir(acao: 'senha' | 'codigo' | 'convite' | 'recusar') {
    if (!aberto || ocupado) return;
    setOcupado(true);
    setAviso(null);
    try {
      if (acao === 'recusar') {
        const r = await recusarPedido(aberto.id, motivo);
        setAviso({ texto: r.mensagem, tipo: 'success' });
      } else {
        const r = await aprovarPedido(aberto.id, acao);
        setAviso({ texto: r.mensagem, tipo: 'success' });
        if (r.senhaProvisoria) setAcessoCriado({ email: aberto.email, tipo: 'senha', valor: r.senhaProvisoria });
        if (r.codigo) setAcessoCriado({ email: aberto.email, tipo: 'codigo', valor: r.codigo });
      }
      setAberto(null);
      await carregar();
    } catch (e) {
      // se der erro, mantém o pedido aberto pra tentar de novo
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setOcupado(false);
    }
  }

  if (carregando) return <ActivityIndicator size="large" style={styles.carregando} />;

  const caixaSenha = acessoCriado ? <CaixaDeAcesso acesso={acessoCriado} onFechar={() => setAcessoCriado(null)} /> : null;

  // ---------- detalhe de um pedido ----------
  if (aberto) {
    return (
      <View>
        <Pressable accessibilityRole="button" onPress={() => setAberto(null)}>
          <Text style={[styles.link, { color: colors.blue }]}>← Voltar para a lista</Text>
        </Pressable>
        {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
        <Cartao>
          <Etiqueta texto={NOME_STATUS_PEDIDO[aberto.status]} tom={tomDoStatus(aberto.status)} />
          <Linha rotulo="Nome" valor={aberto.nome} />
          <Linha rotulo="E-mail" valor={aberto.email} />
          <Linha rotulo="Prefeitura" valor={aberto.prefeitura} />
          <Linha rotulo="Município / Estado" valor={`${aberto.municipio} / ${aberto.estado}`} />
          <Linha rotulo="Enviado em" valor={dataHora(aberto.criado_em)} />
          <Linha rotulo="Enviado pelo" valor={aberto.plataforma === 'web' ? 'navegador' : aberto.plataforma === 'android' ? 'celular Android' : aberto.plataforma === 'ios' ? 'iPhone' : 'não informado'} />
          {aberto.status !== 'pendente' ? (
            <>
              <Linha rotulo="Decidido por" valor={aberto.analisado_por_email} />
              <Linha rotulo="Decidido em" valor={dataHora(aberto.analisado_em)} />
              <Linha rotulo="Motivo / observação" valor={aberto.observacao} />
            </>
          ) : null}
        </Cartao>

        {aberto.status === 'pendente' && !recusando ? (
          <View style={styles.acoes}>
            {/* [correção Android] o jeito mais seguro vem primeiro: o código vai direto pro e-mail da pessoa
                (ninguém mais vê o código, e ainda confirma que o e-mail é dela mesmo)
                os outros dois mostram o acesso na tela pra vc passar, então ficam como plano B */}
            <FgrcButton label={ocupado ? 'Aguarde...' : 'Aprovar e enviar código por e-mail'} disabled={ocupado} onPress={() => { void decidir('convite'); }} />
            <Text style={[styles.dica, { color: colors.muted }]}>
              Recomendado. A pessoa recebe um código de 6 números no e-mail e cria a senha em "Ativar acesso".
            </Text>
            {/* [integração] código que a administração passa pra pessoa (WhatsApp, telefone): funciona sem e-mail */}
            <FgrcButton label="Aprovar com código de ativação" variant="outlined" disabled={ocupado} onPress={() => { void decidir('codigo'); }} />
            <FgrcButton label="Aprovar com senha provisória" variant="outlined" disabled={ocupado} onPress={() => { void decidir('senha'); }} />
            <FgrcButton label="Recusar" variant="danger" disabled={ocupado} onPress={() => setRecusando(true)} />
            <Text style={[styles.dica, { color: colors.muted }]}>
              Use o código de ativação ou a senha provisória só se o e-mail não chegar: eles aparecem na tela
              para você passar à pessoa, então confira antes que o e-mail do pedido é mesmo dela.
            </Text>
          </View>
        ) : null}

        {recusando ? (
          <View style={styles.acoes}>
            <Text style={[styles.titulo, { color: colors.text }]}>Motivo da recusa</Text>
            <TextInput
              accessibilityLabel="Motivo da recusa"
              value={motivo}
              onChangeText={setMotivo}
              placeholder="Ex: e-mail não é da prefeitura"
              placeholderTextColor={colors.muted}
              style={[styles.motivo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
            />
            <FgrcButton label={ocupado ? 'Aguarde...' : 'Confirmar recusa'} variant="danger" disabled={ocupado || !motivo.trim()} onPress={() => { void decidir('recusar'); }} />
            <FgrcButton label="Cancelar" variant="outlined" onPress={() => setRecusando(false)} />
          </View>
        ) : null}

        {/* [integração] pedido aprovado: dá pra gerar um acesso novo se a pessoa perdeu a senha ou o código */}
        {aberto.status === 'aprovado' ? (
          <View style={styles.acoes}>
            <NovoAcesso
              email={aberto.email}
              pedidoId={aberto.id}
              onGerado={() => { historicoDoRegistro(aberto.id).then(setHistorico).catch(() => {}); }}
            />
          </View>
        ) : null}

        <Text style={[styles.titulo, { color: colors.text }]}>Histórico</Text>
        {historico.length === 0 ? <TextoVazio>Nenhuma decisão registrada ainda.</TextoVazio> : null}
        {historico.map(h => (
          <Text key={h.id} style={[styles.historico, { color: colors.text }]}>
            {h.acao.startsWith('acesso_')
              ? `${dataHora(h.criado_em)}: ${h.para ?? 'novo acesso'} (${h.admin_email ?? 'administração'})`
              : `${dataHora(h.criado_em)}: ${NOME_STATUS_PEDIDO[h.de as StatusPedido] ?? h.de ?? '—'} → ${NOME_STATUS_PEDIDO[h.para as StatusPedido] ?? h.para ?? '—'} (${h.admin_email ?? 'administração'})`}
          </Text>
        ))}
      </View>
    );
  }

  // ---------- lista ----------
  return (
    <View>
      {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
      {caixaSenha}
      <Filtros<Filtro>
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: 'pendente', rotulo: `Pendentes (${pedidos.filter(p => p.status === 'pendente').length})` },
          { valor: 'aprovado', rotulo: 'Aprovadas' },
          { valor: 'recusado', rotulo: 'Recusadas' },
          { valor: 'todos', rotulo: 'Todas' },
        ]}
      />
      <CampoBusca valor={busca} onChange={setBusca} dica="Pesquisar por nome, e-mail, prefeitura ou município" />
      <View style={styles.barra}>
        <Pressable accessibilityRole="button" onPress={() => setMaisRecentes(v => !v)}>
          <Text style={[styles.link, { color: colors.blue }]}>Ordem: {maisRecentes ? 'mais recentes primeiro' : 'mais antigas primeiro'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => { setCarregando(true); void carregar(); }}>
          <Text style={[styles.link, { color: colors.blue }]}>Atualizar</Text>
        </Pressable>
      </View>

      {visiveis.length === 0 ? <TextoVazio>Nenhum pedido encontrado com esse filtro.</TextoVazio> : null}
      {visiveis.map(p => (
        <Cartao key={p.id} onPress={() => { void abrir(p); }} rotulo={`Pedido de ${p.nome}`}>
          <Etiqueta texto={NOME_STATUS_PEDIDO[p.status]} tom={tomDoStatus(p.status)} />
          <Text style={[styles.titulo, { color: colors.text }]}>{p.nome}</Text>
          <Text style={{ color: colors.text }}>{p.email}</Text>
          <Text style={{ color: colors.muted }}>{p.prefeitura} - {p.municipio}/{p.estado}</Text>
          <Text style={{ color: colors.muted }}>Enviado em {dataHora(p.criado_em)}</Text>
        </Cartao>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  carregando: { marginTop: 30 },
  titulo: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  link: { fontSize: 15, fontWeight: '600', marginVertical: 8 },
  barra: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 6 },
  acoes: { gap: 8, marginBottom: 14 },
  dica: { fontSize: 13 },
  motivo: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, minHeight: 44 },
  historico: { fontSize: 14, marginBottom: 4 },
});
