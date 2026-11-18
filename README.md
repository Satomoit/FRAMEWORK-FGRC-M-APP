# FRAMEWORK-FGRC-M-APP

Repositório destinado ao desenvolvimento do aplicativo mobile do projeto **Framework FGRC-M**, realizado na disciplina de Trabalho Acadêmico Integrador II (TAI II), utilizando React Native, Expo e TypeScript.

O app faz a autoavaliação de riscos cibernéticos de prefeituras: 32 perguntas em eixos, resultado de 0 a 100, recomendações e relatório em PDF. As respostas ficam só no aparelho; o Supabase guarda só as contas, os pedidos de acesso, as mensagens de suporte (e as respostas da equipe) e o aviso de manutenção/versão.

**Versão atual: 1.2.0** (Android `versionCode` 3). O que mudou, a ordem dos commits e como gerar e instalar o APK: `docs/versao-1.2.0-notas-e-build.md`. Segurança e dependências: `docs/auditoria-seguranca-e-dependencias.md`.

## Como rodar

```powershell
npm install
npx expo start -c        # depois aperte w (navegador) ou leia o QR no Expo Go
npx tsc --noEmit         # confere os tipos
npm test                 # testes das regras (senha, e-mail, cálculo, armazenamento)
```

As variáveis públicas do Supabase ficam no `.env.local` (não vai pro Git). Para gerar o APK e testar no celular, veja `docs/como-testar-no-celular.md`.

## Onde fica cada coisa

| Pasta | O que tem |
|---|---|
| `src/app/` | Rotas (cada arquivo é um endereço do app). Ligam as telas aos dados de verdade |
| `src/features/pXX-*` | Telas de cada parte do protótipo, feitas pelos integrantes |
| `src/features/admin/` | Área administrativa (`/admin`): pedidos de acesso, suporte, contas e verificação em duas etapas |
| `src/features/integracao/` | Tutorial da Home e a tela de revisão local (só abre com `EXPO_PUBLIC_PREVIEW_MODE=true`) |
| `src/components/` | Barra de navegação, cores do tema e componentes comuns (botão, campo, página) |
| `src/lib/` | Regras sem tela: Supabase, conta, senha, e-mail, armazenamento local, avaliações, cálculo, admin |
| `supabase/migrations/` | Banco de dados, na ordem em que foi aplicado |
| `supabase/functions/admin-fgrcm/` | Função do servidor da administração (a única parte que usa a chave secreta) |
| `supabase/tests/` | Teste das regras de segurança do banco |
| `tests/` | Testes automáticos (`npm test`) |
| `docs/` | Documentação técnica: arquitetura, segurança, configuração do e-mail, manutenção e atualização, build e pendências |

## Telas e autoria

| Parte | Telas | Integrante (branch) | Rota no app |
|---|---|---|---|
| P01 | Login e página inicial | Nicole (`feat/p01-login-inicio`) | `/entrar`, `/inicio` |
| P02 | Solicitar acesso e solicitação enviada | Liz (`feat/liz-p02`) | `/solicitar-acesso`, `/explore` |
| P03 | Avaliações e questionário | Hudson (`feat/hudson/p03-avaliacoes-questionario`) | `/avaliacoes` |
| P04 | Revisar e finalizar avaliação | Otávio (`feat/otavio-p04`) | revisão dentro de `/avaliacoes`; telas avulsas em `/revisar-avaliacao` e `/avaliacao-finalizada` |
| P05 | Resultados e detalhes | Aline (`feat/aline-p05-p06`) | `/resultados-revisao` |
| P06 | Relatórios, recomendações e PDF | Aline (`feat/aline-p05-p06`) | `/relatorios-revisao` |
| — | Meus chamados (suporte) | Integração (versão 1.1.0) | `/meus-chamados` |
| — | Conheça o FGRC-M (primeira página pública, com a janela de Opções) | Integração (versão 1.2.0) | `/` |
| P07 | Recuperar senha | Josiane (`feat/josiane-p07-p09`) | `/recuperar-senha` |
| P08 | Nova senha | Otávio (`feat/otavio-p08`) | `/criar-nova-senha`, `/senha-alterada` |
| P09 | Mais e Meu perfil | Josiane (`feat/josiane-p07-p09`) | `/mais` |
| P10 | Editar perfil | Liz (`feat/liz-p10`) | edição dentro de `/mais`; telas avulsas em `/editar-perfil` e `/alteracoes-salvas` |
| P11 | Configurações e alterar senha | Nicole (`feat/p11-senha-configuracoes`) | `/configuracoes`, `/alterar-senha` |

A integração (rotas, Supabase, armazenamento, área administrativa e testes) foi conduzida pela Josiane na branch `integracao/revisao-geral`, com acompanhamento das implementações, testes no computador e no celular e revisão dos resultados. ChatGPT (OpenAI) e Claude (Anthropic) foram usados como ferramentas de apoio. Nos arquivos dos integrantes, as partes mudadas na integração têm o comentário `[integração]` (ou `[tema]`, `[segurança]`, `[entrada nova]`). A documentação acadêmica fica fora deste repositório.
