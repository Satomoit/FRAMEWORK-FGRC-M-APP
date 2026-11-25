# Arquitetura, segurança e dados do MVP FGRC-M

**Versão do documento:** 18/11/2026
**Branch:** `integracao/revisao-geral`
**Escopo:** como o aplicativo está montado hoje, onde cada dado fica guardado, quem pode ver o quê e como funciona a área administrativa.

> Este documento descreve o que está implementado no código e no projeto Supabase nesta data. O que ainda não existe está marcado como pendência e listado em `docs/pendencias-limitacoes-e-sugestoes.md`.

---

## 1. Visão geral

| Camada | Tecnologia | O que faz |
|---|---|---|
| Aplicativo | Expo SDK 58, React Native 0.88, TypeScript, Expo Router | Telas P01 a P11, questionário, cálculo, relatório PDF, preferências |
| Armazenamento no aparelho | AsyncStorage (no navegador: `localStorage`) | Rascunho, histórico de avaliações, preferências, tutorial visto |
| Autenticação | Supabase Auth (e-mail e senha, PKCE, MFA por aplicativo autenticador) | Login, sessão, recuperação e troca de senha, convite |
| Banco de dados | Supabase Postgres com RLS | Pedidos de acesso, mensagens de suporte, administradores, histórico de decisões |
| Funções do servidor | Supabase Edge Function `admin-fgrcm` (Deno) | Operações que precisam da chave secreta: criar conta ao aprovar, listar e desativar contas |
| PDF | `pdf-lib` (navegador) e `expo-print` + `expo-sharing` (celular) | Gera o relatório no próprio aparelho |

O aplicativo **não** tem servidor próprio. Tudo que é sensível (permissões, criação de contas) é decidido pelo banco (RLS) ou pela função `admin-fgrcm`. O aplicativo só usa a chave **publicável** do Supabase. A chave secreta (`service_role`) existe apenas dentro da função do servidor.

## 2. Organização do código

| Pasta | Conteúdo | Autoria |
|---|---|---|
| `src/app/` | Rotas (cada arquivo é um endereço). Ligam as telas aos dados reais | Integração, com rotas originais de integrantes (`explore.tsx`, `solicitar-acesso.tsx`, `revisar-avaliacao.tsx`, `avaliacao-finalizada.tsx`, `editar-perfil.tsx`, `alteracoes-salvas.tsx`) |
| `src/features/p01` a `p11` | Telas de cada integrante | Integrantes; alterações de integração marcadas com `[integração]` nos comentários |
| `src/features/admin/` | Área administrativa (login próprio, MFA, abas) | Integração |
| `src/features/integracao/` | Tutorial e modo de revisão local | Integração |
| `src/components/` | Barra de navegação, cores, botões e campos | Misto (marcado nos comentários) |
| `src/lib/` | Regras sem tela: Supabase, conta, senha, e-mail, armazenamento local, avaliações, cálculo, Home, admin | Integração |
| `supabase/migrations/` | Migrações versionadas, na ordem em que foram aplicadas | Integração |
| `supabase/functions/` | Funções do servidor | Integração |
| `supabase/tests/` | Teste das regras de segurança (roda em transação e desfaz tudo) | Integração |
| `tests/` | Testes automáticos de comportamento (`npm test`) | Integração |

Os arquivos `supabase/fgrcm-p02-pedidos-de-acesso.sql`, `supabase/fgrcm-suporte.sql` e `supabase/fgrcm-admin.sql` são as versões soltas que foram usadas antes das migrações. O conteúdo deles está em `supabase/migrations/2026111803*` e eles podem ser removidos do repositório (ver pendências).

## 3. Onde cada dado fica (local × nuvem)

Requisitos RNF-001 e RNF-002: as respostas e os resultados das avaliações não podem sair do aparelho.

