// [integração 25/11] conferência do cálculo dos resultados (tarefa 3 do grupo: "conferir se o cálculo ta certo")
// a ideia é refazer a conta de um jeito DIFERENTE do app (só com números inteiros) e ver se bate
// se as duas contas, feitas de jeitos diferentes, dão o mesmo resultado em centenas de casos, a do app ta certa
//
// regra que o app usa (e que o orientador ainda precisa validar):
//   índice de exposição = 100 x (1 - soma das notas / soma das notas máximas), arredondado
//   até 33 = Baixo | 34 a 66 = Intermediário | 67 a 100 = Alto
//   ponto de atenção = eixo com índice a partir de 50 (prioridade alta a partir de 75, senão média)
//   recomendação = toda resposta de 0 a 3 (prioridade alta nas notas 0 e 1, média nas notas 2 e 3)
//   ordem das recomendações = primeiro as de prioridade alta, depois as de média (dentro de cada grupo, a ordem do questionário)
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
const { TODAS_QUESTOES_FGRC: Q, EIXOS_FGRC } = require(path.join(raiz, 'src/features/p03-avaliacoes-questionario/questionarioData.ts'));
const { montarAvaliacao } = require(path.join(raiz, 'src/lib/avaliacoes-reais.ts'));
const calc = require(path.join(raiz, 'src/lib/calcular-relatorio.ts'));
const { paraRelatorio, paraResultado, recomendacoesDaAvaliacao, explicacaoDoCalculo, COMO_LER_O_INDICE } = calc;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };

// ---------- a conta "de conferência" (não usa nada do src/lib)
// arredonda 100 x (max - obtido) / max pro inteiro mais perto, com o meio (,5) indo pra cima
// tudo com números inteiros, pra não depender de casa decimal do computador
function indiceConferido(itens) {
  let max = 0, obtido = 0;
  for (const i of itens) { max += i.max; obtido += i.valor; }
  if (max === 0) return 0;
  return Math.floor((200 * (max - obtido) + max) / (2 * max));
}
const faixaConferida = (n) => (n <= 33 ? 'Baixo' : n <= 66 ? 'Intermediário' : 'Alto');

function conferir(respostas) {
  const itens = Q.map(q => ({ id: q.id, eixo: q.eixoCodigo, nome: q.eixoNome, valor: respostas[q.id], max: 4 }));
  const geral = indiceConferido(itens);
  const eixos = EIXOS_FGRC.map(e => {
    const doEixo = itens.filter(i => i.eixo === e.codigo);
    return { code: e.codigo, name: doEixo[0].nome, score: indiceConferido(doEixo) };
  });
  const atencao = eixos.filter(e => e.score >= 50).map(e => ({ title: e.name, priority: e.score >= 75 ? 'alta' : 'média' }));
  const semOrdem = Q.filter(q => respostas[q.id] <= 3).map((q, posicao) => {
    const v = respostas[q.id];
    return {
      posicao,
      code: q.codigo,
      priority: v <= 1 ? 'alta' : 'média',
      solution: v <= 1 ? q.solucoes.faixa0ou1 : v === 2 ? q.solucoes.faixa2 : q.solucoes.faixa3,
    };
  });
  // [integração 25/11] prioridade alta primeiro; no empate vale a posição no questionário
  // (aqui é com sort e o app faz com dois filter, de propósito, pra ser uma conferência de verdade)
  semOrdem.sort((a, b) => (a.priority === b.priority ? a.posicao - b.posicao : a.priority === 'alta' ? -1 : 1));
  const recs = semOrdem.map(({ code, priority, solution }) => ({ code, priority, solution }));
  return { geral, faixa: faixaConferida(geral), eixos, atencao, recs };
}

