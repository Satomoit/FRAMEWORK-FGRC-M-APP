import { useRouter, type Href } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
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

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  // [integração] usado pelos links Esqueci minha senha e Solicitar acesso
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const senhaRef = useRef<ComponentRef<typeof TextInput>>(null);
  const enviandoRef = useRef(false);

  async function entrar() {
    if (enviandoRef.current) return;

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

    Keyboard.dismiss();
    enviandoRef.current = true;
    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        if (error.code === 'invalid_credentials') {
          setMensagem('E-mail ou senha incorretos.');
        } else if (error.code === 'email_not_confirmed') {
          setMensagem('Confirme seu e-mail antes de entrar.');
        } else if (error.code === 'user_banned') {
          // [integração] conta desativada pela administração (aba Contas da área administrativa)
          setMensagem('Esta conta está desativada. Fale com o suporte.');
        } else if (error.status === 429) {
          setMensagem('Muitas tentativas. Aguarde e tente novamente.');
        } else {
          setMensagem(
            'Não foi possível entrar. Verifique sua conexão e tente novamente.'
          );
        }
        return;
      }

      if (!data.session) {
        setMensagem('Não foi possível iniciar a sessão. Tente novamente.');
        return;
      }

      setSenha('');
      // A rota index.tsx detecta a sessão e abre a página inicial.
    } catch {
      setMensagem(
        'Não foi possível conectar. Verifique sua internet e tente novamente.'
      );
    } finally {
      enviandoRef.current = false;
      setCarregando(false);
    }
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
              <Image
                source={require('../../../assets/images/logo-fgrcm.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible
                accessibilityLabel="Escudo FGRC-M"
              />

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
                editable={!carregando}
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
                editable={!carregando}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                returnKeyType="go"
                onSubmitEditing={() => void entrar()}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              style={styles.forgotButton}
              disabled={carregando}
              // [integração P07] abre a tela de recuperação de senha (envio real pelo Supabase)
              onPress={() => router.push('/recuperar-senha')}
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
              accessibilityState={{
                disabled: carregando,
                busy: carregando,
              }}
              disabled={carregando}
              onPress={() => void entrar()}
              style={({ pressed }) => [
                styles.loginButton,
                (pressed || carregando) && styles.pressed,
              ]}
            >
              {carregando ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Entrando...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Ainda não tem acesso?
              </Text>

              <Pressable
                accessibilityRole="button"
                style={styles.registerButton}
                disabled={carregando}
                // [integração P02] abre o formulário de pedido de acesso da Liz
                onPress={() => router.push('/solicitar-acesso')}
              >
                <Text style={styles.link}>Solicitar acesso</Text>
              </Pressable>
            </View>

            {/* [integração] depois que a administração aprova, a pessoa ativa o acesso com o código do e-mail */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Seu pedido foi aprovado?</Text>
              <Pressable
                accessibilityRole="button"
                style={styles.registerButton}
                disabled={carregando}
                onPress={() => router.push('/ativar-acesso' as Href)}
              >
                <Text style={styles.link}>Ativar acesso</Text>
              </Pressable>
            </View>

            {/* [integração] "Status da solicitação" do Mapeamento: consulta se o pedido já foi analisado */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Já fez o pedido?</Text>
              <Pressable
                accessibilityRole="button"
                style={styles.registerButton}
                disabled={carregando}
                onPress={() => router.push('/situacao-pedido' as Href)}
              >
                <Text style={styles.link}>Ver situação</Text>
              </Pressable>
            </View>

            {/* [integração] quem não consegue entrar também precisa de um jeito de pedir ajuda */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Precisa de ajuda?</Text>
              <Pressable
                accessibilityRole="button"
                style={styles.registerButton}
                disabled={carregando}
                onPress={() => router.push('/suporte' as Href)}
              >
                <Text style={styles.link}>Falar com o suporte</Text>
              </Pressable>
            </View>

            {/* [integração] links pequenos no pé da tela: privacidade (dá pra ler antes de pedir acesso)
                e a entrada da área administrativa, que não fica em nenhum menu do app
                (no celular não tem barra de endereço pra digitar /admin, por isso o link existe)
                se o grupo preferir esconder, é só apagar o Pressable da Área da administração */}
            <View style={styles.registerRow}>
              <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push('/privacidade' as Href)}>
                <Text style={styles.registerText}>Privacidade e termos</Text>
              </Pressable>
              <Text style={styles.registerText}>  ·  </Text>
              <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push('/admin' as Href)}>
                <Text style={styles.registerText}>Área da administração</Text>
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
    width: 74,
    height: 74,
    marginBottom: 6,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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