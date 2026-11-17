import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { usePreferencias } from './PreferenciasProvider';

export default function ConfiguracoesScreen() {
  const {
    preferencias,
    carregando,
    salvando,
    erro,
    atualizar,
  } = usePreferencias();

  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setAutenticado(Boolean(session));
      setVerificandoSessao(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const escuro = preferencias.tema === 'escuro';
  const contraste = preferencias.altoContraste;

  const cores = {
    fundo: contraste
      ? escuro ? '#000000' : '#FFFFFF'
      : escuro ? '#101827' : '#F5F8FC',
    cartao: escuro ? '#182438' : '#FFFFFF',
    texto: escuro ? '#FFFFFF' : contraste ? '#000000' : '#17263E',
    secundario: escuro
      ? contraste ? '#FFFFFF' : '#C5D1E2'
      : contraste ? '#000000' : '#465B76',
    borda: contraste
      ? escuro ? '#FFFFFF' : '#000000'
      : escuro ? '#8293AC' : '#52647C',
    destaque: escuro ? '#9DD3FF' : '#11558B',
    selecionado: contraste
      ? escuro ? '#FFFFFF' : '#000000'
      : escuro ? '#9DD3FF' : '#11558B',
    textoSelecionado: escuro ? '#000000' : '#FFFFFF',
  };

  const escala =
    preferencias.tamanhoFonte === 'pequena'
      ? 0.9
      : preferencias.tamanhoFonte === 'grande'
        ? 1.2
        : 1;

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inicio');
    }
  }

  if (verificandoSessao || carregando) {
    return (
      <View style={[styles.loading, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator
          size="large"
          color={cores.destaque}
          accessibilityLabel="Carregando configurações"
        />
      </View>
    );
  }

  if (!autenticado) {
    return <Redirect href="/" />;
  }

  const temas = [
    { valor: 'claro', titulo: 'Claro', icone: 'sunny-outline' },
    { valor: 'escuro', titulo: 'Escuro', icone: 'moon-outline' },
  ] as const;

  const tamanhos = [
    { valor: 'pequena', titulo: 'Pequena' },
    { valor: 'media', titulo: 'Média' },
    { valor: 'grande', titulo: 'Grande' },
  ] as const;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: cores.fundo }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={voltar}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={cores.texto}
            />
          </Pressable>

          <Text
            style={[
              styles.title,
              { color: cores.texto, fontSize: 27 * escala },
            ]}
          >
            Configurações
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: cores.secundario,
                fontSize: 15 * escala,
                lineHeight: 23 * escala,
              },
            ]}
          >
            Personalize sua experiência no FGRC-M.
          </Text>

          <Text
            style={[
              styles.sectionTitle,
              { color: cores.texto, fontSize: 20 * escala },
            ]}
          >
            Aparência
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: cores.cartao,
                borderColor: cores.borda,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: cores.texto, fontSize: 16 * escala },
              ]}
            >
              Tema do aplicativo
            </Text>

            <View style={styles.optionsRow}>
              {temas.map((tema) => {
                const selecionado = preferencias.tema === tema.valor;
                const cor = selecionado
                  ? cores.textoSelecionado
                  : cores.texto;

                return (
                  <Pressable
                    key={tema.valor}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: selecionado,
                      disabled: salvando,
                    }}
                    disabled={salvando}
                    onPress={() =>
                      void atualizar({ tema: tema.valor })
                    }
                    style={({ pressed }) => [
                      styles.option,
                      {
                        borderColor: cores.borda,
                        backgroundColor: selecionado
                          ? cores.selecionado
                          : cores.cartao,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={tema.icone}
                      size={21}
                      color={cor}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        { color: cor, fontSize: 15 * escala },
                      ]}
                    >
                      {tema.titulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: cores.texto, fontSize: 20 * escala },
            ]}
          >
            Acessibilidade
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: cores.cartao,
                borderColor: cores.borda,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: cores.texto, fontSize: 16 * escala },
              ]}
            >
              Tamanho da fonte
            </Text>

            <View style={styles.optionsRow}>
              {tamanhos.map((tamanho) => {
                const selecionado =
                  preferencias.tamanhoFonte === tamanho.valor;

                return (
                  <Pressable
                    key={tamanho.valor}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: selecionado,
                      disabled: salvando,
                    }}
                    disabled={salvando}
                    onPress={() =>
                      void atualizar({
                        tamanhoFonte: tamanho.valor,
                      })
                    }
                    style={({ pressed }) => [
                      styles.option,
                      {
                        borderColor: cores.borda,
                        backgroundColor: selecionado
                          ? cores.selecionado
                          : cores.cartao,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selecionado
                            ? cores.textoSelecionado
                            : cores.texto,
                          fontSize: 14 * escala,
                        },
                      ]}
                    >
                      {tamanho.titulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: cores.borda },
              ]}
            />

            <View style={styles.contrastRow}>
              <View style={styles.contrastDescription}>
                <Text
                  style={[
                    styles.label,
                    { color: cores.texto, fontSize: 16 * escala },
                  ]}
                >
                  Alto contraste
                </Text>

                <Text
                  style={{
                    color: cores.secundario,
                    fontSize: 13 * escala,
                    lineHeight: 20 * escala,
                  }}
                >
                  Aumente o contraste entre textos e fundos.
                </Text>
              </View>

              <Switch
                accessibilityLabel="Alto contraste"
                value={preferencias.altoContraste}
                disabled={salvando}
                onValueChange={(valor) =>
                  void atualizar({ altoContraste: valor })
                }
                trackColor={{
                  false: '#8A94A3',
                  true: escuro ? '#9DD3FF' : '#11558B',
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.status,
              {
                color: cores.secundario,
                fontSize: 13 * escala,
              },
            ]}
          >
            {salvando
              ? 'Salvando...'
              : 'As preferências são salvas automaticamente neste aparelho.'}
          </Text>

          {erro !== '' && (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.error,
                { fontSize: 14 * escala },
              ]}
            >
              {erro}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    maxWidth: 440,
  },
  backButton: {
    width: 44,
    minHeight: 44,
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },
  label: {
    fontWeight: '500',
    marginBottom: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    flexGrow: 1,
    flexBasis: 80,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  optionText: {
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  contrastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  contrastDescription: {
    flex: 1,
  },
  status: {
    lineHeight: 21,
    marginBottom: 12,
  },
  error: {
    color: '#7F1D1D',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.75,
  },
});