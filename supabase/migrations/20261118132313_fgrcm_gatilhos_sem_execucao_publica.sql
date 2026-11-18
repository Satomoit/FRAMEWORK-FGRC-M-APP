-- FGRC-M | as funções de gatilho só rodam sozinhas (quando alguém grava na tabela)
-- [aplicada no Supabase em 18/11/2026 às 10:23 (horário de Brasília), versão 20261118132313]
-- ninguém precisa chamar elas pela API, então tira a permissão de chamar direto
-- (o verificador de segurança do Supabase apontava isso como aviso; os gatilhos continuam funcionando)
revoke execute on function public.fgrcm_antes_de_responder_chamado() from public, anon, authenticated;
revoke execute on function public.fgrcm_depois_de_responder_chamado() from public, anon, authenticated;
revoke execute on function public.fgrcm_carimbar_atualizacao() from public, anon, authenticated;
revoke execute on function public.fgrcm_registrar_mudanca_sistema() from public, anon, authenticated;
