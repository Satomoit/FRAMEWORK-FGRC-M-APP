import { useRef, useState, type ComponentRef, useMemo } from "react";
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
import { useCorDoTema, type CorDoTema } from "@/components/cor-do-tema";
import { supabase } from "@/lib/supabase";
// [integração P02] só aceita e-mail de prefeitura (e @gmail.com enquanto a gente testa)
import { problemaNoEmailInstitucional } from "@/lib/email-institucional";
import { plataformaDoPedido } from "@/lib/plataforma";
// [integração 19/11] e-mail de confirmação do pedido (sai pelo servidor, ver src/lib/aviso-pedido-recebido.ts)
import { pedirAvisoDePedidoRecebido } from "@/lib/aviso-pedido-recebido";
// [correção Android] lista de estados que abre por cima da tela (o teclado não cobre)
import { SeletorDeEstado } from "@/components/seletor-uf";
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

export default function SolicitarAcesso() {
  // [tema] cores que seguem o tema escolhido (Configurações ou Opções da página inicial)
  const { cor, escuro } = useCorDoTema();
  const estilosBase = useMemo(() => criarEstilos(cor), [cor]);
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [prefeitura, setPrefeitura] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");

  // [correção Android] "próximo" do teclado pula pro campo de baixo (dá pra preencher só tocando)
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const prefeituraRef = useRef<ComponentRef<typeof TextInput>>(null);
  const municipioRef = useRef<ComponentRef<typeof TextInput>>(null);

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
        // [integração] de onde veio o pedido (navegador, Android ou iPhone), aparece pra administração
        plataforma: plataformaDoPedido(),
      });

      if (error) {
        // 23505 = já existe um pedido pendente com esse e-mail
        if (error.code === "23505") {
          setMensagem("Já existe um pedido em análise para este e-mail. Aguarde a resposta da administração.");
        } else if (error.message?.includes("limite_de_envios")) {
          // [integração] o banco limita 3 pedidos por e-mail em 24h (pra ninguém encher a lista de pedidos falsos)
          setMensagem("Muitos pedidos enviados com este e-mail. Aguarde um dia ou fale com o suporte.");
        } else if (error.code === "42P01" || error.code === "PGRST205") {
          // tabela ainda não criada no Supabase (precisa rodar o script SQL uma vez)
          setMensagem("O cadastro de pedidos ainda não foi configurado. Fale com a administração do FGRC-M.");
        } else {
          setMensagem("Não foi possível enviar o pedido. Confira os dados e tente de novo.");
        }
        return;
      }

      // [integração 19/11] pede o e-mail "Solicitação de acesso recebida" (não espera: o pedido já ta gravado)
      // a tela seguinte só fala do e-mail se o servidor confirmar que mandou
      pedirAvisoDePedidoRecebido(emailLimpo);

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
      <StatusBar style={escuro ? 'light' : 'dark'} />

      {/* [correção Android] antes no Android não tinha "behavior" e o teclado cobria os campos de baixo
          (o app desenha a tela inteira, até atrás das barras do sistema, então o Android não encolhe a tela sozinho)
          com "padding" a área do formulário diminui do tamanho do teclado e dá pra rolar até o fim */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "web" ? undefined : "padding"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
                placeholderTextColor={cor("#65758B", "muted")}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            {/* E-mail institucional */}
            <View style={styles.field}>
              <Text style={styles.label}>E-mail institucional</Text>

              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Digite seu e-mail institucional..."
                placeholderTextColor={cor("#65758B", "muted")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => prefeituraRef.current?.focus()}
              />
            </View>

            {/* Prefeitura */}
            <View style={styles.field}>
              <Text style={styles.label}>Prefeitura</Text>

              <TextInput
                ref={prefeituraRef}
                style={styles.input}
                placeholder="Digite o nome da prefeitura..."
                placeholderTextColor={cor("#65758B", "muted")}
                value={prefeitura}
                onChangeText={setPrefeitura}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => municipioRef.current?.focus()}
              />
            </View>

            {/* Município */}
            <View style={styles.field}>
              <Text style={styles.label}>Município</Text>

              <TextInput
                ref={municipioRef}
                style={styles.input}
                placeholder="Digite seu município..."
                placeholderTextColor={cor("#65758B", "muted")}
                value={municipio}
                onChangeText={setMunicipio}
                returnKeyType="done"
              />
            </View>

            {/* Estado */}
            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>

              {/* [correção Android] era um campo de texto; virou uma lista com as 27 UFs */}
              <SeletorDeEstado
                valor={estado}
                onChange={setEstado}
                estiloCampo={styles.input}
                estiloTexto={styles.inputTexto}
                corPlaceholder={cor("#65758B", "muted")}
                desabilitado={enviando}
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
                <ActivityIndicator color={cor("#FFFFFF", "sobreAzul")} accessibilityLabel="Enviando pedido" />
              ) : (
                <Text style={styles.submitText}>Enviar solicitação</Text>
              )}
            </TouchableOpacity>

            {/* Voltar para login */}
            {/* [entrada nova] agora quem abre esse formulário é a página inicial (Conheça o FGRC-M), então o texto mudou */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.7}
              onPress={voltar}
            >
              <Text style={styles.loginText}>Voltar para a página inicial</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// [tema] os estilos viraram uma função pra as cores seguirem o tema (claro, escuro e alto contraste)
// tamanhos e espaçamentos não mudaram, e no tema claro as cores continuam as originais
function criarEstilos(cor: CorDoTema) {
  return StyleSheet.create({
  // [integração P02] texto de aviso/erro em cima do botão
  mensagem: {
    fontSize: 14,
    lineHeight: 20,
    color: cor("#B42318", "error"),
    marginBottom: 12,
  },
  safeArea: {
    flex: 1,
    backgroundColor: cor("#F4F7FC", "background"),
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    // [correção Android] mais espaço no fim pro botão não colar na borda nem na barra de gestos
    paddingBottom: 48,
    // [correção] no computador o formulário não estica a tela toda
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
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
    color: cor("#152943", "text"),
    lineHeight: 36,
    fontWeight: "300",
  },

  header: {
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: cor("#172A43", "text"),
    marginBottom: 3,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    color: cor("#536782", "muted"),
  },

  form: {
    width: "100%",
  },

  field: {
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: cor("#152943", "text"),
    marginBottom: 5,
    fontWeight: "400",
  },

  input: {
    height: 47,
    width: "100%",
    borderWidth: 1,
    borderColor: cor("#71849C", "border"),
    borderRadius: 12,
    paddingHorizontal: 13,
    backgroundColor: cor("#FFFFFF", "input"),
    fontSize: 13,
    color: cor("#172A43", "text"),
  },

  // [correção Android] texto do seletor de estado (mesma fonte dos outros campos)
  inputTexto: {
    fontSize: 13,
    color: cor("#172A43", "text"),
    flexShrink: 1,
  },

  submitButton: {
    height: 47,
    backgroundColor: cor("#12558F", "blue"),
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  submitText: {
    fontSize: 14,
    color: cor("#FFFFFF", "sobreAzul"),
    fontWeight: "600",
  },

  loginButton: {
    alignSelf: "center",
    marginTop: 9,
    paddingVertical: 2,
  },

  loginText: {
    color: cor("#F07819", "orange"),
    fontSize: 13,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
}
