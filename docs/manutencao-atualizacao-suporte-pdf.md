# Manutenção, atualização obrigatória, suporte com acompanhamento e PDF no Android

Funcionalidades acrescentadas na versão 1.1.0 depois do teste no Android. **Nenhuma delas está no Product Backlog aprovado**: estão registradas como requisitos complementares propostos (RC) até a equipe decidir.

| ID | Requisito complementar proposto | Situação |
|---|---|---|
| RC-01 | A pessoa acompanha as mensagens que mandou ao suporte (situação, respostas, histórico) e a administração responde pelo painel | Implementado; testes de banco feitos; teste no app pendente |
| RC-02 | A administração liga e desliga um modo de manutenção, com mensagem e previsão opcional, para web, Android ou os dois | Implementado; tela conferida no navegador com resposta simulada |
| RC-03 | A administração define a versão mínima por plataforma; abaixo dela o app pede a atualização | Implementado; tela conferida no navegador com resposta simulada |
| RC-04 | No Android o PDF pode ser baixado numa pasta escolhida, aberto num leitor e compartilhado como arquivo, com nome padronizado | Implementado; precisa do APK 1.1.0 para testar |
| RC-05 | A conta é ativada com um código numérico enviado ao e-mail (o Supabase manda 8 números), sem link de acesso | Implementado; falta conferir os modelos de e-mail no painel |

---

## 1. Ordem das telas que cobrem o app

O componente `src/components/guarda-do-sistema.tsx` fica em volta de todas as telas (em `src/app/_layout.tsx`). Ele pergunta ao servidor (`estado_do_sistema_fgrcm`) quando o app abre e quando volta para a frente, no máximo uma vez por minuto (o botão "Tentar de novo" ignora esse intervalo). Desde 19/11 também pergunta com o app aberto: a cada 30 minutos, ou a cada 2 minutos sem conexão.

1. **Versão incompatível** (abaixo da mínima e marcada como obrigatória) → tela "Nova versão do FGRC-M disponível". Bloqueia.
2. **Manutenção ligada** para a plataforma → tela "FGRC-M temporariamente indisponível". Bloqueia.
3. **Sem internet** ou **servidor com erro** → só uma faixa no topo. **Não bloqueia**: as avaliações são do aparelho e o questionário funciona sem internet. Perder a internet nunca aparece como "manutenção".
4. **Versão nova não obrigatória** → faixa "Nova versão do FGRC-M disponível" que dá para fechar.
5. Tudo certo → nada.

Depois disso vem o login normal (rotas protegidas do `_layout.tsx`).

**Sem ciclos e sem perder o trabalho:** as telas de baixo continuam montadas, só escondidas. `/admin` e `/suporte` nunca bloqueiam (a administração consegue desligar a manutenção ou corrigir uma versão mínima errada, e a pessoa consegue pedir ajuda). Se tudo der errado, a manutenção também pode ser desligada no Supabase: Table Editor > `sistema_status` > `manutencao_ativa` = false.

**Sem internet e versão obrigatória:** sem resposta do servidor o app não bloqueia quem nunca recebeu o aviso (não dá para saber a versão mínima), para não travar quem está fazendo a avaliação sem sinal. Desde 19/11, quem **já** recebeu o aviso de atualização obrigatória continua bloqueado sem internet (fica lembrado no aparelho até o servidor liberar ou a versão nova ser instalada). Detalhes e limites em `docs/atualizacoes-e-eas-update.md`.

## 2. Manutenção (RC-02)

- Tabela `sistema_status` (uma linha só). Todo mundo consegue **saber** o estado pela função `estado_do_sistema_fgrcm`, que devolve só a mensagem e a previsão; só a administração **muda** (RLS com `e_admin_fgrcm`).
- O banco grava quem mudou e quando, e registra no histórico (`manutencao_ativada`, `manutencao_desativada`, `manutencao_alterada`).
- A previsão de retorno só aparece se for preenchida. O app nunca inventa horário.
- Como usar: `/admin` > **Status do sistema** > escrever a mensagem > (opcional) previsão no formato `18/11/2026 22:30` > **Ligar manutenção** > confirmar. O aviso vale para o app Android e também aparece no navegador usado nos testes (a escolha por plataforma saiu da tela porque o produto é só o APK; o campo `plataformas` continua no banco com `todas`). Para voltar: **Desligar manutenção**.

## 3. Atualização obrigatória (RC-03)

