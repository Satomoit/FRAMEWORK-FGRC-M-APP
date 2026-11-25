// no navegador a gente baixa um PDF de verdade (não é print da tela)
// o arquivo pdf.ts continua cuidando do PDF no Android/iOS
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import type { Recommendation, Report } from './types';
// [integração] nota máxima, referência, data/hora e explicação do cálculo saem do mesmo lugar das telas
import {
  comLetraMaiuscula,
  dataHoraDa,
  // [integração 25/11] o texto de "como ler" agora depende da avaliação (as antigas tinham o AWR até 3)
  explicacaoDoCalculo,
  textoReferencia,
  valorMaximoDa,
} from '@/lib/calcular-relatorio';
// [correção Android] mesmo nome de arquivo do celular: FGRC-M_Avaliacao_2026-11-18_AB12CD.pdf
import { nomeDoArquivoPdf } from '@/lib/nome-do-pdf';

const LARGURA = 595.28; // página A4 em pontos
const ALTURA = 841.89;
const MARGEM = 45;

// [correção Android] mesmo formato de resposta do pdf.ts (celular), pra tela não precisar saber onde roda
export type ResultadoPdf = { ok: boolean; mensagem: string; nomeArquivo: string };

// esse método recebe exatamente a avaliação que o usuário finalizou
// [correção Android] agora ele só MONTA o PDF; baixar, abrir e compartilhar ficam lá embaixo
async function montarPdf(
  report: Report,
  recs: Recommendation[],
): Promise<Blob> {
  // não gera um documento vazio ou com dados de exemplo
  if (!report.answers?.length) {
    throw new Error('Essa avaliação não possui respostas para gerar o PDF');
  }

  // no Expo web o servidor também analisa este arquivo
  // por isso só acessamos document e window quando a pessoa clicar em baixar
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('O download do PDF deve ser realizado no navegador');
  }

  const pdf = await PDFDocument.create();
  pdf.setTitle('FGRC-M - Relatório de avaliação');
  pdf.setAuthor('FGRC-M');

  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const negrito = await pdf.embedFont(StandardFonts.HelveticaBold);
  const aceitos = new Set(fonte.getCharacterSet());
  const azul = rgb(0.06, 0.29, 0.53);
  const texto = rgb(0.11, 0.16, 0.24);
  const limite = LARGURA - MARGEM * 2;
  let pagina = pdf.addPage([LARGURA, ALTURA]);
  let y = ALTURA - MARGEM;

  // a fonte padrão aceita acentos do português, mas não todos os símbolos
  // substituímos só os caracteres que essa fonte não consegue desenhar
  function limpar(valor: unknown): string {
    const normalizado = String(valor ?? '')
      .normalize('NFC')
      .replace(/\r/g, '')
      .replace(/[→➜]/g, ' -> ')
      .replace(/[•●]/g, '-')
      .replace(/\u00a0/g, ' ');
    return Array.from(normalizado)
      .map((letra) => (aceitos.has(letra.codePointAt(0) ?? -1) ? letra : '?'))
      .join('');
  }

  function novaPaginaSePrecisa(alturaLinha: number) {
    if (y - alturaLinha < MARGEM) {
      pagina = pdf.addPage([LARGURA, ALTURA]);
      y = ALTURA - MARGEM;
    }
  }

  // quebra as frases conforme a largura da página, pra nada sair cortado
  function escrever(
    conteudo: unknown,
    tamanho = 10,
    destaque = false,
    espaco = 6,
  ) {
    const f: PDFFont = destaque ? negrito : fonte;
    const alturaLinha = tamanho * 1.45;
    const paragrafos = limpar(conteudo).split('\n');

    for (const paragrafo of paragrafos) {
      if (!paragrafo.trim()) {
        novaPaginaSePrecisa(alturaLinha);
        y -= alturaLinha;
        continue;
      }

      let linha = '';
      // quebramos também palavras muito compridas, se necessário
      const palavras = paragrafo.split(/\s+/);
      for (const palavra of palavras) {
        const candidato = linha ? `${linha} ${palavra}` : palavra;
        if (f.widthOfTextAtSize(candidato, tamanho) <= limite) {
          linha = candidato;
          continue;
        }
        if (linha) {
          novaPaginaSePrecisa(alturaLinha);
          pagina.drawText(linha, {
            x: MARGEM, y, size: tamanho, font: f,
            color: destaque ? azul : texto,
          });
          y -= alturaLinha;
          linha = '';
        }
        for (const letra of Array.from(palavra)) {
          if (f.widthOfTextAtSize(linha + letra, tamanho) > limite && linha) {
            novaPaginaSePrecisa(alturaLinha);
            pagina.drawText(linha, {
              x: MARGEM, y, size: tamanho, font: f,
              color: destaque ? azul : texto,
            });
            y -= alturaLinha;
            linha = '';
          }
          linha += letra;
        }
      }
      if (linha) {
        novaPaginaSePrecisa(alturaLinha);
        pagina.drawText(linha, {
          x: MARGEM, y, size: tamanho, font: f,
          color: destaque ? azul : texto,
        });
        y -= alturaLinha;
      }
    }
    y -= espaco;
  }

  // informações gerais dessa avaliação (sem inventar números)
  escrever('FGRC-M | Relatório da avaliação de segurança cibernética', 16, true, 12);
  // [integração] cabeçalho com prefeitura, data e hora certas e o código da avaliação
  if (report.prefeitura) escrever(report.prefeitura, 11, true, 4);
  escrever(`Data da avaliação: ${report.finalizedAt ? dataHoraDa(report.finalizedAt) : report.date}`, 10, false, 2);
  escrever(`Código da avaliação: ${report.id}`, 9);
  escrever(`Resultado geral: ${report.score} de 100 (${report.classification})`, 12, true, 8);
  escrever(explicacaoDoCalculo(report.answers), 9, false, 12);

  if (report.dimensions?.length) {
    escrever('Resultado por eixo', 13, true);
    for (const eixo of report.dimensions) {
      escrever(`${eixo.name} (${eixo.code}): ${eixo.score} de 100`, 10, false, 3);
    }
    y -= 8;
  }

  escrever(`Perguntas e respostas (${report.answers.length})`, 13, true);
  report.answers.forEach((resposta, indice) => {
    escrever(`${indice + 1}. ${resposta.eixo} (${resposta.codigo})`, 11, true, 2);
    escrever(`Pergunta: ${resposta.pergunta}`);
    // [integração] mostra a nota sobre o máximo real da pergunta (nas avaliações antigas o AWR ia até 3)
    escrever(`Resposta: ${resposta.alternativa} (nota ${resposta.valor} de ${valorMaximoDa(resposta)}). ${comLetraMaiuscula(resposta.descricao)}`);
    escrever(resposta.recomendacao
      ? `Recomendação: ${resposta.recomendacao}`
      : 'Recomendação: nenhuma. A prática já está no nível mais alto.');
    escrever(`Referência: ${textoReferencia(resposta.nist)}`, 9, false, 14);
  });

  // resumo no fim: primeiro as de prioridade alta (notas 0 e 1), depois as de prioridade média (notas 2 e 3)
  escrever(`Resumo das recomendações (${recs.length})`, 13, true);
  if (!recs.length) escrever('Nenhuma recomendação. Todas as práticas estão no nível mais alto.');
  else escrever('Prioridade alta: respostas com nota 0 ou 1. Prioridade média: respostas com nota 2 ou 3.', 9, false, 8);
  for (const prioridade of ['alta', 'média'] as const) {
    for (const rec of recs.filter(r => r.priority === prioridade)) {
      // [integração 25/11] quando tem a explicação simples, a solução fica mais colada nela (espaço 2)
      escrever(`${rec.code} - prioridade ${rec.priority}: ${rec.solution}`, 10, false, rec.simpleExplanation ? 2 : 6);
      if (rec.simpleExplanation) escrever(`Em palavras simples: ${rec.simpleExplanation}`, 10, false, 10);
    }
  }

  // numera as páginas pra facilitar a leitura do relatório inteiro
  pdf.getPages().forEach((p, indice) => {
    const rodape = `Página ${indice + 1} de ${pdf.getPageCount()}`;
    p.drawText(rodape, {
      x: LARGURA - MARGEM - fonte.widthOfTextAtSize(rodape, 9), y: 25, size: 9, font: fonte, color: texto,
    });
  });

  // os bytes são um PDF verdadeiro (não é print da tela)
  const bytes = await pdf.save();
  const dados = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(dados).set(bytes);
  return new Blob([dados], { type: 'application/pdf' });
}

