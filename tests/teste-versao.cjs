// teste da regra de versão (roda o arquivo real src/lib/versao.ts)
// confere quando o app mostra "Nova versão disponível" e quando bloqueia (atualização obrigatória)
const ts = require('typescript'); const fs = require('fs'), path = require('path');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
const { lerVersao, compararVersoes, situacaoDaVersao } = require(path.join((process.argv[2] || path.resolve(__dirname, '..')), 'src/lib/versao.ts'));

let f = 0;
function ok(cond, nome) { console.log((cond ? 'PASSOU ' : 'FALHOU ') + nome); if (!cond) f++; }

ok(JSON.stringify(lerVersao('1.10.2')) === '[1,10,2]', 'lê 1.10.2 como números');
ok(lerVersao('1.0') === null && lerVersao('v1.0.0') === null && lerVersao('') === null, 'versão fora do padrão volta null');
ok(compararVersoes('1.10.0', '1.9.0') === 1, '1.10.0 é mais nova que 1.9.0 (não compara como texto)');
ok(compararVersoes('1.0.0', '1.1.0') === -1, '1.0.0 é mais velha que 1.1.0');
ok(compararVersoes('2.0.0', '2.0.0') === 0, 'versões iguais');

const cfg = { versao_atual: '1.2.0', versao_minima: '1.1.0', obrigatoria: true };
ok(situacaoDaVersao('1.0.0', cfg) === 'atualizacao_obrigatoria', 'abaixo da mínima com obrigatória = bloqueia');
ok(situacaoDaVersao('1.1.0', cfg) === 'atualizacao_disponivel', 'na mínima mas abaixo da atual = só avisa');
ok(situacaoDaVersao('1.2.0', cfg) === 'ok', 'na versão atual = normal');
ok(situacaoDaVersao('1.3.0', cfg) === 'ok', 'versão mais nova que a cadastrada = normal');
ok(situacaoDaVersao('1.0.0', { ...cfg, obrigatoria: false }) === 'atualizacao_disponivel', 'sem obrigatória nunca bloqueia, só avisa');
ok(situacaoDaVersao(null, cfg) === 'ok', 'sem saber a versão instalada não bloqueia');
ok(situacaoDaVersao('1.0.0', null) === 'ok', 'sem configuração (offline ou erro) não bloqueia');
ok(situacaoDaVersao('1.0.0', { versao_atual: 'x', versao_minima: 'y', obrigatoria: true }) === 'ok', 'configuração estragada não bloqueia');

process.exitCode = f ? 1 : 0;
