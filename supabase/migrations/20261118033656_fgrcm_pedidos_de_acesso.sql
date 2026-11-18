-- FGRC-M | P02 Solicitar acesso | tabela dos pedidos de acesso
-- [integração P02] rode UMA vez no painel do Supabase: SQL Editor > New query > cole tudo > Run
-- pode rodar de novo sem estragar nada (tudo usa "if not exists" ou recria a regra)
-- o que esse script garante:
--   * o app só consegue ENVIAR um pedido novo (não consegue ler, mudar nem apagar pedidos)
--   * todo pedido nasce como 'pendente'; só a administração muda o status, pelo painel
--   * não fica mais de um pedido pendente pro mesmo e-mail

-- 1) a tabela (cada linha é um pedido)
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 3 and 120),
  email text not null check (
    char_length(email) <= 254
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
  ),
  prefeitura text not null check (char_length(prefeitura) between 2 and 150),
  municipio text not null check (char_length(municipio) between 2 and 100),
  estado text not null check (char_length(estado) between 2 and 50),
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'recusado')),
  criado_em timestamptz not null default now(),
  analisado_em timestamptz,
  observacao text
);

-- 2) no máximo um pedido pendente por e-mail (o app avisa "já existe um pedido em análise")
create unique index if not exists access_requests_um_pendente_por_email
  on public.access_requests (lower(email))
  where status = 'pendente';

-- 3) liga a segurança por linha (RLS): sem regra, ninguém faz nada pelo app
alter table public.access_requests enable row level security;

-- 4) a única regra: quem usa o app pode inserir um pedido pendente e ainda não analisado
drop policy if exists "app envia pedido pendente" on public.access_requests;
create policy "app envia pedido pendente"
  on public.access_requests
  for insert
  to anon, authenticated
  with check (status = 'pendente' and analisado_em is null and observacao is null);

-- 5) permissões: o app só pode inserir, e só nos 5 campos do formulário
--    (status, datas e observação ficam com o valor padrão; só o painel muda depois)
revoke all on public.access_requests from anon, authenticated;
grant insert (nome, email, prefeitura, municipio, estado)
  on public.access_requests to anon, authenticated;
