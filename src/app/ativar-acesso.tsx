// [integração] tela "Ativar acesso" (o último passo do pedido de acesso)
// como funciona o caminho todo:
//   1. a pessoa pede acesso na tela da Liz (P02) e o pedido fica "pendente" no Supabase
//   2. a administração confere o pedido e, se aprovar, convida a pessoa pelo painel
//      (Authentication > Users > Invite user). O Supabase manda um e-mail com um código
//   3. a pessoa abre esta tela, digita o e-mail e o código, e cria a senha dela
// assim ninguém entra sem a administração aprovar, e o e-mail é confirmado pelo código
// [integração] agora o código também pode vir direto da administração (área /admin > "Aprovar com
// código de ativação" ou "Novo acesso"), sem depender de e-mail. A tela funciona igual pros dois
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { FgrcButton, FormField, Notice, OrangeLink, Page } from '@/components/fgrc-ui';
// [integração B12] tamanho do código num lugar só (o e-mail do Supabase manda 8 números)
import { codigoNoFormatoCerto, descricaoDoCodigo, exemploDeCodigo, limparCodigo } from '@/lib/codigo-de-acesso';
import { problemaNoEmailInstitucional } from '@/lib/email-institucional';
import { REGRA_SENHA_TEXTO, oQueFaltaNaSenha } from '@/lib/politica-senha';
import { supabase } from '@/lib/supabase';
// [integração 19/11] escala do texto nas telas do celular
import { useEstilosEscalados } from '@/components/escala-texto';
// [integração 25/11] leitura obrigatória dos Termos de Uso antes de ativar a conta
// (a janela fica por cima da tela, igual o tutorial; a pessoa só segue depois de ler até o fim e aceitar)
import AceiteDosTermos from '@/features/integracao/AceiteDosTermos';
import type { RegistroDoAceite } from '@/lib/aceite-dos-termos';

