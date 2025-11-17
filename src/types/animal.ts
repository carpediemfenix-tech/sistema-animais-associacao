// =====================================================
// TIPOS PARA SISTEMA VALENTÃO AO RESGATE v2.0
// Sistema profissional de gestão de animais
// =====================================================

export interface Animal {
  id: string;
  numero_processo: string;
  nome: string;
  especie: 'Cão' | 'Gato' | 'Outro';
  raca?: string;
  sexo: 'Macho' | 'Fêmea';
  idade_estimada?: number; // em meses
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
  foto_url?: string;
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
  tipo_intervencao?: TipoIntervencao;
  voluntario?: Voluntario;
  animal?: Animal;
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

// Tipos para perfis de usuário
export type PerfilUsuario = 'consulta' | 'edicao' | 'admin';

export interface ConfiguracaoSistema {
  perfil_usuario: PerfilUsuario;
  tema: 'claro' | 'escuro' | 'sistema';
  notificacoes: boolean;
  idioma: 'pt';
}