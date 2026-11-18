// [entrada nova] "porteiro" das telas públicas de entrada (Conheça o FGRC-M em "/" e o Login em "/entrar")
// era o EntradaComLogin que ficava no src/app/index.tsx; saiu de lá pra ser usado nas duas rotas
//   * enquanto confere a sessão salva, mostra só o carregando (sem piscar a tela errada)
//   * conta logada E liberada pela equipe vai direto pra Home (/inicio)
//   * sem login (ou conta que não foi liberada) vê a tela pública que veio em children
// a manutenção e a versão obrigatória continuam valendo pq a GuardaDoSistema fica por fora de tudo (no _layout)
import { Redirect } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useFgrcTheme } from '@/components/fgrc-colors';
import { contaLiberada } from '@/lib/conta';
import { supabase } from '@/lib/supabase';

export function SoSemLogin({ children }: { children: ReactNode }) {
  const { colors } = useFgrcTheme();
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    // quando o Supabase responde, a gente sabe se tem alguém logado
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      // [segurança] usa a mesma regra do _layout: sem isso, uma conta não liberada ia pra /inicio,
      // o _layout mandava de volta pra cá e ficava num vai e volta sem fim
      setAutenticado(sessao ? contaLiberada(sessao.user) : false);
      setVerificando(false);
    });

    // quando sair dessa tela para de ouvir mudanças da sessão
    return () => subscription.unsubscribe();
  }, []);

  if (verificando) {
    return (
      <View style={[styles.carregando, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.blue} accessibilityLabel="Verificando sessão" />
      </View>
    );
  }

  // a Home de verdade só abre com uma sessão válida
  if (autenticado) return <Redirect href="/inicio" />;
  return <>{children}</>;
}

const styles = StyleSheet.create({
  carregando: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
