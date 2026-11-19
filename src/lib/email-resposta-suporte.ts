// [integração B11] monta o link "mailto:" do botão "Responder por e-mail" da aba de suporte
// antes o link ia só com endereço e assunto, e o Gmail do Android colocava "undefined" no corpo
// agora o corpo já vai preenchido com uma saudação e a mensagem original embaixo (o Gmail não inventa nada)

type DadosDaMensagem = {
  email: string;
  nome?: string | null;
  assunto?: string | null;
  mensagem?: string | null;
};

// encodeURIComponent troca espaço, acento e quebra de linha por códigos que funcionam dentro de link
// a quebra de linha vai como \r\n (é o padrão dos e-mails, e o Gmail e o Outlook entendem)
function codificar(texto: string): string {
  return encodeURIComponent(texto.replace(/\r?\n/g, '\r\n'));
}

export function linkDeRespostaPorEmail(m: DadosDaMensagem): string {
  const nome = (m.nome ?? '').trim();
  const assunto = (m.assunto ?? '').trim() || 'sua mensagem';
  const original = (m.mensagem ?? '').trim();

  const corpo = [
    nome ? `Olá, ${nome}!` : 'Olá!',
    '',
    `Recebemos sua mensagem enviada pelo aplicativo FGRC-M sobre "${assunto}".`,
    '',
    '',
    'Atenciosamente,',
    'Equipe FGRC-M',
    // a mensagem original vai embaixo pra pessoa lembrar do que perguntou
    ...(original ? ['', '----- Mensagem original -----', original] : []),
  ].join('\n');

  // o endereço não passa pelo encode (o @ precisa continuar @), só assunto e corpo
  return `mailto:${m.email.trim()}?subject=${codificar(`Re: ${assunto} (FGRC-M)`)}&body=${codificar(corpo)}`;
}
