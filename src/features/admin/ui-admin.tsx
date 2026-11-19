// [integração] pedacinhos de tela que as abas da administração usam (filtro, busca, cartão, etiqueta)
// ficam aqui pra não repetir o mesmo código em cada aba
import type { ReactNode } from 'react';
// [integração 19/11] ícone na etiqueta de situação (✓ aprovado, ✕ recusado, relógio pendente)
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { dataHoraDa } from '@/lib/datas';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

// data e hora no fuso do aparelho (ex: 18/11/2026 às 14:05), igual ao PDF
// vazio (pedido ainda não decidido, por exemplo) vira "—"
export function dataHora(iso: string | null | undefined): string {
  return iso ? dataHoraDa(iso) : '—';
}

// procura o texto em vários campos ao mesmo tempo, sem ligar pra maiúscula ou acento
export function combinaBusca(busca: string, ...campos: (string | null | undefined)[]): boolean {
  const limpar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const alvo = limpar(busca.trim());
  if (!alvo) return true;
  return campos.some(c => c && limpar(c).includes(alvo));
}

// linha de botões pra escolher um filtro (funciona como escolha única)
export function Filtros<T extends string>({ opcoes, valor, onChange }: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  return (
    <View style={styles.filtros} accessibilityRole="radiogroup">
      {opcoes.map(o => {
        const marcado = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            accessibilityRole="radio"
            accessibilityState={{ checked: marcado }}
            onPress={() => onChange(o.valor)}
            style={[styles.filtro, {
              borderColor: marcado ? colors.blue : colors.border,
              backgroundColor: marcado ? colors.selected : colors.surface,
            }]}
          >
            <Text style={[styles.filtroTexto, { color: colors.text }]}>{o.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CampoBusca({ valor, onChange, dica }: { valor: string; onChange: (v: string) => void; dica: string }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  return (
    <TextInput
      accessibilityLabel="Pesquisar"
      value={valor}
      onChangeText={onChange}
      placeholder={dica}
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      style={[styles.busca, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
    />
  );
}

export function Cartao({ children, onPress, rotulo }: { children: ReactNode; onPress?: () => void; rotulo?: string }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const estilo = [styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }];
  if (!onPress) return <View style={estilo}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={rotulo} onPress={onPress} style={({ pressed }) => [estilo, pressed && { opacity: 0.8 }]}>
      {children}
    </Pressable>
  );
}

// etiqueta de situação: sempre com texto (não depende só da cor, como pede o RNF-011)
export function Etiqueta({ texto, tom }: { texto: string; tom: 'neutro' | 'bom' | 'ruim' | 'alerta' }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const cor = tom === 'bom' ? colors.success : tom === 'ruim' ? colors.error : tom === 'alerta' ? colors.orange : colors.muted;
  // [integração 19/11] fundo clarinho da mesma cor (o "1F" no fim é a transparência) + ícone, pra bater o olho e entender
  const icone = tom === 'bom' ? 'checkmark-circle' : tom === 'ruim' ? 'close-circle' : tom === 'alerta' ? 'time' : 'ellipse-outline';
  return (
    <View style={[styles.etiqueta, { borderColor: cor, backgroundColor: cor + '1F' }]}>
      <Ionicons name={icone} size={15} color={cor} accessibilityElementsHidden importantForAccessibility="no" />
      <Text style={[styles.etiquetaTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

export function Linha({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  return (
    <View style={styles.linha}>
      <Text style={[styles.linhaRotulo, { color: colors.muted }]}>{rotulo}</Text>
      <Text selectable style={[styles.linhaValor, { color: colors.text }]}>{valor || '—'}</Text>
    </View>
  );
}

export function TextoVazio({ children }: { children: string }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  return <Text style={[styles.vazio, { color: colors.muted }]}>{children}</Text>;
}

const estilosBase = StyleSheet.create({
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  filtro: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' },
  filtroTexto: { fontSize: 14 },
  busca: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 12, minHeight: 44 },
  cartao: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, gap: 4 },
  etiqueta: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  etiquetaTexto: { fontSize: 13, fontWeight: '700' },
  linha: { marginBottom: 8 },
  linhaRotulo: { fontSize: 13 },
  linhaValor: { fontSize: 15 },
  vazio: { fontSize: 15, marginVertical: 12 },
});
