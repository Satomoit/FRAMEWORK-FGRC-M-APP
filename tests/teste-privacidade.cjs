// [integração 25/11] testes da tela "Privacidade e termos" (src/app/privacidade.tsx)
// os textos ficam em src/lib/termos-e-privacidade.ts (a tela e a janela de aceite da ativação usam os mesmos)
// a ideia principal: o texto da política NÃO pode dizer uma coisa e o código fazer outra
//   1) estrutura: Política (12 seções) + Termos (13 seções) + Referências, sem parágrafo repetido ou vazio
//   2) o que a Nicole escreveu em 23/11 (PR #8) continua lá, frase por frase
//   3) o que a LGPD manda informar (art. 9º) e os direitos do art. 18 aparecem no texto
//   4) texto x código: os dados que a política lista são os que as telas mandam de verdade,
//      e o app não ganhou nenhuma tabela, rastreador ou permissão que a política não conta
// nenhum teste fala com o Supabase: é tudo lido dos arquivos do projeto
const ts = require('typescript');
const fs = require('fs'), path = require('path');
const raiz = path.resolve(process.argv[2] || path.resolve(__dirname, '..'));
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) process.exitCode = 1; };
// lê um arquivo do projeto tirando o \r do Windows (pra o teste funcionar igual no seu PC)
const ler = (arquivo) => fs.readFileSync(path.join(raiz, arquivo), 'utf8').replace(/\r\n/g, '\n');
// lista os .ts e .tsx de uma pasta (com as subpastas)
const listar = (pasta) => fs.readdirSync(path.join(raiz, pasta), { withFileTypes: true }).flatMap((e) => {
  const p = pasta + '/' + e.name;
  return e.isDirectory() ? listar(p) : /\.tsx?$/.test(e.name) ? [p] : [];
});

