// teste do nome do arquivo do PDF (roda o arquivo real src/lib/nome-do-pdf.ts)
// padrão pedido: FGRC-M_Avaliacao_2026-11-18_AB12CD.pdf, sem dado pessoal e sem caractere que dá problema
const ts = require('typescript'); const fs = require('fs'), path = require('path');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
// o teste usa o fuso de Brasília, igual o celular de quem testa
process.env.TZ = 'America/Sao_Paulo';
const { nomeDoArquivoPdf, codigoCurto } = require(path.join((process.argv[2] || path.resolve(__dirname, '..')), 'src/lib/nome-do-pdf.ts'));

let f = 0;
function ok(cond, nome) { console.log((cond ? 'PASSOU ' : 'FALHOU ') + nome); if (!cond) f++; }

const nome = nomeDoArquivoPdf('avaliacao-123', '2026-11-18T23:30:00-03:00');
ok(/^FGRC-M_Avaliacao_\d{4}-\d{2}-\d{2}_[A-Z0-9]{6}\.pdf$/.test(nome), `segue o padrão (${nome})`);
ok(nome.startsWith('FGRC-M_Avaliacao_2026-11-18_'), 'usa o dia local (22h30/23h30 em Brasília não vira o dia seguinte)');
ok(/^[A-Za-z0-9_.-]+$/.test(nome), 'só letras sem acento, números, ponto, hífen e sublinhado');
ok(nomeDoArquivoPdf('avaliacao-123', '2026-11-18T10:00:00-03:00') === nome, 'mesma avaliação = mesmo nome');
ok(nomeDoArquivoPdf('avaliacao-124', '2026-11-18T10:00:00-03:00') !== nome, 'outra avaliação no mesmo dia = nome diferente');
ok(codigoCurto('x').length === 6 && codigoCurto('').length === 6, 'código curto sempre tem 6 caracteres');
ok(!nome.includes('avaliacao-123'), 'o id da avaliação não aparece inteiro no nome');
ok(/_\d{4}-\d{2}-\d{2}_/.test(nomeDoArquivoPdf('a', 'data estragada')), 'data inválida usa o dia de hoje (nunca NaN)');

process.exitCode = f ? 1 : 0;
