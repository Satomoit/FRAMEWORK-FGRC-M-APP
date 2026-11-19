-- FGRC-M | registro dos e-mails de aviso "solicitação recebida" e "solicitação aprovada" (pedido de 19/11/2026)
-- [aplicada no Supabase em 19/11/2026 com autorização da Josiane (pelo MCP, então lá a versão registrada é a hora da aplicação)]
-- não mexe nos e-mails do login (convite, código e troca de senha): esses continuam saindo pelo Supabase Auth
-- só cria uma tabela nova e duas funções; não apaga nem muda nada que já existe
--
-- pra que serve a tabela:
--   * não mandar o mesmo aviso duas vezes (um aviso por pedido e por tipo de evento)
--   * guardar se o envio deu certo, falhou ou nem foi tentado (provedor de e-mail ainda não configurado)
--   * a administração vê essa situação no painel e consegue mandar de novo quando falhou

create table if not exists public.email_notificacoes (
  id uuid primary key default gen_random_uuid(),
  evento text not null check (evento in ('pedido_recebido', 'pedido_aprovado')),
  -- se o pedido for excluído, o registro do aviso some junto (ele tem o e-mail da pessoa)
  pedido_id uuid not null references public.access_requests (id) on delete cascade,
  destinatario text not null,
  status text not null check (status in ('enviando', 'enviado', 'falhou', 'nao_configurado')),
  tentativas integer not null default 1,
  provedor text,
  id_no_provedor text,
  -- só o código do erro (sem e-mail, sem senha, sem texto da mensagem)
  erro text check (erro is null or char_length(erro) <= 200),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  enviado_em timestamptz,
  unique (evento, pedido_id)
);

create index if not exists email_notificacoes_pedido_idx on public.email_notificacoes (pedido_id);

alter table public.email_notificacoes enable row level security;
revoke all on public.email_notificacoes from anon, authenticated;
grant select on public.email_notificacoes to authenticated;

-- só a administração lê (pra mostrar no painel); ninguém escreve pelo app
drop policy if exists "admin ve avisos por email" on public.email_notificacoes;
create policy "admin ve avisos por email" on public.email_notificacoes
  for select to authenticated using ((select public.e_admin_fgrcm()));

-- ===================================================================================
-- "posso mandar esse aviso?" (separa o envio de um jeito que duas chamadas ao mesmo tempo não mandam 2 e-mails)
-- devolve:
--   'reservado'    = pode mandar agora (a linha fica como 'enviando')
--   'ja_enviado'   = já foi enviado antes, não manda de novo
--   'em_andamento' = outra chamada ta mandando agora (menos de 10 minutos)
-- quem falhou ou não tinha provedor configurado pode ser reservado de novo (pra tentar outra vez)
-- ===================================================================================
create or replace function public.fgrcm_reservar_notificacao(p_evento text, p_pedido uuid, p_destinatario text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  insert into public.email_notificacoes (evento, pedido_id, destinatario, status)
  values (p_evento, p_pedido, lower(btrim(p_destinatario)), 'enviando')
  on conflict (evento, pedido_id) do nothing;
  if found then
    return 'reservado';
  end if;

  update public.email_notificacoes n
     set status = 'enviando',
         tentativas = n.tentativas + 1,
         destinatario = lower(btrim(p_destinatario)),
         erro = null,
         atualizado_em = now()
   where n.evento = p_evento and n.pedido_id = p_pedido
     and (n.status in ('falhou', 'nao_configurado')
          or (n.status = 'enviando' and n.atualizado_em < now() - interval '10 minutes'));
  if found then
    return 'reservado';
  end if;

  select n.status into v_status from public.email_notificacoes n where n.evento = p_evento and n.pedido_id = p_pedido;
  return case when v_status = 'enviado' then 'ja_enviado' else 'em_andamento' end;
end;
$$;

-- grava o resultado do envio (só marca 'enviado' quando o provedor confirmou)
create or replace function public.fgrcm_concluir_notificacao(
  p_evento text, p_pedido uuid, p_status text, p_provedor text, p_id_no_provedor text, p_erro text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('enviado', 'falhou', 'nao_configurado') then
    raise exception 'status_invalido' using errcode = 'P0001';
  end if;
  update public.email_notificacoes n
     set status = p_status,
         provedor = p_provedor,
         id_no_provedor = case when p_status = 'enviado' then left(p_id_no_provedor, 200) else null end,
         erro = case when p_status = 'enviado' then null else left(p_erro, 200) end,
         enviado_em = case when p_status = 'enviado' then now() else n.enviado_em end,
         atualizado_em = now()
   where n.evento = p_evento and n.pedido_id = p_pedido;
end;
$$;

-- só as funções do servidor (com a chave secreta) chamam
revoke all on function public.fgrcm_reservar_notificacao(text, uuid, text) from public, anon, authenticated;
revoke all on function public.fgrcm_concluir_notificacao(text, uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.fgrcm_reservar_notificacao(text, uuid, text) to service_role;
grant execute on function public.fgrcm_concluir_notificacao(text, uuid, text, text, text, text) to service_role;
