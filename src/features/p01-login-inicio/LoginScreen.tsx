import { useRef, useState, type ComponentRef } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const senhaRef = useRef<ComponentRef<typeof TextInput>>(null);

  function entrar() {
    setMensagem('');

    if (!email.trim() || !senha.trim()) {
      setMensagem('Preencha o e-mail e a senha.');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email.trim())) {
      setMensagem('Digite um e-mail válido.');
      return;
    }

    setMensagem(
      'Campos validados. A autenticação ainda será integrada.'
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logo} accessibilityLabel="FGRC-M">
                <Text style={styles.logoSymbol}>✓</Text>
              </View>

              <View style={styles.orangeLine} />

              <Text style={styles.brand}>FGRC-M</Text>

              <Text style={styles.subtitle}>
                Gestão de riscos cibernéticos municipais
              </Text>
            </View>

            <View style={styles.welcome}>
              <Text style={styles.title}>Bem-vindo(a)!</Text>

              <Text style={styles.description}>
                Entre para continuar sua avaliação.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail institucional</Text>

              <TextInput
                accessibilityLabel="E-mail institucional"
                style={styles.input}
                placeholder="Digite seu e-mail..."
                placeholderTextColor="#52647C"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setMensagem('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => senhaRef.current?.focus()}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>

              <TextInput
                ref={senhaRef}
                accessibilityLabel="Senha"
                style={styles.input}
                placeholder="Digite sua senha..."
                placeholderTextColor="#52647C"
                value={senha}
                onChangeText={(value) => {
                  setSenha(value);
                  setMensagem('');
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                returnKeyType="go"
                onSubmitEditing={entrar}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              style={styles.forgotButton}
              onPress={() =>
                setMensagem(
                  'A recuperação de senha será integrada à tela P07.'
                )
              }
            >
              <Text style={styles.link}>Esqueci minha senha</Text>
            </Pressable>

            {mensagem !== '' && (
              <Text
                style={styles.message}
                accessibilityLiveRegion="polite"
              >
                {mensagem}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={entrar}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.loginButtonText}>Entrar</Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Ainda não tem acesso?
              </Text>

              <Pressable
                accessibilityRole="button"
                style={styles.registerButton}
                onPress={() =>
                  setMensagem(
                    'A solicitação de acesso será integrada à tela P02.'
                  )
                }
              >
                <Text style={styles.link}>Solicitar acesso</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 36,
  },
  content: {
    width: '100%',
    maxWidth: 420,
  },
  header: {
    alignItems: 'center',
    marginBottom: 54,
  },
  logo: {
    width: 44,
    height: 48,
    backgroundColor: '#11558B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  orangeLine: {
    width: 40,
    height: 4,
    backgroundColor: '#FF8C28',
    borderRadius: 2,
    marginTop: 5,
    marginBottom: 8,
  },
  brand: {
    color: '#17263E',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#465B76',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 21,
  },
  welcome: {
    marginBottom: 36,
  },
  title: {
    color: '#17263E',
    fontSize: 27,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#465B76',
    fontSize: 14,
    lineHeight: 21,
  },
  field: {
    marginBottom: 22,
  },
  label: {
    color: '#17263E',
    fontSize: 15,
    marginBottom: 7,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#52647C',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#17263E',
    fontSize: 14,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: -20,
    marginBottom: 14,
  },
  link: {
    color: '#465B76',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    color: '#17263E',
    backgroundColor: '#E6EDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#11558B',
    minHeight: 56,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
    marginTop: 12,
  },
  registerText: {
    color: '#17263E',
    fontSize: 14,
  },
  registerButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
});