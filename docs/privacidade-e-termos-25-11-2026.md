# Privacidade e termos: junção com a versão da Nicole e ampliação do texto (25/11/2026)

> **Aviso importante.** O texto da tela foi escrito na integração, com apoio de IA, a partir das leis e normas citadas na seção 4. **Não passou por advogado.** Ele descreve o que o aplicativo faz hoje, mas as escolhas jurídicas (seção 6) precisam ser aprovadas pelo grupo e pelo orientador antes de o texto ser tratado como definitivo. O rodapé da tela dizia "Texto em revisão pela equipe do projeto"; essa frase foi retirada a pedido da Josiane (25/11, 13h15), e agora o rodapé mostra só a versão.

## 1. O que foi pedido e o que foi feito

**Pedido (25/11):** juntar a alteração que a Nicole fez em "Privacidade e termos" (PR #8, de 23/11) com o que já estava no `main` e melhorar o resultado, para ficar sério e embasado como as políticas de aplicativos grandes.

**Feito:**

1. As duas versões do arquivo `src/app/privacidade.tsx` foram juntadas (seção 2). Tudo o que a Nicole escreveu continua no texto.
2. O texto foi dividido em **Resumo**, **Política de Privacidade** (12 seções), **Termos de Uso** (13 seções) e **Referências** (as 4 da Nicole e mais 2).
3. Entraram as informações que a LGPD manda dar ao titular (art. 9º) e os direitos do art. 18 (seção 4).
4. Cada afirmação foi conferida no código, nas migrações e no banco (seção 5).
5. O pedido de acesso ganhou um aviso com link para a política, antes do botão de enviar.
6. A tela "Conheça o FGRC-M" teve uma frase ajustada para dizer o mesmo que a política.
7. Um teste automático novo compara o texto com o que o código faz (seção 7).

Nada foi alterado no Supabase. Nenhum commit, push ou merge foi feito: o passo a passo está na seção 8.

## 2. De onde veio cada parte do arquivo

| Parte da tela | Quem escreveu | O que aconteceu em 25/11 |
|---|---|---|
| Comentário `//[alteração — 23/11/2026]` no começo do arquivo | Nicole | Mantido igual |
| "O que fica só no seu aparelho" (3 parágrafos) | Texto do `main` com os ajustes de redação da Nicole ("servidor do FGRC-M", "pelo aplicativo", "podem ser perdidas") | Mantidos iguais. Virou a seção 3 da Política, com 4 parágrafos novos (PDF gerado no aparelho, preferências, cópia de segurança do aparelho e aparelho compartilhado) |
| "O que vai para o servidor" (3 parágrafos) | Texto do `main`; a Nicole ajustou o parágrafo do suporte | Mantidos iguais. Virou a seção 2 da Política, com 6 parágrafos novos |
| "Quem pode ver esses dados" | Texto do `main` com ajuste da Nicole | Seção 5 da Política. A primeira frase passou a citar também as contas e a exclusão |
| **"Sua responsabilidade pelas informações"** | **Nicole** | Seção 5 dos Termos, 3 parágrafos iguais, mais a frase dela que estava em "Regras de uso" |
| **"Sua responsabilidade pelo PDF"** | **Nicole** | Seção 6 dos Termos, 5 parágrafos iguais, mais 1 novo sobre o botão Compartilhar PDF |
| "Seus direitos" (3 parágrafos) | Texto do `main`; a Nicole acrescentou o parágrafo das cópias em PDF | Mantidos iguais na seção 9 da Política, que ganhou a lista de direitos do art. 18, o prazo e o atalho para o suporte |
| "Regras de uso" (2 parágrafos) | Texto do `main` com ajustes da Nicole | Mantidos iguais nas seções 4 e 5 dos Termos |
| **Referências** (NIST CSF 2.0, CIS Controls, ISO/IEC 27001:2022 e LGPD, com link, endereço visível e o aviso de que não é certificação) | **Nicole** | Mantidas iguais. Entraram Marco Civil da Internet e ANPD. O link ganhou mais área de toque |
| `useEstilosEscalados` (tamanho do texto das Configurações) | Integração de 19/11, no `main` | Mantido. A branch da Nicole não tinha essa mudança, e é daí que vem o conflito do PR #8 |
| Resumo, divisão em Política e Termos, seções novas, data da versão, atalho "Abrir Ajuda e suporte" | Integração de 25/11 | Novo |

## 3. Alterações (problema, arquivo, correção, teste, resultado)

| # | Problema encontrado | Arquivo | O que foi feito | Teste | Resultado |
|---|---|---|---|---|---|
| 1 | O PR #8 partiu de uma versão antiga do arquivo. O `main` mudou o mesmo arquivo em 19/11, então o GitHub acusa conflito e o PR não pode ser aceito com um clique | `src/app/privacidade.tsx` | As duas versões foram juntadas à mão: texto e referências da Nicole + tamanho do texto do `main` | `teste-privacidade.cjs`: 17 parágrafos da Nicole iguais, 4 referências, comentário dela, escala do texto. Merge ensaiado em um clone separado | Passou. No ensaio, o merge da branch dela fecha com 1 arquivo em conflito, resolvido escolhendo a versão do `main` |
| 2 | O texto não trazia o que a LGPD manda informar: finalidade e base legal, tempo de guarda, quem responde e como falar com a equipe, fornecedores, onde os dados ficam, lista de direitos e o que acontece em caso de incidente | `src/app/privacidade.tsx` | Política de Privacidade com 12 seções e Termos de Uso com 13, em linguagem simples, com resumo no começo | 7 conferências do art. 9º, 12 palavras-chave dos direitos do art. 18, transferência internacional, incidente e leis citadas | Passou |
| 3 | A tela "Conheça o FGRC-M" dizia que as respostas "não vão para a internet". O app não envia, mas ele não controla a cópia de segurança que o próprio celular faz | `src/features/entrada/ConhecaScreen.tsx` | Frase trocada por "não são enviados ao servidor do FGRC-M" (a mesma redação que a Nicole usou) | Conferência no teste | Passou |
| 4 | Quem pedia acesso entregava nome e e-mail sem nenhum aviso de privacidade na própria tela | `src/app/solicitar-acesso.tsx` | Aviso antes do botão: "Ao enviar, você declara que leu e concorda com a Política de Privacidade e com os Termos de Uso", com link para a tela | Navegador de teste: posição do aviso, link abre a política por cima do formulário, o que foi digitado continua, o envio grava os mesmos 6 dados | Passou no navegador de teste. **Falta conferir no app de verdade** |
| 5 | Os links das referências tinham 23 px de altura, difíceis de acertar com o dedo | `src/app/privacidade.tsx` | Espaço em cima e embaixo do link | Navegador de teste: menor altura medida | 39 px |
| 6 | Nada avisava se o código mudasse e o texto ficasse desatualizado | `tests/teste-privacidade.cjs` (novo) e `tests/rodar-testes.cjs` | 58 conferências rodando no `npm test` | 16 erros colocados de propósito em cópias do projeto | Os 16 foram pegos |

Os comentários antigos do arquivo foram mantidos. Os trechos novos estão marcados com `[integração 25/11]`.

## 4. Embasamento: o que cada parte do texto atende

| Assunto | Onde está no texto | Base | Fonte |
|---|---|---|---|
| Informar finalidade, forma e duração, quem é o controlador, contato, compartilhamento, responsabilidades e direitos | Política, seções 1, 4, 5, 7 e 9 | LGPD, art. 9º, I a VII | [1] |
| Base legal de cada uso | Política, seção 4 | LGPD, art. 7º, II, V e IX | [1] |
| Informações claras sobre coleta, uso, armazenamento e proteção; clareza das políticas de uso | Texto inteiro e aviso no pedido de acesso | Marco Civil da Internet, art. 7º, VIII e XI | [2] |
| Não entregar dados a terceiros fora das hipóteses legais | Política, seção 5 | Marco Civil da Internet, art. 7º, VII | [2] |
| Exclusão definitiva dos dados ao fim da relação | Política, seções 7 e 9 | Marco Civil da Internet, art. 7º, X; LGPD, arts. 15, 16 e 18 | [1] [2] |
| Lista de direitos do titular e petição à ANPD | Política, seção 9 | LGPD, art. 18 e § 1º | [1] [7] |
| Prazo de resposta | Política, seção 9 ("até 15 dias") | LGPD, art. 19, II | [1] |
| Servidor fora do Brasil | Política, seção 6 | LGPD, arts. 33 a 36; Resolução CD/ANPD nº 19/2024 | [1] [5] |
| Medidas de segurança | Política, seção 8 | LGPD, art. 46 | [1] |
| Aviso de incidente à ANPD e ao titular | Política, seção 8 | LGPD, art. 48; Resolução CD/ANPD nº 15/2024 | [1] [4] |
| Canal de atendimento em vez de encarregado | Política, seção 1 | LGPD, art. 41, § 3º; Resolução CD/ANPD nº 2/2022 | [1] [3] |
| Nome atual da ANPD: "Agência Nacional de Proteção de Dados" | Política, seção 8, e Referências | Redação atual da LGPD | [1] [7] |

O que as fontes dizem, em resumo: a LGPD lista no art. 9º as informações que o titular tem direito de receber e no art. 18 os direitos que ele pode exercer; o Marco Civil garante informações claras e completas sobre o uso dos dados; a Resolução nº 2/2022 dispensa agentes de pequeno porte de indicar encarregado, desde que ofereçam um canal de comunicação, e dá prazos em dobro; a Resolução nº 15/2024 fixa 3 dias úteis para comunicar incidente com risco relevante; a página da ANPD sobre transferência internacional informa que, até agora, só a União Europeia foi reconhecida como adequada (Resolução nº 32/2026).

## 5. Conferência do texto com o app

| O que o texto afirma | Onde foi conferido | Resultado |
|---|---|---|
| O pedido de acesso envia nome, e-mail, prefeitura, município, estado e de onde saiu | `src/app/solicitar-acesso.tsx` (gravação em `access_requests`), colunas da tabela no banco e envio simulado no navegador de teste | Confere: 6 campos |
| O suporte envia nome, e-mail, assunto, texto e de onde saiu; com a conta aberta, a mensagem fica ligada à conta | `src/app/suporte.tsx` e tabela `support_requests` (coluna `user_id` preenchida pelo banco) | Confere |
| A conta guarda nome, e-mail, prefeitura, município e estado | Tabelas do banco: não existe tabela de perfil; os dados ficam na conta do serviço de login | Confere |
| O login registra data, hora, IP e tipo de navegador ou aparelho | Colunas das tabelas de sessão e de auditoria do serviço de login (consulta só de leitura aos nomes das colunas) | Confere: `ip`, `user_agent` e `ip_address` |
| Fica registrado o aviso por e-mail (destino, data e resultado) | Tabela `email_notificacoes` | Confere |
| Respostas, rascunho, histórico e resultados não vão para o servidor | Nenhum arquivo de avaliação, resultado ou relatório chama o servidor (22 arquivos); fora da administração, o app só usa 2 tabelas (pedido de acesso e suporte), 3 consultas (situação do pedido, meus chamados e estado do sistema) e 1 função (aviso por e-mail) | Confere |
| O PDF é gerado no aparelho | `pdf.ts` (celular) e `pdf.web.ts` (navegador) | Confere |
| A tela Situação do pedido mostra só a situação | Função `situacao_do_pedido` na migração de 18/11 | Confere: devolve só `status` |
| Sem anúncios, rastreadores, localização, câmera, microfone ou contatos | `package.json`, `app.json` e busca no código | Confere |
| Senha com 10 caracteres, maiúscula, minúscula, número e símbolo | `src/lib/politica-senha.ts` | Confere |
| O que acontece na exclusão (pedido pendente apagado; nome, e-mail e texto removidos do que fica) | Migração `20261119140000_fgrcm_exclusao_definitiva.sql` | Confere |
| O servidor fica no Canadá | Dados do projeto no Supabase em 25/11/2026: região `ca-central-1` | Confere |
| O fornecedor criptografa os dados guardados e em transmissão; as APIs só aceitam HTTPS | Páginas de segurança do Supabase | Confere [8] |
| O aparelho pode fazer cópia de segurança dos dados do app | Documentação do Android: o backup automático vem ligado por padrão; o `app.json` não desliga | Confere [9] |
| Privacidade e termos e Ajuda e suporte abrem sem login | `src/components/app-navigation.tsx` | Confere |
| Nomes de telas e botões citados (Meu perfil, Meus chamados, Ajuda e suporte, Situação do pedido, Compartilhar PDF, "Outro assunto") | Telas correspondentes | Confere |

## 6. Pontos para o grupo e o orientador decidirem

1. **Quem aparece como responsável pelos dados.** O texto diz que a controladora é a equipe do projeto (estudantes de Ciência da Computação da PUC Minas, com orientação de professores). Confirmar com o orientador se é assim que a universidade deve ser citada.
2. **Bases legais.** Foram indicadas: execução do serviço a pedido da pessoa (art. 7º, V), legítimo interesse para segurança e registro das decisões (art. 7º, IX) e obrigação legal (art. 7º, II). É uma proposta.
3. **Servidor no Canadá.** O projeto do Supabase foi criado na região `ca-central-1`. O texto informa isso, mas não escolhe o mecanismo legal da transferência. Caminhos possíveis: sustentar a hipótese do art. 33, IX (necessária para executar o serviço pedido pelo titular), ou recriar o projeto na região de São Paulo. A segunda opção muda o banco e não foi feita.
4. **Prazo de 15 dias.** É o prazo do art. 19, II. A Resolução nº 2/2022 dá prazo em dobro para agentes de pequeno porte. O grupo precisa confirmar que consegue responder nesse prazo e quem responde.
5. **Apagar os dados ao fim do projeto.** O texto assume esse compromisso (arts. 15 e 16). Definir quem faz e quando.
6. **Cópia de segurança do Android.** Para a frase "as respostas ficam só no seu aparelho" valer sem ressalva, vale desligar o backup automático no próximo APK (no Expo, a opção `android.allowBackup` do `app.json`; conferir na documentação do Expo antes de mudar). Consequência: ao trocar de celular, as avaliações não vão junto, o que já é o comportamento descrito na política. Não foi alterado.
7. **Assunto próprio no suporte.** Hoje o texto manda escolher "Outro assunto". Criar o assunto "Privacidade e dados pessoais" exige mudar a tela e a regra da tabela `support_requests` no Supabase (migração), então depende de autorização.
8. **Aceite dos termos.** Atualizado às 13h: a leitura dos Termos é obrigatória na ativação e o aceite fica no `user_metadata` (seção 11). Se o orientador quiser um registro que a pessoa não consiga alterar, precisa de tabela própria (migração).
9. **Classificação como agente de pequeno porte.** O canal de atendimento no lugar do encarregado parte dessa classificação (Resolução nº 2/2022). Confirmar.
10. **Serviço de e-mail.** Quando o envio for configurado, colocar o nome do provedor na seção 5 da Política.
11. **Arquivo `LICENSE` do repositório.** Ainda é o do modelo do Expo, em nome da empresa do Expo. O grupo precisa decidir a licença do próprio código; a seção 10 dos Termos só diz que o app foi criado pela equipe.
12. **Limites de responsabilidade e lei aplicável** (Termos, seções 11 e 13). Redação cuidadosa ("dentro do que a lei permite"), mas é a parte que mais precisa de revisão jurídica.
13. **Idade mínima.** O texto diz que o app é para maiores de 18 anos, mas o app não confere a idade.
14. **Termo de consentimento do teste de usabilidade.** É outro documento (tarefa 1 do grupo). Vale usar as mesmas palavras desta política para não haver contradição.

## 7. Testes

| Onde | O que foi conferido | Resultado em 25/11 |
|---|---|---|
| `npm test` (`node tests/rodar-testes.cjs`) | 18 arquivos de teste. O novo `teste-privacidade.cjs` tem 58 conferências | 346 conferências passaram (eram 288), com fim de linha do Linux e do Windows |
| Erros colocados de propósito | 16 cópias do projeto, cada uma com um erro (campo novo no pedido, pacote de localização, resposta gravada no servidor, tabela nova, senha mínima menor, frase da Nicole apagada, e-mail escrito no texto, versão antiga da tela etc.) | O teste novo acusou os 16 |
| Navegador de teste (Chrome sem janela, com uma imitação simples do React Native) | Privacidade e termos: ordem dos 30 títulos, 6 referências abrindo o endereço certo, atalhos do suporte, botão Voltar, contraste nos 4 temas, texto em 150%, tela de 320 px. Pedido de acesso: aviso, link, envio | 34 conferências passaram. As 35 das telas alteradas de manhã continuam passando |
| Sintaxe e tipos (conferência reduzida) | Arquivos alterados | Sem erro novo |

O navegador de teste **não é o app de verdade**. No computador da Josiane ainda precisam rodar `npx tsc --noEmit`, `npx expo lint`, `npm test` e o app (seção 9).

## 8. Como juntar com o PR #8 (GitHub Desktop)

O arquivo novo já contém o texto da Nicole. O merge serve para o commit dela entrar no histórico do `main` e o PR #8 aparecer como aceito ("Merged").

1. No GitHub Desktop, com a branch `main` selecionada, faça o commit de tudo o que está pendente.
2. Clique em **Fetch origin**.
3. Menu **Branch > Merge into current branch...**, escolha `origin/integracao/revisao-geral` e confirme.
4. O GitHub Desktop avisa que há **1 arquivo em conflito**: `src\app\privacidade.tsx`. Ao lado do arquivo, abra a setinha do botão e escolha **Use the modified file from main**. Depois clique em **Continue merge**.
5. No terminal do VS Code, rode `npm test`. Se a versão errada tiver sido escolhida, o `teste-privacidade.cjs` falha e avisa.
6. Clique em **Push origin**. No GitHub, o PR #8 passa a aparecer como "Merged".

Se preferir não fazer o merge: faça o commit e o push normalmente e feche o PR #8 com um comentário dizendo que o conteúdo foi incorporado. Nesse caso, o commit da Nicole não entra no histórico do `main`.

## 9. O que falta conferir no app de verdade

1. Abrir **Privacidade e termos** pela página inicial (sem login) e pelo menu Mais: ler do começo ao fim, conferir a rolagem e o botão Voltar.
2. Tocar em uma referência: o site abre no navegador.
3. Tocar em **Abrir Ajuda e suporte**: abre a tela de suporte; Voltar retorna para a política.
4. No **pedido de acesso**: preencher os campos, tocar no trecho sublinhado do aviso, voltar e ver se o que foi digitado continua lá.
5. Repetir os itens 1 e 4 no tema escuro, no alto contraste e com o texto grande.
6. No celular (Android), conferir os mesmos itens depois do próximo APK.

## 10. Fontes

1. Lei nº 13.709/2018 (LGPD), texto atualizado: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
2. Lei nº 12.965/2014 (Marco Civil da Internet): https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
3. Resolução CD/ANPD nº 2/2022 (agentes de tratamento de pequeno porte): https://in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-2-de-27-de-janeiro-de-2022-376562019
4. Resolução CD/ANPD nº 15/2024 (comunicação de incidente de segurança): https://www.in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024
5. ANPD, transferência internacional de dados (Resolução CD/ANPD nº 19/2024 e decisões de adequação): https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/international-affairs
6. ANPD, fluxo da petição do titular: https://www.gov.br/anpd/pt-br/fluxo-da-peticao-do-titular
7. ANPD, página do titular de dados: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados
8. Supabase, segurança e local dos dados: https://supabase.com/security , https://supabase.com/docs/guides/platform/security e https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
9. Android, backup automático dos dados dos apps: https://developer.android.com/identity/data/autobackup

Consultadas em 25/11/2026.

## 11. Leitura obrigatória dos Termos de Uso na ativação (25/11, 13h)

**Pedido:** tornar obrigatória a leitura dos Termos de Uso ao ativar a conta, numa janela sobreposta como a do tutorial, em que a pessoa rola até o fim para ler e aceitar.

**Como ficou:**

- A janela "Termos de Uso" abre por cima da tela, com fundo escurecido (mesmo estilo do tutorial). Mostra os 13 itens dos Termos, uma barrinha de progresso e dois botões.
- Enquanto a pessoa não chega ao fim do texto, o botão principal é **Continuar lendo** (desce quase uma tela por toque). Ao chegar ao fim, ele vira **Li e aceito**. Toques no primeiro meio segundo depois que o botão aparece não contam, para ninguém aceitar sem querer tocando rápido.
- **Não aceito**: na ativação por código, sai da tela; no primeiro acesso com senha provisória, sai da conta. Sem aceite, a conta não é ativada.
- A janela tem o link **Abrir Privacidade e termos** para a política completa.
- **Ativação por código** (`src/app/ativar-acesso.tsx`): a janela abre junto com a tela, e o formulário só aparece depois do aceite. Confirmado o código, o aceite é gravado na conta; ele vai de novo junto com a senha.
- **Primeiro acesso com senha provisória** (`src/features/p01-login-inicio/HomeScreen.tsx`): a janela abre na Home antes da troca de senha. O aceite é gravado e só então a pessoa segue. Sem internet, aparece o aviso e ela não avança. Quem já aceitou esta versão não lê de novo; quem aceitou uma versão antiga lê a nova.
- **O que fica gravado:** na conta (campo `user_metadata` do Supabase), `termos_aceitos_versao` (a data do texto, hoje 25/11/2026) e `termos_aceitos_em` (data e hora). A Política (seção 2) e os Termos (item 1) passaram a dizer isso.
- **Limite:** o `user_metadata` pode ser alterado pela própria pessoa, então é um registro simples, não uma prova forte. Um registro à prova de alteração exigiria tabela própria no Supabase (migração), o que depende de autorização.
- Os textos agora ficam em `src/lib/termos-e-privacidade.ts`, usado pela tela Privacidade e termos e pela janela (um texto só, dois lugares).

| Arquivo | Situação |
|---|---|
| `src/lib/termos-e-privacidade.ts` | Novo (textos que estavam em `privacidade.tsx`) |
| `src/lib/aceite-dos-termos.ts` | Novo (regras da rolagem e do registro, testáveis sem tela) |
| `src/features/integracao/AceiteDosTermos.tsx` | Novo (a janela) |
| `src/app/privacidade.tsx` | Passa a importar os textos |
| `src/app/ativar-acesso.tsx` e `src/features/p01-login-inicio/HomeScreen.tsx` | Ligados à janela (trechos marcados `[integração 25/11]`) |
| `tests/teste-aceite-termos.cjs` | Novo, 53 verificações |

**Testes:** `npm test` com 19 arquivos e 402 verificações; 21 defeitos colocados de propósito foram todos acusados. No navegador de teste (imitação): abertura, rolagem, botão, toque rápido, "Não aceito", celular que não avisa a rolagem, caminho completo até a senha, código errado, 4 temas, 5 tamanhos de tela e os casos da Home. **Falta testar no app real e no celular** (seção 12).

**Achado:** no tema escuro (sem alto contraste), os botões padrão do app ficam abaixo do mínimo de 4,5:1: o azul cheio (`FgrcButton` "filled", 3,8:1) e o de contorno ("outlined", 3,7:1). Na janela, o "Não aceito" usa a cor do texto. O "Continuar lendo" continua com o botão azul padrão, porque corrigir mexe na paleta do app inteiro (`src/components/fgrc-colors.ts`) e precisa da aprovação do grupo. O alto contraste escuro, corrigido de manhã, passa.

## 12. O que testar no app real (aceite dos termos)

1. Ativar uma conta pelo código: a janela aparece, "Continuar lendo" desce, "Li e aceito" só aparece no fim, o formulário aparece depois.
2. Primeiro acesso com senha provisória: a janela aparece na Home antes da troca de senha.
3. "Não aceito" nos dois casos.
4. Rolar com o dedo até o fim (Android e navegador).
5. Tema escuro, alto contraste e texto grande.
6. Painel do Supabase (Authentication > Users > a conta > *User Metadata*): conferir `termos_aceitos_versao` e `termos_aceitos_em`.

## Anexo: texto completo da tela (cópia de 25/11/2026)

Cópia gerada a partir do arquivo `src/lib/termos-e-privacidade.ts`, para o grupo e o orientador revisarem sem abrir o app. **O que vale é o arquivo da tela**: se o texto mudar lá, esta cópia fica desatualizada.

**Privacidade e termos**

Última atualização: 25/11/2026

### Resumo

- As respostas, o histórico e os resultados das avaliações ficam guardados no seu aparelho. Eles não são enviados ao servidor do FGRC-M.
- O servidor guarda só o necessário para a sua conta, o seu pedido de acesso e as suas mensagens de suporte.
- O FGRC-M não vende dados, não mostra anúncios e não usa ferramentas de rastreamento.
- Você é responsável pelas informações que registra e pelo relatório em PDF depois de salvar ou compartilhar o arquivo.
- O resultado é uma orientação. Ele não substitui auditoria, certificação nem análise de especialistas.
- Você pode consultar, corrigir ou pedir a exclusão dos seus dados pessoais em Ajuda e suporte.

Este resumo ajuda a entender, mas não substitui o texto completo abaixo.

### Política de Privacidade

**1. O que é o FGRC-M e quem responde pelos seus dados**

O FGRC-M é um aplicativo de autoavaliação de riscos cibernéticos para prefeituras, feito como projeto acadêmico da PUC Minas. Ele está em fase de testes.

O uso é gratuito e o projeto não tem fins comerciais.

Quem decide como os dados pessoais são usados no aplicativo é a equipe do projeto FGRC-M, formada por estudantes de Ciência da Computação da PUC Minas, com orientação de professores. Para a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018), essa equipe é a controladora dos dados.

