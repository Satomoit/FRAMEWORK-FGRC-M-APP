// transforma respostas de 0 a 4 nos dados que as telas P05 e P06 já esperam
import type { AssessmentResult } from '@/features/p05-resultados-detalhamento/types';
import type { Recommendation, Report } from '@/features/p06-relatorios-recomendacoes/types';
import { TODAS_QUESTOES_FGRC } from '@/features/p03-avaliacoes-questionario/questionarioData';
import type { AvaliacaoRegistrada, RespostaRegistrada } from '@/lib/avaliacoes-reais';
import { dataDa, dataHoraDa } from '@/lib/datas';
// [integração 25/11] explicação em palavras simples de cada solução ("Ficou com dúvida em como resolver?")
import { explicacaoSimples } from '@/lib/explicacoes-simples';

// [integração] nota máxima de cada pergunta
// o formulário do grupo tem 0 a 4 na maioria, mas o eixo AWR (Nicole) vai só de 0 a 3
// avaliação antiga não guardou isso, então procura no questionário (e se não achar usa 4)
const maximoPorQuestao = new Map(
  TODAS_QUESTOES_FGRC.map(q => [q.id, Math.max(...q.alternativas.map(a => a.valor))]),
);
// [integração 25/11] o eixo AWR ganhou o nível 4, então hoje todas as perguntas vão de 0 a 4
// só que avaliação já salva NÃO pode mudar de nota por causa disso:
//  - a que guardou o valorMaximo (3 no AWR) continua usando o que guardou
//  - a bem antiga, que nem guardava o valorMaximo, foi feita quando o AWR ia até 3, então usa 3 nele
const MAXIMO_ANTIGO_DO_AWR = 3;
export function valorMaximoDa(r: Pick<RespostaRegistrada, 'id' | 'valorMaximo'>): number {
  if (typeof r.valorMaximo === 'number') return r.valorMaximo;
  if (/-AWR$/.test(r.id)) return MAXIMO_ANTIGO_DO_AWR;
  return maximoPorQuestao.get(r.id) ?? 4;
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
// [integração 25/11] o texto virou uma função pq agora depende da avaliação:
//  - avaliação nova: todas as perguntas vão de 0 a 4
//  - avaliação feita antes de 25/11: o eixo de Pessoas e Conscientização (AWR) ia só até 3, e o PDF dela continua dizendo isso
const LEITURA_DO_INDICE =
  'Como ler este relatório: o índice vai de 0 a 100. Quanto maior o número, mais exposta a prefeitura está a riscos cibernéticos. ' +
  'Até 33 o resultado é Baixo, de 34 a 66 é Intermediário e de 67 a 100 é Alto. ';
const ESCALA_ATUAL = 'Cada resposta vale de 0 (Inexistente) a 4 (Aprimorada). ';
const ESCALA_ANTIGA =
  'Cada resposta vale de 0 (Inexistente) a 4 (Aprimorada); nesta avaliação, as perguntas sobre Pessoas e Conscientização iam até 3 (Estabelecida). ';
const AVISO_DAS_FAIXAS = 'As faixas ainda serão validadas pelo orientador do projeto.';

export function explicacaoDoCalculo(respostas: Pick<RespostaRegistrada, 'id' | 'valorMaximo'>[] = []): string {
  const temPerguntaAte3 = respostas.some(r => valorMaximoDa(r) < 4);
  return LEITURA_DO_INDICE + (temPerguntaAte3 ? ESCALA_ANTIGA : ESCALA_ATUAL) + AVISO_DAS_FAIXAS;
}
// nome antigo continua existindo (texto de uma avaliação nova) pra quem ainda importar a constante
export const EXPLICACAO_DO_CALCULO = explicacaoDoCalculo();

// [integração 25/11] frase curta pra tela de Detalhes do resultado
// sem ela dá pra confundir com nota de escola (achar que 20/100 é ruim, quando aqui número baixo é o resultado bom)
export const COMO_LER_O_INDICE =
  'Quanto maior o número, maior a exposição a riscos. Até 33: Baixo. De 34 a 66: Intermediário. De 67 a 100: Alto.';

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
  const lista: Recommendation[] = avaliacao.respostas.filter(r => r.recomendacao !== null).map(r => ({
    code: r.codigo,
    priority: (r.valor <= 1 ? 'alta' : 'média') as 'alta' | 'média',
    answerValue: r.valor,
    answerLabel: r.alternativa,
    solution: r.recomendacao!,
    reference: textoReferencia(r.nist),
    // [integração 25/11] explicação em palavras simples da mesma solução (fica undefined se não tiver)
    simpleExplanation: explicacaoSimples(r.id, r.valor, r.recomendacao) ?? undefined,
  }));
  // [integração 25/11] as de prioridade alta (notas 0 e 1) vêm primeiro, depois as de média (notas 2 e 3)
  // o Mapeamento do grupo pede as recomendações divididas por prioridade, e assim a pessoa já vê o mais urgente
  // dentro de cada grupo continua a ordem do questionário (GOV, AST, IAM...)
  return [...lista.filter(r => r.priority === 'alta'), ...lista.filter(r => r.priority === 'média')];
}
