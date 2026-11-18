// [integração] tudo que a avaliação guarda NO APARELHO passa por aqui (rascunho e histórico)
// por que um arquivo só: antes a chave do rascunho e a validação das respostas tavam copiadas
// em 2 lugares (rota de Avaliações e resumo da Home). Agora se mudar, muda num lugar só
//
// separação por conta: cada pessoa logada tem as próprias chaves (o id da conta vai no nome)
// assim, se duas contas usarem o mesmo navegador/celular, uma não vê a avaliação da outra
// as respostas continuam só no aparelho: nada daqui vai pro Supabase (requisito RNF-001/RNF-002)
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TODAS_QUESTOES_FGRC } from '@/features/p03-avaliacoes-questionario/questionarioData';
import { supabase } from '@/lib/supabase';

// chaves de antes da separação por conta (os dados antigos ficam lá até a pessoa decidir trazer)
export const CHAVE_RASCUNHO_ANTIGA = 'fgrcm:p03:rascunho-local-v1';
export const CHAVE_HISTORICO_ANTIGA = 'fgrcm:avaliacoes-concluidas:v1';

const chaveDoRascunho = (idConta: string) => `fgrcm:p03:rascunho:v2:${idConta}`;
const chaveDoHistorico = (idConta: string) => `fgrcm:avaliacoes-concluidas:v2:${idConta}`;

export type Respostas = Record<string, number>;

const idsValidos = new Set(TODAS_QUESTOES_FGRC.map(q => q.id));

// pega o id da conta logada pela sessão salva no aparelho (não precisa de internet)
// sem login não tem de quem ler, então dá erro em vez de misturar dados
export async function idDaContaAtual(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user?.id;
  if (!id) throw new Error('Entre na sua conta para ver as avaliações');
  return id;
}

// só aceita notas inteiras de 0 a 4 em perguntas que existem no questionário
// (assim um rascunho velho ou mexido não quebra a tela)
export function filtrarRespostasValidas(dados: unknown): Respostas {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return {};
  return Object.fromEntries(
    Object.entries(dados).filter(
      ([id, valor]) =>
        idsValidos.has(id) && typeof valor === 'number' && Number.isInteger(valor) && valor >= 0 && valor <= 4,
    ),
  );
}

// ---------- rascunho (avaliação em andamento) ----------

// danificado = tinha alguma coisa salva mas não deu pra ler (a tela avisa a pessoa)
export async function lerRascunho(): Promise<{ respostas: Respostas; danificado: boolean }> {
  const texto = await AsyncStorage.getItem(chaveDoRascunho(await idDaContaAtual()));
  if (!texto) return { respostas: {}, danificado: false };
  try {
    return { respostas: filtrarRespostasValidas(JSON.parse(texto)), danificado: false };
  } catch {
    return { respostas: {}, danificado: true };
  }
}

export async function salvarRascunho(respostas: Respostas): Promise<void> {
  await AsyncStorage.setItem(chaveDoRascunho(await idDaContaAtual()), JSON.stringify(respostas));
}

export async function limparRascunho(): Promise<void> {
  await AsyncStorage.removeItem(chaveDoRascunho(await idDaContaAtual()));
}

// ---------- histórico (avaliações finalizadas) ----------
// aqui só lê e grava o texto; quem confere se cada avaliação ta inteira é o avaliacoes-reais.ts

export async function lerHistoricoBruto(): Promise<string | null> {
  return AsyncStorage.getItem(chaveDoHistorico(await idDaContaAtual()));
}

export async function gravarHistoricoBruto(texto: string): Promise<void> {
  await AsyncStorage.setItem(chaveDoHistorico(await idDaContaAtual()), texto);
}

// ---------- dados de antes da separação por conta ----------

// o que ficou de antes (sem dono) neste aparelho: quantas avaliações e se tem rascunho
export async function verificarDadosAntigos(): Promise<{ avaliacoes: number; rascunho: boolean }> {
  const [texto, rascunho] = await Promise.all([
    AsyncStorage.getItem(CHAVE_HISTORICO_ANTIGA),
    AsyncStorage.getItem(CHAVE_RASCUNHO_ANTIGA),
  ]);
  let avaliacoes = 0;
  try {
    const lista: unknown = texto ? JSON.parse(texto) : [];
    avaliacoes = Array.isArray(lista) ? lista.length : 0;
  } catch {
    avaliacoes = 0;
  }
  return { avaliacoes, rascunho: Boolean(rascunho) };
}

// a pessoa confirmou que as avaliações antigas são dela: junta com o histórico da conta
// só apaga as chaves antigas DEPOIS de gravar na conta (se der erro no meio, nada se perde)
export async function trazerDadosAntigosParaConta(): Promise<number> {
  const idConta = await idDaContaAtual();
  const textoAntigo = await AsyncStorage.getItem(CHAVE_HISTORICO_ANTIGA);
  const antigas: unknown = textoAntigo ? JSON.parse(textoAntigo) : [];
  if (!Array.isArray(antigas)) throw new Error('As avaliações antigas estão danificadas');

  const textoAtual = await AsyncStorage.getItem(chaveDoHistorico(idConta));
  const atuais: unknown = textoAtual ? JSON.parse(textoAtual) : [];
  const listaAtual = Array.isArray(atuais) ? atuais : [];

  // não duplica se a mesma avaliação já tiver sido trazida antes
  const idsAtuais = new Set(listaAtual.map((a: { id?: string }) => a?.id));
  const novas = antigas.filter((a: { id?: string }) => !idsAtuais.has(a?.id));
  await AsyncStorage.setItem(chaveDoHistorico(idConta), JSON.stringify([...listaAtual, ...novas]));

  // o rascunho antigo só vem se a conta ainda não tiver um rascunho próprio
  const rascunhoAntigo = await AsyncStorage.getItem(CHAVE_RASCUNHO_ANTIGA);
  if (rascunhoAntigo && !(await AsyncStorage.getItem(chaveDoRascunho(idConta)))) {
    await AsyncStorage.setItem(chaveDoRascunho(idConta), rascunhoAntigo);
  }

  await AsyncStorage.removeItem(CHAVE_HISTORICO_ANTIGA);
  await AsyncStorage.removeItem(CHAVE_RASCUNHO_ANTIGA);
  return novas.length;
}
