// [integração] aba "Contas" da administração (o Mapeamento pede a lista de usuários cadastrados e ativos)
// mostra nome, e-mail, prefeitura, município, estado e situação de cada conta
// dá pra desativar uma conta (a pessoa não consegue mais entrar) e reativar depois
// a lista vem da função admin-fgrcm no servidor, pq só ela pode ler as contas do Supabase Auth
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import { alterarConta, listarContas, type ContaCadastrada } from '@/lib/admin';
import { CampoBusca, Cartao, Etiqueta, Filtros, Linha, TextoVazio, combinaBusca, dataHora } from './ui-admin';

type Filtro = 'ativas' | 'desativadas' | 'todas';

export default function AbaContas() {
  const { colors } = useFgrcTheme();
  const [contas, setContas] = useState<ContaCadastrada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('ativas');
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  // pede confirmação antes de desativar (pra não clicar sem querer)
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setContas(await listarContas());
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const visiveis = useMemo(() => contas
    .filter(c => (filtro === 'todas' || (filtro === 'ativas' ? !c.desativado : c.desativado)) &&
      combinaBusca(busca, c.nome, c.email, c.prefeitura, c.municipio, c.estado))
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em)), [contas, filtro, busca]);

  async function trocar(c: ContaCadastrada) {
    setOcupado(true);
    setAviso(null);
    try {
      const r = await alterarConta(c.id, !c.desativado);
      setAviso({ texto: `${r.mensagem} (${c.email})`, tipo: 'success' });
      setConfirmando(null);
      await carregar();
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setOcupado(false);
    }
  }

  if (carregando) return <ActivityIndicator size="large" style={styles.carregando} />;

  return (
    <View>
      {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
      <Filtros<Filtro>
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: 'ativas', rotulo: `Ativas (${contas.filter(c => !c.desativado).length})` },
          { valor: 'desativadas', rotulo: 'Desativadas' },
          { valor: 'todas', rotulo: 'Todas' },
        ]}
      />
      <CampoBusca valor={busca} onChange={setBusca} dica="Pesquisar por nome, e-mail, prefeitura ou município" />
      <Pressable accessibilityRole="button" onPress={() => { setCarregando(true); void carregar(); }}>
        <Text style={[styles.link, { color: colors.blue }]}>Atualizar</Text>
      </Pressable>

      {visiveis.length === 0 ? <TextoVazio>Nenhuma conta encontrada com esse filtro.</TextoVazio> : null}
      {visiveis.map(c => (
        <Cartao key={c.id}>
          <View style={styles.etiquetas}>
            <Etiqueta texto={c.desativado ? 'Desativada' : 'Ativa'} tom={c.desativado ? 'ruim' : 'bom'} />
            {c.admin ? <Etiqueta texto="Administração" tom="neutro" /> : null}
            {!c.confirmado ? <Etiqueta texto="Convite não aceito" tom="alerta" /> : null}
          </View>
          <Text style={[styles.titulo, { color: colors.text }]}>{c.nome || c.email}</Text>
          <Linha rotulo="E-mail" valor={c.email} />
          <Linha rotulo="Prefeitura" valor={c.prefeitura} />
          <Linha rotulo="Município / Estado" valor={c.municipio || c.estado ? `${c.municipio ?? '—'} / ${c.estado ?? '—'}` : null} />
          <Linha rotulo="Conta criada em" valor={dataHora(c.criado_em)} />
          <Linha rotulo="Último acesso" valor={c.ultimo_acesso ? dataHora(c.ultimo_acesso) : 'ainda não entrou'} />
          {/* contas de admin não são alteradas por aqui (só pelo painel do Supabase) */}
          {!c.admin ? (
            confirmando === c.id ? (
              <View style={styles.acoes}>
                <Text style={{ color: colors.text }}>
                  {c.desativado ? 'Reativar esta conta?' : 'Desativar esta conta? A pessoa não vai conseguir entrar até ser reativada.'}
                </Text>
                <FgrcButton label={ocupado ? 'Aguarde...' : 'Sim, confirmar'} variant={c.desativado ? 'filled' : 'danger'} disabled={ocupado} onPress={() => { void trocar(c); }} />
                <FgrcButton label="Cancelar" variant="outlined" onPress={() => setConfirmando(null)} />
              </View>
            ) : (
              <FgrcButton label={c.desativado ? 'Reativar conta' : 'Desativar conta'} variant="outlined" onPress={() => setConfirmando(c.id)} />
            )
          ) : null}
        </Cartao>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  carregando: { marginTop: 30 },
  titulo: { fontSize: 16, fontWeight: '700', marginVertical: 4 },
  link: { fontSize: 15, fontWeight: '600', marginVertical: 8 },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  acoes: { gap: 8, marginTop: 6 },
});
