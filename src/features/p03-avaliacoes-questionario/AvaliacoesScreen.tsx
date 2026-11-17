import { useFgrcTheme } from '../../components/fgrc-colors';
import { FgrcButton, Page } from '../../components/fgrc-ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EIXOS_FGRC, TODAS_QUESTOES_FGRC } from './questionarioData';

type AvaliacoesScreenProps = {
  respostas: Record<string, number>;
  onIniciarNova: () => void;
  onContinuar: () => void;
};

export default function AvaliacoesScreen({
  respostas,
  onIniciarNova,
  onContinuar,
}: AvaliacoesScreenProps) {
  const { colors } = useFgrcTheme();

  const totalQuestoes = TODAS_QUESTOES_FGRC.length;
  const respondidasCount = Object.keys(respostas).length;
  const temAndamento = respondidasCount > 0;
  const percentual = totalQuestoes > 0 ? Math.round((respondidasCount / totalQuestoes) * 100) : 0;

  const proximaNaoRespondida =
    TODAS_QUESTOES_FGRC.find((q) => respostas[q.id] === undefined) ?? TODAS_QUESTOES_FGRC[0];

  const eixoAtual = EIXOS_FGRC.find((e) => e.codigo === proximaNaoRespondida.eixoCodigo) ?? EIXOS_FGRC[0];
  const respondidasNoEixo = eixoAtual.questoes.filter((q) => respostas[q.id] !== undefined).length;

  return (
    <Page
      title="Avaliações"
      subtitle="Avalie a maturidade da segurança cibernética do seu município."
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBadge, { backgroundColor: colors.iconBackground }]}>
            <Text style={[styles.iconPlus, { color: colors.blue }]}>+</Text>
          </View>
          <View style={styles.cardHeaderTexts}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Nova avaliação</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
              Comece uma avaliação da prefeitura.
            </Text>
          </View>
        </View>

        <View style={styles.cardAction}>
          <FgrcButton label="Iniciar avaliação" onPress={onIniciarNova} />
        </View>
      </View>

      {temAndamento ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleGroup}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Avaliação em andamento
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                {eixoAtual.nome} {respondidasNoEixo} de {eixoAtual.questoes.length} questões
              </Text>
            </View>
            <Text style={[styles.percentText, { color: colors.blue }]}>{percentual}%</Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: colors.divider }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.blue, width: `${percentual}%` },
              ]}
            />
          </View>

          <View style={styles.cardAction}>
            <FgrcButton label="Continuar avaliação" variant="outlined" onPress={onContinuar} />
          </View>
        </View>
      ) : null}

      <View style={[styles.infoCard, { backgroundColor: colors.infoBackground, borderColor: colors.border }]}>
        <View style={styles.infoHeader}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Como funciona?</Text>
        </View>
        <Text style={[styles.infoBody, { color: colors.muted }]}>
          Responda às perguntas sobre as práticas de segurança cibernética do município. Ao
          finalizar, você receberá indicadores e recomendações de melhoria.
        </Text>

        <View style={[styles.eixosDivider, { borderTopColor: colors.divider }]}>
          <Text style={[styles.eixosLabel, { color: colors.text }]}>
            Eixos avaliados ({EIXOS_FGRC.length} eixos • {totalQuestoes} questões)
          </Text>
          <View style={styles.eixosList}>
            {EIXOS_FGRC.map((eixo) => {
              const qtdResp = eixo.questoes.filter((q) => respostas[q.id] !== undefined).length;
              return (
                <Pressable
                  key={eixo.codigo}
                  onPress={onContinuar}
                  style={[
                    styles.eixoChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.eixoChipCode, { color: colors.blue }]}>{eixo.codigo}</Text>
                  <Text style={[styles.eixoChipName, { color: colors.text }]} numberOfLines={1}>
                    {eixo.nome}
                  </Text>
                  <Text style={[styles.eixoChipCount, { color: colors.muted }]}>
                    {qtdResp}/{eixo.questoes.length}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.25,
    padding: 18,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlus: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  cardHeaderTexts: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardAction: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  progressTitleGroup: {
    flex: 1,
    gap: 3,
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1.25,
    padding: 18,
    marginTop: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  eixosDivider: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  eixosLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  eixosList: {
    gap: 8,
  },
  eixoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  eixoChipCode: {
    fontSize: 12,
    fontWeight: '800',
    width: 34,
  },
  eixoChipName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  eixoChipCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});