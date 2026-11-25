// [integração 25/11] leitura obrigatória dos Termos de Uso (aparece quando a pessoa vai ativar a conta)
// é uma "janela" por cima da tela, no mesmo estilo do tutorial (TutorialInicial.tsx): fundo escuro + cartão
// como funciona:
//   1. o cartão mostra os Termos de Uso inteiros (os mesmos da tela Privacidade e termos, vêm do mesmo arquivo)
//   2. enquanto a pessoa não chega no fim do texto, o botão principal é "Continuar lendo" (desce um pedaço)
//   3. chegou no fim: o botão vira "Li e aceito". Só aí dá pra aceitar
//   4. "Não aceito" fecha e a tela que chamou decide o que fazer (voltar ou sair da conta)
// a janela NÃO guarda nada sozinha: ela só avisa a tela (onAceitar) com a versão e a hora do aceite,
// e a tela é que grava na conta (ver src/app/ativar-acesso.tsx e a Home)
// as contas da rolagem ficam em src/lib/aceite-dos-termos.ts (dá pra testar sem abrir o app)
// igual o tutorial, precisa ficar como ÚLTIMO filho da tela inteira, pq se estica por cima de tudo
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEstilosEscalados } from '@/components/escala-texto';
import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton } from '@/components/fgrc-ui';
import {
  cabeSemRolar,
  chegouNoFim,
  parteLida,
  proximaRolagem,
  registroDoAceite,
  rolagemMaxima,
  type MedidasDaRolagem,
  type RegistroDoAceite,
} from '@/lib/aceite-dos-termos';
import { TERMOS_DE_USO, VERSAO_DO_TEXTO } from '@/lib/termos-e-privacidade';

// o que a janela precisa da lista que rola: só conseguir mandar ela descer
// (mesmo jeito usado no Page do fgrc-ui.tsx, por causa do tipo do ScrollView no RN 0.88)
type Rolavel = { scrollTo: (opcoes: { y: number; animated?: boolean }) => void };

// o pedaço do aviso de rolagem que interessa (o celular manda bem mais coisa junto)
type AvisoDeRolagem = {
  contentOffset: { y: number };
  layoutMeasurement: { height: number };
  contentSize: { height: number };
};

type Props = {
  // true = a janela aparece por cima da tela
  visivel: boolean;
  // a pessoa leu tudo e tocou em "Li e aceito" (vem a versão dos termos e a hora, pra tela gravar na conta)
  onAceitar: (registro: RegistroDoAceite) => void;
  // a pessoa tocou em "Não aceito"
  onRecusar: () => void;
  // true = a tela ta gravando o aceite na conta (os botões ficam travados e aparece "Registrando...")
  ocupado?: boolean;
  // aviso de erro pra mostrar perto dos botões (ex: sem internet na hora de gravar)
  erro?: string;
};

