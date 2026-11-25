// [integração 25/11] "Ficou com dúvida em como resolver?"
// as soluções do questionário foram escritas numa linguagem mais técnica (processo formal, VLAN, MFA, logs...)
// aqui cada solução ganhou uma explicação em palavras simples, pensando em quem não é da área de informática
// (ex: servidor de prefeitura do interior que nunca ouviu falar em firewall)
//
// como ta organizado: código da pergunta (igual ao id do questionário) e, dentro, as mesmas 3 faixas das soluções
//   faixa0ou1 = resposta 0 ou 1 | faixa2 = resposta 2 | faixa3 = resposta 3 (a resposta 4 não tem solução, então não tem explicação)
//
// IMPORTANTE: a explicação NÃO troca a solução do grupo, ela só explica a mesma coisa de um jeito mais fácil
// se alguém mudar o texto de uma solução no questionarioData.ts, precisa rever a explicação daqui também
// (o teste tests/teste-explicacoes-simples.cjs avisa quando falta alguma)
// textos propostos na integração: o grupo precisa revisar antes da entrega final
import {
  TODAS_QUESTOES_FGRC,
  type SolucoesPorFaixa,
} from '@/features/p03-avaliacoes-questionario/questionarioData';

// as 3 faixas são as mesmas chaves que o Hudson usou nas soluções (faixa0ou1, faixa2, faixa3)
export type FaixaDaSolucao = keyof SolucoesPorFaixa;