| Dado | Onde fica | Sai do aparelho? |
|---|---|---|
| Respostas do questionário (rascunho) | AsyncStorage, chave `fgrcm:p03:rascunho:v2:<id da conta>` | Não |
| Avaliações finalizadas (respostas, alternativas, recomendações, prefeitura, data) | AsyncStorage, chave `fgrcm:avaliacoes-concluidas:v2:<id da conta>` | Não |
| Resultados, índices e recomendações | Calculados no aparelho a cada abertura (`src/lib/calcular-relatorio.ts`) | Não |
| Relatório PDF | Gerado no aparelho; o usuário baixa ou compartilha | Só se o usuário compartilhar |
| Preferências (tema, texto, contraste) e tutorial visto | AsyncStorage | Não |
| Sessão de login | AsyncStorage (gerenciada pelo Supabase) | Não (ver RNF-005 nas pendências) |
| Conta: nome, e-mail, prefeitura, município, estado | Supabase Auth (`user_metadata` e `app_metadata`) | Sim, necessário para o login |
| Senha | Supabase Auth (guardada com hash; o app nunca guarda) | Sim (só no login) |
| Pedido de acesso | Tabela `access_requests` | Sim |
| Mensagem de suporte | Tabela `support_requests` | Sim |
| Resposta da equipe ao suporte (versão 1.1.0) | Tabela `support_replies`; a pessoa lê pela função `meus_chamados_fgrcm` | Sim (escrita pela administração) |
| Manutenção e versões do app (versão 1.1.0) | Tabelas `sistema_status` e `app_versoes`; o app lê pela função `estado_do_sistema_fgrcm` | Não sai nada do aparelho: o app só pergunta |
| Pasta escolhida para salvar o PDF (Android) | AsyncStorage, chave `fgrcm:pdf:ultima-pasta` | Não |
| Decisões da administração | Tabela `admin_audit_logs` | Sim |
| Registros técnicos do login (data, hora, IP e tipo de navegador ou aparelho) | Tabelas de sessão e de auditoria do Supabase Auth | Sim, gerados pelo serviço de login |
| Registro dos avisos por e-mail (destino, data e resultado) | Tabela `email_notificacoes` | Sim |
| Aceite dos Termos de Uso (versão e data e hora) | Supabase Auth, `user_metadata` (`termos_aceitos_versao` e `termos_aceitos_em`) | Sim, gravado na ativação da conta |

**Onde o servidor fica.** O projeto do Supabase está na região `ca-central-1` (Canadá), conferido em 25/11/2026. Os dados de conta, pedido de acesso e suporte ficam, portanto, fora do Brasil. A tela Privacidade e termos informa isso (seção 6 da Política) e a decisão sobre manter ou mudar a região está em `privacidade-e-termos-25-11-2026.md`, seção 6.

**Cópia de segurança do Android.** "Não sai do aparelho" quer dizer que o app não envia. O `app.json` não desliga o backup automático do Android, então o sistema pode incluir os dados guardados pelo app na cópia de segurança da conta Google do dono do aparelho. A política avisa disso (seção 3) e a decisão de desligar o backup no próximo APK está em `privacidade-e-termos-25-11-2026.md`, seção 6, ponto 6.

Verificação no código: nenhum arquivo envia `respostas`, `avaliacoes` ou o histórico ao Supabase. As únicas gravações no banco feitas pelo app são `access_requests` (pedido), `support_requests` (suporte e mudança de status pela administração) e as chamadas à função `admin-fgrcm`.

Cada conta tem o seu espaço no aparelho. Uma segunda conta no mesmo aparelho não vê as avaliações da primeira (teste automático `teste-armazenamento-por-conta`).

## 4. Modelo de dados (Supabase)

### 4.1 `public.access_requests` (pedidos de acesso)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid | chave |
| `nome`, `email`, `prefeitura`, `municipio`, `estado` | texto | preenchidos pelo formulário P02, com limites de tamanho e formato de e-mail |
| `status` | texto | `pendente`, `aprovado` ou `recusado` |
| `criado_em` | data e hora | automático |
| `analisado_em`, `analisado_por`, `analisado_por_email` | | preenchidos na decisão (gatilho) |
| `observacao` | texto | motivo da recusa |
| `plataforma` | texto | `web`, `android` ou `ios` |

