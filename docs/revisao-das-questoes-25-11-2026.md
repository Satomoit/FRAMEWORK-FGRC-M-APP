# Revisão das 32 questões, das soluções e do cálculo (25/11/2026)

Este documento registra a revisão do questionário do FGRC-M feita em 25/11/2026: o que foi conferido, o que estava errado, o que foi corrigido no aplicativo, como foi testado e o que ainda depende do grupo.

**Resumo**

- As 32 perguntas, as alternativas e as soluções do aplicativo estavam **iguais ao Formulário** do repositório acadêmico. Os problemas encontrados vinham do próprio Formulário.
- O eixo **Pessoas e Conscientização (AWR)** ganhou o **nível 4 (Aprimorada)** nas 5 perguntas, como os outros eixos.
- **5 perguntas** tinham referência do NIST com código antigo ou que não existe. Foram corrigidas. O eixo AWR não tinha referência e passou a ter.
- O **cálculo** foi refeito por outro método e bateu em todos os casos testados. A fórmula e as faixas continuam dependendo da validação do orientador.
- Cada solução ganhou uma **explicação em palavras simples** ("Ficou com dúvida em como resolver?"), na tela de Recomendações e no PDF.
- No questionário, a tela agora **volta para o topo** ao trocar de pergunta.
- As recomendações aparecem **por prioridade** (alta primeiro), e a tela de Recomendações ganhou o botão **Compartilhar PDF**.
- O **Formulário (Docs) precisa ser atualizado pelo grupo** com as mudanças das seções 5, 6 e 7.

Os textos novos (nível 4 do AWR e explicações simples) foram propostos na integração, com apoio de ferramenta de IA e sob orientação da responsável pela integração. **Precisam de revisão do grupo antes da entrega final.**

## 1. O que mudou nos repositórios

Comparação dos arquivos do GitHub baixados em 25/11 com as versões anteriores.

| Repositório | O que mudou | Precisa de ação? |
|---|---|---|
| Aplicativo (`main`) | Recebeu todas as melhorias de 19/11. Está igual à pasta do computador, menos dois documentos de 23/11 que ainda não foram enviados | Não |
| Aplicativo | `package.json` e `package-lock.json` ganharam `eslint` e `eslint-config-expo` (instalados pelo `npx expo lint`) | Não |
| Aplicativo | `src/app/_layout.tsx` mudou só de formatação | Não |
| Acadêmico | `01-Documentação de Contexto.md`: introdução reescrita, com o dado do CGI.br | Não |
| Acadêmico | `02-Especificação do Projeto.md`: link corrigido | Não |
| Acadêmico | `05-Arquitetura da Solução.md`: passou a ter a versão no formato do professor | Não |
| Acadêmico | `11-Registro de Testes de Usabilidade.md`: seção 4.2 com o SUS de 1 participante (60,0 de 100) e 3 melhorias planejadas | Ver abaixo |
| Acadêmico | `FGRC-M_ Formulário.pdf`: **não mudou** (o eixo AWR continua de 0 a 3) | Sim, seções 5 a 7 |

A conta do SUS no documento 11 está certa: itens ímpares (resposta − 1) somam 12, itens pares (5 − resposta) somam 12, e 24 × 2,5 = 60,0.

As 3 melhorias planejadas no documento 11 pedem organização das informações, navegação mais clara e orientações curtas nas telas. As mudanças deste documento atendem parte disso: explicação simples das soluções, frase de como ler o índice e a tela voltando para o topo.

## 2. Como a revisão foi feita

| O que | Como |
|---|---|
| Textos | Comparação automática do aplicativo com o PDF do Formulário: 32 perguntas, 155 alternativas e 96 soluções. Resultado: nenhuma diferença antes das mudanças de hoje |
| Referências do NIST | Cada código foi conferido no documento oficial do NIST CSF 2.0 que lista os códigos atuais e os retirados da versão 1.1 (seção 13) |
| Coerência | Leitura de cada pergunta: as alternativas respondem à pergunta, sobem de nível de forma lógica e as soluções combinam com o nível |
| Cálculo | Conta refeita por um método diferente (só com números inteiros) e comparada com a do aplicativo em 400 avaliações sorteadas e nos limites das faixas |
| Telas | Telas alteradas abertas em um navegador de teste, com clique de verdade e conferência do resultado |
| PDF | PDF do navegador e PDF do celular gerados e lidos de volta |

