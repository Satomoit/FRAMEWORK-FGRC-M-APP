import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFgrcTheme } from "../../components/fgrc-colors";
import { FgrcButton, Notice, Page } from "../../components/fgrc-ui";
import { EIXOS_FGRC, TODAS_QUESTOES_FGRC } from "./questionarioData";
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';
// [integração 25/11] primeira letra maiúscula nas alternativas (as do eixo AWR começam com minúscula no formulário)
import { comLetraMaiuscula } from '@/lib/calcular-relatorio';

type QuestionarioScreenProps = {
  respostas: Record<string, number>;
  onResponder: (questaoId: string, valor: number) => void;
  onSalvarESair: () => void;
  // essa função pode precisar esperar o salvamento terminar
  onFinalizarAvaliacao: () => void | Promise<void>;
  onVoltarHome?: () => void;
  onVerResultados?: () => void;
};

type EtapaQuestionario = "respondendo" | "revisao" | "finalizada";

export default function QuestionarioScreen({
  respostas,
  onResponder,
  onSalvarESair,
  onFinalizarAvaliacao,
  onVoltarHome,
  onVerResultados,
}: QuestionarioScreenProps) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();

  const indiceInicial = TODAS_QUESTOES_FGRC.findIndex(
    (q) => respostas[q.id] === undefined,
  );
  const [indiceAtual, setIndiceAtual] = useState(
    indiceInicial >= 0 ? indiceInicial : 0,
  );
  const [etapa, setEtapa] = useState<EtapaQuestionario>("respondendo");

  const questaoAtual = TODAS_QUESTOES_FGRC[indiceAtual];
  const respostaSelecionada = respostas[questaoAtual.id];

  const totalQuestoes = TODAS_QUESTOES_FGRC.length;
  const respondidasCount = TODAS_QUESTOES_FGRC.filter(
    (q) => respostas[q.id] !== undefined,
  ).length;
  const pendentes = TODAS_QUESTOES_FGRC.filter(
    (q) => respostas[q.id] === undefined,
  );

  const irParaEixo = (eixoCodigo: string) => {
    const idx = TODAS_QUESTOES_FGRC.findIndex(
      (q) => q.eixoCodigo === eixoCodigo,
    );
    if (idx >= 0) {
      setIndiceAtual(idx);
    }
  };

  const irParaQuestaoId = (questaoId: string) => {
    const idx = TODAS_QUESTOES_FGRC.findIndex((q) => q.id === questaoId);
    if (idx >= 0) {
      setIndiceAtual(idx);
      setEtapa("respondendo");
    }
  };

  // [integração 25/11] cada etapa abaixo passa um valor diferente no rolarProTopoQuando
  // quando ele muda (trocou de pergunta ou de etapa) a Page volta a tela pro começo
  if (etapa === "finalizada") {
    return (
      <Page rolarProTopoQuando="finalizada">
        <View style={styles.finalizadaContainer}>
          <View
            style={[
              styles.successCircle,
              {
                backgroundColor: colors.infoBackground,
                borderColor: colors.success,
              },
            ]}
          >
            <Text style={[styles.successCheck, { color: colors.success }]}>
              ✓
            </Text>
          </View>

          <Text style={[styles.finalizadaTitle, { color: colors.text }]}>
            Avaliação finalizada!
          </Text>

          <View
            style={[
              styles.relatorioBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.relatorioBoxTitle, { color: colors.text }]}>
              Seu relatório
            </Text>
            <Text style={[styles.relatorioBoxBody, { color: colors.muted }]}>
              O relatório com os resultados, pontos de atenção e recomendações
              estará disponível na aba Resultados.
            </Text>
            <Text style={[styles.relatorioBoxHint, { color: colors.blue }]}>
              Aguarde o processamento dos resultados.
            </Text>
          </View>

          <View style={styles.finalizadaActions}>
            <FgrcButton
              label="Ver resultados"
              onPress={() => {
                if (onVerResultados) {
                  onVerResultados();
                } else {
                  onSalvarESair();
                }
              }}
            />
            <FgrcButton
              label="Voltar para Home"
              variant="outlined"
              onPress={() => {
                if (onVoltarHome) {
                  onVoltarHome();
                } else {
                  onSalvarESair();
                }
              }}
            />
          </View>
        </View>
      </Page>
    );
  }

  if (etapa === "revisao") {
    return (
      <Page
        title="Revisar avaliação"
        subtitle="Confira o andamento antes de finalizar."
        onBack={() => setEtapa("respondendo")}
        rolarProTopoQuando="revisao"
      >
        <View style={styles.resumoRow}>
          <View
            style={[
              styles.resumoBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.resumoNumero, { color: colors.success }]}>
              {respondidasCount}
            </Text>
            <Text style={[styles.resumoLabel, { color: colors.muted }]}>
              Respondidas
            </Text>
          </View>

          <View
            style={[
              styles.resumoBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.resumoNumero, { color: colors.orange }]}>
              {pendentes.length}
            </Text>
            <Text style={[styles.resumoLabel, { color: colors.muted }]}>
              Pendentes
            </Text>
          </View>
        </View>

        {pendentes.length > 0 ? (
          <View
            style={[
              styles.pendentesCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.pendentesTitle, { color: colors.text }]}>
              Questões pendentes
            </Text>
            <Text style={[styles.pendentesSubtitle, { color: colors.muted }]}>
              Ainda faltam respostas para estas questões:
            </Text>

            <View style={styles.pendentesList}>
              {pendentes.map((q) => (
                <Pressable
                  key={q.id}
                  onPress={() => irParaQuestaoId(q.id)}
                  style={[
                    styles.pendenteItem,
                    { borderTopColor: colors.divider },
                  ]}
                >
                  <View
                    style={[
                      styles.pendenteBadge,
                      { backgroundColor: colors.infoBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pendenteBadgeText,
                        { color: colors.orange },
                      ]}
                    >
                      {q.codigo}
                    </Text>
                  </View>
                  <Text
                    style={[styles.pendenteEixo, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {q.eixoNome}
                  </Text>
                  <Text style={[styles.pendenteLink, { color: colors.blue }]}>
                    Responder ›
                  </Text>
                </Pressable>
              ))}
            </View>

            <Notice
              kind="info"
              message="Responda às questões pendentes para finalizar."
            />
          </View>
        ) : (
          <Notice
            kind="success"
            message="Todas as questões foram respondidas. Você já pode finalizar a avaliação."
          />
        )}

        <View style={styles.revisaoActions}>
          <FgrcButton
            label="Finalizar avaliação"
            // [integração 19/11] verde = concluir (fica mais fácil de entender que é o passo final)
            variant="success"
            icon="checkmark-circle-outline"
            // só libera o botão quando todas as questões tiverem resposta
            disabled={pendentes.length > 0}
            onPress={async () => {
              try {
                // espera a função de salvar terminar antes de continuar
                // assim não mostra que finalizou se ainda tiver salvando
                await onFinalizarAvaliacao();

                // se deu tudo certo mostra a tela de avaliação finalizada
                setEtapa("finalizada");
              } catch (erro) {
                // se der algum problema não muda de tela
                // isso ajuda a conferir o erro no terminal
                console.error("erro ao finalizar a avaliação:", erro);
              }
            }}
          />
          <FgrcButton
            label="Voltar às questões"
            variant="outlined"
            onPress={() => setEtapa("respondendo")}
          />
        </View>
      </Page>
    );
  }

  return (
    // [integração 25/11] o id da pergunta muda no Próxima, no Anterior, nas abas dos eixos e no "Responder" da revisão
    <Page onBack={onSalvarESair} rolarProTopoQuando={`pergunta:${questaoAtual.id}`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eixosTabs}
      >
        {EIXOS_FGRC.map((eixo) => {
          const ativo = eixo.codigo === questaoAtual.eixoCodigo;
          return (
            <Pressable
              key={eixo.codigo}
              onPress={() => irParaEixo(eixo.codigo)}
              style={[
                styles.eixoTab,
                {
                  backgroundColor: ativo ? colors.blue : colors.surface,
                  borderColor: ativo ? colors.blue : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.eixoTabText,
                  { color: ativo ? colors.blueOnButton : colors.text },
                ]}
              >
                {eixo.codigo}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.headerMeta}>
        <View style={styles.eixoBadgeRow}>
          <View
            style={[
              styles.eixoPill,
              { backgroundColor: colors.iconBackground },
            ]}
          >
            <Text style={[styles.eixoPillText, { color: colors.blue }]}>
              {questaoAtual.eixoCodigo}
            </Text>
          </View>
          <Text style={[styles.eixoTitleText, { color: colors.text }]}>
            {questaoAtual.eixoNome}
          </Text>
        </View>

        <View style={styles.questaoSubRow}>
          <Text style={[styles.questaoCodigo, { color: colors.blue }]}>
            {questaoAtual.codigo}
          </Text>
          <Text style={[styles.questaoContagem, { color: colors.muted }]}>
            Questão {questaoAtual.numeroNoEixo} de {questaoAtual.totalNoEixo}{" "}
            (Geral: {indiceAtual + 1}/{totalQuestoes})
          </Text>
        </View>
      </View>

      <Text style={[styles.perguntaText, { color: colors.text }]}>
        {questaoAtual.pergunta}
      </Text>

      <View style={styles.alternativasList}>
        {questaoAtual.alternativas.map((alt) => {
          const selecionada = respostaSelecionada === alt.valor;
          return (
            <Pressable
              key={alt.valor}
              accessibilityRole="radio"
              accessibilityState={{ selected: selecionada }}
              onPress={() => onResponder(questaoAtual.id, alt.valor)}
              style={({ pressed }) => [
                styles.alternativaCard,
                {
                  backgroundColor: selecionada
                    ? colors.selected
                    : colors.surface,
                  borderColor: selecionada ? colors.blue : colors.border,
                  borderWidth: selecionada ? 2 : 1.25,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <View style={styles.alternativaHeader}>
                <View
                  style={[
                    styles.numeroBadge,
                    {
                      backgroundColor: selecionada
                        ? colors.blue
                        : colors.iconBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.numeroBadgeText,
                      {
                        color: selecionada ? colors.blueOnButton : colors.blue,
                      },
                    ]}
                  >
                    {alt.valor}
                  </Text>
                </View>
                <Text
                  style={[styles.alternativaTitulo, { color: colors.text }]}
                >
                  {alt.titulo}
                </Text>
              </View>
              <Text
                style={[styles.alternativaDescricao, { color: colors.muted }]}
              >
                {comLetraMaiuscula(alt.descricao)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.navButtonsRow}>
        <View style={styles.navButtonHalf}>
          <FgrcButton
            label="← Anterior"
            variant="outlined"
            disabled={indiceAtual === 0}
            onPress={() => setIndiceAtual((prev) => Math.max(0, prev - 1))}
          />
        </View>

        <View style={styles.navButtonHalf}>
          <FgrcButton
            label={
              indiceAtual === totalQuestoes - 1 ? "Revisar →" : "Próxima →"
            }
            onPress={() => {
              if (indiceAtual < totalQuestoes - 1) {
                setIndiceAtual((prev) => prev + 1);
              } else {
                setEtapa("revisao");
              }
            }}
          />
        </View>
      </View>

      <View style={styles.secondaryActions}>
        <FgrcButton
          label="Revisar avaliação"
          variant="outlined"
          onPress={() => setEtapa("revisao")}
        />

        <Pressable
          accessibilityRole="button"
          onPress={onSalvarESair}
          style={styles.salvarSairButton}
        >
          <Text style={[styles.salvarSairText, { color: colors.muted }]}>
            Salvar e sair
          </Text>
        </Pressable>
      </View>
    </Page>
  );
}

const estilosBase = StyleSheet.create({
  eixosTabs: {
    gap: 8,
    paddingBottom: 14,
  },
  eixoTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.25,
  },
  eixoTabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  headerMeta: {
    marginBottom: 14,
    gap: 8,
  },
  eixoBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eixoPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eixoPillText: {
    fontSize: 13,
    fontWeight: "800",
  },
  eixoTitleText: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  questaoSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questaoCodigo: {
    fontSize: 14,
    fontWeight: "800",
  },
  questaoContagem: {
    fontSize: 13,
    fontWeight: "500",
  },
  perguntaText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: 18,
  },
  alternativasList: {
    gap: 12,
    marginBottom: 22,
  },
  alternativaCard: {
    borderRadius: 14,
    padding: 15,
    gap: 8,
  },
  alternativaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  numeroBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  numeroBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  alternativaTitulo: {
    fontSize: 16,
    fontWeight: "700",
  },
  alternativaDescricao: {
    fontSize: 14,
    lineHeight: 20,
  },
  navButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  navButtonHalf: {
    flex: 1,
  },
  secondaryActions: {
    gap: 12,
    marginTop: 2,
  },
  salvarSairButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  salvarSairText: {
    fontSize: 15,
    fontWeight: "600",
  },
  resumoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  resumoBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.25,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  resumoNumero: {
    fontSize: 28,
    fontWeight: "800",
  },
  resumoLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  pendentesCard: {
    borderRadius: 16,
    borderWidth: 1.25,
    padding: 16,
    marginBottom: 18,
  },
  pendentesTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  pendentesSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  pendentesList: {
    marginBottom: 4,
  },
  pendenteItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  pendenteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pendenteBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  pendenteEixo: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  pendenteLink: {
    fontSize: 14,
    fontWeight: "700",
  },
  revisaoActions: {
    gap: 12,
    marginTop: 8,
  },
  finalizadaContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  successCheck: {
    fontSize: 40,
    fontWeight: "800",
  },
  finalizadaTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  relatorioBox: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.25,
    padding: 18,
    marginBottom: 24,
    gap: 8,
  },
  relatorioBoxTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  relatorioBoxBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  relatorioBoxHint: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  finalizadaActions: {
    width: "100%",
    gap: 12,
  },
});
