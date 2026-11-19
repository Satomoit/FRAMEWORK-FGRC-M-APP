// [integração 19/11] testes das funções do servidor (admin-fgrcm e notificacoes-fgrcm) SEM internet
// roda o código real das funções, mas com o Supabase, o Deno, o fetch e o nodemailer simulados:
// nenhum teste fala com o Supabase de verdade, apaga conta ou manda e-mail
// confere principalmente: quem pode excluir, a ordem segura da exclusão, o que acontece quando
// um passo falha no meio, e que o aviso por e-mail nunca diz "enviado" sem confirmação do provedor
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = process.argv[2] || path.resolve(__dirname, '..');

// ---------------------------------------------------------------- simulações
let cenario; // muda a cada teste
let handler; // o Deno.serve de cada função guarda o tratador aqui
const env = {};
global.Deno = { serve: fn => { handler = fn; }, env: { get: k => env[k] } };
global.fetch = async (...a) => cenario.fetch(...a);

function clienteFalso(chave) {
  const ehServidor = chave === 'chave-secreta';
  const chamada = (tipo, dados) => { cenario.log.push({ tipo, ...dados }); };
  const consulta = (tabela) => {
    const q = { tabela, op: 'select', filtros: [] };
    const fim = () => { chamada('tabela', { tabela, op: q.op, filtros: q.filtros, valores: q.valores }); return Promise.resolve(cenario.tabela(tabela, q)); };
    const b = {
      select() { return b; }, eq(k, v) { q.filtros.push([k, v]); return b; }, gte() { return b; }, order() { return b; }, limit() { return b; },
      update(v) { q.op = 'update'; q.valores = v; return b; },
      insert(v) { q.op = 'insert'; q.valores = v; return fim(); },
      maybeSingle: fim,
      then(ok, erro) { return fim().then(ok, erro); },
    };
    return b;
  };
  const admin = new Proxy({}, { get: (_, nome) => async (...args) => { chamada('admin', { nome, args }); return (cenario.admin[nome] || (() => ({ data: {}, error: null })))(...args); } });
  return {
    auth: {
      getUser: async () => ({ data: { user: cenario.quem } }),
      admin,
    },
    rpc: async (nome, args) => {
      chamada('rpc', { nome, args, servidor: ehServidor });
      if (!ehServidor && nome === 'estado_admin_fgrcm') return { data: cenario.estado, error: null };
      return (cenario.rpc[nome] || (() => ({ data: null, error: null })))(args);
    },
    from: consulta,
  };
}

const nodemailerFalso = { createTransport: (opcoes) => { cenario.log.push({ tipo: 'smtp', opcoes }); return { sendMail: async (m) => { cenario.log.push({ tipo: 'smtp-envio', m }); return cenario.smtp(m); } }; } };

const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req === 'npm:@supabase/supabase-js@2') return '__supabase_falso__';
  if (req.startsWith('npm:nodemailer')) return '__nodemailer_falso__';
  return orig.call(this, req, parent, ...r);
};
require.cache['__supabase_falso__'] = { id: '__supabase_falso__', filename: '__supabase_falso__', loaded: true, exports: { createClient: (_url, chave) => clienteFalso(chave) } };
require.cache['__nodemailer_falso__'] = { id: '__nodemailer_falso__', filename: '__nodemailer_falso__', loaded: true, exports: nodemailerFalso };
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);

const carregar = (p) => { handler = null; delete require.cache[path.join(raiz, p)]; require(path.join(raiz, p)); return handler; };
const adminFn = carregar('supabase/functions/admin-fgrcm/index.ts');
const avisoFn = carregar('supabase/functions/notificacoes-fgrcm/index.ts');
const E = require(path.join(raiz, 'supabase/functions/_shared/email-fgrcm.ts'));