## 3. Resultado por questão

"Conferido" significa: o código existe no NIST CSF 2.0 e trata do mesmo assunto da pergunta.

| Nº | Código | Referência no aplicativo | Assunto do código no NIST CSF 2.0 | Situação |
|---|---|---|---|---|
| 1 | 01-GOV | GV.OC | Contexto: missão, partes interessadas e requisitos legais | Conferido |
| 2 | 02-GOV | GV.RM › GV.RM-06 | Método padronizado para calcular, documentar, categorizar e priorizar riscos | Conferido |
| 3 | 03-GOV | GV.RR | Funções, responsabilidades e autoridades | Conferido |
| 4 | 04-GOV | GV.PO | Política de segurança definida, comunicada e aplicada | Conferido |
| 5 | 05-GOV | GV.OV | Resultados da gestão de riscos usados para ajustar a estratégia | Conferido |
| 6 | 01-AST | ID.AM-01 / ID.AM-02 | Inventário de equipamentos e de programas e sistemas | Conferido |
| 7 | 02-AST | ID.AM-05 / ID.AM-08 | Prioridade por classificação e importância; gestão no ciclo de vida | Conferido |
| 8 | 03-AST | ID.AM-01 / ID.AM-02 + ID.RA | Inventários e avaliação de riscos | Conferido |
| 9 | 01-IAM | PR.AA-01 e PR.AA-05 | Identidades e credenciais gerenciadas; permissões com privilégio mínimo | Conferido |
| 10 | 02-IAM | PR.AA-02 e PR.AA-03 | Identidade ligada à credencial; autenticação | Conferido (ver seção 10, item 1) |
| 11 | 03-IAM | PR.AA-01 e PR.IR-01 | Credenciais gerenciadas; rede protegida de acesso não autorizado | Conferido |
| 12 | 01-DAT | ID.AM-07 | Inventário de dados | Conferido |
| 13 | 02-DAT | PR.DS-01 e PR.DS-02 | Dados protegidos quando guardados e quando transmitidos | Conferido |
| 14 | 03-DAT | ID.AM-08 | Gestão no ciclo de vida, que inclui o descarte | Conferido |
| 15 | 01-VUL | PR.PS-01 / PR.PS-02 / PR.PS-03 | Configuração; manutenção de programas e de equipamentos | Conferido |
| 16 | 02-VUL | ID.RA-01 / ID.RA-05 / ID.RA-06 | Vulnerabilidades identificadas; riscos priorizados; respostas escolhidas | Conferido |
| 17 | 01-BKP | **PR.DS-11** | Backups criados, protegidos, mantidos e testados | **Corrigido** |
| 18 | 02-BKP | RC.RP-01 a RC.RP-06 | Execução do plano de recuperação | Conferido |
| 19 | 01-NET | PR.DS-02, **PR.IR-01** | Dados em transmissão; redes protegidas | **Corrigido** |
| 20 | 02-NET | **PR.AA-03, PR.AA-05, PR.IR-01 e PR.PS-04** | Autenticação; permissões; rede protegida; registros | **Corrigido** |
| 21 | 01-MON | PR.PS-05 e DE.CM-09 | Impedir programas não autorizados; monitorar equipamentos e programas | Conferido |
| 22 | 02-MON | PR.PS-04 e DE.CM-01, DE.CM-03, DE.CM-09 | Registros gerados; redes, uso e equipamentos monitorados | Conferido |
| 23 | 03-MON | DE.AE-02, DE.AE-03, DE.AE-04, DE.AE-06 e DE.AE-08 | Análise dos eventos, impacto, aviso aos responsáveis e declaração de incidente | Conferido |
| 24 | 01-INC | ID.IM-04 e RS.MA-01, RS.MA-03, RS.MA-04, RS.MA-05 | Plano de resposta; execução, prioridade, encaminhamento e início da recuperação | Conferido |
| 25 | 02-INC | RS.AN-06, RS.AN-07, RS.CO-02, RS.CO-03, RS.MI-01 e RS.MI-02 | Registro das ações; comunicação; contenção e eliminação | Conferido |
| 26 | 01-AWR | **PR.AT-01** | Conscientização e treinamento de todo o pessoal | **Acrescentado** |
| 27 | 02-AWR | **PR.AT-01** | Idem (inclui reconhecer golpes) | **Acrescentado** |
| 28 | 03-AWR | **PR.AT-01** | Idem (inclui avisar situações suspeitas) | **Acrescentado** |
| 29 | 04-AWR | **PR.AT-02** | Treinamento de quem tem função especializada, inclusive terceiros | **Acrescentado** |
| 30 | 05-AWR | **PR.AT-01** | Idem ao 01-AWR (inclui verificar o aprendizado) | **Acrescentado** |
| 31 | 01-TPR | **GV.SC-05, GV.SC-06 e GV.SC-07** | Exigências nos contratos; avaliação antes de contratar; acompanhamento do fornecedor | **Corrigido** |
| 32 | 02-TPR | **GV.SC-07, GV.SC-10**, PR.AA-01 **e DE.CM-06** | Acompanhamento do fornecedor; fim do serviço; credenciais; monitoramento do prestador | **Corrigido** |

