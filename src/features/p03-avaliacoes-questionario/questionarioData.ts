export type Alternativa = {
  valor: number;
  titulo: string;
  descricao: string;
};

export type SolucoesPorFaixa = {
  faixa0ou1: string;
  faixa2: string;
  faixa3: string;
};

export type QuestaoFgrc = {
  id: string;
  codigo: string;
  eixoCodigo: string;
  eixoNome: string;
  numeroNoEixo: number;
  totalNoEixo: number;
  nist: string;
  pergunta: string;
  alternativas: Alternativa[];
  solucoes: SolucoesPorFaixa;
};

export type EixoFgrc = {
  numero: number;
  codigo: string;
  nome: string;
  abordagem: string;
  questoes: QuestaoFgrc[];
};

export const EIXOS_FGRC: EixoFgrc[] = [
  {
    numero: 1,
    codigo: 'GOV',
    nome: 'Governança e gestão de segurança',
    abordagem: 'políticas, responsabilidades, gestão de riscos, revisão, documentação',
    questoes: [
      {
        id: '01-GOV',
        codigo: '01-GOV',
        eixoCodigo: 'GOV',
        eixoNome: 'Governança',
        numeroNoEixo: 1,
        totalNoEixo: 5,
        nist: 'NIST → GV.OC',
        pergunta:
          'O município considera a sua missão, partes interessadas e requisitos legais e regulatórios na tomada de decisões sobre o gerenciamento de riscos cibernéticos e suas prioridades?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Esses aspectos não são considerados.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'Esses aspectos são considerados ocasionalmente, de maneira informal.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao: 'Esses aspectos são considerados, mas somente em algumas decisões.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao: 'Esses aspectos são sistematicamente considerados.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Esses aspectos são sistematicamente e periodicamente revisados e utilizados.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Mapear a missão, as principais partes interessadas e os requisitos legais e regulatórios aplicáveis à segurança cibernética; formalizar esses elementos como critérios para as decisões de gestão de riscos.',
          faixa2:
            'Estabelecer um método padronizado que incorpore a missão do município, as principais partes interessadas e os requisitos legais e regulatórios aplicáveis à segurança cibernética, documentando como esses elementos influenciam a priorização dos riscos.',
          faixa3:
            'Estabelecer um plano de revisão periódica da missão do município, das partes interessadas e dos requisitos legais e regulatórios aplicáveis à segurança cibernética.',
        },
      },
      {
        id: '02-GOV',
        codigo: '02-GOV',
        eixoCodigo: 'GOV',
        eixoNome: 'Governança',
        numeroNoEixo: 2,
        totalNoEixo: 5,
        nist: 'NIST → GV.RM → GV.RM-06', // [integração] escrito igual ao formulário
        pergunta:
          'O município estabelece e comunica um processo formal para avaliar, documentar, categorizar e priorizar os riscos cibernéticos?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não existe um processo formal para isso.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'Existe um processo informal, não padronizado.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um processo formal, mas não é aplicado de forma consistente em todos os setores.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao: 'Existe um processo formal que é aplicado de forma consistente.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Existe um processo formal que é aplicado consistentemente e revisado periodicamente.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Desenvolver um processo formal de gestão de riscos cibernéticos incorporando critérios para avaliação, categorização, documentação e priorização.',
          faixa2:
            'Padronizar um processo formal de gestão de riscos cibernéticos entre os setores, definindo uma metodologia para garantir sua aplicação consistente.',
          faixa3:
            'Estabelecer a revisão periódica do processo formal de gestão de riscos cibernéticos, tendo em vista o contexto municipal - recursos, ameaças e necessidades.',
        },
      },
      {
        id: '03-GOV',
        codigo: '03-GOV',
        eixoCodigo: 'GOV',
        eixoNome: 'Governança',
        numeroNoEixo: 3,
        totalNoEixo: 5,
        nist: 'NIST → GV.RR',
        pergunta:
          'O município define, comunica e formaliza as funções, responsabilidades e autoridades relacionadas à gestão da segurança cibernética, incluindo os responsáveis pela tomada de decisões, pela supervisão e melhoria contínua dessas atividades?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não existem funções, responsabilidades e autoridades definidos.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'Existe uma definição informal, não formalizada.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao: 'Existe uma definição formal, mas há lacunas e sobreposições.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao: 'Existe uma definição formal que é comunicada e compreendida.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Existe uma definição formal que é comunicada, compreendida e periodicamente revisada e ajustada conforme o contexto municipal.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Formalizar as funções, responsabilidades e autoridades relacionados à gestão da segurança cibernética, documentando as atribuições dos responsáveis e comunicando-as aos envolvidos.',
          faixa2:
            'Revisar e delimitar as funções, responsabilidades e autoridades relacionados à gestão da segurança cibernética, eliminando sobreposições e lacunas de atribuições.',
          faixa3:
            'Estabelecer uma avaliação periódica de verificação das funções, responsabilidades e autoridades relacionadas à gestão da segurança cibernética, assegurando a adequação ao contexto municipal.',
        },
      },
      {
        id: '04-GOV',
        codigo: '04-GOV',
        eixoCodigo: 'GOV',
        eixoNome: 'Governança',
        numeroNoEixo: 4,
        totalNoEixo: 5,
        nist: 'NIST → GV.PO',
        pergunta:
          'O município possui uma política formal para a gestão da segurança cibernética, que é comunicada, aplicada e revisada periodicamente?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não existe uma política formal.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'Existe uma política informal, não formalizada.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe uma política formal, mas não é aplicada e/ou comunicada de forma consistente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe uma política formal que é comunicada aos envolvidos e aplicada de forma consistente.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Existe uma política formal que é comunicada, aplicada de forma consistente e periodicamente revisada e atualizada conforme o contexto municipal - requisitos, ameaças, tecnologias.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Formalizar uma política de gestão da segurança cibernética de acordo com o contexto do município, comunicando aos envolvidos.',
          faixa2:
            'Estabelecer procedimentos e mecanismos para assegurar a comunicação e a aplicação consistente da política formal de gestão da segurança cibernética.',
          faixa3:
            'Estabelecer a revisão e a atualização periódica da política de gestão da segurança cibernética, tendo em vista o contexto municipal - recursos, ameaças e necessidades.',
        },
      },
      {
        id: '05-GOV',
        codigo: '05-GOV',
        eixoCodigo: 'GOV',
        eixoNome: 'Governança',
        numeroNoEixo: 5,
        totalNoEixo: 5,
        nist: 'NIST → GV.OV',
        pergunta:
          'O município avalia regularmente os resultados de sua gestão de riscos cibernéticos para revisar, melhorar e ajustar suas estratégias?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não existe avaliação.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'Existe uma avaliação informal, não padronizada.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe uma avaliação formal, mas ela não abrange toda a gestão de riscos e/ou não resultam em ajustes.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe uma avaliação formal, na qual resultados e desempenho são avaliados regularmente e atualizados para ajustar as estratégias.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Existe uma avaliação formal e sistemática, que gera indicadores e resultados documentados e orienta a melhoria da gestão de riscos.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer um processo periódico de avaliação dos resultados da gestão de riscos cibernéticos, visando a atualização e melhoria das estratégias.',
          faixa2:
            'Ampliar a avaliação dos resultados para abranger toda a gestão de riscos cibernéticos e estabelecer um processo formal para transformar os resultados em ações de melhoria.',
          faixa3:
            'Estabelecer mecanismos para documentar, acompanhar e utilizar regularmente os resultados das avaliações no ajuste das estratégias e na melhoria da gestão de riscos cibernéticos.',
        },
      },
    ],
  },
  {
    numero: 2,
    codigo: 'AST',
    nome: 'Inventário e Gestão de Ativos',
    abordagem: 'computadores, servidores, dispositivos de rede, software, ativos não autorizados',
    questoes: [
      {
        id: '01-AST',
        codigo: '01-AST',
        eixoCodigo: 'AST',
        eixoNome: 'Inventário e Gestão de Ativos',
        numeroNoEixo: 1,
        totalNoEixo: 3,
        nist: 'NIST → ID.AM-01 / ID.AM-02',
        pergunta:
          'O município mantém um inventário atualizado dos ativos de tecnologia da informação, incluindo computadores, servidores, dispositivos de rede, softwares e sistemas utilizados?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não existe inventário dos ativos de tecnologia da informação.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Existe um inventário informal ou desatualizado, sem um processo definido para sua manutenção.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um inventário formal, mas ele não contempla todos os ativos ou não é mantido de forma consistente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe um inventário formal e atualizado que contempla os principais ativos de tecnologia da informação utilizados pelo município.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Existe um inventário formal, atualizado e sistematicamente mantido, com procedimentos definidos para inclusão, alteração e remoção de ativos ao longo de seu ciclo de vida.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer e formalizar um inventário dos ativos de tecnologia da informação do município, definindo os responsáveis por sua manutenção e atualização.',
          faixa2:
            'Ampliar e atualizar o inventário para contemplar todos os ativos de tecnologia da informação utilizados pelo município e estabelecer procedimentos para sua manutenção periódica.',
          faixa3:
            'Estabelecer procedimentos para garantir a atualização contínua do inventário, contemplando a inclusão, alteração e remoção de ativos durante seu ciclo de vida.',
        },
      },
      {
        id: '02-AST',
        codigo: '02-AST',
        eixoCodigo: 'AST',
        eixoNome: 'Inventário e Gestão de Ativos',
        numeroNoEixo: 2,
        totalNoEixo: 3,
        nist: 'NIST → ID.AM-05 / ID.AM-08',
        pergunta:
          'O município classifica seus ativos de tecnologia da informação de acordo com sua importância e os gerencia ao longo de seu ciclo de vida?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Os ativos não são classificados nem possuem critérios definidos para sua gestão.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Alguns ativos são classificados ou tratados de maneira informal, sem critérios padronizados.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existem critérios formais para classificação e gestão dos ativos, mas eles não são aplicados de forma abrangente ou consistente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Os ativos são classificados de acordo com sua importância e possuem procedimentos definidos para sua gestão ao longo do ciclo de vida.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'A classificação e a gestão dos ativos são revisadas e aprimoradas periodicamente conforme sua criticidade, impacto no município, recursos disponíveis e mudanças no contexto.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer critérios para classificar os ativos de tecnologia da informação de acordo com sua importância e definir procedimentos para sua gestão ao longo do ciclo de vida.',
          faixa2:
            'Ampliar a aplicação dos critérios de classificação e dos procedimentos de gestão para contemplar todos os ativos relevantes, considerando sua criticidade e impacto para as atividades do município.',
          faixa3:
            'Estabelecer um processo periódico de revisão da classificação e da gestão dos ativos, considerando mudanças em sua criticidade, impacto, utilização e contexto do município.',
        },
      },
      {
        id: '03-AST',
        codigo: '03-AST',
        eixoCodigo: 'AST',
        eixoNome: 'Inventário e Gestão de Ativos',
        numeroNoEixo: 3,
        totalNoEixo: 3,
        nist: 'NIST → ID.AM-01 / ID.AM-02 + ID.RA',
        pergunta:
          'O município possui mecanismos para identificar e tratar ativos de tecnologia da informação não autorizados ou não registrados em seu inventário?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existem mecanismos para identificar ativos não autorizados ou não registrados.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Ativos não autorizados são identificados ocasionalmente, de forma informal e sem procedimento definido.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um procedimento para identificar ativos não autorizados, mas sua aplicação não é abrangente ou ocorre de forma irregular.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existem procedimentos definidos para identificar, registrar e tratar ativos não autorizados ou não registrados.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'A identificação e o tratamento de ativos não autorizados são realizados de forma sistemática, com acompanhamento e revisão periódica dos procedimentos adotados.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer procedimentos para identificar ativos de tecnologia da informação não autorizados ou não registrados e definir as medidas a serem adotadas nesses casos.',
          faixa2:
            'Ampliar a aplicação dos procedimentos de identificação e tratamento de ativos não autorizados, garantindo que sejam aplicados de forma abrangente e periódica.',
          faixa3:
            'Estabelecer mecanismos de acompanhamento dos ativos identificados, assegurando seu registro, regularização ou remoção conforme as diretrizes do município.',
        },
      },
    ],
  },
  {
    numero: 3,
    codigo: 'IAM',
    nome: 'Identidade e Controle de Acesso',
    abordagem: 'contas, privilégios, MFA, senhas, desligamento de usuários acesso remoto',
    questoes: [
      {
        id: '01-IAM',
        codigo: '01-IAM',
        eixoCodigo: 'IAM',
        eixoNome: 'Identidade e Controle de Acesso',
        numeroNoEixo: 1,
        totalNoEixo: 3,
        nist: 'NIST → PR.AA-01 e PR.AA-05',
        pergunta:
          'O município controla a criação e o uso das contas de acesso aos seus sistemas e informações, garantindo que cada servidor possua apenas os privilégios necessários para exercer sua função?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não há controle sobre a criação de contas nem sobre os privilégios concedidos.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'As contas e privilégios são concedidos de forma informal, geralmente a pedido do próprio servidor ou chefia, sem critério definido.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existem critérios para concessão de contas e privilégios, mas eles não são aplicados de forma consistente em todos os setores.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existem critérios formais para concessão, revisão e revogação de contas e privilégios, aplicados de forma consistente.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Os privilégios concedidos são periodicamente revisados e ajustados, garantindo o acesso mínimo necessário conforme mudanças de função ou risco.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Levantar as contas existentes nos principais sistemas, definir um critério mínimo para concessão de acessos (o que cada função realmente precisa) e formalizar quem autoriza a criação de novas contas.',
          faixa2:
            'Padronizar entre os setores o processo de concessão de contas e privilégios, definindo perfis de acesso por função e eliminando privilégios excessivos ou desnecessários.',
          faixa3:
            'Estabelecer uma revisão periódica dos privilégios concedidos, verificando se continuam adequados às funções e corrigindo desvios identificados.',
        },
      },
      {
        id: '02-IAM',
        codigo: '02-IAM',
        eixoCodigo: 'IAM',
        eixoNome: 'Identidade e Controle de Acesso',
        numeroNoEixo: 2,
        totalNoEixo: 3,
        nist: 'NIST → PR.AA-02 e PR.AA-03',
        pergunta:
          'O município exige o uso de senhas seguras e de autenticação em múltiplos fatores (MFA) para o acesso aos sistemas e informações mais importantes?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não há exigência de senhas seguras nem uso de MFA.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Há orientação informal sobre senhas, mas sem verificação; MFA não é utilizado.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existem regras de senha aplicadas em parte dos sistemas; MFA é usado apenas em alguns acessos críticos.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Regras de senha segura e MFA são aplicadas de forma consistente nos sistemas e acessos mais relevantes.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'As exigências de autenticação são revisadas periodicamente e ampliadas conforme o risco dos sistemas e das ameaças identificadas.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Definir regras mínimas de senha (tamanho, complexidade, troca periódica) e habilitar MFA ao menos nos sistemas e contas mais críticos (e-mail, sistemas financeiros, acessos remotos).',
          faixa2:
            'Padronizar as regras de senha e ampliar o uso de MFA para todos os sistemas e usuários com acesso a informações sensíveis.',
          faixa3:
            'Revisar periodicamente as configurações de autenticação, ajustando-as conforme novos sistemas, riscos e recomendações de segurança.',
        },
      },
      {
        id: '03-IAM',
        codigo: '03-IAM',
        eixoCodigo: 'IAM',
        eixoNome: 'Identidade e Controle de Acesso',
        numeroNoEixo: 3,
        totalNoEixo: 3,
        nist: 'NIST → PR.AA-01 e PR.IR-01',
        pergunta:
          'Quando um servidor é desligado, transferido ou muda de função, o município possui um processo para revisar ou revogar seus acessos, incluindo acessos remotos em tempo hábil?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existe processo para revisão ou revogação de acessos em caso de desligamento ou mudança de função.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'A revogação depende da iniciativa informal de algum responsável, sem prazo ou procedimento definido.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um procedimento formal, mas ele não é aplicado de forma consistente em todos os setores ou sistemas (incluindo acessos remotos).',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe um procedimento formal e conhecido para revogação de acessos inclusive remotos aplicado de forma consistente e em prazo definido.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O procedimento é revisado periodicamente e verificado por meio de auditorias, garantindo que não existam acessos indevidos remanescentes.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Criar uma rotina simples de comunicação entre o RH (ou setor responsável) e a área de TI para que, a cada desligamento ou mudança de função, os acessos correspondentes sejam revistos.',
          faixa2:
            'Padronizar esse procedimento entre todos os setores e sistemas, incluindo explicitamente os acessos remotos e de terceiros.',
          faixa3:
            'Estabelecer verificações periódicas (por exemplo, semestrais) para confirmar que não existem contas ou acessos ativos de pessoas desligadas ou que já não precisam deles.',
        },
      },
    ],
  },
  {
    numero: 4,
    codigo: 'DAT',
    nome: 'Proteção de Dados',
    abordagem: 'classificação, acesso, armazenamento, transmissão, criptografia, descarte',
    questoes: [
      {
        id: '01-DAT',
        codigo: '01-DAT',
        eixoCodigo: 'DAT',
        eixoNome: 'Proteção de Dados',
        numeroNoEixo: 1,
        totalNoEixo: 3,
        nist: 'NIST → ID.AM-07',
        pergunta:
          'O município identifica e classifica as informações que possui (por exemplo, dados pessoais, financeiros ou sigilosos) de acordo com sua importância e sensibilidade, para orientar como devem ser protegidas?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não há identificação ou classificação das informações.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Algumas informações são reconhecidas como sensíveis de forma informal, sem critério ou registro.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe uma classificação formal, mas ela abrange apenas parte das informações ou setores do município.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'As informações relevantes são classificadas de forma sistemática, orientando as medidas de proteção adotadas.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'A classificação é revisada periodicamente e utilizada para priorizar investimentos e ações de segurança.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Levantar quais informações o município possui (dados de cidadãos, financeiros, de servidores, etc.) e definir categorias simples de sensibilidade (por exemplo: pública, interna, sigilosa).',
          faixa2:
            'Ampliar a classificação para todos os setores, padronizando os critérios e comunicando-os aos responsáveis por cada tipo de informação.',
          faixa3:
            'Estabelecer uma revisão periódica da classificação das informações, ajustando-a conforme novos sistemas, serviços e exigências legais.',
        },
      },
      {
        id: '02-DAT',
        codigo: '02-DAT',
        eixoCodigo: 'DAT',
        eixoNome: 'Proteção de Dados',
        numeroNoEixo: 2,
        totalNoEixo: 3,
        nist: 'NIST → PR.DS-01 e PR.DS-02',
        pergunta:
          'O município utiliza mecanismos de proteção, como criptografia, para proteger as informações mais sensíveis quando armazenadas ou transmitidas pelos sistemas municipais?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não são utilizados mecanismos de proteção para dados armazenados ou transmitidos.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'A proteção é aplicada de forma isolada, dependendo do sistema ou da iniciativa de algum responsável.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Os sistemas mais importantes possuem alguma proteção (por exemplo, conexões criptografadas), mas há lacunas de cobertura.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'As informações sensíveis são protegidas de forma consistente, tanto armazenadas quanto em transmissão, nos sistemas relevantes.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'A cobertura e a eficácia dessas proteções são revisadas periodicamente conforme mudanças nos sistemas e nas ameaças.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Identificar onde estão as informações mais sensíveis e habilitar proteções básicas, como conexões seguras (HTTPS) e criptografia de discos ou arquivos críticos.',
          faixa2:
            'Padronizar a proteção entre os sistemas prioritários, corrigindo lacunas de cobertura na transmissão e no armazenamento de dados sensíveis.',
          faixa3:
            'Revisar periodicamente as configurações de proteção, verificando se continuam adequadas às informações tratadas e às tecnologias utilizadas.',
        },
      },
      {
        id: '03-DAT',
        codigo: '03-DAT',
        eixoCodigo: 'DAT',
        eixoNome: 'Proteção de Dados',
        numeroNoEixo: 3,
        totalNoEixo: 3,
        nist: 'NIST → ID.AM-08',
        pergunta:
          'Quando computadores, dispositivos de armazenamento ou documentos contendo informações do município são descartados, reciclados ou reaproveitados, existe um processo para eliminar essas informações de forma segura?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existe processo para eliminação segura de informações no descarte ou reaproveitamento de equipamentos e documentos.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'A eliminação depende da iniciativa informal de quem está descartando o equipamento ou documento.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um procedimento, mas ele não é aplicado de forma consistente a todos os equipamentos, mídias ou documentos.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe um procedimento formal e conhecido para eliminação segura de informações antes do descarte, reciclagem ou reaproveitamento.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O procedimento é revisado periodicamente e verificado, garantindo que nenhuma informação sensível seja exposta indevidamente.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Definir uma orientação básica para apagar ou destruir informações sensíveis antes de descartar, doar ou reaproveitar computadores, mídias e documentos.',
          faixa2:
            'Padronizar esse procedimento entre os setores, definindo responsáveis e métodos adequados (por exemplo, formatação segura, trituração de documentos).',
          faixa3:
            'Estabelecer verificações periódicas para confirmar que o procedimento está sendo seguido corretamente em todos os casos de descarte.',
        },
      },
    ],
  },
  {
    numero: 5,
    codigo: 'VUL',
    nome: 'Configuração, Atualizações e Vulnerabilidades',
    abordagem: 'patches, sistemas desatualizados, configuração segura, vulnerabilidades',
    questoes: [
      {
        id: '01-VUL',
        codigo: '01-VUL',
        eixoCodigo: 'VUL',
        eixoNome: 'Configuração, Atualizações e Vulnerabilidades',
        numeroNoEixo: 1,
        totalNoEixo: 2,
        nist: 'NIST → PR.PS-01 / PR.PS-02 / PR.PS-03',
        pergunta:
          'O município possui procedimentos para estabelecer, manter e atualizar configurações seguras de seus ativos de tecnologia da informação, incluindo a manutenção e substituição de hardware e software?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existem procedimentos definidos para configuração, manutenção ou atualização dos ativos.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Existem procedimentos informais, aplicados de maneira ocasional e sem padronização.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existem procedimentos formais, mas sua aplicação não abrange todos os ativos ou não ocorre de forma consistente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existem procedimentos formais para configuração, manutenção e atualização dos ativos, aplicados de forma consistente.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Os procedimentos de configuração, manutenção e atualização são sistematicamente monitorados e revisados conforme mudanças nos riscos, tecnologias e necessidades do município.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer e formalizar procedimentos para configuração, manutenção e atualização dos ativos de tecnologia da informação, definindo responsáveis e periodicidade para sua execução.',
          faixa2:
            'Ampliar a aplicação dos procedimentos de configuração, manutenção e atualização para contemplar todos os ativos relevantes e garantir sua execução de forma consistente.',
          faixa3:
            'Estabelecer mecanismos de acompanhamento das configurações, manutenções e atualizações realizadas, identificando e corrigindo situações de não conformidade.',
        },
      },
      {
        id: '02-VUL',
        codigo: '02-VUL',
        eixoCodigo: 'VUL',
        eixoNome: 'Configuração, Atualizações e Vulnerabilidades',
        numeroNoEixo: 2,
        totalNoEixo: 2,
        nist: 'NIST → ID.RA-01 / ID.RA-05 / ID.RA-06',
        pergunta:
          'O município identifica, registra e avalia vulnerabilidades em seus ativos de tecnologia da informação, utilizando os resultados para priorizar ações de correção?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não existe processo para identificar ou registrar vulnerabilidades.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Vulnerabilidades são identificadas ocasionalmente, de maneira informal e sem critérios definidos de priorização.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um processo formal para identificação e registro de vulnerabilidades, mas a avaliação ou priorização das ações de correção é incompleta ou inconsistente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Vulnerabilidades são identificadas, registradas e avaliadas regularmente, e as ações de correção são priorizadas de acordo com os riscos identificados.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O processo de gestão de vulnerabilidades é sistemático e continuamente aprimorado, considerando ameaças, impactos, probabilidade e mudanças no ambiente tecnológico.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer um processo para identificar, registrar e avaliar vulnerabilidades dos ativos de tecnologia da informação, definindo critérios para priorização das correções.',
          faixa2:
            'Aprimorar o processo de gestão de vulnerabilidades, estabelecendo critérios formais para avaliação e priorização das ações de correção e acompanhamento de sua execução.',
          faixa3:
            'Estabelecer mecanismos de monitoramento das vulnerabilidades identificadas e das ações de correção, garantindo que os riscos prioritários sejam tratados dentro de prazos definidos.',
        },
      },
    ],
  },
  {
    numero: 6,
    codigo: 'BCK',
    nome: 'Backup e Recuperação de Dados',
    abordagem: 'periodicidade, automação, proteção, isolamento, restauração, testes',
    questoes: [
      {
        id: '01-BKP',
        codigo: '01-BKP',
        eixoCodigo: 'BCK',
        eixoNome: 'Backup e Recuperação de Dados',
        numeroNoEixo: 1,
        totalNoEixo: 2,
        nist: 'NIST → PR.DS-1',
        pergunta:
          'O município realiza, protege, mantém e testa backups dos dados necessários à continuidade de suas atividades?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não são realizados backups dos dados.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'São realizados backups de forma informal ou irregular, sem procedimentos definidos.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um processo formal de backup, mas sua cobertura, proteção, manutenção ou testes são incompletos.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe um processo formal de backup que contempla os dados relevantes, com procedimentos definidos para proteção, manutenção e testes.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O processo de backup é sistematicamente monitorado e aprimorado, considerando a criticidade dos dados, os riscos identificados e os resultados dos testes de recuperação.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer e formalizar um processo de backup dos dados relevantes para as atividades do município, definindo periodicidade, responsáveis, armazenamento e procedimentos de proteção.',
          faixa2:
            'Ampliar e aprimorar o processo de backup, garantindo cobertura dos dados relevantes, proteção adequada, manutenção dos backups e realização periódica de testes.',
          faixa3:
            'Estabelecer mecanismos de monitoramento dos backups e dos resultados dos testes, corrigindo falhas identificadas e ajustando os procedimentos quando necessário.',
        },
      },
      {
        id: '02-BKP',
        codigo: '02-BKP',
        eixoCodigo: 'BCK',
        eixoNome: 'Backup e Recuperação de Dados',
        numeroNoEixo: 2,
        totalNoEixo: 2,
        nist: 'NIST → RC.RP-01 a RC.RP-06',
        pergunta:
          'O município possui procedimentos para recuperar dados, sistemas e serviços após incidentes, verificando a integridade dos recursos restaurados?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existem procedimentos definidos para recuperação de dados, sistemas ou serviços.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'A recuperação ocorre de forma informal e depende de ações individuais ou circunstanciais.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existem procedimentos formais de recuperação, mas eles não abrangem todos os recursos críticos ou não são testados regularmente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existem procedimentos formais de recuperação que são executados e testados regularmente, incluindo a verificação da integridade dos recursos restaurados.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O processo de recuperação é sistematicamente testado, avaliado e aprimorado com base nos resultados dos testes, incidentes ocorridos e mudanças nas necessidades de continuidade do município.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Estabelecer e formalizar procedimentos para recuperação de dados, sistemas e serviços críticos, definindo responsáveis, prioridades e etapas para restauração.',
          faixa2:
            'Ampliar os procedimentos de recuperação para contemplar todos os recursos críticos e estabelecer testes periódicos para verificar sua efetividade.',
          faixa3:
            'Estabelecer mecanismos para registrar e avaliar os resultados dos testes e das recuperações realizadas, utilizando-os para corrigir falhas e aprimorar os procedimentos.',
        },
      },
    ],
  },
  {
    numero: 7,
    codigo: 'NET',
    nome: 'Proteção de Rede e Infraestrutura',
    abordagem: 'firewall, Wi-Fi, segmentação, acesso remoto, serviços expostos',
    questoes: [
      {
        id: '01-NET',
        codigo: '01-NET',
        eixoCodigo: 'NET',
        eixoNome: 'Proteção de Rede e Infraestrutura',
        numeroNoEixo: 1,
        totalNoEixo: 2,
        nist: 'NIST → PR.DS-02, PR.PT-04',
        pergunta:
          'O município utiliza firewalls e segmentação de rede para proteger os sistemas internos e separar redes de acordo com sua função ou criticidade, incluindo a separação da rede Wi-Fi de visitantes da rede interna?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não há firewalls ativos nem segmentação de rede.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Existe um firewall básico na borda, mas sem segmentação interna (todos na mesma rede).',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Há segmentação básica (ex: Wi-Fi de convidados separado), mas sistemas críticos ainda misturados.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'A rede é segmentada de acordo com a função ou criticidade dos ambientes, com firewalls configurados e regras de acesso documentadas.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao: 'A segmentação e as regras de firewall são revisadas periodicamente e auditadas.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Instalar/ativar um firewall de borda e separar a rede Wi-Fi de convidados da rede interna da prefeitura.',
          faixa2:
            'Criar VLANs ou utilizar mecanismos equivalentes para separar setores, sistemas ou serviços de acordo com sua função ou criticidade, priorizando os ambientes que tratam informações ou serviços mais importantes.',
          faixa3:
            'Estabelecer uma rotina de revisão trimestral das regras de liberação de portas e tráfego no firewall.',
        },
      },
      {
        id: '02-NET',
        codigo: '02-NET',
        eixoCodigo: 'NET',
        eixoNome: 'Proteção de Rede e Infraestrutura',
        numeroNoEixo: 2,
        totalNoEixo: 2,
        nist: 'NIST → PR.PT-01, SC.CO-04',
        pergunta:
          'O acesso remoto à rede do município, realizado por servidores em trabalho remoto ou por prestadores de serviço, é feito por canais seguros e controlados, com autenticação adequada e registro das conexões?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Acesso remoto liberado sem criptografia (ex: Área de Trabalho Remota/RDP exposta diretamente na internet).',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Acesso remoto depende de ferramentas informais ou conexão direta sem controle centralizado.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Uso de VPN, mas sem exigência de MFA ou sem controle rigoroso de quem acessa.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'O acesso remoto é realizado por canais seguros, como VPN ou mecanismo equivalente, com autenticação adequada, controle dos usuários autorizados e registros das conexões.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Revisão periódica dos acessos remotos ativos e bloqueio automático de atividades.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Fechar portas de RDP expostas na internet imediatamente e implementar uma solução básica de VPN.',
          faixa2:
            'Exigir MFA (Autenticação Multifator) nos acessos remotos relevantes e manter registros das conexões realizadas.',
          faixa3:
            'Estabelecer uma rotina de revisão dos acessos remotos autorizados, removendo acessos de servidores, prestadores ou outros usuários que tenham sido desligados, transferidos ou que não necessitem mais desse acesso.',
        },
      },
    ],
  },
  {
    numero: 8,
    codigo: 'MON',
    nome: 'Proteção contra Malware e Monitoramento',
    abordagem: 'antimalware, logs, alertas, monitoramento, eventos suspeitos',
    questoes: [
      {
        id: '01-MON',
        codigo: '01-MON',
        eixoCodigo: 'MON',
        eixoNome: 'Proteção contra Malware e Monitoramento',
        numeroNoEixo: 1,
        totalNoEixo: 3,
        nist: 'NIST → PR.PS-05 e DE.CM-09',
        pergunta:
          'O município possui mecanismos definidos para impedir e identificar a instalação ou execução de programas maliciosos ou não autorizados nos computadores, servidores e demais equipamentos utilizados pela prefeitura?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existem mecanismos definidos de proteção ou não há conhecimento sobre como os equipamentos são protegidos.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Existem proteções em alguns equipamentos, mas de forma isolada, informal ou somente quando ocorre algum problema.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Os equipamentos e sistemas mais importantes possuem proteção, mas ainda existem lacunas de cobertura, atualização ou acompanhamento.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Os equipamentos e sistemas relevantes possuem proteção ativa e atualizada, com responsáveis definidos para acompanhar alertas e ocorrências.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'A proteção é aplicada de forma consistente e sua cobertura, configuração e efetividade são revisadas periodicamente conforme mudanças nos equipamentos, sistemas e riscos do município.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Realizar um levantamento dos computadores, servidores e demais equipamentos utilizados pelo município; identificar quais não possuem proteção adequada e estabelecer uma proteção mínima, priorizando os ativos mais importantes para os serviços municipais.',
          faixa2:
            'Padronizar a proteção dos equipamentos e sistemas relevantes, corrigir lacunas de cobertura e definir uma rotina para manter as ferramentas atualizadas e acompanhar alertas ou ocorrências.',
          faixa3:
            'Estabelecer uma revisão periódica da cobertura e da configuração das proteções, verificando se continuam adequadas aos equipamentos, sistemas e ameaças atuais do município.',
        },
      },
      {
        id: '02-MON',
        codigo: '02-MON',
        eixoCodigo: 'MON',
        eixoNome: 'Proteção contra Malware e Monitoramento',
        numeroNoEixo: 2,
        totalNoEixo: 3,
        nist: 'NIST → PR.PS-04 e DE.CM-01, DE.CM-03, DE.CM-09',
        pergunta:
          'O município mantém registros de atividades (logs) e acompanha alertas dos principais sistemas, redes e equipamentos para identificar comportamentos anormais ou suspeitos?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não são mantidos registros relevantes ou não existe acompanhamento de alertas de segurança.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Alguns sistemas geram registros ou alertas, mas eles normalmente só são consultados quando ocorre um problema.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Os sistemas ou equipamentos mais importantes possuem registros e algum acompanhamento, mas a prática não é aplicada de forma consistente ou não possui responsáveis claramente definidos.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Os principais sistemas, redes e equipamentos mantêm registros e alertas, com uma rotina definida de acompanhamento e responsáveis conhecidos.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O monitoramento é revisado periodicamente, os alertas mais relevantes são ajustados conforme os riscos do município e as informações de diferentes fontes são utilizadas para melhorar a identificação de atividades suspeitas.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Identificar os sistemas, redes e equipamentos mais importantes da prefeitura e verificar quais registros e alertas eles disponibilizam. Habilitar os registros relevantes e definir uma pessoa ou equipe responsável por acompanhar os avisos mais importantes.',
          faixa2:
            'Padronizar a geração e o acompanhamento de registros nos sistemas prioritários, definindo responsáveis, frequência de verificação e quais tipos de eventos devem receber atenção.',
          faixa3:
            'Estabelecer revisões periódicas dos registros e alertas utilizados, ajustando o monitoramento conforme mudanças nos sistemas, nos serviços municipais e nas ameaças observadas.',
        },
      },
      {
        id: '03-MON',
        codigo: '03-MON',
        eixoCodigo: 'MON',
        eixoNome: 'Proteção contra Malware e Monitoramento',
        numeroNoEixo: 3,
        totalNoEixo: 3,
        nist: 'NIST → DE.AE-02, DE.AE-03, DE.AE-04, DE.AE-06 e DE.AE-08',
        pergunta:
          'Quando é identificado um alerta ou comportamento suspeito, o município possui um processo para analisar o que aconteceu, avaliar o possível impacto e decidir quando a situação deve ser tratada como um incidente de segurança?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existe um processo para analisar alertas ou definir quando uma situação deve ser tratada como incidente.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Os alertas são analisados caso a caso, de maneira informal e dependendo da experiência de quem estiver disponível.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existem alguns critérios ou procedimentos de análise, mas eles não são aplicados de forma consistente ou não abrangem todos os sistemas relevantes.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe um processo definido para analisar eventos suspeitos, estimar impacto e alcance, comunicar os responsáveis e declarar um incidente quando os critérios estabelecidos forem atendidos.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O processo é aplicado de forma consistente e revisado periodicamente, utilizando informações de diferentes fontes e ocorrências anteriores para melhorar a análise e os critérios de identificação de incidentes.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Definir um processo simples para tratamento de alertas, incluindo quem deve analisá-los, quais informações devem ser verificadas e em quais situações um responsável deve ser acionado.',
          faixa2:
            'Formalizar e padronizar os critérios de análise dos eventos suspeitos, incluindo avaliação de impacto, alcance e condições para declarar um incidente de segurança.',
          faixa3:
            'Revisar periodicamente os critérios e procedimentos de análise, incorporando aprendizados de ocorrências anteriores e ajustando-os às mudanças nos sistemas e serviços do município.',
        },
      },
    ],
  },
  {
    numero: 9,
    codigo: 'INC',
    nome: 'Resposta a Incidentes',
    abordagem: 'plano, responsáveis, comunicação, registro, contenção, aprendizado',
    questoes: [
      {
        id: '01-INC',
        codigo: '01-INC',
        eixoCodigo: 'INC',
        eixoNome: 'Resposta a Incidentes',
        numeroNoEixo: 1,
        totalNoEixo: 2,
        nist: 'NIST → ID.IM-04 e RS.MA-01, RS.MA-03, RS.MA-04, RS.MA-05',
        pergunta:
          'O município possui um plano ou procedimento de resposta a incidentes de segurança, com responsáveis definidos e orientações sobre como priorizar, encaminhar e iniciar a recuperação quando ocorrer um problema?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existe plano, procedimento ou definição prévia de responsáveis para responder a incidentes.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'A resposta depende de orientações informais ou do conhecimento de algumas pessoas, sem um procedimento formalizado.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existe um plano ou procedimento formal, mas ele possui lacunas, não é conhecido por todos os envolvidos ou não é aplicado de forma consistente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Existe um plano formal, comunicado aos envolvidos, com responsáveis definidos e orientações para priorizar, encaminhar e iniciar a recuperação dos incidentes.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'O plano é mantido atualizado, revisado periodicamente e testado por meio de exercícios ou simulações, incorporando ajustes conforme mudanças no município e experiências anteriores.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Criar um procedimento básico de resposta a incidentes, definindo responsáveis principais e substitutos, contatos necessários, formas de registrar o ocorrido e ações iniciais para incidentes que afetem sistemas e serviços importantes.',
          faixa2:
            'Revisar o plano existente, corrigir lacunas, comunicar as responsabilidades aos envolvidos e garantir que o procedimento seja conhecido e aplicável aos principais serviços municipais.',
          faixa3:
            'Estabelecer revisões e testes periódicos do plano, por exemplo por meio de simulações simples, registrando as dificuldades encontradas e utilizando-as para atualizar o procedimento.',
        },
      },
      {
        id: '02-INC',
        codigo: '02-INC',
        eixoCodigo: 'INC',
        eixoNome: 'Resposta a Incidentes',
        numeroNoEixo: 2,
        totalNoEixo: 2,
        nist: 'NIST → RS.AN-06, RS.AN-07, RS.CO-02, RS.CO-03, RS.MI-01 e RS.MI-02',
        pergunta:
          'Durante um incidente de segurança, o município possui procedimentos para registrar as ações realizadas, comunicar as pessoas necessárias e conter ou eliminar o problema para reduzir seus impactos?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Não existem procedimentos definidos para registro, comunicação, contenção ou eliminação do problema.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'As ações são realizadas de forma improvisada, sem um padrão de registro ou comunicação.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Existem procedimentos para algumas dessas atividades, mas há lacunas ou diferenças na forma como são aplicados.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'As ações realizadas durante o incidente são registradas, os responsáveis internos e externos necessários são comunicados e existem procedimentos definidos para conter e eliminar o problema.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Os procedimentos são aplicados de forma consistente, revisados periodicamente e ajustados conforme a gravidade do incidente, os serviços afetados, requisitos aplicáveis e aprendizados anteriores.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Definir um procedimento mínimo contendo: como registrar o ocorrido, quem precisa ser comunicado, quem pode tomar decisões e quais ações iniciais podem ser utilizadas para limitar a propagação do incidente.',
          faixa2:
            'Padronizar os procedimentos entre os setores e responsáveis, garantindo que registro, comunicação, contenção e eliminação do problema sejam considerados em todos os incidentes relevantes.',
          faixa3:
            'Revisar periodicamente os procedimentos e os contatos utilizados durante incidentes, atualizando-os de acordo com mudanças nos sistemas, contratos, responsáveis e serviços municipais.',
        },
      },
    ],
  },
  {
    numero: 10,
    codigo: 'AWR',
    nome: 'Pessoas e Conscientização',
    abordagem: 'treinamento, phishing, engenharia social, responsabilidades dos usuários',
    questoes: [
      {
        id: '01-AWR',
        codigo: '01-AWR',
        eixoCodigo: 'AWR',
        eixoNome: 'Pessoas e Conscientização',
        numeroNoEixo: 1,
        totalNoEixo: 5,
        nist: 'Orientações de segurança',
        pergunta:
          'Como os servidores recebem orientações para utilizar computadores, sistemas e informações da prefeitura com segurança?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'não recebem orientações.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'recebem orientações informais, quando surge uma dúvida ou um problema.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'existem orientações organizadas, mas elas não chegam a todos os servidores.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'as orientações são repassadas aos novos servidores e reforçadas periodicamente com os demais.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Preparar orientações básicas sobre uso de senhas, acesso aos sistemas e compartilhamento de informações. Definir quem fará essa orientação e incluí-la na entrada de novos servidores.',
          faixa2:
            'Identificar os setores que ainda não receberam as orientações e ampliar sua divulgação, utilizando um conteúdo comum para toda a prefeitura.',
          faixa3:
            'Revisar periodicamente o conteúdo e os registros de participação, mantendo as orientações adequadas às mudanças nos sistemas e nas rotinas de trabalho.',
        },
      },
      {
        id: '02-AWR',
        codigo: '02-AWR',
        eixoCodigo: 'AWR',
        eixoNome: 'Pessoas e Conscientização',
        numeroNoEixo: 2,
        totalNoEixo: 5,
        nist: 'Golpes e mensagens suspeitas',
        pergunta:
          'Os servidores recebem orientações para identificar golpes por e-mail, mensagens ou telefone, como pedidos falsos de senha ou pagamento?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'Não recebem orientações sobre esses golpes.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'Recebem avisos apenas quando surge uma tentativa de golpe.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'recebem orientações preventivas, mas apenas alguns setores são atendidos.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'todos os setores recebem orientações preventivas, reforçadas periodicamente com exemplos de golpes.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Orientar os servidores a conferir o remetente e confirmar pedidos de dados ou pagamentos por um contato já conhecido. Utilizar exemplos de mensagens falsas e explicar os cuidados antes de abrir links ou anexos.',
          faixa2:
            'Ampliar as orientações para os setores ainda não atendidos, incluindo exemplos relacionados às suas rotinas, como pagamentos, compras e atendimento ao cidadão.',
          faixa3:
            'Atualizar os exemplos conforme os golpes identificados e utilizar exercícios simples para verificar se os servidores reconhecem os sinais de fraude.',
        },
      },
      {
        id: '03-AWR',
        codigo: '03-AWR',
        eixoCodigo: 'AWR',
        eixoNome: 'Pessoas e Conscientização',
        numeroNoEixo: 3,
        totalNoEixo: 5,
        nist: 'Comunicação de situações suspeitas',
        pergunta:
          'Os servidores são orientados sobre quem procurar ao perceber uma situação suspeita, como uma mensagem falsa ou um possível acesso indevido?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'não há orientação sobre quem procurar.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'a orientação é informal e varia entre os setores.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'existe um contato ou canal definido, mas ele não é divulgado a todos os servidores.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'todos os servidores recebem orientação sobre o contato ou canal e sobre como comunicar a situação.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Definir e divulgar um contato para receber relatos de situações suspeitas. Explicar quais situações devem ser comunicadas e quais informações básicas devem acompanhar o relato, sem incluir senhas.',
          faixa2:
            'Divulgar o contato nos setores ainda não atendidos e incluir essa orientação na integração de novos servidores, mantendo as instruções disponíveis para consulta.',
          faixa3:
            'Conferir periodicamente se o contato continua válido e verificar, por meio de perguntas ou exercícios simples, se os servidores sabem como utilizá-lo.',
        },
      },
      {
        id: '04-AWR',
        codigo: '04-AWR',
        eixoCodigo: 'AWR',
        eixoNome: 'Pessoas e Conscientização',
        numeroNoEixo: 4,
        totalNoEixo: 5,
        nist: 'Capacitação dos responsáveis por sistemas e acessos',
        pergunta:
          'As pessoas responsáveis por administrar sistemas ou liberar acessos recebem capacitação de segurança voltada às suas funções? Considere também os profissionais terceirizados.',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'não recebem capacitação específica.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao: 'a capacitação depende da iniciativa de cada profissional.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'existe capacitação voltada às funções, mas nem todos os responsáveis são contemplados.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'todos os responsáveis recebem capacitação adequada às suas funções, atualizada conforme mudanças nos sistemas ou nas atribuições.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Identificar quem administra sistemas e acessos e quais conhecimentos de segurança essas funções exigem. Direcionar capacitações para essas necessidades, incluindo os profissionais terceirizados envolvidos.',
          faixa2:
            'Identificar os responsáveis ainda não contemplados e as necessidades de capacitação de cada função, priorizando quem possui acessos privilegiados ou administra sistemas essenciais.',
          faixa3:
            'Revisar as necessidades de capacitação quando houver mudanças nos sistemas ou nas atribuições e verificar se os conhecimentos adquiridos são aplicados no trabalho.',
        },
      },
      {
        id: '05-AWR',
        codigo: '05-AWR',
        eixoCodigo: 'AWR',
        eixoNome: 'Pessoas e Conscientização',
        numeroNoEixo: 5,
        totalNoEixo: 5,
        nist: 'Verificação do aprendizado',
        pergunta:
          'A prefeitura verifica se os servidores compreenderam as orientações e os treinamentos de segurança?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao: 'não verifica.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'verifica por conversas ou perguntas informais, sem registrar os resultados.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'aplica questionários ou exercícios em alguns treinamentos e registra os resultados.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'verifica o aprendizado nos treinamentos e usa os resultados para reforçar os assuntos que geraram dúvidas.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Incluir perguntas curtas ou situações práticas ao final das orientações e dos treinamentos. Registrar os resultados para identificar os assuntos que precisam de reforço.',
          faixa2:
            'Adotar a verificação do aprendizado nos demais treinamentos e utilizar os resultados para revisar os conteúdos que apresentaram maior dificuldade.',
          faixa3:
            'Comparar os resultados das avaliações ao longo do tempo e ajustar os conteúdos e a forma de orientação quando as dificuldades persistirem.',
        },
      },
    ],
  },
  {
    numero: 11,
    codigo: 'TPR',
    nome: 'Terceiros, Fornecedores e Nuvem',
    abordagem: 'prestadores de TI, contratos, acessos de terceiros, cloud, encerramento de contratos',
    questoes: [
      {
        id: '01-TPR',
        codigo: '01-TPR',
        eixoCodigo: 'TPR',
        eixoNome: 'Terceiros, Fornecedores e Nuvem',
        numeroNoEixo: 1,
        totalNoEixo: 2,
        nist: 'NIST → ID.SC-01, ID.SC-02',
        pergunta:
          'O município possui critérios de segurança e requisitos de proteção de dados formalizados nos contratos com prestadores de serviços de TI e fornecedores de sistemas (inclusive em nuvem)?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Os contratos não estabelecem requisitos relacionados à segurança da informação ou à proteção de dados.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Cláusulas genéricas de confidencialidade, sem exigências técnicas específicas de segurança.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Há requisitos para fornecedores críticos, mas aplicados de forma inconsistente.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Os contratos de TI e serviços em nuvem possuem cláusulas claras de segurança, proteção de dados, níveis de serviço (SLA) e responsabilidades das partes.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Os fornecedores passam por avaliações periódicas de conformidade de segurança.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Criar um anexo de segurança padrão para novos contratos de tecnologia, exigindo boas práticas e conformidade com a LGPD.',
          faixa2:
            'Mapear os fornecedores atuais de sistemas e nuvem e revisar os contratos vigentes para incluir obrigações de notificação de incidentes.',
          faixa3:
            'Estabelecer um processo de homologação de segurança para novos fornecedores antes da contratação.',
        },
      },
      {
        id: '02-TPR',
        codigo: '02-TPR',
        eixoCodigo: 'TPR',
        eixoNome: 'Terceiros, Fornecedores e Nuvem',
        numeroNoEixo: 2,
        totalNoEixo: 2,
        nist: 'NIST → ID.SC-04, PR.AA-01',
        pergunta:
          'O acesso de terceiros (suporte técnico externo, fornecedores de software) aos sistemas da prefeitura é controlado, monitorado e revogado após o término do atendimento?',
        alternativas: [
          {
            valor: 0,
            titulo: 'Inexistente',
            descricao:
              'Terceiros utilizam contas genéricas compartilhadas ou acesso permanente sem controle.',
          },
          {
            valor: 1,
            titulo: 'Inicial',
            descricao:
              'Acessos concedidos sob demanda de forma informal, sem rastreio de quem acessou o quê.',
          },
          {
            valor: 2,
            titulo: 'Parcial',
            descricao:
              'Contas individuais para terceiros, mas sem revisão frequente ou monitoramento ativo.',
          },
          {
            valor: 3,
            titulo: 'Estabelecida',
            descricao:
              'Acessos de terceiros são individualizados, temporários, autorizados formalmente e monitorados.',
          },
          {
            valor: 4,
            titulo: 'Aprimorada',
            descricao:
              'Auditoria regular dos acessos de terceiros e uso de privilégios mínimos restritos ao escopo do contrato.',
          },
        ],
        solucoes: {
          faixa0ou1:
            'Eliminar contas de suporte compartilhadas e exigir contas individuais para prestadores externos.',
          faixa2:
            'Garantir que o acesso de fornecedores seja desativado imediatamente após a conclusão do suporte ou projeto.',
          faixa3:
            'Implementar registro de logs específico para as sessões de acesso remoto realizadas por terceiros.',
        },
      },
    ],
  },
];

export const TODAS_QUESTOES_FGRC: QuestaoFgrc[] = EIXOS_FGRC.flatMap((eixo) => eixo.questoes);

