// [integração 25/11] testes da revisão das 32 perguntas:
//   1) "Ficou com dúvida em como resolver?": toda solução tem a explicação em palavras simples
//   2) referências do NIST: só códigos que existem no NIST CSF 2.0 (conferidos no documento oficial em 25/11/2026)
//   3) a tela do questionário volta pro topo ao trocar de pergunta (retorno do teste de usabilidade)
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
const { EXPLICACOES_SIMPLES, explicacaoSimples, faixaDaNota } = require(path.join(raiz, 'src/lib/explicacoes-simples.ts'));
const { montarAvaliacao } = require(path.join(raiz, 'src/lib/avaliacoes-reais.ts'));
const { recomendacoesDaAvaliacao, textoReferencia } = require(path.join(raiz, 'src/lib/calcular-relatorio.ts'));
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };
// lê um arquivo do projeto tirando o \r do Windows (pra o teste funcionar igual no seu PC)
const ler = (arquivo) => fs.readFileSync(path.join(raiz, arquivo), 'utf8').replace(/\r\n/g, '\n');
const FAIXAS = ['faixa0ou1', 'faixa2', 'faixa3'];

// ---------- 1) explicações em palavras simples
const ids = Q.map(q => q.id);
ok(JSON.stringify(Object.keys(EXPLICACOES_SIMPLES).sort()) === JSON.stringify([...ids].sort()), 'tem explicação para as 32 perguntas (nenhuma a mais, nenhuma a menos)');
const semFaixa = ids.filter(id => JSON.stringify(Object.keys(EXPLICACOES_SIMPLES[id] || {})) !== JSON.stringify(FAIXAS));
ok(semFaixa.length === 0, `cada pergunta tem as 3 faixas (0 ou 1, 2 e 3) = 96 explicações${semFaixa.length ? ' -> faltando em ' + semFaixa.join(', ') : ''}`);
const todas = ids.flatMap(id => FAIXAS.map(f => ({ onde: `${id}/${f}`, texto: (EXPLICACOES_SIMPLES[id] || {})[f] || '' })));
const foraDoTamanho = todas.filter(t => t.texto.length < 120 || t.texto.length > 480);
ok(foraDoTamanho.length === 0, `nenhuma explicação curta demais (menos de 120 letras) nem longa demais (mais de 480)${foraDoTamanho.length ? ' -> ' + foraDoTamanho.map(t => `${t.onde} (${t.texto.length})`).join(', ') : ''}`);
const malEscritas = todas.filter(t => !/^[A-ZÀ-Ú]/.test(t.texto) || !/[.?]$/.test(t.texto) || /\s{2,}/.test(t.texto) || t.texto !== t.texto.trim());
ok(malEscritas.length === 0, `todas começam com letra maiúscula, terminam com ponto e não têm espaço sobrando${malEscritas.length ? ' -> ' + malEscritas.map(t => t.onde).join(', ') : ''}`);
// o PDF do navegador usa uma fonte que só desenha estes caracteres (os outros viram "?")
const extras = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const desenha = (letra) => { const c = letra.codePointAt(0); return (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || extras.includes(letra); };
const textosNovos = [...todas, ...Q.flatMap(q => q.alternativas.map(a => ({ onde: `${q.id}/alternativa ${a.valor}`, texto: a.descricao })))];
const comLetraEstranha = textosNovos.filter(t => !Array.from(t.texto).every(desenha));
ok(comLetraEstranha.length === 0, `explicações e alternativas só usam caracteres que o PDF consegue desenhar${comLetraEstranha.length ? ' -> ' + comLetraEstranha.map(t => t.onde).join(', ') : ''}`);
const repetidas = todas.filter((t, i) => todas.findIndex(o => o.texto === t.texto) !== i);
ok(repetidas.length === 0, 'nenhuma explicação foi copiada igual de outra pergunta');

// a explicação certa pra cada nota (e nada pra nota 4)
ok(faixaDaNota(0) === 'faixa0ou1' && faixaDaNota(1) === 'faixa0ou1' && faixaDaNota(2) === 'faixa2' && faixaDaNota(3) === 'faixa3' && faixaDaNota(4) === null, 'notas 0 e 1 usam a primeira explicação, 2 a segunda, 3 a terceira e 4 nenhuma');
let erradas = 0;
for (const q of Q) {
  for (const [valor, faixa] of [[0, 'faixa0ou1'], [1, 'faixa0ou1'], [2, 'faixa2'], [3, 'faixa3']]) {
    if (explicacaoSimples(q.id, valor, q.solucoes[faixa]) !== EXPLICACOES_SIMPLES[q.id][faixa]) erradas++;
  }
  if (explicacaoSimples(q.id, 4, null) !== null) erradas++;
}
ok(erradas === 0, 'cada solução do questionário recebe a explicação da mesma pergunta e da mesma faixa');
ok(explicacaoSimples('01-GOV', 1, 'Uma solução antiga que não existe mais no questionário.') === null, 'se a solução guardada num relatório antigo for diferente da atual, não mostra explicação que não combina');
ok(explicacaoSimples('99-XXX', 1, 'qualquer') === null && explicacaoSimples('01-GOV', 2, null) === null, 'pergunta desconhecida ou sem recomendação: sem explicação (e sem erro)');
const antes = 'Formalizar as funções, responsabilidades e autoridades relacionados à gestão da segurança cibernética, documentando as atribuições dos responsáveis e comunicando-as aos envolvidos.';
ok(explicacaoSimples('03-GOV', 1, antes) === EXPLICACOES_SIMPLES['03-GOV'].faixa0ou1, 'avaliação salva antes do acerto de português na 03-GOV continua recebendo a explicação');

// a explicação chega até a tela de Recomendações e os PDFs (campo simpleExplanation)
const mista = Object.fromEntries(Q.map((q, i) => [q.id, i % 5]));
const recs = recomendacoesDaAvaliacao(montarAvaliacao(mista));
ok(recs.length === Q.filter((q, i) => i % 5 !== 4).length && recs.every(r => typeof r.simpleExplanation === 'string' && r.simpleExplanation.length >= 120), `as ${recs.length} recomendações de uma avaliação nova chegam com a explicação simples`);
const mexida = montarAvaliacao(mista); mexida.respostas[0].recomendacao = 'Texto de uma versão antiga do questionário.';
const recsMexida = recomendacoesDaAvaliacao(mexida);
ok(recsMexida.find(r => r.code === '01-GOV').simpleExplanation === undefined && recsMexida.filter(r => r.code !== '01-GOV').every(r => r.simpleExplanation), 'recomendação com texto antigo fica sem a explicação (as outras continuam com ela)');
const telaRecs = ler('src/features/p06-relatorios-recomendacoes/RecomendacoesScreen.tsx');
ok(telaRecs.includes('Ficou com dúvida em como resolver?'), 'a tela de Recomendações tem o botão "Ficou com dúvida em como resolver?"');
// [integração 25/11] compartilhar direto da tela de Recomendações (manda o arquivo PDF pra janela de compartilhar)
ok(telaRecs.includes("handlePdf('compartilhar')") && telaRecs.includes('compartilharRelatorioPdf') && telaRecs.includes('Compartilhar PDF'), 'a tela de Recomendações tem o botão Compartilhar PDF ligado na função que compartilha o arquivo');
ok(telaRecs.includes("handlePdf('baixar')") && !/onPress=\{handlePdf\}/.test(telaRecs), 'o Baixar PDF continua existindo e cada botão diz qual é a ação');
ok(/Prioridade \{r\.priority\} \(\{quantasDoGrupo\}\)/.test(telaRecs), 'a tela mostra o título de cada grupo de prioridade com a quantidade');
ok(ler('src/features/p06-relatorios-recomendacoes/pdf.ts').includes('Em palavras simples:') && ler('src/features/p06-relatorios-recomendacoes/pdf.web.ts').includes('Em palavras simples:'), 'os dois PDFs (celular e navegador) trazem "Em palavras simples:"');

// ---------- 2) referências do NIST CSF 2.0
// lista conferida no documento oficial "NIST CSF 2.0 Core with Withdrawn CSF 1.1 Elements" (nist.gov) em 25/11/2026
// se alguém colocar um código novo no questionário, o teste falha de propósito: confira no site do NIST e acrescente aqui
const CONFERIDOS = new Set([
  'GV.OC', 'GV.RM', 'GV.RM-06', 'GV.RR', 'GV.PO', 'GV.OV', 'GV.SC-05', 'GV.SC-06', 'GV.SC-07', 'GV.SC-10',
  'ID.AM-01', 'ID.AM-02', 'ID.AM-05', 'ID.AM-07', 'ID.AM-08', 'ID.RA', 'ID.RA-01', 'ID.RA-05', 'ID.RA-06', 'ID.IM-04',
  'PR.AA-01', 'PR.AA-02', 'PR.AA-03', 'PR.AA-05', 'PR.AT-01', 'PR.AT-02', 'PR.DS-01', 'PR.DS-02', 'PR.DS-11',
  'PR.PS-01', 'PR.PS-02', 'PR.PS-03', 'PR.PS-04', 'PR.PS-05', 'PR.IR-01',
  'DE.CM-01', 'DE.CM-03', 'DE.CM-06', 'DE.CM-09', 'DE.AE-02', 'DE.AE-03', 'DE.AE-04', 'DE.AE-06', 'DE.AE-08',
  'RS.MA-01', 'RS.MA-03', 'RS.MA-04', 'RS.MA-05', 'RS.AN-06', 'RS.AN-07', 'RS.CO-02', 'RS.CO-03', 'RS.MI-01', 'RS.MI-02',
  'RC.RP-01', 'RC.RP-06',
]);
const codigosDe = (nist) => nist.match(/[A-Z]{2}\.[A-Z]{2}(?:-\d+)?/g) || [];
ok(Q.every(q => /^NIST → /.test(q.nist) && codigosDe(q.nist).length > 0), 'as 32 perguntas têm referência do NIST (inclusive as 5 do eixo AWR)');
const desconhecidos = Q.flatMap(q => codigosDe(q.nist).filter(c => !CONFERIDOS.has(c)).map(c => `${q.id}: ${c}`));
ok(desconhecidos.length === 0, `todos os códigos existem no NIST CSF 2.0${desconhecidos.length ? ' -> conferir: ' + desconhecidos.join(', ') : ''}`);
// famílias da versão 1.1 que saíram na 2.0 (PR.PT, ID.SC, PR.AC...) e o código que não existe (SC.CO)
const retirados = Q.filter(q => /(PR\.PT|ID\.SC|PR\.AC|PR\.IP|PR\.MA|ID\.GV|ID\.BE|ID\.RM|DE\.DP|RS\.RP|RS\.IM|RC\.IM|SC\.CO)/.test(q.nist)).map(q => q.id);
ok(retirados.length === 0, `nenhuma pergunta usa código da versão 1.1 que saiu na 2.0${retirados.length ? ' -> ' + retirados.join(', ') : ''}`);
const nistDe = (id) => Q.find(q => q.id === id).nist;
ok(nistDe('01-BKP') === 'NIST → PR.DS-11', 'backup (01-BKP) aponta pro PR.DS-11 (no formulário estava PR.DS-1)');
ok(['01-AWR', '02-AWR', '03-AWR', '05-AWR'].every(id => nistDe(id) === 'NIST → PR.AT-01') && nistDe('04-AWR') === 'NIST → PR.AT-02', 'eixo AWR: PR.AT-01 (todo o pessoal) e PR.AT-02 na 04-AWR (funções especializadas)');
ok(textoReferencia(nistDe('02-NET')) === 'NIST PR.AA-03, PR.AA-05, PR.IR-01 e PR.PS-04', 'a referência aparece limpa no relatório (ex: 02-NET)');
ok(textoReferencia('Verificação do aprendizado') === 'não indicada no formulário (tema: Verificação do aprendizado)', 'relatório antigo do AWR (sem NIST guardado) continua mostrando o tema, sem erro');

// ---------- 2b) alto contraste no tema escuro: texto dos botões azuis
// (o azul fica #9DD3FF nesse modo; branco em cima dele dá contraste 1,6:1 e preto dá mais de 13:1)
const coresTxt = ler('src/components/fgrc-colors.ts');
const blocoEscuro = coresTxt.slice(coresTxt.indexOf('const altoContrasteEscuro'), coresTxt.indexOf('// vc chama essa função'));
ok(/blue: "#9DD3FF"/.test(blocoEscuro) && /blueOnButton: "#000000"/.test(blocoEscuro), 'alto contraste escuro: o texto em cima do botão azul claro é preto');
const brancoFixo = ['src/features/p05-resultados-detalhamento/DetalhesResultadoScreen.tsx', 'src/features/p06-relatorios-recomendacoes/RecomendacoesScreen.tsx'].filter(a => /buttonText: \{ color: '#FFFFFF'/.test(ler(a)));
ok(brancoFixo.length === 0, `os botões azuis de Detalhes e de Recomendações usam a cor do tema, não branco fixo${brancoFixo.length ? ' -> ' + brancoFixo.join(', ') : ''}`);

// ---------- 3) tela volta pro topo ao trocar de pergunta
const questionario = ler('src/features/p03-avaliacoes-questionario/QuestionarioScreen.tsx');
const paginas = (questionario.match(/<Page\b/g) || []).length;
const avisos = (questionario.match(/rolarProTopoQuando=/g) || []).length;
ok(paginas === 3 && avisos === 3, `as 3 etapas do questionário (responder, revisar, finalizada) avisam a página pra voltar ao topo (${avisos} de ${paginas})`);
ok(questionario.includes('rolarProTopoQuando={`pergunta:${questaoAtual.id}`}'), 'o aviso muda junto com a pergunta (usa o id da pergunta atual)');
const ui = ler('src/components/fgrc-ui.tsx');
ok(/scrollTo\(\{ y: 0, animated: false \}\)/.test(ui) && /\[rolarProTopoQuando\]/.test(ui) && ui.includes('ref={guardarRolagem}'), 'a Page manda a rolagem pro começo quando o aviso muda');
ok(/if \(rolarProTopoQuando === undefined\) return;/.test(ui), 'telas que não pedem (todas as outras) continuam com a rolagem como era');
ok(questionario.includes('{comLetraMaiuscula(alt.descricao)}'), 'as alternativas aparecem com a primeira letra maiúscula (as do AWR começam com minúscula no formulário)');
