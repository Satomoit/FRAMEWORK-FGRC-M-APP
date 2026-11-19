# Melhorias de 19/11/2026 (depois da versão 1.2.0)

Registro técnico das mudanças feitas em 19/11/2026, em oito etapas. Tudo o que foi escrito nesta rodada está marcado no código com `[integração 19/11]`. As telas dos integrantes foram mantidas; quando uma tela de integrante precisou mudar, a mudança é pequena e está comentada no próprio arquivo.

**Situação geral:** o código está pronto e testado no computador (testes automáticos e banco local). **No fim do dia 19/11, com autorização da Josiane, as 2 migrações foram aplicadas no Supabase e as funções `admin-fgrcm` (versão 4) e `notificacoes-fgrcm` (versão 1) foram publicadas**; os testes do banco rodaram no Supabase de verdade (tudo desfeito no final). Nenhum e-mail real foi enviado (os segredos de e-mail ainda não foram cadastrados), nenhuma conta ou solicitação real foi excluída, não houve build nem commit. O que ainda depende de configuração está na seção 4 e o que precisa de reteste no Android está na seção 5.

Legenda da coluna "Situação":

- **Testado**: implementado e conferido com teste automático ou no banco local.
- **Reteste no Android**: implementado, mas só dá para confirmar no APK novo.
- **Depende de configuração**: só funciona depois de aplicar a migração, publicar a função ou cadastrar os segredos no Supabase.
- **Pendente**: não foi feito (motivo na seção 6).

---

## 1. O que mudou em cada etapa

### Etapa 1: dono do projeto no Expo e defeitos B11, B12 e B13

| Item | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| Dono no Expo | `"owner": "fgrc-m"` no `app.json` (antes `satomoit`). `projectId`, `slug`, `scheme` e `android.package` não mudaram | `app.json` | Testado (arquivo); o próximo build confirma |
| B11 | "Responder por e-mail" abria o e-mail com `undefined`. Agora monta assunto ("Re: ...") e corpo com saudação, assinatura e a mensagem original | `src/lib/email-resposta-suporte.ts` (novo), `src/features/admin/AbaSuporte.tsx` | Testado + Reteste no Android |
| B12 | Os textos falavam em código de 6 números, mas o Supabase manda 8. Os textos agora dizem 8; a validação aceita de 6 a 10 números (se a configuração do Supabase mudar, o app não trava). A configuração do Supabase não foi alterada | `src/lib/codigo-de-acesso.ts` (novo), `src/app/ativar-acesso.tsx`, `src/features/admin/AbaSolicitacoes.tsx`, `AcessoDaPessoa.tsx` | Testado + Reteste no Android |
| B13 | "1 pontos de atenção" virou "1 ponto de atenção" (singular e plural certos) | `src/lib/textos.ts` (novo), `src/features/p01-login-inicio/HomeScreen.tsx` | Testado + Reteste no Android |

### Etapa 2: exclusão definitiva de contas e solicitações

| Item | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| Ações novas na função | `excluir_usuario` e `excluir_pedido` na `admin-fgrcm` (versão 4). Exigem: administração ativa com MFA (`estado_admin_fgrcm() = ok`), a palavra `EXCLUIR` enviada junto, e-mail igual ao da conta. Recusam conta de administração e a própria conta | `supabase/functions/admin-fgrcm/index.ts` | Testado (simulado) + Depende de configuração |
| Dados no banco | Função `fgrcm_excluir_dados_da_conta` (uma transação só) e `fgrcm_excluir_pedido`, chamadas só pelo servidor | `supabase/migrations/20261119140000_fgrcm_exclusao_definitiva.sql` | Testado no banco local + Depende de configuração |
| Tela | Botões "Excluir definitivamente" (Contas) e "Excluir solicitação" (Solicitações), com janela que lista as consequências e só libera depois de digitar EXCLUIR | `src/features/admin/ConfirmarExclusao.tsx` (novo), `AbaContas.tsx`, `AbaSolicitacoes.tsx`, `src/lib/admin.ts` | Testado (lógica) + Reteste no Android |

**Política de dados pessoais (anonimizar × apagar):**

