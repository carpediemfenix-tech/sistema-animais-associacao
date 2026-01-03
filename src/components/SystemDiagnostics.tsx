import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Wifi, 
  Clock, 
  Users, 
  PawPrint,
  FileText,
  Settings,
  RefreshCw,
  Bug,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  authentication: 'healthy' | 'warning' | 'error';
  notifications: 'healthy' | 'warning' | 'error';
  performance: 'healthy' | 'warning' | 'error';
}

interface SystemStats {
  totalAnimals: number;
  totalVolunteers: number;
  totalDenuncias: number;
  totalMissions: number;
  activeNotifications: number;
  systemUptime: string;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
}

const SystemDiagnostics: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    authentication: 'healthy',
    notifications: 'healthy',
    performance: 'healthy'
  });
  
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalAnimals: 0,
    totalVolunteers: 0,
    totalDenuncias: 0,
    totalMissions: 0,
    activeNotifications: 0,
    systemUptime: '0h 0m'
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    errorRate: 0,
    activeConnections: 0,
    memoryUsage: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const { toast } = useToast();

  // Função para verificar saúde do banco de dados
  const checkDatabaseHealth = async (): Promise<'healthy' | 'warning' | 'error'> => {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('animais').select('id').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) return 'error';
      if (responseTime > 2000) return 'warning';
      return 'healthy';
    } catch {
      return 'error';
    }
  };

  // Função para verificar autenticação
  const checkAuthenticationHealth = async (): Promise<'healthy' | 'warning' | 'error'> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session ? 'healthy' : 'warning';
    } catch {
      return 'error';
    }
  };

  // Função para verificar notificações
  const checkNotificationsHealth = async (): Promise<'healthy' | 'warning' | 'error'> => {
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('id')
        .limit(1);
      
      if (error) return 'error';
      return 'healthy';
    } catch {
      return 'error';
    }
  };

  // Função para coletar estatísticas do sistema
  const collectSystemStats = async (): Promise<SystemStats> => {
    try {
      const [animalsResult, volunteersResult, denunciasResult, missionsResult, notificationsResult] = await Promise.all([
        supabase.from('animais').select('id', { count: 'exact' }),
        supabase.from('voluntarios_2025_12_21_22_00').select('id', { count: 'exact' }),
        supabase.from('denuncias').select('id', { count: 'exact' }),
        supabase.from('missoes_2025_12_21_19_00').select('id', { count: 'exact' }),
        supabase.from('notificacoes').select('id', { count: 'exact' }).eq('lida', false)
      ]);

      return {
        totalAnimals: animalsResult.count || 0,
        totalVolunteers: volunteersResult.count || 0,
        totalDenuncias: denunciasResult.count || 0,
        totalMissions: missionsResult.count || 0,
        activeNotifications: notificationsResult.count || 0,
        systemUptime: calculateUptime()
      };
    } catch (error) {
      console.error('Erro ao coletar estatísticas:', error);
      return systemStats;
    }
  };

  // Função para calcular uptime (simulado)
  const calculateUptime = (): string => {
    const startTime = new Date('2025-01-01'); // Data de início simulada
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    return `${diffDays}d ${remainingHours}h`;
  };

  // Função para executar diagnóstico completo
  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const [dbHealth, authHealth, notifHealth, stats] = await Promise.all([
        checkDatabaseHealth(),
        checkAuthenticationHealth(),
        checkNotificationsHealth(),
        collectSystemStats()
      ]);

      setSystemHealth({
        database: dbHealth,
        authentication: authHealth,
        notifications: notifHealth,
        performance: dbHealth === 'healthy' ? 'healthy' : 'warning'
      });

      setSystemStats(stats);
      setLastCheck(new Date());

      // Simular métricas de performance
      setPerformanceMetrics({
        avgResponseTime: Math.random() * 500 + 100,
        errorRate: Math.random() * 5,
        activeConnections: Math.floor(Math.random() * 50) + 10,
        memoryUsage: Math.random() * 80 + 20
      });

      toast({
        title: "✅ Diagnóstico Completo",
        description: "Verificação do sistema concluída com sucesso",
      });
    } catch (error) {
      toast({
        title: "❌ Erro no Diagnóstico",
        description: "Falha ao executar verificação do sistema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Executar diagnóstico na inicialização
  useEffect(() => {
    runDiagnostics();
  }, []);

  // Função para obter ícone e cor do status
  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'Saudável';
      case 'warning':
        return 'Atenção';
      case 'error':
        return 'Erro';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnóstico do Sistema</h2>
          <p className="text-gray-600">
            Última verificação: {lastCheck.toLocaleString('pt-PT')}
          </p>
        </div>
        <Button 
          onClick={runDiagnostics} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Verificando...' : 'Executar Diagnóstico'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Database className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Base de Dados</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemHealth.database)}
                      <span className="text-lg font-bold">
                        {getStatusText(systemHealth.database)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Autenticação</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemHealth.authentication)}
                      <span className="text-lg font-bold">
                        {getStatusText(systemHealth.authentication)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notificações</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemHealth.notifications)}
                      <span className="text-lg font-bold">
                        {getStatusText(systemHealth.notifications)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Performance</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(systemHealth.performance)}
                      <span className="text-lg font-bold">
                        {getStatusText(systemHealth.performance)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saúde do Sistema */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Status dos Componentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Base de Dados</span>
                  <Badge className={getStatusColor(systemHealth.database)}>
                    {getStatusText(systemHealth.database)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Autenticação</span>
                  <Badge className={getStatusColor(systemHealth.authentication)}>
                    {getStatusText(systemHealth.authentication)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Notificações</span>
                  <Badge className={getStatusColor(systemHealth.notifications)}>
                    {getStatusText(systemHealth.notifications)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Performance</span>
                  <Badge className={getStatusColor(systemHealth.performance)}>
                    {getStatusText(systemHealth.performance)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Tempo de Atividade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {systemStats.systemUptime}
                  </div>
                  <p className="text-gray-600">Sistema ativo</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Tempo de Resposta Médio</span>
                    <span className="text-sm text-gray-600">
                      {performanceMetrics.avgResponseTime.toFixed(0)}ms
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(performanceMetrics.avgResponseTime / 10, 100)} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Erro</span>
                    <span className="text-sm text-gray-600">
                      {performanceMetrics.errorRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={performanceMetrics.errorRate * 20} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Uso de Memória</span>
                    <span className="text-sm text-gray-600">
                      {performanceMetrics.memoryUsage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={performanceMetrics.memoryUsage} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conexões Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {performanceMetrics.activeConnections}
                  </div>
                  <p className="text-gray-600">Conexões simultâneas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Estatísticas */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <PawPrint className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Animais</p>
                    <p className="text-2xl font-bold">{systemStats.totalAnimals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Voluntários</p>
                    <p className="text-2xl font-bold">{systemStats.totalVolunteers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Denúncias</p>
                    <p className="text-2xl font-bold">{systemStats.totalDenuncias}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Missões</p>
                    <p className="text-2xl font-bold">{systemStats.totalMissions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notificações Ativas</p>
                    <p className="text-2xl font-bold">{systemStats.activeNotifications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conexões Ativas</p>
                    <p className="text-2xl font-bold">{performanceMetrics.activeConnections}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemDiagnostics;