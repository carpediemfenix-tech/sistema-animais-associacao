// Interfaces para o Sistema de Relatórios Avançados
// Criado em: 2025-12-04 00:00 UTC

export interface RelatorioConfig {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoRelatorio;
  categoria: CategoriaRelatorio;
  template: string;
  filtros_disponiveis: FiltroDisponivel[];
  campos_obrigatorios: string[];
  formatos_exportacao: FormatoExportacao[];
  agendamento_disponivel: boolean;
  icone: string;
  cor: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type TipoRelatorio = 
  | 'animais_adocoes'
  | 'animais_intervencoes' 
  | 'animais_estados'
  | 'voluntarios_formacao'
  | 'voluntarios_atividade'
  | 'financeiro_balanco'
  | 'financeiro_movimentos'
  | 'operacional_eventos'
  | 'executivo_kpis';

export type CategoriaRelatorio = 
  | 'animais'
  | 'voluntarios'
  | 'financeiro'
  | 'operacional'
  | 'executivo';

export type FormatoExportacao = 'pdf' | 'excel' | 'csv' | 'json';

export interface FiltroDisponivel {
  campo: string;
  nome: string;
  tipo: TipoFiltro;
  opcoes?: FiltroOpcao[];
  obrigatorio: boolean;
  valor_padrao?: any;
}

export type TipoFiltro = 
  | 'data_inicio'
  | 'data_fim'
  | 'periodo_predefinido'
  | 'select_simples'
  | 'select_multiplo'
  | 'texto'
  | 'numero'
  | 'boolean';

export interface FiltroOpcao {
  valor: string;
  label: string;
  icone?: string;
}

export interface FiltrosRelatorio {
  data_inicio?: string;
  data_fim?: string;
  periodo?: PeriodoPredefinido;
  especies?: string[];
  estados?: string[];
  grupos?: string[];
  voluntarios?: string[];
  categorias_financeiras?: string[];
  tipos_movimento?: string[];
  [key: string]: any;
}

export type PeriodoPredefinido = 
  | 'hoje'
  | 'ontem'
  | 'ultimos_7_dias'
  | 'ultimos_30_dias'
  | 'este_mes'
  | 'mes_passado'
  | 'ultimos_3_meses'
  | 'ultimos_6_meses'
  | 'este_ano'
  | 'ano_passado'
  | 'personalizado';

export interface RelatorioGerado {
  id: string;
  config_id: string;
  nome: string;
  filtros_aplicados: FiltrosRelatorio;
  formato: FormatoExportacao;
  dados: any;
  estatisticas: EstatisticasRelatorio;
  url_download?: string;
  status: StatusRelatorio;
  data_geracao: string;
  data_expiracao?: string;
  gerado_por: string;
  tamanho_arquivo?: number;
  created_at: string;
}

export type StatusRelatorio = 
  | 'gerando'
  | 'concluido'
  | 'erro'
  | 'expirado';

export interface EstatisticasRelatorio {
  total_registos: number;
  periodo_analisado: {
    inicio: string;
    fim: string;
    dias: number;
  };
  resumo_categorias?: Record<string, number>;
  totais_numericos?: Record<string, number>;
  percentuais?: Record<string, number>;
  comparativo_periodo_anterior?: {
    variacao_percentual: number;
    variacao_absoluta: number;
  };
}

export interface AgendamentoRelatorio {
  id: string;
  config_id: string;
  nome: string;
  filtros: FiltrosRelatorio;
  formato: FormatoExportacao;
  frequencia: FrequenciaAgendamento;
  proxima_execucao: string;
  destinatarios_email: string[];
  ativo: boolean;
  criado_por: string;
  created_at: string;
  updated_at: string;
}

export type FrequenciaAgendamento = 
  | 'diario'
  | 'semanal'
  | 'mensal'
  | 'trimestral'
  | 'anual';

export interface TemplateRelatorio {
  id: string;
  nome: string;
  tipo: TipoRelatorio;
  html_template: string;
  css_styles: string;
  configuracoes: {
    incluir_graficos: boolean;
    incluir_logo: boolean;
    incluir_rodape: boolean;
    orientacao: 'portrait' | 'landscape';
    tamanho_pagina: 'A4' | 'A3' | 'Letter';
  };
  variaveis_disponiveis: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Interfaces específicas para cada tipo de relatório

export interface RelatorioAnimaisAdocoes {
  total_adocoes: number;
  adocoes_por_especie: Record<string, number>;
  adocoes_por_mes: Array<{
    mes: string;
    quantidade: number;
  }>;
  tempo_medio_adocao: number; // em dias
  animais_adotados: Array<{
    id: string;
    nome: string;
    especie: string;
    data_entrada: string;
    data_adocao: string;
    tempo_ate_adocao: number;
  }>;
}

export interface RelatorioVoluntariosFormacao {
  total_voluntarios: number;
  distribuicao_por_nivel: Record<string, number>;
  progressoes_periodo: Array<{
    voluntario_nome: string;
    nivel_anterior: string;
    nivel_atual: string;
    data_progressao: string;
  }>;
  voluntarios_sem_formacao: number;
  taxa_progressao: number; // percentual
}

export interface RelatorioFinanceiroBalanco {
  periodo: {
    inicio: string;
    fim: string;
  };
  receitas_totais: number;
  despesas_totais: number;
  saldo_liquido: number;
  receitas_por_categoria: Record<string, number>;
  despesas_por_categoria: Record<string, number>;
  movimentos_detalhados: Array<{
    data: string;
    descricao: string;
    categoria: string;
    tipo: 'receita' | 'despesa';
    valor: number;
  }>;
  comparativo_periodo_anterior: {
    receitas_variacao: number;
    despesas_variacao: number;
    saldo_variacao: number;
  };
}

// Utilitários para relatórios
export const PERIODOS_PREDEFINIDOS: Record<PeriodoPredefinido, { label: string; dias?: number }> = {
  hoje: { label: 'Hoje', dias: 1 },
  ontem: { label: 'Ontem', dias: 1 },
  ultimos_7_dias: { label: 'Últimos 7 dias', dias: 7 },
  ultimos_30_dias: { label: 'Últimos 30 dias', dias: 30 },
  este_mes: { label: 'Este mês' },
  mes_passado: { label: 'Mês passado' },
  ultimos_3_meses: { label: 'Últimos 3 meses', dias: 90 },
  ultimos_6_meses: { label: 'Últimos 6 meses', dias: 180 },
  este_ano: { label: 'Este ano' },
  ano_passado: { label: 'Ano passado' },
  personalizado: { label: 'Período personalizado' }
};

export const calcularDatasPeriodo = (periodo: PeriodoPredefinido): { inicio: string; fim: string } => {
  const hoje = new Date();
  const fim = hoje.toISOString().split('T')[0];
  let inicio: string;

  switch (periodo) {
    case 'hoje':
      inicio = fim;
      break;
    case 'ontem':
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      inicio = ontem.toISOString().split('T')[0];
      break;
    case 'ultimos_7_dias':
      const seteDiasAtras = new Date(hoje);
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      inicio = seteDiasAtras.toISOString().split('T')[0];
      break;
    case 'ultimos_30_dias':
      const trintaDiasAtras = new Date(hoje);
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      inicio = trintaDiasAtras.toISOString().split('T')[0];
      break;
    case 'este_mes':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      break;
    case 'mes_passado':
      const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      inicio = mesPassado.toISOString().split('T')[0];
      const ultimoDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      return {
        inicio,
        fim: ultimoDiaMesPassado.toISOString().split('T')[0]
      };
    case 'ultimos_3_meses':
      const tresMesesAtras = new Date(hoje);
      tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
      inicio = tresMesesAtras.toISOString().split('T')[0];
      break;
    case 'ultimos_6_meses':
      const seisMesesAtras = new Date(hoje);
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
      inicio = seisMesesAtras.toISOString().split('T')[0];
      break;
    case 'este_ano':
      inicio = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    case 'ano_passado':
      const anoPassado = hoje.getFullYear() - 1;
      inicio = new Date(anoPassado, 0, 1).toISOString().split('T')[0];
      return {
        inicio,
        fim: new Date(anoPassado, 11, 31).toISOString().split('T')[0]
      };
    default:
      // Para período personalizado, retornar últimos 30 dias como padrão
      const padrao = new Date(hoje);
      padrao.setDate(padrao.getDate() - 30);
      inicio = padrao.toISOString().split('T')[0];
  }

  return { inicio, fim };
};