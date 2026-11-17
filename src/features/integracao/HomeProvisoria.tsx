// essa Home serve pra testar o app antes de ter usuarios cadastrados no Supabase
// as telas oficiais continuam no projeto (isso não substitui o trabalho da P01)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { TODAS_QUESTOES_FGRC } from '@/features/p03-avaliacoes-questionario/questionarioData';

const CHAVE_RASCUNHO = 'fgrcm:p03:rascunho-local-v1';
const idsValidos = new Set(TODAS_QUESTOES_FGRC.map(q => q.id));
const total = TODAS_QUESTOES_FGRC.length;

export default function HomeProvisoria() {
  const router = useRouter();
  const { colors } = useFgrcTheme();
  const [respondidas, setRespondidas] = useState(0);

  useEffect(() => {
    let ativo = true;
    // tenta puxar o progresso que o questionário salvou neste aparelho
    AsyncStorage.getItem(CHAVE_RASCUNHO).then(texto => {
      if (!ativo || !texto) return;
      try {
        const dados: unknown = JSON.parse(texto);
        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return;
        const contagem = Object.entries(dados).filter(([id, nota]) =>
          idsValidos.has(id) && typeof nota === 'number' && Number.isInteger(nota) && nota >= 0 && nota <= 4
        ).length;
        setRespondidas(contagem);
      } catch {
        // se tiver um rascunho inválido deixa o progresso em zero
      }
    }).catch(() => { /* sem armazenamento, a Home continua abrindo */ });
    return () => { ativo = false; };
  }, []);

  const percentual = total ? Math.round((respondidas / total) * 100) : 0;

  function irPara(rota: string) {
    // muda a página pelo Expo Router sem recarregar o aplicativo
    router.push(rota as Href);
  }

  return (
    <ScrollView style={[styles.fundo, { backgroundColor: colors.background }]} contentContainerStyle={styles.area}>
      <View style={styles.container}>
        <Text style={[styles.boasVindas, { color: colors.text }]}>Página inicial</Text>
        <Text style={[styles.subtitulo, { color: colors.muted }]}>Acompanhe as avaliações de segurança cibernética do município</Text>

        {/* esse aviso deixa claro que a demonstração não tem conta real */}
        <View style={[styles.aviso, { backgroundColor: colors.infoBackground, borderColor: colors.border }]}>
          <Text style={[styles.avisoTitulo, { color: colors.blue }]}>Avaliações no dispositivo</Text>
          <Text style={[styles.avisoTexto, { color: colors.text }]}>As avaliações finalizadas são guardadas neste aparelho. Resultados e PDFs usam suas respostas reais. Login e sincronização online ainda precisam da configuração do Supabase.</Text>
        </View>

        <View style={[styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cartaoTitulo, { color: colors.text }]}>Avaliação em andamento</Text>
          <Text style={[styles.detalhe, { color: colors.muted }]}>{respondidas} de {total} questões respondidas</Text>
          <View style={[styles.trilho, { backgroundColor: colors.divider }]}>
            <View style={[styles.progresso, { width: `${percentual}%`, backgroundColor: colors.blue }]} />
          </View>
          <Text style={[styles.porcentagem, { color: colors.blue }]}>{percentual}% concluído</Text>
          <Pressable accessibilityRole="button" onPress={() => irPara('/avaliacoes')} style={[styles.acao, { backgroundColor: colors.blue }]}>
            <Text style={[styles.acaoTexto, { color: colors.blueOnButton }]}>{respondidas > 0 ? 'Continuar avaliação' : 'Começar avaliação'}</Text>
          </Pressable>
        </View>

        <Text style={[styles.secao, { color: colors.text }]}>Acesso rápido</Text>
        <View style={styles.grade}>
          {[
            { nome: 'Avaliações', detalhe: 'Responder ao questionário', rota: '/avaliacoes' },
            { nome: 'Resultados', detalhe: 'Consultar avaliações concluídas', rota: '/resultados-revisao' },
            { nome: 'Relatórios', detalhe: 'Gerar PDF das avaliações concluídas', rota: '/relatorios-revisao' },
            { nome: 'Meu perfil', detalhe: 'Abrir o menu Mais', rota: '/minhas-telas' },
          ].map(item => (
            <Pressable key={item.nome} accessibilityRole="button" onPress={() => irPara(item.rota)} style={({ pressed }) => [styles.atalho, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.76 : 1 }]}>
              <Text style={[styles.atalhoTitulo, { color: colors.text }]}>{item.nome}</Text>
              <Text style={[styles.detalhe, { color: colors.muted }]}>{item.detalhe}</Text>
              <Text style={[styles.abrir, { color: colors.blue }]}>Abrir ›</Text>
            </Pressable>
          ))}
        </View>

        {/* essas opções são secundárias (não precisam ficar misturadas no menu principal) */}
        <Text style={[styles.secao, { color: colors.text }]}>Acesso e conta</Text>
        <View style={[styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable accessibilityRole="button" onPress={() => irPara('/login-revisao')} style={styles.linha}>
            <Text style={[styles.linhaTexto, { color: colors.blue }]}>Ver tela de login</Text>
          </Pressable>
          <View style={[styles.divisor, { backgroundColor: colors.divider }]} />
          <Pressable accessibilityRole="button" onPress={() => irPara('/solicitar-acesso')} style={styles.linha}>
            <Text style={[styles.linhaTexto, { color: colors.blue }]}>Solicitar acesso (teste)</Text>
          </Pressable>
          <View style={[styles.divisor, { backgroundColor: colors.divider }]} />
          <Pressable accessibilityRole="button" onPress={() => irPara('/recuperar-senha')} style={styles.linha}>
            <Text style={[styles.linhaTexto, { color: colors.blue }]}>Recuperar senha (demonstração)</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  area: { paddingVertical: 26, paddingHorizontal: 18, paddingBottom: 44 },
  container: { width: '100%', maxWidth: 900, alignSelf: 'center' },
  boasVindas: { fontSize: 29, fontWeight: '800' },
  subtitulo: { fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 22 },
  aviso: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 18 },
  avisoTitulo: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  avisoTexto: { fontSize: 13, lineHeight: 20 },
  cartao: { borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 18 },
  cartaoTitulo: { fontSize: 18, fontWeight: '800' },
  detalhe: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  trilho: { height: 10, borderRadius: 12, marginTop: 20, overflow: 'hidden' },
  progresso: { height: '100%', borderRadius: 12 },
  porcentagem: { fontSize: 15, fontWeight: '800', marginTop: 9, marginBottom: 18 },
  acao: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 10, alignSelf: 'flex-start' },
  acaoTexto: { fontWeight: '800', fontSize: 14 },
  secao: { fontSize: 19, fontWeight: '800', marginBottom: 14 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  atalho: { flexGrow: 1, flexBasis: 220, minWidth: 185, borderWidth: 1, borderRadius: 14, padding: 18 },
  atalhoTitulo: { fontSize: 16, fontWeight: '800' },
  abrir: { marginTop: 14, fontSize: 13, fontWeight: '800' },
  linha: { paddingVertical: 12 },
  linhaTexto: { fontSize: 14, fontWeight: '700' },
  divisor: { height: 1 },
});