Regras: só um pedido **pendente** por e-mail; o visitante só consegue **inserir** (não lê, não altera); um pedido decidido não pode ser decidido de novo (`pedido_ja_analisado`).

### 4.2 `public.support_requests` (mensagens de suporte)

| Coluna | Observação |
|---|---|
| `id`, `user_id` (quem estava logado, ou vazio) | |
| `nome`, `email`, `assunto` (lista fixa), `mensagem` (10 a 1500 caracteres) | |
| `status` | `aberto`, `em_atendimento` ou `resolvido` |
| `criado_em`, `atualizado_em`, `respondido_em` | `respondido_em` é preenchido ao marcar como resolvida |
| `atendido_por`, `atendido_por_email` | preenchidos pelo gatilho na mudança de status |
| `observacao`, `plataforma` | |

A administração só pode mudar `status` e `observacao`. O texto enviado pela pessoa não pode ser alterado.

### 4.3 `public.administradores`

| Coluna | Observação |
|---|---|
| `user_id` | conta do Supabase Auth |
| `email`, `ativo`, `criado_em`, `observacao` | |

Ninguém consegue inserir ou alterar esta tabela pelo app ou pela API. Ela só muda pelo SQL Editor do painel do Supabase.

### 4.4 `public.admin_audit_logs` (histórico)

`id`, `criado_em`, `admin_id`, `admin_email`, `acao` (ex.: `pedido_recusado`, `suporte_resolvido`, `conta_desativada`), `tabela`, `registro_id`, `de`, `para`, `detalhes`.
Só a administração lê. Ninguém escreve direto: as linhas são criadas pelos gatilhos do banco ou pela função `admin-fgrcm`.

### 4.4.1 Tabelas da versão 1.1.0

| Tabela | Colunas principais | Quem lê | Quem escreve |
|---|---|---|---|
| `support_replies` | `chamado_id`, `texto`, `autor_id`, `autor_email`, `criado_em` | Administração; a pessoa só pelas suas chamadas em `meus_chamados_fgrcm()` | Administração (só `chamado_id` e `texto`; autor e horário o banco grava) |
| `sistema_status` (uma linha) | `manutencao_ativa`, `mensagem`, `previsao_retorno`, `plataformas`, carimbo de quem mudou | Administração; todos pela `estado_do_sistema_fgrcm()` | Administração |
| `app_versoes` (uma linha por plataforma) | `versao_atual`, `versao_minima`, `obrigatoria`, `url_atualizacao` (só `https`), `mensagem`, `notas`, `publicada_em`, carimbo | Administração; todos pela `estado_do_sistema_fgrcm()` | Administração |

Detalhes de funcionamento: `docs/manutencao-atualizacao-suporte-pdf.md`.

### 4.4.2 Tabela de 19/11/2026 (aplicada no Supabase em 19/11)

| Tabela | Colunas principais | Quem lê | Quem escreve |
|---|---|---|---|
| `email_notificacoes` | `evento` (`pedido_recebido`, `pedido_aprovado`), `pedido_id` (apaga junto com o pedido), `destinatario`, `status` (`enviando`, `enviado`, `falhou`, `nao_configurado`), `tentativas`, `provedor`, `id_no_provedor`, `erro` (até 200 caracteres), datas. Uma linha por evento e pedido | Só a administração (RLS com `e_admin_fgrcm`) | Só o servidor, pelas funções `fgrcm_reservar_notificacao` e `fgrcm_concluir_notificacao` |

Detalhes: `docs/configurar-email-gmail-supabase.md` (Parte 7) e `docs/melhorias-19-11-2026.md`.

### 4.5 Funções do banco

