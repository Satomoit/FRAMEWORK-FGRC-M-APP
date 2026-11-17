// corrige só o momento de finalizar da P03 sem trocar a tela original do Hudson
// rode uma única vez depois de copiar o pacote (se já estiver ajustado, ele não mexe)
const fs = require('fs');
const path = require('path');

const arquivo = path.join(process.cwd(), 'src', 'features', 'p03-avaliacoes-questionario', 'QuestionarioScreen.tsx');
if (!fs.existsSync(arquivo)) {
  console.error('Não encontrei QuestionarioScreen.tsx. Confira a pasta do projeto.');
  process.exitCode = 1;
} else {
  const texto = fs.readFileSync(arquivo, 'utf8');
  if (texto.includes('aguarda o salvamento antes de confirmar')) {
    console.log('A P03 já está ajustada. Nada foi modificado.');
  } else {
    const assinatura = 'onFinalizarAvaliacao: () => void;';
    const antes = `onPress={() => {
              onFinalizarAvaliacao();
              setEtapa('finalizada');
            }}`;
    const depois = `onPress={() => {
              // aguarda o salvamento antes de confirmar (senão pode dizer concluída sem ter gravado)
              void Promise.resolve()
                .then(onFinalizarAvaliacao)
                .then(() => setEtapa('finalizada'))
                .catch(() => { /* o aviso de erro aparece na rota de Avaliações */ });
            }}`;
    if (!texto.includes(assinatura) || !texto.includes(antes)) {
      console.error('A P03 está diferente da versão analisada. Não alterei o arquivo automaticamente.');
      process.exitCode = 1;
    } else {
      const atualizado = texto.replace(assinatura, 'onFinalizarAvaliacao: () => void | Promise<void>;').replace(antes, depois)
        .replace('Aguarde o processamento dos resultados.', 'Você já pode consultar e baixar o PDF na aba Relatórios.')
        .replace('estará disponível\n              na aba Resultados.', 'está disponível\n              nas abas Resultados e Relatórios.');
      // salva um backup com outro nome caso vc precise comparar os comentários do Hudson
      fs.writeFileSync(path.join(process.cwd(), '..', 'FGRC-M-P03-antes-do-ajuste.tsx'), texto);
      fs.writeFileSync(arquivo, atualizado, 'utf8');
      console.log('Finalização ajustada. Backup salvo fora do repositório; confira o diff no GitHub Desktop.');
    }
  }
}
