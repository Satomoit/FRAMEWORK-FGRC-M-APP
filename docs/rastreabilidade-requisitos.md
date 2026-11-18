# Matriz de rastreabilidade: requisitos × implementação × testes

**Versão:** 18/11/2026
**Fonte dos requisitos:** `02-Especificação do Projeto.md` (RF-001 a RF-016, RNF-001 a RNF-014), `Mapeamento de funcionalidades FGRC-M .pdf` e `DIAGRAMA.pdf` do repositório acadêmico.
**Legenda:** **Sim** = implementado e ligado ao resto do app; **Parcial** = funciona com limitação descrita; **Não** = não implementado.
"Teste automático" = já executado (ver `docs/registro-de-testes-mvp.md`). "Manual" = cenário do plano que ainda precisa ser executado no app.

## 1. Requisitos funcionais

| ID | Requisito | Tela | Arquivos principais | Implementado | Teste automático | Manual | Observação |
|---|---|---|---|---|---|---|---|
| RF-001 | Login | P01 Login | `src/features/p01-login-inicio/LoginScreen.tsx`, `src/app/index.tsx`, `src/lib/supabase.ts` | Sim | F01–F09 (API) | CT01, CT02 | Supabase Auth com PKCE |
| RF-002 | Iniciar avaliação | P01 Home, P03 | `HomeScreen.tsx`, `src/app/avaliacoes.tsx`, `AvaliacoesScreen.tsx` | Sim | — | CT03, CT06 | |
| RF-003 | Informar a prefeitura da avaliação | P03, P06 (PDF) | `src/lib/conta.ts` (`prefeituraDaSessao`), `src/lib/avaliacoes-reais.ts`, `src/app/relatorios-revisao.tsx` | Parcial | `teste-calculo` (RF-003) | CT11 | A prefeitura vem da conta aprovada pela administração e fica gravada na avaliação. O usuário não digita, para não avaliar em nome de outra prefeitura. **Confirmar essa interpretação com o grupo** |
| RF-004 | Questionário por eixos | P03 | `questionarioData.ts`, `QuestionarioScreen.tsx` | Sim | Comparação com o Formulário (32 perguntas) | CT06 | |
| RF-005 | Selecionar alternativa | P03 | `QuestionarioScreen.tsx` | Sim | — | CT06 | 0 a 4; eixo AWR de 0 a 3, como no Formulário |
| RF-006 | Alterar respostas antes de concluir | P03 | `QuestionarioScreen.tsx`, `src/lib/armazenamento-local.ts` | Sim | `teste-armazenamento-por-conta` | CT07, CT08 | Rascunho salvo sozinho no aparelho |
| RF-007 | Progresso | P03, Home | `QuestionarioScreen.tsx`, `src/lib/resumo-inicio.ts` | Sim | `teste-resumo-inicio` | CT06 | |
| RF-008 | Impedir conclusão com pendências | P03 (revisão) | `QuestionarioScreen.tsx`, `montarAvaliacao` em `avaliacoes-reais.ts` | Sim | `teste-calculo` (RF-008) | CT09 | Bloqueado na tela e de novo na gravação |
| RF-009 | Calcular a pontuação | P05 | `src/lib/calcular-relatorio.ts` | Parcial | `teste-calculo` | CT10 | Índice de exposição 0–100 = 1 − soma das notas ÷ soma das notas máximas. **Fórmula provisória**: a Metodologia não define a conta; validar com o orientador |
| RF-010 | Classificação por faixas | P05 | `calcular-relatorio.ts` (`classificar`) | Parcial | `teste-calculo` | CT10 | Até 33 Baixo, 34–66 Intermediário, 67–100 Alto. **Faixas provisórias** (não estão na Metodologia) |
| RF-011 | Fragilidades | P05 | `calcular-relatorio.ts` (`attentionPoints`) | Sim | `teste-resumo-inicio` | CT10 | Eixos com exposição a partir de 50 |
| RF-012 | Recomendações (inclusive capacitação) | P06 | `questionarioData.ts` (soluções do Formulário), `calcular-relatorio.ts` | Sim | Comparação com o Formulário | CT11 | Textos do Formulário, sem alteração |
| RF-013 | Prioridade das recomendações | P06 | `calcular-relatorio.ts` | Parcial | — | CT11 | Nota 0–1 = alta; 2–3 = média; nota 4 = sem recomendação (o Formulário não traz solução para 4; no eixo AWR a nota 3 tem a solução do Formulário). O Mapeamento cita também "baixa". **Decidir com o grupo** |
| RF-014 | PDF com identificação, respostas, resultados e recomendações | P06 | `pdf.web.ts`, `pdf.ts` | Sim | Comparação do PDF com o Formulário (sessão anterior) | CT11 | |
| RF-015 | Salvar o PDF | P06 | `RelatoriosScreen.tsx`, `pdf.web.ts` (download), `pdf.ts` (compartilhar) | Sim | — | CT11 | No celular abre a folha de compartilhar/salvar |
| RF-016 | Encerrar sessão | P09 Mais | `MenuMaisScreen.tsx`, `src/app/mais.tsx`, `src/app/_layout.tsx` | Sim | — | CT22 | |

## 2. Requisitos não funcionais

