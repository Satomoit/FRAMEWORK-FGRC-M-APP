// Geração e exportação do relatório em PDF.
// Dependências: npx expo install expo-print expo-sharing
// [correção Android] + expo-file-system (já vem com o Expo; agora ta declarado no package.json)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Recommendation, Report } from './types';
// [integração] nota máxima, referência, data/hora e explicação do cálculo (mesmas do PDF da web)
import {
  EXPLICACAO_DO_CALCULO,
  comLetraMaiuscula,
  dataHoraDa,
  textoReferencia,
  valorMaximoDa,
} from '@/lib/calcular-relatorio';
// [correção Android] nome padrão do arquivo: FGRC-M_Avaliacao_2026-11-18_AB12CD.pdf
import { nomeDoArquivoPdf } from '@/lib/nome-do-pdf';

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

// [correção Android] o que cada botão devolve pra tela mostrar um aviso
// ok = deu certo | mensagem = texto pro aviso (vazio = não precisa avisar nada)
export type ResultadoPdf = { ok: boolean; mensagem: string; nomeArquivo: string };

const TIPO_PDF = 'application/pdf';
// última pasta que a pessoa escolheu pra salvar (a janela de escolher pasta já abre nela da próxima vez)
const CHAVE_ULTIMA_PASTA = 'fgrcm:pdf:ultima-pasta';

// [correção Android] gera o PDF e deixa ele com o nome certo numa pasta interna do app (cache)
// antes o arquivo ficava com o nome aleatório do expo-print (ex: 3f2a9c...pdf) e era isso que ia pro WhatsApp
// essa cópia interna só o app enxerga; quem coloca o PDF num lugar que vc acha é o Baixar (lá embaixo)
async function prepararArquivo(report: Report, recs: Recommendation[]): Promise<File> {
  // não exportamos uma lista vazia ou um resultado de exemplo no lugar de uma avaliação real
  if (!report.answers?.length) throw new Error('Não há respostas registradas para gerar o PDF');
  const { uri } = await Print.printToFileAsync({ html: buildHtml(report, recs) });
  const pasta = new Directory(Paths.cache, 'relatorios-fgrcm');
  pasta.create({ intermediates: true, idempotent: true });
  const arquivo = new File(uri);
  // o move muda o "endereço" (uri) do próprio arquivo pro novo lugar, já com o nome novo
  await arquivo.move(new File(pasta, nomeDoArquivoPdf(report.id, report.finalizedAt)), { overwrite: true });
  return arquivo;
}

// BAIXAR: grava uma cópia do PDF numa pasta que vc escolhe (Downloads, Documentos, Drive...)
// no Android quem mostra a lista de pastas é o próprio sistema (não precisa de permissão extra)
// obs: a partir do Android 11 o sistema não deixa usar a raiz da pasta Download direto,
// então a pessoa escolhe (ou cria) uma pasta dentro dela, por exemplo Download/FGRC-M
// no iPhone não existe "pasta Downloads": lá a gente abre o compartilhar, que tem "Salvar em Arquivos"
export async function baixarRelatorioPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  const arquivo = await prepararArquivo(report, recs);
  const nome = arquivo.name;
  if (Platform.OS !== 'android') {
    return compartilharArquivo(arquivo, 'Salvar o PDF');
  }

  let pasta: Directory;
  try {
    const ultima = await AsyncStorage.getItem(CHAVE_ULTIMA_PASTA).catch(() => null);
    pasta = await Directory.pickDirectoryAsync(ultima ?? undefined);
  } catch {
    // fechou a janela sem escolher (ou o celular não tem o seletor de pastas)
    return { ok: false, mensagem: 'Nenhuma pasta foi escolhida, então o PDF não foi salvo. Toque em Baixar PDF de novo e escolha uma pasta.', nomeArquivo: nome };
  }
  await AsyncStorage.setItem(CHAVE_ULTIMA_PASTA, pasta.uri).catch(() => {});

  // createFile pede pro sistema criar o arquivo na pasta escolhida
  // se já existir um com o mesmo nome, o Android cria outro com (1) no final em vez de apagar o antigo
  const copia = pasta.createFile(nome, TIPO_PDF);
  await copia.write(await arquivo.bytes());
  const nomeFinal = textoLegivel(copia.uri).split('/').pop() || nome;
  return {
    ok: true,
    mensagem: `PDF salvo em "${textoLegivel(pasta.uri)}" com o nome ${nomeFinal}.`,
    nomeArquivo: nomeFinal,
  };
}

// o Android devolve endereços tipo content://...tree/primary%3ADownload%2FFGRC-M
// isso aqui transforma em "Download/FGRC-M" pra mostrar no aviso
function textoLegivel(uri: string): string {
  let texto = uri;
  try { texto = decodeURIComponent(uri); } catch { /* fica como veio */ }
  const depoisDosDoisPontos = texto.split(':').pop() ?? texto;
  return depoisDosDoisPontos.replace(/^\/+/, '') || 'pasta escolhida';
}

// ABRIR: abre o PDF num leitor do celular (Google Drive, leitor de PDF do aparelho etc)
// o próprio expo-file-system passa o arquivo pro app leitor de um jeito seguro (sem link público)
export async function abrirRelatorioPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  const arquivo = await prepararArquivo(report, recs);
  const nome = arquivo.name;
  if (await arquivo.canPreview({ mimeType: TIPO_PDF })) {
    await arquivo.preview({ mimeType: TIPO_PDF, title: nome });
    return { ok: true, mensagem: '', nomeArquivo: nome };
  }
  return {
    ok: false,
    mensagem: 'Não encontramos um app para abrir PDF neste celular. Instale um leitor de PDF (ou o Google Drive) ou use Compartilhar.',
    nomeArquivo: nome,
  };
}

// COMPARTILHAR: manda o ARQUIVO PDF (não um texto) pra WhatsApp, e-mail, Drive...
// antes o botão Compartilhar mandava só uma frase de resumo, por isso "não funcionava como esperado"
export async function compartilharRelatorioPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  const arquivo = await prepararArquivo(report, recs);
  return compartilharArquivo(arquivo, 'Compartilhar o relatório');
}

async function compartilharArquivo(arquivo: File, titulo: string): Promise<ResultadoPdf> {
  const nome = arquivo.name;
  if (!(await Sharing.isAvailableAsync())) {
    return { ok: false, mensagem: 'Este aparelho não permite compartilhar arquivos pelo app.', nomeArquivo: nome };
  }
  await Sharing.shareAsync(arquivo.uri, { mimeType: TIPO_PDF, dialogTitle: titulo, UTI: 'com.adobe.pdf' });
  return { ok: true, mensagem: '', nomeArquivo: nome };
}

// [integração] nome antigo continua existindo pra quem já chamava ele (tela de Recomendações e index.ts)
// agora ele faz o mesmo que o Baixar PDF
export async function generateReportPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  return baixarRelatorioPdf(report, recs);
}