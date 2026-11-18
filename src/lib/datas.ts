// [integração] datas no fuso do aparelho (o toISOString usa UTC e depois das 21h mostrava o dia seguinte)
// fica num arquivo só pra o PDF, as telas de resultado e a área administrativa mostrarem a data igual
// ex: dataDa → 18/11/2026 | dataHoraDa → 18/11/2026 às 14:05
export function dataDa(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function dataHoraDa(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

// [manutenção e atualização] lê o que a administração digitou no painel
// "18/11/2026 22:30" -> data no fuso do aparelho (ISO pra gravar no banco)
// vazio = sem previsão (null) | qualquer coisa estranha ou data que não existe (31/02) = 'invalida'
export function lerDataHoraDigitada(texto: string): string | null | 'invalida' {
  const limpo = texto.trim();
  if (!limpo) return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/.exec(limpo);
  if (!m) return 'invalida';
  const [dia, mes, ano, hora, minuto] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0)];
  const d = new Date(ano, mes - 1, dia, hora, minuto);
  // o Date "conserta" 31/02 pra 03/03; se mudou, a data digitada não existe
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia || hora > 23 || minuto > 59) return 'invalida';
  return d.toISOString();
}

// mesma ideia, só a data (campo "publicada em"): "18/11/2026" -> "2026-11-18"
export function lerDataDigitada(texto: string): string | null | 'invalida' {
  const limpo = texto.trim();
  if (!limpo) return null;
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(limpo)) return 'invalida';
  const iso = lerDataHoraDigitada(limpo);
  if (iso === null || iso === 'invalida') return 'invalida';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// o contrário, pra preencher o campo com o que já ta salvo: ISO -> "18/11/2026 22:30"
export function paraDigitar(iso: string | null | undefined, comHora = true): string {
  if (!iso) return '';
  // data pura (2026-11-18) vira meia-noite local, senão o fuso mudaria o dia
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dia = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  return comHora ? `${dia} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : dia;
}
