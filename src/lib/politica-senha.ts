// [integração] regra única de senha forte pro app inteiro
// (a mesma função serve pra P08 nova senha e pra P11 alterar senha, assim as duas não ficam diferentes)
// regra pedida pelo grupo: mínimo 10 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial
// [integração] + 1 letra minúscula (pedido da integração: maiúscula, minúscula, número e símbolo)
// isso é só a checagem da tela: o Supabase também precisa exigir o mínimo de caracteres
// (painel > Authentication > Sign In / Providers > Email > Minimum password length)

export const TAMANHO_MINIMO_SENHA = 10;

// [integração] símbolos que contam: os mesmos que o Supabase aceita na regra "digits, lowercase, uppercase and symbols"
// (antes qualquer coisa que não fosse letra ou número contava, até "ç" e "á", e aí o Supabase podia recusar depois)
const SIMBOLO = /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/;

// texto curto e simples que aparece pra pessoa (o app é pra prefeituras pequenas)
export const REGRA_SENHA_TEXTO =
  'A senha precisa ter pelo menos 10 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 símbolo (por exemplo ! @ # .)';

// confere cada exigência separada (fica fácil de testar e de explicar)
export function validarSenhaForte(senha: string): boolean {
  return (
    senha.length >= TAMANHO_MINIMO_SENHA &&
    /[A-Z]/.test(senha) && // pelo menos uma maiúscula
    /[a-z]/.test(senha) && // pelo menos uma minúscula
    /[0-9]/.test(senha) && // pelo menos um número
    SIMBOLO.test(senha) // pelo menos um símbolo da lista (espaço, ç e acento não contam)
  );
}

// lista o que ainda falta, pra mostrar embaixo do campo enquanto a pessoa digita
export function oQueFaltaNaSenha(senha: string): string[] {
  const falta: string[] = [];
  if (senha.length < TAMANHO_MINIMO_SENHA) falta.push(`pelo menos ${TAMANHO_MINIMO_SENHA} caracteres`);
  if (!/[A-Z]/.test(senha)) falta.push('1 letra maiúscula');
  if (!/[a-z]/.test(senha)) falta.push('1 letra minúscula');
  if (!/[0-9]/.test(senha)) falta.push('1 número');
  if (!SIMBOLO.test(senha)) falta.push('1 símbolo (! @ # .)');
  return falta;
}
