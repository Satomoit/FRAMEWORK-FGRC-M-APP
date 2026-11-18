// [integração] confere se o e-mail tem cara de e-mail de verdade e se é de um domínio aceito
// a ideia é que só e-mail de prefeitura (.gov.br) peça acesso
// enquanto a gente testa, o @gmail.com também passa (dá pra tirar depois pelo .env.local)
//
// como mudar a lista sem mexer no código:
//   no .env.local coloque, por exemplo:  EXPO_PUBLIC_DOMINIOS_EMAIL=gov.br
//   (vários separados por vírgula: gov.br,leg.br,gmail.com) e reinicie o Expo
// obs: isso é só a checagem da tela. Quem aprova de verdade é a administração no painel

const PADRAO = 'gov.br,gmail.com';

// lê a lista do .env.local (ou usa a padrão) e deixa tudo minúsculo e sem espaço
export const DOMINIOS_ACEITOS = (process.env.EXPO_PUBLIC_DOMINIOS_EMAIL || PADRAO)
  .split(',')
  .map(d => d.trim().toLowerCase().replace(/^@/, ''))
  .filter(Boolean);

// formato básico: algo@algo.algo (sem espaço, com ponto depois do @)
export function formatoDeEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// o domínio passa se for igual a um da lista ou terminar com ".item"
// ex: com "gov.br" na lista, "prefeitura.mg.gov.br" passa e "golpegov.br" não passa
export function dominioAceito(email: string): boolean {
  const dominio = email.trim().toLowerCase().split('@')[1] ?? '';
  return DOMINIOS_ACEITOS.some(d => dominio === d || dominio.endsWith(`.${d}`));
}

// devolve a mensagem de erro pronta pra mostrar na tela, ou null se ta tudo certo
export function problemaNoEmailInstitucional(email: string): string | null {
  if (!formatoDeEmailValido(email)) {
    return 'Digite um e-mail válido. Exemplo: nome@prefeitura.gov.br';
  }
  if (!dominioAceito(email)) {
    return `Use o e-mail da prefeitura (o endereço precisa terminar em ${DOMINIOS_ACEITOS.join(' ou ')}).`;
  }
  return null;
}
