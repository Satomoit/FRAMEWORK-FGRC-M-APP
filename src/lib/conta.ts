// [integração] lê os dados da conta logada num lugar só (perfil, Home e PDF usam isso)
// regra de segurança:
//   * prefeitura, município, estado e cargo vêm primeiro do app_metadata,
//     que só a administração consegue mudar (pelo SQL do painel). O usuário não consegue editar
//   * se ainda não tiver no app_metadata, usa o user_metadata (que a própria pessoa consegue mudar),
//     só pra MOSTRAR na tela. Nunca usar isso pra liberar acesso nem dar permissão de admin
//   * o nome é o único dado que a pessoa pode mudar sozinha (fica no user_metadata)
import type { User } from '@supabase/supabase-js';

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

// [integração] é admin? mesma regra do SQL (supabase/fgrcm-admin.sql):
// fgrcm_papel "admin" no app_metadata, que só a administração muda pelo painel
// isso só decide se MOSTRA o botão; quem bloqueia de verdade é o Supabase (RLS e a função)
export function eAdmin(user: User | null | undefined): boolean {
  return user?.app_metadata?.fgrcm_papel === 'admin';
}

// "Prefeitura Municipal de X - X/MG" (ou null se a conta não tiver nada disso)
export function linhaDaPrefeitura(dados: DadosDaConta): string | null {
  const cidade = [dados.municipio, dados.estado].filter(Boolean).join('/');
  const linha = [dados.prefeitura, cidade].filter(Boolean).join(' - ');
  return linha || null;
}
