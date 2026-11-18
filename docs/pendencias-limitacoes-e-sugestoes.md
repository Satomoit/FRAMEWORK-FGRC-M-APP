# Pendências, limitações e sugestões

**Versão:** 18/11/2026
Lista do que ainda falta, do que funciona com limitação, das decisões que dependem do grupo e das sugestões para o repositório acadêmico. Nada aqui foi alterado no repositório da organização.

---

## 1. Configurações no painel do Supabase

Nenhuma delas pede para colar senha ou chave em lugar nenhum além do próprio painel.

| # | O quê | Onde | Para quê |
|---|---|---|---|
| 1 | Apagar a função antiga | Edge Functions > `aprovar-pedido` > menu da função > Delete function | Hoje ela só responde "desativada" (410). Apagar evita confusão |
| 2 | Regra de senha no servidor | Authentication > Sign In / Providers > Email > *Minimum password length* = **10** e *Password requirements* = **Lowercase, uppercase letters, digits and symbols** | O servidor passa a exigir a mesma regra do app. Antes, confira se a senha da conta admin já segue a regra (contas com senha fraca recebem aviso de senha fraca ao entrar) |
| 3 | Proteção contra senhas vazadas | Mesma tela, *Prevent use of leaked passwords* | O Security Advisor avisa que está desligada. Segundo a documentação do Supabase, só existe nos planos pagos (Pro ou maior). No plano gratuito fica como limitação |
| 4 | Envio de e-mail próprio (SMTP) com Gmail | Authentication > Emails > SMTP Settings. Passo a passo em `docs/configurar-email-gmail-supabase.md` | O envio padrão só entrega para e-mails da equipe do projeto e 2 por hora. Com o Gmail funcionam o convite por código e a recuperação de senha para qualquer e-mail; o limite passa para 30 por hora (Authentication > Rate Limits) |
| 5 | Modelos de e-mail | Authentication > Emails > Templates > *Invite user*, *Magic Link* e *Reset password*. Textos prontos no mesmo documento | Colocar `{{ .Token }}` no texto para a pessoa receber o código que digita em "Ativar acesso" |
| 6 | Endereços permitidos do link de senha | Authentication > URL Configuration > Redirect URLs | Adicionar `http://localhost:8081/criar-nova-senha` (navegador) e `fgrcminicial://criar-nova-senha` (APK). No Expo Go o endereço começa com `exp://` e muda com o IP |
| 7 | Verificação em duas etapas | Authentication > Multi-Factor | Conferir se **TOTP** está habilitado (vem ligado por padrão) |

## 2. Comandos para rodar no computador (VS Code, pasta `C:\Projetos\FRAMEWORK-FGRC-M-APP`)

```powershell
git status
npx tsc --noEmit
npm test
npx expo start -c
```
Os arquivos soltos que viraram migrações podem sair do repositório (o conteúdo está em `supabase/migrations/`):
```powershell
git rm supabase/fgrcm-p02-pedidos-de-acesso.sql supabase/fgrcm-suporte.sql supabase/fgrcm-admin.sql
```
A pasta `supabase/functions/aprovar-pedido` pode sair depois do item 1 da tabela acima:
```powershell
git rm -r supabase/functions/aprovar-pedido
```
Novo APK (depois dos commits): `npx eas-cli build -p android --profile preview`.

## 3. Pendências técnicas

| Item | Situação | O que falta |
|---|---|---|
| RNF-005 sessão em armazenamento seguro | Parcial | No celular, guardar a sessão com `expo-secure-store` (precisa `npx expo install expo-secure-store`, um adaptador para o Supabase e novo build). No navegador não existe armazenamento seguro equivalente |
| RNF-007 e RNF-008 (2 s e 5 s) | Não medido | Definir o celular de referência e cronometrar CT10 e CT11 |
| RNF-010 explicação dos termos | Parcial | Glossário curto nas perguntas (ex.: backup, MFA, firewall) |
| RNF-006 sem internet | Implementado, não testado | Testar em modo avião depois do login |
| Telas avulsas da P04 e da P10 | Sem link | `/revisar-avaliacao`, `/avaliacao-finalizada`, `/editar-perfil` e `/alteracoes-salvas` têm dados fixos. A revisão e a edição reais estão na P03 e na P09. Decidir com os autores se ficam como registro ou se saem |
| Cores fixas em algumas telas | Visual | Login, Solicitar acesso e Solicitação enviada não mudam no modo escuro. Resultados, Relatórios, Recomendações e o aviso de Avaliações já seguem o tema |
| `mockData.ts` da P05 e da P06 | Sem uso | Continuam exportados no `index.ts` das pastas, mas nenhuma rota usa |
| Consulta da situação do pedido | Limitação conhecida | Quem souber um e-mail descobre se existe pedido e em que situação (não vê nenhum outro dado). Aceito para o MVP |
| Senha provisória | Limitação conhecida | A administração vê a senha uma vez. O app obriga a troca no primeiro acesso |
| Desativar conta | Limitação | Bloqueia novos logins. Uma sessão já aberta continua até o token expirar (cerca de 1 hora) |
| Excluir conta | Não implementado | Hoje: pedido pelo suporte e desativação pela administração |

