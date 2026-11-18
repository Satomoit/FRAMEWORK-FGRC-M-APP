-- FGRC-M | teste das regras novas: respostas do suporte, Meus chamados, manutenção, versões e sessões
-- roda TUDO dentro de uma transação que é desfeita no final (rollback): não sobra nenhum dado de teste
-- como rodar: Supabase > SQL Editor > New query > cole tudo > Run
-- ANTES DE RODAR: troque <ID_CONTA_COMUM> e <ID_CONTA_ADMIN> (Ctrl+H no SQL Editor) pelos ids de uma conta comum
-- de teste e de uma conta que esteja em public.administradores (Authentication > Users > clique na conta > User UID)
-- os ids reais não ficam no repositório (são contas de pessoas da equipe)
-- resultado esperado: nenhuma linha com "PERMITIU (ruim)"; contagens de pessoa comum = 0
-- executado em 18/11/2026 às 10:23 (horário de Brasília): todos os itens deram o esperado (docs/registro-de-testes-mvp.md, R29 a R50)
begin;
create temp table r (n int, teste text, resultado text) on commit drop;
grant all on r to authenticated, anon;

insert into public.support_requests (id, user_id, nome, email, assunto, mensagem)
values ('00000000-0000-4000-8000-0000000000a1', '<ID_CONTA_COMUM>', 'Teste A', 'teste.a@gmail.com', 'Outro assunto', 'mensagem de teste A para RLS'),
       ('00000000-0000-4000-8000-0000000000b2', null, 'Teste B', 'teste.b@gmail.com', 'Outro assunto', 'mensagem de teste B para RLS');

-- ===== sem login (anon) =====
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
insert into r select 1, 'anon chama estado_do_sistema (pode)', coalesce((public.estado_do_sistema_fgrcm('android'))::text, 'null');
do $$ begin perform public.meus_chamados_fgrcm(); insert into r values (2,'anon chama meus_chamados','PERMITIU (ruim)'); exception when others then insert into r values (2,'anon chama meus_chamados','bloqueado: '||sqlerrm); end $$;
do $$ begin perform * from public.support_replies; insert into r values (3,'anon le respostas','PERMITIU (ruim)'); exception when others then insert into r values (3,'anon le respostas','bloqueado: '||sqlerrm); end $$;
do $$ begin update public.sistema_status set manutencao_ativa = true where id = 1; insert into r values (4,'anon liga manutencao','PERMITIU (ruim)'); exception when others then insert into r values (4,'anon liga manutencao','bloqueado: '||sqlerrm); end $$;
do $$ begin perform public.fgrcm_encerrar_sessoes('<ID_CONTA_COMUM>'); insert into r values (5,'anon encerra sessoes','PERMITIU (ruim)'); exception when others then insert into r values (5,'anon encerra sessoes','bloqueado: '||sqlerrm); end $$;

-- ===== pessoa comum =====
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"<ID_CONTA_COMUM>","email":"comum@teste","aal":"aal1"}', true);
insert into r select 10, 'comum: meus chamados (só o a1)', (select string_agg(x->>'id', ',') from jsonb_array_elements(public.meus_chamados_fgrcm()) x where x->>'id' like '00000000-0000-4000-8000-0000000000%');
insert into r select 11, 'comum: campos devolvidos (sem e-mail de quem atendeu)', (select string_agg(k, ',' order by k) from jsonb_object_keys((select x from jsonb_array_elements(public.meus_chamados_fgrcm()) x where x->>'id' = '00000000-0000-4000-8000-0000000000a1')) k);
insert into r select 12, 'comum: le support_replies direto (linhas)', count(*)::text from public.support_replies;
do $$ begin insert into public.support_replies (chamado_id, texto) values ('00000000-0000-4000-8000-0000000000a1', 'resposta falsa'); insert into r values (13,'comum responde chamado','PERMITIU (ruim)'); exception when others then insert into r values (13,'comum responde chamado','bloqueado: '||sqlerrm); end $$;
with u as (update public.sistema_status set manutencao_ativa = true where id = 1 returning 1) insert into r select 14, 'comum liga manutencao (linhas afetadas)', count(*)::text from u;
with u as (update public.app_versoes set versao_minima = '9.9.9', versao_atual = '9.9.9' where plataforma = 'android' returning 1) insert into r select 15, 'comum muda versao (linhas afetadas)', count(*)::text from u;
insert into r select 16, 'comum le sistema_status direto (linhas)', count(*)::text from public.sistema_status;
do $$ begin perform public.fgrcm_encerrar_sessoes('<ID_CONTA_COMUM>'); insert into r values (17,'comum encerra sessoes','PERMITIU (ruim)'); exception when others then insert into r values (17,'comum encerra sessoes','bloqueado: '||sqlerrm); end $$;
insert into r select 18,'comum le chamado de outra pessoa direto (linhas)', count(*)::text from public.support_requests where id = '00000000-0000-4000-8000-0000000000b2';