Canal de atendimento sobre dados pessoais: Ajuda e suporte, dentro do aplicativo (na página inicial ou no menu Mais). Escolha "Outro assunto" e escreva que o pedido é sobre dados pessoais.

**2. Quais dados pessoais o aplicativo usa**

Para a sua conta funcionar, ficam guardados no servidor do app (Supabase): nome completo, e-mail, prefeitura, município e estado. A senha é guardada pelo serviço de login de forma protegida; nem a equipe do FGRC-M consegue ver a sua senha. Se você recebeu uma senha provisória, o app pede para trocar no primeiro acesso.

A senha provisória ou o código de acesso é gerado pela administração e entregue a você por e-mail ou por mensagem. Ele serve só para o primeiro acesso: depois que você cria a sua senha, ninguém mais consegue vê-la.

Quando você pede acesso, enviamos: nome, e-mail, prefeitura, município, estado, a data e se o pedido saiu do navegador ou do celular.

O pedido também guarda a situação (pendente, aprovado ou recusado) e a data em que foi analisado.

Quando você fala com o suporte, enviamos: nome, e-mail, assunto e o texto que você escreveu. As respostas das avaliações não são incluídas automaticamente. Não coloque senhas ou informações sigilosas na mensagem.

Se você estiver com a conta aberta ao falar com o suporte, a mensagem fica ligada à sua conta, para você acompanhar a resposta em Meus chamados.

