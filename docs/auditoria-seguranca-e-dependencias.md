# Auditoria de segurança e de dependências — versão 1.2.0

**Data:** 18/11/2026, entre 11:20 e 11:40 (horário de Brasília)
**Responsável:** Josiane (integração). As consultas de leitura ao Supabase e os testes de API descritos aqui foram executados com apoio do Claude (Anthropic), a pedido dela, e os resultados foram conferidos por ela
**Versão do código analisada:** 1.2.0 (ainda sem commit; último commit `502eea8`)

Este documento é técnico e fica no repositório do aplicativo. Os IDs de teste citados (CT, TT, B) são os do plano e do registro de testes da equipe, que ficam fora deste repositório.

## 1. Como a auditoria foi feita

- Leitura do catálogo do banco (políticas RLS, permissões por papel, funções e gatilhos). Só consultas `select`; nada foi alterado.
- Leitura da configuração pública de login (`/auth/v1/settings`) com a chave pública.
- Leitura do código das duas Edge Functions publicadas (`admin-fgrcm` v3 e `aprovar-pedido` v2).
- Busca no código do aplicativo por chaves, variáveis `EXPO_PUBLIC_*`, `console.*` e regras de acesso.
- Avisos de segurança do próprio Supabase (Security Advisor).
- Resultado do `npm audit` enviado pela Josiane às 11:22.

Não foram feitos testes destrutivos, não foram usados dados de outras pessoas e nenhuma chave, senha, token ou e-mail pessoal foi copiado para este documento. As contas existentes foram contadas sem ler e-mails ou nomes.

## 2. Chaves e configuração

| Item | Situação | Comentário |
| --- | --- | --- |
| `.env.local` | OK | Só tem `EXPO_PUBLIC_PREVIEW_MODE`, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Está no `.gitignore` (regra `.env*.local`) |
| `eas.json` (perfil `preview`) | OK | Leva a URL e a chave **pública** (`sb_publishable_...`). Essa chave foi feita para ficar dentro do app; quem protege os dados é o RLS |
| `service_role` / `sb_secret_` no app | Não encontrada | Só aparece num comentário de `src/lib/supabase.ts` avisando para nunca colocar |
| Chave secreta no servidor | OK | Usada só dentro da Edge Function `admin-fgrcm` (variável de ambiente do Supabase) |
| `EXPO_PUBLIC_DOMINIOS_EMAIL` | Atenção | O build aceita `gov.br` **e `gmail.com`** para permitir testes com contas pessoais. Numa implantação real deve ficar só `gov.br` (é uma decisão da equipe, não um erro) |
| Registros (`console.*`) | OK | A função `admin-fgrcm` registra só o código do erro, sem e-mail. No app há um `console.error` local ao finalizar a avaliação, que não sai do aparelho |

## 3. O que cada perfil consegue fazer (conferido no banco)

Todas as 7 tabelas do esquema `public` têm RLS ligado. Ninguém de fora do servidor tem permissão de `DELETE`. As permissões de `INSERT` e `UPDATE` são por coluna.

| Ação | Visitante (sem login) | Conta comum | Administração |
| --- | --- | --- | --- |
| Enviar pedido de acesso | Sim, só como `pendente` e sem campos de análise; até 3 por e-mail em 24 h e 20 por minuto no total | Igual | Igual |
| Ver pedidos de acesso | Não | Não | Sim |
| Aprovar ou recusar pedido | Não | Não | Sim (status, observação e data; quem decidiu é gravado por gatilho) |
| Consultar a situação de um pedido pelo e-mail | Sim (`situacao_do_pedido`, devolve só o status) | Sim | Sim |
| Enviar chamado de suporte | Sim, só como `aberto`; até 5 por e-mail por hora | Sim; o chamado fica ligado à própria conta | Sim |
| Ver chamados | Não | Só os próprios, pela função `meus_chamados_fgrcm` (não recebe ID pela chamada, então não dá para pedir o de outra pessoa) | Todos |
| Responder chamado | Não | Não | Sim (autor e data gravados por gatilho) |
| Ler ou mudar manutenção e versão mínima | Lê só o resumo público (`estado_do_sistema_fgrcm`) | Igual ao visitante | Lê e muda; toda mudança vai para `admin_audit_logs` |
| Ver o registro de auditoria | Não | Não | Sim (somente leitura) |
| Criar, desativar ou reativar contas | Não | Não | Só pela Edge Function `admin-fgrcm` |
| Respostas das avaliações | Não existem no servidor | Ficam só no aparelho | Não existem no servidor |

**Quem é administração:** a função `e_admin_fgrcm()` exige um registro ativo na tabela `administradores` e, se a conta tiver um segundo fator (MFA) cadastrado, exige que a sessão tenha passado por ele (`aal2`). Esconder o link "Acesso da administração" no Login **não** é a proteção: a proteção está nessa função, usada em todas as políticas de administração e na Edge Function.

