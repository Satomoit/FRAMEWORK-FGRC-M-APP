// Geração e exportação do relatório em PDF.
// Dependências: npx expo install expo-print expo-sharing
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Recommendation, Report } from './types';
// [integração] nota máxima, referência, data/hora e explicação do cálculo (mesmas do PDF da web)
import {
  EXPLICACAO_DO_CALCULO,
  comLetraMaiuscula,
  dataHoraDa,
  textoReferencia,
  valorMaximoDa,
} from '@/lib/calcular-relatorio';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const clamp = (n: number) => Math.max(0, Math.min(100, n));

const classStyle: Record<string, string> = {
  Baixo: 'low',
  Intermediário: 'mid',
  Alto: 'high',
};

function bar(value: number, color: string) {
  return `<div class="track"><div class="fill" style="width:${clamp(value)}%;background:${color}"></div></div>`;
}

export function buildHtml(report: Report, recs: Recommendation[]): string {
  const dimensions = (report.dimensions ?? [])
    .map(
      (d) => `
      <div class="dim">
        <div class="dimrow"><span>${escape(d.name)} (${escape(d.code)})</span><b>${d.score}/100</b></div>
        ${bar(d.score, '#0B4F8A')}
      </div>`,
    )
    .join('');

  const points = (report.attentionPoints ?? [])
    .map(
      (p) => `
      <div class="point">
        <span>${escape(p.title)}</span>
        <span class="prio ${p.priority === 'alta' ? 'high' : 'mid'}">Prioridade ${p.priority}</span>
      </div>`,
    )
    .join('');

  const items = recs
    .map(
      (r) => `
      <div class="rec">
        <h3>${escape(r.code)} <span class="prio ${r.priority === 'alta' ? 'high' : 'mid'}">Prioridade ${r.priority}</span></h3>
        <p><b>Resposta registrada:</b> ${r.answerValue} — ${escape(r.answerLabel)}</p>
        <p><b>Solução recomendada:</b> ${escape(r.solution)}</p>
        <p class="ref">Referência: ${escape(r.reference)}</p>
      </div>`,
    )
    .join('');

  // aqui entra a lista completa das perguntas respondidas, inclusive nota 4
  const answers = (report.answers ?? []).map((r, indice) => `
    <article class="answer">
      <h3>${indice + 1}. ${escape(r.codigo)} — ${escape(r.eixo)}</h3>
      <p><b>Pergunta:</b> ${escape(r.pergunta)}</p>
      <p><b>Resposta:</b> ${escape(r.alternativa)} (nota ${r.valor} de ${valorMaximoDa(r)}). ${escape(comLetraMaiuscula(r.descricao))}</p>
      ${r.recomendacao ? `<p><b>Recomendação:</b> ${escape(r.recomendacao)}</p>` : '<p><b>Recomendação:</b> nenhuma. A prática já está no nível mais alto.</p>'}
      <p class="ref"><b>Referência:</b> ${escape(textoReferencia(r.nist))}</p>
    </article>
  `).join('');

  return `<!doctype html><html><head><meta charset="utf-8" />
  <style>
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Helvetica, Arial, sans-serif; color: #14233B; padding: 32px; }
    h1 { color: #0B4F8A; margin-bottom: 4px; }
    h2 { margin-top: 28px; }
    .meta { color: #4A5568; margin-bottom: 20px; }
    .score { font-size: 32px; font-weight: 800; color: #0B4F8A; }
    .badge { font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 12px; margin-left: 12px; }
    .box { border: 1px solid #4A5568; border-radius: 12px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
    .track { height: 8px; border-radius: 4px; background: #D9D9D9; overflow: hidden; }
    .fill { height: 8px; border-radius: 4px; }
    .dim { margin-bottom: 12px; }
    .dimrow { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .point { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #D9DEE5; }
    .rec { border: 1px solid #4A5568; border-radius: 12px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
    .prio { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 10px; margin-left: 8px; }
    .low { background: #C9DDD3; color: #1B6B3A; }
    .mid { background: #D5CBC0; color: #B7791F; }
    .high { background: #D8C3BE; color: #B42318; }
    .ref { color: #4A5568; font-size: 13px; }
    .answer { padding: 10px 0; margin-bottom: 12px; border-bottom: 1px solid #D9DEE5; page-break-inside: avoid; }
    .answer h3 { margin-bottom: 7px; color: #0B4F8A; }
    .answer p { margin: 6px 0; line-height: 1.4; }
    @page { size: A4; margin: 16mm; }
  </style></head><body>
    <h1>FGRC-M — Relatório de avaliação</h1>
    ${report.prefeitura ? `<div class="meta"><b>${escape(report.prefeitura)}</b></div>` : ''}
    <div class="meta">Data da avaliação: ${escape(report.finalizedAt ? dataHoraDa(report.finalizedAt) : report.date)}<br />Código da avaliação: ${escape(report.id)}</div>

    <div class="box">
      <div class="meta" style="margin-bottom:8px">Índice de exposição cibernética municipal</div>
      <div><span class="score">${report.score}/100</span>
        <span class="badge ${classStyle[report.classification] ?? 'mid'}">${escape(report.classification)}</span></div>
      <div style="margin-top:12px">${bar(report.score, '#F58A2E')}</div>
    </div>

    ${dimensions ? `<h2>Resultados por dimensão</h2><div class="box">${dimensions}</div>` : ''}
    ${points ? `<h2>Pontos de atenção</h2><div class="box">${points}</div>` : ''}

    <p class="meta">${escape(EXPLICACAO_DO_CALCULO)}</p>
    <h2>Respostas completas (${report.answers?.length ?? 0})</h2>
    ${answers}
    <h2>Recomendações prioritárias</h2>${items || '<p>Não há recomendações corretivas cadastradas para estas respostas.</p>'}
  </body></html>`;
}

export async function generateReportPdf(report: Report, recs: Recommendation[]) {
  // não exportamos uma lista vazia ou um resultado de exemplo no lugar de uma avaliação real
  if (!report.answers?.length) throw new Error('Não há respostas registradas para gerar o PDF');
  const { uri } = await Print.printToFileAsync({ html: buildHtml(report, recs) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Relatório ${report.date}`,
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}