-- FGRC-M | suporte com resposta pelo painel, modo de manutenção e versão mínima do app
-- [aplicada no Supabase em 18/11/2026 às 10:22 (horário de Brasília), versão 20261118132205]
-- não apaga nada e não muda as tabelas que já existiam: só cria tabelas, funções e regras novas
-- (o APK que já ta instalado continua funcionando igual, ele só não usa essas partes novas)
-- obs: no painel ela foi aplicada sem as linhas "drop ... if exists" (as tabelas eram novas);
-- aqui elas ficaram pra dar pra rodar de novo sem erro, o resultado é o mesmo

-- ===================================================================================
-- 1) respostas da equipe nos chamados de suporte
-- quem escreve: só a administração (RLS + e_admin_fgrcm)
-- quem lê: a administração lê tudo; a pessoa lê só as respostas dos chamados DELA,
-- e só pela função meus_chamados_fgrcm (lá embaixo), nunca direto na tabela
-- ===================================================================================
create table if not exists public.support_replies (
  id uuid primary key default gen_random_uuid(),
  chamado_id uuid not null references public.support_requests (id) on delete cascade,
  texto text not null check (char_length(btrim(texto)) between 2 and 2000),
  autor_id uuid references auth.users (id) on delete set null,
  autor_email text,
  criado_em timestamptz not null default now()
);

create index if not exists support_replies_chamado_idx on public.support_replies (chamado_id, criado_em);
create index if not exists support_replies_autor_idx on public.support_replies (autor_id);

alter table public.support_replies enable row level security;
revoke all on public.support_replies from anon, authenticated;
grant select on public.support_replies to authenticated;
-- o app só manda o chamado e o texto; autor e horário quem preenche é o banco (gatilho)
grant insert (chamado_id, texto) on public.support_replies to authenticated;

drop policy if exists "admin ve respostas" on public.support_replies;
create policy "admin ve respostas" on public.support_replies
  for select to authenticated using ((select public.e_admin_fgrcm()));

drop policy if exists "admin responde chamado" on public.support_replies;
create policy "admin responde chamado" on public.support_replies
  for insert to authenticated with check ((select public.e_admin_fgrcm()));

-- antes de gravar: autor e horário vêm da sessão, não do que o app mandou
create or replace function public.fgrcm_antes_de_responder_chamado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.autor_id := (select auth.uid());
  new.autor_email := (select auth.jwt() ->> 'email');
  new.criado_em := now();
  new.texto := btrim(new.texto);
  return new;
end;
$$;

-- depois de gravar: o chamado sai de "aberto" pra "em atendimento", ganha horário de atualização
-- e a resposta entra no histórico (sem copiar o texto pro histórico)
create or replace function public.fgrcm_depois_de_responder_chamado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.support_requests
     set status = case when status = 'aberto' then 'em_atendimento' else status end,
         atualizado_em = now()
   where id = new.chamado_id;

  insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, de, para, detalhes)
  values (new.autor_id, new.autor_email, 'suporte_resposta', 'support_requests', new.chamado_id,
          null, 'resposta enviada', jsonb_build_object('resposta_id', new.id, 'tamanho', char_length(new.texto)));
  return new;
end;
$$;

drop trigger if exists antes_de_responder_chamado on public.support_replies;
create trigger antes_de_responder_chamado before insert on public.support_replies
  for each row execute function public.fgrcm_antes_de_responder_chamado();

drop trigger if exists depois_de_responder_chamado on public.support_replies;
create trigger depois_de_responder_chamado after insert on public.support_replies
  for each row execute function public.fgrcm_depois_de_responder_chamado();

