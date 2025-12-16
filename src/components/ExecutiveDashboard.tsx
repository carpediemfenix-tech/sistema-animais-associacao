import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Heart,
  Package,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
  target?: number;
  progress?: number;
}

interface AlertaCritico {
  tipo_alerta: string;
  titulo: string;
  quantidade: number;
  prioridade: string;
  descricao: string;
  detalhes: any;
}

const ExecutiveDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [alertasCriticos, setAlertasCriticos] = useState<AlertaCritico[]>([]);
  const [performanceMensal, setPerformanceMensal] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar KPIs executivos
      const { data: kpisData, error: kpisError } = await supabase
        .from('kpis_executivos_2025_12_16_05_00')
        .select('*')
        .single();

      if (kpisError && kpisError.code !== 'PGRST116') {
        console.error('Erro ao carregar KPIs:', kpisError);
      } else {
        setKpis(kpisData);
      }

      // Carregar alertas críticos
      const { data: alertasData, error: alertasError } = await supabase
        .from('alertas_criticos_2025_12_16_05_00')
        .select('*');

      if (alertasError && alertasError.code !== 'PGRST116') {
        console.error('Erro ao carregar alertas:', alertasError);
      } else {
        setAlertasCriticos(alertasData || []);
      }

      // Carregar performance mensal
      const { data: performanceData, error: performanceError } = await supabase
        .from('performance_mensal_2025_12_16_05_00')
        .select('*')
        .limit(6);

      if (performanceError && performanceError.code !== 'PGRST116') {
        console.error('Erro ao carregar performance:', performanceError);
      } else {
        setPerformanceMensal(performanceData || []);
      }

    } catch (error) {
      console.error('Erro geral no dashboard:', error);
      toast({
        title: "Aviso",
        description: "Alguns dados do dashboard podem não estar disponíveis",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
  };

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      'critica': 'bg-red-100 text-red-800 border-red-200',
      'alta': 'bg-orange-100 text-orange-800 border-orange-200',
      'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'baixa': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[prioridade as keyof typeof colors] || colors.baixa;
  };

  // Preparar dados dos KPIs
  const kpiCards: KPICard[] = kpis ? [
    {
      title: 'Total de Animais',
      value: kpis.total_animais || 0,
      change: kpis.tendencia_novos_animais_percent,
      changeType: (kpis.tendencia_novos_animais_percent || 0) >= 0 ? 'positive' : 'negative',
      icon: Heart,
      color: 'bg-blue-500',
      description: `${kpis.animais_disponiveis || 0} disponíveis, ${kpis.animais_adotados || 0} adotados`,
      target: 100,
      progress: kpis.taxa_adocao_percent || 0
    },
    {
      title: 'Taxa de Adoção',
      value: formatPercentage(kpis.taxa_adocao_percent || 0),
      change: kpis.tendencia_adocoes_percent,
      changeType: (kpis.tendencia_adocoes_percent || 0) >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'bg-green-500',
      description: `${kpis.adocoes_ultimos_30 || 0} adoções nos últimos 30 dias`,
      target: 80,
      progress: kpis.taxa_adocao_percent || 0
    },
    {
      title: 'Voluntários Ativos',
      value: `${kpis.voluntarios_ativos || 0}/${kpis.total_voluntarios || 0}`,
      change: kpis.taxa_voluntarios_ativos_percent,
      changeType: 'neutral',
      icon: Users,
      color: 'bg-purple-500',
      description: `${formatPercentage(kpis.taxa_voluntarios_ativos_percent || 0)} de atividade`,
      target: 100,
      progress: kpis.taxa_voluntarios_ativos_percent || 0
    },
    {
      title: 'Saldo Mensal',
      value: formatCurrency(kpis.saldo_mes || 0),
      change: ((kpis.receitas_mes || 0) - (kpis.despesas_mes || 0)) >= 0 ? 10 : -10,
      changeType: ((kpis.receitas_mes || 0) - (kpis.despesas_mes || 0)) >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'bg-green-600',
      description: `Receitas: ${formatCurrency(kpis.receitas_mes || 0)} | Despesas: ${formatCurrency(kpis.despesas_mes || 0)}`,
    },
    {
      title: 'Equipamentos',
      value: `${kpis.equipamentos_disponiveis || 0}/${kpis.total_equipamentos || 0}`,
      change: kpis.taxa_equipamentos_disponiveis_percent,
      changeType: 'neutral',
      icon: Package,
      color: 'bg-orange-500',
      description: `${formatPercentage(kpis.taxa_equipamentos_disponiveis_percent || 0)} disponíveis`,
      target: 90,
      progress: kpis.taxa_equipamentos_disponiveis_percent || 0
    },
    {
      title: 'Intervenções',
      value: kpis.intervencoes_mes || 0,
      change: 0,
      changeType: 'neutral',
      icon: Activity,
      color: 'bg-red-500',
      description: `${kpis.intervencoes_agendadas || 0} agendadas`,
    }
  ] : [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando dashboard executivo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600">Visão geral e KPIs em tempo real</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      {kpis && (
        <Card className={`border-l-4 ${
          kpis.status_geral === 'critico' ? 'border-l-red-500 bg-red-50' :
          kpis.status_geral === 'atencao' ? 'border-l-orange-500 bg-orange-50' :
          'border-l-green-500 bg-green-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {kpis.status_geral === 'critico' ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : kpis.status_geral === 'atencao' ? (
                  <Clock className="h-6 w-6 text-orange-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    Status do Sistema: {kpis.status_geral.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Última atualização: {new Date(kpis.ultima_atualizacao).toLocaleString('pt-PT')}
                  </p>
                </div>
              </div>
              <Badge className={getPrioridadeColor(kpis.status_geral)}>
                {kpis.status_geral.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-full ${kpi.color}`}>
                <kpi.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change !== undefined && (
                <div className="flex items-center mt-2">
                  {getChangeIcon(kpi.changeType || 'neutral')}
                  <span className={`text-sm ml-1 ${
                    kpi.changeType === 'positive' ? 'text-green-600' :
                    kpi.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change?.toFixed(1)}%
                  </span>
                </div>
              )}
              {kpi.description && (
                <p className="text-xs text-muted-foreground mt-2">
                  {kpi.description}
                </p>
              )}
              {kpi.progress !== undefined && kpi.target && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{kpi.progress.toFixed(1)}% / {kpi.target}%</span>
                  </div>
                  <Progress value={Math.min(kpi.progress, 100)} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas Críticos */}
      {alertasCriticos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas Críticos ({alertasCriticos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertasCriticos.map((alerta, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getPrioridadeColor(alerta.prioridade)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{alerta.titulo}</h4>
                      <p className="text-sm mt-1">{alerta.descricao}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPrioridadeColor(alerta.prioridade)}>
                        {alerta.quantidade}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Mensal */}
      {performanceMensal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Performance dos Últimos Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mês</th>
                    <th className="text-right p-2">Novos Animais</th>
                    <th className="text-right p-2">Adoções</th>
                    <th className="text-right p-2">Taxa Adoção</th>
                    <th className="text-right p-2">Receitas</th>
                    <th className="text-right p-2">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMensal.map((mes, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">
                        {new Date(mes.mes).toLocaleDateString('pt-PT', { 
                          year: 'numeric', 
                          month: 'short' 
                        })}
                      </td>
                      <td className="text-right p-2">{mes.novos_animais || 0}</td>
                      <td className="text-right p-2">{mes.adocoes || 0}</td>
                      <td className="text-right p-2">
                        <Badge variant="outline">
                          {formatPercentage(mes.taxa_adocao_mensal || 0)}
                        </Badge>
                      </td>
                      <td className="text-right p-2">{formatCurrency(mes.receitas || 0)}</td>
                      <td className={`text-right p-2 font-medium ${
                        (mes.saldo_mensal || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(mes.saldo_mensal || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Relatório Executivo</div>
                <div className="text-sm text-gray-600">Gerar relatório completo</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Backup Manual</div>
                <div className="text-sm text-gray-600">Criar backup dos dados</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Configurações</div>
                <div className="text-sm text-gray-600">Ajustar parâmetros do sistema</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;