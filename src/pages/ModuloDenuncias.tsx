import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PageActionBar from '@/components/PageActionBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Archive,
  BarChart3,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';

interface Denuncia {
  id: string;
  codigo: string;
  data_denuncia: string;
  local_encontrado: string;
  descricao_situacao: string;
  status_denuncia: string;
  prioridade: string;
  quantidade_animais: number;
  canal_denuncia: string;
  created_at: string;
}

interface Estatisticas {
  total: number;
  novas: number;
  em_andamento: number;
  concluidas: number;
  arquivadas: number;
}

const ModuloDenuncias: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total: 0,
    novas: 0,
    em_andamento: 0,
    concluidas: 0,
    arquivadas: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState('todas');

  // Verificar permissões
  useEffect(() => {
    if (!hasPermission('admin')) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem acessar o módulo de denúncias.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
  }, [hasPermission, navigate]);

  // Carregar dados
  useEffect(() => {
    if (hasPermission('admin')) {
      loadDenuncias();
      loadEstatisticas();
    }
  }, [hasPermission]);

  const loadDenuncias = async () => {
    try {
      console.log('🔍 [DENUNCIAS] Carregando denúncias...');
      
      let query = supabase
        .from('denuncias_2025_12_29_23_00')
        .select('*')
        .eq('arquivada', false)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ [DENUNCIAS] Erro ao carregar:', error);
        throw error;
      }

      console.log('✅ [DENUNCIAS] Denúncias carregadas:', data?.length || 0);
      setDenuncias(data || []);
    } catch (error) {
      console.error('❌ [DENUNCIAS] Erro:', error);
      toast({
        title: "Erro ao carregar denúncias",
        description: "Não foi possível carregar a lista de denúncias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      console.log('📊 [DENUNCIAS] Carregando estatísticas...');
      
      const { data, error } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .select('status_denuncia, arquivada');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        novas: data?.filter(d => d.status_denuncia === 'nova' && !d.arquivada).length || 0,
        em_andamento: data?.filter(d => d.status_denuncia === 'em_andamento' && !d.arquivada).length || 0,
        concluidas: data?.filter(d => d.status_denuncia === 'concluida' && !d.arquivada).length || 0,
        arquivadas: data?.filter(d => d.arquivada).length || 0
      };

      console.log('📊 [DENUNCIAS] Estatísticas:', stats);
      setEstatisticas(stats);
    } catch (error) {
      console.error('❌ [DENUNCIAS] Erro ao carregar estatísticas:', error);
    }
  };

  // Filtrar denúncias
  const denunciasFiltradas = denuncias.filter(denuncia => {
    const matchSearch = searchTerm === '' || 
      denuncia.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.local_encontrado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.descricao_situacao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter === 'todos' || denuncia.status_denuncia === statusFilter;
    const matchPrioridade = prioridadeFilter === 'todas' || denuncia.prioridade === prioridadeFilter;
    
    return matchSearch && matchStatus && matchPrioridade;
  });

  // Funções de ação
  const handleNovaDenuncia = () => {
    navigate('/wizard-denuncia');
  };

  const handleVerDenuncia = (id: string) => {
    navigate(`/denuncia/${id}`);
  };

  const handleEditarDenuncia = (codigo: string) => {
    navigate(`/denuncia/${codigo}/editar`);
  };

  // Componentes de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'nova': { label: 'Nova', variant: 'destructive' as const, icon: AlertTriangle },
      'em_andamento': { label: 'Em Andamento', variant: 'default' as const, icon: Clock },
      'concluida': { label: 'Concluída', variant: 'secondary' as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.nova;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      'baixa': { label: 'Baixa', className: 'bg-green-100 text-green-800' },
      'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
      'alta': { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
      'urgente': { label: 'Urgente', className: 'bg-red-100 text-red-800' }
    };

    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.normal;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando módulo de denúncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Gestão de Denúncias', href: '/modulo-denuncias' }
        ]}
        primaryActions={
          <Button onClick={handleNovaDenuncia} variant="destructive">
            <Plus className="h-4 w-4 mr-2" />
            Nova Denúncia
          </Button>
        }
        secondaryActions={
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast({ title: 'Em desenvolvimento', description: 'Funcionalidade em desenvolvimento.' })}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/denuncias-arquivadas')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Arquivadas
            </Button>
          </>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* Título e Descrição */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚨 Central de Operações</h1>
          <p className="text-gray-600">Gestão completa e profissional de denúncias de maus-tratos animais</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total}</div>
              <p className="text-xs text-muted-foreground">Denúncias registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estatisticas.novas}</div>
              <p className="text-xs text-muted-foreground">Aguardando ação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{estatisticas.em_andamento}</div>
              <p className="text-xs text-muted-foreground">Em processamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</div>
              <p className="text-xs text-muted-foreground">Finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arquivadas</CardTitle>
              <Archive className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{estatisticas.arquivadas}</div>
              <p className="text-xs text-muted-foreground">No arquivo</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por código, local ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="nova">Novas</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluídas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Prioridades</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                  setPrioridadeFilter('todas');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Denúncias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Denúncias Ativas ({denunciasFiltradas.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {denunciasFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'todos' || prioridadeFilter !== 'todas' 
                    ? 'Nenhuma denúncia encontrada com os filtros aplicados.'
                    : 'Nenhuma denúncia registrada ainda.'
                  }
                </p>
                <Button onClick={handleNovaDenuncia} variant="destructive">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Nova Denúncia
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {denunciasFiltradas.map((denuncia) => (
                  <div key={denuncia.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{denuncia.codigo}</h3>
                          {getStatusBadge(denuncia.status_denuncia)}
                          {getPrioridadeBadge(denuncia.prioridade)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(denuncia.data_denuncia).toLocaleDateString('pt-PT')}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {denuncia.local_encontrado}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {denuncia.quantidade_animais} animal(is)
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {denuncia.descricao_situacao}
                        </p>
                        
                        <div className="text-xs text-gray-500">
                          Canal: {denuncia.canal_denuncia} • 
                          Registrada em {new Date(denuncia.created_at).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerDenuncia(denuncia.codigo)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarDenuncia(denuncia.codigo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModuloDenuncias;