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
  Star
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

  // Carregar dados
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

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
    // TODO: Implementar edição inline ou modal
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de missões será implementada em breve",
    });
  };

  const handleArchiveMissao = async () => {
    if (!window.confirm('Tem certeza que deseja arquivar esta missão?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('missoes_2025_12_29_07_00')
        .update({ 
          status: 'cancelada',
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
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gestão de Participações
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Gerir voluntários e suas funções nesta missão.
                  </p>
                  <Button onClick={() => navigate(`/missao/${id}/participacoes`)}>
                    <Users className="h-4 w-4 mr-2" />
                    Abrir Gestão de Participações
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="animais" className="mt-6">
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gestão de Animais
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vincular e gerir animais envolvidos nesta missão.
                  </p>
                  <Button onClick={() => navigate(`/missao/${id}/animais`)}>
                    <PawPrint className="h-4 w-4 mr-2" />
                    Abrir Gestão de Animais
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="financeiro" className="mt-6">
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Controle Financeiro
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Gerir orçamento, receitas e despesas da missão.
                  </p>
                  <Button onClick={() => navigate(`/missao/${id}/financeiro`)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Abrir Controle Financeiro
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="relatorios" className="mt-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Relatórios e Análises
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Visualizar estatísticas e gerar relatórios da missão.
                  </p>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Em Desenvolvimento
                  </Button>
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