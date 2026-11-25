// [integração 25/11] textos da tela "Privacidade e termos" (Política de Privacidade, Termos de Uso e Referências)
// eles saíram de dentro do src/app/privacidade.tsx e vieram pra cá pq agora aparecem em DOIS lugares:
//   - na tela Privacidade e termos (src/app/privacidade.tsx)
//   - na leitura obrigatória dos Termos de Uso, na ativação da conta (src/features/integracao/AceiteDosTermos.tsx)
// se o texto ficasse escrito nos dois arquivos, um dia alguém ia mudar um e esquecer o outro
// quem escreveu o quê:
//   - Nicole (alteração de 23/11, PR #8): "Sua responsabilidade pelas informações", "Sua responsabilidade pelo PDF",
//     a lista de Referências (as 4 primeiras) e os ajustes de redação ("pelo aplicativo", "servidor do FGRC-M" etc)
//   - integração: o texto que já tava no main (18 e 19/11) e a ampliação de 25/11
// este arquivo só tem texto (nenhuma tela, nenhuma conta), por isso dá pra testar sozinho: tests/teste-privacidade.cjs
// ATENÇÃO: é texto jurídico escrito pelo grupo, não por advogado. Tem que passar pelo orientador antes

// [integração 25/11] data desta versão do texto (aparece no começo e no fim da tela Privacidade e termos)
// toda vez que o texto mudar, muda aqui também (é assim que a pessoa sabe qual versão leu)
// é essa data que fica registrada na conta quando a pessoa aceita os Termos de Uso na ativação
export const VERSAO_DO_TEXTO = '25/11/2026';

// cada bloco = um título e alguns parágrafos curtos (linguagem simples, sem termo técnico)
// [integração 25/11] parágrafo que começa com "• " é item de lista (na tela só ganha um recuo)
// suporte: true = mostra o atalho "Abrir Ajuda e suporte" embaixo do bloco
export type Secao = { titulo: string; textos: string[]; suporte?: boolean };

// [integração 25/11] o mais importante em poucas linhas (app grande sempre começa com um resumo)
// o resumo NÃO substitui o texto completo, é só pra pessoa não desistir de ler
export const RESUMO: string[] = [
  'As respostas, o histórico e os resultados das avaliações ficam guardados no seu aparelho. Eles não são enviados ao servidor do FGRC-M.',
  'O servidor guarda só o necessário para a sua conta, o seu pedido de acesso e as suas mensagens de suporte.',
  'O FGRC-M não vende dados, não mostra anúncios e não usa ferramentas de rastreamento.',
  'Você é responsável pelas informações que registra e pelo relatório em PDF depois de salvar ou compartilhar o arquivo.',
  'O resultado é uma orientação. Ele não substitui auditoria, certificação nem análise de especialistas.',
  'Você pode consultar, corrigir ou pedir a exclusão dos seus dados pessoais em Ajuda e suporte.',
];

