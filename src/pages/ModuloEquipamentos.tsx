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
  Power,
  Upload,
  Activity,
  Target,
  Zap,
  AlertCircle,
  Loader2,
  History,
  Bell,
  X,
  Info,
  PieChart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Maximize2,
  Minimize2,
  Copy,
  Share2
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
  numero_serie?: string;
  estado: string;
  localizacao?: string;
  valor_aquisicao?: number;
  data_aquisicao?: string;
  observacoes?: string;
  ativo: boolean;
  tipo_equipamento?: TipoEquipamento;
}

interface AtribuicaoEquipamento {
  id: string;
  equipamento_id: string;
  voluntario_id: string;
  data_atribuicao: string;
  data_devolucao?: string;
  data_devolucao_prevista?: string;
  estado: 'ativa' | 'devolvida' | 'perdida' | 'danificada';
  observacoes?: string;
  observacoes_devolucao?: string;
  devolvido_por?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  equipamento?: Equipamento;
  voluntario?: { id: string; nome: string; email: string };
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
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  observacoes: string;
  equipamento?: Equipamento;
}

interface AlertaEquipamento {
  id: string;
  equipamento_id: string;
  tipo_alerta: 'manutencao_vencida' | 'manutencao_proxima' | 'atribuicao_vencida' | 'equipamento_danificado' | 'stock_baixo' | 'garantia_vencendo' | 'vida_util_esgotada';
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'ativo' | 'resolvido' | 'ignorado';
  data_criacao: string;
  data_vencimento?: string;
  data_resolucao?: string;
  resolvido_por?: string;
  observacoes_resolucao?: string;
  ativo: boolean;
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
  
  // Estados das melhorias implementadas
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [configuracoesSistema, setConfiguracoesSistema] = useState<any>({});
  const [showConfiguracoes, setShowConfiguracoes] = useState(false);
  const [auditoria, setAuditoria] = useState<any[]>([]);
  const [showAuditoria, setShowAuditoria] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<AtribuicaoEquipamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [alertas, setAlertas] = useState<AlertaEquipamento[]>([]);
  
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

  // Cache local para melhorar performance
  const [cache, setCache] = useState({
    equipamentos: null as any,
    categorias: null as any,
    tiposEquipamentos: null as any,
    lastUpdate: null as Date | null
  });

  // Estados de loading detalhados
  const [loadingStates, setLoadingStates] = useState({
    equipamentos: false,
    categorias: false,
    tipos: false,
    atribuicoes: false,
    manutencoes: false,
    alertas: false
  });

  // Estados para CRUD de Configurações
  const [showNovaCategoriaDialog, setShowNovaCategoriaDialog] = useState(false);
  const [showEditarCategoriaDialog, setShowEditarCategoriaDialog] = useState(false);
  const [showNovoTipoDialog, setShowNovoTipoDialog] = useState(false);
  const [showEditarTipoDialog, setShowEditarTipoDialog] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaEquipamento | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoEquipamento | null>(null);

  // Formulários para CRUD
  const [categoriaForm, setCategoriaForm] = useState({
    nome: '',
    descricao: '',
    codigo: '',
    cor: '#3B82F6',
    icone: 'Package',
    ordem: 0,
    ativo: true
  });

  const [tipoForm, setTipoForm] = useState({
    categoria_id: '',
    nome: '',
    descricao: '',
    codigo: '',
    unidade_medida: 'unidade',
    vida_util_meses: 12,
    requer_manutencao: false,
    intervalo_manutencao_dias: 30,
    valor_unitario: 0,
    fornecedor: '',
    observacoes: '',
    ativo: true
  });

