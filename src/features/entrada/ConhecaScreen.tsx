// [entrada nova] primeira página pública do app (rota "/"): Conheça o FGRC-M
// sequência: splash (logo) -> esta página -> Login (/entrar) -> app
// quem já está logado e liberado nem vê essa página: o SoSemLogin manda direto pra Home
// [entrada nova v2] a equipe achou a primeira versão com cara de documento (muitos títulos e parágrafos)
// agora o topo mostra só o essencial e as explicações ficam em cartões que abrem e fecham ("Conheça a ferramenta")
// os textos seguem a documentação acadêmica (docs/01 do repositório do grupo), a tela Privacidade e termos
// e o que o código faz de verdade (respostas só no aparelho, servidor só com conta, pedido e suporte)
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Image, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton } from '@/components/fgrc-ui';
import { OpcoesPublicas } from '@/features/entrada/OpcoesPublicas';
import { usePreferencias } from '@/features/p11-configuracoes/PreferenciasProvider';
import { NOME_DA_VERSAO } from '@/lib/versao';

type NomeDoIcone = ComponentProps<typeof Ionicons>['name'];

// nome oficial, igual ao README e ao docs/01 do repositório acadêmico (é "Municipal", no singular)
const NOME_COMPLETO = 'Framework de Gestão de Riscos Cibernéticos Municipal';

// cartões do "Conheça a ferramenta" (título curto + texto curto; o de dados tem link pra política completa)
type Cartao = { id: string; icone: NomeDoIcone; titulo: string; texto: string; linkPrivacidade?: boolean };
const CARTOES: Cartao[] = [
  {
    id: 'por-que',
    icone: 'bulb-outline',
    titulo: 'Por que o FGRC-M existe?',
    texto:
      'Muitas prefeituras, principalmente as pequenas, não têm equipe nem orçamento para uma consultoria de segurança digital. O FGRC-M ajuda a enxergar os riscos mais graves e a decidir por onde começar.',
  },
  {
    id: 'quem',
    icone: 'people-outline',
    titulo: 'Quem pode utilizar?',
    texto:
      'Equipes de TI, gestores e servidores que cuidam dos sistemas e dos dados da prefeitura. O acesso é pessoal e é liberado pela equipe do FGRC-M depois do pedido.',
  },
  {
    id: 'como',
    icone: 'list-outline',
    titulo: 'Como funciona?',
    texto:
      'Você responde 32 perguntas sobre a rotina da prefeitura, divididas em 11 temas, como senhas, cópias de segurança, rede e treinamento das equipes. Dá para salvar e continuar depois, e revisar ou mudar as respostas antes de finalizar.',
  },
  {
    id: 'final',
    icone: 'bar-chart-outline',
    titulo: 'O que recebo no final?',
    texto:
      'Um índice de exposição de 0 a 100 (quanto maior, mais exposta a prefeitura está), a situação de cada tema, os pontos que pedem mais atenção e recomendações com prioridade. Tudo isso pode ser baixado ou compartilhado em PDF.',
  },
  {
    id: 'dados',
    icone: 'lock-closed-outline',
    titulo: 'Como meus dados são tratados?',
    texto:
      'As respostas, os resultados e os relatórios ficam só no aparelho em que você usa o app; eles não vão para a internet. O PDF só sai do aparelho se você compartilhar. O servidor guarda apenas o necessário para a conta funcionar: nome, e-mail, prefeitura, município e estado, além dos pedidos de acesso e das mensagens de suporte.',
    linkPrivacidade: true,
  },
];

