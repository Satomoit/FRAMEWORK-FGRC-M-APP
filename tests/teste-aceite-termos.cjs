// [integração 25/11] testes da leitura obrigatória dos Termos de Uso na ativação da conta
//   1) as contas da rolagem (src/lib/aceite-dos-termos.ts): quando o "Li e aceito" pode aparecer
//   2) o registro do aceite que vai pra conta (versão dos termos + hora)
//   3) as telas estão ligadas do jeito certo: sem ler até o fim não aceita, sem aceitar não ativa
// (a janela de verdade, com rolagem e toque, é conferida no navegador e no celular; aqui é a lógica)
const ts = require('typescript');
const fs = require('fs'), path = require('path'), Module = require('module');
const raiz = path.resolve(process.argv[2] || path.resolve(__dirname, '..'));
const orig = Module._resolveFilename;
Module._resolveFilename = function (req, parent, ...r) {
  if (req.startsWith('@/')) { const b = path.join(raiz, 'src', req.slice(2)); for (const e of ['.ts', '.tsx']) if (fs.existsSync(b + e)) return b + e; }
  return orig.call(this, req, parent, ...r);
};
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, f);
const A = require(path.join(raiz, 'src/lib/aceite-dos-termos.ts'));
const { VERSAO_DO_TEXTO, TERMOS_DE_USO, POLITICA_DE_PRIVACIDADE } = require(path.join(raiz, 'src/lib/termos-e-privacidade.ts'));
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };
// lê um arquivo do projeto tirando o \r do Windows (pra o teste funcionar igual no seu PC)
const ler = (arquivo) => fs.readFileSync(path.join(raiz, arquivo), 'utf8').replace(/\r\n/g, '\n');
// tira os comentários (// ... e {/* ... */}) pra conferir só o código que roda
const semComentarios = (texto) => texto.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '');

// ---------- 1) quando a pessoa "chegou no fim"
// celular comum: aparece 300 de altura por vez e o texto inteiro tem 3000
const texto = (rolagem) => ({ rolagem, alturaVisivel: 300, alturaConteudo: 3000 });
ok(A.chegouNoFim({ rolagem: 0, alturaVisivel: 0, alturaConteudo: 0 }) === false, 'antes da tela medir o texto (tudo zerado) o botão de aceitar NÃO é liberado');
ok(A.chegouNoFim({ rolagem: 0, alturaVisivel: 300, alturaConteudo: 0 }) === false && A.chegouNoFim({ rolagem: 0, alturaVisivel: 0, alturaConteudo: 3000 }) === false, 'com só uma das medidas também não libera');
ok(A.chegouNoFim(texto(0)) === false, 'no começo do texto não libera');
ok(A.chegouNoFim(texto(1350)) === false, 'no meio do texto não libera');
ok(A.chegouNoFim(texto(2700 - A.FOLGA_DO_FIM - 1)) === false, `faltando ${A.FOLGA_DO_FIM + 1} pontos pro fim ainda não libera`);
ok(A.chegouNoFim(texto(2700 - A.FOLGA_DO_FIM)) === true && A.chegouNoFim(texto(2700)) === true, `no fim (com folga de ${A.FOLGA_DO_FIM} pontos pro arredondamento do celular) libera`);
ok(A.chegouNoFim(texto(2750)) === true, 'se o celular passar um pouco do fim (efeito elástico do iPhone) continua liberado');
ok(A.FOLGA_DO_FIM > 0 && A.FOLGA_DO_FIM <= 40, 'a folga é pequena (menos de 2 linhas de texto), então não dá pra aceitar sem ver o final');
ok(A.cabeSemRolar({ rolagem: 0, alturaVisivel: 900, alturaConteudo: 880 }) === true && A.cabeSemRolar(texto(0)) === false, 'texto que cabe inteiro na tela conta como lido; texto comprido não');
ok(A.rolagemMaxima(texto(0)) === 2700 && A.rolagemMaxima({ rolagem: 0, alturaVisivel: 900, alturaConteudo: 880 }) === 0, 'sabe até onde dá pra descer (2700 no exemplo; 0 quando cabe tudo)');