Quando você entra na conta, o serviço de login registra a data e a hora, o endereço IP e o tipo de navegador ou aparelho. Esses registros técnicos servem para a segurança da conta.

Quando um aviso sobre o seu pedido é enviado por e-mail, fica registrado o endereço de destino, a data e se o envio deu certo.

Quando você aceita os Termos de Uso na ativação da conta, ficam registradas na conta a versão dos termos e a data do aceite.

O FGRC-M não pede CPF, telefone, endereço nem documentos. Ele não usa a localização, a câmera, o microfone ou os contatos do aparelho e não trata dados pessoais sensíveis, como dados de saúde, religião ou biometria.

**3. O que fica só no seu aparelho**

As respostas das avaliações, o rascunho, o histórico e os resultados ficam guardados apenas no celular ou no navegador onde você usa o app. Essas informações não são enviadas ao servidor do FGRC-M.

O relatório em PDF é gerado no próprio aparelho. Ele só sai do aparelho quando você baixa, salva ou compartilha o arquivo.

Cada conta tem o seu próprio espaço no aparelho. Se outra pessoa entrar com outra conta no mesmo aparelho, ela não vê as suas avaliações pelo aplicativo.

Também ficam no aparelho as suas preferências (tema, tamanho do texto e acessibilidade) e as informações que mantêm a sua conta aberta.

