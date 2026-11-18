// teste da regra de senha (roda o arquivo real src/lib/politica-senha.ts)
const ts = require('typescript'); const fs = require('fs'), path = require('path');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
const { validarSenhaForte, oQueFaltaNaSenha } = require(path.join((process.argv[2] || path.resolve(__dirname, '..')), 'src/lib/politica-senha.ts'));
const casos = [['Prefeit@1x', true, '10 com maiúscula, número e símbolo'], ['Prefei@1x', false, '9 caracteres'], ['prefeit@1x', false, 'sem maiúscula'],
  ['Prefeitur@x', false, 'sem número'], ['Prefeitura1', false, 'sem símbolo'], ['Prefeit 1xA', false, 'espaço não conta como símbolo'],
  ['PREFEITO#2026', false, 'só maiúsculas é recusado (falta minúscula)'], ['Município#2026', true, 'acento ok'], ['Prefeituraç1', false, 'ç não conta como símbolo'], ['Senha.Forte1', true, 'ponto conta como símbolo']];
let f = 0; for (const [s, esp, nome] of casos) { const r = validarSenhaForte(s); console.log((r === esp ? 'PASSOU ' : 'FALHOU ') + nome + ` => ${r}`); if (r !== esp) f++; }
const falta = oQueFaltaNaSenha('abc'); const okFalta = falta.length === 4 && falta.includes('1 letra maiúscula') && !falta.includes('1 letra minúscula'); console.log((okFalta ? 'PASSOU ' : 'FALHOU ') + 'lista do que falta para "abc": ' + falta.join(', ')); if (!okFalta) f++;
console.log((oQueFaltaNaSenha('Prefeit@1x').length === 0 ? 'PASSOU ' : 'FALHOU ') + 'senha boa: nada falta');
process.exitCode = f ? 1 : 0;
