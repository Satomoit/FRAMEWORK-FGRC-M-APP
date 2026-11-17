import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import {
  PreferenciasProvider,
  usePreferencias,
} from '@/features/p11-configuracoes/PreferenciasProvider';

SplashScreen.preventAutoHideAsync();

function Navegacao() {
  const { preferencias } = usePreferencias();

  const escuro = preferencias.tema === 'escuro';

  const fundo = preferencias.altoContraste
    ? escuro
      ? '#000000'
      : '#FFFFFF'
    : escuro
      ? '#101827'
      : '#F5F8FC';

  const temaBase = escuro ? DarkTheme : DefaultTheme;

  const tema = {
    ...temaBase,
    colors: {
      ...temaBase.colors,
      background: fundo,
    },
  };

  return (
    <ThemeProvider value={tema}>
      <AnimatedSplashOverlay />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: fundo,
          },
        }}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferenciasProvider>
      <Navegacao />
    </PreferenciasProvider>
  );
}