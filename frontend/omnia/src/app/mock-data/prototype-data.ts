export const REFERENCE_PERIOD = 'Janeiro a agosto de 2026';

export interface KPI {
  label: string;
  value: string;
  hint: string;
}

export const kpis: KPI[] = [
  { label: 'Correições realizadas', value: '12', hint: 'concluídas em 2026' },
  { label: 'Correições em andamento', value: '3', hint: 'com auditoria ou validação ativa' },
  { label: 'Processos examinados', value: '84.620', hint: 'nas bases analíticas autorizadas' },
  { label: 'Ocorrências potenciais', value: '1.438', hint: 'submetidas à validação' },
  { label: 'Providências pendentes', value: '96', hint: 'aguardando unidade ou equipe' },
];

export type Atencao = 'Alta' | 'Média' | 'Baixa';

export interface Unidade {
  nome: string;
  ultima: string;
  conformidade: number;
  criticos: number;
  pendentes: number;
  atencao: Atencao;
  destaque?: boolean;
}

export const unidades: Unidade[] = [
  {
    nome: '1ª Vara Cível',
    ultima: '18/8/2025',
    conformidade: 82,
    criticos: 38,
    pendentes: 21,
    atencao: 'Alta',
    destaque: true,
  },
  { nome: '2ª Vara Cível', ultima: '10/3/2026', conformidade: 94, criticos: 7, pendentes: 4, atencao: 'Baixa' },
  {
    nome: 'Vara da Fazenda Pública',
    ultima: '22/11/2025',
    conformidade: 87,
    criticos: 19,
    pendentes: 13,
    atencao: 'Média',
  },
  { nome: '1ª Vara Criminal', ultima: '4/2/2026', conformidade: 91, criticos: 11, pendentes: 6, atencao: 'Média' },
];

export interface RegraCritica {
  regra: string;
  ocorrencias: number;
  unidades: number;
  tendencia: 'Crescente' | 'Estável' | 'Decrescente';
}

export const regrasCriticas: RegraCritica[] = [
  { regra: 'Processos paralisados além do prazo', ocorrencias: 286, unidades: 8, tendencia: 'Crescente' },
  { regra: 'Ordem judicial sem cumprimento localizado', ocorrencias: 174, unidades: 6, tendencia: 'Estável' },
  { regra: 'Arquivamento com possível pendência', ocorrencias: 127, unidades: 4, tendencia: 'Crescente' },
  { regra: 'Classe ou assunto incompatível', ocorrencias: 96, unidades: 7, tendencia: 'Decrescente' },
  { regra: 'Movimentações potencialmente redundantes', ocorrencias: 81, unidades: 5, tendencia: 'Estável' },
];

export const evolucaoConformidade = [
  { etapa: 'Conformidade inicial', valor: 82 },
  { etapa: 'Após 1ª rodada', valor: 89 },
  { etapa: 'Situação atual', valor: 94 },
];

export interface CorreicaoRecente {
  unidade: string;
  status: 'Concluída' | 'Em validação' | 'Plano de ação';
  linhas: string[];
}

export const correicoesRecentes: CorreicaoRecente[] = [
  {
    unidade: '2ª Vara Cível',
    status: 'Concluída',
    linhas: ['8.320 processos examinados', '74 ocorrências confirmadas', '92% das providências cumpridas'],
  },
  {
    unidade: 'Vara da Fazenda Pública',
    status: 'Em validação',
    linhas: ['11.450 processos examinados', '143 achados aguardando análise'],
  },
  {
    unidade: '1ª Vara Criminal',
    status: 'Plano de ação',
    linhas: ['56 providências', '41 concluídas'],
  },
];

export const alertas: string[] = [
  '21 providências vencidas',
  '8 regras aguardando aprovação',
  '3 correições com validação pendente',
  '1 unidade sem correição no período planejado',
];

export interface RegraBiblioteca {
  id: string;
  nome: string;
  versao: string;
  uso: string;
  selecionada: boolean;
  descricao: string;
  competencia: string;
  fontes: string;
  autor: string;
  aprovador: string;
  confirmacao: string;
  recomendada: boolean;
}

