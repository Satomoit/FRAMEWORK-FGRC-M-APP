// esse hook identifica se o sistema ou navegador ta no claro ou escuro
// [integração P11] agora quem decide é a tela de Configurações da Nicole (claro ou escuro)
// assim todas as telas que usam essa paleta mudam junto quando vc troca o tema
import { usePreferencias } from "@/features/p11-configuracoes/PreferenciasProvider";

// duas paletas de cor (uma pra cada tema)
export const fgrcPalettes = {
  // cores do modo claro (fundo claro e texto escuro)
  light: {
    background: "#F4F7FB",
    surface: "#FFFFFF",
    text: "#152842",
    muted: "#566A82",
    blue: "#10558D",
    blueOnButton: "#FFFFFF",
    orange: "#D76C19",
    border: "#A9B7C8",
    divider: "#D9E1E9",
    selected: "#DCEAF6",
    iconBackground: "#DFE9F2",
    danger: "#B9251B",
    error: "#B42318",
    success: "#18764B",
    infoBackground: "#E8F0F8",
    input: "#FFFFFF",
  },
  // cores do modo escuro (fundo escuro e texto claro)
  dark: {
    background: "#101B2B",
    surface: "#1D2D43",
    text: "#F2F7FC",
    muted: "#BCCADC",
    blue: "#3688CF",
    blueOnButton: "#FFFFFF",
    orange: "#FFAD63",
    border: "#60758E",
    divider: "#3A4E64",
    selected: "#284B6D",
    iconBackground: "#294664",
    danger: "#FF716B",
    error: "#FF8D85",
    success: "#7AD6A6",
    infoBackground: "#243B56",
    input: "#18283D",
  },
} as const;

// esse tipo ajuda o TypeScript a reconhecer as cores disponíveis
export type FgrcColors = typeof fgrcPalettes.light | typeof fgrcPalettes.dark;

// [integração P11] cores do Alto contraste (opção de acessibilidade da tela 22)
// texto, bordas e fundos viram preto e branco puros pra ficar bem mais fácil de ler
// as cores de aviso (erro, sucesso, laranja) continuam iguais pra não perder o significado
const altoContrasteClaro = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#000000",
  muted: "#1A1A1A",
  blue: "#003A70",
  border: "#000000",
  divider: "#000000",
  selected: "#CFE3F7",
  iconBackground: "#E6E6E6",
  infoBackground: "#FFFFFF",
  input: "#FFFFFF",
};
const altoContrasteEscuro = {
  background: "#000000",
  surface: "#000000",
  text: "#FFFFFF",
  muted: "#F2F2F2",
  blue: "#9DD3FF",
  border: "#FFFFFF",
  divider: "#FFFFFF",
  selected: "#1F3B57",
  iconBackground: "#1A1A1A",
  infoBackground: "#000000",
  input: "#000000",
};

// vc chama essa função em cada tela pra pegar a paleta certa
export function useFgrcTheme() {
  // lê a preferência atual do aparelho ou navegador
  // [integração P11] (agora a preferência salva em Configurações, não a do sistema)
  // (o temaAtivo já resolve o Automático pelo tema do navegador ou do celular)
  const { preferencias, temaAtivo } = usePreferencias();
  const escuro = temaAtivo === "escuro";
  // se o tema for escuro escolhe dark (senão usa light)
  const base = fgrcPalettes[escuro ? "dark" : "light"];
  // [integração P11] com Alto contraste ligado, troca só as cores de texto, borda e fundo
  const colors = (
    preferencias.altoContraste
      ? { ...base, ...(escuro ? altoContrasteEscuro : altoContrasteClaro) }
      : base
  ) as FgrcColors;
  return {
    colors,
    isDark: escuro,
  };
}
