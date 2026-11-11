# Funcionalidades do FGRC-M

Cada pasta `pXX-*` corresponde a um par de telas do protótipo e à issue correspondente no GitHub Projects.

## Regra importante do Expo Router

As rotas navegáveis do aplicativo ficam exclusivamente em `src/app/`. Esta pasta `src/features/` **não gera telas automaticamente**. Quando desenvolver uma página, crie a rota correspondente em `src/app/` importando o componente da pasta `src/features/pXX-*`.

Exemplo (apenas ilustrativo):

- `src/features/p07-recuperacao-senha/recuperar-senha-screen.tsx` — interface e lógica da tela;
- `src/app/auth/recuperar-senha.tsx` — arquivo de rota que exporta aquela tela;
- URL interna: `/auth/recuperar-senha`.

Os arquivos `src/app/index.tsx`, `src/app/explore.tsx` e `src/app/_layout.tsx` do template já existem: não os apague sem combinar uma substituição com o grupo. Evite editar arquivos compartilhados ao mesmo tempo em branches diferentes.

**Convenção:** um branch por tarefa, pull request antes de integrar à `main`; não subir `node_modules`, `.expo`, senhas ou tokens.
