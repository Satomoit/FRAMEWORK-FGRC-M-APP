import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import LoginScreen from '@/features/p01-login-inicio/LoginScreen';
import { supabase } from '@/lib/supabase';

export default function IndexScreen() {
  const [verificando, setVerificando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setAutenticado(Boolean(session));
      setVerificando(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (verificando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#11558B"
          accessibilityLabel="Verificando sessão"
        />
      </View>
    );
  }

  if (autenticado) {
    return <Redirect href="/inicio" />;
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F8FC',
  },
});