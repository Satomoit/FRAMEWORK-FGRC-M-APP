// [manutenção e atualização] "porteiro" do app inteiro (fica em volta das telas, no _layout.tsx)
// ordem do que aparece (o primeiro que valer ganha):
//   1. versão abaixo da mínima obrigatória -> tela "Nova versão do FGRC-M disponível" (bloqueia)
//   2. manutenção ligada pela administração -> tela "FGRC-M temporariamente indisponível" (bloqueia)
//   3. sem internet ou servidor com erro    -> só uma faixa de aviso (NÃO bloqueia, as avaliações são locais)
//   4. versão mais nova (não obrigatória)   -> faixa "Nova versão disponível" que dá pra fechar
//   5. tudo certo -> não mostra nada
// /admin e /suporte nunca são bloqueadas: a administração precisa conseguir desligar a manutenção
// (ou corrigir uma versão mínima errada) e a pessoa precisa conseguir pedir ajuda
// as telas de baixo continuam montadas (só ficam escondidas), então ninguém perde o que tava fazendo
import { usePathname, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice, OrangeLink, Page } from '@/components/fgrc-ui';
import { dataHoraDa } from '@/lib/datas';
import { consultarSistema, type EstadoDoSistema } from '@/lib/sistema';

// rotas que abrem mesmo com bloqueio (começo do caminho)
const ROTAS_LIVRES = ['/admin', '/suporte'];
// não pergunta pro servidor mais de uma vez por minuto (voltar pro app várias vezes seguidas não vira enxurrada)
const INTERVALO_MINIMO_MS = 60_000;

// guarda "já recarreguei pra pegar a versão X" só nessa aba do navegador (pra não recarregar em loop)
function jaRecarregouPara(versao: string): boolean {
  try { return globalThis.sessionStorage?.getItem(`fgrcm:recarregou-para:${versao}`) === '1'; } catch { return false; }
}
function marcarRecarga(versao: string) {
  try { globalThis.sessionStorage?.setItem(`fgrcm:recarregou-para:${versao}`, '1'); } catch { /* sem sessionStorage, segue */ }
}

export function GuardaDoSistema({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoDoSistema | null>(null);
  const [conferindo, setConferindo] = useState(false);
  const [avisoFechado, setAvisoFechado] = useState<string | null>(null);
  // quando o "Atualizar" da faixa não consegue fazer nada (ex: sem link cadastrado), o motivo aparece aqui
  const [motivoAtualizar, setMotivoAtualizar] = useState('');
  const ultimaConsulta = useRef(0);
  const emAndamento = useRef(false);

  // pergunta pro servidor (forcar = botão "Tentar de novo", que ignora o intervalo de 1 minuto)
  const conferir = useCallback(async (forcar = false) => {
    const agora = Date.now();
    if (emAndamento.current) return;
    if (!forcar && agora - ultimaConsulta.current < INTERVALO_MINIMO_MS) return;
    emAndamento.current = true;
    ultimaConsulta.current = agora;
    setConferindo(true);
    try {
      setEstado(await consultarSistema());
    } finally {
      emAndamento.current = false;
      setConferindo(false);
    }
  }, []);

  useEffect(() => {
    // 1) quando o app abre
    void conferir(true);
    // 2) quando o app volta pra frente (celular) ou a aba volta a ficar visível (navegador)
    const assinatura = AppState.addEventListener('change', (situacao) => {
      if (situacao === 'active') void conferir();
    });
    const aoVoltarPraAba = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') void conferir();
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', aoVoltarPraAba);
    }
    return () => {
      assinatura.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', aoVoltarPraAba);
      }
    };
  }, [conferir]);

  const livre = ROTAS_LIVRES.some((r) => caminho === r || caminho.startsWith(`${r}/`));
  const bloqueio = livre || !estado
    ? null
    : estado.versao.situacao === 'atualizacao_obrigatoria'
      ? 'versao'
      : estado.manutencao
        ? 'manutencao'
        : null;

  // faixa pequena (só quando não tem bloqueio)
  let faixa: { chave: string; texto: string; tipo: 'info' | 'error' } | null = null;
  if (!bloqueio && estado && !livre) {
    if (estado.conexao === 'sem_conexao') {
      faixa = { chave: 'sem_conexao', tipo: 'info', texto: 'Sem conexão com o servidor. As avaliações salvas neste aparelho continuam disponíveis.' };
    } else if (estado.conexao === 'servico_indisponivel') {
      faixa = { chave: 'servico', tipo: 'error', texto: 'O servidor do FGRC-M não respondeu agora. Tente de novo em alguns minutos.' };
    } else if (estado.versao.situacao === 'atualizacao_disponivel' && estado.versao.maisNova) {
      faixa = { chave: `versao:${estado.versao.maisNova}`, tipo: 'info', texto: `Nova versão do FGRC-M disponível (${estado.versao.maisNova}).` };
    }
  }
  const mostrarFaixa = faixa && avisoFechado !== faixa.chave;

  return (
    <View style={styles.raiz}>
      {/* as telas do app continuam aqui; quando tem bloqueio elas só ficam escondidas */}
      <View
        style={[styles.raiz, bloqueio ? styles.escondida : null]}
        importantForAccessibility={bloqueio ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>

      {bloqueio === 'versao' && estado ? (
        <TelaAtualizacao estado={estado} conferindo={conferindo} onTentar={() => { void conferir(true); }}
          onSuporte={() => router.push('/suporte' as Href)} />
      ) : null}
      {bloqueio === 'manutencao' && estado ? (
        <TelaManutencao estado={estado} conferindo={conferindo} onTentar={() => { void conferir(true); }}
          onSuporte={() => router.push('/suporte' as Href)} onAdmin={() => router.push('/admin' as Href)} />
      ) : null}

      {mostrarFaixa && faixa ? (
        <FaixaDeAviso
          texto={motivoAtualizar ? `${faixa.texto} ${motivoAtualizar}` : faixa.texto}
          tipo={faixa.tipo}
          acao={faixa.chave.startsWith('versao:') ? 'Atualizar' : 'Tentar de novo'}
          onAcao={() => {
            if (faixa?.chave.startsWith('versao:') && estado) void atualizarAgora(estado).then((t) => setMotivoAtualizar(t ?? ''));
            else void conferir(true);
          }}
          onFechar={() => { setAvisoFechado(faixa?.chave ?? null); setMotivoAtualizar(''); }}
        />
      ) : null}
    </View>
  );
}

