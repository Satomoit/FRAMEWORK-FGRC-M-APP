# Pendências, limitações e sugestões

**Versão:** 18/11/2026
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
| Cores fixas em algumas telas | Corrigido na 1.2.0 (B10) | Login, Solicitar acesso, Solicitação enviada, Criar nova senha, Senha alterada e a lista de estados passaram a seguir o tema. Falta conferir no Android (CT93–CT96) |
| `mockData.ts` da P05 e da P06 | Sem uso | Continuam exportados no `index.ts` das pastas, mas nenhuma rota usa |
| Consulta da situação do pedido | Limitação conhecida | Quem souber um e-mail descobre se existe pedido e em que situação (não vê nenhum outro dado). Aceito para o MVP |
| Senha provisória | Limitação conhecida | A administração vê a senha uma vez. O app obriga a troca no primeiro acesso |
| Desativar conta | Limitação menor (versão 3 da função) | Bloqueia novos logins e apaga as sessões abertas (a renovação para na hora). O acesso que já tinha sido entregue ao celular ainda vale até vencer, no máximo 1 hora |
| Link de acesso por e-mail (Magic Link) | Retirado da entrega | No Android o link era aceito, mas ia para o Site URL (`localhost`) e a sessão se perdia. Para voltar a usar: cadastrar um endereço de retorno do app (ex.: `fgrcminicial://entrar`) em Redirect URLs, mandar esse endereço no envio do código, criar a rota que recebe a sessão e decidir o que fazer quando o e-mail é aberto em outro aparelho. Até lá, só código de 6 números |
| APK 1.0.0 já instalado | Limitação | Não tem a verificação de manutenção e versão mínima, então não pode ser bloqueado à distância. Pedir para atualizar manualmente |
| Atualização pelo ar (EAS Update) | Não configurado | `expo-updates` não está instalado. Toda mudança exige APK novo. Se for configurar: `npx expo install expo-updates`, `eas update:configure`, definir `runtimeVersion` e gerar um APK novo antes de usar `eas update` (mudança nativa sempre exige APK) |
| Pasta Download no Android 11+ | Limitação do Android | O seletor de pastas não deixa usar a raiz de Download; escolher ou criar uma subpasta (ex.: `Download/FGRC-M`) |
| Aviso por e-mail quando a equipe responde o suporte | Não implementado | A resposta fica em Meus chamados. Mandar e-mail automático exigiria uma função no servidor com o SMTP |
| Meus chamados para mensagens sem login | Limitação | Mensagens enviadas pela tela de entrada não aparecem (não dá para provar de quem são); a resposta é por e-mail |
| Excluir conta | Não implementado | Hoje: pedido pelo suporte e desativação pela administração |
| Posse do e-mail nos modos código e senha provisória | Limitação conhecida | O app não confirma sozinho que a pessoa é dona do e-mail; quem aprova deve mandar o código ou a senha pelo próprio e-mail da pessoa ou por um contato conhecido. No modo por e-mail o próprio e-mail confirma |
| Lista de contas na administração | Limitação | Lê até 500 contas (suficiente para o MVP) |
| Último login | Informação disponível | A aba Contas mostra a data do último login (Supabase Auth). Não existe registro de quem está usando o app agora |
| Alertas do `npm audit` (36) | Para depois da entrega | Vêm de `picomatch` e `minimatch` nas ferramentas de build. **Não** usar `npm audit fix --force` (rebaixa o Expo). Plano em `auditoria-seguranca-e-dependencias.md`, seção 5 |
| Domínios de e-mail aceitos no build | Decisão | O `eas.json` aceita `gov.br` e `gmail.com` para os testes. Numa implantação real, deixar só `gov.br` |
| Campo Estado e trava de conta aprovada | Corrigido na 1.2.0 | Falta o reteste no Android (CT74, CT75, CT77, CT78) |
| Tamanho do texto no celular | Parcial | A barrinha de tamanho do texto vale no app inteiro no navegador. No celular, ela vale nas telas que já usavam a escala (página inicial, Opções, Home, Configurações e outras dos integrantes); Login, pedido de acesso e telas de senha crescem só com a fonte do Android. Ajustar depois da entrega, tela por tela |
| Telas avulsas sem link | Visual | `/revisar-avaliacao`, `/avaliacao-finalizada`, `/editar-perfil` e `/alteracoes-salvas` continuam com cores fixas (não aparecem no app) |
| Material de testes | Fora deste repositório | Fica na documentação da equipe até a revisão e a transferência para o repositório acadêmico |
| Dependências do modelo sem uso | Para depois da entrega | `@expo/ui`, `expo-device`, `expo-glass-effect`, `expo-symbols`, `expo-web-browser`. Tirar com `npm uninstall` e gerar APK novo |
| Erro "Requiring unknown module" no Expo | Desenvolvimento | Aparece quando os arquivos mudam com o Expo ligado. Reiniciar com `npx expo start -c` |

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

## 5. Documentação acadêmica e créditos

Os documentos acadêmicos (planos e registros de testes, usabilidade, rastreabilidade, registros de cada etapa e a descrição do uso de ferramentas) ficam fora deste repositório, na documentação da equipe, para revisão antes de irem para o repositório acadêmico.

Créditos: as telas são dos integrantes (tabela "Telas e autoria" no README). A integração foi conduzida pela Josiane, que definiu as tarefas, acompanhou as implementações, testou no computador e no celular e verificou os resultados. ChatGPT (OpenAI) e Claude (Anthropic) foram usados como ferramentas de apoio (explicações, revisão técnica, sugestões, geração e adaptação de trechos de código, depuração e documentação); em algumas etapas o Claude aplicou alterações nos arquivos sob orientação dela. Os comentários marcados com `[integração]`, `[correção Android]`, `[manutenção e atualização]`, `[entrada nova]`, `[tema]` e `[segurança]` indicam as partes escritas na integração.