// ---------- PARTE 1: Política de Privacidade (o que o app faz com os dados das pessoas)
// os números entre parênteses são os artigos da LGPD (Lei nº 13.709/2018) que pedem aquela informação
export const POLITICA_DE_PRIVACIDADE: Secao[] = [
  {
    // LGPD art. 9º, III e IV: quem é o controlador e como falar com ele
    titulo: '1. O que é o FGRC-M e quem responde pelos seus dados',
    textos: [
      'O FGRC-M é um aplicativo de autoavaliação de riscos cibernéticos para prefeituras, feito como projeto acadêmico da PUC Minas. Ele está em fase de testes.',
      'O uso é gratuito e o projeto não tem fins comerciais.',
      'Quem decide como os dados pessoais são usados no aplicativo é a equipe do projeto FGRC-M, formada por estudantes de Ciência da Computação da PUC Minas, com orientação de professores. Para a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018), essa equipe é a controladora dos dados.',
      'Canal de atendimento sobre dados pessoais: Ajuda e suporte, dentro do aplicativo (na página inicial ou no menu Mais). Escolha "Outro assunto" e escreva que o pedido é sobre dados pessoais.',
    ],
  },
  {
    // o que vai pro servidor (conferido nas telas de pedido de acesso e de suporte e nas tabelas do banco)
    titulo: '2. Quais dados pessoais o aplicativo usa',
    textos: [
      'Para a sua conta funcionar, ficam guardados no servidor do app (Supabase): nome completo, e-mail, prefeitura, município e estado. A senha é guardada pelo serviço de login de forma protegida; nem a equipe do FGRC-M consegue ver a sua senha. Se você recebeu uma senha provisória, o app pede para trocar no primeiro acesso.',
      'A senha provisória ou o código de acesso é gerado pela administração e entregue a você por e-mail ou por mensagem. Ele serve só para o primeiro acesso: depois que você cria a sua senha, ninguém mais consegue vê-la.',
      'Quando você pede acesso, enviamos: nome, e-mail, prefeitura, município, estado, a data e se o pedido saiu do navegador ou do celular.',
      'O pedido também guarda a situação (pendente, aprovado ou recusado) e a data em que foi analisado.',
      'Quando você fala com o suporte, enviamos: nome, e-mail, assunto e o texto que você escreveu. As respostas das avaliações não são incluídas automaticamente. Não coloque senhas ou informações sigilosas na mensagem.',
      'Se você estiver com a conta aberta ao falar com o suporte, a mensagem fica ligada à sua conta, para você acompanhar a resposta em Meus chamados.',
      'Quando você entra na conta, o serviço de login registra a data e a hora, o endereço IP e o tipo de navegador ou aparelho. Esses registros técnicos servem para a segurança da conta.',
      'Quando um aviso sobre o seu pedido é enviado por e-mail, fica registrado o endereço de destino, a data e se o envio deu certo.',
      'Quando você aceita os Termos de Uso na ativação da conta, ficam registradas na conta a versão dos termos e a data do aceite.',
      'O FGRC-M não pede CPF, telefone, endereço nem documentos. Ele não usa a localização, a câmera, o microfone ou os contatos do aparelho e não trata dados pessoais sensíveis, como dados de saúde, religião ou biometria.',
    ],
  },
  {
    titulo: '3. O que fica só no seu aparelho',
    textos: [
      'As respostas das avaliações, o rascunho, o histórico e os resultados ficam guardados apenas no celular ou no navegador onde você usa o app. Essas informações não são enviadas ao servidor do FGRC-M.',
      'O relatório em PDF é gerado no próprio aparelho. Ele só sai do aparelho quando você baixa, salva ou compartilha o arquivo.',
      'Cada conta tem o seu próprio espaço no aparelho. Se outra pessoa entrar com outra conta no mesmo aparelho, ela não vê as suas avaliações pelo aplicativo.',
      'Também ficam no aparelho as suas preferências (tema, tamanho do texto e acessibilidade) e as informações que mantêm a sua conta aberta.',
      'Se você desinstalar o app ou apagar os dados do navegador, essas informações podem ser perdidas e não poderão ser recuperadas pelo FGRC-M. Exporte e guarde os relatórios em PDF que forem importantes.',
      'As cópias de segurança feitas pelo próprio aparelho ou navegador (por exemplo, o backup do celular na conta do dono do aparelho) não são controladas pelo FGRC-M.',
      'Proteja o aparelho com senha ou biometria. Em computador ou celular compartilhado, saia da conta ao terminar: as informações continuam guardadas no aparelho e passam a depender da proteção dele.',
    ],
  },
  {
    // LGPD art. 9º, I (finalidade) e art. 7º (base legal de cada uso)
    titulo: '4. Para que os dados são usados',
    textos: [
      'Os dados pessoais são usados apenas para:',
      '• Analisar o seu pedido de acesso, criar e manter a sua conta e permitir a sua entrada no aplicativo. Base legal: os dados são necessários para atender o seu pedido e prestar o serviço a você (LGPD, art. 7º, V).',
      '• Responder às suas mensagens de suporte e avisar você sobre o pedido de acesso, a ativação da conta e a recuperação de senha. Base legal: a mesma (art. 7º, V).',
      '• Proteger as contas, evitar uso indevido e manter o registro das decisões da administração. Base legal: legítimo interesse em manter o aplicativo seguro (art. 7º, IX).',
      '• Cumprir a lei ou a ordem de uma autoridade competente, quando houver (art. 7º, II).',
      'Os seus dados não são vendidos e não são usados para publicidade nem para montar perfis. Quem aprova ou recusa um pedido de acesso é sempre uma pessoa da administração.',
      'O índice de exposição a riscos é calculado no seu aparelho e fala da prefeitura, não de você.',
    ],
  },
  {
    // LGPD art. 9º, V (uso compartilhado) e Marco Civil da Internet art. 7º, VII
    titulo: '5. Quem pode ver os dados e com quem são compartilhados',
    textos: [
      'Só a administração do FGRC-M (integrantes da equipe com conta de administração) vê as contas, os pedidos de acesso e as mensagens de suporte. Cada decisão da administração (aprovar, recusar, atender, excluir) fica registrada com o e-mail de quem decidiu e o horário.',
      'Outras prefeituras e outros usuários não têm acesso aos seus dados pelo aplicativo.',
      'Na tela Situação do pedido, quem digitar o seu e-mail vê apenas se o pedido está pendente, aprovado ou recusado. Nenhum outro dado aparece.',
      'Para funcionar, o FGRC-M usa serviços de outras empresas, que tratam os dados em nome da equipe:',
      '• Supabase: guarda o banco de dados e faz o serviço de login.',
      '• Serviço de e-mail: entrega os avisos sobre o pedido de acesso, os e-mails de ativação e de recuperação de senha e as respostas do suporte enviadas por e-mail.',
      '• Expo: hospeda a versão do aplicativo para navegador e o arquivo de instalação para Android. Como em qualquer site, o acesso gera registros técnicos, como o endereço IP.',
      'A equipe do FGRC-M continua responsável pelos seus dados mesmo quando usa esses serviços.',
      'Fora desses casos, os seus dados só são entregues a terceiros se a lei ou a ordem de uma autoridade competente exigir.',
    ],
  },
  {
    // LGPD arts. 33 a 36 (o projeto do Supabase foi criado na região do Canadá, conferido em 25/11/2026)
    titulo: '6. Onde os dados ficam guardados',
    textos: [
      'O banco de dados e o serviço de login do FGRC-M ficam em servidores do Supabase localizados no Canadá. Por isso, os dados da conta, dos pedidos de acesso e do suporte ficam guardados fora do Brasil. A LGPD chama isso de transferência internacional de dados (arts. 33 a 36).',
      'Essa transferência é necessária para a sua conta existir e para a equipe atender os seus pedidos, porque o banco de dados e o login do aplicativo funcionam nesse serviço. O fornecedor informa que protege os dados com criptografia, tanto guardados quanto em transmissão. Alguns serviços de apoio dos fornecedores podem funcionar em outros países.',
      'As respostas das avaliações não fazem parte dessa transferência: elas ficam no seu aparelho.',
    ],
  },
  {
    // LGPD art. 9º, II (duração) e arts. 15 e 16 (término do tratamento e eliminação)
    // o que acontece na exclusão ta na migração supabase/migrations/20261119140000_fgrcm_exclusao_definitiva.sql
    titulo: '7. Por quanto tempo os dados ficam guardados',
    textos: [
      'Cada tipo de dado fica guardado por um tempo diferente:',
      '• Conta: enquanto ela existir. Você pode pedir a exclusão a qualquer momento.',
      '• Pedido de acesso: fica guardado como registro da decisão da administração. Na exclusão da conta, o pedido ainda pendente é apagado; nos pedidos já analisados, o seu nome e o seu e-mail são removidos.',
      '• Mensagens de suporte: ficam guardadas para acompanhar o atendimento. Na exclusão da conta, o seu nome, o seu e-mail e o texto das mensagens são removidos.',
      '• Registro das decisões da administração: é mantido para prestação de contas. Na exclusão da conta, o seu e-mail é retirado desse registro.',
      '• Registros técnicos de acesso: pelo prazo definido pelo serviço de login.',
      '• Dados no seu aparelho: até você apagar, desinstalando o app ou limpando os dados do navegador.',
      'Quando o projeto acadêmico for encerrado, os dados pessoais guardados no servidor serão apagados, salvo o que a lei mandar guardar (LGPD, arts. 15 e 16).',
    ],
  },
  {
    // LGPD arts. 46 e 48 (segurança e aviso de incidente)
    titulo: '8. Como os dados são protegidos',
    textos: [
      'As principais medidas de segurança são:',
      '• A comunicação entre o aplicativo e o servidor é criptografada (HTTPS).',
      '• A senha precisa ser forte: pelo menos 10 caracteres, com letra maiúscula, letra minúscula, número e símbolo. Ela nunca é guardada de forma legível.',
      '• O banco de dados tem regras de acesso: uma conta comum não consegue ler contas, pedidos ou mensagens de outras pessoas.',
      '• As ações da administração só são feitas por contas autorizadas e ficam registradas.',
      '• As respostas das avaliações não são enviadas ao servidor, para não reunir em um só lugar as fragilidades de várias prefeituras.',
      'Nenhum sistema é totalmente seguro. Se acontecer um incidente de segurança que possa causar risco ou dano relevante a você, a equipe vai avisar você e a Agência Nacional de Proteção de Dados (ANPD), como determina a LGPD (art. 48).',
    ],
  },
  {
    // LGPD art. 9º, VII e art. 18 (a lei pede pra citar os direitos do art. 18 de forma explícita)
    titulo: '9. Seus direitos',
    textos: [
      'A LGPD (art. 18) garante a você, a qualquer momento e sem custo:',
      '• confirmar se o FGRC-M trata dados seus e ter acesso a eles;',
      '• corrigir dados incompletos, errados ou desatualizados;',
      '• pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desacordo com a lei;',
      '• pedir a portabilidade dos dados, conforme as regras da ANPD;',
      '• saber com quem os seus dados foram compartilhados;',
      '• ser informado sobre a possibilidade de não dar consentimento e sobre as consequências disso, revogar um consentimento já dado e pedir a eliminação dos dados tratados com base nele. Hoje o FGRC-M não usa o consentimento como base legal;',
      '• se opor a um tratamento feito em desacordo com a lei;',
      '• apresentar uma petição à ANPD, se a equipe não resolver o seu pedido (art. 18, § 1º).',
      'Você pode corrigir o seu nome e o seu e-mail em Mais › Meu perfil. Prefeitura, município e estado só a administração altera.',
      'Para pedir a exclusão da sua conta ou tirar dúvidas sobre os seus dados pessoais (Lei Geral de Proteção de Dados, Lei nº 13.709/2018), use Ajuda e suporte.',
      'Se você só fez o pedido de acesso e ainda não tem conta, também pode pedir que ele seja apagado.',
      'A equipe responde em até 15 dias. Para proteger você, pode ser pedido que a solicitação venha do e-mail da conta.',
      'A exclusão da conta não apaga as cópias dos relatórios em PDF que você já salvou ou compartilhou fora do aplicativo.',
      'A exclusão da conta também não apaga o que está guardado no seu aparelho. Para apagar, desinstale o app ou limpe os dados do navegador.',
    ],
    suporte: true,
  },
  {
    titulo: '10. Crianças e adolescentes',
    textos: [
      'O FGRC-M é destinado a servidores e pessoas autorizadas pelas prefeituras, maiores de 18 anos. Ele não é voltado a crianças e adolescentes.',
    ],
  },
  {
    titulo: '11. Cookies e rastreamento',
    textos: [
      'O FGRC-M não usa cookies de publicidade nem ferramentas de rastreamento ou de medição de audiência.',
      'No navegador, ele usa o armazenamento local apenas para manter a sua conta aberta e guardar as suas avaliações, as suas preferências e pequenos dados de funcionamento (por exemplo, se você já viu o tutorial).',
    ],
  },
  {
    titulo: '12. Mudanças nesta política',
    textos: [
      'Esta política pode ser atualizada. A versão em vigor é a que está publicada nesta tela, com a data. Mudanças importantes serão avisadas pelo aplicativo ou por e-mail.',
    ],
  },
];

