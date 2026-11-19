-- FGRC-M | testes da exclusão definitiva (migração 20261119140000_fgrcm_exclusao_definitiva.sql)
-- roda tudo dentro de uma transação e desfaz no fim (ROLLBACK): não apaga nem muda nenhum dado de verdade
-- as contas, pedidos e mensagens usados aqui são criados pelo próprio teste e somem no ROLLBACK
-- como rodar (depois de aplicar a migração): Supabase > SQL Editor > cole o arquivo inteiro > Run
-- cada linha mostra o teste, o que era esperado e o que aconteceu de verdade
begin;

create temp table resultado_teste (ordem serial, teste text, esperado text, obtido text) on commit drop;
grant all on resultado_teste to anon, authenticated, service_role;
grant usage on sequence resultado_teste_ordem_seq to anon, authenticated, service_role;

do $$
declare
  v_admin uuid := (select user_id from public.administradores where ativo limit 1);
  v_admin_email text := (select email from public.administradores where ativo limit 1);
  v_pessoa uuid := gen_random_uuid();   -- conta comum que vai ser excluída
  v_outra uuid := gen_random_uuid();    -- conta comum que continua existindo
  v_email text := 'exclusao.teste.fgrcm@gmail.com';
  v_email_outra text := 'continua.teste.fgrcm@gmail.com';
  p_aprovado uuid; p_recusado uuid; p_pendente uuid; p_outra uuid; p_solto uuid;
  c_logado uuid; c_sem_login uuid;
  r jsonb;
  n integer;
  txt text;