Se você desinstalar o app ou apagar os dados do navegador, essas informações podem ser perdidas e não poderão ser recuperadas pelo FGRC-M. Exporte e guarde os relatórios em PDF que forem importantes.

As cópias de segurança feitas pelo próprio aparelho ou navegador (por exemplo, o backup do celular na conta do dono do aparelho) não são controladas pelo FGRC-M.

Proteja o aparelho com senha ou biometria. Em computador ou celular compartilhado, saia da conta ao terminar: as informações continuam guardadas no aparelho e passam a depender da proteção dele.

**4. Para que os dados são usados**

Os dados pessoais são usados apenas para:

- Analisar o seu pedido de acesso, criar e manter a sua conta e permitir a sua entrada no aplicativo. Base legal: os dados são necessários para atender o seu pedido e prestar o serviço a você (LGPD, art. 7º, V).
- Responder às suas mensagens de suporte e avisar você sobre o pedido de acesso, a ativação da conta e a recuperação de senha. Base legal: a mesma (art. 7º, V).
- Proteger as contas, evitar uso indevido e manter o registro das decisões da administração. Base legal: legítimo interesse em manter o aplicativo seguro (art. 7º, IX).
- Cumprir a lei ou a ordem de uma autoridade competente, quando houver (art. 7º, II).