-- ===== admin =====
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"<ID_CONTA_ADMIN>","email":"admin@teste","aal":"aal1"}', true);
do $$ begin insert into public.support_replies (chamado_id, texto, autor_email) values ('00000000-0000-4000-8000-0000000000a1', 'tentando forjar autor', 'falso@x.com'); insert into r values (19,'admin tenta forjar autor','PERMITIU (ruim)'); exception when others then insert into r values (19,'admin tenta forjar autor','bloqueado: '||sqlerrm); end $$;
insert into public.support_replies (chamado_id, texto) values ('00000000-0000-4000-8000-0000000000a1', '  Olá! Já verificamos e liberamos o acesso.  ');
insert into r select 20, 'admin respondeu: autor e texto', autor_email || ' / [' || texto || ']' from public.support_replies where chamado_id = '00000000-0000-4000-8000-0000000000a1';
insert into r select 21, 'admin respondeu: status do chamado', status || ' / atendido por ' || coalesce(atendido_por_email,'-') from public.support_requests where id = '00000000-0000-4000-8000-0000000000a1';
insert into r select 22, 'admin respondeu: auditoria', string_agg(acao, ',' order by id) from public.admin_audit_logs where registro_id = '00000000-0000-4000-8000-0000000000a1';
with u as (update public.sistema_status set manutencao_ativa = true, mensagem = 'Teste', plataformas = 'android' where id = 1 returning atualizado_por_email) insert into r select 23, 'admin liga manutencao (carimbo)', string_agg(atualizado_por_email, ',') from u;
do $$ begin update public.app_versoes set versao_minima = '2.0.0' where plataforma = 'android'; insert into r values (24,'admin minima > atual','PERMITIU (ruim)'); exception when others then insert into r values (24,'admin minima > atual','bloqueado: '||sqlerrm); end $$;
do $$ begin update public.app_versoes set url_atualizacao = 'http://exemplo.com/app.apk' where plataforma = 'android'; insert into r values (25,'admin url http','PERMITIU (ruim)'); exception when others then insert into r values (25,'admin url http','bloqueado: '||sqlerrm); end $$;
with u as (update public.app_versoes set versao_atual = '1.10.0', versao_minima = '1.9.0', obrigatoria = true, url_atualizacao = 'https://expo.dev/teste' where plataforma = 'android' returning 1) insert into r select 26, 'admin muda versao 1.10.0/min 1.9.0 (linhas)', count(*)::text from u;
insert into r select 27, 'auditoria do sistema', string_agg(acao, ',' order by id) from public.admin_audit_logs where tabela in ('sistema_status','app_versoes');

-- ===== pessoa comum de novo: vê a resposta e o estado novo =====
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"<ID_CONTA_COMUM>","email":"comum@teste","aal":"aal1"}', true);
insert into r select 30, 'comum ve resposta e historico', (select (x->'respostas')::text || ' | status=' || (x->>'status') || ' | hist=' || (x->'historico')::text from jsonb_array_elements(public.meus_chamados_fgrcm()) x where x->>'id' = '00000000-0000-4000-8000-0000000000a1');
insert into r select 31, 'estado android', public.estado_do_sistema_fgrcm('android')::text;
insert into r select 32, 'estado web (manutencao so android)', public.estado_do_sistema_fgrcm('web')::text;

reset role;
select n, teste, resultado from r order by n;
rollback;
