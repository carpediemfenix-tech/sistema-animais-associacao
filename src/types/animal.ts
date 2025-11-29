// Tipos para o sistema de gestão de animais
export interface Animal {
  id: string;
  numero_processo?: string;
  nome: string;
  especie: string; // Valor dinâmico da tabela especies
  raca?: string;
  sexo: 'Macho' | 'Fêmea';
  idade_estimada?: number; // em meses
  data_nascimento?: string;
  peso?: number;
  cor?: string;
  caracteristicas_fisicas?: string;
  transponder?: string;
  data_entrada: string;
  local_encontrado?: string;
  estado: 'Ativo' | 'Adotado' | 'Óbito' | 'Não Adotável';
  data_adocao?: string;
  adotante_nome?: string;
  adotante_contacto?: string;
  observacoes?: string;
  arquivado: boolean;
  data_arquivamento?: string;
  motivo_arquivamento?: string;
  grupo_id?: string;
  foto_url?: string;
  url_fotografia?: string; // Nova: URL da fotografia do animal
  voluntario_responsavel_id?: string; // Nova: Voluntário responsável pelo animal
  created_at: string;
  updated_at: string;
}

export interface TipoIntervencao {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  ativo: boolean;
  created_at: string;
}

export interface TipoEvento {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoLocalizacao {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoResponsabilidade {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicaVeterinaria {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  contacto_responsavel?: string;
  especialidades?: string[];
  tem_protocolo: boolean;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Intervencao {
  id: string;
  animal_id: string;
  tipo_intervencao_id: string;
  voluntario_id?: string;
  data_intervencao: string;
  veterinario?: string;
  clinica?: string; // Campo legado - manter para compatibilidade
  clinica_id?: string; // Nova referência à tabela de clínicas
  observacoes?: string;
  custo?: number;
  proxima_data?: string;
  urgente: boolean;
  concluida: boolean;
  created_at: string;
  updated_at: string;
  animal?: Animal;
  tipo_intervencao?: TipoIntervencao;
  voluntario?: Voluntario;
  clinica_veterinaria?: ClinicaVeterinaria; // Join com clínica
  tipos_intervencoes?: TipoIntervencao; // Para joins do Supabase
  clinicas_veterinarias?: ClinicaVeterinaria; // Para joins do Supabase
}

// NOVO: Eventos da vida do animal
export interface EventoAnimal {
  id: string;
  animal_id: string;
  tipo_evento: string; // Texto simples: 'Nascimento', 'Adoção', 'Retorno', etc.
  data_evento: string;
  descricao?: string;
  observacoes?: string;
  voluntario_id?: string;
  documento_referencia?: string;
  importante: boolean;
  created_at: string;
  updated_at: string;
  voluntarios?: { nome: string }; // Para joins do Supabase
}

// ATUALIZADO: Localizações do animal
export interface LocalizacaoAnimal {
  id: string;
  animal_id: string;
  tipo_localizacao: string; // Texto simples: 'Canil', 'Gatil', 'Casa de Acolhimento', etc.
  data_inicio: string;
  data_fim?: string; // NULL se for a localização atual
  endereco_detalhes?: string; // Endereço ou detalhes da localização
  responsavel_id?: string; // Voluntário responsável
  motivo_transferencia?: string; // Motivo da transferência
  observacoes?: string;
  ativa: boolean; // Apenas uma localização ativa por animal
  created_at: string;
  updated_at: string;
  voluntarios?: { nome: string }; // Para joins do Supabase
}

// NOVO: Responsabilidades de voluntários
export interface ResponsabilidadeAnimal {
  id: string;
  animal_id: string;
  voluntario_id: string;
  data_inicio: string;
  data_fim?: string; // NULL se ainda for responsável
  tipo_responsabilidade: string; // Texto com emoji: '🏠 Cuidador Principal', etc.
  observacoes?: string;
  ativa: boolean; // Responsabilidade ativa ou histórica
  prioridade: number; // Ordem de importância (1 = mais importante)
  created_at: string;
  updated_at: string;
  voluntarios?: { nome: string; email?: string; telefone?: string }; // Para joins do Supabase
}

// MANTIDO: Interfaces existentes para compatibilidade
export interface Evento {
  id: string;
  animal_id: string;
  tipo_evento: string;
  data_evento: string;
  descricao: string;
  observacoes?: string;
  created_at: string;
}

export interface Localizacao {
  id: string;
  animal_id: string;
  localizacao: 'Canil' | 'CRO' | 'FAT' | 'Rua' | 'Casa Temporária' | 'Outro';
  endereco?: string;
  data_entrada: string;
  data_saida?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
}

export interface Voluntario {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  especialidade: 'Veterinário' | 'Cuidador' | 'Transporte' | 'Administrativo' | 'Geral';
  ativo: boolean;
  data_inicio: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface MovimentoFinanceiro {
  id: string;
  animal_id?: string;
  categoria_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data_movimento: string;
  metodo_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResponsabilidadeVoluntario {
  id: string;
  animal_id: string;
  voluntario_id: string;
  data_inicio: string;
  data_fim?: string;
  tipo_responsabilidade: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  voluntario?: Voluntario;
}

// Interfaces financeiras
export interface CategoriaFinanceira {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  cor: string;
  icone: string;
  ativo: boolean;
  ordem?: number;
  created_at: string;
  updated_at: string;
}

export interface Orcamento {
  id: string;
  nome: string;
  descricao?: string;
  ano: number;
  mes?: number;
  valor_previsto: number;
  valor_realizado: number;
  categoria_id: string;
  escopo: 'animal' | 'associacao' | 'ambos';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RelatorioFinanceiro {
  id: string;
  nome: string;
  tipo: 'mensal' | 'trimestral' | 'anual' | 'personalizado';
  data_inicio: string;
  data_fim: string;
  escopo: 'animal' | 'associacao' | 'ambos';
  dados_json: any;
  created_at: string;
  updated_at: string;
}

export interface AuditoriaFinanceira {
  id: string;
  tabela: string;
  operacao: 'INSERT' | 'UPDATE' | 'DELETE';
  registro_id: string;
  dados_antigos?: any;
  dados_novos?: any;
  usuario_id?: string;
  created_at: string;
}

export interface ResumoFinanceiro {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  periodo: string;
}

export interface ResumoFinanceiroAnimal {
  animal_id: string;
  animal_nome: string;
  total_receitas: number;
  total_despesas: number;
  saldo: number;
}