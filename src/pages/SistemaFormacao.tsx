import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  GraduationCap,
  Plus, 
  Calendar,
  Users,
  Award,
  TrendingUp,
  BookOpen,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { 
  TipoFormacao, 
  AcaoFormacao, 
  ParticipacaoFormacao,
  EstatisticasFormacao,
  StatusAcaoFormacao,
  getTipoFormacaoIcon,
  getTipoFormacaoCor,
  STATUS_ACAO_LABELS,
  getStatusColor
} from "@/types/formacao";

const SistemaFormacao = () => {
  const [tiposFormacao, setTiposFormacao] = useState<TipoFormacao[]>([]);
  const [acoesFormacao, setAcoesFormacao] = useState<AcaoFormacao[]>([]);
  const [participacoes, setParticipacoes] = useState<ParticipacaoFormacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasFormacao | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusAcaoFormacao | 'todos'>('todos');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  
  // Estados para modal de nova ação
  const [novaAcaoDialogOpen, setNovaAcaoDialogOpen] = useState(false);
  const [novaAcaoForm, setNovaAcaoForm] = useState({
    codigo_acao: '',
    tipo_formacao_id: '',
    nome_acao: '',
    descricao: '',
    formador: '',
    local_formacao: '',
    data_inicio: '',
    data_fim: '',
    carga_horaria_real: 0,
    vagas_maximas: 20,
    preco: 0,
    status: 'planeada' as StatusAcaoFormacao,
    observacoes: ''
  });
  const [submittingNovaAcao, setSubmittingNovaAcao] = useState(false);
  
  // Estados para modal de novo tipo de formação
  const [novoTipoDialogOpen, setNovoTipoDialogOpen] = useState(false);
  const [novoTipoForm, setNovoTipoForm] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    nivel_ordem: 1,
    carga_horaria_minima: 0,
    competencias: [] as string[],
    pre_requisitos: [] as string[],
    cor: '#3B82F6',
    icone: '🎓'
  });
  const [submittingNovoTipo, setSubmittingNovoTipo] = useState(false);
  const [novaCompetencia, setNovaCompetencia] = useState('');

  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem aceder ao sistema de formação
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/voluntarios">
              <Button variant="outline" className="w-full">
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar tipos de formação - CONSULTA SIMPLIFICADA
      console.log('🔍 Iniciando carregamento de tipos de formação...');
      
      let tiposData: any[] = [];
      
      try {
        const { data: tiposDataResponse, error: tiposError } = await supabase
          .from('tipos_formacao')
          .select(`
            id,
            codigo,
            nome,
            descricao,
            nivel_ordem,
            carga_horaria_minima,
            competencias,
            pre_requisitos,
            cor,
            icone,
            ativo
          `)
          .order('nivel_ordem');

        console.log('📊 Resposta da consulta tipos:', {
          data: tiposDataResponse,
          error: tiposError,
          count: tiposDataResponse?.length || 0
        });
        
        if (tiposError) {
          console.error('❌ Erro ao carregar tipos:', tiposError);
          throw tiposError;
        }

        if (!tiposDataResponse || tiposDataResponse.length === 0) {
          console.warn('⚠️ Nenhum tipo de formação encontrado!');
          toast({
            title: "Aviso",
            description: "Nenhum tipo de formação encontrado na base de dados",
            variant: "destructive",
          });
        } else {
          console.log(`✅ ${tiposDataResponse.length} tipos de formação carregados com sucesso!`);
          tiposData = tiposDataResponse; // Atribuir à variável externa
        }
      } catch (error) {
        console.error('🚫 Erro crítico ao carregar tipos:', error);
        throw error;
      }

      // Carregar ações de formação com tipos
      const { data: acoesData, error: acoesError } = await supabase
        .from('acoes_formacao')
        .select(`
          *,
          tipo_formacao:tipos_formacao(*)
        `)
        .order('data_inicio', { ascending: false });

      if (acoesError) throw acoesError;

      // Carregar participações recentes
      const { data: participacoesData, error: participacoesError } = await supabase
        .from('participacoes_formacao')
        .select(`
          *,
          voluntario:voluntarios(nome, email),
          acao_formacao:acoes_formacao(codigo_acao, nome_acao)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (participacoesError) throw participacoesError;

      // Processar tipos de formação (converter JSONB para arrays)
      const tiposProcessados = (tiposData || []).map(tipo => ({
        ...tipo,
        competencias: Array.isArray(tipo.competencias) ? tipo.competencias : 
                     (typeof tipo.competencias === 'string' ? JSON.parse(tipo.competencias) : []),
        pre_requisitos: Array.isArray(tipo.pre_requisitos) ? tipo.pre_requisitos : 
                       (typeof tipo.pre_requisitos === 'string' ? JSON.parse(tipo.pre_requisitos) : [])
      }));

      console.log('Tipos de formação carregados:', tiposProcessados);
      
      setTiposFormacao(tiposProcessados);
      setAcoesFormacao(acoesData || []);
      setParticipacoes(participacoesData || []);

      // Calcular estatísticas
      calcularEstatisticas(tiposProcessados, acoesData || [], participacoesData || []);

    } catch (error: any) {
      console.error('🚫 Erro ao carregar dados de formação:', error);
      
      // Fallback: usar dados hardcoded se não conseguir carregar
      const tiposFallback = [
        {
          id: '1',
          codigo: 'FORMA_BASE',
          nome: 'FORMA BASE',
          descricao: 'Formação básica obrigatória',
          nivel_ordem: 1,
          carga_horaria_minima: 40,
          competencias: ['Cuidados básicos', 'Primeiros socorros'],
          pre_requisitos: [],
          cor: '#10B981',
          icone: '🌱',
          ativo: true
        },
        {
          id: '2',
          codigo: 'FORMA_N1',
          nome: 'Formação Nível 1',
          descricao: 'Primeiro nível de especialização',
          nivel_ordem: 2,
          carga_horaria_minima: 60,
          competencias: ['Técnicas de resgate', 'Trabalho em equipa'],
          pre_requisitos: [],
          cor: '#3B82F6',
          icone: '🛡️',
          ativo: true
        }
      ];
      
      console.log('🔄 Usando dados fallback:', tiposFallback);
      setTiposFormacao(tiposFallback);
      
      toast({
        title: "Aviso",
        description: "Usando dados de exemplo. Verifique a conexão com a base de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (tipos: TipoFormacao[], acoes: AcaoFormacao[], participacoes: ParticipacaoFormacao[]) => {
    const stats: EstatisticasFormacao = {
      total_tipos_formacao: tipos.length,
      total_acoes_formacao: acoes.length,
      total_participacoes: participacoes.length,
      total_certificados_emitidos: participacoes.filter(p => p.certificado_emitido).length,
      
      acoes_por_status: {
        planeada: acoes.filter(a => a.status === 'planeada').length,
        inscricoes_abertas: acoes.filter(a => a.status === 'inscricoes_abertas').length,
        em_curso: acoes.filter(a => a.status === 'em_curso').length,
        concluida: acoes.filter(a => a.status === 'concluida').length,
        cancelada: acoes.filter(a => a.status === 'cancelada').length,
      },
      
      participacoes_por_status: {
        inscrito: participacoes.filter(p => p.status_participacao === 'inscrito').length,
        confirmado: participacoes.filter(p => p.status_participacao === 'confirmado').length,
        presente: participacoes.filter(p => p.status_participacao === 'presente').length,
        ausente: participacoes.filter(p => p.status_participacao === 'ausente').length,
        aprovado: participacoes.filter(p => p.status_participacao === 'aprovado').length,
        reprovado: participacoes.filter(p => p.status_participacao === 'reprovado').length,
        desistiu: participacoes.filter(p => p.status_participacao === 'desistiu').length,
      },
      
      participacoes_por_tipo: tipos.map(tipo => {
        const participacoesTipo = participacoes.filter(p => 
          acoes.find(a => a.id === p.acao_formacao_id)?.tipo_formacao_id === tipo.id
        );
        const aprovados = participacoesTipo.filter(p => p.status_participacao === 'aprovado').length;
        
        return {
          tipo_codigo: tipo.codigo,
          tipo_nome: tipo.nome,
          total_participacoes: participacoesTipo.length,
          total_aprovados: aprovados,
          taxa_aprovacao: participacoesTipo.length > 0 ? Math.round((aprovados / participacoesTipo.length) * 100) : 0
        };
      }),
      
      participacoes_por_mes: [] // Implementar se necessário
    };

    setEstatisticas(stats);
  };

  // Filtrar ações
  const acoesFiltradas = acoesFormacao.filter(acao => {
    const matchTipo = filtroTipo === 'todos' || acao.tipo_formacao_id === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || acao.status === filtroStatus;
    const matchPesquisa = !termoPesquisa || 
      acao.nome_acao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      acao.codigo_acao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      acao.formador?.toLowerCase().includes(termoPesquisa.toLowerCase());
    
    return matchTipo && matchStatus && matchPesquisa;
  });

  // Funções para modal de nova ação
  const resetNovaAcaoForm = () => {
    setNovaAcaoForm({
      codigo_acao: '',
      tipo_formacao_id: '',
      nome_acao: '',
      descricao: '',
      formador: '',
      local_formacao: '',
      data_inicio: '',
      data_fim: '',
      carga_horaria_real: 0,
      vagas_maximas: 20,
      preco: 0,
      status: 'planeada',
      observacoes: ''
    });
  };

  const handleNovaAcaoSubmit = async () => {
    try {
      setSubmittingNovaAcao(true);

      // Validação básica
      if (!novaAcaoForm.codigo_acao || !novaAcaoForm.tipo_formacao_id || !novaAcaoForm.nome_acao) {
        toast({
          title: "Erro",
          description: "Por favor, preencha os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // Inserir nova ação
      const { data, error } = await supabase
        .from('acoes_formacao')
        .insert([{
          codigo_acao: novaAcaoForm.codigo_acao,
          tipo_formacao_id: novaAcaoForm.tipo_formacao_id,
          nome_acao: novaAcaoForm.nome_acao,
          descricao: novaAcaoForm.descricao || null,
          formador: novaAcaoForm.formador || null,
          local_formacao: novaAcaoForm.local_formacao || null,
          data_inicio: novaAcaoForm.data_inicio || null,
          data_fim: novaAcaoForm.data_fim || null,
          carga_horaria_real: novaAcaoForm.carga_horaria_real,
          vagas_maximas: novaAcaoForm.vagas_maximas,
          preco: novaAcaoForm.preco,
          status: novaAcaoForm.status,
          observacoes: novaAcaoForm.observacoes || null
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nova ação de formação criada com sucesso",
      });

      // Fechar modal e recarregar dados
      setNovaAcaoDialogOpen(false);
      resetNovaAcaoForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao criar nova ação:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar nova ação de formação",
        variant: "destructive",
      });
    } finally {
      setSubmittingNovaAcao(false);
    }
  };

  const handleNovaAcaoInputChange = (field: string, value: any) => {
    setNovaAcaoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para modal de novo tipo de formação
  const resetNovoTipoForm = () => {
    setNovoTipoForm({
      codigo: '',
      nome: '',
      descricao: '',
      nivel_ordem: 1,
      carga_horaria_minima: 0,
      competencias: [],
      pre_requisitos: [],
      cor: '#3B82F6',
      icone: '🎓'
    });
    setNovaCompetencia('');
  };

  const handleNovoTipoSubmit = async () => {
    try {
      setSubmittingNovoTipo(true);

      // Validação básica
      if (!novoTipoForm.codigo || !novoTipoForm.nome) {
        toast({
          title: "Erro",
          description: "Por favor, preencha o código e nome do tipo",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o código já existe
      const { data: existingTipo } = await supabase
        .from('tipos_formacao')
        .select('id')
        .eq('codigo', novoTipoForm.codigo)
        .single();

      if (existingTipo) {
        toast({
          title: "Erro",
          description: "Já existe um tipo de formação com este código",
          variant: "destructive",
        });
        return;
      }

      // Inserir novo tipo
      const { data, error } = await supabase
        .from('tipos_formacao')
        .insert([{
          codigo: novoTipoForm.codigo,
          nome: novoTipoForm.nome,
          descricao: novoTipoForm.descricao || null,
          nivel_ordem: novoTipoForm.nivel_ordem,
          carga_horaria_minima: novoTipoForm.carga_horaria_minima,
          competencias: JSON.stringify(novoTipoForm.competencias),
          pre_requisitos: JSON.stringify(novoTipoForm.pre_requisitos),
          cor: novoTipoForm.cor,
          icone: novoTipoForm.icone,
          ativo: true
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Novo tipo de formação criado com sucesso",
      });

      // Fechar modal e recarregar dados
      setNovoTipoDialogOpen(false);
      resetNovoTipoForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao criar novo tipo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar novo tipo de formação",
        variant: "destructive",
      });
    } finally {
      setSubmittingNovoTipo(false);
    }
  };

  const handleNovoTipoInputChange = (field: string, value: any) => {
    setNovoTipoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const adicionarCompetencia = () => {
    if (novaCompetencia.trim()) {
      setNovoTipoForm(prev => ({
        ...prev,
        competencias: [...prev.competencias, novaCompetencia.trim()]
      }));
      setNovaCompetencia('');
    }
  };

  const removerCompetencia = (index: number) => {
    setNovoTipoForm(prev => ({
      ...prev,
      competencias: prev.competencias.filter((_, i) => i !== index)
    }));
  };

  const togglePreRequisito = (tipoId: string) => {
    setNovoTipoForm(prev => ({
      ...prev,
      pre_requisitos: prev.pre_requisitos.includes(tipoId)
        ? prev.pre_requisitos.filter(id => id !== tipoId)
        : [...prev.pre_requisitos, tipoId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando sistema de formação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="h-8 w-8 mr-3 text-blue-600" />
              Sistema de Formação Valentão
            </h1>
            <p className="text-gray-600 mt-1">
              Gestão completa de tipos, ações e participações em formação
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Voluntários
              </Button>
            </Link>
            <Dialog open={novaAcaoDialogOpen} onOpenChange={setNovaAcaoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetNovaAcaoForm();
                  setNovaAcaoDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ação
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipos de Formação</p>
                    <p className="text-2xl font-bold text-blue-600">{estatisticas.total_tipos_formacao}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ações de Formação</p>
                    <p className="text-2xl font-bold text-green-600">{estatisticas.total_acoes_formacao}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Participações</p>
                    <p className="text-2xl font-bold text-purple-600">{estatisticas.total_participacoes}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Certificados</p>
                    <p className="text-2xl font-bold text-orange-600">{estatisticas.total_certificados_emitidos}</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="acoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 lg:grid-cols-4">
            <TabsTrigger value="acoes">Ações de Formação</TabsTrigger>
            <TabsTrigger value="tipos">Tipos de Formação</TabsTrigger>
            <TabsTrigger value="participacoes">Participações</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Ações de Formação */}
          <TabsContent value="acoes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Ações de Formação</CardTitle>
                    <CardDescription>
                      Instâncias específicas de formação (ACC2502, ACC2506, etc.)
                    </CardDescription>
                  </div>
                  
                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Input
                      placeholder="Pesquisar ações..."
                      value={termoPesquisa}
                      onChange={(e) => setTermoPesquisa(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Tipo de formação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os tipos</SelectItem>
                        {tiposFormacao.map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {getTipoFormacaoIcon(tipo.codigo)} {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filtroStatus} onValueChange={(value) => setFiltroStatus(value as StatusAcaoFormacao | 'todos')}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="planeada">Planeada</SelectItem>
                        <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                        <SelectItem value="em_curso">Em Curso</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ação</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Formador</TableHead>
                      <TableHead>Datas</TableHead>
                      <TableHead>Vagas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acoesFiltradas.map((acao) => (
                      <TableRow key={acao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{acao.nome_acao}</div>
                            <div className="text-sm text-gray-500">{acao.codigo_acao}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {acao.tipo_formacao && (
                            <div className="flex items-center space-x-2">
                              <span style={{ color: getTipoFormacaoCor(acao.tipo_formacao.codigo) }}>
                                {getTipoFormacaoIcon(acao.tipo_formacao.codigo)}
                              </span>
                              <span className="text-sm">{acao.tipo_formacao.nome}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{acao.formador || 'Não definido'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {acao.data_inicio && acao.data_fim ? (
                              <>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span>{new Date(acao.data_inicio).toLocaleDateString('pt-PT')}</span>
                                </div>
                                <div className="text-gray-500">
                                  até {new Date(acao.data_fim).toLocaleDateString('pt-PT')}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">Datas não definidas</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-gray-400" />
                              <span>{acao.vagas_ocupadas}/{acao.vagas_maximas}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${(acao.vagas_ocupadas / acao.vagas_maximas) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: getStatusColor(acao.status),
                              color: getStatusColor(acao.status)
                            }}
                          >
                            {STATUS_ACAO_LABELS[acao.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tipos de Formação */}
          <TabsContent value="tipos" className="space-y-6">
            {/* Cabeçalho da aba Tipos */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Tipos de Formação</h2>
                <p className="text-gray-600">Templates base para criar ações de formação</p>
              </div>
              <Dialog open={novoTipoDialogOpen} onOpenChange={setNovoTipoDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetNovoTipoForm();
                    setNovoTipoDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tipo
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiposFormacao.map((tipo) => (
                <Card key={tipo.id} className="border-l-4" style={{ borderLeftColor: getTipoFormacaoCor(tipo.codigo) }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getTipoFormacaoIcon(tipo.codigo)}</div>
                        <div>
                          <h3 className="font-semibold">{tipo.nome}</h3>
                          <p className="text-sm text-gray-500">{tipo.codigo}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Nível {tipo.nivel_ordem}</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{tipo.descricao}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{tipo.carga_horaria_minima}h mínimas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span>{tipo.competencias.length} competências</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <Badge variant={tipo.ativo ? "default" : "secondary"}>
                          {tipo.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Participações */}
          <TabsContent value="participacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participações Recentes</CardTitle>
                <CardDescription>
                  Últimas 50 participações em ações de formação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Data Inscrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Certificado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participacoes.slice(0, 20).map((participacao) => (
                      <TableRow key={participacao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{participacao.voluntario?.nome}</div>
                            <div className="text-sm text-gray-500">{participacao.voluntario?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{participacao.acao_formacao?.nome_acao}</div>
                            <div className="text-sm text-gray-500">{participacao.acao_formacao?.codigo_acao}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(participacao.data_inscricao).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getStatusColor(participacao.status_participacao),
                              color: getStatusColor(participacao.status_participacao)
                            }}
                          >
                            {participacao.status_participacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {participacao.certificado_emitido ? (
                            <Badge variant="default" className="bg-green-600">
                              <Award className="h-3 w-3 mr-1" />
                              Emitido
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pendente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="estatisticas" className="space-y-6">
            {estatisticas && (
              <>
                {/* Estatísticas por Tipo */}
                <Card>
                  <CardHeader>
                    <CardTitle>Participações por Tipo de Formação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {estatisticas.participacoes_por_tipo.map((item) => (
                        <div key={item.tipo_codigo} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getTipoFormacaoIcon(item.tipo_codigo)}</span>
                            <div>
                              <h4 className="font-medium">{item.tipo_nome}</h4>
                              <p className="text-sm text-gray-500">{item.tipo_codigo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">{item.total_participacoes}</div>
                            <div className="text-sm text-gray-500">
                              {item.total_aprovados} aprovados ({item.taxa_aprovacao}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status das Ações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status das Ações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(estatisticas.acoes_por_status).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm">{STATUS_ACAO_LABELS[status as StatusAcaoFormacao]}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Status das Participações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(estatisticas.participacoes_por_status).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Nova Ação */}
        <Dialog open={novaAcaoDialogOpen} onOpenChange={setNovaAcaoDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Ação de Formação</DialogTitle>
              <DialogDescription>
                Criar uma nova instância de formação (ex: ACC2604, ACC2605, etc.)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo_acao">Código da Ação *</Label>
                  <Input
                    id="codigo_acao"
                    placeholder="Ex: ACC2604"
                    value={novaAcaoForm.codigo_acao}
                    onChange={(e) => handleNovaAcaoInputChange('codigo_acao', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_formacao">Tipo de Formação *</Label>
                  <Select value={novaAcaoForm.tipo_formacao_id} onValueChange={(value) => handleNovaAcaoInputChange('tipo_formacao_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposFormacao.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {getTipoFormacaoIcon(tipo.codigo)} {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="nome_acao">Nome da Ação *</Label>
                <Input
                  id="nome_acao"
                  placeholder="Ex: FORMA BASE - Janeiro 2026"
                  value={novaAcaoForm.nome_acao}
                  onChange={(e) => handleNovaAcaoInputChange('nome_acao', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descrição da ação de formação"
                  value={novaAcaoForm.descricao}
                  onChange={(e) => handleNovaAcaoInputChange('descricao', e.target.value)}
                />
              </div>

              {/* Detalhes da Ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formador">Formador</Label>
                  <Input
                    id="formador"
                    placeholder="Nome do formador"
                    value={novaAcaoForm.formador}
                    onChange={(e) => handleNovaAcaoInputChange('formador', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="local_formacao">Local</Label>
                  <Input
                    id="local_formacao"
                    placeholder="Local da formação"
                    value={novaAcaoForm.local_formacao}
                    onChange={(e) => handleNovaAcaoInputChange('local_formacao', e.target.value)}
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={novaAcaoForm.data_inicio}
                    onChange={(e) => handleNovaAcaoInputChange('data_inicio', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={novaAcaoForm.data_fim}
                    onChange={(e) => handleNovaAcaoInputChange('data_fim', e.target.value)}
                  />
                </div>
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="carga_horaria">Carga Horária (h)</Label>
                  <Input
                    id="carga_horaria"
                    type="number"
                    min="0"
                    value={novaAcaoForm.carga_horaria_real}
                    onChange={(e) => handleNovaAcaoInputChange('carga_horaria_real', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="vagas_maximas">Vagas Máximas</Label>
                  <Input
                    id="vagas_maximas"
                    type="number"
                    min="1"
                    value={novaAcaoForm.vagas_maximas}
                    onChange={(e) => handleNovaAcaoInputChange('vagas_maximas', parseInt(e.target.value) || 20)}
                  />
                </div>
                <div>
                  <Label htmlFor="preco">Preço (€)</Label>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={novaAcaoForm.preco}
                    onChange={(e) => handleNovaAcaoInputChange('preco', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={novaAcaoForm.status} onValueChange={(value) => handleNovaAcaoInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planeada">Planeada</SelectItem>
                    <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                    <SelectItem value="em_curso">Em Curso</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais"
                  value={novaAcaoForm.observacoes}
                  onChange={(e) => handleNovaAcaoInputChange('observacoes', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setNovaAcaoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNovaAcaoSubmit} disabled={submittingNovaAcao}>
                {submittingNovaAcao ? 'Criando...' : 'Criar Ação'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Novo Tipo de Formação */}
        <Dialog open={novoTipoDialogOpen} onOpenChange={setNovoTipoDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Tipo de Formação</DialogTitle>
              <DialogDescription>
                Criar um novo template de formação (ex: FORMA_N4, FORMA_ADMIN, etc.)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      placeholder="Ex: FORMA_N4"
                      value={novoTipoForm.codigo}
                      onChange={(e) => handleNovoTipoInputChange('codigo', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Formação Nível 4"
                      value={novoTipoForm.nome}
                      onChange={(e) => handleNovoTipoInputChange('nome', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descrição detalhada do tipo de formação"
                    value={novoTipoForm.descricao}
                    onChange={(e) => handleNovoTipoInputChange('descricao', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nivel_ordem">Nível/Ordem</Label>
                    <Input
                      id="nivel_ordem"
                      type="number"
                      min="1"
                      value={novoTipoForm.nivel_ordem}
                      onChange={(e) => handleNovoTipoInputChange('nivel_ordem', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carga_horaria">Carga Horária Mínima (h)</Label>
                    <Input
                      id="carga_horaria"
                      type="number"
                      min="0"
                      value={novoTipoForm.carga_horaria_minima}
                      onChange={(e) => handleNovoTipoInputChange('carga_horaria_minima', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="icone">Ícone</Label>
                    <Input
                      id="icone"
                      placeholder="Ex: 🎓"
                      value={novoTipoForm.icone}
                      onChange={(e) => handleNovoTipoInputChange('icone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="cor"
                      type="color"
                      value={novoTipoForm.cor}
                      onChange={(e) => handleNovoTipoInputChange('cor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={novoTipoForm.cor}
                      onChange={(e) => handleNovoTipoInputChange('cor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Competências */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Competências</h3>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nova competência"
                    value={novaCompetencia}
                    onChange={(e) => setNovaCompetencia(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarCompetencia()}
                  />
                  <Button type="button" onClick={adicionarCompetencia}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {novoTipoForm.competencias.length > 0 && (
                  <div className="space-y-2">
                    {novoTipoForm.competencias.map((competencia, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{competencia}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerCompetencia(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pré-requisitos */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pré-requisitos</h3>
                <p className="text-sm text-gray-600">Selecione os tipos de formação necessários antes deste:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tiposFormacao
                    .filter(tipo => tipo.nivel_ordem < novoTipoForm.nivel_ordem)
                    .map(tipo => (
                    <label key={tipo.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novoTipoForm.pre_requisitos.includes(tipo.id)}
                        onChange={() => togglePreRequisito(tipo.id)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {getTipoFormacaoIcon(tipo.codigo)} {tipo.nome}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preview</h3>
                <Card className="border-l-4" style={{ borderLeftColor: novoTipoForm.cor }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{novoTipoForm.icone}</div>
                        <div>
                          <h3 className="font-semibold">{novoTipoForm.nome || 'Nome do Tipo'}</h3>
                          <p className="text-sm text-gray-500">{novoTipoForm.codigo || 'CODIGO'}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Nível {novoTipoForm.nivel_ordem}</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {novoTipoForm.descricao || 'Descrição do tipo de formação'}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{novoTipoForm.carga_horaria_minima}h mínimas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span>{novoTipoForm.competencias.length} competências</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setNovoTipoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNovoTipoSubmit} disabled={submittingNovoTipo}>
                {submittingNovoTipo ? 'Criando...' : 'Criar Tipo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SistemaFormacao;
