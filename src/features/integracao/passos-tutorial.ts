// [integração 19/11] passos e contas do tutorial guiado (sem nada de tela aqui, pra dar pra testar sozinho)
// a tela fica no TutorialInicial.tsx; aqui só tem o texto de cada passo e a matemática do destaque
// (onde fica o "buraco" iluminado, onde escurece e onde o cartão com a explicação aparece)
// teste: tests/teste-tutorial.cjs

export type PassoTutorial = {
  id: string;
  titulo: string;
  texto: string;
  // nome do botão que fica destacado (null = passo sem destaque, o cartão aparece no meio)
  alvo: string | null;
  // se não der pra destacar o botão (ex: ele ta fora da tela), o cartão mostra esse texto no lugar
  dicaSemAlvo?: string;
  // [integração 19/11] ícone do cartão (nome do Ionicons, o mesmo desenho do botão quando dá)
  icone: string;
  // [integração 19/11] lista curta com ✓ (usada no último passo, o resumo)
  lista?: string[];
};

// os textos falam ONDE fica cada coisa (não só "aqui"), pq quem usa leitor de tela não vê o destaque
export const PASSOS_TUTORIAL: PassoTutorial[] = [
  {
    id: 'boas-vindas',
    titulo: 'Bem-vindo ao FGRC-M',
    texto:
      'Este aplicativo ajuda a prefeitura a saber como está cuidando da segurança dos computadores, dos sistemas e das informações. ' +
      'Você não precisa entender de tecnologia para usar. Vamos mostrar onde fica cada coisa (dá para pular quando quiser).',
    alvo: null,
    icone: 'hand-left-outline',
  },
  {
    id: 'avaliacoes',
    titulo: 'Responda a avaliação',
    texto:
      'No menu de baixo, toque em "Avaliações" (ícone de prancheta) para responder 32 perguntas sobre o dia a dia da prefeitura. ' +
      'Pode parar e continuar depois: o que você já respondeu fica guardado neste aparelho.',
    alvo: 'aba:Avaliações',
    dicaSemAlvo: 'Procure no menu de baixo o ícone de prancheta.',
    icone: 'clipboard-outline',
  },
  {
    id: 'resultados',
    titulo: 'Veja o resultado',
    texto:
      'Depois de terminar, toque em "Resultados" (ícone de gráfico). O app mostra um número de 0 a 100: quanto MAIOR o número, MAIOR o risco. ' +
      'Os pontos de atenção mostram por onde começar a melhorar.',
    alvo: 'aba:Resultados',
    dicaSemAlvo: 'Procure no menu de baixo o ícone de gráfico.',
    icone: 'stats-chart-outline',
  },
  {
    id: 'relatorios',
    titulo: 'Baixe o relatório',
    texto:
      'Em "Relatórios" (ícone de folha), você baixa um PDF com todas as perguntas, as respostas e o que fazer para melhorar. ' +
      'Dá para imprimir ou enviar para a equipe da prefeitura.',
    alvo: 'aba:Relatórios',
    dicaSemAlvo: 'Procure no menu de baixo o ícone de folha.',
    icone: 'document-text-outline',
  },
  {
    id: 'mais',
    titulo: 'Perfil, configurações e ajuda',
    texto:
      'Em "Mais" (último ícone do menu de baixo) ficam o seu perfil, as configurações (tamanho do texto, modo escuro e alto contraste) e a ajuda. ' +
      'Em Configurações você também pode rever este tutorial.',
    alvo: 'aba:Mais',
    dicaSemAlvo: 'É o último ícone do menu de baixo, com três tracinhos.',
    icone: 'menu-outline',
  },
  {
    id: 'ajuda',
    titulo: 'Suas informações e ajuda',
    texto:
      'As respostas da avaliação ficam só neste aparelho e não são enviadas pela internet. ' +
      'Se tiver dúvida, use "Ajuda e suporte", no fim da página inicial ou no menu "Mais".',
    alvo: 'inicio:ajuda',
    dicaSemAlvo: 'Role a página inicial até o fim: lá ficam os botões "Como usar o app" e "Ajuda e suporte".',
    icone: 'help-circle-outline',
  },
  // [integração 19/11] resumo no fim (3 passos pra lembrar), sem destaque
  {
    id: 'pronto',
    titulo: 'Tudo pronto!',
    texto: 'O caminho é sempre este:',
    alvo: null,
    icone: 'sparkles-outline',
    lista: [
      'Responda a avaliação em "Avaliações"',
      'Veja o resultado em "Resultados"',
      'Baixe o PDF em "Relatórios"',
    ],
  },
];

// ---------- navegação entre os passos ----------

