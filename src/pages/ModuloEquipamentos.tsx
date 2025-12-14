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
  FileText,
  DollarSign,
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
  
  // Estados do formulário
  const [equipamentoForm, setEquipamentoForm] = useState({
    tipo_equipamento_id: '',
    codigo_interno: '',
    numero_serie: '',
    data_aquisicao: '',
    data_validade: '',
    estado: 'disponivel',
    localizacao: '',
    condicao: 'bom',
    valor_aquisicao: '',
    garantia_ate: '',
    observacoes: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  // Reset do formulário quando o diálogo de novo equipamento for fechado
  useEffect(() => {
    if (!showNovoEquipamentoDialog) {
      console.log('Diálogo novo equipamento fechado, resetando formulário');
      resetEquipamentoForm();
    }
  }, [showNovoEquipamentoDialog]);

  // Reset do formulário quando o diálogo de edição for fechado
  useEffect(() => {
    if (!showEditarEquipamentoDialog) {
      console.log('Diálogo editar equipamento fechado, resetando formulário');
      resetEquipamentoForm();
      setEquipamentoSelecionado(null);
    }
  }, [showEditarEquipamentoDialog]);

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
      // Carregar atribuições simples primeiro
      const { data, error } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .select('*')
        .eq('ativo', true)
        .order('data_atribuicao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar atribuições:', error);
        // Se houver erro, definir array vazio
        setAtribuicoes([]);
        return;
      }
      
      console.log('Atribuições carregadas:', data?.length || 0);
      setAtribuicoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
      setAtribuicoes([]);
    }
  };

  const loadManutencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .select('*')
        .order('data_manutencao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar manutenções:', error);
        setManutencoes([]);
        return;
      }
      
      console.log('Manutenções carregadas:', data?.length || 0);
      setManutencoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
      setManutencoes([]);
    }
  };

  const loadAlertas = async () => {
    try {
      const { data, error } = await supabase
        .from('alertas_reposicao_2025_12_13_01_00')
        .select('*')
        .eq('alerta_ativo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar alertas:', error);
        setAlertas([]);
        return;
      }
      
      console.log('Alertas carregados:', data?.length || 0);
      setAlertas(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      setAlertas([]);
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
    preencherFormularioEdicao(equipamento);
    setShowEditarEquipamentoDialog(true);
  };

  const handleNovoEquipamento = () => {
    console.log('Abrindo diálogo novo equipamento');
    setEquipamentoSelecionado(null);
    resetEquipamentoForm();
    setShowNovoEquipamentoDialog(true);
  };

  const handleConfiguracoes = () => {
    setShowConfiguracoesDialog(true);
  };

  // Funções CRUD para equipamentos
  const resetEquipamentoForm = () => {
    setEquipamentoForm({
      tipo_equipamento_id: '',
      codigo_interno: '',
      numero_serie: '',
      data_aquisicao: '',
      data_validade: '',
      estado: 'disponivel',
      localizacao: '',
      condicao: 'bom',
      valor_aquisicao: '',
      garantia_ate: '',
      observacoes: ''
    });
  };

  const handleCriarEquipamento = async () => {
    try {
      console.log('Criando equipamento com dados:', equipamentoForm);
      
      // Validar campos obrigatórios
      if (!equipamentoForm.tipo_equipamento_id) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione o tipo de equipamento",
          variant: "destructive",
        });
        return;
      }
      
      if (!equipamentoForm.codigo_interno) {
        toast({
          title: "Campo obrigatório",
          description: "Informe o código interno",
          variant: "destructive",
        });
        return;
      }
      
      if (!equipamentoForm.data_aquisicao) {
        toast({
          title: "Campo obrigatório",
          description: "Informe a data de aquisição",
          variant: "destructive",
        });
        return;
      }
      
      const equipamentoData = {
        tipo_equipamento_id: equipamentoForm.tipo_equipamento_id,
        codigo_interno: equipamentoForm.codigo_interno,
        numero_serie: equipamentoForm.numero_serie || null,
        data_aquisicao: equipamentoForm.data_aquisicao,
        data_validade: equipamentoForm.data_validade || null,
        estado: equipamentoForm.estado,
        localizacao: equipamentoForm.localizacao || null,
        condicao: equipamentoForm.condicao,
        valor_aquisicao: parseFloat(equipamentoForm.valor_aquisicao) || 0,
        garantia_ate: equipamentoForm.garantia_ate || null,
        observacoes: equipamentoForm.observacoes || null,
        ativo: true
      };
      
      console.log('Dados para inserção:', equipamentoData);
      
      const { data, error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .insert([equipamentoData])
        .select();

      if (error) {
        console.error('Erro detalhado ao criar equipamento:', error);
        throw error;
      }
      
      console.log('Equipamento criado com sucesso:', data);

      toast({
        title: "Equipamento criado",
        description: "Novo equipamento adicionado com sucesso",
      });

      setShowNovoEquipamentoDialog(false);
      resetEquipamentoForm();
      loadEquipamentos();
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      toast({
        title: "Erro ao criar equipamento",
        description: "Não foi possível criar o equipamento",
        variant: "destructive",
      });
    }
  };

  const handleAtualizarEquipamento = async () => {
    if (!equipamentoSelecionado) return;

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({
          ...equipamentoForm,
          valor_aquisicao: parseFloat(equipamentoForm.valor_aquisicao) || 0
        })
        .eq('id', equipamentoSelecionado.id);

      if (error) throw error;

      toast({
        title: "Equipamento atualizado",
        description: "Equipamento atualizado com sucesso",
      });

      setShowEditarEquipamentoDialog(false);
      resetEquipamentoForm();
      loadEquipamentos();
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      toast({
        title: "Erro ao atualizar equipamento",
        description: "Não foi possível atualizar o equipamento",
        variant: "destructive",
      });
    }
  };

  const preencherFormularioEdicao = (equipamento: Equipamento) => {
    setEquipamentoForm({
      tipo_equipamento_id: equipamento.tipo_equipamento_id,
      codigo_interno: equipamento.codigo_interno,
      numero_serie: equipamento.numero_serie || '',
      data_aquisicao: equipamento.data_aquisicao,
      data_validade: equipamento.data_validade,
      estado: equipamento.estado,
      localizacao: equipamento.localizacao || '',
      condicao: equipamento.condicao,
      valor_aquisicao: equipamento.valor_aquisicao?.toString() || '',
      garantia_ate: equipamento.garantia_ate,
      observacoes: equipamento.observacoes || ''
    });
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
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Código Interno</Label>
                    <p className="text-sm font-medium mt-1">{equipamentoSelecionado.codigo_interno}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Número de Série</Label>
                    <p className="text-sm font-medium mt-1">{equipamentoSelecionado.numero_serie || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo de Equipamento</Label>
                    <p className="text-sm font-medium mt-1">{equipamentoSelecionado.tipo_equipamento?.nome || 'Não especificado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                    <p className="text-sm font-medium mt-1">{equipamentoSelecionado.tipo_equipamento?.categoria?.nome || 'Não especificada'}</p>
                  </div>
                </div>
              </div>

              {/* Estado e Condição */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Estado e Condição
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estado</Label>
                    <div className="mt-1">
                      <Badge className={getEstadoBadge(equipamentoSelecionado.estado)}>
                        {equipamentoSelecionado.estado}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Condição</Label>
                    <div className="mt-1">
                      <Badge className={getCondicaoBadge(equipamentoSelecionado.condicao)}>
                        {equipamentoSelecionado.condicao}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Localização e Datas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Localização e Datas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Localização</Label>
                    <p className="text-sm font-medium mt-1">{equipamentoSelecionado.localizacao || 'Não especificada'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data de Aquisição</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(equipamentoSelecionado.data_aquisicao)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data de Validade</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(equipamentoSelecionado.data_validade)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Garantia Até</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(equipamentoSelecionado.garantia_ate)}</p>
                  </div>
                </div>
              </div>

              {/* Informações Financeiras */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
                  Informações Financeiras
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valor de Aquisição</Label>
                    <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(equipamentoSelecionado.valor_aquisicao || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {equipamentoSelecionado.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Observações
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{equipamentoSelecionado.observacoes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditarEquipamentoDialog} onOpenChange={setShowEditarEquipamentoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Editar Equipamento
            </DialogTitle>
            <DialogDescription>
              {equipamentoSelecionado && `Editando: ${equipamentoSelecionado.codigo_interno}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Informações Básicas
              </h3>
              
              <div>
                <Label htmlFor="edit_tipo_equipamento_id">Tipo de Equipamento *</Label>
                <Select 
                  value={equipamentoForm.tipo_equipamento_id} 
                  onValueChange={(value) => setEquipamentoForm({...equipamentoForm, tipo_equipamento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEquipamentos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome} ({tipo.categoria?.nome})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_codigo_interno">Código Interno *</Label>
                <Input
                  id="edit_codigo_interno"
                  value={equipamentoForm.codigo_interno}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, codigo_interno: e.target.value})}
                  placeholder="Ex: EQ001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_numero_serie">Número de Série</Label>
                <Input
                  id="edit_numero_serie"
                  value={equipamentoForm.numero_serie}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, numero_serie: e.target.value})}
                  placeholder="Número de série do equipamento"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_localizacao">Localização</Label>
                <Input
                  id="edit_localizacao"
                  value={equipamentoForm.localizacao}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, localizacao: e.target.value})}
                  placeholder="Ex: Armazém A, Prateleira 3"
                />
              </div>
            </div>
            
            {/* Estado e Condição */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Estado e Condição
              </h3>
              
              <div>
                <Label htmlFor="edit_estado">Estado</Label>
                <Select 
                  value={equipamentoForm.estado} 
                  onValueChange={(value) => setEquipamentoForm({...equipamentoForm, estado: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em_uso">Em Uso</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="danificado">Danificado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                    <SelectItem value="descartado">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_condicao">Condição</Label>
                <Select 
                  value={equipamentoForm.condicao} 
                  onValueChange={(value) => setEquipamentoForm({...equipamentoForm, condicao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excelente">Excelente</SelectItem>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="mau">Mau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_valor_aquisicao">Valor de Aquisição (€)</Label>
                <Input
                  id="edit_valor_aquisicao"
                  type="number"
                  step="0.01"
                  min="0"
                  value={equipamentoForm.valor_aquisicao}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, valor_aquisicao: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Datas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Datas Importantes
              </h3>
              
              <div>
                <Label htmlFor="edit_data_aquisicao">Data de Aquisição *</Label>
                <Input
                  id="edit_data_aquisicao"
                  type="date"
                  value={equipamentoForm.data_aquisicao}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, data_aquisicao: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit_data_validade">Data de Validade</Label>
                <Input
                  id="edit_data_validade"
                  type="date"
                  value={equipamentoForm.data_validade}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, data_validade: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_garantia_ate">Garantia Até</Label>
                <Input
                  id="edit_garantia_ate"
                  type="date"
                  value={equipamentoForm.garantia_ate}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, garantia_ate: e.target.value})}
                />
              </div>
            </div>
            
            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Observações
              </h3>
              
              <div>
                <Label htmlFor="edit_observacoes">Observações</Label>
                <Textarea
                  id="edit_observacoes"
                  value={equipamentoForm.observacoes}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, observacoes: e.target.value})}
                  placeholder="Observações adicionais sobre o equipamento"
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditarEquipamentoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAtualizarEquipamento} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Equipamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showNovoEquipamentoDialog} onOpenChange={setShowNovoEquipamentoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-600" />
              Novo Equipamento
            </DialogTitle>
            <DialogDescription>
              Adicione um novo equipamento ao inventário
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Informações Básicas
              </h3>
              
              <div>
                <Label htmlFor="tipo_equipamento_id">Tipo de Equipamento *</Label>
                <Select 
                  value={equipamentoForm.tipo_equipamento_id} 
                  onValueChange={(value) => setEquipamentoForm({...equipamentoForm, tipo_equipamento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEquipamentos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome} ({tipo.categoria?.nome})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="codigo_interno">Código Interno *</Label>
                <Input
                  id="codigo_interno"
                  value={equipamentoForm.codigo_interno}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, codigo_interno: e.target.value})}
                  placeholder="Ex: EQ001"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="numero_serie">Número de Série</Label>
                <Input
                  id="numero_serie"
                  value={equipamentoForm.numero_serie}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, numero_serie: e.target.value})}
                  placeholder="Número de série do equipamento"
                />
              </div>
              
              <div>
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={equipamentoForm.localizacao}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, localizacao: e.target.value})}
                  placeholder="Ex: Armazém A, Prateleira 3"
                />
              </div>
            </div>
            
            {/* Estado e Condição */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Estado e Condição
              </h3>
              
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={equipamentoForm.estado} 
                  onValueChange={(value) => setEquipamentoForm({...equipamentoForm, estado: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em_uso">Em Uso</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="danificado">Danificado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                    <SelectItem value="descartado">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="condicao">Condição</Label>
                <Select 
                  value={equipamentoForm.condicao} 
                  onValueChange={(value) => setEquipamentoForm({...equipamentoForm, condicao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excelente">Excelente</SelectItem>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="mau">Mau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="valor_aquisicao">Valor de Aquisição (€)</Label>
                <Input
                  id="valor_aquisicao"
                  type="number"
                  step="0.01"
                  min="0"
                  value={equipamentoForm.valor_aquisicao}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, valor_aquisicao: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Datas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Datas Importantes
              </h3>
              
              <div>
                <Label htmlFor="data_aquisicao">Data de Aquisição *</Label>
                <Input
                  id="data_aquisicao"
                  type="date"
                  value={equipamentoForm.data_aquisicao}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, data_aquisicao: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="data_validade">Data de Validade</Label>
                <Input
                  id="data_validade"
                  type="date"
                  value={equipamentoForm.data_validade}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, data_validade: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="garantia_ate">Garantia Até</Label>
                <Input
                  id="garantia_ate"
                  type="date"
                  value={equipamentoForm.garantia_ate}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, garantia_ate: e.target.value})}
                />
              </div>
            </div>
            
            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Observações
              </h3>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={equipamentoForm.observacoes}
                  onChange={(e) => setEquipamentoForm({...equipamentoForm, observacoes: e.target.value})}
                  placeholder="Observações adicionais sobre o equipamento"
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowNovoEquipamentoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarEquipamento} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Equipamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showConfiguracoesDialog} onOpenChange={setShowConfiguracoesDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              Configurações do Módulo Equipamentos
            </DialogTitle>
            <DialogDescription>
              Gerir categorias e tipos de equipamentos
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="categorias" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categorias">Categorias de Equipamentos</TabsTrigger>
              <TabsTrigger value="tipos">Tipos de Equipamentos</TabsTrigger>
            </TabsList>
            
            {/* Aba Categorias */}
            <TabsContent value="categorias" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Categorias de Equipamentos</h3>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Ícone</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorias.map((categoria) => {
                      const IconComponent = getIconComponent(categoria.icone);
                      return (
                        <TableRow key={categoria.id}>
                          <TableCell className="font-medium">{categoria.nome}</TableCell>
                          <TableCell className="text-sm text-gray-600">{categoria.descricao}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: categoria.cor }}
                              ></div>
                              <span className="text-xs text-gray-500">{categoria.cor}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" style={{ color: categoria.cor }} />
                              <span className="text-xs text-gray-500">{categoria.icone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={categoria.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {categoria.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Aba Tipos */}
            <TabsContent value="tipos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tipos de Equipamentos</h3>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tipo
                </Button>
              </div>
              
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tiposEquipamentos.map((tipo) => (
                      <TableRow key={tipo.id}>
                        <TableCell className="font-medium">{tipo.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {tipo.categoria && (
                              <>
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: tipo.categoria.cor }}
                                ></div>
                                <span>{tipo.categoria.nome}</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{tipo.descricao}</TableCell>
                        <TableCell>
                          <Badge className={tipo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {tipo.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfiguracoesDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default ModuloEquipamentos;