// [entrada nova] /sobre foi a primeira versão da apresentação (aberta pelo Login na 1.2.0 de teste)
// agora a apresentação é a própria página inicial ("/"), então aqui só redireciona
// (assim um link antigo pra /sobre não quebra e não fica uma tela repetida)
import { Redirect } from 'expo-router';

export default function Sobre() {
  return <Redirect href="/" />;
}
