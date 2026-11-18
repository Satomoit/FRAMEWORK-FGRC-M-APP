// no navegador a gente baixa um PDF de verdade (não é print da tela)
// o arquivo pdf.ts continua cuidando do PDF no Android/iOS
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import type { Recommendation, Report } from './types';
// [integração] nota máxima, referência, data/hora e explicação do cálculo saem do mesmo lugar das telas
import {
  EXPLICACAO_DO_CALCULO,
  comLetraMaiuscula,
  dataHoraDa,
  textoReferencia,
  valorMaximoDa,
} from '@/lib/calcular-relatorio';

const LARGURA = 595.28; // página A4 em pontos
const ALTURA = 841.89;
const MARGEM = 45;

// esse método recebe exatamente a avaliação que o usuário finalizou
export async function generateReportPdf(
  report: Report,
  recs: Recommendation[],
): Promise<string> {
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
  escrever(EXPLICACAO_DO_CALCULO, 9, false, 12);

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
    // [integração] mostra a nota sobre o máximo real da pergunta (AWR vai até 3)
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
      escrever(`${rec.code} - prioridade ${rec.priority}: ${rec.solution}`);
    }
  }

  // numera as páginas pra facilitar a leitura do relatório inteiro
  pdf.getPages().forEach((p, indice) => {
    const rodape = `Página ${indice + 1} de ${pdf.getPageCount()}`;
    p.drawText(rodape, {
      x: LARGURA - MARGEM - fonte.widthOfTextAtSize(rodape, 9), y: 25, size: 9, font: fonte, color: texto,
    });
  });

  // os bytes são um PDF verdadeiro; o navegador recebe um link de download
  const bytes = await pdf.save();
  const dados = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(dados).set(bytes);
  const url = URL.createObjectURL(new Blob([dados], { type: 'application/pdf' }));
  // [integração] nome do arquivo com data e hora (assim duas avaliações do mesmo dia não ficam com nome igual)
  const quando = report.finalizedAt ? new Date(report.finalizedAt) : null;
  const hora = quando ? `-${String(quando.getHours()).padStart(2, '0')}h${String(quando.getMinutes()).padStart(2, '0')}` : '';
  const nome = `FGRC-M-avaliacao-${String(report.date).replace(/[^0-9a-z-]/gi, '-')}${hora}.pdf`;
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return nome;
}
