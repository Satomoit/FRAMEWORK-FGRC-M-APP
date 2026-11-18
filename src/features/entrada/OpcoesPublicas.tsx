// [entrada nova] janela de "Opções" da página inicial pública (antes de entrar na conta)
// no celular sobe da parte de baixo (painel), no computador aparece no meio da tela
// fecha no botão "Fechar", tocando fora dela ou no botão de voltar do Android (onRequestClose)
// aqui só entram coisas públicas: preferências do aparelho, suporte, privacidade e o caminho da administração
// (nada da conta da pessoa, pq ninguém entrou ainda)
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFgrcTheme } from '@/components/fgrc-colors';
import BarraTamanhoTexto from '@/features/p11-configuracoes/BarraTamanhoTexto';
import { usePreferencias } from '@/features/p11-configuracoes/PreferenciasProvider';

type Props = { visivel: boolean; onFechar: () => void };
type NomeDoIcone = ComponentProps<typeof Ionicons>['name'];

// as mesmas 3 opções de tema da tela de Configurações da Nicole (P11)
const TEMAS = [
  { valor: 'claro', titulo: 'Claro', icone: 'sunny-outline' },
  { valor: 'escuro', titulo: 'Escuro', icone: 'moon-outline' },
  { valor: 'sistema', titulo: 'Automático', icone: 'contrast-outline' },
] as const;