| Dado | O que acontece | Por quê |
|---|---|---|
| Conta no Supabase Auth | Apagada (`deleteUser`, exclusão definitiva) | É o dado pessoal principal |
| Pedido pendente do mesmo e-mail | Apagado | Ainda não tem decisão para registrar |
| Pedido já decidido (aprovado/recusado) | Nome vira "Pessoa removida" e o e-mail vira um endereço anonimizado; ficam prefeitura, município, estado, situação, datas, observação da decisão e quem decidiu | Mantém o registro das decisões da administração sem identificar a pessoa. A observação foi escrita pela administração; se ela citar a pessoa, apagar à mão |
| Mensagens de suporte e respostas | Nome, e-mail, texto e observação interna removidos e a ligação com a conta desfeita; o texto das respostas da equipe também sai. Ficam assunto, situação e datas | As mensagens e respostas podem citar a pessoa |
| Histórico da administração | As linhas ficam; o e-mail e o motivo saem e entra `dados_pessoais: removidos` | O histórico mostra que a exclusão aconteceu e quem fez |
| Registro de avisos por e-mail | Endereço trocado por um endereço anonimizado (`removido+...@anonimizado.invalid`) ou apagado junto com o pedido | Não guardar e-mail de quem saiu |
| Avaliações | Não mudam | Ficam só no aparelho da pessoa; o servidor nunca teve esses dados |

**Falha no meio do caminho:** a ordem é (1) bloquear o login e encerrar as sessões, (2) anonimizar o banco numa transação só, (3) apagar a conta no Auth. Se o passo 3 falhar, a resposta vem com `parcial: true`, o histórico registra `conta_exclusao_incompleta` e a conta continua bloqueada. É só tentar de novo: os passos já feitos não se repetem nem estragam nada.

### Etapa 3: atalho para a Área administrativa

| Item | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| Opção em Mais | "Área administrativa" aparece só para quem está em `administradores` (`ok` ou `precisa_mfa`). Abre `/admin` sem sair da conta | `src/app/mais.tsx`, `src/features/p09-menu-perfil/MenuMaisScreen.tsx`, `src/lib/admin.ts` | Testado (lógica) + Reteste no Android |
| Atualização da permissão | Confere de novo ao abrir Mais e quando o login muda (código MFA confirmado, sessão renovada, saída) | `src/app/mais.tsx` | Reteste no Android |
| Voltar sem sair | Painel e tela do código MFA têm "Voltar para o aplicativo" (não faz logout) e "Sair da conta" separado. O MFA continua obrigatório e o link do Login foi mantido | `src/features/admin/AreaAdministrativa.tsx` | Testado (lógica) + Reteste no Android |

### Etapa 4: e-mails "Solicitação de acesso recebida" e "Solicitação de acesso aprovada"

| Item | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| Modelo do e-mail | HTML responsivo (tabela de 600 px, cores do FGRC-M) + versão só texto, com os textos combinados. Dados reais do pedido; nome vazio vira "Olá!". Nada de senha ou código no aviso | `supabase/functions/_shared/email-fgrcm.ts` (novo) | Testado (simulado) |
| Pedido recebido | Depois de gravar o pedido, o app chama a função pública `notificacoes-fgrcm`, que só envia para um pedido **pendente** daquele e-mail criado nos últimos 15 minutos. A tela "Solicitação enviada" só fala do e-mail quando o envio foi confirmado | `supabase/functions/notificacoes-fgrcm/index.ts` (novo), `src/lib/aviso-pedido-recebido.ts` (novo), `src/app/solicitar-acesso.tsx`, `src/app/explore.tsx` | Testado (simulado) + Depende de configuração |
| Pedido aprovado | Depois de aprovar, a `admin-fgrcm` manda o aviso. A aprovação **não depende** do e-mail: se o envio falhar, o pedido continua aprovado e o painel mostra o aviso como "não enviado" com o botão "Tentar enviar de novo" | `admin-fgrcm/index.ts`, `AbaSolicitacoes.tsx` | Testado (simulado) + Depende de configuração |
| Sem duplicar e com registro | Tabela `email_notificacoes` com uma linha por evento e pedido (`unique`). Cada tentativa fica registrada (`enviando`, `enviado`, `falhou`, `nao_configurado`) com o erro resumido. Só a administração lê | `supabase/migrations/20261119130000_fgrcm_notificacoes_email.sql` | Testado no banco local + Depende de configuração |
| E-mails do Supabase Auth | Não mudaram (convite, código, recuperação de senha continuam pelos modelos do Auth) | — | — |

Sem os segredos de e-mail cadastrados, nada é enviado e o registro fica `nao_configurado`. O app nunca diz que mandou um e-mail sem confirmação do provedor.

