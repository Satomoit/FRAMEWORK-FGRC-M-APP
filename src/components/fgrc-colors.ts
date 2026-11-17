import { useColorScheme } from 'react-native';

const palettes = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    border: '#D1D5DB',
    divider: '#E5E7EB',
    blue: '#2563EB',
    blueOnButton: '#FFFFFF',
    selected: '#EFF6FF',
    iconBackground: '#DBEAFE',
    infoBackground: '#EFF6FF',
    success: '#15803D',
    orange: '#C2410C',
  },
  dark: {
    background: '#000000',
    surface: '#17191C',
    text: '#FFFFFF',
    muted: '#B0B4BA',
    border: '#3A3D42',
    divider: '#303338',
    blue: '#60A5FA',
    blueOnButton: '#111827',
    selected: '#1E293B',
    iconBackground: '#1E3A5F',
    infoBackground: '#172554',
    success: '#4ADE80',
    orange: '#FDBA74',
  },
} as const;

export function useFgrcTheme() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? palettes.dark : palettes.light;

  return { colors };
}
