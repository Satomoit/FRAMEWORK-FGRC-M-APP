// FGRC-M | avisos por e-mail "solicitação recebida" e "solicitação aprovada" (pedido de 19/11/2026)
// usado pelas funções do servidor notificacoes-fgrcm (pedido recebido) e admin-fgrcm (pedido aprovado)
// NÃO substitui os e-mails do login (convite com código, código de entrada e troca de senha):
// esses continuam saindo pelo Supabase Auth, com o SMTP configurado no painel
//
// como funciona:
//   1) reserva o aviso no banco (fgrcm_reservar_notificacao): se já foi enviado, não manda de novo
//   2) se o provedor de e-mail não ta configurado, grava "nao_configurado" e NÃO finge que mandou
//   3) manda pelo provedor configurado nos segredos da função (nunca no app nem no repositório)
//   4) grava o resultado: "enviado" só quando o provedor confirmou que aceitou a mensagem
//
// segredos (painel > Edge Functions > Secrets), escolha UM provedor:
//   EMAIL_PROVEDOR   = "smtp" ou "resend"
//   EMAIL_REMETENTE  = ex: "FGRC-M <endereco-do-projeto@gmail.com>"
//   pra "smtp":   SMTP_HOST (ex: smtp.gmail.com), SMTP_PORT = 465, SMTP_USUARIO, SMTP_SENHA (senha de app do Gmail)
//   pra "resend": RESEND_API_KEY (precisa de um domínio verificado no Resend)
// obs: as Edge Functions do Supabase bloqueiam as portas 25 e 587, por isso o SMTP tem que ser na 465

export type EventoEmail = 'pedido_recebido' | 'pedido_aprovado';
// como a pessoa vai ativar a conta depois da aprovação (muda o texto do e-mail de aprovação)
// 'pendente' = conta criada mas ainda não ativada, sem saber se o código foi por e-mail ou pela equipe (usado ao reenviar)
export type Ativacao = 'convite' | 'codigo' | 'senha' | 'pendente' | 'ja_ativa';
export type ResultadoAviso = {
  status: 'enviado' | 'falhou' | 'nao_configurado' | 'ja_enviado' | 'em_andamento';
  erro?: string;
};

export type DadosDoPedido = {
  id: string;
  nome: string;
  email: string;
  prefeitura: string;
  municipio?: string | null;
  estado?: string | null;
};

type ConfigSmtp = { provedor: 'smtp'; remetente: string; host: string; porta: number; usuario: string; senha: string };
type ConfigResend = { provedor: 'resend'; remetente: string; chave: string };
export type ConfigEnvio = ConfigSmtp | ConfigResend;

// ------------------------------------------------------------------ textos

// troca < > & " ' por códigos, pra o nome digitado pela pessoa não virar HTML dentro do e-mail
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// tira quebra de linha e espaço sobrando (o nome vai no assunto e no texto)
function limpar(texto: string | null | undefined): string {
  return (texto ?? '').replace(/\s+/g, ' ').trim();
}

// "Prefeitura Municipal de Andradas" fica igual; "Andradas" vira "Prefeitura de Andradas"
// (assim não aparece "Prefeitura de Prefeitura de ...")
export function nomeDaPrefeitura(prefeitura: string): string {
  const p = limpar(prefeitura);
  if (!p) return 'sua prefeitura';
  return /^prefeitura\b/i.test(p) ? p : `Prefeitura de ${p}`;
}


type Conteudo = { assunto: string; titulo: string; paragrafos: string[] };

