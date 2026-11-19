// [integração] testes dos defeitos B11, B12 e B13 (teste de 18/11 no Galaxy A15)
// roda os arquivos reais de src/lib, sem tela e sem internet
const ts = require('typescript'); const fs = require('fs'), path = require('path');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, f);
const raiz = process.argv[2] || path.resolve(__dirname, '..');
const L = p => require(path.join(raiz, 'src/lib', p));
const { contagem } = L('textos.ts');
const C = L('codigo-de-acesso.ts');
const { linkDeRespostaPorEmail } = L('email-resposta-suporte.ts');

let f = 0;
const ok = (c, m) => { console.log((c ? 'PASSOU ' : 'FALHOU ') + m); if (!c) f++; };

// B13
ok(contagem(1, 'ponto de atenção', 'pontos de atenção') === '1 ponto de atenção', 'B13: 1 fica no singular');
ok(contagem(2, 'ponto de atenção', 'pontos de atenção') === '2 pontos de atenção', 'B13: 2 fica no plural');
ok(contagem(0, 'ponto de atenção', 'pontos de atenção') === '0 pontos de atenção', 'B13: 0 fica no plural');

// B12
ok(C.DIGITOS_DO_CODIGO === 8, 'B12: o tamanho configurado é 8 (igual ao e-mail recebido em 18/11)');
ok(C.descricaoDoCodigo() === 'código de 8 números', 'B12: o texto das telas fala em 8 números');
ok(C.exemploDeCodigo().length === 8, 'B12: o exemplo do campo tem 8 números');
ok(C.codigoNoFormatoCerto('1234 5678') && C.codigoNoFormatoCerto('12-34-56-78'), 'B12: código colado com espaço ou traço é aceito');
ok(C.codigoNoFormatoCerto('123456') && C.codigoNoFormatoCerto('1234567890'), 'B12: aceita de 6 a 10 (faixa que o painel do Supabase permite)');
ok(!C.codigoNoFormatoCerto('12345') && !C.codigoNoFormatoCerto('12345678901') && !C.codigoNoFormatoCerto(''), 'B12: menos de 6 ou mais de 10 é recusado');
const fontes = ['src/app/ativar-acesso.tsx', 'src/features/admin/AbaSolicitacoes.tsx'].map(p => fs.readFileSync(path.join(raiz, p), 'utf8'));
ok(fontes.every(t => !/código de 6 números|6 a 8 números/.test(t)), 'B12: as telas de ativação e de solicitações não falam mais em 6 números');

// B11
const link = linkDeRespostaPorEmail({ email: 'maria@prefeitura.mg.gov.br', nome: 'Maria', assunto: 'Dúvida no relatório', mensagem: 'Linha 1\nLinha 2' });
const params = new URLSearchParams(link.split('?')[1]);
ok(link.startsWith('mailto:maria@prefeitura.mg.gov.br?'), 'B11: o endereço continua certo');
ok(params.get('subject') === 'Re: Dúvida no relatório (FGRC-M)', 'B11: o assunto continua certo');
const corpo = params.get('body') || '';
ok(corpo.startsWith('Olá, Maria!') && corpo.includes('Equipe FGRC-M') && corpo.includes('Linha 1\r\nLinha 2'), 'B11: o corpo vai preenchido com saudação, assinatura e a mensagem original');
ok(!link.includes('undefined') && !corpo.includes('undefined'), 'B11: não aparece "undefined" no link');
const semDados = linkDeRespostaPorEmail({ email: 'x@gov.br', nome: null, assunto: undefined, mensagem: null });
ok(!semDados.includes('undefined') && !semDados.includes('null') && new URLSearchParams(semDados.split('?')[1]).get('body').startsWith('Olá!'), 'B11: sem nome ou assunto também não aparece "undefined" nem "null"');

process.exitCode = f ? 1 : 0;
