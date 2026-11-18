// FGRC-M | função do servidor pra área administrativa (Edge Function do Supabase)
// tudo que precisa da chave secreta (service_role) fica aqui, NUNCA no app:
//   * aprovar pedido: com senha provisória, com código de ativação (a administração passa o código)
//     ou mandando o código por e-mail (esse precisa do SMTP configurado no Supabase)
//   * recusar pedido (com motivo)
//   * novo acesso pra quem perdeu: nova senha provisória, novo código ou reenviar o código por e-mail
//   * listar as contas cadastradas e desativar/reativar uma conta
// antes de qualquer coisa a função pergunta pro banco se quem chamou é admin (estado_admin_fgrcm)
// assim a regra de "quem é admin" fica num lugar só: a tabela public.administradores (+ MFA se ativado)
//
// publicar: o arquivo também ta em supabase/functions/admin-fgrcm/index.ts
// (painel > Edge Functions > admin-fgrcm > Code > cole > Deploy)
import { createClient, type User } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resposta(status: number, corpo: Record<string, unknown>) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

// senha provisória fácil de digitar que já passa na regra do app (10+ caracteres, maiúscula, minúscula, número e símbolo)
// ex: Fgrc#4821kmtq (sem i, l e o pra não confundir com 1 e 0)
function senhaProvisoria() {
  const n = new Uint32Array(5);
  crypto.getRandomValues(n);
  const letras = 'abcdefghjkmnpqrstuvwxyz';
  const numeros = String(n[0] % 10000).padStart(4, '0');
  const fim = Array.from(n.slice(1)).map((v) => letras[v % letras.length]).join('');
  return `Fgrc#${numeros}${fim}`;
}

const uuidValido = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

