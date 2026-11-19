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

import { useRouter } from "expo-router";
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

export default function EditarPerfil() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();

  const [nome, setNome] = useState("Maria da Silva");
  const [email, setEmail] = useState("maria@prefeitura.gov.br");

  const [prefeitura] = useState("Prefeitura Municipal");
  const [municipio] = useState("");
  const [estado] = useState("Minas Gerais");

  const [erroNome, setErroNome] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  // VALIDAR NOME COMPLETO
  function validarNome(valor: string): string {
    const nomeLimpo = valor.trim().replace(/\s+/g, " ");

    if (!nomeLimpo) {
      return "Informe seu nome completo.";
    }

    const partes = nomeLimpo.split(" ");

    if (partes.length < 2) {
      return "Informe seu nome e sobrenome.";
    }

    const nomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(
      nomeLimpo,
    );

    if (!nomeValido) {
      return "Digite um nome válido, sem números ou símbolos.";
    }

    if (partes.some((parte) => parte.length < 2)) {
      return "Confira o nome informado.";
    }

    return "";
  }

  // VALIDAR E-MAIL
  function validarEmail(valor: string): string {
    const emailLimpo = valor.trim();

    if (!emailLimpo) {
      return "Informe seu e-mail institucional.";
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailLimpo);

    if (!emailValido || emailLimpo.length > 254) {
      return "Digite um endereço de e-mail válido.";
    }

    return "";
  }

  // SALVAR E ABRIR A SEGUNDA TELA
  function salvarAlteracoes() {
    if (enviando) {
      return;
    }

    const nomeInvalido = validarNome(nome);
    const emailInvalido = validarEmail(email);

    setErroNome(nomeInvalido);
    setErroEmail(emailInvalido);

    if (nomeInvalido || emailInvalido) {
      Alert.alert(
        "Dados inválidos",
        "Verifique os campos destacados antes de continuar.",
      );
      return;
    }

    setEnviando(true);

    router.replace("/alteracoes-salvas");
  }

  // CANCELAR
  function cancelar() {
    Alert.alert(
      "Cancelar alterações",
      "Deseja sair sem salvar as alterações?",
      [
        {
          text: "Continuar editando",
          style: "cancel",
        },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
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
          {/* CABEÇALHO */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Editar perfil</Text>

            <Text style={styles.subtitle}>Atualize seus dados cadastrais.</Text>
          </View>

          {/* NOME COMPLETO */}

          <View style={styles.field}>
            <Text style={styles.label}>Nome completo</Text>

            <TextInput
              style={[styles.input, erroNome ? styles.inputError : null]}
              value={nome}
              onChangeText={(valor) => {
                setNome(valor);
                setErroNome("");
              }}
              onBlur={() => setErroNome(validarNome(nome))}
              placeholder="Nome completo"
              placeholderTextColor="#71839D"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={100}
            />

            {erroNome !== "" && (
              <Text style={styles.errorText}>{erroNome}</Text>
            )}
          </View>

          {/* E-MAIL INSTITUCIONAL */}

          <View style={styles.field}>
            <View style={styles.emailHeader}>
              <Text style={styles.label}>E-mail institucional</Text>

              <Text style={styles.approval}>Alteração sujeita à aprovação</Text>
            </View>

            <TextInput
              style={[styles.input, erroEmail ? styles.inputError : null]}
              value={email}
              onChangeText={(valor) => {
                setEmail(valor);
                setErroEmail("");
              }}
              onBlur={() => setErroEmail(validarEmail(email))}
              placeholder="seu@email.com"
              placeholderTextColor="#71839D"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={254}
            />

            {erroEmail !== "" && (
              <Text style={styles.errorText}>{erroEmail}</Text>
            )}
          </View>

          {/* PREFEITURA */}

          <View style={styles.field}>
            <Text style={styles.label}>Prefeitura</Text>

            <TextInput
              style={styles.disabledInput}
              value={prefeitura}
              editable={false}
              placeholder="Prefeitura Municipal"
              placeholderTextColor="#71839D"
            />
          </View>

          {/* MUNICÍPIO */}

          <View style={styles.field}>
            <Text style={styles.label}>Município</Text>

            <TextInput
              style={styles.disabledInput}
              value={municipio}
              editable={false}
              placeholder="Município"
              placeholderTextColor="#71839D"
            />
          </View>

          {/* ESTADO */}

          <View style={styles.field}>
            <Text style={styles.label}>Estado</Text>

            <TextInput
              style={styles.disabledInput}
              value={estado}
              editable={false}
              placeholder="Estado"
              placeholderTextColor="#71839D"
            />
          </View>

          {/* BOTÕES */}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.saveButton, enviando && styles.buttonDisabled]}
              onPress={salvarAlteracoes}
              disabled={enviando}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>Salvar alterações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelar}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ESTILIZAÇÃO

const estilosBase = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 21,
    paddingTop: 12,
    paddingBottom: 35,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    width: 30,
    height: 32,
    justifyContent: "center",
    marginBottom: 7,
  },

  backArrow: {
    fontSize: 35,
    lineHeight: 35,
    color: "#142B49",
    fontWeight: "300",
    marginTop: -5,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#172B46",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 12,
    color: "#63758E",
  },

  field: {
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    color: "#172B46",
    marginBottom: 4,
    fontWeight: "400",
  },

  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  approval: {
    fontSize: 9,
    color: "#263C59",
    marginBottom: 4,
  },

  input: {
    height: 43,
    borderWidth: 1,
    borderColor: "#71839D",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    fontSize: 12,
    color: "#536985",
  },

  disabledInput: {
    height: 43,
    borderRadius: 11,
    backgroundColor: "#E4E9F0",
    paddingHorizontal: 13,
    fontSize: 12,
    color: "#71839D",
  },

  inputError: {
    borderColor: "#D64545",
  },

  errorText: {
    fontSize: 11,
    color: "#D64545",
    marginTop: 5,
    marginLeft: 2,
  },

  buttons: {
    marginTop: 6,
    gap: 11,
  },

  saveButton: {
    height: 43,
    backgroundColor: "#10558E",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  cancelButton: {
    height: 43,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#71839D",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: "#455A76",
    fontSize: 14,
    fontWeight: "500",
  },
});
