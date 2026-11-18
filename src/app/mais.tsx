// [integração B1] rota oficial do botão "Mais" (tela 17) e do "Meu perfil" (tela 18)
// usa as telas da P09 sem mudar nada nelas, só passa os dados e as funções certas
// (a /minhas-telas continua existindo como página de teste, mas a barra não aponta mais pra ela)
import type { User } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import MenuMaisScreen from '@/features/p09-menu-perfil/MenuMaisScreen';
import PerfilScreen, { type ProfileData } from '@/features/p09-menu-perfil/PerfilScreen';
import { SEM_DADO, dadosDaConta } from '@/lib/conta';
import { problemaNoEmailInstitucional } from '@/lib/email-institucional';
import { supabase } from '@/lib/supabase';

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
    ? 'Dados salvos. Para trocar o e-mail, abra o link de confirmação que enviamos para o e-mail novo.'
    : 'Dados salvos.';
}

export default function Mais() {
  const { colors } = useFgrcTheme();
  const router = useRouter();
  // ?tela=perfil vem da Home (Meu perfil) pra abrir o perfil direto
  const { tela } = useLocalSearchParams<{ tela?: string }>();
  const [mostrarPerfil, setMostrarPerfil] = useState(tela === 'perfil');
  const [perfil, setPerfil] = useState<ProfileData | null>(null);
  const [erro, setErro] = useState('');

  // se vc pedir o perfil de novo com essa tela já aberta, atualiza
  useEffect(() => {
    if (tela === 'perfil') setMostrarPerfil(true);
  }, [tela]);

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
        // [integração] a Administração saiu daqui de propósito: agora é uma área separada (rota /admin)
        onSignOut={sair}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  erro: { fontSize: 14, padding: 12, textAlign: 'center' },
});
