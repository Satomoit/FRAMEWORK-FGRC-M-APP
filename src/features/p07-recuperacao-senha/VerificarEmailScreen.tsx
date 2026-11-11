// o estado controla o aviso de reenvio e se ta carregando
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice, OrangeLink, Page } from '@/components/fgrc-ui';

// a tela recebe o email e as funções dos botões de navegação
type Props = {
  email: string;
  onBackToLogin: () => void;
  onEditEmail: () => void;
  // quando integrar com autenticação isso vai reenviar a solicitação de verdade
  resendReset?: (email: string) => Promise<void>;
  // isso pode abrir o fluxo P08 no futuro (não implementa P08 aqui)
  onOpenResetLink?: () => void;
};

// essa é a tela 03 do protótipo (verifique seu email)
export default function VerificarEmailScreen({ email, onBackToLogin, onEditEmail, resendReset, onOpenResetLink }: Props) {
  // pega as cores do tema atual
  const { colors } = useFgrcTheme();
  // evita clicar em reenviar várias vezes ao mesmo tempo
  const [busy, setBusy] = useState(false);
  // guarda o recado que aparece embaixo dos botões
  const [notice, setNotice] = useState('');

  // roda quando vc tenta reenviar as instruções
  async function resend() {
    if (busy) return;
    // sem backend explica que não mandou email nenhum
    if (!resendReset) {
      setNotice('A opção de reenvio foi acionada, mas nesta prévia não há serviço de e-mail conectado. Nenhuma mensagem foi enviada.');
      return;
    }
    // trava o botão até terminar o pedido de reenvio
    setBusy(true);
    // quando existir integração tenta reenviar pro email recebido
    try { await resendReset(email); setNotice('Solicitação de reenvio realizada. Se o endereço estiver cadastrado, verifique sua caixa de entrada.'); }
    catch { setNotice('Não foi possível reenviar as instruções. Tente novamente.'); }
    // libera o botão mesmo se o reenvio der erro
    finally { setBusy(false); }
  }

  // monta mensagem ícone e botões da tela 03
  return (
    <Page onBack={onEditEmail}>
      {/* parte principal da tela com ícone e explicação */}
      <View style={styles.hero}>
        <View style={[styles.mailCircle, { backgroundColor: colors.iconBackground }]}>
          <Text style={[styles.mailSymbol, { color: colors.blue }]}>✉</Text>
        </View>
        {/* titulo principal da tela */}
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Verifique seu e-mail</Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          Se o endereço informado estiver cadastrado, você receberá instruções para redefinir sua senha. Verifique também a pasta de spam.
        </Text>
        {/* mostra o email que vc digitou na etapa anterior */}
        <Text style={[styles.email, { color: colors.text }]}>{email}</Text>
      </View>
      {/* bloco com reenvio correção e retorno */}
      <View style={styles.actions}>
        <FgrcButton label={busy ? 'Aguarde...' : 'Enviar e-mail novamente'} disabled={busy} onPress={() => { void resend(); }} />
        <OrangeLink label="Corrigir e-mail" onPress={onEditEmail} />
        <OrangeLink label="Voltar para login" onPress={onBackToLogin} />
        {/* mostra o resultado da tentativa de reenvio */}
        {notice ? <Notice message={notice} onClose={() => setNotice('')} /> : null}
        {!resendReset ? <Notice message="Demonstração: nenhum e-mail real foi enviado nesta etapa." /> : null}
      </View>
      {/* esse link é só demonstrativo (a redefinição de senha pertence à P08) */}
      <Pressable
        accessibilityRole="button"
        style={styles.simulateLink}
        onPress={() => onOpenResetLink ? onOpenResetLink() : setNotice('A abertura do link de redefinição pertence à P08 (telas 04 e 05). Essa etapa ainda precisa ser integrada.')}
      >
        <Text style={[styles.simulateText, { color: colors.blue }]}>Simular abertura do link do e-mail →</Text>
      </Pressable>
    </Page>
  );
}

// tamanhos e espaçamentos da tela de verificação
const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 20 },
  mailCircle: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', marginBottom: 23 },
  mailSymbol: { fontSize: 34, lineHeight: 43 },
  title: { fontSize: 29, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 25, textAlign: 'center' },
  email: { marginTop: 14, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  actions: { marginTop: 32 },
  simulateLink: { alignSelf: 'center', padding: 12, marginTop: 32 },
  simulateText: { fontSize: 13, fontWeight: '600', textDecorationLine: 'underline', textAlign: 'center' },
});
