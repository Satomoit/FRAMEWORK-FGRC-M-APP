// FGRC-M | função do servidor que manda o aviso "Solicitação de acesso recebida" (pedido de 19/11/2026)
// quem chama: o app, logo depois que a pessoa envia o pedido de acesso (tela Solicitar acesso)
// a pessoa não ta logada, então a função é pública (publicar com verify_jwt desligado) e se protege assim:
//   * só manda pra um pedido PENDENTE criado nos últimos 15 minutos com aquele e-mail
//   * cada pedido recebe no máximo um aviso desse tipo (tabela email_notificacoes)
//   * os dados do e-mail (nome e prefeitura) vêm do pedido gravado no banco, não do que o app mandou
//   * o banco já limita os pedidos (3 por e-mail por dia, 20 por minuto no total), então não dá pra usar
//     essa função pra mandar e-mail em massa
// a resposta pro app diz se o e-mail saiu de verdade ("enviado") ou não; o app só fala em e-mail se saiu
//
// publicar: npx supabase functions deploy notificacoes-fgrcm --no-verify-jwt
// (ela usa ../_shared/email-fgrcm.ts, então precisa ser publicada pela linha de comando, não colando no painel)
import { createClient } from 'npm:@supabase/supabase-js@2';

import { notificar } from '../_shared/email-fgrcm.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resposta(status: number, corpo: Record<string, unknown>) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

// mesmo formato que o banco aceita em access_requests
const emailValido = (v: unknown): v is string =>
  typeof v === 'string' && v.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim());

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return resposta(405, { erro: 'Use POST' });

  let corpo: { evento?: string; email?: string };
  try {
    corpo = await req.json();
  } catch {
    return resposta(400, { erro: 'Pedido inválido.' });
  }
  // por enquanto essa função só cuida do aviso de pedido recebido (o de aprovado sai da admin-fgrcm)
  if (corpo.evento !== 'pedido_recebido') return resposta(400, { erro: 'Aviso desconhecido.' });
  if (!emailValido(corpo.email)) return resposta(400, { erro: 'E-mail inválido.' });

  const servidor = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // procura o pedido pendente mais novo desse e-mail (no máximo 15 minutos atrás)
  const quinzeMinutos = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: pedido, error } = await servidor
    .from('access_requests')
    .select('id, nome, email, prefeitura, municipio, estado')
    // o banco grava o e-mail sempre em minúsculas (gatilho fgrcm_limitar_envios), então compara igual
    .eq('email', corpo.email.trim().toLowerCase())
    .eq('status', 'pendente')
    .gte('criado_em', quinzeMinutos)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return resposta(500, { ok: false, status: 'falhou', erro: 'Não foi possível conferir o pedido.' });
  // sem pedido recente: não manda nada (e não conta pra quem chamou se o e-mail existe ou não)
  if (!pedido) return resposta(200, { ok: true, status: 'sem_pedido_recente' });

  const r = await notificar(servidor, 'pedido_recebido', pedido, { ler: (n) => Deno.env.get(n) });
  return resposta(200, { ok: true, status: r.status });
});