export default function ConhecaScreen() {
  const router = useRouter();
  const { colors, isDark } = useFgrcTheme();
  // no celular o texto cresce pela escala das Configurações (no navegador o app inteiro já aumenta junto)
  const { escalaFonte: f, preferencias } = usePreferencias();
  const { width } = useWindowDimensions();
  const [opcoesAbertas, setOpcoesAbertas] = useState(false);
  // quais cartões estão abertos (dá pra abrir mais de um)
  const [abertos, setAbertos] = useState<string[]>([]);
  // texto em cima do azul: no escuro com alto contraste o azul fica clarinho, então o texto vira preto (senão some)
  const sobreAzul = isDark && preferencias.altoContraste ? '#000000' : colors.blueOnButton;

  // todas as ações levam pras rotas que já existiam (nada de tela repetida)
  const ir = (rota: string) => router.push(rota as Href);

  // abre ou fecha um cartão; no celular a mudança de altura fica suave (no navegador só troca)
  function alternar(id: string) {
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAbertos((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  }

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.rolagem, { paddingHorizontal: width < 400 ? 18 : 28 }]}>
        <View style={styles.coluna}>
          {/* topo: logo, sigla, nome completo e uma frase do que o app faz */}
          <View style={styles.topo}>
            <Image
              source={require('../../../assets/images/logo-fgrcm.png')}
              style={styles.logo}
              resizeMode="contain"
              accessible
              accessibilityLabel="Escudo FGRC-M"
            />
            <Text accessibilityRole="header" style={[styles.sigla, { color: colors.blue, fontSize: 36 * f }]}>FGRC-M</Text>
            <View style={[styles.traco, { backgroundColor: colors.orange }]} />
            <Text style={[styles.nomeCompleto, { color: colors.text, fontSize: 17 * f, lineHeight: 24 * f }]}>{NOME_COMPLETO}</Text>
            <Text style={[styles.frase, { color: colors.muted, fontSize: 15 * f, lineHeight: 22 * f }]}>
              Autoavaliação de segurança digital para prefeituras: descubra onde estão os maiores riscos e o que melhorar primeiro.
            </Text>
            {/* o principal sobre privacidade fica sempre à vista (o resto está no cartão e na política completa) */}
            <View style={[styles.selo, { backgroundColor: colors.infoBackground, borderColor: colors.border }]}>
              <Ionicons name="phone-portrait-outline" size={16} color={isDark ? colors.text : colors.blue} />
              <Text style={[styles.seloTexto, { color: colors.text, fontSize: 13 * f }]}>As respostas da avaliação ficam só no seu aparelho</Text>
            </View>
          </View>

          {/* ação principal: abre o Login da Nicole (em /entrar) */}
          <Pressable
            accessibilityRole="button"
            onPress={() => ir('/entrar')}
            style={({ pressed }) => [styles.entrar, { backgroundColor: colors.blue }, pressed && styles.apertado]}
          >
            <Text style={[styles.entrarTexto, { color: sobreAzul, fontSize: 18 * f }]}>Entrar no FGRC-M</Text>
            <Ionicons name="arrow-forward" size={20} color={sobreAzul} />
          </Pressable>

          <SecaoDeAcesso titulo="Ainda não tem acesso?">
            <Text style={[styles.texto, { color: colors.muted, fontSize: 15 * f, lineHeight: 22 * f }]}>
              Para utilizar o FGRC-M, primeiro é necessário solicitar o acesso e aguardar a aprovação da equipe responsável.
            </Text>
            <View style={styles.botoes}>
              {/* formulário de pedido de acesso da Liz (P02) */}
              <FgrcButton label="Solicitar acesso" variant="outlined" onPress={() => ir('/solicitar-acesso')} />
            </View>
          </SecaoDeAcesso>

          <SecaoDeAcesso titulo="Já solicitou acesso?">
            <Text style={[styles.texto, { color: colors.muted, fontSize: 15 * f, lineHeight: 22 * f }]}>
              Consulte o andamento da sua solicitação ou ative sua conta após a aprovação.
            </Text>
            <View style={[styles.botoes, width >= 520 && styles.botoesLado]}>
              {/* lado a lado só quando cabe; no celular um embaixo do outro */}
              <View style={width >= 520 ? styles.botaoMetade : undefined}>
                <FgrcButton label="Acompanhar solicitação" variant="outlined" onPress={() => ir('/situacao-pedido')} />
              </View>
              <View style={width >= 520 ? styles.botaoMetade : undefined}>
                <FgrcButton label="Ativar acesso" variant="outlined" onPress={() => ir('/ativar-acesso')} />
              </View>
            </View>
          </SecaoDeAcesso>

          {/* "Conheça a ferramenta": cartões fechados que abrem com um toque (accordion) */}
          <Text accessibilityRole="header" style={[styles.tituloSecao, { color: colors.muted, fontSize: 13 * f }]}>
            CONHEÇA A FERRAMENTA
          </Text>
          <View style={[styles.lista, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            {CARTOES.map((cartao, i) => (
              <CartaoExpansivel
                key={cartao.id}
                cartao={cartao}
                primeiro={i === 0}
                aberto={abertos.includes(cartao.id)}
                onAlternar={() => alternar(cartao.id)}
                onAbrirPrivacidade={() => ir('/privacidade')}
              />
            ))}
          </View>

          {/* rodapé: suporte, privacidade e o botão de Opções (abre a janela por cima) */}
          <View style={[styles.rodape, { borderColor: colors.divider }]}>
            <LinkDoRodape icone="help-circle-outline" texto="Ajuda e suporte" onPress={() => ir('/suporte')} />
            <LinkDoRodape icone="document-text-outline" texto="Privacidade e termos" onPress={() => ir('/privacidade')} />
            <LinkDoRodape icone="settings-outline" texto="Opções" onPress={() => setOpcoesAbertas(true)} />
          </View>
          {/* [entrega] só o nome da versão de entrega; o número técnico (1.2.0) fica no app.json e no Mais */}
          <Text style={[styles.versao, { color: colors.muted, fontSize: 12 * f }]}>Versão {NOME_DA_VERSAO}</Text>
        </View>
      </ScrollView>

      <OpcoesPublicas visivel={opcoesAbertas} onFechar={() => setOpcoesAbertas(false)} />
    </SafeAreaView>
  );
}

// um cartão do accordion: ícone, título e seta; tocando abre o texto, tocando de novo fecha
// fica fora do componente principal pra não ser recriado a cada toque
function CartaoExpansivel({
  cartao,
  primeiro,
  aberto,
  onAlternar,
  onAbrirPrivacidade,
}: {
  cartao: Cartao;
  primeiro: boolean;
  aberto: boolean;
  onAlternar: () => void;
  onAbrirPrivacidade: () => void;
}) {
  const { colors, isDark } = useFgrcTheme();
  const { escalaFonte: f } = usePreferencias();
  // em tela estreita o texto usa a largura toda; em tela maior ele alinha com o título (depois do ícone)
  const { width } = useWindowDimensions();
  return (
    <View style={[!primeiro && styles.divisoria, { borderColor: colors.divider }]}>
      <Pressable
        accessibilityRole="button"
        // o leitor de tela fala se o cartão está aberto ou fechado
        accessibilityState={{ expanded: aberto }}
        // no navegador quem avisa o leitor de tela é o aria-expanded
        aria-expanded={aberto}
        accessibilityHint={aberto ? 'Toque para fechar' : 'Toque para ler'}
        onPress={onAlternar}
        style={({ pressed }) => [styles.cartaoTopo, pressed && { backgroundColor: colors.selected }]}
      >
        <View style={[styles.cartaoIcone, { backgroundColor: colors.iconBackground }]}>
          {/* no escuro o azul em cima do fundinho azul ficava apagado, então o ícone fica claro */}
          <Ionicons name={cartao.icone} size={18} color={isDark ? colors.text : colors.blue} />
        </View>
        <Text style={[styles.cartaoTitulo, { color: colors.text, fontSize: 15 * f }]}>{cartao.titulo}</Text>
        <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
      </Pressable>
      {aberto ? (
        <View style={[styles.cartaoCorpo, { paddingLeft: width < 400 ? 16 : 60 }]}>
          <Text style={[styles.texto, { color: colors.text, fontSize: 14.5 * f, lineHeight: 21 * f }]}>{cartao.texto}</Text>
          {cartao.linkPrivacidade ? (
            <Pressable accessibilityRole="link" onPress={onAbrirPrivacidade} style={styles.linkPolitica} hitSlop={8}>
              <Text style={[styles.linkPoliticaTexto, { color: colors.blue, fontSize: 14 * f }]}>Ler Privacidade e termos completos</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.blue} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// cartão das seções de acesso (título + conteúdo)
function SecaoDeAcesso({ titulo, children }: { titulo: string; children: ReactNode }) {
  const { colors } = useFgrcTheme();
  const { escalaFonte: f } = usePreferencias();
  return (
    <View style={[styles.secao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.secaoTitulo, { color: colors.text, fontSize: 18 * f }]}>{titulo}</Text>
      {children}
    </View>
  );
}

// item do rodapé com área de toque boa (pelo menos 44 de altura)
function LinkDoRodape({ icone, texto, onPress }: { icone: NomeDoIcone; texto: string; onPress: () => void }) {
  const { colors } = useFgrcTheme();
  const { escalaFonte: f } = usePreferencias();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.rodapeItem, pressed && styles.apertado]}
    >
      <Ionicons name={icone} size={18} color={colors.blue} />
      <Text style={[styles.rodapeTexto, { color: colors.blue, fontSize: 14 * f }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  rolagem: { flexGrow: 1, paddingTop: 28, paddingBottom: 32 },
  coluna: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  topo: { alignItems: 'center', marginBottom: 22 },
  logo: { width: 76, height: 76, marginBottom: 12 },
  sigla: { fontWeight: '800', letterSpacing: 0.5 },
  traco: { width: 52, height: 4, borderRadius: 2, marginTop: 6, marginBottom: 12 },
  nomeCompleto: { fontWeight: '700', textAlign: 'center' },
  frase: { textAlign: 'center', marginTop: 8, maxWidth: 480 },
  selo: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 14, maxWidth: '100%' },
  seloTexto: { flexShrink: 1, fontWeight: '600' },
  texto: {},
  entrar: { minHeight: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 18 },
  entrarTexto: { fontWeight: '700' },
  apertado: { opacity: 0.82 },
  secao: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 14 },
  secaoTitulo: { fontWeight: '700', marginBottom: 6 },
  botoes: { gap: 10, marginTop: 14 },
  botoesLado: { flexDirection: 'row' },
  botaoMetade: { flexGrow: 1, flexBasis: 0 },
  tituloSecao: { fontWeight: '700', letterSpacing: 0.8, marginTop: 10, marginBottom: 8, marginLeft: 4 },
  lista: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 18 },
  divisoria: { borderTopWidth: 1 },
  cartaoTopo: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  cartaoIcone: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cartaoTitulo: { flex: 1, fontWeight: '600' },
  cartaoCorpo: { paddingHorizontal: 16, paddingBottom: 16 },
  linkPolitica: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start' },
  linkPoliticaTexto: { fontWeight: '700' },
  rodape: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, rowGap: 4, borderTopWidth: 1, paddingTop: 12 },
  rodapeItem: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  rodapeTexto: { fontWeight: '600' },
  versao: { textAlign: 'center', marginTop: 8 },
});
