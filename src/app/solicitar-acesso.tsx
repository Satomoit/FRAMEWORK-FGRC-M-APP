import { useState } from "react";
import {
  ActivityIndicator,
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

// [integração P02] cliente do Supabase (só a chave pública, nenhuma chave secreta no app)
import { supabase } from "@/lib/supabase";
// [integração P02] só aceita e-mail de prefeitura (e @gmail.com enquanto a gente testa)
import { problemaNoEmailInstitucional } from "@/lib/email-institucional";

export default function SolicitarAcesso() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [prefeitura, setPrefeitura] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");

  // [integração P02] mensagem na própria tela (o Alert não aparece no navegador)
  const [mensagem, setMensagem] = useState("");
  // trava o botão enquanto o pedido ta sendo enviado (pra não mandar duas vezes)
  const [enviando, setEnviando] = useState(false);

  // [integração P02] voltar funciona mesmo se a pessoa abriu essa página direto pelo endereço
  const voltar = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  // Validar os campos e abrir a Tela 02
  // [integração P02] agora grava o pedido no Supabase e só abre a confirmação se gravar
  const enviarSolicitacao = async () => {
    if (enviando) return;
    setMensagem("");

    const camposValidos =
      nome.trim().length > 0 &&
      email.trim().length > 0 &&
      prefeitura.trim().length > 0 &&
      municipio.trim().length > 0 &&
      estado.trim().length > 0;

    if (!camposValidos) {
      setMensagem("Preencha todos os campos para continuar.");
      return;
    }

    // confere o formato do e-mail e se ele é de prefeitura (ver src/lib/email-institucional.ts)
    const emailLimpo = email.trim().toLowerCase();
    const problemaEmail = problemaNoEmailInstitucional(emailLimpo);
    if (problemaEmail) {
      setMensagem(problemaEmail);
      return;
    }

    Keyboard.dismiss();
    setEnviando(true);

    try {
      // grava o pedido como pendente (quem aprova é a administração, pelo painel do Supabase)
      // a tabela só deixa INSERIR: ninguém consegue ler pedidos de outras pessoas pelo app
      const { error } = await supabase.from("access_requests").insert({
        nome: nome.trim().replace(/\s+/g, " "),
        email: emailLimpo,
        prefeitura: prefeitura.trim(),
        municipio: municipio.trim(),
        estado: estado.trim(),
      });

      if (error) {
        // 23505 = já existe um pedido pendente com esse e-mail
        if (error.code === "23505") {
          setMensagem("Já existe um pedido em análise para este e-mail. Aguarde a resposta da administração.");
        } else if (error.code === "42P01" || error.code === "PGRST205") {
          // tabela ainda não criada no Supabase (precisa rodar o script SQL uma vez)
          setMensagem("O cadastro de pedidos ainda não foi configurado. Fale com a administração do FGRC-M.");
        } else {
          setMensagem("Não foi possível enviar o pedido. Confira os dados e tente de novo.");
        }
        return;
      }

      // Navegação da Tela 01 para a Tela 02 (só depois de gravar de verdade)
      router.replace("/explore");
    } catch {
      setMensagem("Sem conexão. Verifique a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
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
          {/* Botão voltar */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={voltar}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.title}>Solicitar acesso</Text>

            <Text style={styles.description}>
              Preencha seus dados institucionais para solicitar acesso à
              plataforma.
            </Text>
          </View>

          {/* Formulário */}
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

            {/* Município */}
            <View style={styles.field}>
              <Text style={styles.label}>Município</Text>

              <TextInput
                style={styles.input}
                placeholder="Digite seu município..."
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

            {/* [integração P02] avisos e erros aparecem aqui */}
            {mensagem ? (
              <Text style={styles.mensagem} accessibilityLiveRegion="polite">
                {mensagem}
              </Text>
            ) : null}

            {/* Enviar solicitação */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => void enviarSolicitacao()}
              activeOpacity={0.85}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color="#FFFFFF" accessibilityLabel="Enviando pedido" />
              ) : (
                <Text style={styles.submitText}>Enviar solicitação</Text>
              )}
            </TouchableOpacity>

            {/* Voltar para login */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.7}
              onPress={voltar}
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
  // [integração P02] texto de aviso/erro em cima do botão
  mensagem: {
    fontSize: 14,
    lineHeight: 20,
    color: "#B42318",
    marginBottom: 12,
  },
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
