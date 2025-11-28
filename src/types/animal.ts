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

export interface Intervencao {
  id: string;
  animal_id: string;
  tipo_intervencao_id: string;
  voluntario_id?: string;
  data_intervencao: string;
  veterinario?: string;
  clinica?: string;
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
}

export interface Evento {
  id: string;
  animal_id: string;
  tipo_evento: string;
  data_evento: string;
  descricao: string;
  observacoes?: string;
  created_at: string;
}

// CORREÇÃO: Atualizar interface Localizacao para usar data_saida em vez de data_fim
export interface Localizacao {
  id: string;
  animal_id: string;
  localizacao: 'Canil' | 'CRO' | 'FAT' | 'Rua' | 'Casa Temporária' | 'Outro';
  endereco?: string;
  data_entrada: string;
  data_saida?: string; // CORRIGIDO: era data_fim, agora é data_saida
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
  intervencao_id?: string;
  tipo_movimento: 'Receita' | 'Despesa';
  categoria: 'Veterinário' | 'Medicação' | 'Alimentação' | 'Transporte' | 'Doação' | 'Adoção' | 'Equipamento' | 'Outros';
  descricao: string;
  valor: number;
  data_movimento: string;
  voluntario_id?: string;
  observacoes?: string;
  created_at: string;
  animal?: Animal;
  voluntario?: Voluntario;
  intervencao?: Intervencao;
}

// Tipos para dashboard e relatórios
export interface DashboardStats {
  animais_ativos: number;
  animais_adotados: number;
  animais_disponiveis: number;
  voluntarios_ativos: number;
  total_receitas: number;
  total_despesas: number;
  saldo_atual: number;
  intervencoes_mes: number;
  adocoes_mes: number;
}

// Tipos para perfis de utilizador
export type PerfilUsuario = 'admin' | 'edicao' | 'consulta';

// Tipos para alertas
export interface Alerta {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensagem: string;
  data_criacao: string;
  lido: boolean;
  animal_id?: string;
  intervencao_id?: string;
}

// Interfaces para Sistema de Grupos (Matilhas e Colónias)
export interface Grupo {
  id: string;
  nome: string;
  tipo: 'matilha' | 'colonia';
  localizacao?: string;
  endereco?: string;
  coordenadas_latitude?: number;
  coordenadas_longitude?: number;
  localidade?: string;
  concelho?: string;
  distrito?: string;
  responsavel_voluntario_id?: string;
  cuidador_informal?: string;
  contacto_cuidador?: string;
  data_criacao: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // Campos calculados
  total_animais?: number;
  responsavel_nome?: string;
}

export interface DespesaGrupo {
  id: string;
  grupo_id: string;
  descricao: string;
  valor: number;
  data_despesa: string;
  categoria?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface EventoGrupo {
  id: string;
  grupo_id: string;
  titulo: string;
  descricao?: string;
  data_evento: string;
  tipo_evento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// 🛡️ INTERFACES PARA TABELAS DE ADMINISTRAÇÃO CORRETAS

// Espécies (para formulário Novo Animal)
export interface Especie {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Sexos (para formulário Novo Animal)
export interface Sexo {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Especialidades de Voluntários (para formulário Gestão Voluntários)
export interface EspecialidadeVoluntario {
  id: number;
  nome: string;
  descricao?: string;
  cor?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de Grupos (para formulário Gestão Grupos)
export interface TipoGrupo {
  id: number;
  nome: string;
  descricao?: string;
  icone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de Eventos (para formulário Eventos)
export interface TipoEvento {
  id: number;
  nome: string;
  descricao?: string;
  cor?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de Localizações (para formulário Localizações)
export interface TipoLocalizacao {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de Intervenções (já existe tabela tipos_intervencoes)
export interface TipoIntervencao {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// 👥 INTERFACE PARA RESPONSABILIDADES DE VOLUNTÁRIOS
export interface ResponsabilidadeVoluntario {
  id: string;
  animal_id: string;
  voluntario_id: string;
  data_inicio: string;
  data_fim?: string; // null = responsabilidade ativa
  motivo_mudanca?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // Campos calculados
  animal_nome?: string;
  animal_numero_processo?: string;
  animal_especie?: string;
  voluntario_nome?: string;
  voluntario_email?: string;
  voluntario_telefone?: string;
}

// 💰 EKO: SISTEMA FINANCEIRO ROBUSTO - INTERFACES ATUALIZADAS

// Categoria Financeira Robusta
export interface CategoriaFinanceira {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  cor: string;
  icone: string;
  codigo?: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

// Movimento Financeiro Robusto
export interface MovimentoFinanceiro {
  id: string;
  numero_movimento: string;
  tipo_movimento: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao';
  categoria_id: string;
  categoria?: CategoriaFinanceira;
  animal_id?: string;
  animal?: {
    id: string;
    nome: string;
    especie: string;
    numero_processo?: string;
  };
  descricao: string;
  valor: number;
  data_movimento: string;
  data_vencimento?: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  metodo_pagamento?: string;
  referencia_externa?: string;
  observacoes?: string;
  tags?: string[];
  anexos?: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Orçamento
export interface Orcamento {
  id: string;
  nome: string;
  ano: number;
  mes?: number;
  categoria_id?: string;
  categoria?: CategoriaFinanceira;
  escopo: 'animal' | 'associacao';
  valor_orcado: number;
  valor_gasto: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Relatório Financeiro
export interface RelatorioFinanceiro {
  id: string;
  nome: string;
  tipo: string;
  parametros: any;
  agendamento?: 'manual' | 'diario' | 'semanal' | 'mensal';
  ativo: boolean;
  created_by?: string;
  created_at: string;
}

// Auditoria Financeira
export interface AuditoriaFinanceira {
  id: string;
  tabela: string;
  registro_id: string;
  acao: 'insert' | 'update' | 'delete';
  dados_antigos?: any;
  dados_novos?: any;
  usuario_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Resumo Financeiro
export interface ResumoFinanceiro {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  periodo?: {
    inicio: string;
    fim: string;
  };
}

// Resumo Financeiro por Animal
export interface ResumoFinanceiroAnimal {
  animal_id: string;
  animal_nome: string;
  animal_especie: string;
  total_receitas: number;
  total_despesas: number;
  saldo: number;
}