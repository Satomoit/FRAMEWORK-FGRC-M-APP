// [integração] roda todos os testes de comportamento de uma vez: npm test
// eles usam os arquivos reais de src/lib (sem tela), com o armazenamento e o Supabase simulados
// (nenhum teste fala com o Supabase de verdade nem apaga dado do seu navegador)
const { spawnSync } = require('child_process');
const path = require('path');

const testes = [
  'teste-senha.cjs',
  'teste-calculo.cjs',
  'teste-resumo-inicio.cjs',
  'teste-armazenamento-por-conta.cjs',
  'teste-email.cjs',
  // [correção Android] versão mínima e nome do PDF
  'teste-versao.cjs',
  'teste-nome-pdf.cjs',
  'teste-datas-digitadas.cjs',
  // [segurança] só entra conta aprovada pela equipe (ou da administração)
  'teste-conta-liberada.cjs',
  // [integração 19/11] defeitos B11, B12 e B13
  'teste-textos-e-codigo.cjs',
  // [integração 19/11] funções do servidor: exclusão definitiva e avisos por e-mail (tudo simulado)
  'teste-funcoes-servidor.cjs',
  'teste-avisos-e-exclusao-app.cjs',
  // [integração 19/11] tamanho do texto em todas as telas e tutorial guiado
  'teste-escala-texto.cjs',
  'teste-tutorial.cjs',
  // [integração 19/11] atalho da administração aparecendo na hora
  'teste-atalho-admin.cjs',
];

let falhas = 0;
for (const arquivo of testes) {
  console.log(`\n== ${arquivo}`);
  const r = spawnSync(process.execPath, [path.join(__dirname, arquivo), path.resolve(__dirname, '..')], { stdio: 'inherit' });
  if (r.status !== 0) falhas++;
}
console.log(falhas ? `\n${falhas} arquivo(s) de teste com falha` : '\nTodos os testes passaram');
process.exitCode = falhas ? 1 : 0;