### Etapa 5: tutorial guiado

| Item | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| Destaque | Escurece a tela e ilumina o botão de verdade (menu de baixo da Home e área de ajuda), com borda laranja, setinha e cartão explicando. Sem biblioteca nova: são 4 faixas escuras em volta do botão | `src/features/integracao/TutorialInicial.tsx`, `src/features/integracao/passos-tutorial.ts` (novo) | Testado (contas) + Reteste no Android |
| Controles | Pular, Voltar, Próximo e Concluir; "Passo X de 6"; botão Voltar do Android fecha o tutorial | `TutorialInicial.tsx` | Reteste no Android |
| Sem destaque possível | Se o botão estiver fora da tela (ex.: Ajuda no fim da página), o cartão explica com texto onde ele fica | `passos-tutorial.ts` | Testado |
| Rever tutorial | Configurações > Ajuda > "Rever tutorial" volta para a Home e abre o tutorial | `src/app/configuracoes.tsx`, `ConfiguracoesScreen.tsx` (prop opcional) | Reteste no Android |
| Primeira vez | Mesma chave de antes (`fgrcm:tutorial-visto:v1`): quem já viu não vê de novo sozinho | `TutorialInicial.tsx` | Testado (código) |
| Letra grande | O cartão acompanha o tamanho do texto, os botões quebram linha e o cartão ganha rolagem quando não cabe | `TutorialInicial.tsx` | Reteste no Android |
| Leitor de tela | Os textos dizem onde fica cada botão (não só "toque aqui"); a Home fica escondida do TalkBack enquanto o tutorial está aberto | `TutorialInicial.tsx`, `HomeScreen.tsx` | Reteste no Android |

### Etapa 6: acessibilidade e ajustes visuais

| Item | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| Tamanho do texto no celular | Antes só 5 telas acompanhavam a barrinha de tamanho do texto no Android. Agora todas as telas com letra de tamanho fixo acompanham, sem reescrever as telas: cada uma ganhou uma linha (`useEstilosEscalados`) que multiplica `fontSize`, `lineHeight` e `letterSpacing` pela escala. Caixas de texto com altura ou largura fixa crescem junto para a letra não cortar. No navegador nada muda (lá o zoom já valia) | `src/components/escala-texto.ts` (novo) e 42 telas (lista no teste `tests/teste-escala-texto.cjs`) | Testado (regra + conferência de todas as telas) + Reteste no Android |
| Área de toque | Mínimo de 48 px em: Voltar e links do `fgrc-ui`, × dos avisos, "Visualizar relatório" e Baixar/Compartilhar em Relatórios, "Ver todas as dimensões", eixos da tela Avaliações | `fgrc-ui.tsx`, `RelatoriosScreen.tsx`, `DetalhesResultadoScreen.tsx`, `AvaliacoesScreen.tsx` | Reteste no Android |
| Rótulos | "Visualizar relatório de <data>" para o leitor de tela; links laranja com rótulo | `RelatoriosScreen.tsx`, `fgrc-ui.tsx` | Reteste no Android |
| Visual | Avisos (`Notice`) um pouco mais visíveis: faixa lateral de 4 px e letra 14. Nada de mudança radical | `fgrc-ui.tsx` | Reteste no Android |

A barrinha de tamanho do texto (`BarraTamanhoTexto.tsx`) ficou de fora de propósito: os "A" pequeno e grande servem de comparação.

### Etapa 7: sistema de atualização

| Item | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| Bloqueio sem internet | Antes, desligar a internet escapava da atualização obrigatória. Agora, quando o servidor já mostrou a atualização obrigatória para a versão instalada, isso fica lembrado no aparelho e continua bloqueando sem internet. Só uma resposta do servidor libera. Quem nunca viu o aviso continua usando sem internet normalmente | `src/components/guarda-do-sistema.tsx`, `src/lib/versao.ts` | Testado (regra) + Reteste no Android |
| Conferência periódica | Com o app aberto, confere de novo a cada 2 minutos sem conexão e a cada 30 minutos com conexão (além de ao abrir e ao voltar do segundo plano, que já existia) | `guarda-do-sistema.tsx` | Reteste no Android |
| Instruções no Android | A tela de atualização obrigatória mostra o passo a passo da instalação do APK e o botão "Baixar a versão nova"; sem internet avisa para conectar | `guarda-do-sistema.tsx` | Reteste no Android |
| Link no painel | Dica no campo "Link oficial": usar o link do build na conta `fgrc-m` e conferir no celular antes de salvar | `src/features/admin/AbaSistema.tsx` | Reteste no Android |
| Proposta de EAS Update, versão no servidor e limites | Análise e passo a passo em `docs/atualizacoes-e-eas-update.md`. Nada foi instalado | — | Pendente (decisão) |

