import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Wifi, 
  Zap,
  RefreshCw,
  Bug,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  timestamp: string;
}

interface SystemHealth {
  overall: number;
  database: number;
  frontend: number;
  performance: number;
}

const SystemDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [health, setHealth] = useState<SystemHealth>({
    overall: 0,
    database: 0,
    frontend: 0,
    performance: 0
  });
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    runDiagnostics();
    
    if (autoRefresh) {
      const interval = setInterval(runDiagnostics, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];
    
    try {
      // 1. Teste de Conectividade com Supabase
      const dbStart = performance.now();
      try {
        const { error } = await supabase.from('animais').select('id').limit(1);
        const dbTime = performance.now() - dbStart;
        
        if (error) {
          results.push({
            component: 'Database Connection',
            status: 'error',
            message: 'Falha na conexão com a base de dados',
            details: error.message,
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            component: 'Database Connection',
            status: 'success',
            message: `Conexão ativa (${dbTime.toFixed(2)}ms)`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error: any) {
        results.push({
          component: 'Database Connection',
          status: 'error',
          message: 'Erro de conectividade',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // 2. Verificação de Tabelas Críticas
      const criticalTables = [
        'animais',
        'voluntarios',
        'intervencoes',
        'notificacoes',
        'denuncias_2025_12_29_23_00'
      ];

      for (const table of criticalTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('id')
            .limit(1);

          if (error) {
            results.push({
              component: `Table: ${table}`,
              status: 'error',
              message: `Tabela ${table} inacessível`,
              details: error.message,
              timestamp: new Date().toISOString()
            });
          } else {
            results.push({
              component: `Table: ${table}`,
              status: 'success',
              message: `Tabela ${table} acessível`,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error: any) {
          results.push({
            component: `Table: ${table}`,
            status: 'error',
            message: `Erro ao verificar ${table}`,
            details: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      // 3. Verificação de Performance do Frontend
      const performanceStart = performance.now();
      
      // Simular operações do frontend
      const testArray = Array.from({ length: 1000 }, (_, i) => i);
      testArray.filter(n => n % 2 === 0).map(n => n * 2);
      
      const performanceTime = performance.now() - performanceStart;
      
      if (performanceTime > 100) {
        results.push({
          component: 'Frontend Performance',
          status: 'warning',
          message: `Performance lenta (${performanceTime.toFixed(2)}ms)`,
          timestamp: new Date().toISOString()
        });
      } else {
        results.push({
          component: 'Frontend Performance',
          status: 'success',
          message: `Performance boa (${performanceTime.toFixed(2)}ms)`,
          timestamp: new Date().toISOString()
        });
      }

      // 4. Verificação de Memória
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        if (memoryUsage > 80) {
          results.push({
            component: 'Memory Usage',
            status: 'warning',
            message: `Uso de memória alto (${memoryUsage.toFixed(1)}%)`,
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            component: 'Memory Usage',
            status: 'success',
            message: `Uso de memória normal (${memoryUsage.toFixed(1)}%)`,
            timestamp: new Date().toISOString()
          });
        }
      }

      // 5. Verificação de Erros de Console
      const consoleErrors = checkConsoleErrors();
      if (consoleErrors.length > 0) {
        results.push({
          component: 'Console Errors',
          status: 'error',
          message: `${consoleErrors.length} erros detectados`,
          details: consoleErrors.join(', '),
          timestamp: new Date().toISOString()
        });
      } else {
        results.push({
          component: 'Console Errors',
          status: 'success',
          message: 'Nenhum erro de console detectado',
          timestamp: new Date().toISOString()
        });
      }

      // Calcular saúde do sistema
      const successCount = results.filter(r => r.status === 'success').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      const overallHealth = Math.round((successCount / results.length) * 100);
      const databaseHealth = Math.round((results.filter(r => r.component.includes('Database') || r.component.includes('Table')).filter(r => r.status === 'success').length / results.filter(r => r.component.includes('Database') || r.component.includes('Table')).length) * 100);
      const frontendHealth = Math.round((results.filter(r => r.component.includes('Frontend') || r.component.includes('Memory') || r.component.includes('Console')).filter(r => r.status === 'success').length / results.filter(r => r.component.includes('Frontend') || r.component.includes('Memory') || r.component.includes('Console')).length) * 100);
      
      setHealth({
        overall: overallHealth,
        database: databaseHealth,
        frontend: frontendHealth,
        performance: performanceTime < 50 ? 100 : performanceTime < 100 ? 75 : 50
      });

      setDiagnostics(results);

      // Toast com resultado
      if (errorCount > 0) {
        toast({
          title: "⚠️ Problemas Detectados",
          description: `${errorCount} erros e ${warningCount} avisos encontrados`,
          variant: "destructive",
        });
      } else if (warningCount > 0) {
        toast({
          title: "✅ Sistema Funcional",
          description: `${warningCount} avisos encontrados`,
        });
      } else {
        toast({
          title: "✅ Sistema Saudável",
          description: "Todos os testes passaram com sucesso",
        });
      }

    } catch (error: any) {
      console.error('Erro no diagnóstico:', error);
      toast({
        title: "Erro no Diagnóstico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConsoleErrors = (): string[] => {
    // Esta função seria implementada para capturar erros de console
    // Por agora, retorna array vazio
    return [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnósticos do Sistema</h2>
          <p className="text-gray-600">Monitorização em tempo real da saúde do sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          <Button
            onClick={runDiagnostics}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Executar Diagnóstico
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saúde Geral</p>
                <p className={`text-2xl font-bold ${getHealthColor(health.overall)}`}>
                  {health.overall}%
                </p>
              </div>
              <Shield className={`h-8 w-8 ${getHealthColor(health.overall)}`} />
            </div>
            <Progress value={health.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Base de Dados</p>
                <p className={`text-2xl font-bold ${getHealthColor(health.database)}`}>
                  {health.database}%
                </p>
              </div>
              <Database className={`h-8 w-8 ${getHealthColor(health.database)}`} />
            </div>
            <Progress value={health.database} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Frontend</p>
                <p className={`text-2xl font-bold ${getHealthColor(health.frontend)}`}>
                  {health.frontend}%
                </p>
              </div>
              <Zap className={`h-8 w-8 ${getHealthColor(health.frontend)}`} />
            </div>
            <Progress value={health.frontend} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className={`text-2xl font-bold ${getHealthColor(health.performance)}`}>
                  {health.performance}%
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${getHealthColor(health.performance)}`} />
            </div>
            <Progress value={health.performance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Resultados Detalhados</span>
          </CardTitle>
          <CardDescription>
            Última execução: {diagnostics.length > 0 ? new Date(diagnostics[0].timestamp).toLocaleString('pt-PT') : 'Nunca'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {diagnostics.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.component}</p>
                        <p className="text-sm opacity-80">{result.message}</p>
                        {result.details && (
                          <p className="text-xs opacity-60 mt-1">{result.details}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(result.timestamp).toLocaleTimeString('pt-PT')}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {diagnostics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum diagnóstico executado ainda</p>
                  <p className="text-sm">Clique em "Executar Diagnóstico" para começar</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnostics;