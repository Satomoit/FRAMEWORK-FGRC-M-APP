
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

export default function AvaliacaoFinalizada() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* ÍCONE DE CONFIRMAÇÃO */}
        <View style={styles.successCircle}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        {/* TÍTULO */}
        <Text style={styles.title}>
          Avaliação finalizada!
        </Text>

        {/* CARD DO RELATÓRIO */}
        <View style={styles.reportCard}>

          <View style={styles.reportHeader}>
            <Text style={styles.reportIcon}>▤</Text>

            <Text style={styles.reportTitle}>
              Seu relatório
            </Text>
          </View>

          <Text style={styles.reportDescription}>
            O relatório com os resultados, pontos de
            atenção e recomendações estará disponível
            na aba Resultados.
          </Text>

          <View style={styles.processingContainer}>
            <Text style={styles.processingIcon}>◴</Text>

            <Text style={styles.processingText}>
              Aguarde o processamento dos resultados.
            </Text>
          </View>

        </View>

        {/* BOTÃO VER RESULTADOS */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Text style={styles.primaryButtonText}>
            Ver resultados
          </Text>
        </TouchableOpacity>

        {/* BOTÃO VOLTAR PARA HOME */}
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Text style={styles.secondaryButtonText}>
            Voltar para Home
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const estilosBase = StyleSheet.create({

  // FUNDO PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 106,
  },

  // ÍCONE DE CONFIRMAÇÃO
  successCircle: {
    width: 53,
    height: 53,
    borderRadius: 27,
    backgroundColor: '#CFE3DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 38,
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.7,
    borderColor: '#087443',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkIcon: {
    fontSize: 19,
    color: '#087443',
    fontWeight: '500',
    lineHeight: 22,
  },

  // TÍTULO
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#172B45',
    textAlign: 'center',
    marginBottom: 67,
  },

  // CARD DO RELATÓRIO
  reportCard: {
    width: '100%',
    minHeight: 142,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#71839B',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 46,
  },

  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  reportIcon: {
    fontSize: 23,
    color: '#10568F',
    fontWeight: 'bold',
    marginRight: 9,
  },

  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#52647C',
  },

  reportDescription: {
    fontSize: 12,
    color: '#52647C',
    lineHeight: 17,
    marginBottom: 10,
  },

  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  processingIcon: {
    fontSize: 17,
    color: '#F47716',
    marginRight: 5,
  },

  processingText: {
    fontSize: 10,
    color: '#52647C',
  },

  // BOTÃO VER RESULTADOS
  primaryButton: {
    width: '100%',
    height: 46,
    backgroundColor: '#10568F',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // BOTÃO VOLTAR PARA HOME
  secondaryButton: {
    width: '100%',
    height: 47,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#52647C',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10568F',
  },

});
