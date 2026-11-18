// [integração] área administrativa separada do resto do app (rota /admin)
// ela não aparece nos menus de quem usa o app. Se entra pelo endereço /admin no navegador
// ou pelo link discreto "Área da administração" no pé da tela de Login (no celular não tem barra de endereço)
//
// como a tela decide o que mostrar (quem responde é o banco, pela função estado_admin_fgrcm):
//   sem_sessao  -> formulário de login próprio da administração
//   nao_admin   -> "esta conta não tem permissão" (conta comum não vê nada aqui)
//   precisa_mfa -> pede o código de 6 números do aplicativo autenticador
//   ok          -> painel com Solicitações, Suporte, Contas e Segurança
// esconder a tela não é a proteção: mesmo se alguém abrir o painel na marra, o banco (RLS) não
// devolve nenhum dado e a função admin-fgrcm recusa qualquer ação de quem não é admin
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, FormField, Notice, Page } from '@/components/fgrc-ui';
import { confirmarCodigoMfa, verificarEstadoAdmin } from '@/lib/admin';
import { formatoDeEmailValido } from '@/lib/email-institucional';
import { supabase } from '@/lib/supabase';
import AbaContas from './AbaContas';
import AbaSeguranca from './AbaSeguranca';
import AbaSolicitacoes from './AbaSolicitacoes';
import AbaSuporte from './AbaSuporte';
import { Filtros } from './ui-admin';

type Estado = 'carregando' | 'sem_sessao' | 'nao_admin' | 'precisa_mfa' | 'ok' | 'erro';
type Aba = 'solicitacoes' | 'suporte' | 'contas' | 'seguranca';

export default function AreaAdministrativa() {
  const router = useRouter();
  const { colors } = useFgrcTheme();
  const [estado, setEstado] = useState<Estado>('carregando');
  const [emailLogado, setEmailLogado] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>('solicitacoes');
  const [aviso, setAviso] = useState<string | null>(null);

  // pergunta pro banco em que situação a pessoa logada ta
  const conferir = useCallback(async () => {
    try {
      const r = await verificarEstadoAdmin();
      const { data } = await supabase.auth.getSession();
      setEmailLogado(data.session?.user.email ?? null);
      setEstado(r);
    } catch {
      setEstado('erro');
    }
  }, []);

  useEffect(() => { void conferir(); }, [conferir]);

  async function sair() {
    await supabase.auth.signOut();
    setAviso('Você saiu da área administrativa.');
    setEstado('sem_sessao');
    setEmailLogado(null);
  }

  if (estado === 'carregando') {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.blue} accessibilityLabel="Conferindo permissão" />
      </View>
    );
  }

  if (estado === 'erro') {
    return (
      <Page title="Área da administração">
        <Notice kind="error" message="Não foi possível conferir a permissão. Verifique a internet e tente de novo." />
        <FgrcButton label="Tentar de novo" onPress={() => { setEstado('carregando'); void conferir(); }} />
      </Page>
    );
  }

  if (estado === 'sem_sessao') {
    return (
      <LoginAdmin
        aviso={aviso}
        onEntrou={() => { setAviso(null); setEstado('carregando'); void conferir(); }}
        onVoltar={() => router.replace('/' as Href)}
      />
    );
  }

  if (estado === 'nao_admin') {
    return (
      <Page title="Área da administração">
        <Notice kind="error" message={`A conta ${emailLogado ?? ''} não tem permissão para a área administrativa.`} />
        <View style={styles.acoes}>
          <FgrcButton label="Voltar para o app" onPress={() => router.replace('/inicio' as Href)} />
          <FgrcButton label="Sair desta conta" variant="outlined" onPress={() => { void sair(); }} />
        </View>
      </Page>
    );
  }

  if (estado === 'precisa_mfa') {
    return <CodigoMfa email={emailLogado} onConfirmou={() => { setEstado('carregando'); void conferir(); }} onSair={() => { void sair(); }} />;
  }

  // ---------- painel ----------
  return (
    <Page title="Área da administração" subtitle={emailLogado ? `Conectada como ${emailLogado}` : undefined}>
      <Filtros<Aba>
        valor={aba}
        onChange={setAba}
        opcoes={[
          { valor: 'solicitacoes', rotulo: 'Solicitações de acesso' },
          { valor: 'suporte', rotulo: 'Mensagens de suporte' },
          { valor: 'contas', rotulo: 'Contas' },
          { valor: 'seguranca', rotulo: 'Segurança' },
        ]}
      />
      <View style={[styles.divisor, { backgroundColor: colors.divider }]} />
      {aba === 'solicitacoes' ? <AbaSolicitacoes /> : null}
      {aba === 'suporte' ? <AbaSuporte /> : null}
      {aba === 'contas' ? <AbaContas /> : null}
      {aba === 'seguranca' ? <AbaSeguranca /> : null}
      <View style={[styles.divisor, { backgroundColor: colors.divider }]} />
      <FgrcButton label="Sair da área administrativa" variant="outlined" onPress={() => { void sair(); }} />
    </Page>
  );
}

