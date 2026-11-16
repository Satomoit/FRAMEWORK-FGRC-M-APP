
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function SolicitacaoEnviada() {
  const router = useRouter();

  const voltarLogin = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F4F7FC" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* Ícone de confirmação */}
          <View style={styles.iconCircle}>
            <Text style={styles.envelopeIcon}>✉</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>
            Solicitação enviada
          </Text>

          {/* Descrição */}
          <Text style={styles.description}>
            Você receberá uma atualização no e-mail
            informado quando sua solicitação for avaliada.
          </Text>

          {/* Cartão de status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.clockIcon}>◷</Text>

              <Text style={styles.statusTitle}>
                Status: Em análise
              </Text>
            </View>

            <Text style={styles.statusDescription}>
              O acesso será liberado após a aprovação do
              administrador.
            </Text>
          </View>

          {/* Botão voltar para login */}
          <TouchableOpacity
            style={styles.button}
            onPress={voltarLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              Voltar para login
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F8E3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  envelopeIcon: {
    fontSize: 29,
    color: '#F07819',
    fontWeight: '400',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#080808',
    textAlign: 'center',
    marginBottom: 19,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#536782',
    textAlign: 'center',
    marginBottom: 19,
    paddingHorizontal: 5,
  },

  statusCard: {
    width: '100%',
    minHeight: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#71849C',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 19,
    justifyContent: 'center',
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  clockIcon: {
    fontSize: 25,
    color: '#F07819',
    marginRight: 11,
  },

  statusTitle: {
    fontSize: 13,
    color: '#152943',
    fontWeight: '400',
  },

  statusDescription: {
    fontSize: 11,
    lineHeight: 15,
    color: '#536782',
  },

  button: {
    width: '100%',
    height: 47,
    backgroundColor: '#12558F',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
