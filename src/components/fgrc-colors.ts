// esse hook identifica se o sistema ou navegador ta no claro ou escuro
import { useColorScheme } from 'react-native';

// duas paletas de cor (uma pra cada tema)
export const fgrcPalettes = {
  // cores do modo claro (fundo claro e texto escuro)
  light: {
    background: '#F4F7FB',
    surface: '#FFFFFF',
    text: '#152842',
    muted: '#566A82',
    blue: '#10558D',
    blueOnButton: '#FFFFFF',
    orange: '#D76C19',
    border: '#A9B7C8',
    divider: '#D9E1E9',
    selected: '#DCEAF6',
    iconBackground: '#DFE9F2',
    danger: '#B9251B',
    error: '#B42318',
    success: '#18764B',
    infoBackground: '#E8F0F8',
    input: '#FFFFFF',
  },
  // cores do modo escuro (fundo escuro e texto claro)
  dark: {
    background: '#101B2B',
    surface: '#1D2D43',
    text: '#F2F7FC',
    muted: '#BCCADC',
    blue: '#3688CF',
    blueOnButton: '#FFFFFF',
    orange: '#FFAD63',
    border: '#60758E',
    divider: '#3A4E64',
    selected: '#284B6D',
    iconBackground: '#294664',
    danger: '#FF716B',
    error: '#FF8D85',
    success: '#7AD6A6',
    infoBackground: '#243B56',
    input: '#18283D',
  },
} as const;

// esse tipo ajuda o TypeScript a reconhecer as cores disponíveis
export type FgrcColors = typeof fgrcPalettes.light | typeof fgrcPalettes.dark;

// vc chama essa função em cada tela pra pegar a paleta certa
export function useFgrcTheme() {
  // lê a preferência atual do aparelho ou navegador
  const scheme = useColorScheme();
  // se o tema for escuro escolhe dark (senão usa light)
  return { colors: fgrcPalettes[scheme === 'dark' ? 'dark' : 'light'], isDark: scheme === 'dark' };
}