## 4. O que foi alterado no aplicativo

Cada alteração tem um comentário `[integração 25/11]` no código, no lugar da mudança.

| Problema encontrado | Arquivo alterado | O que foi feito | Teste | Resultado |
|---|---|---|---|---|
| Eixo AWR só ia até o nível 3 | `src/features/p03-avaliacoes-questionario/questionarioData.ts` | Nível 4 "Aprimorada" nas 5 perguntas (seção 5) | `teste-calculo.cjs` e navegador de teste | Passou |
| 5 referências do NIST com código antigo ou inexistente | Mesmo arquivo | Códigos trocados pelos do NIST CSF 2.0 (seção 6) | `teste-explicacoes-simples.cjs` | Passou |
| Eixo AWR sem referência do NIST | Mesmo arquivo | PR.AT-01 e PR.AT-02 | Mesmo teste | Passou |
| 6 erros de português | Mesmo arquivo | Concordância e vírgula (seção 7) | Leitura | Corrigido |
| Alternativas do AWR começavam com letra minúscula na tela | `src/features/p03-avaliacoes-questionario/QuestionarioScreen.tsx` | A tela mostra a primeira letra maiúscula. O dado continua igual ao Formulário | Navegador de teste | Passou |
| Ao tocar em Próxima, a pergunta mudava e a tela continuava lá embaixo (retorno do teste de usabilidade de 23/11) | `src/components/fgrc-ui.tsx` e `QuestionarioScreen.tsx` | A página volta para o topo quando muda a pergunta ou a etapa. Vale para Próxima, Anterior, abas dos eixos e "Responder" da revisão. Responder uma alternativa não move a tela | Navegador de teste | Passou. Falta conferir no celular |
| Soluções em linguagem técnica | `src/lib/explicacoes-simples.ts` (novo), `src/lib/calcular-relatorio.ts`, `src/features/p06-relatorios-recomendacoes/` (`types.ts`, `RecomendacoesScreen.tsx`, `pdf.ts`, `pdf.web.ts`) | 96 explicações em palavras simples. Na tela, o botão "Ficou com dúvida em como resolver?" abre a explicação. No PDF, aparece "Em palavras simples:" (seção 9) | `teste-explicacoes-simples.cjs`, navegador de teste e PDFs | Passou. Falta conferir no celular |
| Avaliação já salva não pode mudar de nota por causa do nível 4 | `src/lib/calcular-relatorio.ts` | Quem guardou a nota máxima usa a que guardou. Avaliação muito antiga, sem esse dado, usa 3 no AWR | `teste-calculo.cjs` | Passou |
| O PDF dizia que o eixo de Pessoas ia até 3 | `src/lib/calcular-relatorio.ts`, `pdf.ts`, `pdf.web.ts` | O texto depende da avaliação: as novas dizem 0 a 4; as antigas continuam com o aviso | `teste-conferencia-calculo.cjs` e PDFs | Passou |
| A tela de Detalhes não explicava como ler o índice. Número baixo podia parecer ruim | `src/features/p05-resultados-detalhamento/DetalhesResultadoScreen.tsx` | Frase: "Quanto maior o número, maior a exposição a riscos. Até 33: Baixo. De 34 a 66: Intermediário. De 67 a 100: Alto." | Navegador de teste | Passou |
| Sem pontos de atenção, a caixa ficava vazia | Mesmo arquivo | Aviso "Nenhum ponto de atenção nesta avaliação" | Navegador de teste | Passou |
| "1 pontos de atenção" e "1 recomendações" | `ResultadosScreen.tsx` e `RecomendacoesScreen.tsx` | Singular e plural | Navegador de teste | Passou |
| As recomendações apareciam na ordem do questionário, com as de prioridade alta e média misturadas. O Mapeamento pede a lista dividida por prioridade | `src/lib/calcular-relatorio.ts` e `RecomendacoesScreen.tsx` | Primeiro as de prioridade alta (notas 0 e 1), depois as de média (notas 2 e 3). Dentro de cada grupo, a ordem do questionário. A tela mostra um título por grupo, com a quantidade. O PDF do celular segue a mesma ordem (o do navegador já seguia) | `teste-conferencia-calculo.cjs` e navegador de teste | Passou. Falta conferir no celular |
| A tela de Recomendações só tinha "Baixar PDF". Para mandar pelo WhatsApp era preciso salvar o arquivo antes (o compartilhar direto só existia na tela Relatórios) | `RecomendacoesScreen.tsx` | Botão "Compartilhar PDF", que entrega o arquivo PDF para a janela de compartilhar do aparelho. O "Baixar PDF" continua, como segundo botão | Navegador de teste, com a janela de compartilhar simulada | Passou. **Falta conferir no celular** |
| No tema escuro com alto contraste, o texto dos botões azuis era branco sobre azul claro (contraste de 1,6:1) | `src/components/fgrc-colors.ts`, `theme.ts` da P05 e da P06, `DetalhesResultadoScreen.tsx` e `RecomendacoesScreen.tsx` | Texto preto sobre o botão azul claro nesse modo (contraste acima de 13:1). Vale para todos os botões azuis do aplicativo | `teste-explicacoes-simples.cjs` e navegador de teste | Passou |

