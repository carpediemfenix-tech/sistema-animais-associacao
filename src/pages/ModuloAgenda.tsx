import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
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
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface TipoEvento {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  categoria: string;
  duracao_padrao: number;
  requer_aprovacao: boolean;
}

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  tipo_evento_id: string;
  data_inicio: string;
  data_fim: string;
  dia_completo: boolean;
  local: string;
  status: string;
  prioridade: string;
  observacoes: string;
  lembrete_ativo: boolean;
  lembrete_antecedencia: number;
  tipo_evento?: TipoEvento;
  animal_id?: string;
  voluntario_responsavel_id?: string;
}

interface TurnoVoluntario {
  id: string;
  evento_id: string;
  voluntario_id: string;
  funcao: string;
  local_turno: string;
  hora_inicio: string;
  hora_fim: string;
  status: string;
  check_in: string;
  check_out: string;
  horas_trabalhadas: number;
  evento?: Evento;
  voluntario?: { nome: string; email: string };
}

interface ConsultaVeterinaria {
  id: string;
  evento_id: string;
  animal_id: string;
  tipo_consulta: string;
  motivo: string;
  veterinario_nome: string;
  custo_estimado: number;
  custo_real: number;
  diagnostico: string;
  evento?: Evento;
  animal?: { nome: string; especie: string };
}

interface Lembrete {
  id: string;
  evento_id: string;
  tipo_lembrete: string;
  minutos_antecedencia: number;
  assunto: string;
  mensagem: string;
  enviado: boolean;
  data_envio: string;
  evento?: Evento;
}

interface EstatisticasAgenda {
  totalEventos: number;
  eventosHoje: number;
  eventosProximaSemana: number;
  consultasAgendadas: number;
  turnosAtivos: number;
  lembretesPendentes: number;
  taxaPresenca: number;
  horasVoluntariado: number;
}

