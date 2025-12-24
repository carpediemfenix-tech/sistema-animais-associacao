import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Search, 
  Filter,
  LogIn,
  LogOut,
  Clock,
  User,
  Calendar,
  Activity,
  Shield,
  Eye,
  Download,
  RefreshCw,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface AccessLog {
  id: string;
  utilizador_nome: string;
  utilizador_id: string;
  acao: 'login' | 'logout';
  data_hora: string;
  ip_address?: string;
  user_agent?: string;
  sessao_id?: string;
  duracao_sessao?: number;
  created_at: string;
}

const LogsAcesso = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcao, setFilterAcao] = useState<string>('todos');
  const [filterData, setFilterData] = useState<string>('');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filterAcao, filterData]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando logs de acesso...');
      
      let query = supabase
        .from('user_access_logs')
        .select('*', { count: 'exact' })
        .order('data_hora', { ascending: false });

      // Aplicar filtros
      if (filterAcao !== 'todos') {
        query = query.eq('acao', filterAcao);
      }

      if (filterData) {
        const startDate = new Date(filterData);
        const endDate = new Date(filterData);
        endDate.setDate(endDate.getDate() + 1);
        
        query = query
          .gte('data_hora', startDate.toISOString())
          .lt('data_hora', endDate.toISOString());
      }

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Erro ao carregar logs:', error);
        throw error;
      }

      console.log('✅ Logs carregados:', data?.length || 0);
      setLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: any) {
      console.error('💥 Erro geral:', error);
      toast({
        title: "Erro ao carregar logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar registos antigos (mais de 48 horas)
  const limparRegistosAntigos = async () => {
    const confirmacao = window.confirm(
      'Tem certeza que deseja eliminar todos os registos com mais de 48 horas?\n\nEsta ação não pode ser desfeita.'
    );
    
    if (!confirmacao) return;

    try {
      console.log('🗑️ Limpando registos antigos...');
      
      // Chamar Edge Function para limpeza
      const { data, error } = await supabase.functions.invoke('cleanup_old_logs_2025_12_24_07_15');

      if (error) {
        console.error('❌ Erro ao limpar registos:', error);
        throw error;
      }

      console.log('✅ Resposta da limpeza:', data);
      
      if (data.success) {
        toast({
          title: "✅ Limpeza concluída",
          description: `${data.deleted_count} registos com mais de 48 horas foram eliminados`,
        });
      } else {
        throw new Error(data.error || 'Erro desconhecido na limpeza');
      }

      // Recarregar logs
      fetchLogs();
    } catch (error: any) {
      console.error('💥 Erro ao limpar registos:', error);
      toast({
        title: "Erro na limpeza",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const logsFiltrados = logs.filter(log => 
    log.utilizador_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.utilizador_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.sessao_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAcaoBadge = (acao: string) => {
    switch (acao) {
      case 'login':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <LogIn className="h-3 w-3 mr-1" />
            Login
          </Badge>
        );
      case 'logout':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Badge>
        );
      default:
        return <Badge variant="outline">{acao}</Badge>;
    }
  };

  const getStatistics = () => {
    const totalLogins = logs.filter(log => log.acao === 'login').length;
    const totalLogouts = logs.filter(log => log.acao === 'logout').length;
    const uniqueUsers = [...new Set(logs.map(log => log.utilizador_nome))].length;
    const activeSessions = totalLogins - totalLogouts;

    return { totalLogins, totalLogouts, uniqueUsers, activeSessions };
  };

  const stats = getStatistics();

  const exportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Utilizador', 'Ação', 'Sessão', 'Duração', 'IP'].join(','),
      ...logsFiltrados.map(log => [
        formatDateTime(log.data_hora),
        log.utilizador_nome,
        log.acao,
        log.sessao_id || '',
        formatDuration(log.duracao_sessao),
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_acesso_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "✅ Exportação concluída",
      description: "Logs exportados para CSV com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-600" />
                <span className="hidden sm:inline">Logs de Acesso</span>
                <span className="sm:hidden">Logs</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                <span className="hidden sm:inline">Auditoria de acessos dos utilizadores ao sistema</span>
                <span className="sm:hidden">Histórico de acessos</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={limparRegistosAntigos} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Limpar Antigos</span>
                <span className="sm:hidden">🗑️</span>
              </Button>
              <Button onClick={exportLogs} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">CSV</span>
              </Button>
              <Button onClick={fetchLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Atualizar</span>
                <span className="sm:hidden">↻</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Logins</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.totalLogins}</p>
                </div>
                <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Logouts</p>
                  <p className="text-xl sm:text-3xl font-bold text-red-600">{stats.totalLogouts}</p>
                </div>
                <LogOut className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Utilizadores</p>
                  <p className="text-xl sm:text-3xl font-bold text-blue-600">{stats.uniqueUsers}</p>
                </div>
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Sessões Ativas</p>
                  <p className="text-xl sm:text-3xl font-bold text-purple-600">{Math.max(0, stats.activeSessions)}</p>
                </div>
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, ID ou sessão..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label>Ação</Label>
                <Select value={filterAcao} onValueChange={setFilterAcao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as ações</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={filterData}
                  onChange={(e) => setFilterData(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>
              Histórico de Acessos ({logsFiltrados.length} registos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando logs...</p>
              </div>
            ) : logsFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum log encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterAcao !== 'todos' || filterData
                    ? "Tente ajustar os filtros de pesquisa"
                    : "Ainda não há registos de acesso"
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Versão Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Sessão</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsFiltrados.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(log.data_hora)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium">{log.utilizador_nome}</div>
                                {log.utilizador_id && (
                                  <div className="text-sm text-gray-500">{log.utilizador_id}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAcaoBadge(log.acao)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.sessao_id || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDuration(log.duracao_sessao)}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ip_address || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Versão Mobile */}
                <div className="sm:hidden space-y-4">
                  {logsFiltrados.map((log) => (
                    <Card key={log.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{log.utilizador_nome}</span>
                          </div>
                          {getAcaoBadge(log.acao)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-2" />
                            {formatDateTime(log.data_hora)}
                          </div>
                          
                          {log.sessao_id && (
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-2" />
                              Sessão: {log.sessao_id}
                            </div>
                          )}
                          
                          {log.duracao_sessao && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-2" />
                              Duração: {formatDuration(log.duracao_sessao)}
                            </div>
                          )}
                          
                          {log.ip_address && (
                            <div className="flex items-center">
                              <Activity className="h-3 w-3 mr-2" />
                              IP: {log.ip_address}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default LogsAcesso;