Os seus dados não são vendidos e não são usados para publicidade nem para montar perfis. Quem aprova ou recusa um pedido de acesso é sempre uma pessoa da administração.

O índice de exposição a riscos é calculado no seu aparelho e fala da prefeitura, não de você.

**5. Quem pode ver os dados e com quem são compartilhados**

Só a administração do FGRC-M (integrantes da equipe com conta de administração) vê as contas, os pedidos de acesso e as mensagens de suporte. Cada decisão da administração (aprovar, recusar, atender, excluir) fica registrada com o e-mail de quem decidiu e o horário.

Outras prefeituras e outros usuários não têm acesso aos seus dados pelo aplicativo.

Na tela Situação do pedido, quem digitar o seu e-mail vê apenas se o pedido está pendente, aprovado ou recusado. Nenhum outro dado aparece.

Para funcionar, o FGRC-M usa serviços de outras empresas, que tratam os dados em nome da equipe:

- Supabase: guarda o banco de dados e faz o serviço de login.
- Serviço de e-mail: entrega os avisos sobre o pedido de acesso, os e-mails de ativação e de recuperação de senha e as respostas do suporte enviadas por e-mail.
- Expo: hospeda a versão do aplicativo para navegador e o arquivo de instalação para Android. Como em qualquer site, o acesso gera registros técnicos, como o endereço IP.

