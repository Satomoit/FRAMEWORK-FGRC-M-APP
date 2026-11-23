//[alteração — 23/11/2026] Incluídas as referências e as responsabilidades
// do usuário pelas informações fornecidas e pela conferência, guarda e
// compartilhamento do PDF, para esclarecer os cuidados com o relatório.
// Mantida a estrutura visual e a descrição existente do tratamento de dados.
// A redação final ainda precisa ser revisada e aprovada pelo grupo.

// [integração] Tela "Privacidade e termos", prevista no diagrama de telas
// e no menu Mais da P09. Também pode ser aberta sem login. 


import { useRouter, type Href } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { Page } from '@/components/fgrc-ui';

const SECOES: { titulo: string; textos: string[] }[] = [
  {
    titulo: 'O que é o FGRC-M',
    textos: [
      'O FGRC-M é um aplicativo de autoavaliação de riscos cibernéticos para prefeituras, feito como projeto acadêmico da PUC Minas. Ele está em fase de testes.',
      'Os resultados servem para orientar a prefeitura. Eles não substituem uma auditoria, uma certificação ou uma análise feita por especialistas.',
    ],
  },
  {
    titulo: 'O que fica só no seu aparelho',
    textos: [
      'As respostas das avaliações, o rascunho, o histórico e os resultados ficam guardados apenas no celular ou no navegador onde você usa o app. Essas informações não são enviadas ao servidor do FGRC-M.',
      'Cada conta tem o seu próprio espaço no aparelho. Se outra pessoa entrar com outra conta no mesmo aparelho, ela não vê as suas avaliações pelo aplicativo.',
      'Se você desinstalar o app ou apagar os dados do navegador, essas informações podem ser perdidas e não poderão ser recuperadas pelo FGRC-M. Exporte e guarde os relatórios em PDF que forem importantes.',
    ],
  },
  {
    titulo: 'O que vai para o servidor',
    textos: [
      'Para a sua conta funcionar, ficam guardados no servidor do app (Supabase): nome completo, e-mail, prefeitura, município e estado. A senha é guardada pelo serviço de login de forma protegida; nem a equipe do FGRC-M consegue ver a sua senha. Se você recebeu uma senha provisória, o app pede para trocar no primeiro acesso.',
      'Quando você pede acesso, enviamos: nome, e-mail, prefeitura, município, estado, a data e se o pedido saiu do navegador ou do celular.',
      'Quando você fala com o suporte, enviamos: nome, e-mail, assunto e o texto que você escreveu. As respostas das avaliações não são incluídas automaticamente. Não coloque senhas ou informações sigilosas na mensagem.',
    ],
  },
  {
    titulo: 'Quem pode ver esses dados',
    textos: [
      'Só a administração do FGRC-M vê os pedidos de acesso e as mensagens de suporte. Cada decisão da administração (aprovar, recusar, atender) fica registrada com o e-mail de quem decidiu e o horário.',
      'Outras prefeituras e outros usuários não têm acesso aos seus dados pelo aplicativo.',
    ],
  },
  {
    titulo: 'Sua responsabilidade pelas informações',
    textos: [
      'Você é responsável pela veracidade e atualização das informações que registra e deve ter autorização para responder em nome da prefeitura.',
      'Confira as respostas antes de concluir a avaliação. Informações incorretas ou incompletas podem comprometer os resultados e as recomendações.',
      'Não inclua senhas, credenciais ou dados pessoais e sigilosos que não sejam necessários à avaliação.',
    ],
  },
  {
    titulo: 'Sua responsabilidade pelo PDF',
    textos: [
      'O relatório em PDF é gerado com base nas respostas registradas. Você é responsável por conferir o conteúdo antes de utilizar ou compartilhar o documento.',
      'Após salvar ou exportar o PDF, você é responsável pela guarda, pelo uso, pelas cópias e pelo compartilhamento do arquivo sob seu controle.',
      'O relatório pode conter informações sobre riscos e fragilidades da prefeitura. Compartilhe apenas com pessoas autorizadas e evite deixar o arquivo em dispositivos, links ou canais públicos.',
      'O FGRC-M não controla o acesso às cópias salvas ou compartilhadas fora do aplicativo.',
      'Essas responsabilidades não afastam as obrigações legais de segurança e proteção de dados dos responsáveis pelo FGRC-M.',
    ],
  },
  {
    titulo: 'Seus direitos',
    textos: [
      'Você pode corrigir o seu nome e o seu e-mail em Mais › Meu perfil. Prefeitura, município e estado só a administração altera.',
      'Para pedir a exclusão da sua conta ou tirar dúvidas sobre os seus dados pessoais (Lei Geral de Proteção de Dados, Lei nº 13.709/2018), use Ajuda e suporte.',
      'A exclusão da conta não apaga as cópias dos relatórios em PDF que você já salvou ou compartilhou fora do aplicativo.',
    ],
  },
  {
    titulo: 'Regras de uso',
    textos: [
      'O acesso é pessoal e só é liberado depois que a administração confere o pedido. Não compartilhe a sua senha nem utilize a conta de outra pessoa.',
      'Use o aplicativo apenas para avaliações autorizadas. A prefeitura e o usuário responsável pelo preenchimento devem conferir as informações e avaliar as recomendações antes de tomar decisões.',
    ],
  },
];

