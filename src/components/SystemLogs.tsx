import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Database,
  Shield,
  Zap,
  Bug
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug' | 'success';
  category: string;
  message: string;
  user?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
}

interface LogFilters {
  level: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<LogFilters>({
    level: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  // Categorias de logs
  const categories = [
    'authentication',
    'database',
    'performance',
    'security',
    'backup',
    'notifications',
    'system',
    'user_actions',
    'errors'
  ];

  // Níveis de log
  const levels = ['info', 'warning', 'error', 'debug', 'success'];

  // Carregar logs
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de logs reais
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          level: 'info',
          category: 'authentication',
          message: 'Utilizador fez login com sucesso',
          user: 'admin',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          level: 'success',
          category: 'backup',
          message: 'Backup automático concluído com sucesso',
          details: { size: '45.2 MB', duration: '2.3s', tables: 8 }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          level: 'warning',
          category: 'performance',
          message: 'Uso de memória acima de 80%',
          details: { memoryUsage: 85, threshold: 80 }
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          level: 'error',
          category: 'database',
          message: 'Falha na conexão com a base de dados',
          details: { error: 'Connection timeout', retries: 3 }
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          level: 'info',
          category: 'user_actions',
          message: 'Novo animal registado no sistema',
          user: 'admin',
          details: { animalId: 'A001', name: 'Rex' }
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          level: 'debug',
          category: 'system',
          message: 'Cache limpo automaticamente',
          details: { itemsRemoved: 150, cacheSize: '2.1 MB' }
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 120 * 60 * 1000),
          level: 'warning',
          category: 'security',
          message: 'Tentativa de acesso não autorizado',
          ip: '192.168.1.200',
          details: { endpoint: '/admin', attempts: 5 }
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 150 * 60 * 1000),
          level: 'info',
          category: 'notifications',
          message: 'Notificação enviada para 12 utilizadores',
          details: { type: 'system_update', recipients: 12 }
        }
      ];

      setLogs(mockLogs);
      applyFilters(mockLogs, filters);
    } catch (error) {
      toast({
        title: "❌ Erro ao Carregar Logs",
        description: "Falha ao carregar logs do sistema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = (logList: LogEntry[], currentFilters: LogFilters) => {
    let filtered = [...logList];

    // Filtro por nível
    if (currentFilters.level !== 'all') {
      filtered = filtered.filter(log => log.level === currentFilters.level);
    }

    // Filtro por categoria
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(log => log.category === currentFilters.category);
    }

    // Filtro por data
    if (currentFilters.dateFrom) {
      const fromDate = new Date(currentFilters.dateFrom);
      filtered = filtered.filter(log => log.timestamp >= fromDate);
    }

    if (currentFilters.dateTo) {
      const toDate = new Date(currentFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => log.timestamp <= toDate);
    }

    // Filtro por pesquisa
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        log.category.toLowerCase().includes(searchTerm) ||
        (log.user && log.user.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredLogs(filtered);
  };

  // Atualizar filtros
  const updateFilter = (key: keyof LogFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(logs, newFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    const clearedFilters: LogFilters = {
      level: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      search: ''
    };
    setFilters(clearedFilters);
    applyFilters(logs, clearedFilters);
  };

  // Exportar logs
  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "📥 Logs Exportados",
      description: `${filteredLogs.length} entradas exportadas com sucesso`,
    });
  };

  // Obter ícone do nível
  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'debug':
        return <Bug className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Obter cor do nível
  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'debug':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obter ícone da categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <Shield className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'user_actions':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Carregar logs na inicialização
  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logs do Sistema</h2>
          <p className="text-gray-600">
            {filteredLogs.length} de {logs.length} entradas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={loadLogs}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar logs..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Nível</label>
              <Select value={filters.level} onValueChange={(value) => updateFilter('level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Níveis</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Entradas de Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Carregando logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center space-x-2 mt-1">
                          {getLevelIcon(log.level)}
                          {getCategoryIcon(log.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getLevelColor(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.category.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {log.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{log.timestamp.toLocaleString('pt-PT')}</span>
                            </span>
                            
                            {log.user && (
                              <span className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{log.user}</span>
                              </span>
                            )}
                            
                            {log.ip && (
                              <span>IP: {log.ip}</span>
                            )}
                          </div>
                          
                          {log.details && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;