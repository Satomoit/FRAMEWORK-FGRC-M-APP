// [integração 19/11] pede pro servidor mandar o e-mail "Solicitação de acesso recebida"
// quem chama: a tela Solicitar acesso, logo depois de gravar o pedido
// quem mostra o resultado: a tela "Solicitação enviada" (explore.tsx)
// o pedido JÁ ta gravado quando isso roda: se o e-mail falhar, o pedido continua valendo
// e a tela só fala "enviamos uma confirmação" se o servidor confirmou o envio (nunca inventa)
import { supabase } from '@/lib/supabase';

export type ResultadoAvisoPedido = 'enviado' | 'nao_enviado';

// guarda a promessa entre as duas telas (fica só na memória, some quando fecha o app)
let ultimoAviso: Promise<ResultadoAvisoPedido> | null = null;

// o que o servidor responde vira só duas situações pra tela:
//   enviado      = o provedor de e-mail confirmou (ou já tinha confirmado antes)
//   nao_enviado  = qualquer outra coisa (sem provedor configurado, falha, sem internet, função não publicada)
export function interpretarRespostaDoAviso(status: unknown): ResultadoAvisoPedido {
  return status === 'enviado' || status === 'ja_enviado' ? 'enviado' : 'nao_enviado';
}

async function chamarServidor(email: string): Promise<ResultadoAvisoPedido> {
  try {
    const { data, error } = await supabase.functions.invoke('notificacoes-fgrcm', {
      body: { evento: 'pedido_recebido', email },
    });
    if (error) return 'nao_enviado';
    return interpretarRespostaDoAviso((data as { status?: unknown } | null)?.status);
  } catch {
    return 'nao_enviado';
  }
}

// começa o pedido do e-mail sem esperar (a tela já pode trocar pra "Solicitação enviada")
export function pedirAvisoDePedidoRecebido(email: string): void {
  ultimoAviso = chamarServidor(email);
}

// a tela de confirmação pega o resultado (uma vez só)
export function pegarResultadoDoAviso(): Promise<ResultadoAvisoPedido> | null {
  const p = ultimoAviso;
  ultimoAviso = null;
  return p;
}
