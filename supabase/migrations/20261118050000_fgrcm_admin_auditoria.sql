-- FGRC-M | área administrativa: quem é admin, registro de decisões, status do suporte e limite de envios
-- não apaga nada: só cria tabelas novas, adiciona colunas e troca regras (pode rodar de novo sem problema)

-- ===================================================================================
-- 1) administradores
-- quem é admin fica numa tabela que o app NÃO consegue escrever (só o SQL do painel ou o servidor)
-- assim ninguém vira admin mexendo no próprio perfil, e dá pra tirar o acesso na hora (ativo = false)
-- ===================================================================================
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  observacao text
);

alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;
grant select on public.administradores to authenticated;

-- a pessoa só consegue ver a própria linha (serve pro app saber se ela é admin)
drop policy if exists "admin ve o proprio registro" on public.administradores;
create policy "admin ve o proprio registro" on public.administradores
  for select to authenticated using (user_id = (select auth.uid()));

-- quem já tinha sido marcado como admin antes (no app_metadata, pelo SQL do painel) continua admin
insert into public.administradores (user_id, email)
select u.id, coalesce(u.email, '')
  from auth.users u
 where u.raw_app_meta_data ->> 'fgrcm_papel' = 'admin'
on conflict (user_id) do nothing;

-- ===================================================================================
-- 2) "é admin?" no banco
-- regra: tem que estar na tabela e ativo. Se a pessoa ativou a verificação em 2 etapas (MFA),
-- a sessão precisa ter passado pelo código (aal2). Regra recomendada pelo Supabase pra MFA opcional
-- ===================================================================================
create or replace function public.e_admin_fgrcm()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
           select 1 from public.administradores a
            where a.user_id = (select auth.uid()) and a.ativo
         )
     and (
           coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
           or not exists (
             select 1 from auth.mfa_factors f
              where f.user_id = (select auth.uid()) and f.status = 'verified'
           )
         );
$$;

-- versão "explicada" pra tela de admin saber o que mostrar (login, código do MFA ou o painel)
create or replace function public.estado_admin_fgrcm()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when not exists (
      select 1 from public.administradores a where a.user_id = (select auth.uid()) and a.ativo
    ) then 'nao_admin'
    when coalesce((select auth.jwt() ->> 'aal'), 'aal1') <> 'aal2'
     and exists (
       select 1 from auth.mfa_factors f where f.user_id = (select auth.uid()) and f.status = 'verified'
     ) then 'precisa_mfa'
    else 'ok'
  end;
$$;

revoke all on function public.e_admin_fgrcm() from public, anon;
revoke all on function public.estado_admin_fgrcm() from public, anon;
grant execute on function public.e_admin_fgrcm() to authenticated;
grant execute on function public.estado_admin_fgrcm() to authenticated;

-- ===================================================================================
-- 3) pedidos de acesso: quem decidiu e de qual aparelho veio o pedido
-- ===================================================================================
alter table public.access_requests
  add column if not exists analisado_por uuid references auth.users (id) on delete set null,
  add column if not exists analisado_por_email text,
  add column if not exists plataforma text check (plataforma in ('web', 'android', 'ios'));

grant insert (plataforma) on public.access_requests to anon, authenticated;

drop policy if exists "app envia pedido pendente" on public.access_requests;
create policy "app envia pedido pendente" on public.access_requests
  for insert to anon, authenticated
  with check (status = 'pendente' and analisado_em is null and analisado_por is null and observacao is null);

-- ===================================================================================
-- 4) suporte: status novos (aberto -> em atendimento -> resolvido) e quem atendeu
-- (a única mensagem que existia estava como 'aberto', que continua valendo)
-- ===================================================================================
alter table public.support_requests drop constraint if exists support_requests_status_check;
alter table public.support_requests
  add constraint support_requests_status_check check (status in ('aberto', 'em_atendimento', 'resolvido'));

alter table public.support_requests
  add column if not exists atendido_por uuid references auth.users (id) on delete set null,
  add column if not exists atendido_por_email text,
  add column if not exists atualizado_em timestamptz,
  add column if not exists plataforma text check (plataforma in ('web', 'android', 'ios'));

grant insert (plataforma) on public.support_requests to anon, authenticated;
revoke update on public.support_requests from authenticated;
grant update (status, observacao) on public.support_requests to authenticated;

-- ===================================================================================
-- 5) registro das ações da administração (auditoria)
-- só os gatilhos abaixo e o servidor escrevem aqui; admin só lê
-- ===================================================================================
create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  admin_id uuid references auth.users (id) on delete set null,
  admin_email text,
  acao text not null,
  tabela text not null,
  registro_id uuid,
  de text,
  para text,
  detalhes jsonb
);

create index if not exists admin_audit_logs_registro_idx on public.admin_audit_logs (registro_id);
create index if not exists admin_audit_logs_admin_idx on public.admin_audit_logs (admin_id);
create index if not exists access_requests_analisado_por_idx on public.access_requests (analisado_por);
create index if not exists support_requests_atendido_por_idx on public.support_requests (atendido_por);

alter table public.admin_audit_logs enable row level security;
revoke all on public.admin_audit_logs from anon, authenticated;
grant select on public.admin_audit_logs to authenticated;

drop policy if exists "admin ve auditoria" on public.admin_audit_logs;
create policy "admin ve auditoria" on public.admin_audit_logs
  for select to authenticated using ((select public.e_admin_fgrcm()));