const REFERENCIAS = [
  {
    titulo: 'NIST Cybersecurity Framework 2.0',
    descricao:
      'Orientações para compreender, avaliar e gerenciar riscos de segurança cibernética.',
    url: 'https://www.nist.gov/cyberframework',
  },
  {
    titulo: 'CIS Critical Security Controls',
    descricao:
      'Controles e boas práticas para melhorar a segurança dos sistemas e das informações.',
    url: 'https://www.cisecurity.org/controls',
  },
  {
    titulo: 'ISO/IEC 27001:2022',
    descricao:
      'Requisitos para um sistema de gestão da segurança da informação.',
    url: 'https://www.iso.org/standard/27001',
  },
  {
    titulo: 'Lei Geral de Proteção de Dados Pessoais',
    descricao:
      'Lei nº 13.709/2018, que trata da proteção de dados pessoais no Brasil.',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
  },
];

export default function Privacidade() {
  const router = useRouter();
  const { colors } = useFgrcTheme();

  const voltar = () =>
    router.canGoBack() ? router.back() : router.replace('/' as Href);

  return (
    <Page
      title="Privacidade e termos"
      subtitle="Como o FGRC-M cuida dos seus dados."
      onBack={voltar}
    >
      {SECOES.map(secao => (
        <View key={secao.titulo} style={styles.secao}>
          <Text
            accessibilityRole="header"
            style={[styles.titulo, { color: colors.text }]}
          >
            {secao.titulo}
          </Text>

          {secao.textos.map(texto => (
            <Text
              key={texto}
              style={[styles.texto, { color: colors.text }]}
            >
              {texto}
            </Text>
          ))}
        </View>
      ))}

      <View style={styles.secao}>
        <Text
          accessibilityRole="header"
          style={[styles.titulo, { color: colors.text }]}
        >
          Referências
        </Text>

        <Text style={[styles.texto, { color: colors.text }]}>
          Para consulta sobre segurança cibernética, gestão de riscos e
          proteção de dados:
        </Text>

        {REFERENCIAS.map(referencia => (
          <View key={referencia.url} style={styles.referencia}>
            <Text
              accessibilityRole="link"
              accessibilityLabel={`Abrir referência: ${referencia.titulo}`}
              accessibilityHint="Abre o site oficial no navegador."
              onPress={() => {
                void Linking.openURL(referencia.url).catch(() => {
                  // O endereço também fica visível para cópia manual.
                });
              }}
              style={[styles.link, { color: colors.text }]}
            >
              {referencia.titulo}
            </Text>

            <Text style={[styles.texto, { color: colors.text }]}>
              {referencia.descricao}
            </Text>

            <Text
              selectable
              style={[styles.endereco, { color: colors.muted }]}
            >
              {referencia.url}
            </Text>
          </View>
        ))}

        <Text style={[styles.texto, { color: colors.text }]}>
          A indicação dessas referências não significa que o aplicativo
          seja certificado ou aprovado pelas instituições citadas.
        </Text>
      </View>

      <Text style={[styles.rodape, { color: colors.muted }]}>
        Versão de 23/11/2026. Texto em revisão pela equipe do projeto.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  secao: {
    marginBottom: 18,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  texto: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 8,
  },
  referencia: {
    marginBottom: 16,
  },
  link: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  endereco: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  rodape: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 24,
  },
});