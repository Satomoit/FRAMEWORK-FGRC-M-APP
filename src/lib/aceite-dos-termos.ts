// [integração 25/11] regras da leitura obrigatória dos Termos de Uso na ativação da conta
// aqui ficam só as "contas" (sem tela), pra dar pra testar sozinho: tests/teste-aceite-termos.cjs
// quem usa: a janela dos termos (src/features/integracao/AceiteDosTermos.tsx),
// a tela Ativar acesso (src/app/ativar-acesso.tsx) e a Home (primeiro acesso com senha provisória)
// ideia geral:
//   1. a janela mostra os Termos de Uso e mede a rolagem
//   2. o botão "Li e aceito" só aparece quando a pessoa chegou no fim do texto
//   3. quando ela aceita, fica guardado NA CONTA qual versão dos termos ela aceitou e quando
import { VERSAO_DO_TEXTO } from '@/lib/termos-e-privacidade';

// o que a gente sabe da rolagem (tudo em pontos da tela):
//   rolagem        = quanto a pessoa já desceu
//   alturaVisivel  = tamanho da "janelinha" onde o texto aparece
//   alturaConteudo = tamanho do texto inteiro
export type MedidasDaRolagem = { rolagem: number; alturaVisivel: number; alturaConteudo: number };

// o que fica guardado na conta (user_metadata do Supabase) quando a pessoa aceita
// (os nomes seguem o padrão dos outros campos da conta: nome_completo, senha_provisoria...)
export type RegistroDoAceite = { termos_aceitos_versao: string; termos_aceitos_em: string };

// folga de 24 pontos: se faltar só um restinho pra chegar no fim, já conta como fim
// (cada celular arredonda a rolagem de um jeito, e com letra grande sobra uns pontinhos)
export const FOLGA_DO_FIM = 24;

// cada toque em "Continuar lendo" desce 85% da parte visível (sobra um pedacinho repetido pra pessoa não se perder)
const PASSO_DA_LEITURA = 0.85;

// true = a pessoa já chegou no fim do texto
// enquanto a tela ainda não mediu nada (alturas zeradas) a resposta é NÃO, pra não liberar o botão sem querer
// se o texto inteiro cabe na tela sem rolar, também conta como fim (não tem o que descer)
export function chegouNoFim(m: MedidasDaRolagem, folga: number = FOLGA_DO_FIM): boolean {
  if (!(m.alturaVisivel > 0) || !(m.alturaConteudo > 0)) return false;
  return m.rolagem + m.alturaVisivel >= m.alturaConteudo - folga;
}

// true = o texto cabe inteiro na parte visível (tela muito grande), então não existe rolagem pra fazer
export function cabeSemRolar(m: MedidasDaRolagem, folga: number = FOLGA_DO_FIM): boolean {
  return chegouNoFim({ ...m, rolagem: 0 }, folga);
}

// até onde dá pra descer (não deixa passar do fim nem ficar negativo)
export function rolagemMaxima(m: MedidasDaRolagem): number {
  return Math.max(0, m.alturaConteudo - m.alturaVisivel);
}

// pra onde a tela vai quando a pessoa toca em "Continuar lendo"
// jaPedido = até onde o botão já mandou descer antes (serve de garantia se o celular não avisar a rolagem)
export function proximaRolagem(m: MedidasDaRolagem, jaPedido: number = 0): number {
  const deOnde = Math.max(m.rolagem, jaPedido, 0);
  return Math.min(rolagemMaxima(m), Math.round(deOnde + m.alturaVisivel * PASSO_DA_LEITURA));
}

// quanto do texto já passou pela tela, de 0 a 1 (é o tamanho da barrinha de progresso)
// usa o ponto mais baixo que a pessoa já viu: se ela subir de novo, a barrinha não volta
export function parteLida(m: MedidasDaRolagem, maisBaixoJaVisto: number = 0): number {
  if (!(m.alturaConteudo > 0) || !(m.alturaVisivel > 0)) return 0;
  const fimVisto = Math.max(maisBaixoJaVisto, m.rolagem + m.alturaVisivel);
  return Math.max(0, Math.min(1, fimVisto / m.alturaConteudo));
}

// monta o que vai ser guardado na conta: a versão do texto (a data dele) e o momento do aceite
// o horário vai no padrão ISO (ex: 2026-11-25T15:45:00.000Z), que é o mesmo das outras datas do Supabase
export function registroDoAceite(agora: Date = new Date(), versao: string = VERSAO_DO_TEXTO): RegistroDoAceite {
  return { termos_aceitos_versao: versao, termos_aceitos_em: agora.toISOString() };
}

// true = essa conta já aceitou ESTA versão dos termos (olha o user_metadata que vem do Supabase)
// se o texto mudar (data nova em VERSAO_DO_TEXTO), o aceite antigo deixa de valer pra essa checagem
// obs: o user_metadata a própria pessoa consegue alterar, então isso é um registro simples, não uma prova forte
export function termosJaAceitos(metadados: unknown, versao: string = VERSAO_DO_TEXTO): boolean {
  if (!metadados || typeof metadados !== 'object') return false;
  const m = metadados as Record<string, unknown>;
  const quando = m.termos_aceitos_em;
  return m.termos_aceitos_versao === versao && typeof quando === 'string' && !Number.isNaN(Date.parse(quando));
}
