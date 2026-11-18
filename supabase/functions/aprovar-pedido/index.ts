// [integração] função que roda no SERVIDOR do Supabase (Edge Function), não no celular
// por que precisa disso: convidar alguém (mandar o e-mail com o código) exige a chave secreta
// (service_role). Essa chave NUNCA pode ir pro app, então ela fica só aqui no servidor,
// e o Supabase já entrega ela sozinho pra função (SUPABASE_SERVICE_ROLE_KEY)
//
// o que a função faz:
//   1. confere se quem chamou ta logado e é admin (fgrcm_papel = admin no app_metadata)
//   2. aprovar, de 2 jeitos (a administração escolhe no app):
//      * modo "senha": cria a conta com uma senha provisória e devolve ela pra administração
//        passar pra pessoa (não precisa de e-mail configurado; a pessoa troca a senha no 1º acesso)
//      * modo "convite": o Supabase cria a conta e manda o e-mail com o código (precisa do SMTP)
//      nos dois casos grava prefeitura/município/estado na conta e marca o pedido como aprovado
//   3. recusar: só marca o pedido como recusado (com o motivo)
//
// como publicar (sem instalar nada): painel do Supabase > Edge Functions > Deploy a new function
// > Via Editor > nome: aprovar-pedido > cole este arquivo inteiro > Deploy
import { createClient } from 'npm:@supabase/supabase-js@2';

// libera o navegador (localhost) a chamar a função
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// senha provisória fácil de digitar e que já passa na regra do app
// (mais de 10 caracteres, maiúscula, número e símbolo). Ex: Fgrc#4821kmtq
function senhaProvisoria() {
  const n = new Uint32Array(5);
  crypto.getRandomValues(n);
  const letras = 'abcdefghjkmnpqrstuvwxyz'; // sem i, l e o pra não confundir com 1 e 0
  const numeros = String(n[0] % 10000).padStart(4, '0');
  const fim = Array.from(n.slice(1)).map(v => letras[v % letras.length]).join('');
  return `Fgrc#${numeros}${fim}`;
}

function resposta(status: number, corpo: Record<string, unknown>) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return resposta(405, { erro: 'Use POST' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const chaveSecreta = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  // daqui pra baixo usa a chave secreta (só existe no servidor)
  const comoServidor = createClient(url, chaveSecreta, { auth: { persistSession: false } });

  // 1) quem ta chamando? (o app manda o crachá de login no cabeçalho: "Bearer <token>")
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: quem } = await comoServidor.auth.getUser(token);
  if (!quem.user || quem.user.app_metadata?.fgrcm_papel !== 'admin') {
    return resposta(403, { erro: 'Só a administração pode fazer isso.' });
  }

  let corpo: { pedidoId?: string; acao?: string; observacao?: string; modo?: string };
  try { corpo = await req.json(); } catch { return resposta(400, { erro: 'Pedido inválido.' }); }
  const { pedidoId, acao } = corpo;
  const observacao = typeof corpo.observacao === 'string' ? corpo.observacao.slice(0, 500) : null;
  if (!pedidoId || (acao !== 'aprovar' && acao !== 'recusar')) {
    return resposta(400, { erro: 'Faltou o pedido ou a ação.' });
  }

  const { data: pedido, error: erroPedido } = await comoServidor
    .from('access_requests').select('*').eq('id', pedidoId).single();
  if (erroPedido || !pedido) return resposta(404, { erro: 'Pedido não encontrado.' });
  if (pedido.status !== 'pendente') return resposta(409, { erro: 'Esse pedido já foi analisado.' });

  const agora = new Date().toISOString();

  if (acao === 'recusar') {
    await comoServidor.from('access_requests')
      .update({ status: 'recusado', analisado_em: agora, observacao })
      .eq('id', pedidoId);
    return resposta(200, { ok: true, mensagem: 'Pedido recusado.' });
  }

  const dadosDaPrefeitura = {
    prefeitura: pedido.prefeitura,
    municipio: pedido.municipio,
    estado: pedido.estado,
  };

  // 2a) aprovar com senha provisória (padrão enquanto o e-mail não ta configurado)
  if (corpo.modo !== 'convite') {
    const senha = senhaProvisoria();
    const { error: erroCriar } = await comoServidor.auth.admin.createUser({
      email: pedido.email,
      password: senha,
      email_confirm: true, // a administração já conferiu o pedido
      user_metadata: { nome_completo: pedido.nome, senha_provisoria: true },
      app_metadata: dadosDaPrefeitura,
    });
    if (erroCriar) {
      const jaExiste = /already|registered|exists/i.test(erroCriar.message);
      return resposta(400, {
        erro: jaExiste
          ? 'Esse e-mail já tem conta. A pessoa pode usar "Esqueci minha senha".'
          : 'Não foi possível criar a conta. Tente de novo.',
      });
    }
    await comoServidor.from('access_requests')
      .update({ status: 'aprovado', analisado_em: agora, observacao })
      .eq('id', pedidoId);
    return resposta(200, {
      ok: true,
      senhaProvisoria: senha,
      mensagem: `Conta criada para ${pedido.email}. Passe a senha provisória para a pessoa; ela vai trocar no primeiro acesso.`,
    });
  }

  // 2b) aprovar por convite: o Supabase cria a conta e manda o e-mail "Invite user" com o código ({{ .Token }})
  const { data: convite, error: erroConvite } = await comoServidor.auth.admin.inviteUserByEmail(
    pedido.email,
    { data: { nome_completo: pedido.nome } },
  );
  if (erroConvite || !convite.user) {
    const jaExiste = /already|registered|exists/i.test(erroConvite?.message ?? '');
    return resposta(400, {
      erro: jaExiste
        ? 'Esse e-mail já tem conta. A pessoa pode usar "Esqueci minha senha".'
        : 'Não foi possível enviar o convite. Confira as configurações de e-mail (SMTP) do Supabase.',
    });
  }

  // prefeitura, município e estado vão pro app_metadata (a pessoa não consegue mudar depois)
  await comoServidor.auth.admin.updateUserById(convite.user.id, {
    app_metadata: dadosDaPrefeitura,
  });

  await comoServidor.from('access_requests')
    .update({ status: 'aprovado', analisado_em: agora, observacao })
    .eq('id', pedidoId);

  return resposta(200, { ok: true, mensagem: `Convite enviado para ${pedido.email}.` });
});
