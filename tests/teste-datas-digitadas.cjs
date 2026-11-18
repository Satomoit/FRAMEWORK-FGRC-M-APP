// teste das datas digitadas no painel (roda o arquivo real src/lib/datas.ts)
// previsão de retorno da manutenção e data de publicação da versão
const ts = require('typescript'); const fs = require('fs'), path = require('path');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
process.env.TZ = 'America/Sao_Paulo';
const { lerDataHoraDigitada, lerDataDigitada, paraDigitar } = require(path.join((process.argv[2] || path.resolve(__dirname, '..')), 'src/lib/datas.ts'));

let f = 0;
function ok(cond, nome) { console.log((cond ? 'PASSOU ' : 'FALHOU ') + nome); if (!cond) f++; }

ok(lerDataHoraDigitada('') === null, 'campo vazio = sem previsão (não inventa horário)');
ok(lerDataHoraDigitada('18/11/2026 22:30') === '2026-11-19T01:30:00.000Z', '22:30 de Brasília vira 01:30 UTC do dia seguinte');
ok(lerDataHoraDigitada('31/02/2026 10:00') === 'invalida', '31/02 não existe');
ok(lerDataHoraDigitada('18/11/2026 25:00') === 'invalida', 'hora 25 não existe');
ok(lerDataHoraDigitada('amanhã') === 'invalida', 'texto solto é recusado');
ok(lerDataDigitada('18/11/2026') === '2026-11-18', 'data de publicação vira 2026-11-18');
ok(lerDataDigitada('18/11/2026 10:00') === 'invalida', 'data de publicação não aceita hora');
ok(paraDigitar('2026-11-19T01:30:00.000Z') === '18/11/2026 22:30', 'volta pro formato do campo no fuso local');
ok(paraDigitar('2026-11-18', false) === '18/11/2026', 'data pura não muda de dia por causa do fuso');

process.exitCode = f ? 1 : 0;
