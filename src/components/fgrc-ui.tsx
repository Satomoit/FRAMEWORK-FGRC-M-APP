// ReactNode deixa a pagina receber outros componentes dentro dela
import type { ComponentProps, ReactNode } from 'react';
// [integração 19/11] ícones nos botões (✓ aprovar, ✕ recusar, lixeira excluir...)
import Ionicons from '@expo/vector-icons/Ionicons';
// esses componentes montam botões textos campos e rolagem (tudo no React Native)
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFgrcTheme } from '@/components/fgrc-colors';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

// define o que uma pagina pode receber (titulo subtitulo botão de voltar e conteúdo)
type PageProps = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
};

// esse componente é a estrutura que todas as telas compartilham
export function Page({ title, subtitle, onBack, children }: PageProps) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  // usa a largura pra ajustar a margem em telas pequenas
  const { width } = useWindowDimensions();
  // a pagina tem rolagem pra vc conseguir ver tudo até no celular
  // [correção Android] o KeyboardAvoidingView encolhe a página quando o teclado abre
  // (sem ele, no Android o teclado ficava por cima dos campos do fim da tela, ex: a mensagem do suporte)
  return (
    <KeyboardAvoidingView style={styles.teclado} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingHorizontal: width < 400 ? 18 : 28 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* limita a largura do conteúdo (pra não ficar gigante no navegador) */}
      <View style={styles.pageContent}>
        {/* só mostra Voltar quando a tela recebe uma função de retorno */}
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
            <Text style={[styles.backText, { color: colors.muted }]}>Voltar</Text>
          </Pressable>
        ) : null}
        {/* se existir titulo ele aparece com o subtitulo embaixo */}
        {title ? (
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {/* esse espaço recebe os campos e botões da tela atual */}
        {children}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

// [integração 19/11] cores dos botões pra ficar intuitivo:
//   filled = azul cheio (ação principal) | outlined = contorno (ação secundária)
//   success = verde cheio (confirmar algo bom: aprovar, finalizar, reativar)
//   successOutlined = contorno verde (outras formas de aprovar)
//   danger = contorno vermelho (abre algo perigoso: excluir, recusar, sair)
//   dangerSolid = vermelho cheio (a confirmação final do perigoso: "Sim, excluir")
export type VarianteDoBotao = 'filled' | 'outlined' | 'danger' | 'dangerSolid' | 'success' | 'successOutlined';
export type IconeDoBotao = ComponentProps<typeof Ionicons>['name'];

// botão reutilizável (pra não repetir o mesmo código em cada tela)
export function FgrcButton({ label, onPress, variant = 'filled', disabled = false, icon }: {
  label: string;
  onPress: () => void;
  variant?: VarianteDoBotao;
  disabled?: boolean;
  // [integração 19/11] ícone opcional antes do texto (ex: 'checkmark-circle-outline')
  icon?: IconeDoBotao;
}) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  // [integração 19/11] separa em "qual cor" (azul, verde ou vermelho) e "cheio ou contorno"
  const verde = variant === 'success' || variant === 'successOutlined';
  const vermelho = variant === 'danger' || variant === 'dangerSolid';
  const cheio = variant === 'filled' || variant === 'success' || variant === 'dangerSolid';
  const cor = verde ? colors.success : vermelho ? colors.danger : colors.blue;
  const corDoTexto = cheio
    ? (verde ? colors.successOnButton : vermelho ? colors.dangerOnButton : colors.blueOnButton)
    : cor;
  // confere se é o botão azul preenchido
  const isFilled = cheio;
  // confere se é o botão de ação perigosa (tipo sair da conta)
  const isDanger = vermelho;
  // Pressable faz o botão reagir ao clique e ao toque
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isFilled ? cor : colors.surface,
          // contorno: azul fica com a borda cinza de antes; verde e vermelho ficam com a borda da cor
          borderColor: isFilled ? cor : isDanger || verde ? cor : colors.border,
          borderWidth: isFilled ? 0 : 1.5,
          // se não pode clicar fica apagado (se apertou da um feedback visual)
          opacity: disabled ? 0.45 : pressed ? 0.83 : 1,
        },
      ]}
    >
      {/* [integração 19/11] ícone + texto lado a lado (o ícone fica escondido do leitor de tela, o texto já explica) */}
      <View style={styles.buttonConteudo}>
        {icon ? <Ionicons name={icon} size={20} color={corDoTexto} accessibilityElementsHidden importantForAccessibility="no" /> : null}
        <Text style={[styles.buttonText, { color: corDoTexto }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// esse é o link laranja usado pra voltar ou trocar de etapa
export function OrangeLink({ label, onPress }: { label: string; onPress: () => void }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.linkButton}>
      <Text style={[styles.linkText, { color: colors.orange }]}>{label}</Text>
    </Pressable>
  );
}

