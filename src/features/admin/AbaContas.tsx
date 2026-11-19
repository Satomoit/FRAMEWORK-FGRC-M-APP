// [integração] aba "Contas" da administração (o Mapeamento pede a lista de usuários cadastrados e ativos)
// mostra nome, e-mail, prefeitura, município, estado e situação de cada conta
// dá pra desativar uma conta (a pessoa não consegue mais entrar) e reativar depois
// a lista vem da função admin-fgrcm no servidor, pq só ela pode ler as contas do Supabase Auth
// [integração 19/11] agora também dá pra EXCLUIR uma conta de vez (contas de teste, por exemplo)
// as três ações ficam separadas e com nomes diferentes: Desativar, Reativar e Excluir definitivamente
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import { alterarConta, excluirConta, listarContas, type ContaCadastrada } from '@/lib/admin';
import { NovoAcesso } from './AcessoDaPessoa';
import ConfirmarExclusao from './ConfirmarExclusao';
import { CampoBusca, Cartao, Etiqueta, Filtros, Linha, TextoVazio, combinaBusca, dataHora } from './ui-admin';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

type Filtro = 'ativas' | 'desativadas' | 'todas';

export default function AbaContas() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const [contas, setContas] = useState<ContaCadastrada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('ativas');
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  // pede confirmação antes de desativar (pra não clicar sem querer)
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  // [integração 19/11] conta escolhida pra excluir (abre a janela de confirmação)
  const [excluindo, setExcluindo] = useState<ContaCadastrada | null>(null);

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

  // [integração 19/11] exclusão definitiva: o servidor bloqueia, limpa os dados pessoais e apaga a conta
  // se der certo, fecha a janela e recarrega a lista; se der erro (ou terminar só em parte), mostra o motivo
  async function excluir(c: ContaCadastrada, motivo: string) {
    setAviso(null);
    try {
      const r = await excluirConta(c.id, c.email, motivo || undefined);
      setAviso({ texto: r.mensagem, tipo: 'success' });
      setExcluindo(null);
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
      setExcluindo(null);
    }
    // recarrega sempre (se a exclusão parou no meio, a conta aparece como desativada)
    await carregar();
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
          {/* é a data do último login (last_sign_in_at do Supabase), não mostra quem ta online agora */}
          <Linha rotulo="Último login" valor={c.ultimo_acesso ? dataHora(c.ultimo_acesso) : 'ainda não entrou'} />
          {/* [integração] perdeu a senha provisória ou o código? gera outro daqui (contas ativas, não admin) */}
          {!c.admin && !c.desativado ? <NovoAcesso email={c.email} userId={c.id} /> : null}
          {/* contas de admin não são alteradas por aqui (só pelo painel do Supabase) */}
          {!c.admin ? (
            confirmando === c.id ? (
              <View style={styles.acoes}>
                <Text style={{ color: colors.text }}>
                  {c.desativado ? 'Reativar esta conta?' : 'Desativar esta conta? As sessões abertas da pessoa são encerradas e ela não consegue entrar até ser reativada. As avaliações salvas no aparelho dela não são apagadas.'}
                </Text>
                <FgrcButton label={ocupado ? 'Aguarde...' : 'Sim, confirmar'} variant={c.desativado ? 'success' : 'dangerSolid'} disabled={ocupado} onPress={() => { void trocar(c); }} />
                <FgrcButton label="Cancelar" variant="outlined" onPress={() => setConfirmando(null)} />
              </View>
            ) : (
              <FgrcButton label={c.desativado ? 'Reativar conta' : 'Desativar conta'} variant={c.desativado ? 'successOutlined' : 'danger'} icon={c.desativado ? 'lock-open-outline' : 'lock-closed-outline'} onPress={() => setConfirmando(c.id)} />
            )
          ) : null}
          {/* [integração 19/11] excluir de vez: nunca aparece pra conta de administração (o servidor também recusa) */}
          {!c.admin && confirmando !== c.id ? (
            <FgrcButton label="Excluir definitivamente" variant="danger" icon="trash-outline" onPress={() => setExcluindo(c)} />
          ) : null}
        </Cartao>
      ))}

      <ConfirmarExclusao
        aberto={excluindo !== null}
        titulo="Excluir esta conta definitivamente?"
        identificacao={excluindo ? [
          { rotulo: 'Nome', valor: excluindo.nome },
          { rotulo: 'E-mail', valor: excluindo.email },
          { rotulo: 'Prefeitura', valor: excluindo.prefeitura },
          { rotulo: 'Município / Estado', valor: excluindo.municipio || excluindo.estado ? `${excluindo.municipio ?? '—'} / ${excluindo.estado ?? '—'}` : null },
        ] : []}
        consequencias={[
          'A pessoa sai do aplicativo na hora e não consegue mais entrar com este e-mail.',
          'A conta de login é apagada.',
          'Pedidos de acesso ainda pendentes deste e-mail são apagados. Os já decididos ficam só como registro, sem nome e sem e-mail.',
          'As mensagens de suporte da pessoa ficam sem nome, e-mail e texto (fica só o assunto e a data).',
          'O histórico da administração continua, mas sem o e-mail da pessoa.',
          'As avaliações e relatórios salvos no celular da pessoa NÃO são apagados (eles nunca foram para o servidor).',
          'Se quiser só impedir o acesso por um tempo, use "Desativar conta" em vez de excluir.',
        ]}
        rotuloConfirmar="Excluir definitivamente"
        onConfirmar={motivo => excluindo ? excluir(excluindo, motivo) : Promise.resolve()}
        onCancelar={() => setExcluindo(null)}
      />
    </View>
  );
}

const estilosBase = StyleSheet.create({
  carregando: { marginTop: 30 },
  titulo: { fontSize: 16, fontWeight: '700', marginVertical: 4 },
  link: { fontSize: 15, fontWeight: '600', marginVertical: 8 },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  acoes: { gap: 8, marginTop: 6 },
});
