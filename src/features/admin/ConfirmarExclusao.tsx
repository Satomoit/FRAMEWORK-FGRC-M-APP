// [integração 19/11] janela de confirmação das exclusões definitivas da administração
// usada em "Excluir definitivamente" (aba Contas) e "Excluir solicitação" (aba Solicitações)
// pra evitar acidente: mostra o que vai ser excluído, explica as consequências e só libera o botão
// depois que a pessoa digita EXCLUIR (o servidor confere a palavra de novo)
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton } from '@/components/fgrc-ui';
import { palavraDeExclusaoConfere as palavraConfere } from '@/lib/textos';
import { Linha } from './ui-admin';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';


type Props = {
  aberto: boolean;
  titulo: string;
  // quem ou o que vai ser excluído (nome, e-mail, prefeitura...)
  identificacao: { rotulo: string; valor: string | null | undefined }[];
  // o que acontece depois (cada item vira uma linha com marcador)
  consequencias: string[];
  rotuloConfirmar: string;
  onConfirmar: (motivo: string) => Promise<void>;
  onCancelar: () => void;
};

export default function ConfirmarExclusao({ aberto, titulo, identificacao, consequencias, rotuloConfirmar, onConfirmar, onCancelar }: Props) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const [palavra, setPalavra] = useState('');
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);

  // toda vez que abre, começa limpo (pra não aproveitar o EXCLUIR digitado em outra conta)
  // (feito aqui no desenho e não num useEffect: é o jeito que o React recomenda pra "zerar quando a prop muda",
  // e o lint novo reclamava do useEffect pq ele desenha a tela duas vezes à toa)
  const [abertoAntes, setAbertoAntes] = useState(aberto);
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto);
    if (aberto) { setPalavra(''); setMotivo(''); setOcupado(false); }
  }

  const liberado = palavraConfere(palavra) && !ocupado;

  async function confirmar() {
    if (!liberado) return;
    setOcupado(true);
    try {
      await onConfirmar(motivo.trim());
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => { if (!ocupado) onCancelar(); }}>
      <View style={styles.fundo}>
        <View style={[styles.caixa, { backgroundColor: colors.surface, borderColor: colors.danger }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text style={[styles.titulo, { color: colors.danger }]} accessibilityRole="header">{titulo}</Text>

            {identificacao.map(i => <Linha key={i.rotulo} rotulo={i.rotulo} valor={i.valor} />)}

            <Text style={[styles.subtitulo, { color: colors.text }]}>O que acontece:</Text>
            {consequencias.map(c => (
              <Text key={c} style={[styles.item, { color: colors.text }]}>{'•  '}{c}</Text>
            ))}
            <Text style={[styles.aviso, { color: colors.danger }]}>Não dá para desfazer.</Text>

            <Text style={[styles.rotulo, { color: colors.text }]}>Motivo (opcional, sem dados pessoais)</Text>
            <TextInput
              accessibilityLabel="Motivo da exclusão (opcional)"
              value={motivo}
              onChangeText={setMotivo}
              maxLength={300}
              placeholder="Ex: conta criada durante os testes"
              placeholderTextColor={colors.muted}
              style={[styles.campo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
            />

            <Text style={[styles.rotulo, { color: colors.text }]}>Para confirmar, digite EXCLUIR</Text>
            <TextInput
              accessibilityLabel="Digite EXCLUIR para confirmar"
              value={palavra}
              onChangeText={setPalavra}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="EXCLUIR"
              placeholderTextColor={colors.muted}
              style={[styles.campo, { color: colors.text, borderColor: palavraConfere(palavra) ? colors.danger : colors.border, backgroundColor: colors.input }]}
            />

            {ocupado ? (
              <View style={styles.ocupado} accessibilityLiveRegion="polite">
                <ActivityIndicator />
                <Text style={{ color: colors.text }}>Excluindo... não feche esta janela.</Text>
              </View>
            ) : null}

            <FgrcButton label={ocupado ? 'Aguarde...' : rotuloConfirmar} variant="dangerSolid" icon="trash-outline" disabled={!liberado} onPress={() => { void confirmar(); }} />
            <Pressable accessibilityRole="button" disabled={ocupado} onPress={onCancelar} style={styles.cancelar}>
              <Text style={[styles.cancelarTexto, { color: colors.blue, opacity: ocupado ? 0.45 : 1 }]}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const estilosBase = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 16 },
  caixa: { borderWidth: 2, borderRadius: 14, maxHeight: '92%', width: '100%', maxWidth: 560, alignSelf: 'center' },
  conteudo: { padding: 18, gap: 8 },
  titulo: { fontSize: 19, fontWeight: '700', marginBottom: 6 },
  subtitulo: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  item: { fontSize: 15, lineHeight: 22 },
  aviso: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  rotulo: { fontSize: 15, fontWeight: '600', marginTop: 10 },
  campo: { borderWidth: 1.5, borderRadius: 10, padding: 12, fontSize: 16, minHeight: 48 },
  ocupado: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  cancelar: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  cancelarTexto: { fontSize: 16, fontWeight: '600' },
});
