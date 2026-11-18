// [manutenção e atualização] pergunta pro Supabase se o FGRC-M ta em manutenção e se a versão instalada ainda serve
// quem chama é a GuardaDoSistema (src/components/guarda-do-sistema.tsx), quando o app abre e quando volta pra frente
// regra combinada:
//   * sem internet NÃO é manutenção: o app continua funcionando com as avaliações salvas no aparelho
//   * erro do servidor também NÃO é manutenção: aparece só um aviso pequeno
//   * manutenção e versão mínima só valem quando o servidor RESPONDEU dizendo isso
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { situacaoDaVersao, type SituacaoDaVersao } from '@/lib/versao';

export type Conexao = 'ok' | 'sem_conexao' | 'servico_indisponivel';

export type EstadoDoSistema = {
  conexao: Conexao;
  manutencao: { mensagem: string | null; previsaoRetorno: string | null } | null;
  versao: {
    situacao: SituacaoDaVersao;
    instalada: string | null;
    maisNova: string | null;
    minima: string | null;
    url: string | null;
    mensagem: string | null;
    notas: string | null;
  };
};

// versão que foi junto quando o app foi gerado (vem do "version" do app.json)
// no APK ela fica gravada dentro do app, então um APK velho continua dizendo a versão velha
export function versaoInstalada(): string | null {
  const v = Constants.expoConfig?.version;
  return typeof v === 'string' && v ? v : null;
}

// android, web ou ios (é o nome da linha na tabela app_versoes)
export function plataformaDoApp(): 'android' | 'web' | 'ios' {
  return Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : 'web';
}

// sem resposta em 8 segundos = trata como sem conexão (não fica girando pra sempre)
const LIMITE_MS = 8000;

// "Failed to fetch" (navegador) / "Network request failed" (celular) = não chegou no servidor
function pareceSemInternet(texto: string): boolean {
  return /fetch|network|internet|timeout|timed out|abort/i.test(texto);
}

type RespostaDoBanco = {
  manutencao: { mensagem: string | null; previsao_retorno: string | null } | null;
  versao: {
    versao_atual: string | null;
    versao_minima: string | null;
    obrigatoria: boolean | null;
    url_atualizacao: string | null;
    mensagem: string | null;
    notas: string | null;
  } | null;
};

export async function consultarSistema(): Promise<EstadoDoSistema> {
  const instalada = versaoInstalada();
  const semNada: EstadoDoSistema = {
    conexao: 'ok',
    manutencao: null,
    versao: { situacao: 'ok', instalada, maisNova: null, minima: null, url: null, mensagem: null, notas: null },
  };

  // no modo de revisão (EXPO_PUBLIC_PREVIEW_MODE) não existe banco, então não tem o que perguntar
  if (typeof supabase.rpc !== 'function') return semNada;

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), LIMITE_MS);
  try {
    const { data, error } = await supabase
      .rpc('estado_do_sistema_fgrcm', { p_plataforma: plataformaDoApp() })
      .abortSignal(controle.signal);

    if (error) {
      // PGRST202 = a função ainda não existe no banco (migração não aplicada): segue normal, sem bloquear
      if (error.code === 'PGRST202') return semNada;
      return { ...semNada, conexao: pareceSemInternet(`${error.message} ${error.details ?? ''}`) ? 'sem_conexao' : 'servico_indisponivel' };
    }

    const r = (data ?? {}) as RespostaDoBanco;
    const v = r.versao;
    return {
      conexao: 'ok',
      manutencao: r.manutencao
        ? { mensagem: r.manutencao.mensagem?.trim() || null, previsaoRetorno: r.manutencao.previsao_retorno ?? null }
        : null,
      versao: {
        situacao: situacaoDaVersao(instalada, v),
        instalada,
        maisNova: v?.versao_atual ?? null,
        minima: v?.versao_minima ?? null,
        // só aceita link https (o banco também confere, isso aqui é a segunda trava)
        url: v?.url_atualizacao && /^https:\/\/\S+$/.test(v.url_atualizacao) ? v.url_atualizacao : null,
        mensagem: v?.mensagem?.trim() || null,
        notas: v?.notas?.trim() || null,
      },
    };
  } catch (e) {
    return { ...semNada, conexao: pareceSemInternet(String(e)) ? 'sem_conexao' : 'servico_indisponivel' };
  } finally {
    clearTimeout(relogio);
  }
}
