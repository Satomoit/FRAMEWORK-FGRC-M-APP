// [integração 19/11] testa o atalho "Área administrativa" do menu Mais aparecer na hora (src/lib/atalho-admin.ts)
// tudo simulado: aparelho (AsyncStorage) e Supabase falsos, nada vai pra internet
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = process.argv[2] || path.resolve(__dirname, '..');
const memoria = new Map();
const asyncStorage = { getItem: async k => memoria.has(k) ? memoria.get(k) : null, setItem: async (k, v) => { memoria.set(k, String(v)); }, removeItem: async k => { memoria.delete(k); } };
let conta = null;
let respostaDoBanco = { data: 'ok', error: null };
let perguntasAoBanco = 0;
const supabaseStub = { supabase: {
  auth: { getSession: async () => ({ data: { session: conta ? { user: { id: conta } } : null } }) },
  rpc: async (nome) => { perguntasAoBanco++; return nome === 'estado_admin_fgrcm' ? respostaDoBanco : { data: null, error: { message: '?' } }; },
} };
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
const A = require(path.join(raiz, 'src/lib/atalho-admin.ts'));
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };

(async () => {
  ok(A.estadoDoAtalhoNaMemoria() === null && (await A.conferirEGuardarEstadoDoAtalho()) === null, 'sem login: nada guardado, atalho não aparece');

  conta = 'admin-1';
  ok((await A.conferirEGuardarEstadoDoAtalho()) === 'ok', 'conta da administração: banco responde ok');
  ok(A.estadoDoAtalhoNaMemoria() === 'ok', 'fica na memória: o menu Mais já abre com o botão (sem esperar o banco)');

  // app fechou e abriu de novo (memória limpa), sem internet
  A.esquecerEstadoDoAtalho();
  respostaDoBanco = { data: null, error: { message: 'Failed to fetch' } };
  ok((await A.estadoDoAtalhoGuardado()) === 'ok', 'depois de reabrir o app, lê o que ficou guardado no aparelho (na hora)');
  ok((await A.conferirEGuardarEstadoDoAtalho()) === 'ok', 'sem internet: o botão não some (quem confere de verdade é a /admin)');

  // a permissão foi tirada: o banco manda nao_admin e o botão some
  respostaDoBanco = { data: 'nao_admin', error: null };
  ok((await A.conferirEGuardarEstadoDoAtalho()) === 'nao_admin', 'tiraram a permissão: o banco diz nao_admin e o atalho some');
  ok(memoria.get('fgrcm:atalho-admin:v1:admin-1') === 'nao_admin', 'o aparelho também esquece a permissão antiga');

  // outra conta no mesmo celular não herda o resultado da primeira
  respostaDoBanco = { data: 'ok', error: null };
  await A.conferirEGuardarEstadoDoAtalho();
  conta = 'comum-2';
  ok((await A.estadoDoAtalhoGuardado()) === null, 'outra conta no mesmo celular não pega o "ok" da conta anterior');
  respostaDoBanco = { data: 'nao_admin', error: null };
  ok((await A.conferirEGuardarEstadoDoAtalho()) === 'nao_admin', 'conta comum: nao_admin');

  // o que ta guardado estragado não vira permissão
  memoria.set('fgrcm:atalho-admin:v1:comum-3', 'sim_sou_admin');
  conta = 'comum-3';
  A.esquecerEstadoDoAtalho();
  ok((await A.estadoDoAtalhoGuardado()) === null, 'valor estranho guardado no aparelho é ignorado');
  ok(A.lerEstadoDoAtalho('precisa_mfa') === 'precisa_mfa' && A.lerEstadoDoAtalho(undefined) === null, 'só aceita ok, precisa_mfa e nao_admin');

  // o menu e o _layout usam o guardado
  const fonteMais = fs.readFileSync(path.join(raiz, 'src/app/mais.tsx'), 'utf8');
  const fonteLayout = fs.readFileSync(path.join(raiz, 'src/app/_layout.tsx'), 'utf8');
  ok(/useState<string \| null>\(\(\) => estadoDoAtalhoNaMemoria\(\)\)/.test(fonteMais), 'o menu Mais começa com o último resultado conhecido');
  ok(/if \(logado\) void conferirEGuardarEstadoDoAtalho\(\)/.test(fonteLayout), 'ao entrar na conta já confere por trás (o primeiro Mais já abre pronto)');
  ok(perguntasAoBanco > 0, 'continua perguntando pro banco (o guardado é só pra mostrar rápido)');
})();
