// Tokens visuais extraídos do protótipo do Figma (FGRC-M).
// Se o projeto já tiver um tema compartilhado, troque este arquivo por ele.
// [integração] o app já tem tema compartilhado (fgrc-colors + Configurações da P11)
// as cores abaixo continuam como referência do Figma, e o hook useCoresP05 (no fim do arquivo)
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
  track: '#D9D9D9',
  primary: '#0B4F8A',
  accent: '#F58A2E',
  danger: '#B42318',
  dangerBg: '#D8C3BE',
  warning: '#B7791F',
  warningBg: '#D5CBC0',
};

export const radius = { card: 18, badge: 14, button: 16 };

// [integração] mesmas chaves do Figma + as cores do selo "Baixo" (que estavam fixas no ClassificationBadge)
export type CoresP05 = Record<keyof typeof colors | 'success' | 'successBg', string>;

// [integração] no modo claro fica bem parecido com o Figma; no escuro usa a paleta escura do app
// os fundos dos selos (dangerBg, warningBg, successBg) não existem no tema do app, então ficam aqui
export function useCoresP05(): CoresP05 {
  const { colors: app, isDark } = useFgrcTheme();
  return useMemo(() => ({
    background: app.background,
    card: app.surface,
    title: app.text,
    text: app.muted,
    border: app.border,
    divider: app.divider,
    track: app.divider,
    primary: app.blue,
    accent: app.orange,
    danger: app.danger,
    dangerBg: isDark ? '#4A2527' : colors.dangerBg,
    warning: isDark ? '#FFC566' : colors.warning,
    warningBg: isDark ? '#4A3A1C' : colors.warningBg,
    success: isDark ? app.success : '#1B6B3A',
    successBg: isDark ? '#1E3F31' : '#C9DDD3',
  }), [app, isDark]);
}