// traduz os erros de envio de e-mail do Supabase pra uma frase que a administração entende
function erroDeEmail(erro: { code?: string; status?: number; message?: string } | null): string {
  const codigo = erro?.code ?? '';
  if (codigo === 'email_address_not_authorized') {
    return 'O envio de e-mail do Supabase ainda não foi configurado (SMTP): sem isso ele só manda pra quem é da equipe do projeto. Use o código de ativação ou a senha provisória.';
  }
  if (codigo === 'email_address_invalid') {
    return 'Esse e-mail não existe ou não recebe mensagens. Confira o endereço, ou use o código de ativação ou a senha provisória.';
  }
  if (codigo === 'over_email_send_rate_limit' || erro?.status === 429) {
    return 'Limite de e-mails por hora do Supabase atingido. Espere um pouco ou use o código de ativação.';
  }
  return 'Não foi possível enviar o e-mail. Confira o envio de e-mail (SMTP) do Supabase ou use o código de ativação.';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return resposta(405, { erro: 'Use POST' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const chavePublica = Deno.env.get('SUPABASE_ANON_KEY')!;
  const chaveSecreta = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const autorizacao = req.headers.get('Authorization') ?? '';

  // 1) quem ta chamando? o banco responde usando o próprio crachá (JWT) da pessoa
  const comoPessoa = createClient(url, chavePublica, {
    global: { headers: { Authorization: autorizacao } },
    auth: { persistSession: false },
  });
  const { data: quem } = await comoPessoa.auth.getUser();
  if (!quem.user) return resposta(401, { erro: 'Entre de novo na área administrativa.' });

  const { data: estado, error: erroEstado } = await comoPessoa.rpc('estado_admin_fgrcm');
  if (erroEstado) return resposta(500, { erro: 'Não foi possível conferir a permissão. Tente de novo.' });
  if (estado === 'precisa_mfa') return resposta(403, { erro: 'Digite o código de verificação em duas etapas para continuar.' });
  if (estado !== 'ok') return resposta(403, { erro: 'Só a administração pode fazer isso.' });

  const admin = { id: quem.user.id, email: quem.user.email ?? null };

  let corpo: { acao?: string; pedidoId?: string; modo?: string; observacao?: string; userId?: string; email?: string };
  try {
    corpo = await req.json();
  } catch {
    return resposta(400, { erro: 'Pedido inválido.' });
  }
  const acao = corpo.acao;
  const observacao = typeof corpo.observacao === 'string' && corpo.observacao.trim()
    ? corpo.observacao.trim().slice(0, 500)
    : null;

  // daqui pra baixo usa a chave secreta (só existe no servidor)
  const servidor = createClient(url, chaveSecreta, { auth: { persistSession: false } });
  // cliente "comum" do servidor: só pra pedir o código por e-mail (igual o app faz)
  const publico = createClient(url, chavePublica, { auth: { persistSession: false } });

  // grava no histórico as ações que não passam pelos gatilhos do banco
  // (quando veio de um pedido, grava no pedido pra aparecer no histórico dele)
  async function registrar(acaoLog: string, tabela: string, registroId: string, para: string | null, detalhes: Record<string, unknown>) {
    await servidor.from('admin_audit_logs').insert({
      admin_id: admin.id, admin_email: admin.email, acao: acaoLog, tabela, registro_id: registroId, para, detalhes,
    });
  }

  // acha a conta pelo id ou pelo e-mail (o Supabase não tem busca por e-mail, então percorre a lista)
  async function acharConta(userId?: string, email?: string): Promise<User | null> {
    if (uuidValido(userId)) {
      const { data } = await servidor.auth.admin.getUserById(userId);
      return data.user ?? null;
    }
    const alvo = (email ?? '').trim().toLowerCase();
    if (!alvo) return null;
    for (let pagina = 1; pagina <= 20; pagina++) {
      const { data, error } = await servidor.auth.admin.listUsers({ page: pagina, perPage: 1000 });
      if (error) return null;
      const achou = data.users.find((u) => (u.email ?? '').toLowerCase() === alvo);
      if (achou) return achou;
      if (data.users.length < 1000) break;
    }
    return null;
  }

  // gera um código de 6 números (sem mandar e-mail) pra administração passar pra pessoa
  // conta que ainda não ativou = código de convite; conta já ativa = código de entrada
  // a pessoa usa em "Ativar acesso" (e-mail + código) e cria a senha dela
  async function gerarCodigo(conta: User): Promise<string | null> {
    const tipo = conta.email_confirmed_at ? 'magiclink' : 'invite';
    const { data, error } = await servidor.auth.admin.generateLink({ type: tipo, email: conta.email! });
    if (error) return null;
    return data.properties?.email_otp ?? null;
  }

  // ---------------- pedidos de acesso ----------------
  if (acao === 'aprovar' || acao === 'recusar') {
    if (!uuidValido(corpo.pedidoId)) return resposta(400, { erro: 'Pedido não informado.' });
    const { data: pedido } = await servidor.from('access_requests').select('*').eq('id', corpo.pedidoId).maybeSingle();
    if (!pedido) return resposta(404, { erro: 'Pedido não encontrado.' });
    if (pedido.status !== 'pendente') return resposta(409, { erro: 'Esse pedido já foi analisado.' });

    // o gatilho do banco grava o histórico usando esses campos
    const decisao = { analisado_em: new Date().toISOString(), analisado_por: admin.id, analisado_por_email: admin.email, observacao };

    if (acao === 'recusar') {
      const { error } = await servidor.from('access_requests')
        .update({ status: 'recusado', ...decisao }).eq('id', pedido.id).eq('status', 'pendente');
      if (error) return resposta(500, { erro: 'Não foi possível recusar. Tente de novo.' });
      return resposta(200, { ok: true, mensagem: 'Pedido recusado.' });
    }

    // prefeitura, município e estado vão pro app_metadata (a pessoa não consegue mudar depois)
    const dadosDaPrefeitura = { prefeitura: pedido.prefeitura, municipio: pedido.municipio, estado: pedido.estado };
    const jaTemConta = 'Esse e-mail já tem conta. Use "Novo acesso" na aba Contas para gerar uma senha ou um código novo.';
    let senha: string | null = null;
    let codigo: string | null = null;

    if (corpo.modo === 'convite') {
      // o Supabase cria a conta e manda o e-mail "Invite user" com o código ({{ .Token }}) - precisa do SMTP
      // se o envio falhar, o Supabase desfaz a criação da conta (dá pra tentar de outro jeito em seguida)
      const { data: convite, error } = await servidor.auth.admin.inviteUserByEmail(pedido.email, {
        data: { nome_completo: pedido.nome },
      });
      if (error || !convite.user) {
        if (error?.code === 'email_exists' || /already|registered|exists/i.test(error?.message ?? '')) return resposta(400, { erro: jaTemConta });
        return resposta(400, { erro: erroDeEmail(error) });
      }
      await servidor.auth.admin.updateUserById(convite.user.id, { app_metadata: dadosDaPrefeitura });
    } else if (corpo.modo === 'codigo') {
      // cria a conta "convidada" e devolve o código pra administração passar (não depende de e-mail)
      const { data: link, error } = await servidor.auth.admin.generateLink({
        type: 'invite',
        email: pedido.email,
        options: { data: { nome_completo: pedido.nome } },
      });
      if (error || !link.user || !link.properties?.email_otp) {
        if (error?.code === 'email_exists' || /already|registered|exists/i.test(error?.message ?? '')) return resposta(400, { erro: jaTemConta });
        return resposta(400, { erro: 'Não foi possível gerar o código. Tente de novo ou use a senha provisória.' });
      }
      await servidor.auth.admin.updateUserById(link.user.id, { app_metadata: dadosDaPrefeitura });
      codigo = link.properties.email_otp;
    } else {
      // senha provisória: não depende de e-mail; a pessoa troca no primeiro acesso
      senha = senhaProvisoria();
      const { error } = await servidor.auth.admin.createUser({
        email: pedido.email,
        password: senha,
        email_confirm: true, // a administração já conferiu o pedido
        user_metadata: { nome_completo: pedido.nome, senha_provisoria: true },
        app_metadata: dadosDaPrefeitura,
      });
      if (error) {
        if (error.code === 'email_exists' || /already|registered|exists/i.test(error.message)) return resposta(400, { erro: jaTemConta });
        return resposta(400, { erro: 'Não foi possível criar a conta. Tente de novo.' });
      }
    }

    const { error: erroUpdate } = await servidor.from('access_requests')
      .update({ status: 'aprovado', ...decisao }).eq('id', pedido.id).eq('status', 'pendente');
    if (erroUpdate) {
      return resposta(500, { erro: 'A conta foi criada, mas o pedido não foi marcado como aprovado. Atualize a lista.' });
    }

    return resposta(200, {
      ok: true,
      senhaProvisoria: senha,
      codigo,
      mensagem: senha
        ? `Conta criada para ${pedido.email}. Passe a senha provisória para a pessoa; ela troca no primeiro acesso.`
        : codigo
          ? `Conta criada para ${pedido.email}. Passe o código para a pessoa usar em "Ativar acesso".`
          : `Convite enviado por e-mail para ${pedido.email}.`,
    });
  }

  // ---------------- novo acesso (perdeu a senha provisória ou o código) ----------------
  if (acao === 'novo_acesso') {
    const conta = await acharConta(corpo.userId, corpo.email);
    if (!conta || !conta.email) return resposta(404, { erro: 'Conta não encontrada. O pedido foi aprovado?' });
    const { data: ehAdmin } = await servidor.from('administradores').select('user_id').eq('user_id', conta.id).maybeSingle();
    if (ehAdmin) return resposta(400, { erro: 'Contas de administração só podem ser alteradas pelo painel do Supabase.' });
    if (conta.banned_until && new Date(conta.banned_until).getTime() > Date.now()) {
      return resposta(400, { erro: 'Essa conta está desativada. Reative na aba Contas antes de gerar um novo acesso.' });
    }
    // quando veio da tela do pedido, o histórico fica no pedido; senão, na conta
    const tabela = uuidValido(corpo.pedidoId) ? 'access_requests' : 'auth.users';
    const registroId = uuidValido(corpo.pedidoId) ? corpo.pedidoId : conta.id;

    if (corpo.modo === 'senha') {
      const senha = senhaProvisoria();
      const { error } = await servidor.auth.admin.updateUserById(conta.id, {
        password: senha,
        email_confirm: true,
        user_metadata: { ...(conta.user_metadata ?? {}), senha_provisoria: true },
      });
      if (error) return resposta(500, { erro: 'Não foi possível gerar a senha. Tente de novo.' });
      await registrar('acesso_senha_provisoria', tabela, registroId, 'nova senha provisória', { email: conta.email });
      return resposta(200, { ok: true, senhaProvisoria: senha, mensagem: `Nova senha provisória gerada para ${conta.email}. A senha anterior parou de funcionar.` });
    }

    if (corpo.modo === 'codigo') {
      const codigo = await gerarCodigo(conta);
      if (!codigo) return resposta(500, { erro: 'Não foi possível gerar o código. Tente de novo.' });
      await registrar('acesso_codigo_gerado', tabela, registroId, 'novo código de ativação', { email: conta.email });
      return resposta(200, { ok: true, codigo, mensagem: `Código gerado para ${conta.email}. O código anterior parou de funcionar.` });
    }

    if (corpo.modo === 'email') {
      // conta que ainda não ativou: reenvia o convite. Conta ativa: manda um código de entrada
      const { error } = conta.email_confirmed_at
        ? await publico.auth.signInWithOtp({ email: conta.email, options: { shouldCreateUser: false } })
        : await servidor.auth.admin.inviteUserByEmail(conta.email);
      if (error) return resposta(400, { erro: erroDeEmail(error) });
      await registrar('acesso_codigo_por_email', tabela, registroId, 'código enviado por e-mail', { email: conta.email });
      return resposta(200, { ok: true, mensagem: `Código enviado por e-mail para ${conta.email}.` });
    }

    return resposta(400, { erro: 'Escolha senha, código ou e-mail.' });
  }

  // ---------------- contas cadastradas ----------------
  if (acao === 'listar_usuarios') {
    const { data, error } = await servidor.auth.admin.listUsers({ page: 1, perPage: 500 });
    if (error) return resposta(500, { erro: 'Não foi possível listar as contas.' });
    const { data: admins } = await servidor.from('administradores').select('user_id').eq('ativo', true);
    const idsAdmin = new Set((admins ?? []).map((a: { user_id: string }) => a.user_id));
    const agora = Date.now();
    const usuarios = data.users.map((u) => ({
      id: u.id,
      email: u.email ?? '',
      nome: (u.user_metadata?.nome_completo as string | undefined) ?? null,
      prefeitura: (u.app_metadata?.prefeitura as string | undefined) ?? null,
      municipio: (u.app_metadata?.municipio as string | undefined) ?? null,
      estado: (u.app_metadata?.estado as string | undefined) ?? null,
      criado_em: u.created_at,
      ultimo_acesso: u.last_sign_in_at ?? null,
      // banned_until no futuro = conta desativada
      desativado: Boolean(u.banned_until && new Date(u.banned_until).getTime() > agora),
      confirmado: Boolean(u.email_confirmed_at),
      admin: idsAdmin.has(u.id),
    }));
    return resposta(200, { ok: true, usuarios });
  }

  if (acao === 'desativar_usuario' || acao === 'reativar_usuario') {
    if (!uuidValido(corpo.userId)) return resposta(400, { erro: 'Conta não informada.' });
    if (corpo.userId === admin.id) return resposta(400, { erro: 'Você não pode desativar a sua própria conta.' });
    const { data: ehAdmin } = await servidor.from('administradores').select('user_id').eq('user_id', corpo.userId).maybeSingle();
    if (ehAdmin) return resposta(400, { erro: 'Contas de administração só podem ser alteradas pelo painel do Supabase.' });

    const desativar = acao === 'desativar_usuario';
    // ban_duration grande = conta bloqueada (não consegue entrar); 'none' = libera de novo
    const { data, error } = await servidor.auth.admin.updateUserById(corpo.userId, {
      ban_duration: desativar ? '876000h' : 'none',
    });
    if (error) return resposta(500, { erro: 'Não foi possível alterar a conta.' });
    await registrar(desativar ? 'conta_desativada' : 'conta_reativada', 'auth.users', corpo.userId, desativar ? 'desativada' : 'ativa', { email: data.user?.email, motivo: observacao });
    return resposta(200, { ok: true, mensagem: desativar ? 'Conta desativada.' : 'Conta reativada.' });
  }

  return resposta(400, { erro: 'Ação desconhecida.' });
});
