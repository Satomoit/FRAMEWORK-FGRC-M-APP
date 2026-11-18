// [integração] rota "/" = primeira tela que abre
// se tiver alguém logado manda pra Home (/inicio); se não, mostra o Login da Nicole (P01)
// (o modo de revisão local, quando ligado no .env.local, abre a lista de telas pra testar)
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import RevisaoLocal from "@/features/integracao/RevisaoLocal";
import LoginScreen from "@/features/p01-login-inicio/LoginScreen";
import { previewMode, supabase } from "@/lib/supabase";

// essa é a primeira página do app (rota /)
export default function IndexScreen() {
  // sem backend abre os atalhos, senão abre o fluxo de login que ja existia
  if (previewMode) return <RevisaoLocal />;
  return <EntradaComLogin />;
}

// mantém a verificação de sessão da P01 separada da revisão
function EntradaComLogin() {
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    // quando o Supabase responde, a gente sabe se tem alguém logado
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setAutenticado(Boolean(sessao));
      setVerificando(false);
    });

    // quando sair dessa tela para de ouvir mudanças da sessão
    return () => subscription.unsubscribe();
  }, []);

  if (verificando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator
          size="large"
          color="#11558B"
          accessibilityLabel="Verificando sessão"
        />
      </View>
    );
  }

  // a Home de verdade só abre com uma sessão válida
  if (autenticado) return <Redirect href="/inicio" />;
  return <LoginScreen />;
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F8FC",
  },
});
