# Pendências, limitações e sugestões

**Versão:** 19/11/2026 (mudanças do dia em `docs/melhorias-19-11-2026.md`)
Lista do que ainda falta, do que funciona com limitação, das decisões que dependem do grupo e das sugestões para o repositório acadêmico. Nada aqui foi alterado no repositório da organização.

---

## 1. Configurações no painel do Supabase

Nenhuma delas pede para colar senha ou chave em lugar nenhum além do próprio painel.

| # | O quê | Onde | Para quê |
|---|---|---|---|
| 0 | **Desligar o cadastro público** (feito pela Josiane; confirmado às 12:05) | Authentication > Sign In / Providers > *Allow new users to sign up* desligado > Save | Com ele ligado dá para criar conta pela API sem passar pela aprovação (B09, SEC-01 em `auditoria-seguranca-e-dependencias.md`). O app não usa cadastro público. Conferir em `/auth/v1/settings`: `"disable_signup": true` |
| 1 | Apagar a função antiga | Edge Functions > `aprovar-pedido` > menu da função > Delete function | Hoje ela só responde "desativada" (410). Apagar evita confusão |
| 2 | Regra de senha no servidor | Authentication > Sign In / Providers > Email > *Minimum password length* = **10** e *Password requirements* = **Lowercase, uppercase letters, digits and symbols** | O servidor passa a exigir a mesma regra do app. Antes, confira se a senha da conta admin já segue a regra (contas com senha fraca recebem aviso de senha fraca ao entrar) |
| 3 | Proteção contra senhas vazadas | Mesma tela, *Prevent use of leaked passwords* | O Security Advisor avisa que está desligada. Segundo a documentação do Supabase, só existe nos planos pagos (Pro ou maior). No plano gratuito fica como limitação |
| 4 | Envio de e-mail próprio (SMTP) com Gmail | Authentication > Emails > SMTP Settings. Passo a passo em `docs/configurar-email-gmail-supabase.md` | O envio padrão só entrega para e-mails da equipe do projeto e 2 por hora. Com o Gmail funcionam o convite por código e a recuperação de senha para qualquer e-mail; o limite passa para 30 por hora (Authentication > Rate Limits) |
| 5 | Modelos de e-mail | Authentication > Emails > Templates > *Invite user*, *Magic Link* e *Reset password*. Textos prontos no mesmo documento | Colocar `{{ .Token }}` no texto para a pessoa receber o código que digita em "Ativar acesso". **Conferir que *Invite user* e *Magic Link* não têm `{{ .ConfirmationURL }}`** (o link de acesso foi retirado; ver seção 3) |
| 6 | Endereços permitidos do link de senha | Authentication > URL Configuration > Redirect URLs | Em 23/11 já tinha `https://fgrc-m.expo.app` e `https://fgrc-m.expo.app/criar-nova-senha` (site). Falta adicionar `http://localhost:8081/criar-nova-senha` (navegador do computador) e `fgrcminicial://criar-nova-senha` (APK), e trocar o **Site URL** de `http://localhost:3000` para `https://fgrc-m.expo.app`. No Expo Go o endereço começa com `exp://` e muda com o IP |
| 7 | Verificação em duas etapas | Authentication > Multi-Factor | Conferir se **TOTP** está habilitado (vem ligado por padrão) |
| 8 | ✅ Migrações e funções de 19/11 (exclusão definitiva e avisos por e-mail) | Feito em 19/11 (detalhes em `docs/melhorias-19-11-2026.md`, seção 4) | Exclusão definitiva e registro dos avisos funcionando no servidor |
| 9 | Segredos do e-mail das funções | Edge Functions > Secrets. Lista em `docs/configurar-email-gmail-supabase.md`, Parte 7 | Os avisos "Solicitação de acesso recebida" e "aprovada". Porta **465** (as funções bloqueiam 25 e 587) |

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
Também `npm run lint` (os testes de 19/11 não conseguiram rodar o lint nem o `tsc` completo fora do seu computador).

Novo APK (depois dos commits): subir `version` para `1.3.0` e `versionCode` para `4` no `app.json` e rodar `npx eas-cli build -p android --profile preview`. O dono do projeto no Expo agora é `fgrc-m`.

## 3. Pendências técnicas