export const biblioteca: RegraBiblioteca[] = [
  {
    id: 'RC-004',
    nome: 'Processos paralisados além do prazo',
    versao: '2.1',
    uso: '12 correições',
    selecionada: true,
    descricao: 'Sinaliza processos sem movimentação útil por período superior ao parâmetro definido.',
    competencia: 'Cível',
    fontes: 'Movimentos, certidões',
    autor: 'Corregedoria — Núcleo de Análise',
    aprovador: 'Dra. Helena',
    confirmacao: '87%',
    recomendada: true,
  },
  {
    id: 'RC-009',
    nome: 'Ordem judicial sem cumprimento localizado',
    versao: '1.4',
    uso: '9 correições',
    selecionada: true,
    descricao: 'Verifica determinações judiciais sem registro posterior de cumprimento.',
    competencia: 'Cível',
    fontes: 'Decisões, despachos, documentos expedidos',
    autor: 'Equipe correicional',
    aprovador: 'Dra. Helena',
    confirmacao: '81%',
    recomendada: true,
  },
  {
    id: 'RC-012',
    nome: 'Classe ou assunto incompatível',
    versao: '1.2',
    uso: '7 correições',
    selecionada: true,
    descricao: 'Identifica divergência entre classe, assunto e conteúdo processual.',
    competencia: 'Cível',
    fontes: 'Cadastro processual, petições',
    autor: 'Núcleo de Estatística',
    aprovador: 'Dra. Helena',
    confirmacao: '68%',
    recomendada: true,
  },
  {
    id: 'RC-015',
    nome: 'Movimentação potencialmente redundante',
    versao: '1.0',
    uso: '5 correições',
    selecionada: false,
    descricao: 'Aponta sequências de movimentos repetidos sem efeito processual.',
    competencia: 'Cível',
    fontes: 'Movimentos',
    autor: 'Equipe correicional',
    aprovador: 'Corregedoria',
    confirmacao: '54%',
    recomendada: false,
  },
];

export const resultadoPorRegra = [
  { regra: 'Paralisação acima do prazo', sinalizados: 436, criticos: 112 },
  { regra: 'Ordem sem cumprimento localizado', sinalizados: 318, criticos: 96 },
  { regra: 'Arquivamento com possível pendência', sinalizados: 127, criticos: 38 },
  { regra: 'Classe ou assunto incompatível', sinalizados: 264, criticos: 61 },
  { regra: 'Movimentações redundantes', sinalizados: 293, criticos: 85 },
];

export const distribuicaoSituacao = [
  { situacao: 'Aguardando validação', qtd: 812 },
  { situacao: 'Confirmados', qtd: 318 },
  { situacao: 'Descartados', qtd: 96 },
  { situacao: 'Encaminhados', qtd: 121 },
  { situacao: 'Corrigidos', qtd: 27 },
  { situacao: 'Inconclusivos', qtd: 64 },
];

export type SituacaoProcesso = 'Ativo' | 'Suspenso' | 'Arquivado';

export interface Processo {
  numero: string;
  unidade: string;
  classe: string;
  assunto: string;
  situacao: SituacaoProcesso;
  ultimoMovimento: string;
  ocorrencias: number;
  criticos: number;
  atencao: Atencao;
  destaque?: boolean;
}

export const processos: Processo[] = [
  {
    numero: '0801234-00.2026.8.23.0001',
    unidade: '1ª Vara Cível',
    classe: 'Procedimento Comum',
    assunto: 'Obrigação de fazer',
    situacao: 'Arquivado',
    ultimoMovimento: '14/7/2026',
    ocorrencias: 3,
    criticos: 2,
    atencao: 'Alta',
    destaque: true,
  },
  {
    numero: '0802987-11.2026.8.23.0001',
    unidade: '1ª Vara Cível',
    classe: 'Execução de Título Extrajudicial',
    assunto: 'Cobrança',
    situacao: 'Ativo',
    ultimoMovimento: '2/6/2026',
    ocorrencias: 2,
    criticos: 1,
    atencao: 'Alta',
  },
  {
    numero: '0803551-42.2025.8.23.0002',
    unidade: '2ª Vara Cível',
    classe: 'Procedimento Comum',
    assunto: 'Indenização por dano moral',
    situacao: 'Suspenso',
    ultimoMovimento: '19/12/2025',
    ocorrencias: 2,
    criticos: 0,
    atencao: 'Média',
  },
  {
    numero: '0804410-08.2026.8.23.0003',
    unidade: 'Vara da Fazenda Pública',
    classe: 'Mandado de Segurança',
    assunto: 'Servidor público',
    situacao: 'Ativo',
    ultimoMovimento: '28/5/2026',
    ocorrencias: 1,
    criticos: 1,
    atencao: 'Média',
  },
  {
    numero: '0805120-77.2025.8.23.0001',
    unidade: '1ª Vara Cível',
    classe: 'Cumprimento de Sentença',
    assunto: 'Alimentos',
    situacao: 'Arquivado',
    ultimoMovimento: '3/11/2025',
    ocorrencias: 4,
    criticos: 2,
    atencao: 'Alta',
  },
  {
    numero: '0806733-19.2026.8.23.0004',
    unidade: '1ª Vara Criminal',
    classe: 'Ação Penal',
    assunto: 'Furto',
    situacao: 'Ativo',
    ultimoMovimento: '11/4/2026',
    ocorrencias: 1,
    criticos: 0,
    atencao: 'Baixa',
  },
  {
    numero: '0807004-63.2026.8.23.0002',
    unidade: '2ª Vara Cível',
    classe: 'Procedimento Comum',
    assunto: 'Rescisão contratual',
    situacao: 'Ativo',
    ultimoMovimento: '7/7/2026',
    ocorrencias: 0,
    criticos: 0,
    atencao: 'Baixa',
  },
  {
    numero: '0808219-05.2025.8.23.0003',
    unidade: 'Vara da Fazenda Pública',
    classe: 'Execução Fiscal',
    assunto: 'IPTU',
    situacao: 'Suspenso',
    ultimoMovimento: '22/9/2025',
    ocorrencias: 3,
    criticos: 1,
    atencao: 'Alta',
  },
];