Testes novos: `tests/teste-conferencia-calculo.cjs` e `tests/teste-explicacoes-simples.cjs`. Teste atualizado: `tests/teste-calculo.cjs`.

## 5. Nível 4 do eixo AWR

Nos outros eixos, o nível 4 descreve a prática do nível 3 depois de aplicada a solução da nota 3. O texto novo segue essa regra. Quem marca 3 continua recebendo a solução da faixa 3, e quem marca 4 não recebe recomendação.

| Pergunta | Nível 3 (já existia) | Nível 4 – Aprimorada (novo) |
|---|---|---|
| 01-AWR | as orientações são repassadas aos novos servidores e reforçadas periodicamente com os demais. | as orientações são repassadas e reforçadas, e a prefeitura revisa periodicamente o conteúdo e os registros de participação para acompanhar as mudanças nos sistemas e nas rotinas de trabalho. |
| 02-AWR | todos os setores recebem orientações preventivas, reforçadas periodicamente com exemplos de golpes. | todos os setores recebem orientações preventivas, os exemplos são atualizados conforme os golpes identificados e exercícios simples verificam se os servidores reconhecem os sinais de fraude. |
| 03-AWR | todos os servidores recebem orientação sobre o contato ou canal e sobre como comunicar a situação. | todos os servidores são orientados, e a prefeitura confere periodicamente se o contato ou canal continua válido e verifica, com perguntas ou exercícios simples, se os servidores sabem como utilizá-lo. |
| 04-AWR | todos os responsáveis recebem capacitação adequada às suas funções, atualizada conforme mudanças nos sistemas ou nas atribuições. | todos os responsáveis são capacitados, as necessidades de capacitação são revisadas a cada mudança nos sistemas ou nas atribuições e a prefeitura verifica se os conhecimentos adquiridos são aplicados no trabalho. |
| 05-AWR | verifica o aprendizado nos treinamentos e usa os resultados para reforçar os assuntos que geraram dúvidas. | verifica o aprendizado nos treinamentos, compara os resultados ao longo do tempo e ajusta os conteúdos e a forma de orientação quando as dificuldades persistem. |

**Efeito na nota.** Antes, marcar 3 nas 5 perguntas do AWR dava 0 de exposição no eixo, porque 3 era o máximo. Agora dá 25, porque o máximo é 4. As avaliações **já salvas não mudam**: elas guardam a nota máxima da época.

## 6. Referências do NIST: antes e depois

