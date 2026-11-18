// [correção Android] nome do arquivo do relatório em PDF
// formato: FGRC-M_Avaliacao_2026-11-18_AB12CD.pdf
//   * data = dia em que a avaliação foi finalizada (no fuso do aparelho)
//   * AB12CD = código curto que sai do id da avaliação (assim duas avaliações do mesmo dia não ficam com nome igual)
// sem nome de pessoa, e-mail ou prefeitura no nome (o arquivo pode ser encaminhado pra qualquer um)
// só letras sem acento, números, - e _ (funciona no Android, no Windows e no WhatsApp)

// transforma qualquer texto em 6 letras/números maiúsculos, sempre iguais pro mesmo texto
// (é um "resumo" do id, não dá pra voltar do código pro id)
export function codigoCurto(texto: string): string {
  // FNV-1a de 32 bits (conta simples e rápida, não é criptografia)
  let hash = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

// data no formato 2026-11-18 usando o fuso do aparelho
// (com toISOString uma avaliação finalizada às 22h no Brasil ia sair com o dia seguinte)
export function dataParaArquivo(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function nomeDoArquivoPdf(idDaAvaliacao: string, finalizadaEm?: string | null, agora: Date = new Date()): string {
  const quando = finalizadaEm ? new Date(finalizadaEm) : null;
  // se a data vier estragada usa o dia de hoje, pra nunca sair "NaN-NaN-NaN" no nome
  const data = quando && !Number.isNaN(quando.getTime()) ? quando : agora;
  return `FGRC-M_Avaliacao_${dataParaArquivo(data)}_${codigoCurto(String(idDaAvaliacao || 'avaliacao'))}.pdf`;
}
