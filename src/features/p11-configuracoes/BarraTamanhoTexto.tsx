// [integração P11] barrinha de tamanho do texto (tipo controle de volume)
// a pessoa pode arrastar, tocar num ponto da barra ou usar os botões A- e A+
// só salva quando solta o dedo/mouse (pq salvar a cada pixel travaria o armazenamento)
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

import { ESCALA_TEXTO_MAX, ESCALA_TEXTO_MIN } from './PreferenciasProvider';

type Cores = {
  texto: string;
  secundario: string;
  borda: string;
  selecionado: string;
  cartao: string;
};

type Props = {
  valor: number;
  desabilitado?: boolean;
  cores: Cores;
  onSalvar: (novoValor: number) => void;
};

const PASSO = 0.05;
// tamanho da bolinha que a pessoa arrasta
const BOLINHA = 26;

// deixa o número sempre dentro do limite e em passos de 5%
function ajustar(valor: number) {
  const arredondado = Math.round(valor / PASSO) * PASSO;
  return Math.min(ESCALA_TEXTO_MAX, Math.max(ESCALA_TEXTO_MIN, Number(arredondado.toFixed(2))));
}

// texto simples pra mostrar e pro leitor de tela (ex: "120%")
function porcentagem(valor: number) {
  return `${Math.round(valor * 100)}%`;
}

export default function BarraTamanhoTexto({ valor, desabilitado, cores, onSalvar }: Props) {
  // valor mostrado enquanto a pessoa ta arrastando (ainda não salvo)
  const [temporario, setTemporario] = useState(valor);
  const larguraRef = useRef(0);
  const arrastandoRef = useRef(false);

  // se o valor salvo mudar (ex: carregou do armazenamento), atualiza a barrinha
  useEffect(() => {
    if (!arrastandoRef.current) setTemporario(valor);
  }, [valor]);

  // transforma a posição do dedo na barra em um tamanho (esquerda = menor, direita = maior)
  function valorDaPosicao(x: number) {
    const largura = larguraRef.current;
    if (largura <= 0) return temporario;
    const fracao = Math.min(1, Math.max(0, x / largura));
    return ajustar(ESCALA_TEXTO_MIN + fracao * (ESCALA_TEXTO_MAX - ESCALA_TEXTO_MIN));
  }

  function mexer(evento: GestureResponderEvent) {
    setTemporario(valorDaPosicao(evento.nativeEvent.locationX));
  }

  function soltar(evento: GestureResponderEvent) {
    arrastandoRef.current = false;
    const final = valorDaPosicao(evento.nativeEvent.locationX);
    setTemporario(final);
    if (final !== valor) onSalvar(final);
  }

  // botões A- e A+ (mais fácil pra quem usa teclado ou tem dificuldade de arrastar)
  function passo(direcao: 1 | -1) {
    const novo = ajustar(temporario + direcao * PASSO);
    setTemporario(novo);
    if (novo !== valor) onSalvar(novo);
  }

  const fracao = (temporario - ESCALA_TEXTO_MIN) / (ESCALA_TEXTO_MAX - ESCALA_TEXTO_MIN);

  return (
    <View>
      <View style={styles.linha}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Diminuir o texto"
          disabled={desabilitado || temporario <= ESCALA_TEXTO_MIN}
          onPress={() => passo(-1)}
          style={({ pressed }) => [styles.botao, { borderColor: cores.borda }, pressed && styles.apertado]}
        >
          <Text style={[styles.letraPequena, { color: cores.texto }]}>A-</Text>
        </Pressable>

        {/* a barra em si: o View responde ao toque e ao arraste (funciona no celular e no navegador) */}
        <View
          style={styles.areaToque}
          onLayout={(e: LayoutChangeEvent) => { larguraRef.current = e.nativeEvent.layout.width; }}
          onStartShouldSetResponder={() => !desabilitado}
          onMoveShouldSetResponder={() => !desabilitado}
          onResponderGrant={(e) => { arrastandoRef.current = true; mexer(e); }}
          onResponderMove={mexer}
          onResponderRelease={soltar}
          onResponderTerminate={soltar}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Tamanho do texto"
          accessibilityValue={{
            min: Math.round(ESCALA_TEXTO_MIN * 100),
            max: Math.round(ESCALA_TEXTO_MAX * 100),
            now: Math.round(temporario * 100),
            text: porcentagem(temporario),
          }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => passo(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        >
          {/* pointerEvents none: os filhos não roubam o toque, então o locationX é sempre da barra */}
          <View pointerEvents="none" style={[styles.trilho, { backgroundColor: cores.borda }]}>
            <View style={[styles.preenchido, { width: `${fracao * 100}%`, backgroundColor: cores.selecionado }]} />
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.bolinha,
              {
                left: `${fracao * 100}%`,
                backgroundColor: cores.selecionado,
                borderColor: cores.cartao,
              },
            ]}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aumentar o texto"
          disabled={desabilitado || temporario >= ESCALA_TEXTO_MAX}
          onPress={() => passo(1)}
          style={({ pressed }) => [styles.botao, { borderColor: cores.borda }, pressed && styles.apertado]}
        >
          <Text style={[styles.letraGrande, { color: cores.texto }]}>A+</Text>
        </Pressable>
      </View>

      <Text style={[styles.valor, { color: cores.secundario }]}>
        Tamanho atual: {porcentagem(temporario)}
        {temporario === 1 ? ' (normal)' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  botao: {
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apertado: { opacity: 0.6 },
  letraPequena: { fontSize: 14, fontWeight: '700' },
  letraGrande: { fontSize: 20, fontWeight: '700' },
  // área grande pra ficar fácil de acertar com o dedo
  areaToque: { flex: 1, height: 44, justifyContent: 'center' },
  trilho: { height: 6, borderRadius: 3, overflow: 'hidden' },
  preenchido: { height: 6 },
  bolinha: {
    position: 'absolute',
    width: BOLINHA,
    height: BOLINHA,
    borderRadius: BOLINHA / 2,
    marginLeft: -BOLINHA / 2,
    borderWidth: 3,
    top: (44 - BOLINHA) / 2,
  },
  valor: { fontSize: 14, marginTop: 8 },
});
