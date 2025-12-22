// INTERFACES DO SISTEMA DE VOLUNTÁRIOS - VERSÃO ATUALIZADA
// Removidas dependências do sistema antigo de formação
// Criado em: 2025-12-07 04:00 UTC

// ============================================================================
// VOLUNTÁRIO PRINCIPAL
// ============================================================================
export interface VoluntarioValentao {
  id: string;
  nome: string;
  nickname?: string;
  display_name?: string;
  full_name?: string;
  email: string;
  telefone?: string;
  nif?: string;
  data_nascimento?: string;
  data_ingresso: string; // Data de entrada na associação
  profissao?: string;
  morada?: string;
  localidade?: string;
  codigo_postal?: string;
  distrito?: string;
  especialidade?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  
  // Campos calculados (não estão na BD)
  nivel_formacao_atual?: string; // Calculado a partir das participações
  certificados_obtidos?: number; // Calculado
  ultima_formacao?: string; // Calculada
}

// Alias para compatibilidade
export type Voluntario = VoluntarioValentao;

// ============================================================================
// INTERFACES PARA FORMULÁRIOS
// ============================================================================
export interface VoluntarioFormData {
  nome: string;
  nickname: string;
  email: string;
  telefone: string;
  nif: string;
  data_nascimento: string;
  data_ingresso: string;
  profissao: string;
  morada: string;
  localidade: string;
  codigo_postal: string;
  distrito: string;
  especialidade: string;
  observacoes: string;
}

// ============================================================================
// INTERFACES PARA ESTATÍSTICAS
// ============================================================================
export interface MetricasVoluntarios {
  total_voluntarios: number;
  voluntarios_ativos: number;
  voluntarios_inativos: number;
  voluntarios_com_formacao: number;
  voluntarios_sem_formacao: number;
  novas_inscricoes_mes: number;
  
  // Distribuição por nível (calculada a partir das participações)
  distribuicao_por_nivel: Array<{
    nivel: string;
    quantidade: number;
    percentagem: number;
  }>;
  
  // Estatísticas de formação
  total_certificados_emitidos: number;
  media_certificados_por_voluntario: number;
}

// ============================================================================
// INTERFACES PARA PROGRESSÃO (CALCULADAS)
// ============================================================================
export interface ProgressaoVoluntario {
  voluntario_id: string;
  nivel_atual?: string;
  proximo_nivel?: string;
  certificados_obtidos: string[]; // Códigos das formações concluídas
  data_ultima_formacao?: string;
  progresso_percentual: number; // Para o próximo nível
  pode_progredir: boolean;
  criterios_em_falta: string[];
}

// ============================================================================
// INTERFACES PARA FILTROS E PESQUISA
// ============================================================================
export interface FiltrosVoluntarios {
  termo_pesquisa?: string;
  status?: 'todos' | 'ativo' | 'inativo';
  nivel_formacao?: string;
  especialidade?: string;
  data_ingresso_inicio?: string;
  data_ingresso_fim?: string;
}

export interface OrdenacaoVoluntarios {
  campo: 'nome' | 'email' | 'data_ingresso' | 'especialidade' | 'created_at';
  direcao: 'asc' | 'desc';
}

// ============================================================================
// INTERFACES PARA RELATÓRIOS
// ============================================================================
export interface RelatorioVoluntarios {
  periodo_inicio: string;
  periodo_fim: string;
  metricas: MetricasVoluntarios;
  voluntarios_detalhes: VoluntarioValentao[];
  progressoes: ProgressaoVoluntario[];
}

// ============================================================================
// CONSTANTES E UTILITÁRIOS
// ============================================================================
export const STATUS_VOLUNTARIO_LABELS = {
  ativo: 'Ativo',
  inativo: 'Inativo'
};

export const ESPECIALIDADES_DISPONIVEIS = [
  'Resgate',
  'Cuidados Veterinários',
  'Transporte',
  'Administração',
  'Comunicação',
  'Formação',
  'Manutenção',
  'Eventos',
  'Angariação de Fundos',
  'Apoio Jurídico'
];

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================
export const calcularIdade = (dataNascimento: string): number => {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade;
};

export const calcularTempoNaAssociacao = (dataIngresso: string): string => {
  const hoje = new Date();
  const ingresso = new Date(dataIngresso);
  const diffTime = Math.abs(hoje.getTime() - ingresso.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const anos = Math.floor(diffDays / 365);
  const meses = Math.floor((diffDays % 365) / 30);
  
  if (anos > 0) {
    return `${anos} ano${anos !== 1 ? 's' : ''} e ${meses} mês${meses !== 1 ? 'es' : ''}`;
  } else {
    return `${meses} mês${meses !== 1 ? 'es' : ''}`;
  }
};

export const formatarTelefone = (telefone: string): string => {
  // Remove todos os caracteres não numéricos
  const numeros = telefone.replace(/\D/g, '');
  
  // Formata para o padrão português
  if (numeros.length === 9) {
    return `${numeros.slice(0, 3)} ${numeros.slice(3, 6)} ${numeros.slice(6)}`;
  }
  
  return telefone;
};

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarNIF = (nif: string): boolean => {
  // Validação básica do NIF português
  const numeros = nif.replace(/\D/g, '');
  return numeros.length === 9;
};

// ============================================================================
// INTERFACES REMOVIDAS (SISTEMA ANTIGO)
// ============================================================================
// As seguintes interfaces foram removidas do sistema antigo:
// - NivelFormacao
// - Especializacao  
// - Conquista
// - VoluntarioProgressao
// - VoluntarioEspecializacao
// - VoluntarioConquista
//
// O novo sistema de formação usa as interfaces em @/types/formacao
