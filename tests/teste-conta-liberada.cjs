// teste da trava de conta liberada (roda o arquivo real src/lib/conta.ts, com o Supabase simulado)
// confere que só entra quem passou pela aprovação (prefeitura no app_metadata) ou é a administração
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = (process.argv[2] || path.resolve(__dirname, '..'));
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req === '@/lib/supabase') return '__supabase__';
  return orig.call(this, req, parent, ...r);
};
require.cache['__supabase__'] = { id: '__supabase__', filename: '__supabase__', loaded: true, exports: { supabase: {} } };
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);
const { contaLiberada } = require(path.join(raiz, 'src/lib/conta.ts'));

let f = 0;
function ok(cond, nome) { console.log((cond ? 'PASSOU ' : 'FALHOU ') + nome); if (!cond) f++; }

ok(contaLiberada({ app_metadata: { prefeitura: 'Prefeitura Municipal de Teste' }, user_metadata: {} }) === true, 'conta aprovada (prefeitura no app_metadata) entra');
ok(contaLiberada({ app_metadata: { fgrcm_papel: 'admin' }, user_metadata: {} }) === true, 'conta da administração entra');
ok(contaLiberada({ app_metadata: { provider: 'email' }, user_metadata: {} }) === false, 'conta criada por fora da aprovação não entra');
ok(contaLiberada({ app_metadata: {}, user_metadata: { prefeitura: 'Prefeitura inventada' } }) === false, 'prefeitura escrita pela própria pessoa (user_metadata) não libera');
ok(contaLiberada({ app_metadata: { prefeitura: '   ' }, user_metadata: {} }) === false, 'prefeitura em branco não libera');
ok(contaLiberada({ app_metadata: { fgrcm_papel: 'usuario' }, user_metadata: {} }) === false, 'outro papel no app_metadata não libera');
ok(contaLiberada({ user_metadata: {} }) === false, 'conta sem app_metadata não libera');

process.exitCode = f ? 1 : 0;
