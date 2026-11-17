
import { useRouter } from 'expo-router';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function RevisarAvaliacao() {
  const router = useRouter();

  // Quantidade de quest├Áes pendentes.
  // Futuramente, esse valor ser├í conectado ├ás respostas do question├írio.
  const questoesPendentes = 0;

  // O bot├úo s├│ ser├í habilitado quando n├úo houver quest├Áes pendentes.
  const podeFinalizar = questoesPendentes === 0;

  function finalizarAvaliacao() {
    if (!podeFinalizar) {
      return;
    }

    router.push('/avaliacao-finalizada' as any);
  }

  function voltarAsQuestoes() {
    // Navega├º├úo ser├í conectada quando as telas de quest├Áes forem criadas.
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* BOT├âO VOLTAR */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>ÔÇ╣</Text>
        </TouchableOpacity>

        {/* CABE├çALHO */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Revisar avalia├º├úo
          </Text>

          <Text style={styles.subtitle}>
            Confira o andamento antes de finalizar.
          </Text>
        </View>

        {/* INDICADORES */}
        <View style={styles.statsContainer}>

          <View style={styles.statCard}>
            <Text style={styles.checkIcon}>Ô£ô</Text>

            <Text style={styles.statNumber}>0</Text>

            <Text style={styles.statLabel}>
              Respondidas
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.warningIcon}>ÔÜá</Text>

            <Text style={styles.statNumber}>
              {questoesPendentes}
            </Text>

            <Text style={styles.statLabel}>
              Pendentes
            </Text>
          </View>

        </View>

        {/* QUEST├òES PENDENTES */}
        <View style={styles.questionsCard}>

          <Text style={styles.questionsTitle}>
            Quest├Áes pendentes
          </Text>

          <Text style={styles.questionsSubtitle}>
            Ainda faltam respostas para estas quest├Áes:
          </Text>

        </View>

        {/* AVISO */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>Ôôÿ</Text>

          <Text style={styles.infoText}>
            Responda ├ás quest├Áes pendentes para finalizar.
          </Text>
        </View>

        {/* BOT├âO FINALIZAR */}
        <TouchableOpacity
          style={[
            styles.finishButton,
            podeFinalizar
              ? styles.finishButtonEnabled
              : styles.finishButtonDisabled,
          ]}
          onPress={finalizarAvaliacao}
          disabled={!podeFinalizar}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.finishButtonText,
              podeFinalizar
                ? styles.finishButtonTextEnabled
                : styles.finishButtonTextDisabled,
            ]}
          >
            Finalizar avalia├º├úo
          </Text>
        </TouchableOpacity>

        {/* BOT├âO VOLTAR ├ÇS QUEST├òES */}
        <TouchableOpacity
          style={styles.backQuestionsButton}
          onPress={voltarAsQuestoes}
          activeOpacity={0.8}
        >
          <Text style={styles.backQuestionsText}>
            Voltar ├ás quest├Áes
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // FUNDO PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // BOT├âO VOLTAR
  backButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    marginBottom: 12,
  },

  backArrow: {
    fontSize: 34,
    color: '#172B45',
    lineHeight: 36,
    fontWeight: '300',
  },

  // CABE├çALHO
  header: {
    marginBottom: 21,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#172B45',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: '#52647C',
    lineHeight: 18,
  },

  // INDICADORES
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    height: 82,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#71839B',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },

  checkIcon: {
    fontSize: 17,
    color: '#087443',
    fontWeight: 'bold',
    height: 19,
  },

  warningIcon: {
    fontSize: 17,
    color: '#D97706',
    height: 19,
  },

  statNumber: {
    fontSize: 21,
    fontWeight: '600',
    color: '#52647C',
    lineHeight: 25,
  },

  statLabel: {
    fontSize: 11,
    color: '#52647C',
  },

  // CARD DE QUEST├òES
  questionsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#71839B',
    borderRadius: 14,
    padding: 13,
    minHeight: 100,
    marginBottom: 11,
  },

  questionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172B45',
    marginBottom: 5,
  },

  questionsSubtitle: {
    fontSize: 12,
    color: '#52647C',
    lineHeight: 17,
  },

  // AVISO
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 5,
  },

  infoIcon: {
    fontSize: 16,
    color: '#F47716',
  },

  infoText: {
    fontSize: 12,
    color: '#52647C',
  },

  // BOT├âO FINALIZAR
  finishButton: {
    width: '100%',
    height: 47,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  // BOT├âO HABILITADO
  finishButtonEnabled: {
    backgroundColor: '#10568F',
    borderWidth: 1,
    borderColor: '#10568F',
  },

  // BOT├âO DESABILITADO
  finishButtonDisabled: {
    backgroundColor: '#F4F7FC',
    borderWidth: 1,
    borderColor: '#52647C',
  },

  finishButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  finishButtonTextEnabled: {
    color: '#FFFFFF',
  },

  finishButtonTextDisabled: {
    color: '#52647C',
  },

  // BOT├âO VOLTAR ├ÇS QUEST├òES
  backQuestionsButton: {
    width: '100%',
    height: 47,
    borderWidth: 1,
    borderColor: '#52647C',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  backQuestionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#52647C',
  },

});
