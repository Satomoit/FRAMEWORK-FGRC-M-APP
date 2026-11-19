// [integração 19/11] testes do lado do app: e-mail de pedido recebido, chamadas de exclusão e confirmação
// roda src/lib reais com o Supabase simulado (nada vai pra internet)
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = process.argv[2] || path.resolve(__dirname, '..');
let invocar = async () => ({ data: null, error: null });
const chamadas = [];
let leitura = { data: [], error: null };
const supabaseStub = { supabase: {
  functions: { invoke: async (nome, op) => { chamadas.push({ nome, corpo: op.body }); return invocar(nome, op); } },
  from: () => { const b = { select: () => b, eq: () => b, order: async () => leitura }; return b; },
  auth: { getSession: async () => ({ data: { session: null } }) },
} };
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req === '@/lib/supabase') return '__supabase__';
  if (req.startsWith('@/')) { const b = path.join(raiz, 'src', req.slice(2)); for (const e of ['.ts', '.tsx']) if (fs.existsSync(b + e)) return b + e; }
  return orig.call(this, req, parent, ...r);
};
require.cache['__supabase__'] = { id: '__supabase__', filename: '__supabase__', loaded: true, exports: supabaseStub };
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);
const L = p => require(path.join(raiz, 'src/lib', p));
const A = L('aviso-pedido-recebido.ts');
const admin = L('admin.ts');
const { palavraDeExclusaoConfere } = L('textos.ts');
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };

(async () => {
  ok(A.interpretarRespostaDoAviso('enviado') === 'enviado' && A.interpretarRespostaDoAviso('ja_enviado') === 'enviado', 'enviado (ou já enviado antes) conta como enviado');
  ok(['nao_configurado', 'falhou', 'em_andamento', 'sem_pedido_recente', undefined, null].every(s => A.interpretarRespostaDoAviso(s) === 'nao_enviado'), 'qualquer outra resposta NÃO conta como enviado');

  invocar = async () => ({ data: { ok: true, status: 'enviado' }, error: null });
  A.pedirAvisoDePedidoRecebido('maria@prefeitura.mg.gov.br');
  ok(chamadas[0].nome === 'notificacoes-fgrcm' && chamadas[0].corpo.evento === 'pedido_recebido' && chamadas[0].corpo.email === 'maria@prefeitura.mg.gov.br', 'chama a função notificacoes-fgrcm com o evento e o e-mail do pedido');
  ok(await A.pegarResultadoDoAviso() === 'enviado', 'servidor confirmou: a tela pode falar que enviou');
  ok(A.pegarResultadoDoAviso() === null, 'o resultado só é usado uma vez (não aparece de novo em outro pedido)');

  invocar = async () => ({ data: { ok: true, status: 'nao_configurado' }, error: null });
  A.pedirAvisoDePedidoRecebido('a@gov.br');
  ok(await A.pegarResultadoDoAviso() === 'nao_enviado', 'provedor não configurado: a tela não fala em e-mail');

  invocar = async () => ({ data: null, error: new Error('função não publicada') });
  A.pedirAvisoDePedidoRecebido('a@gov.br');
  ok(await A.pegarResultadoDoAviso() === 'nao_enviado', 'função não publicada ou erro: não fala em e-mail');

  invocar = async () => { throw new Error('sem internet'); };
  A.pedirAvisoDePedidoRecebido('a@gov.br');
  ok(await A.pegarResultadoDoAviso() === 'nao_enviado', 'sem internet: não fala em e-mail e não quebra a tela');

  chamadas.length = 0;
  invocar = async () => ({ data: { ok: true, mensagem: 'ok' }, error: null });
  await admin.excluirConta('id-1', 'pessoa@gov.br', 'teste');
  ok(chamadas[0].nome === 'admin-fgrcm' && chamadas[0].corpo.acao === 'excluir_usuario' && chamadas[0].corpo.confirmacao === 'EXCLUIR' && chamadas[0].corpo.email === 'pessoa@gov.br', 'excluir conta manda a ação, a confirmação e o e-mail da tela');
  await admin.excluirPedido('pedido-1');
  ok(chamadas[1].corpo.acao === 'excluir_pedido' && chamadas[1].corpo.confirmacao === 'EXCLUIR', 'excluir solicitação manda a ação e a confirmação');
  await admin.reenviarAviso('pedido-1', 'pedido_aprovado');
  ok(chamadas[2].corpo.acao === 'reenviar_aviso' && chamadas[2].corpo.evento === 'pedido_aprovado', 'reenviar aviso manda o pedido e o tipo de aviso');

  leitura = { data: null, error: { code: '42P01' } };
  ok(Array.isArray(await admin.listarAvisos('p')) && (await admin.listarAvisos('p')).length === 0, 'tabela de avisos ainda não criada no Supabase: lista vazia, sem quebrar a tela');

  // atalho "Área administrativa" no menu Mais
  ok(admin.mostraAtalhoDaAdministracao('ok') && admin.mostraAtalhoDaAdministracao('precisa_mfa'), 'atalho da administração aparece pra admin (inclusive quando falta o código das duas etapas)');
  ok(!admin.mostraAtalhoDaAdministracao('nao_admin') && !admin.mostraAtalhoDaAdministracao('sem_sessao') && !admin.mostraAtalhoDaAdministracao(null), 'atalho NÃO aparece pra conta comum, sem sessão ou sem resposta do banco');
  const fonteMais = fs.readFileSync(path.join(raiz, 'src/app/mais.tsx'), 'utf8');
  ok(/router\.push\('\/admin'/.test(fonteMais) && /useFocusEffect\(conferirAdmin\)/.test(fonteMais), 'o atalho abre a /admin (que continua pedindo o código das duas etapas) e confere a permissão sempre que o menu volta pra frente');
  // replace tira o \r das quebras de linha do Windows (CRLF), senão o split abaixo não acha o fim da função
  const fonteAdmin = fs.readFileSync(path.join(raiz, 'src/features/admin/AreaAdministrativa.tsx'), 'utf8').replace(/\r\n/g, '\n');
  const corpoVoltar = (fonteAdmin.split('function voltarParaOApp()')[1] || '').split('\n  }\n')[0];
  ok(/Voltar para o aplicativo/.test(fonteAdmin) && /router\.(back|replace)/.test(corpoVoltar) && !/signOut/.test(corpoVoltar), '"Voltar para o aplicativo" volta sem sair da conta');
  ok(palavraDeExclusaoConfere('EXCLUIR') && palavraDeExclusaoConfere(' excluir ') && palavraDeExclusaoConfere('Excluir'), 'EXCLUIR digitado (com maiúscula automática ou espaço) libera o botão');
  ok(!palavraDeExclusaoConfere('') && !palavraDeExclusaoConfere('EXCLUI') && !palavraDeExclusaoConfere('sim') && !palavraDeExclusaoConfere('EXCLUIR!'), 'qualquer outra coisa não libera');
})().catch(e => { console.log('FALHOU erro inesperado ' + e.stack); process.exitCode = 1; });
