// [integração B1] rota oficial do botão "Mais" (tela 17) e do "Meu perfil" (tela 18)
// usa as telas da P09 sem mudar nada nelas, só passa os dados e as funções certas
// (a /minhas-telas continua existindo como página de teste, mas a barra não aponta mais pra ela)
import type { User } from '@supabase/supabase-js';
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import MenuMaisScreen from '@/features/p09-menu-perfil/MenuMaisScreen';
import PerfilScreen, { type ProfileData } from '@/features/p09-menu-perfil/PerfilScreen';
// [integração 19/11] atalho da administração (o banco diz se a conta é admin)
import { mostraAtalhoDaAdministracao } from '@/lib/admin';
// [integração 19/11] lembra se a conta é da administração (o atalho aparece na hora)
import { conferirEGuardarEstadoDoAtalho, esquecerEstadoDoAtalho, estadoDoAtalhoGuardado, estadoDoAtalhoNaMemoria } from '@/lib/atalho-admin';
import { SEM_DADO, dadosDaConta } from '@/lib/conta';
import { problemaNoEmailInstitucional } from '@/lib/email-institucional';
import { plataformaDoApp, versaoInstalada } from '@/lib/sistema';
import { NOME_DA_VERSAO } from '@/lib/versao';
import { supabase } from '@/lib/supabase';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

// monta o perfil que a P09 espera a partir do usuário logado
// [integração] agora lê pelo src/lib/conta.ts (prefeitura/município/estado vêm do que a administração gravou)
// e mostra "Não informado" quando não tiver o dado (em vez de inventar)
function perfilDoUsuario(user: User): ProfileData {
  const d = dadosDaConta(user);
  return {
    name: d.nome ?? SEM_DADO,
    role: d.cargo ?? SEM_DADO,
    email: d.email ?? SEM_DADO,
    cityHall: d.prefeitura ?? SEM_DADO,
    city: d.municipio ?? SEM_DADO,
    state: d.estado ?? SEM_DADO,
  };
}

// [integração] salva de verdade no Supabase só o nome e o e-mail (prefeitura, município e estado ficam travados)
// devolve o texto que aparece pra pessoa depois de salvar
async function salvarPerfilNoSupabase(anterior: ProfileData, novo: ProfileData): Promise<string> {
  const mudouNome = novo.name !== anterior.name;
  const mudouEmail = novo.email !== anterior.email;
  if (!mudouNome && !mudouEmail) return 'Nada foi alterado.';
  // o e-mail novo também precisa ser de prefeitura (mesma regra do pedido de acesso)
  if (mudouEmail) {
    const problema = problemaNoEmailInstitucional(novo.email);
    if (problema) throw new Error(problema);
  }

  const { error } = await supabase.auth.updateUser({
    ...(mudouNome ? { data: { nome_completo: novo.name } } : {}),
    // trocar o e-mail não é na hora: o Supabase manda um link de confirmação pro e-mail novo
    // (é a "alteração sujeita à aprovação" que aparece no protótipo)
    ...(mudouEmail ? { email: novo.email } : {}),
  });
  if (error) {
    if (error.code === 'email_exists') throw new Error('Este e-mail já está sendo usado por outra conta.');
    if (error.status === 429) throw new Error('Muitas tentativas. Espere alguns minutos e tente de novo.');
    throw new Error('Não foi possível salvar. Verifique a internet e tente de novo.');
  }
  return mudouEmail
    // a troca segura do Supabase manda link pro e-mail novo e às vezes pro atual também
    ? 'Dados salvos. Para trocar o e-mail, abra o link de confirmação que enviamos para o e-mail novo (se chegar um link no e-mail atual, confirme nele também).'
    : 'Dados salvos.';
}

