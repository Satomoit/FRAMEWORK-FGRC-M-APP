// [integração B12] tamanho do código de ativação da conta
// é o código que o Supabase manda no e-mail de aprovação (e o mesmo tipo que a administração gera no /admin)
// tem que bater com o "Email OTP Length" do painel do Supabase (Authentication > Sign In / Providers > Email)
// no teste de 18/11 o e-mail chegou com 8 números, por isso os textos agora falam em 8
// se um dia mudarem no painel, troca só aqui que todas as telas acompanham
export const DIGITOS_DO_CODIGO = 8;

// o painel do Supabase deixa configurar de 6 a 10 números, então o app aceita essa faixa toda
// (assim ninguém fica travado se o painel mudar antes de sair um app novo)
const MINIMO = 6;
const MAXIMO = 10;

// tira espaço, traço e qualquer coisa que não seja número (a pessoa pode colar "1234 5678")
export function limparCodigo(texto: string): string {
  return texto.replace(/\D/g, '');
}

export function codigoNoFormatoCerto(texto: string): boolean {
  const so = limparCodigo(texto);
  return so.length >= MINIMO && so.length <= MAXIMO;
}

// exemplo que aparece dentro do campo (ex: "12345678" quando o código tem 8 números)
export function exemploDeCodigo(): string {
  return '1234567890'.slice(0, DIGITOS_DO_CODIGO);
}

// frase usada nos textos das telas, ex: "código de 8 números"
export function descricaoDoCodigo(): string {
  return `código de ${DIGITOS_DO_CODIGO} números`;
}
