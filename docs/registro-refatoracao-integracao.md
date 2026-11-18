# Registro da revisão de organização e integração do app FGRC-M

**Data da revisão:** 18/11/2026 (madrugada da entrega da Sprint 04)
**Branch:** `integracao/revisao-geral`
**Quem fez:** responsável pela integração (branch `integracao/revisao-geral`), com apoio do Claude (ferramenta de IA da Anthropic) para investigar o código, propor e escrever as mudanças. As mudanças foram revisadas e testadas pela equipe antes de ir para o GitHub.

## Objetivo

Deixar o app mais fácil de entender e manter **sem quebrar o MVP**. Por isso a revisão foi pequena e cuidadosa:
nada foi reescrito do zero, as telas dos integrantes continuam com o visual e os comentários originais,
e só saiu do projeto o que foi conferido como sem uso.

## Como o projeto ficou organizado

| Pasta | O que tem |
|---|---|
| `src/app/` | As rotas (cada arquivo é uma tela/endereço). Aqui fica a parte que liga as telas dos integrantes aos dados reais |
| `src/features/pXX-...` | As telas de cada integrante (P01 a P11), separadas por funcionalidade |
| `src/features/integracao/` | Telas de apoio da integração: `RevisaoLocal` (modo de revisão sem login) e `TutorialInicial` |
| `src/components/` | O que é usado por várias telas: barra de navegação (`app-navigation`), cores (`fgrc-colors`), botões e campos (`fgrc-ui`) e a animação de abertura (`animated-icon`) |
| `src/hooks/` | Tema claro/escuro do navegador ou celular (`use-color-scheme`) |
| `src/lib/` | Regras e serviços sem tela: Supabase, conta, senha, e-mail, armazenamento local, avaliações, cálculo e resumo da Home |
| `supabase/` | Scripts SQL e a função do servidor (`aprovar-pedido`) |
| `tests/` | Testes de comportamento (rodam com `npm test`) |

## Problemas encontrados

1. **Arquivos do modelo inicial do Expo sem uso.** O projeto começou pelo modelo padrão do Expo, e vários arquivos desse modelo ficaram no projeto sem nenhuma tela usando. Um deles (`web-badge.tsx`) ainda dependia de `expo/package.json`, o que atrapalhava a checagem de tipos.
2. **Arquivos esquecidos.** `tatus` (saída de um `git branch` gravada por engano num commit), o script `scripts/ajustar-finalizacao-p03.cjs` (correção que só precisava rodar uma vez e que a P03 atual já incorpora) e `HomeProvisoria.tsx` (Home temporária, substituída pela Home da Nicole).
3. **Rascunho da avaliação duplicado.** A chave do rascunho e a validação das respostas estavam copiadas em dois lugares (rota de Avaliações e resumo da Home).
4. **Avaliações misturadas entre contas.** Rascunho e histórico usavam a mesma chave para todo mundo. Se duas contas usassem o mesmo navegador, uma via as avaliações da outra.
5. **Validação de e-mail repetida.** A tela de suporte tinha uma cópia da mesma regra de formato de e-mail.

## O que foi removido