export const EXPLICACOES_SIMPLES: Record<string, Record<FaixaDaSolucao, string>> = {
  // ---------- GOV: Governança
  '01-GOV': {
    faixa0ou1:
      'Coloque no papel três coisas: quais serviços a prefeitura não pode deixar parar (por exemplo, saúde, folha de pagamento e arrecadação), quem depende deles (cidadãos, servidores, Câmara, Tribunal de Contas) e quais leis ela precisa cumprir, como a LGPD (lei de proteção de dados pessoais). Combine que toda decisão sobre segurança vai levar essa lista em conta.',
    faixa2:
      'Hoje isso é lembrado só em algumas decisões. Crie um roteiro curto, igual para todos os setores, com perguntas como: qual serviço é afetado? Quem depende dele? Alguma lei exige esse cuidado? Use o roteiro sempre que for decidir o que proteger primeiro e anote as respostas, para ficar registrado por que cada prioridade foi escolhida.',
    faixa3:
      'Marque uma data fixa, por exemplo uma vez por ano, para reler a lista de serviços essenciais, de quem depende deles e das leis que a prefeitura precisa cumprir. Atualize o que mudou (serviço novo, lei nova, outro responsável) e guarde a data da revisão.',
  },
  '02-GOV': {
    faixa0ou1:
      'Monte uma lista simples dos riscos, numa planilha ou num caderno: o que pode dar errado (por exemplo, perder os arquivos, vazar dados de cidadãos ou ficar sem sistema), qual a chance de acontecer e o tamanho do prejuízo. Marque cada risco como alto, médio ou baixo e comece a cuidar dos altos. Defina quem mantém essa lista atualizada.',
    faixa2:
      'A lista de riscos já existe, mas cada setor faz de um jeito. Escolha um modelo único (a mesma planilha e as mesmas notas de alto, médio e baixo) e peça para todos os setores usarem. Assim dá para comparar os riscos da prefeitura inteira e decidir o que vem primeiro.',
    faixa3:
      'Combine uma revisão com data marcada, por exemplo a cada seis meses ou quando algo importante mudar (sistema novo, golpe novo na região, corte de orçamento). Na revisão, confira se a forma de avaliar os riscos ainda serve para a realidade da prefeitura e ajuste o que for preciso.',
  },
  '03-GOV': {
    faixa0ou1:
      'Escreva em um documento, que pode ser uma portaria ou um ofício, quem cuida de quê: quem decide sobre segurança, quem cuida dos computadores e sistemas e quem deve ser avisado quando acontece um problema. Entregue uma cópia para essas pessoas e avise os setores, para ninguém ficar em dúvida sobre quem procurar.',
    faixa2:
      'Releia o documento que diz quem faz o quê e procure dois problemas: tarefa que ninguém assumiu (por exemplo, quem confere o backup) e tarefa com dois donos ao mesmo tempo. Deixe um responsável claro para cada tarefa.',
    faixa3:
      'Uma vez por ano, ou quando houver troca de gestão ou de equipe, confira se as pessoas indicadas como responsáveis ainda estão nos cargos e se as tarefas de cada uma continuam fazendo sentido. Atualize o documento e avise os setores sobre as mudanças.',
  },
  '04-GOV': {
    faixa0ou1:
      'Escreva um documento curto com as regras básicas de segurança da prefeitura, por exemplo: senha é pessoal e não se empresta, só se instala programa autorizado e arquivos importantes ficam guardados onde há backup. Publique como norma (portaria ou decreto), entregue aos servidores e explique em uma reunião.',
    faixa2:
      'A política existe, mas nem todos conhecem ou seguem. Defina como ela chega a cada servidor (na entrada de novos servidores, no mural, em reunião) e como a prefeitura vai conferir se está sendo cumprida, por exemplo com uma verificação rápida em cada setor a cada semestre.',
    faixa3:
      'Marque uma data, por exemplo uma vez por ano, para reler a política e atualizar o que ficou velho: sistemas novos, novos tipos de golpe, mudanças na equipe ou no orçamento. Publique a versão nova e avise os servidores do que mudou.',
  },
  '05-GOV': {
    faixa0ou1:
      'Marque um encontro com data fixa, por exemplo a cada seis meses, para responder: que problemas de segurança aconteceram? O que foi feito para resolver? O que ainda falta? Anote as conclusões e use para decidir os próximos passos.',
    faixa2:
      'A avaliação já acontece, mas olha só uma parte ou não muda nada depois. Inclua todos os setores e assuntos e, ao final de cada avaliação, faça uma lista de tarefas com responsável e prazo para cada melhoria. Na avaliação seguinte, comece conferindo se essas tarefas foram feitas.',
    faixa3:
      'Guarde o resultado de cada avaliação no mesmo lugar e acompanhe alguns números simples ao longo do tempo, como quantos problemas aconteceram e quanto tempo levou para resolver. Use esses números para decidir o que ajustar e onde vale a pena investir.',
  },

  // ---------- AST: Inventário e Gestão de Ativos
  '01-AST': {
    faixa0ou1:
      'Faça uma lista, em uma planilha, de tudo que a prefeitura usa de tecnologia: computadores, notebooks, impressoras, servidores, roteadores de internet e também os programas e sistemas. Para cada item, anote onde fica e quem usa. Escolha uma pessoa para manter essa lista em dia.',
    faixa2:
      'A lista já existe, mas está incompleta ou desatualizada. Passe em todos os setores, incluindo escolas, postos de saúde e outros prédios, para incluir o que ficou de fora, sem esquecer os programas e sistemas. Depois marque uma conferência com data fixa, por exemplo a cada seis meses.',
    faixa3:
      'Crie o hábito de atualizar a lista na hora em que algo muda: chegou um computador novo, entra na lista; mudou de setor ou de usuário, corrige; foi descartado, doado ou quebrou, dá baixa. Deixe escrito quem faz essa atualização em cada caso.',
  },
  '02-AST': {
    faixa0ou1:
      'Na lista de equipamentos e sistemas, marque a importância de cada um, por exemplo: essencial (se parar, o atendimento para), importante ou comum. Depois defina os cuidados de cada grupo, da compra até o descarte: quem pode usar, de quanto em quanto tempo tem manutenção e como é trocado ou descartado.',
    faixa2:
      'A classificação já existe, mas só para uma parte dos equipamentos e sistemas. Aplique a mesma regra a todos os que são relevantes, começando pelos que mais prejudicam a população se pararem, como o sistema da saúde, o da arrecadação e o da folha de pagamento.',
    faixa3:
      'Com data marcada, por exemplo uma vez por ano, confira se a importância de cada equipamento ou sistema continua a mesma. Um sistema pode ter ficado mais importante porque passou a ser usado por mais setores, e outro pode ter sido deixado de lado. Ajuste a classificação e os cuidados de acordo.',
  },
  '03-AST': {
    faixa0ou1:
      'Combine como descobrir aparelhos e programas que não estão na lista da prefeitura, como um roteador de Wi-Fi trazido de casa, um notebook pessoal ligado na rede ou um programa instalado por conta própria. Decida também o que fazer quando achar um: registrar na lista, se for necessário para o trabalho, ou retirar.',
    faixa2:
      'Essa busca por aparelhos e programas não autorizados já é feita, mas só em alguns lugares ou de vez em quando. Faça em todos os setores e com data marcada, por exemplo a cada três meses, comparando o que está ligado na rede e instalado nos computadores com a lista oficial.',
    faixa3:
      'Para cada aparelho ou programa não autorizado que for encontrado, anote o que foi decidido (registrar, regularizar ou retirar), quem ficou responsável e até quando. Depois volte para conferir se foi mesmo resolvido, para nada ficar esquecido.',
  },

  // ---------- IAM: Identidade e Controle de Acesso
  '01-IAM': {
    faixa0ou1:
      'Peça a lista de quem tem usuário e senha em cada sistema importante. Depois combine uma regra: cada pessoa acessa só o que precisa para o seu trabalho (quem atende no balcão não precisa mexer no financeiro). Defina também quem autoriza a criação de novos usuários, por exemplo o chefe do setor.',
    faixa2:
      'Crie modelos de acesso por função, por exemplo atendente, contador e chefe de setor, e use os mesmos em toda a prefeitura. Confira os usuários atuais e retire o que cada um tem a mais, principalmente as contas de administrador, que podem mudar tudo no sistema e devem ficar com poucas pessoas.',
    faixa3:
      'Com data marcada, por exemplo a cada seis meses, mostre a cada chefe a lista de quem acessa o quê no setor dele e pergunte se ainda está certo. Quem mudou de função ou não precisa mais de um acesso deve ter esse acesso retirado.',
  },
  '02-IAM': {
    faixa0ou1:
      'Combine uma regra de senha que valha para todos: tamanho mínimo, mistura de letras, números e símbolos e de quanto em quanto tempo trocar. Depois ligue a verificação em duas etapas (MFA) no e-mail, no sistema financeiro e nos acessos feitos de fora da prefeitura: além da senha, a pessoa confirma com um código que chega no celular. Assim fica muito mais difícil alguém entrar, mesmo que descubra a senha.',
    faixa2:
      'Use a mesma regra de senha em todos os sistemas e ligue a verificação em duas etapas (senha mais um código no celular) para todas as pessoas que acessam dados sensíveis, como dados pessoais de cidadãos, informações de saúde, folha de pagamento e finanças.',
    faixa3:
      'Com data marcada, por exemplo uma vez por ano, confira se a regra de senha e a verificação em duas etapas continuam ligadas em todos os sistemas importantes, inclusive nos que foram contratados depois. Aproveite para ajustar as regras quando surgirem novas recomendações de segurança.',
  },
  '03-IAM': {
    faixa0ou1:
      'Combine um aviso obrigatório: sempre que alguém sair da prefeitura ou mudar de setor, o RH avisa quem cuida dos sistemas, de preferência no mesmo dia. Pode ser por e-mail ou por um formulário simples. Com o aviso, os usuários e senhas dessa pessoa são bloqueados ou ajustados.',
    faixa2:
      'Faça o mesmo aviso valer para todos os setores e todos os sistemas, com uma lista do que conferir a cada saída: e-mail, sistemas, rede e também o acesso feito de fora da prefeitura (acesso remoto). Inclua na mesma regra os funcionários de empresas contratadas.',
    faixa3:
      'A cada seis meses, compare a lista de usuários de cada sistema com a lista atual de servidores do RH. Se aparecer alguém que já saiu, ou que não precisa mais daquele acesso, bloqueie na hora e descubra por que o aviso não funcionou.',
  },

  // ---------- DAT: Proteção de Dados
  '01-DAT': {
    faixa0ou1:
      'Faça uma lista dos tipos de informação que a prefeitura guarda: cadastro de cidadãos, prontuários de saúde, dados de alunos, folha de pagamento, contratos. Depois separe em três grupos: pública (qualquer pessoa pode ver), interna (só servidores) e sigilosa (só quem precisa para trabalhar). Isso mostra o que precisa de mais proteção.',
    faixa2:
      'Leve a mesma separação (pública, interna e sigilosa) para todos os setores, usando as mesmas regras. Explique aos chefes e a quem cuida de cada tipo de informação o que cada grupo significa e quais cuidados ele exige.',
    faixa3:
      'Com data marcada, por exemplo uma vez por ano, confira se a classificação continua correta. Um serviço novo, um sistema novo ou uma lei nova podem criar informações que ainda não foram classificadas ou mudar o cuidado exigido.',
  },
  '02-DAT': {
    faixa0ou1:
      'Descubra onde ficam os dados mais sensíveis: em quais sistemas, computadores e pen drives. Depois peça a quem cuida da informática duas proteções básicas: que os sistemas e sites usem conexão segura (o endereço começa com https) e que os notebooks e arquivos mais importantes sejam criptografados, ou seja, embaralhados de um jeito que só abre com senha.',
    faixa2:
      'Alguns sistemas já têm proteção e outros não. Faça uma lista dos sistemas mais importantes e marque, para cada um, se os dados estão protegidos quando ficam guardados e quando são enviados pela internet. Onde faltar, peça a correção a quem cuida da informática ou ao fornecedor do sistema.',
    faixa3:
      'Com data marcada, por exemplo uma vez por ano, peça a quem cuida da informática para conferir se as proteções continuam ligadas e adequadas em todos os sistemas e equipamentos, inclusive nos que chegaram depois.',
  },
  '03-DAT': {
    faixa0ou1:
      'Combine uma regra: nenhum computador, HD, pen drive ou celular é descartado, doado ou passado para outro uso sem antes ter os dados apagados por quem cuida da informática. Apagar pela lixeira não basta, porque os arquivos podem ser recuperados. Papéis com dados pessoais devem ser picados ou triturados.',
    faixa2:
      'Faça a regra de descarte valer para todos os setores. Defina quem apaga os dados dos equipamentos e como: com a formatação segura, que apaga de um jeito que não dá para recuperar. Defina também como os papéis são destruídos, por exemplo com uma trituradora.',
    faixa3:
      'Mantenha um registro simples de cada descarte: o que foi descartado, quando e quem apagou os dados. De tempos em tempos, por exemplo a cada seis meses, confira se todos os equipamentos e documentos que saíram passaram por esse processo.',
  },

  // ---------- VUL: Configuração, Atualizações e Vulnerabilidades
  '01-VUL': {
    faixa0ou1:
      'Escreva um passo a passo de como cada computador deve ser preparado e mantido: ligar as atualizações automáticas do sistema e dos programas, instalar só programas autorizados e trocar as senhas que vêm de fábrica em roteadores e impressoras. Defina quem faz isso e de quanto em quanto tempo confere, por exemplo uma vez por mês.',
    faixa2:
      'O passo a passo já existe, mas não chega a todos os equipamentos. Aplique em todos os que importam, inclusive servidores, roteadores, impressoras e os computadores dos prédios mais afastados, sempre do mesmo jeito. Use a lista de equipamentos para marcar o que já foi feito.',
    faixa3:
      'Mantenha um controle, que pode ser uma planilha, de quando cada equipamento foi atualizado e conferido. Com data marcada, procure os que ficaram para trás: computador sem atualizar há meses, programa que o fabricante não atualiza mais, configuração fora do padrão. Corrija cada caso e anote.',
  },
  '02-VUL': {
    faixa0ou1:
      'Vulnerabilidade é uma falha ou um descuido que facilita um ataque, como um sistema sem atualização ou uma senha fraca. Combine como a prefeitura vai procurar essas falhas (avisos dos fabricantes, verificação feita por quem cuida da informática), anote cada uma em uma lista e defina o que corrigir primeiro: o que afeta os sistemas mais importantes.',
    faixa2:
      'As falhas já são anotadas, mas falta decidir bem a ordem de correção. Crie uma regra escrita, por exemplo: falha grave em sistema essencial é corrigida em poucos dias, e as outras, em até um mês. Para cada falha, anote o responsável e o prazo e acompanhe até a correção.',
    faixa3:
      'Com data marcada, por exemplo uma vez por mês, revise a lista de falhas: quais foram corrigidas, quais estão atrasadas e por quê. As mais graves não podem passar do prazo combinado.',
  },

  // ---------- BKP: Backup e Recuperação de Dados
  '01-BKP': {
    faixa0ou1:
      'Backup é uma cópia de segurança dos arquivos e dos dados dos sistemas. Defina por escrito o que precisa ser copiado, de quanto em quanto tempo (o ideal é todo dia para o que muda todo dia), quem é o responsável e onde a cópia fica. Guarde pelo menos uma cópia fora do computador e do prédio de origem, protegida com senha.',
    faixa2:
      'O backup já é feito, mas tem falhas. Confira se todos os dados importantes entram na cópia, se ela fica em local protegido e separado dos computadores e se as cópias antigas são guardadas por um tempo. Faça testes com data marcada: tente abrir um arquivo ou um sistema a partir do backup, para ter certeza de que ele funciona.',
    faixa3:
      'Confira com frequência, de preferência todo dia ou toda semana, se o backup foi feito sem erro, e anote o resultado de cada teste de recuperação. Quando um backup ou um teste falhar, descubra a causa, corrija e ajuste o procedimento para o erro não se repetir.',
  },
  '02-BKP': {
    faixa0ou1:
      'Escreva um passo a passo do que fazer se um sistema parar ou os dados forem perdidos: quem é chamado, o que volta primeiro (por exemplo, saúde e arrecadação antes do resto) e como os dados são trazidos de volta do backup. Deixe esse roteiro impresso, porque o computador pode ser justamente o que parou.',
    faixa2:
      'Inclua no roteiro todos os sistemas e dados essenciais, e não só alguns. Com data marcada, por exemplo a cada seis meses, faça um teste: simule a perda de um sistema e veja se a equipe consegue trazer tudo de volta seguindo o roteiro, e em quanto tempo.',
    faixa3:
      'Depois de cada teste ou de cada recuperação de verdade, anote o que funcionou, o que deu errado e quanto tempo levou. Use essas anotações para corrigir o roteiro e para confirmar que os dados recuperados voltaram completos e corretos.',
  },

  // ---------- NET: Proteção de Rede e Infraestrutura
  '01-NET': {
    faixa0ou1:
      'Firewall é uma barreira que fica entre a internet e a rede da prefeitura e bloqueia acessos indesejados. Peça a quem cuida da informática para instalar ou ligar um. Peça também um Wi-Fi separado para visitantes: quem usa esse Wi-Fi navega na internet, mas não alcança os computadores e sistemas da prefeitura.',
    faixa2:
      'Peça a quem cuida da informática para dividir a rede em partes separadas (o nome técnico é VLAN), como se fossem salas com portas trancadas. Por exemplo: uma parte para o financeiro, outra para a saúde e outra para os servidores de arquivos. Assim fica mais difícil um vírus ou invasor passar de um setor para os outros. Comece pelos setores com os dados e serviços mais importantes.',
    faixa3:
      'A cada três meses, peça a quem cuida da informática para revisar as regras do firewall, que dizem o que pode entrar e sair da rede. É comum sobrarem liberações antigas que ninguém usa mais, e cada uma é uma porta aberta sem necessidade. O que não tiver justificativa deve ser fechado.',
  },
  '02-NET': {
    faixa0ou1:
      'Se hoje dá para chegar pela internet até a tela de acesso remoto dos computadores da prefeitura (a Área de Trabalho Remota, ou RDP), peça com urgência a quem cuida da informática para bloquear esse acesso direto, porque esse é um caminho muito usado por criminosos. No lugar, use uma VPN, que funciona como um túnel protegido: só entra quem tem usuário e senha, e o que passa por ele não pode ser lido por estranhos.',
    faixa2:
      'Para entrar na rede da prefeitura de fora, peça mais do que a senha: a pessoa também confirma com um código no celular (isso é o MFA, ou verificação em duas etapas). Peça ainda a quem cuida da informática para guardar o registro de cada acesso remoto: quem entrou, em que dia e a que horas.',
    faixa3:
      'Com data marcada, por exemplo a cada três meses, peça a lista de todos que podem acessar a rede da prefeitura de fora. Retire quem saiu, quem mudou de setor, as empresas que já terminaram o serviço e quem não precisa mais desse acesso.',
  },

  // ---------- MON: Proteção contra Malware e Monitoramento
  '01-MON': {
    faixa0ou1:
      'Confira, um por um, se os computadores e servidores têm antivírus instalado, ligado e atualizado. Antivírus é o programa que bloqueia vírus e outros programas maliciosos. Onde não tiver, instale, começando pelos equipamentos mais importantes, como os que guardam dados dos cidadãos e os que rodam os sistemas da prefeitura.',
    faixa2:
      'Use a mesma proteção (o mesmo antivírus, configurado do mesmo jeito) em todos os equipamentos importantes e instale onde ainda falta. Defina quem confere, com frequência, se está tudo atualizado e quem olha os avisos de ameaça encontrada, para agir quando eles aparecerem.',
    faixa3:
      'Com data marcada, por exemplo a cada seis meses, confira se todos os equipamentos, inclusive os novos, continuam protegidos e se a proteção usada ainda dá conta dos golpes e vírus mais recentes. Se não der, ajuste a configuração ou troque a ferramenta.',
  },
  '02-MON': {
    faixa0ou1:
      'Os sistemas e equipamentos conseguem guardar um histórico do que acontece neles, chamado de log: quem entrou, a que horas, o que deu erro. Peça a quem cuida da informática para ligar esse histórico nos sistemas e equipamentos mais importantes. Escolha uma pessoa ou equipe para olhar os avisos principais, como várias tentativas de senha errada ou acessos de madrugada.',
    faixa2:
      'Faça valer a mesma regra para todos os sistemas importantes: quem olha os registros, de quanto em quanto tempo (por exemplo, toda semana) e o que merece atenção, como muitas senhas erradas seguidas, acessos fora do horário de trabalho e contas novas criadas sem aviso.',
    faixa3:
      'Com data marcada, por exemplo a cada seis meses, confira se os avisos acompanhados ainda são os mais úteis. Inclua os sistemas novos, ajuste os avisos que não ajudam e crie avisos para os problemas e golpes que apareceram no período.',
  },
  '03-MON': {
    faixa0ou1:
      'Combine o que fazer quando aparecer um aviso ou algo estranho, como um arquivo que sumiu ou um computador muito lento: quem olha primeiro, o que essa pessoa confere (qual computador, que horas, quem estava usando) e em que casos ela chama o responsável, por exemplo quando envolve dados de cidadãos ou mais de um computador.',
    faixa2:
      'Coloque no papel, igual para todos, como avaliar uma situação suspeita: o que foi afetado, quantas pessoas e setores e se há dados em risco. Defina também quando ela passa a ser tratada como incidente de segurança (um problema sério), por exemplo quando há vazamento de dados, vírus que se espalha ou sistema fora do ar.',
    faixa3:
      'Com data marcada, e também depois de cada problema sério, releia esse roteiro de análise: o que foi difícil? O que demorou? O que faltou? Atualize as regras com o que foi aprendido e com as mudanças nos sistemas e serviços da prefeitura.',
  },

  // ---------- INC: Resposta a Incidentes
  '01-INC': {
    faixa0ou1:
      'Escreva um plano curto para quando acontecer um problema sério, como vírus, invasão ou vazamento de dados: quem coordena e quem é o substituto, os telefones importantes (informática, fornecedor do sistema, chefia), onde anotar o que aconteceu e os primeiros passos, como tirar o computador afetado da rede e avisar o responsável.',
    faixa2:
      'Releia o plano e complete o que falta, como telefone desatualizado, substituto não definido ou serviço importante que ficou de fora. Depois apresente o plano às pessoas citadas nele, para que cada uma saiba o que fazer, e confira se ele serve para os principais serviços da prefeitura.',
    faixa3:
      'Com data marcada, por exemplo uma vez por ano, faça um treino: reúna a equipe, imagine uma situação (por exemplo, os arquivos da prefeitura foram bloqueados por criminosos) e siga o plano passo a passo. Anote onde a equipe teve dificuldade e use essas anotações para corrigir o plano.',
  },
  '02-INC': {
    faixa0ou1:
      'Combine quatro coisas para a hora do problema: onde anotar o que aconteceu e o que foi feito (com data e hora), quem precisa ser avisado, quem tem autoridade para decidir (por exemplo, mandar desligar um sistema) e quais primeiros passos evitam que o problema se espalhe, como desconectar o computador da rede.',
    faixa2:
      'Faça todos os setores seguirem o mesmo roteiro em qualquer problema sério, sempre com os quatro passos: anotar, avisar as pessoas certas, conter (impedir que se espalhe) e eliminar a causa (por exemplo, remover o vírus e corrigir a falha que deixou ele entrar).',
    faixa3:
      'Com data marcada, por exemplo a cada seis meses, confira se o roteiro e a lista de contatos continuam valendo: telefones e e-mails, nomes dos responsáveis, empresas contratadas e sistemas em uso. Atualize sempre que houver troca de pessoas, de contrato ou de sistema.',
  },

  // ---------- AWR: Pessoas e Conscientização
  '01-AWR': {
    faixa0ou1:
      'Monte uma folha simples com os combinados básicos, por exemplo: não emprestar a senha, não deixar a senha anotada na mesa, bloquear o computador ao sair e não mandar dados de cidadãos por aplicativos pessoais. Escolha quem vai explicar essa folha e inclua a conversa no primeiro dia de trabalho de cada novo servidor.',
    faixa2:
      'Faça uma lista dos setores e marque quais já receberam as orientações. Leve o mesmo material aos que faltam, sem esquecer escolas, postos de saúde e prédios afastados. Usar um conteúdo único evita que cada setor receba uma orientação diferente.',
    faixa3:
      'Com data marcada, por exemplo uma vez por ano, releia o material para ver se ainda combina com os sistemas e com a rotina de hoje e confira a lista de presença para saber quem ainda não participou. Atualize o conteúdo e chame quem faltou.',
  },
  '02-AWR': {
    faixa0ou1:
      'Explique aos servidores três cuidados: olhar com atenção quem enviou a mensagem; desconfiar de pedidos urgentes de senha, dados ou pagamento; e confirmar o pedido por um telefone ou contato que já conhecem, nunca pelo que veio na própria mensagem. Mostre exemplos de mensagens falsas e reforce: na dúvida, não clique em links nem abra anexos.',
    faixa2:
      'Leve a orientação aos setores que ainda não receberam e use exemplos do dia a dia de cada um: no financeiro, um boleto ou pedido de pagamento falso; em compras, um fornecedor falso pedindo para mudar a conta bancária; no atendimento, alguém se passando por cidadão ou por chefe para conseguir dados.',
    faixa3:
      'Sempre que aparecer um golpe novo na prefeitura ou na região, inclua nos exemplos e avise os setores. De tempos em tempos, faça um exercício rápido: mostre algumas mensagens e peça para os servidores dizerem quais são falsas e por quê. Reforce o assunto onde houver mais erros.',
  },
  '03-AWR': {
    faixa0ou1:
      'Escolha um contato único para avisos de segurança (uma pessoa, um ramal ou um e-mail) e divulgue em todos os setores. Explique o que deve ser avisado, como mensagem estranha, computador com comportamento diferente ou alguém pedindo senha, e o que informar: o que aconteceu, quando e em qual computador. Deixe claro que ninguém deve enviar a senha no aviso.',
    faixa2:
      'Leve o contato aos setores que ainda não conhecem e inclua essa orientação na chegada de cada novo servidor. Deixe as instruções em um lugar fácil de achar, como um cartaz ao lado dos computadores ou um aviso fixo no mural.',
    faixa3:
      'De tempos em tempos, por exemplo a cada seis meses, teste o contato para ver se alguém atende ou responde. Pergunte também a alguns servidores de setores diferentes: se você recebesse uma mensagem estranha agora, quem avisaria? Se muitos não souberem, divulgue de novo.',
  },
  '04-AWR': {
    faixa0ou1:
      'Liste as pessoas que cuidam dos sistemas ou que criam usuários e liberam acessos, incluindo os funcionários de empresas contratadas. Para cada uma, veja o que ela precisa saber de segurança para fazer bem esse trabalho e providencie o treinamento, que pode ser um curso ou uma orientação do fornecedor do sistema.',
    faixa2:
      'Veja quem ainda não foi treinado e do que cada função precisa. Comece por quem tem mais poder nos sistemas (as contas de administrador, que podem mudar tudo) e por quem cuida dos sistemas que não podem parar.',
    faixa3:
      'Sempre que a prefeitura trocar de sistema ou alguém receber novas tarefas, veja se é preciso um novo treinamento. Confira também, na prática, se o que foi aprendido está sendo usado, por exemplo se os acessos são liberados seguindo as regras combinadas.',
  },
  '05-AWR': {
    faixa0ou1:
      'Ao final de cada orientação ou treinamento, faça três ou quatro perguntas rápidas ou apresente uma situação do dia a dia, como: chegou um e-mail pedindo a sua senha, o que você faz? Anote quantas pessoas acertaram cada pergunta. Os assuntos com mais erros são os que precisam ser explicados de novo.',
    faixa2:
      'Faça essas perguntas em todos os treinamentos, e não só em alguns. Onde a maioria errar, mude a explicação: use exemplos mais próximos da rotina da prefeitura ou dedique mais tempo ao assunto.',
    faixa3:
      'Guarde os resultados de cada treinamento e compare com os anteriores. Se o mesmo assunto continuar com muitos erros, mude a forma de ensinar: troque a palestra por uma demonstração prática, use casos reais ou faça grupos menores.',
  },

  // ---------- TPR: Terceiros, Fornecedores e Nuvem
  '01-TPR': {
    faixa0ou1:
      'Prepare um texto padrão para colocar em todo novo contrato de tecnologia (sistemas, internet, manutenção, nuvem). Ele deve dizer que a empresa precisa proteger os dados da prefeitura, usar esses dados só para o serviço contratado, manter sigilo e cumprir a LGPD, a lei de proteção de dados pessoais. Peça ajuda ao setor jurídico ou de licitações para redigir.',
    faixa2:
      'Liste todas as empresas que hoje fornecem sistemas ou guardam dados da prefeitura, inclusive na nuvem (quando os dados ficam em computadores da empresa, acessados pela internet). Releia os contratos em vigor e inclua, por termo aditivo, a obrigação de a empresa avisar a prefeitura se houver invasão, vazamento ou perda de dados.',
    faixa3:
      'Antes de contratar uma nova empresa de tecnologia, faça uma verificação de segurança com perguntas simples: como ela protege os dados? Faz backup? Já teve vazamento? Quem terá acesso aos dados da prefeitura? Coloque essa exigência no edital ou no termo de referência e só contrate quem atender.',
  },
  '02-TPR': {
    faixa0ou1:
      'Acabe com o usuário único que vários técnicos de fora usam, como um usuário chamado suporte com a mesma senha para todos. Cada técnico ou empresa deve ter o seu próprio usuário e senha. Assim dá para saber quem entrou e o que fez, e para bloquear uma pessoa sem atrapalhar as outras.',
    faixa2:
      'Combine que o acesso de uma empresa ou de um técnico é desligado assim que o serviço termina. Para não depender da memória, crie o acesso já com data para acabar ou marque um lembrete para quem cuida dos sistemas. Se a empresa precisar voltar, o acesso é liberado de novo.',
    faixa3:
      'Peça a quem cuida da informática para guardar um histórico (log) de cada vez que uma empresa de fora acessa os sistemas da prefeitura à distância: quem entrou, em que dia, a que horas e por quanto tempo. Assim dá para conferir depois se os acessos batem com os serviços pedidos.',
  },
};