// "Atualizar agora"
//   celular: abre o link oficial do APK novo (quem instala é a própria pessoa; o Android pergunta "Atualizar app?")
//   navegador: recarrega a página UMA vez pra pegar a versão nova; se continuar velha, avisa em vez de ficar em loop
// devolve um texto pra mostrar se não deu pra fazer nada
async function atualizarAgora(estado: EstadoDoSistema): Promise<string | null> {
  if (Platform.OS === 'web') {
    const alvo = estado.versao.minima ?? estado.versao.maisNova ?? 'nova';
    if (jaRecarregouPara(alvo)) {
      return 'A página já foi recarregada, mas o navegador ainda abriu a versão antiga. Feche esta aba e abra o FGRC-M de novo (ou limpe o cache do navegador).';
    }
    marcarRecarga(alvo);
    globalThis.location?.reload();
    return null;
  }
  if (!estado.versao.url) {
    return 'O link da versão nova ainda não foi cadastrado. Fale com o suporte para receber o arquivo de instalação.';
  }
  try {
    await Linking.openURL(estado.versao.url);
    return null;
  } catch {
    return 'Não foi possível abrir o link da versão nova. Fale com o suporte.';
  }
}

function TelaAtualizacao({ estado, conferindo, onTentar, onSuporte }: {
  estado: EstadoDoSistema;
  conferindo: boolean;
  onTentar: () => void;
  onSuporte: () => void;
}) {
  const { colors } = useFgrcTheme();
  const [aviso, setAviso] = useState('');
  const v = estado.versao;
  return (
    <View style={[styles.cobre, { backgroundColor: colors.background }]}>
      <Page title="Nova versão do FGRC-M disponível">
        <Text style={[styles.texto, { color: colors.text }]}>
          {v.mensagem ?? 'Esta versão do aplicativo não é mais compatível. Atualize para continuar usando o FGRC-M.'}
        </Text>
        <Text style={[styles.detalhe, { color: colors.muted }]}>
          Versão instalada: {v.instalada ?? 'desconhecida'}{v.maisNova ? ` · Versão nova: ${v.maisNova}` : ''}
        </Text>
        {v.notas ? (
          <View style={[styles.caixa, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.rotulo, { color: colors.text }]}>O que mudou</Text>
            <Text style={[styles.detalhe, { color: colors.text }]}>{v.notas}</Text>
          </View>
        ) : null}
        {/* aviso importante pra ninguém ter medo de perder o que fez */}
        <Text style={[styles.detalhe, { color: colors.muted }]}>
          {Platform.OS === 'web'
            ? 'As avaliações salvas neste navegador continuam guardadas depois de atualizar.'
            : 'Instale a versão nova por cima desta (sem desinstalar). Assim as avaliações salvas neste celular continuam guardadas.'}
        </Text>
        <View style={styles.botoes}>
          <FgrcButton label="Atualizar agora" onPress={() => { void atualizarAgora(estado).then((t) => setAviso(t ?? '')); }} />
          <FgrcButton label={conferindo ? 'Conferindo...' : 'Tentar de novo'} variant="outlined" disabled={conferindo} onPress={onTentar} />
          <OrangeLink label="Falar com o suporte" onPress={onSuporte} />
        </View>
        {aviso ? <Notice message={aviso} kind="error" onClose={() => setAviso('')} /> : null}
      </Page>
    </View>
  );
}

