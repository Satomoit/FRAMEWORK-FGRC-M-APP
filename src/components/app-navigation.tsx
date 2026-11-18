// essa barra fica no aplicativo inteiro (pra vc não depender do painel de links)
// [integração B1] agora ela copia o desenho da barra que a Nicole fez na Home (P01)
// assim é uma barra só pro usuário: na Home aparece a da P01, nas outras telas aparece esta, igualzinha
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePathname, useRouter, type Href } from "expo-router";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFgrcTheme } from "@/components/fgrc-colors";

type NomeIcone = ComponentProps<typeof Ionicons>["name"];

// [integração B1] o modo EXPO_PUBLIC_PREVIEW_MODE saiu daqui
// pq agora as telas privadas só abrem com login de verdade (o _layout.tsx confere)
// e o _layout avisa se tem sessão pela prop "logado"
type Props = { children: ReactNode; logado: boolean };

// as cinco áreas principais, na mesma ordem e com os mesmos ícones da barra da P01
// "tambem" = telas internas que deixam o mesmo botão aceso (ex: editar perfil acende Mais)
const secoes: {
  nome: string;
  rota: string;
  icone: NomeIcone;
  tambem: string[];
}[] = [
  { nome: "Início", rota: "/inicio", icone: "home-outline", tambem: [] },
  {
    nome: "Avaliações",
    rota: "/avaliacoes",
    icone: "clipboard-outline",
    tambem: ["/revisar-avaliacao", "/avaliacao-finalizada"],
  },
  {
    nome: "Resultados",
    rota: "/resultados-revisao",
    icone: "stats-chart-outline",
    tambem: [],
  },
  {
    nome: "Relatórios",
    rota: "/relatorios-revisao",
    icone: "document-text-outline",
    tambem: [],
  },
  {
    // antes ia pra /minhas-telas (rota de teste com seletor P07/P09)
    // agora vai pra /mais, que abre o menu Mais da P09 direto
    nome: "Mais",
    rota: "/mais",
    icone: "menu-outline",
    tambem: [
      "/minhas-telas",
      "/editar-perfil",
      "/alteracoes-salvas",
      // [integração P11] telas da Nicole que abrem a partir do Mais
      "/configuracoes",
      "/alterar-senha",
    ],
  },
];

// [integração B1] as únicas rotas que abrem sem login
// (login, pedido de acesso e a confirmação dele, e as telas de senha nova da P08)
const rotasPublicas = [
  "/",
  "/solicitar-acesso",
  "/explore",
  "/criar-nova-senha",
  "/senha-alterada",
  // [integração P07] Esqueci minha senha (precisa abrir sem login)
  "/recuperar-senha",
  // [integração] Ajuda e suporte abre também pelo Login (quem não consegue entrar precisa pedir ajuda)
  "/suporte",
  // [integração] ativar acesso com o código do e-mail (a pessoa ainda não tem senha)
  "/ativar-acesso",
];

// nessas a barra não aparece: as públicas e a Home, que já tem a barra própria da P01
// (se mostrasse aqui também ia ficar duas barras na Home)
const rotasSemBarra = [...rotasPublicas, "/inicio"];

export default function AppNavigation({ children, logado }: Props) {
  const router = useRouter();
  const caminho = usePathname();
  const { colors, isDark } = useFgrcTheme();

  // só mostra a barra com login e fora das rotas da lista de cima
  const mostrarMenu = logado && !rotasSemBarra.includes(caminho);

  // [integração B1] rede de segurança: sem login, tudo que não é público fica bloqueado
  // o Stack.Protected do _layout já barra as rotas conhecidas antes de abrir
  // isso aqui pega o que escapar (ex: um arquivo novo em src/app que alguém esqueceu de proteger)
  const bloqueada = !logado && !rotasPublicas.includes(caminho);

  useEffect(() => {
    // manda pro login (o replace tira a tela bloqueada do histórico)
    if (bloqueada) router.replace("/" as Href);
  }, [bloqueada, router]);

  // [integração B1] o cabeçalho com "‹ Voltar" saiu daqui
  // pq as telas internas dos colegas já têm o Voltar delas (questionário, detalhes, perfil...)
  // e ficava dois Voltar na mesma tela; pra voltar pra Home agora é o ícone Início da barra

  // [integração B1] a estrutura é sempre a mesma, com ou sem barra
  // (se trocasse o "pai" do Stack o React recriava a navegação e o Voltar do navegador perdia o histórico)
  // sem barra o SafeAreaView fica sem margens, pq a Home e o Login já cuidam disso
  return (
    <SafeAreaView
      style={[styles.raiz, { backgroundColor: colors.background }]}
      edges={mostrarMenu ? ["top", "bottom"] : []}
    >
      {/* o Stack do Expo aparece aqui (troca a tela sem sumir com a navegação) */}
      {/* se a rota ta bloqueada a tela fica escondida até o redirecionamento terminar */}
      <View style={[styles.tela, bloqueada && styles.escondida]}>
        {children}
      </View>
      {bloqueada ? (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#11558B" accessibilityLabel="Abrindo o login" />
        </View>
      ) : null}

      {mostrarMenu ? (
        <View style={styles.faixa}>
          {/* mesmo fundo branco arredondado da barra da P01 (no escuro usa a cor de cartão do tema) */}
          <View
            style={[
              styles.barra,
              { backgroundColor: isDark ? colors.surface : "#FFFFFF" },
            ]}
          >
            {secoes.map((secao) => {
              // acende o botão na tela principal e nas internas da mesma área
              const selecionada =
                caminho === secao.rota || secao.tambem.includes(caminho);
              return (
                <Pressable
                  key={secao.nome}
                  accessibilityRole="tab"
                  accessibilityLabel={secao.nome}
                  accessibilityState={{ selected: selecionada }}
                  onPress={() => {
                    // navigate volta pra tela se ela já tiver aberta no histórico (ex: Início)
                    // e só abre uma nova se não tiver (assim não empilha várias Homes)
                    // se vc já ta na tela principal dessa área não faz nada
                    if (caminho !== secao.rota) {
                      router.navigate(secao.rota as Href);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.botao,
                    pressed && styles.pressionado,
                  ]}
                >
                  {/* laranja no selecionado, igual à P01 */}
                  <Ionicons
                    name={secao.icone}
                    size={27}
                    color={
                      selecionada ? "#FF8C28" : isDark ? colors.text : "#111111"
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// medidas copiadas de bottomBar e navButton da HomeScreen.tsx (P01)
// a faixa limita a largura igual ao "page" da Home (fica bonito no computador também)
const styles = StyleSheet.create({
  raiz: { flex: 1 },
  tela: { flex: 1, minHeight: 0 },
  escondida: { display: "none" },
  carregando: { flex: 1, alignItems: "center", justifyContent: "center" },
  faixa: { width: "100%", maxWidth: 560, alignSelf: "center" },
  barra: {
    flexDirection: "row",
    borderRadius: 18,
    marginHorizontal: 8,
    marginBottom: 6,
    paddingVertical: 8,
  },
  botao: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  pressionado: { opacity: 0.7 },
});
