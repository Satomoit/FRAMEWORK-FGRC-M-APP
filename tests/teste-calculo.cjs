// teste do cálculo do índice: nota máxima real de cada pergunta (AWR vai até 3) e avaliações antigas
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = (process.argv[2] || path.resolve(__dirname, '..'));
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req === '@react-native-async-storage/async-storage') return '__async__';
  if (req === '@/lib/supabase') return '__supabase__';
  if (req.startsWith('@/')) { const b = path.join(raiz, 'src', req.slice(2)); for (const e of ['.ts', '.tsx']) if (fs.existsSync(b + e)) return b + e; }
  return orig.call(this, req, parent, ...r);
};
require.cache['__async__'] = { id: '__async__', filename: '__async__', loaded: true, exports: { __esModule: true, default: {} } };
require.cache['__supabase__'] = { id: '__supabase__', filename: '__supabase__', loaded: true, exports: { supabase: { auth: { getSession: async () => ({ data: { session: { user: { id: 't' } } } }) } } } };
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);
const { TODAS_QUESTOES_FGRC: Q } = require(path.join(raiz, 'src/features/p03-avaliacoes-questionario/questionarioData.ts'));
const { montarAvaliacao } = require(path.join(raiz, 'src/lib/avaliacoes-reais.ts'));
const { paraRelatorio, valorMaximoDa } = require(path.join(raiz, 'src/lib/calcular-relatorio.ts'));
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };
const max = Object.fromEntries(Q.map(q => [q.id, Math.max(...q.alternativas.map(a => a.valor))]));
let r = paraRelatorio(montarAvaliacao(max));
ok(r.score === 0 && r.dimensions.every(d => d.score === 0), `tudo no máximo (AWR=3, resto=4) => exposição 0 (deu ${r.score}, AWR ${r.dimensions.find(d=>d.code==='AWR').score})`);
r = paraRelatorio(montarAvaliacao(Object.fromEntries(Q.map(q => [q.id, 0]))));
ok(r.score === 100, `tudo 0 => exposição 100 (deu ${r.score})`);
ok(Q.filter(q => q.eixoCodigo === 'AWR').every(q => max[q.id] === 3) && Q.filter(q => q.eixoCodigo !== 'AWR').every(q => max[q.id] === 4), 'AWR vai até 3 e o resto até 4 (igual ao formulário)');
let falhou = false; try { montarAvaliacao({ ...max, [Q[25].id]: 4 }); } catch { falhou = true; }
ok(falhou, 'nota 4 numa pergunta AWR é recusada (não existe essa alternativa)');
const antigo = { ...r.answers[25] }; delete antigo.valorMaximo;
ok(valorMaximoDa(antigo) === max[antigo.id], 'avaliação salva antes (sem valorMaximo) usa o máximo do questionário');
// [integração RF-003] a prefeitura da conta fica gravada junto da avaliação (e avaliação sem ela continua valendo)
ok(montarAvaliacao(max, 'Prefeitura de Teste - Cidade/MG').prefeitura === 'Prefeitura de Teste - Cidade/MG', 'RF-003: prefeitura gravada na avaliação');
ok(montarAvaliacao(max).prefeitura === null && paraRelatorio(montarAvaliacao(max)).score === 0, 'RF-003: sem prefeitura a avaliação é montada igual (prefeitura null)');
// [integração RF-008] faltando uma resposta a avaliação não fecha
const semUma = { ...max }; delete semUma[Q[7].id];
let recusou = false; try { montarAvaliacao(semUma); } catch { recusou = true; }
ok(recusou, 'RF-008: com 1 pergunta sem resposta a avaliação não é finalizada');
// [integração RNF-012] as mesmas respostas dão sempre o mesmo resultado (índice, eixos e recomendações)
const misto = Object.fromEntries(Q.map((q, i) => [q.id, i % (max[q.id] + 1)]));
const r1 = paraRelatorio(montarAvaliacao(misto)), r2 = paraRelatorio(montarAvaliacao(misto));
const sem = x => JSON.stringify({ s: x.score, c: x.classification, d: x.dimensions, a: x.answers });
ok(sem(r1) === sem(r2), `RNF-012: mesmas respostas, mesmo resultado (índice ${r1.score}, ${r1.classification})`);