// soluções que tiveram só um acerto de português em 25/11 (era "relacionados", virou "relacionadas")
// a avaliação salva antes guarda o texto antigo; o sentido é o mesmo, então a explicação continua valendo pra ela
const TEXTO_ANTES_DO_ACERTO: Record<string, Partial<Record<FaixaDaSolucao, string>>> = {
  '03-GOV': {
    faixa0ou1:
      'Formalizar as funções, responsabilidades e autoridades relacionados à gestão da segurança cibernética, documentando as atribuições dos responsáveis e comunicando-as aos envolvidos.',
    faixa2:
      'Revisar e delimitar as funções, responsabilidades e autoridades relacionados à gestão da segurança cibernética, eliminando sobreposições e lacunas de atribuições.',
  },
};

// mesma regra do questionário: nota 0 ou 1 usa a primeira solução, 2 a segunda, 3 a terceira
// a nota 4 não tem solução (a prática já ta no nível mais alto), então volta null
export function faixaDaNota(valor: number): FaixaDaSolucao | null {
  if (valor === 0 || valor === 1) return 'faixa0ou1';
  if (valor === 2) return 'faixa2';
  if (valor === 3) return 'faixa3';
  return null;
}

const questaoPorId = new Map(TODAS_QUESTOES_FGRC.map((q) => [q.id, q]));

// devolve a explicação simples da recomendação que ta aparecendo na tela ou no PDF
// só devolve se a recomendação guardada na avaliação for a mesma solução que ta no questionário hoje
// (se um dia a solução mudar, o relatório antigo mostra só a solução antiga, sem uma explicação que não combina)
export function explicacaoSimples(
  idDaPergunta: string,
  valor: number,
  recomendacao: string | null,
): string | null {
  const faixa = faixaDaNota(valor);
  if (!faixa || !recomendacao) return null;
  const questao = questaoPorId.get(idDaPergunta);
  const explicacao = EXPLICACOES_SIMPLES[idDaPergunta]?.[faixa];
  if (!questao || !explicacao) return null;
  const mesmaSolucao =
    questao.solucoes[faixa] === recomendacao ||
    TEXTO_ANTES_DO_ACERTO[idDaPergunta]?.[faixa] === recomendacao;
  return mesmaSolucao ? explicacao : null;
}
