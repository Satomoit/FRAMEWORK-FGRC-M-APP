# Versão 1.2.0 (entrega "Versão 1.0"): notas, build e instalação

| Item | Valor |
| --- | --- |
| Nome mostrado a quem usa | **Versão 1.0** (constante `NOME_DA_VERSAO` em `src/lib/versao.ts`) |
| Versão técnica | 1.2.0 (`app.json` > `version`) |
| Android `versionCode` | 3 |
| Pacote | `br.pucminas.fgrcm` (o mesmo das versões anteriores) |
| Commit e ID do build | anotar depois do build |

A atualização obrigatória compara só a versão técnica (`Constants.expoConfig.version`, que vem do `app.json`) com a versão mínima cadastrada em `/admin` > Status do sistema. O nome "Versão 1.0" é só para exibição e não entra em nenhuma comparação. Nunca diminua a versão técnica nem o `versionCode`: o Android recusa instalar por cima uma versão menor.

## Notas da versão (para mandar junto com o link)

- O app abre na página **Conheça o FGRC-M**. Dali você entra, pede acesso, acompanha o pedido ou ativa a conta; em "Conheça a ferramenta" há cartões curtos explicando o app.
- **Opções** na página inicial: tema claro ou escuro, tamanho do texto, alto contraste, suporte, privacidade e área da administração.
- Login mais simples; o tema escolhido vale em todas as telas.
- Pedido de acesso: o campo **Estado** abre uma lista com os 27 estados e o formulário sobe junto com o teclado.
- Relatórios: **Baixar PDF** (escolhendo a pasta), **Abrir** e **Compartilhar**, com nome padrão `FGRC-M_Avaliacao_AAAA-MM-DD_XXXXXX.pdf`.
- Ativação da conta só por código (o texto dizia 6 números, mas o Supabase manda 8; corrigido em 19/11, ver `melhorias-19-11-2026.md`); **Meus chamados** em Mais; avisos de manutenção e de versão nova.
- Só entram contas aprovadas pela equipe.

**Importante:** instale **por cima** da versão anterior (não desinstale antes). Assim as avaliações salvas no celular continuam.

## Antes do build

1. Supabase: "Allow new users to sign up" desligado (conferido em 18/11 às 12:05).
2. No computador, na pasta do projeto:

   ```powershell
   npx tsc --noEmit
   npm test
   ```

   O `tsc` tem que terminar sem erro e o `npm test` com "Todos os testes passaram".
3. O `eas.json` tem `"requireCommit": true`: o EAS recusa gerar o APK se houver alteração sem commit. Assim o build sempre corresponde a um commit conhecido.

## Gerar o APK

```powershell
npx eas-cli build -p android --profile preview
```

O EAS usa a mesma chave de assinatura das versões anteriores (guardada no expo.dev), então a 1.2.0 instala por cima da 1.0.0 ou da 1.1.0. Não apague as credenciais do Android no expo.dev e não troque o `package`.

## Instalar e testar

1. Abra o link do build no celular e baixe o APK.
2. O Android tem que mostrar **"Atualizar app"**. Se aparecer "Instalar" ou "conflito com pacote existente", pare e não desinstale: é sinal de assinatura diferente e desinstalar apagaria as avaliações.
3. O Play Protect pode avisar que o app não é verificado (normal fora da loja): "Mais detalhes" > "Instalar mesmo assim".
4. Mais > rodapé: "FGRC-M Versão 1.0 (1.2.0 · android)".
5. Confira que o rascunho e o histórico continuam.
6. Só mande o link para outras pessoas depois do seu reteste.

## Depois de distribuir

`/admin` > Status do sistema > Android: versão mais nova `1.2.0`, link oficial do build e as notas acima > Salvar. Deixe a mínima em `1.0.0` e **sem** obrigatória até todos atualizarem (o APK 1.0.0 não lê esse aviso).
