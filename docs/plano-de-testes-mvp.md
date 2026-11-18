# Plano de Testes do MVP FGRC-M (Sprint 04)

**Versão:** 18/11/2026
**Base:** `08-Plano de Testes de Software.md` do repositório acadêmico (CT01 a CT22), mais os cenários complementares CT23 a CT36 da área administrativa, do suporte e da segurança, que não existiam no plano original.
**Onde registrar os resultados:** `docs/registro-de-testes-mvp.md` (só resultados realmente observados).

## 1. Ambiente e dados de teste

| Item | Valor |
|---|---|
| Aplicativo | Branch `integracao/revisao-geral` (anotar o commit testado) |
| Navegador | `npx expo start -c` e tecla `w` (endereço `http://localhost:8081`) |
| Celular | APK gerado por `npx eas-cli build -p android --profile preview`, ou Expo Go |
| Supabase | Projeto do grupo (`pqblfalpxxzczhbaglso`) |
| Conta comum de teste | Criada pela própria área administrativa a partir de um pedido de teste |
| Conta admin | A conta que está em `public.administradores` |
| Avaliação de referência | Todas as respostas no nível máximo dá índice 0; todas em 0 dá índice 100 (conferido pelo teste automático `teste-calculo`) |

Regras para as evidências: não mostrar senhas, senhas provisórias nem códigos em capturas; usar e-mails de teste.

Situações possíveis (do plano acadêmico): **Aprovado**, **Reprovado**, **Bloqueado**, **Não executado**.

## 2. Cenários de acesso e avaliação

| ID | Requisito | Pré-condição | Passos | Resultado esperado |
|---|---|---|---|---|
| CT01 | RF-001 | Conta ativa | 1. Abrir o app. 2. Digitar e-mail e senha corretos. 3. Entrar | Abre a Home com "Olá, <primeiro nome>!" e a prefeitura vinculada |
| CT02 | RF-001 | — | 1. Entrar com campos vazios. 2. Com e-mail sem "@". 3. Com senha errada | Não entra; "Preencha o e-mail e a senha.", "Digite um e-mail válido." e "E-mail ou senha incorretos." (não diz qual dos dois está errado) |
| CT03 | RF-002 | Logado | Na Home, tocar em cada atalho e em cada item da barra (Início, Avaliações, Resultados, Relatórios, Mais) | Cada um abre a tela certa; nenhum mostra "indisponível"; Início volta para a Home |
| CT04 | P02 | Sem login | 1. Login > Solicitar acesso. 2. Preencher dados válidos. 3. Enviar | Tela "Solicitação enviada" com status Em análise; pedido aparece na área administrativa como Pendente |
| CT05 | P02 | Sem login | 1. Enviar com campos vazios. 2. E-mail inválido. 3. Repetir o pedido do mesmo e-mail | Aponta os problemas; não envia; no repetido mostra "Já existe um pedido em análise" |
| CT06 | RF-004, RF-005, RF-007 | Logado | 1. Avaliações > Iniciar. 2. Responder e avançar algumas perguntas | Perguntas na ordem dos eixos; alternativas de 0 a 4 (AWR de 0 a 3); progresso atualiza |
| CT07 | RF-006, RNF-001 | Avaliação parcial | 1. Responder 5 perguntas. 2. Sair do questionário. 3. Fechar e abrir o app. 4. Continuar | As 5 respostas e o progresso voltam; dá para alterar uma resposta |
| CT08 | RF-006 | 32 respondidas | 1. Revisar avaliação. 2. Finalizar | Revisão mostra 32 respondidas e 0 pendentes; finaliza; mostra "Avaliação finalizada!" |
| CT09 | RF-008 | Pelo menos 1 sem resposta | 1. Revisar avaliação. 2. Tentar finalizar | Lista as pendentes; botão Finalizar desabilitado; tocar numa pendente leva até ela |
| CT10 | RF-009, RF-010, RF-011, RNF-011, RNF-012 | Avaliação finalizada | 1. Resultados. 2. Abrir os detalhes | Índice de 0 a 100, classificação escrita em texto (não só cor), resultado por eixo; mesmo conjunto de respostas dá o mesmo resultado |
| CT11 | RF-012, RF-013, RF-014, RF-015 | Avaliação finalizada | 1. Relatórios. 2. Recomendações. 3. Gerar PDF (navegador: baixar; celular: compartilhar/salvar) | PDF abre e contém prefeitura, data e hora, código, resultado geral, resultado por eixo, as 32 perguntas com a resposta e a recomendação, prioridades |

## 3. Cenários de conta e configurações

| ID | Requisito | Pré-condição | Passos | Resultado esperado |
|---|---|---|---|---|
| CT12 | P07 | Conta ativa; SMTP ou e-mail de membro da equipe | 1. Login > Esqueci minha senha. 2. E-mail válido. 3. Enviar | Mensagem de orientação; e-mail com link chega |
| CT13 | P07 | — | Enviar com e-mail vazio e com e-mail inválido | Validação na tela; nada é enviado |
| CT14 | P08, RNF-004 | Link de recuperação | 1. Abrir o link. 2. Nova senha forte e confirmação igual. 3. Salvar. 4. Entrar com a nova | Confirma; entra com a nova senha |
| CT15 | P08 | Link de recuperação | 1. Senha fraca (ex.: sem minúscula). 2. Confirmação diferente | Mostra o que falta; "As senhas não coincidem."; não salva |
| CT16 | P09 | Logado | Mais > Meu perfil | Mostra nome, e-mail, prefeitura, município e estado da conta logada; prefeitura, município e estado bloqueados |
| CT17 | P10 (no perfil da P09) | Logado | 1. Meu perfil > editar nome. 2. Salvar. 3. Sair e entrar | Confirmação "Dados salvos."; o nome continua alterado |
| CT18 | P10 | Logado | 1. Nome vazio ou e-mail inválido. 2. Cancelar a edição | Aponta o erro; ao cancelar os dados anteriores continuam |
| CT19 | P11 | Logado | 1. Mais > Configurações > Alterar senha. 2. Senha atual certa, nova forte e confirmação igual. 3. Sair. 4. Entrar com a antiga. 5. Entrar com a nova | Atualiza; a antiga é recusada; a nova funciona |
| CT20 | P11 | Logado | 1. Senha atual errada. 2. Nova fraca. 3. Confirmação diferente | "A senha atual está incorreta."; lista do que falta; "As senhas não coincidem." |
| CT21 | P11 | Logado | 1. Mudar tema, tamanho do texto e alto contraste. 2. Fechar e abrir o app | As escolhas valem em todas as telas e continuam depois de reabrir |
| CT22 | RF-016 | Logado | 1. Mais > Sair da conta > confirmar. 2. Digitar `/avaliacoes` no navegador | Volta para o Login; a tela protegida não abre sem login |

## 4. Cenários complementares (administração, suporte e segurança)

| ID | Requisito | Pré-condição | Passos | Resultado esperado |
|---|---|---|---|---|
| CT23 | Admin | Conta admin | 1. Abrir `/admin` (no celular: link "Área da administração" no Login). 2. Entrar | Painel com as abas Solicitações, Suporte, Contas e Segurança. A área não aparece no menu Mais |
| CT24 | Admin | Conta comum | 1. Entrar em `/admin` com a conta comum | "Esta conta não tem acesso à área administrativa."; a sessão é encerrada |
| CT25 | Admin | Pedido pendente (CT04) | 1. Solicitações > abrir o pedido. 2. Aprovar com senha provisória | Senha provisória aparece uma vez; pedido vai para Aprovadas com "Decidido por" e "Decidido em"; histórico com Pendente → Aprovada |
| CT26 | Admin, P11 | Conta criada no CT25 | 1. Login com a senha provisória | O app leva direto para Alterar senha; depois da troca abre a Home |
| CT27 | Admin | Outro pedido pendente | 1. Abrir. 2. Recusar sem motivo. 3. Recusar com motivo | Sem motivo o botão fica desabilitado; com motivo vai para Recusadas e grava o motivo |
| CT28 | Admin | Vários pedidos | Usar os filtros, a pesquisa e a ordem | A lista muda conforme o filtro, a pesquisa e a ordem |
| CT29 | Suporte | Sem login | 1. Login > Falar com o suporte. 2. Enviar. 3. Enviar a mesma mensagem de novo | 1ª: "Mensagem enviada"; 2ª: aviso de mensagem já enviada |
| CT30 | Suporte, Admin | CT29 feito | 1. Admin > Mensagens de suporte. 2. Abrir. 3. Em atendimento. 4. Resolvida. 5. Reabrir | Status muda; histórico mostra cada mudança com o e-mail do admin; "Responder por e-mail" abre o e-mail |
| CT31 | Status da solicitação | Pedido em cada situação | Login > Ver situação > e-mail do pedido | Em análise, Aprovado (com botões de login e ativação), Recusado (com suporte) ou Nenhum pedido encontrado |
| CT32 | Admin | Conta comum ativa | 1. Contas > Desativar > confirmar. 2. Tentar entrar com ela. 3. Reativar. 4. Entrar | Desativada não entra ("Esta conta está desativada. Fale com o suporte."); reativada entra |
| CT33 | Admin, MFA | Conta admin, aplicativo autenticador no celular | 1. Segurança > Ativar. 2. Ler o QR ou digitar a chave. 3. Digitar o código. 4. Sair e entrar de novo | Pede o código de 6 números depois da senha; sem o código não abre o painel |
| CT34 | Segurança | — | Rodar `supabase/tests/teste-rls-admin.sql` no SQL Editor | As 28 linhas com "obtido" igual a "esperado"; nenhum dado fica no banco |
| CT35 | Privacidade | — | Login > Privacidade e termos; Mais > Privacidade e termos | Texto abre nos dois caminhos e descreve o que fica no aparelho e o que vai para o servidor |
| CT36 | RNF-002 | Avaliação finalizada | No navegador, F12 > Rede. Responder e finalizar uma avaliação e gerar o PDF | Nenhuma requisição ao Supabase leva as respostas (só autenticação) |

## 5. Fluxo completo

Conta de teste: pedido de acesso (CT04) > aprovação (CT25) > primeiro acesso com troca de senha (CT26) > avaliação completa com pausa e retomada (CT06, CT07) > revisão e finalização (CT08) > resultados (CT10) > relatório e PDF (CT11) > sair (CT22).
O fluxo é aprovado se todas as etapas forem concluídas sem perder respostas e se os números do PDF forem os mesmos das telas de Resultados.

## 6. Testes automáticos (rodam sem o app aberto)

| Comando | O que confere |
|---|---|
| `npx tsc --noEmit` | Tipos do TypeScript em todo o projeto |
| `npm test` | Regra de senha, cálculo do índice (AWR 0 a 3), RF-003, resumo da Home, separação das avaliações por conta |
| `supabase/tests/teste-rls-admin.sql` | Regras de segurança do banco e gatilhos (CT34) |
