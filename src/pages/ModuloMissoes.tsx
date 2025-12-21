import React, { useState, useEffect } from 'react';
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
  Archive
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import VoluntarioSelector from "@/components/VoluntarioSelector";

// Interfaces
interface TipoMissao {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  cor: string;
  pontos_base: number;
}

interface Missao {
  id: string;
  codigo: string;
  tipo_missao_id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local_principal: string;
  animal_id?: string;
  prioridade: string;
  orcamento_previsto: number;
  pontos_totais: number;
  responsavel_id?: string;
  status: string;
  custo_real: number;
  min_participantes: number;
  created_at: string;
  updated_at: string;
  ativo: boolean;
  arquivado: boolean;
}

interface ParticipacaoMissao {
  id: string;
  missao_id: string;
  voluntario_id: string;
  funcao: string;
  data_participacao: string;
  data_fim?: string;
  horas_dedicadas: number;
  pontos_atribuidos: number;
  status_participacao: string;
  observacoes?: string;
}

const ModuloMissoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [tiposMissoes, setTiposMissoes] = useState<TipoMissao[]>([]);
  const [participacoes, setParticipacoes] = useState<ParticipacaoMissao[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');

  // Estados para diálogos
  const [missaoDialogOpen, setMissaoDialogOpen] = useState(false);
  const [editingMissao, setEditingMissao] = useState<Missao | null>(null);

  // Estados para formulários
  const [missaoForm, setMissaoForm] = useState({
    tipo_missao_id: '',
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local_principal: '',
    prioridade: 'media',
    orcamento_previsto: '0'
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados do módulo...');
      
      await Promise.all([
        loadTiposMissoes(),
        loadMissoes(),
        loadParticipacoes(),
        loadVoluntarios()
      ]);
      
      console.log('✅ Todos os dados carregados');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Erro inesperado ao carregar dados do módulo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTiposMissoes = async () => {
    try {
      console.log('📋 Carregando tipos de missões...');
      
      const { data, error } = await supabase
        .from('tipos_missoes_2025_12_18_14_15')
        .select('*')
        .eq('ativo', true)
        .order('categoria, nome');

      if (error) {
        console.error('❌ Erro ao carregar tipos de missões:', error);
        throw error;
      }
      
      console.log('✅ Tipos de missões carregados:', data?.length || 0);
      setTiposMissoes(data || []);
    } catch (error) {
      console.error('❌ Erro em loadTiposMissoes:', error);
      // Fallback para dados mock
      setTiposMissoes([
        { id: '1', codigo: 'EVT001', nome: 'Evento de Adoção', categoria: 'evento', cor: '#10B981', pontos_base: 15 },
        { id: '2', codigo: 'RES001', nome: 'Missão de Resgate', categoria: 'resgate', cor: '#EF4444', pontos_base: 25 },
        { id: '3', codigo: 'CAM001', nome: 'Campanha de Sensibilização', categoria: 'campanha', cor: '#8B5CF6', pontos_base: 20 }
      ]);
    }
  };

  const loadMissoes = async () => {
    try {
      console.log('🎯 Carregando missões...');
      
      const { data, error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .select('*')
        .eq('arquivado', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao carregar missões:', error);
        throw error;
      }
      
      console.log('✅ Missões carregadas:', data?.length || 0);
      setMissoes(data || []);
    } catch (error) {
      console.error('❌ Erro em loadMissoes:', error);
      setMissoes([]);
    }
  };

  const loadParticipacoes = async () => {
    try {
      console.log('👥 Carregando participações...');
      
      const { data, error } = await supabase
        .from('participacoes_missoes_2025_12_18_14_15')
        .select('*')
        .order('data_participacao', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Erro ao carregar participações:', error);
        throw error;
      }
      
      console.log('✅ Participações carregadas:', data?.length || 0);
      setParticipacoes(data || []);
    } catch (error) {
      console.error('❌ Erro em loadParticipacoes:', error);
      setParticipacoes([]);
    }
  };

  const loadVoluntarios = async () => {
    try {
      console.log('🙋 Carregando voluntários...');
      
      const { data, error } = await supabase
        .from('voluntarios')
        .select('id, nome, display_name, email')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar voluntários:', error);
        throw error;
      }
      
      console.log('✅ Voluntários carregados:', data?.length || 0);
      setVoluntarios(data || []);
    } catch (error) {
      console.error('❌ Erro em loadVoluntarios:', error);
      setVoluntarios([]);
    }
  };

  // Gerar código sequencial
  const generateMissionCode = async () => {
    try {
      const currentYear = new Date().getFullYear().toString().slice(-2);
      
      const { data: lastMission } = await supabase
        .from('missoes_2025_12_18_14_15')
        .select('codigo')
        .like('codigo', `MIS${currentYear}%`)
        .order('codigo', { ascending: false })
        .limit(1);
      
      let nextNumber = 1;
      if (lastMission && lastMission.length > 0) {
        const lastCode = lastMission[0].codigo;
        const lastNumber = parseInt(lastCode.slice(-3));
        nextNumber = lastNumber + 1;
      }
      
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      return `MIS${currentYear}${formattedNumber}`;
    } catch (error) {
      console.error('Erro ao gerar código da missão:', error);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const timestamp = Date.now().toString().slice(-3);
      return `MIS${currentYear}${timestamp}`;
    }
  };

  // Criar missão
  const handleCreateMissao = async () => {
    try {
      console.log('➕ Criando nova missão...');
      
      const codigo = await generateMissionCode();
      console.log('🏷️ Código gerado:', codigo);
      const tipoMissao = tiposMissoes.find(t => t.id === missaoForm.tipo_missao_id);
      const pontos_totais = tipoMissao?.pontos_base || 10;

      const missaoData = {
        codigo,
        tipo_missao_id: missaoForm.tipo_missao_id,
        titulo: missaoForm.titulo,
        descricao: missaoForm.descricao,
        data_inicio: missaoForm.data_inicio,
        data_fim: missaoForm.data_fim,
        local_principal: missaoForm.local_principal,
        prioridade: missaoForm.prioridade,
        orcamento_previsto: parseFloat(missaoForm.orcamento_previsto) || 0,
        pontos_totais,
        responsavel_id: voluntarios[0]?.id || null,
        status: 'pendente',
        custo_real: 0,
        min_participantes: 1,
        ativo: true,
        arquivado: false
      };

      const { error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .insert(missaoData);

      if (error) throw error;

      toast({
        title: "Missão criada",
        description: "Nova missão criada com sucesso!",
      });

      setMissaoDialogOpen(false);
      resetMissaoForm();
      await loadMissoes();
    } catch (error: any) {
      console.error('❌ Erro ao criar missão:', error);
      toast({
        title: "Erro ao criar missão",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Atualizar missão
  const handleUpdateMissao = async () => {
    if (!editingMissao) return;

    try {
      console.log('✏️ Atualizando missão:', editingMissao.id);
      
      const missaoData = {
        tipo_missao_id: missaoForm.tipo_missao_id,
        titulo: missaoForm.titulo,
        descricao: missaoForm.descricao,
        data_inicio: missaoForm.data_inicio,
        data_fim: missaoForm.data_fim,
        local_principal: missaoForm.local_principal,
        prioridade: missaoForm.prioridade,
        orcamento_previsto: parseFloat(missaoForm.orcamento_previsto) || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .update(missaoData)
        .eq('id', editingMissao.id);

      if (error) throw error;

      toast({
        title: "Missão atualizada",
        description: "Missão atualizada com sucesso!",
      });

      setMissaoDialogOpen(false);
      setEditingMissao(null);
      resetMissaoForm();
      await loadMissoes();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar missão:', error);
      toast({
        title: "Erro ao atualizar missão",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Eliminar missão
  const handleDeleteMissao = async (missaoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta missão?')) return;

    try {
      const { error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .delete()
        .eq('id', missaoId);

      if (error) throw error;

      toast({
        title: "Missão eliminada",
        description: "Missão eliminada com sucesso!",
      });

      await loadMissoes();
    } catch (error: any) {
      console.error('❌ Erro ao eliminar missão:', error);
      toast({
        title: "Erro ao eliminar missão",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Reset formulário
  const resetMissaoForm = () => {
    setMissaoForm({
      tipo_missao_id: '',
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      local_principal: '',
      prioridade: 'media',
      orcamento_previsto: '0'
    });
  };

  // Abrir diálogo
  const openMissaoDialog = (missao?: Missao) => {
    if (missao) {
      setEditingMissao(missao);
      setMissaoForm({
        tipo_missao_id: missao.tipo_missao_id,
        titulo: missao.titulo,
        descricao: missao.descricao || '',
        data_inicio: missao.data_inicio,
        data_fim: missao.data_fim || '',
        local_principal: missao.local_principal,
        prioridade: missao.prioridade,
        orcamento_previsto: missao.orcamento_previsto.toString()
      });
    } else {
      setEditingMissao(null);
      resetMissaoForm();
    }
    setMissaoDialogOpen(true);
  };

  // Badges
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      'em_curso': { color: 'bg-blue-100 text-blue-800', icon: PlayCircle, label: 'Em Curso' },
      'concluida_sucesso': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluída' },
      'concluida_insucesso': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Insucesso' },
      'arquivada': { color: 'bg-gray-100 text-gray-800', icon: Archive, label: 'Arquivada' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

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

  // Filtros
  const filteredMissoes = missoes.filter(missao => {
    const matchesSearch = !searchTerm || 
      missao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missao.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || missao.status === filterStatus;
    const matchesTipo = filterTipo === 'todos' || missao.tipo_missao_id === filterTipo;

    return matchesSearch && matchesStatus && matchesTipo;
  });

  // Estatísticas
  const estatisticas = {
    total_missoes: missoes.length,
    missoes_ativas: missoes.filter(m => m.status === 'em_curso').length,
    missoes_pendentes: missoes.filter(m => m.status === 'pendente').length,
    missoes_concluidas: missoes.filter(m => m.status === 'concluida_sucesso').length,
    total_participacoes: participacoes.length,
    voluntarios_ativos: voluntarios.length,
    animais_disponiveis: animais.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <Target className="h-10 w-10 text-blue-600 mr-4" />
              Módulo de Missões
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de missões, voluntários e recursos</p>
          </div>
          
          <Button 
            onClick={() => openMissaoDialog()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Missão
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Missões</p>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.total_missoes}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Curso</p>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.missoes_ativas}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participações</p>
                  <p className="text-3xl font-bold text-purple-600">{estatisticas.total_participacoes}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Voluntários</p>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas.voluntarios_ativos}</p>
                </div>
                <User className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros e Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Título ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_curso">Em Curso</SelectItem>
                    <SelectItem value="concluida_sucesso">Concluída</SelectItem>
                    <SelectItem value="concluida_insucesso">Insucesso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo</Label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {tiposMissoes.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('todos');
                    setFilterTipo('todos');
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Missões */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Missões ({filteredMissoes.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMissoes.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma missão encontrada</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'todos' || filterTipo !== 'todos' 
                    ? 'Tente ajustar os filtros de pesquisa'
                    : 'Comece criando a primeira missão'
                  }
                </p>
                {!searchTerm && filterStatus === 'todos' && filterTipo === 'todos' && (
                  <Button onClick={() => openMissaoDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Missão
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Missão</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMissoes.map((missao) => {
                    const tipoMissao = tiposMissoes.find(t => t.id === missao.tipo_missao_id);
                    
                    return (
                      <TableRow key={missao.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-900">{missao.titulo}</p>
                            <p className="text-sm text-gray-600">{missao.codigo}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tipoMissao ? (
                            <Badge style={{ backgroundColor: tipoMissao.cor, color: 'white' }}>
                              {tipoMissao.nome}
                            </Badge>
                          ) : (
                            <span className="text-gray-500">Tipo não encontrado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(missao.data_inicio).toLocaleDateString('pt-PT')}
                            </div>
                            {missao.data_fim && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(missao.data_fim).toLocaleDateString('pt-PT')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(missao.status)}
                        </TableCell>
                        <TableCell>
                          {getPrioridadeBadge(missao.prioridade)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600">
                              <Euro className="h-3 w-3 mr-1" />
                              <span>€{missao.orcamento_previsto.toFixed(2)}</span>
                            </div>
                            {missao.custo_real > 0 && (
                              <p className="text-gray-600">Real: €{missao.custo_real.toFixed(2)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
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
                              onClick={() => openMissaoDialog(missao)}
                              className="h-8 w-8 p-0"
                              title="Editar missão"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMissao(missao.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Nova/Editar Missão */}
      <Dialog open={missaoDialogOpen} onOpenChange={setMissaoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>{editingMissao ? 'Editar Missão' : 'Nova Missão'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingMissao ? 'Atualize as informações da missão' : 'Crie uma nova missão para os voluntários'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            editingMissao ? handleUpdateMissao() : handleCreateMissao();
          }} className="space-y-4">
            <div>
              <Label htmlFor="tipo_missao_id">Tipo de Missão *</Label>
              <Select 
                value={missaoForm.tipo_missao_id} 
                onValueChange={(value) => setMissaoForm(prev => ({ ...prev, tipo_missao_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposMissoes.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome} ({tipo.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="titulo">Título da Missão *</Label>
              <Input
                id="titulo"
                value={missaoForm.titulo}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Evento de Adoção no Parque Central"
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={missaoForm.descricao}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva os detalhes da missão..."
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
                <Label htmlFor="data_fim">Data de Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={missaoForm.data_fim}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, data_fim: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="local_principal">Local Principal *</Label>
              <Input
                id="local_principal"
                value={missaoForm.local_principal}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, local_principal: e.target.value }))}
                placeholder="Ex: Parque Central, Rua das Flores, 123"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select 
                  value={missaoForm.prioridade} 
                  onValueChange={(value) => setMissaoForm(prev => ({ ...prev, prioridade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                  min="0"
                  value={missaoForm.orcamento_previsto}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, orcamento_previsto: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setMissaoDialogOpen(false);
                  setEditingMissao(null);
                  resetMissaoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingMissao ? 'Atualizar Missão' : 'Criar Missão'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default ModuloMissoes;