| Função | Quem pode chamar | O que faz |
|---|---|---|
| `e_admin_fgrcm()` | contas logadas | Usada nas regras RLS: verdadeiro se a conta está em `administradores`, ativa, e (sessão `aal2` ou sem MFA cadastrado) |
| `estado_admin_fgrcm()` | contas logadas | Devolve `nao_admin`, `precisa_mfa` ou `ok` |
| `situacao_do_pedido(email)` | qualquer pessoa | Devolve só o status do pedido mais recente daquele e-mail (nenhum outro dado) |
| `fgrcm_limitar_envios()` | gatilho | Limites contra spam (ver 5.4) |
| `fgrcm_antes_de_decidir_pedido()` e `fgrcm_registrar_decisao_pedido()` | gatilho | Preenchem quem decidiu e gravam o histórico |
| `fgrcm_antes_de_atualizar_suporte()` e `fgrcm_registrar_status_suporte()` | gatilho | Preenchem quem atendeu e gravam o histórico |
| `meus_chamados_fgrcm()` | contas logadas | Devolve só os chamados da própria conta (pelo token, sem receber id), com respostas e histórico, sem dados internos |
| `estado_do_sistema_fgrcm(plataforma)` | qualquer pessoa | Diz se há manutenção para a plataforma e a configuração de versão (só dados públicos) |
| `fgrcm_encerrar_sessoes(user)` | só o servidor (`service_role`) | Apaga as sessões abertas de uma conta desativada |
| `fgrcm_antes_de_responder_chamado()`, `fgrcm_depois_de_responder_chamado()`, `fgrcm_carimbar_atualizacao()`, `fgrcm_registrar_mudanca_sistema()` | gatilho (não podem ser chamadas pela API) | Autor e horário das respostas, chamado para "em atendimento", carimbo de quem mudou manutenção/versão e histórico |
| `fgrcm_reservar_notificacao()`, `fgrcm_concluir_notificacao()` (19/11) | só o servidor (`service_role`) | Reservam o envio de um aviso por e-mail (devolve `reservado`, `ja_enviado` ou `em_andamento`) e gravam o resultado. Um envio travado há mais de 10 minutos ou que falhou pode ser tentado de novo |
| `fgrcm_excluir_dados_da_conta()`, `fgrcm_excluir_pedido()`, `fgrcm_email_removido()` (19/11) | só o servidor (`service_role`) | Exclusão definitiva: apagam ou anonimizam os dados da pessoa numa transação só, conferem de novo que quem pede é administração ativa e recusam conta de administração e a própria conta (política em `docs/melhorias-19-11-2026.md`) |

### 4.6 Migrações (na ordem)

| Arquivo | Conteúdo |
|---|---|
| `20261118033656_fgrcm_pedidos_de_acesso.sql` | Tabela de pedidos, RLS de inserção, um pendente por e-mail |
| `20261118033659_fgrcm_suporte.sql` | Tabela de suporte, RLS de inserção |
| `20261118033712_fgrcm_admin.sql` | Primeira versão da permissão de admin (por `app_metadata`), substituída pela seguinte |
| `20261118042102_fgrcm_admin_auditoria.sql` | Tabela `administradores`, regra de MFA, auditoria, status novos do suporte, limites de envio, `situacao_do_pedido` |

| `20261118132205_fgrcm_chamados_manutencao_versoes.sql` | `support_replies`, `meus_chamados_fgrcm`, `sistema_status`, `app_versoes`, `estado_do_sistema_fgrcm` e gatilhos |
| `20261118132211_fgrcm_encerrar_sessoes_ao_desativar.sql` | `fgrcm_encerrar_sessoes` |
| `20261118132313_fgrcm_gatilhos_sem_execucao_publica.sql` | Tira a execução pela API das funções de gatilho |
| `20261119130000_fgrcm_notificacoes_email.sql` (aplicada em 19/11) | `email_notificacoes` e as funções de reserva e conclusão dos avisos |
| `20261119140000_fgrcm_exclusao_definitiva.sql` (aplicada em 19/11) | Funções da exclusão definitiva (não cria tabela e não apaga nada sozinha) |