- Tabela `app_versoes`, uma linha por plataforma (`android`, `web`); o painel mostra só a do Android, pois o produto é o APK (a linha `web` fica no banco para o navegador de testes e não precisa ser mexida): versão mais nova, versão mínima, obrigatória, link oficial (só `https://`), mensagem, notas e data de publicação. O banco recusa mínima maior que a atual e link que não seja `https`.
- A versão instalada vem do `version` do `app.json`, que vai junto quando o APK é gerado (`expo-constants`).
- **Android:** "Baixar a versão nova" (antes "Atualizar agora") abre o link oficial do APK; a tela mostra o passo a passo da instalação. A pessoa baixa e instala por cima; o Android mostra "Atualizar app?". O app **não** instala nada sozinho nem passa por cima das proteções do Android.
- **Web:** "Atualizar agora" recarrega a página **uma vez** por versão (marca na aba do navegador). Se mesmo assim abrir a versão velha, mostra um aviso para fechar a aba ou limpar o cache, sem recarregar de novo.
- **EAS Update (atualização pelo ar) não está configurado** neste projeto: o `expo-updates` não está instalado (proposta em `docs/atualizacoes-e-eas-update.md`). Toda mudança no app exige um APK novo. Mudança de código nativo (biblioteca nova, permissão, ícone) sempre exige APK novo, mesmo com EAS Update.
- **O APK 1.0.0 não tem essa verificação**, então não pode ser bloqueado à distância. A partir do 1.1.0 dá.
- Passo a passo depois de publicar um APK novo: `/admin` > Status do sistema > Android > versão mais nova = a nova > link oficial do build (expo.dev, conta `fgrc-m`; abrir no celular antes para conferir) > salvar. Só aumente a **mínima** e marque **obrigatória** quando todo mundo puder baixar (senão quem não tem o link fica preso; nesse caso a pessoa ainda consegue usar o suporte).

## 4. Suporte com acompanhamento (RC-01)

- Tabela nova `support_replies` (respostas). Só a administração escreve e lê direto. Quem respondeu e quando o banco grava sozinho (não dá para forjar).
- A pessoa lê pela função `meus_chamados_fgrcm()`, que usa o login dela: não recebe id, então não adianta trocar número na chamada para ver o chamado de outra pessoa. Ela não vê a observação interna nem o e-mail de quem atendeu ("Equipe FGRC-M").
- Ao responder, o chamado passa de "aberto" para "em atendimento". "Resolvida" e "Reabrir" continuam como antes.
- Mensagens enviadas **sem login** (tela de entrada) não aparecem em Meus chamados, porque não dá para provar de quem são; o painel avisa para responder por e-mail.
- "Responder por e-mail" abre o programa de e-mail do aparelho (Gmail, Outlook) com o endereço, o assunto ("Re: ...") e a mensagem original preenchidos (corrigido em 19/11, B11). O app não envia e-mail sozinho; esse e-mail não fica registrado no painel. Avisar a pessoa por e-mail automaticamente exigiria uma função no servidor com o SMTP; não foi feito para não expor credenciais.
- O suporte nunca inclui respostas de avaliação automaticamente.

## 5. PDF no Android (RC-04)

- `pdf.ts` (celular): gera o PDF com `expo-print`, renomeia para o padrão e guarda numa pasta interna do app (só o app enxerga).
  - **Baixar PDF:** o Android abre o seletor de pastas (sem permissão extra) e o arquivo é gravado na pasta escolhida. A partir do Android 11 o sistema não deixa escolher a raiz de "Download"; a pessoa escolhe ou cria uma subpasta, como `Download/FGRC-M`. O app lembra a última pasta.
  - **Abrir:** passa o arquivo para um leitor de PDF instalado (sem link público). Sem leitor, mostra como resolver.
  - **Compartilhar:** manda o arquivo PDF para WhatsApp, e-mail, Drive.
- `pdf.web.ts` (navegador): baixar, abrir em aba nova e compartilhar o arquivo onde o navegador permitir.
- Nome: `FGRC-M_Avaliacao_AAAA-MM-DD_XXXXXX.pdf` (`src/lib/nome-do-pdf.ts`). Data no fuso do aparelho; `XXXXXX` vem do id da avaliação. Sem dado pessoal.
- Nada vai para a nuvem: o PDF é montado no aparelho, como antes (RNF-001, RNF-002).

## 6. Ativação por código e o link de acesso (RC-05)

- Os e-mails "Invite user" e "Magic link" levam só o código (`{{ .Token }}`, 8 números na configuração atual do Supabase; os textos do app foram corrigidos em 19/11, B12). A pessoa digita em Login > Ativar acesso.
- **Por que o link saiu:** no teste do Android o link era aceito pelo Supabase, mas a pessoa caía no endereço padrão do projeto (`localhost`), que não existe no celular, e a sessão se perdia. Fazer o link funcionar exigiria cadastrar um endereço de retorno do app, tratar a sessão que chega no endereço e decidir o que fazer quando o e-mail é aberto em outro aparelho. Ficou como pendência (`docs/pendencias-limitacoes-e-sugestoes.md`), para não deixar dois caminhos na tela com um deles quebrado.
- O link de **recuperação de senha** continua (ele volta para `fgrcminicial://criar-nova-senha` no celular e funcionou no navegador). Teste no Android: CT49.