### Etapa 8: testes e documentação

Ver seção 3 (testes) e os documentos atualizados: este arquivo, `atualizacoes-e-eas-update.md`, `arquitetura-seguranca-e-dados.md`, `manutencao-atualizacao-suporte-pdf.md`, `configurar-email-gmail-supabase.md`, `pendencias-limitacoes-e-sugestoes.md` e o índice `docs/README.md`.

### Ajustes depois do teste no computador (19/11, à noite)

| Problema relatado | O que foi feito | Arquivos | Situação |
|---|---|---|---|
| "Área administrativa" aparecia no menu Mais só depois de alguns segundos | O app lembra o último resultado desta conta (memória e aparelho) e mostra o botão na hora; o banco é consultado por trás e atualiza se a permissão mudou. Ao entrar na conta já faz essa consulta. Isso só decide se o botão aparece: quem libera a entrada continua sendo a `/admin` + o banco | `src/lib/atalho-admin.ts` (novo), `src/app/mais.tsx`, `src/app/_layout.tsx` | Testado (`teste-atalho-admin.cjs`) + Reteste no Android |
| Botões pouco intuitivos | Novas cores no botão compartilhado: verde (aprovar, finalizar, reativar, desligar manutenção, resolver), vermelho (recusar, excluir, desativar, sair) e vermelho cheio na confirmação final. Ícones nos botões e etiquetas de situação com fundo colorido e ícone (✓ aprovado, ✕ recusado, relógio pendente). O texto continua dizendo a ação (não depende só da cor) | `fgrc-ui.tsx`, `fgrc-colors.ts`, `ui-admin.tsx`, abas da administração, `ConfirmarExclusao.tsx`, botão "Finalizar avaliação" e "Sair" do menu Mais | Reteste no Android |
| Tutorial podia ser um pouco mais caprichado | Ícone em cada passo, barra de progresso, destaque laranja pulsando (desliga com "Reduzir movimento"), cartão aparecendo suave, tocar no botão destacado também avança e um passo final de resumo com ✓ | `TutorialInicial.tsx`, `passos-tutorial.ts` | Testado (contas) + Reteste no Android |
| "Excluir solicitação" não excluía | O botão chamava a ação nova, mas no Supabase ainda estava a `admin-fgrcm` versão 3, que respondeu 400 (ação desconhecida); nada foi apagado. Com autorização, as migrações foram aplicadas e a versão 4 foi publicada (seção 4) | — | Publicado; falta a exclusão de teste pelo app |

---

## 2. Arquivos

**Novos:**

| Arquivo | Para quê |
|---|---|
| `src/lib/textos.ts` | Singular/plural e conferência da palavra EXCLUIR |
| `src/lib/codigo-de-acesso.ts` | Tamanho e textos do código de ativação |
| `src/lib/email-resposta-suporte.ts` | Link "Responder por e-mail" |
| `src/lib/aviso-pedido-recebido.ts` | Pede o e-mail de pedido recebido e guarda se foi enviado |
| `src/components/escala-texto.ts` | Tamanho do texto em todas as telas do celular |
| `src/features/admin/ConfirmarExclusao.tsx` | Janela de confirmação com a palavra EXCLUIR |
| `src/features/integracao/passos-tutorial.ts` | Passos e contas do tutorial guiado |
| `supabase/functions/_shared/email-fgrcm.ts` | Modelo e envio dos e-mails (SMTP do Gmail na porta 465 ou Resend) |
| `supabase/functions/notificacoes-fgrcm/index.ts` | Função pública do e-mail de pedido recebido |
| `supabase/migrations/20261119130000_fgrcm_notificacoes_email.sql` | Tabela e funções do registro de avisos |
| `supabase/migrations/20261119140000_fgrcm_exclusao_definitiva.sql` | Funções da exclusão definitiva |
| `supabase/tests/teste-notificacoes-email.sql` | N01–N12 |
| `supabase/tests/teste-exclusao-definitiva.sql` | E01–E21 |
| `tests/teste-textos-e-codigo.cjs`, `teste-funcoes-servidor.cjs`, `teste-avisos-e-exclusao-app.cjs`, `teste-escala-texto.cjs`, `teste-tutorial.cjs` | Testes automáticos novos |
| `docs/melhorias-19-11-2026.md`, `docs/atualizacoes-e-eas-update.md` | Documentação |