As sete migrações estão aplicadas no projeto Supabase do grupo. Nenhuma delas apaga dados. (A quarta foi registrada no Supabase como `20261118042102`; o arquivo com o nome antigo `20261118050000_...` é renomeado com `git mv` no commit de arrumação.)

## 5. Autenticação e autorização

### 5.1 Contas comuns (prefeituras)

1. A pessoa envia o pedido (P02). Ele entra como `pendente`.
2. A administração aprova na área administrativa. A função `admin-fgrcm` cria a conta:
   - **senha provisória** (padrão): a conta é criada já confirmada, com uma senha sorteada no servidor (ex.: `Fgrc#4821kmtq`), mostrada uma única vez para a administração. No primeiro acesso o app obriga a trocar (`senha_provisoria` no `user_metadata`).
   - **código por e-mail**: o Supabase envia o convite (precisa do SMTP configurado). A pessoa usa **Ativar acesso** com o código.
3. Prefeitura, município e estado vão para o `app_metadata`, que o usuário não consegue alterar. Nome fica no `user_metadata` (editável no perfil).
4. Login com e-mail e senha (`signInWithPassword`). Sessão com PKCE.
5. Senha forte exigida em todo lugar que cria ou troca senha: 10 ou mais caracteres, letra maiúscula, letra minúscula, número e símbolo (`src/lib/politica-senha.ts`).
6. Recuperação de senha por link (P07/P08) e troca com confirmação da senha atual (P11).

### 5.2 Administração

| Regra | Como é garantida |
|---|---|
| Quem é admin | Linha ativa em `public.administradores`. Não usa `user_metadata` (editável pelo usuário) |
| Ninguém vira admin pelo app | A tabela não tem permissão de escrita pela API (teste R16) |
| Conta comum não vê pedidos nem suporte | RLS com `e_admin_fgrcm()` (testes R11, R12, R15) |
| Conta comum não aprova | RLS (R13) e conferência dentro da função `admin-fgrcm` |
| Verificação em duas etapas | Opcional por conta. Quem cadastrou o aplicativo autenticador só tem permissão com sessão `aal2` (R26 a R28) |
| Chave secreta | Só dentro da função `admin-fgrcm`. Nunca no app nem no repositório |
| Senha fixa ou compartilhada | Não existe. Cada admin usa a própria conta do Supabase Auth |
| Histórico | Toda decisão grava quem decidiu e quando (R19, R20, R22, R23) |

**Rota:** `/admin`. Não aparece em nenhum menu. No navegador se acessa pelo endereço; no celular, pelo link discreto "Área da administração" no pé da tela de Login. A tela tem login próprio. Se uma conta comum entrar por ali, o app encerra a sessão e mostra "Esta conta não tem acesso à área administrativa".

**Abas do painel:**
- **Solicitações de acesso:** filtros Pendentes, Aprovadas, Recusadas e Todas; pesquisa por nome, e-mail, prefeitura ou município; ordem por data; detalhes; aprovar (senha provisória ou código por e-mail); recusar com motivo; histórico.
- **Mensagens de suporte:** filtros Aguardando, Em atendimento, Resolvidas e Todas; pesquisa; detalhes; responder por e-mail; mudar status; reabrir; histórico.
- **Contas:** nome, e-mail, prefeitura, município, estado, criação, último acesso, situação; desativar e reativar (contas de admin só pelo painel do Supabase).
- **Segurança:** cadastrar e remover o aplicativo autenticador (MFA).

**Como tornar outra conta administradora (pelo painel, uma vez):**
SQL Editor > New query:
```sql
insert into public.administradores (user_id, email)
select id, email from auth.users where email = 'email.da.pessoa@exemplo.gov.br';
```
Para tirar a permissão: `update public.administradores set ativo = false where email = '...';`

### 5.3 Função do servidor `admin-fgrcm`

