// [integração] aba "Segurança" da administração: verificação em duas etapas (MFA)
// funciona assim: vc instala um aplicativo autenticador no celular (Google Authenticator, Microsoft
// Authenticator, Authy... qualquer um serve), lê o QR code daqui e ele passa a mostrar um código
// de 6 números que muda a cada 30 segundos
// depois de ativar, toda vez que entrar na área administrativa o app pede esse código além da senha
// (o banco também confere: sem o código, a conta de admin não consegue ver nem mudar nada)
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import { concluirCadastroMfa, fatoresVerificados, iniciarCadastroMfa } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { Cartao, dataHora } from './ui-admin';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

type Fator = Awaited<ReturnType<typeof fatoresVerificados>>[number];

export default function AbaSeguranca() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const [fatores, setFatores] = useState<Fator[] | null>(null);
  const [cadastro, setCadastro] = useState<{ factorId: string; qrCode: string; chave: string } | null>(null);
  const [codigo, setCodigo] = useState('');
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' | 'info' } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setFatores(await fatoresVerificados());
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
      setFatores([]);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  async function comecar() {
    setOcupado(true);
    setAviso(null);
    try {
      setCadastro(await iniciarCadastroMfa());
      setCodigo('');
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setOcupado(false);
    }
  }

  async function concluir() {
    if (!cadastro) return;
    setOcupado(true);
    setAviso(null);
    try {
      await concluirCadastroMfa(cadastro.factorId, codigo);
      setCadastro(null);
      setAviso({ texto: 'Verificação em duas etapas ativada. Nas próximas entradas o app vai pedir o código.', tipo: 'success' });
      await carregar();
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setOcupado(false);
    }
  }

  async function remover(id: string) {
    setOcupado(true);
    setAviso(null);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setOcupado(false);
    setRemovendo(null);
    if (error) {
      setAviso({ texto: 'Não foi possível remover. Saia, entre de novo com o código e tente outra vez.', tipo: 'error' });
      return;
    }
    setAviso({ texto: 'Verificação em duas etapas removida desta conta.', tipo: 'info' });
    await carregar();
  }

  if (!fatores) return <ActivityIndicator size="large" style={styles.carregando} />;

  return (
    <View>
      {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}

      <Text style={[styles.titulo, { color: colors.text }]}>Verificação em duas etapas</Text>
      <Text style={[styles.texto, { color: colors.muted }]}>
        Protege a área administrativa: mesmo que alguém descubra a senha, não consegue entrar sem o
        código que aparece no seu celular.
      </Text>

      {fatores.length ? (
        fatores.map(f => (
          <Cartao key={f.id}>
            <Text style={[styles.ativa, { color: colors.success }]}>Ativada</Text>
            <Text style={{ color: colors.text }}>{f.friendly_name || 'Aplicativo autenticador'}</Text>
            <Text style={{ color: colors.muted }}>Desde {dataHora(f.created_at)}</Text>
            {removendo === f.id ? (
              <View style={styles.acoes}>
                <Text style={{ color: colors.text }}>Remover? A área administrativa volta a pedir só a senha.</Text>
                <FgrcButton label={ocupado ? 'Aguarde...' : 'Sim, remover'} variant="dangerSolid" icon="trash-outline" disabled={ocupado} onPress={() => { void remover(f.id); }} />
                <FgrcButton label="Cancelar" variant="outlined" onPress={() => setRemovendo(null)} />
              </View>
            ) : (
              <FgrcButton label="Remover" variant="danger" icon="trash-outline" onPress={() => setRemovendo(f.id)} />
            )}
          </Cartao>
        ))
      ) : cadastro ? (
        <Cartao>
          <Text style={[styles.passo, { color: colors.text }]}>1. Abra o aplicativo autenticador e escolha adicionar conta</Text>
          {/* o QR vem do Supabase como imagem SVG; no celular pode não aparecer, por isso a chave fica embaixo */}
          <Image source={{ uri: cadastro.qrCode }} style={styles.qr} contentFit="contain" accessibilityLabel="QR code para o aplicativo autenticador" />
          <Text style={[styles.passo, { color: colors.text }]}>
            {Platform.OS === 'web' ? '2. Leia o QR code acima ou digite esta chave:' : '2. Se o QR code não aparecer, digite esta chave no aplicativo:'}
          </Text>
          <Text selectable style={[styles.chave, { color: colors.text }]}>{cadastro.chave}</Text>
          <Text style={[styles.passo, { color: colors.text }]}>3. Digite o código de 6 números que o aplicativo mostrar</Text>
          <TextInput
            accessibilityLabel="Código de 6 números"
            value={codigo}
            onChangeText={t => setCodigo(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            placeholderTextColor={colors.muted}
            style={[styles.codigo, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
          />
          <View style={styles.acoes}>
            <FgrcButton label={ocupado ? 'Conferindo...' : 'Ativar'} variant="success" icon="shield-checkmark-outline" disabled={ocupado || codigo.length !== 6} onPress={() => { void concluir(); }} />
            <FgrcButton label="Cancelar" variant="outlined" onPress={() => setCadastro(null)} />
          </View>
        </Cartao>
      ) : (
        <View style={styles.acoes}>
          <Text style={{ color: colors.text }}>Ainda não ativada nesta conta.</Text>
          <FgrcButton label={ocupado ? 'Aguarde...' : 'Ativar verificação em duas etapas'} variant="success" icon="shield-checkmark-outline" disabled={ocupado} onPress={() => { void comecar(); }} />
        </View>
      )}

      <Text style={[styles.texto, { color: colors.muted }]}>
        Perdeu o celular? Outra pessoa da administração remove a verificação pelo painel do Supabase
        (Authentication › Users › a sua conta › remover o fator) e você ativa de novo.
      </Text>
    </View>
  );
}

const estilosBase = StyleSheet.create({
  carregando: { marginTop: 30 },
  titulo: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  texto: { fontSize: 14, lineHeight: 20, marginVertical: 8 },
  ativa: { fontSize: 16, fontWeight: '800' },
  passo: { fontSize: 15, marginTop: 8 },
  qr: { width: 200, height: 200, alignSelf: 'center', backgroundColor: '#FFFFFF', marginVertical: 8 },
  chave: { fontSize: 16, fontWeight: '700', letterSpacing: 1, marginVertical: 4 },
  codigo: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 22, letterSpacing: 6, textAlign: 'center', minHeight: 50, marginTop: 6 },
  acoes: { gap: 8, marginTop: 8 },
});
