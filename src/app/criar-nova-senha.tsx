import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, useMemo } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// [integração P08] troca de senha de verdade pelo Supabase e regra única de senha do app
import { useCorDoTema, type CorDoTema } from "@/components/cor-do-tema";
import { REGRA_SENHA_TEXTO, oQueFaltaNaSenha } from "@/lib/politica-senha";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  // [tema] cores que seguem o tema escolhido (Configurações ou Opções da página inicial)
  const { cor, escuro } = useCorDoTema();
  const styles = useMemo(() => criarEstilos(cor), [cor]);
  const router = useRouter();

  // Armazenar as senhas digitadas
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // [integração P08] o link do e-mail chega com ?code=... (ou com o erro, se o link venceu)
  const { code, error_description } = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  // conferindo = ainda validando o link | pronto = pode trocar a senha | sem-link = abriu sem link válido
  const [link, setLink] = useState<"conferindo" | "pronto" | "sem-link">("conferindo");
  // mensagem que aparece na tela (o Alert não aparece no navegador)
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  // evita trocar o código duas vezes (em desenvolvimento o React roda o efeito duas vezes)
  const jaTrocouCodigo = useRef(false);

  useEffect(() => {
    // [integração P08] o código do e-mail vira uma sessão temporária só pra trocar a senha
    async function conferirLink() {
      if (error_description) {
        setLink("sem-link");
        setMensagem("Este link não vale mais. Peça um novo em Esqueci minha senha.");
        return;
      }
      if (code && !jaTrocouCodigo.current) {
        jaTrocouCodigo.current = true;
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setLink("pronto");
          return;
        }
      }
      // se não tem código (ou ele já foi usado), confere se já existe a sessão do link
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setLink("pronto");
      } else {
        setLink("sem-link");
        setMensagem("Abra esta tela pelo link que chegou no seu e-mail. Se o link venceu, peça um novo em Esqueci minha senha.");
      }
    }
    conferirLink().catch(() => {
      setLink("sem-link");
      setMensagem("Não foi possível conferir o link. Verifique a internet e tente de novo.");
    });
  }, [code, error_description]);

  // Função para salvar a nova senha
  // [integração P08] agora salva no Supabase de verdade e só mostra sucesso se der certo
  async function salvarSenha() {
    if (salvando) return;
    setMensagem("");

    if (!senha || !confirmarSenha) {
      setMensagem("Preencha os dois campos de senha.");
      return;
    }

    // mesma regra da tela Alterar senha (10 caracteres, maiúscula, minúscula, número e símbolo)
    const falta = oQueFaltaNaSenha(senha);
    if (falta.length > 0) {
      setMensagem(`Falta na senha: ${falta.join(", ")}.`);
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    if (link !== "pronto") {
      setMensagem("Abra esta tela pelo link que chegou no seu e-mail.");
      return;
    }

    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        if (error.code === "same_password") {
          setMensagem("A nova senha precisa ser diferente da antiga.");
        } else if (error.code === "weak_password") {
          setMensagem(REGRA_SENHA_TEXTO);
        } else {
          setMensagem("Não foi possível salvar a senha. Tente de novo.");
        }
        return;
      }
      // sai da sessão do link pra pessoa entrar de novo com a senha nova
      await supabase.auth.signOut();
      setSenha("");
      setConfirmarSenha("");
      // Navegar para a tela SENHA ALTERADA
      router.replace("/senha-alterada");
    } catch {
      setMensagem("Sem conexão. Verifique a internet e tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  // [integração P08] agora volta pro login de verdade
  // [entrada nova] que agora fica em /entrar ("/" virou a página Conheça o FGRC-M)
  function voltarLogin() {
    router.replace("/entrar");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* deixa a barra de status com texto escuro */}
      <StatusBar barStyle={escuro ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* BOTÃO VOLTAR */}
          <TouchableOpacity style={styles.backButton} onPress={voltarLogin}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          {/* CABEÇALHO */}
          <View style={styles.header}>
            <Text style={styles.title}>Criar nova senha</Text>

            <Text style={styles.subtitle}>
              Crie uma senha segura para voltar a acessar a plataforma.
            </Text>
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.form}>
            {/* CAMPO NOVA SENHA */}
            <Text style={styles.label}>Nova senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite uma nova senha.."
              placeholderTextColor={cor("#718096", "muted")}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {/* [integração P08] regra da senha explicada embaixo do campo */}
            <Text style={styles.dica}>{REGRA_SENHA_TEXTO}</Text>

            {/* CAMPO CONFIRMAR SENHA */}
            <Text style={[styles.label, styles.secondLabel]}>
              Confirmar senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a sua nova senha mais uma vez.."
              placeholderTextColor={cor("#718096", "muted")}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* [integração P08] avisos e erros aparecem aqui */}
            {link === "conferindo" ? (
              <Text style={styles.dica}>Conferindo o link do e-mail...</Text>
            ) : null}
            {mensagem ? (
              <Text style={styles.mensagem} accessibilityLiveRegion="polite">
                {mensagem}
              </Text>
            ) : null}

            {/* BOTÃO SALVAR */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => void salvarSenha()}
              activeOpacity={0.8}
              disabled={salvando}
            >
              <Text style={styles.primaryButtonText}>
                {salvando ? "Salvando..." : "Salvar nova senha"}
              </Text>
            </TouchableOpacity>

            {/* LINK VOLTAR PARA LOGIN */}
            <TouchableOpacity onPress={voltarLogin}>
              <Text style={styles.loginLink}>Voltar para login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ESTILIZAÇÃO DA TELA
// [tema] os estilos viraram uma função pra as cores seguirem o tema (claro, escuro e alto contraste)
// tamanhos e espaçamentos não mudaram, e no tema claro as cores continuam as originais
function criarEstilos(cor: CorDoTema) {
  return StyleSheet.create({
  // [integração P08] texto da regra e mensagens de erro
  dica: {
    fontSize: 13,
    lineHeight: 19,
    color: cor("#4A5568", "muted"),
    marginTop: 6,
  },
  mensagem: {
    fontSize: 14,
    lineHeight: 20,
    color: cor("#B42318", "error"),
    marginTop: 14,
  },
  container: {
    flex: 1,
    backgroundColor: cor("#F4F7FC", "background"),
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  backButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    marginBottom: 23,
  },

  backArrow: {
    fontSize: 34,
    color: cor("#172B45", "text"),
    lineHeight: 36,
    fontWeight: "300",
  },

  header: {
    marginBottom: 34,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: cor("#080B10", "text"),
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 13,
    color: cor("#52647C", "muted"),
    lineHeight: 18,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 13,
    color: cor("#172B45", "text"),
    marginBottom: 5,
  },

  secondLabel: {
    marginTop: 18,
  },

  input: {
    width: "100%",
    height: 47,
    borderWidth: 1,
    borderColor: cor("#71839B", "border"),
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 13,
    color: cor("#172B45", "text"),
    backgroundColor: cor("#FFFFFF", "input"),
  },

  primaryButton: {
    width: "100%",
    height: 46,
    backgroundColor: cor("#10568F", "blue"),
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 21,
  },

  primaryButtonText: {
    color: cor("#FFFFFF", "sobreAzul"),
    fontSize: 14,
    fontWeight: "500",
  },

  loginLink: {
    color: cor("#F47716", "orange"),
    textAlign: "center",
    fontSize: 13,
    textDecorationLine: "underline",
    marginTop: 10,
  },
});
}
