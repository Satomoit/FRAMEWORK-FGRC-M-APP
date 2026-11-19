// [integração] mini tutorial do app (aparece na primeira vez que a pessoa entra na Home)
// a pessoa escolhe "Ver tutorial" ou "Pular". Depois dá pra ver de novo no botão "Como usar" da Home
// o texto é bem simples de propósito: quem usa é gente de prefeitura pequena, não precisa entender de TI
// [integração 19/11] virou tutorial GUIADO: escurece a tela e ilumina o botão de verdade (menu de baixo, ajuda)
// com um cartão do lado explicando o que tocar. Botões: Pular, Voltar, Próximo e Concluir
// se o botão não puder ser destacado (ex: ta fora da tela), o cartão explica com texto onde ele fica
// a lista de passos e as contas do destaque ficam em passos-tutorial.ts (dá pra testar sem abrir o app)
// não usa biblioteca nenhuma: são só 4 retângulos escuros em volta do botão + uma borda laranja
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, BackHandler, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
// [integração 19/11] ícones do próprio Expo (já vem no projeto, não é biblioteca nova)
import Ionicons from '@expo/vector-icons/Ionicons';

import { useFgrcTheme } from '@/components/fgrc-colors';
import type { IconeDoBotao } from '@/components/fgrc-ui';
import { useEstilosEscalados } from '@/components/escala-texto';
import { usePreferencias } from '@/features/p11-configuracoes/PreferenciasProvider';
import {
  PASSOS_TUTORIAL,
  buracoDoDestaque,
  ehUltimoPasso,
  lugarDoCartao,
  medidasDoCartao,
  partesDoEscurecimento,
  passoAnterior,
  passoSeguinte,
  rotuloDoPasso,
  type Retangulo,
  type Tela,
} from './passos-tutorial';

// guarda neste aparelho que a pessoa já viu (ou pulou) o tutorial
// [integração 19/11] mesma chave de antes: quem já viu o tutorial antigo não é incomodado de novo
const CHAVE_TUTORIAL = 'fgrcm:tutorial-visto:v1';

// [integração 19/11] "Rever tutorial" das Configurações: marca aqui e a Home abre quando aparecer
let pedidoDeRever = false;
export function pedirParaReverTutorial() {
  pedidoDeRever = true;
}

// [integração 19/11] o que o tutorial precisa de um botão: só saber medir onde ele ta na tela
// (não usa o tipo View direto pq no RN 0.88 "View" é o componente, não o botão desenhado; o tsc reclamava)
type Medivel = {
  measureInWindow: (pronto: (x: number, y: number, largura: number, altura: number) => void) => void;
};

// botões que podem ser destacados (a Home registra cada um pelo nome, ex: 'aba:Avaliações')
type Alvos = Record<string, Medivel | null>;

// hook que decide quando o tutorial aparece
// mostra sozinho só se a pessoa nunca viu nem pulou (lê do armazenamento do aparelho)
export function useTutorial() {
  const [aberto, setAberto] = useState(false);
  const [perguntar, setPerguntar] = useState(false);
  // [integração 19/11] guarda os botões da Home que o tutorial pode iluminar
  const alvos = useRef<Alvos>({});
  const funcoesDeRef = useRef<Record<string, (no: Medivel | null) => void>>({});

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(CHAVE_TUTORIAL)
      .then(valor => { if (ativo && !valor) { setPerguntar(true); setAberto(true); } })
      .catch(() => {}); // se não conseguir ler, só não mostra (não trava a Home)
    return () => { ativo = false; };
  }, []);

  // [integração 19/11] veio do "Rever tutorial" das Configurações? abre direto no primeiro passo
  useFocusEffect(
    useCallback(() => {
      if (pedidoDeRever) {
        pedidoDeRever = false;
        setPerguntar(false);
        setAberto(true);
      }
    }, [])
  );

  // quando fecha (pulou ou terminou) grava que já viu, pra não aparecer toda hora
  const fechar = useCallback(() => {
    setAberto(false);
    setPerguntar(false);
    AsyncStorage.setItem(CHAVE_TUTORIAL, new Date().toISOString()).catch(() => {});
  }, []);

  // pelo botão "Como usar" abre direto no primeiro passo (sem a pergunta)
  const abrir = useCallback(() => { setPerguntar(false); setAberto(true); }, []);

  // [integração 19/11] uso na tela: <Pressable ref={tutorial.alvo('aba:Avaliações')} ...>
  // devolve sempre a mesma função pro mesmo nome (senão o React chamava de novo a cada desenho)
  const alvo = useCallback((nome: string) => {
    if (!funcoesDeRef.current[nome]) {
      funcoesDeRef.current[nome] = (no: Medivel | null) => { alvos.current[nome] = no; };
    }
    return funcoesDeRef.current[nome];
  }, []);

  return { aberto, perguntar, abrir, fechar, alvo, alvos };
}

