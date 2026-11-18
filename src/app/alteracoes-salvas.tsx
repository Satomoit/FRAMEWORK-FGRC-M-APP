import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

export default function AlteracoesSalvas() {
  const router = useRouter();

  function voltarPerfil() {
    router.replace("/editar-perfil");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* ÍCONE DE SUCESSO */}

        <View style={styles.iconCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        {/* TÍTULO */}

        <Text style={styles.title}>Alterações salvas!</Text>

        {/* SUBTÍTULO */}

        <Text style={styles.subtitle}>
          Suas informações foram atualizadas com sucesso.
        </Text>

        {/* BOTÃO */}

        <TouchableOpacity
          style={styles.button}
          onPress={voltarPerfil}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Voltar ao meu perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
    justifyContent: "center",
    paddingHorizontal: 21,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#CDE0D9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  checkIcon: {
    color: "#147344",
    fontSize: 29,
    fontWeight: "400",
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#080808",
    textAlign: "center",
    marginBottom: 9,
  },

  subtitle: {
    fontSize: 12,
    color: "#63758E",
    textAlign: "center",
    marginBottom: 16,
  },

  button: {
    width: "100%",
    height: 47,
    backgroundColor: "#10558E",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
