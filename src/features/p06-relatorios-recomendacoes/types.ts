// mantemos os tipos que a Aline já usava e só acrescentamos as respostas do relatório
import type { RespostaRegistrada } from '@/lib/avaliacoes-reais';

export type Classification = 'Baixo' | 'Intermediário' | 'Alto';
export type Priority = 'alta' | 'média';

export interface Dimension { code: string; name: string; score: number; }
export interface AttentionPoint { title: string; priority: Priority; }

export interface Report {
  id: string;
  date: string;
  index: string;
  score: number;
  classification: Classification;
  dimensions?: Dimension[];
  attentionPoints?: AttentionPoint[];
  // acrescentamos isso pra P06 conseguir escrever o PDF com todas as questões
  answers?: RespostaRegistrada[];
  finalizedAt?: string;
  // [integração] prefeitura/município/UF da conta que ta logada (vai no cabeçalho do PDF)
  prefeitura?: string | null;
}

export interface Recommendation {
  code: string;
  priority: Priority;
  answerValue: number;
  answerLabel: string;
  solution: string;
  reference: string;
}