| Pergunta | No Formulário | No aplicativo agora | Motivo |
|---|---|---|---|
| 01-BKP | PR.DS-1 | PR.DS-11 | Faltou um dígito. O texto da pergunta é o do PR.DS-11 (backups criados, protegidos, mantidos e testados) |
| 01-NET | PR.DS-02, PR.PT-04 | PR.DS-02, PR.IR-01 | O PR.PT-04 é da versão 1.1 e foi retirado na 2.0. Segundo o NIST, ele foi incorporado ao PR.AA-06 (acesso físico) e ao PR.IR-01 (redes protegidas). Para firewall e segmentação vale o PR.IR-01 |
| 02-NET | PR.PT-01, SC.CO-04 | PR.AA-03, PR.AA-05, PR.IR-01 e PR.PS-04 | O PR.PT-01 (registros) foi incorporado ao PR.PS-04. "SC.CO-04" não existe no NIST CSF. O acesso remoto da versão 1.1 (PR.AC-3) foi incorporado ao PR.AA-03, ao PR.AA-05 e ao PR.IR-01 |
| 01-TPR | ID.SC-01, ID.SC-02 | GV.SC-05, GV.SC-06 e GV.SC-07 | A categoria ID.SC foi retirada na 2.0 e virou GV.SC. O GV.SC-05 trata das exigências nos contratos, o GV.SC-06 da avaliação antes de contratar (solução da nota 3) e o GV.SC-07 do acompanhamento do fornecedor (nível 4) |
| 02-TPR | ID.SC-04, PR.AA-01 | GV.SC-07, GV.SC-10, PR.AA-01 e DE.CM-06 | O ID.SC-04 foi incorporado ao GV.SC-07 e ao ID.RA-10 (este último trata da avaliação de fornecedores antes da compra, que já está na 01-TPR). O GV.SC-10 cobre o fim do serviço, que inclui desativar o acesso do fornecedor. O DE.CM-06 cobre o monitoramento do que o prestador faz |
| 01, 02, 03 e 05-AWR | Sem referência (só o tema) | PR.AT-01 | Conscientização e treinamento de todo o pessoal. Os exemplos do NIST citam reconhecer golpes, avisar situações suspeitas e verificar o aprendizado |
| 04-AWR | Sem referência (só o tema) | PR.AT-02 | Treinamento de quem tem função especializada, inclusive terceiros |

Relatórios de avaliações antigas continuam mostrando a referência que foi gravada na época.

## 7. Acertos de português

O sentido não mudou.

| Onde | Antes | Depois |
|---|---|---|
| 03-GOV, alternativa 0 | autoridades **definidos** | autoridades **definidas** |
| 03-GOV, solução 0 ou 1 | autoridades **relacionados** à gestão | autoridades **relacionadas** à gestão |
| 03-GOV, solução 2 | autoridades **relacionados** à gestão | autoridades **relacionadas** à gestão |
| 05-GOV, alternativa 2 | e/ou não **resultam** em ajustes | e/ou não **resulta** em ajustes |
| 03-IAM, pergunta | incluindo acessos remotos em tempo hábil? | incluindo acessos remotos**,** em tempo hábil? |
| 03-IAM, alternativa 3 | revogação de acessos inclusive remotos aplicado | revogação de acessos**,** inclusive remotos**,** aplicado |

## 8. Conferência do cálculo

**Regra usada pelo aplicativo**

- Índice de exposição = 100 × (1 − soma das notas ÷ soma das notas máximas), arredondado para o inteiro mais próximo. O meio (,5) sobe.
- 0 é a menor exposição e 100 é a maior.
- Até 33: Baixo. De 34 a 66: Intermediário. De 67 a 100: Alto.
- O mesmo cálculo vale para o índice geral e para cada um dos 11 eixos.
- Ponto de atenção: eixo com índice a partir de 50. Prioridade alta a partir de 75; abaixo disso, média.
- Recomendação: toda resposta de 0 a 3. Prioridade alta nas notas 0 e 1, e média nas notas 2 e 3.

**Exemplos conferidos** (32 perguntas, máximo de 128 pontos)