function TelaManutencao({ estado, conferindo, onTentar, onSuporte, onAdmin }: {
  estado: EstadoDoSistema;
  conferindo: boolean;
  onTentar: () => void;
  onSuporte: () => void;
  onAdmin: () => void;
}) {
  const { colors } = useFgrcTheme();
  const m = estado.manutencao;
  // a previsão só aparece se a administração cadastrou uma (não inventa horário)
  const previsao = m?.previsaoRetorno ? dataHoraDa(m.previsaoRetorno) : null;
  return (
    <View style={[styles.cobre, { backgroundColor: colors.background }]}>
      <Page title="FGRC-M temporariamente indisponível">
        <Text style={[styles.texto, { color: colors.text }]}>
          {m?.mensagem ?? 'Estamos fazendo uma manutenção no FGRC-M. Tente de novo mais tarde.'}
        </Text>
        {previsao ? (
          <Text style={[styles.detalhe, { color: colors.text }]}>Previsão de retorno: {previsao}</Text>
        ) : null}
        <Text style={[styles.detalhe, { color: colors.muted }]}>
          As avaliações salvas neste aparelho não foram apagadas.
        </Text>
        <View style={styles.botoes}>
          <FgrcButton label={conferindo ? 'Conferindo...' : 'Tentar de novo'} disabled={conferindo} onPress={onTentar} />
          <OrangeLink label="Falar com o suporte" onPress={onSuporte} />
        </View>
        {/* caminho da administração pra desligar a manutenção (lá tem login próprio) */}
        <Pressable accessibilityRole="link" onPress={onAdmin} style={styles.admin}>
          <Text style={[styles.adminTexto, { color: colors.muted }]}>Área da administração</Text>
        </Pressable>
      </Page>
    </View>
  );
}

function FaixaDeAviso({ texto, tipo, acao, onAcao, onFechar }: {
  texto: string;
  tipo: 'info' | 'error';
  acao: string;
  onAcao: () => void;
  onFechar: () => void;
}) {
  const { colors } = useFgrcTheme();
  // desce a faixa pra baixo da barra de status do celular (hora, bateria)
  const margens = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.faixa, { top: margens.top + 8, backgroundColor: colors.infoBackground, borderColor: tipo === 'error' ? colors.error : colors.border }]}
    >
      <Text style={[styles.faixaTexto, { color: colors.text }]}>{texto}</Text>
      <View style={styles.faixaBotoes}>
        <Pressable accessibilityRole="button" onPress={onAcao} hitSlop={8}>
          <Text style={[styles.faixaAcao, { color: colors.blue }]}>{acao}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar aviso" onPress={onFechar} hitSlop={8}>
          <Text style={[styles.faixaAcao, { color: colors.muted }]}>Fechar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  escondida: { display: 'none' },
  // cobre a tela inteira (o absoluteFillObject saiu do React Native 0.88, por isso escrito por extenso)
  cobre: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  texto: { fontSize: 17, lineHeight: 25, marginBottom: 12 },
  detalhe: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
  rotulo: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  caixa: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  botoes: { gap: 10, marginTop: 8 },
  admin: { alignSelf: 'center', padding: 12, marginTop: 24 },
  adminTexto: { fontSize: 13, textDecorationLine: 'underline' },
  faixa: {
    position: 'absolute',
    left: 12,
    right: 12,
    maxWidth: 560,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  faixaTexto: { fontSize: 14, lineHeight: 20 },
  faixaBotoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
  faixaAcao: { fontSize: 14, fontWeight: '700' },
});
