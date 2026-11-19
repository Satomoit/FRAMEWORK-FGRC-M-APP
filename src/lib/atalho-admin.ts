// [integração 19/11] lembra se a conta é da administração pra mostrar o atalho do menu Mais NA HORA
// problema: o menu Mais abria sem a opção "Área administrativa" e ela só aparecia uns segundos depois
// (o app esperava o banco responder toda vez que o menu abria)
// agora: mostra o último resultado conhecido DESTA conta (memória ou aparelho) e confere no banco por trás
// importante: isso só decide se o BOTÃO aparece. Quem decide se a pessoa entra continua sendo
// a tela /admin + o banco (RLS e estado_admin_fgrcm), então guardar aqui não abre nada pra ninguém
import AsyncStorage from '@react-native-async-storage/async-storage';

import { verificarEstadoAdmin } from '@/lib/admin';
import { supabase } from '@/lib/supabase';

export type EstadoDoAtalho = 'nao_admin' | 'precisa_mfa' | 'ok';

// uma chave por conta (se trocar de conta no mesmo celular, uma não pega o resultado da outra)
const PREFIXO = 'fgrcm:atalho-admin:v1:';

// último resultado desta vez que o app ta aberto (deixa o menu mostrar o botão sem esperar nada)
let ultimo: { userId: string; estado: EstadoDoAtalho } | null = null;

// só aceita os 3 valores conhecidos (se o que tiver guardado estiver estragado, ignora)
export function lerEstadoDoAtalho(valor: unknown): EstadoDoAtalho | null {
  return valor === 'ok' || valor === 'precisa_mfa' || valor === 'nao_admin' ? valor : null;
}

// o que o menu usa pra começar já desenhado (sem esperar internet nem leitura do aparelho)
export function estadoDoAtalhoNaMemoria(): EstadoDoAtalho | null {
  return ultimo?.estado ?? null;
}

async function idDaConta(): Promise<string | null> {
  // getSession lê a sessão guardada no aparelho (não vai na internet)
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

// o que tinha guardado no aparelho pra conta que ta logada agora
export async function estadoDoAtalhoGuardado(): Promise<EstadoDoAtalho | null> {
  const userId = await idDaConta();
  if (!userId) return null;
  if (ultimo && ultimo.userId === userId) return ultimo.estado;
  try {
    const estado = lerEstadoDoAtalho(await AsyncStorage.getItem(PREFIXO + userId));
    if (estado) ultimo = { userId, estado };
    return estado;
  } catch {
    return null;
  }
}

// pergunta pro banco e guarda o resultado
// sem internet (ou erro) devolve o que já tinha: o botão não some só pq a conexão caiu
export async function conferirEGuardarEstadoDoAtalho(): Promise<EstadoDoAtalho | null> {
  const userId = await idDaConta();
  if (!userId) { ultimo = null; return null; }
  try {
    const resposta = await verificarEstadoAdmin();
    const estado = lerEstadoDoAtalho(resposta);
    if (!estado) { ultimo = null; return null; }
    ultimo = { userId, estado };
    AsyncStorage.setItem(PREFIXO + userId, estado).catch(() => {});
    return estado;
  } catch {
    return estadoDoAtalhoGuardado();
  }
}

// saiu da conta: esquece o da memória (o do aparelho fica, pq é por conta e não abre nada sozinho)
export function esquecerEstadoDoAtalho() {
  ultimo = null;
}
