import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SolicitarAcesso() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [prefeitura, setPrefeitura] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");

  // Validar os campos e abrir a Tela 02
  const enviarSolicitacao = () => {
    const camposValidos =
      nome.trim().length > 0 &&
      email.trim().length > 0 &&
      prefeitura.trim().length > 0 &&
      municipio.trim().length > 0 &&
      estado.trim().length > 0;

    if (!camposValidos) {
      Alert.alert(
        "Campos obrigat├│rios",
        "Preencha todos os campos para continuar.",
      );
      return;
    }

    Keyboard.dismiss();

    // Navega├º├úo da Tela 01 para a Tela 02
    router.push("/explore");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Bot├úo voltar */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>ÔÇ╣</Text>
          </TouchableOpacity>

          {/* Cabe├ºalho */}
          <View style={styles.header}>
            <Text style={styles.title}>Solicitar acesso</Text>

            <Text style={styles.description}>
              Preencha seus dados institucionais para solicitar acesso ├á
              plataforma.
            </Text>
          </View>

          {/* Formul├írio */}
          <View style={styles.form}>
            {/* Nome completo */}
            <View style={styles.field}>
              <Text style={styles.label}>Nome completo</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite seu nome completo..."
                placeholderTextColor="#65758B"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>

            {/* E-mail institucional */}
            <View style={styles.field}>
              <Text style={styles.label}>E-mail institucional</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail institucional..."
                placeholderTextColor="#65758B"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Prefeitura */}
            <View style={styles.field}>
              <Text style={styles.label}>Prefeitura</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite o nome da prefeitura..."
                placeholderTextColor="#65758B"
                value={prefeitura}
                onChangeText={setPrefeitura}
              />
            </View>

            {/* Munic├¡pio */}
            <View style={styles.field}>
              <Text style={styles.label}>Munic├¡pio</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite seu munic├¡pio..."
                placeholderTextColor="#65758B"
                value={municipio}
                onChangeText={setMunicipio}
              />
            </View>

            {/* Estado */}
            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite seu estado..."
                placeholderTextColor="#65758B"
                value={estado}
                onChangeText={setEstado}
              />
            </View>

            {/* Enviar solicita├º├úo */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={enviarSolicitacao}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>Enviar solicita├º├úo</Text>
            </TouchableOpacity>

            {/* Voltar para login */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={styles.loginText}>Voltar para login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 30,
  },

  backButton: {
    width: 32,
    height: 35,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  backArrow: {
    fontSize: 34,
    color: "#152943",
    lineHeight: 36,
    fontWeight: "300",
  },

  header: {
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#172A43",
    marginBottom: 3,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    color: "#536782",
  },

  form: {
    width: "100%",
  },

  field: {
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: "#152943",
    marginBottom: 5,
    fontWeight: "400",
  },

  input: {
    height: 47,
    width: "100%",
    borderWidth: 1,
    borderColor: "#71849C",
    borderRadius: 12,
    paddingHorizontal: 13,
    backgroundColor: "#FFFFFF",
    fontSize: 13,
    color: "#172A43",
  },

  submitButton: {
    height: 47,
    backgroundColor: "#12558F",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  submitText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  loginButton: {
    alignSelf: "center",
    marginTop: 9,
    paddingVertical: 2,
  },

  loginText: {
    color: "#F07819",
    fontSize: 13,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
