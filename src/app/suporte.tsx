// [integração] tela "Ajuda e suporte" (não existe no protótipo, foi pedida pela equipe)
// abre pelo Login (Falar com o suporte) e pelo Mais (Ajuda e suporte)
// grava o pedido na tabela support_requests do Supabase (o app só consegue ENVIAR, não ler)
// a equipe lê os pedidos no painel: Table Editor > support_requests
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, FormField, Notice, OrangeLink, Page } from '@/components/fgrc-ui';
import { dadosDaConta } from '@/lib/conta';
// no suporte vale qualquer e-mail (quem não consegue entrar pode não ter o da prefeitura), só confere o formato
import { formatoDeEmailValido } from '@/lib/email-institucional';
import { plataformaDoPedido } from '@/lib/plataforma';
import { supabase } from '@/lib/supabase';

// assuntos fixos (fica mais fácil pra equipe separar os pedidos)
const ASSUNTOS = [
  'Problema para entrar',
  'Dúvida sobre a avaliação',
  'Erro no aplicativo',
  'Outro assunto',
] as const;

const LIMITE_MENSAGEM = 1500;

export default function Suporte() {
  const router = useRouter();
  const { colors } = useFgrcTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState<(typeof ASSUNTOS)[number] | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  // [suporte] com login a mensagem fica ligada à conta e dá pra acompanhar em Meus chamados
  const [logado, setLogado] = useState(false);

  // se a pessoa ta logada, já preenche nome e e-mail (ela ainda pode mudar)
  // getSession lê a sessão salva no aparelho (não precisa de internet)
  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!ativo || !user) return;
      setLogado(true);
      const d = dadosDaConta(user);
      setNome(atual => atual || d.nome || '');
      setEmail(atual => atual || d.email || '');
    }).catch(() => {});
    return () => { ativo = false; };
  }, []);

  // voltar funciona mesmo se a pessoa abriu essa página direto pelo endereço
  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  async function enviar() {
    if (enviando) return;
    setErro('');
    const nomeLimpo = nome.trim().replace(/\s+/g, ' ');
    const emailLimpo = email.trim().toLowerCase();
    const textoLimpo = mensagem.trim();

    if (!nomeLimpo || !emailLimpo || !assunto || !textoLimpo) {
      setErro('Preencha todos os campos e escolha um assunto.');
      return;
    }
    if (!formatoDeEmailValido(emailLimpo)) {
      setErro('Digite um e-mail válido. Exemplo: nome@prefeitura.gov.br');
      return;
    }
    if (textoLimpo.length < 10) {
      setErro('Explique um pouco mais o que aconteceu (pelo menos 10 letras).');
      return;
    }

    setEnviando(true);
    try {
      // vai só o que a pessoa escreveu aqui (nenhuma resposta de avaliação sai do aparelho)
      const { error } = await supabase.from('support_requests').insert({
        nome: nomeLimpo,
        email: emailLimpo,
        assunto,
        mensagem: textoLimpo.slice(0, LIMITE_MENSAGEM),
        plataforma: plataformaDoPedido(),
      });
      if (error) {
        // 42P01/PGRST205 = a tabela ainda não foi criada no Supabase (falta rodar o SQL)
        // mensagem_duplicada / limite_de_envios = trava contra spam que o banco faz sozinho
        // (mesma mensagem em 10 min, ou mais de 5 por hora com o mesmo e-mail)
        const texto = error.message ?? '';
        setErro(error.code === '42P01' || error.code === 'PGRST205'
          ? 'O suporte ainda não foi configurado. Avise a equipe do FGRC-M por outro canal.'
          : texto.includes('mensagem_duplicada')
            ? 'Essa mensagem já foi enviada há pouco. A equipe já recebeu, aguarde a resposta por e-mail.'
            : texto.includes('limite_de_envios')
              ? 'Muitas mensagens enviadas em pouco tempo. Aguarde uma hora e tente de novo.'
              : 'Não foi possível enviar. Confira os dados e tente de novo.');
        return;
      }
      setEnviado(true);
      setMensagem('');
      setAssunto(null);
    } catch {
      setErro('Sem conexão. Verifique a internet e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Page
        title="Mensagem enviada"
        subtitle={logado
          ? 'A equipe do FGRC-M vai responder em Meus chamados (no menu Mais) e, se precisar, pelo e-mail informado.'
          : 'A equipe do FGRC-M vai responder pelo e-mail informado.'}
        onBack={voltar}
      >
        <View style={styles.bloco}>
          {/* [suporte] com login dá pra acompanhar a situação e ler a resposta dentro do app */}
          {logado ? <FgrcButton label="Acompanhar em Meus chamados" onPress={() => router.replace('/meus-chamados' as Href)} /> : null}
          <FgrcButton label="Voltar" variant={logado ? 'outlined' : 'filled'} onPress={voltar} />
          <OrangeLink label="Enviar outra mensagem" onPress={() => setEnviado(false)} />
        </View>
      </Page>
    );
  }

  return (
    <Page title="Ajuda e suporte" subtitle="Conte o que aconteceu. A equipe do FGRC-M vai responder pelo seu e-mail." onBack={voltar}>
      <View style={styles.bloco}>
        {/* [suporte] atalho pra ver as mensagens que já mandou e as respostas */}
        {logado ? <OrangeLink label="Ver meus chamados" onPress={() => router.push('/meus-chamados' as Href)} /> : null}
        <FormField label="Nome completo" value={nome} onChangeText={setNome} placeholder="Digite seu nome..." />
        <FormField label="E-mail para resposta" email value={email} onChangeText={setEmail} placeholder="Digite seu e-mail..." />

        {/* botões de assunto (funciona como escolha única) */}
        <Text style={[styles.rotulo, { color: colors.text }]}>Assunto</Text>
        <View style={styles.assuntos} accessibilityRole="radiogroup">
          {ASSUNTOS.map(item => {
            const marcado = assunto === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ checked: marcado }}
                onPress={() => setAssunto(item)}
                style={[styles.assunto, {
                  borderColor: marcado ? colors.blue : colors.border,
                  backgroundColor: marcado ? colors.selected : colors.surface,
                }]}
              >
                <Text style={[styles.assuntoTexto, { color: colors.text }]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* campo grande pra mensagem (o FormField do grupo é de uma linha só) */}
        <Text style={[styles.rotulo, { color: colors.text }]}>Mensagem</Text>
        <TextInput
          accessibilityLabel="Mensagem"
          multiline
          maxLength={LIMITE_MENSAGEM}
          value={mensagem}
          onChangeText={setMensagem}
          placeholder="Descreva o problema ou a dúvida..."
          placeholderTextColor={colors.muted}
          style={[styles.mensagem, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]}
          textAlignVertical="top"
        />
        <Text style={[styles.dica, { color: colors.muted }]}>
          Não escreva senhas nem as respostas da avaliação. ({mensagem.length}/{LIMITE_MENSAGEM})
        </Text>

        {erro ? <Notice message={erro} kind="error" onClose={() => setErro('')} /> : null}
        <FgrcButton label={enviando ? 'Enviando...' : 'Enviar mensagem'} disabled={enviando} onPress={() => { void enviar(); }} />
        <OrangeLink label="Voltar" onPress={voltar} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  bloco: { marginTop: 16, gap: 4 },
  rotulo: { fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 8 },
  assuntos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assunto: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, minHeight: 44, justifyContent: 'center' },
  assuntoTexto: { fontSize: 14 },
  mensagem: { borderWidth: 1, borderRadius: 10, minHeight: 130, padding: 12, fontSize: 15 },
  dica: { fontSize: 13, marginTop: 6, marginBottom: 10 },
});
