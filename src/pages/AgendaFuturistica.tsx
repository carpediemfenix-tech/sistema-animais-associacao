import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon,
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Bell,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Stethoscope,
  Heart,
  Shield,
  Scissors,
  Brush,
  Apple,
  Dog,
  GraduationCap,
  DollarSign,
  Wrench,
  Truck,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  Grid,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Star,
  PlusCircle,
  X,
  Search,
  Timeline,
  Archive,
  Sparkles,
  Layers,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface AgendaEvento {
  id: string;
  titulo: string;
  descricao: string;
  tipo_evento: string;
  categoria: 'ativo' | 'memorial';
  data_evento: string;
  data_fim_evento?: string;
  animal_id?: string;
  voluntario_id?: string;
  status: string;
  prioridade: string;
  local?: string;
  observacoes?: string;
  metadados: any;
  cor_evento: string;
  icone_evento: string;
  animal_nome?: string;
  voluntario_nome?: string;
  tipo_nome_display?: string;
  tipo_cor_padrao?: string;
  tipo_icone_padrao?: string;
}

interface TipoEvento {
  id: string;
  tipo_evento: string;
  nome_display: string;
  descricao: string;
  cor_padrao: string;
  icone_padrao: string;
  categoria_padrao: string;
  duracao_padrao_minutos: number;
  requer_aprovacao: boolean;
  permite_conflitos: boolean;
  ativo: boolean;
}

interface EstatisticasAgenda {
  eventos_hoje: number;
  eventos_proxima_semana: number;
  eventos_ativos_total: number;
  eventos_memorial_total: number;
  intervencoes_agendadas: number;
  consultas_agendadas: number;
  missoes_ativas: number;
  formacoes_programadas: number;
}

