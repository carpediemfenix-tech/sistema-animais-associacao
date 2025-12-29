import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Target,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit,
  Archive,
  Clock,
  User,
  Shield,
  Settings,
  Wrench,
  Euro,
  CheckCircle,
  PlayCircle,
  XCircle,
  Eye,
  Trash2,
  PawPrint,
  FileText,
  BarChart3,
  AlertCircle,
  TrendingUp,
  Activity,
  Bell,
  Share2,
  Download,
  RefreshCw,
  Zap,
  Heart,
  Star,
  Plus,
  Minus,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface Missao {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local_principal: string;
  prioridade: string;
  orcamento_previsto: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EstatisticasMissao {
  participantes: number;
  animais: number;
  gastos: number;
  progresso: number;
  diasRestantes: number;
}

const MissaoDetailOtimizada = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principais
  const [missao, setMissao] = useState<Missao | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasMissao>({
    participantes: 0,
    animais: 0,
    gastos: 0,
    progresso: 0,
    diasRestantes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para dados das abas
  const [participacoes, setParticipacoes] = useState<any[]>([]);
  const [animais, setAnimais] = useState<any[]>([]);
  const [movimentosFinanceiros, setMovimentosFinanceiros] = useState<any[]>([]);
  const [loadingTabs, setLoadingTabs] = useState({
    participacoes: false,
    animais: false,
    financeiro: false
  });

  // Carregar dados
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // Carregar dados das abas quando a missão é carregada
  useEffect(() => {
    if (missao && id) {
      loadParticipacoes();
      loadAnimais();
      loadMovimentosFinanceiros();
    }
  }, [missao, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadMissao(),
        loadEstatisticas()
      ]);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMissao = async () => {
    console.log('🎯 Carregando missão:', id);
    
    const { data, error } = await supabase
      .from('missoes_2025_12_29_07_00')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    console.log('✅ Missão carregada:', data);
    setMissao(data);
  };

  const loadEstatisticas = async () => {
    try {
      // Carregar participantes
      const { data: participantes } = await supabase
        .from('participacoes_missoes_2025_12_29_07_00')
        .select('id')
        .eq('missao_id', id);

      // Carregar animais
      const { data: animais } = await supabase
        .from('missoes_animais_2025_12_29_07_00')
        .select('id')
        .eq('missao_id', id);

      // Calcular dias restantes
      const hoje = new Date();
      const dataFim = missao?.data_fim ? new Date(missao.data_fim) : hoje;
      const diasRestantes = Math.max(0, Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));

      // Calcular progresso baseado no status
      let progresso = 0;
      if (missao?.status === 'rascunho') progresso = 10;
      else if (missao?.status === 'planejada') progresso = 25;
      else if (missao?.status === 'ativa') progresso = 60;
      else if (missao?.status === 'concluida') progresso = 100;

      setEstatisticas({
        participantes: participantes?.length || 0,
        animais: animais?.length || 0,
        gastos: 0, // Será implementado quando tivermos dados financeiros
        progresso,
        diasRestantes
      });
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  // Obter badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'rascunho': { color: 'bg-gray-100 text-gray-800', icon: Edit, label: 'Rascunho' },
      'planejada': { color: 'bg-blue-100 text-blue-800', icon: Calendar, label: 'Planejada' },
      'ativa': { color: 'bg-green-100 text-green-800', icon: PlayCircle, label: 'Ativa' },
      'pausada': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pausada' },
      'concluida': { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Concluída' },
      'cancelada': { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelada' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.rascunho;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  // Obter badge de prioridade
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

  // Funções de ação
  const handleEditMissao = () => {
    navigate(`/missao/${id}/editar`);
  };

  const handleArchiveMissao = async () => {
    if (!window.confirm('Tem certeza que deseja arquivar esta missão?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .update({ 
          arquivada: true,
          data_arquivamento: new Date().toISOString(),
          arquivada_por: 'admin',
          updated_at: new Date().toISOString(),
          updated_by: 'admin'
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Missão arquivada",
        description: "A missão foi arquivada com sucesso",
      });

      // Recarregar dados
      loadData();
    } catch (error: any) {
      console.error('❌ Erro ao arquivar missão:', error);
      toast({
        title: "Erro ao arquivar",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleConfigureMissao = () => {
    toast({
      title: "Configurações",
      description: "Painel de configurações será implementado em breve",
    });
  };

  // Funções para carregar dados das abas
  const loadParticipacoes = async () => {
    try {
      setLoadingTabs(prev => ({ ...prev, participacoes: true }));
      
      const { data, error } = await supabase
        .from('participacoes_missoes_2025_12_29_07_00')
        .select(`
          *,
          voluntario:voluntarios(
            id,
            nome,
            email,
            telefone
          )
        `)
        .eq('missao_id', id)
        .order('data_participacao', { ascending: false });

      if (error) throw error;
      setParticipacoes(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar participações:', error);
    } finally {
      setLoadingTabs(prev => ({ ...prev, participacoes: false }));
    }
  };

  const loadAnimais = async () => {
    try {
      setLoadingTabs(prev => ({ ...prev, animais: true }));
      
      const { data, error } = await supabase
        .from('missoes_animais_2025_12_29_07_00')
        .select(`
          *,
          animal:animais(
            id,
            nome,
            especie,
            numero_processo,
            url_fotografia
          )
        `)
        .eq('missao_id', id)
        .order('data_vinculacao', { ascending: false });

      if (error) throw error;
      setAnimais(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar animais:', error);
    } finally {
      setLoadingTabs(prev => ({ ...prev, animais: false }));
    }
  };

  const loadMovimentosFinanceiros = async () => {
    try {
      setLoadingTabs(prev => ({ ...prev, financeiro: true }));
      
      // Verificar se existe tabela de movimentos financeiros
      const { data, error } = await supabase
        .from('movimentos_financeiros_2025_12_29_07_00')
        .select('*')
        .eq('missao_id', id)
        .order('data_movimento', { ascending: false });

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
      
      setMovimentosFinanceiros(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar movimentos financeiros:', error);
      setMovimentosFinanceiros([]);
    } finally {
      setLoadingTabs(prev => ({ ...prev, financeiro: false }));
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Target className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando detalhes da missão...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (error || !missao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar missão</h1>
            <p className="text-gray-600 mb-4">{error || 'Missão não encontrada'}</p>
            <Button onClick={() => navigate('/modulo-missoes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Missões
            </Button>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/modulo-missoes')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar às Missões</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {missao.codigo} - {missao.titulo}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                {getStatusBadge(missao.status)}
                {getPrioridadeBadge(missao.prioridade)}
                <div className="flex items-center space-x-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(missao.data_inicio).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => toast({title: "Partilhar", description: "Funcionalidade em desenvolvimento"})}>
              <Share2 className="h-4 w-4 mr-2" />
              Partilhar
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast({title: "Exportar", description: "Funcionalidade em desenvolvimento"})}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button size="sm" onClick={handleEditMissao}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progresso</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.progresso}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={estatisticas.progresso} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participantes</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.participantes}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Animais</p>
                  <p className="text-2xl font-bold text-purple-600">{estatisticas.animais}</p>
                </div>
                <PawPrint className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orçamento</p>
                  <p className="text-2xl font-bold text-orange-600">€{missao.orcamento_previsto?.toFixed(0) || 0}</p>
                </div>
                <Euro className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dias Restantes</p>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.diasRestantes}</p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Informações Básicas */}
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Informações da Missão</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                <p className="text-gray-600">
                  {missao.descricao || 'Nenhuma descrição fornecida.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data de Início</h4>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(missao.data_inicio).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data de Fim</h4>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {missao.data_fim 
                        ? new Date(missao.data_fim).toLocaleDateString('pt-PT')
                        : 'Não definida'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Local Principal</h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{missao.local_principal || 'Não definido'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(`/missao/${id}/participacoes`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Gerir Participações
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(`/missao/${id}/animais`)}
              >
                <PawPrint className="h-4 w-4 mr-2" />
                Gerir Animais
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(`/missao/${id}/financeiro`)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Controle Financeiro
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate(`/missao/${id}/equipamentos`)}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Gerir Equipamentos
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleConfigureMissao}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleArchiveMissao}
              >
                <Archive className="h-4 w-4 mr-2" />
                Arquivar Missão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Gestão */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Gestão da Missão</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resumo" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="participacoes">Participações</TabsTrigger>
                <TabsTrigger value="animais">Animais</TabsTrigger>
                <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resumo" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Atividade Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Missão criada</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(missao.created_at).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        {missao.updated_at !== missao.created_at && (
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Última atualização</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(missao.updated_at).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Próximas Ações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {estatisticas.participantes === 0 && (
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Adicionar participantes</span>
                          </div>
                        )}
                        {estatisticas.animais === 0 && (
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Vincular animais</span>
                          </div>
                        )}
                        {missao.status === 'rascunho' && (
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Finalizar planeamento</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="participacoes" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Participações da Missão</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadParticipacoes}
                        disabled={loadingTabs.participacoes}
                      >
                        {loadingTabs.participacoes ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Atualizar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/missao/${id}/participacoes`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Participação
                      </Button>
                    </div>
                  </div>

                  {loadingTabs.participacoes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-2">Carregando participações...</span>
                    </div>
                  ) : participacoes.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma participação encontrada
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Adicione voluntários para começar a gerir esta missão.
                      </p>
                      <Button onClick={() => navigate(`/missao/${id}/participacoes`)}>
                        <Users className="h-4 w-4 mr-2" />
                        Adicionar Primeira Participação
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {participacoes.map((participacao) => (
                        <Card key={participacao.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {participacao.voluntario?.nome || 'Voluntário não encontrado'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {participacao.funcao} • {participacao.horas_dedicadas || 0}h dedicadas
                                </p>
                                <p className="text-xs text-gray-500">
                                  Desde {new Date(participacao.data_participacao).toLocaleDateString('pt-PT')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={participacao.status_participacao === 'ativa' ? 'default' : 'secondary'}>
                                {participacao.status_participacao}
                              </Badge>
                              <span className="text-sm font-medium text-green-600">
                                {participacao.pontos_atribuidos || 0} pts
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      <div className="text-center pt-4">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/missao/${id}/participacoes`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Gestão Completa
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="animais" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Animais da Missão</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadAnimais}
                        disabled={loadingTabs.animais}
                      >
                        {loadingTabs.animais ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Atualizar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/missao/${id}/animais`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Vincular Animal
                      </Button>
                    </div>
                  </div>

                  {loadingTabs.animais ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-2">Carregando animais...</span>
                    </div>
                  ) : animais.length === 0 ? (
                    <div className="text-center py-8">
                      <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum animal vinculado
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Vincule animais para começar a gerir esta missão.
                      </p>
                      <Button onClick={() => navigate(`/missao/${id}/animais`)}>
                        <PawPrint className="h-4 w-4 mr-2" />
                        Vincular Primeiro Animal
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {animais.map((animalMissao) => (
                        <Card key={animalMissao.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                                {animalMissao.animal?.url_fotografia ? (
                                  <img 
                                    src={animalMissao.animal.url_fotografia} 
                                    alt={animalMissao.animal.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <PawPrint className="h-6 w-6 text-green-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {animalMissao.animal?.nome || 'Animal não encontrado'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {animalMissao.animal?.especie} • {animalMissao.funcao_animal}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Processo: {animalMissao.animal?.numero_processo || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Vinculado em {new Date(animalMissao.data_vinculacao).toLocaleDateString('pt-PT')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={animalMissao.status_participacao === 'ativa' ? 'default' : 'secondary'}>
                                {animalMissao.status_participacao}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      <div className="text-center pt-4">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/missao/${id}/animais`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Gestão Completa
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="financeiro" className="mt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Controle Financeiro</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadMovimentosFinanceiros}
                        disabled={loadingTabs.financeiro}
                      >
                        {loadingTabs.financeiro ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Atualizar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/missao/${id}/financeiro`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Movimento
                      </Button>
                    </div>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Orçamento Previsto</p>
                          <p className="text-2xl font-bold text-blue-600">
                            €{missao?.orcamento_previsto?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Gasto Atual</p>
                          <p className="text-2xl font-bold text-red-600">
                            €{missao?.orcamento_gasto?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Saldo Restante</p>
                          <p className={`text-2xl font-bold ${
                            (missao?.orcamento_previsto || 0) - (missao?.orcamento_gasto || 0) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            €{((missao?.orcamento_previsto || 0) - (missao?.orcamento_gasto || 0)).toFixed(2)}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          (missao?.orcamento_previsto || 0) - (missao?.orcamento_gasto || 0) >= 0 
                            ? 'bg-green-100' 
                            : 'bg-red-100'
                        }`}>
                          <Euro className={`h-5 w-5 ${
                            (missao?.orcamento_previsto || 0) - (missao?.orcamento_gasto || 0) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`} />
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Progresso do Orçamento */}
                  {missao?.orcamento_previsto && missao.orcamento_previsto > 0 && (
                    <Card className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso do Orçamento</span>
                          <span>{((missao.orcamento_gasto / missao.orcamento_previsto) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={(missao.orcamento_gasto / missao.orcamento_previsto) * 100} 
                          className="h-2"
                        />
                      </div>
                    </Card>
                  )}

                  {/* Movimentos Financeiros */}
                  {loadingTabs.financeiro ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-2">Carregando movimentos...</span>
                    </div>
                  ) : movimentosFinanceiros.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum movimento financeiro
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Registre receitas e despesas para controlar o orçamento.
                      </p>
                      <Button onClick={() => navigate(`/missao/${id}/financeiro`)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Registar Primeiro Movimento
                      </Button>
                    </div>
                  ) : (
                    <Card className="p-4">
                      <h4 className="font-medium mb-4">Movimentos Recentes</h4>
                      <div className="space-y-3">
                        {movimentosFinanceiros.slice(0, 5).map((movimento) => (
                          <div key={movimento.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                movimento.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {movimento.tipo === 'receita' ? (
                                  <Plus className={`h-4 w-4 text-green-600`} />
                                ) : (
                                  <Minus className={`h-4 w-4 text-red-600`} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{movimento.descricao}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(movimento.data_movimento).toLocaleDateString('pt-PT')}
                                </p>
                              </div>
                            </div>
                            <span className={`font-medium ${
                              movimento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movimento.tipo === 'receita' ? '+' : '-'}€{movimento.valor.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center pt-4">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/missao/${id}/financeiro`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Controle Completo
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="relatorios" className="mt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Relatórios e Análises</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          loadParticipacoes();
                          loadAnimais();
                          loadMovimentosFinanceiros();
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar Dados
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Exportar Relatório",
                            description: "Funcionalidade de exportação será implementada em breve",
                          });
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </Button>
                    </div>
                  </div>

                  {/* Estatísticas Gerais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Duração</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {missao?.data_inicio && missao?.data_fim 
                              ? Math.ceil((new Date(missao.data_fim).getTime() - new Date(missao.data_inicio).getTime()) / (1000 * 60 * 60 * 24))
                              : 'N/A'
                            } dias
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Participantes</p>
                          <p className="text-2xl font-bold text-green-600">
                            {participacoes.length}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Animais</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {animais.length}
                          </p>
                        </div>
                        <PawPrint className="h-8 w-8 text-purple-600" />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Eficiência</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {missao?.orcamento_previsto && missao.orcamento_previsto > 0
                              ? `${(100 - (missao.orcamento_gasto / missao.orcamento_previsto) * 100).toFixed(0)}%`
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                      </div>
                    </Card>
                  </div>

                  {/* Análise de Participações */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-4">Distribuição por Função</h4>
                      <div className="space-y-3">
                        {participacoes.reduce((acc: any[], participacao) => {
                          const funcao = participacao.funcao || 'Não definida';
                          const existing = acc.find(item => item.funcao === funcao);
                          if (existing) {
                            existing.count++;
                            existing.horas += participacao.horas_dedicadas || 0;
                          } else {
                            acc.push({
                              funcao,
                              count: 1,
                              horas: participacao.horas_dedicadas || 0
                            });
                          }
                          return acc;
                        }, []).map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm">{item.funcao}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">{item.count} pessoas</span>
                              <p className="text-xs text-gray-500">{item.horas}h dedicadas</p>
                            </div>
                          </div>
                        ))}
                        {participacoes.length === 0 && (
                          <p className="text-gray-500 text-center py-4">Nenhuma participação registada</p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-4">Animais por Espécie</h4>
                      <div className="space-y-3">
                        {animais.reduce((acc: any[], animalMissao) => {
                          const especie = animalMissao.animal?.especie || 'Não definida';
                          const existing = acc.find(item => item.especie === especie);
                          if (existing) {
                            existing.count++;
                          } else {
                            acc.push({
                              especie,
                              count: 1
                            });
                          }
                          return acc;
                        }, []).map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm">{item.especie}</span>
                            </div>
                            <span className="text-sm font-medium">{item.count} animais</span>
                          </div>
                        ))}
                        {animais.length === 0 && (
                          <p className="text-gray-500 text-center py-4">Nenhum animal vinculado</p>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Resumo da Missão */}
                  <Card className="p-6">
                    <h4 className="font-medium mb-4">Resumo Executivo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Informações Gerais</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span>{getStatusBadge(missao?.status || 'rascunho')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Prioridade:</span>
                            <span>{getPrioridadeBadge(missao?.prioridade || 'media')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Local:</span>
                            <span>{missao?.local_principal || 'Não definido'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Responsável:</span>
                            <span>{missao?.responsavel_id || 'Não atribuído'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Métricas de Performance</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total de Horas:</span>
                            <span className="font-medium">
                              {participacoes.reduce((total, p) => total + (p.horas_dedicadas || 0), 0)}h
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pontos Atribuídos:</span>
                            <span className="font-medium">
                              {participacoes.reduce((total, p) => total + (p.pontos_atribuidos || 0), 0)} pts
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Custo por Animal:</span>
                            <span className="font-medium">
                              {animais.length > 0 && missao?.orcamento_gasto 
                                ? `€${(missao.orcamento_gasto / animais.length).toFixed(2)}`
                                : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Progresso:</span>
                            <span className="font-medium">{estatisticas.progresso}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default MissaoDetailOtimizada;