A equipe do FGRC-M continua responsável pelos seus dados mesmo quando usa esses serviços.

Fora desses casos, os seus dados só são entregues a terceiros se a lei ou a ordem de uma autoridade competente exigir.

**6. Onde os dados ficam guardados**

O banco de dados e o serviço de login do FGRC-M ficam em servidores do Supabase localizados no Canadá. Por isso, os dados da conta, dos pedidos de acesso e do suporte ficam guardados fora do Brasil. A LGPD chama isso de transferência internacional de dados (arts. 33 a 36).

Essa transferência é necessária para a sua conta existir e para a equipe atender os seus pedidos, porque o banco de dados e o login do aplicativo funcionam nesse serviço. O fornecedor informa que protege os dados com criptografia, tanto guardados quanto em transmissão. Alguns serviços de apoio dos fornecedores podem funcionar em outros países.

As respostas das avaliações não fazem parte dessa transferência: elas ficam no seu aparelho.

**7. Por quanto tempo os dados ficam guardados**

Cada tipo de dado fica guardado por um tempo diferente:

- Conta: enquanto ela existir. Você pode pedir a exclusão a qualquer momento.
- Pedido de acesso: fica guardado como registro da decisão da administração. Na exclusão da conta, o pedido ainda pendente é apagado; nos pedidos já analisados, o seu nome e o seu e-mail são removidos.
- Mensagens de suporte: ficam guardadas para acompanhar o atendimento. Na exclusão da conta, o seu nome, o seu e-mail e o texto das mensagens são removidos.
- Registro das decisões da administração: é mantido para prestação de contas. Na exclusão da conta, o seu e-mail é retirado desse registro.
- Registros técnicos de acesso: pelo prazo definido pelo serviço de login.
- Dados no seu aparelho: até você apagar, desinstalando o app ou limpando os dados do navegador.

