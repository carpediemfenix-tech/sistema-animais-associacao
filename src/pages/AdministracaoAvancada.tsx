import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Activity, 
  Zap, 
  Database, 
  Shield, 
  Users, 
  PawPrint,
  FileText,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from "lucide-react";
import PageActionBar from "@/components/PageActionBar";
import SystemDiagnostics from "@/components/SystemDiagnostics";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import BackupRecovery from "@/components/BackupRecovery";
import SystemLogs from "@/components/SystemLogs";
import { useAuth } from "@/contexts/AuthContext";

const AdministracaoAvancada: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Dados simulados para o dashboard
  const systemStats = {
    uptime: '15d 8h 23m',
    totalUsers: 12,
    activeConnections: 8,
    systemLoad: 45,
    memoryUsage: 62,
    diskUsage: 38,
    lastBackup: '2 horas atrás',
    criticalAlerts: 0,
    warnings: 2,
    performance: 87
  };

  const recentActivities = [
    {
      id: '1',
      type: 'backup',
      message: 'Backup automático concluído com sucesso',
      time: '2 horas atrás',
      status: 'success'
    },
    {
      id: '2',
      type: 'optimization',
      message: 'Otimização de performance executada',
      time: '6 horas atrás',
      status: 'success'
    },
    {
      id: '3',
      type: 'warning',
      message: 'Uso de memória acima de 60%',
      time: '1 dia atrás',
      status: 'warning'
    },
    {
      id: '4',
      type: 'user',
      message: 'Novo utilizador registado no sistema',
      time: '2 dias atrás',
      status: 'info'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'backup':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageActionBar
        breadcrumbs={[
          { label: 'Administração Avançada', icon: <Settings className="h-4 w-4" /> }
        ]}
        primaryActions={
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">
              Sistema Saudável
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              Performance: {systemStats.performance}%
            </Badge>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Diagnósticos</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Backup</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Estatísticas do Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tempo Ativo</p>
                      <p className="text-2xl font-bold text-green-600">{systemStats.uptime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Utilizadores Ativos</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {systemStats.activeConnections}/{systemStats.totalUsers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Uso de Memória</p>
                      <p className="text-2xl font-bold text-purple-600">{systemStats.memoryUsage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Performance</p>
                      <p className="text-2xl font-bold text-orange-600">{systemStats.performance}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Status do Sistema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Base de Dados</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800">Saudável</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Autenticação</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Notificações</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800">Funcionando</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Backup</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge className="bg-green-100 text-green-800">Atualizado</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Último Backup:</span>
                      <span className="font-medium">{systemStats.lastBackup}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Atividade Recente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Atividade Recente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                          {activity.status === 'success' ? 'Sucesso' :
                           activity.status === 'warning' ? 'Aviso' :
                           activity.status === 'error' ? 'Erro' : 'Info'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas e Avisos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Alertas e Avisos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{systemStats.criticalAlerts}</div>
                    <p className="text-sm text-red-700">Alertas Críticos</p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{systemStats.warnings}</div>
                    <p className="text-sm text-yellow-700">Avisos</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {100 - systemStats.criticalAlerts - systemStats.warnings}%
                    </div>
                    <p className="text-sm text-green-700">Sistema Saudável</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas de Administração</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('diagnostics')}
                  >
                    <Shield className="h-6 w-6" />
                    <span>Executar Diagnóstico</span>
                  </Button>
                  
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('performance')}
                  >
                    <Zap className="h-6 w-6" />
                    <span>Otimizar Sistema</span>
                  </Button>
                  
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setActiveTab('backup')}
                  >
                    <Database className="h-6 w-6" />
                    <span>Criar Backup</span>
                  </Button>
                  
                  <Button 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    variant="outline"
                  >
                    <Settings className="h-6 w-6" />
                    <span>Configurações</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnósticos */}
          <TabsContent value="diagnostics">
            <SystemDiagnostics />
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <PerformanceOptimizer />
          </TabsContent>

          {/* Backup */}
          <TabsContent value="backup">
            <BackupRecovery />
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs">
            <SystemLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdministracaoAvancada;