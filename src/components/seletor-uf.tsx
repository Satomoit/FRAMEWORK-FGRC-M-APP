// [correção Android] campo "Estado" que abre uma lista com as 27 UFs
// antes era um campo de texto no fim do formulário: no Android o teclado subia por cima dele
// e a pessoa não via o que tava digitando. Agora:
//   * tocar no campo fecha o teclado e abre a lista numa janela por cima de tudo (sempre visível)
//   * a lista rola e cada opção tem altura boa pra tocar com o dedo
//   * grava só a sigla (ex: MG), assim todo pedido fica no mesmo formato
import { useState, useMemo } from 'react';
import { FlatList, Keyboard, Modal, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCorDoTema, type CorDoTema } from '@/components/cor-do-tema';

export const ESTADOS_BR: { sigla: string; nome: string }[] = [
  { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' },
];

type Props = {
  valor: string;
  onChange: (sigla: string) => void;
  // o visual do campo vem da tela que usa (assim fica igual aos outros campos dela)
  estiloCampo?: StyleProp<ViewStyle>;
  estiloTexto?: StyleProp<TextStyle>;
  corPlaceholder?: string;
  desabilitado?: boolean;
};

export function SeletorDeEstado({ valor, onChange, estiloCampo, estiloTexto, corPlaceholder = '#65758B', desabilitado }: Props) {
  // [tema] cores que seguem o tema escolhido (Configurações ou Opções da página inicial)
  const { cor } = useCorDoTema();
  const styles = useMemo(() => criarEstilos(cor), [cor]);
  const [aberto, setAberto] = useState(false);
  const margens = useSafeAreaInsets();
  const escolhido = ESTADOS_BR.find((e) => e.sigla === valor);

  function abrir() {
    // fecha o teclado antes, senão no Android ele fica por cima da lista
    Keyboard.dismiss();
    setAberto(true);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={escolhido ? `Estado: ${escolhido.nome}. Toque para trocar` : 'Estado: nenhum escolhido. Toque para escolher'}
        disabled={desabilitado}
        onPress={abrir}
        style={[estiloCampo, styles.campo]}
      >
        <Text style={[estiloTexto, !escolhido && { color: corPlaceholder }]} numberOfLines={1}>
          {escolhido ? `${escolhido.sigla} — ${escolhido.nome}` : 'Toque para escolher o estado...'}
        </Text>
        <Text style={[estiloTexto, styles.seta]}>▾</Text>
      </Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        {/* tocar fora da lista fecha sem mudar nada */}
        <Pressable style={styles.fundo} accessibilityLabel="Fechar a lista de estados" onPress={() => setAberto(false)} />
        <View style={[styles.folha, { paddingBottom: margens.bottom + 8 }]}>
          <View style={styles.topo}>
            <Text accessibilityRole="header" style={styles.titulo}>Escolha o estado</Text>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setAberto(false)}>
              <Text style={styles.fechar}>Fechar</Text>
            </Pressable>
          </View>
          <FlatList
            data={ESTADOS_BR}
            keyExtractor={(e) => e.sigla}
            initialNumToRender={27}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const marcado = item.sigla === valor;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: marcado }}
                  onPress={() => { onChange(item.sigla); setAberto(false); }}
                  style={({ pressed }) => [styles.opcao, marcado && styles.opcaoMarcada, pressed && styles.opcaoTocada]}
                >
                  <Text style={styles.sigla}>{item.sigla}</Text>
                  <Text style={styles.nome}>{item.nome}</Text>
                  {marcado ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

// cores fixas iguais às da tela de pedido de acesso (que ainda não muda com o tema)
// [tema] os estilos viraram uma função pra as cores seguirem o tema (claro, escuro e alto contraste)
// tamanhos e espaçamentos não mudaram, e no tema claro as cores continuam as originais
function criarEstilos(cor: CorDoTema) {
  return StyleSheet.create({
  campo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seta: { marginLeft: 8 },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  folha: {
    maxHeight: '75%',
    backgroundColor: cor('#FFFFFF', 'surface'),
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  titulo: { fontSize: 18, fontWeight: '700', color: cor('#172A43', 'text') },
  fechar: { fontSize: 15, fontWeight: '600', color: cor('#12558F', 'blue') },
  opcao: { flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: cor('#E4EAF1', 'divider') },
  opcaoMarcada: { backgroundColor: cor('#DCEAF6', 'selected') },
  opcaoTocada: { backgroundColor: cor('#EEF3F8', 'divider') },
  sigla: { width: 44, fontSize: 15, fontWeight: '700', color: cor('#12558F', 'blue') },
  nome: { flex: 1, fontSize: 15, color: cor('#172A43', 'text') },
  check: { fontSize: 16, fontWeight: '700', color: cor('#12558F', 'blue') },
});
}