  // Estados para CRUD de Atribuições
  const [showNovaAtribuicaoDialog, setShowNovaAtribuicaoDialog] = useState(false);
  const [showDevolverEquipamentoDialog, setShowDevolverEquipamentoDialog] = useState(false);
  const [showHistoricoAtribuicoesDialog, setShowHistoricoAtribuicoesDialog] = useState(false);
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState<AtribuicaoEquipamento | null>(null);
  const [equipamentoParaAtribuir, setEquipamentoParaAtribuir] = useState<Equipamento | null>(null);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);

  // Formulário para nova atribuição
  const [atribuicaoForm, setAtribuicaoForm] = useState({
    equipamento_id: '',
    voluntario_id: '',
    data_atribuicao: new Date().toISOString().split('T')[0],
    data_devolucao_prevista: '',
    observacoes: ''
  });

  // Formulário para devolução
  const [devolucaoForm, setDevolucaoForm] = useState({
    estado: 'devolvida' as 'devolvida' | 'perdida' | 'danificada',
    observacoes_devolucao: ''
  });

  // Estados para CRUD de Manutenções
  const [showNovaManutencaoDialog, setShowNovaManutencaoDialog] = useState(false);
  const [showEditarManutencaoDialog, setShowEditarManutencaoDialog] = useState(false);
  const [showConcluirManutencaoDialog, setShowConcluirManutencaoDialog] = useState(false);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState<Manutencao | null>(null);

  // Estados para CRUD de Alertas
  const [showGerenciarAlertasDialog, setShowGerenciarAlertasDialog] = useState(false);
  const [showResolverAlertaDialog, setShowResolverAlertaDialog] = useState(false);
  const [alertaSelecionado, setAlertaSelecionado] = useState<AlertaEquipamento | null>(null);

  // Formulário para nova manutenção
  const [manutencaoForm, setManutencaoForm] = useState({
    equipamento_id: '',
    tipo_manutencao: 'Preventiva',
    data_manutencao: new Date().toISOString().split('T')[0],
    data_proxima_manutencao: '',
    descricao: '',
    custo: 0,
    fornecedor_servico: '',
    observacoes: ''
  });

  // Formulário para resolver alerta
  const [resolverAlertaForm, setResolverAlertaForm] = useState({
    observacoes_resolucao: ''
  });

  // Estados para Relatórios e Dashboard
  const [kpisDashboard, setKpisDashboard] = useState<any>(null);
  const [relatorioVoluntarios, setRelatorioVoluntarios] = useState<any[]>([]);
  const [relatorioFinanceiro, setRelatorioFinanceiro] = useState<any[]>([]);
  const [analiseManutencoes, setAnaliseManutencoes] = useState<any[]>([]);
  const [analiseAlertas, setAnaliseAlertas] = useState<any[]>([]);
  const [analiseAtribuicoes, setAnaliseAtribuicoes] = useState<any[]>([]);
  const [showRelatorioDialog, setShowRelatorioDialog] = useState(false);
  const [tipoRelatorioSelecionado, setTipoRelatorioSelecionado] = useState<string>('');
  const [loadingRelatorios, setLoadingRelatorios] = useState(false);

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
  
  // Função de retry automático
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.log(`Tentativa ${attempt}/${maxRetries} falhou:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  };

  // Função para verificar cache
  const isCacheValid = (cacheKey: string, maxAge = 5 * 60 * 1000) => { // 5 minutos
    const cacheData = cache[cacheKey as keyof typeof cache];
    const lastUpdate = cache.lastUpdate;
    return cacheData && lastUpdate && (Date.now() - lastUpdate.getTime()) < maxAge;
  };

  // Funções de carregamento das melhorias
  const loadNotificacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('notificacoes_equipamentos_2025_12_16_05_00')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotificacoes(data || []);
      setNotificacoesNaoLidas(data?.filter(n => !n.lida).length || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadConfiguracoesSistema = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema_2025_12_16_05_00')
        .select('*')
        .order('categoria', { ascending: true });

      if (error) throw error;
      
      const configObj = {};
      data?.forEach(config => {
        configObj[config.chave] = config.valor;
      });
      setConfiguracoesSistema(configObj);
      
      // Aplicar configurações
      if (configObj.dashboard_refresh_segundos) {
        setRefreshInterval(parseInt(configObj.dashboard_refresh_segundos));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadAuditoria = async () => {
    try {
      const { data, error } = await supabase
        .from('auditoria_equipamentos_2025_12_16_05_00')
        .select(`
          *,
          usuario:auth.users(email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditoria(data || []);
    } catch (error) {
      console.error('Erro ao carregar auditoria:', error);
    }
  };

  const loadBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_equipamentos_2025_12_16_05_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    }
  };

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
        loadAlertas(),
        loadAllRelatorios(),
        loadNotificacoes(),
        loadConfiguracoesSistema(),
        loadAuditoria(),
        loadBackups()
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
    // Verificar cache primeiro
    if (isCacheValid('equipamentos')) {
      console.log('Usando equipamentos do cache');
      setEquipamentos(cache.equipamentos);
      return;
    }

    setLoadingStates(prev => ({ ...prev, equipamentos: true }));
    
    try {
      const result = await retryOperation(async () => {
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
      
      return filteredData;
      });

      setEquipamentos(result);
      
      // Atualizar cache
      setCache(prev => ({
        ...prev,
        equipamentos: result,
        lastUpdate: new Date()
      }));
      
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: "Erro ao carregar equipamentos",
        description: "Tentando novamente...",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, equipamentos: false }));
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
        .from('alertas_equipamentos_2025_12_16_07_00')
        .select(`
          *,
          equipamento:equipamentos_2025_12_13_01_00(
            id,
            codigo_interno,
            tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(
              nome,
              categoria:categorias_equipamentos_2025_12_13_01_00(nome)
            )
          )
        `)
        .eq('status', 'ativo')
        .order('prioridade', { ascending: false })
        .order('data_criacao', { ascending: false });

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

  // Função para cores de fundo das linhas da tabela baseadas no estado
  const getEstadoRowBackground = (estado: string) => {
    const backgrounds = {
      'disponivel': 'bg-green-50 hover:bg-green-100',
      'em_uso': 'bg-blue-50 hover:bg-blue-100',
      'manutencao': 'bg-yellow-50 hover:bg-yellow-100',
      'danificado': 'bg-red-50 hover:bg-red-100',
      'perdido': 'bg-orange-50 hover:bg-orange-100',
      'descartado': 'bg-gray-50 hover:bg-gray-100'
    };
    return backgrounds[estado as keyof typeof backgrounds] || 'bg-white hover:bg-gray-50';
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
        numero_serie: equipamentoForm.numero_serie || null,
        data_aquisicao: equipamentoForm.data_aquisicao,
        estado: equipamentoForm.estado,
        localizacao: equipamentoForm.localizacao || null,
        valor_aquisicao: parseFloat(equipamentoForm.valor_aquisicao) || 0,
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

  // ========== FUNÇÕES CRUD PARA CATEGORIAS ==========
  
  const resetCategoriaForm = () => {
    setCategoriaForm({
      nome: '',
      descricao: '',
      codigo: '',
      cor: '#3B82F6',
      icone: 'Package',
      ordem: 0,
      ativo: true
    });
  };

  const handleNovaCategoria = () => {
    resetCategoriaForm();
    setCategoriaSelecionada(null);
    setShowNovaCategoriaDialog(true);
  };

  const handleEditarCategoria = (categoria: CategoriaEquipamento) => {
    setCategoriaForm({
      nome: categoria.nome,
      descricao: categoria.descricao,
      codigo: categoria.codigo,
      cor: categoria.cor,
      icone: categoria.icone,
      ordem: categoria.ordem,
      ativo: categoria.ativo
    });
    setCategoriaSelecionada(categoria);
    setShowEditarCategoriaDialog(true);
  };

  const handleCriarCategoria = async () => {
    try {
      // Validações
      if (!categoriaForm.nome.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "O nome da categoria é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!categoriaForm.codigo.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "O código da categoria é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o código já existe
      const { data: existingCategoria } = await supabase
        .from('categorias_equipamentos_2025_12_13_01_00')
        .select('id')
        .eq('codigo', categoriaForm.codigo)
        .single();

      if (existingCategoria) {
        toast({
          title: "Código duplicado",
          description: "Já existe uma categoria com este código",
          variant: "destructive",
        });
        return;
      }

      // Obter próxima ordem se não especificada
      if (categoriaForm.ordem === 0) {
        const { data: maxOrdem } = await supabase
          .from('categorias_equipamentos_2025_12_13_01_00')
          .select('ordem')
          .order('ordem', { ascending: false })
          .limit(1)
          .single();
        
        categoriaForm.ordem = (maxOrdem?.ordem || 0) + 1;
      }

      const { error } = await supabase
        .from('categorias_equipamentos_2025_12_13_01_00')
        .insert([categoriaForm]);

      if (error) throw error;

      toast({
        title: "Categoria criada",
        description: `Categoria '${categoriaForm.nome}' criada com sucesso`,
      });

      setShowNovaCategoriaDialog(false);
      resetCategoriaForm();
      loadCategorias();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria",
        variant: "destructive",
      });
    }
  };

  const handleAtualizarCategoria = async () => {
    if (!categoriaSelecionada) return;

    try {
      // Validações
      if (!categoriaForm.nome.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "O nome da categoria é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o código já existe (exceto na categoria atual)
      const { data: existingCategoria } = await supabase
        .from('categorias_equipamentos_2025_12_13_01_00')
        .select('id')
        .eq('codigo', categoriaForm.codigo)
        .neq('id', categoriaSelecionada.id)
        .single();

      if (existingCategoria) {
        toast({
          title: "Código duplicado",
          description: "Já existe uma categoria com este código",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('categorias_equipamentos_2025_12_13_01_00')
        .update(categoriaForm)
        .eq('id', categoriaSelecionada.id);

      if (error) throw error;

      toast({
        title: "Categoria atualizada",
        description: `Categoria '${categoriaForm.nome}' atualizada com sucesso`,
      });

      setShowEditarCategoriaDialog(false);
      resetCategoriaForm();
      setCategoriaSelecionada(null);
      loadCategorias();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Não foi possível atualizar a categoria",
        variant: "destructive",
      });
    }
  };

  const handleDesativarCategoria = async (categoria: CategoriaEquipamento) => {
    if (!confirm(`Tem certeza que deseja ${categoria.ativo ? 'desativar' : 'ativar'} a categoria '${categoria.nome}'?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categorias_equipamentos_2025_12_13_01_00')
        .update({ ativo: !categoria.ativo })
        .eq('id', categoria.id);

      if (error) throw error;

      toast({
        title: categoria.ativo ? "Categoria desativada" : "Categoria ativada",
        description: `Categoria '${categoria.nome}' ${categoria.ativo ? 'desativada' : 'ativada'} com sucesso`,
      });

      loadCategorias();
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da categoria",
        variant: "destructive",
      });
    }
  };

  const handleEliminarCategoria = async (categoria: CategoriaEquipamento) => {
    // Verificar se há tipos de equipamentos associados
    const { data: tiposAssociados } = await supabase
      .from('tipos_equipamentos_2025_12_13_01_00')
      .select('id')
      .eq('categoria_id', categoria.id)
      .limit(1);

    if (tiposAssociados && tiposAssociados.length > 0) {
      toast({
        title: "Não é possível eliminar",
        description: "Esta categoria possui tipos de equipamentos associados. Desative-a em vez de eliminar.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`ATENÇÃO: Tem certeza que deseja eliminar permanentemente a categoria '${categoria.nome}'?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categorias_equipamentos_2025_12_13_01_00')
        .delete()
        .eq('id', categoria.id);

      if (error) throw error;

      toast({
        title: "Categoria eliminada",
        description: `Categoria '${categoria.nome}' eliminada permanentemente`,
      });

      loadCategorias();
    } catch (error) {
      console.error('Erro ao eliminar categoria:', error);
      toast({
        title: "Erro ao eliminar categoria",
        description: "Não foi possível eliminar a categoria",
        variant: "destructive",
      });
    }
  };

  // ========== FUNÇÕES CRUD PARA TIPOS DE EQUIPAMENTOS ==========
  
  const resetTipoForm = () => {
    setTipoForm({
      categoria_id: '',
      nome: '',
      descricao: '',
      codigo: '',
      unidade_medida: 'unidade',
      vida_util_meses: 12,
      requer_manutencao: false,
      intervalo_manutencao_dias: 30,
      valor_unitario: 0,
      fornecedor: '',
      observacoes: '',
      ativo: true
    });
  };

  const handleNovoTipo = () => {
    resetTipoForm();
    setTipoSelecionado(null);
    setShowNovoTipoDialog(true);
  };

  const handleEditarTipo = (tipo: TipoEquipamento) => {
    setTipoForm({
      categoria_id: tipo.categoria_id,
      nome: tipo.nome,
      descricao: tipo.descricao,
      codigo: tipo.codigo,
      unidade_medida: tipo.unidade_medida,
      vida_util_meses: tipo.vida_util_meses,
      requer_manutencao: tipo.requer_manutencao,
      intervalo_manutencao_dias: tipo.intervalo_manutencao_dias,
      valor_unitario: tipo.valor_unitario,
      fornecedor: tipo.fornecedor,
      observacoes: tipo.observacoes,
      ativo: tipo.ativo
    });
    setTipoSelecionado(tipo);
    setShowEditarTipoDialog(true);
  };

  const handleCriarTipo = async () => {
    try {
      // Validações
      if (!tipoForm.nome.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "O nome do tipo é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!tipoForm.categoria_id) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione uma categoria",
          variant: "destructive",
        });
        return;
      }

      if (!tipoForm.codigo.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "O código do tipo é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o código já existe
      const { data: existingTipo } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .select('id')
        .eq('codigo', tipoForm.codigo)
        .single();

      if (existingTipo) {
        toast({
          title: "Código duplicado",
          description: "Já existe um tipo com este código",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .insert([tipoForm]);

      if (error) throw error;

      toast({
        title: "Tipo criado",
        description: `Tipo '${tipoForm.nome}' criado com sucesso`,
      });

      setShowNovoTipoDialog(false);
      resetTipoForm();
      loadTiposEquipamentos();
    } catch (error) {
      console.error('Erro ao criar tipo:', error);
      toast({
        title: "Erro ao criar tipo",
        description: "Não foi possível criar o tipo",
        variant: "destructive",
      });
    }
  };

  const handleAtualizarTipo = async () => {
    if (!tipoSelecionado) return;

    try {
      // Validações
      if (!tipoForm.nome.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "O nome do tipo é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!tipoForm.categoria_id) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione uma categoria",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o código já existe (exceto no tipo atual)
      const { data: existingTipo } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .select('id')
        .eq('codigo', tipoForm.codigo)
        .neq('id', tipoSelecionado.id)
        .single();

      if (existingTipo) {
        toast({
          title: "Código duplicado",
          description: "Já existe um tipo com este código",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .update(tipoForm)
        .eq('id', tipoSelecionado.id);

      if (error) throw error;

      toast({
        title: "Tipo atualizado",
        description: `Tipo '${tipoForm.nome}' atualizado com sucesso`,
      });

      setShowEditarTipoDialog(false);
      resetTipoForm();
      setTipoSelecionado(null);
      loadTiposEquipamentos();
    } catch (error) {
      console.error('Erro ao atualizar tipo:', error);
      toast({
        title: "Erro ao atualizar tipo",
        description: "Não foi possível atualizar o tipo",
        variant: "destructive",
      });
    }
  };

  const handleDesativarTipo = async (tipo: TipoEquipamento) => {
    if (!confirm(`Tem certeza que deseja ${tipo.ativo ? 'desativar' : 'ativar'} o tipo '${tipo.nome}'?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .update({ ativo: !tipo.ativo })
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: tipo.ativo ? "Tipo desativado" : "Tipo ativado",
        description: `Tipo '${tipo.nome}' ${tipo.ativo ? 'desativado' : 'ativado'} com sucesso`,
      });

      loadTiposEquipamentos();
    } catch (error) {
      console.error('Erro ao alterar status do tipo:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do tipo",
        variant: "destructive",
      });
    }
  };

  const handleEliminarTipo = async (tipo: TipoEquipamento) => {
    // Verificar se há equipamentos associados
    const { data: equipamentosAssociados } = await supabase
      .from('equipamentos_2025_12_13_01_00')
      .select('id')
      .eq('tipo_equipamento_id', tipo.id)
      .limit(1);

    if (equipamentosAssociados && equipamentosAssociados.length > 0) {
      toast({
        title: "Não é possível eliminar",
        description: "Este tipo possui equipamentos associados. Desative-o em vez de eliminar.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`ATENÇÃO: Tem certeza que deseja eliminar permanentemente o tipo '${tipo.nome}'?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tipos_equipamentos_2025_12_13_01_00')
        .delete()
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: "Tipo eliminado",
        description: `Tipo '${tipo.nome}' eliminado permanentemente`,
      });

      loadTiposEquipamentos();
    } catch (error) {
      console.error('Erro ao eliminar tipo:', error);
      toast({
        title: "Erro ao eliminar tipo",
        description: "Não foi possível eliminar o tipo",
        variant: "destructive",
      });
    }
  };

  // ========== FUNÇÕES CRUD PARA ATRIBUIÇÕES ==========
  
  const loadVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('id, nome, email')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
    }
  };

  const resetAtribuicaoForm = () => {
    setAtribuicaoForm({
      equipamento_id: '',
      voluntario_id: '',
      data_atribuicao: new Date().toISOString().split('T')[0],
      data_devolucao_prevista: '',
      observacoes: ''
    });
  };

  const resetDevolucaoForm = () => {
    setDevolucaoForm({
      estado: 'devolvida',
      observacoes_devolucao: ''
    });
  };

  const handleNovaAtribuicao = (equipamento?: Equipamento) => {
    resetAtribuicaoForm();
    if (equipamento) {
      setEquipamentoParaAtribuir(equipamento);
      setAtribuicaoForm(prev => ({ ...prev, equipamento_id: equipamento.id }));
    }
    loadVoluntarios();
    setShowNovaAtribuicaoDialog(true);
  };

  const handleCriarAtribuicao = async () => {
    try {
      // Validações
      if (!atribuicaoForm.equipamento_id) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione um equipamento",
          variant: "destructive",
        });
        return;
      }

      if (!atribuicaoForm.voluntario_id) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione um voluntário",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o equipamento já está atribuído
      const { data: atribuicaoExistente } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .select('id')
        .eq('equipamento_id', atribuicaoForm.equipamento_id)
        .eq('estado', 'ativa')
        .single();

      if (atribuicaoExistente) {
        toast({
          title: "Equipamento já atribuído",
          description: "Este equipamento já está atribuído a outro voluntário",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .insert([{
          ...atribuicaoForm,
          estado: 'ativa',
          ativo: true
        }]);

      if (error) throw error;

      // Atualizar estado do equipamento para 'em_uso'
      await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ estado: 'em_uso' })
        .eq('id', atribuicaoForm.equipamento_id);

      toast({
        title: "Atribuição criada",
        description: "Equipamento atribuído com sucesso",
      });

      setShowNovaAtribuicaoDialog(false);
      resetAtribuicaoForm();
      setEquipamentoParaAtribuir(null);
      loadAtribuicoes();
      loadEquipamentos();
    } catch (error) {
      console.error('Erro ao criar atribuição:', error);
      toast({
        title: "Erro ao criar atribuição",
        description: "Não foi possível criar a atribuição",
        variant: "destructive",
      });
    }
  };

  const handleDevolverEquipamento = (atribuicao: AtribuicaoEquipamento) => {
    setAtribuicaoSelecionada(atribuicao);
    resetDevolucaoForm();
    setShowDevolverEquipamentoDialog(true);
  };

  const handleConfirmarDevolucao = async () => {
    if (!atribuicaoSelecionada) return;

    try {
      // Atualizar atribuição
      const { error: atribuicaoError } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .update({
          estado: devolucaoForm.estado,
          data_devolucao: new Date().toISOString().split('T')[0],
          observacoes_devolucao: devolucaoForm.observacoes_devolucao
        })
        .eq('id', atribuicaoSelecionada.id);

      if (atribuicaoError) throw atribuicaoError;

      // Atualizar estado do equipamento
      let novoEstadoEquipamento = 'disponivel';
      if (devolucaoForm.estado === 'perdida') {
        novoEstadoEquipamento = 'perdido';
      } else if (devolucaoForm.estado === 'danificada') {
        novoEstadoEquipamento = 'danificado';
      }

      await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ estado: novoEstadoEquipamento })
        .eq('id', atribuicaoSelecionada.equipamento_id);

      toast({
        title: "Devolução registada",
        description: `Equipamento devolvido como '${devolucaoForm.estado}'`,
      });

      setShowDevolverEquipamentoDialog(false);
      resetDevolucaoForm();
      setAtribuicaoSelecionada(null);
      loadAtribuicoes();
      loadEquipamentos();
    } catch (error) {
      console.error('Erro ao registar devolução:', error);
      toast({
        title: "Erro ao registar devolução",
        description: "Não foi possível registar a devolução",
        variant: "destructive",
      });
    }
  };

  const handleVerHistoricoAtribuicoes = (equipamento: Equipamento) => {
    setEquipamentoParaAtribuir(equipamento);
    setShowHistoricoAtribuicoesDialog(true);
  };

  const getAtribuicoesEquipamento = (equipamentoId: string) => {
    return atribuicoes.filter(a => a.equipamento_id === equipamentoId)
      .sort((a, b) => new Date(b.data_atribuicao).getTime() - new Date(a.data_atribuicao).getTime());
  };

  const getEstadoAtribuicaoBadge = (estado: string) => {
    const cores = {
      'ativa': 'bg-green-100 text-green-800',
      'devolvida': 'bg-blue-100 text-blue-800',
      'perdida': 'bg-red-100 text-red-800',
      'danificada': 'bg-orange-100 text-orange-800'
    };
    return cores[estado as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  // ===== FUNÇÕES CRUD PARA MANUTENÇÕES =====

  const resetManutencaoForm = () => {
    setManutencaoForm({
      equipamento_id: '',
      tipo_manutencao: 'Preventiva',
      data_manutencao: new Date().toISOString().split('T')[0],
      data_proxima_manutencao: '',
      descricao: '',
      custo: 0,
      fornecedor_servico: '',
      observacoes: ''
    });
  };

  const handleNovaManutencao = (equipamento?: Equipamento) => {
    resetManutencaoForm();
    if (equipamento) {
      setManutencaoForm(prev => ({ ...prev, equipamento_id: equipamento.id }));
    }
    setShowNovaManutencaoDialog(true);
  };

  const handleEditarManutencao = (manutencao: Manutencao) => {
    setManutencaoSelecionada(manutencao);
    setManutencaoForm({
      equipamento_id: manutencao.equipamento_id,
      tipo_manutencao: manutencao.tipo_manutencao,
      data_manutencao: manutencao.data_manutencao,
      data_proxima_manutencao: manutencao.data_proxima_manutencao,
      descricao: manutencao.descricao,
      custo: manutencao.custo,
      fornecedor_servico: manutencao.fornecedor_servico,
      observacoes: manutencao.observacoes
    });
    setShowEditarManutencaoDialog(true);
  };

  const handleCriarManutencao = async () => {
    try {
      // Validações
      if (!manutencaoForm.equipamento_id || !manutencaoForm.descricao || !manutencaoForm.data_manutencao) {
        toast({
          title: 'Erro de Validação',
          description: 'Equipamento, descrição e data são obrigatórios',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .insert({
          equipamento_id: manutencaoForm.equipamento_id,
          tipo_manutencao: manutencaoForm.tipo_manutencao,
          data_manutencao: manutencaoForm.data_manutencao,
          data_proxima_manutencao: manutencaoForm.data_proxima_manutencao || null,
          descricao: manutencaoForm.descricao,
          custo: manutencaoForm.custo,
          fornecedor_servico: manutencaoForm.fornecedor_servico,
          status: 'agendada',
          observacoes: manutencaoForm.observacoes
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Manutenção agendada com sucesso',
      });

      setShowNovaManutencaoDialog(false);
      resetManutencaoForm();
      loadManutencoes();
    } catch (error: any) {
      console.error('Erro ao criar manutenção:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao agendar manutenção',
        variant: 'destructive',
      });
    }
  };

  const handleAtualizarManutencao = async () => {
    if (!manutencaoSelecionada) return;

    try {
      const { error } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .update({
          tipo_manutencao: manutencaoForm.tipo_manutencao,
          data_manutencao: manutencaoForm.data_manutencao,
          data_proxima_manutencao: manutencaoForm.data_proxima_manutencao || null,
          descricao: manutencaoForm.descricao,
          custo: manutencaoForm.custo,
          fornecedor_servico: manutencaoForm.fornecedor_servico,
          observacoes: manutencaoForm.observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', manutencaoSelecionada.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Manutenção atualizada com sucesso',
      });

      setShowEditarManutencaoDialog(false);
      setManutencaoSelecionada(null);
      resetManutencaoForm();
      loadManutencoes();
    } catch (error: any) {
      console.error('Erro ao atualizar manutenção:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar manutenção',
        variant: 'destructive',
      });
    }
  };

  const handleConcluirManutencao = (manutencao: Manutencao) => {
    setManutencaoSelecionada(manutencao);
    setShowConcluirManutencaoDialog(true);
  };

  const handleConfirmarConclusao = async () => {
    if (!manutencaoSelecionada) return;

    try {
      const { error } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .update({
          status: 'concluida',
          updated_at: new Date().toISOString()
        })
        .eq('id', manutencaoSelecionada.id);

      if (error) throw error;

      // Se equipamento estava em manutenção, voltar para disponível
      if (manutencaoSelecionada.equipamento?.estado === 'manutencao') {
        await supabase
          .from('equipamentos_2025_12_13_01_00')
          .update({ estado: 'disponivel' })
          .eq('id', manutencaoSelecionada.equipamento_id);
      }

      toast({
        title: 'Sucesso',
        description: 'Manutenção concluída com sucesso',
      });

      setShowConcluirManutencaoDialog(false);
      setManutencaoSelecionada(null);
      loadManutencoes();
      loadEquipamentos();
    } catch (error: any) {
      console.error('Erro ao concluir manutenção:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao concluir manutenção',
        variant: 'destructive',
      });
    }
  };

  // ===== FUNÇÕES CRUD PARA ALERTAS =====

  const handleGerenciarAlertas = () => {
    setShowGerenciarAlertasDialog(true);
  };

  const handleResolverAlerta = (alerta: AlertaEquipamento) => {
    setAlertaSelecionado(alerta);
    setResolverAlertaForm({ observacoes_resolucao: '' });
    setShowResolverAlertaDialog(true);
  };

  const handleConfirmarResolucaoAlerta = async () => {
    if (!alertaSelecionado) return;

    try {
      const { error } = await supabase
        .from('alertas_equipamentos_2025_12_16_07_00')
        .update({
          status: 'resolvido',
          data_resolucao: new Date().toISOString(),
          observacoes_resolucao: resolverAlertaForm.observacoes_resolucao,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertaSelecionado.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Alerta resolvido com sucesso',
      });

      setShowResolverAlertaDialog(false);
      setAlertaSelecionado(null);
      loadAlertas();
    } catch (error: any) {
      console.error('Erro ao resolver alerta:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao resolver alerta',
        variant: 'destructive',
      });
    }
  };

  const handleIgnorarAlerta = async (alerta: AlertaEquipamento) => {
    try {
      const { error } = await supabase
        .from('alertas_equipamentos_2025_12_16_07_00')
        .update({
          status: 'ignorado',
          updated_at: new Date().toISOString()
        })
        .eq('id', alerta.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Alerta ignorado',
      });

      loadAlertas();
    } catch (error: any) {
      console.error('Erro ao ignorar alerta:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao ignorar alerta',
        variant: 'destructive',
      });
    }
  };

  const getPrioridadeAlertaBadge = (prioridade: string) => {
    const cores = {
      'baixa': 'bg-gray-100 text-gray-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return cores[prioridade as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  const getTipoAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'manutencao_vencida':
      case 'manutencao_proxima':
        return '🔧';
      case 'atribuicao_vencida':
        return '⏰';
      case 'equipamento_danificado':
        return '⚠️';
      case 'garantia_vencendo':
        return '📋';
      case 'stock_baixo':
        return '📦';
      case 'vida_util_esgotada':
        return '🔄';
      default:
        return '🔔';
    }
  };

  // ===== FUNÇÕES PARA RELATÓRIOS E DASHBOARD =====

  const loadKpisDashboard = async () => {
    try {
      const { data, error } = await supabase.rpc('calcular_kpis_dashboard');
      
      if (error) {
        console.error('Erro ao carregar KPIs:', error);
        return;
      }
      
      setKpisDashboard(data);
    } catch (error: any) {
      console.error('Erro ao carregar KPIs:', error);
    }
  };

  const loadRelatorioVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('relatorio_utilizacao_voluntarios')
        .select('*')
        .order('total_atribuicoes', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Erro ao carregar relatório de voluntários:', error);
        return;
      }
      
      setRelatorioVoluntarios(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar relatório de voluntários:', error);
    }
  };

  const loadRelatorioFinanceiro = async () => {
    try {
      const { data, error } = await supabase
        .from('relatorio_financeiro_equipamentos')
        .select('*')
        .order('custo_anual_total', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Erro ao carregar relatório financeiro:', error);
        return;
      }
      
      setRelatorioFinanceiro(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar relatório financeiro:', error);
    }
  };

  const loadAnaliseManutencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('analise_manutencoes')
        .select('*')
        .order('mes', { ascending: false })
        .limit(12);
      
      if (error) {
        console.error('Erro ao carregar análise de manutenções:', error);
        return;
      }
      
      setAnaliseManutencoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar análise de manutenções:', error);
    }
  };

  const loadAnaliseAlertas = async () => {
    try {
      const { data, error } = await supabase
        .from('analise_alertas')
        .select('*')
        .order('total_alertas', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar análise de alertas:', error);
        return;
      }
      
      setAnaliseAlertas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar análise de alertas:', error);
    }
  };

  const loadAnaliseAtribuicoes = async () => {
    try {
      const { data, error } = await supabase
        .from('analise_atribuicoes')
        .select('*')
        .order('mes', { ascending: false })
        .limit(12);
      
      if (error) {
        console.error('Erro ao carregar análise de atribuições:', error);
        return;
      }
      
      setAnaliseAtribuicoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar análise de atribuições:', error);
    }
  };

  const loadAllRelatorios = async () => {
    setLoadingRelatorios(true);
    try {
      await Promise.all([
        loadKpisDashboard(),
        loadRelatorioVoluntarios(),
        loadRelatorioFinanceiro(),
        loadAnaliseManutencoes(),
        loadAnaliseAlertas(),
        loadAnaliseAtribuicoes()
      ]);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoadingRelatorios(false);
    }
  };

  const handleGerarRelatorio = (tipo: string) => {
    setTipoRelatorioSelecionado(tipo);
    setShowRelatorioDialog(true);
  };

  const handleExportarRelatorio = async (tipo: string, formato: 'excel' | 'pdf') => {
    try {
      let dados: any[] = [];
      let nomeArquivo = '';
      
      switch (tipo) {
        case 'voluntarios':
          dados = relatorioVoluntarios;
          nomeArquivo = 'relatorio_utilizacao_voluntarios';
          break;
        case 'financeiro':
          dados = relatorioFinanceiro;
          nomeArquivo = 'relatorio_financeiro_equipamentos';
          break;
        case 'manutencoes':
          dados = analiseManutencoes;
          nomeArquivo = 'analise_manutencoes';
          break;
        case 'alertas':
          dados = analiseAlertas;
          nomeArquivo = 'analise_alertas';
          break;
        case 'atribuicoes':
          dados = analiseAtribuicoes;
          nomeArquivo = 'analise_atribuicoes';
          break;
        default:
          return;
      }
      
      if (formato === 'excel') {
        // Simular exportação para Excel
        const csvContent = convertToCSV(dados);
        downloadFile(csvContent, `${nomeArquivo}.csv`, 'text/csv');
      } else {
        // Simular exportação para PDF
        toast({
          title: 'Funcionalidade em Desenvolvimento',
          description: 'Exportação para PDF será implementada em breve',
        });
      }
      
      toast({
        title: 'Sucesso',
        description: `Relatório ${tipo} exportado com sucesso`,
      });
    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar relatório',
        variant: 'destructive',
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // ===== FUNÇÕES DAS MELHORIAS IMPLEMENTADAS =====

  // Funções de notificações
  const handleMarcarNotificacaoLida = async (notificacaoId: string) => {
    try {
      const { error } = await supabase.rpc('marcar_notificacao_lida', {
        p_notificacao_id: notificacaoId,
        p_usuario_id: user?.id
      });

      if (error) throw error;
      
      loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarcarTodasNotificacoesLidas = async () => {
    try {
      const { error } = await supabase.rpc('marcar_todas_notificacoes_lidas', {
        p_usuario_id: user?.id
      });

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas',
      });
      
      loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao marcar notificações como lidas',
        variant: 'destructive',
      });
    }
  };

  // Funções de backup
  const handleCriarBackupManual = async () => {
    try {
      const { data, error } = await supabase.rpc('criar_backup_manual');

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Backup manual criado com sucesso',
      });
      
      loadBackups();
    } catch (error) {
      console.error('Erro ao criar backup manual:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar backup manual',
        variant: 'destructive',
      });
    }
  };

  // Funções de configuração
  const handleAtualizarConfiguracao = async (chave: string, valor: any) => {
    try {
      const { error } = await supabase
        .from('configuracoes_sistema_2025_12_16_05_00')
        .update({
          valor: valor,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('chave', chave);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Configuração atualizada com sucesso',
      });
      
      loadConfiguracoesSistema();
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configuração',
        variant: 'destructive',
      });
    }
  };

  // Auto-refresh do dashboard
  React.useEffect(() => {
    if (!autoRefresh || activeTab !== 'dashboard') return;
    
    const interval = setInterval(() => {
      loadEstatisticas();
      loadKpisDashboard();
      loadNotificacoes();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, activeTab]);

  // Função para obter histórico de um equipamento
  const handleVerHistorico = async (equipamento: Equipamento) => {
    try {
      const { data, error } = await supabase.rpc('obter_historico_registro', {
        p_tabela: 'equipamentos_2025_12_13_01_00',
        p_registro_id: equipamento.id,
        p_limite: 20
      });

      if (error) throw error;
      
      // Aqui você pode abrir um modal com o histórico
      console.log('Histórico do equipamento:', data);
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
    }
  };

  // Função para exportar dados
  const handleExportarDados = (tipo: string) => {
    let dados: any[] = [];
    let nomeArquivo = '';
    
    switch (tipo) {
      case 'equipamentos':
        dados = equipamentos;
        nomeArquivo = 'equipamentos';
        break;
      case 'atribuicoes':
        dados = atribuicoes;
        nomeArquivo = 'atribuicoes';
        break;
      case 'manutencoes':
        dados = manutencoes;
        nomeArquivo = 'manutencoes';
        break;
      case 'alertas':
        dados = alertas;
        nomeArquivo = 'alertas';
        break;
      case 'auditoria':
        dados = auditoria;
        nomeArquivo = 'auditoria';
        break;
    }
    
    if (dados.length > 0) {
      const csv = convertToCSV(dados);
      downloadFile(csv, `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      
      toast({
        title: 'Sucesso',
        description: `Dados de ${nomeArquivo} exportados com sucesso`,
      });
    }
  };

  // Funções para desativar e eliminar equipamentos
  const handleDesativarEquipamento = async (equipamento: Equipamento) => {
    if (!confirm('Tem certeza que deseja desativar o equipamento "' + equipamento.codigo_interno + '"?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ ativo: false })
        .eq('id', equipamento.id);

      if (error) throw error;

      toast({
        title: "Equipamento desativado",
        description: 'Equipamento "' + (equipamento.numero_serie || equipamento.id) + '" foi desativado com sucesso',
      });

      loadEquipamentos();
    } catch (error) {
      console.error('Erro ao desativar equipamento:', error);
      toast({
        title: "Erro ao desativar",
        description: "Não foi possível desativar o equipamento",
        variant: "destructive",
      });
    }
  };

  const handleEliminarEquipamento = async (equipamento: Equipamento) => {
    if (!confirm(`ATENÇÃO: Tem certeza que deseja eliminar permanentemente o equipamento '${equipamento.codigo_interno}'?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .delete()
        .eq('id', equipamento.id);

      if (error) throw error;

      toast({
        title: "Equipamento eliminado",
        description: `Equipamento '${equipamento.numero_serie || equipamento.id}' foi eliminado permanentemente`,
      });

      loadEquipamentos();
    } catch (error) {
      console.error('Erro ao eliminar equipamento:', error);
      toast({
        title: "Erro ao eliminar",
        description: "Não foi possível eliminar o equipamento",
        variant: "destructive",
      });
    }
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
      
      {/* Barra de Notificações e Controles Avançados */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Indicador de Notificações */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNotificacoes(true)}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notificações
              {notificacoesNaoLidas > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center">
                  {notificacoesNaoLidas}
                </Badge>
              )}
            </Button>
            
            {/* Auto-refresh Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </Button>
              {autoRefresh && (
                <span className="text-sm text-gray-600">
                  {refreshInterval}s
                </span>
              )}
            </div>
            
            {/* Expandir Dashboard */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDashboardExpanded(!dashboardExpanded)}
            >
              {dashboardExpanded ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
              {dashboardExpanded ? 'Compactar' : 'Expandir'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botões de Ação Rápida */}
            <Button variant="outline" size="sm" onClick={() => setShowConfiguracoes(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setShowAuditoria(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Auditoria
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setShowBackups(true)}>
              <Save className="h-4 w-4 mr-2" />
              Backups
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleCriarBackupManual}>
              <Copy className="h-4 w-4 mr-2" />
              Backup Manual
            </Button>
          </div>
        </div>
      </div>
      
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
            <TabsList className="grid w-full grid-cols-6 bg-white p-1 rounded-lg shadow-sm">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="inventario" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Package className="h-4 w-4 mr-2" />
                Inventário
              </TabsTrigger>
              <TabsTrigger 
                value="atribuicoes" 
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                Atribuições
              </TabsTrigger>
              <TabsTrigger 
                value="manutencoes" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Manutenções
              </TabsTrigger>
              <TabsTrigger 
                value="alertas" 
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alertas
              </TabsTrigger>
              <TabsTrigger 
                value="relatorios" 
                className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Relatórios
              </TabsTrigger>
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
                      <Button 
                        onClick={loadEquipamentos} 
                        className="w-full" 
                        disabled={loadingStates.equipamentos}
                      >
                        {loadingStates.equipamentos ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4 mr-2" />
                        )}
                        {loadingStates.equipamentos ? 'Carregando...' : 'Pesquisar'}
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
                  {loadingStates.equipamentos ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-500 text-lg">Carregando equipamentos...</p>
                      <p className="text-gray-400">Por favor, aguarde</p>
                    </div>
                  ) : equipamentos.length === 0 ? (
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
                              <TableRow key={equipamento.id} className={getEstadoRowBackground(equipamento.estado)}>
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
                                  <div className="flex items-center justify-end space-x-1">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleVerEquipamento(equipamento)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleEditarEquipamento(equipamento)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    
                                    {/* Botões de Atribuição */}
                                    {equipamento.estado === 'disponivel' && equipamento.ativo ? (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleNovaAtribuicao(equipamento)}
                                        className="text-purple-600 hover:text-purple-700"
                                        title="Atribuir equipamento"
                                      >
                                        <User className="h-4 w-4" />
                                      </Button>
                                    ) : equipamento.estado === 'em_uso' ? (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleVerHistoricoAtribuicoes(equipamento)}
                                        className="text-indigo-600 hover:text-indigo-700"
                                        title="Ver histórico de atribuições"
                                      >
                                        <History className="h-4 w-4" />
                                      </Button>
                                    ) : null}
                                    
                                    {equipamento.ativo ? (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleDesativarEquipamento(equipamento)}
                                        className="text-orange-600 hover:text-orange-700"
                                        title="Desativar equipamento"
                                      >
                                        <Power className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">
                                        Inativo
                                      </Badge>
                                    )}
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleEliminarEquipamento(equipamento)}
                                      className="text-red-600 hover:text-red-700"
                                      title="Eliminar equipamento permanentemente"
                                    >
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Atribuições Tab */}
            <TabsContent value="atribuicoes" className="space-y-6">
              {/* Ações Rápidas */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestão de Atribuições</h3>
                <Button 
                  onClick={() => handleNovaAtribuicao()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atribuição
                </Button>
              </div>

              {/* Atribuições Ativas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Atribuições Ativas ({atribuicoes.filter(a => a.estado === 'ativa').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {atribuicoes.filter(a => a.estado === 'ativa').length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhuma atribuição ativa</p>
                      <p className="text-gray-400">Clique em "Nova Atribuição" para começar</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Equipamento</TableHead>
                            <TableHead>Voluntário</TableHead>
                            <TableHead>Data Atribuição</TableHead>
                            <TableHead>Devolução Prevista</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {atribuicoes.filter(a => a.estado === 'ativa').map((atribuicao) => {
                            const diasRestantes = atribuicao.data_devolucao_prevista 
                              ? Math.ceil((new Date(atribuicao.data_devolucao_prevista).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                              : null;
                            
                            return (
                              <TableRow key={atribuicao.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {atribuicao.equipamento?.codigo_interno || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {atribuicao.equipamento?.tipo_equipamento?.nome || 'Tipo não definido'}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {atribuicao.voluntario?.nome || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {atribuicao.voluntario?.email || ''}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}
                                </TableCell>
                                <TableCell>
                                  {atribuicao.data_devolucao_prevista ? (
                                    <div>
                                      <div>{new Date(atribuicao.data_devolucao_prevista).toLocaleDateString('pt-PT')}</div>
                                      {diasRestantes !== null && (
                                        <div className={`text-sm ${
                                          diasRestantes < 0 ? 'text-red-600' : 
                                          diasRestantes <= 7 ? 'text-orange-600' : 
                                          'text-gray-500'
                                        }`}>
                                          {diasRestantes < 0 ? `${Math.abs(diasRestantes)} dias em atraso` :
                                           diasRestantes === 0 ? 'Vence hoje' :
                                           `${diasRestantes} dias restantes`}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Não definida</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getEstadoAtribuicaoBadge(atribuicao.estado)}>
                                    {atribuicao.estado === 'ativa' ? 'Ativa' : atribuicao.estado}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleVerHistoricoAtribuicoes(atribuicao.equipamento!)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <History className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDevolverEquipamento(atribuicao)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
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

              {/* Histórico de Atribuições */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Histórico de Atribuições ({atribuicoes.filter(a => a.estado !== 'ativa').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {atribuicoes.filter(a => a.estado !== 'ativa').length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nenhuma atribuição no histórico</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {atribuicoes.filter(a => a.estado !== 'ativa').slice(0, 5).map((atribuicao) => (
                        <div key={atribuicao.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              atribuicao.estado === 'devolvida' ? 'bg-blue-100' :
                              atribuicao.estado === 'perdida' ? 'bg-red-100' :
                              'bg-orange-100'
                            }`}>
                              {atribuicao.estado === 'devolvida' ? (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              ) : atribuicao.estado === 'perdida' ? (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              ) : (
                                <Wrench className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {atribuicao.equipamento?.codigo_interno} - {atribuicao.voluntario?.nome}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')} - 
                                {atribuicao.data_devolucao ? new Date(atribuicao.data_devolucao).toLocaleDateString('pt-PT') : 'Em aberto'}
                              </div>
                            </div>
                          </div>
                          <Badge className={getEstadoAtribuicaoBadge(atribuicao.estado)}>
                            {atribuicao.estado === 'devolvida' ? 'Devolvida' :
                             atribuicao.estado === 'perdida' ? 'Perdida' : 'Danificada'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manutenções Tab */}
            <TabsContent value="manutencoes" className="space-y-6">
              {/* Ações Rápidas */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestão de Manutenções</h3>
                <div className="flex space-x-2">
                  <Button onClick={() => handleNovaManutencao()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Manutenção
                  </Button>
                </div>
              </div>

              {/* Manutenções Agendadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Manutenções Agendadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {manutencoes.filter(m => m.status === 'agendada').length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma manutenção agendada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {manutencoes.filter(m => m.status === 'agendada').map((manutencao) => (
                        <div key={manutencao.id} className="flex items-center justify-between p-4 rounded-lg border bg-blue-50">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {manutencao.equipamento?.codigo_interno} - {manutencao.tipo_manutencao}
                              </div>
                              <div className="text-sm text-gray-600">
                                {manutencao.descricao}
                              </div>
                              <div className="text-sm text-gray-500">
                                Agendada para: {new Date(manutencao.data_manutencao).toLocaleDateString('pt-PT')}
                                {manutencao.custo > 0 && ` • ${manutencao.custo.toFixed(2)}€`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditarManutencao(manutencao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConcluirManutencao(manutencao)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manutenções em Andamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-yellow-600" />
                    Em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {manutencoes.filter(m => m.status === 'em_andamento').length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nenhuma manutenção em andamento</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {manutencoes.filter(m => m.status === 'em_andamento').map((manutencao) => (
                        <div key={manutencao.id} className="flex items-center justify-between p-4 rounded-lg border bg-yellow-50">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-yellow-100 rounded-full">
                              <Wrench className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {manutencao.equipamento?.codigo_interno} - {manutencao.tipo_manutencao}
                              </div>
                              <div className="text-sm text-gray-600">
                                {manutencao.descricao}
                              </div>
                              <div className="text-sm text-gray-500">
                                Iniciada em: {new Date(manutencao.data_manutencao).toLocaleDateString('pt-PT')}
                                {manutencao.fornecedor_servico && ` • ${manutencao.fornecedor_servico}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Em Andamento
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConcluirManutencao(manutencao)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Histórico de Manutenções */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-green-600" />
                    Histórico (Concluídas)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {manutencoes.filter(m => m.status === 'concluida').length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nenhuma manutenção concluída</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {manutencoes.filter(m => m.status === 'concluida').slice(0, 5).map((manutencao) => (
                        <div key={manutencao.id} className="flex items-center justify-between p-4 rounded-lg border bg-green-50">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {manutencao.equipamento?.codigo_interno} - {manutencao.tipo_manutencao}
                              </div>
                              <div className="text-sm text-gray-600">
                                {manutencao.descricao}
                              </div>
                              <div className="text-sm text-gray-500">
                                Concluída em: {new Date(manutencao.data_manutencao).toLocaleDateString('pt-PT')}
                                {manutencao.custo > 0 && ` • ${manutencao.custo.toFixed(2)}€`}
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Concluída
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alertas Tab */}
            <TabsContent value="alertas" className="space-y-6">
              {/* Ações Rápidas */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sistema de Alertas Inteligente</h3>
                <div className="flex space-x-2">
                  <Button onClick={handleGerenciarAlertas} variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Alertas
                  </Button>
                </div>
              </div>

              {/* Alertas Críticos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Alertas Críticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertas.filter(a => a.prioridade === 'critica').length === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum alerta crítico</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alertas.filter(a => a.prioridade === 'critica').map((alerta) => (
                        <div key={alerta.id} className="flex items-center justify-between p-4 rounded-lg border bg-red-50 border-red-200">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getTipoAlertaIcon(alerta.tipo_alerta)}</div>
                            <div>
                              <div className="font-medium text-red-800">{alerta.titulo}</div>
                              <div className="text-sm text-red-600">{alerta.descricao}</div>
                              <div className="text-sm text-gray-500">
                                {alerta.equipamento?.codigo_interno} • {new Date(alerta.data_criacao).toLocaleDateString('pt-PT')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPrioridadeAlertaBadge(alerta.prioridade)}>
                              {alerta.prioridade.toUpperCase()}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolverAlerta(alerta)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleIgnorarAlerta(alerta)}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alertas de Alta Prioridade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-orange-600" />
                    Alertas de Alta Prioridade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertas.filter(a => a.prioridade === 'alta').length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nenhum alerta de alta prioridade</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alertas.filter(a => a.prioridade === 'alta').map((alerta) => (
                        <div key={alerta.id} className="flex items-center justify-between p-4 rounded-lg border bg-orange-50">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getTipoAlertaIcon(alerta.tipo_alerta)}</div>
                            <div>
                              <div className="font-medium">{alerta.titulo}</div>
                              <div className="text-sm text-gray-600">{alerta.descricao}</div>
                              <div className="text-sm text-gray-500">
                                {alerta.equipamento?.codigo_interno} • {new Date(alerta.data_criacao).toLocaleDateString('pt-PT')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPrioridadeAlertaBadge(alerta.prioridade)}>
                              {alerta.prioridade.toUpperCase()}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolverAlerta(alerta)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleIgnorarAlerta(alerta)}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Outros Alertas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" />
                    Outros Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertas.filter(a => a.prioridade === 'media' || a.prioridade === 'baixa').length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Nenhum outro alerta</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alertas.filter(a => a.prioridade === 'media' || a.prioridade === 'baixa').slice(0, 5).map((alerta) => (
                        <div key={alerta.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center space-x-4">
                            <div className="text-xl">{getTipoAlertaIcon(alerta.tipo_alerta)}</div>
                            <div>
                              <div className="font-medium">{alerta.titulo}</div>
                              <div className="text-sm text-gray-600">{alerta.descricao}</div>
                              <div className="text-sm text-gray-500">
                                {alerta.equipamento?.codigo_interno} • {new Date(alerta.data_criacao).toLocaleDateString('pt-PT')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPrioridadeAlertaBadge(alerta.prioridade)}>
                              {alerta.prioridade.toUpperCase()}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolverAlerta(alerta)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleIgnorarAlerta(alerta)}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dashboard e Relatórios Tab */}
            <TabsContent value="relatorios" className="space-y-6">
              {loadingRelatorios ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Carregando dashboard e relatórios...</p>
                </div>
              ) : (
                <>
                  {/* KPIs Dashboard */}
                  {kpisDashboard && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Dashboard de KPIs</h3>
                        <Button onClick={loadAllRelatorios} variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Atualizar
                        </Button>
                      </div>
                      
                      {/* Métricas Principais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-blue-100 text-sm font-medium">Total de Equipamentos</p>
                                <p className="text-3xl font-bold">{kpisDashboard.equipamentos?.total || 0}</p>
                              </div>
                              <Package className="h-8 w-8 text-blue-200" />
                            </div>
                            <div className="mt-4">
                              <p className="text-blue-100 text-sm">
                                Taxa de Utilização: {formatPercentage(kpisDashboard.equipamentos?.taxa_utilizacao || 0)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-green-100 text-sm font-medium">Valor do Inventário</p>
                                <p className="text-3xl font-bold">
                                  {formatCurrency(kpisDashboard.financeiro?.valor_total_inventario || 0)}
                                </p>
                              </div>
                              <DollarSign className="h-8 w-8 text-green-200" />
                            </div>
                            <div className="mt-4">
                              <p className="text-green-100 text-sm">
                                Custos Mês: {formatCurrency(kpisDashboard.financeiro?.custo_manutencoes_mes || 0)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-orange-100 text-sm font-medium">Alertas Ativos</p>
                                <p className="text-3xl font-bold">{kpisDashboard.alertas?.total_ativos || 0}</p>
                              </div>
                              <Bell className="h-8 w-8 text-orange-200" />
                            </div>
                            <div className="mt-4">
                              <p className="text-orange-100 text-sm">
                                Críticos: {kpisDashboard.alertas?.criticos || 0} | Altos: {kpisDashboard.alertas?.altos || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-purple-100 text-sm font-medium">Manutenções</p>
                                <p className="text-3xl font-bold">{kpisDashboard.manutencoes?.agendadas || 0}</p>
                              </div>
                              <Wrench className="h-8 w-8 text-purple-200" />
                            </div>
                            <div className="mt-4">
                              <p className="text-purple-100 text-sm">
                                Em Andamento: {kpisDashboard.manutencoes?.em_andamento || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Distribuição de Estados */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                              Distribuição por Estado
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-sm">Disponíveis</span>
                                </div>
                                <span className="font-medium">{kpisDashboard.equipamentos?.disponiveis || 0}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm">Em Uso</span>
                                </div>
                                <span className="font-medium">{kpisDashboard.equipamentos?.em_uso || 0}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm">Manutenção</span>
                                </div>
                                <span className="font-medium">{kpisDashboard.equipamentos?.manutencao || 0}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                              Atribuições do Mês
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Atribuições Ativas</span>
                                <span className="font-medium text-green-600">{kpisDashboard.atribuicoes?.ativas || 0}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Vencidas</span>
                                <span className="font-medium text-red-600">{kpisDashboard.atribuicoes?.vencidas || 0}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total do Mês</span>
                                <span className="font-medium">{kpisDashboard.atribuicoes?.total_mes || 0}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  
                  {/* Relatórios Disponíveis */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Relatórios Disponíveis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-blue-600" />
                            Utilização por Voluntário
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Análise detalhada da utilização de equipamentos por voluntário
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleGerarRelatorio('voluntarios')} 
                              className="flex-1"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button 
                              onClick={() => handleExportarRelatorio('voluntarios', 'excel')} 
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                            Relatório Financeiro
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Análise de custos, investimentos e ROI dos equipamentos
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleGerarRelatorio('financeiro')} 
                              className="flex-1"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button 
                              onClick={() => handleExportarRelatorio('financeiro', 'excel')} 
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Wrench className="h-5 w-5 mr-2 text-yellow-600" />
                            Análise de Manutenções
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Tendências, custos e eficiência das manutenções
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleGerarRelatorio('manutencoes')} 
                              className="flex-1"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button 
                              onClick={() => handleExportarRelatorio('manutencoes', 'excel')} 
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Bell className="h-5 w-5 mr-2 text-orange-600" />
                            Análise de Alertas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Padrões de alertas e tempo de resolução
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleGerarRelatorio('alertas')} 
                              className="flex-1"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button 
                              onClick={() => handleExportarRelatorio('alertas', 'excel')} 
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                            Análise de Atribuições
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Padrões de uso e eficiência das atribuições
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleGerarRelatorio('atribuicoes')} 
                              className="flex-1"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button 
                              onClick={() => handleExportarRelatorio('atribuicoes', 'excel')} 
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                            Relatório Completo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Relatório executivo com todas as métricas e análises
                          </p>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleGerarRelatorio('completo')} 
                              className="flex-1"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button 
                              onClick={() => handleExportarRelatorio('completo', 'excel')} 
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}
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
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleNovaCategoria}
                >
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditarCategoria(categoria)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDesativarCategoria(categoria)}
                                className={categoria.ativo ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                                title={categoria.ativo ? "Desativar categoria" : "Ativar categoria"}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEliminarCategoria(categoria)}
                                className="text-red-600 hover:text-red-700"
                              >
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
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleNovoTipo}
                >
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditarTipo(tipo)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDesativarTipo(tipo)}
                              className={tipo.ativo ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                              title={tipo.ativo ? "Desativar tipo" : "Ativar tipo"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEliminarTipo(tipo)}
                              className="text-red-600 hover:text-red-700"
                            >
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

      {/* Diálogo Nova Categoria */}
      <Dialog open={showNovaCategoriaDialog} onOpenChange={setShowNovaCategoriaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-600" />
              Nova Categoria de Equipamento
            </DialogTitle>
            <DialogDescription>
              Criar uma nova categoria para organizar os equipamentos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoria_nome">Nome da Categoria *</Label>
              <Input
                id="categoria_nome"
                value={categoriaForm.nome}
                onChange={(e) => setCategoriaForm({...categoriaForm, nome: e.target.value})}
                placeholder="Ex: EPI, Material de Resgate"
              />
            </div>
            
            <div>
              <Label htmlFor="categoria_descricao">Descrição</Label>
              <Textarea
                id="categoria_descricao"
                value={categoriaForm.descricao}
                onChange={(e) => setCategoriaForm({...categoriaForm, descricao: e.target.value})}
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="categoria_codigo">Código *</Label>
              <Input
                id="categoria_codigo"
                value={categoriaForm.codigo}
                onChange={(e) => setCategoriaForm({...categoriaForm, codigo: e.target.value.toUpperCase()})}
                placeholder="Ex: EPI, RESGATE"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria_cor">Cor</Label>
                <Input
                  id="categoria_cor"
                  type="color"
                  value={categoriaForm.cor}
                  onChange={(e) => setCategoriaForm({...categoriaForm, cor: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="categoria_icone">Ícone</Label>
                <Select 
                  value={categoriaForm.icone} 
                  onValueChange={(value) => setCategoriaForm({...categoriaForm, icone: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Package">Package</SelectItem>
                    <SelectItem value="Shield">Shield</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Heart">Heart</SelectItem>
                    <SelectItem value="Smartphone">Smartphone</SelectItem>
                    <SelectItem value="Shirt">Shirt</SelectItem>
                    <SelectItem value="Wrench">Wrench</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaCategoriaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarCategoria} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Categoria */}
      <Dialog open={showEditarCategoriaDialog} onOpenChange={setShowEditarCategoriaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Editar Categoria de Equipamento
            </DialogTitle>
            <DialogDescription>
              Modificar os dados da categoria selecionada
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_categoria_nome">Nome da Categoria *</Label>
              <Input
                id="edit_categoria_nome"
                value={categoriaForm.nome}
                onChange={(e) => setCategoriaForm({...categoriaForm, nome: e.target.value})}
                placeholder="Ex: EPI, Material de Resgate"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_categoria_descricao">Descrição</Label>
              <Textarea
                id="edit_categoria_descricao"
                value={categoriaForm.descricao}
                onChange={(e) => setCategoriaForm({...categoriaForm, descricao: e.target.value})}
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_categoria_codigo">Código *</Label>
              <Input
                id="edit_categoria_codigo"
                value={categoriaForm.codigo}
                onChange={(e) => setCategoriaForm({...categoriaForm, codigo: e.target.value.toUpperCase()})}
                placeholder="Ex: EPI, RESGATE"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_categoria_cor">Cor</Label>
                <Input
                  id="edit_categoria_cor"
                  type="color"
                  value={categoriaForm.cor}
                  onChange={(e) => setCategoriaForm({...categoriaForm, cor: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_categoria_icone">Ícone</Label>
                <Select 
                  value={categoriaForm.icone} 
                  onValueChange={(value) => setCategoriaForm({...categoriaForm, icone: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Package">Package</SelectItem>
                    <SelectItem value="Shield">Shield</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Heart">Heart</SelectItem>
                    <SelectItem value="Smartphone">Smartphone</SelectItem>
                    <SelectItem value="Shirt">Shirt</SelectItem>
                    <SelectItem value="Wrench">Wrench</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditarCategoriaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAtualizarCategoria} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Novo Tipo */}
      <Dialog open={showNovoTipoDialog} onOpenChange={setShowNovoTipoDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-600" />
              Novo Tipo de Equipamento
            </DialogTitle>
            <DialogDescription>
              Criar um novo tipo de equipamento associado a uma categoria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_categoria">Categoria *</Label>
                <Select 
                  value={tipoForm.categoria_id} 
                  onValueChange={(value) => setTipoForm({...tipoForm, categoria_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.filter(c => c.ativo).map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tipo_nome">Nome do Tipo *</Label>
                <Input
                  id="tipo_nome"
                  value={tipoForm.nome}
                  onChange={(e) => setTipoForm({...tipoForm, nome: e.target.value})}
                  placeholder="Ex: Luvas de Proteção"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tipo_descricao">Descrição</Label>
              <Textarea
                id="tipo_descricao"
                value={tipoForm.descricao}
                onChange={(e) => setTipoForm({...tipoForm, descricao: e.target.value})}
                placeholder="Descrição detalhada do tipo de equipamento"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo_codigo">Código *</Label>
                <Input
                  id="tipo_codigo"
                  value={tipoForm.codigo}
                  onChange={(e) => setTipoForm({...tipoForm, codigo: e.target.value.toUpperCase()})}
                  placeholder="Ex: EPI_LUVAS"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_unidade">Unidade de Medida</Label>
                <Select 
                  value={tipoForm.unidade_medida} 
                  onValueChange={(value) => setTipoForm({...tipoForm, unidade_medida: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="par">Par</SelectItem>
                    <SelectItem value="conjunto">Conjunto</SelectItem>
                    <SelectItem value="rolo">Rolo</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tipo_vida_util">Vida Útil (meses)</Label>
                <Input
                  id="tipo_vida_util"
                  type="number"
                  value={tipoForm.vida_util_meses}
                  onChange={(e) => setTipoForm({...tipoForm, vida_util_meses: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo_valor">Valor Unitário (€)</Label>
                <Input
                  id="tipo_valor"
                  type="number"
                  step="0.01"
                  value={tipoForm.valor_unitario}
                  onChange={(e) => setTipoForm({...tipoForm, valor_unitario: parseFloat(e.target.value) || 0})}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_fornecedor">Fornecedor</Label>
                <Input
                  id="tipo_fornecedor"
                  value={tipoForm.fornecedor}
                  onChange={(e) => setTipoForm({...tipoForm, fornecedor: e.target.value})}
                  placeholder="Nome do fornecedor"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="tipo_requer_manutencao"
                  checked={tipoForm.requer_manutencao}
                  onChange={(e) => setTipoForm({...tipoForm, requer_manutencao: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="tipo_requer_manutencao">Requer manutenção periódica</Label>
              </div>
              
              {tipoForm.requer_manutencao && (
                <div>
                  <Label htmlFor="tipo_intervalo">Intervalo de Manutenção (dias)</Label>
                  <Input
                    id="tipo_intervalo"
                    type="number"
                    value={tipoForm.intervalo_manutencao_dias}
                    onChange={(e) => setTipoForm({...tipoForm, intervalo_manutencao_dias: parseInt(e.target.value) || 0})}
                    min="1"
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="tipo_observacoes">Observações</Label>
              <Textarea
                id="tipo_observacoes"
                value={tipoForm.observacoes}
                onChange={(e) => setTipoForm({...tipoForm, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre o tipo"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoTipoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarTipo} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar Tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Tipo */}
      <Dialog open={showEditarTipoDialog} onOpenChange={setShowEditarTipoDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Editar Tipo de Equipamento
            </DialogTitle>
            <DialogDescription>
              Modificar os dados do tipo de equipamento selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_tipo_categoria">Categoria *</Label>
                <Select 
                  value={tipoForm.categoria_id} 
                  onValueChange={(value) => setTipoForm({...tipoForm, categoria_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.filter(c => c.ativo).map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_tipo_nome">Nome do Tipo *</Label>
                <Input
                  id="edit_tipo_nome"
                  value={tipoForm.nome}
                  onChange={(e) => setTipoForm({...tipoForm, nome: e.target.value})}
                  placeholder="Ex: Luvas de Proteção"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_tipo_descricao">Descrição</Label>
              <Textarea
                id="edit_tipo_descricao"
                value={tipoForm.descricao}
                onChange={(e) => setTipoForm({...tipoForm, descricao: e.target.value})}
                placeholder="Descrição detalhada do tipo de equipamento"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_tipo_codigo">Código *</Label>
                <Input
                  id="edit_tipo_codigo"
                  value={tipoForm.codigo}
                  onChange={(e) => setTipoForm({...tipoForm, codigo: e.target.value.toUpperCase()})}
                  placeholder="Ex: EPI_LUVAS"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_tipo_unidade">Unidade de Medida</Label>
                <Select 
                  value={tipoForm.unidade_medida} 
                  onValueChange={(value) => setTipoForm({...tipoForm, unidade_medida: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="par">Par</SelectItem>
                    <SelectItem value="conjunto">Conjunto</SelectItem>
                    <SelectItem value="rolo">Rolo</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_tipo_vida_util">Vida Útil (meses)</Label>
                <Input
                  id="edit_tipo_vida_util"
                  type="number"
                  value={tipoForm.vida_util_meses}
                  onChange={(e) => setTipoForm({...tipoForm, vida_util_meses: parseInt(e.target.value) || 0})}
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_tipo_valor">Valor Unitário (€)</Label>
                <Input
                  id="edit_tipo_valor"
                  type="number"
                  step="0.01"
                  value={tipoForm.valor_unitario}
                  onChange={(e) => setTipoForm({...tipoForm, valor_unitario: parseFloat(e.target.value) || 0})}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_tipo_fornecedor">Fornecedor</Label>
                <Input
                  id="edit_tipo_fornecedor"
                  value={tipoForm.fornecedor}
                  onChange={(e) => setTipoForm({...tipoForm, fornecedor: e.target.value})}
                  placeholder="Nome do fornecedor"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_tipo_requer_manutencao"
                  checked={tipoForm.requer_manutencao}
                  onChange={(e) => setTipoForm({...tipoForm, requer_manutencao: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="edit_tipo_requer_manutencao">Requer manutenção periódica</Label>
              </div>
              
              {tipoForm.requer_manutencao && (
                <div>
                  <Label htmlFor="edit_tipo_intervalo">Intervalo de Manutenção (dias)</Label>
                  <Input
                    id="edit_tipo_intervalo"
                    type="number"
                    value={tipoForm.intervalo_manutencao_dias}
                    onChange={(e) => setTipoForm({...tipoForm, intervalo_manutencao_dias: parseInt(e.target.value) || 0})}
                    min="1"
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="edit_tipo_observacoes">Observações</Label>
              <Textarea
                id="edit_tipo_observacoes"
                value={tipoForm.observacoes}
                onChange={(e) => setTipoForm({...tipoForm, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre o tipo"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditarTipoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAtualizarTipo} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Nova Atribuição */}
      <Dialog open={showNovaAtribuicaoDialog} onOpenChange={setShowNovaAtribuicaoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Nova Atribuição de Equipamento
            </DialogTitle>
            <DialogDescription>
              Atribuir equipamento a um voluntário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="atribuicao_equipamento">Equipamento *</Label>
              <Select 
                value={atribuicaoForm.equipamento_id} 
                onValueChange={(value) => setAtribuicaoForm({...atribuicaoForm, equipamento_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipamentos.filter(e => e.estado === 'disponivel' && e.ativo).map((equipamento) => (
                    <SelectItem key={equipamento.id} value={equipamento.id}>
                      {equipamento.codigo_interno} - {equipamento.tipo_equipamento?.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="atribuicao_voluntario">Voluntário *</Label>
              <Select 
                value={atribuicaoForm.voluntario_id} 
                onValueChange={(value) => setAtribuicaoForm({...atribuicaoForm, voluntario_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar voluntário" />
                </SelectTrigger>
                <SelectContent>
                  {voluntarios.map((voluntario) => (
                    <SelectItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.nome} - {voluntario.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="atribuicao_data">Data de Atribuição *</Label>
                <Input
                  id="atribuicao_data"
                  type="date"
                  value={atribuicaoForm.data_atribuicao}
                  onChange={(e) => setAtribuicaoForm({...atribuicaoForm, data_atribuicao: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="atribuicao_devolucao_prevista">Devolução Prevista</Label>
                <Input
                  id="atribuicao_devolucao_prevista"
                  type="date"
                  value={atribuicaoForm.data_devolucao_prevista}
                  onChange={(e) => setAtribuicaoForm({...atribuicaoForm, data_devolucao_prevista: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="atribuicao_observacoes">Observações</Label>
              <Textarea
                id="atribuicao_observacoes"
                value={atribuicaoForm.observacoes}
                onChange={(e) => setAtribuicaoForm({...atribuicaoForm, observacoes: e.target.value})}
                placeholder="Motivo da atribuição, instruções especiais, etc."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaAtribuicaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarAtribuicao} className="bg-purple-600 hover:bg-purple-700">
              <User className="h-4 w-4 mr-2" />
              Atribuir Equipamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Devolver Equipamento */}
      <Dialog open={showDevolverEquipamentoDialog} onOpenChange={setShowDevolverEquipamentoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Devolver Equipamento
            </DialogTitle>
            <DialogDescription>
              Registar a devolução do equipamento
            </DialogDescription>
          </DialogHeader>
          
          {atribuicaoSelecionada && (
            <div className="space-y-4">
              {/* Informações da Atribuição */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium">
                  {atribuicaoSelecionada.equipamento?.codigo_interno} - {atribuicaoSelecionada.equipamento?.tipo_equipamento?.nome}
                </div>
                <div className="text-sm text-gray-600">
                  Atribuído a: {atribuicaoSelecionada.voluntario?.nome}
                </div>
                <div className="text-sm text-gray-600">
                  Desde: {new Date(atribuicaoSelecionada.data_atribuicao).toLocaleDateString('pt-PT')}
                </div>
              </div>
              
              <div>
                <Label htmlFor="devolucao_estado">Estado da Devolução *</Label>
                <Select 
                  value={devolucaoForm.estado} 
                  onValueChange={(value: 'devolvida' | 'perdida' | 'danificada') => 
                    setDevolucaoForm({...devolucaoForm, estado: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devolvida">Devolvida (Bom Estado)</SelectItem>
                    <SelectItem value="danificada">Devolvida (Danificada)</SelectItem>
                    <SelectItem value="perdida">Perdida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="devolucao_observacoes">Observações da Devolução</Label>
                <Textarea
                  id="devolucao_observacoes"
                  value={devolucaoForm.observacoes_devolucao}
                  onChange={(e) => setDevolucaoForm({...devolucaoForm, observacoes_devolucao: e.target.value})}
                  placeholder="Estado do equipamento, danos encontrados, etc."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDevolverEquipamentoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarDevolucao} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Histórico de Atribuições */}
      <Dialog open={showHistoricoAtribuicoesDialog} onOpenChange={setShowHistoricoAtribuicoesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-indigo-600" />
              Histórico de Atribuições
            </DialogTitle>
            <DialogDescription>
              {equipamentoParaAtribuir && (
                `Histórico completo do equipamento ${equipamentoParaAtribuir.codigo_interno}`
              )}
            </DialogDescription>
          </DialogHeader>
          
          {equipamentoParaAtribuir && (
            <div className="space-y-4">
              {/* Informações do Equipamento */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">{equipamentoParaAtribuir.codigo_interno}</div>
                    <div className="text-sm text-gray-600">{equipamentoParaAtribuir.tipo_equipamento?.nome}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Estado Atual</div>
                    <Badge className={getEstadoRowBackground(equipamentoParaAtribuir.estado)}>
                      {equipamentoParaAtribuir.estado}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Lista de Atribuições */}
              <div>
                <h4 className="font-medium mb-3">Histórico de Atribuições</h4>
                {getAtribuicoesEquipamento(equipamentoParaAtribuir.id).length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma atribuição registada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getAtribuicoesEquipamento(equipamentoParaAtribuir.id).map((atribuicao, index) => (
                      <div key={atribuicao.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <div>
                              <div className="font-medium">{atribuicao.voluntario?.nome}</div>
                              <div className="text-sm text-gray-600">{atribuicao.voluntario?.email}</div>
                            </div>
                          </div>
                          <Badge className={getEstadoAtribuicaoBadge(atribuicao.estado)}>
                            {atribuicao.estado === 'ativa' ? 'Ativa' :
                             atribuicao.estado === 'devolvida' ? 'Devolvida' :
                             atribuicao.estado === 'perdida' ? 'Perdida' : 'Danificada'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Atribuição:</span> {new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}
                          </div>
                          <div>
                            <span className="text-gray-600">Devolução:</span> 
                            {atribuicao.data_devolucao ? new Date(atribuicao.data_devolucao).toLocaleDateString('pt-PT') : 'Em aberto'}
                          </div>
                        </div>
                        
                        {atribuicao.observacoes && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Observações:</span> {atribuicao.observacoes}
                          </div>
                        )}
                        
                        {atribuicao.observacoes_devolucao && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Observações da Devolução:</span> {atribuicao.observacoes_devolucao}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoricoAtribuicoesDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Nova Manutenção */}
      <Dialog open={showNovaManutencaoDialog} onOpenChange={setShowNovaManutencaoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-blue-600" />
              Nova Manutenção
            </DialogTitle>
            <DialogDescription>
              Agendar nova manutenção para equipamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manutencao_equipamento">Equipamento *</Label>
                <Select 
                  value={manutencaoForm.equipamento_id} 
                  onValueChange={(value) => setManutencaoForm({...manutencaoForm, equipamento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos.filter(e => e.ativo).map((equipamento) => (
                      <SelectItem key={equipamento.id} value={equipamento.id}>
                        {equipamento.codigo_interno} - {equipamento.tipo_equipamento?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="manutencao_tipo">Tipo de Manutenção *</Label>
                <Select 
                  value={manutencaoForm.tipo_manutencao} 
                  onValueChange={(value) => setManutencaoForm({...manutencaoForm, tipo_manutencao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                    <SelectItem value="Preditiva">Preditiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manutencao_data">Data da Manutenção *</Label>
                <Input
                  id="manutencao_data"
                  type="date"
                  value={manutencaoForm.data_manutencao}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, data_manutencao: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="manutencao_proxima">Próxima Manutenção</Label>
                <Input
                  id="manutencao_proxima"
                  type="date"
                  value={manutencaoForm.data_proxima_manutencao}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, data_proxima_manutencao: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manutencao_custo">Custo Estimado (€)</Label>
                <Input
                  id="manutencao_custo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={manutencaoForm.custo}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, custo: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="manutencao_fornecedor">Fornecedor/Técnico</Label>
                <Input
                  id="manutencao_fornecedor"
                  value={manutencaoForm.fornecedor_servico}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, fornecedor_servico: e.target.value})}
                  placeholder="Nome do fornecedor ou técnico"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="manutencao_descricao">Descrição *</Label>
              <Textarea
                id="manutencao_descricao"
                value={manutencaoForm.descricao}
                onChange={(e) => setManutencaoForm({...manutencaoForm, descricao: e.target.value})}
                placeholder="Descreva o tipo de manutenção a ser realizada"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="manutencao_observacoes">Observações</Label>
              <Textarea
                id="manutencao_observacoes"
                value={manutencaoForm.observacoes}
                onChange={(e) => setManutencaoForm({...manutencaoForm, observacoes: e.target.value})}
                placeholder="Observações adicionais, instruções especiais, etc."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaManutencaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarManutencao} className="bg-blue-600 hover:bg-blue-700">
              <Wrench className="h-4 w-4 mr-2" />
              Agendar Manutenção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Manutenção */}
      <Dialog open={showEditarManutencaoDialog} onOpenChange={setShowEditarManutencaoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Editar Manutenção
            </DialogTitle>
            <DialogDescription>
              Editar informações da manutenção agendada
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_manutencao_equipamento">Equipamento *</Label>
                <Select 
                  value={manutencaoForm.equipamento_id} 
                  onValueChange={(value) => setManutencaoForm({...manutencaoForm, equipamento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos.filter(e => e.ativo).map((equipamento) => (
                      <SelectItem key={equipamento.id} value={equipamento.id}>
                        {equipamento.codigo_interno} - {equipamento.tipo_equipamento?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_manutencao_tipo">Tipo de Manutenção *</Label>
                <Select 
                  value={manutencaoForm.tipo_manutencao} 
                  onValueChange={(value) => setManutencaoForm({...manutencaoForm, tipo_manutencao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                    <SelectItem value="Preditiva">Preditiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_manutencao_data">Data da Manutenção *</Label>
                <Input
                  id="edit_manutencao_data"
                  type="date"
                  value={manutencaoForm.data_manutencao}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, data_manutencao: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_manutencao_proxima">Próxima Manutenção</Label>
                <Input
                  id="edit_manutencao_proxima"
                  type="date"
                  value={manutencaoForm.data_proxima_manutencao}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, data_proxima_manutencao: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_manutencao_custo">Custo Estimado (€)</Label>
                <Input
                  id="edit_manutencao_custo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={manutencaoForm.custo}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, custo: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_manutencao_fornecedor">Fornecedor/Técnico</Label>
                <Input
                  id="edit_manutencao_fornecedor"
                  value={manutencaoForm.fornecedor_servico}
                  onChange={(e) => setManutencaoForm({...manutencaoForm, fornecedor_servico: e.target.value})}
                  placeholder="Nome do fornecedor ou técnico"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_manutencao_descricao">Descrição *</Label>
              <Textarea
                id="edit_manutencao_descricao"
                value={manutencaoForm.descricao}
                onChange={(e) => setManutencaoForm({...manutencaoForm, descricao: e.target.value})}
                placeholder="Descreva o tipo de manutenção a ser realizada"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit_manutencao_observacoes">Observações</Label>
              <Textarea
                id="edit_manutencao_observacoes"
                value={manutencaoForm.observacoes}
                onChange={(e) => setManutencaoForm({...manutencaoForm, observacoes: e.target.value})}
                placeholder="Observações adicionais, instruções especiais, etc."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditarManutencaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAtualizarManutencao} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Manutenção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Concluir Manutenção */}
      <Dialog open={showConcluirManutencaoDialog} onOpenChange={setShowConcluirManutencaoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Concluir Manutenção
            </DialogTitle>
            <DialogDescription>
              Marcar manutenção como concluída
            </DialogDescription>
          </DialogHeader>
          
          {manutencaoSelecionada && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium">
                  {manutencaoSelecionada.equipamento?.codigo_interno} - {manutencaoSelecionada.tipo_manutencao}
                </div>
                <div className="text-sm text-gray-600">
                  {manutencaoSelecionada.descricao}
                </div>
                <div className="text-sm text-gray-500">
                  Agendada para: {new Date(manutencaoSelecionada.data_manutencao).toLocaleDateString('pt-PT')}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                Tem certeza que deseja marcar esta manutenção como concluída?
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConcluirManutencaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarConclusao} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluir Manutenção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Resolver Alerta */}
      <Dialog open={showResolverAlertaDialog} onOpenChange={setShowResolverAlertaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Resolver Alerta
            </DialogTitle>
            <DialogDescription>
              Marcar alerta como resolvido
            </DialogDescription>
          </DialogHeader>
          
          {alertaSelecionado && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-xl">{getTipoAlertaIcon(alertaSelecionado.tipo_alerta)}</div>
                  <div className="font-medium">{alertaSelecionado.titulo}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {alertaSelecionado.descricao}
                </div>
                <div className="text-sm text-gray-500">
                  Equipamento: {alertaSelecionado.equipamento?.codigo_interno}
                </div>
              </div>
              
              <div>
                <Label htmlFor="resolucao_observacoes">Observações da Resolução</Label>
                <Textarea
                  id="resolucao_observacoes"
                  value={resolverAlertaForm.observacoes_resolucao}
                  onChange={(e) => setResolverAlertaForm({...resolverAlertaForm, observacoes_resolucao: e.target.value})}
                  placeholder="Descreva como o problema foi resolvido"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolverAlertaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarResolucaoAlerta} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolver Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Gerenciar Alertas */}
      <Dialog open={showGerenciarAlertasDialog} onOpenChange={setShowGerenciarAlertasDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Gerenciar Alertas
            </DialogTitle>
            <DialogDescription>
              Configurar e visualizar todos os alertas do sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Resumo de Alertas */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {alertas.filter(a => a.prioridade === 'critica').length}
                </div>
                <div className="text-sm text-red-600">Críticos</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {alertas.filter(a => a.prioridade === 'alta').length}
                </div>
                <div className="text-sm text-orange-600">Alta Prioridade</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {alertas.filter(a => a.prioridade === 'media').length}
                </div>
                <div className="text-sm text-yellow-600">Média Prioridade</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {alertas.filter(a => a.prioridade === 'baixa').length}
                </div>
                <div className="text-sm text-blue-600">Baixa Prioridade</div>
              </div>
            </div>
            
            {/* Lista de Todos os Alertas */}
            <div>
              <h4 className="font-medium mb-3">Todos os Alertas Ativos</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alertas.map((alerta) => (
                  <div key={alerta.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{getTipoAlertaIcon(alerta.tipo_alerta)}</div>
                      <div>
                        <div className="font-medium text-sm">{alerta.titulo}</div>
                        <div className="text-xs text-gray-600">{alerta.equipamento?.codigo_interno}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPrioridadeAlertaBadge(alerta.prioridade)} size="sm">
                        {alerta.prioridade}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowGerenciarAlertasDialog(false);
                          handleResolverAlerta(alerta);
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGerenciarAlertasDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Relatórios Detalhados */}
      <Dialog open={showRelatorioDialog} onOpenChange={setShowRelatorioDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Relatório Detalhado - {tipoRelatorioSelecionado}
            </DialogTitle>
            <DialogDescription>
              Análise completa e detalhada dos dados selecionados
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Relatório de Voluntários */}
            {tipoRelatorioSelecionado === 'voluntarios' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Utilização por Voluntário</h4>
                  <Button 
                    onClick={() => handleExportarRelatorio('voluntarios', 'excel')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Voluntário</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Total Atribuições</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Ativas</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Devolvidas</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Perdidos</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Danificados</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Equipamentos Diferentes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorioVoluntarios.map((voluntario, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <div className="font-medium">{voluntario.voluntario_nome}</div>
                              <div className="text-sm text-gray-600">{voluntario.voluntario_email}</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {voluntario.total_atribuicoes}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-green-100 text-green-800">
                              {voluntario.atribuicoes_ativas}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-blue-100 text-blue-800">
                              {voluntario.atribuicoes_devolvidas}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-red-100 text-red-800">
                              {voluntario.equipamentos_perdidos}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-orange-100 text-orange-800">
                              {voluntario.equipamentos_danificados}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {voluntario.equipamentos_diferentes_utilizados}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Relatório Financeiro */}
            {tipoRelatorioSelecionado === 'financeiro' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Análise Financeira de Equipamentos</h4>
                  <Button 
                    onClick={() => handleExportarRelatorio('financeiro', 'excel')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Equipamento</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Valor Aquisição</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Custo Manutenções</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Custo Anual</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Idade (Anos)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Total Atribuições</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorioFinanceiro.map((equipamento, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <div className="font-medium">{equipamento.codigo_interno}</div>
                              <div className="text-sm text-gray-600">{equipamento.tipo_equipamento}</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {formatCurrency(equipamento.valor_aquisicao || 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {formatCurrency(equipamento.custo_total_manutencoes || 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {formatCurrency(equipamento.custo_anual_total || 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {(equipamento.idade_anos || 0).toFixed(1)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {equipamento.total_atribuicoes}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className={getEstadoRowBackground(equipamento.estado)}>
                              {equipamento.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Análise de Manutenções */}
            {tipoRelatorioSelecionado === 'manutencoes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Análise de Manutenções por Mês</h4>
                  <Button 
                    onClick={() => handleExportarRelatorio('manutencoes', 'excel')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Mês</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Preventivas</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Corretivas</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Custo Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Custo Médio</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Concluídas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analiseManutencoes.map((mes, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {new Date(mes.mes).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long' })}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {mes.total_manutencoes}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-green-100 text-green-800">
                              {mes.manutencoes_preventivas}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-orange-100 text-orange-800">
                              {mes.manutencoes_corretivas}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {formatCurrency(mes.custo_total_mes || 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {formatCurrency(mes.custo_medio_manutencao || 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-blue-100 text-blue-800">
                              {mes.manutencoes_concluidas}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Análise de Alertas */}
            {tipoRelatorioSelecionado === 'alertas' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Análise de Alertas por Tipo e Prioridade</h4>
                  <Button 
                    onClick={() => handleExportarRelatorio('alertas', 'excel')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Alerta</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Prioridade</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Ativos</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Resolvidos</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Tempo Médio Resolução</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analiseAlertas.map((alerta, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getTipoAlertaIcon(alerta.tipo_alerta)}</span>
                              <span className="font-medium">{alerta.tipo_alerta.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className={getPrioridadeAlertaBadge(alerta.prioridade)}>
                              {alerta.prioridade.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {alerta.total_alertas}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-red-100 text-red-800">
                              {alerta.alertas_ativos}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-green-100 text-green-800">
                              {alerta.alertas_resolvidos}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {alerta.tempo_medio_resolucao_dias ? `${alerta.tempo_medio_resolucao_dias.toFixed(1)} dias` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Análise de Atribuições */}
            {tipoRelatorioSelecionado === 'atribuicoes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Análise de Atribuições por Mês</h4>
                  <Button 
                    onClick={() => handleExportarRelatorio('atribuicoes', 'excel')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Mês</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Total Atribuições</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Ativas</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Devolvidas</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Perdidas</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Tempo Médio Uso</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Voluntários Únicos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analiseAtribuicoes.map((mes, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {new Date(mes.mes).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long' })}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {mes.total_atribuicoes}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-green-100 text-green-800">
                              {mes.atribuicoes_ativas}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-blue-100 text-blue-800">
                              {mes.atribuicoes_devolvidas}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <Badge className="bg-red-100 text-red-800">
                              {mes.equipamentos_perdidos}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {mes.tempo_medio_uso_dias ? `${mes.tempo_medio_uso_dias.toFixed(1)} dias` : 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {mes.voluntarios_unicos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRelatorioDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Notificações */}
      <Dialog open={showNotificacoes} onOpenChange={setShowNotificacoes}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Notificações ({notificacoesNaoLidas} não lidas)
              </div>
              <Button variant="outline" size="sm" onClick={handleMarcarTodasNotificacoesLidas}>
                Marcar todas como lidas
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {notificacoes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div 
                  key={notificacao.id} 
                  className={`p-4 rounded-lg border ${
                    notificacao.lida ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPrioridadeAlertaBadge(notificacao.prioridade)}>
                          {notificacao.prioridade.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(notificacao.created_at).toLocaleString('pt-PT')}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{notificacao.titulo}</h4>
                      <p className="text-sm text-gray-600">{notificacao.mensagem}</p>
                    </div>
                    {!notificacao.lida && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarcarNotificacaoLida(notificacao.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificacoes(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Configurações */}
      <Dialog open={showConfiguracoes} onOpenChange={setShowConfiguracoes}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Configurações do Sistema
            </DialogTitle>
            <DialogDescription>
              Configure as preferências e parâmetros do sistema de equipamentos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Configurações de Interface */}
            <div>
              <h4 className="font-medium mb-3">Interface</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intervalo de Atualização (segundos)</Label>
                  <Input 
                    type="number" 
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    min="10"
                    max="300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auto-refresh</Label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Atualização automática do dashboard</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Configurações de Notificações */}
            <div>
              <h4 className="font-medium mb-3">Notificações</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Notificações em Tempo Real</p>
                    <p className="text-sm text-gray-600">Receber notificações instantâneas</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Alertas de Manutenção</p>
                    <p className="text-sm text-gray-600">Notificar sobre manutenções vencidas</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Relatórios Automáticos</p>
                    <p className="text-sm text-gray-600">Receber relatórios semanais por email</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </div>
            
            {/* Configurações de Backup */}
            <div>
              <h4 className="font-medium mb-3">Backup e Segurança</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Backup Automático</p>
                    <p className="text-sm text-gray-600">Backup diário automático dos dados</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Auditoria Detalhada</p>
                    <p className="text-sm text-gray-600">Registrar todas as operações do sistema</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfiguracoes(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Sucesso',
                description: 'Configurações salvas com sucesso',
              });
              setShowConfiguracoes(false);
            }}>
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Auditoria */}
      <Dialog open={showAuditoria} onOpenChange={setShowAuditoria}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Auditoria do Sistema
            </DialogTitle>
            <DialogDescription>
              Histórico completo de todas as operações realizadas no sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {auditoria.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum registro de auditoria encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Data/Hora</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Usuário</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tabela</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Operação</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Campos Alterados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditoria.map((registro, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {new Date(registro.created_at).toLocaleString('pt-PT')}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {registro.usuario?.email || 'Sistema'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {registro.tabela_nome}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Badge className={
                            registro.operacao === 'INSERT' ? 'bg-green-100 text-green-800' :
                            registro.operacao === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {registro.operacao}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {registro.campos_alterados?.join(', ') || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => handleExportarDados('auditoria')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={() => setShowAuditoria(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Backups */}
      <Dialog open={showBackups} onOpenChange={setShowBackups}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Save className="h-5 w-5 mr-2 text-blue-600" />
              Gestão de Backups
            </DialogTitle>
            <DialogDescription>
              Histórico e gestão dos backups do sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Backups Recentes</h4>
              <Button onClick={handleCriarBackupManual} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Backup
              </Button>
            </div>
            
            {backups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Save className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum backup encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={
                            backup.status === 'concluido' ? 'bg-green-100 text-green-800' :
                            backup.status === 'em_progresso' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {backup.status.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{backup.tipo_backup.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {backup.total_registros} registros • {backup.tamanho_mb || 0} MB
                        </p>
                        <p className="text-xs text-gray-500">
                          Criado em: {new Date(backup.created_at).toLocaleString('pt-PT')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {backup.status === 'concluido' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackups(false)}>
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