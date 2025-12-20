import React, { useState, useEffect } from 'react';
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
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import VoluntarioSelector from "@/components/VoluntarioSelector";

// Interfaces simplificadas
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
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  local_principal: string;
  prioridade: string;
  status: string;
  pontos_totais: number;
  orcamento_previsto: number;
  custo_real: number;
  responsavel_id: string;
  created_at: string;
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
}

const ModuloMissoes = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  // Estados para dados
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [tiposMissoes, setTiposMissoes] = useState<TipoMissao[]>([]);
  const [participacoes, setParticipacoes] = useState<ParticipacaoMissao[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [animais, setAnimais] = useState<any[]>([]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Estados para diálogos
  const [missaoDialogOpen, setMissaoDialogOpen] = useState(false);
  const [participacaoDialogOpen, setParticipacaoDialogOpen] = useState(false);
  const [editingMissao, setEditingMissao] = useState<Missao | null>(null);

  // Estados para formulários
  const [missaoForm, setMissaoForm] = useState({
    tipo_missao_id: '',
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local_principal: '',
    animal_id: 'nenhum',
    prioridade: 'media',
    orcamento_previsto: '0'
  });

  const [participacaoForm, setParticipacaoForm] = useState({
    missao_id: '',
    voluntario_id: '',
    funcao: 'participante',
    data_participacao: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carregamento de dados...');
      
      await Promise.all([
        loadTiposMissoes(),
        loadMissoes(),
        loadParticipacoes(),
        loadVoluntarios(),
        loadAnimais()
      ]);
      
      console.log('✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Verifique a console para mais detalhes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTiposMissoes = async () => {
    try {
      console.log('📋 Carregando tipos de missões...');
      
      // Tentar carregar diretamente da tabela
      console.log('🔍 Tentando carregar da tabela tipos_missoes_2025_12_18_14_15...');

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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar missões:', error);
        if (error.code === '42P01') {
          console.log('⚠️ Tabela de missões não existe ainda');
          setMissoes([]);
          return;
        }
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar participações:', error);
        if (error.code === '42P01') {
          console.log('⚠️ Tabela de participações não existe ainda');
          setParticipacoes([]);
          return;
        }
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

  const loadAnimais = async () => {
    try {
      console.log('🐶 Carregando animais...');
      
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, especie, numero_processo')
        .eq('arquivado', false)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar animais:', error);
        throw error;
      }
      
      console.log('✅ Animais carregados:', data?.length || 0);
      setAnimais(data || []);
    } catch (error) {
      console.error('❌ Erro em loadAnimais:', error);
      setAnimais([]);
    }
  };

  const generateMissionCode = async () => {
    try {
      const currentYear = new Date().getFullYear().toString().slice(-2); // Últimos 2 dígitos do ano
      
      // Buscar o último código do ano atual
      const { data: lastMission } = await supabase
        .from('missoes_2025_12_18_14_15')
        .select('codigo')
        .like('codigo', `MIS${currentYear}%`)
        .order('codigo', { ascending: false })
        .limit(1);
      
      let nextNumber = 1;
      if (lastMission && lastMission.length > 0) {
        const lastCode = lastMission[0].codigo;
        const lastNumber = parseInt(lastCode.slice(-3)); // Últimos 3 dígitos
        nextNumber = lastNumber + 1;
      }
      
      // Formatar com zeros à esquerda (001, 002, etc.)
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      return `MIS${currentYear}${formattedNumber}`;
    } catch (error) {
      console.error('Erro ao gerar código da missão:', error);
      // Fallback para código baseado em timestamp
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const timestamp = Date.now().toString().slice(-3);
      return `MIS${currentYear}${timestamp}`;
    }
  };

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
        data_fim: missaoForm.data_fim || null,
        local_principal: missaoForm.local_principal,
        animal_id: missaoForm.animal_id || null,
        prioridade: missaoForm.prioridade,
        orcamento_previsto: parseFloat(missaoForm.orcamento_previsto) || 0,
        pontos_totais,
        responsavel_id: voluntarios[0]?.id || null,
        status: 'pendente',
        custo_real: 0,
        min_participantes: 1
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

  const handleUpdateMissao = async () => {
    if (!editingMissao) return;

    try {
      console.log('✏️ Atualizando missão:', editingMissao.id);
      
      const missaoData = {
        tipo_missao_id: missaoForm.tipo_missao_id,
        titulo: missaoForm.titulo,
        descricao: missaoForm.descricao,
        data_inicio: missaoForm.data_inicio,
        data_fim: missaoForm.data_fim || null,
        local_principal: missaoForm.local_principal,
        animal_id: missaoForm.animal_id || null,
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

  const handleAddParticipacao = async () => {
    try {
      console.log('👥 Adicionando participação...');
      
      const participacaoData = {
        missao_id: participacaoForm.missao_id,
        voluntario_id: participacaoForm.voluntario_id,
        funcao: participacaoForm.funcao,
        data_participacao: participacaoForm.data_participacao,
        status_participacao: 'confirmada',
        horas_dedicadas: 0,
        pontos_atribuidos: 0
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
      await loadParticipacoes();
    } catch (error: any) {
      console.error('❌ Erro ao adicionar participação:', error);
      toast({
        title: "Erro ao adicionar participação",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const resetParticipacaoForm = () => {
    setParticipacaoForm({
      missao_id: '',
      voluntario_id: '',
      funcao: 'participante',
      data_participacao: ''
    });
  };

  const resetMissaoForm = () => {
    setMissaoForm({
      tipo_missao_id: '',
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      local_principal: '',
      animal_id: 'nenhum',
      prioridade: 'media',
      orcamento_previsto: '0'
    });
  };

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
        animal_id: missao.animal_id || 'nenhum',
        prioridade: missao.prioridade,
        orcamento_previsto: missao.orcamento_previsto.toString()
      });
    } else {
      setEditingMissao(null);
      resetMissaoForm();
    }
    setMissaoDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      'em_curso': { color: 'bg-blue-100 text-blue-800', icon: PlayCircle, label: 'Em Curso' },
      'concluida': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluída' },
      'cancelada': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelada' }
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
    
    const matchesStatus = filterStatus === 'todos' || missao.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calcular estatísticas
  const estatisticas = {
    total_missoes: missoes.length,
    missoes_ativas: missoes.filter(m => m.status === 'em_curso').length,
    missoes_concluidas: missoes.filter(m => m.status === 'concluida').length,
    missoes_pendentes: missoes.filter(m => m.status === 'pendente').length,
    total_voluntarios_participantes: new Set(participacoes.map(p => p.voluntario_id)).size,
    total_horas_dedicadas: participacoes.reduce((sum, p) => sum + (p.horas_dedicadas || 0), 0),
    total_pontos_distribuidos: participacoes.reduce((sum, p) => sum + (p.pontos_atribuidos || 0), 0),
    custo_total_missoes: missoes.reduce((sum, m) => sum + (m.custo_real || 0), 0),
    orcamento_total: missoes.reduce((sum, m) => sum + (m.orcamento_previsto || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-16 w-16 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-lg text-gray-600">A carregar módulo de missões...</p>
          <p className="text-sm text-gray-500 mt-2">Verificando base de dados...</p>
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
          <TabsList className="grid w-full grid-cols-4">
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

            {/* Status da Base de Dados */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-white/20 rounded-lg mr-3">
                    <Activity className="h-6 w-6" />
                  </div>
                  Status do Sistema
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Informações sobre a base de dados e funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Tipos de Missões</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{tiposMissoes.length} tipos disponíveis</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Missões</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{missoes.length} missões registadas</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">Voluntários</span>
                    </div>
                    <p className="text-sm text-purple-700 mt-1">{voluntarios.length} voluntários ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                {missoes.length === 0 ? (
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
                      const tipoMissao = tiposMissoes.find(t => t.id === missao.tipo_missao_id);
                      const IconeCategoria = getIconeCategoria(tipoMissao?.categoria || 'evento');
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('todos');
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
                      {searchTerm || filterStatus 
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
                          <TableHead>Orçamento</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMissoes.map((missao) => {
                          const tipoMissao = tiposMissoes.find(t => t.id === missao.tipo_missao_id);
                          const IconeCategoria = getIconeCategoria(tipoMissao?.categoria || 'evento');
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
                                  {tipoMissao?.nome || 'N/A'}
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
                                <div className="text-sm">
                                  <p className="font-medium">€{missao.orcamento_previsto.toFixed(2)}</p>
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
                                    onClick={() => openMissaoDialog(missao)}
                                    className="h-8 w-8 p-0"
                                    title="Editar missão"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setParticipacaoForm(prev => ({ ...prev, missao_id: missao.id }));
                                      setParticipacaoDialogOpen(true);
                                    }}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                    title="Adicionar participante"
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
              <CardContent className="p-6">
                {participacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma participação registada</h3>
                    <p className="text-gray-600 mb-6">
                      As participações aparecerão aqui quando forem adicionadas às missões
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {participacoes.map((participacao) => {
                        const missao = missoes.find(m => m.id === participacao.missao_id);
                        const voluntario = voluntarios.find(v => v.id === participacao.voluntario_id);
                        
                        return (
                          <Card key={participacao.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {missao?.titulo || 'Missão não encontrada'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {missao?.codigo || 'Código não disponível'}
                                  </p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {participacao.funcao}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>{voluntario?.display_name || voluntario?.nome || 'Voluntário não encontrado'}</span>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>{new Date(participacao.data_participacao).toLocaleDateString('pt-PT')}</span>
                                </div>
                                
                                {participacao.horas_dedicadas > 0 && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>{participacao.horas_dedicadas}h dedicadas</span>
                                  </div>
                                )}
                                
                                {participacao.pontos_atribuidos > 0 && (
                                  <div className="flex items-center text-sm text-green-600">
                                    <Star className="h-4 w-4 mr-2" />
                                    <span>{participacao.pontos_atribuidos} pontos</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <Badge 
                                  variant={participacao.status_participacao === 'confirmada' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {participacao.status_participacao === 'confirmada' ? 'Confirmada' : participacao.status_participacao}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                      <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Performance</h4>
                      <p className="text-sm text-green-700">Análise de desempenho</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="local_principal">Local Principal *</Label>
              <Input
                id="local_principal"
                value={missaoForm.local_principal}
                onChange={(e) => setMissaoForm(prev => ({ ...prev, local_principal: e.target.value }))}
                placeholder="Ex: Parque Central, Rua das Flores, 123"
                required
              />
            </div>

            <div>
              <Label htmlFor="animal_id">Animal Associado (opcional)</Label>
              <Select 
                value={missaoForm.animal_id || 'nenhum'}
                onValueChange={(value) => setMissaoForm(prev => ({ ...prev, animal_id: value === 'nenhum' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar animal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum animal</SelectItem>
                  {animais.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.nome} ({animal.especie}) - {animal.numero_processo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      <EnhancedFooter />
    </div>
  );
};

export default ModuloMissoes;