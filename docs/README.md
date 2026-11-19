# Documentação técnica do app FGRC-M

Só o necessário para instalar, executar, manter e compilar o aplicativo. A documentação acadêmica (planos e registros de testes, usabilidade, rastreabilidade e registros de cada etapa) fica fora deste repositório, com a equipe.

| Documento | Para que serve |
|---|---|
| [arquitetura-seguranca-e-dados.md](arquitetura-seguranca-e-dados.md) | Como o app está montado, onde cada dado fica (aparelho × servidor), banco, login, permissões e área administrativa |
| [auditoria-seguranca-e-dependencias.md](auditoria-seguranca-e-dependencias.md) | Chaves, regras de acesso por perfil, Edge Functions, cadastro público e análise do `npm audit` |
| [configurar-email-gmail-supabase.md](configurar-email-gmail-supabase.md) | E-mail com Gmail (SMTP), limites de envio e textos dos e-mails |
| [manutencao-atualizacao-suporte-pdf.md](manutencao-atualizacao-suporte-pdf.md) | Como funcionam manutenção, atualização obrigatória, Meus chamados e o PDF no Android |
| [como-testar-no-celular.md](como-testar-no-celular.md) | APK, Expo Go e como uma pessoa nova pede e recebe acesso |
| [versao-1.2.0-notas-e-build.md](versao-1.2.0-notas-e-build.md) | Versão atual, notas, build do APK e instalação por cima sem perder dados |
| [pendencias-limitacoes-e-sugestoes.md](pendencias-limitacoes-e-sugestoes.md) | Configurações do painel, comandos, pendências e limitações técnicas |
| [melhorias-19-11-2026.md](melhorias-19-11-2026.md) | Mudanças de 19/11/2026: exclusão definitiva, avisos por e-mail, atalho da administração, tutorial guiado, tamanho do texto, atualização; testes, configuração e reteste |
| [atualizacoes-e-eas-update.md](atualizacoes-e-eas-update.md) | Atualização obrigatória sem internet, link do APK, proposta de EAS Update e por que a versão não é conferida no servidor |

Migrações do banco: `supabase/migrations/`. Funções do servidor: `supabase/functions/admin-fgrcm/` e `supabase/functions/notificacoes-fgrcm/` (as duas usam `supabase/functions/_shared/`). Testes automáticos: `tests/` (`npm test`). Teste das regras do banco: `supabase/tests/`.
