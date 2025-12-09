import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2,
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3,
  PieChart,
  Stethoscope,
  Heart,
  Shield,
  Award,
  Calendar as CalendarIcon,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";

// Interfaces
interface ClinicaParceira {
  id: string;
  nome: string;
  codigo: string;
  morada?: string;
  telefone?: string;
  email?: string;
  website?: string;
  especialidades: string[];
  tipo_parceria: string;
  desconto_percentual: number;
  ativo: boolean;
  data_inicio_parceria?: string;
  created_at: string;
}

interface VeterinarioContacto {
  id: string;
  clinica_id: string;
  nome: string;
  especialidade?: string;
  telefone?: string;
  email?: string;
  cedula_profissional?: string;
  ativo: boolean;
}

interface ConsultaAgendamento {
  id: string;
  animal_id: string;
  clinica_id: string;
  tipo_consulta: string;
  data_agendamento: string;
  status: string;
  custo_estimado?: number;
  custo_real?: number;
}

interface EstatisticasClinicas {
  totalClinicas: number;
  clinicasAtivas: number;
  totalVeterinarios: number;
  consultasAgendadas: number;
  consultasRealizadas: number;
  custoTotalMes: number;
  mediaAvaliacoes: number;
  parcerias: {
    convenio: number;
    desconto: number;
    emergencia: number;
  };
}