export default function Mais() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const router = useRouter();
  // ?tela=perfil vem da Home (Meu perfil) pra abrir o perfil direto
  const { tela } = useLocalSearchParams<{ tela?: string }>();
  const [mostrarPerfil, setMostrarPerfil] = useState(tela === 'perfil');
  const [perfil, setPerfil] = useState<ProfileData | null>(null);
  const [erro, setErro] = useState('');
  // [integração 19/11] 'ok' ou 'precisa_mfa' = mostra o atalho; null = ainda não sabe ou não é admin
  // já começa com o último resultado conhecido (antes começava vazio e o botão aparecia uns segundos depois)
  const [estadoAdmin, setEstadoAdmin] = useState<string | null>(() => estadoDoAtalhoNaMemoria());

  // toda vez que o menu volta pra frente (ex: voltou da /admin ou mudou a permissão):
  // 1. mostra na hora o que ta guardado no aparelho pra esta conta
  // 2. confere no banco por trás e atualiza se mudou
  // sem internet o botão continua como tava (quem confere de verdade é a /admin, então não abre nada indevido)
  const conferirAdmin = useCallback(() => {
    let ativo = true;
    void (async () => {
      const guardado = await estadoDoAtalhoGuardado();
      if (ativo && guardado) setEstadoAdmin(guardado);
      const doBanco = await conferirEGuardarEstadoDoAtalho();
      if (ativo) setEstadoAdmin(doBanco);
    })();
    return () => { ativo = false; };
  }, []);
  useFocusEffect(conferirAdmin);

  // se a sessão mudar (entrou com o código das duas etapas, trocou de conta, saiu), confere de novo
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') { esquecerEstadoDoAtalho(); setEstadoAdmin(null); }
      else if (evento === 'MFA_CHALLENGE_VERIFIED' || evento === 'TOKEN_REFRESHED' || evento === 'SIGNED_IN' || evento === 'USER_UPDATED') conferirAdmin();
    });
    return () => data.subscription.unsubscribe();
  }, [conferirAdmin]);

  // se vc pedir o perfil de novo com essa tela já aberta, atualiza
  // [integração 19/11] feito no desenho em vez de useEffect (jeito recomendado pelo React; o lint reclamava)
  // (na primeira vez o useState lá de cima já começa com o perfil aberto se tela = perfil)
  const [telaAntes, setTelaAntes] = useState(tela);
  if (tela !== telaAntes) {
    setTelaAntes(tela);
    if (tela === 'perfil') setMostrarPerfil(true);
  }

  useEffect(() => {
    let ativo = true;
    // getUser pergunta pro Supabase quem ta logado (não confia só no que ta salvo no aparelho)
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error || !data.user) {
          setErro('Não foi possível carregar os dados da sua conta. Verifique a conexão e tente novamente.');
          return;
        }
        setPerfil(perfilDoUsuario(data.user));
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível conectar ao serviço de autenticação.');
      });
    return () => { ativo = false; };
  }, []);

  // sair de verdade: encerra a sessão no Supabase
  // o _layout.tsx percebe que a sessão acabou e manda pro login sozinho
  async function sair() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setErro('Não foi possível sair. Tente novamente.');
    } catch {
      setErro('Não foi possível sair. Verifique sua conexão.');
    }
  }

  if (mostrarPerfil) {
    if (erro) {
      return (
        <View style={[styles.centro, { backgroundColor: colors.background }]}>
          <Text style={[styles.erro, { color: colors.error }]}>{erro}</Text>
        </View>
      );
    }
    if (!perfil) {
      return (
        <View style={[styles.centro, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" accessibilityLabel="Carregando perfil" />
        </View>
      );
    }
    return (
      <PerfilScreen
        profile={perfil}
        // [integração] agora salva no Supabase (só nome e e-mail) e atualiza a tela se der certo
        // o e-mail na tela só muda depois que a pessoa confirmar pelo link (por isso mantém o antigo)
        onSaveProfile={async (novo) => {
          const aviso = await salvarPerfilNoSupabase(perfil, novo);
          setPerfil({ ...perfil, name: novo.name });
          return aviso;
        }}
        onBack={() => setMostrarPerfil(false)}
        // [integração P11] o Alterar senha do perfil abre a tela 20 da Nicole (troca de verdade no Supabase)
        onOpenChangePassword={() => router.push('/alterar-senha' as Href)}
      />
    );
  }

  return (
    <View style={styles.raiz}>
      {erro ? <Text style={[styles.erro, { color: colors.error }]}>{erro}</Text> : null}
      <MenuMaisScreen
        onOpenProfile={() => setMostrarPerfil(true)}
        // [integração P11] Configurações abre a tela 22 da Nicole
        // (o "as Href" é pq a lista de rotas tipadas só atualiza quando o Expo inicia, igual as outras rotas de integração)
        onOpenSettings={() => router.push('/configuracoes' as Href)}
        // [integração] Privacidade e termos abre a tela /privacidade (texto descreve o que o app faz de verdade
        // com os dados; o grupo ainda precisa revisar e aprovar a redação final)
        onOpenPrivacy={() => router.push('/privacidade' as Href)}
        // [integração] Ajuda e suporte abre o formulário de contato (grava o pedido no Supabase)
        onOpenSupport={() => router.push('/suporte' as Href)}
        // [suporte] acompanhar as mensagens enviadas e as respostas da equipe
        onOpenTickets={() => router.push('/meus-chamados' as Href)}
        // [integração 19/11] só pra conta da administração: abre a /admin com a MESMA sessão (não pede login de novo)
        // se a verificação em duas etapas estiver ligada e a sessão ainda não passou pelo código, a /admin pede o código
        onOpenAdmin={mostraAtalhoDaAdministracao(estadoAdmin) ? () => router.push('/admin' as Href) : undefined}
        adminSubtitle={estadoAdmin === 'precisa_mfa' ? 'Pede o código da verificação em duas etapas' : 'Pedidos de acesso, suporte e contas'}
        // [integração] a Administração saiu daqui de propósito: agora é uma área separada (rota /admin)
        onSignOut={sair}
      />
      {/* [nova versão] mostra qual versão ta instalada (ajuda a preencher o registro de testes e o suporte) */}
      <Text style={[styles.versao, { color: colors.muted }]}>
        {/* [entrega] mostra o nome da versão de entrega e, entre parênteses, o número técnico do build
            (o técnico ajuda a preencher o registro de testes e a conferir a atualização) */}
        FGRC-M Versão {NOME_DA_VERSAO} ({versaoInstalada() ?? 'desconhecida'} · {plataformaDoApp() === 'web' ? 'navegador' : plataformaDoApp()})
      </Text>
    </View>
  );
}

const estilosBase = StyleSheet.create({
  raiz: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  erro: { fontSize: 14, padding: 12, textAlign: 'center' },
  versao: { fontSize: 12, textAlign: 'center', paddingVertical: 6 },
});
