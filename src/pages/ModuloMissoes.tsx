import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  GraduationCap,
  Activity,
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
  Star,
  Award,
  Zap,
  Settings,
  BarChart3,
  PieChart,
  Euro,
  UserPlus,
  Calendar as CalendarIcon,
  Stethoscope
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
  descricao: string;
  categoria: string;
  cor: string;
  icone: string;
  pontos_base: number;
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
  pontos_totais: number;
  orcamento_previsto: number;
  custo_real: number;
  max_participantes?: number;
  min_participantes: number;
  observacoes?: string;
  relatorio?: string;
  resultado?: string;
  responsavel_id: string;
  created_at: string;
  tipos_missoes_2025_12_18_14_15?: TipoMissao;
  animais?: { nome: string };
  voluntarios?: { nome: string; display_name?: string };
}

interface ParticipacaoMissao {
  id: string;
  missao_id: string;
  voluntario_id: string;
  funcao: string;
  status_participacao: string;
  data_participacao: string;
  horas_dedicadas: number;
  pontos_atribuidos: number;
  avaliacao?: number;
  observacoes?: string;
  voluntarios?: { nome: string; display_name?: string };
  missoes_2025_12_18_14_15?: { titulo: string };
}

interface EstatisticasMissoes {
  total_missoes: number;
  missoes_ativas: number;
  missoes_concluidas: number;
  missoes_pendentes: number;
  total_voluntarios_participantes: number;
  total_horas_dedicadas: number;
  total_pontos_distribuidos: number;
  custo_total_missoes: number;
  orcamento_total: number;
}

