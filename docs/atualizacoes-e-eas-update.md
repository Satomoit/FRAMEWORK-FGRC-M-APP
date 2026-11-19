# Atualizações do app: como funciona hoje e propostas para as próximas versões

Complementa a seção 3 de `manutencao-atualizacao-suporte-pdf.md`. Escrito em 19/11/2026. Nada desta página foi instalado ou publicado: são propostas para a equipe decidir.

---

## 1. Como funciona agora (a partir do próximo APK)

| Momento | O que o app faz |
|---|---|
| Ao abrir | Pergunta ao servidor (`estado_do_sistema_fgrcm`) a versão mínima e a mais nova |
| Ao voltar do segundo plano | Pergunta de novo (no máximo uma vez por minuto) |
| Com o app aberto | Pergunta de novo a cada 30 minutos (ou a cada 2 minutos se estiver sem conexão) |
| Versão abaixo da mínima e obrigatória | Bloqueia com a tela "Nova versão do FGRC-M disponível", passo a passo e botão "Baixar a versão nova" |
| Sem internet | Se o servidor **já** tinha mostrado a atualização obrigatória para esta versão, continua bloqueando (fica lembrado no aparelho). Se nunca mostrou, deixa usar normalmente |
| Versão nova não obrigatória | Faixa que dá para fechar |

A lembrança fica na chave `fgrcm:sistema:bloqueio-versao:v1` do aparelho e só vale para a versão instalada naquela hora. Ela some sozinha quando a pessoa instala a versão nova, ou quando o servidor responde que a versão já não é obrigatória.

### O conflito com o uso sem internet

As avaliações ficam no aparelho e o questionário funciona sem internet (RNF-006). Por isso o app **não** bloqueia quem está sem internet e nunca recebeu o aviso: sem resposta do servidor não dá para saber se existe uma versão mínima nova. A regra escolhida foi o meio-termo:

- quem já recebeu o aviso não escapa desligando a internet;
- quem nunca recebeu continua trabalhando até a próxima vez que o app conseguir falar com o servidor (a conferência a cada 2 minutos cuida disso);
- as respostas já salvas não se perdem: a atualização é instalada por cima e mantém os dados do app.

### O que não dá para fazer

- **APKs já instalados (até 1.2.0) não mudam de comportamento.** O código que roda no celular é o do APK; o 1.0.0 nem tem a verificação, e do 1.1.0 ao 1.2.0 a verificação existe, mas sem o bloqueio lembrado. Não existe jeito de forçar retroativamente: é preciso pedir para as pessoas instalarem o APK novo.
- **O app não instala nada sozinho.** No Android, um app de fora da Play Store só pode abrir o link do APK; quem instala é a pessoa, confirmando na tela do sistema.
- **Quem desinstala antes de instalar a versão nova perde as avaliações** (elas ficam só no aparelho). A tela de atualização avisa para instalar por cima.

---

## 2. Link oficial do APK (`url_atualizacao`)

O painel aceita só `https://`. Com a conta da Expo renomeada para `fgrc-m`, links antigos com `satomoit` podem não abrir mais. **Antes de salvar um link, abra no celular e confira se baixa o APK certo.**

| Opção | Como fica o link | Prós | Contras |
|---|---|---|---|
| Página do build na Expo | Copiado do expo.dev > projeto > Builds > build do APK (`https://expo.dev/accounts/fgrc-m/projects/.../builds/...`) | Nenhum passo a mais | Muda a cada build; a Expo não garante que a página de um build antigo fique disponível para sempre; precisa de navegador |
| GitHub Releases | `https://github.com/Satomoit/FRAMEWORK-FGRC-M-APP/releases/latest/download/FGRC-M.apk` | O mesmo link serve para todas as versões (sempre o último release); o arquivo fica guardado no GitHub | Só funciona se o repositório for **público** (repositório privado pede login). A cada versão, alguém sobe o APK num release novo com o mesmo nome de arquivo |
| Site próprio / Google Drive | Depende | Controle da equipe | Drive mostra tela de aviso de vírus para arquivos grandes; precisa manter |

Sugestão: enquanto o repositório for privado, usar o link do build da Expo e trocar no painel a cada APK novo. Se o repositório ficar público depois da entrega, passar para o link fixo do GitHub Releases.

Ordem segura depois de gerar um APK novo: (1) baixar e instalar num celular de teste pelo link; (2) no painel, preencher **versão mais nova** e **link**, sem mexer na mínima; (3) esperar as pessoas atualizarem; (4) só então subir a **versão mínima** e marcar **obrigatória**.

---

## 3. Proposta: EAS Update (atualização pelo ar)

**O que resolve:** mudanças só de JavaScript (textos, telas, regras do app) chegam no próximo uso do app, sem baixar APK. **O que não resolve:** biblioteca nova com código nativo, permissão nova, ícone ou nome do app continuam exigindo APK novo. E só vale para APKs gerados **depois** de configurar.

Passo a passo (VS Code, pasta `C:\Projetos\FRAMEWORK-FGRC-M-APP`, numa branch separada):

1. `npx expo install expo-updates` (instala a versão certa para o SDK do projeto; não usar `npm install` direto).
2. `npx eas-cli update:configure`. Ele coloca `updates.url` (`https://u.expo.dev/<projectId>`) no `app.json` e `channel` em cada perfil do `eas.json` (ex.: `"preview": { "channel": "preview" }`).
3. Definir a compatibilidade no `app.json`: `"runtimeVersion": { "policy": "appVersion" }`. Assim uma atualização feita para a 1.3.0 só chega em APKs 1.3.0. Toda vez que mudar algo nativo, subir o `version` e gerar APK novo.
4. Gerar um APK novo (`npx eas-cli build -p android --profile preview`) e testar.
5. Para publicar uma mudança só de JavaScript: `npx eas-cli update --channel preview --message "o que mudou"`.

Cuidados:

- Combinar com a tela de atualização: o EAS Update cuida das mudanças pequenas; a versão mínima do painel continua sendo o caminho para quando precisa de APK novo.
- O plano gratuito da Expo tem limite de usuários por mês para o EAS Update; conferir em expo.dev antes.
- Não configurar perto de uma entrega sem tempo para testar: um erro de configuração faz o APK não abrir as atualizações.

---

## 4. Conferir a versão no servidor?

Ideia: o app mandaria a versão em cada chamada e o servidor recusaria versões velhas.

**Por que não foi feito:**

- **A versão vem do próprio app, então não é segurança.** Qualquer pessoa pode mandar "1.3.0" num cabeçalho. A proteção de verdade continua nas regras RLS e nas funções do servidor, que conferem a conta e a permissão em cada chamada, qualquer que seja a versão.
- **Quebraria a web e os testes.** As funções aceitam só alguns cabeçalhos (CORS). Um cabeçalho novo exige mudar todas as funções ao mesmo tempo, senão o navegador bloqueia as chamadas.
- **Não alcança os APKs antigos**, que justamente são os que se quer barrar: eles não mandam versão nenhuma.

**O que fazer no lugar, se um dia mudar o formato de alguma chamada:** manter o formato antigo funcionando junto com o novo por um tempo (ou criar uma ação nova em vez de mudar a antiga) e só tirar o antigo depois de subir a versão mínima no painel. Assim um APK velho nunca recebe uma resposta que não entende.
