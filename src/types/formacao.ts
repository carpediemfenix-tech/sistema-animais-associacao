// INTERFACES DO NOVO SISTEMA DE FORMAÇÃO
// Arquitetura: Tipos → Ações → Participações
// Criado em: 2025-12-07 04:00 UTC

// ============================================================================
// TIPOS DE FORMAÇÃO (Templates/Modelos)
// ============================================================================
export interface TipoFormacao {
  id: string;
  codigo: string; // FORMA_BASE, FORMA_N1, etc.
  nome: string;
  descricao?: string;
  nivel_ordem: number;
  carga_horaria_minima: number; // em horas
  competencias: string[]; // Array de competências
  pre_requisitos: string[]; // Array de códigos de tipos pré-requisito
  cor: string; // Cor hex para UI
  icone: string; // Emoji ou ícone
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// AÇÕES DE FORMAÇÃO (Instâncias específicas)
// ============================================================================
export interface AcaoFormacao {
  id: string;
  codigo_acao: string; // ACC2502, ACC2506, etc.
  tipo_formacao_id: string;
  nome_acao: string;
  descricao?: string;
  formador?: string;
  local_formacao?: string;
  data_inicio?: string; // ISO date
  data_fim?: string; // ISO date
  carga_horaria_real: number;
  vagas_maximas: number;
  vagas_ocupadas: number;
  preco: number;
  status: StatusAcaoFormacao;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  tipo_formacao?: TipoFormacao;
  participacoes?: ParticipacaoFormacao[];
}

export type StatusAcaoFormacao = 
  | 'planeada' 
  | 'inscricoes_abertas' 
  | 'em_curso' 
  | 'concluida' 
  | 'cancelada';

// ============================================================================
// PARTICIPAÇÕES EM FORMAÇÃO (Registos de voluntários)
// ============================================================================
export interface ParticipacaoFormacao {
  id: string;
  voluntario_id: string;
  acao_formacao_id: string;
  data_inscricao: string;
  status_participacao: StatusParticipacao;
  nota_final?: number; // 0.00 a 20.00
  percentagem_presenca: number; // 0.00 a 100.00
  certificado_emitido: boolean;
  data_certificado?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  voluntario?: {
    id: string;
    nome: string;
    email: string;
  };
  acao_formacao?: AcaoFormacao;
}

export type StatusParticipacao = 
  | 'inscrito' 
  | 'confirmado' 
  | 'presente' 
  | 'ausente' 
  | 'aprovado' 
  | 'reprovado' 
  | 'desistiu';

// ============================================================================
// INTERFACES PARA FORMULÁRIOS
// ============================================================================
export interface TipoFormacaoFormData {
  codigo: string;
  nome: string;
  descricao: string;
  nivel_ordem: number;
  carga_horaria_minima: number;
  competencias: string[];
  pre_requisitos: string[];
  cor: string;
  icone: string;
}

export interface AcaoFormacaoFormData {
  codigo_acao: string;
  tipo_formacao_id: string;
  nome_acao: string;
  descricao: string;
  formador: string;
  local_formacao: string;
  data_inicio: string;
  data_fim: string;
  carga_horaria_real: number;
  vagas_maximas: number;
  preco: number;
  status: StatusAcaoFormacao;
  observacoes: string;
}

export interface ParticipacaoFormacaoFormData {
  voluntario_id: string;
  acao_formacao_id: string;
  status_participacao: StatusParticipacao;
  nota_final?: number;
  percentagem_presenca: number;
  observacoes: string;
}

// ============================================================================
// INTERFACES PARA ESTATÍSTICAS E RELATÓRIOS
// ============================================================================
export interface EstatisticasFormacao {
  total_tipos_formacao: number;
  total_acoes_formacao: number;
  total_participacoes: number;
  total_certificados_emitidos: number;
  
  // Por status
  acoes_por_status: Record<StatusAcaoFormacao, number>;
  participacoes_por_status: Record<StatusParticipacao, number>;
  
