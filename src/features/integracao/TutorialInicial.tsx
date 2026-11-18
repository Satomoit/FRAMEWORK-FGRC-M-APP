// [integração] mini tutorial do app (aparece na primeira vez que a pessoa entra na Home)
// a pessoa escolhe "Ver tutorial" ou "Pular". Depois dá pra ver de novo no botão "Como usar" da Home
// o texto é bem simples de propósito: quem usa é gente de prefeitura pequena, não precisa entender de TI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';

// guarda neste aparelho que a pessoa já viu (ou pulou) o tutorial
const CHAVE_TUTORIAL = 'fgrcm:tutorial-visto:v1';

// cada passo é uma "página" do tutorial
const PASSOS = [
  {
    titulo: 'Bem-vindo ao FGRC-M',
    texto:
      'Este aplicativo ajuda a prefeitura a saber como está cuidando da segurança dos computadores, dos sistemas e das informações. ' +
      'Você não precisa entender de tecnologia para usar.',
  },
  {
    titulo: '1. Responda a avaliação',
    texto:
      'Em "Avaliações", responda 32 perguntas sobre o dia a dia da prefeitura. ' +
      'Em cada pergunta, escolha a opção mais parecida com o que acontece hoje, de "não fazemos" até "fazemos e revisamos sempre". ' +
      'Pode parar e continuar depois: o que você já respondeu fica guardado neste aparelho.',
  },
  {
    titulo: '2. Veja o resultado',
    texto:
      'Quando terminar, o app mostra um número de 0 a 100. Aqui, quanto MAIOR o número, MAIOR o risco. ' +
      'Os "pontos de atenção" mostram por onde começar a melhorar.',
  },
  {
    titulo: '3. Baixe o relatório',
    texto:
      'Em "Relatórios", você baixa um PDF com todas as perguntas, as respostas e o que fazer para melhorar. ' +
      'Dá para imprimir ou mandar para a equipe da prefeitura.',
  },
  {
    titulo: 'Suas informações e ajuda',
    texto:
      'As respostas da avaliação ficam só neste aparelho e não são enviadas pela internet. ' +
      'Se tiver alguma dúvida, use "Ajuda e suporte" na página inicial ou no menu "Mais".',
  },
];

// hook que decide quando o tutorial aparece
// mostra sozinho só se a pessoa nunca viu nem pulou (lê do armazenamento do aparelho)
export function useTutorial() {
  const [aberto, setAberto] = useState(false);
  const [perguntar, setPerguntar] = useState(false);

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(CHAVE_TUTORIAL)
      .then(valor => { if (ativo && !valor) { setPerguntar(true); setAberto(true); } })
      .catch(() => {}); // se não conseguir ler, só não mostra (não trava a Home)
    return () => { ativo = false; };
  }, []);

  // quando fecha (pulou ou terminou) grava que já viu, pra não aparecer toda hora
  const fechar = useCallback(() => {
    setAberto(false);
    setPerguntar(false);
    AsyncStorage.setItem(CHAVE_TUTORIAL, new Date().toISOString()).catch(() => {});
  }, []);

  // pelo botão "Como usar" abre direto no primeiro passo (sem a pergunta)
  const abrir = useCallback(() => { setPerguntar(false); setAberto(true); }, []);

  return { aberto, perguntar, abrir, fechar };
}

type Props = {
  aberto: boolean;
  // true = primeira vez (mostra "Ver tutorial" / "Pular" antes dos passos)
  perguntar: boolean;
  onFechar: () => void;
};

export default function TutorialInicial({ aberto, perguntar, onFechar }: Props) {
  const { colors } = useFgrcTheme();
  // -1 = tela da pergunta "quer ver o tutorial?" | 0 em diante = os passos
  const [passo, setPasso] = useState(perguntar ? -1 : 0);

  // toda vez que abrir, começa do começo
  useEffect(() => { if (aberto) setPasso(perguntar ? -1 : 0); }, [aberto, perguntar]);

  const ultimo = passo === PASSOS.length - 1;

  return (
    <Modal visible={aberto} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.fundo}>
        <View style={[styles.caixa, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.conteudo}>
            {passo === -1 ? (
              <>
                <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text }]}>Primeira vez por aqui?</Text>
                <Text style={[styles.texto, { color: colors.muted }]}>
                  Preparamos um passo a passo rápido (cerca de 1 minuto) mostrando como usar o aplicativo.
                </Text>
                <Botao rotulo="Ver tutorial" principal cores={colors} onPress={() => setPasso(0)} />
                <Botao rotulo="Pular" cores={colors} onPress={onFechar} />
              </>
            ) : (
              <>
                {/* bolinhas que mostram em qual passo a pessoa ta */}
                <View style={styles.bolinhas} accessibilityLabel={`Passo ${passo + 1} de ${PASSOS.length}`}>
                  {PASSOS.map((_, i) => (
                    <View key={i} style={[styles.bolinha, { backgroundColor: i === passo ? colors.blue : colors.divider }]} />
                  ))}
                </View>
                <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text }]}>{PASSOS[passo].titulo}</Text>
                <Text style={[styles.texto, { color: colors.text }]}>{PASSOS[passo].texto}</Text>

                <Botao
                  rotulo={ultimo ? 'Começar a usar' : 'Próximo'}
                  principal
                  cores={colors}
                  onPress={() => (ultimo ? onFechar() : setPasso(passo + 1))}
                />
                <View style={styles.linha}>
                  {passo > 0 ? <Botao rotulo="Voltar" cores={colors} onPress={() => setPasso(passo - 1)} /> : <View />}
                  {!ultimo ? <Botao rotulo="Pular tutorial" cores={colors} onPress={onFechar} /> : null}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// botão simples (cheio = ação principal, só texto = secundário)
function Botao({ rotulo, principal, cores, onPress }: {
  rotulo: string;
  principal?: boolean;
  cores: ReturnType<typeof useFgrcTheme>['colors'];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        principal && { backgroundColor: cores.blue },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={[styles.botaoTexto, { color: principal ? cores.blueOnButton : cores.blue }]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  caixa: { width: '100%', maxWidth: 460, maxHeight: '90%', borderRadius: 18, borderWidth: 1 },
  conteudo: { padding: 24 },
  bolinhas: { flexDirection: 'row', gap: 6, marginBottom: 18 },
  bolinha: { width: 10, height: 10, borderRadius: 5 },
  titulo: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  texto: { fontSize: 16, lineHeight: 24, marginBottom: 22 },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  botao: { minHeight: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  botaoTexto: { fontSize: 16, fontWeight: '700' },
});