function conteudoDo(evento: EventoEmail, dados: DadosDoPedido, ativacao: Ativacao): Conteudo {
  const prefeitura = nomeDaPrefeitura(dados.prefeitura);
  if (evento === 'pedido_recebido') {
    return {
      assunto: 'FGRC-M | Solicitação de acesso recebida',
      titulo: 'Solicitação de acesso recebida',
      paragrafos: [
        `Recebemos sua solicitação de acesso ao FGRC-M, vinculada à ${prefeitura}.`,
        'Sua solicitação foi registrada com sucesso e será analisada pela nossa equipe administrativa.',
        'No momento, você ainda não possui acesso às funcionalidades restritas do aplicativo.',
        'Assim que a análise for concluída, enviaremos uma nova notificação informando o resultado.',
      ],
    };
  }
  // aprovado: a última parte muda conforme o jeito de ativar (não manda ativar quem já ativou)
  const proximoPasso: Record<Ativacao, string> = {
    convite:
      'O código de ativação chega em outro e-mail, enviado separadamente. No aplicativo, toque em "Seu pedido foi aprovado? Ativar acesso", digite seu e-mail e o código e crie a sua senha.',
    codigo:
      'A equipe do FGRC-M vai passar o código de ativação para você. No aplicativo, toque em "Seu pedido foi aprovado? Ativar acesso", digite seu e-mail e o código e crie a sua senha.',
    senha:
      'A equipe do FGRC-M vai passar uma senha provisória para você. Entre no aplicativo com seu e-mail e essa senha; no primeiro acesso, o aplicativo pede para você criar uma senha nova.',
    pendente:
      'Para ativar, use o código de ativação que você recebeu por e-mail ou que a equipe do FGRC-M passou para você: no aplicativo, toque em "Seu pedido foi aprovado? Ativar acesso". Se você recebeu uma senha provisória, entre com ela e crie uma senha nova. Se não recebeu nada, fale com o suporte pelo aplicativo.',
    ja_ativa: 'Sua conta já está ativa. Entre no aplicativo com seu e-mail e a sua senha.',
  };
  return {
    assunto: 'FGRC-M | Solicitação de acesso aprovada',
    titulo: 'Solicitação de acesso aprovada',
    paragrafos: [
      `Sua solicitação de acesso ao FGRC-M, vinculada à ${prefeitura}, foi aprovada!`,
      ativacao === 'ja_ativa'
        ? 'Você já pode acessar as funcionalidades do aplicativo.'
        : 'Agora você poderá concluir a ativação da sua conta e acessar as funcionalidades do aplicativo.',
      proximoPasso[ativacao],
    ],
  };
}

// monta assunto, HTML e texto simples (o texto simples é pra quem lê e-mail sem formatação)
export function montarEmail(evento: EventoEmail, dados: DadosDoPedido, ativacao: Ativacao = 'convite') {
  const c = conteudoDo(evento, dados, ativacao);
  // sem nome (não deveria acontecer, o formulário exige) fica só "Olá!"
  const ola = limpar(dados.nome) ? `Olá, ${limpar(dados.nome)}!` : 'Olá!';
  const texto = [ola, '', ...c.paragrafos.flatMap(p => [p, '']), 'Atenciosamente,', 'Equipe FGRC-M', '',
    'Esta é uma mensagem automática do FGRC-M — Framework de Gestão de Riscos Cibernéticos Municipal. Não é preciso responder.'].join('\n');

  // HTML simples em tabela (é o que funciona em quase todo programa de e-mail)
  // largura máxima de 600 px e 100% no celular; cores do app (azul #10558D e laranja #D76C19)
  const p = (t: string) => `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#152842;">${escaparHtml(t)}</p>`;
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escaparHtml(c.assunto)}</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FB;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${escaparHtml(c.paragrafos[0])}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FB;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #D9E1E9;border-radius:8px;">
<tr><td style="background:#10558D;padding:20px 24px;border-radius:8px 8px 0 0;border-bottom:4px solid #D76C19;">
<p style="margin:0;font-size:22px;font-weight:bold;color:#FFFFFF;letter-spacing:1px;">FGRC-M</p>
<p style="margin:4px 0 0 0;font-size:13px;color:#DCEAF6;">Framework de Gestão de Riscos Cibernéticos Municipal</p>
</td></tr>
<tr><td style="padding:28px 24px 8px 24px;">
<h1 style="margin:0 0 20px 0;font-size:20px;line-height:1.3;color:#10558D;">${escaparHtml(c.titulo)}</h1>
${p(ola)}
${c.paragrafos.map(p).join('\n')}
<p style="margin:24px 0 0 0;font-size:16px;line-height:1.6;color:#152842;">Atenciosamente,<br><strong>Equipe FGRC-M</strong></p>
</td></tr>
<tr><td style="padding:20px 24px 24px 24px;">
<p style="margin:0;padding-top:16px;border-top:1px solid #D9E1E9;font-size:12px;line-height:1.5;color:#566A82;">Esta é uma mensagem automática do FGRC-M. Não é preciso responder. Se você não fez esta solicitação, pode ignorar este e-mail.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  return { assunto: c.assunto, html, texto };
}

