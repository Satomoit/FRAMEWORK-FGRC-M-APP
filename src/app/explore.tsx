import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useCorDoTema, type CorDoTema } from "@/components/cor-do-tema";
// [integração 19/11] resultado do e-mail de confirmação do pedido
import { pegarResultadoDoAviso } from "@/lib/aviso-pedido-recebido";
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

export default function SolicitacaoEnviada() {
  // [tema] cores que seguem o tema escolhido (Configurações ou Opções da página inicial)
  const { cor, escuro } = useCorDoTema();
  const estilosBase = useMemo(() => criarEstilos(cor), [cor]);
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  // [integração 19/11] null = ainda esperando (ou não teve pedido agora); "enviado" só quando o servidor confirmou
  const [avisoEnviado, setAvisoEnviado] = useState<boolean | null>(null);

  useEffect(() => {
    const promessa = pegarResultadoDoAviso();
    if (!promessa) return;
    let ativo = true;
    promessa.then(r => { if (ativo) setAvisoEnviado(r === "enviado"); });
    return () => { ativo = false; };
  }, []);

  const voltarLogin = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={escuro ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Ícone de confirmação */}
          <View style={styles.iconCircle}>
            <Text style={styles.envelopeIcon}>✉</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>Solicitação enviada</Text>

          {/* Descrição */}
          <Text style={styles.description}>
            Você receberá uma atualização no e-mail informado quando sua
            solicitação for avaliada.
          </Text>

          {/* [integração 19/11] só aparece quando o e-mail de confirmação saiu de verdade */}
          {avisoEnviado ? (
            <Text style={styles.description} accessibilityLiveRegion="polite">
              Enviamos uma confirmação para o seu e-mail. Se não encontrar, veja também a pasta de spam.
            </Text>
          ) : null}

          {/* Cartão de status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.clockIcon}>◷</Text>

              <Text style={styles.statusTitle}>Status: Em análise</Text>
            </View>

            <Text style={styles.statusDescription}>
              O acesso será liberado após a aprovação do administrador.
            </Text>
            {/* [integração] explica o próximo passo depois da aprovação */}
            <Text style={[styles.statusDescription, { marginTop: 8 }]}>
              Quando o pedido for aprovado, a administração do FGRC-M vai passar as instruções
              do primeiro acesso (uma senha provisória ou um código enviado por e-mail).
            </Text>
          </View>

          {/* Botão voltar para login */}
          {/* [entrada nova] "/" agora é a página inicial (Conheça o FGRC-M), então o texto mudou */}
          <TouchableOpacity
            style={styles.button}
            onPress={voltarLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Voltar para a página inicial</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// [tema] os estilos viraram uma função pra as cores seguirem o tema (claro, escuro e alto contraste)
// tamanhos e espaçamentos não mudaram, e no tema claro as cores continuam as originais
function criarEstilos(cor: CorDoTema) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cor("#F4F7FC", "background"),
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: cor("#F8E3D3", "laranjaFundo"),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },

  envelopeIcon: {
    fontSize: 29,
    color: cor("#F07819", "orange"),
    fontWeight: "400",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: cor("#080808", "text"),
    textAlign: "center",
    marginBottom: 19,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    color: cor("#536782", "muted"),
    textAlign: "center",
    marginBottom: 19,
    paddingHorizontal: 5,
  },

  statusCard: {
    width: "100%",
    minHeight: 90,
    backgroundColor: cor("#FFFFFF", "surface"),
    borderWidth: 1,
    borderColor: cor("#71849C", "border"),
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 19,
    justifyContent: "center",
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  clockIcon: {
    fontSize: 25,
    color: cor("#F07819", "orange"),
    marginRight: 11,
  },

  statusTitle: {
    fontSize: 13,
    color: cor("#152943", "text"),
    fontWeight: "400",
  },

  statusDescription: {
    fontSize: 11,
    lineHeight: 15,
    color: cor("#536782", "muted"),
  },

  button: {
    width: "100%",
    height: 47,
    backgroundColor: cor("#12558F", "blue"),
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 14,
    color: cor("#FFFFFF", "sobreAzul"),
    fontWeight: "500",
  },
});
}