| ID | Requisito | Implementado | Como | Teste |
|---|---|---|---|---|
| RNF-001 | Processamento local | Sim | Cálculo em `calcular-relatorio.ts`, no aparelho | `npm test` |
| RNF-002 | Respostas não vão para servidores | Sim | Rascunho e histórico só em AsyncStorage, por conta | `teste-armazenamento-por-conta`; manual CT36 |
| RNF-003 | HTTPS na autenticação | Sim | URL do Supabase é `https://` | F01–F09 usaram HTTPS |
| RNF-004 | Senhas não guardadas em texto puro | Sim | O app não guarda senha; o Supabase guarda com hash | — (a senha provisória aparece uma vez para a administração e precisa ser trocada no primeiro acesso) |
| RNF-005 | Sessão em armazenamento seguro | **Parcial** | Sessão no AsyncStorage (no navegador, `localStorage`) | Pendência: `expo-secure-store` no celular exige instalação e novo build |
| RNF-006 | Avaliação sem conexão depois do login | Sim (não testado) | Questionário, cálculo e PDF são locais; a finalização lê a prefeitura da sessão salva | Manual (modo avião) a incluir |
| RNF-007 | Resultado em até 2 s | Não medido | — | Precisa definir o aparelho de referência |
| RNF-008 | PDF em até 5 s | Não medido | — | Idem |
| RNF-009 | Português brasileiro | Sim | Textos das telas e mensagens de erro em português | Revisão visual |
| RNF-010 | Explicação dos termos técnicos | **Parcial** | Tutorial e explicação do cálculo no PDF; as perguntas não têm glossário | Pendência |
| RNF-011 | Classificação em texto | Sim | "Baixo/Intermediário/Alto" e etiquetas com texto também na área admin | CT10 |
| RNF-012 | Mesmo resultado para as mesmas respostas | Sim | Cálculo sem dados aleatórios | `teste-calculo` (RNF-012) |
| RNF-013 | Módulos separados | Sim | `src/features` (telas), `src/lib` (autenticação, avaliação, cálculo, PDF, admin) | — |
| RNF-014 | Linguagem para quem não é técnico | Parcial | Tutorial, textos revisados, explicação do índice | Teste de usabilidade (documento 10) |

## 3. Itens do Mapeamento e do diagrama que não estão nos RF

| Item | Implementado | Arquivos | Teste |
|---|---|---|---|
| Área administrativa: solicitações pendentes, aceitar ou recusar com motivo | Sim | `src/features/admin/*`, `supabase/functions/admin-fgrcm` | R01–R28, F01–F03; CT23–CT28 |
| Área administrativa: usuários cadastrados e ativos (nome, e-mail, prefeitura, município, estado, situação) | Sim | `AbaContas.tsx` | CT32 |
| Status da solicitação (em análise, aprovada, recusada) | Sim | `src/app/situacao-pedido.tsx`, `situacao_do_pedido()` | R05, F08; CT31 |
| Home com o nome do usuário | Sim | `HomeScreen.tsx`, `resumo-inicio.ts` | `teste-resumo-inicio`; CT01 |
| Privacidade e termos | Sim (texto em revisão) | `src/app/privacidade.tsx` | CT35 |
| Ajuda e suporte | Sim (não estava na documentação; proposto como complementar) | `src/app/suporte.tsx`, `AbaSuporte.tsx` | R06–R09, R22–R24; CT29, CT30 |
| Opção "Não sei" na revisão | Não | — | Está no Mapeamento, mas não no Formulário. **Decidir com o grupo** |
| Recomendações com prioridade baixa | Não | — | Ver RF-013 |
| Excluir conta (em Configurações) | Não | — | Hoje: pedido pelo suporte e desativação pela administração |

## 4. Telas do protótipo × rotas

| Tela do protótipo | Funcionalidade | Rota no app | Situação |
|---|---|---|---|
| Login | P01 | `/` | Ligada |
| Página inicial | P01 | `/inicio` | Ligada, com dados reais |
| Solicitar acesso e Solicitação enviada | P02 | `/solicitar-acesso`, `/explore` | Ligadas ao Supabase |
| Avaliações e questionário | P03 | `/avaliacoes` | Ligadas |
| Revisar avaliação e Avaliação finalizada | P04 | Dentro de `/avaliacoes` (etapas da P03) | Ligadas. As telas avulsas da P04 (`/revisar-avaliacao`, `/avaliacao-finalizada`) continuam no projeto, sem link, com dados fixos |
| Resultados e detalhes | P05 | `/resultados-revisao` | Ligadas, sem dados de exemplo |
| Relatórios e recomendações | P06 | `/relatorios-revisao` | Ligadas, PDF real |
| Recuperar senha e Verificar e-mail | P07 | `/recuperar-senha` | Ligadas ao Supabase |
| Nova senha e Senha alterada | P08 | `/criar-nova-senha`, `/senha-alterada` | Ligadas |
| Mais e Meu perfil | P09 | `/mais` | Ligadas à conta |
| Editar perfil e Alterações salvas | P10 | Edição dentro de Meu perfil (P09) | Ligada. As telas avulsas da P10 (`/editar-perfil`, `/alteracoes-salvas`) continuam no projeto, sem link, com dados fixos |
| Configurações e Alterar senha | P11 | `/configuracoes`, `/alterar-senha` | Ligadas |
| Privacidade e termos | Diagrama | `/privacidade` | Nova |
| Área administrativa | Mapeamento | `/admin` | Nova |
