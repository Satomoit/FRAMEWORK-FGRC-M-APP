// [suporte] "Meus chamados": a pessoa logada acompanha as mensagens que mandou pro suporte
// quem filtra é o BANCO (função meus_chamados_fgrcm usa o login da pessoa), não o app:
// não tem como pedir o chamado de outra pessoa trocando id, pq a função nem recebe id
// só aparecem chamados enviados com login (os enviados pela tela de entrada, sem login, são respondidos por e-mail)
import { supabase } from '@/lib/supabase';

export type StatusChamado = 'aberto' | 'em_atendimento' | 'resolvido';

export type Chamado = {
  id: string;
  assunto: string;
  mensagem: string;
  status: StatusChamado;
  criado_em: string;
  atualizado_em: string | null;
  respostas: { texto: string; criado_em: string }[];
  historico: { status: string | null; em: string }[];
};

export const NOME_STATUS_CHAMADO: Record<StatusChamado, string> = {
  aberto: 'Aguardando a equipe',
  em_atendimento: 'Em atendimento',
  resolvido: 'Resolvido',
};

// número curto pra pessoa citar o chamado (ex: #A1B2C3), tirado do começo do id
export function protocoloDo(id: string): string {
  return `#${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

export async function listarMeusChamados(): Promise<Chamado[]> {
  const { data, error } = await supabase.rpc('meus_chamados_fgrcm');
  if (error) {
    const texto = `${error.message ?? ''}`;
    throw new Error(/fetch|network/i.test(texto)
      ? 'Sem conexão. Verifique a internet e tente de novo.'
      : 'Não foi possível carregar os seus chamados agora. Tente de novo em alguns minutos.');
  }
  return Array.isArray(data) ? (data as Chamado[]) : [];
}
