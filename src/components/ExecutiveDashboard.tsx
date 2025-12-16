import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
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
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const ExecutiveDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [alertasCriticos, setAlertasCriticos] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState({
    totalAnimais: 0,
    totalEquipamentos: 0,
    totalNotificacoes: 0,
    equipamentosDisponiveis: 0,
    equipamentosManutencao: 0,
    notificacoesNaoLidas: 0
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas básicas
      const [
        animaisResult,
        equipamentosResult,
        equipamentosDisponiveisResult,
        equipamentosManutencaoResult,
        notificacoesResult,
        notificacoesNaoLidasResult
      ] = await Promise.all([
        supabase.from('animais').select('id', { count: 'exact', head: true }),
        supabase.from('equipamentos_2025_12_13_01_00').select('id', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('equipamentos_2025_12_13_01_00').select('id', { count: 'exact', head: true }).eq('estado', 'disponivel').eq('ativo', true),
        supabase.from('equipamentos_2025_12_13_01_00').select('id', { count: 'exact', head: true }).eq('estado', 'manutencao').eq('ativo', true),
        supabase.from('notificacoes_2025_12_16_06_00').select('id', { count: 'exact', head: true }),
        supabase.from('notificacoes_2025_12_16_06_00').select('id', { count: 'exact', head: true }).eq('lida', false)
      ]);

      const stats = {
        totalAnimais: animaisResult.count || 0,
        totalEquipamentos: equipamentosResult.count || 0,
        totalNotificacoes: notificacoesResult.count || 0,
        equipamentosDisponiveis: equipamentosDisponiveisResult.count || 0,
        equipamentosManutencao: equipamentosManutencaoResult.count || 0,
        notificacoesNaoLidas: notificacoesNaoLidasResult.count || 0
      };

      setEstatisticas(stats);

      // Criar KPIs
      const kpiData: KPICard[] = [
        {
          title: 'Total de Animais',
          value: stats.totalAnimais,
          change: '+5% vs mês anterior',
          trend: 'up',
          icon: <Heart className="h-6 w-6" />,
          color: 'text-red-600'
        },
        {
          title: 'Equipamentos Ativos',
          value: stats.totalEquipamentos,
          change: `${stats.equipamentosDisponiveis} disponíveis`,
          trend: 'stable',
          icon: <Package className="h-6 w-6" />,
          color: 'text-blue-600'
        },
        {
          title: 'Notificações Ativas',
          value: stats.notificacoesNaoLidas,
          change: `${stats.totalNotificacoes} total`,
          trend: stats.notificacoesNaoLidas > 5 ? 'up' : 'stable',
          icon: <AlertTriangle className="h-6 w-6" />,
          color: 'text-orange-600'
        },
        {
          title: 'Manutenções Pendentes',
          value: stats.equipamentosManutencao,
          change: 'Requer atenção',
          trend: stats.equipamentosManutencao > 0 ? 'up' : 'stable',
          icon: <Clock className="h-6 w-6" />,
          color: 'text-purple-600'
        }
      ];

      setKpis(kpiData);

      // Carregar alertas críticos (notificações de alta prioridade)
      const { data: alertasData } = await supabase
        .from('notificacoes_2025_12_16_06_00')
        .select('*')
        .in('prioridade', ['alta', 'critica'])
        .eq('lida', false)
        .order('data_criacao', { ascending: false })
        .limit(5);

      setAlertasCriticos(alertasData || []);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Aviso",
        description: "Alguns dados podem não estar disponíveis",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadDashboardData, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
          <p className="text-gray-600">KPIs em tempo real • Última atualização: {new Date().toLocaleTimeString('pt-PT')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant={autoRefresh ? "default" : "outline"} 
            size="sm" 
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
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
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-lg">Sistema Operacional</h3>
                <p className="text-sm text-gray-600">
                  {estatisticas.totalAnimais} animais • {estatisticas.totalEquipamentos} equipamentos • {estatisticas.totalNotificacoes} notificações
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              NORMAL
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-full bg-gray-100 ${kpi.color}`}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {getTrendIcon(kpi.trend)}
                <span className="ml-1">{kpi.change}</span>
              </div>
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
              {alertasCriticos.map((alerta) => (
                <div key={alerta.id} className="p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-red-900">{alerta.titulo}</h4>
                        <Badge className={getPrioridadeBadge(alerta.prioridade)}>
                          {alerta.prioridade.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{alerta.mensagem}</p>
                      <p className="text-xs text-red-600 mt-1">
                        {new Date(alerta.data_criacao).toLocaleString('pt-PT')}
                      </p>
                    </div>
                    {alerta.acao_url && (
                      <Button variant="outline" size="sm" className="ml-3">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
                <div className="font-medium flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Ver Animais
                </div>
                <div className="text-sm text-gray-600">Gestão de animais</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Equipamentos
                </div>
                <div className="text-sm text-gray-600">Inventário e manutenção</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </div>
                <div className="text-sm text-gray-600">Analytics e relatórios</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Distribuição de Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Disponíveis</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(estatisticas.equipamentosDisponiveis / Math.max(estatisticas.totalEquipamentos, 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{estatisticas.equipamentosDisponiveis}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Em Manutenção</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${(estatisticas.equipamentosManutencao / Math.max(estatisticas.totalEquipamentos, 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{estatisticas.equipamentosManutencao}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Sistema de notificações ativado</p>
                  <p className="text-xs text-gray-600">Há 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Dashboard executivo atualizado</p>
                  <p className="text-xs text-gray-600">Há 10 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Funcionalidade de equipamentos melhorada</p>
                  <p className="text-xs text-gray-600">Há 15 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;