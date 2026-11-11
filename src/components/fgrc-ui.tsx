// ReactNode deixa a pagina receber outros componentes dentro dela
import type { ReactNode } from 'react';
// esses componentes montam botões textos campos e rolagem (tudo no React Native)
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFgrcTheme } from '@/components/fgrc-colors';

// define o que uma pagina pode receber (titulo subtitulo botão de voltar e conteúdo)
type PageProps = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
};

// esse componente é a estrutura que todas as telas compartilham
export function Page({ title, subtitle, onBack, children }: PageProps) {
  const { colors } = useFgrcTheme();
  // usa a largura pra ajustar a margem em telas pequenas
  const { width } = useWindowDimensions();
  // a pagina tem rolagem pra vc conseguir ver tudo até no celular
  return (
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
  );
}

// botão reutilizável (pra não repetir o mesmo código em cada tela)
export function FgrcButton({ label, onPress, variant = 'filled', disabled = false }: {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'danger';
  disabled?: boolean;
}) {
  const { colors } = useFgrcTheme();
  // confere se é o botão azul preenchido
  const isFilled = variant === 'filled';
  // confere se é o botão de ação perigosa (tipo sair da conta)
  const isDanger = variant === 'danger';
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
          backgroundColor: isFilled ? colors.blue : colors.surface,
          borderColor: isDanger ? colors.danger : isFilled ? colors.blue : colors.border,
          borderWidth: isFilled ? 0 : 1.5,
          // se não pode clicar fica apagado (se apertou da um feedback visual)
          opacity: disabled ? 0.45 : pressed ? 0.83 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: isFilled ? colors.blueOnButton : isDanger ? colors.danger : colors.blue }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// esse é o link laranja usado pra voltar ou trocar de etapa
export function OrangeLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useFgrcTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.linkButton}>
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
  const { colors } = useFgrcTheme();
  // escolhe a cor do aviso conforme o tipo dele
  const accent = kind === 'success' ? colors.success : kind === 'error' ? colors.error : colors.blue;
  return (
    <View style={[styles.notice, { borderColor: accent, backgroundColor: colors.infoBackground }]}>
      <Text accessibilityLiveRegion="polite" style={[styles.noticeText, { color: colors.text }]}>{message}</Text>
      {/* se recebeu uma função pra fechar aparece o X do aviso */}
      {onClose ? (
        <Pressable accessibilityLabel="Fechar aviso" accessibilityRole="button" onPress={onClose} style={styles.noticeClose}>
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
  symbol: 'profile' | 'gear' | 'shield';
  onPress: () => void;
}) {
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
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  // coloca respiro no começo e no fim (principalmente no celular)
  scrollContent: { flexGrow: 1, paddingTop: 23, paddingBottom: Platform.OS === 'web' ? 42 : 112 },
  // limita o conteúdo a uma largura boa de leitura no pc
  pageContent: { alignSelf: 'center', width: '100%', maxWidth: 610 },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 9, paddingRight: 16, marginBottom: 18 },
  backIcon: { fontSize: 23, lineHeight: 28 },
  backText: { fontSize: 14, fontWeight: '500' },
  heading: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 5 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  // formato básico dos botões (altura borda e alinhamento)
  button: { minHeight: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18 },
  buttonText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  linkButton: { paddingVertical: 13, paddingHorizontal: 10, alignSelf: 'center' },
  linkText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  field: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 7 },
  hint: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  // aparência básica dos campos que vc digita
  textInput: { minHeight: 53, borderWidth: 1.4, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16 },
  error: { marginTop: 6, fontSize: 13 },
  // formato das mensagens de aviso
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 3, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, marginTop: 14 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19 },
  noticeClose: { padding: 3 },
  // aparência dos cartões clicáveis do menu Mais
  menuOption: { flexDirection: 'row', alignItems: 'center', minHeight: 88, borderRadius: 16, borderWidth: 1.25, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 13, gap: 16 },
  menuIcon: { width: 30, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, gap: 3 },
  menuTitle: { fontSize: 17, fontWeight: '600' },
  menuSubtitle: { fontSize: 13, lineHeight: 19 },
  menuChevron: { fontSize: 27, lineHeight: 30 },
});