-- "Meus chamados": devolve SÓ os chamados de quem ta logado (auth.uid())
-- não adianta trocar id na chamada: a função nem recebe id, ela usa o crachá (JWT) da pessoa
-- não devolve observação interna nem o e-mail de quem atendeu (a pessoa vê "Equipe FGRC-M")
create or replace function public.meus_chamados_fgrcm()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(c.item order by c.criado_em desc), '[]'::jsonb)
    from (
      select s.criado_em,
             jsonb_build_object(
               'id', s.id,
               'assunto', s.assunto,
               'mensagem', s.mensagem,
               'status', s.status,
               'criado_em', s.criado_em,
               'atualizado_em', greatest(s.criado_em, s.atualizado_em,
                                 (select max(r.criado_em) from public.support_replies r where r.chamado_id = s.id)),
               'respostas', (select coalesce(jsonb_agg(jsonb_build_object('texto', r.texto, 'criado_em', r.criado_em)
                                                       order by r.criado_em), '[]'::jsonb)
                               from public.support_replies r where r.chamado_id = s.id),
               'historico', (select coalesce(jsonb_agg(jsonb_build_object('status', l.para, 'em', l.criado_em)
                                                       order by l.criado_em), '[]'::jsonb)
                               from public.admin_audit_logs l
                              where l.tabela = 'support_requests'
                                and l.registro_id = s.id
                                and l.acao in ('suporte_aberto', 'suporte_em_atendimento', 'suporte_resolvido'))
             ) as item
        from public.support_requests s
       where s.user_id = (select auth.uid())
       order by s.criado_em desc
       limit 50
    ) c;
$$;

revoke all on function public.meus_chamados_fgrcm() from public, anon;
grant execute on function public.meus_chamados_fgrcm() to authenticated;

-- ===================================================================================
-- 2) modo de manutenção (uma linha só, id = 1)
-- todo mundo consegue SABER se ta em manutenção (pela função estado_do_sistema_fgrcm)
-- só a administração consegue LIGAR ou DESLIGAR
-- ===================================================================================
create table if not exists public.sistema_status (
  id smallint primary key default 1 check (id = 1),
  manutencao_ativa boolean not null default false,
  mensagem text check (mensagem is null or char_length(mensagem) <= 500),
  previsao_retorno timestamptz,
  plataformas text not null default 'todas' check (plataformas in ('todas', 'web', 'android')),
  atualizado_em timestamptz,
  atualizado_por uuid references auth.users (id) on delete set null,
  atualizado_por_email text
);

insert into public.sistema_status (id) values (1) on conflict (id) do nothing;

alter table public.sistema_status enable row level security;
revoke all on public.sistema_status from anon, authenticated;
grant select on public.sistema_status to authenticated;
grant update (manutencao_ativa, mensagem, previsao_retorno, plataformas) on public.sistema_status to authenticated;

drop policy if exists "admin ve status do sistema" on public.sistema_status;
create policy "admin ve status do sistema" on public.sistema_status
  for select to authenticated using ((select public.e_admin_fgrcm()));

drop policy if exists "admin muda status do sistema" on public.sistema_status;
create policy "admin muda status do sistema" on public.sistema_status
  for update to authenticated
  using ((select public.e_admin_fgrcm()))
  with check ((select public.e_admin_fgrcm()));

