// teste da regra de e-mail (roda o arquivo real src/lib/email-institucional.ts)
// confere quais domínios passam no pedido de acesso, na ativação e na recuperação de senha
// a lista padrão é gov.br + gmail.com (o gmail é só pros testes, dá pra tirar pelo .env.local)
const ts = require('typescript'); const fs = require('fs'), path = require('path');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
// garante a lista padrão mesmo se o terminal tiver essa variável (o npm test não lê o .env.local)
delete process.env.EXPO_PUBLIC_DOMINIOS_EMAIL;
const { formatoDeEmailValido, dominioAceito, problemaNoEmailInstitucional } = require(path.join((process.argv[2] || path.resolve(__dirname, '..')), 'src/lib/email-institucional.ts'));

let f = 0;
function ok(cond, nome) { console.log((cond ? 'PASSOU ' : 'FALHOU ') + nome); if (!cond) f++; }

ok(formatoDeEmailValido('maria@prefeitura.mg.gov.br'), 'formato normal de e-mail de prefeitura');
ok(!formatoDeEmailValido('maria@prefeitura'), 'sem ponto depois do @ é recusado');
ok(!formatoDeEmailValido('maria silva@gov.br'), 'com espaço é recusado');
ok(dominioAceito('maria@prefeitura.mg.gov.br'), 'subdomínio de gov.br passa');
ok(dominioAceito('Teste@GMAIL.com'), 'gmail passa (maiúscula não importa)');
ok(!dominioAceito('golpe@golpegov.br'), '"golpegov.br" não passa (precisa ser .gov.br de verdade)');
ok(!dominioAceito('maria@hotmail.com'), 'hotmail não passa com a lista padrão');
ok(problemaNoEmailInstitucional('maria@prefeitura.mg.gov.br') === null, 'e-mail aceito não tem problema');
ok(typeof problemaNoEmailInstitucional('maria@hotmail.com') === 'string', 'e-mail de outro domínio volta uma mensagem de erro');

process.exitCode = f ? 1 : 0;
