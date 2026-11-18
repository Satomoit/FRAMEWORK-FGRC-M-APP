# Registro de Testes do MVP FGRC-M (Sprint 04)

**Regra deste registro:** só entra aqui o que foi executado e observado. Um cenário que ainda não foi feito fica como **Não executado**. Nenhum resultado foi preenchido por suposição.

Horários no fuso de Brasília. "Executado por" indica quem rodou.

---

## 1. Testes automáticos já executados

### 1.1 Regras de segurança do banco (CT34): `supabase/tests/teste-rls-admin.sql`

| Campo | Valor |
|---|---|
| Data | 18/11/2026, cerca de 01h40 |
| Ambiente | Projeto Supabase do grupo (`pqblfalpxxzczhbaglso`), em transação desfeita no final |
| Executado por | Claude (ferramenta de IA), a pedido da responsável pela integração, pelo conector do Supabase |
| Dados | Pedido e mensagens fictícios (`teste.rls@gmail.com`), conta comum simulada, fator MFA simulado; tudo desfeito |
| Conferência depois | Contagem das tabelas igual à de antes (0 pedidos, 1 mensagem, 0 registros de histórico, 0 fatores MFA, 1 admin) |

| Teste | Esperado | Obtido | Situação |
|---|---|---|---|
| R01 visitante envia pedido de acesso | aceito | aceito | Aprovado |
| R02 visitante lista pedidos | recusado | recusado | Aprovado |
| R03 visitante cria pedido já aprovado | recusado | recusado | Aprovado |
| R04 segundo pedido pendente do mesmo e-mail | recusado | recusado | Aprovado |
| R05 visitante consulta situação do pedido | pendente | pendente | Aprovado |
| R06 visitante envia mensagem de suporte | aceito | aceito | Aprovado |
| R07 mesma mensagem enviada de novo | recusado (duplicada) | recusado: mensagem_duplicada | Aprovado |
| R08 sexta mensagem do mesmo e-mail em 1 hora | recusado (limite) | recusado: limite_de_envios | Aprovado |
| R09 visitante lista mensagens de suporte | recusado | recusado | Aprovado |
| R10 visitante chama a checagem de admin | recusado | recusado | Aprovado |
| R11 conta comum lista pedidos | 0 linhas | 0 linhas | Aprovado |
| R12 conta comum lista suporte | 0 linhas | 0 linhas | Aprovado |
| R13 conta comum tenta aprovar pedido | 0 linhas alteradas | 0 linhas alteradas | Aprovado |
| R14 conta comum: checagem de admin | nao_admin | nao_admin | Aprovado |
| R15 conta comum lê auditoria | 0 linhas | 0 linhas | Aprovado |
| R16 conta comum se coloca como admin | recusado | recusado | Aprovado |
| R17 admin: checagem de admin | ok | ok | Aprovado |
| R18 admin vê o pedido enviado pelo visitante | 1 | 1 | Aprovado |
| R19 recusa grava quem decidiu e quando | true | true | Aprovado |
| R20 recusa entra no histórico | 1 | 1 | Aprovado |
| R21 decidir de novo um pedido já recusado | recusado | recusado: pedido_ja_analisado | Aprovado |
| R22 suporte em atendimento → resolvido grava quem e quando | true | true | Aprovado |
| R23 histórico do suporte tem as 2 mudanças | 2 | 2 | Aprovado |
| R24 admin altera o texto da mensagem da pessoa | recusado | recusado | Aprovado |
| R25 admin escreve no histórico direto | recusado | recusado | Aprovado |
| R26 admin com MFA, sessão sem o código | precisa_mfa | precisa_mfa | Aprovado |
| R27 admin com MFA sem o código lista pedidos | 0 linhas | 0 linhas | Aprovado |
| R28 admin com MFA depois do código | ok | ok | Aprovado |

O mesmo arquivo também tinha sido rodado antes, logo depois de aplicar a migração `20261118050000`, com o mesmo resultado (28 de 28).

### 1.2 Função do servidor e API sem login

| Campo | Valor |
|---|---|
| Data | 18/11/2026, cerca de 01h35 |
| Ambiente | Navegador do aplicativo Claude (desktop) no computador da responsável, chamando o Supabase do grupo |
| Executado por | Claude, com `fetch` pelo console da página |

| ID | O que foi feito | Esperado | Obtido | Situação |
|---|---|---|---|---|
| F01 | Chamar `admin-fgrcm` sem cabeçalho de autorização | recusado | 401 `UNAUTHORIZED_NO_AUTH_HEADER` | Aprovado |
| F02 | Chamar `admin-fgrcm` só com a chave publicável (visitante) | recusado | 401 "Entre de novo na área administrativa." | Aprovado |
| F03 | Chamar a função antiga `aprovar-pedido` | desativada | 410 "Função desativada. Use admin-fgrcm." | Aprovado |
| F04 | Visitante lê `access_requests` pela API | recusado | 401 (código 42501, sem permissão) | Aprovado |
| F05 | Visitante lê `support_requests` | recusado | 401 (42501) | Aprovado |
| F06 | Visitante lê `admin_audit_logs` | recusado | 401 (42501) | Aprovado |
| F07 | Visitante lê `administradores` | recusado | 401 (42501) | Aprovado |
| F08 | `situacao_do_pedido` com e-mail sem pedido | nada | 200 `null` | Aprovado |
| F09 | Visitante chama `estado_admin_fgrcm` | recusado | 401 "permission denied for function" | Aprovado |