| Ação | O que faz |
|---|---|
| `aprovar` (`modo` = `senha` ou `convite`) | Cria a conta e marca o pedido como aprovado |
| `recusar` | Marca como recusado com o motivo |
| `novo_acesso` (`modo` = `codigo`, `senha` ou `email`) | Novo código, nova senha provisória ou código por e-mail para quem perdeu o acesso |
| `listar_usuarios` | Lista as contas do Supabase Auth |
| `desativar_usuario` / `reativar_usuario` | Bloqueia ou libera o login da conta (não vale para admins nem para a própria conta). Desde a versão 3 da função, desativar também encerra as sessões abertas |
| `reenviar_aviso` (versão 4) | Tenta de novo o aviso por e-mail de um pedido (sem duplicar o que já foi enviado) |
| `excluir_usuario` (versão 4) | Exclusão definitiva da conta. Exige a palavra `EXCLUIR` e o e-mail certo da conta; recusa admins e a própria conta. Bloqueia o login, encerra sessões, anonimiza o banco e apaga a conta do Auth. Se a última parte falhar, devolve `parcial: true` e pode ser repetida |
| `excluir_pedido` (versão 4) | Apaga uma solicitação (exige `EXCLUIR`). Recusa pedido aprovado cuja conta ainda existe (nesse caso, excluir a conta) |

A versão 4 foi publicada em 19/11. Ela usa `supabase/functions/_shared/email-fgrcm.ts`, então uma nova publicação é pelo terminal (`npx supabase functions deploy admin-fgrcm`), não colando no painel.

### 5.3.1 Função do servidor `notificacoes-fgrcm` (publicada em 19/11)

Pública (sem login, porque quem pede acesso ainda não tem conta). Só aceita o evento `pedido_recebido` com um e-mail e só envia se existir um pedido **pendente** desse e-mail criado nos últimos 15 minutos. Não devolve nenhum dado do pedido, só a situação do envio.

Antes de qualquer ação, a função chama `estado_admin_fgrcm()` com o token da própria pessoa. Se a resposta não for `ok`, devolve 401 ou 403.
A função antiga `aprovar-pedido` foi substituída por uma versão que só responde 410 (desativada) e pode ser apagada no painel.

### 5.4 Proteção dos formulários públicos

| Formulário | Limite |
|---|---|
| Suporte | Mesma mensagem em 10 minutos é recusada (`mensagem_duplicada`); no máximo 5 por hora por e-mail e 20 por minuto no total (`limite_de_envios`) |
| Pedido de acesso | No máximo 3 por e-mail em 24 horas e 20 por minuto no total; um pendente por e-mail |

O app mostra mensagens simples para cada caso.

## 6. Fluxos ponta a ponta

**Pedido de acesso:** Login > Solicitar acesso > Solicitação enviada (status Em análise) > administração aprova > pessoa recebe a senha provisória ou o código > Login (ou Ativar acesso) > troca a senha > Home.
A pessoa pode consultar a situação em Login > "Já fez o pedido? Ver situação".

**Suporte:** Login > "Falar com o suporte" (ou Mais > Ajuda e suporte) > mensagem gravada > administração vê em Mensagens de suporte > marca Em atendimento > responde por e-mail > marca Resolvida.

**Avaliação:** Home > Avaliações > Iniciar > responde as 32 perguntas (salva sozinho no aparelho) > pode sair e continuar depois > Revisar (mostra as pendentes) > Finalizar (só com tudo respondido) > Resultados > Relatórios > Recomendações > PDF.

## 7. Configurações do Supabase que dependem do painel

Nenhuma delas pede senha ou chave no chat. Onde clicar está em `docs/pendencias-limitacoes-e-sugestoes.md`, seção "Configurações no painel".

- SMTP próprio (para o modo "código por e-mail" e recuperação de senha para qualquer endereço).
- Modelos de e-mail com `{{ .Token }}` (convite e código).
- Redirect URLs (link de recuperação de senha).
- Proteção contra senhas vazadas (aviso do Security Advisor).
- Apagar a função antiga `aprovar-pedido`.
