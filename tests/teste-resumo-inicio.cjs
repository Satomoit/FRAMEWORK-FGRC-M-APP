// teste de comportamento do resumo da Home (B1b): roda src/lib reais com AsyncStorage e Supabase simulados
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = (process.argv[2] || path.resolve(__dirname, '..'));
const memoria = new Map();
const asyncStorage = { getItem: async k => memoria.has(k) ? memoria.get(k) : null, setItem: async (k, v) => { memoria.set(k, String(v)); }, removeItem: async k => { memoria.delete(k); } };
let usuario = { data: { user: { user_metadata: {} } }, error: null };
const supabaseStub = { supabase: { auth: { getSession: async () => ({ data: { session: { user: { id: 'conta-teste' } } } }), getUser: async () => { if (usuario === 'erro') throw new Error('sem rede'); return usuario; } } } };
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
const { carregarResumoInicio } = L('resumo-inicio.ts');
const { finalizarAvaliacao } = L('avaliacoes-reais.ts');
const { paraResultado } = L('calcular-relatorio.ts');
const { TODAS_QUESTOES_FGRC: Q } = require(path.join(raiz, 'src/features/p03-avaliacoes-questionario/questionarioData.ts'));
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };
(async () => {
  let r = await carregarResumoInicio();
  ok(r.prefeitura === null && r.progresso === null && r.ultimaAvaliacao === null && r.quantidadePrioridades === null && r.pontosAtencao.length === 0, 'aparelho novo: tudo vazio (Home mostra "—"), nada inventado');
  memoria.set('fgrcm:p03:rascunho:v2:conta-teste', JSON.stringify({ ...Object.fromEntries(Q.slice(0, 8).map(q => [q.id, 3])), 'id-que-nao-existe': 2, [Q[9].id]: 7 }));
  r = await carregarResumoInicio();
  ok(r.progresso === 25, `rascunho com 8 válidas + 2 inválidas => 25% (deu ${r.progresso})`);
  memoria.set('fgrcm:p03:rascunho:v2:conta-teste', '{quebrado');
  ok((await carregarResumoInicio()).progresso === null, 'rascunho corrompido não quebra a Home (progresso null)');
  memoria.delete('fgrcm:p03:rascunho:v2:conta-teste');
  const a1 = await finalizarAvaliacao(Object.fromEntries(Q.map(q => [q.id, 4 > q.alternativas.length - 1 ? 0 : 4])));
  await new Promise(s => setTimeout(s, 5));
  const a2 = await finalizarAvaliacao(Object.fromEntries(Q.map(q => [q.id, 1])));
  r = await carregarResumoInicio();
  const esperado = paraResultado(a2);
  ok(r.ultimaAvaliacao === esperado.date, `última avaliação = a mais recente (${r.ultimaAvaliacao})`);
  ok(r.quantidadePrioridades === esperado.attentionPoints.length && r.pontosAtencao.length === esperado.attentionPoints.length, `prioridades iguais às da tela de Resultados (${r.quantidadePrioridades})`);
  ok(r.pontosAtencao.every(p => p.prioridade === 'alta' || p.prioridade === 'media') && new Set(r.pontosAtencao.map(p => p.id)).size === r.pontosAtencao.length, 'pontos com prioridade no formato da P01 e ids únicos');
  usuario = { data: { user: { user_metadata: { prefeitura: '  Prefeitura de Teste ' } } }, error: null };
  ok((await carregarResumoInicio()).prefeitura === 'Prefeitura vinculada: Prefeitura de Teste', 'prefeitura vem da conta quando existe');
  // [integração] nome na Home: só o primeiro nome; sem nome cadastrado fica null (a Home mostra "gestor(a)")
  ok((await carregarResumoInicio()).nome === null, 'conta sem nome: nome null (Home mostra gestor(a))');
  usuario = { data: { user: { user_metadata: { nome_completo: '  Maria  da Silva ' } } }, error: null };
  ok((await carregarResumoInicio()).nome === 'Maria', 'nome completo "Maria da Silva" vira "Maria" na saudação');
  usuario = 'erro';
  r = await carregarResumoInicio();
  ok(r.prefeitura === null && r.ultimaAvaliacao === esperado.date, 'sem conexão com o Supabase: prefeitura vazia, mas o resto continua aparecendo');
})();
