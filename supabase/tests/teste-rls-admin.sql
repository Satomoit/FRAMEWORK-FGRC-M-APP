-- FGRC-M | testes das regras de segurança (RLS) e dos gatilhos da área administrativa
-- roda tudo dentro de uma transação e desfaz no fim (ROLLBACK): não deixa nenhum dado no banco
-- como rodar: Supabase > SQL Editor > cole o arquivo inteiro > Run (o resultado é a tabela final)
-- cada linha mostra o teste, o que era esperado e o que aconteceu de verdade
begin;

create temp table resultado_teste (ordem serial, teste text, esperado text, obtido text) on commit drop;
grant all on resultado_teste to anon, authenticated;
grant usage on sequence resultado_teste_ordem_seq to anon, authenticated;

do $$
declare
  v_admin uuid := (select user_id from public.administradores where ativo limit 1);
  v_admin_email text := (select email from public.administradores where ativo limit 1);
  v_comum uuid := gen_random_uuid(); -- conta comum simulada (não é admin)
  pedido_id uuid;
  msg_id uuid;
  n integer;
  txt text;
  ok boolean;
begin
  -- ---------- visitante sem login (anon) ----------
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;

  begin
    insert into public.access_requests (nome, email, prefeitura, municipio, estado, plataforma)
    values ('Teste RLS', 'Teste.RLS@Gmail.com', 'Prefeitura Teste', 'Teste', 'MG', 'web');
    insert into resultado_teste (teste, esperado, obtido) values ('R01 visitante envia pedido de acesso', 'aceito', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R01 visitante envia pedido de acesso', 'aceito', 'recusado: ' || sqlerrm);
  end;

  begin
    select count(*) into n from public.access_requests;
    insert into resultado_teste (teste, esperado, obtido) values ('R02 visitante lista pedidos', 'recusado', 'conseguiu ver ' || n);
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R02 visitante lista pedidos', 'recusado', 'recusado');
  end;

  begin
    insert into public.access_requests (nome, email, prefeitura, municipio, estado, status)
    values ('Teste RLS', 'outro.rls@gmail.com', 'Prefeitura Teste', 'Teste', 'MG', 'aprovado');
    insert into resultado_teste (teste, esperado, obtido) values ('R03 visitante cria pedido já aprovado', 'recusado', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R03 visitante cria pedido já aprovado', 'recusado', 'recusado');
  end;

  begin
    insert into public.access_requests (nome, email, prefeitura, municipio, estado)
    values ('Teste RLS', 'teste.rls@gmail.com', 'Prefeitura Teste', 'Teste', 'MG');
    insert into resultado_teste (teste, esperado, obtido) values ('R04 segundo pedido pendente do mesmo e-mail', 'recusado', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R04 segundo pedido pendente do mesmo e-mail', 'recusado', 'recusado');
  end;

  begin
    select public.situacao_do_pedido('teste.rls@gmail.com') into txt;
    insert into resultado_teste (teste, esperado, obtido) values ('R05 visitante consulta situação do pedido', 'pendente', coalesce(txt, 'nada'));
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R05 visitante consulta situação do pedido', 'pendente', 'erro: ' || sqlerrm);
  end;

  begin
    insert into public.support_requests (nome, email, assunto, mensagem, plataforma)
    values ('Teste RLS', 'teste.rls@gmail.com', 'Erro no aplicativo', 'mensagem de teste das regras', 'android');
    insert into resultado_teste (teste, esperado, obtido) values ('R06 visitante envia mensagem de suporte', 'aceito', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R06 visitante envia mensagem de suporte', 'aceito', 'recusado: ' || sqlerrm);
  end;

  begin
    insert into public.support_requests (nome, email, assunto, mensagem)
    values ('Teste RLS', 'teste.rls@gmail.com', 'Erro no aplicativo', 'mensagem de teste das regras');
    insert into resultado_teste (teste, esperado, obtido) values ('R07 mesma mensagem enviada de novo', 'recusado (duplicada)', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R07 mesma mensagem enviada de novo', 'recusado (duplicada)', 'recusado: ' || sqlerrm);
  end;

  begin
    for n in 1..4 loop
      insert into public.support_requests (nome, email, assunto, mensagem)
      values ('Teste RLS', 'teste.rls@gmail.com', 'Outro assunto', 'mensagem número ' || n || ' do teste de limite');
    end loop;
    insert into public.support_requests (nome, email, assunto, mensagem)
    values ('Teste RLS', 'teste.rls@gmail.com', 'Outro assunto', 'sexta mensagem na mesma hora');
    insert into resultado_teste (teste, esperado, obtido) values ('R08 sexta mensagem do mesmo e-mail em 1 hora', 'recusado (limite)', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R08 sexta mensagem do mesmo e-mail em 1 hora', 'recusado (limite)', 'recusado: ' || sqlerrm);
  end;

  begin
    select count(*) into n from public.support_requests;
    insert into resultado_teste (teste, esperado, obtido) values ('R09 visitante lista mensagens de suporte', 'recusado', 'conseguiu ver ' || n);
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R09 visitante lista mensagens de suporte', 'recusado', 'recusado');
  end;

  begin
    select public.estado_admin_fgrcm() into txt;
    insert into resultado_teste (teste, esperado, obtido) values ('R10 visitante chama a checagem de admin', 'recusado', 'respondeu ' || txt);
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R10 visitante chama a checagem de admin', 'recusado', 'recusado');
  end;

  reset role;

  -- ---------- conta comum logada (não admin) ----------
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', v_comum, 'aal', 'aal1', 'email', 'comum@gmail.com')::text, true);
  set local role authenticated;

  select count(*) into n from public.access_requests;
  insert into resultado_teste (teste, esperado, obtido) values ('R11 conta comum lista pedidos', '0 linhas', n || ' linhas');

  select count(*) into n from public.support_requests;
  insert into resultado_teste (teste, esperado, obtido) values ('R12 conta comum lista suporte', '0 linhas', n || ' linhas');

  update public.access_requests set status = 'aprovado' where email = 'teste.rls@gmail.com';
  get diagnostics n = row_count;
  insert into resultado_teste (teste, esperado, obtido) values ('R13 conta comum tenta aprovar pedido', '0 linhas alteradas', n || ' linhas alteradas');

  select public.estado_admin_fgrcm() into txt;
  insert into resultado_teste (teste, esperado, obtido) values ('R14 conta comum: checagem de admin', 'nao_admin', txt);

  select count(*) into n from public.admin_audit_logs;
  insert into resultado_teste (teste, esperado, obtido) values ('R15 conta comum lê auditoria', '0 linhas', n || ' linhas');

  begin
    insert into public.administradores (user_id, email) values (v_comum, 'comum@gmail.com');
    insert into resultado_teste (teste, esperado, obtido) values ('R16 conta comum se coloca como admin', 'recusado', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R16 conta comum se coloca como admin', 'recusado', 'recusado');
  end;

  reset role;

  -- ---------- admin (sem verificação em 2 etapas cadastrada) ----------
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', v_admin, 'aal', 'aal1', 'email', v_admin_email)::text, true);
  set local role authenticated;

  select public.estado_admin_fgrcm() into txt;
  insert into resultado_teste (teste, esperado, obtido) values ('R17 admin: checagem de admin', 'ok', txt);

  select count(*) into n from public.access_requests where email = 'teste.rls@gmail.com';
  insert into resultado_teste (teste, esperado, obtido) values ('R18 admin vê o pedido enviado pelo visitante', '1', n::text);

  select id into pedido_id from public.access_requests where email = 'teste.rls@gmail.com';
  update public.access_requests set status = 'recusado', observacao = 'teste de recusa' where id = pedido_id;
  select (analisado_por = v_admin and analisado_em is not null) into ok from public.access_requests where id = pedido_id;
  insert into resultado_teste (teste, esperado, obtido) values ('R19 recusa grava quem decidiu e quando', 'true', coalesce(ok::text, 'nada'));

  select count(*) into n from public.admin_audit_logs l where l.registro_id = pedido_id and l.acao = 'pedido_recusado' and l.admin_id = v_admin;
  insert into resultado_teste (teste, esperado, obtido) values ('R20 recusa entra no histórico (auditoria)', '1', n::text);

  begin
    update public.access_requests set status = 'aprovado' where id = pedido_id;
    insert into resultado_teste (teste, esperado, obtido) values ('R21 decidir de novo um pedido já recusado', 'recusado', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R21 decidir de novo um pedido já recusado', 'recusado', 'recusado: ' || sqlerrm);
  end;

  select id into msg_id from public.support_requests where email = 'teste.rls@gmail.com' and assunto = 'Erro no aplicativo' limit 1;
  update public.support_requests set status = 'em_atendimento' where id = msg_id;
  update public.support_requests set status = 'resolvido' where id = msg_id;
  select (respondido_em is not null and atendido_por = v_admin) into ok from public.support_requests where id = msg_id;
  insert into resultado_teste (teste, esperado, obtido) values ('R22 suporte: em atendimento -> resolvido grava quem e quando', 'true', coalesce(ok::text, 'nada'));

  select count(*) into n from public.admin_audit_logs where registro_id = msg_id;
  insert into resultado_teste (teste, esperado, obtido) values ('R23 histórico do suporte tem as 2 mudanças', '2', n::text);

  begin
    update public.support_requests set mensagem = 'mensagem alterada' where id = msg_id;
    insert into resultado_teste (teste, esperado, obtido) values ('R24 admin altera o texto da mensagem da pessoa', 'recusado', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R24 admin altera o texto da mensagem da pessoa', 'recusado', 'recusado');
  end;

  begin
    insert into public.admin_audit_logs (acao, tabela) values ('falso', 'x');
    insert into resultado_teste (teste, esperado, obtido) values ('R25 admin escreve no histórico direto', 'recusado', 'aceito');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('R25 admin escreve no histórico direto', 'recusado', 'recusado');
  end;

  reset role;

  -- ---------- admin com verificação em 2 etapas cadastrada ----------
  -- (simula um fator verificado só dentro desta transação, que é desfeita no fim)
  insert into auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at)
  values (gen_random_uuid(), v_admin, 'teste', 'totp', 'verified', now(), now());

  set local role authenticated;
  select public.estado_admin_fgrcm() into txt;
  insert into resultado_teste (teste, esperado, obtido) values ('R26 admin com MFA, sessão sem o código (aal1)', 'precisa_mfa', txt);
  select count(*) into n from public.access_requests;
  insert into resultado_teste (teste, esperado, obtido) values ('R27 admin com MFA sem o código lista pedidos', '0 linhas', n || ' linhas');
  reset role;

  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', v_admin, 'aal', 'aal2', 'email', v_admin_email)::text, true);
  set local role authenticated;
  select public.estado_admin_fgrcm() into txt;
  insert into resultado_teste (teste, esperado, obtido) values ('R28 admin com MFA depois do código (aal2)', 'ok', txt);
  reset role;
end $$;

select ordem, teste, esperado, obtido from resultado_teste order by ordem;
rollback;