-- ===================================================================================
-- 3) versões do app por plataforma (versão mais nova, versão mínima e link oficial)
-- versão abaixo da mínima + obrigatoria = o app mostra "Nova versão do FGRC-M disponível" e bloqueia
-- o link tem que ser https (nada de http ou outro tipo de endereço)
-- ===================================================================================
create table if not exists public.app_versoes (
  plataforma text primary key check (plataforma in ('android', 'web', 'ios')),
  versao_atual text not null check (versao_atual ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'),
  versao_minima text not null check (versao_minima ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'),
  obrigatoria boolean not null default false,
  url_atualizacao text check (url_atualizacao is null or (url_atualizacao ~ '^https://[^[:space:]]+$' and char_length(url_atualizacao) <= 500)),
  mensagem text check (mensagem is null or char_length(mensagem) <= 500),
  notas text check (notas is null or char_length(notas) <= 2000),
  publicada_em date,
  atualizado_em timestamptz,
  atualizado_por uuid references auth.users (id) on delete set null,
  atualizado_por_email text,
  -- a mínima nunca pode ser maior que a mais nova (comparando número por número: 1.10.0 > 1.9.0)
  constraint app_versoes_minima_ate_atual check (
    string_to_array(versao_minima, '.')::int[] <= string_to_array(versao_atual, '.')::int[]
  )
);

-- começa com a versão que já ta distribuída (1.0.0) e sem obrigar ninguém a atualizar
insert into public.app_versoes (plataforma, versao_atual, versao_minima, obrigatoria)
values ('android', '1.0.0', '1.0.0', false), ('web', '1.0.0', '1.0.0', false)
on conflict (plataforma) do nothing;

alter table public.app_versoes enable row level security;
revoke all on public.app_versoes from anon, authenticated;
grant select on public.app_versoes to authenticated;
grant update (versao_atual, versao_minima, obrigatoria, url_atualizacao, mensagem, notas, publicada_em)
  on public.app_versoes to authenticated;

drop policy if exists "admin ve versoes" on public.app_versoes;
create policy "admin ve versoes" on public.app_versoes
  for select to authenticated using ((select public.e_admin_fgrcm()));

drop policy if exists "admin muda versoes" on public.app_versoes;
create policy "admin muda versoes" on public.app_versoes
  for update to authenticated
  using ((select public.e_admin_fgrcm()))
  with check ((select public.e_admin_fgrcm()));

-- carimbo de quem mudou (serve pras duas tabelas) + histórico
create or replace function public.fgrcm_carimbar_atualizacao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  new.atualizado_por := (select auth.uid());
  new.atualizado_por_email := (select auth.jwt() ->> 'email');
  return new;
end;
$$;

create or replace function public.fgrcm_registrar_mudanca_sistema()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'sistema_status' then
    insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, de, para, detalhes)
    values (new.atualizado_por, new.atualizado_por_email,
            case
              when new.manutencao_ativa and not old.manutencao_ativa then 'manutencao_ativada'
              when old.manutencao_ativa and not new.manutencao_ativa then 'manutencao_desativada'
              else 'manutencao_alterada'
            end,
            'sistema_status', null,
            case when old.manutencao_ativa then 'em manutenção' else 'funcionando' end,
            case when new.manutencao_ativa then 'em manutenção' else 'funcionando' end,
            jsonb_build_object('mensagem', new.mensagem, 'previsao_retorno', new.previsao_retorno, 'plataformas', new.plataformas));
  else
    insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, de, para, detalhes)
    values (new.atualizado_por, new.atualizado_por_email, 'versao_alterada', 'app_versoes', null,
            old.versao_atual || ' (mínima ' || old.versao_minima || ')',
            new.versao_atual || ' (mínima ' || new.versao_minima || ')',
            jsonb_build_object('plataforma', new.plataforma, 'obrigatoria', new.obrigatoria, 'url', new.url_atualizacao));
  end if;
  return new;
end;
$$;

drop trigger if exists carimbar_sistema_status on public.sistema_status;
create trigger carimbar_sistema_status before update on public.sistema_status
  for each row execute function public.fgrcm_carimbar_atualizacao();
drop trigger if exists registrar_sistema_status on public.sistema_status;
create trigger registrar_sistema_status after update on public.sistema_status
  for each row execute function public.fgrcm_registrar_mudanca_sistema();

drop trigger if exists carimbar_app_versoes on public.app_versoes;
create trigger carimbar_app_versoes before update on public.app_versoes
  for each row execute function public.fgrcm_carimbar_atualizacao();
drop trigger if exists registrar_app_versoes on public.app_versoes;
create trigger registrar_app_versoes after update on public.app_versoes
  for each row execute function public.fgrcm_registrar_mudanca_sistema();

-- o que o app pergunta quando abre (e quando volta pra frente): ta em manutenção? minha versão serve?
-- funciona sem login (a tela de Login também precisa saber), mas só devolve o que é público
create or replace function public.estado_do_sistema_fgrcm(p_plataforma text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'manutencao', (
      select case
               when s.manutencao_ativa and (s.plataformas = 'todas' or s.plataformas = p_plataforma)
               then jsonb_build_object('mensagem', s.mensagem, 'previsao_retorno', s.previsao_retorno)
             end
        from public.sistema_status s where s.id = 1
    ),
    'versao', (
      select jsonb_build_object(
               'versao_atual', v.versao_atual,
               'versao_minima', v.versao_minima,
               'obrigatoria', v.obrigatoria,
               'url_atualizacao', v.url_atualizacao,
               'mensagem', v.mensagem,
               'notas', v.notas,
               'publicada_em', v.publicada_em)
        from public.app_versoes v where v.plataforma = p_plataforma
    )
  );
$$;

revoke all on function public.estado_do_sistema_fgrcm(text) from public;
grant execute on function public.estado_do_sistema_fgrcm(text) to anon, authenticated;
