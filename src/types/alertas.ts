export interface ConfiguracaoAlerta {
  id: string;
  tipo_alerta: 'vacina_atraso' | 'consulta_pendente' | 'sem_adocao' | 'medicacao_continua';
  dias_limite: number;
  ativo: boolean;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertaSistema {
  id: string;
  tipo: 'vacina_atraso' | 'consulta_pendente' | 'sem_adocao' | 'medicacao_continua';
  animal_id: string;
  animal_nome: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_limite?: string;
  dias_atraso?: number;
}