Quando o projeto acadêmico for encerrado, os dados pessoais guardados no servidor serão apagados, salvo o que a lei mandar guardar (LGPD, arts. 15 e 16).

**8. Como os dados são protegidos**

As principais medidas de segurança são:

- A comunicação entre o aplicativo e o servidor é criptografada (HTTPS).
- A senha precisa ser forte: pelo menos 10 caracteres, com letra maiúscula, letra minúscula, número e símbolo. Ela nunca é guardada de forma legível.
- O banco de dados tem regras de acesso: uma conta comum não consegue ler contas, pedidos ou mensagens de outras pessoas.
- As ações da administração só são feitas por contas autorizadas e ficam registradas.
- As respostas das avaliações não são enviadas ao servidor, para não reunir em um só lugar as fragilidades de várias prefeituras.

Nenhum sistema é totalmente seguro. Se acontecer um incidente de segurança que possa causar risco ou dano relevante a você, a equipe vai avisar você e a Agência Nacional de Proteção de Dados (ANPD), como determina a LGPD (art. 48).

**9. Seus direitos**

A LGPD (art. 18) garante a você, a qualquer momento e sem custo:

- confirmar se o FGRC-M trata dados seus e ter acesso a eles;
- corrigir dados incompletos, errados ou desatualizados;
- pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desacordo com a lei;
- pedir a portabilidade dos dados, conforme as regras da ANPD;
- saber com quem os seus dados foram compartilhados;
- ser informado sobre a possibilidade de não dar consentimento e sobre as consequências disso, revogar um consentimento já dado e pedir a eliminação dos dados tratados com base nele. Hoje o FGRC-M não usa o consentimento como base legal;
- se opor a um tratamento feito em desacordo com a lei;
- apresentar uma petição à ANPD, se a equipe não resolver o seu pedido (art. 18, § 1º).

Você pode corrigir o seu nome e o seu e-mail em Mais › Meu perfil. Prefeitura, município e estado só a administração altera.

Para pedir a exclusão da sua conta ou tirar dúvidas sobre os seus dados pessoais (Lei Geral de Proteção de Dados, Lei nº 13.709/2018), use Ajuda e suporte.

Se você só fez o pedido de acesso e ainda não tem conta, também pode pedir que ele seja apagado.

A equipe responde em até 15 dias. Para proteger você, pode ser pedido que a solicitação venha do e-mail da conta.

A exclusão da conta não apaga as cópias dos relatórios em PDF que você já salvou ou compartilhou fora do aplicativo.

A exclusão da conta também não apaga o que está guardado no seu aparelho. Para apagar, desinstale o app ou limpe os dados do navegador.

[atalho: Abrir Ajuda e suporte]

**10. Crianças e adolescentes**

O FGRC-M é destinado a servidores e pessoas autorizadas pelas prefeituras, maiores de 18 anos. Ele não é voltado a crianças e adolescentes.

**11. Cookies e rastreamento**

O FGRC-M não usa cookies de publicidade nem ferramentas de rastreamento ou de medição de audiência.

No navegador, ele usa o armazenamento local apenas para manter a sua conta aberta e guardar as suas avaliações, as suas preferências e pequenos dados de funcionamento (por exemplo, se você já viu o tutorial).

**12. Mudanças nesta política**

Esta política pode ser atualizada. A versão em vigor é a que está publicada nesta tela, com a data. Mudanças importantes serão avisadas pelo aplicativo ou por e-mail.

### Termos de Uso

**1. Aceitação**

Ao pedir acesso, ativar a conta ou usar o FGRC-M, você declara que leu e concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não use o aplicativo.

Na ativação da conta, o aplicativo mostra estes termos e só continua depois que você lê até o fim e toca em Li e aceito. O aceite fica registrado na sua conta, com a data e a versão dos termos.

**2. O que o FGRC-M faz e o que ele não faz**

O FGRC-M ajuda a prefeitura a avaliar a própria exposição a riscos cibernéticos, com um questionário, indicadores e recomendações.

Os resultados servem para orientar a prefeitura. Eles não substituem uma auditoria, uma certificação ou uma análise feita por especialistas.

Os resultados dependem das respostas informadas e das regras desta versão do aplicativo. Eles não comprovam que a prefeitura cumpre leis, normas ou padrões, como a LGPD, o NIST Cybersecurity Framework, os Controles CIS ou a ISO/IEC 27001.

O aplicativo é um projeto acadêmico em fase de testes e pode conter erros.

**3. Quem pode usar**

O FGRC-M é para servidores e pessoas autorizadas a representar a prefeitura, maiores de 18 anos.

A administração do FGRC-M confere cada pedido de acesso e pode recusar um pedido que não consiga confirmar.

**4. Sua conta e sua senha**

O acesso é pessoal e só é liberado depois que a administração confere o pedido. Não compartilhe a sua senha nem utilize a conta de outra pessoa.

