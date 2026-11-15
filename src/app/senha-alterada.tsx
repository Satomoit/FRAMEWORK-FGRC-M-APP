
import { useRouter } from 'expo-router';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function SenhaAlterada() {
  const router = useRouter();

  function fazerLogin() {
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* ÍCONE DE CONFIRMAÇÃO */}
        <View style={styles.iconContainer}>
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✓</Text>
          </View>
        </View>

        {/* TÍTULO */}
        <Text style={styles.title}>
          Senha alterada!
        </Text>

        {/* MENSAGEM */}
        <Text style={styles.subtitle}>
          Agora você já pode entrar na plataforma usando sua
          {'\n'}nova senha.
        </Text>

        {/* BOTÃO FAZER LOGIN */}
        <TouchableOpacity
          style={styles.button}
          onPress={fazerLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            Fazer login
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // Fundo da tela
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  // Agrupamento dos elementos
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 55,
  },

  // Ícone
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#CDE0D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: '#12633F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  check: {
    fontSize: 16,
    color: '#12633F',
    fontWeight: '500',
    lineHeight: 19,
  },

  // Título
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: '#080B10',
    textAlign: 'center',
    marginBottom: 11,
  },

  // Texto explicativo
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#52647C',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },

  // Botão
  button: {
    width: '100%',
    height: 47,
    backgroundColor: '#10568F',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

});
