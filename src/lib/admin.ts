// [integração] serviços da área administrativa (tudo que a tela de admin pede pro Supabase passa por aqui)
// importante: esconder botão não protege nada. Quem protege de verdade é o banco (RLS) e a função
// admin-fgrcm no servidor, que conferem se a pessoa é admin antes de mostrar ou mudar qualquer dado
import { supabase } from '@/lib/supabase';

export type StatusPedido = 'pendente' | 'aprovado' | 'recusado';
export type StatusSuporte = 'aberto' | 'em_atendimento' | 'resolvido';

export type Pedido = {
  id: string;
  nome: string;
  email: string;
  prefeitura: string;
  municipio: string;
  estado: string;
  status: StatusPedido;
  criado_em: string;
  analisado_em: string | null;
  analisado_por_email: string | null;
  observacao: string | null;
  plataforma: string | null;
};

export type MensagemSuporte = {
  id: string;
  user_id: string | null;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  status: StatusSuporte;
  criado_em: string;
  atualizado_em: string | null;
  atendido_por_email: string | null;
  plataforma: string | null;
};

export type RegistroHistorico = {
  id: number;
  criado_em: string;
  admin_email: string | null;
  acao: string;
  de: string | null;
  para: string | null;
};

export type ContaCadastrada = {
  id: string;
  email: string;
  nome: string | null;
  prefeitura: string | null;
  municipio: string | null;
  estado: string | null;
  criado_em: string;
  ultimo_acesso: string | null;
  desativado: boolean;
  confirmado: boolean;
  admin: boolean;
};

// textos que aparecem na tela pra cada situação
export const NOME_STATUS_PEDIDO: Record<StatusPedido, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovada',
  recusado: 'Recusada',
};
export const NOME_STATUS_SUPORTE: Record<StatusSuporte, string> = {
  aberto: 'Aguardando atendimento',
  em_atendimento: 'Em atendimento',
  resolvido: 'Resolvida',
};

// "nao_admin" | "precisa_mfa" | "ok": quem responde é o banco (função estado_admin_fgrcm)
export async function verificarEstadoAdmin(): Promise<'sem_sessao' | 'nao_admin' | 'precisa_mfa' | 'ok'> {
  const { data: sessao } = await supabase.auth.getSession();
  if (!sessao.session) return 'sem_sessao';
  const { data, error } = await supabase.rpc('estado_admin_fgrcm');
  if (error) throw new Error('Não foi possível conferir a permissão. Verifique a internet.');
  return data === 'ok' || data === 'precisa_mfa' ? data : 'nao_admin';
}

// ---------- pedidos de acesso ----------

export async function listarPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('access_requests')
    .select('id, nome, email, prefeitura, municipio, estado, status, criado_em, analisado_em, analisado_por_email, observacao, plataforma')
    .order('criado_em', { ascending: false })
    .limit(500);
  if (error) throw new Error('Não foi possível carregar os pedidos.');
  return (data ?? []) as Pedido[];
}

// a função do servidor devolve { erro } quando algo dá errado; aqui a gente pega esse texto
async function chamarFuncaoAdmin<T>(corpo: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-fgrcm', { body: corpo });
  if (error) {
    let texto = 'Não foi possível concluir. Verifique a internet e tente de novo.';
    try {
      const resposta = (error as { context?: Response }).context;
      const json = resposta ? await resposta.json() : null;
      if (json?.erro) texto = json.erro;
    } catch {
      // fica a mensagem padrão
    }
    throw new Error(texto);
  }
  return data as T;
}

// aprovar com:
//   'senha'   = senha provisória (não precisa de e-mail)
//   'codigo'  = código de ativação que a administração passa pra pessoa (não precisa de e-mail)
//   'convite' = o Supabase manda o código por e-mail (precisa do SMTP configurado)
export function aprovarPedido(pedidoId: string, modo: 'senha' | 'codigo' | 'convite') {
  return chamarFuncaoAdmin<{ mensagem: string; senhaProvisoria: string | null; codigo: string | null }>({ acao: 'aprovar', pedidoId, modo });
}

