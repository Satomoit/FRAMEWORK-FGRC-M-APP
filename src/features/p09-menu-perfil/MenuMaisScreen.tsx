// guarda avisos e a confirmação de saída
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, MenuOption, Notice, Page } from '@/components/fgrc-ui';

// define as ações que o menu pode pedir pras outras partes do app
type Props = {
  // abre Meu perfil (essa parte é sua)
  onOpenProfile: () => void;
  // link pra Configurações (P11 vai conectar depois)
  onOpenSettings?: () => void;
  // link pra política de privacidade quando o grupo tiver o conteúdo
  onOpenPrivacy?: () => void;
  // link pro logout real quando tiver autenticação
  onSignOut?: () => void | Promise<void>;
};

// essa é a tela 17 do protótipo (menu Mais)
export default function MenuMaisScreen({ onOpenProfile, onOpenSettings, onOpenPrivacy, onSignOut }: Props) {
  // usa as cores do tema atual
  const { colors } = useFgrcTheme();
  // guarda os avisos dos botões que ainda dependem do grupo
  const [notice, setNotice] = useState('');
  // controla se a confirmação de sair fica visível
  const [confirmExit, setConfirmExit] = useState(false);

  // desenha as opções do menu Mais
  return (
    <Page title="Mais" subtitle="Conta e preferências">
      {/* cada cartão é clicável e pode ter uma ação diferente */}
      <View style={styles.options}>
        {/* essa opção abre a sua tela de perfil P09 */}
        <MenuOption title="Meu perfil" subtitle="Seus dados e prefeitura" symbol="profile" onPress={onOpenProfile} />
        {/* mantém o botão do Figma mas não cria a tela da P11 */}
        <MenuOption
          title="Configurações"
          subtitle="Aparência e acessibilidade"
          symbol="gear"
          onPress={() => onOpenSettings ? onOpenSettings() : setNotice('Configurações será conectada à funcionalidade P11. Nenhuma tela de configurações foi criada nesta entrega.')}
        />
        {/* por enquanto avisa que o conteúdo oficial ainda não foi definido */}
        <MenuOption
          title="Privacidade e termos"
          subtitle="Políticas e condições de uso"
          symbol="shield"
          onPress={() => onOpenPrivacy ? onOpenPrivacy() : setNotice('As políticas e condições de uso serão disponibilizadas quando o grupo definir o conteúdo e o destino deste botão.')}
        />
      </View>

      {/* botão de sair (mostra confirmação antes de qualquer ação) */}
      <View style={styles.exit}>
        <FgrcButton label="↪  Sair da conta" variant="danger" onPress={() => { setNotice(''); setConfirmExit(true); }} />
      </View>

      {/* mostra os avisos se vc clicar nos itens sem integração */}
      {notice ? <Notice message={notice} onClose={() => setNotice('')} /> : null}
      {/* só abre a confirmação quando vc clicar em Sair da conta */}
      {confirmExit ? (
        <View style={[styles.confirm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.confirmTitle, { color: colors.text }]}>Sair da conta?</Text>
          <Text style={[styles.confirmBody, { color: colors.muted }]}>
            {onSignOut
              ? 'Deseja encerrar sua sessão agora?'
              : 'Nesta prévia não existe uma sessão autenticada para encerrar. O botão ficará conectado ao login quando o grupo integrar a autenticação.'}
          </Text>
          {/* aqui ficam os botões de cancelar ou confirmar a saída */}
          <View style={styles.confirmActions}>
            <View style={{ flex: 1 }}><FgrcButton label="Cancelar" variant="outlined" onPress={() => setConfirmExit(false)} /></View>
            {/* só faz logout de verdade quando essa função for conectada */}
            {onSignOut ? (
              <View style={{ flex: 1 }}><FgrcButton label="Sair" variant="danger" onPress={() => { setConfirmExit(false); if (onSignOut) void onSignOut(); }} /></View>
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setConfirmExit(false)} style={styles.okLink}>
                <Text style={[styles.okText, { color: colors.blue }]}>Entendi</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}
    </Page>
  );
}

// esses estilos organizam os cartões e a confirmação de saída
const styles = StyleSheet.create({
  options: { marginTop: 0 },
  exit: { marginTop: 5 },
  confirm: { marginTop: 18, padding: 18, borderRadius: 14, borderWidth: 1 },
  confirmTitle: { fontSize: 18, fontWeight: '700', marginBottom: 7 },
  confirmBody: { fontSize: 14, lineHeight: 21, marginBottom: 17 },
  confirmActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  okLink: { flex: 1, minHeight: 52, justifyContent: 'center', alignItems: 'center' },
  okText: { fontWeight: '700', fontSize: 15 },
});