export default function AtivarAcesso() {
  // [integração 19/11] tamanho do texto escolhido em Configurações (vale no celular também)
  const styles = useEstilosEscalados(estilosBase);
  const router = useRouter();
  const { colors } = useFgrcTheme();
  // 'codigo' = digitar e-mail e código | 'senha' = criar a senha (depois que o código deu certo)
  const [etapa, setEtapa] = useState<'codigo' | 'senha'>('codigo');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  // [integração 25/11] aceite = null enquanto a pessoa não leu e aceitou os Termos de Uso
  // depois do aceite guarda a versão dos termos e a hora, pra gravar na conta (a conta só "existe" pro app
  // depois que o código é confirmado, por isso o aceite fica esperando aqui na tela até lá)
  const [aceite, setAceite] = useState<RegistroDoAceite | null>(null);

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  // passo 1: confere o código que chegou no e-mail
  // tenta primeiro como convite (e-mail da aprovação) e depois como código de entrada
  // (o código de entrada é o que chega quando a pessoa clica em "Receber um código novo")
  async function confirmarCodigo() {
    if (ocupado) return;
    // [integração 25/11] sem aceitar os termos não ativa (a tela já esconde o formulário, isso aqui é a garantia)
    if (!aceite) return;
    setErro('');
    setAviso('');
    const emailLimpo = email.trim().toLowerCase();
    const codigoLimpo = limparCodigo(codigo); // tira espaço e traço (fica só número)

    const problema = problemaNoEmailInstitucional(emailLimpo);
    if (problema) { setErro(problema); return; }
    // [integração B12] o texto agora fala do tamanho real do código (antes dizia 6, mas chega com 8)
    if (!codigoNoFormatoCerto(codigoLimpo)) {
      setErro(`Digite o ${descricaoDoCodigo()} que você recebeu no e-mail.`);
      return;
    }

    setOcupado(true);
    try {
      let { error } = await supabase.auth.verifyOtp({ email: emailLimpo, token: codigoLimpo, type: 'invite' });
      if (error) {
        ({ error } = await supabase.auth.verifyOtp({ email: emailLimpo, token: codigoLimpo, type: 'email' }));
      }
      if (error) {
        setErro('Código errado ou vencido. Confira o número ou peça um código novo.');
        return;
      }
      // [integração 25/11] agora que a pessoa ta logada, já grava na conta que ela aceitou os termos
      // (fica no user_metadata: versão do texto e hora do aceite. Se a internet falhar aqui não trava nada,
      // pq o aceite vai de novo junto com a senha, no passo 2)
      await supabase.auth.updateUser({ data: aceite }).catch(() => null);
      // deu certo: agora a pessoa ta logada só pra criar a senha
      setEtapa('senha');
    } catch {
      setErro('Sem conexão. Verifique a internet e tente de novo.');
    } finally {
      setOcupado(false);
    }
  }

  // manda um código novo (só funciona pra quem a administração já aprovou)
  // shouldCreateUser: false = não cria conta nova, então pedido não aprovado não ganha acesso
  async function pedirCodigoNovo() {
    if (ocupado) return;
    setErro('');
    setAviso('');
    const emailLimpo = email.trim().toLowerCase();
    const problema = problemaNoEmailInstitucional(emailLimpo);
    if (problema) { setErro(problema); return; }

    setOcupado(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailLimpo,
        options: { shouldCreateUser: false },
      });
      if (error?.status === 429) {
        setErro('Muitos pedidos em pouco tempo. Espere alguns minutos e tente de novo.');
        return;
      }
      // mesmo se o e-mail não tiver sido aprovado, mostra a mesma mensagem
      // (assim ninguém consegue descobrir quais e-mails têm conta)
      // [integração] se o e-mail não chegar, a administração consegue gerar um código novo no /admin
      setAviso('Se o seu acesso já foi aprovado, um código novo vai chegar no seu e-mail em alguns minutos. Veja também a pasta de spam. Se não chegar, fale com o suporte para a administração gerar um código novo.');
    } catch {
      setErro('Sem conexão. Verifique a internet e tente de novo.');
    } finally {
      setOcupado(false);
    }
  }

  // passo 2: cria a senha da pessoa (mesma regra de senha forte do app inteiro)
  async function salvarSenha() {
    if (ocupado) return;
    setErro('');
    const falta = oQueFaltaNaSenha(senha);
    if (falta.length) { setErro(`Falta na senha: ${falta.join(', ')}.`); return; }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return; }
    // [integração 25/11] não era pra chegar aqui sem aceite (a tela da senha só abre depois dele), mas garante
    if (!aceite) { setErro('Para ativar a conta é preciso ler e aceitar os Termos de Uso.'); return; }

    setOcupado(true);
    try {
      // senha_provisoria: false = se a pessoa tinha uma senha provisória, o app para de pedir pra trocar
      // [integração 25/11] ...aceite = grava junto a versão dos termos e a hora em que a pessoa aceitou
      const { error } = await supabase.auth.updateUser({ password: senha, data: { senha_provisoria: false, ...aceite } });
      if (error) {
        setErro(error.code === 'weak_password' ? REGRA_SENHA_TEXTO : 'Não foi possível salvar a senha. Tente de novo.');
        return;
      }
      setSenha('');
      setConfirmar('');
      // pronto: a pessoa já ta logada, então vai direto pra página inicial
      router.replace('/inicio');
    } catch {
      setErro('Sem conexão. Verifique a internet e tente de novo.');
    } finally {
      setOcupado(false);
    }
  }

  if (etapa === 'senha') {
    return (
      <Page title="Crie sua senha" subtitle="Código confirmado! Agora crie a senha que você vai usar para entrar no FGRC-M.">
        <View style={styles.bloco}>
          <FormField label="Nova senha" secure value={senha} onChangeText={v => { setSenha(v); setErro(''); }} placeholder="Digite a nova senha..." />
          <FormField label="Confirmar senha" secure value={confirmar} onChangeText={v => { setConfirmar(v); setErro(''); }} placeholder="Digite a senha mais uma vez..." />
          <Text style={[styles.dica, { color: colors.muted }]}>{REGRA_SENHA_TEXTO}</Text>
          {erro ? <Notice message={erro} kind="error" /> : null}
          <FgrcButton label={ocupado ? 'Salvando...' : 'Salvar senha e entrar'} disabled={ocupado} onPress={() => { void salvarSenha(); }} />
        </View>
      </Page>
    );
  }

  // [integração 25/11] a tela ganhou uma "caixa" em volta (View) só pra janela dos termos conseguir ficar por cima de tudo
  // enquanto os termos não forem aceitos, o formulário nem é desenhado: assim não dá pra digitar o código
  // por trás da janela (nem com teclado no computador, nem com leitor de tela)
  return (
    <View style={styles.tela}>
    <Page
      title="Ativar acesso"
      subtitle={`Quando a administração aprovar o seu pedido, você recebe um ${descricaoDoCodigo()} (por e-mail ou direto da administração). Digite o código aqui para criar sua senha. Não é preciso tocar em nenhum link do e-mail.`}
      onBack={voltar}
    >
      {aceite ? (
      <View style={styles.bloco}>
        <FormField label="E-mail institucional" email value={email} onChangeText={v => { setEmail(v); setErro(''); }} placeholder="Digite o e-mail do pedido..." />
        <FormField label="Código de ativação" value={codigo} onChangeText={v => { setCodigo(v); setErro(''); }} placeholder={`Ex: ${exemploDeCodigo()}`} />
        {erro ? <Notice message={erro} kind="error" /> : null}
        {aviso ? <Notice message={aviso} kind="success" onClose={() => setAviso('')} /> : null}
        <FgrcButton label={ocupado ? 'Aguarde...' : 'Confirmar código'} disabled={ocupado} onPress={() => { void confirmarCodigo(); }} />
        <OrangeLink label="Não recebi o código / o código venceu" onPress={() => { void pedirCodigoNovo(); }} />
        {/* [entrada nova] o Login agora fica em /entrar ("/" virou a página Conheça o FGRC-M) */}
        <OrangeLink label="Voltar para login" onPress={() => router.replace('/entrar')} />
      </View>
      ) : null}
    </Page>
    {/* [integração 25/11] "Li e aceito" guarda o aceite e libera o formulário; "Não aceito" sai da ativação */}
    <AceiteDosTermos visivel={!aceite} onAceitar={setAceite} onRecusar={voltar} />
    </View>
  );
}

const estilosBase = StyleSheet.create({
  // [integração 25/11] ocupa a tela inteira (é dentro dela que a janela dos termos se estica)
  tela: { flex: 1 },
  bloco: { marginTop: 16, gap: 4 },
  dica: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
});
