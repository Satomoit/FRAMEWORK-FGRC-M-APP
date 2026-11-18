// [entrada nova] rota /entrar = tela de Login da Nicole (P01)
// antes o Login ficava em "/", mas agora "/" é a página Conheça o FGRC-M
// quem já está logado e liberado pula direto pra Home (mesma regra da página inicial)
import { SoSemLogin } from '@/components/so-sem-login';
import LoginScreen from '@/features/p01-login-inicio/LoginScreen';

export default function Entrar() {
  return (
    <SoSemLogin>
      <LoginScreen />
    </SoSemLogin>
  );
}