export default function AceiteDosTermos({ visivel, onAceitar, onRecusar, ocupado = false, erro = '' }: Props) {
  const { colors } = useFgrcTheme();
  // tamanho do texto escolhido em Configurações (os termos também crescem)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  // espaço da barra de cima e da barra de baixo do celular (pra janela não ficar embaixo delas)
  const margens = useSafeAreaInsets();

  // leuTudo = a pessoa já chegou no fim do texto (é isso que libera o "Li e aceito")
  const [leuTudo, setLeuTudo] = useState(false);
  // de 0 a 100: tamanho da barrinha de progresso
  const [progresso, setProgresso] = useState(0);
  // quem ligou "Reduzir movimento" no celular não vê a rolagem animada (acessibilidade, igual no tutorial)
  const [semMovimento, setSemMovimento] = useState(false);

  // esses valores mudam a cada pedacinho de rolagem; ficam em useRef pra não redesenhar a tela toda hora
  const medidas = useRef<MedidasDaRolagem>({ rolagem: 0, alturaVisivel: 0, alturaConteudo: 0 });
  const maisBaixoJaVisto = useRef(0);
  const jaPedido = useRef(0);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);
  // hora em que o "Li e aceito" apareceu (ver a função aceitar, mais embaixo)
  const liberadoEm = useRef(0);
  const lista = useRef<Rolavel | null>(null);
  const guardarLista = useCallback((no: Rolavel | null) => { lista.current = no; }, []);

  // marca que a pessoa chegou no fim do texto (e anota a hora, só na primeira vez)
  const liberar = useCallback(() => {
    if (!liberadoEm.current) liberadoEm.current = Date.now();
    setLeuTudo(true);
  }, []);

  // toda vez que a janela abrir de novo, a leitura começa do zero
  // (feito no desenho em vez de useEffect: é o jeito recomendado pelo React e o mesmo do tutorial)
  const [visivelAntes, setVisivelAntes] = useState(visivel);
  if (visivel !== visivelAntes) {
    setVisivelAntes(visivel);
    if (visivel) { setLeuTudo(false); setProgresso(0); }
  }
  useEffect(() => {
    if (!visivel) return;
    medidas.current = { ...medidas.current, rolagem: 0 };
    maisBaixoJaVisto.current = 0;
    jaPedido.current = 0;
    liberadoEm.current = 0;
  }, [visivel]);

  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { if (ativo) setSemMovimento(v); }).catch(() => {});
    return () => { ativo = false; };
  }, []);

  // se a janela sumir no meio de uma espera, cancela (pra não mexer em tela que já fechou)
  useEffect(() => () => { if (espera.current) clearTimeout(espera.current); }, []);

  // libera o "Li e aceito" depois de um instante, e só se a condição continuar valendo
  // (usado nos dois casos em que não dá pra confiar só no aviso de rolagem do celular)
  const liberarDepois = useCallback((aindaVale: () => boolean, milissegundos: number) => {
    if (espera.current) clearTimeout(espera.current);
    espera.current = setTimeout(() => {
      espera.current = null;
      if (aindaVale()) liberar();
    }, milissegundos);
  }, [liberar]);

  // junta a medida nova com as que já tinha e decide se chegou no fim
  const atualizar = useCallback((novas: Partial<MedidasDaRolagem>) => {
    const m = { ...medidas.current, ...novas };
    medidas.current = m;
    maisBaixoJaVisto.current = Math.max(maisBaixoJaVisto.current, m.rolagem + m.alturaVisivel);
    const novo = Math.round(parteLida(m, maisBaixoJaVisto.current) * 100);
    setProgresso(antes => (antes === novo ? antes : novo));
    // a pessoa desceu de verdade e chegou no fim: libera na hora
    if (m.rolagem > 0 && chegouNoFim(m)) { liberar(); return; }
    // tela muito grande, o texto coube inteiro sem rolar: espera um pouco e confere de novo
    // (a espera é pra não liberar por engano enquanto a tela ainda ta se arrumando)
    if (cabeSemRolar(m)) liberarDepois(() => cabeSemRolar(medidas.current), 600);
  }, [liberar, liberarDepois]);

  const aoRolar = useCallback((aviso: AvisoDeRolagem) => {
    atualizar({
      rolagem: aviso.contentOffset.y,
      alturaVisivel: aviso.layoutMeasurement.height,
      alturaConteudo: aviso.contentSize.height,
    });
  }, [atualizar]);

  // botão "Continuar lendo": desce quase uma tela de texto
  function continuarLendo() {
    const m = medidas.current;
    const alvo = proximaRolagem(m, jaPedido.current);
    jaPedido.current = alvo;
    lista.current?.scrollTo({ y: alvo, animated: !semMovimento });
    // garantia: se esse toque já mandou a tela pro fim e o celular não avisar a rolagem, libera do mesmo jeito
    // (sem isso, um celular que não avisasse deixaria a pessoa presa sem conseguir aceitar)
    if (m.alturaConteudo > 0 && alvo >= rolagemMaxima(m) - 1) {
      liberarDepois(() => jaPedido.current >= rolagemMaxima(medidas.current) - 1, 700);
    }
  }

  // botão "Li e aceito"
  // ele aparece no MESMO lugar do "Continuar lendo"; quem vinha tocando rápido pra descer podia aceitar sem querer
  // por isso os toques do primeiro meio segundo depois que ele aparece não contam
  function aceitar() {
    if (ocupado || Date.now() - liberadoEm.current < 500) return;
    onAceitar(registroDoAceite());
  }

  if (!visivel) return null;

  return (
    <View
      // segura os toques fora do cartão (pra ninguém mexer na tela de trás sem aceitar)
      onStartShouldSetResponder={() => true}
      accessibilityViewIsModal
      aria-modal
      style={[StyleSheet.absoluteFill, styles.fundo, { paddingTop: 14 + margens.top, paddingBottom: 14 + margens.bottom }]}
    >
      <View style={[styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.topo}>
          <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text }]}>Termos de Uso</Text>
        </View>

        <ScrollView
          ref={guardarLista}
          style={[styles.lista, { borderColor: colors.divider }]}
          contentContainerStyle={styles.conteudo}
          // de quanto em quanto tempo o celular avisa a rolagem (em milissegundos); sem isso o iPhone avisa uma vez só
          scrollEventThrottle={32}
          onScroll={e => aoRolar(e.nativeEvent)}
          // os dois de baixo avisam onde a tela parou quando a pessoa solta o dedo (reforço pro aviso de cima)
          onScrollEndDrag={e => aoRolar(e.nativeEvent)}
          onMomentumScrollEnd={e => aoRolar(e.nativeEvent)}
          onLayout={e => atualizar({ alturaVisivel: e.nativeEvent.layout.height })}
          onContentSizeChange={(_largura, altura) => atualizar({ alturaConteudo: altura })}
        >
          {/* o aviso fica dentro da parte que rola (em celular pequeno com letra grande sobra mais espaço pro texto) */}
          <Text style={[styles.subtitulo, { color: colors.muted }]}>
            Para ativar a sua conta, leia até o fim e toque em Li e aceito.
          </Text>
          <Text style={[styles.versao, { color: colors.muted }]}>Versão de {VERSAO_DO_TEXTO}</Text>
          <Text style={[styles.texto, { color: colors.text }]}>
            A Política de Privacidade, que explica o que o aplicativo faz com os seus dados, fica na tela Privacidade e termos.
          </Text>
          {/* abre a tela completa POR CIMA desta (pilha de telas); ao voltar, a leitura continua de onde parou */}
          <Text
            accessibilityRole="link"
            accessibilityHint="Abre a tela Privacidade e termos."
            onPress={() => router.push('/privacidade' as Href)}
            style={[styles.link, { color: colors.text }]}
          >
            Abrir Privacidade e termos
          </Text>

          {TERMOS_DE_USO.map(s => (
            <View key={s.titulo} style={styles.secao}>
              <Text accessibilityRole="header" style={[styles.tituloDaSecao, { color: colors.text }]}>{s.titulo}</Text>
              {s.textos.map(t => (
                // item de lista ("• ...") fica um pouco pra dentro, o resto é parágrafo normal
                <Text key={t} style={[styles.texto, t.startsWith('• ') && styles.item, { color: colors.text }]}>{t}</Text>
              ))}
            </View>
          ))}
          <Text style={[styles.fim, { color: colors.muted }]}>Fim dos Termos de Uso.</Text>
        </ScrollView>

        <View style={styles.rodape}>
          {/* barrinha: mostra quanto do texto já passou pela tela (some da leitura do leitor de tela, que já lê a frase de baixo) */}
          <View
            style={[styles.trilho, { backgroundColor: colors.divider }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View style={[styles.progresso, { backgroundColor: colors.blue, width: `${leuTudo ? 100 : progresso}%` as `${number}%` }]} />
          </View>
          {/* liveRegion = o leitor de tela avisa quando a frase muda (ou seja, quando o botão de aceitar é liberado) */}
          <Text accessibilityLiveRegion="polite" style={[styles.dica, { color: colors.muted }]}>
            {leuTudo
              ? 'Você chegou ao fim. Se concordar, toque em Li e aceito.'
              : 'Role o texto ou toque em Continuar lendo até chegar ao fim.'}
          </Text>
          {erro ? <Text accessibilityLiveRegion="assertive" style={[styles.erro, { color: colors.danger }]}>{erro}</Text> : null}

          {/* um botão embaixo do outro (lado a lado o texto quebrava em duas linhas no celular e com letra grande) */}
          {/* o de cima muda sozinho: "Continuar lendo" enquanto falta texto, "Li e aceito" quando chega no fim */}
          <View style={styles.botoes}>
            {leuTudo ? (
              <FgrcButton
                label={ocupado ? 'Registrando...' : 'Li e aceito'}
                variant="success"
                icon="checkmark"
                disabled={ocupado}
                onPress={aceitar}
              />
            ) : (
              <FgrcButton label="Continuar lendo" icon="arrow-down" onPress={continuarLendo} />
            )}
            {/* "Não aceito" com a cor do texto e borda (o FgrcButton de contorno fica azul com contraste 3,7:1 no tema escuro) */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: ocupado }}
              disabled={ocupado}
              onPress={onRecusar}
              style={({ pressed }) => [styles.recusar, { borderColor: colors.border, opacity: ocupado ? 0.45 : pressed ? 0.8 : 1 }]}
            >
              <Text style={[styles.recusarTexto, { color: colors.text }]}>Não aceito</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const estilosBase = StyleSheet.create({
  // mesmo escurecido do tutorial
  fundo: { backgroundColor: 'rgba(0,0,0,0.62)', paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  // o cartão ocupa quase a tela toda (sobra mais espaço pro texto); em tela grande para em 560 x 760
  cartao: { flex: 1, width: '100%', maxWidth: 560, maxHeight: 760, borderRadius: 16, borderWidth: 1, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  topo: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  titulo: { fontSize: 20, fontWeight: '700' },
  subtitulo: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  // a parte que rola fica entre duas linhas, pra dar pra ver que o texto continua
  lista: { flex: 1, borderTopWidth: 1, borderBottomWidth: 1 },
  conteudo: { paddingHorizontal: 20, paddingVertical: 14 },
  versao: { fontSize: 13, marginBottom: 10 },
  secao: { marginTop: 10, marginBottom: 6 },
  tituloDaSecao: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  texto: { fontSize: 15, lineHeight: 23, marginBottom: 8 },
  item: { paddingLeft: 12, marginBottom: 6 },
  link: { fontSize: 15, lineHeight: 23, fontWeight: '700', textDecorationLine: 'underline', paddingVertical: 8, marginBottom: 4 },
  fim: { fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  rodape: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  trilho: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progresso: { height: 6, borderRadius: 3 },
  dica: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  erro: { fontSize: 14, lineHeight: 20, fontWeight: '700', marginBottom: 10 },
  botoes: { gap: 8 },
  // mesmo tamanho do FgrcButton (52 de altura, cantos 12)
  recusar: { minHeight: 52, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18 },
  recusarTexto: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
