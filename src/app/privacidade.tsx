// [integração] tela "Privacidade e termos" (prevista no diagrama de telas e no menu Mais da P09)
// o texto descreve o que o app faz DE VERDADE com os dados hoje (conferido no código e no banco)
// não promete nada que o app não faz. O grupo ainda precisa revisar e aprovar a redação final
// abre sem login também (dá pra ler antes de pedir acesso)
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { Page } from '@/components/fgrc-ui';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

// cada bloco = um título e alguns parágrafos curtos (linguagem simples, sem termo técnico)
const SECOES: { titulo: string; textos: string[] }[] = [
  {
    titulo: 'O que é o FGRC-M',
    textos: [
      'O FGRC-M é um aplicativo de autoavaliação de riscos cibernéticos para prefeituras, feito como projeto acadêmico da PUC Minas. Ele está em fase de testes.',
      'Os resultados servem para orientar a prefeitura. Eles não substituem uma auditoria nem uma análise feita por especialistas.',
    ],
  },
  {
    titulo: 'O que fica só no seu aparelho',
    textos: [
      'As respostas das avaliações, o rascunho, o histórico, os resultados e os relatórios em PDF ficam guardados apenas no celular ou no navegador onde você usa o app. Eles não são enviados para a internet.',
      'Cada conta tem o seu próprio espaço no aparelho. Se outra pessoa entrar com outra conta no mesmo aparelho, ela não vê as suas avaliações.',
      'Se você desinstalar o app ou apagar os dados do navegador, essas informações são apagadas e não têm como ser recuperadas. Guarde os relatórios em PDF que forem importantes.',
    ],
  },
  {
    titulo: 'O que vai para o servidor',
    textos: [
      'Para a sua conta funcionar, ficam guardados no servidor do app (Supabase): nome completo, e-mail, prefeitura, município e estado. A senha é guardada pelo serviço de login de forma protegida; nem a equipe do FGRC-M consegue ver a sua senha. Se você recebeu uma senha provisória, o app pede para trocar no primeiro acesso.',
      'Quando você pede acesso, enviamos: nome, e-mail, prefeitura, município, estado, a data e se o pedido saiu do navegador ou do celular.',
      'Quando você fala com o suporte, enviamos: nome, e-mail, assunto e o texto que você escreveu. Nenhuma resposta de avaliação vai junto.',
    ],
  },
  {
    titulo: 'Quem pode ver esses dados',
    textos: [
      'Só a administração do FGRC-M vê os pedidos de acesso e as mensagens de suporte. Cada decisão da administração (aprovar, recusar, atender) fica registrada com o e-mail de quem decidiu e o horário.',
      'Outras prefeituras e outros usuários não veem os seus dados.',
    ],
  },
  {
    titulo: 'Seus direitos',
    textos: [
      'Você pode corrigir o seu nome e o seu e-mail em Mais › Meu perfil. Prefeitura, município e estado só a administração altera.',
      'Para pedir a exclusão da sua conta ou tirar dúvidas sobre os seus dados pessoais (Lei Geral de Proteção de Dados, Lei nº 13.709/2018), use Ajuda e suporte.',
    ],
  },
  {
    titulo: 'Regras de uso',
    textos: [
      'O acesso é pessoal e só é liberado depois que a administração confere o pedido. Não compartilhe a sua senha.',
      'A prefeitura é responsável pelas respostas que informa nas avaliações.',
    ],
  },
];

export default function Privacidade() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  const { colors } = useFgrcTheme();

  // volta pra tela anterior; se abriu direto pelo endereço, vai pro começo
  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));

  return (
    <Page title="Privacidade e termos" subtitle="Como o FGRC-M cuida dos seus dados." onBack={voltar}>
      {SECOES.map(s => (
        <View key={s.titulo} style={styles.secao}>
          <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text }]}>{s.titulo}</Text>
          {s.textos.map(t => (
            <Text key={t} style={[styles.texto, { color: colors.text }]}>{t}</Text>
          ))}
        </View>
      ))}
      <Text style={[styles.rodape, { color: colors.muted }]}>
        Versão de 18/11/2026. Texto em revisão pela equipe do projeto.
      </Text>
    </Page>
  );
}

const estilosBase = StyleSheet.create({
  secao: { marginBottom: 18 },
  titulo: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  texto: { fontSize: 15, lineHeight: 23, marginBottom: 8 },
  rodape: { fontSize: 13, marginTop: 4, marginBottom: 24 },
});
