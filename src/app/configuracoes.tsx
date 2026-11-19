// [integração] rota /configuracoes = tela 22 da Nicole (P11). Só aponta pra tela dela
// [integração 19/11] agora passa o "Rever tutorial": marca o pedido e volta pra Home, que abre o tutorial guiado
// (o tutorial roda na Home pq é lá que ficam os botões que ele ilumina)
import { router, type Href } from 'expo-router';

import { pedirParaReverTutorial } from '@/features/integracao/TutorialInicial';
import ConfiguracoesScreen from '@/features/p11-configuracoes/ConfiguracoesScreen';

export default function Configuracoes() {
  return (
    <ConfiguracoesScreen
      onReverTutorial={() => {
        pedirParaReverTutorial();
        // navigate volta pra Home que já ta aberta embaixo (não empilha outra)
        router.navigate('/inicio' as Href);
      }}
    />
  );
}