// ---------- PARTE 2: Termos de Uso (as regras pra usar o app)
// as seções 5 e 6 são as da Nicole (responsabilidade pelas informações e pelo PDF)
// ATENÇÃO: esta lista também é a que aparece na leitura obrigatória da ativação da conta
// (src/features/integracao/AceiteDosTermos.tsx), então não escreva "nesta tela" aqui dentro
export const TERMOS_DE_USO: Secao[] = [
  {
    titulo: '1. Aceitação',
    textos: [
      'Ao pedir acesso, ativar a conta ou usar o FGRC-M, você declara que leu e concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não use o aplicativo.',
      'Na ativação da conta, o aplicativo mostra estes termos e só continua depois que você lê até o fim e toca em Li e aceito. O aceite fica registrado na sua conta, com a data e a versão dos termos.',
    ],
  },
  {
    titulo: '2. O que o FGRC-M faz e o que ele não faz',
    textos: [
      'O FGRC-M ajuda a prefeitura a avaliar a própria exposição a riscos cibernéticos, com um questionário, indicadores e recomendações.',
      'Os resultados servem para orientar a prefeitura. Eles não substituem uma auditoria, uma certificação ou uma análise feita por especialistas.',
      'Os resultados dependem das respostas informadas e das regras desta versão do aplicativo. Eles não comprovam que a prefeitura cumpre leis, normas ou padrões, como a LGPD, o NIST Cybersecurity Framework, os Controles CIS ou a ISO/IEC 27001.',
      'O aplicativo é um projeto acadêmico em fase de testes e pode conter erros.',
    ],
  },
  {
    titulo: '3. Quem pode usar',
    textos: [
      'O FGRC-M é para servidores e pessoas autorizadas a representar a prefeitura, maiores de 18 anos.',
      'A administração do FGRC-M confere cada pedido de acesso e pode recusar um pedido que não consiga confirmar.',
    ],
  },
  {
    titulo: '4. Sua conta e sua senha',
    textos: [
      'O acesso é pessoal e só é liberado depois que a administração confere o pedido. Não compartilhe a sua senha nem utilize a conta de outra pessoa.',
      'Use uma senha forte e que você não usa em outros lugares. Se você receber uma senha provisória ou um código de acesso, crie a sua própria senha no primeiro acesso.',
      'Você responde pelo que for feito com a sua conta. Se desconfiar que outra pessoa usou a sua conta, troque a senha e avise a equipe em Ajuda e suporte.',
    ],
  },
  {
    titulo: '5. Sua responsabilidade pelas informações',
    textos: [
      'Você é responsável pela veracidade e atualização das informações que registra e deve ter autorização para responder em nome da prefeitura.',
      'Confira as respostas antes de concluir a avaliação. Informações incorretas ou incompletas podem comprometer os resultados e as recomendações.',
      'Não inclua senhas, credenciais ou dados pessoais e sigilosos que não sejam necessários à avaliação.',
      'Use o aplicativo apenas para avaliações autorizadas. A prefeitura e o usuário responsável pelo preenchimento devem conferir as informações e avaliar as recomendações antes de tomar decisões.',
    ],
  },
  {
    titulo: '6. Sua responsabilidade pelo PDF',
    textos: [
      'O relatório em PDF é gerado com base nas respostas registradas. Você é responsável por conferir o conteúdo antes de utilizar ou compartilhar o documento.',
      'Após salvar ou exportar o PDF, você é responsável pela guarda, pelo uso, pelas cópias e pelo compartilhamento do arquivo sob seu controle.',
      'O relatório pode conter informações sobre riscos e fragilidades da prefeitura. Compartilhe apenas com pessoas autorizadas e evite deixar o arquivo em dispositivos, links ou canais públicos.',
      'Quando você usa Compartilhar PDF, o arquivo é entregue ao aplicativo que você escolher (por exemplo, e-mail ou mensagens), que tem as próprias regras de privacidade.',
      'O FGRC-M não controla o acesso às cópias salvas ou compartilhadas fora do aplicativo.',
      'Essas responsabilidades não afastam as obrigações legais de segurança e proteção de dados dos responsáveis pelo FGRC-M.',
    ],
  },
  {
    titulo: '7. O que não é permitido',
    textos: [
      'Não é permitido:',
      '• tentar acessar contas, pedidos ou dados de outras pessoas ou prefeituras;',
      '• burlar, testar ou desativar as proteções do aplicativo ou do servidor sem autorização da equipe;',
      '• informar dados falsos ou se passar por outra pessoa ou órgão;',
      '• usar o aplicativo para fins ilegais ou para prejudicar outras pessoas;',
      '• sobrecarregar o serviço com acessos automáticos.',
      'O descumprimento pode levar ao bloqueio da conta e, se houver indício de crime, à comunicação às autoridades.',
    ],
  },
  {
    titulo: '8. Disponibilidade e mudanças no aplicativo',
    textos: [
      'Por ser um projeto acadêmico em fase de testes, o FGRC-M pode ficar indisponível, entrar em manutenção, mudar ou ser encerrado. Sempre que possível, a equipe avisa antes pelo aplicativo.',
      'Como as avaliações ficam no seu aparelho, guarde os relatórios em PDF que forem importantes para a prefeitura.',
    ],
  },
  {
    titulo: '9. Suspensão e encerramento do acesso',
    textos: [
      'A administração pode suspender ou encerrar uma conta se estes termos forem descumpridos, se houver risco à segurança ou se o projeto for encerrado.',
      'Você pode parar de usar o aplicativo e pedir a exclusão da sua conta a qualquer momento, em Ajuda e suporte.',
    ],
  },
  {
    titulo: '10. Direitos autorais e marcas',
    textos: [
      'O aplicativo, os textos, o questionário e a identidade visual do FGRC-M foram criados pela equipe do projeto.',
      'As normas e os frameworks citados pertencem às respectivas instituições e são indicados em Referências, na tela Privacidade e termos.',
    ],
  },
  {
    titulo: '11. Limites de responsabilidade',
    textos: [
      'As decisões tomadas com base nos resultados e nas recomendações são de responsabilidade da prefeitura. Antes de aplicar uma recomendação, avalie o caso com a equipe técnica ou com especialistas.',
      'Dentro do que a lei permite, a equipe do FGRC-M não responde por prejuízos causados por informações incorretas ou incompletas, pela perda, pelo roubo ou pelo acesso indevido ao aparelho, pelo compartilhamento do PDF fora do aplicativo ou por períodos de indisponibilidade.',
      'Nada nestes termos retira direitos que a lei garante a você.',
    ],
  },
  {
    titulo: '12. Mudanças nestes termos',
    textos: [
      'Estes termos podem ser atualizados. A versão em vigor é a que está publicada na tela Privacidade e termos, com a data. Se você continuar usando o aplicativo depois de uma mudança, entende-se que concorda com a nova versão.',
    ],
  },
  {
    titulo: '13. Lei aplicável e contato',
    textos: [
      'Estes termos seguem as leis brasileiras, em especial a LGPD (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).',
      'Dúvidas, pedidos e reclamações: Ajuda e suporte, dentro do aplicativo.',
    ],
    suporte: true,
  },
];