// login próprio da administração (mesmo Supabase Auth, mas tela e caminho separados)
function LoginAdmin({ aviso, onEntrou, onVoltar }: { aviso: string | null; onEntrou: () => void; onVoltar: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    if (entrando) return;
    setErro(null);
    const emailLimpo = email.trim().toLowerCase();
    if (!formatoDeEmailValido(emailLimpo) || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    setEntrando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailLimpo, password: senha });
    if (error) {
      setEntrando(false);
      // mesma mensagem pra e-mail ou senha errados (não conta pra ninguém qual dos dois errou)
      setErro(error.code === 'user_banned' || /banned/i.test(error.message) ? 'Esta conta está desativada.' : 'E-mail ou senha incorretos.');
      return;
    }
    // entrou, mas é admin? se não for, sai na hora pra não deixar uma conta comum logada por aqui
    const estado = await verificarEstadoAdmin().catch(() => 'nao_admin' as const);
    if (estado === 'nao_admin') {
      await supabase.auth.signOut();
      setEntrando(false);
      setSenha('');
      setErro('Esta conta não tem acesso à área administrativa.');
      return;
    }
    setEntrando(false);
    setSenha('');
    onEntrou();
  }

  return (
    <Page title="Área da administração" subtitle="Acesso restrito à equipe que analisa os pedidos e o suporte." onBack={onVoltar}>
      {aviso ? <Notice kind="info" message={aviso} /> : null}
      {erro ? <Notice kind="error" message={erro} onClose={() => setErro(null)} /> : null}
      <FormField label="E-mail" value={email} onChangeText={setEmail} email placeholder="seu.email@exemplo.gov.br" />
      <FormField label="Senha" value={senha} onChangeText={setSenha} secure />
      <FgrcButton label={entrando ? 'Entrando...' : 'Entrar'} disabled={entrando} onPress={() => { void entrar(); }} />
    </Page>
  );
}

// segunda etapa: código do aplicativo autenticador (só pra quem ativou a verificação em duas etapas)
function CodigoMfa({ email, onConfirmou, onSair }: { email: string | null; onConfirmou: () => void; onSair: () => void }) {
  const { colors } = useFgrcTheme();
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [conferindo, setConferindo] = useState(false);

  async function confirmar() {
    setConferindo(true);
    setErro(null);
    try {
      await confirmarCodigoMfa(codigo);
      onConfirmou();
    } catch (e) {
      setErro((e as Error).message);
      setCodigo('');
    } finally {
      setConferindo(false);
    }
  }

  return (
    <Page title="Verificação em duas etapas" subtitle={`Abra o aplicativo autenticador do seu celular e digite o código de 6 números${email ? ` da conta ${email}` : ''}.`}>
      {erro ? <Notice kind="error" message={erro} onClose={() => setErro(null)} /> : null}
      <TextInput
        accessibilityLabel="Código de 6 números"
        value={codigo}
        onChangeText={t => setCodigo(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        autoFocus
        placeholder="000000"
        placeholderTextColor={colors.muted}
        style={[styles.codigo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
        onSubmitEditing={() => { if (codigo.length === 6) void confirmar(); }}
      />
      <View style={styles.acoes}>
        <FgrcButton label={conferindo ? 'Conferindo...' : 'Confirmar'} disabled={conferindo || codigo.length !== 6} onPress={() => { void confirmar(); }} />
        <Pressable accessibilityRole="button" onPress={onSair}>
          <Text style={[styles.link, { color: colors.blue }]}>Sair</Text>
        </Pressable>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  acoes: { gap: 10, marginTop: 10 },
  divisor: { height: 1, marginVertical: 14 },
  link: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  codigo: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 24, letterSpacing: 8, textAlign: 'center', minHeight: 54, marginBottom: 10 },
});
