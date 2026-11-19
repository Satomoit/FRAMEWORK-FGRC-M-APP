# Como fazer o e-mail funcionar de verdade (Gmail + Supabase)

**Por que o convite falhou:** sem configuração, o Supabase usa um envio de e-mail de teste. Ele só manda para quem é da equipe do projeto no Supabase e só 2 e-mails por hora no projeto todo. Para qualquer outro endereço, o app mostra "Não foi possível enviar o convite".

**O que resolve:** cadastrar uma conta do Gmail como remetente (SMTP). Depois disso, funcionam o código por e-mail, o reenvio do código e o "Esqueci minha senha" para qualquer e-mail.

> A senha de app do Google é digitada **só no painel do Supabase**. Não coloque no código, no GitHub nem no chat.

---

## Parte 1: criar a senha de app no Google (5 minutos)

1. Use um Gmail só para o projeto (ex.: `fgrcm.app@gmail.com`). Pode ser o seu, mas os e-mails vão sair com o seu endereço.
2. Entre em <https://myaccount.google.com/security> com essa conta.
3. Ative a **Verificação em duas etapas** (sem ela o Google não deixa criar senha de app).
4. Abra <https://myaccount.google.com/apppasswords>.
5. Em "Nome do app", escreva `Supabase FGRC-M` e clique em **Criar**.
6. O Google mostra uma senha de 16 letras. Copie (sem os espaços). Ela só aparece agora.

## Parte 2: cadastrar no Supabase (5 minutos)

Painel do Supabase > projeto do FGRC-M > **Authentication** > **Emails** > aba **SMTP Settings** > ative **Enable custom SMTP**.

| Campo | O que colocar |
|---|---|
| Sender email | o Gmail da parte 1 (ex.: `fgrcm.app@gmail.com`) |
| Sender name | `FGRC-M` |
| Host | `smtp.gmail.com` |
| Port number | `465` |
| Minimum interval between emails being sent | `60` (segundos) |
| Username | o mesmo Gmail completo |
| Password | a senha de app de 16 letras |

Clique em **Save changes**.

## Parte 3: limite de e-mails (o "2 por hora")

**Authentication** > **Rate Limits** > *Rate limit for sending emails*.

- Esse limite é por hora e vale para o projeto inteiro (todas as pessoas somadas). Ele só pode ser mudado depois da Parte 2.
- Depois do SMTP, o Supabase começa com 30 por hora. Para os testes com os amigos, **30 por hora** é suficiente. Isso já cobre as "10 tentativas a cada 2 horas" por pessoa.
- Para a mesma pessoa existe também um intervalo de 60 segundos entre um pedido e outro (*Password Reset Request*, *Send OTPs or magic links*). Pode deixar como está.
- O Gmail comum manda no máximo algumas centenas de e-mails por dia. Para o MVP isso basta.

## Parte 4: textos dos e-mails (com o código)

> **Importante (depois do teste no Android, 18/11):** os modelos **Invite user** e **Magic link** precisam ter **só o código** (`{{ .Token }}`), **sem** `{{ .ConfirmationURL }}`. No celular o link abria o navegador no endereço padrão do projeto (`localhost`) e não entrava no app. Abra os dois modelos no painel e confira: se tiver um link ou a frase em inglês "Follow this link", troque pelo texto abaixo e salve. O app não usa mais link para entrar (só para a recuperação de senha).

**Authentication** > **Emails** > aba **Templates**. Em cada modelo, troque o assunto (*Subject*) e o corpo (*Body*, em HTML), e clique em **Save**.
Sem isso os e-mails chegam com o texto padrão do Supabase, em inglês ("Reset your password"). As partes entre `{{ }}` não podem ser apagadas: são elas que colocam o código e o link.

### Invite user (aprovar com código por e-mail)

Assunto:
```
Seu acesso ao FGRC-M foi aprovado
```
Corpo:
```html
<h2>Seu acesso ao FGRC-M foi aprovado</h2>
<p>No aplicativo, toque em <strong>"Seu pedido foi aprovado? Ativar acesso"</strong>, digite o e-mail {{ .Email }} e este código:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>Depois, crie a sua senha. O código vale por pouco tempo e só funciona uma vez.</p>
<p>Se você não pediu acesso ao FGRC-M, ignore esta mensagem.</p>
```

### Magic link (código novo para quem já tem conta)

Assunto:
```
Seu código de acesso ao FGRC-M
```
Corpo:
```html
<h2>Código de acesso ao FGRC-M</h2>
<p>No aplicativo, toque em <strong>"Seu pedido foi aprovado? Ativar acesso"</strong>, digite o e-mail {{ .Email }} e este código:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>O código vale por pouco tempo e só funciona uma vez. Se você não pediu, ignore esta mensagem.</p>
```

### Reset password (Esqueci minha senha)

Assunto:
```
Criar nova senha do FGRC-M
```
Corpo:
```html
<h2>Criar nova senha</h2>
<p>Recebemos um pedido para trocar a senha do FGRC-M da conta {{ .Email }}.</p>
<p><a href="{{ .ConfirmationURL }}">Criar nova senha</a></p>
<p>Se você não pediu, ignore esta mensagem. A sua senha continua a mesma.</p>
```

### Change email address (quando a pessoa troca o e-mail em Meu perfil)

Assunto:
```
Confirme o novo e-mail do FGRC-M
```
Corpo:
```html
<h2>Confirme o novo e-mail</h2>
<p>Recebemos um pedido para trocar o e-mail da conta do FGRC-M de {{ .Email }} para {{ .NewEmail }}.</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar a troca de e-mail</a></p>
<p>Se você não pediu, ignore esta mensagem. O e-mail da conta continua o mesmo.</p>
```

