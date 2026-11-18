import { Recommendation, Report } from './types';

export const reports: Report[] = [
  {
    id: '2026-10-12',
    date: '12/10/2026',
    index: 'IERC-M',
    score: 62,
    classification: 'Intermediário',
    dimensions: [
      { code: 'GOV', name: 'Governança', score: 72 },
      { code: 'AST', name: 'Ativos', score: 55 },
      { code: 'DAT', name: 'Proteção de dados', score: 48 },
      { code: 'ACC', name: 'Gestão de acessos', score: 40 },
      { code: 'POL', name: 'Políticas de segurança', score: 58 },
    ],
    attentionPoints: [
      { title: 'Gestão de acessos', priority: 'alta' },
      { title: 'Políticas de segurança', priority: 'média' },
      { title: 'Proteção de dados', priority: 'média' },
    ],
  },
  {
    id: '2026-06-15',
    date: '15/06/2026',
    index: 'IERC-M',
    score: 38,
    classification: 'Alto',
    dimensions: [
      { code: 'GOV', name: 'Governança', score: 45 },
      { code: 'AST', name: 'Ativos', score: 35 },
      { code: 'DAT', name: 'Proteção de dados', score: 30 },
      { code: 'ACC', name: 'Gestão de acessos', score: 28 },
      { code: 'POL', name: 'Políticas de segurança', score: 40 },
    ],
    attentionPoints: [
      { title: 'Gestão de acessos', priority: 'alta' },
      { title: 'Políticas de segurança', priority: 'alta' },
      { title: 'Proteção de dados', priority: 'alta' },
      { title: 'Governança', priority: 'média' },
      { title: 'Ativos', priority: 'média' },
      { title: 'Resposta a incidentes', priority: 'média' },
    ],
  },
];

export const recommendations: Recommendation[] = [
  {
    code: '01-GOV',
    priority: 'alta',
    answerValue: 1,
    answerLabel: 'Inicial',
    solution:
      'Mapear a missão, as principais partes interessadas e os requisitos legais e regulatórios aplicáveis à segurança cibernética; formalizar esses elementos como critérios para as decisões de gestão de riscos.',
    reference: 'NIST → GV.OC',
  },
  {
    code: '02-AST',
    priority: 'média',
    answerValue: 2,
    answerLabel: 'Parcial',
    solution:
      'Ampliar a aplicação dos critérios de classificação e dos procedimentos de gestão para contemplar todos os ativos relevantes, considerando sua criticidade e impacto para as atividades do município.',
    reference: 'NIST → ID.AM-05 / ID.AM-08',
  },
  {
    code: '03-ACC',
    priority: 'média',
    answerValue: 2,
    answerLabel: 'Parcial',
    solution:
      'Revisar periodicamente as permissões de acesso, aplicando o princípio do menor privilégio e autenticação multifator nos sistemas críticos do município.',
    reference: 'NIST → PR.AA',
  },
];