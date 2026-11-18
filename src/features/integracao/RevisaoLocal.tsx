import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// atalhos só pra conferir as telas que o grupo ja criou
// as páginas de P05/P06 usam os exemplos que vieram no código da Aline
const rotas = [
  { titulo: 'P01 — Login (sem autenticação real)', caminho: '/login-revisao' },
  { titulo: 'P02 — Solicitar acesso (somente interface)', caminho: '/solicitar-acesso' },
  { titulo: 'P02 — Confirmação visual', caminho: '/explore' },
  { titulo: 'P03 — Avaliações e questionário (rascunho local)', caminho: '/avaliacoes' },
  { titulo: 'P04 — Revisar avaliação (tela independente)', caminho: '/revisar-avaliacao' },
  { titulo: 'P04 — Avaliação finalizada (tela independente)', caminho: '/avaliacao-finalizada' },
  { titulo: 'P05 — Resultados de exemplo', caminho: '/resultados-revisao' },
  { titulo: 'P06 — Relatórios de exemplo', caminho: '/relatorios-revisao' },
  { titulo: 'P07/P09 — Recuperação e Meu Perfil (demonstração)', caminho: '/minhas-telas' },
  { titulo: 'P08 — Criar nova senha (sem alterar no servidor)', caminho: '/criar-nova-senha' },
  { titulo: 'P10 — Editar perfil (demonstração)', caminho: '/editar-perfil' },
] as const;

// essa página aparece só quando EXPO_PUBLIC_PREVIEW_MODE=true
export default function RevisaoLocal() {
  const router = useRouter();
  const escuro = useColorScheme() === 'dark';
  const fundo = escuro ? '#101827' : '#F4F7FC';
  const cartao = escuro ? '#213049' : '#FFFFFF';
  const texto = escuro ? '#FFFFFF' : '#17263E';

  return (
    <SafeAreaView style={[styles.raiz, { backgroundColor: fundo }]}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={[styles.titulo, { color: texto }]}>FGRC-M — Revisão local</Text>
        <View style={[styles.aviso, { backgroundColor: cartao }]}>
          <Text style={{ color: texto }}>
            Versão de testes sem backend: não cria contas, não envia e-mails e não registra pedidos reais
          </Text>
        </View>

        {/* desenha um botão pra cada tela que a gente quer conferir */}
        {rotas.map(rota => (
          <Pressable
            key={rota.caminho}
            accessibilityRole="button"
            onPress={() => router.push(rota.caminho as Href)}
            style={({ pressed }) => [styles.botao, { backgroundColor: cartao, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.botaoTexto, { color: texto }]}>{rota.titulo}</Text>
          </Pressable>
        ))}
        <Text style={[styles.rodape, { color: texto }]}>
          As telas P03, P04 e P05 ainda não compartilham os mesmos resultados, e o rascunho da P03 fica só neste aparelho
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: { width: '100%', maxWidth: 660, alignSelf: 'center', padding: 24, paddingBottom: 60 },
  titulo: { fontSize: 25, fontWeight: '800', marginBottom: 15 },
  aviso: { padding: 16, borderRadius: 12, marginBottom: 20 },
  botao: { minHeight: 52, borderRadius: 12, padding: 16, marginBottom: 10, justifyContent: 'center' },
  botaoTexto: { fontSize: 15, fontWeight: '600' },
  rodape: { marginTop: 16, fontSize: 13, lineHeight: 20 },
});