type Props = {
  aberto: boolean;
  // true = primeira vez (mostra "Ver tutorial" / "Pular" antes dos passos)
  perguntar: boolean;
  onFechar: () => void;
  // [integração 19/11] botões registrados com tutorial.alvo(...) (sem isso o cartão só explica com texto)
  alvos?: { current: Alvos };
};

// o que foi medido na tela: tamanho da camada escura e o buraco em volta do botão
type Medidas = { tela: Tela; buraco: Retangulo | null };

// [integração 19/11] precisa ficar como ÚLTIMO filho da tela inteira (o SafeAreaView da Home)
// pq ele se estica por cima de tudo (position absolute) pra escurecer inclusive o menu de baixo
export default function TutorialInicial({ aberto, perguntar, onFechar, alvos }: Props) {
  const { colors } = useFgrcTheme();
  const styles = useEstilosEscalados(estilosBase);
  const { preferencias } = usePreferencias();
  const { width, height } = useWindowDimensions();
  // -1 = tela da pergunta "quer ver o tutorial?" | 0 em diante = os passos
  const [passo, setPasso] = useState(perguntar ? -1 : 0);
  const [medidas, setMedidas] = useState<Medidas | null>(null);
  const camada = useRef<Medivel | null>(null);
  // guarda a camada escura pra medir (função em vez de passar o useRef direto, por causa do tipo do RN 0.88)
  const guardarCamada = useCallback((no: Medivel | null) => { camada.current = no; }, []);

  // toda vez que abrir, começa do começo
  // [integração 19/11] feito no desenho em vez de useEffect (jeito recomendado pelo React; o lint reclamava)
  const abertura = aberto ? (perguntar ? 'pergunta' : 'passos') : null;
  const [aberturaAntes, setAberturaAntes] = useState(abertura);
  if (abertura !== aberturaAntes) {
    setAberturaAntes(abertura);
    if (abertura) setPasso(abertura === 'pergunta' ? -1 : 0);
  }

  const total = PASSOS_TUTORIAL.length;
  const atual = passo >= 0 ? PASSOS_TUTORIAL[passo] : null;
  const nomeDoAlvo = atual?.alvo ?? null;

  // mede onde o botão ta na tela (em relação à própria camada escura, assim não importa barra de status etc.)
  // na web o app inteiro tem zoom (tamanho do texto), então divide pelo zoom pra voltar pra medida do CSS
  const medir = useCallback(() => {
    const raiz = camada.current;
    if (!raiz) return;
    const zoom = Platform.OS === 'web' ? preferencias.escalaTexto || 1 : 1;
    raiz.measureInWindow((ox, oy, ow, oh) => {
      const tela: Tela = { largura: ow / zoom, altura: oh / zoom };
      const no = nomeDoAlvo && alvos ? alvos.current[nomeDoAlvo] : null;
      if (!no || tela.largura <= 0) {
        setMedidas({ tela, buraco: null });
        return;
      }
      no.measureInWindow((x, y, w, h) => {
        const alvo: Retangulo = { x: (x - ox) / zoom, y: (y - oy) / zoom, largura: w / zoom, altura: h / zoom };
        setMedidas({ tela, buraco: buracoDoDestaque(alvo, tela) });
      });
    });
  }, [nomeDoAlvo, alvos, preferencias.escalaTexto]);

  // mede de novo quando troca de passo, gira a tela ou muda o tamanho da janela
  // (espera um pouquinho pra tela terminar de se arrumar antes de medir)
  useEffect(() => {
    if (!aberto) return;
    const t = setTimeout(medir, 60);
    return () => clearTimeout(t);
  }, [aberto, passo, width, height, medir]);

  // [integração 19/11] animações simples (Animated já vem no React Native):
  //   pulso = a borda laranja "respira" pra chamar atenção pro botão
  //   surgir = o cartão aparece suave quando troca de passo
  // quem ligou "Reduzir movimento" no celular não vê animação nenhuma (acessibilidade)
  // (useState com função = cria o valor da animação uma vez só; o lint do React não deixa ler useRef().current no desenho)
  const [pulso] = useState(() => new Animated.Value(0));
  const [surgir] = useState(() => new Animated.Value(1));
  const [semMovimento, setSemMovimento] = useState(false);
  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { if (ativo) setSemMovimento(v); }).catch(() => {});
    return () => { ativo = false; };
  }, []);
  const usarNativo = Platform.OS !== 'web';
  useEffect(() => {
    if (!aberto || semMovimento) { pulso.setValue(0); return; }
    const laco = Animated.loop(Animated.sequence([
      Animated.timing(pulso, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: usarNativo }),
      Animated.timing(pulso, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: usarNativo }),
    ]));
    laco.start();
    return () => laco.stop();
  }, [aberto, semMovimento, pulso, usarNativo]);
  useEffect(() => {
    if (!aberto || semMovimento) { surgir.setValue(1); return; }
    surgir.setValue(0);
    Animated.timing(surgir, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: usarNativo }).start();
  }, [aberto, passo, semMovimento, surgir, usarNativo]);

  // botão Voltar do Android fecha o tutorial (igual ao Pular) em vez de sair da Home
  useEffect(() => {
    if (!aberto || Platform.OS !== 'android') return;
    const s = BackHandler.addEventListener('hardwareBackPress', () => { onFechar(); return true; });
    return () => s.remove();
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const tela = medidas?.tela ?? { largura: width, altura: height };
  const buraco = atual ? medidas?.buraco ?? null : null;
  const lugar = lugarDoCartao(buraco, tela);
  const cartao = medidasDoCartao(buraco, tela);
  const ultimo = ehUltimoPasso(passo, total);
  // o passo tem botão pra destacar mas não deu (ta fora da tela, por ex.): explica com texto
  const semDestaque = Boolean(atual?.alvo) && medidas !== null && !buraco;

  // posição do cartão: em cima ou embaixo do botão (no meio da tela fica num container centralizado)
  const posicao =
    lugar.lugar === 'acima' ? { bottom: lugar.bottom }
      : lugar.lugar === 'abaixo' ? { top: lugar.top }
        : null;

  return (
    <View
      ref={guardarCamada}
      collapsable={false}
      onLayout={() => { medir(); }}
      // segura os toques fora do cartão (pra ninguém sair da tela sem querer no meio do tutorial)
      onStartShouldSetResponder={() => true}
      accessibilityViewIsModal
      aria-modal
      style={StyleSheet.absoluteFill}
    >
      {/* as faixas escuras em volta do botão destacado */}
      {partesDoEscurecimento(buraco, tela).map((r, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[styles.escuro, { left: r.x, top: r.y, width: r.largura, height: r.altura }]}
        />
      ))}

      {/* borda laranja em volta do botão (mostra onde tocar) */}
      {/* [integração 19/11] agora ela pulsa (cresce e diminui de leve) pra chamar atenção */}
      {buraco ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.anel,
            {
              left: buraco.x, top: buraco.y, width: buraco.largura, height: buraco.altura, borderColor: colors.orange,
              opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] }),
              transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
            },
          ]}
        />
      ) : null}
      {/* [integração 19/11] tocar no botão iluminado também avança (muita gente tenta tocar nele) */}
      {/* (não abre a tela de verdade no meio do tutorial; o leitor de tela usa os botões do cartão) */}
      {buraco && atual ? (
        <Pressable
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          onPress={() => (ultimo ? onFechar() : setPasso(passoSeguinte(passo, total)))}
          style={[styles.toqueNoDestaque, { left: buraco.x, top: buraco.y, width: buraco.largura, height: buraco.altura }]}
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={posicao ? [styles.lugarDoCartao, posicao, { left: cartao.esquerda, width: cartao.largura }] : [StyleSheet.absoluteFill, styles.meio]}
      >
        {/* setinha apontando pro botão (fica atrás do cartão, só a pontinha aparece) */}
        {buraco && posicao && cartao.seta !== null ? (
          <View
            pointerEvents="none"
            style={[
              styles.seta,
              lugar.lugar === 'acima' ? { bottom: -9 } : { top: -9 },
              { left: cartao.seta - 9, backgroundColor: colors.surface, borderColor: colors.orange },
            ]}
          />
        ) : null}
        <Animated.View
          style={[
            styles.cartao,
            { width: cartao.largura, maxHeight: lugar.alturaMaxima, backgroundColor: colors.surface, borderColor: colors.border, opacity: surgir },
          ]}
        >
          <ScrollView contentContainerStyle={styles.conteudo}>
            {passo === -1 ? (
              <>
                <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text }]}>Primeira vez por aqui?</Text>
                <Text style={[styles.texto, { color: colors.muted }]}>
                  Preparamos um passo a passo rápido (cerca de 1 minuto) mostrando onde fica cada coisa no aplicativo.
                </Text>
                <View style={styles.botoes}>
                  <Botao rotulo="Pular" cores={colors} estilos={styles} onPress={onFechar} />
                  <Botao rotulo="Ver tutorial" principal cores={colors} estilos={styles} onPress={() => setPasso(0)} />
                </View>
              </>
            ) : atual ? (
              <>
                {/* [integração 19/11] barrinha de progresso + "Passo 2 de 7" (no lugar das bolinhas, fica mais claro) */}
                <View style={styles.topo}>
                  <View style={[styles.trilho, { backgroundColor: colors.divider }]}>
                    <View style={[styles.progresso, { backgroundColor: colors.blue, width: `${Math.round(((passo + 1) / total) * 100)}%` as `${number}%` }]} />
                  </View>
                  <Text style={[styles.contador, { color: colors.muted }]}>{rotuloDoPasso(passo, total)}</Text>
                </View>
                {/* [integração 19/11] ícone do passo (o mesmo desenho do botão do menu) ao lado do título */}
                <View style={styles.cabecalho}>
                  <View style={[styles.circuloIcone, { backgroundColor: colors.iconBackground }]}>
                    <Ionicons name={atual.icone as IconeDoBotao} size={24} color={colors.blue} accessibilityElementsHidden importantForAccessibility="no" />
                  </View>
                  <Text accessibilityRole="header" style={[styles.titulo, styles.tituloComIcone, { color: colors.text }]}>{atual.titulo}</Text>
                </View>
                {/* liveRegion = o TalkBack lê o texto novo quando troca de passo */}
                <Text accessibilityLiveRegion="polite" style={[styles.texto, { color: colors.text }]}>{atual.texto}</Text>
                {semDestaque && atual.dicaSemAlvo ? (
                  <Text style={[styles.dica, { color: colors.muted }]}>{atual.dicaSemAlvo}</Text>
                ) : null}
                {/* [integração 19/11] lista com ✓ verde (o resumo do último passo) */}
                {atual.lista ? (
                  <View style={styles.lista}>
                    {atual.lista.map((item, i) => (
                      <View key={i} style={styles.itemDaLista}>
                        <Ionicons name="checkmark-circle" size={22} color={colors.success} accessibilityElementsHidden importantForAccessibility="no" />
                        <Text style={[styles.textoDaLista, { color: colors.text }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {/* [integração 19/11] dica pequena: dá pra tocar no próprio botão iluminado */}
                {buraco ? (
                  <Text style={[styles.dica, { color: colors.muted }]}>Toque em “Próximo” ou no botão destacado em laranja.</Text>
                ) : null}

                {/* flexWrap: com letra grande os botões descem pra linha de baixo em vez de espremer */}
                <View style={styles.botoes}>
                  {passo > 0 ? (
                    <Botao rotulo="Voltar" cores={colors} estilos={styles} onPress={() => setPasso(passoAnterior(passo))} />
                  ) : null}
                  {!ultimo ? <Botao rotulo="Pular" cores={colors} estilos={styles} onPress={onFechar} /> : null}
                  <Botao
                    rotulo={ultimo ? 'Concluir' : 'Próximo'}
                    principal
                    cores={colors}
                    estilos={styles}
                    onPress={() => (ultimo ? onFechar() : setPasso(passoSeguinte(passo, total)))}
                    icone={ultimo ? 'checkmark' : 'arrow-forward'}
                  />
                </View>
              </>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

// botão simples (cheio = ação principal, só borda = secundário)
function Botao({ rotulo, principal, cores, estilos, onPress, icone }: {
  rotulo: string;
  principal?: boolean;
  cores: ReturnType<typeof useFgrcTheme>['colors'];
  estilos: typeof estilosBase;
  onPress: () => void;
  // [integração 19/11] setinha no Próximo e ✓ no Concluir
  icone?: IconeDoBotao;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.botao,
        principal ? { backgroundColor: cores.blue, borderColor: cores.blue } : { borderColor: cores.border },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={estilos.botaoConteudo}>
        <Text style={[estilos.botaoTexto, { color: principal ? cores.blueOnButton : cores.blue }]}>{rotulo}</Text>
        {icone ? <Ionicons name={icone} size={18} color={principal ? cores.blueOnButton : cores.blue} accessibilityElementsHidden importantForAccessibility="no" /> : null}
      </View>
    </Pressable>
  );
}

const estilosBase = StyleSheet.create({
  escuro: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.62)' },
  anel: { position: 'absolute', borderWidth: 3, borderRadius: 14 },
  lugarDoCartao: { position: 'absolute' },
  meio: { justifyContent: 'center', alignItems: 'center', padding: 14 },
  cartao: { borderRadius: 16, borderWidth: 1, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  seta: { position: 'absolute', width: 18, height: 18, borderWidth: 1, transform: [{ rotate: '45deg' }] },
  conteudo: { padding: 20 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  // [integração 19/11] barrinha de progresso, ícone do passo, lista do resumo e área de toque do destaque
  trilho: { flex: 1, minWidth: 80, height: 6, borderRadius: 3, overflow: 'hidden' },
  progresso: { height: 6, borderRadius: 3 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  circuloIcone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tituloComIcone: { flex: 1, marginBottom: 0 },
  lista: { gap: 10, marginBottom: 12 },
  itemDaLista: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textoDaLista: { flex: 1, fontSize: 16, lineHeight: 22 },
  toqueNoDestaque: { position: 'absolute', borderRadius: 14 },
  botaoConteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  contador: { fontSize: 13, fontWeight: '600' },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  texto: { fontSize: 16, lineHeight: 24, marginBottom: 12 },
  dica: { fontSize: 14, lineHeight: 21, fontStyle: 'italic', marginBottom: 12 },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, marginTop: 6 },
  botao: { minHeight: 48, minWidth: 96, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, flexGrow: 1 },
  botaoTexto: { fontSize: 16, fontWeight: '700' },
});
