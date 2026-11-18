// [integração] arquivo "raiz" do app: tudo que aparece na tela passa por aqui primeiro
// o que ele faz, resumindo:
//   1. liga as preferências (tema claro/escuro, tamanho do texto) pro app inteiro
//   2. pergunta pro Supabase se tem alguém logado (enquanto não sabe, mostra o carregando)
//   3. monta a pilha de telas (Stack). As telas dentro do Stack.Protected só abrem com login;
//      sem login o Expo Router manda de volta pro "/" (tela de Login)
//   4. coloca a barra de baixo (AppNavigation) nas telas de quem ta logado
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppNavigation from "@/components/app-navigation";
import {
  PreferenciasProvider,
  usePreferencias,
} from "@/features/p11-configuracoes/PreferenciasProvider";
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

// [integração P11] o Provider da Nicole guarda tema, fonte e contraste no aparelho
// ele fica em volta de tudo pra qualquer tela conseguir ler as preferências
export default function RootLayout() {
  return (
    <PreferenciasProvider>
      <RaizDoApp />
    </PreferenciasProvider>
  );
}

function RaizDoApp() {
  // [integração P11] o tema agora vem de Configurações (claro ou escuro), igual a Nicole fez na branch dela
  // antes vinha do sistema e o navegador podia forçar o escuro sozinho
  // começa no claro tanto no servidor quanto no navegador, então não volta o erro de hidratação
  // (o temaAtivo já resolve o Automático pelo tema do navegador)
  const { preferencias, temaAtivo } = usePreferencias();
  const escuro = temaAtivo === "escuro";
  // mesmas cores de fundo que a Nicole usou no _layout da P11
  const fundo = preferencias.altoContraste
    ? escuro
      ? "#000000"
      : "#FFFFFF"
    : escuro
      ? "#101827"
      : "#F5F8FC";
  const temaBase = escuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...temaBase,
    colors: { ...temaBase.colors, background: fundo },
  };

  // [integração B1] null = ainda ta conferindo a sessão, true/false = já sabe se tem login
  const [logado, setLogado] = useState<boolean | null>(null);

  useEffect(() => {
    // [integração B1] o onAuthStateChange avisa a sessão salva assim que o app abre
    // e avisa de novo quando vc entra ou sai (é o mesmo jeito que o index.tsx da P01 usa)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setLogado(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider value={tema}>
      <AnimatedSplashOverlay />

      {logado === null ? (
        // [integração B1] enquanto não sabe da sessão mostra só o carregando
        // pq não monta o Stack já: montando sem saber da sessão, o guard valeria false
        // e quem desse F5 em /avaliacoes ia parar no login mesmo estando logada
        // esperando a sessão, o Stack nasce já na URL certa (link direto e F5 continuam na mesma tela)
        // e nada tenta navegar enquanto isso (então não tem erro de navegar antes do layout montar)
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: fundo,
          }}
        >
          <ActivityIndicator
            size="large"
            color="#11558B"
            accessibilityLabel="Verificando sessão"
          />
        </View>
      ) : (
        // [integração B1] a barra fica por fora do Stack pra não sumir quando troca de tela
        <AppNavigation logado={logado}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: fundo,
              },
            }}
          >
            {/* [integração B1] essas rotas só abrem com login (guard)
                sem sessão, ou digitando a URL sem login, o Expo Router manda pro "/"
                públicas (fora daqui): index (login), solicitar-acesso, explore,
                criar-nova-senha e senha-alterada
                rota nova em src/app precisa entrar aqui ou na lista de públicas do app-navigation
                (se esquecer, a rede de segurança de lá bloqueia sem login do mesmo jeito) */}
            <Stack.Protected guard={logado} redirectTo="/">
              <Stack.Screen name="inicio" />
              <Stack.Screen name="avaliacoes" />
              <Stack.Screen name="revisar-avaliacao" />
              <Stack.Screen name="avaliacao-finalizada" />
              <Stack.Screen name="resultados-revisao" />
              <Stack.Screen name="relatorios-revisao" />
              <Stack.Screen name="mais" />
              <Stack.Screen name="minhas-telas" />
              <Stack.Screen name="editar-perfil" />
              <Stack.Screen name="alteracoes-salvas" />
              {/* [integração P11] telas 22 (configurações) e 20 (alterar senha) da Nicole */}
              <Stack.Screen name="configuracoes" />
              <Stack.Screen name="alterar-senha" />
            </Stack.Protected>
          </Stack>
        </AppNavigation>
      )}
    </ThemeProvider>
  );
}
