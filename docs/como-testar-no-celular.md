# Como testar o FGRC-M no celular (você e os amigos)

Existem três jeitos. Para entregar e pedir para os amigos testarem, o melhor é o **A (APK)** para quem tem Android e o **B (link)** para quem tem iPhone.

| Jeito | Quem consegue usar | Precisa do seu computador ligado? | Atualiza quando você muda o código? |
|---|---|---|---|
| A. APK (aplicativo instalado) | Android | Não | Não: precisa gerar outro APK |
| B. Link no navegador do celular | Android e iPhone | Não | Não: precisa publicar de novo |
| C. Expo Go | Android e iPhone | Sim, com o Expo rodando | Sim, na hora |

> **Versão atual:** comandos de build e como instalar por cima sem perder as avaliações estão em `docs/versao-1.2.0-notas-e-build.md`.

Antes de gerar o A ou o B, faça os commits (assim o APK fica ligado a um commit conhecido e dá para anotar no registro de testes qual código foi testado) e rode:
```powershell
npx tsc --noEmit
npm test
```

---

## A. APK para Android

No VS Code, abra a pasta `C:\Projetos\FRAMEWORK-FGRC-M-APP` e abra o terminal (menu **Terminal > New Terminal**, ou `Ctrl + '`).

1. Confira se está logada na Expo:
   ```powershell
   npx eas-cli whoami
   ```
   Se não aparecer o seu usuário, rode `npx eas-cli login`.
2. Gere o APK:
   ```powershell
   npx eas-cli build -p android --profile preview
   ```
   Se perguntar alguma coisa sobre chave (keystore), responda **Yes** para o EAS criar.
3. Espere. No plano gratuito costuma levar de 10 a 30 minutos (às vezes mais, por causa da fila). Pode fechar o terminal; o build continua na Expo.
4. No final aparece um link `https://expo.dev/.../builds/...` e um QR code. O mesmo link fica em <https://expo.dev> > seu projeto > **Builds**.
5. **No seu celular:** abra o link (ou leia o QR) > **Install** > baixe o arquivo `.apk` > abra o arquivo.
   - Se o Android bloquear, toque em **Configurações** e permita **Instalar apps desconhecidos** para o navegador ou para o app de arquivos.
   - Se o Play Protect avisar que o app não foi verificado, toque em **Mais detalhes** > **Instalar mesmo assim**. Isso aparece porque o app não está na Play Store.
6. **Para os amigos:** mande o link da página do build pelo WhatsApp. Eles fazem o mesmo passo 5.

Cada vez que você mudar o código, gere um APK novo e mande o link novo.

## B. Link no navegador (serve para iPhone)

1. No terminal da mesma pasta:
   ```powershell
   npx expo export -p web
   npx eas-cli deploy --prod
   ```
   Na primeira vez ele pede um nome para o endereço. O resultado é algo como `https://NOME.expo.app`.
   Se a Expo pedir para assinar algum plano pago, pule esta opção e use o A.
2. No Supabase, adicione `https://NOME.expo.app/criar-nova-senha` em **Authentication > URL Configuration > Redirect URLs** (para o "Esqueci minha senha").
3. Mande o link para os amigos. No iPhone, abra no Safari e use **Compartilhar > Adicionar à Tela de Início** para ficar com cara de app.

As avaliações ficam guardadas no navegador daquele celular. Se a pessoa limpar os dados do navegador, elas somem (é a regra do projeto: nada da avaliação vai para o servidor).

## C. Expo Go (só para você testar rápido)

1. Instale o **Expo Go** no celular (Play Store ou App Store).
2. No terminal:
   ```powershell
   npx expo start -c --tunnel
   ```
3. Leia o QR code que aparece (Android: pelo Expo Go; iPhone: pela câmera).
4. Só funciona enquanto o computador estiver ligado com o comando rodando. Se o Expo Go reclamar da versão do SDK, use o A.

---

## Como o amigo entra no app (passo a passo para mandar para ele)

1. Abrir o app > página inicial (Conheça o FGRC-M) > **Solicitar acesso** > preencher (o e-mail precisa terminar em `gmail.com` ou `gov.br`) > Enviar.
2. Esperar você aprovar.
3. Você entra na área administrativa:
   - no computador: `http://localhost:8081/admin` (ou o link da opção B + `/admin`);
   - no celular: página inicial > **Opções** (no rodapé) > **Área da administração**.
4. Solicitações > abre o pedido > escolha um jeito:
   - **Aprovar com código de ativação:** aparece um código de 8 números. Toque em **Enviar para a pessoa** (no celular abre o WhatsApp) ou **Copiar mensagem pronta** (no computador). O código vale por pouco tempo (1 hora).
   - **Aprovar com senha provisória:** aparece a senha. Mande do mesmo jeito. No primeiro acesso o app pede para criar uma senha nova.
   - **Aprovar e enviar código por e-mail:** só depois de configurar o Gmail (`docs/configurar-email-gmail-supabase.md`).
5. O amigo:
   - com código: página inicial > **Ativar acesso** > e-mail + código > cria a senha;
   - com senha provisória: página inicial > **Entrar no FGRC-M** > entra normalmente e troca a senha.
6. **Perdeu o código ou a senha?** Na área administrativa, abra o pedido aprovado (ou a aba **Contas**) > **Novo acesso** > gere outro código ou outra senha. O anterior para de funcionar.

Por que o código antigo não fica guardado para mostrar de novo: quem tivesse acesso ao banco conseguiria entrar na conta da pessoa. Gerar um novo é mais seguro e funciona igual.

## E-mails de outros domínios (hotmail, outlook...)

Hoje o app só aceita `gov.br` e `gmail.com` no pedido de acesso. Para liberar outros durante os testes, mude esta linha no `eas.json` (para o APK) e no `.env.local` (para o computador), e gere o APK de novo:
```json
"EXPO_PUBLIC_DOMINIOS_EMAIL": "gov.br,gmail.com,hotmail.com,outlook.com"
```

## Problemas comuns

| O que aparece | O que fazer |
|---|---|
| `Requiring unknown module "1352"` no navegador | Arquivos mudaram com a página aberta. Recarregue com `Ctrl + Shift + R`. Se continuar, pare o Expo (`Ctrl + C`) e rode `npx expo start -c` |
| Aviso "A tree hydrated but some attributes..." com `darkreader` no texto | É a extensão **Dark Reader** do navegador mexendo na página. Desligue o Dark Reader para `localhost` |
| "Não foi possível enviar o convite" | E-mail ainda não configurado. Use o código de ativação ou a senha provisória, ou siga `docs/configurar-email-gmail-supabase.md` |
| "Muitos pedidos em pouco tempo" no Esqueci minha senha | Limite de e-mails do Supabase. Veja a Parte 3 do documento do Gmail |
| O link do e-mail de senha não abre o app no celular | Abra o link no navegador do computador, ou peça um código novo pela administração |
