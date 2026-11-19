// [integração] tudo que a administração usa pra passar o acesso pra pessoa
//   CaixaDeAcesso = mostra a senha provisória ou o código UMA vez, com botão de copiar e de compartilhar
//   NovoAcesso    = pra quem perdeu: gera nova senha, gera novo código ou manda o código por e-mail
// o código (8 números, ver src/lib/codigo-de-acesso.ts) a pessoa usa em Login > "Seu pedido foi aprovado? Ativar acesso"
// ele vale por pouco tempo (1 hora no padrão do Supabase) e só funciona uma vez
import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, Notice } from '@/components/fgrc-ui';
import { novoAcesso } from '@/lib/admin';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';

export type AcessoGerado = { email: string; tipo: 'senha' | 'codigo'; valor: string };

// texto pronto pra mandar pra pessoa (WhatsApp, e-mail etc)
function mensagemPara(a: AcessoGerado): string {
  return a.tipo === 'senha'
    ? `Seu acesso ao FGRC-M foi liberado.\nE-mail: ${a.email}\nSenha provisória: ${a.valor}\nNo primeiro acesso o aplicativo vai pedir para você criar uma senha nova.`
    : `Seu acesso ao FGRC-M foi liberado.\nNo aplicativo, toque em "Seu pedido foi aprovado? Ativar acesso".\nE-mail: ${a.email}\nCódigo: ${a.valor}\nO código vale por pouco tempo e só funciona uma vez.`;
}

export function CaixaDeAcesso({ acesso, onFechar }: { acesso: AcessoGerado; onFechar: () => void }) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const [copiado, setCopiado] = useState(false);

  // no navegador copia pra área de transferência; no celular abre o "compartilhar" (WhatsApp, e-mail...)
  async function copiar() {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(mensagemPara(acesso));
        setCopiado(true);
        return;
      }
      await Share.share({ message: mensagemPara(acesso) });
    } catch {
      // se não deu pra copiar, o texto continua na tela pra copiar na mão (ele é selecionável)
    }
  }

  async function compartilhar() {
    try {
      await Share.share({ message: mensagemPara(acesso) });
    } catch {
      setCopiado(false);
    }
  }

  return (
    <View style={[styles.caixa, { borderColor: colors.blue, backgroundColor: colors.infoBackground }]} accessibilityLiveRegion="polite">
      <Text style={[styles.titulo, { color: colors.text }]}>
        {acesso.tipo === 'senha' ? 'Senha provisória' : 'Código de ativação'} de {acesso.email}
      </Text>
      <Text selectable style={[styles.valor, { color: colors.text }]}>{acesso.valor}</Text>
      <Text style={[styles.texto, { color: colors.muted }]}>
        {acesso.tipo === 'senha'
          ? 'Anote agora: ela não aparece de novo. No primeiro acesso o app pede para a pessoa criar uma senha nova.'
          : 'Anote agora: ele não aparece de novo. A pessoa abre o app, toca em "Seu pedido foi aprovado? Ativar acesso", digita o e-mail e este código e cria a senha. Vale por pouco tempo (1 hora no padrão do Supabase) e só funciona uma vez.'}
      </Text>
      <View style={styles.acoes}>
        <FgrcButton label={copiado ? 'Mensagem copiada' : Platform.OS === 'web' ? 'Copiar mensagem pronta' : 'Enviar para a pessoa'} variant="outlined" onPress={() => { void copiar(); }} />
        {Platform.OS === 'web' && typeof navigator !== 'undefined' && 'share' in navigator ? (
          <FgrcButton label="Compartilhar" variant="outlined" onPress={() => { void compartilhar(); }} />
        ) : null}
      </View>
      <Pressable accessibilityRole="button" onPress={onFechar}>
        <Text style={[styles.link, { color: colors.blue }]}>Já anotei</Text>
      </Pressable>
    </View>
  );
}

