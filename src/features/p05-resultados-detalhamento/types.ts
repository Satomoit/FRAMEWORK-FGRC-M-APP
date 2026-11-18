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

export interface AssessmentResult {
  id: string;
  date: string; // dd/mm/aaaa
  index: string; // IERC-M
  score: number; // 0-100
  classification: Classification;
  attentionPoints: AttentionPoint[];
  dimensions: Dimension[];
}
