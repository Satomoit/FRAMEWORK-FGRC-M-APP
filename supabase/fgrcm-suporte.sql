-- FGRC-M | Ajuda e suporte | tabela das mensagens enviadas pelo app
-- [integração] rode UMA vez no painel do Supabase: SQL Editor > New query > cole tudo > Run
-- pode rodar de novo sem estragar nada
-- o app só consegue ENVIAR mensagem (não lê, não muda e não apaga)
-- a equipe lê as mensagens em: Table Editor > support_requests

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  -- quem tava logado quando mandou (fica vazio se mandou pela tela de Login)
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  nome text not null check (char_length(nome) between 2 and 120),
  email text not null check (
    char_length(email) <= 254
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
  ),
  assunto text not null check (assunto in (
    'Problema para entrar', 'Dúvida sobre a avaliação', 'Erro no aplicativo', 'Outro assunto'
  )),
  mensagem text not null check (char_length(mensagem) between 10 and 1500),
  status text not null default 'aberto' check (status in ('aberto', 'respondido', 'fechado')),
  criado_em timestamptz not null default now(),
  respondido_em timestamptz,
  observacao text
);

create index if not exists support_requests_user_id_idx on public.support_requests (user_id);

alter table public.support_requests enable row level security;

-- a única regra: o app pode inserir uma mensagem nova, aberta, no nome de quem ta logado (ou sem login)
drop policy if exists "app envia mensagem de suporte" on public.support_requests;
create policy "app envia mensagem de suporte"
  on public.support_requests
  for insert
  to anon, authenticated
  with check (
    status = 'aberto'
    and respondido_em is null
    and observacao is null
    and (user_id is null or user_id = (select auth.uid()))
  );

-- o app só pode preencher esses 4 campos (o resto fica com o valor padrão)
revoke all on public.support_requests from anon, authenticated;
grant insert (nome, email, assunto, mensagem)
  on public.support_requests to anon, authenticated;

-- COMO RESPONDER
--   1. Table Editor > support_requests: leia as mensagens com status 'aberto'
--   2. responda pelo e-mail da equipe para o endereço informado
--   3. mude o status para 'respondido' e preencha respondido_em
