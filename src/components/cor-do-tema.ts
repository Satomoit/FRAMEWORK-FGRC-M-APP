// [tema] ajuda as telas que nasceram com cores fixas (Login, pedido de acesso, senha nova...) a seguir o tema
// a ideia é: no tema claro normal a tela fica EXATAMENTE com as cores que o integrante escolheu
// (por isso cada lugar passa a cor original), e no escuro ou no alto contraste usa a paleta do app (fgrc-colors)
// assim todas as telas usam a mesma preferência salva (PreferenciasProvider), sem paleta nova inventada
import { useCallback } from 'react';

import { useFgrcTheme, type FgrcColors } from '@/components/fgrc-colors';
import { usePreferencias } from '@/features/p11-configuracoes/PreferenciasProvider';

// papéis que as telas usam (os da paleta + alguns que faltavam pra essas telas)
export type PapelDaCor =
  | keyof FgrcColors
  // texto em cima do botão azul
  | 'sobreAzul'
  // fundinho verde do ícone de sucesso (senha alterada)
  | 'sucessoFundo'
  // fundinho laranja do ícone de "pedido enviado"
  | 'laranjaFundo';

export type CorDoTema = (corOriginal: string, papel: PapelDaCor) => string;

export function useCorDoTema(): { cor: CorDoTema; escuro: boolean } {
  const { colors, isDark } = useFgrcTheme();
  const { preferencias } = usePreferencias();
  // claro e sem alto contraste = o visual original da tela, sem mudar nada
  const original = !isDark && !preferencias.altoContraste;
  const contraste = preferencias.altoContraste;

  const cor = useCallback<CorDoTema>(
    (corOriginal, papel) => {
      if (original) return corOriginal;
      switch (papel) {
        // no escuro com alto contraste o azul fica clarinho, então o texto do botão vira preto
        case 'sobreAzul':
          return isDark && contraste ? '#000000' : colors.blueOnButton;
        case 'sucessoFundo':
          return contraste ? colors.background : '#1E3A2F';
        case 'laranjaFundo':
          return contraste ? colors.background : '#4A3322';
        default:
          return colors[papel];
      }
    },
    [original, isDark, contraste, colors],
  );

  return { cor, escuro: isDark };
}
