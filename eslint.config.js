// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // [integração 19/11] regra nova do React (eslint-plugin-react-hooks): reclama de useEffect que chama
    // setState logo de cara. Nas telas que já existiam, o padrão é "carregar a lista quando a tela abre"
    // (useEffect(() => { carregar() }, [carregar])), que funciona certo, só desenha a tela uma vez a mais.
    // Mudar isso mexeria em várias telas (inclusive dos colegas) perto da entrega, então fica como AVISO
    // (warn): aparece no lint, mas não trava. Lista em docs/pendencias-limitacoes-e-sugestoes.md
    // (só nas telas do app em src, que é onde essa regra roda)
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