function comparar(respostas) {
  const av = montarAvaliacao(respostas);
  const app = paraRelatorio(av);
  const recsApp = recomendacoesDaAvaliacao(av);
  const esperado = conferir(respostas);
  const erros = [];
  if (app.score !== esperado.geral) erros.push(`índice ${app.score} x ${esperado.geral}`);
  if (app.classification !== esperado.faixa) erros.push(`faixa ${app.classification} x ${esperado.faixa}`);
  if (JSON.stringify(app.dimensions) !== JSON.stringify(esperado.eixos)) erros.push('eixos diferentes');
  if (JSON.stringify(app.attentionPoints) !== JSON.stringify(esperado.atencao)) erros.push('pontos de atenção diferentes');
  const resumoApp = recsApp.map(r => ({ code: r.code, priority: r.priority, solution: r.solution }));
  if (JSON.stringify(resumoApp) !== JSON.stringify(esperado.recs)) erros.push('recomendações diferentes');
  // a tela de Resultados (P05) e a de Relatórios (P06) têm que mostrar os mesmos números
  const tela = paraResultado(av);
  if (tela.score !== app.score || JSON.stringify(tela.dimensions) !== JSON.stringify(app.dimensions)) erros.push('Resultados e Relatórios não batem');
  return { erros, app, esperado };
}

// ---------- 1) 400 avaliações sorteadas (o sorteio tem "semente" fixa, então dá sempre os mesmos casos)
let semente = 20261125;
const sortear = () => { semente = (semente * 1664525 + 1013904223) >>> 0; return semente / 4294967296; };
const falhas = [];
const vistos = { Baixo: 0, 'Intermediário': 0, Alto: 0 };
for (let i = 0; i < 400; i++) {
  // metade dos casos puxa as notas pra baixo ou pra cima, pra aparecerem as 3 faixas
  const puxa = i % 4 === 0 ? 0.6 : i % 4 === 1 ? -0.6 : 0;
  const respostas = Object.fromEntries(Q.map(q => [q.id, Math.max(0, Math.min(4, Math.floor(sortear() * 5 + puxa * 2)))]));
  const r = comparar(respostas);
  vistos[r.app.classification]++;
  if (r.erros.length) falhas.push(`caso ${i}: ${r.erros.join('; ')}`);
}
ok(falhas.length === 0, `400 avaliações sorteadas: índice geral, 11 eixos, faixa, pontos de atenção e recomendações batem com a conta de conferência${falhas.length ? ' -> ' + falhas.slice(0, 3).join(' | ') : ''}`);
ok(vistos.Baixo > 20 && vistos['Intermediário'] > 20 && vistos.Alto > 20, `o sorteio passou pelas 3 faixas (Baixo ${vistos.Baixo}, Intermediário ${vistos['Intermediário']}, Alto ${vistos.Alto})`);

// ---------- 2) os limites das faixas (33/34 e 66/67), montando avaliações com a soma exata
// monta respostas que somam "total" pontos (enche de 4 e completa o resto)
function comSoma(total) {
  let falta = total; const r = {};
  for (const q of Q) { const v = Math.min(4, falta); r[q.id] = v; falta -= v; }
  return r;
}
const limites = [ [86, 33, 'Baixo'], [85, 34, 'Intermediário'], [43, 66, 'Intermediário'], [42, 67, 'Alto'], [128, 0, 'Baixo'], [0, 100, 'Alto'] ];
for (const [soma, indice, faixa] of limites) {
  const r = comparar(comSoma(soma));
  ok(r.erros.length === 0 && r.app.score === indice && r.app.classification === faixa, `soma ${soma} de 128 pontos => índice ${indice} (${faixa}) (deu ${r.app.score}, ${r.app.classification})`);
}
// ---------- 3) casos que caem bem no meio (,5): o app arredonda pra cima
for (const [soma, indice] of [[112, 13], [80, 38], [48, 63], [16, 88]]) {
  const r = comparar(comSoma(soma));
  ok(r.erros.length === 0 && r.app.score === indice, `soma ${soma} de 128 dá exatamente ${(100 * (128 - soma) / 128)} e arredonda pra ${indice} (deu ${r.app.score})`);
}
// ---------- 4) pontos de atenção num eixo de 2 perguntas (INC): 50 entra como média, 75 como alta, abaixo de 50 não entra
const tudo4 = Object.fromEntries(Q.map(q => [q.id, 4]));
const inc = Q.filter(q => q.eixoCodigo === 'INC').map(q => q.id);
const pontoDoInc = (a, b) => { const r = paraRelatorio(montarAvaliacao({ ...tudo4, [inc[0]]: a, [inc[1]]: b })); return { eixo: r.dimensions.find(d => d.code === 'INC').score, ponto: r.attentionPoints.find(p => p.title === 'Resposta a Incidentes') }; };
let p = pontoDoInc(2, 2); ok(p.eixo === 50 && p.ponto && p.ponto.priority === 'média', `eixo com 50 de exposição vira ponto de atenção de prioridade média (eixo ${p.eixo})`);
p = pontoDoInc(1, 1); ok(p.eixo === 75 && p.ponto && p.ponto.priority === 'alta', `eixo com 75 de exposição vira ponto de atenção de prioridade alta (eixo ${p.eixo})`);
p = pontoDoInc(2, 3); ok(p.eixo === 38 && !p.ponto, `eixo com 38 de exposição não vira ponto de atenção (eixo ${p.eixo})`);
ok(paraRelatorio(montarAvaliacao(tudo4)).attentionPoints.length === 0 && recomendacoesDaAvaliacao(montarAvaliacao(tudo4)).length === 0, 'tudo na nota 4: nenhum ponto de atenção e nenhuma recomendação');
const recsZero = recomendacoesDaAvaliacao(montarAvaliacao(Object.fromEntries(Q.map(q => [q.id, 0]))));
ok(recsZero.length === 32 && recsZero.every(r => r.priority === 'alta'), 'tudo na nota 0: 32 recomendações (uma por pergunta), todas de prioridade alta');