// ------------------------------------------------------------------ configuração do envio

// lê os segredos da função; devolve null quando falta alguma coisa (aí NÃO tenta mandar)
// o "erro" explica o que falta, sem mostrar nenhum valor de segredo
export function configuracaoDoEnvio(ler: (nome: string) => string | undefined): { config: ConfigEnvio | null; erro?: string } {
  const provedor = (ler('EMAIL_PROVEDOR') ?? '').trim().toLowerCase();
  const remetente = (ler('EMAIL_REMETENTE') ?? '').trim();
  if (!provedor) return { config: null, erro: 'provedor_nao_configurado' };
  if (!remetente) return { config: null, erro: 'remetente_nao_configurado' };
  if (provedor === 'resend') {
    const chave = (ler('RESEND_API_KEY') ?? '').trim();
    return chave ? { config: { provedor: 'resend', remetente, chave } } : { config: null, erro: 'resend_sem_chave' };
  }
  if (provedor === 'smtp') {
    const host = (ler('SMTP_HOST') ?? '').trim();
    const porta = Number(ler('SMTP_PORT') ?? '465');
    const usuario = (ler('SMTP_USUARIO') ?? '').trim();
    const senha = ler('SMTP_SENHA') ?? '';
    if (!host || !usuario || !senha) return { config: null, erro: 'smtp_incompleto' };
    // as Edge Functions do Supabase bloqueiam 25 e 587 (a mensagem nunca sairia)
    if (porta === 25 || porta === 587 || !Number.isInteger(porta)) return { config: null, erro: 'smtp_porta_bloqueada_use_465' };
    return { config: { provedor: 'smtp', remetente, host, porta, usuario, senha } };
  }
  return { config: null, erro: 'provedor_desconhecido' };
}

// ------------------------------------------------------------------ envio

type Mensagem = { para: string; assunto: string; html: string; texto: string };
type RespostaEnvio = { ok: true; id: string } | { ok: false; erro: string };

// dependências que dá pra trocar no teste (assim o teste nunca manda e-mail de verdade)
export type Dependencias = {
  fetch: typeof fetch;
  carregarNodemailer: () => Promise<{ createTransport: (opcoes: unknown) => { sendMail: (m: unknown) => Promise<{ messageId?: string; accepted?: unknown[]; rejected?: unknown[] }> } }>;
};

export const dependenciasReais: Dependencias = {
  fetch: (...a) => fetch(...a),
  // só carrega o nodemailer quando o provedor é smtp
  carregarNodemailer: async () => (await import('npm:nodemailer@6.9.16')).default,
};

export async function enviarEmail(config: ConfigEnvio, m: Mensagem, deps: Dependencias = dependenciasReais): Promise<RespostaEnvio> {
  try {
    if (config.provedor === 'resend') {
      const r = await deps.fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.chave}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: config.remetente, to: [m.para], subject: m.assunto, html: m.html, text: m.texto }),
      });
      const json = await r.json().catch(() => null) as { id?: string; name?: string } | null;
      // só conta como enviado quando o Resend respondeu OK e devolveu o id da mensagem
      if (r.ok && json?.id) return { ok: true, id: json.id };
      return { ok: false, erro: `resend_${r.status}${json?.name ? `_${json.name}` : ''}` };
    }
    const nodemailer = await deps.carregarNodemailer();
    const transporte = nodemailer.createTransport({
      host: config.host,
      port: config.porta,
      secure: config.porta === 465, // 465 = conexão já criptografada desde o começo
      auth: { user: config.usuario, pass: config.senha },
    });
    const info = await transporte.sendMail({ from: config.remetente, to: m.para, subject: m.assunto, html: m.html, text: m.texto });
    const aceitos = (info.accepted ?? []).map(String).map(e => e.toLowerCase());
    // o servidor SMTP tem que ter aceitado esse destinatário (senão não é "enviado")
    if (aceitos.includes(m.para.toLowerCase()) && !(info.rejected ?? []).length) {
      return { ok: true, id: info.messageId ?? 'smtp' };
    }
    return { ok: false, erro: 'smtp_destinatario_recusado' };
  } catch (e) {
    // guarda só o código do erro (nunca a senha, nunca o texto do e-mail)
    const codigo = (e as { code?: string; responseCode?: number })?.code ?? (e as { responseCode?: number })?.responseCode ?? 'erro_desconhecido';
    return { ok: false, erro: `${config.provedor}_${String(codigo)}`.slice(0, 200) };
  }
}

