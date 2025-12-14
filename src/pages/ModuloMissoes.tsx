import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Truck,
  Heart,
  Stethoscope,
  Brush,
  Megaphone,
  Clipboard,
  Scissors,
  GraduationCap,
  Home,
  Gift,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Package,
  FileText,
  TrendingUp,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface TipoMissao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  categoria: string;
  requer_equipamentos: boolean;
  requer_veiculo: boolean;
  ativo: boolean;
}

interface Missao {
  id: string;
  codigo: string;
  tipo_missao_id: string;
  titulo: string;
  descricao: string;
  objetivo: string;
  data_inicio: string;
  data_fim?: string;
  hora_inicio?: string;
  hora_fim?: string;
  local_principal: string;
  locais_adicionais?: string[];
  animal_id?: string;
  prioridade: string;
  status: string;
  orcamento_previsto: number;
  custo_real: number;
  observacoes?: string;
  resultado?: string;
  criado_por: string;
  responsavel_id: string;
  tipos_missoes_2025_12_13_09_00?: TipoMissao;
  animais?: { nome: string };
  voluntarios?: { nome: string };
}

interface ParticipacaoMissao {
  id: string;
  missao_id: string;
  voluntario_id: string;
  funcao: string;
  horas_dedicadas: number;
  data_participacao: string;
  hora_inicio?: string;
  hora_fim?: string;
  observacoes?: string;
  avaliacao?: number;
  comentario_avaliacao?: string;
  voluntarios?: { nome: string };
  missoes_2025_12_13_09_00?: { titulo: string };
}

interface EstatisticasMissoes {
  total_missoes: number;
  missoes_ativas: number;
  missoes_concluidas: number;
  total_voluntarios_participantes: number;
  total_horas_dedicadas: number;
  custo_total_missoes: number;
}

