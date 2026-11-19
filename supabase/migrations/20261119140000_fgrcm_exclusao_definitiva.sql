-- FGRC-M | exclusão definitiva de contas e de solicitações de acesso (pedido de 19/11/2026)
-- [aplicada no Supabase em 19/11/2026 com autorização da Josiane (pelo MCP, então lá a versão registrada é a hora da aplicação)]
-- não cria nem muda tabela, não apaga nada sozinha: só cria duas funções que a função do servidor
-- admin-fgrcm chama (com a chave secreta) quando a administração confirma uma exclusão
--
-- política combinada (o que acontece com cada dado):
--   * conta (auth.users): apagada de vez pela admin-fgrcm, DEPOIS que estas funções terminam
--   * pedidos de acesso pendentes do mesmo e-mail: apagados (ainda não tinha decisão nenhuma)
--   * pedidos já aprovados ou recusados: ficam, mas sem nome e sem e-mail (prefeitura, município,
--     estado, situação, datas e quem decidiu continuam, pq são registro da decisão da equipe)
--   * mensagens de suporte da pessoa: ficam o assunto, a situação e as datas; nome, e-mail,
--     texto da mensagem e observação interna são trocados por "removido"
--   * respostas da equipe nessas mensagens: o texto é trocado por "removido" (pode citar a pessoa)
--   * avisos por e-mail (email_notificacoes): somem junto com o pedido apagado; nos pedidos que ficam,
--     o e-mail de destino é trocado por "removido"
--   * histórico (admin_audit_logs): os registros continuam (quem fez o quê e quando), mas o e-mail
--     e o motivo da pessoa saem do campo detalhes
--   * avaliações e relatórios: ficam só no celular da pessoa, o servidor não tem como apagar
--     (nunca foram enviados pro Supabase)
--   * contas da administração e a própria conta de quem ta excluindo: recusadas sempre

-- e-mail falso e único pra ocupar o lugar do e-mail apagado
-- (as tabelas exigem um e-mail válido, e o pedido pendente não pode repetir e-mail)
create or replace function public.fgrcm_email_removido(p_id uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'removido+' || left(replace(p_id::text, '-', ''), 12) || '@anonimizado.invalid';
$$;

-- ===================================================================================
-- 1) apaga ou anonimiza os dados pessoais ligados a uma conta (antes de apagar a conta)
-- roda tudo numa transação só: ou faz tudo, ou não faz nada
-- pode rodar de novo sem problema (se já foi feito, só devolve zeros)
-- ===================================================================================
create or replace function public.fgrcm_excluir_dados_da_conta(
  p_user uuid,
  p_admin uuid,
  p_admin_email text,
  p_motivo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_prefeitura text;
  v_pedidos_excluidos uuid[];
  v_pedidos_anonimizados uuid[];
  v_chamados uuid[];
  v_respostas integer;
  v_registros integer;
  v_avisos integer;
  v_motivo text := nullif(left(btrim(coalesce(p_motivo, '')), 500), '');
begin
  -- quem pediu tem que ser admin ativo (a admin-fgrcm já confere, aqui é a segunda trava)
  if not exists (select 1 from public.administradores a where a.user_id = p_admin and a.ativo) then
    raise exception 'sem_permissao' using errcode = 'P0001';
  end if;
  if p_user = p_admin then
    raise exception 'propria_conta' using errcode = 'P0001';
  end if;
  -- conta de admin nunca é excluída por aqui (nem desativada): só pelo SQL do painel
  if exists (select 1 from public.administradores a where a.user_id = p_user) then
    raise exception 'conta_de_administracao' using errcode = 'P0001';
  end if;

  -- o e-mail vem do próprio banco, nunca do que o app mandou
  select lower(btrim(u.email)), u.raw_app_meta_data ->> 'prefeitura'
    into v_email, v_prefeitura
    from auth.users u
   where u.id = p_user;
  if not found then
    raise exception 'conta_nao_encontrada' using errcode = 'P0001';
  end if;

  -- pedidos pendentes do mesmo e-mail: ainda não tinha decisão, então saem de vez
  with apagados as (
    delete from public.access_requests r
     where v_email is not null and lower(r.email) = v_email and r.status = 'pendente'
    returning r.id
  )
  select coalesce(array_agg(id), '{}') into v_pedidos_excluidos from apagados;

  -- pedidos decididos: fica o registro da decisão, sem nome e sem e-mail
  -- (o update não mexe no status, então os gatilhos de decisão não fazem nada)
  with anonimos as (
    update public.access_requests r
       set nome = 'Pessoa removida',
           email = public.fgrcm_email_removido(r.id)
     where v_email is not null and lower(r.email) = v_email and r.status <> 'pendente'
    returning r.id
  )
  select coalesce(array_agg(id), '{}') into v_pedidos_anonimizados from anonimos;

  -- avisos por e-mail desses pedidos (os dos pedidos apagados já sumiram junto, pelo "on delete cascade")
  update public.email_notificacoes n
     set destinatario = public.fgrcm_email_removido(n.id)
   where n.pedido_id = any (v_pedidos_anonimizados)
     and n.destinatario not like '%@anonimizado.invalid';
  get diagnostics v_avisos = row_count;

  -- mensagens de suporte da pessoa (as que ela mandou logada e as que mandou sem login com o mesmo e-mail)
  with anonimos as (
    update public.support_requests s
       set nome = 'Pessoa removida',
           email = public.fgrcm_email_removido(s.id),
           mensagem = '[mensagem removida: conta excluída]',
           observacao = null,
           user_id = null
     where s.user_id = p_user or (v_email is not null and lower(s.email) = v_email)
    returning s.id
  )
  select coalesce(array_agg(id), '{}') into v_chamados from anonimos;

  -- respostas da equipe nessas mensagens (o texto pode ter o nome ou dados da pessoa)
  update public.support_replies r
     set texto = '[resposta removida: conta excluída]'
   where r.chamado_id = any (v_chamados)
     and r.texto <> '[resposta removida: conta excluída]';
  get diagnostics v_respostas = row_count;

  -- histórico: continua existindo (quem fez o quê e quando), mas sem e-mail e sem motivo da pessoa
  update public.admin_audit_logs l
     set detalhes = (coalesce(l.detalhes, '{}'::jsonb) - 'email' - 'motivo')
                    || jsonb_build_object('dados_pessoais', 'removidos')
   where (l.registro_id = p_user
          or l.registro_id = any (v_pedidos_excluidos)
          or l.registro_id = any (v_pedidos_anonimizados)
          or l.registro_id = any (v_chamados)
          or (v_email is not null and lower(l.detalhes ->> 'email') = v_email))
     and coalesce(l.detalhes ->> 'dados_pessoais', '') <> 'removidos'
     -- os registros da própria exclusão já nascem sem dado pessoal
     and l.acao not in ('conta_dados_removidos', 'conta_excluida', 'conta_exclusao_incompleta', 'pedido_excluido');
  get diagnostics v_registros = row_count;

  -- registra a limpeza (sem nome e sem e-mail: só o id da conta e a prefeitura, que é dado institucional)
  insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, de, para, detalhes)
  values (p_admin, p_admin_email, 'conta_dados_removidos', 'auth.users', p_user, null, 'dados pessoais removidos',
          jsonb_build_object(
            'prefeitura', v_prefeitura,
            'pedidos_excluidos', cardinality(v_pedidos_excluidos),
            'pedidos_anonimizados', cardinality(v_pedidos_anonimizados),
            'chamados_anonimizados', cardinality(v_chamados),
            'respostas_anonimizadas', v_respostas,
            'avisos_anonimizados', v_avisos,
            'registros_anonimizados', v_registros,
            'motivo_da_exclusao', v_motivo));

  return jsonb_build_object(
    'pedidos_excluidos', cardinality(v_pedidos_excluidos),
    'pedidos_anonimizados', cardinality(v_pedidos_anonimizados),
    'chamados_anonimizados', cardinality(v_chamados),
    'respostas_anonimizadas', v_respostas,
    'avisos_anonimizados', v_avisos,
    'registros_anonimizados', v_registros);
