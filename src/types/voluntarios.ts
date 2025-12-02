// Interfaces para o Sistema de Voluntários Valentão
// Criado em: 2025-12-02 02:00 UTC

export interface NivelFormacao {
  id: string;
  codigo: string; // 'FORMA_BASE', 'FORMA_N1', etc.
  nome: string;
  descricao?: string;
  ordem: number; // 0=BASE, 1=N1, 2=N2, 3=N3
  pre_requisitos: string[]; // IDs dos níveis pré-requisito
  tempo_minimo_meses: number;
  missoes_minimas: number;
  competencias: string[]; // Lista de competências
  cor: string; // Cor para UI
  icone: string; // Ícone Lucide
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Especializacao {
  id: string;
  codigo: string; // 'FORMA_VET', 'FORMA_RESCUE'
  nome: string;
  descricao?: string;
  nivel_pre_requisito: string; // ID do nível pré-requisito
  competencias: string[];
  cor: string;
  icone: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoluntarioValentao {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  nif?: string;
  data_nascimento?: string;
  profissao?: string;
  nivel_formacao_atual?: string; // ID do nível atual
  data_ingresso: string;
  ativo: boolean;
  data_inativacao?: string;
  motivo_inativacao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Dados relacionados (joins)
  nivel_formacao?: NivelFormacao;
  progressao?: VoluntarioProgressao[];
  especializacoes?: VoluntarioEspecializacao[];
  conquistas?: VoluntarioConquista[];
}

export interface VoluntarioProgressao {
  id: string;
  voluntario_id: string;
  nivel_id: string;
  data_inicio: string;
  data_conclusao?: string;
  certificado_emitido: boolean;
  formador_id?: string;
  avaliacao_final?: number; // 0.00 a 10.00
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Dados relacionados
  nivel?: NivelFormacao;
  formador?: VoluntarioValentao;
}

export interface VoluntarioEspecializacao {
  id: string;
  voluntario_id: string;
  especializacao_id: string;
  data_obtencao: string;
  certificado_emitido: boolean;
  formador_id?: string;
  avaliacao_final?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Dados relacionados
  especializacao?: Especializacao;
  formador?: VoluntarioValentao;
}

export interface Conquista {
  id: string;
  nome: string;
  descricao?: string;
  icone: string; // Ícone Lucide
  cor: string; // Cor hex
  criterios: Record<string, any>; // Critérios para obter
  pontos_requeridos: number;
  nivel_minimo?: string; // ID do nível mínimo
  categoria: 'geral' | 'formacao' | 'missoes' | 'tempo' | 'especializacao';
  ativo: boolean;
  created_at: string;
  updated_at: string;
  
  // Dados relacionados
  nivel_minimo_info?: NivelFormacao;
}

export interface VoluntarioConquista {
  id: string;
  voluntario_id: string;
  conquista_id: string;
  data_obtencao: string;
  detalhes: Record<string, any>; // Detalhes específicos
  created_at: string;
  
  // Dados relacionados
  conquista?: Conquista;
}

// Interfaces para métricas e relatórios
export interface MetricasVoluntarios {
  total_voluntarios: number;
  voluntarios_ativos: number;
  voluntarios_inativos: number;
  distribuicao_por_nivel: {
    nivel: NivelFormacao;
    quantidade: number;
    percentual: number;
  }[];
  especializacoes_ativas: {
    especializacao: Especializacao;
    quantidade: number;
  }[];
  conquistas_recentes: VoluntarioConquista[];
  progressao_mensal: {
    mes: string;
    novos_voluntarios: number;
    progressoes: number;
    conquistas: number;
  }[];
}

// Interface para progressão de voluntário individual
export interface ProgressaoIndividual {
  voluntario: VoluntarioValentao;
  nivel_atual: NivelFormacao;
  proximo_nivel?: NivelFormacao;
  progresso_percentual: number;
  criterios_cumpridos: {
    tempo_minimo: boolean;
    missoes_minimas: boolean;
    outros_requisitos: boolean;
  };
  tempo_restante_estimado?: number; // em meses
  missoes_restantes?: number;
  especializacoes_disponiveis: Especializacao[];
  conquistas_proximas: Conquista[];
}

// Interface para formulários
export interface VoluntarioFormData {
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  nif?: string;
  data_nascimento?: string;
  profissao?: string;
  nivel_formacao_atual?: string;
  observacoes?: string;
}

export interface ProgressaoFormData {
  voluntario_id: string;
  nivel_id: string;
  data_inicio: string;
  data_conclusao?: string;
  certificado_emitido: boolean;
  formador_id?: string;
  avaliacao_final?: number;
  observacoes?: string;
}

export interface EspecializacaoFormData {
  voluntario_id: string;
  especializacao_id: string;
  data_obtencao: string;
  certificado_emitido: boolean;
  formador_id?: string;
  avaliacao_final?: number;
  observacoes?: string;
}

// Tipos auxiliares
export type StatusVoluntario = 'ativo' | 'inativo';
export type CategoriaConquista = 'geral' | 'formacao' | 'missoes' | 'tempo' | 'especializacao';
export type CodigoNivel = 'FORMA_BASE' | 'FORMA_N1' | 'FORMA_N2' | 'FORMA_N3';
export type CodigoEspecializacao = 'FORMA_VET' | 'FORMA_RESCUE';

// Interface para filtros
export interface FiltrosVoluntarios {
  status?: StatusVoluntario;
  nivel_formacao?: string;
  especializacao?: string;
  data_ingresso_inicio?: string;
  data_ingresso_fim?: string;
  busca?: string;
}

// Interface para ordenação
export interface OrdenacaoVoluntarios {
  campo: 'nome' | 'data_ingresso' | 'nivel_formacao' | 'email';
  direcao: 'asc' | 'desc';
}