// BAIXAR: o navegador salva o arquivo na pasta de downloads dele (ou pergunta onde salvar)
function baixarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function baixarRelatorioPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  const blob = await montarPdf(report, recs);
  const nome = nomeDoArquivoPdf(report.id, report.finalizedAt);
  baixarBlob(blob, nome);
  return { ok: true, mensagem: `PDF baixado: ${nome}. Ele fica na pasta de downloads do navegador.`, nomeArquivo: nome };
}

// ABRIR: mostra o PDF numa aba nova, no leitor do próprio navegador
// a aba é aberta ANTES de montar o PDF (ainda "dentro" do clique), senão o bloqueador de pop-up barra
export async function abrirRelatorioPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  const nome = nomeDoArquivoPdf(report.id, report.finalizedAt);
  const aba = typeof window !== 'undefined' ? window.open('', '_blank') : null;
  let blob: Blob;
  try {
    blob = await montarPdf(report, recs);
  } catch (erro) {
    aba?.close();
    throw erro;
  }
  if (!aba) {
    // o navegador bloqueou a aba nova: baixa o arquivo pra pessoa não ficar sem nada
    baixarBlob(blob, nome);
    return { ok: false, mensagem: `O navegador bloqueou a aba nova, então o PDF foi baixado (${nome}). Libere pop-ups deste site para abrir direto.`, nomeArquivo: nome };
  }
  const url = URL.createObjectURL(blob);
  aba.location.href = url;
  // o endereço temporário (blob:) some depois de 5 minutos; o PDF já aberto continua na aba
  window.setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
  return { ok: true, mensagem: '', nomeArquivo: nome };
}