const ModuloMissoes = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estados para dados
  const [estatisticas, setEstatisticas] = useState<EstatisticasMissoes>({
    total_missoes: 0,
    missoes_ativas: 0,
    missoes_concluidas: 0,
    missoes_pendentes: 0,
    total_voluntarios_participantes: 0,
    total_horas_dedicadas: 0,
    total_pontos_distribuidos: 0,
    custo_total_missoes: 0,
    orcamento_total: 0
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
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
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
    orcamento_previsto: '0',
    max_participantes: '',
    min_participantes: '1',
    observacoes: ''
  });

  const [participacaoForm, setParticipacaoForm] = useState({
    missao_id: '',
    voluntario_id: '',
    funcao: 'participante',
    data_participacao: '',
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
    try {
      // Carregar estatísticas das missões
      const { data: missoesData } = await supabase
        .from('missoes_2025_12_18_14_15')
        .select('status, orcamento_previsto, custo_real, pontos_totais');

      // Carregar participações para estatísticas
      const { data: participacoesData } = await supabase
        .from('participacoes_missoes_2025_12_18_14_15')
        .select('horas_dedicadas, pontos_atribuidos, voluntario_id');

      if (missoesData) {
        const total_missoes = missoesData.length;
        const missoes_ativas = missoesData.filter(m => m.status === 'em_curso').length;
        const missoes_concluidas = missoesData.filter(m => m.status === 'concluida').length;
        const missoes_pendentes = missoesData.filter(m => m.status === 'pendente').length;
        const custo_total_missoes = missoesData.reduce((sum, m) => sum + (m.custo_real || 0), 0);
        const orcamento_total = missoesData.reduce((sum, m) => sum + (m.orcamento_previsto || 0), 0);

        let total_voluntarios_participantes = 0;
        let total_horas_dedicadas = 0;
        let total_pontos_distribuidos = 0;

        if (participacoesData) {
          const voluntariosUnicos = new Set(participacoesData.map(p => p.voluntario_id));
          total_voluntarios_participantes = voluntariosUnicos.size;
          total_horas_dedicadas = participacoesData.reduce((sum, p) => sum + (p.horas_dedicadas || 0), 0);
          total_pontos_distribuidos = participacoesData.reduce((sum, p) => sum + (p.pontos_atribuidos || 0), 0);
        }

        setEstatisticas({
          total_missoes,
          missoes_ativas,
          missoes_concluidas,
          missoes_pendentes,
          total_voluntarios_participantes,
          total_horas_dedicadas,
          total_pontos_distribuidos,
          custo_total_missoes,
          orcamento_total
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadMissoes = async () => {
    try {
      const { data, error } = await supabase
        .from('missoes_2025_12_18_14_15')
        .select(`
          *,
          tipos_missoes_2025_12_18_14_15(nome, categoria, cor, icone, pontos_base),
          animais(nome),
          voluntarios(nome, display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    }
  };

  const loadTiposMissoes = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_missoes_2025_12_18_14_15')
        .select('*')
        .eq('ativo', true)
        .order('categoria, nome');

      if (error) throw error;
      setTiposMissoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de missões:', error);
    }
  };

  const loadParticipacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('participacoes_missoes_2025_12_18_14_15')
        .select(`
          *,
          voluntarios(nome, display_name),
          missoes_2025_12_18_14_15(titulo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar participações:', error);
    }
  };

  const loadVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('id, nome, display_name, email')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
    }
  };

  const loadAnimais = async () => {
    try {
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, especie')
        .eq('arquivado', false)
        .order('nome');

      if (error) throw error;
      setAnimais(data || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  const handleCreateMissao = async () => {
    try {
      // Gerar código único para a missão
      const codigo = `MIS-${Date.now().toString().slice(-6)}`;
      
      // Buscar pontos base do tipo de missão
      const tipoMissao = tiposMissoes.find(t => t.id === missaoForm.tipo_missao_id);
      const pontos_totais = tipoMissao?.pontos_base || 10;

      const missaoData = {
        codigo,
        tipo_missao_id: missaoForm.tipo_missao_id,
        titulo: missaoForm.titulo,
        descricao: missaoForm.descricao,
        objetivo: missaoForm.objetivo,
        data_inicio: missaoForm.data_inicio,
        data_fim: missaoForm.data_fim || null,
        hora_inicio: missaoForm.hora_inicio || null,
        hora_fim: missaoForm.hora_fim || null,
        local_principal: missaoForm.local_principal,
        animal_id: missaoForm.animal_id || null,
        prioridade: missaoForm.prioridade,
        orcamento_previsto: parseFloat(missaoForm.orcamento_previsto) || 0,
        max_participantes: missaoForm.max_participantes ? parseInt(missaoForm.max_participantes) : null,
        min_participantes: parseInt(missaoForm.min_participantes) || 1,
        observacoes: missaoForm.observacoes || null,
        pontos_totais,
        responsavel_id: voluntarios[0]?.id, // Temporário - deve ser selecionado
        status: 'pendente'
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
      await loadData();
    } catch (error: any) {
      console.error('Erro ao criar missão:', error);
      toast({
        title: "Erro ao criar missão",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMissao = async () => {
    if (!editingMissao) return;

    try {
      const missaoData = {
        titulo: missaoForm.titulo,
        descricao: missaoForm.descricao,
        objetivo: missaoForm.objetivo,
        data_inicio: missaoForm.data_inicio,
        data_fim: missaoForm.data_fim || null,
        hora_inicio: missaoForm.hora_inicio || null,
        hora_fim: missaoForm.hora_fim || null,
        local_principal: missaoForm.local_principal,
        animal_id: missaoForm.animal_id || null,
        prioridade: missaoForm.prioridade,
        orcamento_previsto: parseFloat(missaoForm.orcamento_previsto) || 0,
        max_participantes: missaoForm.max_participantes ? parseInt(missaoForm.max_participantes) : null,
        min_participantes: parseInt(missaoForm.min_participantes) || 1,
        observacoes: missaoForm.observacoes || null,
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
      await loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar missão:', error);
      toast({
        title: "Erro ao atualizar missão",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMissao = async (missaoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta missão? Esta ação não pode ser desfeita.')) return;

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

      await loadData();
    } catch (error: any) {
      console.error('Erro ao eliminar missão:', error);
      toast({
        title: "Erro ao eliminar missão",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleAddParticipacao = async () => {
    try {
      const participacaoData = {
        missao_id: participacaoForm.missao_id,
        voluntario_id: participacaoForm.voluntario_id,
        funcao: participacaoForm.funcao,
        data_participacao: participacaoForm.data_participacao,
        observacoes: participacaoForm.observacoes || null,
        status_participacao: 'confirmada'
      };

      const { error } = await supabase
        .from('participacoes_missoes_2025_12_18_14_15')
        .insert(participacaoData);

      if (error) throw error;

      toast({
        title: "Participação adicionada",
        description: "Voluntário adicionado à missão com sucesso!",
      });

      setParticipacaoDialogOpen(false);
      resetParticipacaoForm();
      await loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar participação:', error);
      toast({
        title: "Erro ao adicionar participação",
        description: error.message || "Erro inesperado",
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
      orcamento_previsto: '0',
      max_participantes: '',
      min_participantes: '1',
      observacoes: ''
    });
  };

  const resetParticipacaoForm = () => {
    setParticipacaoForm({
      missao_id: '',
      voluntario_id: '',
      funcao: 'participante',
      data_participacao: '',
      observacoes: ''
    });
  };

  const openMissaoDialog = (missao?: Missao) => {
    if (missao) {
      setEditingMissao(missao);
      setMissaoForm({
        tipo_missao_id: missao.tipo_missao_id,
        titulo: missao.titulo,
        descricao: missao.descricao || '',
        objetivo: missao.objetivo || '',
        data_inicio: missao.data_inicio,
        data_fim: missao.data_fim || '',
        hora_inicio: missao.hora_inicio || '',
        hora_fim: missao.hora_fim || '',
        local_principal: missao.local_principal,
        animal_id: missao.animal_id || '',
        prioridade: missao.prioridade,
        orcamento_previsto: missao.orcamento_previsto.toString(),
        max_participantes: missao.max_participantes?.toString() || '',
        min_participantes: missao.min_participantes.toString(),
        observacoes: missao.observacoes || ''
      });
    } else {
      setEditingMissao(null);
      resetMissaoForm();
    }
    setMissaoDialogOpen(true);
  };

  const openParticipacaoDialog = (missaoId?: string) => {
    if (missaoId) {
      setParticipacaoForm(prev => ({ ...prev, missao_id: missaoId }));
    }
    setParticipacaoDialogOpen(true);
  };

  const openDetalhesDialog = (missao: Missao) => {
    setSelectedMissao(missao);
    setDetalhesDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      'em_curso': { color: 'bg-blue-100 text-blue-800', icon: PlayCircle, label: 'Em Curso' },
      'concluida': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluída' },
      'cancelada': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelada' },
      'pausada': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Pausada' }
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

  const getIconeCategoria = (categoria: string) => {
    const iconesConfig = {
      'evento': Heart,
      'resgate': Shield,
      'campanha': Megaphone,
      'representacao': Users,
      'tarefa': Clipboard
    };

    return iconesConfig[categoria as keyof typeof iconesConfig] || Target;
  };

  const filteredMissoes = missoes.filter(missao => {
    const matchesSearch = !searchTerm || 
      missao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      missao.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || missao.status === filterStatus;
    const matchesTipo = !filterTipo || missao.tipo_missao_id === filterTipo;
    const matchesPrioridade = !filterPrioridade || missao.prioridade === filterPrioridade;

    return matchesSearch && matchesStatus && matchesTipo && matchesPrioridade;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-16 w-16 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-lg text-gray-600">A carregar módulo de missões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader 
        title="Módulo de Missões"
        subtitle="Sistema completo de gestão de missões, eventos e gamificação"
        backTo="/"
      />

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
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
            <TabsTrigger value="pontos" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Sistema de Pontos</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-md">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Total Missões</p>
                      <p className="text-3xl font-bold text-indigo-800">{estatisticas.total_missoes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                      <PlayCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Em Curso</p>
                      <p className="text-3xl font-bold text-blue-800">{estatisticas.missoes_ativas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Concluídas</p>
                      <p className="text-3xl font-bold text-green-800">{estatisticas.missoes_concluidas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-md">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Voluntários</p>
                      <p className="text-3xl font-bold text-purple-800">{estatisticas.total_voluntarios_participantes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas Secundárias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-md">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Horas Dedicadas</p>
                      <p className="text-3xl font-bold text-amber-800">{estatisticas.total_horas_dedicadas.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-md">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-pink-700 uppercase tracking-wide">Pontos Distribuídos</p>
                      <p className="text-3xl font-bold text-pink-800">{estatisticas.total_pontos_distribuidos}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
                      <Euro className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Orçamento Total</p>
                      <p className="text-3xl font-bold text-emerald-800">€{estatisticas.orcamento_total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-100 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-md">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Custo Real</p>
                      <p className="text-3xl font-bold text-red-800">€{estatisticas.custo_total_missoes.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Missões Recentes */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Activity className="h-6 w-6" />
                  </div>
                  Missões Recentes
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Últimas missões criadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {missoes.slice(0, 5).length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma missão criada ainda</p>
                    <Button 
                      onClick={() => openMissaoDialog()} 
                      className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Missão
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missoes.slice(0, 5).map((missao) => {
                      const IconeCategoria = getIconeCategoria(missao.tipos_missoes_2025_12_18_14_15?.categoria || 'evento');
                      return (
                        <div key={missao.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <IconeCategoria className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{missao.titulo}</h4>
                              <p className="text-sm text-gray-600">{missao.codigo} • {new Date(missao.data_inicio).toLocaleDateString('pt-PT')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(missao.status)}
                            {getPrioridadeBadge(missao.prioridade)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missões Tab */}
          <TabsContent value="missoes" className="space-y-6">
            {/* Filtros e Ações */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-gray-800">
                      <Filter className="h-5 w-5 mr-2" />
                      Filtros e Pesquisa
                    </CardTitle>
                    <CardDescription>
                      Filtre e pesquise missões por diferentes critérios
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => openMissaoDialog()} 
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Missão
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_curso">Em Curso</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                        <SelectItem value="pausada">Pausada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tipo de Missão</Label>
                    <Select value={filterTipo} onValueChange={setFilterTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os tipos</SelectItem>
                        {tiposMissoes.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Prioridade</Label>
                    <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as prioridades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as prioridades</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
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
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Missões */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Target className="h-6 w-6" />
                  </div>
                  Missões ({filteredMissoes.length})
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Gestão completa de todas as missões do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredMissoes.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma missão encontrada</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || filterStatus || filterTipo || filterPrioridade 
                        ? 'Tente ajustar os filtros de pesquisa'
                        : 'Comece criando a primeira missão'
                      }
                    </p>
                    <Button 
                      onClick={() => openMissaoDialog()} 
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Missão
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Missão</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Prioridade</TableHead>
                          <TableHead>Orçamento</TableHead>
                          <TableHead>Pontos</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMissoes.map((missao) => {
                          const IconeCategoria = getIconeCategoria(missao.tipos_missoes_2025_12_18_14_15?.categoria || 'evento');
                          return (
                            <TableRow key={missao.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-indigo-100 rounded-lg">
                                    <IconeCategoria className="h-4 w-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{missao.titulo}</p>
                                    <p className="text-sm text-gray-600">{missao.codigo}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-gray-100 text-gray-800">
                                  {missao.tipos_missoes_2025_12_18_14_15?.nome || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p className="font-medium">{new Date(missao.data_inicio).toLocaleDateString('pt-PT')}</p>
                                  {missao.data_fim && (
                                    <p className="text-gray-600">até {new Date(missao.data_fim).toLocaleDateString('pt-PT')}</p>
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
                                  <p className="font-medium">€{missao.orcamento_previsto.toFixed(2)}</p>
                                  {missao.custo_real > 0 && (
                                    <p className="text-gray-600">Real: €{missao.custo_real.toFixed(2)}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                                  <Star className="h-3 w-3" />
                                  <span>{missao.pontos_totais}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDetalhesDialog(missao)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openMissaoDialog(missao)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openParticipacaoDialog(missao.id)}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                  >
                                    <UserPlus className="h-3 w-3" />
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participações Tab */}
          <TabsContent value="participacoes" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Users className="h-6 w-6" />
                  </div>
                  Participações em Missões ({participacoes.length})
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Gestão de participações de voluntários nas missões
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {participacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma participação registada</h3>
                    <p className="text-gray-600 mb-6">
                      Adicione voluntários às missões para começar
                    </p>
                    <Button 
                      onClick={() => openParticipacaoDialog()} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Participação
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voluntário</TableHead>
                          <TableHead>Missão</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Horas</TableHead>
                          <TableHead>Pontos</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participacoes.map((participacao) => (
                          <TableRow key={participacao.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {participacao.voluntarios?.display_name || participacao.voluntarios?.nome || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-gray-900">
                                {participacao.missoes_2025_12_18_14_15?.titulo || 'N/A'}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-purple-100 text-purple-800">
                                {participacao.funcao}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(participacao.data_participacao).toLocaleDateString('pt-PT')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span>{participacao.horas_dedicadas}h</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{participacao.pontos_atribuidos}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                participacao.status_participacao === 'confirmada' ? 'bg-green-100 text-green-800' :
                                participacao.status_participacao === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                participacao.status_participacao === 'cancelada' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {participacao.status_participacao}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema de Pontos Tab */}
          <TabsContent value="pontos" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Star className="h-6 w-6" />
                  </div>
                  Sistema de Pontos e Gamificação
                </CardTitle>
                <CardDescription className="text-yellow-100">
                  Reconhecimento e motivação através de pontos e níveis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Pontos</h3>
                  <p className="text-gray-600 mb-6">
                    Funcionalidade em desenvolvimento - Rankings, níveis e reconhecimentos
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-yellow-800">Rankings</h4>
                      <p className="text-sm text-yellow-700">Classificação dos voluntários</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-orange-800">Níveis</h4>
                      <p className="text-sm text-orange-700">Sistema de progressão</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-purple-800">Prémios</h4>
                      <p className="text-sm text-purple-700">Reconhecimentos especiais</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  Relatórios e Analytics
                </CardTitle>
                <CardDescription className="text-green-100">
                  Relatórios detalhados sobre missões e performance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Relatórios Avançados</h3>
                  <p className="text-gray-600 mb-6">
                    Funcionalidade em desenvolvimento - Analytics e relatórios personalizados
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <PieChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Performance</h4>
                      <p className="text-sm text-green-700">Análise de desempenho</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-blue-800">Tendências</h4>
                      <p className="text-sm text-blue-700">Evolução temporal</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para Nova/Editar Missão */}
      <Dialog open={missaoDialogOpen} onOpenChange={setMissaoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <span>{editingMissao ? 'Editar Missão' : 'Nova Missão'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingMissao ? 'Atualize as informações da missão' : 'Crie uma nova missão para os voluntários'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            editingMissao ? handleUpdateMissao() : handleCreateMissao();
          }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {tipo.categoria}
                          </Badge>
                          <span>{tipo.nome}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

            <div>
              <Label htmlFor="objetivo">Objetivo</Label>
              <Textarea
                id="objetivo"
                value={missaoForm.objetivo}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, objetivo: e.target.value }))}
                placeholder="Qual o objetivo principal desta missão?"
                rows={2}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hora_inicio">Hora de Início</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={missaoForm.hora_inicio}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, hora_inicio: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="hora_fim">Hora de Fim</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={missaoForm.hora_fim}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, hora_fim: e.target.value }))}
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
                <Label htmlFor="animal_id">Animal Associado (opcional)</Label>
                <Select 
                  value={missaoForm.animal_id} 
                  onValueChange={(value) => setMissaoForm(prev => ({ ...prev, animal_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar animal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum animal</SelectItem>
                    {animais.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.nome} ({animal.especie})
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
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, orcamento_previsto: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_participantes">Mínimo de Participantes</Label>
                <Input
                  id="min_participantes"
                  type="number"
                  min="1"
                  value={missaoForm.min_participantes}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, min_participantes: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="max_participantes">Máximo de Participantes</Label>
                <Input
                  id="max_participantes"
                  type="number"
                  min="1"
                  value={missaoForm.max_participantes}
                  onChange={(e) => setMissaoForm(prev => ({ ...prev, max_participantes: e.target.value }))}
                  placeholder="Sem limite"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={missaoForm.observacoes}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre a missão..."
                rows={3}
              />
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
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingMissao ? 'Atualizar Missão' : 'Criar Missão'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Adicionar Participação */}
      <Dialog open={participacaoDialogOpen} onOpenChange={setParticipacaoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <span>Adicionar Participação</span>
            </DialogTitle>
            <DialogDescription>
              Adicione um voluntário a uma missão
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddParticipacao();
          }} className="space-y-4">
            <div>
              <Label htmlFor="missao_participacao">Missão *</Label>
              <Select 
                value={participacaoForm.missao_id} 
                onValueChange={(value) => setParticipacaoForm(prev => ({ ...prev, missao_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar missão" />
                </SelectTrigger>
                <SelectContent>
                  {missoes.filter(m => m.status !== 'concluida' && m.status !== 'cancelada').map((missao) => (
                    <SelectItem key={missao.id} value={missao.id}>
                      {missao.titulo} ({missao.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="voluntario_participacao">Voluntário *</Label>
              <VoluntarioSelector
                value={participacaoForm.voluntario_id}
                onValueChange={(value) => setParticipacaoForm(prev => ({ ...prev, voluntario_id: value }))}
                placeholder="Selecionar voluntário"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="funcao_participacao">Função</Label>
                <Select 
                  value={participacaoForm.funcao} 
                  onValueChange={(value) => setParticipacaoForm(prev => ({ ...prev, funcao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="participante">Participante</SelectItem>
                    <SelectItem value="apoio">Apoio</SelectItem>
                    <SelectItem value="especialista">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data_participacao">Data de Participação *</Label>
                <Input
                  id="data_participacao"
                  type="date"
                  value={participacaoForm.data_participacao}
                  onChange={(e) => setParticipacaoForm(prev => ({ ...prev, data_participacao: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes_participacao">Observações</Label>
              <Textarea
                id="observacoes_participacao"
                value={participacaoForm.observacoes}
                onChange={(e) => setParticipacaoForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre a participação..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setParticipacaoDialogOpen(false);
                  resetParticipacaoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Adicionar Participação
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Detalhes da Missão */}
      <Dialog open={detalhesDialogOpen} onOpenChange={setDetalhesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              <span>Detalhes da Missão</span>
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre a missão selecionada
            </DialogDescription>
          </DialogHeader>

          {selectedMissao && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Código</Label>
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{selectedMissao.codigo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Título</Label>
                      <p className="font-semibold">{selectedMissao.titulo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                      <Badge className="bg-gray-100 text-gray-800">
                        {selectedMissao.tipos_missoes_2025_12_18_14_15?.nome || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div>{getStatusBadge(selectedMissao.status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Prioridade</Label>
                      <div>{getPrioridadeBadge(selectedMissao.prioridade)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datas e Local</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Data de Início</Label>
                      <p className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{new Date(selectedMissao.data_inicio).toLocaleDateString('pt-PT')}</span>
                      </p>
                    </div>
                    {selectedMissao.data_fim && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Data de Fim</Label>
                        <p className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>{new Date(selectedMissao.data_fim).toLocaleDateString('pt-PT')}</span>
                        </p>
                      </div>
                    )}
                    {selectedMissao.hora_inicio && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Horário</Label>
                        <p className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            {selectedMissao.hora_inicio}
                            {selectedMissao.hora_fim && ` - ${selectedMissao.hora_fim}`}
                          </span>
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Local</Label>
                      <p className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedMissao.local_principal}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Descrição e Objetivo */}
              {(selectedMissao.descricao || selectedMissao.objetivo) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Descrição e Objetivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedMissao.descricao && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                        <p className="text-gray-800 leading-relaxed">{selectedMissao.descricao}</p>
                      </div>
                    )}
                    {selectedMissao.objetivo && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Objetivo</Label>
                        <p className="text-gray-800 leading-relaxed">{selectedMissao.objetivo}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Informações Financeiras e Pontos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Euro className="h-5 w-5" />
                      <span>Informações Financeiras</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Orçamento Previsto</Label>
                      <p className="text-lg font-semibold text-green-600">€{selectedMissao.orcamento_previsto.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Custo Real</Label>
                      <p className="text-lg font-semibold text-red-600">€{selectedMissao.custo_real.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Diferença</Label>
                      <p className={`text-lg font-semibold ${
                        selectedMissao.orcamento_previsto - selectedMissao.custo_real >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        €{(selectedMissao.orcamento_previsto - selectedMissao.custo_real).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Sistema de Pontos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Pontos Totais</Label>
                      <p className="text-lg font-semibold text-yellow-600">{selectedMissao.pontos_totais}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Participantes</Label>
                      <p className="text-lg font-semibold text-blue-600">
                        {selectedMissao.min_participantes}
                        {selectedMissao.max_participantes && ` - ${selectedMissao.max_participantes}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Observações */}
              {selectedMissao.observacoes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 leading-relaxed">{selectedMissao.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Relatório */}
              {selectedMissao.relatorio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Relatório Final</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 leading-relaxed">{selectedMissao.relatorio}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDetalhesDialogOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default ModuloMissoes;