// campo reutilizável com texto validação e modo senha ou email
export function FormField({ label, value, onChangeText, placeholder, error, email = false, secure = false, hint }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  email?: boolean;
  secure?: boolean;
  hint?: string;
}) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {hint ? <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text> : null}
      {/* é aqui que vc digita (ele recebe o valor e avisa quando muda) */}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        autoCapitalize={email ? 'none' : 'sentences'}
        autoCorrect={!email && !secure}
        autoComplete={email ? 'email' : secure ? 'off' : undefined}
        keyboardType={email ? 'email-address' : 'default'}
        secureTextEntry={secure}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        style={[styles.textInput, {
          backgroundColor: colors.input,
          borderColor: error ? colors.error : colors.border,
          color: colors.text,
        }]}
      />
      {/* se a validação falhar aparece o recado embaixo do campo */}
      {error ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

// caixinha de aviso usada pra explicar erro sucesso ou informação
export function Notice({ message, kind = 'info', onClose }: {
  message: string;
  kind?: 'info' | 'success' | 'error';
  onClose?: () => void;
}) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  // escolhe a cor do aviso conforme o tipo dele
  const accent = kind === 'success' ? colors.success : kind === 'error' ? colors.error : colors.blue;
  return (
    <View style={[styles.notice, { borderColor: accent, backgroundColor: colors.infoBackground }]}>
      <Text accessibilityLiveRegion="polite" style={[styles.noticeText, { color: colors.text }]}>{message}</Text>
      {/* se recebeu uma função pra fechar aparece o X do aviso */}
      {onClose ? (
        // [integração 19/11] área de toque maior (o × era bem pequeno pra acertar com o dedo)
        <Pressable accessibilityLabel="Fechar aviso" accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.noticeClose}>
          <Text style={{ color: colors.text, fontSize: 19 }}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// desenha o ícone simples de pessoa sem precisar baixar imagem
export function UserGlyph({ size = 34 }: { size?: number }) {
  const { colors } = useFgrcTheme();
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: size * .33, height: size * .34, borderRadius: size * .25, borderWidth: 2, borderColor: colors.blue }} />
      <View style={{ width: size * .7, height: size * .30, borderTopLeftRadius: size * .4, borderTopRightRadius: size * .4, borderWidth: 2, borderBottomWidth: 0, marginTop: size * .06, borderColor: colors.blue }} />
    </View>
  );
}

// monta cada opção clicável do menu Mais
export function MenuOption({ title, subtitle, symbol, onPress }: {
  title: string;
  subtitle: string;
  // [integração] 'help' = ícone de interrogação (usado no Ajuda e suporte)
  symbol: 'profile' | 'gear' | 'shield' | 'help';
  onPress: () => void;
}) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.menuOption, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}
    >
      <View style={styles.menuIcon}>
        {/* escolhe o ícone de perfil engrenagem ou privacidade */}
        {symbol === 'profile' ? <UserGlyph size={27} /> : symbol === 'gear' ? (
          <Text style={{ fontSize: 29, color: colors.blue }}>⚙</Text>
        ) : symbol === 'help' ? (
          <View style={{ borderColor: colors.blue, borderWidth: 2, borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.blue }}>?</Text>
          </View>
        ) : (
          <View style={{ borderColor: colors.blue, borderWidth: 2, borderRadius: 10, width: 26, height: 29, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.blue }}>✓</Text>
          </View>
        )}
      </View>
      {/* organiza titulo e descrição um embaixo do outro */}
      <View style={styles.menuLabel}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.menuSubtitle, { color: colors.muted }]}>{subtitle}</Text>
      </View>
      <Text style={[styles.menuChevron, { color: colors.blue }]}>›</Text>
    </Pressable>
  );
}

// estilos compartilhados (se vc mudar aqui pode afetar as quatro telas)
const estilosBase = StyleSheet.create({
  scroll: { flex: 1 },
  // [correção Android] ocupa a tela toda, igual o ScrollView ocupava antes
  teclado: { flex: 1 },
  // coloca respiro no começo e no fim (principalmente no celular)
  scrollContent: { flexGrow: 1, paddingTop: 23, paddingBottom: Platform.OS === 'web' ? 42 : 112 },
  // limita o conteúdo a uma largura boa de leitura no pc
  pageContent: { alignSelf: 'center', width: '100%', maxWidth: 610 },
  // [integração 19/11] minHeight 48 = tamanho mínimo recomendado pra tocar com o dedo (acessibilidade)
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 48, paddingVertical: 9, paddingRight: 16, marginBottom: 18 },
  backIcon: { fontSize: 23, lineHeight: 28 },
  backText: { fontSize: 14, fontWeight: '500' },
  heading: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 5 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  // formato básico dos botões (altura borda e alinhamento)
  button: { minHeight: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18 },
  buttonText: { fontSize: 16, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  buttonConteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  linkButton: { minHeight: 48, justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 10, alignSelf: 'center' },
  linkText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  field: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 7 },
  hint: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  // aparência básica dos campos que vc digita
  textInput: { minHeight: 53, borderWidth: 1.4, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  error: { marginTop: 6, fontSize: 13 },
  // formato das mensagens de aviso
  // [integração 19/11] aviso um pouco mais visível (faixa lateral mais grossa e letra 14 em vez de 13)
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 4, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginTop: 14 },
  noticeText: { flex: 1, fontSize: 14, lineHeight: 20 },
  noticeClose: { minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  // aparência dos cartões clicáveis do menu Mais
  menuOption: { flexDirection: 'row', alignItems: 'center', minHeight: 88, borderRadius: 16, borderWidth: 1.25, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 13, gap: 16 },
  menuIcon: { width: 30, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, gap: 3 },
  menuTitle: { fontSize: 17, fontWeight: '600' },
  menuSubtitle: { fontSize: 13, lineHeight: 19 },
  menuChevron: { fontSize: 27, lineHeight: 30 },
});
