// [integração] conexão do app com o Supabase (login, senha, pedidos de acesso e suporte)
// usa só a chave pública (EXPO_PUBLIC_...) que ta no .env.local: ela pode ficar no app
// a proteção de verdade é feita pelas regras (RLS) lá no Supabase, não por esconder a chave
// NUNCA colocar aqui a service_role / sb_secret_ (essa dá acesso total ao banco)
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// só ativa a revisão durante o desenvolvimento e com a opção do .env.local
// em um app publicado essa tela de teste não pode liberar acesso sozinha
export const previewMode =
  __DEV__ && process.env.EXPO_PUBLIC_PREVIEW_MODE === "true";

// esses dados só vão existir quando o Supabase do grupo estiver configurado
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// se vc desligar a revisão, o app precisa receber as credenciais públicas reais
if (!previewMode && (!supabaseUrl || !supabaseKey)) {
  throw new Error(
    "Preencha a URL e a chave pública do Supabase no arquivo .env.local.",
  );
}

// aqui a gente responde como se não existisse sessão nenhuma
// não é um banco falso e não deve ser usado no app publicado
const authDeRevisao = {
  onAuthStateChange(callback: (evento: string, sessao: null) => void) {
    let ativo = true;
    // simula apenas a checagem inicial sem falar com servidor nenhum
    Promise.resolve().then(() => {
      if (ativo) callback("INITIAL_SESSION", null);
    });
    return {
      data: {
        subscription: {
          unsubscribe() {
            ativo = false;
          },
        },
      },
    };
  },
  async getSession() {
    return { data: { session: null }, error: null };
  },
  async getUser() {
    return { data: { user: null }, error: null };
  },
  async signInWithPassword() {
    // se alguém tentar entrar, mostra indisponibilidade em vez de fingir login
    return {
      data: { user: null, session: null },
      error: {
        code: "preview_mode",
        status: 503,
        message: "Login real desativado na revisão",
      },
    };
  },
  async signOut() {
    // não tinha sessão de verdade pra encerrar
    return { error: null };
  },
  async resetPasswordForEmail() {
    // não enviamos e-mail pelo modo de revisão
    return {
      data: {},
      error: { message: "Envio de e-mail desativado na revisão" },
    };
  },
  async updateUser() {
    // senha e perfil reais só podem mudar quando existir autenticação
    return {
      data: { user: null },
      error: { message: "Alteração real desativada na revisão" },
    };
  },
};

// usamos só os métodos necessários pra revisão das telas atuais
// esse cast não transforma o objeto num cliente Supabase completo
const clienteRevisao = { auth: authDeRevisao } as unknown as SupabaseClient;

// quando a revisão ta ligada nem chama createClient (não usa credenciais fictícias)
export const supabase: SupabaseClient = previewMode
  ? clienteRevisao
  : createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        // no celular guarda sessão no armazenamento local, na web usa o padrão do Supabase
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // [integração P07/P08] o link de "Esqueci minha senha" volta pro app com ?code=...
        // a tela criar-nova-senha troca esse código por uma sessão só pra mudar a senha
        // (o código só funciona no mesmo navegador/celular onde a pessoa pediu a recuperação)
        flowType: "pkce",
      },
    });