| Soma das notas | Conta | Índice | Faixa |
|---|---|---|---|
| 128 | 100 × (1 − 128 ÷ 128) = 0 | 0 | Baixo |
| 86 | 100 × (1 − 86 ÷ 128) = 32,8 | 33 | Baixo |
| 85 | 100 × (1 − 85 ÷ 128) = 33,6 | 34 | Intermediário |
| 43 | 100 × (1 − 43 ÷ 128) = 66,4 | 66 | Intermediário |
| 42 | 100 × (1 − 42 ÷ 128) = 67,2 | 67 | Alto |
| 112 | 100 × (1 − 112 ÷ 128) = 12,5 | 13 | Baixo |
| 0 | 100 × (1 − 0 ÷ 128) = 100 | 100 | Alto |

**O que foi conferido**

- 400 avaliações sorteadas: índice geral, 11 eixos, faixa, pontos de atenção, quantidade, prioridade e texto das recomendações. Tudo igual à conta de conferência.
- Limites das faixas (33/34 e 66/67) e os casos de meio (12,5; 37,5; 62,5; 87,5).
- Home, Resultados, Relatórios e PDF usam a mesma função, então mostram os mesmos números.
- O teste foi posto à prova: com 4 erros colocados de propósito na fórmula, ele acusou os 4.

**O que não é decisão técnica**

A fórmula e os limites das faixas não estão definidos na Metodologia. O aplicativo aplica a regra acima corretamente, mas a regra precisa da validação do orientador. Por isso o PDF ainda traz a frase "As faixas ainda serão validadas pelo orientador do projeto." Quando a regra for validada, a frase sai em `src/lib/calcular-relatorio.ts` (constante `AVISO_DAS_FAIXAS`).

## 9. Explicações em palavras simples

- **Onde aparece.** Na tela de Recomendações, embaixo de cada solução, o botão "Ficou com dúvida em como resolver?" abre a explicação. Ela começa fechada. No PDF, aparece depois de cada solução, com o título "Em palavras simples:".
- **Para quem.** Servidores que não são da área de informática.
- **Como foram escritas.** Frases curtas, um primeiro passo concreto, exemplos do dia a dia de uma prefeitura e termos técnicos explicados na hora (por exemplo: firewall, VPN, MFA, log, backup). A explicação diz a mesma coisa que a solução do grupo. Ela não troca a solução.
- **Onde editar.** `src/lib/explicacoes-simples.ts`. Cada pergunta tem 3 textos, um para cada faixa de nota.
- **Cuidado.** Se o texto de uma solução mudar no questionário, a explicação precisa ser revista. Relatório antigo com solução diferente da atual aparece sem a explicação.
- **Tamanho do PDF.** Com 32 recomendações, o PDF do navegador passou de 9 para 11 páginas. O do celular, na simulação, passou de 21 para 29. Para tirar a explicação só do PDF, apague a linha com `Em palavras simples:` em `pdf.ts` e em `pdf.web.ts`.

Exemplo (02-NET, notas 0 e 1):

> **Solução:** Fechar portas de RDP expostas na internet imediatamente e implementar uma solução básica de VPN.
>
> **Em palavras simples:** Se hoje dá para chegar pela internet até a tela de acesso remoto dos computadores da prefeitura (a Área de Trabalho Remota, ou RDP), peça com urgência a quem cuida da informática para bloquear esse acesso direto, porque esse é um caminho muito usado por criminosos. No lugar, use uma VPN, que funciona como um túnel protegido: só entra quem tem usuário e senha, e o que passa por ele não pode ser lido por estranhos.

## 10. Pontos para o grupo decidir

Nada desta lista foi alterado no aplicativo.

