// [manutenção e atualização] aba "Status do sistema" da administração
//   * manutenção: liga/desliga, mensagem pública, previsão de retorno (opcional) e em quais plataformas vale
//   * versões: por plataforma, a versão mais nova, a mínima, se é obrigatória, o link oficial e as notas
// quem pode mudar é o banco que decide (RLS + e_admin_fgrcm); esconder a aba não protege nada
// quem mudou e quando o banco grava sozinho (gatilho) e entra no histórico lá embaixo
// [android] o produto é o app Android (APK); o navegador a gente usa só pra desenvolver e testar
// por isso a aba não pergunta mais "web ou android": a manutenção vale pra tudo e a versão mostrada é a do APK
// (o registro da web continua no banco, sem mexer, pq o Expo Web dos testes ainda lê ele)
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import {
  historicoDoSistema,
  lerStatusDoSistema,
  listarVersoes,
  salvarStatusDoSistema,
  salvarVersao,
  type RegistroHistorico,
  type StatusDoSistema,
  type VersaoDoApp,
} from '@/lib/admin';
import { lerDataDigitada, lerDataHoraDigitada, paraDigitar } from '@/lib/datas';
import { versaoInstalada } from '@/lib/sistema';
import { lerVersao } from '@/lib/versao';
import { Cartao, Etiqueta, Linha, TextoVazio, dataHora } from './ui-admin';

type Aviso = { texto: string; tipo: 'success' | 'error' } | null;

