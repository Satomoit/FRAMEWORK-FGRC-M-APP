// [integração] lê os dados da conta logada num lugar só (perfil, Home e PDF usam isso)
// regra de segurança:
//   * prefeitura, município, estado e cargo vêm primeiro do app_metadata,
//     que só a administração consegue mudar (pelo SQL do painel). O usuário não consegue editar
//   * se ainda não tiver no app_metadata, usa o user_metadata (que a própria pessoa consegue mudar),
//     só pra MOSTRAR na tela. Nunca usar isso pra liberar acesso nem dar permissão de admin
//   * o nome é o único dado que a pessoa pode mudar sozinha (fica no user_metadata)
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export const SEM_DADO = 'Não informado';

type Metadados = Record<string, unknown>;

function primeiroTexto(fontes: Metadados[], chaves: string[]): string | null {
  for (const fonte of fontes) {
    for (const chave of chaves) {
      const valor = fonte[chave];
      if (typeof valor === 'string' && valor.trim()) return valor.trim();
    }
  }
  return null;
}

export type DadosDaConta = {
  nome: string | null;
  email: string | null;
  cargo: string | null;
  prefeitura: string | null;
  municipio: string | null;
  estado: string | null;
};

export function dadosDaConta(user: User): DadosDaConta {
  const admin = (user.app_metadata ?? {}) as Metadados;
  const pessoa = (user.user_metadata ?? {}) as Metadados;
  return {
    nome: primeiroTexto([pessoa], ['nome_completo', 'full_name', 'nome', 'name']),
    email: user.email ?? null,
    cargo: primeiroTexto([admin, pessoa], ['cargo', 'vinculo', 'role']),
    prefeitura: primeiroTexto([admin, pessoa], ['prefeitura']),
    municipio: primeiroTexto([admin, pessoa], ['municipio']),
    estado: primeiroTexto([admin, pessoa], ['estado', 'uf']),
  };
}

// [segurança] confere se a conta foi liberada pela equipe do FGRC-M
// conta aprovada sempre ganha a prefeitura no app_metadata (quem grava é a função admin-fgrcm,
// com a chave do servidor), e a conta da administração tem o fgrcm_papel = admin
// o app_metadata a pessoa não consegue mudar sozinha, então dá pra confiar nele
// isso aqui é uma camada a mais: a trava de verdade é deixar o cadastro público DESLIGADO no Supabase
// (Authentication > Sign In / Providers > Allow new users to sign up), pq com ele ligado
// alguém poderia criar conta direto pela API sem passar pela aprovação
export function contaLiberada(user: User): boolean {
  const admin = (user.app_metadata ?? {}) as Metadados;
  const temPrefeitura = typeof admin.prefeitura === 'string' && admin.prefeitura.trim() !== '';
  return temPrefeitura || admin.fgrcm_papel === 'admin';
}

// [integração] a função eAdmin (que olhava o app_metadata) saiu daqui de propósito
// agora quem é admin fica na tabela public.administradores e quem confere é o banco
// (função estado_admin_fgrcm, usada em src/lib/admin.ts). Assim não tem duas regras diferentes

// [integração RF-003] prefeitura da conta logada, pra gravar junto da avaliação quando finaliza
// usa getSession (lê a sessão salva no aparelho) e não getUser (que vai na internet)
// pq a avaliação tem que dar pra finalizar sem conexão (RNF-006)
export async function prefeituraDaSessao(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  return user ? linhaDaPrefeitura(dadosDaConta(user)) : null;
}

// "Prefeitura Municipal de X - X/MG" (ou null se a conta não tiver nada disso)
export function linhaDaPrefeitura(dados: DadosDaConta): string | null {
  const cidade = [dados.municipio, dados.estado].filter(Boolean).join('/');
  const linha = [dados.prefeitura, cidade].filter(Boolean).join(' - ');
  return linha || null;
}
