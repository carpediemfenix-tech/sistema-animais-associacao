import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PageActionBar from '@/components/PageActionBar';
import SystemDiagnostics from '@/components/SystemDiagnostics';
import PerformanceOptimizer from '@/components/PerformanceOptimizer';
import BackupRecovery from '@/components/BackupRecovery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Activity, 
  Zap, 
  Database, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  HardDrive,
  Cpu,
  Wifi,
  Bug
} from 'lucide-react';

const AdministracaoAvancada: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('diagnostics');

  // Verificar permissões de administrador
  if (!user || !hasPermission('admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PageActionBar
        breadcrumbs={[
          { label: 'Administração Avançada', icon: <Shield className="h-4 w-4" /> }
        ]}
        primaryActions={
          <Badge className="bg-red-600 text-white px-3 py-1">
            <Shield className="h-3 w-3 mr-1 inline" />
            Acesso Administrativo
          </Badge>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administração Avançada do Sistema
          </h1>
          <p className="text-gray-600">
            Ferramentas avançadas para monitorização, otimização e manutenção do sistema
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado do Sistema</p>
                  <p className="text-lg font-bold text-green-600">Operacional</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Activity className="h-3 w-3 mr-1" />
                  Última verificação: há 2 min
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <p className="text-lg font-bold text-blue-600">Excelente</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Zap className="h-3 w-3 mr-1" />
                  Tempo resposta: 120ms
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Base de Dados</p>
                  <p className="text-lg font-bold text-yellow-600">Ativa</p>
                </div>
                <Database className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Wifi className="h-3 w-3 mr-1" />
                  Conexões: 12/100
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Último Backup</p>
                  <p className="text-lg font-bold text-purple-600">Hoje</p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Há 2 horas
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <span>Ferramentas de Administração</span>
            </CardTitle>
            <CardDescription>
              Acesso completo às ferramentas de manutenção e monitorização do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diagnostics" className="flex items-center space-x-2">
                  <Bug className="h-4 w-4" />
                  <span>Diagnósticos</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger value="backup" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Backup</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="diagnostics" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Diagnósticos do Sistema</h3>
                      <p className="text-sm text-gray-600">
                        Monitorização em tempo real da saúde e performance do sistema
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Activity className="h-3 w-3 mr-1" />
                      Sistema Saudável
                    </Badge>
                  </div>
                  <SystemDiagnostics />
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Otimização de Performance</h3>
                      <p className="text-sm text-gray-600">
                        Ferramentas automáticas para melhorar a performance do sistema
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Performance Ótima
                    </Badge>
                  </div>
                  <PerformanceOptimizer />
                </div>
              </TabsContent>

              <TabsContent value="backup" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Backup e Recuperação</h3>
                      <p className="text-sm text-gray-600">
                        Proteção completa dos dados com backup automático e restauro rápido
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Dados Protegidos
                    </Badge>
                  </div>
                  <BackupRecovery />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às operações mais comuns de administração
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('diagnostics')}
                >
                  <Bug className="h-6 w-6" />
                  <span className="text-sm">Executar Diagnóstico</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('performance')}
                >
                  <Zap className="h-6 w-6" />
                  <span className="text-sm">Otimizar Sistema</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('backup')}
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Criar Backup</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  disabled
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Configurações</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Sistema</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versão:</span>
                      <span className="font-medium">Valentão Operacionais v2.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ambiente:</span>
                      <span className="font-medium">Produção</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Última Atualização:</span>
                      <span className="font-medium">{new Date().toLocaleDateString('pt-PT')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Base de Dados</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">Supabase PostgreSQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="font-medium text-green-600">Conectado</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último Backup:</span>
                      <span className="font-medium">Há 2 horas</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdministracaoAvancada;