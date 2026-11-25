// teste do cálculo do índice: nota máxima real de cada pergunta e avaliações antigas
// [integração 25/11] o eixo AWR ganhou o nível 4: hoje todas vão de 0 a 4, mas avaliação antiga (AWR até 3) não pode mudar de nota
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
ok(r.score === 0 && r.dimensions.every(d => d.score === 0), `tudo no máximo (4 em todas) => exposição 0 (deu ${r.score}, AWR ${r.dimensions.find(d=>d.code==='AWR').score})`);
r = paraRelatorio(montarAvaliacao(Object.fromEntries(Q.map(q => [q.id, 0]))));
ok(r.score === 100, `tudo 0 => exposição 100 (deu ${r.score})`);
// [integração 25/11] as 32 perguntas têm as 5 alternativas (0 a 4), inclusive as 5 do AWR
ok(Q.length === 32 && Q.every(q => max[q.id] === 4 && q.alternativas.map(a => a.valor).join() === '0,1,2,3,4'), 'as 32 perguntas vão de 0 a 4 (o AWR ganhou o nível 4)');
const awr = Q.filter(q => q.eixoCodigo === 'AWR');
ok(awr.length === 5 && awr.every(q => q.alternativas[4].titulo === 'Aprimorada' && q.alternativas[4].descricao.length > 40), 'as 5 do AWR têm o nível 4 "Aprimorada" com descrição');
let aceitou = true; try { montarAvaliacao({ ...max, [awr[4].id]: 4 }); } catch { aceitou = false; }
ok(aceitou, 'nota 4 numa pergunta AWR agora é aceita');
let falhou = false; try { montarAvaliacao({ ...max, [awr[4].id]: 5 }); } catch { falhou = true; }
ok(falhou, 'nota 5 continua recusada (não existe essa alternativa)');
const com4 = paraRelatorio(montarAvaliacao(max)).answers.find(a => a.id === awr[4].id);
ok(com4.valorMaximo === 4 && com4.recomendacao === null, 'AWR com nota 4: máximo 4 e sem recomendação (já ta no nível mais alto)');
const com3 = paraRelatorio(montarAvaliacao({ ...max, [awr[4].id]: 3 })).answers.find(a => a.id === awr[4].id);
ok(com3.recomendacao === awr[4].solucoes.faixa3, 'AWR com nota 3: recebe a solução da faixa 3 (igual os outros eixos)');
// avaliações antigas: a nota delas não muda
const antigoAwr = { ...r.answers.find(a => a.id === awr[0].id) }; delete antigoAwr.valorMaximo;
const antigoGov = { ...r.answers[0] }; delete antigoGov.valorMaximo;
ok(valorMaximoDa(antigoAwr) === 3 && valorMaximoDa(antigoGov) === 4, 'avaliação bem antiga (sem valorMaximo): AWR conta até 3, como era, e o resto até 4');
ok(valorMaximoDa({ id: awr[0].id, valorMaximo: 3 }) === 3 && valorMaximoDa({ id: awr[0].id, valorMaximo: 4 }) === 4, 'quem guardou o valorMaximo usa o que guardou (3 nas antigas, 4 nas novas)');
// monta uma avaliação igual às salvas antes de 25/11: AWR com nota 3 e máximo 3 guardado, resto no 4
const deAntes = montarAvaliacao(Object.fromEntries(Q.map(q => [q.id, q.eixoCodigo === 'AWR' ? 3 : 4])));
deAntes.respostas.forEach(x => { if (x.eixoCodigo === 'AWR') x.valorMaximo = 3; });
const rAntes = paraRelatorio(deAntes);
ok(rAntes.score === 0 && rAntes.dimensions.find(d => d.code === 'AWR').score === 0, `avaliação antiga com AWR no máximo da época (3 de 3) continua com exposição 0 (deu ${rAntes.score})`);
const rHoje = paraRelatorio(montarAvaliacao(Object.fromEntries(Q.map(q => [q.id, q.eixoCodigo === 'AWR' ? 3 : 4]))));
ok(rHoje.dimensions.find(d => d.code === 'AWR').score === 25 && rHoje.score === 4, `avaliação nova com AWR na nota 3 (3 de 4): eixo 25 e índice geral 4 (deu ${rHoje.dimensions.find(d => d.code === 'AWR').score} e ${rHoje.score})`);
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