// ---------- o botão "Continuar lendo"
const primeiro = A.proximaRolagem(texto(0));
ok(primeiro > 150 && primeiro < 300, `cada toque em "Continuar lendo" desce quase uma tela (${primeiro} de 300), sobrando um pedaço repetido`);
// aperta o botão até chegar no fim, como uma pessoa faria
function toquesAteOFim(alturaVisivel, alturaConteudo, celularAvisa) {
  let rolagem = 0, jaPedido = 0, toques = 0;
  while (toques < 500) {
    const m = { rolagem: celularAvisa ? rolagem : 0, alturaVisivel, alturaConteudo };
    if (celularAvisa ? A.chegouNoFim(m) : jaPedido >= A.rolagemMaxima(m) - 1 && toques > 0) break;
    const alvo = A.proximaRolagem(m, jaPedido);
    if (alvo <= jaPedido && toques > 0) return -1; // travou sem chegar no fim
    jaPedido = alvo; rolagem = alvo; toques++;
  }
  return toques;
}
const t1 = toquesAteOFim(300, 3000, true);
ok(t1 >= 9 && t1 <= 13, `texto de 10 telas: precisa de ${t1} toques pra chegar no fim (não dá pra pular direto)`);
const t2 = toquesAteOFim(300, 3000, false);
ok(t2 > 0 && Math.abs(t2 - t1) <= 1, `se o celular não avisar a rolagem, o botão também chega no fim sozinho, em ${t2} toques (ninguém fica preso)`);
const variados = [[200, 5000], [640, 4100], [333, 7777], [120, 9000], [500, 501], [500, 560]].map(([v, c]) => [v, c, toquesAteOFim(v, c, true), toquesAteOFim(v, c, false)]);
ok(variados.every(([, , a, b]) => a >= 0 && b >= 0), `em telas e textos de vários tamanhos o botão sempre chega no fim, nunca trava (${variados.map(([v, c, a]) => `${c}/${v}: ${a} toques`).join(', ')})`);
ok(variados.filter(([v, c]) => c > v * 3).every(([, , a]) => a >= 3), 'e texto com mais de 3 telas nunca é vencido com 1 ou 2 toques');
ok(A.proximaRolagem(texto(2690)) === 2700 && A.proximaRolagem(texto(2700)) === 2700 && A.proximaRolagem(texto(9999)) === 2700, 'o botão nunca manda descer além do fim');
ok(A.proximaRolagem({ rolagem: 0, alturaVisivel: 0, alturaConteudo: 0 }) === 0, 'antes de medir, o botão não manda a tela pra lugar nenhum');

// ---------- barrinha de progresso
ok(A.parteLida({ rolagem: 0, alturaVisivel: 0, alturaConteudo: 0 }) === 0, 'barrinha: 0 antes de medir');
ok(Math.abs(A.parteLida(texto(0)) - 0.1) < 0.001, 'barrinha: no começo mostra o pedaço que já ta na tela (10% no exemplo)');
ok(A.parteLida(texto(2700)) === 1 && A.parteLida(texto(5000)) === 1, 'barrinha: 100% no fim (e nunca passa disso)');
ok(A.parteLida(texto(300), 1800) === 0.6 && A.parteLida(texto(1500), 1800) === 0.6, 'barrinha: se a pessoa subir de novo, não volta pra trás');

// ---------- 2) o registro do aceite
const quando = new Date('2026-11-25T15:45:10.000Z');
const registro = A.registroDoAceite(quando);
ok(JSON.stringify(Object.keys(registro).sort()) === JSON.stringify(['termos_aceitos_em', 'termos_aceitos_versao']), 'o registro do aceite tem só duas informações: a versão dos termos e a hora');
ok(registro.termos_aceitos_versao === VERSAO_DO_TEXTO && /^\d{2}\/\d{2}\/\d{4}$/.test(VERSAO_DO_TEXTO), `a versão registrada é a data do texto que a pessoa leu (${VERSAO_DO_TEXTO})`);
ok(registro.termos_aceitos_em === '2026-11-25T15:45:10.000Z', 'a hora vai no padrão ISO, o mesmo das outras datas do Supabase');
ok(!Number.isNaN(Date.parse(A.registroDoAceite().termos_aceitos_em)), 'sem passar a hora, usa a hora atual');
ok(A.termosJaAceitos(registro) === true, 'conta com esse registro = termos já aceitos');
ok(A.termosJaAceitos({ nome_completo: 'Maria', senha_provisoria: true, ...registro }) === true, 'os outros dados da conta (nome, senha provisória) não atrapalham a conferência');
ok(A.termosJaAceitos({ ...registro, termos_aceitos_versao: '01/01/2026' }) === false, 'aceite de uma versão ANTIGA do texto não vale pra versão nova');
ok(A.termosJaAceitos({ termos_aceitos_versao: VERSAO_DO_TEXTO }) === false && A.termosJaAceitos({ ...registro, termos_aceitos_em: 'ontem' }) === false, 'sem a hora (ou com hora inválida) não conta como aceito');
ok([null, undefined, '', 'sim', 0, true, []].every((x) => A.termosJaAceitos(x) === false) && A.termosJaAceitos({}) === false, 'conta sem registro nenhum = ainda não aceitou');
// os nomes guardados na conta aparecem num lugar só do app (se alguém criar outro campo, o teste de privacidade reclama)
const arquivos = (pasta) => fs.readdirSync(path.join(raiz, pasta), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? arquivos(pasta + '/' + e.name) : /\.tsx?$/.test(e.name) ? [pasta + '/' + e.name] : []));
const ondeEscreve = arquivos('src').filter((a) => /termos_aceitos_(versao|em)/.test(ler(a)));
ok(JSON.stringify(ondeEscreve) === JSON.stringify(['src/lib/aceite-dos-termos.ts']), `os campos termos_aceitos_versao e termos_aceitos_em são escritos num arquivo só (${ondeEscreve.join(', ')})`);