// COMPARTILHAR: no celular (Chrome do Android, Safari) abre a janela de compartilhar com o ARQUIVO PDF
// no computador quase nenhum navegador compartilha arquivo: ai baixa e avisa
export async function compartilharRelatorioPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  const blob = await montarPdf(report, recs);
  const nome = nomeDoArquivoPdf(report.id, report.finalizedAt);
  const nav = globalThis.navigator as Navigator | undefined;
  const arquivo = typeof File === 'function' ? new File([blob], nome, { type: 'application/pdf' }) : null;
  if (arquivo && nav?.share && nav.canShare?.({ files: [arquivo] })) {
    try {
      await nav.share({ files: [arquivo], title: nome });
      return { ok: true, mensagem: '', nomeArquivo: nome };
    } catch (erro) {
      // fechou a janela de compartilhar: não é erro, não mostra nada
      if (erro instanceof Error && erro.name === 'AbortError') return { ok: false, mensagem: '', nomeArquivo: nome };
      // NotAllowedError = demorou demais depois do clique; ai cai no download lá embaixo
    }
  }
  baixarBlob(blob, nome);
  return {
    ok: false,
    mensagem: `Este navegador não compartilha arquivos direto, então o PDF foi baixado (${nome}). Envie o arquivo pelo app que você preferir.`,
    nomeArquivo: nome,
  };
}

// [integração] nome antigo continua existindo pra quem já chamava ele (tela de Recomendações e index.ts)
export async function generateReportPdf(report: Report, recs: Recommendation[]): Promise<ResultadoPdf> {
  return baixarRelatorioPdf(report, recs);
}