// novo acesso pra quem perdeu a senha provisória ou o código (ou nunca recebeu o e-mail)
// passa o userId (aba Contas) ou o e-mail + id do pedido (tela do pedido aprovado)
export function NovoAcesso({ email, userId, pedidoId, onGerado }: {
  email: string;
  userId?: string;
  pedidoId?: string;
  onGerado?: () => void;
}) {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const { colors } = useFgrcTheme();
  const [aberto, setAberto] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  const [gerado, setGerado] = useState<AcessoGerado | null>(null);

  async function gerar(modo: 'senha' | 'codigo' | 'email') {
    setOcupado(true);
    setAviso(null);
    setConfirmarSenha(false);
    try {
      const r = await novoAcesso({ modo, userId, email, pedidoId });
      setAviso({ texto: r.mensagem, tipo: 'success' });
      if (r.senhaProvisoria) setGerado({ email, tipo: 'senha', valor: r.senhaProvisoria });
      if (r.codigo) setGerado({ email, tipo: 'codigo', valor: r.codigo });
      onGerado?.();
    } catch (e) {
      setAviso({ texto: (e as Error).message, tipo: 'error' });
    } finally {
      setOcupado(false);
    }
  }

  if (!aberto) {
    return <FgrcButton label="Novo acesso (senha ou código)" variant="outlined" onPress={() => setAberto(true)} />;
  }

  return (
    <View style={styles.bloco}>
      <Text style={[styles.titulo, { color: colors.text }]}>Novo acesso para {email}</Text>
      <Text style={[styles.texto, { color: colors.muted }]}>
        Use quando a pessoa perdeu a senha provisória ou o código. O anterior para de funcionar.
      </Text>
      {aviso ? <Notice message={aviso.texto} kind={aviso.tipo} onClose={() => setAviso(null)} /> : null}
      {gerado ? <CaixaDeAcesso acesso={gerado} onFechar={() => setGerado(null)} /> : null}

      {/* [correção Android] e-mail primeiro: o código chega só pra dona do e-mail */}
      <FgrcButton label={ocupado ? 'Aguarde...' : 'Enviar código por e-mail'} disabled={ocupado} onPress={() => { void gerar('email'); }} />
      <Text style={[styles.texto, { color: colors.muted }]}>
        Recomendado. Se mandar de novo em menos de 1 minuto, o Supabase recusa: espere e tente outra vez.
      </Text>
      <FgrcButton label={ocupado ? 'Aguarde...' : 'Gerar código de ativação'} variant="outlined" disabled={ocupado} onPress={() => { void gerar('codigo'); }} />
      {confirmarSenha ? (
        <View style={styles.acoes}>
          <Text style={{ color: colors.text }}>
            Gerar uma senha provisória nova? Se a pessoa já criou a própria senha, ela deixa de funcionar.
          </Text>
          <FgrcButton label="Sim, gerar nova senha" variant="dangerSolid" icon="key-outline" disabled={ocupado} onPress={() => { void gerar('senha'); }} />
          <FgrcButton label="Cancelar" variant="outlined" onPress={() => setConfirmarSenha(false)} />
        </View>
      ) : (
        <FgrcButton label="Gerar nova senha provisória" variant="outlined" disabled={ocupado} onPress={() => setConfirmarSenha(true)} />
      )}
      <Text style={[styles.texto, { color: colors.muted }]}>
        O código gerado aqui e a senha provisória aparecem na tela para você passar à pessoa (funcionam sem e-mail).
      </Text>
      <Pressable accessibilityRole="button" onPress={() => { setAberto(false); setAviso(null); setGerado(null); }}>
        <Text style={[styles.link, { color: colors.blue }]}>Fechar</Text>
      </Pressable>
    </View>
  );
}

const estilosBase = StyleSheet.create({
  caixa: { borderWidth: 1, borderRadius: 14, padding: 14, marginVertical: 10, gap: 6 },
  bloco: { gap: 8, marginTop: 8 },
  titulo: { fontSize: 16, fontWeight: '700' },
  valor: { fontSize: 28, fontWeight: '800', letterSpacing: 2, marginVertical: 4 },
  texto: { fontSize: 14, lineHeight: 20 },
  acoes: { gap: 8 },
  link: { fontSize: 15, fontWeight: '600', marginTop: 6 },
});