// ---------- 3) a janela e as telas
const janela = ler('src/features/integracao/AceiteDosTermos.tsx');
const janelaLimpa = semComentarios(janela);
ok(/import \{ TERMOS_DE_USO, VERSAO_DO_TEXTO \} from '@\/lib\/termos-e-privacidade';/.test(janela) && /TERMOS_DE_USO\.map\(/.test(janelaLimpa), 'a janela mostra os Termos de Uso do mesmo arquivo da tela Privacidade e termos (um texto só)');
ok(!/1\. Aceitação|Sua responsabilidade pelo PDF/.test(janelaLimpa), 'e não tem uma cópia do texto escrita dentro dela');
ok(TERMOS_DE_USO.length === 13 && !TERMOS_DE_USO.some((s) => s.textos.some((t) => /nesta tela/.test(t))), 'os 13 itens dos termos não dizem "nesta tela" (eles aparecem em dois lugares)');
const ramos = janelaLimpa.match(/\{leuTudo \? \(([\s\S]*?)\) : \(([\s\S]*?)\)\}/);
ok(!!ramos && /Li e aceito/.test(ramos[1]) && /onPress=\{aceitar\}/.test(ramos[1]) && /Continuar lendo/.test(ramos[2]) && !/aceitar|onAceitar/.test(ramos[2]),
  'o botão "Li e aceito" só é desenhado depois que a pessoa chega no fim; antes disso o botão é "Continuar lendo"');
ok((janelaLimpa.match(/onAceitar\(/g) || []).length === 1 && /function aceitar\(\) \{\s*if \(ocupado \|\| Date\.now\(\) - liberadoEm\.current < 500\) return;\s*onAceitar\(registroDoAceite\(\)\);/.test(janelaLimpa),
  'o aceite só sai por um caminho, e toque no primeiro meio segundo não conta (evita aceitar sem querer ao tocar rápido)');
ok((janelaLimpa.match(/setLeuTudo\(true\)/g) || []).length === 1 && /if \(m\.rolagem > 0 && chegouNoFim\(m\)\) \{ liberar\(\); return; \}/.test(janelaLimpa), 'quem libera o aceite é a rolagem de verdade chegando no fim');
ok(/scrollEventThrottle=\{32\}/.test(janelaLimpa) && /onScrollEndDrag=/.test(janelaLimpa) && /onMomentumScrollEnd=/.test(janelaLimpa) && /onContentSizeChange=/.test(janelaLimpa), 'a janela acompanha a rolagem no Android, no iPhone e no navegador');
ok(/onPress=\{onRecusar\}[\s\S]{0,300}>Não aceito<\/Text>/.test(janelaLimpa) && /if \(!visivel\) return null;/.test(janelaLimpa), 'tem o botão "Não aceito" e a janela some quando não é chamada');
ok(/useEstilosEscalados\(estilosBase\)/.test(janelaLimpa) && /useSafeAreaInsets\(\)/.test(janelaLimpa) && /accessibilityLiveRegion="polite"/.test(janelaLimpa), 'a janela respeita o tamanho do texto, as barras do celular e avisa o leitor de tela');
ok(/router\.push\('\/privacidade' as Href\)/.test(janelaLimpa), 'dá pra abrir a Política de Privacidade completa de dentro da janela');

// Ativar acesso (código)
const ativar = semComentarios(ler('src/app/ativar-acesso.tsx'));
ok(/<AceiteDosTermos visivel=\{!aceite\} onAceitar=\{setAceite\} onRecusar=\{voltar\} \/>/.test(ativar), 'Ativar acesso: a janela dos termos fica aberta enquanto não houver aceite; "Não aceito" sai da tela');
ok(/async function confirmarCodigo\(\) \{\s*if \(ocupado\) return;\s*if \(!aceite\) return;/.test(ativar), 'Ativar acesso: sem aceite o código nem é conferido');
ok(/\{aceite \? \(\s*<View style=\{styles\.bloco\}>\s*<FormField label="E-mail institucional"/.test(ativar), 'Ativar acesso: o formulário só é desenhado depois do aceite (não dá pra digitar por trás da janela)');
const posOtp = ativar.indexOf("type: 'invite'"), posGrava = ativar.indexOf('supabase.auth.updateUser({ data: aceite })'), posEtapa = ativar.indexOf("setEtapa('senha')");
ok(posOtp > 0 && posGrava > posOtp && posEtapa > posGrava, 'Ativar acesso: assim que o código é confirmado, o aceite é gravado na conta');
ok(/updateUser\(\{ password: senha, data: \{ senha_provisoria: false, \.\.\.aceite \} \}\)/.test(ativar) && /if \(!aceite\) \{ setErro\('Para ativar a conta é preciso ler e aceitar os Termos de Uso\.'\); return; \}/.test(ativar),
  'Ativar acesso: a senha só é salva com aceite, e o aceite vai junto de novo (garantia se a primeira gravação falhar)');

// Home (primeiro acesso com senha provisória)
const home = semComentarios(ler('src/features/p01-login-inicio/HomeScreen.tsx'));
ok(/senha_provisoria === true\) \{\s*if \(!termosJaAceitos\(data\.user\.user_metadata\)\) \{\s*setTermosAbertos\(true\);\s*return;\s*\}\s*router\.replace\('\/alterar-senha\?provisoria=1' as Href\);/.test(home),
  'Home: conta com senha provisória que ainda não aceitou vê os termos ANTES de ir trocar a senha');
const aceitarNaHome = (home.match(/async function aceitarTermos\([\s\S]*?\n  \}\n/) || [''])[0];
ok(/const \{ error \} = await supabase\.auth\.updateUser\(\{ data: registro \}\);\s*if \(error\) \{\s*setErroDoAceite\('[^']+'\);\s*return;\s*\}\s*setTermosAbertos\(false\);\s*router\.replace\('\/alterar-senha\?provisoria=1' as Href\);/.test(aceitarNaHome),
  'Home: só segue pra troca de senha depois que o aceite foi gravado; se não gravar, mostra o aviso e fica na janela');
ok(/function recusarTermos\(\) \{\s*setTermosAbertos\(false\);\s*void sair\(\);\s*\}/.test(home), 'Home: "Não aceito" sai da conta (sem aceitar não ativa)');
ok(/aberto=\{tutorial\.aberto && !termosAbertos\}/.test(home) && /<AceiteDosTermos\s+visivel=\{termosAbertos\}/.test(home), 'Home: o tutorial espera a janela dos termos fechar (um de cada vez)');
ok(home.indexOf('<AceiteDosTermos') > home.indexOf('<TutorialInicial') && home.indexOf('<AceiteDosTermos') > home.indexOf('style={styles.page}'), 'Home: a janela é desenhada depois do resto da tela, então fica por cima (inclusive do menu de baixo)');

// a política conta o que fica guardado
const politica = POLITICA_DE_PRIVACIDADE.flatMap((s) => s.textos).join('\n');
const termos = TERMOS_DE_USO.flatMap((s) => s.textos).join('\n');
ok(/Quando você aceita os Termos de Uso na ativação da conta, ficam registradas na conta a versão dos termos e a data do aceite\./.test(politica), 'a Política de Privacidade avisa que o aceite fica registrado na conta (versão e data)');
ok(/Na ativação da conta, o aplicativo mostra estes termos e só continua depois que você lê até o fim e toca em Li e aceito\./.test(termos), 'os Termos de Uso explicam como é o aceite na ativação');
