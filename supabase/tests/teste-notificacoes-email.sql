-- FGRC-M | testes do registro dos avisos por e-mail (migração 20261119130000_fgrcm_notificacoes_email.sql)
-- não manda e-mail nenhum: só testa a tabela e as funções que evitam aviso repetido
-- roda dentro de uma transação e desfaz no fim (ROLLBACK)
-- como rodar (depois de aplicar a migração): Supabase > SQL Editor > cole o arquivo inteiro > Run
begin;

create temp table resultado_teste (ordem serial, teste text, esperado text, obtido text) on commit drop;
grant all on resultado_teste to anon, authenticated, service_role;
grant usage on sequence resultado_teste_ordem_seq to anon, authenticated, service_role;

do $$
declare
  v_admin uuid := (select user_id from public.administradores where ativo limit 1);
  v_comum uuid := gen_random_uuid();
  v_pedido uuid;
  n integer;
  txt text;
begin
  if v_admin is null then
    raise exception 'o teste precisa de pelo menos uma conta ativa em public.administradores';
  end if;
  insert into public.access_requests (nome, email, prefeitura, municipio, estado)
  values ('Aviso Teste', 'aviso.teste.fgrcm@gmail.com', 'Prefeitura Aviso', 'Aviso', 'MG') returning id into v_pedido;

  -- ---------- visitante e conta comum ----------
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin
    select count(*) into n from public.email_notificacoes;
    insert into resultado_teste (teste, esperado, obtido) values ('N01 visitante lê os avisos', 'recusado', 'viu ' || n);
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('N01 visitante lê os avisos', 'recusado', 'recusado');
  end;
  begin
    perform public.fgrcm_reservar_notificacao('pedido_recebido', v_pedido, 'x@gmail.com');
    insert into resultado_teste (teste, esperado, obtido) values ('N02 visitante reserva um aviso', 'recusado', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('N02 visitante reserva um aviso', 'recusado', 'recusado');
  end;
  reset role;

  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', v_comum, 'aal', 'aal1')::text, true);
  set local role authenticated;
  select count(*) into n from public.email_notificacoes;
  insert into resultado_teste (teste, esperado, obtido) values ('N03 conta comum lê os avisos', '0', n::text);
  begin
    insert into public.email_notificacoes (evento, pedido_id, destinatario, status) values ('pedido_recebido', v_pedido, 'x@gmail.com', 'enviado');
    insert into resultado_teste (teste, esperado, obtido) values ('N04 conta comum grava um aviso como enviado', 'recusado', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('N04 conta comum grava um aviso como enviado', 'recusado', 'recusado');
  end;
  reset role;

  -- ---------- servidor (funções notificacoes-fgrcm e admin-fgrcm) ----------
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  set local role service_role;
  txt := public.fgrcm_reservar_notificacao('pedido_recebido', v_pedido, 'Aviso.Teste.FGRCM@gmail.com');
  insert into resultado_teste (teste, esperado, obtido) values ('N05 primeira reserva', 'reservado', txt);
  txt := public.fgrcm_reservar_notificacao('pedido_recebido', v_pedido, 'aviso.teste.fgrcm@gmail.com');
  insert into resultado_teste (teste, esperado, obtido) values ('N06 segunda chamada enquanto envia (não duplica)', 'em_andamento', txt);

  perform public.fgrcm_concluir_notificacao('pedido_recebido', v_pedido, 'falhou', 'smtp', null, 'conexao_recusada');
  txt := public.fgrcm_reservar_notificacao('pedido_recebido', v_pedido, 'aviso.teste.fgrcm@gmail.com');
  select format('%s / tentativas %s', txt, tentativas) into txt from public.email_notificacoes where pedido_id = v_pedido and evento = 'pedido_recebido';
  insert into resultado_teste (teste, esperado, obtido) values ('N07 falhou: pode tentar de novo', 'reservado / tentativas 2', txt);

  perform public.fgrcm_concluir_notificacao('pedido_recebido', v_pedido, 'enviado', 'smtp', 'id-123', null);
  txt := public.fgrcm_reservar_notificacao('pedido_recebido', v_pedido, 'aviso.teste.fgrcm@gmail.com');
  insert into resultado_teste (teste, esperado, obtido) values ('N08 já enviado: não manda de novo', 'ja_enviado', txt);

  select format('%s / %s / %s', status, destinatario, case when enviado_em is not null then 'com horário' else 'sem horário' end) into txt from public.email_notificacoes where pedido_id = v_pedido and evento = 'pedido_recebido';
  insert into resultado_teste (teste, esperado, obtido) values ('N09 registro do envio confirmado', 'enviado / aviso.teste.fgrcm@gmail.com / com horário', txt);

  begin
    perform public.fgrcm_concluir_notificacao('pedido_recebido', v_pedido, 'qualquer', null, null, null);
    insert into resultado_teste (teste, esperado, obtido) values ('N10 situação inventada', 'status_invalido', 'PERMITIU');
  exception when others then
    insert into resultado_teste (teste, esperado, obtido) values ('N10 situação inventada', 'status_invalido', sqlerrm);
  end;
  reset role;

  -- ---------- administração ----------
  perform set_config('request.jwt.claims', json_build_object('role', 'authenticated', 'sub', v_admin, 'aal', 'aal2')::text, true);
  set local role authenticated;
  select count(*) into n from public.email_notificacoes where pedido_id = v_pedido;
  insert into resultado_teste (teste, esperado, obtido) values ('N11 administração vê a situação do aviso', '1', n::text);
  reset role;

  delete from public.access_requests where id = v_pedido;
  select count(*) into n from public.email_notificacoes where pedido_id = v_pedido;
  insert into resultado_teste (teste, esperado, obtido) values ('N12 pedido apagado leva o aviso junto', '0', n::text);
end;
$$;

select ordem, teste, esperado, obtido,
       case when obtido = esperado then 'ok' else 'CONFERIR' end as resultado
  from resultado_teste
 order by ordem;

rollback;