-- ===================================================================================
-- 6) gatilhos: preenchem quem decidiu/atendeu e gravam o histórico sozinhos
-- ===================================================================================
create or replace function public.fgrcm_antes_de_decidir_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    -- decisão é uma vez só: pedido aprovado ou recusado não volta a ser decidido
    if old.status <> 'pendente' then
      raise exception 'pedido_ja_analisado' using errcode = 'P0001';
    end if;
    new.analisado_em := coalesce(new.analisado_em, now());
    new.analisado_por := coalesce(new.analisado_por, (select auth.uid()));
    new.analisado_por_email := coalesce(new.analisado_por_email, (select auth.jwt() ->> 'email'));
  end if;
  return new;
end;
$$;

create or replace function public.fgrcm_registrar_decisao_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, de, para, detalhes)
    values (new.analisado_por, new.analisado_por_email, 'pedido_' || new.status, 'access_requests', new.id,
            old.status, new.status, jsonb_build_object('email', new.email, 'motivo', new.observacao));
  end if;
  return new;
end;
$$;

create or replace function public.fgrcm_antes_de_atualizar_suporte()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.atualizado_em := now();
    new.atendido_por := coalesce((select auth.uid()), new.atendido_por);
    new.atendido_por_email := coalesce((select auth.jwt() ->> 'email'), new.atendido_por_email);
    new.respondido_em := case when new.status = 'resolvido' then now() else null end;
  end if;
  return new;
end;
$$;

create or replace function public.fgrcm_registrar_status_suporte()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, de, para, detalhes)
    values (new.atendido_por, new.atendido_por_email, 'suporte_' || new.status, 'support_requests', new.id,
            old.status, new.status, jsonb_build_object('assunto', new.assunto));
  end if;
  return new;
end;
$$;

drop trigger if exists antes_de_decidir_pedido on public.access_requests;
create trigger antes_de_decidir_pedido before update on public.access_requests
  for each row execute function public.fgrcm_antes_de_decidir_pedido();

drop trigger if exists registrar_decisao_pedido on public.access_requests;
create trigger registrar_decisao_pedido after update on public.access_requests
  for each row execute function public.fgrcm_registrar_decisao_pedido();

drop trigger if exists antes_de_atualizar_suporte on public.support_requests;
create trigger antes_de_atualizar_suporte before update on public.support_requests
  for each row execute function public.fgrcm_antes_de_atualizar_suporte();

drop trigger if exists registrar_status_suporte on public.support_requests;
create trigger registrar_status_suporte after update on public.support_requests
  for each row execute function public.fgrcm_registrar_status_suporte();

-- ===================================================================================
-- 7) proteção contra envio repetido e em massa nos formulários públicos
-- (o banco recusa e o app mostra uma mensagem simples)
-- ===================================================================================
create or replace function public.fgrcm_limitar_envios()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recentes integer;
begin
  new.email := lower(trim(new.email));

  if tg_table_name = 'support_requests' then
    -- a mesma mensagem de novo em 10 minutos = clique repetido
    if exists (
      select 1 from public.support_requests s
       where s.email = new.email and s.mensagem = new.mensagem and s.criado_em > now() - interval '10 minutes'
    ) then
      raise exception 'mensagem_duplicada' using errcode = 'P0001';
    end if;
    select count(*) into recentes from public.support_requests s
     where s.email = new.email and s.criado_em > now() - interval '1 hour';
    if recentes >= 5 then
      raise exception 'limite_de_envios' using errcode = 'P0001';
    end if;
    select count(*) into recentes from public.support_requests s where s.criado_em > now() - interval '1 minute';
    if recentes >= 20 then
      raise exception 'limite_de_envios' using errcode = 'P0001';
    end if;
  elsif tg_table_name = 'access_requests' then
    select count(*) into recentes from public.access_requests a
     where lower(a.email) = new.email and a.criado_em > now() - interval '24 hours';
    if recentes >= 3 then
      raise exception 'limite_de_envios' using errcode = 'P0001';
    end if;
    select count(*) into recentes from public.access_requests a where a.criado_em > now() - interval '1 minute';
    if recentes >= 20 then
      raise exception 'limite_de_envios' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists limitar_envios on public.support_requests;
create trigger limitar_envios before insert on public.support_requests
  for each row execute function public.fgrcm_limitar_envios();

drop trigger if exists limitar_envios on public.access_requests;
create trigger limitar_envios before insert on public.access_requests
  for each row execute function public.fgrcm_limitar_envios();

-- ===================================================================================
-- 8) "Status da solicitação" (previsto no Mapeamento de Funcionalidades)
-- quem pediu acesso consulta a situação pelo e-mail; volta só o status, nenhum outro dado
-- ===================================================================================
create or replace function public.situacao_do_pedido(p_email text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select a.status
    from public.access_requests a
   where lower(a.email) = lower(trim(p_email))
   order by a.criado_em desc
   limit 1;
$$;

revoke all on function public.situacao_do_pedido(text) from public;
grant execute on function public.situacao_do_pedido(text) to anon, authenticated;

-- as funções dos gatilhos não são pra ser chamadas pela API
revoke all on function public.fgrcm_antes_de_decidir_pedido() from public, anon, authenticated;
revoke all on function public.fgrcm_registrar_decisao_pedido() from public, anon, authenticated;
revoke all on function public.fgrcm_antes_de_atualizar_suporte() from public, anon, authenticated;
revoke all on function public.fgrcm_registrar_status_suporte() from public, anon, authenticated;
revoke all on function public.fgrcm_limitar_envios() from public, anon, authenticated;
