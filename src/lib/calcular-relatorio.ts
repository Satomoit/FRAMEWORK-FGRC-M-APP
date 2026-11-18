// transforma respostas de 0 a 4 nos dados que as telas P05 e P06 já esperam
import type { AssessmentResult } from '@/features/p05-resultados-detalhamento/types';
import type { Recommendation, Report } from '@/features/p06-relatorios-recomendacoes/types';
import { TODAS_QUESTOES_FGRC } from '@/features/p03-avaliacoes-questionario/questionarioData';
import type { AvaliacaoRegistrada, RespostaRegistrada } from '@/lib/avaliacoes-reais';
import { dataDa, dataHoraDa } from '@/lib/datas';

// [integração] nota máxima de cada pergunta
// o formulário do grupo tem 0 a 4 na maioria, mas o eixo AWR (Nicole) vai só de 0 a 3
// avaliação antiga não guardou isso, então procura no questionário (e se não achar usa 4)
const maximoPorQuestao = new Map(
  TODAS_QUESTOES_FGRC.map(q => [q.id, Math.max(...q.alternativas.map(a => a.valor))]),
);
export function valorMaximoDa(r: Pick<RespostaRegistrada, 'id' | 'valorMaximo'>): number {
  return r.valorMaximo ?? maximoPorQuestao.get(r.id) ?? 4;
}

// este é um índice operacional de exposição: 0 = menor exposição, 100 = maior exposição
// a escala 0-4 vem do questionário; os limites das faixas precisam da validação do orientador
// [integração] antes dividia sempre por 4, aí quem marcava 3 (o máximo) no AWR ficava com 25% de exposição
// agora divide pela soma das notas máximas de cada pergunta (PROVISÓRIO: confirmar com o orientador)
const exposicao = (respostas: Pick<RespostaRegistrada, 'id' | 'valor' | 'valorMaximo'>[]) => {
  const maximo = respostas.reduce((s, r) => s + valorMaximoDa(r), 0);
  if (!maximo) return 0;
  const obtido = respostas.reduce((s, r) => s + r.valor, 0);
  return Math.round((1 - obtido / maximo) * 100);
};

// [integração] texto curto que explica como ler o resultado (vai no PDF)
// linguagem simples pq quem lê é a equipe da prefeitura, não um técnico
export const EXPLICACAO_DO_CALCULO =
  'Como ler este relatório: o índice vai de 0 a 100. Quanto maior o número, mais exposta a prefeitura está a riscos cibernéticos. ' +
  'Até 33 o resultado é Baixo, de 34 a 66 é Intermediário e de 67 a 100 é Alto. ' +
  'Cada resposta vale de 0 (Inexistente) a 4 (Aprimorada); nas perguntas sobre Pessoas e Conscientização, a escala vai até 3 (Estabelecida). ' +
  'As faixas ainda serão validadas pelo orientador do projeto.';

// [integração] as perguntas do eixo AWR não têm referência NIST no formulário
// nelas o campo guarda o tema da pergunta, então mostramos isso escrito do jeito certo
// também deixa as setas mais legíveis: "NIST → GV.RM → GV.RM-06" vira "NIST GV.RM › GV.RM-06"
export function textoReferencia(nist: string): string {
  const texto = nist.trim();
  if (!/^NIST/i.test(texto)) return `não indicada no formulário (tema: ${texto})`;
  const codigos = texto
    .replace(/^NIST\s*(→|->|-->)?\s*/i, '')
    .replace(/\s*(→|->|-->)\s*/g, ' › ');
  return `NIST ${codigos}`;
}

// [integração] a descrição das alternativas às vezes começa com letra minúscula no formulário
// (ex: "recebem orientações informais"); aqui só deixa a primeira letra maiúscula pra ler melhor
export function comLetraMaiuscula(texto: string): string {
  const limpo = texto.trim();
  return limpo ? limpo.charAt(0).toLocaleUpperCase('pt-BR') + limpo.slice(1) : limpo;
}

// [integração] data e hora no fuso do aparelho (antes usava UTC e depois das 21h saía o dia seguinte)
// as funções moraram aqui até a revisão final; agora ficam em src/lib/datas.ts e continuam exportadas daqui
// pra não precisar mexer no pdf.ts e no pdf.web.ts da P06
export { dataDa, dataHoraDa };

const classificar = (valor: number): 'Baixo' | 'Intermediário' | 'Alto' =>
  valor <= 33 ? 'Baixo' : valor <= 66 ? 'Intermediário' : 'Alto';

function resumo(avaliacao: AvaliacaoRegistrada) {
  const score = exposicao(avaliacao.respostas);
  const eixos = Array.from(new Set(avaliacao.respostas.map(r => r.eixoCodigo)));
  const dimensions = eixos.map(codigo => {
    const itens = avaliacao.respostas.filter(r => r.eixoCodigo === codigo);
    return { code: codigo, name: itens[0].eixo, score: exposicao(itens) };
  });

  // os pontos de atenção vêm das notas do próprio eixo, não de um arquivo de exemplo
  const attentionPoints = dimensions
    .filter(e => e.score >= 50)
    .map(e => ({ title: e.name, priority: (e.score >= 75 ? 'alta' : 'média') as 'alta' | 'média' }));

  const date = dataDa(avaliacao.finalizadaEm);
  return { id: avaliacao.id, date, index: 'IERC-M', score, classification: classificar(score), dimensions, attentionPoints };
}

export function paraResultado(avaliacao: AvaliacaoRegistrada): AssessmentResult {
  return resumo(avaliacao);
}

export function paraRelatorio(avaliacao: AvaliacaoRegistrada): Report {
  return {
    ...resumo(avaliacao),
    // isso guarda TODAS as respostas, inclusive as de nível 4 sem recomendação corretiva
    answers: avaliacao.respostas.map(r => ({ ...r })),
    finalizedAt: avaliacao.finalizadaEm,
  };
}

export function recomendacoesDaAvaliacao(avaliacao: AvaliacaoRegistrada): Recommendation[] {
  return avaliacao.respostas.filter(r => r.recomendacao !== null).map(r => ({
    code: r.codigo,
    priority: (r.valor <= 1 ? 'alta' : 'média') as 'alta' | 'média',
    answerValue: r.valor,
    answerLabel: r.alternativa,
    solution: r.recomendacao!,
    reference: textoReferencia(r.nist),
  }));
}