Object.assign(env, { SUPABASE_URL: 'https://teste.local', SUPABASE_ANON_KEY: 'chave-publica', SUPABASE_SERVICE_ROLE_KEY: 'chave-secreta' });
const semProvedor = () => { for (const k of ['EMAIL_PROVEDOR', 'EMAIL_REMETENTE', 'RESEND_API_KEY', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USUARIO', 'SMTP_SENHA']) delete env[k]; };

const ADMIN = { id: '11111111-1111-4111-8111-111111111111', email: 'admin@teste' };
const PESSOA = { id: '22222222-2222-4222-8222-222222222222', email: 'pessoa@prefeitura.mg.gov.br', last_sign_in_at: null, email_confirmed_at: null, user_metadata: {} };
const PEDIDO = { id: '33333333-3333-4333-8333-333333333333', nome: 'Maria <b>Teste</b>', email: 'maria@prefeitura.mg.gov.br', prefeitura: 'Andradas', municipio: 'Andradas', estado: 'MG', status: 'pendente' };

function novoCenario(extra = {}) {
  semProvedor();
  return {
    log: [], quem: ADMIN, estado: 'ok',
    admin: { getUserById: async () => ({ data: { user: PESSOA }, error: null }), updateUserById: async () => ({ data: { user: PESSOA }, error: null }), deleteUser: async () => ({ data: {}, error: null }), createUser: async () => ({ data: { user: { id: 'nova' } }, error: null }), inviteUserByEmail: async () => ({ data: { user: { id: 'nova' } }, error: null }), generateLink: async () => ({ data: { user: { id: 'nova' }, properties: { email_otp: '12345678' } }, error: null }), listUsers: async () => ({ data: { users: [] }, error: null }) },
    rpc: {
      fgrcm_encerrar_sessoes: () => ({ data: 2, error: null }),
      fgrcm_excluir_dados_da_conta: () => ({ data: { pedidos_excluidos: 1, pedidos_anonimizados: 1, chamados_anonimizados: 2, respostas_anonimizadas: 1, avisos_anonimizados: 1, registros_anonimizados: 3 }, error: null }),
      fgrcm_excluir_pedido: () => ({ data: { status_anterior: 'pendente', registros_anonimizados: 0 }, error: null }),
      fgrcm_reservar_notificacao: () => ({ data: 'reservado', error: null }),
      fgrcm_concluir_notificacao: () => ({ data: null, error: null }),
    },
    tabela: (t, q) => {
      if (t === 'administradores') return { data: null, error: null };
      if (t === 'access_requests' && q.op === 'select') return { data: { ...PEDIDO }, error: null };
      return { data: null, error: null };
    },
    fetch: async () => { throw new Error('fetch não deveria ser chamado'); },
    smtp: async () => { throw new Error('smtp não deveria ser chamado'); },
    ...extra,
  };
}

async function chamar(fn, corpo, auth = 'Bearer token-da-pessoa') {
  const r = await fn(new Request('https://teste.local/fn', { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }));
  return { status: r.status, json: await r.json() };
}
const passos = () => cenario.log.filter(l => l.tipo === 'admin' || (l.tipo === 'rpc' && l.servidor) || l.tipo === 'smtp-envio' || l.tipo === 'fetch' || (l.tipo === 'tabela' && l.op === 'insert' && l.tabela === 'admin_audit_logs'))
  .map(l => l.tipo === 'admin' ? `admin.${l.nome}` : l.tipo === 'rpc' ? l.nome : l.tipo === 'tabela' ? `log:${l.valores.acao}` : l.tipo);

let f = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) f++; };
const EXCLUIR = { acao: 'excluir_usuario', userId: PESSOA.id, email: PESSOA.email, confirmacao: 'EXCLUIR' };

(async () => {
  // ---------------- quem pode ----------------
  cenario = novoCenario({ quem: null });
  let r = await chamar(adminFn, EXCLUIR);
  ok(r.status === 401 && passos().length === 0, 'sem login: 401 e nada é feito');

  cenario = novoCenario({ estado: 'precisa_mfa' });
  r = await chamar(adminFn, EXCLUIR);
  ok(r.status === 403 && /duas etapas/.test(r.json.erro) && passos().length === 0, 'admin com verificação em 2 etapas pendente (aal1): 403, pede o código, nada é feito');

  cenario = novoCenario({ estado: 'nao_admin' });
  r = await chamar(adminFn, EXCLUIR);
  ok(r.status === 403 && passos().length === 0, 'conta comum: 403 e nada é feito');

  // ---------------- exclusão de conta: travas ----------------
  cenario = novoCenario();
  r = await chamar(adminFn, { ...EXCLUIR, confirmacao: 'excluir agora' });
  ok(r.status === 400 && passos().length === 0, 'sem a palavra EXCLUIR: recusado antes de mexer em qualquer coisa');

  cenario = novoCenario();
  r = await chamar(adminFn, { ...EXCLUIR, userId: ADMIN.id });
  ok(r.status === 400 && /própria conta/.test(r.json.erro) && passos().length === 0, 'excluir a própria conta: recusado');

  cenario = novoCenario({ tabela: (t) => ({ data: t === 'administradores' ? { user_id: PESSOA.id } : null, error: null }) });
  r = await chamar(adminFn, EXCLUIR);
  ok(r.status === 400 && /administração/.test(r.json.erro) && passos().length === 0, 'excluir conta de administração: recusado');

  cenario = novoCenario();
  r = await chamar(adminFn, { ...EXCLUIR, email: 'outra@prefeitura.mg.gov.br' });
  ok(r.status === 409 && !passos().includes('admin.updateUserById'), 'e-mail da tela diferente do da conta (lista velha): recusado, sem bloquear nada');

  // ---------------- exclusão de conta: caminho completo ----------------
  cenario = novoCenario();
  r = await chamar(adminFn, EXCLUIR);
  const ordem = passos().filter(p => p !== 'admin.getUserById');
  ok(r.status === 200 && r.json.ok === true, 'exclusão completa: 200 e ok');
  ok(JSON.stringify(ordem) === JSON.stringify(['admin.updateUserById', 'fgrcm_encerrar_sessoes', 'fgrcm_excluir_dados_da_conta', 'admin.deleteUser', 'log:conta_excluida']),
    `ordem segura: bloqueia, derruba sessões, limpa dados, apaga conta, registra (${ordem.join(' > ')})`);
  const ban = cenario.log.find(l => l.tipo === 'admin' && l.nome === 'updateUserById');
  ok(ban && ban.args[1].ban_duration === '876000h', 'primeiro passo bloqueia a conta (ban)');
  const del = cenario.log.find(l => l.tipo === 'admin' && l.nome === 'deleteUser');
  ok(del && del.args.length === 1, 'apaga de vez (sem a exclusão "suave" do Supabase)');
  const limp = cenario.log.find(l => l.tipo === 'rpc' && l.nome === 'fgrcm_excluir_dados_da_conta');
  ok(limp.args.p_admin === ADMIN.id && limp.args.p_user === PESSOA.id, 'a limpeza recebe o id de quem excluiu (o banco confere se é admin)');
  ok(/avaliações salvas no celular/.test(r.json.mensagem), 'a mensagem avisa que as avaliações do celular não são apagadas');

  // ---------------- exclusão de conta: falhas no meio ----------------
  cenario = novoCenario();
  cenario.rpc.fgrcm_excluir_dados_da_conta = () => ({ data: null, error: { code: 'XX000', message: 'falha simulada' } });
  r = await chamar(adminFn, EXCLUIR);
  ok(r.status === 500 && r.json.ok !== true && r.json.parcial === true && !passos().includes('admin.deleteUser') && passos().includes('log:conta_exclusao_incompleta'),
    'limpeza falhou: NÃO apaga a conta, não diz sucesso, registra exclusão incompleta');
  ok(/bloqueada/.test(r.json.erro) && /nenhum dado foi apagado/.test(r.json.erro), 'limpeza falhou: explica que a conta ficou bloqueada e nada foi apagado');

  cenario = novoCenario();
  cenario.admin.deleteUser = async () => ({ data: null, error: { code: 'unexpected_failure', status: 500 } });
  r = await chamar(adminFn, EXCLUIR);
  ok(r.status === 500 && r.json.ok !== true && r.json.parcial === true && /dados pessoais foram removidos/.test(r.json.erro) && passos().includes('log:conta_exclusao_incompleta'),
    'apagar a conta falhou: não diz sucesso e explica o que ficou faltando');

  cenario = novoCenario();
  cenario.admin.updateUserById = async () => ({ data: null, error: { message: 'falha' } });
  r = await chamar(adminFn, EXCLUIR);
  ok(r.status === 500 && !passos().includes('fgrcm_excluir_dados_da_conta') && !passos().includes('admin.deleteUser'), 'bloqueio falhou: para tudo, nada é apagado');

  // ---------------- exclusão de solicitação ----------------
  cenario = novoCenario();
  r = await chamar(adminFn, { acao: 'excluir_pedido', pedidoId: PEDIDO.id });
  ok(r.status === 400 && !passos().includes('fgrcm_excluir_pedido'), 'excluir solicitação sem EXCLUIR: recusado');

  cenario = novoCenario();
  cenario.rpc.fgrcm_excluir_pedido = () => ({ data: null, error: { message: 'pedido_de_conta_existente' } });
  r = await chamar(adminFn, { acao: 'excluir_pedido', pedidoId: PEDIDO.id, confirmacao: 'EXCLUIR' });
  ok(r.status === 409 && /aba Contas/.test(r.json.erro), 'solicitação aprovada de conta que existe: recusado e explica o caminho');

  cenario = novoCenario();
  r = await chamar(adminFn, { acao: 'excluir_pedido', pedidoId: PEDIDO.id, confirmacao: 'EXCLUIR', observacao: 'teste' });
  ok(r.status === 200 && r.json.ok === true && cenario.log.find(l => l.nome === 'fgrcm_excluir_pedido').args.p_admin === ADMIN.id, 'excluir solicitação: ok, com o id de quem excluiu');

  // ---------------- aprovação + aviso por e-mail ----------------
  cenario = novoCenario();
  r = await chamar(adminFn, { acao: 'aprovar', pedidoId: PEDIDO.id, modo: 'senha' });
  const concl = cenario.log.find(l => l.nome === 'fgrcm_concluir_notificacao');
  ok(r.status === 200 && r.json.ok === true && r.json.senhaProvisoria, 'aprovar sem provedor de e-mail configurado: a aprovação funciona igual');
  ok(r.json.aviso.status === 'nao_configurado' && /NÃO foi enviado/.test(r.json.aviso.mensagem) && concl.args.p_status === 'nao_configurado', 'sem provedor: registra "não configurado" e diz que NÃO enviou');

  cenario = novoCenario({ fetch: async (url, op) => { cenario.log.push({ tipo: 'fetch', url, corpo: JSON.parse(op.body) }); return new Response(JSON.stringify({ id: 'msg-1' }), { status: 200 }); } });
  Object.assign(env, { EMAIL_PROVEDOR: 'resend', EMAIL_REMETENTE: 'FGRC-M <avisos@exemplo.gov.br>', RESEND_API_KEY: 'chave-de-teste' });
  r = await chamar(adminFn, { acao: 'aprovar', pedidoId: PEDIDO.id, modo: 'convite' });
  const envio = cenario.log.find(l => l.tipo === 'fetch');
  ok(r.json.aviso && r.json.aviso.status === 'enviado' && envio && envio.corpo.to[0] === PEDIDO.email, 'provedor respondeu OK com id: aviso "enviado" para o e-mail do pedido');
  ok(envio.corpo.subject === 'FGRC-M | Solicitação de acesso aprovada' && /Prefeitura de Andradas/.test(envio.corpo.text) && /outro e-mail/.test(envio.corpo.text), 'e-mail de aprovação com prefeitura do pedido e instrução do convite');
  ok(envio.corpo.html.includes('Maria &lt;b&gt;Teste&lt;/b&gt;') && !envio.corpo.html.includes('<b>Teste</b>'), 'nome digitado pela pessoa não vira HTML (escapado)');
  ok(!/<(p|table|td|tr|br|h1|strong|div|html|body)\b/i.test(envio.corpo.text), 'versão em texto simples sem as tags do modelo HTML');

  cenario = novoCenario({ fetch: async () => new Response(JSON.stringify({ name: 'validation_error' }), { status: 422 }) });
  Object.assign(env, { EMAIL_PROVEDOR: 'resend', EMAIL_REMETENTE: 'FGRC-M <avisos@exemplo.gov.br>', RESEND_API_KEY: 'chave-de-teste' });
  r = await chamar(adminFn, { acao: 'aprovar', pedidoId: PEDIDO.id, modo: 'codigo' });
  ok(r.status === 200 && r.json.ok === true && r.json.aviso.status === 'falhou' && cenario.log.find(l => l.nome === 'fgrcm_concluir_notificacao').args.p_status === 'falhou',
    'provedor recusou: a aprovação continua valendo, o aviso fica "falhou"');

  cenario = novoCenario();
  cenario.rpc.fgrcm_reservar_notificacao = () => ({ data: 'ja_enviado', error: null });
  Object.assign(env, { EMAIL_PROVEDOR: 'resend', EMAIL_REMETENTE: 'FGRC-M <avisos@exemplo.gov.br>', RESEND_API_KEY: 'chave-de-teste' });
  r = await chamar(adminFn, { acao: 'aprovar', pedidoId: PEDIDO.id, modo: 'senha' });
  ok(r.json.aviso.status === 'ja_enviado' && !cenario.log.some(l => l.tipo === 'fetch'), 'aviso já enviado antes: não manda de novo');

  cenario = novoCenario();
  Object.assign(env, { EMAIL_PROVEDOR: 'smtp', EMAIL_REMETENTE: 'FGRC-M <projeto@gmail.com>', SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '587', SMTP_USUARIO: 'projeto@gmail.com', SMTP_SENHA: 'senha-de-teste' });
  r = await chamar(adminFn, { acao: 'aprovar', pedidoId: PEDIDO.id, modo: 'senha' });
  ok(r.json.aviso.status === 'nao_configurado' && cenario.log.find(l => l.nome === 'fgrcm_concluir_notificacao').args.p_erro === 'smtp_porta_bloqueada_use_465', 'SMTP na porta 587 (bloqueada no Supabase): nem tenta, avisa pra usar a 465');

  cenario = novoCenario({ smtp: async (m) => ({ messageId: '<abc@gmail>', accepted: [m.to], rejected: [] }) });
  Object.assign(env, { EMAIL_PROVEDOR: 'smtp', EMAIL_REMETENTE: 'FGRC-M <projeto@gmail.com>', SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '465', SMTP_USUARIO: 'projeto@gmail.com', SMTP_SENHA: 'senha-de-teste' });
  r = await chamar(adminFn, { acao: 'aprovar', pedidoId: PEDIDO.id, modo: 'senha' });
  const transp = cenario.log.find(l => l.tipo === 'smtp');
  ok(r.json.aviso.status === 'enviado' && transp.opcoes.secure === true && transp.opcoes.port === 465, 'SMTP na 465 aceito pelo servidor: "enviado", com conexão segura');

  cenario = novoCenario({ smtp: async () => ({ messageId: 'x', accepted: [], rejected: ['maria@prefeitura.mg.gov.br'] }) });
  Object.assign(env, { EMAIL_PROVEDOR: 'smtp', EMAIL_REMETENTE: 'FGRC-M <projeto@gmail.com>', SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '465', SMTP_USUARIO: 'projeto@gmail.com', SMTP_SENHA: 'senha-de-teste' });
  r = await chamar(adminFn, { acao: 'aprovar', pedidoId: PEDIDO.id, modo: 'senha' });
  ok(r.json.aviso.status === 'falhou', 'SMTP recusou o destinatário: "falhou", não "enviado"');

  // ---------------- reenviar aviso de aprovação pra quem já ativou ----------------
  cenario = novoCenario({ fetch: async (url, op) => { cenario.log.push({ tipo: 'fetch', corpo: JSON.parse(op.body) }); return new Response(JSON.stringify({ id: 'msg-2' }), { status: 200 }); } });
  semProvedor(); Object.assign(env, { EMAIL_PROVEDOR: 'resend', EMAIL_REMETENTE: 'FGRC-M <avisos@exemplo.gov.br>', RESEND_API_KEY: 'chave-de-teste' });
  cenario.tabela = (t, q) => t === 'access_requests' ? { data: { ...PEDIDO, status: 'aprovado' }, error: null } : { data: null, error: null };
  cenario.admin.listUsers = async () => ({ data: { users: [{ ...PESSOA, email: PEDIDO.email, last_sign_in_at: '2026-11-19T10:00:00Z', email_confirmed_at: '2026-11-18T10:00:00Z' }] }, error: null });
  r = await chamar(adminFn, { acao: 'reenviar_aviso', pedidoId: PEDIDO.id, evento: 'pedido_aprovado' });
  const reenvio = cenario.log.find(l => l.tipo === 'fetch');
  ok(r.json.aviso.status === 'enviado' && /já está ativa/.test(reenvio.corpo.text) && !/Ativar acesso/.test(reenvio.corpo.text), 'reenvio pra quem já entrou: não manda ativar de novo');

  // ---------------- aviso de pedido recebido (função pública) ----------------
  cenario = novoCenario();
  r = await chamar(avisoFn, { evento: 'outro', email: 'a@b.com' }, '');
  ok(r.status === 400, 'aviso público: evento desconhecido recusado');
  r = await chamar(avisoFn, { evento: 'pedido_recebido', email: 'nao-e-email' }, '');
  ok(r.status === 400, 'aviso público: e-mail inválido recusado');

  cenario = novoCenario({ tabela: () => ({ data: null, error: null }) });
  r = await chamar(avisoFn, { evento: 'pedido_recebido', email: 'Ninguem@Gmail.com' }, '');
  const busca = cenario.log.find(l => l.tipo === 'tabela' && l.tabela === 'access_requests');
  ok(r.json.status === 'sem_pedido_recente' && !cenario.log.some(l => l.nome === 'fgrcm_reservar_notificacao'), 'sem pedido pendente recente: não manda nada');
  ok(busca.filtros.some(([k, v]) => k === 'email' && v === 'ninguem@gmail.com') && busca.filtros.some(([k, v]) => k === 'status' && v === 'pendente'), 'procura só pedido pendente, com o e-mail em minúsculas (igual o banco grava)');

  cenario = novoCenario({ fetch: async (url, op) => { cenario.log.push({ tipo: 'fetch', corpo: JSON.parse(op.body) }); return new Response(JSON.stringify({ id: 'msg-3' }), { status: 200 }); } });
  Object.assign(env, { EMAIL_PROVEDOR: 'resend', EMAIL_REMETENTE: 'FGRC-M <avisos@exemplo.gov.br>', RESEND_API_KEY: 'chave-de-teste' });
  r = await chamar(avisoFn, { evento: 'pedido_recebido', email: PEDIDO.email }, '');
  const rec = cenario.log.find(l => l.tipo === 'fetch');
  ok(r.json.status === 'enviado' && rec.corpo.subject === 'FGRC-M | Solicitação de acesso recebida' && rec.corpo.to[0] === PEDIDO.email && /ainda não possui acesso/.test(rec.corpo.text), 'pedido recebido: e-mail com o texto combinado, pro e-mail do pedido');

  cenario = novoCenario();
  r = await chamar(avisoFn, { evento: 'pedido_recebido', email: PEDIDO.email }, '');
  ok(r.json.status === 'nao_configurado', 'pedido recebido sem provedor: responde "não configurado" (o app não fala em e-mail enviado)');

  // ---------------- textos ----------------
  ok(E.nomeDaPrefeitura('Andradas') === 'Prefeitura de Andradas' && E.nomeDaPrefeitura('Prefeitura Municipal de Andradas') === 'Prefeitura Municipal de Andradas', 'não escreve "Prefeitura de Prefeitura..."');
  const html = E.montarEmail('pedido_recebido', PEDIDO).html;
  ok(/max-width:600px/.test(html) && /name="viewport"/.test(html) && /#10558D/.test(html), 'HTML responsivo (largura máxima 600 px) com as cores do FGRC-M');

  process.exitCode = f ? 1 : 0;
})().catch(e => { console.log('FALHOU erro inesperado: ' + (e && e.stack)); process.exitCode = 1; });