// [integração] novo acesso pra quem perdeu a senha provisória ou o código
// manda o userId (aba Contas) ou o e-mail (tela do pedido); o pedidoId faz o registro aparecer no histórico do pedido
export function novoAcesso(dados: { modo: 'senha' | 'codigo' | 'email'; userId?: string; email?: string; pedidoId?: string }) {
  return chamarFuncaoAdmin<{ mensagem: string; senhaProvisoria?: string; codigo?: string }>({ acao: 'novo_acesso', ...dados });
}

export function recusarPedido(pedidoId: string, motivo: string) {
  return chamarFuncaoAdmin<{ mensagem: string }>({ acao: 'recusar', pedidoId, observacao: motivo });
}

// ---------- suporte ----------

export async function listarMensagens(): Promise<MensagemSuporte[]> {
  const { data, error } = await supabase
    .from('support_requests')
    .select('id, user_id, nome, email, assunto, mensagem, status, criado_em, atualizado_em, atendido_por_email, plataforma')
    .order('criado_em', { ascending: false })
    .limit(500);
  if (error) throw new Error('Não foi possível carregar as mensagens.');
  return (data ?? []) as MensagemSuporte[];
}

// quem atendeu e o horário ficam gravados pelo próprio banco (gatilho), não pelo app
export async function mudarStatusMensagem(id: string, status: StatusSuporte): Promise<void> {
  const { data, error } = await supabase.from('support_requests').update({ status }).eq('id', id).select('id');
  if (error || !data?.length) throw new Error('Não foi possível atualizar a mensagem.');
}

// ---------- histórico (auditoria) ----------

export async function historicoDoRegistro(registroId: string): Promise<RegistroHistorico[]> {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('id, criado_em, admin_email, acao, de, para')
    .eq('registro_id', registroId)
    .order('criado_em', { ascending: true });
  if (error) throw new Error('Não foi possível carregar o histórico.');
  return (data ?? []) as RegistroHistorico[];
}

// ---------- contas ----------

export async function listarContas(): Promise<ContaCadastrada[]> {
  const r = await chamarFuncaoAdmin<{ usuarios: ContaCadastrada[] }>({ acao: 'listar_usuarios' });
  return r.usuarios ?? [];
}

export function alterarConta(userId: string, desativar: boolean, motivo?: string) {
  return chamarFuncaoAdmin<{ mensagem: string }>({
    acao: desativar ? 'desativar_usuario' : 'reativar_usuario',
    userId,
    observacao: motivo,
  });
}

// ---------- verificação em duas etapas (MFA por aplicativo autenticador) ----------

export async function fatoresVerificados() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new Error('Não foi possível ler a verificação em duas etapas.');
  return data.totp.filter(f => f.status === 'verified');
}

// pede o código de 6 números do aplicativo autenticador e sobe a sessão pra aal2
export async function confirmarCodigoMfa(codigo: string): Promise<void> {
  const fatores = await fatoresVerificados();
  if (!fatores.length) throw new Error('Nenhum aplicativo autenticador cadastrado.');
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fatores[0].id, code: codigo.trim() });
  if (error) throw new Error('Código errado ou vencido. Confira no aplicativo e tente de novo.');
}

// começa o cadastro: o Supabase devolve o QR code e a chave pra digitar no aplicativo autenticador
export async function iniciarCadastroMfa() {
  // apaga tentativas que ficaram pela metade (senão o Supabase recusa um novo cadastro)
  const { data: lista } = await supabase.auth.mfa.listFactors();
  for (const f of lista?.all ?? []) {
    if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'FGRC-M admin' });
  if (error || !data) throw new Error('Não foi possível iniciar a verificação em duas etapas.');
  return { factorId: data.id, qrCode: data.totp.qr_code, chave: data.totp.secret };
}

export async function concluirCadastroMfa(factorId: string, codigo: string): Promise<void> {
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: codigo.trim() });
  if (error) throw new Error('Código errado ou vencido. Confira no aplicativo e tente de novo.');
}