**Edge Functions:**

- `admin-fgrcm` (v3): `verify_jwt` ligado e confere a administração antes de qualquer ação; desativar uma conta também encerra as sessões abertas dela.
- `aprovar-pedido` (v2): versão antiga, já desligada (responde 410 para qualquer chamada). Pode ser apagada no painel quando a equipe quiser: Edge Functions > aprovar-pedido > Delete.

Os testes que confirmaram essas regras com as três situações (visitante, conta comum e administração) foram o TT-01 (25 verificações em SQL, desfeitas no final) e o TT-02 (chamadas reais à API sem login), registrados no documento 09. A auditoria de hoje conferiu que as regras continuam as mesmas. O teste com login real de cada perfil depois da trava nova está nos casos CT77 e CT78, ainda **não executados**.

## 4. Achados

### SEC-01 — Cadastro público aberto no Supabase (severidade alta)

**O que foi visto:** `/auth/v1/settings` respondeu `disable_signup: false` às 11:20, 11:27, 11:38 e 11:57.

**Situação atual (12:06):** corrigido. A Josiane desligou o cadastro no painel; às 12:05 a configuração respondeu `disable_signup: true` e, às 12:06, tentativas de criar conta por `/auth/v1/signup` e por `/auth/v1/otp` com endereços fictícios `@example.com` foram recusadas com 422 `signup_disabled`. O banco continuou com 3 contas (CT76 e CT89 aprovados).

**Por que é um problema:** com o cadastro aberto, qualquer pessoa com a chave pública (que está dentro do app) pode criar uma conta direto pela API, sem passar pelo pedido e pela aprovação. Depois de confirmar o e-mail, essa conta conseguiria entrar nas telas do aplicativo. Ela **não** consegue ver dados de outras pessoas nem fazer nada da administração (o RLS e a função `e_admin_fgrcm` barram), mas pula a regra de "só entra quem foi aprovado" e pode gerar e-mails de confirmação para endereços de terceiros.

**Contas criadas assim até agora:** nenhuma. Existem 3 contas: a da administração e duas aprovadas pelo fluxo normal (as duas têm os dados da prefeitura gravados pela administração).

**Correção:**

1. **No painel (falta fazer, só a equipe consegue):** Authentication > Sign In / Providers > **Allow new users to sign up** desligado > Save. O aplicativo não depende do cadastro público: a aprovação cria a conta pela Edge Function com a chave do servidor, e o "Ativar acesso" usa `shouldCreateUser: false`.
2. **No app (feito, camada a mais):** a função `contaLiberada` em `src/lib/conta.ts` só aceita contas que têm a prefeitura no `app_metadata` (gravada pela aprovação) ou o papel de administração. O `src/app/_layout.tsx` não abre as telas protegidas para outras contas e o Login encerra a sessão com a mensagem "Esta conta ainda não foi liberada...". O `app_metadata` não pode ser alterado pela própria pessoa. Testado por `tests/teste-conta-liberada.cjs` (7 verificações).

**Desligar o cadastro afeta a ativação?** Não deveria. As contas aprovadas são criadas pela função `admin-fgrcm` com a chave do servidor (`inviteUserByEmail`, `generateLink` do tipo convite e `createUser`), que são chamadas de administração; o "Ativar acesso" do app só pede código para conta que já existe (`shouldCreateUser: false`). Isso precisa ser confirmado na prática pelo CT90, depois do ajuste. Se a aprovação falhar com o cadastro desligado, a correção é no servidor (função `admin-fgrcm`), **nunca** religar o cadastro público.

**Como conferir depois de desligar:** abrir no navegador `https://pqblfalpxxzczhbaglso.supabase.co/auth/v1/settings?apikey=<chave pública do .env.local>` e ver `"disable_signup": true`. Registrar no 09 como reteste do B09.

### SEC-02 — Dá para saber se um e-mail tem pedido de acesso (severidade baixa)

A função pública `situacao_do_pedido(e-mail)` devolve `pendente`, `aprovado` ou `recusado` para qualquer e-mail digitado. Ela não devolve nome, prefeitura nem datas, mas permite descobrir se um endereço pediu acesso e qual foi a decisão. É o que faz a tela "Acompanhar pedido" funcionar sem login. Para o MVP a equipe pode aceitar o risco; uma melhoria futura é exigir também um código enviado no momento do pedido. Fica em pendências.

### SEC-03 — Proteção contra senhas vazadas desligada (severidade baixa)