// ------------------------------------------------------------------ fluxo completo de um aviso

// cliente do Supabase com a chave secreta (só o pedaço que a gente usa)
type ClienteServidor = {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message?: string; code?: string } | null }>;
};

export async function notificar(
  servidor: ClienteServidor,
  evento: EventoEmail,
  pedido: DadosDoPedido,
  opcoes: { ativacao?: Ativacao; ler: (nome: string) => string | undefined; deps?: Dependencias },
): Promise<ResultadoAviso> {
  // 1) reserva (evita aviso repetido, inclusive com duas chamadas ao mesmo tempo)
  const { data: reserva, error: erroReserva } = await servidor.rpc('fgrcm_reservar_notificacao', {
    p_evento: evento, p_pedido: pedido.id, p_destinatario: pedido.email,
  });
  if (erroReserva) {
    console.error('aviso por e-mail: não deu pra reservar', erroReserva.code ?? '');
    return { status: 'falhou', erro: 'registro_indisponivel' };
  }
  if (reserva === 'ja_enviado' || reserva === 'em_andamento') return { status: reserva };

  const concluir = (status: 'enviado' | 'falhou' | 'nao_configurado', provedor: string | null, id: string | null, erro: string | null) =>
    servidor.rpc('fgrcm_concluir_notificacao', {
      p_evento: evento, p_pedido: pedido.id, p_status: status, p_provedor: provedor, p_id_no_provedor: id, p_erro: erro,
    });

  // 2) sem provedor configurado: registra e avisa, sem fingir que mandou
  const { config, erro: erroConfig } = configuracaoDoEnvio(opcoes.ler);
  if (!config) {
    await concluir('nao_configurado', null, null, erroConfig ?? 'provedor_nao_configurado');
    return { status: 'nao_configurado', erro: erroConfig };
  }

  // 3) manda
  const email = montarEmail(evento, pedido, opcoes.ativacao ?? 'convite');
  const r = await enviarEmail(config, { para: pedido.email, assunto: email.assunto, html: email.html, texto: email.texto }, opcoes.deps);

  // 4) grava o resultado (o "enviado" só vem com a confirmação do provedor)
  if (r.ok) {
    await concluir('enviado', config.provedor, r.id, null);
    return { status: 'enviado' };
  }
  console.error('aviso por e-mail falhou', evento, r.erro);
  await concluir('falhou', config.provedor, null, r.erro);
  return { status: 'falhou', erro: r.erro };
}

// frase curta pra administração (aparece no painel depois de aprovar ou reenviar)
export function textoDoAviso(r: ResultadoAviso, evento: EventoEmail): string {
  const qual = evento === 'pedido_aprovado' ? 'O e-mail avisando a aprovação' : 'O e-mail de confirmação do pedido';
  switch (r.status) {
    case 'enviado': return `${qual} foi enviado.`;
    case 'ja_enviado': return `${qual} já tinha sido enviado antes (não foi mandado de novo).`;
    case 'em_andamento': return `${qual} está sendo enviado agora.`;
    case 'nao_configurado': return `${qual} NÃO foi enviado: o envio de avisos por e-mail ainda não está configurado no servidor.`;
    default: return `${qual} NÃO foi enviado (falha no envio). Dá para tentar de novo na solicitação.`;
  }
}