const ModuloClinicas = () => {
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasClinicas | null>(null);
  const [clinicas, setClinicas] = useState<ClinicaParceira[]>([]);
  const [veterinarios, setVeterinarios] = useState<VeterinarioContacto[]>([]);
  const [consultas, setConsultas] = useState<ConsultaAgendamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [novaClinicaOpen, setNovaClinicaOpen] = useState(false);
  const [novoVeterinarioOpen, setNovoVeterinarioOpen] = useState(false);
  const [novaConsultaOpen, setNovaConsultaOpen] = useState(false);
  
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Formulários
  const [clinicaForm, setClinicaForm] = useState({
    nome: '',
    codigo: '',
    morada: '',
    telefone: '',
    email: '',
    website: '',
    especialidades: [] as string[],
    tipo_parceria: 'convenio',
    desconto_percentual: 0,
    data_inicio_parceria: ''
  });

  const [veterinarioForm, setVeterinarioForm] = useState({
    clinica_id: '',
    nome: '',
    especialidade: '',
    telefone: '',
    email: '',
    cedula_profissional: ''
  });

  const [consultaForm, setConsultaForm] = useState({
    animal_id: '',
    clinica_id: '',
    veterinario_id: '',
    tipo_consulta: 'consulta_rotina',
    data_agendamento: '',
    motivo: '',
    custo_estimado: 0
  });

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem aceder ao módulo de clínicas
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar clínicas
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas_parceiras')
        .select('*')
        .order('nome');

      if (clinicasError) throw clinicasError;

      // Carregar veterinários
      const { data: veterinariosData, error: veterinariosError } = await supabase
        .from('veterinarios_contactos')
        .select('*')
        .order('nome');

      if (veterinariosError) throw veterinariosError;

      // Carregar consultas
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas_agendamentos')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (consultasError) throw consultasError;

      // Carregar avaliações
      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes_parcerias')
        .select('nota_geral');

      if (avaliacoesError) throw avaliacoesError;

      // Calcular estatísticas
      const clinicasAtivas = (clinicasData || []).filter(c => c.ativo).length;
      const veterinariosAtivos = (veterinariosData || []).filter(v => v.ativo).length;
      const consultasAgendadas = (consultasData || []).filter(c => c.status === 'agendado' || c.status === 'confirmado').length;
      const consultasRealizadas = (consultasData || []).filter(c => c.status === 'realizado').length;
      
      const custoTotalMes = (consultasData || [])
        .filter(c => {
          const dataConsulta = new Date(c.data_agendamento);
          const agora = new Date();
          return dataConsulta.getMonth() === agora.getMonth() && 
                 dataConsulta.getFullYear() === agora.getFullYear() &&
                 c.custo_real;
        })
        .reduce((total, c) => total + (c.custo_real || 0), 0);

      const mediaAvaliacoes = avaliacoesData && avaliacoesData.length > 0
        ? avaliacoesData.reduce((sum, a) => sum + (a.nota_geral || 0), 0) / avaliacoesData.length
        : 0;

      // Contar tipos de parceria
      const parcerias = (clinicasData || []).reduce((acc, c) => {
        acc[c.tipo_parceria as keyof typeof acc] = (acc[c.tipo_parceria as keyof typeof acc] || 0) + 1;
        return acc;
      }, { convenio: 0, desconto: 0, emergencia: 0 });

      const stats: EstatisticasClinicas = {
        totalClinicas: (clinicasData || []).length,
        clinicasAtivas,
        totalVeterinarios: veterinariosAtivos,
        consultasAgendadas,
        consultasRealizadas,
        custoTotalMes,
        mediaAvaliacoes,
        parcerias
      };

      setEstatisticas(stats);
      setClinicas(clinicasData || []);
      setVeterinarios(veterinariosData || []);
      setConsultas(consultasData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do módulo clínicas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarClinica = async () => {
    try {
      const { error } = await supabase
        .from('clinicas_parceiras')
        .insert([{
          ...clinicaForm,
          especialidades: clinicaForm.especialidades.length > 0 ? clinicaForm.especialidades : ['Clínica Geral']
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Clínica cadastrada com sucesso",
      });

      setNovaClinicaOpen(false);
      setClinicaForm({
        nome: '',
        codigo: '',
        morada: '',
        telefone: '',
        email: '',
        website: '',
        especialidades: [],
        tipo_parceria: 'convenio',
        desconto_percentual: 0,
        data_inicio_parceria: ''
      });
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar clínica",
        variant: "destructive",
      });
    }
  };

  const handleSalvarVeterinario = async () => {
    try {
      const { error } = await supabase
        .from('veterinarios_contactos')
        .insert([veterinarioForm]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Veterinário cadastrado com sucesso",
      });

      setNovoVeterinarioOpen(false);
      setVeterinarioForm({
        clinica_id: '',
        nome: '',
        especialidade: '',
        telefone: '',
        email: '',
        cedula_profissional: ''
      });
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar veterinário",
        variant: "destructive",
      });
    }
  };

  const getTipoConsultaColor = (tipo: string) => {
    switch (tipo) {
      case 'emergencia': return 'bg-red-100 text-red-800';
      case 'cirurgia': return 'bg-purple-100 text-purple-800';
      case 'exame': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizado': return 'text-green-600';
      case 'confirmado': return 'text-blue-600';
      case 'agendado': return 'text-yellow-600';
      case 'cancelado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'realizado': return <CheckCircle className="h-4 w-4" />;
      case 'confirmado': return <Clock className="h-4 w-4" />;
      case 'agendado': return <Calendar className="h-4 w-4" />;
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const clinicasFiltradas = clinicas.filter(clinica => {
    const matchesSearch = clinica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clinica.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filtroTipo === 'todos' || clinica.tipo_parceria === filtroTipo;
    return matchesSearch && matchesTipo;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando módulo clínicas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                Módulo Clínicas
              </h1>
              <p className="text-gray-600 mt-1">
                Gestão completa de clínicas veterinárias e parcerias
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clínicas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas?.totalClinicas || 0}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas?.clinicasAtivas || 0} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veterinários</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas?.totalVeterinarios || 0}</div>
              <p className="text-xs text-muted-foreground">
                Contactos registados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas?.consultasAgendadas || 0}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas?.consultasRealizadas || 0} realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custos do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{(estatisticas?.custoTotalMes || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avaliação: {(estatisticas?.mediaAvaliacoes || 0).toFixed(1)}/5 ⭐
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="clinicas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clinicas">Clínicas Parceiras</TabsTrigger>
            <TabsTrigger value="veterinarios">Veterinários</TabsTrigger>
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Tab Clínicas */}
          <TabsContent value="clinicas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Clínicas Parceiras</CardTitle>
                    <CardDescription>
                      Gestão de clínicas veterinárias e parcerias
                    </CardDescription>
                  </div>
                  <Dialog open={novaClinicaOpen} onOpenChange={setNovaClinicaOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Clínica
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
                        <DialogDescription>
                          Adicione uma nova clínica veterinária parceira
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome da Clínica</Label>
                          <Input
                            id="nome"
                            value={clinicaForm.nome}
                            onChange={(e) => setClinicaForm({...clinicaForm, nome: e.target.value})}
                            placeholder="Ex: Clínica Veterinária Central"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="codigo">Código</Label>
                          <Input
                            id="codigo"
                            value={clinicaForm.codigo}
                            onChange={(e) => setClinicaForm({...clinicaForm, codigo: e.target.value})}
                            placeholder="Ex: CVC001"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="morada">Morada</Label>
                          <Input
                            id="morada"
                            value={clinicaForm.morada}
                            onChange={(e) => setClinicaForm({...clinicaForm, morada: e.target.value})}
                            placeholder="Morada completa"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={clinicaForm.telefone}
                            onChange={(e) => setClinicaForm({...clinicaForm, telefone: e.target.value})}
                            placeholder="213456789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={clinicaForm.email}
                            onChange={(e) => setClinicaForm({...clinicaForm, email: e.target.value})}
                            placeholder="contacto@clinica.pt"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipo_parceria">Tipo de Parceria</Label>
                          <Select value={clinicaForm.tipo_parceria} onValueChange={(value) => setClinicaForm({...clinicaForm, tipo_parceria: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="convenio">Convénio</SelectItem>
                              <SelectItem value="desconto">Desconto</SelectItem>
                              <SelectItem value="emergencia">Emergência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="desconto">Desconto (%)</Label>
                          <Input
                            id="desconto"
                            type="number"
                            value={clinicaForm.desconto_percentual}
                            onChange={(e) => setClinicaForm({...clinicaForm, desconto_percentual: parseFloat(e.target.value) || 0})}
                            placeholder="15"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="data_inicio">Data Início Parceria</Label>
                          <Input
                            id="data_inicio"
                            type="date"
                            value={clinicaForm.data_inicio_parceria}
                            onChange={(e) => setClinicaForm({...clinicaForm, data_inicio_parceria: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setNovaClinicaOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSalvarClinica}>
                          Salvar Clínica
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Pesquisar clínicas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="convenio">Convénio</SelectItem>
                      <SelectItem value="desconto">Desconto</SelectItem>
                      <SelectItem value="emergencia">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Clínicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clinicasFiltradas.map((clinica) => (
                    <Card key={clinica.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{clinica.nome}</CardTitle>
                            <p className="text-sm text-gray-500">{clinica.codigo}</p>
                          </div>
                          <Badge variant={clinica.ativo ? "default" : "secondary"}>
                            {clinica.ativo ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {clinica.morada && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {clinica.morada}
                          </div>
                        )}
                        {clinica.telefone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {clinica.telefone}
                          </div>
                        )}
                        {clinica.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {clinica.email}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline" className="text-xs">
                            {clinica.tipo_parceria} - {clinica.desconto_percentual}%
                          </Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {clinica.especialidades && clinica.especialidades.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {clinica.especialidades.slice(0, 3).map((esp, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {esp}
                              </Badge>
                            ))}
                            {clinica.especialidades.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{clinica.especialidades.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {clinicasFiltradas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma clínica encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Veterinários */}
          <TabsContent value="veterinarios" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Veterinários</CardTitle>
                    <CardDescription>
                      Contactos dos veterinários das clínicas parceiras
                    </CardDescription>
                  </div>
                  <Dialog open={novoVeterinarioOpen} onOpenChange={setNovoVeterinarioOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Veterinário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cadastrar Veterinário</DialogTitle>
                        <DialogDescription>
                          Adicione um novo contacto veterinário
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clinica_select">Clínica</Label>
                          <Select value={veterinarioForm.clinica_id} onValueChange={(value) => setVeterinarioForm({...veterinarioForm, clinica_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma clínica" />
                            </SelectTrigger>
                            <SelectContent>
                              {clinicas.filter(c => c.ativo).map((clinica) => (
                                <SelectItem key={clinica.id} value={clinica.id}>
                                  {clinica.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nome_vet">Nome</Label>
                          <Input
                            id="nome_vet"
                            value={veterinarioForm.nome}
                            onChange={(e) => setVeterinarioForm({...veterinarioForm, nome: e.target.value})}
                            placeholder="Dr. João Silva"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="especialidade_vet">Especialidade</Label>
                          <Input
                            id="especialidade_vet"
                            value={veterinarioForm.especialidade}
                            onChange={(e) => setVeterinarioForm({...veterinarioForm, especialidade: e.target.value})}
                            placeholder="Clínica Geral"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone_vet">Telefone</Label>
                          <Input
                            id="telefone_vet"
                            value={veterinarioForm.telefone}
                            onChange={(e) => setVeterinarioForm({...veterinarioForm, telefone: e.target.value})}
                            placeholder="913456789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email_vet">Email</Label>
                          <Input
                            id="email_vet"
                            type="email"
                            value={veterinarioForm.email}
                            onChange={(e) => setVeterinarioForm({...veterinarioForm, email: e.target.value})}
                            placeholder="veterinario@clinica.pt"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cedula">Cédula Profissional</Label>
                          <Input
                            id="cedula"
                            value={veterinarioForm.cedula_profissional}
                            onChange={(e) => setVeterinarioForm({...veterinarioForm, cedula_profissional: e.target.value})}
                            placeholder="OMV12345"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setNovoVeterinarioOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSalvarVeterinario}>
                          Salvar Veterinário
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {veterinarios.map((veterinario) => {
                    const clinica = clinicas.find(c => c.id === veterinario.clinica_id);
                    return (
                      <div key={veterinario.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{veterinario.nome}</h4>
                            <p className="text-sm text-gray-600">{veterinario.especialidade}</p>
                            <p className="text-xs text-gray-500">{clinica?.nome}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{veterinario.telefone}</p>
                          <p className="text-xs text-gray-500">{veterinario.email}</p>
                          <Badge variant={veterinario.ativo ? "default" : "secondary"} className="mt-1">
                            {veterinario.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {veterinarios.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum veterinário cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Consultas */}
          <TabsContent value="consultas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Consultas e Agendamentos</CardTitle>
                    <CardDescription>
                      Gestão de consultas veterinárias
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Consulta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultas.slice(0, 10).map((consulta) => {
                    const clinica = clinicas.find(c => c.id === consulta.clinica_id);
                    return (
                      <div key={consulta.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 ${getStatusColor(consulta.status)}`}>
                            {getStatusIcon(consulta.status)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getTipoConsultaColor(consulta.tipo_consulta)}>
                                {consulta.tipo_consulta.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm font-medium">{clinica?.nome}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(consulta.data_agendamento).toLocaleDateString('pt-PT')} às{' '}
                              {new Date(consulta.data_agendamento).toLocaleTimeString('pt-PT', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {consulta.custo_real ? `€${consulta.custo_real}` : 
                             consulta.custo_estimado ? `~€${consulta.custo_estimado}` : '-'}
                          </p>
                          <Badge variant="outline" className={`${getStatusColor(consulta.status)} border-current`}>
                            {consulta.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {consultas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma consulta agendada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Relatórios */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Distribuição por Tipo de Parceria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Convénio</span>
                      <span className="font-medium">{estatisticas?.parcerias.convenio || 0}</span>
                    </div>
                    <Progress value={(estatisticas?.parcerias.convenio || 0) / (estatisticas?.totalClinicas || 1) * 100} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desconto</span>
                      <span className="font-medium">{estatisticas?.parcerias.desconto || 0}</span>
                    </div>
                    <Progress value={(estatisticas?.parcerias.desconto || 0) / (estatisticas?.totalClinicas || 1) * 100} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emergência</span>
                      <span className="font-medium">{estatisticas?.parcerias.emergencia || 0}</span>
                    </div>
                    <Progress value={(estatisticas?.parcerias.emergencia || 0) / (estatisticas?.totalClinicas || 1) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance das Clínicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de Ocupação</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Satisfação Média</span>
                      <span className="font-medium">{(estatisticas?.mediaAvaliacoes || 0).toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tempo Médio Resposta</span>
                      <span className="font-medium">2.5h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de Cancelamento</span>
                      <span className="font-medium">8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      €{(estatisticas?.custoTotalMes || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Custos do Mês</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      €{((estatisticas?.custoTotalMes || 0) * 0.15).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Poupança com Descontos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      €{((estatisticas?.custoTotalMes || 0) / (estatisticas?.consultasRealizadas || 1)).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Custo Médio por Consulta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModuloClinicas;