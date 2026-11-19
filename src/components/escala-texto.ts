// [integração 19/11] faz o "Tamanho do texto" das Configurações valer em todas as telas do celular
// problema: no navegador o app inteiro já aumenta (zoom na raiz, ver PreferenciasProvider), mas no
// Android só 5 telas multiplicavam o tamanho da letra; o resto ficava sempre com o tamanho fixo
// solução sem reescrever as telas dos colegas: cada tela continua com o StyleSheet dela, e este
// hook devolve uma cópia com fontSize, lineHeight e letterSpacing multiplicados pela escala escolhida
//
// como usar numa tela:
//   const estilosBase = StyleSheet.create({ ... })        (era "const styles = ...")
//   dentro do componente: const styles = useEstilosEscalados(estilosBase)
// o resto da tela não muda nada (continua usando styles.titulo, styles.botao etc.)
import { useMemo } from 'react';

import { usePreferencias } from '@/features/p11-configuracoes/PreferenciasProvider';

// só o que é tamanho de texto (margem e espaçamento continuam iguais)
const CHAVES_DE_TEXTO = ['fontSize', 'lineHeight', 'letterSpacing'] as const;
// só cresce junto quando o próprio estilo tem fontSize (é uma caixa de texto com tamanho fixo)
const MEDIDAS_DA_CAIXA = ['height', 'width'] as const;

// sem tela e sem hook, pra dar pra testar sozinho (tests/teste-escala-texto.cjs)
export function escalarEstilos<T extends Record<string, unknown>>(estilos: T, escala: number): T {
  // escala 1 (ou inválida) = devolve o mesmo objeto, sem gastar nada
  if (!Number.isFinite(escala) || escala <= 0 || Math.abs(escala - 1) < 0.001) return estilos;
  const novo: Record<string, unknown> = {};
  for (const [nome, estilo] of Object.entries(estilos)) {
    if (estilo && typeof estilo === 'object' && !Array.isArray(estilo)) {
      const copia: Record<string, unknown> = { ...(estilo as Record<string, unknown>) };
      // caixa com texto dentro e altura/largura fixa (ex: campo com height 47, sigla com width 44):
      // cresce junto, senão a letra maior fica cortada
      const temTexto = typeof copia.fontSize === 'number';
      const chaves = temTexto ? [...CHAVES_DE_TEXTO, ...MEDIDAS_DA_CAIXA] : CHAVES_DE_TEXTO;
      for (const chave of chaves) {
        const valor = copia[chave];
        // arredonda pra 1 casa (evita 15.299999 no Android)
        if (typeof valor === 'number') copia[chave] = Math.round(valor * escala * 10) / 10;
      }
      novo[nome] = copia;
    } else {
      novo[nome] = estilo;
    }
  }
  return novo as T;
}

// escala escolhida em Configurações (no navegador é sempre 1, pq lá o zoom já aumenta tudo)
// todas as telas ficam dentro do PreferenciasProvider (src/app/_layout.tsx), então dá pra chamar direto
// (antes tinha um try/catch aqui, mas o lint reclamou: hook não pode ser chamado "talvez", tem que ser sempre)
export function useEscalaTexto(): number {
  return usePreferencias().escalaFonte;
}

export function useEstilosEscalados<T extends Record<string, unknown>>(estilos: T): T {
  const escala = useEscalaTexto();
  return useMemo(() => escalarEstilos(estilos, escala), [estilos, escala]);
}