Todos os arquivos removidos foram copiados antes para `C:\Projetos\backup-fgrcm-B1c-P11\antes-limpeza\` e continuam no histórico do Git.

| Arquivo | Por que é seguro remover |
|---|---|
| `src/components/app-tabs.tsx` e `app-tabs.web.tsx` | Navegação antiga por abas. Nenhum arquivo importa: a navegação atual é o `app-navigation.tsx` |
| `src/components/external-link.tsx`, `hint-row.tsx`, `themed-text.tsx`, `themed-view.tsx`, `web-badge.tsx`, `ui/collapsible.tsx` | Componentes do modelo do Expo. Só eram usados por eles mesmos ou pelas abas antigas |
| `src/constants/theme.ts`, `src/hooks/use-theme.ts`, `src/global.css` | Tema do modelo do Expo. O tema do app hoje é o da P11 (`PreferenciasProvider` + `fgrc-colors`) |
| `src/features/integracao/HomeProvisoria.tsx` | Home temporária da integração, substituída pela Home da P01 |
| `tatus` | Arquivo criado por engano (saída do terminal) |
| `scripts/ajustar-finalizacao-p03.cjs` | Correção que só precisava rodar uma vez. A P03 atual já espera o salvamento antes de confirmar a finalização |

Antes de remover, foi conferido que nenhum arquivo de `src/` importa esses arquivos, e a checagem de tipos foi rodada de novo sem eles.

## O que foi consolidado

- **`src/lib/armazenamento-local.ts` (novo):** um lugar só para o que a avaliação guarda no aparelho.
  - Rascunho: `lerRascunho`, `salvarRascunho`, `limparRascunho`.
  - Histórico: `lerHistoricoBruto`, `gravarHistoricoBruto`.
  - Validação das respostas: `filtrarRespostasValidas`.
  - Usado por `src/app/avaliacoes.tsx`, `src/lib/avaliacoes-reais.ts` e `src/lib/resumo-inicio.ts`.
- **Separação por conta:** as chaves agora levam o id da conta logada, por exemplo `fgrcm:p03:rascunho:v2:<id>`. As respostas continuam **só no aparelho**, como pedem os requisitos RNF-001 e RNF-002.
- **Dados de antes da separação:** não foram apagados nem entregues para conta nenhuma automaticamente. Se existirem, a tela de Resultados mostra o botão "Trazer para a minha conta", e as chaves antigas só saem depois que os dados estão gravados na conta.
- **E-mail:** a tela de suporte passou a usar `formatoDeEmailValido` de `src/lib/email-institucional.ts`.

## O que não foi mexido (de propósito)

- **Telas P04 (`revisar-avaliacao`, `avaliacao-finalizada`) e P10 (`editar-perfil`, `alteracoes-salvas`):** continuam como telas independentes. O fluxo usa a revisão da P03 e a edição da P09. Estão no projeto para a equipe decidir a integração. Não foram apagadas porque são trabalho dos colegas.
- **`src/app/minhas-telas.tsx` e `RevisaoLocal.tsx`:** página de revisão das telas usada no modo de revisão (`EXPO_PUBLIC_PREVIEW_MODE=true`).
- **`mockData.ts` e `index.ts` da P05 e da P06:** dados de exemplo da Aline. Nenhuma tela usa hoje (as rotas usam os dados reais). Ficam para a equipe decidir.
- **Verificações de sessão repetidas dentro das telas:** Home, Configurações e Alterar senha também conferem a sessão por conta própria. É redundante com a proteção do `_layout.tsx`, mas não atrapalha, e mexer mudaria o código dos colegas.
- **Dependências sem uso** (`@expo/ui`, `expo-glass-effect`, `expo-device`, `expo-symbols`, `expo-web-browser`): não foram removidas para não mexer no `package-lock.json` perto da entrega e durante a geração do APK. Ficam como pendência.
- **`scripts/reset-project.js`:** script do modelo do Expo, ligado ao comando `npm run reset-project`. Não foi removido. Atenção: ele move a pasta do app, então não deve ser rodado.

## Testes

- **Novos testes de comportamento** em `tests/` (rodam com `npm test`, usando os arquivos reais de `src/lib`):
  - regra de senha (10 casos);
  - cálculo do índice (nota máxima real, AWR até 3);
  - resumo da Home (8 casos);
  - separação por conta e importação dos dados antigos (13 casos).
- Na revisão, todos passaram. Também foram conferidos:
  - a checagem de sintaxe e de tipos dos arquivos alterados;
  - a geração do PDF real com as 32 perguntas comparadas uma a uma com o Formulário FGRC-M.
- **A testar no app pela equipe:**
  - `npx tsc --noEmit` no projeto completo;
  - `npx expo start --web -c`;
  - login, avaliação, finalização, resultados, PDF e troca de conta no mesmo navegador.

## Pendências

- Integrar as telas P04 e P10 ao fluxo, ou decidir oficialmente usar a P03 e a P09.
- Remover as dependências sem uso numa sprint seguinte (com `npx expo install --check` depois).
- Validar com o orientador o cálculo provisório do índice (AWR com escala 0–3).
- Modo escuro nas telas com cores fixas (Login, P02, P04, P05, P06, P08, P10).

## Cuidados para as próximas integrações

- Antes de apagar um arquivo, procure o nome dele em `src/` inteiro. Rotas em `src/app/` não aparecem em imports, e arquivos `.web.ts` substituem o `.ts` só no navegador.
- Tudo que guarda dado da avaliação no aparelho deve passar por `src/lib/armazenamento-local.ts` (assim continua separado por conta).
- Nenhuma resposta de avaliação vai para o Supabase. O Supabase guarda só contas, pedidos de acesso e mensagens de suporte.
- Chave secreta do Supabase (service_role) nunca entra no app, só na função do servidor.
