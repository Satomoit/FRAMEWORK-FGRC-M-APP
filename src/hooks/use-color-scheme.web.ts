// [integração] descobre se o navegador ta no modo claro ou escuro
// no servidor (quando o Expo monta a página antes) sempre começa "light" pra não dar erro de hidratação;
// depois que a página carrega no navegador, troca pro tema de verdade
import { useSyncExternalStore } from "react";
import { Appearance, type ColorSchemeName } from "react-native";

// avisa o React quando vc muda o tema do sistema com o app aberto
function assinarMudancas(avisar: () => void) {
  const inscricao = Appearance.addChangeListener(() => avisar());
  return () => inscricao.remove();
}

// pega o tema atual do navegador
function temaDoNavegador(): ColorSchemeName {
  return Appearance.getColorScheme() ?? "light";
}

// no servidor a gente começa com o tema claro
// assim o HTML inicial fica igual no servidor e no navegador
function temaDoServidor(): ColorSchemeName {
  return "light";
}

// durante a hidratação usa o tema do servidor
// depois pega o tema real do navegador
export function useColorScheme(): ColorSchemeName {
  return useSyncExternalStore(assinarMudancas, temaDoNavegador, temaDoServidor);
}
