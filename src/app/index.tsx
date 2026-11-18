// [integração] rota "/" = primeira tela que abre
// se tiver alguém logado manda pra Home (/inicio); se não, mostra o Login da Nicole (P01)
// (o modo de revisão local, quando ligado no .env.local, abre a lista de telas pra testar)
// [entrada nova] agora a primeira tela pública é a "Conheça o FGRC-M" (pedido da equipe)
// e o Login da Nicole foi pra rota /entrar (src/app/entrar.tsx), aberto pelo botão "Entrar no FGRC-M"
// a conferência da sessão saiu daqui e foi pro SoSemLogin (src/components/so-sem-login.tsx), usado nas duas rotas
import RevisaoLocal from "@/features/integracao/RevisaoLocal";
import { SoSemLogin } from "@/components/so-sem-login";
import ConhecaScreen from "@/features/entrada/ConhecaScreen";
import { previewMode } from "@/lib/supabase";

// essa é a primeira página do app (rota /)
export default function IndexScreen() {
  // sem backend abre os atalhos, senão abre o fluxo de login que ja existia
  if (previewMode) return <RevisaoLocal />;
  // sem login (ou conta ainda não liberada) vê a apresentação; logado e liberado vai pra Home
  return (
    <SoSemLogin>
      <ConhecaScreen />
    </SoSemLogin>
  );
}