| Item | Situação | O que falta |
|---|---|---|
| RNF-005 sessão em armazenamento seguro | Parcial | No celular, guardar a sessão com `expo-secure-store` (precisa `npx expo install expo-secure-store`, um adaptador para o Supabase e novo build). No navegador não existe armazenamento seguro equivalente |
| RNF-007 e RNF-008 (2 s e 5 s) | Não medido | Definir o celular de referência e cronometrar CT10 e CT11 |
| RNF-010 explicação dos termos | Parcial (avançou em 25/11) | As **soluções** ganharam explicação em palavras simples ("Ficou com dúvida em como resolver?", na tela de Recomendações e no PDF). Falta o mesmo para as **perguntas** do questionário (ex.: explicar partes interessadas, MFA, firewall) |
| RNF-006 sem internet | Implementado, não testado | Testar em modo avião depois do login |
| Telas avulsas da P04 e da P10 | Sem link | `/revisar-avaliacao`, `/avaliacao-finalizada`, `/editar-perfil` e `/alteracoes-salvas` têm dados fixos. A revisão e a edição reais estão na P03 e na P09. Decidir com os autores se ficam como registro ou se saem |
| Cores fixas em algumas telas | Corrigido na 1.2.0 (B10) | Login, Solicitar acesso, Solicitação enviada, Criar nova senha, Senha alterada e a lista de estados passaram a seguir o tema. Falta conferir no Android (CT93–CT96) |
| `mockData.ts` da P05 e da P06 | Sem uso | Continuam exportados no `index.ts` das pastas, mas nenhuma rota usa |
| Consulta da situação do pedido | Limitação conhecida | Quem souber um e-mail descobre se existe pedido e em que situação (não vê nenhum outro dado). Aceito para o MVP |
| Senha provisória | Limitação conhecida | A administração vê a senha uma vez. O app obriga a troca no primeiro acesso |
| Desativar conta | Limitação menor (versão 3 da função) | Bloqueia novos logins e apaga as sessões abertas (a renovação para na hora). O acesso que já tinha sido entregue ao celular ainda vale até vencer, no máximo 1 hora |
| Link de acesso por e-mail (Magic Link) | Retirado da entrega | No Android o link era aceito, mas ia para o Site URL (`localhost`) e a sessão se perdia. Para voltar a usar: cadastrar um endereço de retorno do app (ex.: `fgrcminicial://entrar`) em Redirect URLs, mandar esse endereço no envio do código, criar a rota que recebe a sessão e decidir o que fazer quando o e-mail é aberto em outro aparelho. Até lá, só código (8 números) |
| APKs antigos já instalados | Limitação | O 1.0.0 não tem a verificação de manutenção e versão mínima. Do 1.1.0 ao 1.2.0 a verificação existe, mas some sem internet. O bloqueio que continua sem internet só vale a partir do próximo APK. Pedir para atualizar manualmente (`docs/atualizacoes-e-eas-update.md`) |
| Atualização pelo ar (EAS Update) | Não configurado (proposta pronta) | `expo-updates` não está instalado. Toda mudança exige APK novo. Passo a passo e cuidados em `docs/atualizacoes-e-eas-update.md` |
| Pasta Download no Android 11+ | Limitação do Android | O seletor de pastas não deixa usar a raiz de Download; escolher ou criar uma subpasta (ex.: `Download/FGRC-M`) |
| Aviso por e-mail quando a equipe responde o suporte | Não implementado | A resposta fica em Meus chamados. Dá para aproveitar o envio dos avisos de pedido (`_shared/email-fgrcm.ts`) com um evento novo |
| Avisos por e-mail de pedido recebido e aprovado | Publicado em 19/11; **falta cadastrar os segredos** | Sem os segredos (item 9 da seção 1) o aviso fica como "não configurado" e nada é enviado. Com Gmail, limite diário e risco de spam |
| Meus chamados para mensagens sem login | Limitação | Mensagens enviadas pela tela de entrada não aparecem (não dá para provar de quem são); a resposta é por e-mail |
| Excluir conta | Publicado em 19/11 (falta reteste no app) | Exclusão definitiva pela administração (Contas > Excluir definitivamente). A pessoa ainda não pede sozinha: o pedido continua pelo suporte |
| Posse do e-mail nos modos código e senha provisória | Limitação conhecida | O app não confirma sozinho que a pessoa é dona do e-mail; quem aprova deve mandar o código ou a senha pelo próprio e-mail da pessoa ou por um contato conhecido. No modo por e-mail o próprio e-mail confirma |
| Lista de contas na administração | Limitação | Lê até 500 contas (suficiente para o MVP) |
| Último login | Informação disponível | A aba Contas mostra a data do último login (Supabase Auth). Não existe registro de quem está usando o app agora |
| Alertas do `npm audit` (36) | Para depois da entrega | Vêm de `picomatch` e `minimatch` nas ferramentas de build. **Não** usar `npm audit fix --force` (rebaixa o Expo). Plano em `auditoria-seguranca-e-dependencias.md`, seção 5 |
| Domínios de e-mail aceitos no build | Decisão | O `eas.json` aceita `gov.br` e `gmail.com` para os testes. Numa implantação real, deixar só `gov.br` |
| Campo Estado e trava de conta aprovada | Corrigido na 1.2.0 | Falta o reteste no Android (CT74, CT75, CT77, CT78) |
| Tamanho do texto no celular | Corrigido em 19/11 | Todas as telas com letra de tamanho fixo acompanham a barrinha (`src/components/escala-texto.ts`). Falta conferir no Android em 150% |
| Telas avulsas sem link | Visual | `/revisar-avaliacao`, `/avaliacao-finalizada`, `/editar-perfil` e `/alteracoes-salvas` continuam com cores fixas (não aparecem no app) |
| Material de testes | Fora deste repositório | Fica na documentação da equipe até a revisão e a transferência para o repositório acadêmico |
| Dependências do modelo sem uso | Para depois da entrega | `@expo/ui`, `expo-device`, `expo-glass-effect`, `expo-symbols`, `expo-web-browser`. Tirar com `npm uninstall` e gerar APK novo |
| Lint: aviso `react-hooks/set-state-in-effect` | Aviso (não trava) | O `expo lint` foi configurado em 19/11 (`eslint.config.js`) e a regra nova do React reclama de `useEffect` que já começa mudando o estado. Ficou como aviso nas telas que carregam dados ao abrir: `meus-chamados.tsx`, `AbaContas.tsx`, `AbaSeguranca.tsx`, `AbaSistema.tsx`, `AbaSolicitacoes.tsx`, `AbaSuporte.tsx`, `AreaAdministrativa.tsx` e `PerfilScreen.tsx` (P09). Funciona certo; só desenha a tela uma vez a mais. Ajustar depois da entrega |
| Erro "Requiring unknown module" no Expo | Desenvolvimento | Aparece quando os arquivos mudam com o Expo ligado. Reiniciar com `npx expo start -c` |
| Questionário não volta para o topo ao trocar de pergunta | Corrigido em 25/11 (retorno de teste de 23/11) | O `Page` (`src/components/fgrc-ui.tsx`) ganhou o `rolarProTopoQuando`, e o `QuestionarioScreen.tsx` passa o código da pergunta. Vale para Próxima, Anterior, abas dos eixos e "Responder" da revisão. Conferido em navegador de teste; **falta conferir no celular**, publicar o site de novo e gerar APK novo. Detalhes em `revisao-das-questoes-25-11-2026.md` |
| Revisão das 32 questões (25/11) | Feita no app; **falta atualizar o Formulário** | Nível 4 no eixo AWR, referências do NIST corrigidas em 5 perguntas e acrescentadas no AWR, 6 acertos de português e explicações simples das soluções. O Formulário (Docs e PDF do repositório acadêmico) precisa receber as mesmas mudanças: seções 5, 6 e 7 de `revisao-das-questoes-25-11-2026.md` |
| Privacidade e termos (25/11) | Texto novo no app; **falta a aprovação do grupo e do orientador e aceitar o PR #8** | A versão da Nicole (PR #8) foi juntada com a do `main` e ampliada: Política de Privacidade, Termos de Uso e Referências. O pedido de acesso ganhou o aviso com link. Conferido em navegador de teste; **falta conferir no app e no celular**. Passo a passo do merge e pontos em aberto em `privacidade-e-termos-25-11-2026.md`, seções 6, 8 e 9 |
| Backup automático do Android | Para decidir antes do próximo APK | O `app.json` não desliga o backup do sistema, então os dados guardados pelo app podem entrar na cópia de segurança da conta Google do dono do aparelho. Para as respostas ficarem só no aparelho, avaliar a opção `android.allowBackup` do `app.json` (conferir na documentação do Expo) e gerar APK novo. Ver `privacidade-e-termos-25-11-2026.md`, seção 6, ponto 6 |
| Leitura obrigatória dos Termos de Uso (25/11) | Feita no app; **falta testar no app real e no celular** | Janela na ativação por código e no primeiro acesso com senha provisória. O aceite fica no `user_metadata` (versão e hora), que a pessoa consegue alterar: um registro à prova de alteração precisaria de tabela própria (migração). Ver `privacidade-e-termos-25-11-2026.md`, seções 11 e 12 |
| Contraste dos botões no tema escuro | Achado em 25/11, para o grupo decidir | Sem alto contraste, o `FgrcButton` azul cheio fica com 3,8:1 e o de contorno com 3,7:1 (azul `#3688CF`), abaixo de 4,5:1. Ajuste na paleta (`src/components/fgrc-colors.ts`) muda todos os botões do app. Na janela dos termos, só o "Não aceito" foi trocado |
| Assunto "Privacidade e dados pessoais" no suporte | Sugestão (precisa de migração) | Hoje a política manda escolher "Outro assunto". Um assunto próprio exige mudar `src/app/suporte.tsx` e a regra da coluna `assunto` da tabela `support_requests` |
| Arquivo `LICENSE` | Para o grupo decidir | Ainda é a licença do modelo do Expo, em nome da empresa do Expo |
| Relatórios de avaliações feitas antes de 25/11 | Comportamento esperado | Continuam com a nota da época (eixo AWR até 3) e com a referência gravada na época. No PDF delas, o texto de como ler o relatório avisa que o eixo ia até 3 |