const AgendaFuturistica = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [vistaCalendario, setVistaCalendario] = useState("mes");
  
  // Estados de dados
  const [estatisticas, setEstatisticas] = useState<EstatisticasAgenda | null>(null);
  const [eventos, setEventos] = useState<AgendaEvento[]>([]);
  const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([]);
  const [eventosAtivos, setEventosAtivos] = useState<AgendaEvento[]>([]);
  const [eventosMemorial, setEventosMemorial] = useState<AgendaEvento[]>([]);
  
  // Estados de UI
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvento, setSelectedEvento] = useState<AgendaEvento | null>(null);
  const [showEventoDialog, setShowEventoDialog] = useState(false);
  const [showNovoEventoDialog, setShowNovoEventoDialog] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarDadosTeste, setMostrarDadosTeste] = useState(true); // ✅ Novo filtro para dados de teste

  // Estados do formulário
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    tipo_evento: '',
    data_evento: '',
    hora_evento: '',
    data_fim: '',
    hora_fim: '',
    local: '',
    prioridade: 'normal',
    observacoes: '',
    animal_id: '',
    voluntario_id: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEstatisticas(),
        loadEventos(),
        loadTiposEventos()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da agenda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      console.log('📊 [AGENDA] Carregando estatísticas...');
      
      const { data, error } = await supabase.rpc('get_agenda_statistics');
      
      if (error) {
        console.error('❌ [AGENDA] Erro ao carregar estatísticas:', {
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          error_object: error
        });
        throw error;
      }
      
      console.log('✅ [AGENDA] Estatísticas carregadas:', data);
      setEstatisticas(data);
    } catch (error: any) {
      console.error('❌ [AGENDA] Erro ao carregar estatísticas:', {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        full_error: error
      });
    }
  };

  const loadEventos = async () => {
    try {
      const hoje = new Date();
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
      
      const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().split('T')[0];
      const dataFim = proximoMes.toISOString().split('T')[0];
      
      const rpcParams = {
        p_data_inicio: dataInicio,
        p_data_fim: dataFim,
        p_categoria_filter: filtroTipo !== 'todos' ? filtroTipo : null,
        p_tipo_filter: null,
        p_animal_filter: null,
        p_voluntario_filter: null
      };
      
      console.log('🔍 [AGENDA] Chamando RPC get_agenda_eventos_periodo com parâmetros:', JSON.stringify(rpcParams, null, 2));
      
      const { data, error } = await supabase.rpc('get_agenda_eventos_periodo', rpcParams);

      if (error) {
        console.error('❌ [AGENDA] Erro detalhado do Supabase:', {
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          error_object: error
        });
        throw error;
      }
      
      console.log('✅ [AGENDA] Eventos carregados com sucesso:', data?.length || 0, 'eventos');
      
      const eventosData = data || [];
      setEventos(eventosData);
      setEventosAtivos(eventosData.filter((e: AgendaEvento) => e.categoria === 'ativo'));
      setEventosMemorial(eventosData.filter((e: AgendaEvento) => e.categoria === 'memorial'));
    } catch (error: any) {
      console.error('❌ [AGENDA] Erro ao carregar eventos:', {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        full_error: error
      });
      toast({
        title: "❌ Erro",
        description: `Erro ao carregar eventos: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const loadTiposEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda_tipos_eventos_2026_01_09_09_00')
        .select('*')
        .eq('ativo', true)
        .order('nome_display');

      if (error) throw error;
      setTiposEventos(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de eventos:', error);
    }
  };

  const criarEvento = async () => {
    try {
      const dataEvento = `${novoEvento.data_evento}T${novoEvento.hora_evento}:00`;
      const dataFim = novoEvento.data_fim && novoEvento.hora_fim 
        ? `${novoEvento.data_fim}T${novoEvento.hora_fim}:00` 
        : null;

      const { error } = await supabase.rpc('create_agenda_evento', {
        p_titulo: novoEvento.titulo,
        p_descricao: novoEvento.descricao,
        p_tipo_evento: novoEvento.tipo_evento,
        p_categoria: 'ativo',
        p_data_evento: dataEvento,
        p_data_fim: dataFim,
        p_animal_id: novoEvento.animal_id || null,
        p_voluntario_id: novoEvento.voluntario_id || null,
        p_status: 'agendado',
        p_prioridade: novoEvento.prioridade,
        p_local: novoEvento.local,
        p_observacoes: novoEvento.observacoes,
        p_metadados: {}
      });

      if (error) throw error;

      toast({
        title: "✨ Sucesso!",
        description: "Evento criado com sucesso na agenda futurística!",
      });

      setShowNovoEventoDialog(false);
      resetNovoEvento();
      loadAllData();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
    }
  };

  const resetNovoEvento = () => {
    setNovoEvento({
      titulo: '',
      descricao: '',
      tipo_evento: '',
      data_evento: '',
      hora_evento: '',
      data_fim: '',
      hora_fim: '',
      local: '',
      prioridade: 'normal',
      observacoes: '',
      animal_id: '',
      voluntario_id: ''
    });
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Heart, Stethoscope, Shield, Users, GraduationCap, CalendarIcon, Wrench,
      PlusCircle, MapPin, X, Star, Target, Activity, Clock, Bell, Eye, Edit, Trash2
    };
    return icons[iconName] || CalendarIcon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'concluido': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      case 'adiado': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-gray-100 text-gray-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.animal_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.voluntario_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || evento.status === filtroStatus;
    const matchesTipo = filtroTipo === 'todos' || evento.categoria === filtroTipo;
    
    // ✅ Novo filtro para dados de teste
    const isDadosTeste = evento.observacoes?.includes('DADOS DE TESTE') || false;
    const matchesDadosTeste = mostrarDadosTeste || !isDadosTeste;
    
    return matchesSearch && matchesStatus && matchesTipo && matchesDadosTeste;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-400 animate-pulse" />
            </div>
            <p className="text-white text-lg font-medium">Carregando Agenda Futurística...</p>
            <p className="text-purple-300 text-sm mt-2">Sincronizando eventos de todos os módulos</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho Futurístico */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard Principal
                </Button>
              </Link>
              <div>
                <h1 className="text-5xl font-bold text-white flex items-center">
                  <div className="relative mr-4">
                    <CalendarIcon className="h-12 w-12 text-purple-400" />
                    <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400 animate-pulse" />
                  </div>
                  Agenda Futurística
                </h1>
                <p className="text-purple-200 text-xl mt-2">
                  Central de Comando Operacional • Sincronização Total
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={loadAllData} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              <Button onClick={() => setShowNovoEventoDialog(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>
          </div>

          {/* Estatísticas Futurísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Eventos Hoje</CardTitle>
                <div className="relative">
                  <CalendarIcon className="h-6 w-6 text-blue-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{estatisticas?.eventos_hoje || 0}</div>
                <p className="text-xs text-blue-200">
                  {estatisticas?.eventos_proxima_semana || 0} próxima semana
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-400/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Intervenções</CardTitle>
                <Heart className="h-6 w-6 text-red-400 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{estatisticas?.intervencoes_agendadas || 0}</div>
                <p className="text-xs text-red-200">
                  {estatisticas?.consultas_agendadas || 0} consultas agendadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Missões Ativas</CardTitle>
                <Shield className="h-6 w-6 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{estatisticas?.missoes_ativas || 0}</div>
                <p className="text-xs text-green-200">
                  {estatisticas?.formacoes_programadas || 0} formações programadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Memorial</CardTitle>
                <Archive className="h-6 w-6 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{estatisticas?.eventos_memorial_total || 0}</div>
                <p className="text-xs text-purple-200">
                  {estatisticas?.eventos_ativos_total || 0} eventos ativos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Principais */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20 text-white">
                <Layers className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="ativo" className="data-[state=active]:bg-white/20 text-white">
                <Activity className="h-4 w-4 mr-2" />
                Agenda Ativa
              </TabsTrigger>
              <TabsTrigger value="memorial" className="data-[state=active]:bg-white/20 text-white">
                <Archive className="h-4 w-4 mr-2" />
                Memorial
              </TabsTrigger>
              <TabsTrigger value="calendario" className="data-[state=active]:bg-white/20 text-white">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Próximos Eventos */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Clock className="h-5 w-5 mr-2 text-blue-400" />
                        Próximos Eventos
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Eventos programados para os próximos dias
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {eventosAtivos.slice(0, 5).map((evento) => {
                          const IconComponent = getIconComponent(evento.icone_evento);
                          return (
                            <div key={evento.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                              <div className="flex items-center space-x-4">
                                <div 
                                  className="p-2 rounded-full"
                                  style={{ backgroundColor: evento.cor_evento + '20' }}
                                >
                                  <IconComponent 
                                    className="h-5 w-5" 
                                    style={{ color: evento.cor_evento }} 
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-white">{evento.titulo}</div>
                                  <div className="text-sm text-gray-300">
                                    {formatDateTime(evento.data_evento)}
                                  </div>
                                  {evento.local && (
                                    <div className="text-xs text-gray-400 flex items-center mt-1">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {evento.local}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(evento.status)}>
                                  {evento.status}
                                </Badge>
                                <Badge className={getPriorityColor(evento.prioridade)}>
                                  {evento.prioridade}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filtros e Ações Rápidas */}
                <div className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Search className="h-5 w-5 mr-2" />
                        Filtros Inteligentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-white">Pesquisar</Label>
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar eventos..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Categoria</Label>
                        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todas as categorias</SelectItem>
                            <SelectItem value="ativo">Agenda Ativa</SelectItem>
                            <SelectItem value="memorial">Memorial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-white">Status</Label>
                        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os status</SelectItem>
                            <SelectItem value="agendado">Agendado</SelectItem>
                            <SelectItem value="confirmado">Confirmado</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* ✅ Novo toggle para dados de teste */}
                      <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-orange-300">🧪</span>
                          <Label className="text-white text-sm">Mostrar Dados de Teste</Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMostrarDadosTeste(!mostrarDadosTeste)}
                          className={`${mostrarDadosTeste ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-500/20 text-gray-400'} hover:bg-orange-500/30`}
                        >
                          {mostrarDadosTeste ? 'Ocultar' : 'Mostrar'}
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={loadEventos} 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="sm"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Aplicar Filtros
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        Ações Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => setShowNovoEventoDialog(true)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Evento
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Agenda
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Agenda Ativa Tab */}
            <TabsContent value="ativo" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Activity className="h-5 w-5 mr-2 text-green-400" />
                    Agenda Ativa - Eventos Programados
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Todos os eventos futuros e em andamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEventos.filter(e => e.categoria === 'ativo').map((evento) => {
                      const IconComponent = getIconComponent(evento.icone_evento);
                      const isDadosTeste = evento.observacoes?.includes('DADOS DE TESTE') || false;
                      return (
                        <Card key={evento.id} className={`${isDadosTeste ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10'} hover:bg-white/10 transition-all cursor-pointer`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                {isDadosTeste && (
                                  <div className="bg-orange-500/20 p-1 rounded">
                                    <span className="text-xs text-orange-300">🧪</span>
                                  </div>
                                )}
                                <IconComponent 
                                  className="h-5 w-5" 
                                  style={{ color: evento.cor_evento }} 
                                />
                                <CardTitle className="text-lg text-white">
                                  {evento.titulo}
                                  {isDadosTeste && <span className="text-xs text-orange-300 ml-2">(TESTE)</span>}
                                </CardTitle>
                              </div>
                              <Badge className={getStatusColor(evento.status)}>
                                {evento.status}
                              </Badge>
                            </div>
                            <CardDescription className="text-gray-300 line-clamp-2">
                              {evento.descricao}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center text-gray-300">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDateTime(evento.data_evento)}
                              </div>
                              {evento.local && (
                                <div className="flex items-center text-gray-300">
                                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                  {evento.local}
                                </div>
                              )}
                              {evento.animal_nome && (
                                <div className="flex items-center text-gray-300">
                                  <Dog className="h-4 w-4 mr-2 text-gray-400" />
                                  {evento.animal_nome}
                                </div>
                              )}
                              {evento.voluntario_nome && (
                                <div className="flex items-center text-gray-300">
                                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                                  {evento.voluntario_nome}
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-gray-300 border-gray-600">
                                  {evento.tipo_nome_display}
                                </Badge>
                                <Badge className={getPriorityColor(evento.prioridade)}>
                                  {evento.prioridade}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                onClick={() => {
                                  setSelectedEvento(evento);
                                  setShowEventoDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Memorial Tab */}
            <TabsContent value="memorial" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Archive className="h-5 w-5 mr-2 text-purple-400" />
                    Memorial - Histórico de Eventos
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Timeline completa de todas as atividades passadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredEventos.filter(e => e.categoria === 'memorial').map((evento, index) => {
                      const IconComponent = getIconComponent(evento.icone_evento);
                      const isDadosTeste = evento.observacoes?.includes('DADOS DE TESTE') || false;
                      return (
                        <div key={evento.id} className="relative">
                          {/* Timeline Line */}
                          {index < filteredEventos.filter(e => e.categoria === 'memorial').length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-purple-400 to-transparent"></div>
                          )}
                          
                          <div className={`flex items-start space-x-4 p-4 rounded-lg ${isDadosTeste ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-white/5 border border-white/10'} hover:bg-white/10 transition-all`}>
                            <div 
                              className="p-3 rounded-full flex-shrink-0 relative"
                              style={{ backgroundColor: evento.cor_evento + '20' }}
                            >
                              {isDadosTeste && (
                                <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-4 h-4 flex items-center justify-center">
                                  <span className="text-xs">🧪</span>
                                </div>
                              )}
                              <IconComponent 
                                className="h-6 w-6" 
                                style={{ color: evento.cor_evento }} 
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-white">
                                    {evento.titulo}
                                    {isDadosTeste && <span className="text-xs text-orange-300 ml-2">(TESTE)</span>}
                                  </h3>
                                  <p className="text-sm text-gray-300 mt-1">{evento.descricao}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                    <span>{formatDateTime(evento.data_evento)}</span>
                                    {evento.local && (
                                      <span className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {evento.local}
                                      </span>
                                    )}
                                    {evento.animal_nome && (
                                      <span className="flex items-center">
                                        <Dog className="h-3 w-3 mr-1" />
                                        {evento.animal_nome}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                                    {evento.tipo_nome_display}
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white hover:bg-white/10"
                                    onClick={() => {
                                      setSelectedEvento(evento);
                                      setShowEventoDialog(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendário Tab */}
            <TabsContent value="calendario" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-400" />
                    Calendário Interativo
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Visualização em calendário de todos os eventos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-300 text-lg">Calendário Interativo</p>
                    <p className="text-gray-400 text-sm mt-2">Em desenvolvimento - Visualização avançada em breve</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog de Detalhes do Evento */}
      <Dialog open={showEventoDialog} onOpenChange={setShowEventoDialog}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center text-white">
              {selectedEvento && (
                <>
                  {React.createElement(getIconComponent(selectedEvento.icone_evento), {
                    className: "h-6 w-6 mr-2",
                    style: { color: selectedEvento.cor_evento }
                  })}
                  {selectedEvento.titulo}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedEvento?.descricao}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvento && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Data e Hora</Label>
                  <div className="text-sm text-gray-300">
                    {formatDateTime(selectedEvento.data_evento)}
                  </div>
                </div>
                {selectedEvento.data_fim_evento && (
                  <div>
                    <Label className="text-white">Término</Label>
                    <div className="text-sm text-gray-300">
                      {formatDateTime(selectedEvento.data_fim_evento)}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-white">Local</Label>
                  <div className="text-sm text-gray-300">{selectedEvento.local || 'Não especificado'}</div>
                </div>
                <div>
                  <Label className="text-white">Status</Label>
                  <Badge className={getStatusColor(selectedEvento.status)}>
                    {selectedEvento.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-white">Prioridade</Label>
                  <Badge className={getPriorityColor(selectedEvento.prioridade)}>
                    {selectedEvento.prioridade}
                  </Badge>
                </div>
                <div>
                  <Label className="text-white">Categoria</Label>
                  <div className="text-sm text-gray-300">{selectedEvento.categoria}</div>
                </div>
              </div>

              {selectedEvento.animal_nome && (
                <div>
                  <Label className="text-white">Animal</Label>
                  <div className="text-sm text-gray-300">{selectedEvento.animal_nome}</div>
                </div>
              )}

              {selectedEvento.voluntario_nome && (
                <div>
                  <Label className="text-white">Voluntário</Label>
                  <div className="text-sm text-gray-300">{selectedEvento.voluntario_nome}</div>
                </div>
              )}

              {selectedEvento.observacoes && (
                <div>
                  <Label className="text-white">Observações</Label>
                  <p className="text-sm text-gray-300 mt-1">
                    {selectedEvento.observacoes}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEventoDialog(false)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Fechar
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Evento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Novo Evento */}
      <Dialog open={showNovoEventoDialog} onOpenChange={setShowNovoEventoDialog}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Criar Novo Evento</DialogTitle>
            <DialogDescription className="text-gray-300">
              Adicionar evento à agenda futurística
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Título *</Label>
                <Input
                  value={novoEvento.titulo}
                  onChange={(e) => setNovoEvento({...novoEvento, titulo: e.target.value})}
                  placeholder="Título do evento"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label className="text-white">Tipo de Evento *</Label>
                <Select 
                  value={novoEvento.tipo_evento} 
                  onValueChange={(value) => setNovoEvento({...novoEvento, tipo_evento: value})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEventos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.tipo_evento}>
                        {tipo.nome_display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Descrição</Label>
              <Textarea
                value={novoEvento.descricao}
                onChange={(e) => setNovoEvento({...novoEvento, descricao: e.target.value})}
                placeholder="Descrição do evento"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Data *</Label>
                <Input
                  type="date"
                  value={novoEvento.data_evento}
                  onChange={(e) => setNovoEvento({...novoEvento, data_evento: e.target.value})}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Hora *</Label>
                <Input
                  type="time"
                  value={novoEvento.hora_evento}
                  onChange={(e) => setNovoEvento({...novoEvento, hora_evento: e.target.value})}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Local</Label>
                <Input
                  value={novoEvento.local}
                  onChange={(e) => setNovoEvento({...novoEvento, local: e.target.value})}
                  placeholder="Local do evento"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label className="text-white">Prioridade</Label>
                <Select 
                  value={novoEvento.prioridade} 
                  onValueChange={(value) => setNovoEvento({...novoEvento, prioridade: value})}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Observações</Label>
              <Textarea
                value={novoEvento.observacoes}
                onChange={(e) => setNovoEvento({...novoEvento, observacoes: e.target.value})}
                placeholder="Observações adicionais"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowNovoEventoDialog(false)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Cancelar
              </Button>
              <Button onClick={criarEvento} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-1" />
                Criar Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default AgendaFuturistica;