**Alterados (principais):** `app.json`; `supabase/functions/admin-fgrcm/index.ts`; `src/lib/admin.ts`, `src/lib/versao.ts`; `src/components/guarda-do-sistema.tsx`, `src/components/fgrc-ui.tsx`; `src/app/mais.tsx`, `configuracoes.tsx`, `solicitar-acesso.tsx`, `explore.tsx`, `ativar-acesso.tsx`; `src/features/admin/*` (Contas, Solicitações, Suporte, Sistema, Área administrativa, Acesso da pessoa); `src/features/integracao/TutorialInicial.tsx`; nas telas dos integrantes, só o necessário (`HomeScreen.tsx`, `MenuMaisScreen.tsx`, `ConfiguracoesScreen.tsx`, `RelatoriosScreen.tsx`, `DetalhesResultadoScreen.tsx`, `AvaliacoesScreen.tsx`) e a linha da escala do texto nas telas listadas no teste; `tests/rodar-testes.cjs`, `tests/teste-versao.cjs`.

---

## 3. Testes feitos (19/11/2026, no computador)

| Teste | Como | Resultado |
|---|---|---|
| `npm test` (todos os arquivos de `tests/`) | Node, com Supabase, e-mail e Deno simulados (nada vai para a internet) | Todos passaram |
| Funções do servidor (`teste-funcoes-servidor.cjs`) | Simula a `admin-fgrcm` e a `notificacoes-fgrcm` com clientes falsos: permissões, MFA, palavra EXCLUIR, conta de admin, própria conta, falha parcial, e-mail sem configuração, porta bloqueada, provedor que recusa o destinatário | 40 verificações passaram |
| Regras do banco | Postgres 16 local com uma imitação mínima do Supabase (papéis `anon`, `authenticated`, `service_role`, `auth.users`, `auth.jwt()`), todas as migrações aplicadas na ordem num banco novo e contas fictícias | `teste-rls-admin.sql` 28/28 como esperado; `teste-rls-chamados-sistema.sql` sem nenhum "PERMITIU (ruim)"; `teste-exclusao-definitiva.sql` 21/21 ok; `teste-notificacoes-email.sql` 12/12 ok |
| TypeScript (`npx tsc --noEmit`, no PC da Josiane) | Primeira rodada: 13 erros no tutorial (tipo do `ref` do React Native 0.88). Corrigido em `TutorialInicial.tsx` | Segunda rodada: sem erros |
| Lint (`npm run lint`, no PC) | O `expo lint` instalou e configurou o ESLint (`eslint.config.js`). Primeira rodada: 20 erros. Corrigidos os do código novo (hook chamado dentro de `try`, aspas retas em texto, `useEffect` que zerava estado). A regra `react-hooks/set-state-in-effect` ficou como aviso nas 8 telas que já carregavam dados assim (lista em `pendencias-limitacoes-e-sugestoes.md`) | Rodar de novo para confirmar |
| `npm test` no PC | Primeira rodada: 1 falha (o teste não considerava as quebras de linha do Windows). Teste corrigido | Segunda rodada: todos passaram |

O banco local não é o Supabase: ele confirma a lógica das funções e das regras, mas a confirmação final é rodar os arquivos de `supabase/tests/` no SQL Editor depois de aplicar as migrações (seção 4).

---

## 4. Configuração necessária (fazer nesta ordem)

Nenhum passo pede para colar senha, chave ou token no chat. Segredos só no painel do Supabase.

1. **Migrações** ✅ **feito em 19/11** (pelo Claude, com autorização): `fgrcm_notificacoes_email` e depois `fgrcm_exclusao_definitiva`. Nenhuma das duas apagou dados. Como foram aplicadas pelo MCP, no Supabase a versão registrada é a hora da aplicação (não `20261119130000`/`140000`).
   - Pelo terminal (`npx supabase db push`) o Supabase reclama porque a migração `20261118050000_...` foi registrada lá como `20261118042102`. Ou renomeie o arquivo (`git mv`) antes, ou use o SQL Editor.