Aviso do Supabase: a verificação de senhas vazadas (HaveIBeenPwned) não está ligada. Ela só existe nos planos pagos. A regra de senha forte do app (10 caracteres, maiúscula, minúscula, número e símbolo) continua valendo no cadastro de senha e na troca.

### Avisos esperados do Supabase

O Security Advisor também lista funções `SECURITY DEFINER` que visitantes ou contas comuns podem chamar: `estado_do_sistema_fgrcm`, `situacao_do_pedido`, `meus_chamados_fgrcm`, `e_admin_fgrcm` e `estado_admin_fgrcm`. Todas são de propósito: cada uma devolve só o mínimo (resumo público, status do pedido, os chamados da própria conta ou se a conta é administração) e todas têm `search_path` vazio. Os gatilhos internos já não podem ser chamados por fora (migração `20261118132313`).

## 5. Dependências (`npm audit`)

**Resultado (Josiane, 18/11 às 11:22):** 36 alertas, 2 moderados e 34 altos, nenhum crítico. O número é o mesmo com e sem `--omit=dev`, porque as bibliotecas com alerta chegam pelo `expo` e pelo `react-native`, que são dependências normais do projeto (as de desenvolvimento são só `typescript` e `@types/react`).

**De onde vêm:** os 36 alertas nascem de só **2 problemas** em bibliotecas internas das ferramentas do Expo:

| Pacote | Aviso | Severidade | Versões afetadas | Onde é usado |
| --- | --- | --- | --- | --- |
| `picomatch` | GHSA-fc5q-39xc-vjpf — ReDoS com padrões de arquivo maliciosos | Alta (CVSS 7.5) | até 4.0.7 | Busca de arquivos do Metro, do Expo CLI e do Jest |
| `minimatch` | GHSA-g3hv-75wg-m249 — negação de serviço com padrões de arquivo | Moderada | 7.0.0 a 11.0.0 | `@expo/fingerprint` |

Os outros 34 (`metro`, `metro-config`, `metro-file-map`, `jest-worker`, `jest-util`, `micromatch`, `tinyglobby`, `fdir`, `@expo/cli`, `@react-native/codegen`, `react-native`, `react-native-reanimated`, `react-native-worklets`, `expo-modules-core` e outros) aparecem só porque dependem de um desses dois.

**Risco para o FGRC-M:** baixo. Os dois problemas só acontecem quando alguém consegue mandar um padrão de busca de arquivos (glob) preparado para travar a ferramenta. Isso acontece no computador de quem compila o app, com padrões escritos pela própria equipe. O APK e a versão web não recebem padrões de glob de usuários.

**Por que não usar `npm audit fix --force`:** as "correções" sugeridas pelo npm são **rebaixar** o Expo para 50.0.2, o React Native para 0.83.10, o Reanimated para 4.6.0 e o Worklets para 0.12.2. Isso quebraria o projeto inteiro (SDK 58) no dia da entrega.

**O que fazer depois da entrega:**

1. `npx expo install --check` e aceitar só as atualizações de correção do SDK 58 (o terminal já avisou `expo 58.0.24 → ~58.0.26` e mais 4 pacotes). Testar de novo antes de gerar APK.
2. Quando o Expo publicar versões com `picomatch` 4.0.8 ou mais novo e `minimatch` 11.0.1 ou mais novo, rodar `npm audit` de novo.
3. Se for preciso antes disso, testar um `overrides` no `package.json` para essas duas bibliotecas, num branch separado, com `npx tsc --noEmit`, `npm test`, `npx expo start` e um build de teste.

## 6. Pendências de segurança

| ID | O que falta | Quem | Status |
| --- | --- | --- | --- |
| SEC-01 | Desligar "Allow new users to sign up" e conferir `disable_signup: true` | Josiane (painel do Supabase) | Feito (12:05) |
| SEC-01 | Rodar CT77 e CT78 (conta fora da aprovação não entra; contas aprovadas e administração continuam entrando) | Josiane | Não executado |
| SEC-01 | CT89 (cadastro pela API recusado) | Josiane, com o teste executado pelo Claude a pedido dela | Aprovado (12:06) |
| SEC-01 | CT90 (aprovação e ativação funcionando com o cadastro desligado) | Josiane (precisa do painel e do e-mail) | Não executado |
| SEC-02 | Decidir se aceita o risco do "Acompanhar pedido" sem código | Equipe | Aceito para o MVP (proposta) |
| SEC-03 | Senhas vazadas: só em plano pago | Equipe | Limitação conhecida |
| — | Apagar a função antiga `aprovar-pedido` | Josiane (opcional) | Aberto |
| — | Restringir `EXPO_PUBLIC_DOMINIOS_EMAIL` a `gov.br` numa implantação real | Equipe | Decisão futura |
| — | Atualizações de correção do Expo e novo `npm audit` | Equipe | Depois da entrega |
