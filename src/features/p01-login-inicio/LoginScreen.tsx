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

import { usePreferencias } from '@/features/p11-configuracoes/PreferenciasProvider';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const {
    preferencias,
    carregando: carregandoPreferencias,
  } = usePreferencias();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const senhaRef = useRef<ComponentRef<typeof TextInput>>(null);
  const enviandoRef = useRef(false);

  const escuro = preferencias.tema === 'escuro';
  const contraste = preferencias.altoContraste;

  const escala =
    preferencias.tamanhoFonte === 'pequena'
      ? 0.9
      : preferencias.tamanhoFonte === 'grande'
        ? 1.2
        : 1;

  const cores = {
    fundo: contraste
      ? escuro ? '#000000' : '#FFFFFF'
      : escuro ? '#101827' : '#F5F8FC',
    campo: escuro ? '#182438' : '#FFFFFF',
    texto: escuro ? '#FFFFFF' : contraste ? '#000000' : '#17263E',
    secundario: escuro
      ? contraste ? '#FFFFFF' : '#C5D1E2'
      : contraste ? '#000000' : '#465B76',
    borda: contraste
      ? escuro ? '#FFFFFF' : '#000000'
      : escuro ? '#8293AC' : '#52647C',
    botao: escuro ? '#9DD3FF' : '#11558B',
    textoBotao: escuro ? '#000000' : '#FFFFFF',
    aviso: escuro ? '#182438' : '#E6EDF5',
  };

  const styles = criarEstilos(cores, escala);

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

  if (carregandoPreferencias) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={cores.botao}
          accessibilityLabel="Carregando preferências"
        />
      </View>
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
                placeholderTextColor={cores.secundario}
                selectionColor={cores.botao}
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
                placeholderTextColor={cores.secundario}
                selectionColor={cores.botao}
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
              onPress={() =>
                setMensagem(
                  'A recuperação de senha ainda não está disponível nesta versão.'
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
              {carregando && (
                <ActivityIndicator color={cores.textoBotao} />
              )}

              <Text style={styles.loginButtonText}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Ainda não tem acesso?
              </Text>

              <Pressable
                accessibilityRole="button"
                style={styles.registerButton}
                disabled={carregando}
                onPress={() =>
                  setMensagem(
                    'A solicitação de acesso ainda não está disponível nesta versão.'
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

type Cores = {
  fundo: string;
  campo: string;
  texto: string;
  secundario: string;
  borda: string;
  botao: string;
  textoBotao: string;
  aviso: string;
};

function criarEstilos(cores: Cores, escala: number) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      backgroundColor: cores.fundo,
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.fundo,
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
      color: cores.texto,
      fontSize: 30 * escala,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      color: cores.secundario,
      fontSize: 14 * escala,
      textAlign: 'center',
      marginTop: 4,
      lineHeight: 21 * escala,
    },
    welcome: {
      marginBottom: 36,
    },
    title: {
      color: cores.texto,
      fontSize: 27 * escala,
      fontWeight: '600',
      marginBottom: 4,
    },
    description: {
      color: cores.secundario,
      fontSize: 14 * escala,
      lineHeight: 21 * escala,
    },
    field: {
      marginBottom: 22,
    },
    label: {
      color: cores.texto,
      fontSize: 15 * escala,
      marginBottom: 7,
    },
    input: {
      minHeight: 56,
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 13,
      backgroundColor: cores.campo,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: cores.texto,
      fontSize: 14 * escala,
    },
    forgotButton: {
      alignSelf: 'flex-end',
      minHeight: 44,
      justifyContent: 'center',
      marginTop: -20,
      marginBottom: 14,
    },
    link: {
      color: cores.secundario,
      fontSize: 14 * escala,
      lineHeight: 21 * escala,
      fontWeight: '600',
    },
    message: {
      color: cores.texto,
      backgroundColor: cores.aviso,
      borderWidth: 1,
      borderColor: cores.borda,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      fontSize: 14 * escala,
      lineHeight: 21 * escala,
    },
    loginButton: {
      backgroundColor: cores.botao,
      minHeight: 56,
      borderRadius: 13,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    pressed: {
      opacity: 0.8,
    },
    loginButtonText: {
      color: cores.textoBotao,
      fontSize: 17 * escala,
      fontWeight: '600',
      textAlign: 'center',
      flexShrink: 1,
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
      color: cores.texto,
      fontSize: 14 * escala,
      lineHeight: 21 * escala,
    },
    registerButton: {
      minHeight: 44,
      justifyContent: 'center',
    },
  });
}