const ModuloMissoes = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  // Estados para dados
  const [estatisticas, setEstatisticas] = useState<EstatisticasMissoes>({
    total_missoes: 0,
    missoes_ativas: 0,
    missoes_concluidas: 0,
    total_voluntarios_participantes: 0,
    total_horas_dedicadas: 0,
    custo_total_missoes: 0
  });
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [tiposMissoes, setTiposMissoes] = useState<TipoMissao[]>([]);
  const [participacoes, setParticipacoes] = useState<ParticipacaoMissao[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [animais, setAnimais] = useState<any[]>([]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState('');

  // Estados para diálogos
  const [missaoDialogOpen, setMissaoDialogOpen] = useState(false);
  const [participacaoDialogOpen, setParticipacaoDialogOpen] = useState(false);
  const [editingMissao, setEditingMissao] = useState<Missao | null>(null);
  const [selectedMissao, setSelectedMissao] = useState<Missao | null>(null);

  // Estados para formulários
  const [missaoForm, setMissaoForm] = useState({
    tipo_missao_id: '',
    titulo: '',
    descricao: '',
    objetivo: '',
    data_inicio: '',
    data_fim: '',
    hora_inicio: '',
    hora_fim: '',
    local_principal: '',
    animal_id: '',
    prioridade: 'media',
    orcamento_previsto: '0'
  });

  const [participacaoForm, setParticipacaoForm] = useState({
    voluntario_id: '',
    funcao: '',
    data_participacao: '',
    hora_inicio: '',
    hora_fim: '',
    observacoes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEstatisticas(),
        loadMissoes(),
        loadTiposMissoes(),
        loadParticipacoes(),
        loadVoluntarios(),
        loadAnimais()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados das missões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    const { data: missoesData } = await supabase
      .from('missoes_2025_12_13_09_00')
      .select('*');

    const { data: participacoesData } = await supabase
      .from('participacoes_missoes_2025_12_13_09_00')
      .select('horas_dedicadas, voluntario_id');

    if (missoesData) {
      const totalMissoes = missoesData.length;
      const missoesAtivas = missoesData.filter(m => ['planejada', 'em_andamento'].includes(m.status)).length;
      const missoesConcluidas = missoesData.filter(m => m.status === 'concluida').length;
      const custoTotal = missoesData.reduce((sum, m) => sum + (m.custo_real || 0), 0);

      const voluntariosUnicos = new Set(participacoesData?.map(p => p.voluntario_id) || []).size;
      const totalHoras = participacoesData?.reduce((sum, p) => sum + (p.horas_dedicadas || 0), 0) || 0;

      setEstatisticas({
        total_missoes: totalMissoes,
        missoes_ativas: missoesAtivas,
        missoes_concluidas: missoesConcluidas,
        total_voluntarios_participantes: voluntariosUnicos,
        total_horas_dedicadas: totalHoras,
        custo_total_missoes: custoTotal
      });
    }
  };

  const loadMissoes = async () => {
    const { data } = await supabase
      .from('missoes_2025_12_13_09_00')
      .select(`
        *,
        tipos_missoes_2025_12_13_09_00(nome, cor, icone, categoria),
        animais(nome),
        voluntarios(nome)
      `)
      .order('data_inicio', { ascending: false });

    setMissoes(data || []);
  };

  const loadTiposMissoes = async () => {
    const { data } = await supabase
      .from('tipos_missoes_2025_12_13_09_00')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    setTiposMissoes(data || []);
  };

  const loadParticipacoes = async () => {
    const { data } = await supabase
      .from('participacoes_missoes_2025_12_13_09_00')
      .select(`
        *,
        voluntarios(nome),
        missoes_2025_12_13_09_00(titulo)
      `)
      .order('data_participacao', { ascending: false });

    setParticipacoes(data || []);
  };

  const loadVoluntarios = async () => {
    const { data } = await supabase
      .from('voluntarios')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome');

    setVoluntarios(data || []);
  };

  const loadAnimais = async () => {
    const { data } = await supabase
      .from('animais')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome');

    setAnimais(data || []);
  };

  const handleCreateMissao = async () => {
    try {
      const { error } = await supabase
        .from('missoes_2025_12_13_09_00')
        .insert([{
          ...missaoForm,
          codigo: `MIS${Date.now().toString().slice(-6)}`,
          orcamento_previsto: parseFloat(missaoForm.orcamento_previsto),
          criado_por: (await supabase.auth.getUser()).data.user?.id,
          responsavel_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Missão criada",
        description: "Nova missão criada com sucesso",
      });

      setMissaoDialogOpen(false);
      resetMissaoForm();
      loadData();
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      toast({
        title: "Erro ao criar missão",
        description: "Não foi possível criar a missão",
        variant: "destructive",
      });
    }
  };

  const handleAddParticipacao = async () => {
    if (!selectedMissao) return;

    try {
      const { error } = await supabase
        .from('participacoes_missoes_2025_12_13_09_00')
        .insert([{
          ...participacaoForm,
          missao_id: selectedMissao.id
        }]);

      if (error) throw error;

      toast({
        title: "Participação adicionada",
        description: "Voluntário adicionado à missão com sucesso",
      });

      setParticipacaoDialogOpen(false);
      resetParticipacaoForm();
      loadData();
    } catch (error) {
      console.error('Erro ao adicionar participação:', error);
      toast({
        title: "Erro ao adicionar participação",
        description: "Não foi possível adicionar o voluntário à missão",
        variant: "destructive",
      });
    }
  };

  const resetMissaoForm = () => {
    setMissaoForm({
      tipo_missao_id: '',
      titulo: '',
      descricao: '',
      objetivo: '',
      data_inicio: '',
      data_fim: '',
      hora_inicio: '',
      hora_fim: '',
      local_principal: '',
      animal_id: '',
      prioridade: 'media',
      orcamento_previsto: '0'
    });
    setEditingMissao(null);
  };

  const resetParticipacaoForm = () => {
    setParticipacaoForm({
      voluntario_id: '',
      funcao: '',
      data_participacao: '',
      hora_inicio: '',
      hora_fim: '',
      observacoes: ''
    });
  };

  const getIconeComponent = (icone: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      shield: <Shield className="h-4 w-4" />,
      truck: <Truck className="h-4 w-4" />,
      syringe: <Stethoscope className="h-4 w-4" />,
      broom: <Brush className="h-4 w-4" />,
      megaphone: <Megaphone className="h-4 w-4" />,
      clipboard: <Clipboard className="h-4 w-4" />,
      scissors: <Scissors className="h-4 w-4" />,
      'graduation-cap': <GraduationCap className="h-4 w-4" />,
      home: <Home className="h-4 w-4" />,
      gift: <Gift className="h-4 w-4" />,
      target: <Target className="h-4 w-4" />
    };
    return iconMap[icone] || <Target className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejada': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'em_andamento': return <PlayCircle className="h-4 w-4 text-orange-600" />;
      case 'concluida': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelada': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-orange-100 text-orange-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-gray-100 text-gray-800';
      case 'media': return 'bg-blue-100 text-blue-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  // Filtrar missões
  const missoesFiltradas = missoes.filter(missao => {
    const matchSearch = missao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       missao.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       missao.local_principal.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = !filterStatus || filterStatus === 'todos' || missao.status === filterStatus;
    const matchTipo = !filterTipo || filterTipo === 'todos' || missao.tipo_missao_id === filterTipo;
    const matchPrioridade = !filterPrioridade || filterPrioridade === 'todas' || missao.prioridade === filterPrioridade;

    return matchSearch && matchStatus && matchTipo && matchPrioridade;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-lg text-gray-600">Carregando módulo de missões...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Módulo de Missões</h1>
            <p className="text-gray-600 mt-1">Gestão de missões, tarefas e participações de voluntários</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setMissaoDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Missão
            </Button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Missões</p>
                  <p className="text-2xl font-bold text-blue-700">{estatisticas.total_missoes}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Ativas</p>
                  <p className="text-2xl font-bold text-orange-700">{estatisticas.missoes_ativas}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-700">{estatisticas.missoes_concluidas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Voluntários</p>
                  <p className="text-2xl font-bold text-purple-700">{estatisticas.total_voluntarios_participantes}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Horas Totais</p>
                  <p className="text-2xl font-bold text-indigo-700">{estatisticas.total_horas_dedicadas.toFixed(1)}</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Custo Total</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(estatisticas.custo_total_missoes)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="missoes" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Missões</span>
            </TabsTrigger>
            <TabsTrigger value="participacoes" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Participações</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Missões Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Missões Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {missoes.slice(0, 5).map((missao) => (
                      <div key={missao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: missao.tipos_missoes_2025_12_13_09_00?.cor + '20' }}>
                            {getIconeComponent(missao.tipos_missoes_2025_12_13_09_00?.icone || 'target')}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{missao.titulo}</div>
                            <div className="text-sm text-gray-500">{formatDate(missao.data_inicio)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(missao.status)}>
                            {missao.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tipos de Missões */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-green-600" />
                    Tipos de Missões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {tiposMissoes.map((tipo) => (
                      <div key={tipo.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: tipo.cor + '20' }}>
                          {getIconeComponent(tipo.icone)}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{tipo.nome}</div>
                          <div className="text-xs text-gray-500">{tipo.categoria}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Missões */}
          <TabsContent value="missoes" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-600" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="search">Pesquisar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Título, código, local..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="planejada">Planejada</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={filterTipo} onValueChange={setFilterTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {tiposMissoes.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('');
                        setFilterTipo('');
                        setFilterPrioridade('');
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Missões */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {missoesFiltradas.map((missao) => (
                <Card key={missao.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: missao.tipos_missoes_2025_12_13_09_00?.cor + '20' }}>
                          {getIconeComponent(missao.tipos_missoes_2025_12_13_09_00?.icone || 'target')}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{missao.titulo}</CardTitle>
                          <p className="text-sm text-gray-500">{missao.codigo}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(missao.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(missao.status)}>
                        {missao.status}
                      </Badge>
                      <Badge className={getPrioridadeColor(missao.prioridade)}>
                        {missao.prioridade}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(missao.data_inicio)}
                        {missao.hora_inicio && ` às ${missao.hora_inicio}`}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {missao.local_principal}
                      </div>
                      {missao.animais && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Heart className="h-4 w-4 mr-2" />
                          {missao.animais.nome}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatCurrency(missao.orcamento_previsto)}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMissao(missao);
                            setParticipacaoDialogOpen(true);
                          }}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Voluntários
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMissao(missao);
                            setMissaoForm({
                              tipo_missao_id: missao.tipo_missao_id,
                              titulo: missao.titulo,
                              descricao: missao.descricao,
                              objetivo: missao.objetivo,
                              data_inicio: missao.data_inicio,
                              data_fim: missao.data_fim || '',
                              hora_inicio: missao.hora_inicio || '',
                              hora_fim: missao.hora_fim || '',
                              local_principal: missao.local_principal,
                              animal_id: missao.animal_id || '',
                              prioridade: missao.prioridade,
                              orcamento_previsto: missao.orcamento_previsto.toString()
                            });
                            setMissaoDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Participações */}
          <TabsContent value="participacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Participações de Voluntários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participacoes.map((participacao) => (
                    <div key={participacao.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{participacao.voluntarios?.nome}</div>
                          <div className="text-sm text-gray-500">{participacao.missoes_2025_12_13_09_00?.titulo}</div>
                          <div className="text-sm text-gray-500">Função: {participacao.funcao}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{participacao.horas_dedicadas}h</div>
                        <div className="text-sm text-gray-500">{formatDate(participacao.data_participacao)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Relatórios */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Missões:</span>
                      <span className="font-bold">{estatisticas.total_missoes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Missões Ativas:</span>
                      <span className="font-bold text-orange-600">{estatisticas.missoes_ativas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Missões Concluídas:</span>
                      <span className="font-bold text-green-600">{estatisticas.missoes_concluidas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voluntários Participantes:</span>
                      <span className="font-bold">{estatisticas.total_voluntarios_participantes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Horas:</span>
                      <span className="font-bold">{estatisticas.total_horas_dedicadas.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo Total:</span>
                      <span className="font-bold text-red-600">{formatCurrency(estatisticas.custo_total_missoes)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Missões por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tiposMissoes.reduce((acc: any[], tipo) => {
                      const count = missoes.filter(m => m.tipo_missao_id === tipo.id).length;
                      if (count > 0) {
                        acc.push({ ...tipo, count });
                      }
                      return acc;
                    }, []).map((tipo) => (
                      <div key={tipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: tipo.cor + '20' }}>
                            {getIconeComponent(tipo.icone)}
                          </div>
                          <span className="font-medium">{tipo.nome}</span>
                        </div>
                        <Badge variant="secondary">{tipo.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog: Nova/Editar Missão */}
        <Dialog open={missaoDialogOpen} onOpenChange={setMissaoDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMissao ? 'Editar Missão' : 'Nova Missão'}
              </DialogTitle>
              <DialogDescription>
                {editingMissao ? 'Edite os dados da missão' : 'Crie uma nova missão para os voluntários'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_missao">Tipo de Missão *</Label>
                <Select 
                  value={missaoForm.tipo_missao_id} 
                  onValueChange={(value) => setMissaoForm({ ...missaoForm, tipo_missao_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMissoes.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select 
                  value={missaoForm.prioridade} 
                  onValueChange={(value) => setMissaoForm({ ...missaoForm, prioridade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={missaoForm.titulo}
                  onChange={(e) => setMissaoForm({ ...missaoForm, titulo: e.target.value })}
                  placeholder="Ex: Resgate de cão abandonado"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={missaoForm.descricao}
                  onChange={(e) => setMissaoForm({ ...missaoForm, descricao: e.target.value })}
                  placeholder="Descreva os detalhes da missão"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="objetivo">Objetivo *</Label>
                <Textarea
                  id="objetivo"
                  value={missaoForm.objetivo}
                  onChange={(e) => setMissaoForm({ ...missaoForm, objetivo: e.target.value })}
                  placeholder="Qual é o objetivo desta missão?"
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={missaoForm.data_inicio}
                  onChange={(e) => setMissaoForm({ ...missaoForm, data_inicio: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={missaoForm.data_fim}
                  onChange={(e) => setMissaoForm({ ...missaoForm, data_fim: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="hora_inicio">Hora de Início</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={missaoForm.hora_inicio}
                  onChange={(e) => setMissaoForm({ ...missaoForm, hora_inicio: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="hora_fim">Hora de Fim</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={missaoForm.hora_fim}
                  onChange={(e) => setMissaoForm({ ...missaoForm, hora_fim: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="local_principal">Local Principal *</Label>
                <Input
                  id="local_principal"
                  value={missaoForm.local_principal}
                  onChange={(e) => setMissaoForm({ ...missaoForm, local_principal: e.target.value })}
                  placeholder="Ex: Estrada Nacional 18, Km 45"
                  required
                />
              </div>

              <div>
                <Label htmlFor="animal_id">Animal (Opcional)</Label>
                <Select 
                  value={missaoForm.animal_id} 
                  onValueChange={(value) => setMissaoForm({ ...missaoForm, animal_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar animal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum animal específico</SelectItem>
                    {animais.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.nome}
                      </SelectItem>
                    ))}
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
                  onChange={(e) => setMissaoForm({ ...missaoForm, orcamento_previsto: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setMissaoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateMissao} className="bg-blue-600 hover:bg-blue-700">
                {editingMissao ? 'Atualizar' : 'Criar'} Missão
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: Adicionar Participação */}
        <Dialog open={participacaoDialogOpen} onOpenChange={setParticipacaoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Voluntário à Missão</DialogTitle>
              <DialogDescription>
                {selectedMissao && `Adicionar voluntário à missão: ${selectedMissao.titulo}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="voluntario_id">Voluntário *</Label>
                <Select 
                  value={participacaoForm.voluntario_id} 
                  onValueChange={(value) => setParticipacaoForm({ ...participacaoForm, voluntario_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar voluntário" />
                  </SelectTrigger>
                  <SelectContent>
                    {voluntarios.map((voluntario) => (
                      <SelectItem key={voluntario.id} value={voluntario.id}>
                        {voluntario.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="funcao">Função *</Label>
                <Input
                  id="funcao"
                  value={participacaoForm.funcao}
                  onChange={(e) => setParticipacaoForm({ ...participacaoForm, funcao: e.target.value })}
                  placeholder="Ex: Motorista, Veterinário, Auxiliar, Coordenador"
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_participacao">Data de Participação *</Label>
                <Input
                  id="data_participacao"
                  type="date"
                  value={participacaoForm.data_participacao}
                  onChange={(e) => setParticipacaoForm({ ...participacaoForm, data_participacao: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hora_inicio_part">Hora de Início</Label>
                  <Input
                    id="hora_inicio_part"
                    type="time"
                    value={participacaoForm.hora_inicio}
                    onChange={(e) => setParticipacaoForm({ ...participacaoForm, hora_inicio: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="hora_fim_part">Hora de Fim</Label>
                  <Input
                    id="hora_fim_part"
                    type="time"
                    value={participacaoForm.hora_fim}
                    onChange={(e) => setParticipacaoForm({ ...participacaoForm, hora_fim: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes_part">Observações</Label>
                <Textarea
                  id="observacoes_part"
                  value={participacaoForm.observacoes}
                  onChange={(e) => setParticipacaoForm({ ...participacaoForm, observacoes: e.target.value })}
                  placeholder="Observações sobre a participação"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setParticipacaoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddParticipacao} className="bg-purple-600 hover:bg-purple-700">
                Adicionar Participação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default ModuloMissoes;