const ModuloAgenda = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("calendario");
  const [vistaCalendario, setVistaCalendario] = useState("semana"); // dia, semana, mes
  
  // Estados de dados
  const [estatisticas, setEstatisticas] = useState<EstatisticasAgenda | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([]);
  const [turnos, setTurnos] = useState<TurnoVoluntario[]>([]);
  const [consultas, setConsultas] = useState<ConsultaVeterinaria[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [intervencoes, setIntervencoes] = useState<any[]>([]);
  const [missoes, setMissoes] = useState<any[]>([]);
  
  // Estados de UI
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showEventoDialog, setShowEventoDialog] = useState(false);
  const [showNovoEventoDialog, setShowNovoEventoDialog] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Estados do formulário
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    tipo_evento_id: '',
    data_inicio: '',
    hora_inicio: '',
    data_fim: '',
    hora_fim: '',
    local: '',
    prioridade: 'normal',
    observacoes: '',
    lembrete_ativo: true,
    lembrete_antecedencia: 60
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
        loadTiposEventos(),
        loadTurnos(),
        loadConsultas(),
        loadLembretes(),
        loadIntervencoes(),
        loadMissoes()
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
      const hoje = new Date().toISOString().split('T')[0];
      const proximaSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Carregar eventos
      const { data: eventosData } = await supabase
        .from('eventos_agenda_2025_12_11_03_00')
        .select('*');

      // Carregar turnos
      const { data: turnosData } = await supabase
        .from('turnos_voluntarios_2025_12_11_03_00')
        .select('*');

      // Carregar consultas
      const { data: consultasData } = await supabase
        .from('consultas_veterinarias_2025_12_11_03_00')
        .select('*');

      // Carregar lembretes
      const { data: lembretesData } = await supabase
        .from('lembretes_agenda_2025_12_11_03_00')
        .select('*');

      const totalEventos = eventosData?.length || 0;
      const eventosHoje = eventosData?.filter(e => 
        e.data_inicio.split('T')[0] === hoje
      ).length || 0;
      const eventosProximaSemana = eventosData?.filter(e => 
        e.data_inicio.split('T')[0] >= hoje && e.data_inicio.split('T')[0] <= proximaSemana
      ).length || 0;
      const consultasAgendadas = consultasData?.length || 0;
      const turnosAtivos = turnosData?.filter(t => t.status === 'agendado' || t.status === 'confirmado').length || 0;
      const lembretesPendentes = lembretesData?.filter(l => !l.enviado).length || 0;
      
      // Calcular taxa de presença
      const eventosComPresenca = eventosData?.filter(e => e.presente === true).length || 0;
      const taxaPresenca = totalEventos > 0 ? (eventosComPresenca / totalEventos) * 100 : 0;
      
      // Calcular horas de voluntariado
      const horasVoluntariado = turnosData?.reduce((sum, t) => sum + (t.horas_trabalhadas || 0), 0) || 0;

      setEstatisticas({
        totalEventos,
        eventosHoje,
        eventosProximaSemana,
        consultasAgendadas,
        turnosAtivos,
        lembretesPendentes,
        taxaPresenca,
        horasVoluntariado
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadEventos = async () => {
    try {
      let query = supabase
        .from('eventos_agenda_2025_12_11_03_00')
        .select(`
          *,
          tipo_evento:tipos_eventos_2025_12_11_03_00(*)
        `)
        .eq('ativo', true)
        .order('data_inicio', { ascending: true });

      // Aplicar filtros
      if (filtroTipo !== 'todos') {
        query = query.eq('tipo_evento_id', filtroTipo);
      }
      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const loadTiposEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_eventos_2025_12_11_03_00')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setTiposEventos(data || []);
    } catch (error) {
      console.error('Erro ao carregar tipos de eventos:', error);
    }
  };

  const loadTurnos = async () => {
    try {
      const { data, error } = await supabase
        .from('turnos_voluntarios_2025_12_11_03_00')
        .select(`
          *,
          evento:eventos_agenda_2025_12_11_03_00(*),
          voluntario:voluntarios(nome, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTurnos(data || []);
    } catch (error) {
      console.error('Erro ao carregar turnos:', error);
    }
  };

  const loadConsultas = async () => {
    try {
      const { data, error } = await supabase
        .from('consultas_veterinarias_2025_12_11_03_00')
        .select(`
          *,
          evento:eventos_agenda_2025_12_11_03_00(*),
          animal:animais(nome, especie)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultas(data || []);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    }
  };

  const loadLembretes = async () => {
    try {
      const { data, error } = await supabase
        .from('lembretes_agenda_2025_12_11_03_00')
        .select(`
          *,
          evento:eventos_agenda_2025_12_11_03_00(*)
        `)
        .order('data_envio_programada', { ascending: true });

      if (error) throw error;
      setLembretes(data || []);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    }
  };

  const loadIntervencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('intervencoes')
        .select(`
          *,
          animais(nome),
          tipos_intervencoes(nome),
          clinicas_veterinarias(nome)
        `)
        .gte('data_intervencao', new Date().toISOString().split('T')[0])
        .order('data_intervencao', { ascending: true });

      if (error) throw error;
      setIntervencoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar intervenções:', error);
    }
  };

  const loadMissoes = async () => {
    try {
      const { data, error } = await supabase
        .from('missoes_2025_12_13_09_00')
        .select(`
          *,
          tipos_missoes_2025_12_13_09_00(nome, cor, icone),
          animais(nome),
          voluntarios(nome)
        `)
        .gte('data_inicio', new Date().toISOString().split('T')[0])
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      setMissoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    }
  };

  // Função para obter todos os itens agendados de uma data
  const getItensAgendados = (data: Date) => {
    const dataStr = data.toISOString().split('T')[0];
    const itens = [];
    
    // Eventos
    eventos.forEach(evento => {
      if (evento.data_inicio.startsWith(dataStr)) {
        itens.push({
          tipo: 'evento',
          titulo: evento.titulo,
          hora: evento.data_inicio.split('T')[1]?.substring(0, 5),
          cor: evento.tipo_evento?.cor || '#3B82F6'
        });
      }
    });
    
    // Intervenções
    intervencoes.forEach(intervencao => {
      if (intervencao.data_intervencao === dataStr) {
        itens.push({
          tipo: 'intervencao',
          titulo: `${intervencao.animais?.nome} - ${intervencao.tipos_intervencoes?.nome}`,
          hora: intervencao.hora_intervencao,
          cor: '#DC2626'
        });
      }
    });
    
    // Missões
    missoes.forEach(missao => {
      if (missao.data_inicio === dataStr) {
        itens.push({
          tipo: 'missao',
          titulo: missao.titulo,
          hora: missao.hora_inicio,
          cor: missao.tipos_missoes_2025_12_13_09_00?.cor || '#059669'
        });
      }
    });
    
    return itens.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
  };

  // Função para gerar o calendário do mês
  const gerarCalendarioMes = (data: Date) => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    const dias = [];
    
    // Dias vazios no início
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataAtual = new Date(ano, mes, dia);
      const itens = getItensAgendados(dataAtual);
      dias.push({
        dia,
        data: dataAtual,
        itens,
        isHoje: dataAtual.toDateString() === new Date().toDateString()
      });
    }
    
    return dias;
  };

  const criarEvento = async () => {
    try {
      const dataInicio = `${novoEvento.data_inicio}T${novoEvento.hora_inicio}:00`;
      const dataFim = `${novoEvento.data_fim}T${novoEvento.hora_fim}:00`;

      const { error } = await supabase
        .from('eventos_agenda_2025_12_11_03_00')
        .insert([{
          titulo: novoEvento.titulo,
          descricao: novoEvento.descricao,
          tipo_evento_id: novoEvento.tipo_evento_id,
          data_inicio: dataInicio,
          data_fim: dataFim,
          local: novoEvento.local,
          prioridade: novoEvento.prioridade,
          observacoes: novoEvento.observacoes,
          lembrete_ativo: novoEvento.lembrete_ativo,
          lembrete_antecedencia: novoEvento.lembrete_antecedencia,
          status: 'agendado'
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Evento criado com sucesso!",
      });

      setShowNovoEventoDialog(false);
      setNovoEvento({
        titulo: '',
        descricao: '',
        tipo_evento_id: '',
        data_inicio: '',
        hora_inicio: '',
        data_fim: '',
        hora_fim: '',
        local: '',
        prioridade: 'normal',
        observacoes: '',
        lembrete_ativo: true,
        lembrete_antecedencia: 60
      });
      
      loadAllData();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Stethoscope, Heart, Shield, Scissors, Brush, Apple, Dog,
      GraduationCap, Users, DollarSign, Wrench, Truck, Eye,
      CalendarIcon, Clock, MapPin
    };
    return icons[iconName] || CalendarIcon;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'adiado': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getEventosDoDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventos.filter(evento => 
      evento.data_inicio.split('T')[0] === dateStr
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Carregando módulo agenda...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-100 p-6">
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
                  <CalendarIcon className="h-10 w-10 mr-3 text-purple-600" />
                  Módulo Agenda
                </h1>
                <p className="text-gray-600 text-lg">
                  Sistema completo de calendário e agendamentos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={loadAllData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => setShowNovoEventoDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
                <CalendarIcon className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.eventosHoje || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.totalEventos || 0} eventos totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
                <Stethoscope className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.consultasAgendadas || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Próxima semana: {estatisticas?.eventosProximaSemana || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turnos Ativos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.turnosAtivos || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.horasVoluntariado || 0}h trabalhadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lembretes Pendentes</CardTitle>
                <Bell className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.lembretesPendentes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Taxa presença: {estatisticas?.taxaPresenca?.toFixed(1) || 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Principais */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="calendario">Calendário</TabsTrigger>
              <TabsTrigger value="eventos">Eventos</TabsTrigger>
              <TabsTrigger value="intervencoes">Intervenções</TabsTrigger>
              <TabsTrigger value="missoes">Missões</TabsTrigger>
              <TabsTrigger value="turnos">Turnos</TabsTrigger>
              <TabsTrigger value="consultas">Consultas</TabsTrigger>
              <TabsTrigger value="lembretes">Lembretes</TabsTrigger>
            </TabsList>

            {/* Calendário Tab */}
            <TabsContent value="calendario" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendário Principal */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          Calendário - {selectedDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setVistaCalendario('dia')}>
                            Dia
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setVistaCalendario('semana')}>
                            Semana
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setVistaCalendario('mes')}>
                            Mês
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Navegação do Calendário */}
                      <div className="flex items-center justify-between mb-6">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setSelectedDate(newDate);
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Mês Anterior
                        </Button>
                        
                        <div className="text-center">
                          <div className="font-semibold text-xl">
                            {selectedDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setSelectedDate(newDate);
                          }}
                        >
                          Próximo Mês
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Calendário do Mês Atual */}
                      <div className="mb-8">
                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                          {selectedDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                        </h3>
                        
                        {/* Cabeçalho dos dias da semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                            <div key={dia} className="p-2 text-center text-sm font-medium text-gray-600">
                              {dia}
                            </div>
                          ))}
                        </div>
                        
                        {/* Dias do mês */}
                        <div className="grid grid-cols-7 gap-1">
                          {gerarCalendarioMes(selectedDate).map((diaInfo, index) => {
                            if (!diaInfo) {
                              return <div key={index} className="p-2 h-20"></div>;
                            }
                            
                            return (
                              <div 
                                key={diaInfo.dia} 
                                className={`p-2 h-20 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                  diaInfo.isHoje ? 'bg-blue-100 border-blue-300' : 'bg-white'
                                }`}
                                onClick={() => setSelectedDate(diaInfo.data)}
                              >
                                <div className={`text-sm font-medium ${
                                  diaInfo.isHoje ? 'text-blue-700' : 'text-gray-900'
                                }`}>
                                  {diaInfo.dia}
                                </div>
                                <div className="space-y-1 mt-1">
                                  {diaInfo.itens.slice(0, 2).map((item, idx) => (
                                    <div 
                                      key={idx}
                                      className="text-xs p-1 rounded truncate text-white"
                                      style={{ backgroundColor: item.cor }}
                                      title={`${item.hora} - ${item.titulo}`}
                                    >
                                      {item.hora} {item.titulo.substring(0, 10)}...
                                    </div>
                                  ))}
                                  {diaInfo.itens.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{diaInfo.itens.length - 2} mais
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Calendário do Próximo Mês */}
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
                          {new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                        </h3>
                        
                        {/* Cabeçalho dos dias da semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                            <div key={dia} className="p-2 text-center text-sm font-medium text-gray-600">
                              {dia}
                            </div>
                          ))}
                        </div>
                        
                        {/* Dias do próximo mês */}
                        <div className="grid grid-cols-7 gap-1">
                          {gerarCalendarioMes(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)).map((diaInfo, index) => {
                            if (!diaInfo) {
                              return <div key={index} className="p-2 h-20"></div>;
                            }
                            
                            return (
                              <div 
                                key={diaInfo.dia} 
                                className="p-2 h-20 border rounded-lg cursor-pointer hover:bg-gray-50 bg-white"
                                onClick={() => setSelectedDate(diaInfo.data)}
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {diaInfo.dia}
                                </div>
                                <div className="space-y-1 mt-1">
                                  {diaInfo.itens.slice(0, 2).map((item, idx) => (
                                    <div 
                                      key={idx}
                                      className="text-xs p-1 rounded truncate text-white"
                                      style={{ backgroundColor: item.cor }}
                                      title={`${item.hora} - ${item.titulo}`}
                                    >
                                      {item.hora} {item.titulo.substring(0, 10)}...
                                    </div>
                                  ))}
                                  {diaInfo.itens.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{diaInfo.itens.length - 2} mais
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Filtros Rápidos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Tipo de Evento</Label>
                        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os tipos</SelectItem>
                            {tiposEventos.map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.id}>
                                {tipo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Status</Label>
                        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                          <SelectTrigger>
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
                      
                      <Button 
                        onClick={loadEventos} 
                        className="w-full"
                        size="sm"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Aplicar Filtros
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Eventos Tab */}
            <TabsContent value="eventos" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.map((evento) => {
                  const IconComponent = getIconComponent(evento.tipo_evento?.icone || 'CalendarIcon');
                  return (
                    <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent 
                              className="h-5 w-5" 
                              style={{ color: evento.tipo_evento?.cor }} 
                            />
                            <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                          </div>
                          <Badge className={getStatusColor(evento.status)}>
                            {evento.status}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {evento.descricao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            {formatDate(evento.data_inicio)} às {formatTime(evento.data_inicio)}
                          </div>
                          {evento.local && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              {evento.local}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {evento.tipo_evento?.nome}
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
                            onClick={() => {
                              setSelectedEvento(evento);
                              setShowEventoDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Turnos Tab */}
            <TabsContent value="turnos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Gestão de Turnos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {turnos.map((turno) => (
                      <div key={turno.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{turno.evento?.titulo}</div>
                            <div className="text-sm text-gray-500">
                              {turno.funcao} • {turno.local_turno}
                            </div>
                            <div className="text-sm text-gray-500">
                              {turno.hora_inicio} - {turno.hora_fim}
                              {turno.voluntario?.nome && ` • ${turno.voluntario.nome}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(turno.status)}>
                            {turno.status}
                          </Badge>
                          {turno.horas_trabalhadas && (
                            <Badge variant="outline">
                              {turno.horas_trabalhadas}h
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Consultas Tab */}
            <TabsContent value="consultas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Consultas Veterinárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultas.map((consulta) => (
                      <div key={consulta.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-red-100 rounded-full">
                            <Stethoscope className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium">{consulta.evento?.titulo}</div>
                            <div className="text-sm text-gray-500">
                              {consulta.tipo_consulta} • {consulta.animal?.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {consulta.veterinario_nome}
                              {consulta.custo_estimado && ` • €${consulta.custo_estimado}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(consulta.evento?.status || 'agendado')}>
                            {consulta.evento?.status || 'agendado'}
                          </Badge>
                          <Badge variant="outline">
                            {consulta.animal?.especie}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lembretes Tab */}
            <TabsContent value="lembretes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Sistema de Lembretes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lembretes.map((lembrete) => (
                      <div key={lembrete.id} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${lembrete.enviado ? 'bg-green-100' : 'bg-orange-100'}`}>
                            <Bell className={`h-4 w-4 ${lembrete.enviado ? 'text-green-600' : 'text-orange-600'}`} />
                          </div>
                          <div>
                            <div className="font-medium">{lembrete.assunto}</div>
                            <div className="text-sm text-gray-500">
                              {lembrete.evento?.titulo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lembrete.minutos_antecedencia} min antes • {lembrete.tipo_lembrete}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={lembrete.enviado ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {lembrete.enviado ? 'Enviado' : 'Pendente'}
                          </Badge>
                          {lembrete.data_envio && (
                            <Badge variant="outline">
                              {formatDate(lembrete.data_envio)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Intervenções Tab */}
            <TabsContent value="intervencoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-600" />
                    Intervenções Agendadas
                  </CardTitle>
                  <CardDescription>
                    Intervenções veterinárias agendadas para os animais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {intervencoes.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">Nenhuma intervenção agendada</p>
                      </div>
                    ) : (
                      intervencoes.map((intervencao) => (
                        <div key={intervencao.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <Heart className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {intervencao.animais?.nome} - {intervencao.tipos_intervencoes?.nome}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')} às {intervencao.hora_intervencao}
                              </div>
                              <div className="text-sm text-gray-500">
                                Clínica: {intervencao.clinicas_veterinarias?.nome || 'Não especificada'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-red-100 text-red-800">
                              {intervencao.status || 'Agendada'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Missões Tab */}
            <TabsContent value="missoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Missões Agendadas
                  </CardTitle>
                  <CardDescription>
                    Missões e tarefas agendadas para os voluntários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {missoes.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">Nenhuma missão agendada</p>
                      </div>
                    ) : (
                      missoes.map((missao) => (
                        <div key={missao.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: missao.tipos_missoes_2025_12_13_09_00?.cor + '20' }}
                            >
                              <Target className="h-6 w-6" style={{ color: missao.tipos_missoes_2025_12_13_09_00?.cor }} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {missao.titulo}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(missao.data_inicio).toLocaleDateString('pt-PT')} às {missao.hora_inicio}
                              </div>
                              <div className="text-sm text-gray-500">
                                Local: {missao.local_principal}
                              </div>
                              {missao.animais && (
                                <div className="text-sm text-gray-500">
                                  Animal: {missao.animais.nome}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-100 text-blue-800">
                              {missao.status || 'Planejada'}
                            </Badge>
                            <div className="text-sm text-gray-500 mt-1">
                              Responsável: {missao.voluntarios?.nome}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog de Detalhes do Evento */}
      <Dialog open={showEventoDialog} onOpenChange={setShowEventoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedEvento && (
                <>
                  {React.createElement(getIconComponent(selectedEvento.tipo_evento?.icone || 'CalendarIcon'), {
                    className: "h-6 w-6 mr-2",
                    style: { color: selectedEvento.tipo_evento?.cor }
                  })}
                  {selectedEvento.titulo}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedEvento?.descricao}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvento && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data e Hora</Label>
                  <div className="text-sm">
                    {formatDate(selectedEvento.data_inicio)} às {formatTime(selectedEvento.data_inicio)}
                  </div>
                </div>
                <div>
                  <Label>Duração</Label>
                  <div className="text-sm">
                    Até {formatTime(selectedEvento.data_fim)}
                  </div>
                </div>
                <div>
                  <Label>Local</Label>
                  <div className="text-sm">{selectedEvento.local || 'Não especificado'}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedEvento.status)}>
                    {selectedEvento.status}
                  </Badge>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Badge className={getPriorityColor(selectedEvento.prioridade)}>
                    {selectedEvento.prioridade}
                  </Badge>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <div className="text-sm">{selectedEvento.tipo_evento?.nome}</div>
                </div>
              </div>

              {selectedEvento.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvento.observacoes}
                  </p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEventoDialog(false)}>
                  Fechar
                </Button>
                <Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Evento</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo evento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={novoEvento.titulo}
                  onChange={(e) => setNovoEvento({...novoEvento, titulo: e.target.value})}
                  placeholder="Título do evento"
                />
              </div>
              <div>
                <Label>Tipo de Evento *</Label>
                <Select 
                  value={novoEvento.tipo_evento_id} 
                  onValueChange={(value) => setNovoEvento({...novoEvento, tipo_evento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEventos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={novoEvento.descricao}
                onChange={(e) => setNovoEvento({...novoEvento, descricao: e.target.value})}
                placeholder="Descrição do evento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início *</Label>
                <Input
                  type="date"
                  value={novoEvento.data_inicio}
                  onChange={(e) => setNovoEvento({...novoEvento, data_inicio: e.target.value})}
                />
              </div>
              <div>
                <Label>Hora de Início *</Label>
                <Input
                  type="time"
                  value={novoEvento.hora_inicio}
                  onChange={(e) => setNovoEvento({...novoEvento, hora_inicio: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Fim *</Label>
                <Input
                  type="date"
                  value={novoEvento.data_fim}
                  onChange={(e) => setNovoEvento({...novoEvento, data_fim: e.target.value})}
                />
              </div>
              <div>
                <Label>Hora de Fim *</Label>
                <Input
                  type="time"
                  value={novoEvento.hora_fim}
                  onChange={(e) => setNovoEvento({...novoEvento, hora_fim: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Local</Label>
                <Input
                  value={novoEvento.local}
                  onChange={(e) => setNovoEvento({...novoEvento, local: e.target.value})}
                  placeholder="Local do evento"
                />
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select 
                  value={novoEvento.prioridade} 
                  onValueChange={(value) => setNovoEvento({...novoEvento, prioridade: value})}
                >
                  <SelectTrigger>
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
              <Label>Observações</Label>
              <Textarea
                value={novoEvento.observacoes}
                onChange={(e) => setNovoEvento({...novoEvento, observacoes: e.target.value})}
                placeholder="Observações adicionais"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lembrete"
                  checked={novoEvento.lembrete_ativo}
                  onChange={(e) => setNovoEvento({...novoEvento, lembrete_ativo: e.target.checked})}
                />
                <Label htmlFor="lembrete">Ativar lembrete</Label>
              </div>
              {novoEvento.lembrete_ativo && (
                <div className="flex items-center space-x-2">
                  <Label>Antecedência:</Label>
                  <Input
                    type="number"
                    value={novoEvento.lembrete_antecedencia}
                    onChange={(e) => setNovoEvento({...novoEvento, lembrete_antecedencia: parseInt(e.target.value)})}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">minutos</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowNovoEventoDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={criarEvento} className="flex-1">
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

export default ModuloAgenda;