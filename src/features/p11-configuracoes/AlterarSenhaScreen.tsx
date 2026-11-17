import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { usePreferencias } from './PreferenciasProvider';

function useAparencia() {
  const { preferencias } = usePreferencias();
  const escuro = preferencias.tema === 'escuro';
  const contraste = preferencias.altoContraste;

  const escala =
    preferencias.tamanhoFonte === 'pequena'
      ? 0.9
      : preferencias.tamanhoFonte === 'grande'
        ? 1.2
        : 1;

  return {
    escala,
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
    sucesso: escuro ? '#86EFAC' : '#15803D',
  };
}

type CampoSenhaProps = {
  titulo: string;
  placeholder: string;
  valor: string;
  alterar: (valor: string) => void;
  bloqueado: boolean;
  nova?: boolean;
};

function CampoSenha({
  titulo,
  placeholder,
  valor,
  alterar,
  bloqueado,
  nova = false,
}: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);
  const aparencia = useAparencia();

  return (
    <View style={styles.field}>
      <Text
        style={[
          styles.label,
          {
            color: aparencia.texto,
            fontSize: 15 * aparencia.escala,
          },
        ]}
      >
        {titulo}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: aparencia.campo,
            borderColor: aparencia.borda,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={titulo}
          style={[
            styles.input,
            {
              color: aparencia.texto,
              fontSize: 14 * aparencia.escala,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={aparencia.secundario}
          value={valor}
          onChangeText={alterar}
          secureTextEntry={!visivel}
          editable={!bloqueado}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={nova ? 'new-password' : 'current-password'}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            visivel ? `Ocultar ${titulo}` : `Mostrar ${titulo}`
          }
          disabled={bloqueado}
          onPress={() => setVisivel((atual) => !atual)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={visivel ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={aparencia.secundario}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function AlterarSenhaScreen() {
  const aparencia = useAparencia();
  const { carregando } = usePreferencias();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  const enviandoRef = useRef(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setAutenticado(Boolean(session));
      setVerificando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function voltar() {
    if (salvando) return;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inicio');
    }
  }

  async function salvar() {
    if (enviandoRef.current) return;

    setMensagem('');

    if (!senhaAtual || !novaSenha || !confirmacao) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    if (novaSenha !== confirmacao) {
      setMensagem('A confirmação não corresponde à nova senha.');
      return;
    }

    if (senhaAtual === novaSenha) {
      setMensagem('A nova senha deve ser diferente da senha atual.');
      return;
    }

    const senhaForte =
      novaSenha.length >= 8 &&
      /[a-zA-Z]/.test(novaSenha) &&
      /[0-9]/.test(novaSenha) &&
      /[^a-zA-Z0-9\s]/.test(novaSenha);

    if (!senhaForte) {
      setMensagem(
        'Use pelo menos 8 caracteres, incluindo letras, números e um caractere especial.'
      );
      return;
    }

    Keyboard.dismiss();
    enviandoRef.current = true;
    setSalvando(true);

    try {
      const { data: usuario, error: erroUsuario } =
        await supabase.auth.getUser();

      if (erroUsuario || !usuario.user?.email) {
        setMensagem(
          'Não foi possível verificar sua conta. Confira a conexão ou entre novamente.'
        );
        return;
      }

      const { data: acesso, error: erroAcesso } =
        await supabase.auth.signInWithPassword({
          email: usuario.user.email,
          password: senhaAtual,
        });

      if (erroAcesso) {
        setMensagem(
          erroAcesso.code === 'invalid_credentials'
            ? 'A senha atual está incorreta.'
            : 'Não foi possível confirmar a senha atual. Tente novamente.'
        );
        return;
      }

      if (acesso.user?.id !== usuario.user.id) {
        setMensagem('Não foi possível confirmar sua conta.');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        if (error.code === 'same_password') {
          setMensagem('Escolha uma senha diferente da anterior.');
        } else if (error.code === 'weak_password') {
          setMensagem(
            'Essa senha foi recusada. Escolha uma senha mais forte.'
          );
        } else if (
          error.code === 'reauthentication_needed' ||
          error.code === 'reauthentication_not_valid'
        ) {
          setMensagem(
            'O Supabase exige uma confirmação adicional de identidade. A senha não foi alterada.'
          );
        } else if (error.status === 429) {
          setMensagem('Muitas tentativas. Aguarde e tente novamente.');
        } else {
          setMensagem(
            'Não foi possível alterar a senha. Verifique a conexão e tente novamente.'
          );
        }
        return;
      }

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacao('');
      setConcluido(true);
    } catch {
      setMensagem(
        'Não foi possível conectar. Verifique sua internet e tente novamente.'
      );
    } finally {
      enviandoRef.current = false;
      setSalvando(false);
    }
  }

  if (verificando || carregando) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: aparencia.fundo },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={aparencia.botao}
          accessibilityLabel="Verificando sessão"
        />
      </View>
    );
  }

  if (!autenticado) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: aparencia.fundo },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {concluido ? (
              <View style={styles.successContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={68}
                  color={aparencia.sucesso}
                />

                <Text
                  style={[
                    styles.successTitle,
                    {
                      color: aparencia.texto,
                      fontSize: 27 * aparencia.escala,
                    },
                  ]}
                >
                  Senha alterada!
                </Text>

                <Text
                  style={[
                    styles.successDescription,
                    {
                      color: aparencia.secundario,
                      fontSize: 15 * aparencia.escala,
                      lineHeight: 24 * aparencia.escala,
                    },
                  ]}
                  accessibilityLiveRegion="polite"
                >
                  Sua senha foi atualizada com sucesso.
                  No próximo login, use a nova senha.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.primaryButton,
                    { backgroundColor: aparencia.botao },
                  ]}
                  onPress={voltar}
                >
                  <Text
                    style={[
                      styles.primaryText,
                      {
                        color: aparencia.textoBotao,
                        fontSize: 17 * aparencia.escala,
                      },
                    ]}
                  >
                    Voltar
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.title,
                    {
                      color: aparencia.texto,
                      fontSize: 27 * aparencia.escala,
                    },
                  ]}
                >
                  Alterar senha
                </Text>

                <Text
                  style={[
                    styles.description,
                    {
                      color: aparencia.secundario,
                      fontSize: 15 * aparencia.escala,
                      lineHeight: 23 * aparencia.escala,
                    },
                  ]}
                >
                  Atualize sua senha para manter sua conta segura.
                </Text>

                <CampoSenha
                  titulo="Senha atual"
                  placeholder="Digite sua senha atual"
                  valor={senhaAtual}
                  alterar={(valor) => {
                    setSenhaAtual(valor);
                    setMensagem('');
                  }}
                  bloqueado={salvando}
                />

                <CampoSenha
                  titulo="Nova senha"
                  placeholder="Digite sua nova senha"
                  valor={novaSenha}
                  alterar={(valor) => {
                    setNovaSenha(valor);
                    setMensagem('');
                  }}
                  bloqueado={salvando}
                  nova
                />

                <CampoSenha
                  titulo="Confirmar nova senha"
                  placeholder="Digite a nova senha novamente"
                  valor={confirmacao}
                  alterar={(valor) => {
                    setConfirmacao(valor);
                    setMensagem('');
                  }}
                  bloqueado={salvando}
                  nova
                />

                <Text
                  style={[
                    styles.hint,
                    {
                      color: aparencia.secundario,
                      fontSize: 13 * aparencia.escala,
                      lineHeight: 20 * aparencia.escala,
                    },
                  ]}
                >
                  Use pelo menos 8 caracteres, com letras, números
                  e caracteres especiais.
                </Text>

                {mensagem !== '' && (
                  <Text
                    style={[
                      styles.error,
                      {
                        fontSize: 14 * aparencia.escala,
                        lineHeight: 21 * aparencia.escala,
                      },
                    ]}
                    accessibilityLiveRegion="polite"
                  >
                    {mensagem}
                  </Text>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: salvando,
                    busy: salvando,
                  }}
                  disabled={salvando}
                  onPress={() => void salvar()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { backgroundColor: aparencia.botao },
                    (pressed || salvando) && styles.pressed,
                  ]}
                >
                  {salvando && (
                    <ActivityIndicator
                      color={aparencia.textoBotao}
                    />
                  )}

                  <Text
                    style={[
                      styles.primaryText,
                      {
                        color: aparencia.textoBotao,
                        fontSize: 17 * aparencia.escala,
                      },
                    ]}
                  >
                    {salvando ? 'Salvando...' : 'Salvar nova senha'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={salvando}
                  onPress={voltar}
                  style={styles.cancelButton}
                >
                  <Text
                    style={[
                      styles.cancelText,
                      {
                        color: aparencia.secundario,
                        fontSize: 15 * aparencia.escala,
                      },
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>
              </>
            )}
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
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 32,
  },
  content: {
    width: '100%',
    maxWidth: 420,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    marginBottom: 36,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    minHeight: 56,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyeButton: {
    width: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginBottom: 24,
  },
  error: {
    color: '#7F1D1D',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 18,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 13,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
  },
  primaryText: {
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelText: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 64,
  },
  successTitle: {
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  successDescription: {
    textAlign: 'center',
    marginBottom: 32,
  },
});