export const universoAuditoria: [string, string][] = [
  ['Processos ativos', '7.940'],
  ['Processos suspensos', '1.120'],
  ['Processos arquivados', '3.420'],
  ['Classes processuais', '18 selecionadas'],
  ['Assuntos', '34 selecionados'],
  ['Documentos', 'Decisões, despachos, certidões'],
  ['Movimentos', 'Tabela unificada CNJ'],
  ['Segredo de justiça', 'Conforme autorização vigente'],
];

export const relatorioUltimaCorreicao = {
  resumo: [
    ['Última correição', '18/8/2025'],
    ['Conformidade', '82%'],
    ['Ocorrências confirmadas', '164'],
    ['Providências pendentes', '21'],
  ] as [string, string][],
  regras: [
    'Paralisação acima do prazo',
    'Determinação sem cumprimento localizado',
    'Arquivamento com possível pendência',
    'Inconsistência de classificação',
  ],
};

export type Veredito = 'Atende' | 'Não atende' | 'Não se encaixa';

export interface ItemVeredito {
  regra: string;
  veredito: Veredito;
  trecho: string;
}

export const correicaoPorProcesso: Record<string, ItemVeredito[]> = {
  padrao: [
    {
      regra: 'RC-017 — Arquivamento com possível pendência',
      veredito: 'Não atende',
      trecho:
        '“Determino a expedição de ofício ao órgão requisitado” (decisão de 8/7/2026) — sem movimento posterior de expedição até o arquivamento definitivo em 14/7/2026.',
    },
    {
      regra: 'RC-004 — Processos paralisados além do prazo',
      veredito: 'Atende',
      trecho: 'Movimentação útil registrada em 2/6/2026, dentro do prazo parametrizado de 100 dias.',
    },
    {
      regra: 'RC-009 — Ordem judicial sem cumprimento localizado',
      veredito: 'Não atende',
      trecho: '“Cumpra-se com urgência” (despacho de 8/7/2026) — não localizada certidão de cumprimento.',
    },
    {
      regra: 'RC-012 — Classe ou assunto incompatível',
      veredito: 'Atende',
      trecho: 'Classe “Procedimento Comum” compatível com o assunto “Obrigação de fazer”.',
    },
    {
      regra: 'RC-015 — Movimentação potencialmente redundante',
      veredito: 'Não se encaixa',
      trecho: 'Regra aplicável apenas a processos com mais de 40 movimentos; este possui 23.',
    },
  ],
};

export interface DetalheRegraInfo {
  passos: string[];
  atende: string[];
  naoAtende: string[];
  naoEncaixa: string[];
}

export const detalhesRegra: Record<string, DetalheRegraInfo> = {
  'RC-004': {
    passos: [
      'Selecionar processos com situação ativa ou suspensa no período.',
      'Identificar a data do último movimento útil.',
      'Calcular o intervalo até a data de referência da correição.',
      'Sinalizar quando o intervalo exceder o parâmetro definido.',
    ],
    atende: ['Movimento útil dentro do prazo parametrizado.', 'Suspensão formalizada com prazo em curso.'],
    naoAtende: ['Ausência de movimento útil por período superior ao prazo.', 'Conclusão sem despacho há mais de 100 dias.'],
    naoEncaixa: ['Processos arquivados definitivamente.', 'Processos fora do período de referência.'],
  },
  'RC-009': {
    passos: [
      'Localizar decisões e despachos com determinação de providência.',
      'Buscar movimentos e documentos posteriores de cumprimento.',
      'Verificar certidões que justifiquem a ausência de cumprimento.',
      'Sinalizar determinação sem cumprimento localizado.',
    ],
    atende: ['Documento expedido após a determinação.', 'Certidão de cumprimento juntada.'],
    naoAtende: ['Determinação sem qualquer registro posterior.', 'Ofício redigido sem registro de expedição.'],
    naoEncaixa: ['Processos sem determinação de providência no período.'],
  },
  'RC-012': {
    passos: [
      'Ler classe e assunto cadastrados.',
      'Comparar com o objeto identificado na petição inicial.',
      'Confrontar com a tabela unificada do CNJ.',
      'Sinalizar divergências relevantes.',
    ],
    atende: ['Classe e assunto compatíveis com o objeto.'],
    naoAtende: ['Classe genérica para pedido com classe específica prevista.', 'Assunto divergente do pedido.'],
    naoEncaixa: ['Processos sem petição inicial digitalizada.'],
  },
  'RC-015': {
    passos: [
      'Agrupar movimentos por código e data.',
      'Detectar repetições sem efeito processual entre elas.',
      'Excluir repetições justificadas por decisão.',
      'Sinalizar sequências redundantes.',
    ],
    atende: ['Movimentos repetidos com efeito processual próprio.'],
    naoAtende: ['Três ou mais conclusões seguidas sem despacho intermediário.'],
    naoEncaixa: ['Processos com menos de 40 movimentos.'],
  },
};