export default function AbaSistema() {
  const [status, setStatus] = useState<StatusDoSistema | null>(null);
  const [versoes, setVersoes] = useState<VersaoDoApp[]>([]);
  const [historico, setHistorico] = useState<RegistroHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<Aviso>(null);
  const { colors } = useFgrcTheme();

  const carregar = useCallback(async () => {
    try {
      const [s, v] = await Promise.all([lerStatusDoSistema(), listarVersoes()]);
      setStatus(s);
      setVersoes(v);
      setHistorico(await historicoDoSistema().catch(() => []));
    } catch (e) {
      setAviso({ texto: `${(e as Error).message} A migração de manutenção e versões já foi aplicada no Supabase?`, tipo: 'error' });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  if (carregando) return <ActivityIndicator size="large" style={styles.carregando} />;

  return (
    <View>
      {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
      {status ? <Manutencao status={status} onSalvo={(t) => { setAviso({ texto: t, tipo: 'success' }); void carregar(); }} onErro={(t) => setAviso({ texto: t, tipo: 'error' })} /> : null}

      <Text style={[styles.secao, { color: colors.text }]}>Versões do aplicativo</Text>
      <Text style={[styles.dica, { color: colors.muted }]}>
        Este painel está rodando a versão {versaoInstalada() ?? 'desconhecida'}. Só as versões 1.1.0 em diante conferem
        a versão mínima: um APK 1.0.0 já instalado não é bloqueado (ele não tem essa checagem).
        Use sempre o número técnico do APK (ex.: 1.2.0), não o nome de entrega (Versão 1.0) que aparece pra quem usa.
      </Text>
      {/* [android] só o APK é distribuído, então só ele aparece aqui pra configurar */}
      {versoes.filter((v) => v.plataforma === 'android').map((v) => (
        <FormVersao key={v.plataforma} versao={v} onSalvo={(t) => { setAviso({ texto: t, tipo: 'success' }); void carregar(); }} onErro={(t) => setAviso({ texto: t, tipo: 'error' })} />
      ))}

      <Text style={[styles.secao, { color: colors.text }]}>Histórico do sistema</Text>
      {historico.length === 0 ? <TextoVazio>Nenhuma mudança registrada ainda.</TextoVazio> : null}
      {historico.map((h) => (
        <Text key={h.id} style={[styles.historico, { color: colors.text }]}>
          {dataHora(h.criado_em)}: {NOME_ACAO[h.acao] ?? h.acao} ({h.de ?? '—'} → {h.para ?? '—'}) por {h.admin_email ?? 'administração'}
        </Text>
      ))}
    </View>
  );
}

const NOME_ACAO: Record<string, string> = {
  manutencao_ativada: 'manutenção ligada',
  manutencao_desativada: 'manutenção desligada',
  manutencao_alterada: 'aviso de manutenção alterado',
  versao_alterada: 'versão alterada',
};

function Manutencao({ status, onSalvo, onErro }: { status: StatusDoSistema; onSalvo: (t: string) => void; onErro: (t: string) => void }) {
  const { colors } = useFgrcTheme();
  const [mensagem, setMensagem] = useState(status.mensagem ?? '');
  const [previsao, setPrevisao] = useState(paraDigitar(status.previsao_retorno));
  const [confirmando, setConfirmando] = useState<boolean | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // salva com a manutenção ligada (true) ou desligada (false)
  async function salvar(ligada: boolean) {
    const previsaoIso = lerDataHoraDigitada(previsao);
    if (previsaoIso === 'invalida') {
      onErro('Previsão de retorno inválida. Use o formato 18/11/2026 22:30, ou deixe em branco.');
      return;
    }
    if (mensagem.length > 500) {
      onErro('A mensagem pode ter no máximo 500 caracteres.');
      return;
    }
    setOcupado(true);
    try {
      await salvarStatusDoSistema({
        manutencao_ativa: ligada,
        mensagem: mensagem.trim() || null,
        previsao_retorno: previsaoIso,
        // [android] vale sempre pra tudo (o app Android e o navegador de testes)
        plataformas: 'todas',
      });
      setConfirmando(null);
      onSalvo(ligada
        ? 'Manutenção ligada. O app mostra o aviso da próxima vez que abrir ou voltar pra frente (em até 1 minuto).'
        : status.manutencao_ativa ? 'Manutenção desligada. O app volta ao normal quando a pessoa tocar em "Tentar de novo" ou abrir de novo.' : 'Aviso salvo.');
    } catch (e) {
      onErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Cartao>
      <Text style={[styles.secao, { color: colors.text }]}>Manutenção</Text>
      <Etiqueta texto={status.manutencao_ativa ? 'Em manutenção' : 'Funcionando normalmente'} tom={status.manutencao_ativa ? 'alerta' : 'bom'} />
      <Linha rotulo="Última mudança" valor={status.atualizado_em ? `${dataHora(status.atualizado_em)} por ${status.atualizado_por_email ?? 'administração'}` : null} />

      <Text style={[styles.rotulo, { color: colors.text }]}>Mensagem para quem abrir o app</Text>
      <TextInput
        accessibilityLabel="Mensagem da manutenção"
        multiline
        maxLength={500}
        value={mensagem}
        onChangeText={setMensagem}
        placeholder="Ex.: Estamos atualizando o FGRC-M. Volte em alguns minutos."
        placeholderTextColor={colors.muted}
        textAlignVertical="top"
        style={[styles.campoGrande, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
      />
      <Text style={[styles.rotulo, { color: colors.text }]}>Previsão de retorno (opcional)</Text>
      <TextInput
        accessibilityLabel="Previsão de retorno"
        value={previsao}
        onChangeText={setPrevisao}
        placeholder="18/11/2026 22:30 (deixe vazio se não souber)"
        placeholderTextColor={colors.muted}
        style={[styles.campo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
      />
      <Text style={[styles.dica, { color: colors.muted }]}>
        O aviso vale para o aplicativo Android (e aparece também no navegador que a equipe usa nos testes).
      </Text>

      {confirmando === true ? (
        <View style={styles.acoes}>
          <Text style={{ color: colors.text }}>
            Ligar a manutenção? Quem abrir o app vai ver só o aviso (as telas de suporte e de administração continuam abertas).
          </Text>
          <FgrcButton label={ocupado ? 'Aguarde...' : 'Sim, ligar manutenção'} variant="danger" disabled={ocupado} onPress={() => { void salvar(true); }} />
          <FgrcButton label="Cancelar" variant="outlined" onPress={() => setConfirmando(null)} />
        </View>
      ) : (
        <View style={styles.acoes}>
          {status.manutencao_ativa ? (
            <>
              <FgrcButton label={ocupado ? 'Aguarde...' : 'Desligar manutenção'} disabled={ocupado} onPress={() => { void salvar(false); }} />
              <FgrcButton label="Salvar mudanças no aviso" variant="outlined" disabled={ocupado} onPress={() => { void salvar(true); }} />
            </>
          ) : (
            <>
              <FgrcButton label="Ligar manutenção" variant="danger" disabled={ocupado} onPress={() => setConfirmando(true)} />
              <FgrcButton label="Só salvar o texto (sem ligar)" variant="outlined" disabled={ocupado} onPress={() => { void salvar(false); }} />
            </>
          )}
        </View>
      )}
    </Cartao>
  );
}

const NOME_PLATAFORMA: Record<VersaoDoApp['plataforma'], string> = { android: 'Android (APK)', web: 'Navegador (web)', ios: 'iPhone' };

function FormVersao({ versao, onSalvo, onErro }: { versao: VersaoDoApp; onSalvo: (t: string) => void; onErro: (t: string) => void }) {
  const { colors } = useFgrcTheme();
  const [atual, setAtual] = useState(versao.versao_atual);
  const [minima, setMinima] = useState(versao.versao_minima);
  const [obrigatoria, setObrigatoria] = useState(versao.obrigatoria);
  const [url, setUrl] = useState(versao.url_atualizacao ?? '');
  const [mensagem, setMensagem] = useState(versao.mensagem ?? '');
  const [notas, setNotas] = useState(versao.notas ?? '');
  const [publicada, setPublicada] = useState(paraDigitar(versao.publicada_em, false));
  const [ocupado, setOcupado] = useState(false);

  async function salvar() {
    // confere antes de mandar (o banco confere de novo)
    if (!lerVersao(atual) || !lerVersao(minima)) return onErro('Use o formato 1.2.3 nas versões.');
    const dataPublicada = lerDataDigitada(publicada);
    if (dataPublicada === 'invalida') return onErro('Data de publicação inválida. Use o formato 18/11/2026, ou deixe em branco.');
    const link = url.trim();
    if (link && !/^https:\/\/\S+$/.test(link)) return onErro('O link precisa começar com https:// (link oficial do APK ou do site).');
    if (obrigatoria && versao.plataforma === 'android' && !link) {
      return onErro('Para obrigar a atualização no Android, cadastre o link oficial do APK novo (senão a pessoa fica sem ter de onde baixar).');
    }
    setOcupado(true);
    try {
      await salvarVersao(versao.plataforma, {
        versao_atual: atual.trim(),
        versao_minima: minima.trim(),
        obrigatoria,
        url_atualizacao: link || null,
        mensagem: mensagem.trim() || null,
        notas: notas.trim() || null,
        publicada_em: dataPublicada,
      });
      onSalvo(`Versão de ${NOME_PLATAFORMA[versao.plataforma]} salva.`);
    } catch (e) {
      onErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const campo = [styles.campo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }];
  return (
    <Cartao>
      <Text style={[styles.secao, { color: colors.text }]}>{NOME_PLATAFORMA[versao.plataforma]}</Text>
      <Linha rotulo="Última mudança" valor={versao.atualizado_em ? `${dataHora(versao.atualizado_em)} por ${versao.atualizado_por_email ?? 'administração'}` : null} />
      <Text style={[styles.rotulo, { color: colors.text }]}>Versão mais nova</Text>
      <TextInput accessibilityLabel="Versão mais nova" value={atual} onChangeText={setAtual} placeholder="1.1.0" placeholderTextColor={colors.muted} style={campo} />
      <Text style={[styles.rotulo, { color: colors.text }]}>Versão mínima aceita</Text>
      <TextInput accessibilityLabel="Versão mínima" value={minima} onChangeText={setMinima} placeholder="1.1.0" placeholderTextColor={colors.muted} style={campo} />
      {/* liga/desliga simples (o protótipo não tem um componente de chave) */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: obrigatoria }}
        onPress={() => setObrigatoria(!obrigatoria)}
        style={styles.marcar}
      >
        <Text style={[styles.caixinha, { borderColor: colors.blue, color: colors.blue }]}>{obrigatoria ? '✓' : ' '}</Text>
        <Text style={{ color: colors.text, flex: 1 }}>
          Atualização obrigatória (quem estiver abaixo da versão mínima fica bloqueado até atualizar)
        </Text>
      </Pressable>
      <Text style={[styles.rotulo, { color: colors.text }]}>Link oficial da versão nova {versao.plataforma === 'web' ? '(opcional na web)' : ''}</Text>
      <TextInput accessibilityLabel="Link oficial" value={url} onChangeText={setUrl} autoCapitalize="none" placeholder="https://expo.dev/artifacts/..." placeholderTextColor={colors.muted} style={campo} />
      <Text style={[styles.rotulo, { color: colors.text }]}>Mensagem (opcional)</Text>
      <TextInput accessibilityLabel="Mensagem da atualização" value={mensagem} onChangeText={setMensagem} maxLength={500} placeholderTextColor={colors.muted} placeholder="Ex.: Esta versão corrige o PDF no Android." style={campo} />
      <Text style={[styles.rotulo, { color: colors.text }]}>O que mudou (opcional)</Text>
      <TextInput accessibilityLabel="Notas da versão" multiline value={notas} onChangeText={setNotas} maxLength={2000} textAlignVertical="top" placeholderTextColor={colors.muted} placeholder="Uma mudança por linha" style={[styles.campoGrande, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]} />
      <Text style={[styles.rotulo, { color: colors.text }]}>Publicada em (opcional)</Text>
      <TextInput accessibilityLabel="Data de publicação" value={publicada} onChangeText={setPublicada} placeholder="18/11/2026" placeholderTextColor={colors.muted} style={campo} />
      <View style={styles.acoes}>
        <FgrcButton label={ocupado ? 'Aguarde...' : 'Salvar versão'} disabled={ocupado} onPress={() => { void salvar(); }} />
      </View>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  carregando: { marginTop: 30 },
  secao: { fontSize: 17, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  dica: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  rotulo: { fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  campo: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15 },
  campoGrande: { minHeight: 80, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 15 },
  acoes: { gap: 8, marginTop: 12 },
  marcar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  caixinha: { width: 24, height: 24, borderWidth: 2, borderRadius: 4, textAlign: 'center', fontWeight: '800' },
  historico: { fontSize: 14, marginBottom: 4 },
});
