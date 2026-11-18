-- FGRC-M | desativar conta de verdade: além de bloquear o login, derruba as sessões abertas dela
-- [aplicada no Supabase em 18/11/2026 às 10:22 (horário de Brasília), versão 20261118132211]
-- só o servidor (função admin-fgrcm, com a chave secreta) consegue chamar
create or replace function public.fgrcm_encerrar_sessoes(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  quantas integer;
begin
  delete from auth.sessions where user_id = p_user;
  get diagnostics quantas = row_count;
  return quantas;
end;
$$;

revoke all on function public.fgrcm_encerrar_sessoes(uuid) from public, anon, authenticated;
grant execute on function public.fgrcm_encerrar_sessoes(uuid) to service_role;