2. **Testes do banco** ✅ **feito em 19/11** no Supabase de verdade: exclusão 21/21 ok e avisos 12/12 ok, tudo desfeito no final (conferido depois: nenhuma conta, pedido ou registro de teste ficou no banco). O Security Advisor não apontou nada nas funções novas.
3. **Funções** ✅ **feito em 19/11**: `admin-fgrcm` versão 4 (com verificação de login) e `notificacoes-fgrcm` versão 1 (pública). Para publicar de novo no futuro (terminal do VS Code na pasta do projeto, logado com `npx supabase login`):
   ```powershell
   npx supabase functions deploy admin-fgrcm --project-ref pqblfalpxxzczhbaglso
   npx supabase functions deploy notificacoes-fgrcm --no-verify-jwt --project-ref pqblfalpxxzczhbaglso
   ```
   Não dá para colar no editor do painel porque as duas usam o arquivo compartilhado `supabase/functions/_shared/email-fgrcm.ts`. A `notificacoes-fgrcm` é pública (`--no-verify-jwt`) porque quem faz o pedido ainda não tem conta.
4. **Segredos do e-mail** (Edge Functions > Secrets): passo a passo em `docs/configurar-email-gmail-supabase.md`, Parte 7. Sem eles o app funciona, só não manda os dois avisos.
5. **Teste de e-mail**: com uma conta de teste da equipe, fazer um pedido e aprovar. Conferir a caixa de entrada e o painel (Solicitações > Avisos por e-mail).

---

## 5. Reteste no APK novo

Antes do build: subir a versão no `app.json` (`"version": "1.3.0"` e `"versionCode": 4`), fazer o commit e rodar `npx eas-cli build -p android --profile preview`. Não distribuir para outras pessoas antes do reteste.

| # | O que testar | Esperado |
|---|---|---|
| 1 | Home com 1 ponto de atenção (B13) | "1 ponto de atenção" |
| 2 | Ativar acesso (B12) | Texto fala em código de 8 números; aceita o código recebido |
| 3 | Painel > Suporte > Responder por e-mail (B11) | Gmail abre com assunto "Re: ..." e a mensagem original, sem `undefined` |
| 4 | Mais com conta de administração e com conta comum | Só a de administração vê "Área administrativa"; volta sem sair da conta; o MFA continua pedido |
| 5 | Exclusão com contas e pedidos **de teste** | Só libera com EXCLUIR; a conta some do Auth; o histórico mostra a exclusão sem o e-mail |
| 6 | Pedido de acesso com e-mail de teste da equipe | E-mail "Solicitação de acesso recebida"; a tela fala do e-mail só se ele foi enviado |
| 7 | Aprovar esse pedido | E-mail "Solicitação de acesso aprovada"; se o e-mail falhar, o pedido continua aprovado |
| 8 | Tutorial (primeira vez, Como usar, Configurações > Rever tutorial) | Destaque no botão certo; Pular, Voltar, Próximo, Concluir; Voltar do Android fecha |
| 9 | Tamanho do texto em 150% | Questionário, Resultados, Relatórios, Login, Perfil e painel crescem sem cortar texto |
| 10 | Versão mínima obrigatória (com uma versão de teste no painel) e depois modo avião | Continua bloqueado sem internet; volta ao normal quando o painel liberar |

---

## 6. Pendências e limitações desta rodada

- **APKs antigos** (até 1.2.0) não têm o bloqueio lembrado nem as instruções novas. A atualização obrigatória só fica "à prova de modo avião" a partir do APK com estas mudanças.
- **EAS Update** não foi instalado (precisa de decisão e de um APK novo). Proposta em `docs/atualizacoes-e-eas-update.md`.
- **Versão conferida pelo servidor** não foi feita: o app manda a versão por conta própria, então isso não é segurança. A segurança continua nas regras RLS e nas funções do servidor. Detalhes no mesmo documento.
- **Tutorial**: o destaque da área de ajuda depende de ela estar visível; em celular pequeno ela fica no fim da página e o cartão explica com texto.
- **E-mail de pedido recebido**: quem souber um e-mail pode fazer um pedido em nome dele, e a pessoa recebe um aviso (o mesmo que acontece em qualquer formulário de cadastro). O limite de 3 pedidos por e-mail em 24 horas continua valendo.
- **Gmail**: limite diário do Gmail e possibilidade de cair no spam. Para uso real, um domínio próprio com Resend ou outro provedor.