### Confirm sign up (o app não usa cadastro aberto, mas é bom deixar em português)

Assunto:
```
Confirme o seu e-mail no FGRC-M
```
Corpo:
```html
<h2>Confirme o seu e-mail</h2>
<p><a href="{{ .ConfirmationURL }}">Confirmar e-mail</a></p>
<p>Se você não pediu acesso ao FGRC-M, ignore esta mensagem.</p>
```

Se aparecer mais algum e-mail em inglês (por exemplo, aviso de senha alterada), ele fica na mesma área de **Emails** do Supabase e pode ser traduzido do mesmo jeito: troque só o texto e mantenha as partes entre `{{ }}`.

## Parte 5: endereços permitidos do link de senha

O **Site URL** (Authentication > URL Configuration) é para onde o Supabase manda quando um link não diz para onde voltar. Pelos registros do teste de 18/11, ele está no padrão do Supabase (`http://localhost:3000`): foi para lá que o link de acesso mandou o celular. Com os modelos só com código isso não atrapalha mais; se um dia publicarem o site, coloquem o endereço dele ali.

**Authentication** > **URL Configuration** > **Redirect URLs** > **Add URL**:

- `http://localhost:8081/criar-nova-senha` (navegador no computador)
- `fgrcminicial://criar-nova-senha` (app instalado pelo APK)
- o endereço do site publicado, se usar a opção B de `docs/como-testar-no-celular.md` (ex.: `https://NOME.expo.app/criar-nova-senha`)

## Parte 6: validade do código (opcional)

**Authentication** > **Sign In / Providers** > **Email** > *Email OTP Expiration*.
O padrão é 3600 segundos (1 hora), que é o valor recomendado pelo Supabase. Se o código vencer antes de a pessoa usar, gere outro na área administrativa (botão "Novo acesso"). Não precisa aumentar.

## Parte 7: avisos "Solicitação de acesso recebida" e "Solicitação de acesso aprovada" (19/11/2026)

Esses dois avisos **não** são e-mails do Supabase Auth. Quem manda são as funções do servidor `notificacoes-fgrcm` (pedido recebido) e `admin-fgrcm` (pedido aprovado), com o modelo de `supabase/functions/_shared/email-fgrcm.ts`. Os e-mails do Auth (convite, código, recuperação de senha) continuam como nas partes anteriores.

As funções **não enxergam** o SMTP cadastrado na Parte 2, então precisam dos próprios segredos. Sem eles, nada é enviado: o pedido e a aprovação funcionam normalmente e o painel mostra o aviso como "não configurado".

**Onde cadastrar:** Supabase > **Edge Functions** > **Secrets** (ou *Project Settings* > *Edge Functions*). Digite os valores só ali.

| Nome do segredo | Valor | Observação |
|---|---|---|
| `EMAIL_PROVEDOR` | `smtp` | Ou `resend` (ver abaixo) |
| `EMAIL_REMETENTE` | `FGRC-M <o-gmail-do-projeto@gmail.com>` | Com o Gmail, tem que ser o mesmo endereço do `SMTP_USUARIO` |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `465` | **Obrigatório 465.** As funções do Supabase bloqueiam as portas 25 e 587; com elas o envio é recusado antes de tentar |
| `SMTP_USUARIO` | o Gmail do projeto | |
| `SMTP_SENHA` | a senha de app da Parte 1 | Pode ser a mesma da Parte 2 ou uma senha de app nova só para as funções |

**Alternativa (Resend):** `EMAIL_PROVEDOR` = `resend`, `EMAIL_REMETENTE` = um endereço de um domínio verificado no Resend e `RESEND_API_KEY` = a chave criada no Resend. Precisa de domínio próprio; é o caminho para uso real (menos chance de cair no spam).

**Como o envio é controlado:**

- Um aviso por pedido e por tipo (tabela `email_notificacoes`): reenviar a tela ou aprovar de novo não manda dois e-mails.
- Cada tentativa fica registrada com a situação (`enviado`, `falhou`, `nao_configurado`) e o erro resumido. Só a administração vê, em Solicitações > pedido > **Avisos por e-mail**, com o botão **Tentar enviar de novo**.
- O aviso de pedido recebido só sai para um pedido **pendente** feito nos últimos 15 minutos com aquele e-mail. A tela "Solicitação enviada" só fala do e-mail quando o provedor confirmou o envio.
- O aviso de aprovado não leva senha nem código: explica como entrar conforme o jeito escolhido na aprovação.

**Teste:** depois de publicar as funções (`docs/melhorias-19-11-2026.md`, seção 4), faça um pedido com um e-mail de teste da equipe, confira a caixa de entrada (e o spam) e aprove. Não use e-mails de pessoas de fora nos testes.

## Como testar

1. Abra `/admin` > Solicitações > um pedido pendente com um Gmail seu > **Aprovar e enviar código por e-mail**.
2. O e-mail chega em até 1 ou 2 minutos (veja também o spam).
3. No app: Login > "Seu pedido foi aprovado? Ativar acesso" > e-mail + código > crie a senha.
4. Teste também "Esqueci minha senha" com essa conta.

Se der erro, a área administrativa mostra o motivo:
- "ainda não foi configurado (SMTP)": a Parte 2 não foi salva.
- "Limite de e-mails por hora": veja a Parte 3.
- "Esse e-mail não existe": o endereço está errado.
