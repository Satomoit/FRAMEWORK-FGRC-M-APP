// aqui fica o registro de uma avaliação feita de verdade (sem números inventados)
import { TODAS_QUESTOES_FGRC } from '@/features/p03-avaliacoes-questionario/questionarioData';
// [integração] o histórico agora fica separado por conta (ver src/lib/armazenamento-local.ts)
import { gravarHistoricoBruto, lerHistoricoBruto } from '@/lib/armazenamento-local';

// a gente salva a pergunta e a resposta juntas pra um relatório antigo não mudar se o questionário mudar
export type RespostaRegistrada = {
  id: string;
  codigo: string;
  eixo: string;
  eixoCodigo: string;
  pergunta: string;
  valor: number;
  alternativa: string;
  descricao: string;
  nist: string;
  recomendacao: string | null;
  // [integração] nota máxima dessa pergunta (4 na maioria, 3 nas do eixo AWR, igual ao formulário)
  // é opcional pq as avaliações salvas antes disso não têm (aí o cálculo procura no questionário)
  valorMaximo?: number;
};

export type AvaliacaoRegistrada = {
  id: string;
  finalizadaEm: string;
  respostas: RespostaRegistrada[];
};

// apenas notas inteiras entre 0 e 4 servem (o mesmo intervalo do questionário do grupo)
function valorValido(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 0 && valor <= 4;
}

export function montarAvaliacao(respostas: Record<string, number>): AvaliacaoRegistrada {
  // impede que o botão Finalizar crie um relatório com questões faltando
  if (TODAS_QUESTOES_FGRC.length === 0 || TODAS_QUESTOES_FGRC.some(q => !valorValido(respostas[q.id]))) {
    throw new Error('Responda todas as questões antes de finalizar a avaliação');
  }

  const registros: RespostaRegistrada[] = TODAS_QUESTOES_FGRC.map(q => {
    const valor = respostas[q.id];
    const opcao = q.alternativas.find(a => a.valor === valor);
    if (!opcao) throw new Error(`Resposta inválida na questão ${q.codigo}`);

    // as recomendações vêm do próprio questionário que o Hudson cadastrou
    // o nível 4 não tem uma recomendação corretiva no arquivo original
    const recomendacao = valor <= 1 ? q.solucoes.faixa0ou1
      : valor === 2 ? q.solucoes.faixa2
      : valor === 3 ? q.solucoes.faixa3
      : null;

    return {
      id: q.id,
      codigo: q.codigo,
      eixo: q.eixoNome,
      eixoCodigo: q.eixoCodigo,
      pergunta: q.pergunta,
      valor,
      alternativa: opcao.titulo,
      descricao: opcao.descricao,
      nist: q.nist,
      recomendacao,
      valorMaximo: Math.max(...q.alternativas.map(a => a.valor)),
    };
  });

  return {
    // código da avaliação (ex: 1794965872843-mfrh6s91), feito em 2 partes:
    //   1) Date.now() = quantos milissegundos passaram desde 01/01/1970 até a hora que vc clicou em Finalizar
    //      (é o jeito padrão do JavaScript de contar o tempo, então muda a cada milésimo de segundo)
    //   2) Math.random().toString(36).slice(2, 10) = sorteia um número e escreve ele em base 36
    //      (base 36 usa 0-9 e a-z, por isso aparecem letras), aí pega só 8 caracteres
    // juntando os dois fica praticamente impossível duas avaliações terem o mesmo código
    // não é senha nem dado sigiloso: serve só pra separar uma avaliação da outra no aparelho
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    finalizadaEm: new Date().toISOString(),
    respostas: registros,
  };
}

export async function listarAvaliacoes(): Promise<AvaliacaoRegistrada[]> {
  const texto = await lerHistoricoBruto();
  if (!texto) return [];
  let parsed: unknown;
  try { parsed = JSON.parse(texto); } catch { throw new Error('O histórico de avaliações está danificado'); }
  if (!Array.isArray(parsed)) throw new Error('O histórico de avaliações é inválido');

  // não mostramos um resultado se o registro estiver incompleto ou inválido
  return parsed.filter((item): item is AvaliacaoRegistrada =>
    Boolean(item && typeof item.id === 'string' && typeof item.finalizadaEm === 'string' &&
      Array.isArray(item.respostas) && item.respostas.length > 0 &&
      item.respostas.every((r: RespostaRegistrada) => r && typeof r.pergunta === 'string' && valorValido(r.valor)))
  );
}

export async function finalizarAvaliacao(respostas: Record<string, number>): Promise<AvaliacaoRegistrada> {
  const registro = montarAvaliacao(respostas);
  // só considera finalizada depois que o armazenamento confirma a gravação
  const anteriores = await listarAvaliacoes();
  await gravarHistoricoBruto(JSON.stringify([registro, ...anteriores]));
  return registro;
}