export const REFERENCIAS = [
  {
    titulo: 'NIST Cybersecurity Framework 2.0',
    descricao:
      'Orientações para compreender, avaliar e gerenciar riscos de segurança cibernética.',
    url: 'https://www.nist.gov/cyberframework',
  },
  {
    titulo: 'CIS Critical Security Controls',
    descricao:
      'Controles e boas práticas para melhorar a segurança dos sistemas e das informações.',
    url: 'https://www.cisecurity.org/controls',
  },
  {
    titulo: 'ISO/IEC 27001:2022',
    descricao:
      'Requisitos para um sistema de gestão da segurança da informação.',
    url: 'https://www.iso.org/standard/27001',
  },
  {
    titulo: 'Lei Geral de Proteção de Dados Pessoais',
    descricao:
      'Lei nº 13.709/2018, que trata da proteção de dados pessoais no Brasil.',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
  },
  // [integração 25/11] as duas de baixo entraram pq o texto novo cita o Marco Civil e a ANPD
  // (os dois endereços foram abertos e conferidos em 25/11/2026)
  {
    titulo: 'Marco Civil da Internet',
    descricao:
      'Lei nº 12.965/2014, que estabelece princípios, garantias, direitos e deveres para o uso da internet no Brasil.',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm',
  },
  {
    titulo: 'Agência Nacional de Proteção de Dados (ANPD)',
    descricao:
      'Órgão que fiscaliza o cumprimento da LGPD. A página explica os direitos do titular de dados e como reclamar.',
    url: 'https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados',
  },
];
