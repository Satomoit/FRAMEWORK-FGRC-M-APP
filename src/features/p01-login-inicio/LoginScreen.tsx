import { useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef, useMemo } from 'react';
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

import { useCorDoTema, type CorDoTema } from '@/components/cor-do-tema';
import { contaLiberada } from '@/lib/conta';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  // [tema] cores que seguem o tema escolhido (Configurações ou Opções da página inicial)
  const { cor } = useCorDoTema();
  const styles = useMemo(() => criarEstilos(cor), [cor]);
  // [integração] usado pelos links Esqueci minha senha e Solicitar acesso
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const senhaRef = useRef<ComponentRef<typeof TextInput>>(null);
  const enviandoRef = useRef(false);

  // [entrada nova] volta pra página inicial (se veio de lá, só volta; se abriu o /entrar direto, troca pela "/")
  function voltarInicio() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

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

      // [segurança] conta que não passou pela aprovação da equipe não entra
      // (sai na hora e explica o que fazer, em vez de deixar a pessoa presa no login sem motivo)
      if (!contaLiberada(data.session.user)) {
        await supabase.auth.signOut();
        setSenha('');
        setMensagem('Esta conta ainda não foi liberada pela equipe do FGRC-M. Solicite acesso ou acompanhe o seu pedido.');
        return;
      }

      setSenha('');
      // A rota index.tsx detecta a sessão e abre a página inicial.
      // [entrada nova] agora quem detecta é a rota /entrar (SoSemLogin), que leva pra /inicio
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
            {/* [entrada nova] o Login agora abre a partir da página inicial (Conheça o FGRC-M)
                esse botão volta pra ela; o voltar do Android faz a mesma coisa */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar para a página inicial"
              hitSlop={12}
              disabled={carregando}
              onPress={voltarInicio}
              style={({ pressed }) => [styles.voltar, pressed && styles.pressed]}
            >
              <Text style={styles.voltarIcone}>←</Text>
              <Text style={styles.voltarTexto}>Página inicial</Text>
            </Pressable>

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
                placeholderTextColor={cor('#52647C', 'muted')}
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
                placeholderTextColor={cor('#52647C', 'muted')}
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
                  <ActivityIndicator color={cor('#FFFFFF', 'sobreAzul')} />
                  <Text style={styles.loginButtonText}>Entrando...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </Pressable>

            {/* [entrada nova] pedir acesso, acompanhar, ativar, suporte, privacidade e administração
                saíram daqui: agora ficam na página inicial (Conheça o FGRC-M), pra o Login ficar só com o essencial */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// [tema] os estilos viraram uma função pra as cores seguirem o tema (claro, escuro e alto contraste)
// tamanhos e espaçamentos não mudaram, e no tema claro as cores continuam as originais
function criarEstilos(cor: CorDoTema) {
  return StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: cor('#F5F8FC', 'background'),
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
    color: cor('#17263E', 'text'),
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: cor('#465B76', 'muted'),
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 21,
  },
  welcome: {
    marginBottom: 36,
  },
  title: {
    color: cor('#17263E', 'text'),
    fontSize: 27,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: cor('#465B76', 'muted'),
    fontSize: 14,
    lineHeight: 21,
  },
  field: {
    marginBottom: 22,
  },
  label: {
    color: cor('#17263E', 'text'),
    fontSize: 15,
    marginBottom: 7,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: cor('#52647C', 'border'),
    borderRadius: 13,
    backgroundColor: cor('#FFFFFF', 'input'),
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: cor('#17263E', 'text'),
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
    color: cor('#465B76', 'muted'),
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    color: cor('#17263E', 'text'),
    backgroundColor: cor('#E6EDF5', 'infoBackground'),
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: cor('#11558B', 'blue'),
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
    color: cor('#FFFFFF', 'sobreAzul'),
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
    color: cor('#17263E', 'text'),
    fontSize: 14,
  },
  registerButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  // [entrada nova] botão "Página inicial" do topo (mesmo jeito do Voltar das outras telas)
  voltar: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingRight: 16,
    marginBottom: 12,
  },
  voltarIcone: {
    fontSize: 22,
    color: cor('#17263E', 'text'),
  },
  voltarTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: cor('#465B76', 'muted'),
  },
});
}