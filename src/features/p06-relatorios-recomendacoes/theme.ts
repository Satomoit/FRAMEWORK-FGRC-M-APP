// Tokens visuais extraídos do protótipo do Figma (FGRC-M).
// Se o projeto já tiver um tema compartilhado, troque este arquivo por ele.
// [integração] o app já tem tema compartilhado (fgrc-colors + Configurações da P11)
// as cores abaixo continuam como referência do Figma, e o hook useCoresP06 (no fim do arquivo)
// entrega as mesmas "gavetas" (background, card, title...) mas seguindo o tema claro/escuro
import { useMemo } from 'react';

import { useFgrcTheme } from '@/components/fgrc-colors';

export const colors = {
  background: '#F5F8FC',
  card: '#FFFFFF',
  title: '#14233B',
  text: '#4A5568',
  border: '#4A5568',
  divider: '#D9DEE5',
  primary: '#0B4F8A',
  accent: '#F58A2E',
  accentBg: '#FDEBDD',
  danger: '#B42318',
  dangerBg: '#D8C3BE',
  warning: '#B7791F',
  warningBg: '#D5CBC0',
};

export const radius = { card: 18, badge: 14, button: 16 };

export type CoresP06 = Record<keyof typeof colors, string>;

// [integração] no modo claro fica bem parecido com o Figma; no escuro usa a paleta escura do app
export function useCoresP06(): CoresP06 {
  const { colors: app, isDark } = useFgrcTheme();
  return useMemo(() => ({
    background: app.background,
    card: app.surface,
    title: app.text,
    text: app.muted,
    border: app.border,
    divider: app.divider,
    primary: app.blue,
    accent: app.orange,
    accentBg: isDark ? '#4A3320' : colors.accentBg,
    danger: app.danger,
    dangerBg: isDark ? '#4A2527' : colors.dangerBg,
    warning: isDark ? '#FFC566' : colors.warning,
    warningBg: isDark ? '#4A3A1C' : colors.warningBg,
  }), [app, isDark]);
}
