-- FGRC-M | Área da administração | regras de quem pode ver e mudar os pedidos
-- [integração] rode DEPOIS dos outros dois arquivos (pedidos de acesso e suporte)
-- SQL Editor > New query > cole tudo > Run (pode rodar de novo sem problema)
--
-- versão 1 (substituída pela 20261118042102): admin era quem tinha fgrcm_papel = admin no app_metadata
-- agora quem é admin fica na tabela public.administradores

-- 1) função que responde "quem ta logado é admin?" (lê o crachá/JWT da sessão)
create or replace function public.e_admin_fgrcm()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'fgrcm_papel') = 'admin', false);
$$;

-- 2) pedidos de acesso: admin pode ver todos e mudar status/observação
drop policy if exists "admin ve pedidos" on public.access_requests;
create policy "admin ve pedidos" on public.access_requests
  for select to authenticated using ((select public.e_admin_fgrcm()));

drop policy if exists "admin atualiza pedidos" on public.access_requests;
create policy "admin atualiza pedidos" on public.access_requests
  for update to authenticated using ((select public.e_admin_fgrcm())) with check ((select public.e_admin_fgrcm()));

grant select on public.access_requests to authenticated;
grant update (status, analisado_em, observacao) on public.access_requests to authenticated;

-- 3) mensagens de suporte: mesma ideia
drop policy if exists "admin ve suporte" on public.support_requests;
create policy "admin ve suporte" on public.support_requests
  for select to authenticated using ((select public.e_admin_fgrcm()));

drop policy if exists "admin atualiza suporte" on public.support_requests;
create policy "admin atualiza suporte" on public.support_requests
  for update to authenticated using ((select public.e_admin_fgrcm())) with check ((select public.e_admin_fgrcm()));

grant select on public.support_requests to authenticated;
grant update (status, respondido_em, observacao) on public.support_requests to authenticated;