## 4. Decisões que dependem do grupo ou do orientador

1. **Fórmula do índice e faixas** (RF-009, RF-010): o app usa índice de exposição 0–100 (1 − soma das notas ÷ soma das notas máximas) e faixas Baixo até 33, Intermediário 34–66, Alto 67–100. A Metodologia não define isso. Precisa de validação.
2. **Eixo AWR de 0 a 3**: o Formulário vai até 3 nesse eixo; o cálculo usa o máximo de cada pergunta. Confirmar.
3. **Prioridade "baixa"** (RF-013): o Mapeamento cita alta, média e baixa; o app usa alta (nota 0–1) e média (2–3).
4. **Opção "Não sei"**: está no Mapeamento, mas não no Formulário.
5. **RF-003**: a prefeitura vem da conta aprovada (não é digitada). Confirmar a interpretação.
6. **"(0-0)" no Formulário**: a solução da nota 3 da pergunta 02-NET termina com "(0-0)" no PDF do Formulário. O app não mostra esse trecho.
7. **Texto de Privacidade e termos**: escrito a partir do que o app faz. Precisa de revisão do grupo.
8. **Link "Área da administração" no Login**: existe porque no celular não há barra de endereço. Se o grupo preferir, é só apagar o bloco indicado no comentário do `LoginScreen.tsx`.
9. **Telas avulsas da P04 e da P10** (ver seção 3).

## 5. Sugestões para o repositório acadêmico (para você decidir se altera)

| Documento | Sugestão |
|---|---|
| `02-Especificação do Projeto.md`, RES-001 | Diz "Flutter, utilizando Dart". O app é React Native com Expo e TypeScript, como está na `03-Metodologia.md`. Corrigir uma das duas |
| `02-Especificação do Projeto.md` | Incluir como requisitos complementares: área administrativa (aprovar/recusar pedidos, contas), suporte dentro do app, consulta da situação do pedido, privacidade e termos, verificação em duas etapas para a administração |
| `03-Metodologia.md` | Registrar a fórmula do índice, as faixas e o critério de prioridade (depois da validação) |
| `05-Arquitetura da Solução.md` | Pede `banco.sql` em `src\bd`. Dá para juntar as quatro migrações de `supabase/migrations/` nesse arquivo. Atualizar o diagrama com a função `admin-fgrcm` e as tabelas novas |
| `08-Plano de Testes de Software.md` | Acrescentar os cenários CT23 a CT36 de `docs/plano-de-testes-mvp.md` |
| `09-Registro de Testes de Software.md` | Está vazio. Usar os resultados de `docs/registro-de-testes-mvp.md` e os que vocês executarem |
| `14-Registro de Atividades e Evidências.md` | Registrar a integração: área administrativa, segurança do banco, RF-003, documentação e testes, com o uso de IA (seção 6) |
| `FGRC-M_ Formulário.pdf` | Conferir o "(0-0)" da 02-NET |

## 6. Uso de ferramentas de IA (para declarar no trabalho)

| Ferramenta | Onde foi usada | Revisão humana |
|---|---|---|
| Claude (Anthropic), pelo aplicativo Claude | Auditoria do código e da documentação, integração das telas, área administrativa, migrações e regras de segurança do Supabase, função `admin-fgrcm`, testes automáticos, execução dos testes de segurança e redação destes documentos | A responsável pela integração acompanhou as mudanças, testou no navegador, rodou `tsc` e `npm test` e decide o que vai para o GitHub. Os commits são feitos por ela |
| ChatGPT (OpenAI) | **Preencher:** em que etapas foi usado (ex.: organização do diagnóstico inicial e das orientações) | **Preencher** |

Os comentários de código marcados com `[integração]` indicam as partes escritas na integração. O restante é dos integrantes.
