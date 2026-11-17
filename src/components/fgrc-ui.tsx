import type { PropsWithChildren } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFgrcTheme } from './fgrc-colors';

type PageProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}>;

export function Page({ children, title, subtitle, onBack }: PageProps) {
  const { colors } = useFgrcTheme();
  const showHeader = Boolean(title || subtitle || onBack);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {showHeader ? (
            <View style={styles.header}>
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                  onPress={onBack}
                  hitSlop={8}
                  style={styles.backButton}
                >
                  <Text style={[styles.backText, { color: colors.blue }]}>‹ Voltar</Text>
                </Pressable>
              ) : null}
              {title ? (
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              ) : null}
              {subtitle ? (
                <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
              ) : null}
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FgrcButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  style?: StyleProp<ViewStyle>;
};

export function FgrcButton({
  label,
  onPress,
  disabled = false,
  variant = 'filled',
  style,
}: FgrcButtonProps) {
  const { colors } = useFgrcTheme();
  const outlined = variant === 'outlined';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: outlined ? 'transparent' : colors.blue,
          borderColor: colors.blue,
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          { color: outlined ? colors.blue : colors.blueOnButton },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type NoticeProps = {
  kind: 'info' | 'success';
  message: string;
};

export function Notice({ kind, message }: NoticeProps) {
  const { colors } = useFgrcTheme();
  const color = kind === 'success' ? colors.success : colors.blue;
  const backgroundColor = kind === 'success' ? colors.selected : colors.infoBackground;

  return (
    <View style={[styles.notice, { backgroundColor, borderColor: colors.border }]}>
      <Text style={[styles.noticeText, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
    gap: 6,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  notice: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