end;
$$;

-- ===================================================================================
-- 2) exclui UMA solicitação de acesso
-- pendente ou recusada: pode excluir
-- aprovada: só se a conta criada a partir dela não existir mais (senão a conta perde a origem)
-- ===================================================================================
create or replace function public.fgrcm_excluir_pedido(
  p_pedido uuid,
  p_admin uuid,
  p_admin_email text,
  p_motivo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pedido public.access_requests%rowtype;
  v_registros integer;
  v_motivo text := nullif(left(btrim(coalesce(p_motivo, '')), 500), '');
begin
  if not exists (select 1 from public.administradores a where a.user_id = p_admin and a.ativo) then
    raise exception 'sem_permissao' using errcode = 'P0001';
  end if;

  -- trava a linha (se duas pessoas da equipe excluírem ao mesmo tempo, a segunda espera)
  select * into v_pedido from public.access_requests r where r.id = p_pedido for update;
  if not found then
    raise exception 'pedido_nao_encontrado' using errcode = 'P0001';
  end if;

  if v_pedido.status = 'aprovado'
     and exists (select 1 from auth.users u where lower(u.email) = lower(v_pedido.email)) then
    raise exception 'pedido_de_conta_existente' using errcode = 'P0001';
  end if;

  delete from public.access_requests r where r.id = p_pedido;

  -- o histórico do pedido continua, mas sem o e-mail e sem o motivo
  update public.admin_audit_logs l
     set detalhes = (coalesce(l.detalhes, '{}'::jsonb) - 'email' - 'motivo')
                    || jsonb_build_object('dados_pessoais', 'removidos')
   where l.registro_id = p_pedido
     and coalesce(l.detalhes ->> 'dados_pessoais', '') <> 'removidos'
     and l.acao not in ('conta_dados_removidos', 'conta_excluida', 'conta_exclusao_incompleta', 'pedido_excluido');
  get diagnostics v_registros = row_count;

  insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, de, para, detalhes)
  values (p_admin, p_admin_email, 'pedido_excluido', 'access_requests', p_pedido, v_pedido.status, 'excluído',
          jsonb_build_object(
            'prefeitura', v_pedido.prefeitura,
            'municipio', v_pedido.municipio,
            'estado', v_pedido.estado,
            'registros_anonimizados', v_registros,
            'motivo_da_exclusao', v_motivo));

  return jsonb_build_object('status_anterior', v_pedido.status, 'registros_anonimizados', v_registros);
end;
$$;

-- só o servidor (admin-fgrcm, com a chave secreta) pode chamar
-- o app não tem permissão nenhuma de apagar: as regras de RLS das tabelas continuam iguais
revoke all on function public.fgrcm_email_removido(uuid) from public, anon, authenticated;
revoke all on function public.fgrcm_excluir_dados_da_conta(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.fgrcm_excluir_pedido(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.fgrcm_email_removido(uuid) to service_role;
grant execute on function public.fgrcm_excluir_dados_da_conta(uuid, uuid, text, text) to service_role;
grant execute on function public.fgrcm_excluir_pedido(uuid, uuid, text, text) to service_role;
