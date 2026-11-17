import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePreferencias } from '@/features/p11-configuracoes/PreferenciasProvider';
import { supabase } from '@/lib/supabase';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

type DadosInicio = {
  prefeitura: string | null;
  progresso: number | null;
  ultimaAvaliacao: string | null;
  quantidadePrioridades: number | null;
  pontosAtencao: {
    id: string;
    titulo: string;
    prioridade: 'alta' | 'media';
  }[];
};

const dadosIniciais: DadosInicio = {
  prefeitura: null,
  progresso: null,
  ultimaAvaliacao: null,
  quantidadePrioridades: null,
  pontosAtencao: [],
};

const itensMenu: { nome: string; icone: NomeIcone }[] = [
  { nome: 'Início', icone: 'home-outline' },
  { nome: 'Avaliações', icone: 'clipboard-outline' },
  { nome: 'Resultados', icone: 'stats-chart-outline' },
  { nome: 'Relatórios', icone: 'document-text-outline' },
  { nome: 'Mais', icone: 'menu-outline' },
];

export default function HomeScreen() {
  const {
    preferencias,
    carregando: carregandoPreferencias,
  } = usePreferencias();

  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Receberá os dados reais quando a fonte das avaliações for integrada.
  const [dados] = useState<DadosInicio>(dadosIniciais);

  const escuro = preferencias.tema === 'escuro';
  const contraste = preferencias.altoContraste;

  const escala =
    preferencias.tamanhoFonte === 'pequena'
      ? 0.9
      : preferencias.tamanhoFonte === 'grande'
        ? 1.2
        : 1;

  const cores = {
    fundo: contraste
      ? escuro ? '#000000' : '#FFFFFF'
      : escuro ? '#101827' : '#F5F8FC',
    cartao: contraste
      ? escuro ? '#000000' : '#FFFFFF'
      : escuro ? '#182438' : '#FFFFFF',
    texto: escuro ? '#FFFFFF' : contraste ? '#000000' : '#17263E',
    secundario: escuro
      ? contraste ? '#FFFFFF' : '#C5D1E2'
      : contraste ? '#000000' : '#465B76',
    borda: contraste
      ? escuro ? '#FFFFFF' : '#000000'
      : escuro ? '#8293AC' : '#52647C',
    divisor: contraste
      ? escuro ? '#FFFFFF' : '#000000'
      : escuro ? '#465B76' : '#D9D9D9',
    botao: escuro ? '#9DD3FF' : '#11558B',
    textoBotao: escuro ? '#000000' : '#FFFFFF',
    laranja: escuro ? '#FFAD5C' : '#FF8C28',
    alertaAlto: escuro ? '#FCA5A5' : '#C62828',
    alertaMedio: escuro ? '#FCD34D' : '#946000',
    sair: escuro ? '#FCA5A5' : '#B42318',
  };

  const styles = criarEstilos(cores, escala);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setAutenticado(Boolean(session));
      setCarregando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function abrirFuncionalidade(nome: string) {
    setMaisAberto(false);
    setMensagem(
      `${nome} ainda não está disponível nesta versão do aplicativo.`
    );
  }

  function abrirConfiguracoes() {
    setMaisAberto(false);
    router.push('/configuracoes');
  }

  function abrirAlterarSenha() {
    setMaisAberto(false);
    router.push('/alterar-senha');
  }

  async function sair() {
    if (saindo) return;

    setSaindo(true);
    setMensagem('');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setMaisAberto(false);
        setMensagem('Não foi possível sair. Tente novamente.');
        return;
      }

      setMaisAberto(false);
      setAutenticado(false);
    } catch {
      setMaisAberto(false);
      setMensagem('Não foi possível sair. Verifique sua conexão.');
    } finally {
      setSaindo(false);
    }
  }

  if (carregando || carregandoPreferencias) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={cores.botao}
          accessibilityLabel="Carregando página inicial"
        />
      </View>
    );
  }

  if (!autenticado) {
    return <Redirect href="/" />;
  }

  const progresso =
    dados.progresso === null
      ? null
      : Math.max(0, Math.min(100, dados.progresso));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Olá, gestor(a)!</Text>
            <Text style={styles.subtitle}>
              {dados.prefeitura ?? 'Prefeitura vinculada: —'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Avaliação em andamento
            </Text>

            <Text style={styles.subtitle}>
              Continue de onde parou
            </Text>

            <View
              style={styles.progressTrack}
              accessibilityRole="progressbar"
              accessibilityLabel="Progresso da avaliação"
              accessibilityValue={
                progresso === null
                  ? { text: 'Não disponível' }
                  : { min: 0, max: 100, now: progresso }
              }
            >
              {progresso !== null && (
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progresso}%` },
                  ]}
                />
              )}
            </View>

            <Text style={styles.progressText}>
              {progresso === null
                ? '— concluído'
                : `${progresso}% concluído`}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: progresso === null }}
              disabled={progresso === null}
              style={({ pressed }) => [
                styles.continueButton,
                progresso === null && styles.disabled,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                abrirFuncionalidade('Continuar avaliação')
              }
            >
              <Text style={styles.continueText}>Continuar</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Resumo da avaliação
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>IERC-M</Text>
            <View style={styles.orangeLine} />

            <Text style={styles.summaryText}>
              Última avaliação: {dados.ultimaAvaliacao ?? '—'}
            </Text>

            <Text style={styles.summaryText}>
              Prioridades:{' '}
              {dados.quantidadePrioridades === null
                ? '—'
                : `${dados.quantidadePrioridades} pontos de atenção`}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Pontos de atenção
          </Text>

          <View style={[styles.card, styles.attentionCard]}>
            {dados.pontosAtencao.length === 0 ? (
              <View style={styles.emptyAttention}>
                <Text style={styles.emptyText}>
                  Pontos de atenção ainda não disponíveis.
                </Text>
              </View>
            ) : (
              dados.pontosAtencao.map((ponto, index) => (
                <View key={ponto.id}>
                  {index > 0 && <View style={styles.divider} />}

                  <View style={styles.attentionRow}>
                    <Ionicons
                      name={
                        ponto.prioridade === 'alta'
                          ? 'shield-outline'
                          : 'alert-circle-outline'
                      }
                      size={23}
                      color={
                        ponto.prioridade === 'alta'
                          ? cores.alertaAlto
                          : cores.alertaMedio
                      }
                      accessibilityLabel={
                        ponto.prioridade === 'alta'
                          ? 'Prioridade alta'
                          : 'Prioridade média'
                      }
                    />

                    <Text style={styles.attentionText}>
                      {ponto.titulo}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>Acesso rápido</Text>

          <View style={styles.quickRow}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.pressed,
              ]}
              onPress={() => abrirFuncionalidade('Relatórios')}
            >
              <Ionicons
                name="document-text-outline"
                size={25}
                color={cores.texto}
              />
              <Text style={styles.quickText}>Relatórios</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.pressed,
              ]}
              onPress={() => abrirFuncionalidade('Nova avaliação')}
            >
              <Ionicons
                name="add-circle-outline"
                size={25}
                color={cores.texto}
              />
              <Text style={styles.quickText}>Nova avaliação</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          {itensMenu.map((item) => {
            const selecionado = item.nome === 'Início';

            return (
              <Pressable
                key={item.nome}
                accessibilityRole="button"
                accessibilityLabel={item.nome}
                accessibilityState={{ selected: selecionado }}
                style={({ pressed }) => [
                  styles.navButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  if (item.nome === 'Mais') {
                    setMaisAberto(true);
                  } else if (!selecionado) {
                    abrirFuncionalidade(item.nome);
                  }
                }}
              >
                <Ionicons
                  name={item.icone}
                  size={27}
                  color={selecionado ? cores.laranja : cores.texto}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Modal
        visible={maisAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setMaisAberto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
            >
              <Text style={styles.modalTitle}>Mais</Text>

              <Pressable
                accessibilityRole="button"
                style={styles.menuItem}
                disabled={saindo}
                onPress={() => abrirFuncionalidade('Meu perfil')}
              >
                <Ionicons
                  name="person-outline"
                  size={23}
                  color={cores.texto}
                />
                <Text style={styles.menuText}>Meu perfil</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={styles.menuItem}
                disabled={saindo}
                onPress={abrirAlterarSenha}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={23}
                  color={cores.texto}
                />
                <Text style={styles.menuText}>Alterar senha</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={styles.menuItem}
                disabled={saindo}
                onPress={abrirConfiguracoes}
              >
                <Ionicons
                  name="settings-outline"
                  size={23}
                  color={cores.texto}
                />
                <Text style={styles.menuText}>Configurações</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={styles.menuItem}
                disabled={saindo}
                onPress={() =>
                  abrirFuncionalidade('Privacidade e termos')
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={23}
                  color={cores.texto}
                />
                <Text style={styles.menuText}>
                  Privacidade e termos
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={saindo}
                accessibilityState={{
                  disabled: saindo,
                  busy: saindo,
                }}
                style={styles.menuItem}
                onPress={() => void sair()}
              >
                <Ionicons
                  name="log-out-outline"
                  size={23}
                  color={cores.sair}
                />
                <Text style={styles.logoutText}>
                  {saindo ? 'Saindo...' : 'Sair da conta'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                style={styles.closeButton}
                onPress={() => setMaisAberto(false)}
              >
                <Text style={styles.closeText}>Fechar</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mensagem !== ''}
        transparent
        animationType="fade"
        onRequestClose={() => setMensagem('')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
            >
              <Text
                style={styles.messageText}
                accessibilityLiveRegion="polite"
              >
                {mensagem}
              </Text>

              <Pressable
                accessibilityRole="button"
                style={styles.closeButton}
                onPress={() => setMensagem('')}
              >
                <Text style={styles.closeText}>OK</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type Cores = {
  fundo: string;
  cartao: string;
  texto: string;
  secundario: string;
  borda: string;
  divisor: string;
  botao: string;
  textoBotao: string;
  laranja: string;
  alertaAlto: string;
  alertaMedio: string;
  sair: string;
};

function criarEstilos(cores: Cores, escala: number) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: cores.fundo,
    },
    loading: {
      flex: 1,
      backgroundColor: cores.fundo,
      alignItems: 'center',
      justifyContent: 'center',
    },
    page: {
      flex: 1,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 30,
    },
    header: {
      marginBottom: 12,
    },
    title: {
      fontSize: 24 * escala,
      fontWeight: '600',
      color: cores.texto,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 15 * escala,
      lineHeight: 22 * escala,
      color: cores.secundario,
    },
    card: {
      backgroundColor: cores.cartao,
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 18,
      padding: 18,
    },
    cardTitle: {
      fontSize: 18 * escala,
      fontWeight: '600',
      color: cores.texto,
      lineHeight: 25 * escala,
      marginBottom: 4,
    },
    progressTrack: {
      height: 8,
      borderRadius: 5,
      backgroundColor: cores.divisor,
      overflow: 'hidden',
      marginTop: 7,
      marginBottom: 5,
    },
    progressFill: {
      height: '100%',
      borderRadius: 5,
      backgroundColor: cores.laranja,
    },
    progressText: {
      color: cores.secundario,
      fontSize: 13 * escala,
      lineHeight: 20 * escala,
      marginBottom: 8,
    },
    continueButton: {
      alignSelf: 'flex-start',
      minHeight: 44,
      justifyContent: 'center',
      backgroundColor: cores.botao,
      borderRadius: 13,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    continueText: {
      color: cores.textoBotao,
      fontSize: 16 * escala,
      lineHeight: 23 * escala,
      fontWeight: '600',
    },
    disabled: {
      opacity: 0.55,
    },
    sectionTitle: {
      color: cores.texto,
      fontSize: 18 * escala,
      lineHeight: 26 * escala,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 6,
    },
    orangeLine: {
      width: 58,
      height: 4,
      borderRadius: 3,
      backgroundColor: cores.laranja,
      marginTop: 2,
      marginBottom: 20,
    },
    summaryText: {
      color: cores.texto,
      fontSize: 15 * escala,
      lineHeight: 24 * escala,
      marginBottom: 10,
    },
    attentionCard: {
      paddingVertical: 8,
    },
    emptyAttention: {
      minHeight: 110,
      justifyContent: 'center',
    },
    emptyText: {
      color: cores.secundario,
      fontSize: 14 * escala,
      lineHeight: 22 * escala,
    },
    attentionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 20,
    },
    attentionText: {
      flex: 1,
      color: cores.texto,
      fontSize: 16 * escala,
      fontWeight: '600',
      lineHeight: 24 * escala,
    },
    divider: {
      height: 1,
      backgroundColor: cores.divisor,
    },
    quickRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickCard: {
      flexGrow: 1,
      flexBasis: 130,
      backgroundColor: cores.cartao,
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 14,
      padding: 14,
      justifyContent: 'center',
      minHeight: 78,
      gap: 4,
    },
    quickText: {
      color: cores.texto,
      fontSize: 15 * escala,
      lineHeight: 22 * escala,
    },
    bottomBar: {
      flexDirection: 'row',
      backgroundColor: cores.cartao,
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 18,
      marginHorizontal: 8,
      marginBottom: 6,
      paddingVertical: 8,
    },
    navButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.7,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '90%',
      backgroundColor: cores.cartao,
      borderWidth: 1,
      borderColor: cores.borda,
      borderRadius: 18,
      overflow: 'hidden',
    },
    modalContent: {
      padding: 22,
    },
    modalTitle: {
      color: cores.texto,
      fontSize: 21 * escala,
      fontWeight: '600',
      marginBottom: 12,
    },
    menuItem: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: cores.divisor,
      paddingVertical: 12,
    },
    menuText: {
      flex: 1,
      color: cores.texto,
      fontSize: 16 * escala,
      lineHeight: 24 * escala,
    },
    logoutText: {
      flex: 1,
      color: cores.sair,
      fontSize: 16 * escala,
      lineHeight: 24 * escala,
      fontWeight: '600',
    },
    closeButton: {
      minHeight: 44,
      alignSelf: 'flex-end',
      justifyContent: 'center',
      paddingHorizontal: 12,
      marginTop: 12,
    },
    closeText: {
      color: cores.botao,
      fontSize: 16 * escala,
      lineHeight: 24 * escala,
      fontWeight: '600',
    },
    messageText: {
      color: cores.texto,
      fontSize: 16 * escala,
      lineHeight: 24 * escala,
    },
  });
}