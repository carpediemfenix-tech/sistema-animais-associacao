import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Users,
  FileText,
  BarChart3,
  Eye,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  nivel: string;
  categoria: string;
  total: number;
  ultima_hora: number;
  ultimas_24h: number;
  ultimo_log: string;
}

interface PerformanceMetric {
  endpoint: string;
  total_requests: number;
  tempo_medio_ms: number;
  tempo_min_ms: number;
  tempo_max_ms: number;
  erros: number;
  requests_ultima_hora: number;
}

interface SystemStats {
  total_logs_24h: number;
  logs_erro_24h: number;
  tempo_medio_resposta: number;
}

const MonitoringDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetric[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_logs_24h: 0,
    logs_erro_24h: 0,
    tempo_medio_resposta: 0
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadMonitoringData = async () => {
    try {
      setLoading(true);

      // Carregar relatório do sistema
      const { data: relatorio, error } = await supabase
        .rpc('obter_relatorio_sistema');

      if (error) throw error;

      if (relatorio) {
        setLogs(relatorio.logs_resumo || []);
        setPerformance(relatorio.performance_resumo || []);
        setSystemStats(relatorio.estatisticas_gerais || {
          total_logs_24h: 0,
          logs_erro_24h: 0,
          tempo_medio_resposta: 0
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de monitoramento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const registrarLogTeste = async () => {
    try {
      await supabase.rpc('registrar_log', {
        p_categoria: 'teste',
        p_acao: 'teste_dashboard',
        p_descricao: 'Log de teste gerado pelo dashboard de monitoramento',
        p_nivel: 'info'
      });

      toast({
        title: "Sucesso",
        description: "Log de teste registrado com sucesso",
      });

      // Recarregar dados após 1 segundo
      setTimeout(loadMonitoringData, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar log de teste",
        variant: "destructive",
      });
    }
  };

  const exportarLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('logs_sistema_2025_12_16_12_30')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const csvContent = [
        ['Data', 'Nível', 'Categoria', 'Ação', 'Descrição'],
        ...(data || []).map(log => [
          new Date(log.created_at).toLocaleString('pt-PT'),
          log.nivel,
          log.categoria,
          log.acao,
          log.descricao || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs_sistema_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Logs exportados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar logs",
        variant: "destructive",
      });
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTempo = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  useEffect(() => {
    loadMonitoringData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadMonitoringData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando dados de monitoramento...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Monitoramento</h1>
          <p className="text-gray-600">
            Sistema de logs e métricas de performance • Última atualização: {lastUpdate.toLocaleTimeString('pt-PT')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={registrarLogTeste}>
            <FileText className="h-4 w-4 mr-2" />
            Teste Log
          </Button>
          <Button variant="outline" size="sm" onClick={exportarLogs}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={loadMonitoringData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs (24h)</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_logs_24h}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {systemStats.logs_erro_24h > 0 ? (
                <>
                  <AlertTriangle className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">{systemStats.logs_erro_24h} erros</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">Sem erros</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTempo(systemStats.tempo_medio_resposta || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Tempo de resposta médio
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Server className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <div className="text-xs text-muted-foreground mt-1">
              Sistema operacional
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache & Otimização</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Resumo de Logs por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum log encontrado</p>
                    <p className="text-sm mt-1">Clique em "Teste Log" para gerar um log de exemplo</p>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getNivelColor(log.nivel)}`}>
                          {getNivelIcon(log.nivel)}
                        </div>
                        <div>
                          <h4 className="font-medium">{log.categoria}</h4>
                          <p className="text-sm text-gray-600">Nível: {log.nivel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{log.total}</div>
                        <div className="text-xs text-gray-500">
                          {log.ultima_hora} na última hora
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Métricas de Performance por Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma métrica de performance disponível</p>
                    <p className="text-sm mt-1">As métricas aparecerão conforme o sistema for usado</p>
                  </div>
                ) : (
                  performance.map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{metric.endpoint}</h4>
                        <Badge variant={metric.erros > 0 ? 'destructive' : 'secondary'}>
                          {metric.total_requests} requests
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tempo Médio:</span>
                          <div className="font-medium">{formatTempo(metric.tempo_medio_ms)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Min/Max:</span>
                          <div className="font-medium">
                            {formatTempo(metric.tempo_min_ms)} / {formatTempo(metric.tempo_max_ms)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Erros:</span>
                          <div className={`font-medium ${metric.erros > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {metric.erros}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Última Hora:</span>
                          <div className="font-medium">{metric.requests_ultima_hora}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-purple-600" />
                Sistema de Cache e Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Cache de Estatísticas</h4>
                    <p className="text-sm text-blue-700">
                      Sistema de cache implementado para estatísticas do dashboard com TTL de 2 minutos.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Views Otimizadas</h4>
                    <p className="text-sm text-green-700">
                      Views pré-calculadas para animais e equipamentos melhoram a performance das consultas.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Limpeza Automática</h4>
                    <p className="text-sm text-purple-700">
                      Sistema de limpeza automática remove cache expirado e logs antigos.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Índices Otimizados</h4>
                    <p className="text-sm text-orange-700">
                      Índices estratégicos em tabelas de logs e cache para máxima performance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;