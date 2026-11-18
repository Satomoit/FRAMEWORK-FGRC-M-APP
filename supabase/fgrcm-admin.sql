-- FGRC-M | Área da administração | regras de quem pode ver e mudar os pedidos
-- [integração] rode DEPOIS dos outros dois arquivos (pedidos de acesso e suporte)
-- SQL Editor > New query > cole tudo > Run (pode rodar de novo sem problema)
--
-- quem é admin? quem tiver  "fgrcm_papel": "admin"  no app_metadata da conta
-- o app_metadata só muda por aqui (SQL) ou pelo servidor: a pessoa NÃO consegue se tornar admin pelo app

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

-- 4) TORNAR UMA CONTA ADMIN (troque o e-mail e rode só esta parte)
--    depois a pessoa precisa SAIR e ENTRAR de novo no app pra valer
-- update auth.users
--    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"fgrcm_papel": "admin"}'::jsonb
--  where email = 'seu-email@gmail.com';
