// [atualização obrigatória] contas com o número da versão do app (ex: 1.1.0)
// sem tela e sem Supabase aqui, pra dar pra testar sozinho (tests/teste-versao.cjs)

// [entrega] nome da versão que aparece pra quem usa o app (primeira entrega oficial do MVP)
// NÃO é o número técnico: o técnico continua no app.json (1.2.0 e versionCode 3) e é ele que
// identifica o build e decide a atualização obrigatória. Esse aqui é só o "nome de apresentação"
export const NOME_DA_VERSAO = '1.0';

export type SituacaoDaVersao = 'ok' | 'atualizacao_disponivel' | 'atualizacao_obrigatoria';

export type ConfiguracaoDeVersao = {
  versao_atual: string | null;
  versao_minima: string | null;
  obrigatoria: boolean | null;
};

// "1.10.2" -> [1, 10, 2]; qualquer coisa fora do padrão volta null (ai a gente não bloqueia ninguém)
export function lerVersao(versao: string | null | undefined): [number, number, number] | null {
  const partes = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(String(versao ?? '').trim());
  if (!partes) return null;
  return [Number(partes[1]), Number(partes[2]), Number(partes[3])];
}

// compara número por número (1.10.0 é maior que 1.9.0, coisa que a comparação de texto erra)
// -1 = a é mais velha, 0 = iguais, 1 = a é mais nova, null = alguma das duas não é uma versão válida
export function compararVersoes(a: string | null | undefined, b: string | null | undefined): -1 | 0 | 1 | null {
  const va = lerVersao(a);
  const vb = lerVersao(b);
  if (!va || !vb) return null;
  for (let i = 0; i < 3; i++) {
    if (va[i] < vb[i]) return -1;
    if (va[i] > vb[i]) return 1;
  }
  return 0;
}

// decide o que mostrar pra quem ta com a versão "instalada"
//   obrigatória = instalada abaixo da mínima E a administração marcou "obrigatória"
//   disponível  = tem versão mais nova, mas a instalada ainda serve (só um aviso que dá pra fechar)
// se não der pra saber a versão instalada (ou a configuração vier estranha), não bloqueia: melhor deixar usar
export function situacaoDaVersao(instalada: string | null | undefined, cfg: ConfiguracaoDeVersao | null | undefined): SituacaoDaVersao {
  if (!cfg || !lerVersao(instalada)) return 'ok';
  if (cfg.obrigatoria && compararVersoes(instalada, cfg.versao_minima) === -1) return 'atualizacao_obrigatoria';
  if (compararVersoes(instalada, cfg.versao_atual) === -1) return 'atualizacao_disponivel';
  return 'ok';
}

// ---------------------------------------------------------------------------------------------
// [integração 19/11] bloqueio LEMBRADO da atualização obrigatória
// problema: o bloqueio só acontecia quando o servidor respondia. Quem já tinha visto a tela de
// "atualização obrigatória" podia desligar a internet, abrir o app de novo e continuar na versão velha
// solução: quando o servidor diz que ESTA versão instalada é obrigatória de atualizar, o app guarda isso
// no aparelho e continua bloqueando mesmo sem internet, até o servidor dizer o contrário
// quem nunca viu o aviso (ficou offline o tempo todo) continua usando normalmente: as avaliações são
// locais e o app não tem como saber de uma versão nova sem internet (esse é o limite real do offline)

export type BloqueioLembrado = {
  instalada: string;
  minima: string;
  maisNova: string | null;
  url: string | null;
  mensagem: string | null;
};

// vale só se foi guardado pra ESTA versão (depois de atualizar o app, o lembrete antigo não vale mais)
// e se a versão instalada ainda é menor que a mínima guardada
export function bloqueioLembradoVale(instalada: string | null | undefined, lembrado: BloqueioLembrado | null | undefined): boolean {
  if (!lembrado || !lerVersao(instalada)) return false;
  return lembrado.instalada === instalada && compararVersoes(instalada, lembrado.minima) === -1;
}

// lê o que tava guardado; qualquer coisa estranha vira null (aí não bloqueia ninguém por engano)
export function lerBloqueioLembrado(texto: string | null | undefined): BloqueioLembrado | null {
  try {
    const d = JSON.parse(texto ?? 'null') as Partial<BloqueioLembrado> | null;
    if (!d || !lerVersao(d.instalada) || !lerVersao(d.minima)) return null;
    return {
      instalada: d.instalada as string,
      minima: d.minima as string,
      maisNova: typeof d.maisNova === 'string' ? d.maisNova : null,
      // só guarda link https (igual o banco e a consulta do sistema)
      url: typeof d.url === 'string' && /^https:\/\/\S+$/.test(d.url) ? d.url : null,
      mensagem: typeof d.mensagem === 'string' ? d.mensagem : null,
    };
  } catch {
    return null;
  }
}
