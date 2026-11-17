export type Classification = 'Baixo' | 'Intermediário' | 'Alto';
export type Priority = 'alta' | 'média';

export interface Dimension {
  code: string; // GOV, AST, DAT...
  name: string;
  score: number; // 0-100
}

export interface AttentionPoint {
  title: string;
  priority: Priority;
}

export interface Report {
  id: string;
  date: string;
  index: string;
  score: number;
  classification: Classification;
  dimensions?: Dimension[];
  attentionPoints?: AttentionPoint[];
}

export interface Recommendation {
  code: string; // 01-GOV
  priority: Priority;
  answerValue: number;
  answerLabel: string; // Inicial, Parcial...
  solution: string;
  reference: string; // NIST → GV.OC
}