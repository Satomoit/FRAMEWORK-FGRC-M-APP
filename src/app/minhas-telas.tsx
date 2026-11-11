// o useState guarda em qual tela vc ta e os dados usados na previa
import { useState } from 'react';
// aqui vem as peças visuais e a largura da tela (pra adaptar no celular e no pc)
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFgrcTheme } from '@/components/fgrc-colors';
import MenuMaisScreen from '@/features/p09-menu-perfil/MenuMaisScreen';
import PerfilScreen, { DEMO_PROFILE, type ProfileData } from '@/features/p09-menu-perfil/PerfilScreen';
import RecuperarSenhaScreen from '@/features/p07-recuperacao-senha/RecuperarSenhaScreen';
import VerificarEmailScreen from '@/features/p07-recuperacao-senha/VerificarEmailScreen';

// só permite essas quatro telas (assim não aparece nenhuma tela dos outros)
type Screen = 'mais' | 'perfil' | 'recuperar' | 'verificar';

// essa rota junta somente P07 e P09 (é um lugar temporário pra vc testar)
export default function MinhasTelas() {
  // começa na tela Mais e muda quando vc clica nos botões
  const [screen, setScreen] = useState<Screen>('mais');
  // guarda o email digitado na recuperação de senha
  const [email, setEmail] = useState('');
  // dados do perfil ficam na memoria da tela (sem salvar no servidor)
  const [profile, setProfile] = useState<ProfileData>(DEMO_PROFILE);
  // puxa as cores certas do tema claro ou escuro
  const { colors } = useFgrcTheme();
  // descobre a largura da janela (pra não apertar texto demais)
  const { width } = useWindowDimensions();
  // quando a janela é pequena o texto dos botões diminui um pouco
  const small = width < 410;

  // marca qual das duas partes vc ta vendo no seletor
  const isProfile = screen === 'mais' || screen === 'perfil';

  // monta a pagina de teste sem trocar as telas do restante do grupo
  return (
    <SafeAreaView edges={Platform.OS === 'web' ? [] : ['top']} style={[styles.root, { backgroundColor: colors.background }]}>
      {/* essa faixa segura os botões de troca entre P07 e P09 (sem cobrir o menu do Expo) */}
      <View style={[styles.previewHeader, {
        paddingTop: Platform.OS === 'web' ? 83 : 10,
        backgroundColor: colors.background,
        borderBottomColor: colors.divider,
      }]}>
        <View style={[styles.switcher, { maxWidth: 610 }]}>
          {/* esse botão leva vc de volta pra parte P09 */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isProfile }}
            onPress={() => setScreen('mais')}
            style={({ pressed }) => [styles.switchButton, {
              backgroundColor: isProfile ? colors.selected : colors.surface,
              borderColor: isProfile ? colors.blue : colors.border,
              opacity: pressed ? 0.85 : 1,
            }]}
          >
            <Text style={[styles.switchText, { fontSize: small ? 12 : 14, color: colors.text }]}>P09 · Mais / Perfil</Text>
          </Pressable>
          {/* esse outro botão abre a recuperação de senha P07 */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !isProfile }}
            onPress={() => setScreen('recuperar')}
            style={({ pressed }) => [styles.switchButton, {
              backgroundColor: !isProfile ? colors.selected : colors.surface,
              borderColor: !isProfile ? colors.blue : colors.border,
              opacity: pressed ? 0.85 : 1,
            }]}
          >
            <Text style={[styles.switchText, { fontSize: small ? 12 : 14, color: colors.text }]}>P07 · Recuperar senha</Text>
          </Pressable>
        </View>
      </View>

      {/* aqui aparece só a tela escolhida no momento */}
      <View style={styles.screen}>
        {/* quando ta em Mais mostra os atalhos e opções do perfil */}
        {screen === 'mais' ? <MenuMaisScreen onOpenProfile={() => setScreen('perfil')} /> : null}
        {/* quando vc abre Meu perfil passa os dados editáveis pra tela */}
        {screen === 'perfil' ? (
          <PerfilScreen profile={profile} onSaveProfile={setProfile} onBack={() => setScreen('mais')} />
        ) : null}
        {/* aqui vc informa o email e segue pra verificação */}
        {screen === 'recuperar' ? (
          <RecuperarSenhaScreen
            initialEmail={email}
            onBackToLogin={() => setScreen('mais')}
            onRequestSuccess={nextEmail => { setEmail(nextEmail); setScreen('verificar'); }}
          />
        ) : null}
        {/* aqui vc vê a mensagem sobre a recuperação e pode voltar */}
        {screen === 'verificar' ? (
          <VerificarEmailScreen
            email={email}
            onEditEmail={() => setScreen('recuperar')}
            onBackToLogin={() => setScreen('mais')}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// esses estilos controlam tamanho e espaçamento (não mudam a lógica)
const styles = StyleSheet.create({
  root: { flex: 1 },
  // essa borda e espaçamento deixam a faixa de teste separada do conteúdo
  previewHeader: { borderBottomWidth: 1, paddingBottom: 15, paddingHorizontal: 16 },
  // organiza os dois botões lado a lado
  switcher: { width: '100%', alignSelf: 'center', flexDirection: 'row', gap: 10 },
  // deixa os botões responsivos e fáceis de clicar
  switchButton: { flex: 1, borderWidth: 1.1, borderRadius: 10, paddingHorizontal: 9, minHeight: 43, alignItems: 'center', justifyContent: 'center' },
  switchText: { textAlign: 'center', fontWeight: '600' },
  // faz a tela escolhida ocupar o resto do espaço disponível
  screen: { flex: 1, minHeight: 0 },
});