// ---------- pega os textos sem precisar abrir a tela
// o arquivo de textos não depende de mais nada, então dá pra transformar em JavaScript e rodar direto
const fonte = ler('src/app/privacidade.tsx');
const fonteDosTextos = ler('src/lib/termos-e-privacidade.ts');
const NOMES = ['VERSAO_DO_TEXTO', 'RESUMO', 'POLITICA_DE_PRIVACIDADE', 'TERMOS_DE_USO', 'REFERENCIAS'];
const temAsListas = NOMES.every((n) => new RegExp(`export const ${n}\\b`).test(fonteDosTextos));
ok(temAsListas, 'achou as listas de texto em src/lib/termos-e-privacidade.ts');
// sem as listas não tem o que conferir: para aqui com um aviso claro (em vez de um erro esquisito mais embaixo)
if (!temAsListas) { console.log('FALHOU o arquivo de textos não tem mais as listas ' + NOMES.join(', ')); process.exit(1); }
const js = ts.transpileModule(fonteDosTextos, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const modulo = { exports: {} };
new Function('module', 'exports', js)(modulo, modulo.exports);
// a tela tem que mostrar ESSAS listas (se alguém colar um texto antigo direto na tela, o teste avisa)
ok(/import \{ POLITICA_DE_PRIVACIDADE, REFERENCIAS, RESUMO, TERMOS_DE_USO, VERSAO_DO_TEXTO, type Secao \} from '@\/lib\/termos-e-privacidade';/.test(fonte)
  && /desenharSecoes\(POLITICA_DE_PRIVACIDADE\)/.test(fonte) && /desenharSecoes\(TERMOS_DE_USO\)/.test(fonte) && /RESUMO\.map\(/.test(fonte) && /REFERENCIAS\.map\(/.test(fonte),
  'a tela Privacidade e termos mostra o resumo, a política, os termos e as referências desse arquivo de textos');
ok(!/^const (SECOES|RESUMO|POLITICA_DE_PRIVACIDADE|TERMOS_DE_USO|REFERENCIAS)\b/m.test(fonte), 'e não tem outra cópia do texto escrita dentro da tela');
const { VERSAO_DO_TEXTO, RESUMO, POLITICA_DE_PRIVACIDADE: POLITICA, TERMOS_DE_USO: TERMOS, REFERENCIAS } = modulo.exports;
const textosDe = (lista) => lista.flatMap((s) => s.textos);
const tudo = [...RESUMO, ...textosDe(POLITICA), ...textosDe(TERMOS)];
const textoInteiro = tudo.join('\n');
const politicaInteira = textosDe(POLITICA).join('\n');
const termosInteiros = textosDe(TERMOS).join('\n');
// acha a seção pelo começo do título (ex: secao(POLITICA, '2.'))
const secao = (lista, numero) => (lista.find((s) => s.titulo.startsWith(numero + ' ')) || { titulo: '', textos: [] });

// ---------- 1) estrutura
ok(/^\d{2}\/\d{2}\/\d{4}$/.test(VERSAO_DO_TEXTO), `a versão do texto é uma data (${VERSAO_DO_TEXTO})`);
ok((fonte.match(/\{VERSAO_DO_TEXTO\}/g) || []).length === 2, 'a data da versão aparece no começo e no fim da tela');
ok(RESUMO.length >= 4 && RESUMO.length <= 7, `o resumo é curto (${RESUMO.length} itens)`);
const numeros = (lista) => lista.map((s) => s.titulo.split('.')[0]).join(',');
ok(numeros(POLITICA) === '1,2,3,4,5,6,7,8,9,10,11,12', 'Política de Privacidade: 12 seções numeradas em ordem');
ok(numeros(TERMOS) === '1,2,3,4,5,6,7,8,9,10,11,12,13', 'Termos de Uso: 13 seções numeradas em ordem');
const titulos = [...POLITICA, ...TERMOS].map((s) => s.titulo);
ok(new Set(titulos).size === titulos.length, 'nenhum título repetido (o React usa o título pra diferenciar os blocos)');
const repetidos = [...POLITICA, ...TERMOS].filter((s) => new Set(s.textos).size !== s.textos.length).map((s) => s.titulo);
ok(repetidos.length === 0, `nenhum parágrafo repetido dentro da mesma seção${repetidos.length ? ' -> ' + repetidos.join(' | ') : ''}`);
const vazias = [...POLITICA, ...TERMOS].filter((s) => s.textos.length === 0).map((s) => s.titulo);
ok(vazias.length === 0, 'toda seção tem pelo menos um parágrafo');
const malEscritos = tudo.filter((t) => t !== t.trim() || /\s{2,}/.test(t) || !/^(• )?["A-ZÀ-Úa-zà-ú]/.test(t) || !/[.:;]$/.test(t));
ok(malEscritos.length === 0, `todo parágrafo termina com pontuação e não tem espaço sobrando${malEscritos.length ? ' -> ' + malEscritos.map((t) => t.slice(0, 40)).join(' | ') : ''}`);
const longos = tudo.filter((t) => t.length > 420);
ok(longos.length === 0, `nenhum parágrafo com mais de 420 letras (texto longo cansa quem lê no celular)${longos.length ? ' -> ' + longos.map((t) => t.slice(0, 40) + '... (' + t.length + ')').join(' | ') : ''}`);
ok(/<Text accessibilityRole="header"[^>]*>\s*Política de Privacidade/.test(fonte) && /<Text accessibilityRole="header"[^>]*>\s*Termos de Uso/.test(fonte) && /<Text accessibilityRole="header"[^>]*>\s*Referências/.test(fonte),
  'as três partes (Política de Privacidade, Termos de Uso e Referências) têm título de verdade pro leitor de tela');
ok(/useEstilosEscalados\(estilosBase\)/.test(fonte), 'a tela continua obedecendo o "Tamanho do texto" das Configurações (integração de 19/11)');

// ---------- 2) o trabalho da Nicole (23/11) continua no texto
ok(fonte.startsWith('//[alteração — 23/11/2026] Incluídas as referências e as responsabilidades'), 'o comentário de alteração da Nicole continua no começo do arquivo');
const DA_NICOLE = [
  'As respostas das avaliações, o rascunho, o histórico e os resultados ficam guardados apenas no celular ou no navegador onde você usa o app. Essas informações não são enviadas ao servidor do FGRC-M.',
  'Cada conta tem o seu próprio espaço no aparelho. Se outra pessoa entrar com outra conta no mesmo aparelho, ela não vê as suas avaliações pelo aplicativo.',
  'Se você desinstalar o app ou apagar os dados do navegador, essas informações podem ser perdidas e não poderão ser recuperadas pelo FGRC-M. Exporte e guarde os relatórios em PDF que forem importantes.',
  'Quando você fala com o suporte, enviamos: nome, e-mail, assunto e o texto que você escreveu. As respostas das avaliações não são incluídas automaticamente. Não coloque senhas ou informações sigilosas na mensagem.',
  'Outras prefeituras e outros usuários não têm acesso aos seus dados pelo aplicativo.',
  'Os resultados servem para orientar a prefeitura. Eles não substituem uma auditoria, uma certificação ou uma análise feita por especialistas.',
  'Você é responsável pela veracidade e atualização das informações que registra e deve ter autorização para responder em nome da prefeitura.',
  'Confira as respostas antes de concluir a avaliação. Informações incorretas ou incompletas podem comprometer os resultados e as recomendações.',
  'Não inclua senhas, credenciais ou dados pessoais e sigilosos que não sejam necessários à avaliação.',
  'O relatório em PDF é gerado com base nas respostas registradas. Você é responsável por conferir o conteúdo antes de utilizar ou compartilhar o documento.',
  'Após salvar ou exportar o PDF, você é responsável pela guarda, pelo uso, pelas cópias e pelo compartilhamento do arquivo sob seu controle.',
  'O relatório pode conter informações sobre riscos e fragilidades da prefeitura. Compartilhe apenas com pessoas autorizadas e evite deixar o arquivo em dispositivos, links ou canais públicos.',
  'O FGRC-M não controla o acesso às cópias salvas ou compartilhadas fora do aplicativo.',
  'Essas responsabilidades não afastam as obrigações legais de segurança e proteção de dados dos responsáveis pelo FGRC-M.',
  'A exclusão da conta não apaga as cópias dos relatórios em PDF que você já salvou ou compartilhou fora do aplicativo.',
  'O acesso é pessoal e só é liberado depois que a administração confere o pedido. Não compartilhe a sua senha nem utilize a conta de outra pessoa.',
  'Use o aplicativo apenas para avaliações autorizadas. A prefeitura e o usuário responsável pelo preenchimento devem conferir as informações e avaliar as recomendações antes de tomar decisões.',
];
const sumiram = DA_NICOLE.filter((frase) => !tudo.includes(frase));
ok(sumiram.length === 0, `os ${DA_NICOLE.length} parágrafos que a Nicole escreveu ou ajustou continuam iguais${sumiram.length ? ' -> sumiu: ' + sumiram.map((t) => t.slice(0, 50)).join(' | ') : ''}`);
ok(TERMOS.some((s) => /Sua responsabilidade pelas informações$/.test(s.titulo)) && TERMOS.some((s) => /Sua responsabilidade pelo PDF$/.test(s.titulo)),
  'as duas seções pedidas pelo grupo continuam: responsabilidade pelas informações e pelo PDF');
const REFERENCIAS_DA_NICOLE = ['https://www.nist.gov/cyberframework', 'https://www.cisecurity.org/controls', 'https://www.iso.org/standard/27001', 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm'];
const urls = REFERENCIAS.map((r) => r.url);
ok(REFERENCIAS_DA_NICOLE.every((u) => urls.includes(u)), 'as 4 referências da Nicole continuam (NIST, CIS, ISO 27001 e LGPD)');
ok(urls.every((u) => /^https:\/\/[a-z0-9.-]+\//.test(u)) && new Set(urls).size === urls.length, `as ${urls.length} referências têm endereço https e nenhuma repetida`);
ok(REFERENCIAS.every((r) => r.titulo.trim() && r.descricao.trim().endsWith('.')), 'toda referência tem título e descrição');
ok(/não significa que o aplicativo\s+seja certificado ou aprovado pelas instituições citadas/.test(fonte), 'continua o aviso de que citar a referência não é certificação');
ok(/Linking\.openURL\(referencia\.url\)/.test(fonte) && /accessibilityRole="link"/.test(fonte) && /selectable/.test(fonte), 'as referências abrem no navegador e o endereço fica visível pra copiar');

// ---------- 3) o que a lei manda informar
// LGPD art. 9º: finalidade, forma e duração, quem é o controlador, contato, compartilhamento, responsabilidades e direitos
const exigido = [
  ['finalidade do tratamento (art. 9º, I)', /Para que os dados são usados/.test(titulos.join('|')) && /Base legal/.test(politicaInteira)],
  ['duração (art. 9º, II)', /Por quanto tempo os dados ficam guardados/.test(titulos.join('|'))],
  ['quem é o controlador (art. 9º, III)', /essa equipe é a controladora dos dados/.test(politicaInteira)],
  ['contato do controlador (art. 9º, IV)', /Canal de atendimento sobre dados pessoais: Ajuda e suporte/.test(politicaInteira)],
  ['com quem é compartilhado (art. 9º, V)', /com quem são compartilhados/.test(titulos.join('|')) && /Supabase/.test(politicaInteira) && /Expo/.test(politicaInteira)],
  ['responsabilidade de quem trata (art. 9º, VI)', /continua responsável pelos seus dados/.test(politicaInteira)],
  ['direitos com o art. 18 citado (art. 9º, VII)', /LGPD \(art\. 18\)/.test(politicaInteira)],
];
for (const [nome, tem] of exigido) ok(tem, `a política informa: ${nome}`);
const direitos = secao(POLITICA, '9.').textos.join('\n');
const palavrasDosDireitos = ['confirmar', 'acesso', 'corrigir', 'anonimização', 'bloqueio', 'eliminação', 'portabilidade', 'compartilhados', 'consentimento', 'revogar', 'se opor', 'petição à ANPD'];
const faltamDireitos = palavrasDosDireitos.filter((p) => !direitos.includes(p));
ok(faltamDireitos.length === 0, `a seção "Seus direitos" cobre os direitos do art. 18 da LGPD${faltamDireitos.length ? ' -> falta: ' + faltamDireitos.join(', ') : ''}`);
ok(/em até \d+ dias/.test(direitos), 'a seção de direitos diz o prazo de resposta');
ok(/Canadá/.test(secao(POLITICA, '6.').textos.join(' ')) && /fora do Brasil/.test(secao(POLITICA, '6.').textos.join(' ')) && /arts\. 33 a 36/.test(secao(POLITICA, '6.').textos.join(' ')),
  'a política conta que o servidor fica fora do Brasil (transferência internacional, LGPD arts. 33 a 36)');
ok(/art\. 48/.test(secao(POLITICA, '8.').textos.join(' ')) && /ANPD/.test(secao(POLITICA, '8.').textos.join(' ')), 'a política diz o que acontece se houver incidente de segurança (LGPD art. 48)');
ok(/Marco Civil da Internet \(Lei nº 12\.965\/2014\)/.test(termosInteiros) && /LGPD \(Lei nº 13\.709\/2018\)/.test(termosInteiros), 'os termos citam as duas leis que valem pro app (LGPD e Marco Civil da Internet)');
ok(/você declara que leu e concorda com estes Termos de Uso e com a Política de Privacidade/.test(termosInteiros), 'os termos dizem como a pessoa aceita (ao pedir acesso, ativar a conta ou usar)');
ok(/Dentro do que a lei permite/.test(termosInteiros) && /Nada nestes termos retira direitos que a lei garante a você/.test(termosInteiros), 'o limite de responsabilidade não tenta tirar direito que a lei dá');
ok(!/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(fonte + fonteDosTextos), 'a tela e o arquivo de textos não têm nenhum e-mail escrito (nada de dado pessoal da equipe no texto público)');

// ---------- 4) texto x código (o que a política promete é o que o app faz)
// pega os nomes dos campos que uma tela manda pro banco: supabase.from('tabela').insert({ campo: ..., campo2, ... })
function camposEnviados(arquivo, tabela) {
  const m = ler(arquivo).match(new RegExp(`from\\((['"])${tabela}\\1\\)\\.insert\\(\\{([\\s\\S]*?)\\}\\)`));
  if (!m) return null;
  const semComentario = m[2].replace(/\/\/.*$/gm, '');
  return [...semComentario.matchAll(/^\s*([A-Za-z_]+)\s*(?::|,|$)/gm)].map((x) => x[1]).sort();
}
const doPedido = camposEnviados('src/app/solicitar-acesso.tsx', 'access_requests');
ok(JSON.stringify(doPedido) === JSON.stringify(['email', 'estado', 'municipio', 'nome', 'plataforma', 'prefeitura']),
  `o pedido de acesso manda só: nome, e-mail, prefeitura, município, estado e de onde saiu (achei: ${doPedido ? doPedido.join(', ') : 'nada'}). Se mudou, atualize a seção 2 da política`);
const sobrePedido = secao(POLITICA, '2.').textos.find((t) => t.startsWith('Quando você pede acesso')) || '';
ok(['nome', 'e-mail', 'prefeitura', 'município', 'estado', 'navegador ou do celular'].every((p) => sobrePedido.includes(p)), 'a política lista todos os dados do pedido de acesso');
const doSuporte = camposEnviados('src/app/suporte.tsx', 'support_requests');
ok(JSON.stringify(doSuporte) === JSON.stringify(['assunto', 'email', 'mensagem', 'nome', 'plataforma']),
  `a mensagem de suporte manda só: nome, e-mail, assunto, texto e de onde saiu (achei: ${doSuporte ? doSuporte.join(', ') : 'nada'}). Se mudou, atualize a seção 2 da política`);
const sobreSuporte = secao(POLITICA, '2.').textos.find((t) => t.startsWith('Quando você fala com o suporte')) || '';
ok(['nome', 'e-mail', 'assunto', 'texto que você escreveu'].every((p) => sobreSuporte.includes(p)), 'a política lista todos os dados da mensagem de suporte');

// fora da área administrativa, o app só pode falar com estas tabelas e funções do servidor
// (se aparecer outra, alguém precisa conferir se a política continua verdadeira, principalmente o
// "as respostas não são enviadas ao servidor", que é o requisito RNF-002 da documentação)
const doApp = listar('src').filter((a) => !a.startsWith('src/features/admin/') && a !== 'src/lib/admin.ts');
const chamadas = new Set();
for (const a of doApp) {
  for (const m of ler(a).matchAll(/\.from\(\s*['"`]([a-z_]+)['"`]\s*\)|\.rpc\(\s*['"`]([a-z_]+)['"`]|functions\.invoke\(\s*['"`]([a-z-]+)['"`]/g)) {
    chamadas.add(m[1] ? 'tabela ' + m[1] : m[2] ? 'consulta ' + m[2] : 'função ' + m[3]);
  }
}
const PERMITIDAS = ['tabela access_requests', 'tabela support_requests', 'consulta situacao_do_pedido', 'consulta meus_chamados_fgrcm', 'consulta estado_do_sistema_fgrcm', 'função notificacoes-fgrcm'];
const aMais = [...chamadas].filter((c) => !PERMITIDAS.includes(c));
ok(aMais.length === 0 && chamadas.size === PERMITIDAS.length, `o app (fora da administração) só fala com 2 tabelas, 3 consultas e 1 função do servidor, as que a política descreve${aMais.length ? ' -> apareceu: ' + aMais.join(', ') : ''}`);
const telasDaAvaliacao = doApp.filter((a) => /^src\/features\/p0[3-6]-/.test(a) || ['src/lib/avaliacoes-reais.ts', 'src/lib/calcular-relatorio.ts', 'src/lib/explicacoes-simples.ts'].includes(a));
const mandam = telasDaAvaliacao.filter((a) => /supabase\s*\.\s*(from|rpc|functions|storage)/.test(ler(a)) || /\bfetch\(|XMLHttpRequest/.test(ler(a)));
ok(telasDaAvaliacao.length > 10 && mandam.length === 0, `nenhuma tela de avaliação, resultado ou relatório manda dado pra fora do aparelho (${telasDaAvaliacao.length} arquivos conferidos)${mandam.length ? ' -> ' + mandam.join(', ') : ''}`);

// a consulta pública da situação do pedido só devolve a situação (é o que a seção 5 da política diz)
const migracoes = fs.readdirSync(path.join(raiz, 'supabase/migrations')).map((f) => ler('supabase/migrations/' + f)).join('\n');
const consulta = migracoes.match(/create or replace function public\.situacao_do_pedido\(p_email text\)\s*returns text[\s\S]*?\$\$([\s\S]*?)\$\$/);
// o aceite dos Termos de Uso na ativação fica registrado na conta: a política tem que contar isso
ok(/ficam registradas na conta a versão dos termos e a data do aceite/.test(secao(POLITICA, '2.').textos.join(' ')), 'a política lista o registro do aceite dos termos (versão e data) entre os dados guardados');
ok(!!consulta && /select a\.status\s+from public\.access_requests/.test(consulta[1]) && !/nome|prefeitura|municipio/.test(consulta[1]),
  'a consulta "Situação do pedido" devolve só a situação (pendente, aprovado ou recusado), sem nome nem prefeitura');
ok(/Situação do pedido/.test(ler('src/app/situacao-pedido.tsx')) && /Na tela Situação do pedido/.test(politicaInteira), 'a política cita a tela Situação do pedido com o nome que ela tem no app');

// sem rastreador, anúncio, localização, câmera, microfone ou contatos (seções 2, 4 e 11 da política)
const pacote = JSON.parse(ler('package.json'));
const instalados = Object.keys({ ...pacote.dependencies, ...pacote.devDependencies });
const PROIBIDOS = /firebase|analytics|sentry|amplitude|mixpanel|segment|appsflyer|adjust|posthog|onesignal|facebook|fbsdk|google-mobile-ads|admob|expo-ads|tracking-transparency|expo-location|expo-camera|expo-contacts|expo-av|expo-audio|expo-image-picker|expo-notifications|expo-sensors|geolocation/i;
const suspeitos = instalados.filter((p) => PROIBIDOS.test(p));
ok(suspeitos.length === 0, `nenhum pacote de rastreamento, anúncio, localização, câmera, microfone ou contatos instalado${suspeitos.length ? ' -> ' + suspeitos.join(', ') : ''}`);
const codigoDoApp = listar('src').map((a) => ler(a)).join('\n');
ok(!/googletagmanager|google-analytics|gtag\(|fonts\.googleapis|hotjar|clarity\.ms|connect\.facebook/.test(codigoDoApp), 'nenhuma tela carrega script de medição de audiência ou fonte de fora');
const app = JSON.parse(ler('app.json')).expo;
const permissoes = (app.android && app.android.permissions) || [];
ok(permissoes.length === 0, `o app.json não pede nenhuma permissão extra do Android${permissoes.length ? ' -> ' + permissoes.join(', ') : ''}`);

// senha: o que a política diz é a regra que o código cobra
const senhaJs = ts.transpileModule(ler('src/lib/politica-senha.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const senha = { exports: {} };
new Function('module', 'exports', senhaJs)(senha, senha.exports);
const sobreSenha = secao(POLITICA, '8.').textos.find((t) => t.includes('A senha precisa ser forte')) || '';
ok(sobreSenha.includes(`pelo menos ${senha.exports.TAMANHO_MINIMO_SENHA} caracteres`) && ['maiúscula', 'minúscula', 'número', 'símbolo'].every((p) => sobreSenha.includes(p)),
  `a política descreve a mesma regra de senha do código (mínimo de ${senha.exports.TAMANHO_MINIMO_SENHA} caracteres, maiúscula, minúscula, número e símbolo)`);
ok(senha.exports.validarSenhaForte('Prefeitura#2026') && !senha.exports.validarSenhaForte('prefeitura#2026') && !senha.exports.validarSenhaForte('PREFEITURA#2026') && !senha.exports.validarSenhaForte('Prefeitura#abcd') && !senha.exports.validarSenhaForte('Prefeitura22026') && !senha.exports.validarSenhaForte('Pref#2026'),
  'e o código recusa mesmo senha sem maiúscula, sem minúscula, sem número, sem símbolo ou curta');

// os nomes de tela e de botão que o texto manda a pessoa procurar existem no app
const suporte = ler('src/app/suporte.tsx');
ok(/'Outro assunto'/.test(suporte) && /Escolha "Outro assunto"/.test(politicaInteira), 'o assunto que a política manda escolher no suporte ("Outro assunto") existe na tela');
ok(/title="Ajuda e suporte"/.test(suporte), 'a tela de contato se chama "Ajuda e suporte", como no texto');
const menuMais = ler('src/features/p09-menu-perfil/MenuMaisScreen.tsx');
ok(/title="Meu perfil"/.test(menuMais) && /title="Meus chamados"/.test(menuMais) && /title="Ajuda e suporte"/.test(menuMais), 'o menu Mais tem "Meu perfil", "Meus chamados" e "Ajuda e suporte", citados no texto');
ok(/'Compartilhar PDF'/.test(ler('src/features/p06-relatorios-recomendacoes/RecomendacoesScreen.tsx')) && /Quando você usa Compartilhar PDF/.test(termosInteiros), 'o botão "Compartilhar PDF" citado nos termos existe na tela de recomendações');

// dá pra ler a política e falar com a equipe ANTES de ter conta
const navegacao = ler('src/components/app-navigation.tsx');
const publicas = (navegacao.match(/const rotasPublicas = \[([\s\S]*?)\];/) || ['', ''])[1];
ok(/"\/privacidade"/.test(publicas) && /"\/suporte"/.test(publicas), 'Privacidade e termos e Ajuda e suporte abrem sem login');
ok(/router\.push\('\/suporte' as Href\)/.test(fonte) && /Abrir Ajuda e suporte/.test(fonte), 'a tela tem o atalho "Abrir Ajuda e suporte" (é o canal pra exercer os direitos)');
const pedido = ler('src/app/solicitar-acesso.tsx');
const posAviso = pedido.indexOf('Ao enviar, você declara que leu e concorda com a');
const posBotao = pedido.indexOf('Enviar solicitação</Text>');
ok(posAviso > 0 && posBotao > posAviso && /router\.push\("\/privacidade" as Href\)/.test(pedido), 'o pedido de acesso avisa da política, com link, antes do botão de enviar');

// a tela Conheça não promete mais do que o app controla
const conheca = ler('src/features/entrada/ConhecaScreen.tsx');
ok(/texto="Ajuda e suporte" onPress=\{\(\) => ir\('\/suporte'\)\}/.test(conheca) && /na página inicial ou no menu Mais/.test(politicaInteira), 'o canal de atendimento está onde a política diz: na página inicial (Conheça) e no menu Mais');
ok(!/não vão para a internet'?/.test(conheca.replace(/^\s*\/\/.*$/gm, '')) && /eles não são enviados ao servidor do FGRC-M/.test(conheca), 'a tela Conheça fala "não são enviados ao servidor do FGRC-M" (igual à política)');
