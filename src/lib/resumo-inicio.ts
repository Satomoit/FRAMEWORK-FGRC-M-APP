// [integração B1b] junta os dados reais que a Home da P01 mostra nos cartões
// tudo sai do que já existe: rascunho do questionário, histórico local e conta do Supabase
// (nada é inventado: se não tiver o dado, volta null e a Home mostra o "—" que a Nicole já deixou)
import { TODAS_QUESTOES_FGRC } from '@/features/p03-avaliacoes-questionario/questionarioData';
// [integração] rascunho lido pelo mesmo módulo da rota de Avaliações (mesma chave, mesma validação, separado por conta)
import { lerRascunho } from '@/lib/armazenamento-local';
import { listarAvaliacoes } from '@/lib/avaliacoes-reais';
import { paraResultado } from '@/lib/calcular-relatorio';
import { dadosDaConta, linhaDaPrefeitura } from '@/lib/conta';
import { supabase } from '@/lib/supabase';

// mesmo formato do DadosInicio da HomeScreen.tsx (P01)
// a prioridade é 'media' sem acento pq é assim que a Home da Nicole espera
export type ResumoInicio = {
  prefeitura: string | null;
  // [integração] primeiro nome da pessoa logada pro "Olá, Maria!" (o Mapeamento pede o nome na Home)
  nome?: string | null;
  progresso: number | null;
  ultimaAvaliacao: string | null;
  quantidadePrioridades: number | null;
  pontosAtencao: { id: string; titulo: string; prioridade: 'alta' | 'media' }[];
  // [integração] resultado da última avaliação já escrito do jeito que aparece (ex: "75 de 100 (Alto)")
  resultado?: string | null;
};

// conta quantas perguntas do rascunho têm resposta válida e vira porcentagem
// sem rascunho (ou com zero respostas) volta null = não tem avaliação em andamento
export async function progressoDoRascunho(): Promise<number | null> {
  const { respostas } = await lerRascunho();
  const respondidas = Object.keys(respostas).length;
  if (respondidas === 0) return null;
  return Math.round((respondidas / TODAS_QUESTOES_FGRC.length) * 100);
}

// pega a prefeitura gravada na conta (se o grupo já tiver colocado no Supabase)
// [integração] agora devolve também o primeiro nome (as duas coisas vêm da mesma conta)
async function contaDaHome(): Promise<{ prefeitura: string | null; nome: string | null }> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { prefeitura: null, nome: null };
  // [integração] usa o mesmo leitor do perfil (prefere o que a administração gravou)
  const dados = dadosDaConta(data.user);
  const linha = linhaDaPrefeitura(dados);
  return {
    prefeitura: linha ? `Prefeitura vinculada: ${linha}` : null,
    // "Maria da Silva" vira "Maria" (só a primeira palavra, pra saudação ficar curta)
    nome: dados.nome ? dados.nome.split(/\s+/)[0] : null,
  };
}

export async function carregarResumoInicio(): Promise<ResumoInicio> {
  // allSettled = se uma parte falhar (ex: sem internet pro Supabase) as outras continuam aparecendo
  const [conta, progresso, historico] = await Promise.allSettled([
    contaDaHome(),
    progressoDoRascunho(),
    listarAvaliacoes(),
  ]);

  const resumo: ResumoInicio = {
    prefeitura: conta.status === 'fulfilled' ? conta.value.prefeitura : null,
    nome: conta.status === 'fulfilled' ? conta.value.nome : null,
    progresso: progresso.status === 'fulfilled' ? progresso.value : null,
    ultimaAvaliacao: null,
    quantidadePrioridades: null,
    pontosAtencao: [],
    resultado: null,
  };

  if (historico.status !== 'fulfilled' || historico.value.length === 0) {
    return resumo;
  }

  // a mais recente pela data de finalização (não depende da ordem salva)
  const ultima = [...historico.value].sort((a, b) =>
    b.finalizadaEm.localeCompare(a.finalizadaEm),
  )[0];

  // usa o mesmo cálculo das telas de Resultados (P05), pra Home e Resultados baterem
  const resultado = paraResultado(ultima);
  resumo.ultimaAvaliacao = resultado.date;
  resumo.resultado = `${resultado.score} de 100 (${resultado.classification})`;
  resumo.quantidadePrioridades = resultado.attentionPoints.length;
  resumo.pontosAtencao = resultado.attentionPoints.map((ponto, indice) => ({
    id: `${ultima.id}-${indice}`,
    titulo: ponto.title,
    prioridade: ponto.priority === 'alta' ? 'alta' : 'media',
  }));
  return resumo;
}
