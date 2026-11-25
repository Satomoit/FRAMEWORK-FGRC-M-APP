//[alteração — 23/11/2026] Incluídas as referências e as responsabilidades
// do usuário pelas informações fornecidas e pela conferência, guarda e
// compartilhamento do PDF, para esclarecer os cuidados com o relatório.
// Mantida a estrutura visual e a descrição existente do tratamento de dados.
// A redação final ainda precisa ser revisada e aprovada pelo grupo.

// [integração] tela "Privacidade e termos" (prevista no diagrama de telas e no menu Mais da P09)
// o texto descreve o que o app faz DE VERDADE com os dados hoje (conferido no código e no banco)
// não promete nada que o app não faz. O grupo ainda precisa revisar e aprovar a redação final
// abre sem login também (dá pra ler antes de pedir acesso)

// [integração 25/11] aqui a versão da Nicole (o comentário lá de cima, PR #8) foi juntada com a do main
// (que já tinha o tamanho do texto das Configurações) e o texto foi ampliado pra ficar parecido com a
// política de app grande, só que em linguagem simples (o público é prefeitura pequena)
// o que é da Nicole e continua aqui: as duas seções de responsabilidade (informações e PDF), a lista de
// Referências com link e os cuidados de redação dela ("pelo aplicativo", "servidor do FGRC-M" etc)
// o que entrou agora:
//   - resumo no começo e a divisão em duas partes: Política de Privacidade e Termos de Uso
//   - o que a LGPD manda informar pra pessoa (art. 9º): pra que serve cada dado, por quanto tempo fica,
//     quem responde, como falar com a equipe, com quem é compartilhado e os direitos (art. 18)
//   - onde os dados ficam (o servidor é fora do Brasil), segurança, incidente e as regras de uso
// cada frase foi conferida no código e no banco: a lista ta em docs/privacidade-e-termos-25-11-2026.md
// (se o app passar a coletar outra coisa, o teste tests/teste-privacidade.cjs avisa que o texto ficou velho)
// ATENÇÃO: é texto jurídico escrito pelo grupo, não por advogado. Tem que passar pelo orientador antes
import { useRouter, type Href } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { Page } from '@/components/fgrc-ui';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';
// [integração 25/11] os textos (resumo, política, termos e referências) agora moram em src/lib/termos-e-privacidade.ts
// pq os Termos de Uso também aparecem na leitura obrigatória da ativação da conta (um texto só, dois lugares)
import { POLITICA_DE_PRIVACIDADE, REFERENCIAS, RESUMO, TERMOS_DE_USO, VERSAO_DO_TEXTO, type Secao } from '@/lib/termos-e-privacidade';

export default function Privacidade() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  const { colors } = useFgrcTheme();

  // volta pra tela anterior; se abriu direto pelo endereço, vai pro começo
  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));

  // [integração 25/11] abre a tela de Ajuda e suporte (ela funciona sem login também)
  // é por lá que a pessoa pede acesso, correção ou exclusão dos dados dela
  const abrirSuporte = () => router.push('/suporte' as Href);

  // [integração 25/11] desenha uma lista de blocos (serve pra Política e pros Termos, é o mesmo desenho)
  const desenharSecoes = (secoes: Secao[]) =>
    secoes.map(s => (
      <View key={s.titulo} style={styles.secao}>
        <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text }]}>{s.titulo}</Text>
        {s.textos.map(t => (
          // item de lista ("• ...") fica um pouco pra dentro, o resto é parágrafo normal
          <Text key={t} style={[styles.texto, t.startsWith('• ') && styles.item, { color: colors.text }]}>{t}</Text>
        ))}
        {s.suporte ? (
          <Text
            accessibilityRole="link"
            accessibilityHint="Abre a tela de Ajuda e suporte."
            onPress={abrirSuporte}
            style={[styles.link, { color: colors.text }]}
          >
            Abrir Ajuda e suporte
          </Text>
        ) : null}
      </View>
    ));

  return (
    <Page title="Privacidade e termos" subtitle="Como o FGRC-M cuida dos seus dados e quais são as regras de uso." onBack={voltar}>
      <Text style={[styles.versao, { color: colors.muted }]}>Última atualização: {VERSAO_DO_TEXTO}</Text>

      {/* [integração 25/11] resumo dentro de uma caixa com borda (não depende de cor de fundo, então serve nos 4 temas) */}
      <View style={[styles.resumo, { borderColor: colors.border }]}>
        <Text accessibilityRole="header" style={[styles.titulo, { color: colors.text }]}>Resumo</Text>
        {RESUMO.map(t => (
          <Text key={t} style={[styles.texto, styles.item, { color: colors.text }]}>• {t}</Text>
        ))}
        <Text style={[styles.observacao, { color: colors.muted }]}>
          Este resumo ajuda a entender, mas não substitui o texto completo abaixo.
        </Text>
      </View>

      <Text accessibilityRole="header" style={[styles.parte, { color: colors.text, borderBottomColor: colors.border }]}>
        Política de Privacidade
      </Text>
      {desenharSecoes(POLITICA_DE_PRIVACIDADE)}

      <Text accessibilityRole="header" style={[styles.parte, { color: colors.text, borderBottomColor: colors.border }]}>
        Termos de Uso
      </Text>
      {desenharSecoes(TERMOS_DE_USO)}

      <Text accessibilityRole="header" style={[styles.parte, { color: colors.text, borderBottomColor: colors.border }]}>
        Referências
      </Text>
      <View style={styles.secao}>
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
        {/* [integração 25/11] tirado o "Texto em revisão pela equipe do projeto." (pedido da Josiane) */}
        Versão de {VERSAO_DO_TEXTO}.
      </Text>
    </Page>
  );
}

const estilosBase = StyleSheet.create({
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
  // [integração 25/11] o link ganhou espaço em cima e embaixo pra ficar mais fácil de acertar com o dedo
  link: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
    textDecorationLine: 'underline',
    paddingVertical: 8,
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
  // [integração 25/11] estilos novos: data no topo, caixa do resumo, título de cada parte e item de lista
  versao: {
    fontSize: 13,
    marginBottom: 12,
  },
  resumo: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 22,
  },
  observacao: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  parte: {
    fontSize: 21,
    fontWeight: '700',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginTop: 6,
    marginBottom: 14,
  },
  item: {
    paddingLeft: 12,
    marginBottom: 6,
  },
});