### 1.3 Testes de comportamento (`npm test`)

| Data | Ambiente | Executado por | Resultado |
|---|---|---|---|
| 18/11/2026, cerca de 01h06 | Computador da responsável (Windows), versão anterior à área administrativa | Responsável pela integração | Todos "PASSOU" (informado por ela com o log do terminal) |
| 18/11/2026, cerca de 01h50 | Cópia do projeto no ambiente do Claude (Linux, Node), versão com área administrativa, RF-003 e nova regra de senha | Claude | 44 de 44 "PASSOU", 0 "FALHOU" |

O que os 44 casos cobrem: regra de senha forte (12), cálculo do índice com AWR de 0 a 3, RF-003, RF-008 e RNF-012 (9), resumo da Home e nome na saudação (10), separação das avaliações por conta e migração dos dados antigos (13).

**Falta:** rodar `npm test` de novo no computador da responsável com a versão atual.

### 1.4 Checagem de tipos (`npx tsc --noEmit`)

| Data | Executado por | Resultado |
|---|---|---|
| 18/11/2026, cerca de 01h06 | Responsável pela integração | Sem erros (versão anterior à área administrativa) |

**Falta:** rodar de novo com a versão atual. No ambiente do Claude foi feita só uma checagem parcial (com tipos simplificados das bibliotecas), sem erros. Ela não substitui o `tsc` do projeto.

### 1.5 Questionário × Formulário oficial

| Campo | Valor |
|---|---|
| Data | 18/11/2026, cerca de 01h45 |
| Executado por | Claude, com script que compara `questionarioData.ts` com o texto extraído de `FGRC-M_ Formulário.pdf` |
| Resultado | 32 perguntas no app e 32 no formulário. 30 iguais na comparação automática. As 2 diferenças foram conferidas uma a uma |

| Questão | Diferença apontada | Conferência |
|---|---|---|
| 02-BKP, alternativa 4 | O texto extraído do PDF juntou o parágrafo "O NIST prevê..." (que vem depois das alternativas) com a alternativa 4 | Problema da extração. A alternativa no app está igual à do formulário |
| 02-NET, solução da nota 3 | O PDF do formulário termina a frase com "(0-0)" | O app não tem esse "(0-0)". Parece sobra de edição no formulário. **Confirmar com o grupo** |

Antes desta etapa, o PDF gerado pelo app também tinha sido comparado com o formulário (32 de 32 perguntas, alternativas e soluções).

---

## 2. Cenários manuais (CT01 a CT36)

Preencher depois de executar. Campos do plano acadêmico: responsável, data, ambiente (aparelho, sistema, commit), dados usados, resultado obtido, situação e link da evidência.

| ID | Responsável | Data | Ambiente | Resultado obtido | Situação | Evidência |
|---|---|---|---|---|---|---|
| CT01 | | | | | Não executado | |
| CT02 | | | | | Não executado | |
| CT03 | | | | | Não executado | |
| CT04 | | | | | Não executado | |
| CT05 | | | | | Não executado | |
| CT06 | | | | | Não executado | |
| CT07 | | | | | Não executado | |
| CT08 | | | | | Não executado | |
| CT09 | | | | | Não executado | |
| CT10 | | | | | Não executado | |
| CT11 | | | | | Não executado | |
| CT12 | | | | | Não executado | |
| CT13 | | | | | Não executado | |
| CT14 | | | | | Não executado | |
| CT15 | | | | | Não executado | |
| CT16 | | | | | Não executado | |
| CT17 | | | | | Não executado | |
| CT18 | | | | | Não executado | |
| CT19 | | | | | Não executado | |
| CT20 | | | | | Não executado | |
| CT21 | | | | | Não executado | |
| CT22 | | | | | Não executado | |
| CT23 | | | | | Não executado | |
| CT24 | | | | | Não executado | |
| CT25 | | | | | Não executado | |
| CT26 | | | | | Não executado | |
| CT27 | | | | | Não executado | |
| CT28 | | | | | Não executado | |
| CT29 | | | | | Não executado | |
| CT30 | | | | | Não executado | |
| CT31 | | | | | Não executado | |
| CT32 | | | | | Não executado | |
| CT33 | | | | | Não executado | |
| CT34 | Claude | 18/11/2026 | Supabase do grupo | 28 de 28 iguais ao esperado (seção 1.1) | Aprovado | Seção 1.1 |
| CT35 | | | | | Não executado | |
| CT36 | | | | | Não executado | |

Observação: durante o desenvolvimento, a responsável enviou capturas do navegador com telas funcionando (Alterar senha e "Senha alterada!", validação da senha forte, PDFs gerados a partir de avaliações reais). Eram versões anteriores do código, então esses cenários não foram marcados como aprovados aqui: precisam ser repetidos na versão final.