begin
  if v_admin is null then
    raise exception 'o teste precisa de pelo menos uma conta ativa em public.administradores';
  end if;

  -- ---------- dados de teste (somem no ROLLBACK) ----------
  insert into auth.users (id, email, raw_app_meta_data, email_confirmed_at)
  values (v_pessoa, v_email, '{"prefeitura":"Prefeitura Teste","municipio":"Teste","estado":"MG"}', now()),
         (v_outra, v_email_outra, '{"prefeitura":"Prefeitura Outra","municipio":"Outra","estado":"MG"}', now());

  -- pedidos da pessoa: um aprovado e um recusado (decididos pelo admin, passam pelos gatilhos e entram no histórico)
  insert into public.access_requests (nome, email, prefeitura, municipio, estado) values ('Pessoa Teste', v_email, 'Prefeitura Teste', 'Teste', 'MG') returning id into p_aprovado;
  update public.access_requests set status = 'aprovado', analisado_por = v_admin, analisado_por_email = v_admin_email where id = p_aprovado;
  insert into public.access_requests (nome, email, prefeitura, municipio, estado) values ('Pessoa Teste', v_email, 'Prefeitura Teste', 'Teste', 'MG') returning id into p_recusado;
  update public.access_requests set status = 'recusado', analisado_por = v_admin, analisado_por_email = v_admin_email, observacao = 'motivo com dado pessoal' where id = p_recusado;
  insert into public.access_requests (nome, email, prefeitura, municipio, estado) values ('Pessoa Teste', v_email, 'Prefeitura Teste', 'Teste', 'MG') returning id into p_pendente;
  -- pedido aprovado de outra pessoa que ainda tem conta
  insert into public.access_requests (nome, email, prefeitura, municipio, estado) values ('Outra Pessoa', v_email_outra, 'Prefeitura Outra', 'Outra', 'MG') returning id into p_outra;
  update public.access_requests set status = 'aprovado', analisado_por = v_admin, analisado_por_email = v_admin_email where id = p_outra;
  -- pedido pendente solto (sem conta), pra testar a exclusão de solicitação
  insert into public.access_requests (nome, email, prefeitura, municipio, estado) values ('Pedido Teste', 'pedido.solto.fgrcm@gmail.com', 'Prefeitura Solta', 'Solta', 'MG') returning id into p_solto;

  -- mensagens de suporte: uma logada e uma sem login com o mesmo e-mail, e uma resposta da equipe
  insert into public.support_requests (user_id, nome, email, assunto, mensagem) values (v_pessoa, 'Pessoa Teste', v_email, 'Outro assunto', 'mensagem logada com dado pessoal') returning id into c_logado;
  insert into public.support_requests (user_id, nome, email, assunto, mensagem) values (null, 'Pessoa Teste', v_email, 'Problema para entrar', 'mensagem sem login com dado pessoal') returning id into c_sem_login;
  insert into public.support_replies (chamado_id, texto) values (c_logado, 'Olá, Pessoa Teste! Resposta da equipe.');
  -- avisos por e-mail (tabela da migração 20261119130000): um do pedido aprovado e um do pendente
  insert into public.email_notificacoes (evento, pedido_id, destinatario, status) values ('pedido_aprovado', p_aprovado, v_email, 'enviado'), ('pedido_recebido', p_pendente, v_email, 'enviado');
  insert into public.admin_audit_logs (admin_id, admin_email, acao, tabela, registro_id, para, detalhes)
  values (v_admin, v_admin_email, 'conta_desativada', 'auth.users', v_pessoa, 'desativada', jsonb_build_object('email', v_email, 'motivo', 'teste'));

  -- outra conta de admin (criada só pro teste)
  insert into auth.users (id, email) values ('00000000-0000-4000-8000-00000000ad02', 'outro.admin.fgrcm@gmail.com');
  insert into public.administradores (user_id, email) values ('00000000-0000-4000-8000-00000000ad02', 'outro.admin.fgrcm@gmail.com');

  -- ---------- quem NÃO pode excluir ----------
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin
    perform public.fgrcm_excluir_pedido(p_solto, v_admin, v_admin_email, null);
    insert into resultado_teste (teste, esperado, obtido) values ('E01 visitante chama a exclusão de pedido', 'recusado', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E01 visitante chama a exclusão de pedido', 'recusado', 'recusado');
  end;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', v_outra, 'aal', 'aal1')::text, true);
  set local role authenticated;
  begin
    perform public.fgrcm_excluir_dados_da_conta(v_pessoa, v_admin, v_admin_email, null);
    insert into resultado_teste (teste, esperado, obtido) values ('E02 conta comum chama a exclusão de conta', 'recusado', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E02 conta comum chama a exclusão de conta', 'recusado', 'recusado');
  end;
  begin
    delete from public.access_requests where id = p_solto;
    get diagnostics n = row_count;
    insert into resultado_teste (teste, esperado, obtido) values ('E03 conta comum apaga pedido direto', 'recusado', n || ' linhas apagadas');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E03 conta comum apaga pedido direto', 'recusado', 'recusado');
  end;
  reset role;

  -- daqui pra baixo é o servidor (admin-fgrcm com a chave secreta)
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  set local role service_role;

  begin
    perform public.fgrcm_excluir_dados_da_conta(v_pessoa, v_outra, 'comum@teste', null);
    insert into resultado_teste (teste, esperado, obtido) values ('E04 servidor com quem não é admin', 'sem_permissao', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E04 servidor com quem não é admin', 'sem_permissao', sqlerrm);
  end;
  begin
    perform public.fgrcm_excluir_dados_da_conta(v_admin, v_admin, v_admin_email, null);
    insert into resultado_teste (teste, esperado, obtido) values ('E05 admin exclui a própria conta', 'propria_conta', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E05 admin exclui a própria conta', 'propria_conta', sqlerrm);
  end;
  begin
    perform public.fgrcm_excluir_dados_da_conta('00000000-0000-4000-8000-00000000ad02', v_admin, v_admin_email, null);
    insert into resultado_teste (teste, esperado, obtido) values ('E06 excluir conta de administração', 'conta_de_administracao', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E06 excluir conta de administração', 'conta_de_administracao', sqlerrm);
  end;

  -- ---------- exclusão dos dados da conta comum ----------
  r := public.fgrcm_excluir_dados_da_conta(v_pessoa, v_admin, v_admin_email, 'contas de teste');
  insert into resultado_teste (teste, esperado, obtido) values ('E07 contagem da limpeza',
    'pedidos 1 excluído e 2 anonimizados, 2 chamados, 1 resposta',
    'pedidos ' || (r ->> 'pedidos_excluidos') || ' excluído e ' || (r ->> 'pedidos_anonimizados') || ' anonimizados, '
      || (r ->> 'chamados_anonimizados') || ' chamados, ' || (r ->> 'respostas_anonimizadas') || ' resposta');

  select (select count(*) from public.access_requests where lower(email) = v_email)
       + (select count(*) from public.support_requests where lower(email) = v_email or user_id = v_pessoa)
       + (select count(*) from public.admin_audit_logs where lower(detalhes ->> 'email') = v_email or detalhes::text ilike '%' || v_email || '%')
       + (select count(*) from public.email_notificacoes where destinatario = v_email)
    into n;
  insert into resultado_teste (teste, esperado, obtido) values ('E08 e-mail da pessoa em pedidos, suporte, avisos ou histórico', '0', n::text);

  select format('%s / %s / %s', status, prefeitura, case when analisado_por_email is not null then 'com quem decidiu' else 'sem quem decidiu' end) into txt from public.access_requests where id = p_aprovado;
  insert into resultado_teste (teste, esperado, obtido) values ('E09 pedido aprovado continua como registro da decisão', 'aprovado / Prefeitura Teste / com quem decidiu', coalesce(txt, 'sumiu'));

  select count(*) into n from public.access_requests where id = p_pendente;
  insert into resultado_teste (teste, esperado, obtido) values ('E10 pedido pendente da pessoa foi apagado', '0', n::text);

  select format('%s / %s / %s', nome, mensagem, coalesce(user_id::text, 'sem conta')) into txt from public.support_requests where id = c_logado;
  insert into resultado_teste (teste, esperado, obtido) values ('E11 mensagem de suporte sem dados pessoais', 'Pessoa removida / [mensagem removida: conta excluída] / sem conta', txt);

  select texto into txt from public.support_replies where chamado_id = c_logado limit 1;
  insert into resultado_teste (teste, esperado, obtido) values ('E12 resposta da equipe sem o nome da pessoa', '[resposta removida: conta excluída]', txt);

  select count(*) into n from public.admin_audit_logs
   where registro_id in (v_pessoa, p_aprovado, p_recusado) and acao <> 'conta_dados_removidos' and detalhes ->> 'dados_pessoais' = 'removidos';
  insert into resultado_teste (teste, esperado, obtido) values ('E13 histórico continua, sem e-mail e sem motivo', '3', n::text);

  select count(*) into n from public.admin_audit_logs
   where acao = 'conta_dados_removidos' and registro_id = v_pessoa and admin_id = v_admin and detalhes ->> 'prefeitura' = 'Prefeitura Teste';
  insert into resultado_teste (teste, esperado, obtido) values ('E14 limpeza registrada no histórico', '1', n::text);

  r := public.fgrcm_excluir_dados_da_conta(v_pessoa, v_admin, v_admin_email, null);
  insert into resultado_teste (teste, esperado, obtido) values ('E15 rodar de novo não estraga nada', '0 0 0 0 0',
    concat_ws(' ', r ->> 'pedidos_excluidos', r ->> 'pedidos_anonimizados', r ->> 'chamados_anonimizados', r ->> 'respostas_anonimizadas', r ->> 'registros_anonimizados'));

  -- a admin-fgrcm apaga a conta depois (aqui simulado com delete direto em auth.users, como o Supabase faz)
  reset role;
  delete from auth.users where id = v_pessoa;
  set local role service_role;
  select count(*) into n from public.support_requests where id in (c_logado, c_sem_login);
  insert into resultado_teste (teste, esperado, obtido) values ('E16 conta apagada: mensagens continuam (sem dono)', '2', n::text);

  -- ---------- exclusão de solicitação ----------
  begin
    perform public.fgrcm_excluir_pedido(p_outra, v_admin, v_admin_email, null);
    insert into resultado_teste (teste, esperado, obtido) values ('E17 excluir pedido aprovado de conta que existe', 'pedido_de_conta_existente', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E17 excluir pedido aprovado de conta que existe', 'pedido_de_conta_existente', sqlerrm);
  end;

  r := public.fgrcm_excluir_pedido(p_solto, v_admin, v_admin_email, 'pedido de teste');
  select count(*) into n from public.access_requests where id = p_solto;
  insert into resultado_teste (teste, esperado, obtido) values ('E18 excluir pedido pendente', '0 / estava pendente', n || ' / estava ' || (r ->> 'status_anterior'));

  select count(*) into n from public.admin_audit_logs
   where acao = 'pedido_excluido' and registro_id = p_solto and detalhes ->> 'prefeitura' = 'Prefeitura Solta' and detalhes::text not ilike '%pedido.solto%';
  insert into resultado_teste (teste, esperado, obtido) values ('E19 exclusão do pedido no histórico, sem e-mail', '1', n::text);

  r := public.fgrcm_excluir_pedido(p_aprovado, v_admin, v_admin_email, null);
  insert into resultado_teste (teste, esperado, obtido) values ('E20 pedido aprovado depois que a conta foi apagada', 'aprovado', r ->> 'status_anterior');

  begin
    perform public.fgrcm_excluir_pedido(p_solto, v_admin, v_admin_email, null);
    insert into resultado_teste (teste, esperado, obtido) values ('E21 excluir pedido que não existe mais', 'pedido_nao_encontrado', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('E21 excluir pedido que não existe mais', 'pedido_nao_encontrado', sqlerrm);
  end;
  reset role;
end;
$$;

select ordem, teste, esperado, obtido,
       case when obtido = esperado or obtido like esperado || '%' then 'ok' else 'CONFERIR' end as resultado
  from resultado_teste
 order by ordem;

rollback;
