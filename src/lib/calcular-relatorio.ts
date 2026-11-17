// transforma respostas de 0 a 4 nos dados que as telas P05 e P06 já esperam
import type { AssessmentResult } from '@/features/p05-resultados-detalhamento/types';
import type { Recommendation, Report } from '@/features/p06-relatorios-recomendacoes/types';
import type { AvaliacaoRegistrada, RespostaRegistrada } from '@/lib/avaliacoes-reais';

// este é um índice operacional de exposição: 0 = menor exposição, 100 = maior exposição
// a escala 0-4 vem do questionário; os limites das faixas precisam da validação do orientador
const exposicao = (valores: number[]) =>
  valores.length ? Math.round((1 - valores.reduce((s, v) => s + v, 0) / (valores.length * 4)) * 100) : 0;

const classificar = (valor: number): 'Baixo' | 'Intermediário' | 'Alto' =>
  valor <= 33 ? 'Baixo' : valor <= 66 ? 'Intermediário' : 'Alto';

function resumo(avaliacao: AvaliacaoRegistrada) {
  const score = exposicao(avaliacao.respostas.map(r => r.valor));
  const eixos = Array.from(new Set(avaliacao.respostas.map(r => r.eixoCodigo)));
  const dimensions = eixos.map(codigo => {
    const itens = avaliacao.respostas.filter(r => r.eixoCodigo === codigo);
    return { code: codigo, name: itens[0].eixo, score: exposicao(itens.map(r => r.valor)) };
  });

  // os pontos de atenção vêm das notas do próprio eixo, não de um arquivo de exemplo
  const attentionPoints = dimensions
    .filter(e => e.score >= 50)
    .map(e => ({ title: e.name, priority: (e.score >= 75 ? 'alta' : 'média') as 'alta' | 'média' }));

  const date = new Date(avaliacao.finalizadaEm).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
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
    reference: r.nist,
  }));
}
