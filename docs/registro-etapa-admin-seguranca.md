# Registro de alterações: área administrativa, segurança e requisitos (18/11/2026)

**Branch:** `integracao/revisao-geral`
**Responsável:** integração (Josiane), com apoio do Claude (IA). Revisão e commits feitos pela responsável.
**Backups dos arquivos antes da mudança:** `C:\Projetos\backup-fgrcm-B1c-P11\antes-admin-separada\` e `C:\Projetos\backup-fgrcm-B1c-P11\antes-rf003-nome-home\` (fora do repositório).
**Continuação de:** `docs/registro-refatoracao-integracao.md`.

Legenda da coluna "Original": de quem é o arquivo. Nos arquivos de integrantes, a mudança foi a menor possível e está marcada com `[integração]` no comentário.

## 1. Problemas encontrados e correções

| # | Problema encontrado | Arquivo | Original | O que foi feito | Teste | Resultado |
|---|---|---|---|---|---|---|
| 1 | Admin era decidido pelo `app_metadata.fgrcm_papel`, com a regra repetida no app, no SQL e na função | `supabase/migrations/20261118050000_fgrcm_admin_auditoria.sql`, `src/lib/conta.ts` | Integração | Tabela `administradores` (sem escrita pela API) e funções `e_admin_fgrcm` e `estado_admin_fgrcm`. `eAdmin` saiu do app | R11–R17, F09 | Aprovado |
| 2 | Área administrativa ficava no menu Mais e sem login próprio | `src/app/admin.tsx`, `src/features/admin/*` (novos), `MenuMaisScreen.tsx`, `src/app/mais.tsx` | Integração (`admin.tsx`); P09 (`MenuMaisScreen`) | Rota `/admin` separada, com login próprio, MFA, abas de solicitações, suporte, contas e segurança. Item Administração tirado do Mais (só as linhas que a integração tinha colocado) | CT23, CT24 (manuais) | Não executado |
| 3 | Sem registro de quem decidiu cada pedido nem histórico | Migração `20261118050000` | Integração | Colunas `analisado_por`, `analisado_por_email`, tabela `admin_audit_logs` e gatilhos | R19–R23, R25 | Aprovado |
| 4 | Pedido já decidido podia ser decidido de novo | Migração `20261118050000` | Integração | Gatilho recusa (`pedido_ja_analisado`) | R21 | Aprovado |
| 5 | Suporte só tinha "aberto/respondido/fechado", sem "em atendimento" e sem histórico | Migração `20261118050000`, `src/features/admin/AbaSuporte.tsx` | Integração | Status `aberto`, `em_atendimento`, `resolvido`; quem atendeu e quando; histórico | R22–R24 | Aprovado |
| 6 | Formulários públicos sem proteção contra envio repetido | Migração `20261118050000`, `src/app/suporte.tsx`, `src/app/solicitar-acesso.tsx` | Integração (`suporte`); P02 Liz (`solicitar-acesso`) | Limites no banco e mensagens simples no app. Na tela da Liz entrou só o envio da plataforma e uma mensagem de erro | R07, R08 | Aprovado (banco); tela: CT05, CT29 não executados |
| 7 | Função `aprovar-pedido` conferia admin pelo `app_metadata` e usava status antigo | `supabase/functions/admin-fgrcm/index.ts` (nova), `supabase/functions/aprovar-pedido/index.ts` | Integração | Nova função `admin-fgrcm` (aprovar, recusar, listar, desativar e reativar contas) que pergunta ao banco se a pessoa é admin. A antiga responde 410 | F01–F03 | Aprovado |
| 8 | Scripts SQL soltos, sem versão | `supabase/migrations/*` | Integração | As três migrações já aplicadas foram salvas com o número de versão do Supabase, mais a nova | Conferido com a lista de migrações do projeto | Aprovado |
| 9 | "Status da solicitação" do Mapeamento não existia | `src/app/situacao-pedido.tsx` (nova), `LoginScreen.tsx` | Integração; P01 Nicole (`LoginScreen`) | Tela que consulta só o status pelo e-mail. No Login entrou um link "Já fez o pedido? Ver situação" | R05, F08; CT31 manual | Banco aprovado; tela não executada |
| 10 | "Privacidade e termos" mostrava aviso de indisponível | `src/app/privacidade.tsx` (nova), `src/app/mais.tsx` | Integração | Tela com o que o app faz com os dados; ligada no Mais e no pé do Login | CT35 | Não executado |
| 11 | RF-003: a avaliação não guardava a prefeitura | `src/lib/avaliacoes-reais.ts`, `src/lib/conta.ts`, `src/app/avaliacoes.tsx`, `src/app/relatorios-revisao.tsx` | Integração | A prefeitura da conta é gravada junto da avaliação (no aparelho) e usada no PDF | `teste-calculo` (2 casos) | Aprovado |
| 12 | Relatório aberto direto pelos detalhes saía sem a prefeitura | `src/app/relatorios-revisao.tsx` | Integração | Espera a prefeitura e o histórico juntos antes de abrir | CT11 | Não executado |
| 13 | Home mostrava "Olá, gestor(a)!" para todo mundo (o Mapeamento pede o nome) | `src/lib/resumo-inicio.ts`, `HomeScreen.tsx` | Integração; P01 Nicole (`HomeScreen`) | Primeiro nome da conta; sem nome continua "gestor(a)". Na tela da Nicole mudou só a linha do título e o tipo | `teste-resumo-inicio` (2 casos) | Aprovado |
| 14 | Senha forte não exigia letra minúscula | `src/lib/politica-senha.ts` | Integração | Agora exige maiúscula, minúscula, número e símbolo | `teste-senha` | Aprovado |
| 15 | "ç" e letras com acento contavam como símbolo, mas o Supabase não aceita | `src/lib/politica-senha.ts` | Integração | Símbolo = mesma lista do Supabase | `teste-senha` (2 casos) | Aprovado |
| 16 | Conta desativada via "Verifique sua conexão" ao entrar | `LoginScreen.tsx` | P01 Nicole | Mensagem "Esta conta está desativada. Fale com o suporte." | CT32 | Não executado |
| 17 | RF-008 e RNF-012 sem teste automático | `tests/teste-calculo.cjs` | Integração | Casos novos | `npm test` | Aprovado |

## 2. O que continua igual de propósito

- As 32 perguntas, alternativas, soluções e referências do Formulário.
- Fórmula e faixas do índice (são provisórias e dependem do orientador).
- Visual das telas dos integrantes.
- As telas avulsas da P04 e da P10 (sem link, aguardando decisão).
- Nenhuma resposta de avaliação vai para o Supabase.

## 3. Mudanças no projeto Supabase (feitas pelo conector, com registro)

| Quando (18/11/2026) | O quê | Destrutivo? |
|---|---|---|
| madrugada | Migração `fgrcm_admin_auditoria` aplicada | Não. Só criou tabelas, colunas, funções e gatilhos; trocou os valores aceitos no status do suporte (a mensagem existente estava como `aberto`, que continua válido) |
| madrugada | Função `admin-fgrcm` publicada (versão 1) | Não |
| madrugada | Função `aprovar-pedido` substituída por uma que só responde 410 (versão 2) | Desliga a função antiga |
| cerca de 01h40 | Teste `teste-rls-admin.sql` executado em transação desfeita | Não. Contagem das tabelas igual antes e depois |