  // Por tipo de formação
  participacoes_por_tipo: Array<{
    tipo_codigo: string;
    tipo_nome: string;
    total_participacoes: number;
    total_aprovados: number;
    taxa_aprovacao: number;
  }>;
  
  // Tendências mensais
  participacoes_por_mes: Array<{
    mes: string;
    total: number;
    aprovados: number;
  }>;
}

export interface RelatorioFormacao {
  periodo_inicio: string;
  periodo_fim: string;
  estatisticas: EstatisticasFormacao;
  detalhes_acoes: AcaoFormacao[];
  detalhes_participacoes: ParticipacaoFormacao[];
}

// ============================================================================
// INTERFACES PARA FILTROS E PESQUISA
// ============================================================================
export interface FiltrosFormacao {
  tipo_formacao_id?: string;
  status_acao?: StatusAcaoFormacao;
  status_participacao?: StatusParticipacao;
  data_inicio?: string;
  data_fim?: string;
  formador?: string;
  local?: string;
  termo_pesquisa?: string;
}

export interface OrdenacaoFormacao {
  campo: 'data_inicio' | 'data_fim' | 'nome_acao' | 'formador' | 'vagas_ocupadas' | 'created_at';
  direcao: 'asc' | 'desc';
}

// ============================================================================
// UTILITÁRIOS E CONSTANTES
// ============================================================================
export const STATUS_ACAO_LABELS: Record<StatusAcaoFormacao, string> = {
  planeada: 'Planeada',
  inscricoes_abertas: 'Inscrições Abertas',
  em_curso: 'Em Curso',
  concluida: 'Concluída',
  cancelada: 'Cancelada'
};

export const STATUS_PARTICIPACAO_LABELS: Record<StatusParticipacao, string> = {
  inscrito: 'Inscrito',
  confirmado: 'Confirmado',
  presente: 'Presente',
  ausente: 'Ausente',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  desistiu: 'Desistiu'
};

export const CORES_TIPOS_FORMACAO = {
  FORMA_BASE: '#10B981',
  FORMA_N1: '#3B82F6',
  FORMA_N2: '#8B5CF6',
  FORMA_N3: '#F59E0B',
  FORMA_VET: '#EF4444',
  FORMA_RESCUE: '#F97316'
};

export const ICONES_TIPOS_FORMACAO = {
  FORMA_BASE: '🌱',
  FORMA_N1: '🛡️',
  FORMA_N2: '⚔️',
  FORMA_N3: '👑',
  FORMA_VET: '🏥',
  FORMA_RESCUE: '🚁'
};

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================
export const getTipoFormacaoIcon = (codigo: string): string => {
  return ICONES_TIPOS_FORMACAO[codigo as keyof typeof ICONES_TIPOS_FORMACAO] || '🎓';
};

export const getTipoFormacaoCor = (codigo: string): string => {
  return CORES_TIPOS_FORMACAO[codigo as keyof typeof CORES_TIPOS_FORMACAO] || '#6B7280';
};

export const calcularTaxaAprovacao = (aprovados: number, total: number): number => {
  return total > 0 ? Math.round((aprovados / total) * 100) : 0;
};

export const formatarDuracao = (dataInicio: string, dataFim: string): string => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
};

export const getStatusColor = (status: StatusAcaoFormacao | StatusParticipacao): string => {
  const colors = {
    // Status de ações
    planeada: '#6B7280',
    inscricoes_abertas: '#10B981',
    em_curso: '#F59E0B',
    concluida: '#3B82F6',
    cancelada: '#EF4444',
    
    // Status de participações
    inscrito: '#6B7280',
    confirmado: '#10B981',
    presente: '#3B82F6',
    ausente: '#F59E0B',
    aprovado: '#059669',
    reprovado: '#EF4444',
    desistiu: '#9CA3AF'
  };
  
  return colors[status] || '#6B7280';
};