1. **Regra de senha (02-IAM, solução das notas 0 e 1).** A solução pede "tamanho, complexidade, troca periódica". A norma atual do NIST sobre senhas (SP 800-63B, revisão 4) diz para **não** exigir troca periódica nem regras de composição, e sim tamanho mínimo, bloqueio de senhas comuns ou vazadas e troca quando houver sinal de vazamento. Sugestão de texto: "Definir regras mínimas de senha (tamanho mínimo, bloqueio de senhas fracas ou vazadas e troca quando houver suspeita de vazamento) e habilitar MFA...". Se o grupo mudar a solução, a explicação simples da 02-IAM muda junto. O próprio aplicativo exige letras, números e símbolos na senha, por requisito do projeto.
2. **Frase incompleta (02-NET, alternativa 4).** "Revisão periódica dos acessos remotos ativos e bloqueio automático de atividades." Falta dizer quais atividades.
3. **Código do eixo de backup.** O eixo aparece como **BCK** e as perguntas como 01-**BKP** e 02-**BKP**. Vale escolher um só.
4. **Falta "não se aplica".** Uma prefeitura sem acesso remoto não tem alternativa adequada na 02-NET. O Mapeamento cita a opção "Não sei", que não existe no Formulário.
5. **01-TPR, solução da nota 3.** Ela fala em avaliar fornecedores novos antes de contratar. O nível 4 fala em avaliações periódicas dos fornecedores. A solução poderia citar também a reavaliação periódica.
6. **Fórmula e faixas.** Ver o fim da seção 8.
7. **Exemplo do protótipo.** No protótipo aparece "62/100 Intermediário" e "38/100 Alto". Pelos limites do aplicativo, 38 é Intermediário. É dado de exemplo, mas vale alinhar.
8. **Formulário.** Atualizar o Docs e o PDF do repositório acadêmico com as seções 5, 6 e 7, para o aplicativo e o Formulário voltarem a ficar iguais.

## 11. Testes realizados

| Teste | Antes | Agora | Resultado |
|---|---|---|---|
| `npm test` (arquivos de teste) | 15 | 17 | Todos passaram |
| `npm test` (verificações) | 226 | 288 | 288 passaram, 0 falharam |
| Mesmos testes com quebra de linha do Windows | – | 288 | 288 passaram |
| Navegador de teste (cliques nas telas alteradas) | – | 35 | 35 passaram |
| Mesmo roteiro no código de antes | – | – | Reproduziu o defeito: depois de Próxima, a tela ficava em 367 px em vez de 0 |
| PDF do navegador (avaliação nova, tudo zero e avaliação antiga) | – | 3 | Gerados, com as explicações e sem caractere trocado por "?" |
| PDF do celular (página HTML convertida) | – | 1 | Gerado, com as 26 explicações |

O navegador de teste usa uma imitação simples do React Native. Ele confirma a lógica (estado, clique, rolagem), mas **não substitui o teste no aplicativo de verdade**. Não foi possível abrir o aplicativo real nesta revisão, porque o servidor do Expo não estava ligado.

**Falta conferir no aplicativo (computador e celular)**

1. `npx tsc --noEmit` e `npx expo lint` sem erro novo.
2. Questionário: rolar até o fim, tocar em Próxima e ver a pergunta nova no topo.
3. Eixo AWR: as 5 perguntas com 5 alternativas.
4. Finalizar uma avaliação e abrir Relatórios › Visualizar relatório: as recomendações de prioridade alta aparecem primeiro; abrir e fechar o "Ficou com dúvida em como resolver?".
5. Baixar o PDF e procurar "Em palavras simples:". **No celular:** tocar em "Compartilhar PDF" e conferir se abre a janela de compartilhar com o arquivo (por exemplo, para o WhatsApp).
6. Abrir um relatório antigo: a nota não pode ter mudado.
7. Modo escuro, alto contraste e texto em 150% na tela de Recomendações. No escuro com alto contraste, o texto dos botões azuis deve aparecer preto.

## 12. Depois de testar

1. Publicar o site de novo: `npx expo export -p web` e `npx eas-cli deploy --prod`.
2. Antes de gerar o APK: subir a versão para 1.3.0 e o `versionCode` para 4 (ver `docs/atualizacoes-e-eas-update.md`).
3. Avisar o grupo para atualizar o Formulário (seção 10, item 8).

## 13. Fontes

- NIST. *The NIST Cybersecurity Framework (CSF) 2.0* (NIST CSWP 29), 26/02/2024. <https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf>
- NIST. *CSF 2.0 Core with Withdrawn CSF 1.1 Elements* (lista dos códigos atuais e dos retirados, com o destino de cada um). <https://www.nist.gov/document/nist-csf-20-core-withdrawn-csf-11-elements>
- NIST. *CSF 2.0 Implementation Examples*. <https://www.nist.gov/document/csf-20-implementations-pdf>
- NIST. Tradução para o português do CSF 2.0. <https://doi.org/10.6028/NIST.CSWP.29.por>
- NIST. *SP 800-63B-4, Digital Identity Guidelines: Authentication and Authenticator Management* (requisitos de senha). <https://pages.nist.gov/800-63-4/sp800-63b.html>

Consultas feitas em 25/11/2026.