// ---------- 4b) ordem das recomendações: alta antes de média, e dentro do grupo a ordem do questionário
const ordemMista = recomendacoesDaAvaliacao(montarAvaliacao(Object.fromEntries(Q.map((q, i) => [q.id, i % 5]))));
const prioridades = ordemMista.map(r => r.priority);
const ultimaAlta = prioridades.lastIndexOf('alta'), primeiraMedia = prioridades.indexOf('média');
ok(ultimaAlta >= 0 && primeiraMedia >= 0 && ultimaAlta < primeiraMedia, `todas as recomendações de prioridade alta vêm antes das de média (${ultimaAlta + 1} altas, ${prioridades.length - primeiraMedia} médias)`);
const posicaoNoQuestionario = (codigo) => Q.findIndex(q => q.codigo === codigo);
const emOrdem = (lista) => lista.every((r, i) => i === 0 || posicaoNoQuestionario(lista[i - 1].code) < posicaoNoQuestionario(r.code));
ok(emOrdem(ordemMista.filter(r => r.priority === 'alta')) && emOrdem(ordemMista.filter(r => r.priority === 'média')), 'dentro de cada prioridade as recomendações seguem a ordem do questionário');
ok(ordemMista[0].code === '01-GOV' && ordemMista[ultimaAlta + 1].code === '03-GOV', `a primeira é a 01-GOV (nota 0) e a primeira de média é a 03-GOV (nota 2) (deu ${ordemMista[0].code} e ${ordemMista[ultimaAlta + 1].code})`);

// ---------- 5) os textos que explicam o resultado dizem os mesmos limites que a conta usa
ok(/Até 33/.test(COMO_LER_O_INDICE) && /34 a 66/.test(COMO_LER_O_INDICE) && /67 a 100/.test(COMO_LER_O_INDICE), 'a frase da tela de Detalhes fala os mesmos limites (33, 34 a 66, 67 a 100)');
const novo = explicacaoDoCalculo(paraRelatorio(montarAvaliacao(tudo4)).answers);
ok(/Até 33/.test(novo) && /34 a 66/.test(novo) && /67 a 100/.test(novo) && /0 \(Inexistente\) a 4 \(Aprimorada\)/.test(novo) && !/até 3/.test(novo), 'PDF de avaliação nova: explica as faixas e a escala de 0 a 4, sem falar em "até 3"');
const antiga = montarAvaliacao(tudo4); antiga.respostas.forEach(x => { if (x.eixoCodigo === 'AWR') { x.valor = 3; x.valorMaximo = 3; } });
ok(/iam até 3 \(Estabelecida\)/.test(explicacaoDoCalculo(antiga.respostas)), 'PDF de avaliação antiga: continua avisando que Pessoas e Conscientização ia até 3');
