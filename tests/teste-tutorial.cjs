// [integração 19/11] testa as contas do tutorial guiado (src/features/integracao/passos-tutorial.ts)
// roda com: node tests/teste-tutorial.cjs
const ts = require('typescript');
const fs = require('fs'), path = require('path');
const raiz = process.argv[2] || path.resolve(__dirname, '..');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
const T = require(path.join(raiz, 'src/features/integracao/passos-tutorial.ts'));
let f = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) f++; };

const P = T.PASSOS_TUTORIAL, n = P.length;
ok(n >= 5 && n <= 7, `tutorial curto (${n} passos)`);
ok(new Set(P.map(p => p.id)).size === n, 'cada passo tem um id diferente');
ok(P[0].alvo === null, 'primeiro passo é a boas-vindas (sem destaque)');
ok(P.every(p => typeof p.icone === 'string' && p.icone.length > 2), 'todo passo tem ícone');
const ult = P[n - 1];
ok(ult.alvo === null && Array.isArray(ult.lista) && ult.lista.length === 3, 'último passo é o resumo com 3 itens (Avaliações, Resultados, Relatórios)');
// confere se os ícones existem no Ionicons (só quando o node_modules completo ta instalado, no computador)
let glifos = null;
try { glifos = require(path.join(raiz, 'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json')); } catch { glifos = null; }
if (glifos) ok(P.every(p => p.icone in glifos), 'todos os ícones existem no Ionicons');
else console.log('(pulei a conferência dos ícones: node_modules completo não encontrado)');
ok(P.filter(p => p.alvo).every(p => p.dicaSemAlvo && p.dicaSemAlvo.length > 10), 'todo passo com destaque tem explicação alternativa (quando não dá pra iluminar)');
ok(['aba:Avaliações', 'aba:Resultados', 'aba:Relatórios', 'aba:Mais'].every(a => P.some(p => p.alvo === a)), 'aponta pros 4 botões do menu de baixo da Home');
ok(P.every(p => !/\btoque aqui\b/i.test(p.texto)), 'textos dizem onde fica (não só "toque aqui"), bom pra leitor de tela');

// navegação
ok(T.passoSeguinte(0, n) === 1 && T.passoSeguinte(n - 1, n) === n - 1, 'Próximo avança e não passa do último');
ok(T.passoAnterior(3) === 2 && T.passoAnterior(0) === 0, 'Voltar volta e não fica negativo');
ok(T.ehUltimoPasso(n - 1, n) && !T.ehUltimoPasso(0, n), 'sabe quando é o último (mostra Concluir)');
ok(T.rotuloDoPasso(1, 6) === 'Passo 2 de 6', 'rótulo "Passo 2 de 6"');

// destaque
const tela = { largura: 400, altura: 800 };
const aba = { x: 100, y: 740, largura: 60, altura: 48 };
const b = T.buracoDoDestaque(aba, tela);
ok(b && b.x === 94 && b.y === 734 && b.largura === 72 && b.altura === 60, 'buraco = botão + folga de 6 em volta');
const cortado = T.buracoDoDestaque({ x: 100, y: 760, largura: 60, altura: 48 }, tela);
ok(cortado && cortado.y === 754 && cortado.altura === 46, 'buraco cortado na borda da tela (não passa do fim)');
ok(T.buracoDoDestaque(null, tela) === null, 'sem botão registrado: sem destaque');
ok(T.buracoDoDestaque({ x: 0, y: 0, largura: 0, altura: 0 }, tela) === null, 'botão sem tamanho (ainda não desenhou): sem destaque');
ok(T.buracoDoDestaque({ x: 10, y: 900, largura: 300, altura: 80 }, tela) === null, 'botão fora da tela (lá embaixo na rolagem): sem destaque, usa a explicação');
ok(T.buracoDoDestaque({ x: 10, y: 780, largura: 300, altura: 80 }, tela) === null, 'botão quase todo escondido: sem destaque');
ok(T.buracoDoDestaque({ x: 10, y: 750, largura: 300, altura: 60 }, tela) !== null, 'botão com a maior parte visível: destaca');
ok(T.buracoDoDestaque({ x: NaN, y: 1, largura: 3, altura: 3 }, tela) === null, 'medida estragada: sem destaque');

const partes = T.partesDoEscurecimento(b, tela);
const area = partes.reduce((s, r) => s + r.largura * r.altura, 0);
ok(area === tela.largura * tela.altura - b.largura * b.altura, 'faixas escuras cobrem tudo menos o buraco');
ok(partes.every(r => r.largura > 0 && r.altura > 0), 'nenhuma faixa vazia');
ok(T.partesDoEscurecimento(null, tela).length === 1, 'sem destaque: escurece a tela toda');

// cartão
const l1 = T.lugarDoCartao(b, tela);
ok(l1.lugar === 'acima' && l1.bottom === 800 - 734 + 14 && l1.alturaMaxima === 734 - 28, 'botão embaixo: cartão fica em cima, sem cobrir o botão');
const l2 = T.lugarDoCartao({ x: 10, y: 20, largura: 100, altura: 40 }, tela);
ok(l2.lugar === 'abaixo' && l2.top === 74, 'botão em cima: cartão fica embaixo');
const l3 = T.lugarDoCartao({ x: 0, y: 100, largura: 400, altura: 230 }, { largura: 400, altura: 400 });
ok(l3.lugar === 'centro', 'sem espaço nem em cima nem embaixo: cartão no meio');
ok(T.lugarDoCartao(null, tela).lugar === 'centro', 'sem destaque: cartão no meio');
ok(T.lugarDoCartao(null, { largura: 320, altura: 100 }).alturaMaxima >= 120, 'tela minúscula: cartão ainda tem altura mínima (com rolagem)');

const m = T.medidasDoCartao(b, tela);
ok(m.largura === 376 && m.esquerda === 12, 'cartão ocupa a largura do celular com margem');
ok(m.seta === 130 - 12, 'setinha aponta pro meio do botão');
const m2 = T.medidasDoCartao({ x: 390, y: 700, largura: 10, altura: 10 }, tela);
ok(m2.seta === m2.largura - 22, 'setinha não sai do cartão');
const m3 = T.medidasDoCartao(null, { largura: 1400, altura: 900 });
ok(m3.largura === 460 && m3.esquerda === 470, 'no computador o cartão tem largura máxima e fica centralizado');

process.exitCode = f ? 1 : 0;
