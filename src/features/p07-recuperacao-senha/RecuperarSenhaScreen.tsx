// usa estados pra guardar o email erros e carregamento
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FgrcButton, FormField, Notice, OrangeLink, Page } from '@/components/fgrc-ui';

// essas funções são passadas por quem abre a tela
export type RecuperarSenhaProps = {
  // define o que acontece quando vc clica em Voltar para login
  onBackToLogin: () => void;
  // manda o email validado pra tela de verificação
  onRequestSuccess: (email: string) => void;
  // essa função opcional vai servir pro envio real quando o backend existir
  requestReset?: (email: string) => Promise<void>;
  initialEmail?: string;
};

// essa é a tela 02 do protótipo (recuperar senha)
export default function RecuperarSenhaScreen({ onBackToLogin, onRequestSuccess, requestReset, initialEmail = '' }: RecuperarSenhaProps) {
  // guarda o email que vc escreveu
  const [email, setEmail] = useState(initialEmail);
  // guarda o erro pra mostrar na tela quando algo estiver errado
  const [error, setError] = useState('');
  // evita vários cliques enquanto alguma solicitação ta acontecendo
  const [loading, setLoading] = useState(false);

  // essa função roda quando vc clica em Enviar instruções
  async function sendInstructions() {
    // se ja ta enviando não deixa repetir a ação
    if (loading) return;
    // tira espaços sobrando e padroniza o email em minúsculo
    const normalized = email.trim().toLowerCase();
    // se não digitou nada mostra um erro
    if (!normalized) {
      setError('Informe seu e-mail institucional.');
      return;
    }
    // confere o formato básico do email (não verifica se ele existe de verdade)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }
    setError('');
    // só chama o backend se alguém conectar a função de envio
    if (requestReset) {
      setLoading(true);
      // espera o pedido de recuperação terminar antes de seguir
      try { await requestReset(normalized); }
      catch { setError('Não foi possível solicitar a recuperação. Tente novamente.'); setLoading(false); return; }
      setLoading(false);
    }
    // se passou na validação abre a próxima etapa
    onRequestSuccess(normalized);
  }

  // mostra os campos e os botões da tela 02
  return (
    <Page
      title="Recuperar senha"
      subtitle="Informe seu e-mail institucional para receber as instruções de redefinição de senha."
      onBack={onBackToLogin}
    >
      {/* organiza o formulário em uma coluna */}
      <View style={styles.content}>
        {/* campo do email institucional com mensagem de erro */}
        <FormField
          label="E-mail institucional"
          email
          value={email}
          onChangeText={value => { setEmail(value); setError(''); }}
          placeholder="Digite seu e-mail institucional..."
          error={error}
        />
        {/* botão que chama a validação ou envio de instruções */}
        <FgrcButton label={loading ? 'Aguarde...' : 'Enviar instruções'} disabled={loading} onPress={() => { void sendInstructions(); }} />
        {/* devolve o fluxo pro login quando ele estiver integrado */}
        <OrangeLink label="Voltar para login" onPress={onBackToLogin} />
        {/* mostra o aviso de demonstração (pq não tem envio real ainda) */}
        {!requestReset ? (
          <Notice message="Modo demonstrativo: o e-mail será validado e a próxima tela será aberta, mas nenhuma mensagem será enviada até a integração da autenticação." />
        ) : null}
      </View>
    </Page>
  );
}

// só da um espacinho no começo do formulário
const styles = StyleSheet.create({ content: { marginTop: 16 } });