## 4. Decisões que dependem do grupo ou do orientador

1. **Fórmula do índice e faixas** (RF-009, RF-010): o app usa índice de exposição 0–100 (1 − soma das notas ÷ soma das notas máximas) e faixas Baixo até 33, Intermediário 34–66, Alto 67–100. A Metodologia não define isso. Precisa de validação.
2. **Eixo AWR**: resolvido no app em 25/11. As 5 perguntas ganharam o nível 4 (Aprimorada), com texto proposto na integração. **Falta o grupo aprovar o texto e colocar no Formulário** (`revisao-das-questoes-25-11-2026.md`, seção 5)
3. **Prioridade "baixa"** (RF-013): o Mapeamento cita alta, média e baixa; o app usa alta (nota 0–1) e média (2–3).
4. **Opção "Não sei"**: está no Mapeamento, mas não no Formulário.
5. **RF-003**: a prefeitura vem da conta aprovada (não é digitada). Confirmar a interpretação.
6. **"(0-0)" no Formulário**: a solução da nota 3 da pergunta 02-NET termina com "(0-0)" no PDF do Formulário. O app não mostra esse trecho.
7. **Texto de Privacidade e termos**: reescrito em 25/11 a partir da versão da Nicole e do que o app faz. Precisa de revisão do grupo e do orientador, principalmente: quem aparece como responsável pelos dados, as bases legais, o servidor no Canadá, o prazo de 15 dias, a exclusão dos dados ao fim do projeto, o aceite dos termos e os limites de responsabilidade (`privacidade-e-termos-25-11-2026.md`, seção 6).
8. **Link "Área da administração" no Login**: existe porque no celular não há barra de endereço. Se o grupo preferir, é só apagar o bloco indicado no comentário do `LoginScreen.tsx`.
9. **Telas avulsas da P04 e da P10** (ver seção 3).
10. **Pontos da revisão de 25/11** (`revisao-das-questoes-25-11-2026.md`, seção 10): regra de senha da 02-IAM diferente da norma atual do NIST, frase incompleta na alternativa 4 da 02-NET, código do eixo de backup (BCK nas abas e BKP nas perguntas), falta da opção "não se aplica" e solução da nota 3 da 01-TPR.

## 5. Documentação acadêmica e créditos

Os documentos acadêmicos (planos e registros de testes, usabilidade, rastreabilidade, registros de cada etapa e a descrição do uso de ferramentas) ficam fora deste repositório, na documentação da equipe, para revisão antes de irem para o repositório acadêmico.

Créditos: as telas são dos integrantes (tabela "Telas e autoria" no README). A integração foi conduzida pela Josiane, que definiu as tarefas, acompanhou as implementações, testou no computador e no celular e verificou os resultados. ChatGPT (OpenAI) e Claude (Anthropic) foram usados como ferramentas de apoio (explicações, revisão técnica, sugestões, geração e adaptação de trechos de código, depuração e documentação); em algumas etapas o Claude aplicou alterações nos arquivos sob orientação dela. Os comentários marcados com `[integração]`, `[correção Android]`, `[manutenção e atualização]`, `[entrada nova]`, `[tema]` e `[segurança]` indicam as partes escritas na integração.
