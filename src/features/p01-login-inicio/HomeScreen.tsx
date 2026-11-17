import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
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
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Preencher pela fonte real das avaliações quando ela for integrada.
  const [dados] = useState<DadosInicio>(dadosIniciais);

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

  async function sair() {
    if (saindo) return;

    setSaindo(true);

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

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#11558B"
          accessibilityLabel="Verificando sessão"
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
                          ? '#C62828'
                          : '#B87512'
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
                color="#111111"
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
                color="#111111"
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
                  color={selecionado ? '#FF8C28' : '#111111'}
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
            <Text style={styles.modalTitle}>Mais</Text>

            <Pressable
              accessibilityRole="button"
              style={styles.menuItem}
              onPress={() => abrirFuncionalidade('Meu perfil')}
            >
              <Ionicons name="person-outline" size={23} color="#17263E" />
              <Text style={styles.menuText}>Meu perfil</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={styles.menuItem}
              onPress={() => abrirFuncionalidade('Configurações')}
            >
              <Ionicons name="settings-outline" size={23} color="#17263E" />
              <Text style={styles.menuText}>Configurações</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={styles.menuItem}
              onPress={() =>
                abrirFuncionalidade('Privacidade e termos')
              }
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color="#17263E"
              />
              <Text style={styles.menuText}>Privacidade e termos</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={saindo}
              accessibilityState={{ disabled: saindo, busy: saindo }}
              style={styles.menuItem}
              onPress={() => void sair()}
            >
              <Ionicons name="log-out-outline" size={23} color="#B42318" />
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
            <Text style={styles.messageText}>{mensagem}</Text>

            <Pressable
              accessibilityRole="button"
              style={styles.closeButton}
              onPress={() => setMensagem('')}
            >
              <Text style={styles.closeText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  loading: {
    flex: 1,
    backgroundColor: '#F5F8FC',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#17263E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#465B76',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#52647C',
    borderRadius: 18,
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#17263E',
    lineHeight: 25,
    marginBottom: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
    marginTop: 7,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#FF8C28',
  },
  progressText: {
    color: '#465B76',
    fontSize: 13,
    marginBottom: 8,
  },
  continueButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#11558B',
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.55,
  },
  sectionTitle: {
    color: '#17263E',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  orangeLine: {
    width: 58,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#FF8C28',
    marginTop: 2,
    marginBottom: 20,
  },
  summaryText: {
    color: '#17263E',
    fontSize: 15,
    lineHeight: 24,
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
    color: '#465B76',
    fontSize: 14,
    lineHeight: 22,
  },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  attentionText: {
    flex: 1,
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#52647C',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
    minHeight: 78,
    gap: 4,
  },
  quickText: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 21,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
  },
  modalTitle: {
    color: '#17263E',
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EDF5',
  },
  menuText: {
    flex: 1,
    color: '#17263E',
    fontSize: 16,
  },
  logoutText: {
    color: '#B42318',
    fontSize: 16,
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
    color: '#11558B',
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    color: '#17263E',
    fontSize: 16,
    lineHeight: 24,
  },
});