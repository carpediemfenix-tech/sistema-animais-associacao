import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Target,
  Shield,
  Heart,
  Megaphone,
  Clipboard,
  Activity,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  FileText,
  Star,
  Award,
  BarChart3,
  Euro,
  UserPlus,
  User,
  PawPrint,
  TrendingUp,
  Calendar as CalendarIcon,
  Archive,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Bell,
  Zap,
  Layers,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Trophy,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces otimizadas
interface Missao {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local_principal: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  orcamento_previsto: number;
  status: 'rascunho' | 'planejada' | 'ativa' | 'pausada' | 'concluida' | 'cancelada';
  created_at: string;
  updated_at: string;
}

interface FiltrosMissoes {
  busca: string;
  status: string;
  prioridade: string;
  dataInicio: string;
  dataFim: string;
  ordenacao: string;
}

interface EstatisticasMissoes {
  total: number;
  ativas: number;
  concluidas: number;
  canceladas: number;
  orcamentoTotal: number;
  orcamentoGasto: number;
}

const ModuloMissoesOtimizado = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados principais
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Estados para filtros e busca
  const [filtros, setFiltros] = useState<FiltrosMissoes>({
    busca: '',
    status: 'todas',
    prioridade: 'todas',
    dataInicio: '',
    dataFim: '',
    ordenacao: 'recentes'
  });

  // Estados para estatísticas
  const [estatisticas, setEstatisticas] = useState<EstatisticasMissoes>({
    total: 0,
    ativas: 0,
    concluidas: 0,
    canceladas: 0,
    orcamentoTotal: 0,
    orcamentoGasto: 0
  });

  // Estados para diálogos
  const [missaoDialogOpen, setMissaoDialogOpen] = useState(false);
  const [editingMissao, setEditingMissao] = useState<Missao | null>(null);

  // Estados para formulários
  const [missaoForm, setMissaoForm] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local_principal: '',
    prioridade: 'media',
    orcamento_previsto: '',
    status: 'rascunho'
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters();
  }, [filtros]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadMissoes(),
        loadEstatisticas()
      ]);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
      toast({
        title: "Erro ao carregar dados",
        description: "Erro inesperado ao carregar dados do módulo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMissoes = async () => {
    console.log('🎯 Carregando missões...');
    
    const { data, error } = await supabase
      .from('missoes_2025_12_29_07_00')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('❌ Erro ao carregar missões:', error);
      throw error;
    }
    
    console.log('✅ Missões carregadas:', data?.length || 0);
    setMissoes(data || []);
  };

  const loadEstatisticas = async () => {
    try {
      const { data, error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .select('status, orcamento_previsto');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        ativas: data?.filter(m => m.status === 'ativa').length || 0,
        concluidas: data?.filter(m => m.status === 'concluida').length || 0,
        canceladas: data?.filter(m => m.status === 'cancelada').length || 0,
        orcamentoTotal: data?.reduce((sum, m) => sum + (m.orcamento_previsto || 0), 0) || 0,
        orcamentoGasto: 0 // Será calculado quando tivermos dados de gastos
      };

      setEstatisticas(stats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  const applyFilters = () => {
    // Implementar filtros em tempo real
    // Por enquanto, apenas recarregar dados
  };

  // Criar nova missão
  const handleCreateMissao = async () => {
    try {
      if (!missaoForm.titulo || !missaoForm.data_inicio) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha pelo menos o título e data de início",
          variant: "destructive",
        });
        return;
      }

      const missaoData = {
        codigo: missaoForm.codigo || `MISS-${Date.now()}`,
        titulo: missaoForm.titulo,
        descricao: missaoForm.descricao,
        data_inicio: missaoForm.data_inicio,
        data_fim: missaoForm.data_fim,
        local_principal: missaoForm.local_principal,
        prioridade: missaoForm.prioridade,
        orcamento_previsto: parseFloat(missaoForm.orcamento_previsto) || 0,
        status: missaoForm.status
      };

      console.log('📝 Criando missão:', missaoData);

      const { error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .insert(missaoData);

      if (error) throw error;

      toast({
        title: "Missão criada",
        description: "Missão criada com sucesso!",
      });

      setMissaoDialogOpen(false);
      resetMissaoForm();
      await loadData();
    } catch (error: any) {
      console.error('❌ Erro ao criar missão:', error);
      toast({
        title: "Erro ao criar missão",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const resetMissaoForm = () => {
    setMissaoForm({
      codigo: '',
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      local_principal: '',
      prioridade: 'media',
      orcamento_previsto: '',
      status: 'rascunho'
    });
  };

  // Obter badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'rascunho': { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Edit, label: 'Rascunho' },
      'planejada': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Calendar, label: 'Planejada' },
      'ativa': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: PlayCircle, label: 'Ativa' },
      'pausada': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pausada' },
      'concluida': { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Concluída' },
      'cancelada': { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelada' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.rascunho;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  // Obter badge de prioridade
  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeConfig = {
      'baixa': { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
      'media': { color: 'bg-blue-100 text-blue-800', label: 'Média' },
      'alta': { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
      'critica': { color: 'bg-red-100 text-red-800', label: 'Crítica' }
    };

    const config = prioridadeConfig[prioridade as keyof typeof prioridadeConfig] || prioridadeConfig.media;

    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Target className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando módulo de missões...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dados</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* PageActionBar */}
        <PageActionBar
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Módulo de Missões' }
          ]}
          primaryActions={
            <>
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => setMissaoDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Missão
              </Button>
            </>
          }
          secondaryActions={[
            {
              label: 'Sistema de Pontos',
              onClick: () => navigate('/dashboard-pontos'),
              icon: <Trophy className="h-4 w-4" />
            }
          ]}
          showBackToDashboard={false}
        />

        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Módulo de Missões
          </h1>
          <p className="text-gray-600">
            Gestão completa e inteligente de missões da associação
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Missões</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Missões Ativas</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.ativas}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídas</p>
                  <p className="text-3xl font-bold text-emerald-600">{estatisticas.concluidas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orçamento Total</p>
                  <p className="text-3xl font-bold text-purple-600">€{estatisticas.orcamentoTotal.toFixed(0)}</p>
                </div>
                <Euro className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="busca">Buscar</Label>
                <Input
                  id="busca"
                  placeholder="Título, código ou descrição..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="planejada">Planejada</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select value={filtros.prioridade} onValueChange={(value) => setFiltros(prev => ({ ...prev, prioridade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ordenação</Label>
                <Select value={filtros.ordenacao} onValueChange={(value) => setFiltros(prev => ({ ...prev, ordenacao: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recentes">Mais Recentes</SelectItem>
                    <SelectItem value="antigas">Mais Antigas</SelectItem>
                    <SelectItem value="prioridade">Prioridade</SelectItem>
                    <SelectItem value="data_inicio">Data de Início</SelectItem>
                    <SelectItem value="orcamento">Orçamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Missões */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Clipboard className="h-5 w-5" />
                <span>Missões ({missoes.length})</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {missoes.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma missão encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece criando a primeira missão da sua associação.
                </p>
                <Button onClick={() => setMissaoDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Missão
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missoes.map((missao) => (
                    <TableRow key={missao.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {missao.codigo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{missao.titulo}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {missao.descricao}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(missao.status)}
                      </TableCell>
                      <TableCell>
                        {getPrioridadeBadge(missao.prioridade)}
                      </TableCell>
                      <TableCell>
                        {new Date(missao.data_inicio).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm truncate max-w-xs">
                            {missao.local_principal || 'Não definido'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Euro className="h-3 w-3 text-gray-400" />
                          <span>{missao.orcamento_previsto?.toFixed(2) || '0.00'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/missao/${missao.id}`)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            title="Ver detalhes"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/missao/${missao.id}/participacoes`)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            title="Participações"
                          >
                            <Users className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            title="Editar missão"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para Nova/Editar Missão */}
      <Dialog open={missaoDialogOpen} onOpenChange={setMissaoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMissao ? 'Editar Missão' : 'Nova Missão'}
            </DialogTitle>
            <DialogDescription>
              {editingMissao ? 'Edite os dados da missão' : 'Crie uma nova missão para a associação'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={missaoForm.codigo}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ex: MISS-001 (opcional)"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={missaoForm.status} onValueChange={(value) => setMissaoForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="planejada">Planejada</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={missaoForm.titulo}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título da missão"
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={missaoForm.descricao}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição detalhada da missão"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={missaoForm.data_inicio}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, data_inicio: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={missaoForm.data_fim}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, data_fim: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="local_principal">Local Principal</Label>
              <Input
                id="local_principal"
                value={missaoForm.local_principal}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, local_principal: e.target.value }))}
                placeholder="Local onde a missão será realizada"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Prioridade</Label>
                <Select value={missaoForm.prioridade} onValueChange={(value) => setMissaoForm(prev => ({ ...prev, prioridade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orcamento_previsto">Orçamento Previsto (€)</Label>
                <Input
                  id="orcamento_previsto"
                  type="number"
                  step="0.01"
                  value={missaoForm.orcamento_previsto}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, orcamento_previsto: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setMissaoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMissao}>
              {editingMissao ? 'Atualizar' : 'Criar'} Missão
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default ModuloMissoesOtimizado;