export interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  sexo: 'Macho' | 'Fêmea';
  data_nascimento?: string;
  idade_estimada?: string;
  peso?: number;
  cor?: string;
  caracteristicas_fisicas?: string;
  transponder?: string;
  numero_registo?: string;
  estado: 'Ativo' | 'Adotado' | 'Óbito' | 'Transferido';
  data_entrada: string;
  origem?: string;
  observacoes?: string;
  foto_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TipoIntervencao {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  created_at: string;
}

export interface Intervencao {
  id: string;
  animal_id: string;
  tipo_intervencao_id: string;
  data_intervencao: string;
  veterinario?: string;
  clinica?: string;
  observacoes?: string;
  custo?: number;
  proxima_data?: string;
  created_at: string;
  tipo_intervencao?: TipoIntervencao;
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