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
| [privacidade-e-termos-25-11-2026.md](privacidade-e-termos-25-11-2026.md) | Privacidade e termos de 25/11/2026: junção com a versão da Nicole (PR #8), embasamento na LGPD e no Marco Civil, conferência do texto com o app, pontos para o grupo e o orientador decidirem, como aceitar o PR e o texto completo para revisão |
| [revisao-das-questoes-25-11-2026.md](revisao-das-questoes-25-11-2026.md) | Revisão de 25/11/2026: as 32 questões, as referências do NIST, o nível 4 do eixo AWR, a conferência do cálculo, as explicações em palavras simples, os testes e o que o grupo precisa atualizar no Formulário |

Migrações do banco: `supabase/migrations/`. Funções do servidor: `supabase/functions/admin-fgrcm/` e `supabase/functions/notificacoes-fgrcm/` (as duas usam `supabase/functions/_shared/`). Testes automáticos: `tests/` (`npm test`). Teste das regras do banco: `supabase/tests/`.
