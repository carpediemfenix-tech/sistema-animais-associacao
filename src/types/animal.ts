// Tipos para o sistema de gestão de animais
export interface Animal {
  id: string;
  numero_processo?: string;
  nome: string;
  especie: 'Cão' | 'Gato' | 'Outro';
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