// [integração P07] rota pública do "Esqueci minha senha" (telas 02 e 03)
// usa as duas telas da P07 sem mudar o visual, só passando a função de envio real do Supabase
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import RecuperarSenhaScreen from '@/features/p07-recuperacao-senha/RecuperarSenhaScreen';
import VerificarEmailScreen from '@/features/p07-recuperacao-senha/VerificarEmailScreen';
import { problemaNoEmailInstitucional } from '@/lib/email-institucional';
import { supabase } from '@/lib/supabase';

// pra onde o link do e-mail leva a pessoa (a tela 04 da P08)
// no navegador usa o endereço atual (ex: http://localhost:8081), no celular usa o link do app
// esse endereço precisa estar liberado no painel: Authentication > URL Configuration > Redirect URLs
function enderecoDoLink() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/criar-nova-senha`;
  }
  return Linking.createURL('/criar-nova-senha');
}

// pede pro Supabase mandar o e-mail de recuperação
// se der erro, joga uma mensagem simples (a tela da P07 mostra ela embaixo do campo)
async function pedirRecuperacao(email: string) {
  // antes de gastar um envio de e-mail, confere se o endereço é de prefeitura
  // (o limite de e-mails por hora do Supabase é pequeno, então não vale gastar com e-mail errado)
  const problema = problemaNoEmailInstitucional(email);
  if (problema) throw new Error(problema);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: enderecoDoLink(),
  });
  if (!error) return;

  // limite de envio do Supabase (o serviço de e-mail padrão manda poucos por hora)
  if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
    throw new Error('Muitos pedidos em pouco tempo. Espere alguns minutos e tente de novo.');
  }
  // o serviço de e-mail padrão do Supabase só entrega pra quem é da equipe do projeto
  if (/not authorized/i.test(error.message)) {
    throw new Error('O envio de e-mail ainda não está liberado para este endereço. Fale com a administração do FGRC-M.');
  }
  throw new Error('Não foi possível enviar o e-mail agora. Verifique a internet e tente de novo.');
}

export default function RecuperarSenha() {
  const router = useRouter();
  // começa no formulário (tela 02) e depois mostra a confirmação (tela 03)
  const [etapa, setEtapa] = useState<'pedir' | 'verificar'>('pedir');
  const [email, setEmail] = useState('');

  // voltar sempre leva pro login (mesmo se a pessoa abriu essa página direto pelo endereço)
  const voltarLogin = () => router.replace('/');

  if (etapa === 'verificar') {
    return (
      <VerificarEmailScreen
        email={email}
        onBackToLogin={voltarLogin}
        onEditEmail={() => setEtapa('pedir')}
        resendReset={pedirRecuperacao}
      />
    );
  }

  return (
    <RecuperarSenhaScreen
      initialEmail={email}
      onBackToLogin={voltarLogin}
      requestReset={pedirRecuperacao}
      onRequestSuccess={(emailInformado) => {
        setEmail(emailInformado);
        setEtapa('verificar');
      }}
    />
  );
}
