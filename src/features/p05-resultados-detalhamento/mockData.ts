import { AssessmentResult } from './types';

// Dados mockados para as telas. Depois é só trocar por dados da API.
export const results: AssessmentResult[] = [
  {
    id: '2026-10-12',
    date: '12/10/2026',
    index: 'IERC-M',
    score: 62,
    classification: 'Intermediário',
    attentionPoints: [
      { title: 'Gestão de acessos', priority: 'alta' },
      { title: 'Políticas de segurança', priority: 'média' },
      { title: 'Proteção de dados', priority: 'média' },
    ],
    dimensions: [
      { code: 'GOV', name: 'Governança', score: 72 },
      { code: 'AST', name: 'Ativos', score: 55 },
      { code: 'DAT', name: 'Proteção de dados', score: 48 },
      { code: 'ACC', name: 'Gestão de acessos', score: 40 },
      { code: 'POL', name: 'Políticas de segurança', score: 58 },
    ],
  },
  {
    id: '2026-06-15',
    date: '15/06/2026',
    index: 'IERC-M',
    score: 38,
    classification: 'Alto',
    attentionPoints: [
      { title: 'Gestão de acessos', priority: 'alta' },
      { title: 'Políticas de segurança', priority: 'alta' },
      { title: 'Proteção de dados', priority: 'alta' },
      { title: 'Governança', priority: 'média' },
      { title: 'Ativos', priority: 'média' },
      { title: 'Resposta a incidentes', priority: 'média' },
    ],
    dimensions: [
      { code: 'GOV', name: 'Governança', score: 45 },
      { code: 'AST', name: 'Ativos', score: 35 },
      { code: 'DAT', name: 'Proteção de dados', score: 30 },
      { code: 'ACC', name: 'Gestão de acessos', score: 28 },
      { code: 'POL', name: 'Políticas de segurança', score: 40 },
    ],
  },
];