Use uma senha forte e que você não usa em outros lugares. Se você receber uma senha provisória ou um código de acesso, crie a sua própria senha no primeiro acesso.

Você responde pelo que for feito com a sua conta. Se desconfiar que outra pessoa usou a sua conta, troque a senha e avise a equipe em Ajuda e suporte.

**5. Sua responsabilidade pelas informações**

Você é responsável pela veracidade e atualização das informações que registra e deve ter autorização para responder em nome da prefeitura.

Confira as respostas antes de concluir a avaliação. Informações incorretas ou incompletas podem comprometer os resultados e as recomendações.

Não inclua senhas, credenciais ou dados pessoais e sigilosos que não sejam necessários à avaliação.

Use o aplicativo apenas para avaliações autorizadas. A prefeitura e o usuário responsável pelo preenchimento devem conferir as informações e avaliar as recomendações antes de tomar decisões.

**6. Sua responsabilidade pelo PDF**

O relatório em PDF é gerado com base nas respostas registradas. Você é responsável por conferir o conteúdo antes de utilizar ou compartilhar o documento.

Após salvar ou exportar o PDF, você é responsável pela guarda, pelo uso, pelas cópias e pelo compartilhamento do arquivo sob seu controle.

O relatório pode conter informações sobre riscos e fragilidades da prefeitura. Compartilhe apenas com pessoas autorizadas e evite deixar o arquivo em dispositivos, links ou canais públicos.

Quando você usa Compartilhar PDF, o arquivo é entregue ao aplicativo que você escolher (por exemplo, e-mail ou mensagens), que tem as próprias regras de privacidade.

O FGRC-M não controla o acesso às cópias salvas ou compartilhadas fora do aplicativo.

Essas responsabilidades não afastam as obrigações legais de segurança e proteção de dados dos responsáveis pelo FGRC-M.

**7. O que não é permitido**

Não é permitido:

- tentar acessar contas, pedidos ou dados de outras pessoas ou prefeituras;
- burlar, testar ou desativar as proteções do aplicativo ou do servidor sem autorização da equipe;
- informar dados falsos ou se passar por outra pessoa ou órgão;
- usar o aplicativo para fins ilegais ou para prejudicar outras pessoas;
- sobrecarregar o serviço com acessos automáticos.

O descumprimento pode levar ao bloqueio da conta e, se houver indício de crime, à comunicação às autoridades.

**8. Disponibilidade e mudanças no aplicativo**

Por ser um projeto acadêmico em fase de testes, o FGRC-M pode ficar indisponível, entrar em manutenção, mudar ou ser encerrado. Sempre que possível, a equipe avisa antes pelo aplicativo.

Como as avaliações ficam no seu aparelho, guarde os relatórios em PDF que forem importantes para a prefeitura.

**9. Suspensão e encerramento do acesso**

A administração pode suspender ou encerrar uma conta se estes termos forem descumpridos, se houver risco à segurança ou se o projeto for encerrado.

Você pode parar de usar o aplicativo e pedir a exclusão da sua conta a qualquer momento, em Ajuda e suporte.

**10. Direitos autorais e marcas**

O aplicativo, os textos, o questionário e a identidade visual do FGRC-M foram criados pela equipe do projeto.

As normas e os frameworks citados pertencem às respectivas instituições e são indicados em Referências, na tela Privacidade e termos.

**11. Limites de responsabilidade**

As decisões tomadas com base nos resultados e nas recomendações são de responsabilidade da prefeitura. Antes de aplicar uma recomendação, avalie o caso com a equipe técnica ou com especialistas.

Dentro do que a lei permite, a equipe do FGRC-M não responde por prejuízos causados por informações incorretas ou incompletas, pela perda, pelo roubo ou pelo acesso indevido ao aparelho, pelo compartilhamento do PDF fora do aplicativo ou por períodos de indisponibilidade.

Nada nestes termos retira direitos que a lei garante a você.

**12. Mudanças nestes termos**

Estes termos podem ser atualizados. A versão em vigor é a que está publicada na tela Privacidade e termos, com a data. Se você continuar usando o aplicativo depois de uma mudança, entende-se que concorda com a nova versão.

**13. Lei aplicável e contato**

Estes termos seguem as leis brasileiras, em especial a LGPD (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).

Dúvidas, pedidos e reclamações: Ajuda e suporte, dentro do aplicativo.

[atalho: Abrir Ajuda e suporte]

### Referências

Para consulta sobre segurança cibernética, gestão de riscos e proteção de dados:

- **NIST Cybersecurity Framework 2.0.** Orientações para compreender, avaliar e gerenciar riscos de segurança cibernética. https://www.nist.gov/cyberframework
- **CIS Critical Security Controls.** Controles e boas práticas para melhorar a segurança dos sistemas e das informações. https://www.cisecurity.org/controls
- **ISO/IEC 27001:2022.** Requisitos para um sistema de gestão da segurança da informação. https://www.iso.org/standard/27001
- **Lei Geral de Proteção de Dados Pessoais.** Lei nº 13.709/2018, que trata da proteção de dados pessoais no Brasil. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- **Marco Civil da Internet.** Lei nº 12.965/2014, que estabelece princípios, garantias, direitos e deveres para o uso da internet no Brasil. https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm
- **Agência Nacional de Proteção de Dados (ANPD).** Órgão que fiscaliza o cumprimento da LGPD. A página explica os direitos do titular de dados e como reclamar. https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados

A indicação dessas referências não significa que o aplicativo seja certificado ou aprovado pelas instituições citadas.

Versão de 25/11/2026.