export function OpcoesPublicas({ visivel, onFechar }: Props) {
  const router = useRouter();
  const { colors, isDark } = useFgrcTheme();
  // as preferências ficam no aparelho (não dependem de conta), então dá pra mudar antes do login
  const { preferencias, salvando, atualizar, escalaFonte: f } = usePreferencias();
  const { width, height } = useWindowDimensions();
  const margens = useSafeAreaInsets();
  // tela larga (computador ou tablet deitado) = janela no meio; senão = painel que sobe de baixo
  const largo = width >= 700;

  // fecha a janela e depois abre a tela (senão a janela ficava por cima da tela nova)
  function abrir(rota: string) {
    onFechar();
    router.push(rota as Href);
  }

  // a barrinha de tamanho do texto é a mesma das Configurações, só passando as cores do tema
  const coresDaBarra = {
    texto: colors.text,
    secundario: colors.muted,
    borda: colors.border,
    selecionado: colors.blue,
    cartao: colors.surface,
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType={largo ? 'fade' : 'slide'}
      onRequestClose={onFechar}
      statusBarTranslucent
    >
      <View style={[styles.raiz, largo ? styles.raizCentro : styles.raizBaixo]}>
        {/* fundo escurecido: tocar nele fecha a janela */}
        <Pressable
          style={[StyleSheet.absoluteFill, styles.fundo]}
          accessibilityRole="button"
          accessibilityLabel="Fechar opções"
          onPress={onFechar}
        />

        <View
          accessibilityViewIsModal
          style={[
            styles.painel,
            largo ? styles.painelCentro : styles.painelBaixo,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              // nunca passa da tela: no máximo 85% da altura, e o resto rola por dentro
              maxHeight: height * 0.85,
              paddingBottom: largo ? 16 : margens.bottom + 16,
            },
          ]}
        >
          {!largo ? <View style={[styles.alca, { backgroundColor: colors.border }]} /> : null}
          <View style={[styles.topo, { borderColor: colors.divider }]}>
            <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text, fontSize: 20 * f }]}>Opções</Text>
            <Pressable accessibilityRole="button" hitSlop={12} onPress={onFechar} style={styles.fechar}>
              <Text style={[styles.fecharTexto, { color: colors.blue, fontSize: 15 * f }]}>Fechar</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" style={[styles.secao, { color: colors.muted, fontSize: 13 * f }]}>CONFIGURAÇÕES</Text>

            <Text style={[styles.rotulo, { color: colors.text, fontSize: 16 * f }]}>Tema</Text>
            <View style={styles.temas}>
              {TEMAS.map((tema) => {
                const marcado = preferencias.tema === tema.valor;
                // no escuro com alto contraste o azul fica clarinho, então o texto marcado vira preto (senão some)
                const cor = marcado ? (isDark && preferencias.altoContraste ? '#000000' : colors.blueOnButton) : colors.text;
                return (
                  <Pressable
                    key={tema.valor}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: marcado, disabled: salvando }}
                    disabled={salvando}
                    onPress={() => void atualizar({ tema: tema.valor })}
                    style={({ pressed }) => [
                      styles.tema,
                      { borderColor: marcado ? colors.blue : colors.border, backgroundColor: marcado ? colors.blue : colors.surface },
                      pressed && styles.apertado,
                    ]}
                  >
                    <Ionicons name={tema.icone} size={18} color={cor} />
                    <Text style={[styles.temaTexto, { color: cor, fontSize: 14 * f }]}>{tema.titulo}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.rotulo, { color: colors.text, fontSize: 16 * f }]}>Tamanho do texto</Text>
            <BarraTamanhoTexto
              valor={preferencias.escalaTexto}
              desabilitado={salvando}
              cores={coresDaBarra}
              onSalvar={(novo) => void atualizar({ escalaTexto: novo })}
            />

            <View style={styles.linhaContraste}>
              <View style={styles.itemTextos}>
                <Text style={[styles.rotulo, styles.semMargem, { color: colors.text, fontSize: 16 * f }]}>Alto contraste</Text>
                <Text style={[styles.itemDetalhe, { color: colors.muted, fontSize: 13 * f }]}>Deixa textos e bordas em preto e branco</Text>
              </View>
              <Switch
                accessibilityLabel="Alto contraste"
                value={preferencias.altoContraste}
                disabled={salvando}
                onValueChange={(valor) => void atualizar({ altoContraste: valor })}
                trackColor={{ false: '#8A94A3', true: isDark ? '#9DD3FF' : '#11558B' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={[styles.nota, { color: colors.muted, fontSize: 12 * f }]}>
              Essas escolhas ficam salvas neste aparelho e valem também depois de entrar.
            </Text>

            <Text accessibilityRole="header" style={[styles.secao, { color: colors.muted, fontSize: 13 * f }]}>AJUDA E INFORMAÇÕES</Text>
            <ItemDoMenu icone="help-circle-outline" titulo="Ajuda e suporte" detalhe="Mande uma mensagem para a equipe do FGRC-M" onPress={() => abrir('/suporte')} />
            <ItemDoMenu icone="document-text-outline" titulo="Privacidade e termos" detalhe="Quais dados o app guarda e como são usados" onPress={() => abrir('/privacidade')} />

            <Text accessibilityRole="header" style={[styles.secao, { color: colors.muted, fontSize: 13 * f }]}>EQUIPE RESPONSÁVEL</Text>
            {/* a área tem login próprio; quem confere se é administração de verdade é o servidor, não esse botão */}
            <ItemDoMenu icone="shield-checkmark-outline" titulo="Área da administração" detalhe="Somente para a equipe que analisa os pedidos" onPress={() => abrir('/admin')} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// uma linha da lista (ícone, título, explicação curta e a setinha)
// fica fora do OpcoesPublicas pra não ser recriada a cada mudança da janela
function ItemDoMenu({ icone, titulo, detalhe, onPress }: { icone: NomeDoIcone; titulo: string; detalhe: string; onPress: () => void }) {
  const { colors, isDark } = useFgrcTheme();
  const { escalaFonte: f } = usePreferencias();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={detalhe}
      onPress={onPress}
      style={({ pressed }) => [styles.item, { borderColor: colors.divider }, pressed && { backgroundColor: colors.selected }]}
    >
      <View style={[styles.itemIcone, { backgroundColor: colors.iconBackground }]}>
        {/* no escuro o azul em cima do fundinho azul ficava apagado, então o ícone fica claro */}
        <Ionicons name={icone} size={20} color={isDark ? colors.text : colors.blue} />
      </View>
      <View style={styles.itemTextos}>
        <Text style={[styles.itemTitulo, { color: colors.text, fontSize: 16 * f }]}>{titulo}</Text>
        <Text style={[styles.itemDetalhe, { color: colors.muted, fontSize: 13 * f }]}>{detalhe}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  raizBaixo: { justifyContent: 'flex-end' },
  raizCentro: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  fundo: { backgroundColor: 'rgba(0,0,0,0.45)' },
  painel: { width: '100%', borderWidth: 1, overflow: 'hidden' },
  painelBaixo: { borderTopLeftRadius: 22, borderTopRightRadius: 22, borderBottomWidth: 0 },
  painelCentro: { maxWidth: 520, borderRadius: 20 },
  alca: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginTop: 10 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  titulo: { fontWeight: '700' },
  fechar: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  fecharTexto: { fontWeight: '700' },
  conteudo: { paddingHorizontal: 20, paddingBottom: 8 },
  secao: { fontWeight: '700', letterSpacing: 0.6, marginTop: 20, marginBottom: 8 },
  rotulo: { fontWeight: '600', marginTop: 8, marginBottom: 8 },
  semMargem: { marginTop: 0, marginBottom: 2 },
  temas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tema: { flexGrow: 1, flexBasis: 96, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 10 },
  temaTexto: { fontWeight: '600' },
  apertado: { opacity: 0.8 },
  linhaContraste: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  nota: { marginTop: 10, lineHeight: 18 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 10, paddingHorizontal: 4, borderTopWidth: 1 },
  itemIcone: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  itemTextos: { flex: 1 },
  itemTitulo: { fontWeight: '600' },
  itemDetalhe: { marginTop: 2, lineHeight: 18 },
});
