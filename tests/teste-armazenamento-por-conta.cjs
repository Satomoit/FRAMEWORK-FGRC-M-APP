// teste de comportamento: armazenamento separado por conta + trazer dados antigos
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = (process.argv[2] || path.resolve(__dirname, '..'));
const memoria = new Map();
const asyncStorage = { getItem: async k => memoria.has(k) ? memoria.get(k) : null, setItem: async (k, v) => { memoria.set(k, String(v)); }, removeItem: async k => { memoria.delete(k); } };
let conta = null;
const supabaseStub = { supabase: { auth: {
  getSession: async () => ({ data: { session: conta ? { user: { id: conta } } : null } }),
  getUser: async () => ({ data: { user: conta ? { id: conta, user_metadata: {}, app_metadata: {} } : null }, error: null }),
} } };
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req === '@react-native-async-storage/async-storage') return '__async__';
  if (req === '@/lib/supabase') return '__supabase__';
  if (req.startsWith('@/')) { const b = path.join(raiz, 'src', req.slice(2)); for (const e of ['.ts', '.tsx']) if (fs.existsSync(b + e)) return b + e; }
  return orig.call(this, req, parent, ...r);
};
require.cache['__async__'] = { id: '__async__', filename: '__async__', loaded: true, exports: { __esModule: true, default: asyncStorage } };
require.cache['__supabase__'] = { id: '__supabase__', filename: '__supabase__', loaded: true, exports: supabaseStub };
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);
const L = p => require(path.join(raiz, 'src/lib', p));
const A = L('armazenamento-local.ts');
const { finalizarAvaliacao, listarAvaliacoes } = L('avaliacoes-reais.ts');
const { carregarResumoInicio } = L('resumo-inicio.ts');
const { TODAS_QUESTOES_FGRC: Q } = require(path.join(raiz, 'src/features/p03-avaliacoes-questionario/questionarioData.ts'));
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };
const completas = () => Object.fromEntries(Q.map(q => [q.id, Math.min(2, Math.max(...q.alternativas.map(a => a.valor)))]));
(async () => {
  let erro = null; try { await A.lerRascunho(); } catch (e) { erro = e; }
  ok(erro !== null, 'sem login não lê nada (não mistura dados)');

  conta = 'conta-A';
  await A.salvarRascunho({ [Q[0].id]: 3, [Q[1].id]: 1 });
  await finalizarAvaliacao(completas());
  ok((await listarAvaliacoes()).length === 1, 'conta A finaliza e vê 1 avaliação');
  ok(Object.keys((await A.lerRascunho()).respostas).length === 2, 'conta A tem o próprio rascunho');
  ok((await carregarResumoInicio()).progresso === Math.round(2 / Q.length * 100), 'Home da conta A mostra o progresso do rascunho dela');

  conta = 'conta-B';
  ok((await listarAvaliacoes()).length === 0, 'conta B NÃO vê a avaliação da conta A');
  ok(Object.keys((await A.lerRascunho()).respostas).length === 0, 'conta B NÃO vê o rascunho da conta A');
  ok((await carregarResumoInicio()).progresso === null, 'Home da conta B não mostra progresso da A');

  // dados antigos (de antes da separação)
  const antiga = { id: 'antiga-1', finalizadaEm: '2026-11-17T10:00:00.000Z', respostas: (await (async () => { conta = 'tmp'; await finalizarAvaliacao(completas()); const l = await listarAvaliacoes(); return l[0].respostas; })()) };
  conta = 'conta-B';
  memoria.set(A.CHAVE_HISTORICO_ANTIGA, JSON.stringify([antiga]));
  memoria.set(A.CHAVE_RASCUNHO_ANTIGA, JSON.stringify({ [Q[5].id]: 4 }));
  let sobra = await A.verificarDadosAntigos();
  ok(sobra.avaliacoes === 1 && sobra.rascunho, 'encontra 1 avaliação antiga e um rascunho antigo');
  ok((await listarAvaliacoes()).length === 0, 'dados antigos NÃO entram sozinhos na conta (precisa confirmar)');
  const n = await A.trazerDadosAntigosParaConta();
  ok(n === 1 && (await listarAvaliacoes()).length === 1, 'depois de confirmar, a conta B tem a avaliação antiga');
  ok(Object.keys((await A.lerRascunho()).respostas).length === 1, 'o rascunho antigo veio pra conta B (ela não tinha rascunho)');
  sobra = await A.verificarDadosAntigos();
  ok(sobra.avaliacoes === 0 && !sobra.rascunho, 'as chaves antigas saem só depois de gravar na conta');
  conta = 'conta-A';
  ok((await listarAvaliacoes()).length === 1, 'conta A continua só com a dela');
})().catch(e => { console.error(e); process.exit(1); });
