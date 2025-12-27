import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap,
  Plus,
  Settings,
  FileText,
  BarChart3,
  Search,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Star,
  TrendingUp,
  Heart,
  Shield,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

interface Voluntario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  data_nascimento?: string;
  data_ingresso: string;
  ativo: boolean;
  pontos_total?: number;
  nivel?: string;
  created_at: string;
}

const GestaoVoluntariosUnificada = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadVoluntarios();
  }, []);

  const loadVoluntarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar voluntários:', error);
      toast({
        title: "Erro ao carregar voluntários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredVoluntarios = voluntarios.filter(vol => {
    const matchesSearch = vol.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vol.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vol.telefone && vol.telefone.includes(searchTerm));
    
    const matchesStatus = filtroStatus === "todos" || 
                         (filtroStatus === "ativos" && vol.ativo) ||
                         (filtroStatus === "inativos" && !vol.ativo);
    
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const totalPages = Math.ceil(filteredVoluntarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVoluntarios = filteredVoluntarios.slice(startIndex, endIndex);

  // Reset para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroStatus]);

  // Estatísticas
  const stats = {
    total: voluntarios.length,
    ativos: voluntarios.filter(v => v.ativo).length,
    inativos: voluntarios.filter(v => !v.ativo).length,
    novos: voluntarios.filter(v => {
      const dias = Math.floor((new Date().getTime() - new Date(v.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return dias <= 30;
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando voluntários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      <PageActionBar
        breadcrumbs={[
          { label: 'Voluntários', icon: <Users className="h-4 w-4" /> }
        ]}
        primaryActions={
          <>
            <Link to="/relatorios-voluntarios">
              <Button variant="outline" className="h-9">
                <FileText className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </Link>
            <Link to="/novo-voluntario">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-9">
                <Plus className="h-4 w-4 mr-2" />
                Novo Voluntário
              </Button>
            </Link>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Estatísticas no Topo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs opacity-75 mt-1">voluntários</p>
                </div>
                <Users className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Ativos */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Ativos</p>
                  <p className="text-3xl font-bold">{stats.ativos}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}%
                  </p>
                </div>
                <UserCheck className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Inativos */}
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Inativos</p>
                  <p className="text-3xl font-bold">{stats.inativos}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {stats.total > 0 ? Math.round((stats.inativos / stats.total) * 100) : 0}%
                  </p>
                </div>
                <UserX className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Novos (últimos 30 dias) */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Novos</p>
                  <p className="text-3xl font-bold">{stats.novos}</p>
                  <p className="text-xs opacity-75 mt-1">últimos 30 dias</p>
                </div>
                <TrendingUp className="h-10 w-10 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild variant="outline" size="lg" className="h-auto py-6 border-2 hover:border-green-500 hover:bg-green-50 transition-all">
            <Link to="/gestao-voluntarios-completa" className="flex flex-col items-center">
              <Users className="h-8 w-8 mb-2 text-green-600" />
              <span className="font-semibold">Gestão Completa</span>
              <span className="text-xs text-gray-500 mt-1">Lista e edição</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-auto py-6 border-2 hover:border-purple-500 hover:bg-purple-50 transition-all">
            <Link to="/sistema-formacao" className="flex flex-col items-center">
              <GraduationCap className="h-8 w-8 mb-2 text-purple-600" />
              <span className="font-semibold">Formações</span>
              <span className="text-xs text-gray-500 mt-1">Sistema completo</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-auto py-6 border-2 hover:border-orange-500 hover:bg-orange-50 transition-all">
            <Link to="/relatorios-voluntarios" className="flex flex-col items-center">
              <FileText className="h-8 w-8 mb-2 text-orange-600" />
              <span className="font-semibold">Relatórios</span>
              <span className="text-xs text-gray-500 mt-1">Análises detalhadas</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-auto py-6 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Link to="/configuracoes/especialidades" className="flex flex-col items-center">
              <Settings className="h-8 w-8 mb-2 text-blue-600" />
              <span className="font-semibold">Especialidades</span>
              <span className="text-xs text-gray-500 mt-1">Configurações</span>
            </Link>
          </Button>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Filtros e Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Pesquisar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativos">✅ Ativos</SelectItem>
                    <SelectItem value="inativos">❌ Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Rápidos */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filtroStatus === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroStatus('todos')}
          >
            Todos ({voluntarios.length})
          </Button>
          <Button
            variant={filtroStatus === 'ativos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroStatus('ativos')}
            className={filtroStatus === 'ativos' ? 'bg-green-600' : ''}
          >
            ✅ Ativos ({stats.ativos})
          </Button>
          <Button
            variant={filtroStatus === 'inativos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroStatus('inativos')}
            className={filtroStatus === 'inativos' ? 'bg-red-600' : ''}
          >
            ❌ Inativos ({stats.inativos})
          </Button>
        </div>

        {/* Lista de Voluntários */}
        {filteredVoluntarios.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum voluntário encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filtroStatus !== "todos"
                  ? "Tente ajustar os filtros de pesquisa"
                  : "Comece adicionando o primeiro voluntário"}
              </p>
              {!searchTerm && filtroStatus === "todos" && (
                <Link to="/novo-voluntario">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Voluntário
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {paginatedVoluntarios.map((voluntario) => {
              const diasDesdeIngresso = Math.floor((new Date().getTime() - new Date(voluntario.created_at).getTime()) / (1000 * 60 * 60 * 24));
              const isNovo = diasDesdeIngresso <= 30;

              return (
                <Card 
                  key={voluntario.id}
                  className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-l-4 group"
                  style={{
                    borderLeftColor: voluntario.ativo ? '#10b981' : '#ef4444'
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                          {voluntario.nome}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={voluntario.ativo ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                            {voluntario.ativo ? '✅ Ativo' : '❌ Inativo'}
                          </Badge>
                          {isNovo && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-pulse">
                              🆕 NOVO
                            </Badge>
                          )}
                          {voluntario.nivel && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                              ⭐ {voluntario.nivel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Email */}
                    {voluntario.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{voluntario.email}</span>
                      </div>
                    )}

                    {/* Telefone */}
                    {voluntario.telefone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{voluntario.telefone}</span>
                      </div>
                    )}

                    {/* Morada */}
                    {voluntario.morada && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{voluntario.morada}</span>
                      </div>
                    )}

                    {/* Data de Ingresso */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {(() => {
                          const dias = Math.floor((new Date().getTime() - new Date(voluntario.data_ingresso).getTime()) / (1000 * 60 * 60 * 24));
                          if (dias === 0) return 'Entrou hoje';
                          if (dias === 1) return 'Há 1 dia';
                          if (dias < 30) return `Há ${dias} dias`;
                          const meses = Math.floor(dias / 30);
                          return meses === 1 ? 'Há 1 mês' : `Há ${meses} meses`;
                        })()}
                      </span>
                    </div>

                    {/* Pontos */}
                    {voluntario.pontos_total !== undefined && voluntario.pontos_total > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="h-4 w-4 mr-2 text-yellow-500" />
                        <span className="font-semibold text-yellow-700">{voluntario.pontos_total} pontos</span>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Link to={`/voluntario/${voluntario.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Link to={`/voluntarios/editar/${voluntario.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredVoluntarios.length)} de {filteredVoluntarios.length} voluntários
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default GestaoVoluntariosUnificada;