export function passoSeguinte(atual: number, total: number): number {
  return Math.min(atual + 1, total - 1);
}

export function passoAnterior(atual: number): number {
  return Math.max(atual - 1, 0);
}

export function ehUltimoPasso(atual: number, total: number): boolean {
  return atual >= total - 1;
}

export function rotuloDoPasso(atual: number, total: number): string {
  return `Passo ${atual + 1} de ${total}`;
}

// ---------- contas do destaque ----------

export type Retangulo = { x: number; y: number; largura: number; altura: number };
export type Tela = { largura: number; altura: number };

// área iluminada em volta do botão (com uma folguinha)
// devolve null se não der pra destacar: botão sem tamanho, fora da tela ou quase todo escondido
export function buracoDoDestaque(alvo: Retangulo | null, tela: Tela, folga = 6): Retangulo | null {
  if (!alvo) return null;
  const numeros = [alvo.x, alvo.y, alvo.largura, alvo.altura, tela.largura, tela.altura];
  if (!numeros.every(Number.isFinite) || alvo.largura <= 0 || alvo.altura <= 0) return null;
  const esquerda = Math.max(0, alvo.x - folga);
  const topo = Math.max(0, alvo.y - folga);
  const direita = Math.min(tela.largura, alvo.x + alvo.largura + folga);
  const baixo = Math.min(tela.altura, alvo.y + alvo.altura + folga);
  // se menos de 60% da altura do botão aparece, é melhor explicar com texto (pra não apontar pro nada)
  const alturaVisivel = Math.min(tela.altura, alvo.y + alvo.altura) - Math.max(0, alvo.y);
  if (direita - esquerda < 8 || alturaVisivel < alvo.altura * 0.6) return null;
  return { x: esquerda, y: topo, largura: direita - esquerda, altura: baixo - topo };
}

// as 4 faixas escuras em volta do buraco (cima, baixo, esquerda, direita)
// sem buraco = escurece a tela toda
export function partesDoEscurecimento(b: Retangulo | null, tela: Tela): Retangulo[] {
  if (!b) return [{ x: 0, y: 0, largura: tela.largura, altura: tela.altura }];
  const fimX = b.x + b.largura;
  const fimY = b.y + b.altura;
  return [
    { x: 0, y: 0, largura: tela.largura, altura: b.y },
    { x: 0, y: fimY, largura: tela.largura, altura: tela.altura - fimY },
    { x: 0, y: b.y, largura: b.x, altura: b.altura },
    { x: fimX, y: b.y, largura: tela.largura - fimX, altura: b.altura },
  ].filter((r) => r.largura > 0 && r.altura > 0);
}

export type LugarDoCartao =
  | { lugar: 'centro'; alturaMaxima: number }
  | { lugar: 'acima'; bottom: number; alturaMaxima: number }
  | { lugar: 'abaixo'; top: number; alturaMaxima: number };

// escolhe se o cartão fica em cima ou embaixo do botão destacado (onde tiver mais espaço)
// com letra grande o cartão pode não caber: aí ele ganha rolagem (alturaMaxima)
export function lugarDoCartao(b: Retangulo | null, tela: Tela, margem = 14): LugarDoCartao {
  const tudo = Math.max(120, tela.altura - margem * 2);
  if (!b) return { lugar: 'centro', alturaMaxima: tudo };
  const espacoAcima = b.y - margem * 2;
  const espacoAbaixo = tela.altura - (b.y + b.altura) - margem * 2;
  const MINIMO = 140;
  if (espacoAcima >= espacoAbaixo && espacoAcima >= MINIMO) {
    return { lugar: 'acima', bottom: tela.altura - b.y + margem, alturaMaxima: espacoAcima };
  }
  if (espacoAbaixo >= MINIMO) {
    return { lugar: 'abaixo', top: b.y + b.altura + margem, alturaMaxima: espacoAbaixo };
  }
  // sem espaço dos dois lados (tela muito pequena): cartão no meio, por cima de tudo
  return { lugar: 'centro', alturaMaxima: tudo };
}

// largura do cartão e onde fica a setinha que aponta pro botão (medida a partir da esquerda do cartão)
export function medidasDoCartao(b: Retangulo | null, tela: Tela, larguraMaxima = 460, margem = 12) {
  const largura = Math.max(200, Math.min(larguraMaxima, tela.largura - margem * 2));
  const esquerda = Math.max(0, (tela.largura - largura) / 2);
  if (!b) return { largura, esquerda, seta: null as number | null };
  const centro = b.x + b.largura / 2 - esquerda;
  // a setinha não pode sair do cartão (fica no mínimo 22 px longe da borda)
  const seta = Math.min(largura - 22, Math.max(22, centro));
  return { largura, esquerda, seta };
}
