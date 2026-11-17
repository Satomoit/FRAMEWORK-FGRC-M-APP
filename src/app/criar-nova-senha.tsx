import { useRouter } from "expo-router";
import { useState } from "react";

import {
  Alert,
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

export default function HomeScreen() {
  const router = useRouter();

  // Armazenar as senhas digitadas
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Função para salvar a nova senha
  function salvarSenha() {
    if (!senha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha os dois campos de senha.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert(
        "Senha inválida",
        "A senha deve ter pelo menos 6 caracteres.",
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }

    // Navegar para a tela SENHA ALTERADA
    router.push("/senha-alterada");
  }

  // Função temporária para voltar
  function voltarLogin() {
    Alert.alert(
      "Voltar",
      "A navegação para o login será implementada posteriormente.",
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* deixa a barra de status com texto escuro */}
      <StatusBar barStyle="dark-content" />

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
              placeholderTextColor="#718096"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* CAMPO CONFIRMAR SENHA */}
            <Text style={[styles.label, styles.secondLabel]}>
              Confirmar senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a sua nova senha mais uma vez.."
              placeholderTextColor="#718096"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* BOTÃO SALVAR */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={salvarSenha}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Salvar nova senha</Text>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
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
    color: "#172B45",
    lineHeight: 36,
    fontWeight: "300",
  },

  header: {
    marginBottom: 34,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#080B10",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 13,
    color: "#52647C",
    lineHeight: 18,
  },

  form: {
    width: "100%",
  },

  label: {
    fontSize: 13,
    color: "#172B45",
    marginBottom: 5,
  },

  secondLabel: {
    marginTop: 18,
  },

  input: {
    width: "100%",
    height: 47,
    borderWidth: 1,
    borderColor: "#71839B",
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 13,
    color: "#172B45",
    backgroundColor: "#FFFFFF",
  },

  primaryButton: {
    width: "100%",
    height: 46,
    backgroundColor: "#10568F",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 21,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  loginLink: {
    color: "#F47716",
    textAlign: "center",
    fontSize: 13,
    textDecorationLine: "underline",
    marginTop: 10,
  },
});
