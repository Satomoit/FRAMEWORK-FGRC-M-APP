import { useMemo } from 'react';

import { useRouter } from 'expo-router';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useCorDoTema, type CorDoTema } from '@/components/cor-do-tema';

export default function SenhaAlterada() {
  // [tema] cores que seguem o tema escolhido (Configurações ou Opções da página inicial)
  const { cor } = useCorDoTema();
  const styles = useMemo(() => criarEstilos(cor), [cor]);
  const router = useRouter();

  function fazerLogin() {
    // [entrada nova] o Login agora fica em /entrar ("/" virou a página Conheça o FGRC-M)
    router.replace('/entrar');
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

// [tema] os estilos viraram uma função pra as cores seguirem o tema (claro, escuro e alto contraste)
// tamanhos e espaçamentos não mudaram, e no tema claro as cores continuam as originais
function criarEstilos(cor: CorDoTema) {
  return StyleSheet.create({

  // Fundo da tela
  container: {
    flex: 1,
    backgroundColor: cor('#F4F7FC', 'background'),
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
    backgroundColor: cor('#CDE0D9', 'sucessoFundo'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: cor('#12633F', 'success'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  check: {
    fontSize: 16,
    color: cor('#12633F', 'success'),
    fontWeight: '500',
    lineHeight: 19,
  },

  // Título
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: cor('#080B10', 'text'),
    textAlign: 'center',
    marginBottom: 11,
  },

  // Texto explicativo
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: cor('#52647C', 'muted'),
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },

  // Botão
  button: {
    width: '100%',
    height: 47,
    backgroundColor: cor('#10568F', 'blue'),
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: cor('#FFFFFF', 'sobreAzul'),
    fontSize: 14,
    fontWeight: '500',
  },

});
}
