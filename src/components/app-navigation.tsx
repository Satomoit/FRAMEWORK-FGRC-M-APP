// essa barra fica no aplicativo inteiro (pra vc não depender do painel de links)
import { usePathname, useRouter, type Href } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFgrcTheme } from "@/components/fgrc-colors";

// confere se vc ta usando o modo local pra conseguir navegar sem login
// essa opção só funciona enquanto o projeto ta rodando em desenvolvimento
const previewMode = __DEV__ && process.env.EXPO_PUBLIC_PREVIEW_MODE === "true";

type Props = { children: ReactNode };

// essas são as cinco áreas principais do app (as outras continuam como telas internas)
const secoes = [
  { nome: "Início", rotaPreview: "/", rotaReal: "/inicio", simbolo: "⌂" },
  {
    nome: "Avaliações",
    rotaPreview: "/avaliacoes",
    rotaReal: "/avaliacoes",
    simbolo: "▤",
  },
  {
    nome: "Resultados",
    rotaPreview: "/resultados-revisao",
    rotaReal: "/resultados-revisao",
    simbolo: "▥",
  },
  {
    nome: "Relatórios",
    rotaPreview: "/relatorios-revisao",
    rotaReal: "/relatorios-revisao",
    simbolo: "▧",
  },
  {
    nome: "Mais",
    rotaPreview: "/minhas-telas",
    rotaReal: "/minhas-telas",
    simbolo: "☰",
  },
] as const;

export default function AppNavigation({ children }: Props) {
  const router = useRouter();
  const caminho = usePathname();
  const { colors } = useFgrcTheme();

  // por enquanto o menu novo funciona na revisão local
  // com Supabase real preservamos a navegação atual da P01 ate integrar o backend
  const mostrarMenu = previewMode;
  const rotaHome = previewMode ? "/" : "/inicio";
  const estaNaHome = caminho === rotaHome;

  // algumas páginas são internas, entao o botão Voltar precisa achar o menu principal
  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(rotaHome as Href);
    }
  }

  // sem modo de revisão, preserva o fluxo original da P01 até conectar o backend
  if (!previewMode) return <>{children}</>;

  return (
    <SafeAreaView
      style={[styles.raiz, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      {mostrarMenu ? (
        <View
          style={[
            styles.cabecalho,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <View style={styles.topoInterno}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ir para o início"
              onPress={() => router.replace(rotaHome as Href)}
            >
              <Text style={[styles.marca, { color: colors.text }]}>FGRC-M</Text>
              <Text style={[styles.marcaSub, { color: colors.muted }]}>
                Gestão de riscos cibernéticos
              </Text>
            </Pressable>
            <View style={styles.topoDireita}>
              {previewMode ? (
                <Text style={[styles.etiqueta, { color: colors.orange }]}>
                  DADOS LOCAIS
                </Text>
              ) : null}
              {!estaNaHome ? (
                <Pressable
                  onPress={voltar}
                  accessibilityRole="button"
                  style={[styles.voltar, { borderColor: colors.border }]}
                >
                  <Text style={[styles.voltarTexto, { color: colors.text }]}>
                    ‹ Voltar
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {/* o Stack do Expo aparece aqui (troca a tela sem sumir com a navegação) */}
      <View style={styles.tela}>{children}</View>

      {mostrarMenu ? (
        <View
          style={[
            styles.rodape,
            { borderTopColor: colors.divider, backgroundColor: colors.surface },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.listaMenu}
            contentContainerStyle={styles.itensMenu}
          >
            {secoes.map((secao) => {
              const destino = previewMode ? secao.rotaPreview : secao.rotaReal;
              const selecionada =
                caminho === destino ||
                (secao.nome === "Mais" &&
                  (caminho === "/editar-perfil" ||
                    caminho === "/alteracoes-salvas"));
              return (
                <Pressable
                  key={secao.nome}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: selecionada }}
                  accessibilityLabel={secao.nome}
                  onPress={() => router.replace(destino as Href)}
                  style={({ pressed }) => [
                    styles.aba,
                    {
                      backgroundColor: selecionada
                        ? colors.selected
                        : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.icone,
                      { color: selecionada ? colors.blue : colors.muted },
                    ]}
                  >
                    {secao.simbolo}
                  </Text>
                  <Text
                    style={[
                      styles.abaTexto,
                      { color: selecionada ? colors.blue : colors.text },
                    ]}
                  >
                    {secao.nome}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  cabecalho: { borderBottomWidth: 1 },
  topoInterno: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 68,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  marca: { fontSize: 20, fontWeight: "800", letterSpacing: 0.2 },
  marcaSub: { fontSize: 11, marginTop: 2 },
  topoDireita: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },
  etiqueta: { fontSize: 10, fontWeight: "800" },
  voltar: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  voltarTexto: { fontSize: 13, fontWeight: "700" },
  tela: { flex: 1, minHeight: 0 },
  rodape: { borderTopWidth: 1 },
  listaMenu: { flexGrow: 0, maxHeight: 76, alignSelf: "center", width: "100%" },
  itensMenu: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  aba: {
    minWidth: 80,
    minHeight: 60,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icone: { fontSize: 19, marginBottom: 2 },
  abaTexto: { fontSize: 11, fontWeight: "700" },
});
