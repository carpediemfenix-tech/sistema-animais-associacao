import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft,
  Package,
  Shield,
  Truck,
  Heart,
  Smartphone,
  Shirt,
  Plus,
  Eye,
  Edit,
  Trash2,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Wrench,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Activity,
  Target,
  Zap,
  AlertCircle,
  Loader2,
  FileText,
  History,
  Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface CategoriaEquipamento {
  id: string;
  nome: string;
  descricao: string;
  codigo: string;
  cor: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

interface TipoEquipamento {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  codigo: string;
  unidade_medida: string;
  vida_util_meses: number;
  requer_manutencao: boolean;
  intervalo_manutencao_dias: number;
  valor_unitario: number;
  fornecedor: string;
  observacoes: string;
  ativo: boolean;
  categoria?: CategoriaEquipamento;
}

interface Equipamento {
  id: string;
  tipo_equipamento_id: string;
  codigo_interno: string;
  numero_serie: string;
  data_aquisicao: string;
  data_validade: string;
  estado: string;
  localizacao: string;
  condicao: string;
  valor_aquisicao: number;
  garantia_ate: string;
  observacoes: string;
  ativo: boolean;
  tipo_equipamento?: TipoEquipamento;
}

interface AtribuicaoEquipamento {
  id: string;
  equipamento_id: string;
  voluntario_id: string;
  data_atribuicao: string;
  data_devolucao: string;
  motivo_atribuicao: string;
  estado_entrega: string;
  estado_devolucao: string;
  observacoes_entrega: string;
  observacoes_devolucao: string;
  ativo: boolean;
  equipamento?: Equipamento;
  voluntario?: { nome: string; email: string };
}

interface Manutencao {
  id: string;
  equipamento_id: string;
  tipo_manutencao: string;
  data_manutencao: string;
  data_proxima_manutencao: string;
  descricao: string;
  custo: number;
  fornecedor_servico: string;
  status: string;
  observacoes: string;
  equipamento?: Equipamento;
}

interface AlertaReposicao {
  id: string;
  tipo_equipamento_id: string;
  quantidade_minima: number;
  quantidade_atual: number;
  quantidade_recomendada: number;
  alerta_ativo: boolean;
  data_ultimo_alerta: string;
  observacoes: string;
  tipo_equipamento?: TipoEquipamento;
}

interface EstatisticasEquipamentos {
  totalEquipamentos: number;
  equipamentosDisponiveis: number;
  equipamentosEmUso: number;
  equipamentosManutencao: number;
  valorTotalInventario: number;
  alertasAtivos: number;
  manutencoesPendentes: number;
  atribuicoesAtivas: number;
}

const ModuloEquipamentos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Estados de dados
  const [estatisticas, setEstatisticas] = useState<EstatisticasEquipamentos | null>(null);
  const [categorias, setCategorias] = useState<CategoriaEquipamento[]>([]);
  const [tiposEquipamentos, setTiposEquipamentos] = useState<TipoEquipamento[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<AtribuicaoEquipamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [alertas, setAlertas] = useState<AlertaReposicao[]>([]);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [showNovoEquipamentoDialog, setShowNovoEquipamentoDialog] = useState(false);
  const [showConfiguracoesDialog, setShowConfiguracoesDialog] = useState(false);
  const [showVerEquipamentoDialog, setShowVerEquipamentoDialog] = useState(false);
  const [showEditarEquipamentoDialog, setShowEditarEquipamentoDialog] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEstatisticas(),
        loadCategorias(),
        loadTiposEquipamentos(),
        loadEquipamentos(),
        loadAtribuicoes(),
        loadManutencoes(),
        loadAlertas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do módulo equipamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      // Carregar equipamentos
      const { data: equipamentosData } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .select('*')
        .eq('ativo', true);

      // Carregar atribuições ativas
      const { data: atribuicoesData } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .select('*')
        .eq('ativo', true);

      // Carregar alertas ativos
      const { data: alertasData } = await supabase
        .from('alertas_reposicao_2025_12_13_01_00')
        .select('*')
        .eq('alerta_ativo', true);

      // Carregar manutenções pendentes
      const { data: manutencoesData } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .select('*')
        .in('status', ['agendada', 'em_andamento']);

      const totalEquipamentos = equipamentosData?.length || 0;
      const equipamentosDisponiveis = equipamentosData?.filter(e => e.estado === 'disponivel').length || 0;
      const equipamentosEmUso = equipamentosData?.filter(e => e.estado === 'em_uso').length || 0;
      const equipamentosManutencao = equipamentosData?.filter(e => e.estado === 'manutencao').length || 0;
      const valorTotalInventario = equipamentosData?.reduce((sum, e) => sum + (e.valor_aquisicao || 0), 0) || 0;
      const alertasAtivos = alertasData?.filter(a => a.quantidade_atual <= a.quantidade_minima).length || 0;
      const manutencoesPendentes = manutencoesData?.length || 0;
      const atribuicoesAtivas = atribuicoesData?.length || 0;

      setEstatisticas({
        totalEquipamentos,
        equipamentosDisponiveis,
        equipamentosEmUso,
        equipamentosManutencao,
        valorTotalInventario,
        alertasAtivos,
        manutencoesPendentes,
        atribuicoesAtivas
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_equipamentos_2025_12_13_01_00')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadTiposEquipamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .select(`
          *,
          categoria:categorias_equipamentos_2025_12_13_01_00(*)
        `)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setTiposEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de equipamentos:', error);
    }
  };

  const loadEquipamentos = async () => {
    try {
      let query = supabase
        .from('equipamentos_2025_12_13_01_00')
        .select(`
          *,
          tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(
            *,
            categoria:categorias_equipamentos_2025_12_13_01_00(*)
          )
        `)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filterCategoria !== 'todos') {
        // Filtrar por categoria através do tipo de equipamento
        const tiposFiltrados = tiposEquipamentos
          .filter(t => t.categoria_id === filterCategoria)
          .map(t => t.id);
        
        if (tiposFiltrados.length > 0) {
          query = query.in('tipo_equipamento_id', tiposFiltrados);
        }
      }
      
      if (filterEstado !== 'todos') {
        query = query.eq('estado', filterEstado);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data || [];
      
      // Aplicar filtro de pesquisa
      if (searchTerm) {
        filteredData = filteredData.filter(equipamento =>
          equipamento.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipamento.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipamento.tipo_equipamento?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipamento.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setEquipamentos(filteredData);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    }
  };

  const loadAtribuicoes = async () => {
    try {
      const { data, error } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .select(`
          *,
          equipamento:equipamentos_2025_12_13_01_00(
            *,
            tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(*)
          ),
          voluntario:voluntarios(nome, email)
        `)
        .eq('ativo', true)
        .order('data_atribuicao', { ascending: false });

      if (error) throw error;
      setAtribuicoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
    }
  };

  const loadManutencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .select(`
          *,
          equipamento:equipamentos_2025_12_13_01_00(
            *,
            tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(*)
          )
        `)
        .order('data_manutencao', { ascending: false });

      if (error) throw error;
      setManutencoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
    }
  };

  const loadAlertas = async () => {
    try {
      const { data, error } = await supabase
        .from('alertas_reposicao_2025_12_13_01_00')
        .select(`
          *,
          tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(
            *,
            categoria:categorias_equipamentos_2025_12_13_01_00(*)
          )
        `)
        .eq('alerta_ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertas(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Shield, Truck, Heart, Smartphone, Shirt, Package, Wrench, Activity, Target, Zap
    };
    return icons[iconName] || Package;
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'disponivel': 'bg-green-100 text-green-800',
      'em_uso': 'bg-blue-100 text-blue-800',
      'manutencao': 'bg-yellow-100 text-yellow-800',
      'danificado': 'bg-red-100 text-red-800',
      'perdido': 'bg-gray-100 text-gray-800',
      'descartado': 'bg-black text-white'
    };
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getCondicaoBadge = (condicao: string) => {
    const variants = {
      'novo': 'bg-green-100 text-green-800',
      'bom': 'bg-blue-100 text-blue-800',
      'regular': 'bg-yellow-100 text-yellow-800',
      'mau': 'bg-red-100 text-red-800'
    };
    return variants[condicao as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  // Funções para ações dos equipamentos
  const handleVerEquipamento = (equipamento: Equipamento) => {
    setEquipamentoSelecionado(equipamento);
    setShowVerEquipamentoDialog(true);
  };

  const handleEditarEquipamento = (equipamento: Equipamento) => {
    setEquipamentoSelecionado(equipamento);
    setShowEditarEquipamentoDialog(true);
  };

  const handleNovoEquipamento = () => {
    setEquipamentoSelecionado(null);
    setShowNovoEquipamentoDialog(true);
  };

  const handleConfiguracoes = () => {
    setShowConfiguracoesDialog(true);
  };

  // Aplicar filtros quando mudarem
  useEffect(() => {
    loadEquipamentos();
  }, [searchTerm, filterCategoria, filterEstado, tiposEquipamentos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Carregando módulo equipamentos...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard Principal
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                  <Package className="h-10 w-10 mr-3 text-orange-600" />
                  Módulo Equipamentos
                </h1>
                <p className="text-gray-600 text-lg">
                  Sistema completo de gestão de equipamentos e materiais
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={loadAllData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => setShowConfiguracoesDialog(true)} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button onClick={() => setShowNovoEquipamentoDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Equipamentos</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.totalEquipamentos || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.equipamentosDisponiveis || 0} disponíveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
                <User className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.equipamentosEmUso || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.atribuicoesAtivas || 0} atribuições ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Inventário</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(estatisticas?.valorTotalInventario || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.equipamentosManutencao || 0} em manutenção
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.alertasAtivos || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.manutencoesPendentes || 0} manutenções pendentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Principais */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="inventario">Inventário</TabsTrigger>
              <TabsTrigger value="atribuicoes">Atribuições</TabsTrigger>
              <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
              <TabsTrigger value="alertas">Alertas</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription>
                    Acesso direto às principais funcionalidades do módulo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={handleNovoEquipamento}
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-6 w-6" />
                      <div className="text-center">
                        <div className="text-sm font-medium">Novo Equipamento</div>
                        <div className="text-xs opacity-90">Adicionar ao inventário</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => setActiveTab('inventario')}
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Package className="h-6 w-6" />
                      <div className="text-center">
                        <div className="text-sm font-medium">Inventário</div>
                        <div className="text-xs opacity-90">Gerir equipamentos</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => setActiveTab('manutencoes')}
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Wrench className="h-6 w-6" />
                      <div className="text-center">
                        <div className="text-sm font-medium">Manutenções</div>
                        <div className="text-xs opacity-90">Gerir manutenções</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={handleConfiguracoes}
                      className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Settings className="h-6 w-6" />
                      <div className="text-center">
                        <div className="text-sm font-medium">Configurações</div>
                        <div className="text-xs opacity-90">Categorias e tipos</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categorias de Equipamentos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Categorias de Equipamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categorias.map((categoria) => {
                        const IconComponent = getIconComponent(categoria.icone);
                        const equipamentosCategoria = equipamentos.filter(e => 
                          e.tipo_equipamento?.categoria_id === categoria.id
                        ).length;
                        
                        return (
                          <div key={categoria.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="p-2 rounded-full text-white"
                                style={{ backgroundColor: categoria.cor }}
                              >
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{categoria.nome}</div>
                                <div className="text-sm text-gray-500">{categoria.descricao}</div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {equipamentosCategoria} itens
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Equipamentos Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Equipamentos Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {equipamentos.slice(0, 5).map((equipamento) => {
                        const IconComponent = equipamento.tipo_equipamento?.categoria ? 
                          getIconComponent(equipamento.tipo_equipamento.categoria.icone) : Package;
                        
                        return (
                          <div key={equipamento.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                            <IconComponent 
                              className="h-4 w-4" 
                              style={{ color: equipamento.tipo_equipamento?.categoria?.cor }} 
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{equipamento.codigo_interno}</div>
                              <div className="text-xs text-gray-500">
                                {equipamento.tipo_equipamento?.nome}
                              </div>
                            </div>
                            <Badge className={getEstadoBadge(equipamento.estado)}>
                              {equipamento.estado}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas Urgentes */}
              {alertas.filter(a => a.quantidade_atual <= a.quantidade_minima).length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Alertas de Reposição Urgentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alertas
                        .filter(a => a.quantidade_atual <= a.quantidade_minima)
                        .slice(0, 3)
                        .map((alerta) => (
                          <div key={alerta.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-red-200">
                            <div>
                              <div className="font-medium text-red-800">
                                {alerta.tipo_equipamento?.nome}
                              </div>
                              <div className="text-sm text-red-600">
                                Stock atual: {alerta.quantidade_atual} | Mínimo: {alerta.quantidade_minima}
                              </div>
                            </div>
                            <Badge variant="destructive">
                              Urgente
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Inventário Tab */}
            <TabsContent value="inventario" className="space-y-6">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtros de Pesquisa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Pesquisar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Código, série, tipo..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Categoria</Label>
                      <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as categorias</SelectItem>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Estado</Label>
                      <Select value={filterEstado} onValueChange={setFilterEstado}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os estados</SelectItem>
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="em_uso">Em Uso</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="danificado">Danificado</SelectItem>
                          <SelectItem value="perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button onClick={loadEquipamentos} className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Pesquisar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Equipamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Inventário de Equipamentos ({equipamentos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {equipamentos.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhum equipamento encontrado</p>
                      <p className="text-gray-400">Ajuste os filtros ou adicione novos equipamentos</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Condição</TableHead>
                            <TableHead>Localização</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipamentos.map((equipamento) => {
                            const IconComponent = equipamento.tipo_equipamento?.categoria ? 
                              getIconComponent(equipamento.tipo_equipamento.categoria.icone) : Package;
                            
                            return (
                              <TableRow key={equipamento.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <IconComponent 
                                      className="h-5 w-5" 
                                      style={{ color: equipamento.tipo_equipamento?.categoria?.cor }} 
                                    />
                                    <div>
                                      <div className="font-medium">{equipamento.codigo_interno}</div>
                                      <div className="text-sm text-gray-500">
                                        {equipamento.tipo_equipamento?.nome}
                                      </div>
                                      {equipamento.numero_serie && (
                                        <div className="text-xs text-gray-400">
                                          S/N: {equipamento.numero_serie}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {equipamento.tipo_equipamento?.categoria?.nome || 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getEstadoBadge(equipamento.estado)}>
                                    {equipamento.estado}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getCondicaoBadge(equipamento.condicao)}>
                                    {equipamento.condicao}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                    {equipamento.localizacao || 'Não especificada'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(equipamento.valor_aquisicao || 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleVerEquipamento(equipamento)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleEditarEquipamento(equipamento)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Editar
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Atribuições Tab */}
            <TabsContent value="atribuicoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Atribuições Ativas ({atribuicoes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {atribuicoes.map((atribuicao) => (
                      <div key={atribuicao.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{atribuicao.voluntario?.nome}</div>
                            <div className="text-sm text-gray-500">
                              {atribuicao.equipamento?.codigo_interno} - {atribuicao.equipamento?.tipo_equipamento?.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              Atribuído em: {formatDate(atribuicao.data_atribuicao)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getEstadoBadge(atribuicao.estado_entrega)}>
                            {atribuicao.estado_entrega}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manutenções Tab */}
            <TabsContent value="manutencoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    Histórico de Manutenções
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {manutencoes.map((manutencao) => (
                      <div key={manutencao.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-yellow-100 rounded-full">
                            <Wrench className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {manutencao.equipamento?.codigo_interno} - {manutencao.tipo_manutencao}
                            </div>
                            <div className="text-sm text-gray-500">
                              {manutencao.descricao}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(manutencao.data_manutencao)}
                              {manutencao.custo > 0 && ` • ${formatCurrency(manutencao.custo)}`}
                            </div>
                          </div>
                        </div>
                        <Badge className={
                          manutencao.status === 'concluida' ? 'bg-green-100 text-green-800' :
                          manutencao.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {manutencao.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alertas Tab */}
            <TabsContent value="alertas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Alertas de Reposição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alertas.map((alerta) => {
                      const isUrgente = alerta.quantidade_atual <= alerta.quantidade_minima;
                      
                      return (
                        <div key={alerta.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                          isUrgente ? 'bg-red-50 border-red-200' : 'bg-white'
                        }`}>
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              isUrgente ? 'bg-red-100' : 'bg-orange-100'
                            }`}>
                              <AlertTriangle className={`h-4 w-4 ${
                                isUrgente ? 'text-red-600' : 'text-orange-600'
                              }`} />
                            </div>
                            <div>
                              <div className="font-medium">{alerta.tipo_equipamento?.nome}</div>
                              <div className="text-sm text-gray-500">
                                {alerta.tipo_equipamento?.categoria?.nome}
                              </div>
                              <div className="text-sm text-gray-500">
                                Atual: {alerta.quantidade_atual} | Mínimo: {alerta.quantidade_minima} | Recomendado: {alerta.quantidade_recomendada}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={isUrgente ? "destructive" : "secondary"}>
                              {isUrgente ? 'Urgente' : 'Atenção'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Repor
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Relatórios Tab */}
            <TabsContent value="relatorios" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Relatório de Inventário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Relatório completo do inventário por categoria e estado
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-green-600" />
                      Relatório de Atribuições
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Equipamentos atribuídos por voluntário e período
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2 text-yellow-600" />
                      Relatório de Manutenções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Histórico de manutenções e custos associados
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                      Análise de Custos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Análise de custos de aquisição e manutenção
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-red-600" />
                      Utilização de Equipamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Histórico de utilização e eficiência
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Alertas e Reposições
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Relatório de alertas e necessidades de reposição
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Diálogos */}
      <Dialog open={showVerEquipamentoDialog} onOpenChange={setShowVerEquipamentoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Equipamento</DialogTitle>
          </DialogHeader>
          {equipamentoSelecionado && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código Interno</Label>
                  <p className="text-sm font-medium">{equipamentoSelecionado.codigo_interno}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge className={getEstadoBadge(equipamentoSelecionado.estado)}>
                    {equipamentoSelecionado.estado}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditarEquipamentoDialog} onOpenChange={setShowEditarEquipamentoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showNovoEquipamentoDialog} onOpenChange={setShowNovoEquipamentoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Equipamento</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Plus className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showConfiguracoesDialog} onOpenChange={setShowConfiguracoesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default ModuloEquipamentos;