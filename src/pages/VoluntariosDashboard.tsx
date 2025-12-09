import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Award, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  GraduationCap,
  Target,
  Activity,
  Star,
  UserPlus,
  FileText,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Plus,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Zap,
  Heart,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";

interface DashboardVoluntariosStats {
  // Estatísticas Gerais
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosInativos: number;
  novasInscricoes: number;
  
  // Estatísticas de Formação
  voluntariosComFormacao: number;
  voluntariosSemFormacao: number;
  formacoesEmAndamento: number;
  formacoesCompletadas: number;
  
  // Estatísticas de Atividade
  voluntariosComResponsabilidades: number;
  responsabilidadesAtivas: number;
  mediaIdadeVoluntarios: number;
  
  // Distribuição
  distribuicaoPorEspecialidade: { [key: string]: number };
  distribuicaoPorFormacao: { [key: string]: number };
  distribuicaoPorIdade: { [key: string]: number };
}

interface AtividadeRecente {
  id: string;
  tipo: 'inscricao' | 'formacao' | 'responsabilidade' | 'avaliacao';
  voluntario: string;
  descricao: string;
  data: string;
  status: 'sucesso' | 'pendente' | 'alerta';
}

interface AlertaVoluntario {
  id: string;
  tipo: 'formacao_pendente' | 'inatividade' | 'responsabilidade_vencida' | 'documentos_pendentes';
  titulo: string;
  descricao: string;
  voluntario: string;
  prioridade: 'alta' | 'media' | 'baixa';
  data: string;
}

const VoluntariosDashboard = () => {
  const [stats, setStats] = useState<DashboardVoluntariosStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [atividadesRecentes, setAtividadesRecentes] = useState<AtividadeRecente[]>([]);
  const [alertas, setAlertas] = useState<AlertaVoluntario[]>([]);
  const [alertaSelecionado, setAlertaSelecionado] = useState<AlertaVoluntario | null>(null);
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
              Apenas administradores podem aceder ao módulo de voluntários
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

      // Carregar voluntários
      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*');

      if (voluntariosError) {
        console.error('Erro ao carregar voluntários:', voluntariosError);
      }

      // Carregar participações em formações
      const { data: participacoes, error: participacoesError } = await supabase
        .from('participacoes_formacao')
        .select(`
          *,
          voluntario:voluntarios(nome),
          acao_formacao:acoes_formacao(
            nome_acao,
            tipo_formacao:tipos_formacao(nome)
          )
        `);

      if (participacoesError) {
        console.error('Erro ao carregar participações:', participacoesError);
      }

      // Carregar responsabilidades
      const { data: responsabilidades, error: responsabilidadesError } = await supabase
        .from('responsabilidades_voluntarios')
        .select(`
          *,
          voluntario:voluntarios(nome),
          animal:animais(nome)
        `);

      if (responsabilidadesError) {
        console.error('Erro ao carregar responsabilidades:', responsabilidadesError);
      }

      // Processar dados
      const voluntariosData = voluntarios || [];
      const participacoesData = participacoes || [];
      const responsabilidadesData = responsabilidades || [];

      // Calcular estatísticas
      const voluntariosAtivos = voluntariosData.filter(v => v.ativo).length;
      const voluntariosInativos = voluntariosData.length - voluntariosAtivos;
      
      const voluntariosComFormacao = new Set(
        participacoesData
          .filter(p => p.resultado === 'aprovado')
          .map(p => p.voluntario_id)
      ).size;

      const formacoesCompletadas = participacoesData.filter(p => p.status === 'concluido').length;
      const formacoesEmAndamento = participacoesData.filter(p => p.status === 'inscrito' || p.status === 'em_avaliacao').length;

      const responsabilidadesAtivas = responsabilidadesData.filter(r => r.ativo).length;
      const voluntariosComResponsabilidades = new Set(
        responsabilidadesData.filter(r => r.ativo).map(r => r.voluntario_id)
      ).size;

      // Distribuições
      const distribuicaoPorEspecialidade: { [key: string]: number } = {};
      voluntariosData.forEach(v => {
        const esp = v.especialidade || 'Geral';
        distribuicaoPorEspecialidade[esp] = (distribuicaoPorEspecialidade[esp] || 0) + 1;
      });

      const distribuicaoPorFormacao: { [key: string]: number } = {};
      participacoesData
        .filter(p => p.resultado === 'aprovado')
        .forEach(p => {
          const formacao = p.acao_formacao?.tipo_formacao?.nome || 'Sem Formação';
          distribuicaoPorFormacao[formacao] = (distribuicaoPorFormacao[formacao] || 0) + 1;
        });

      // Calcular média de idade (simulada)
      const mediaIdadeVoluntarios = 35; // Placeholder

      const dashboardStats: DashboardVoluntariosStats = {
        totalVoluntarios: voluntariosData.length,
        voluntariosAtivos,
        voluntariosInativos,
        novasInscricoes: voluntariosData.filter(v => {
          const created = new Date(v.created_at);
          const umMesAtras = new Date();
          umMesAtras.setMonth(umMesAtras.getMonth() - 1);
          return created > umMesAtras;
        }).length,
        voluntariosComFormacao,
        voluntariosSemFormacao: voluntariosAtivos - voluntariosComFormacao,
        formacoesEmAndamento,
        formacoesCompletadas,
        voluntariosComResponsabilidades,
        responsabilidadesAtivas,
        mediaIdadeVoluntarios,
        distribuicaoPorEspecialidade,
        distribuicaoPorFormacao,
        distribuicaoPorIdade: { 'Sem dados': voluntariosAtivos } // Simplificado - dados de idade não disponíveis
      };

      setStats(dashboardStats);

      // Carregar atividades recentes REAIS
      const atividades: AtividadeRecente[] = [];
      
      // Adicionar inscrições recentes (novos voluntários)
      const voluntariosRecentes = voluntariosData
        .filter(v => {
          const created = new Date(v.created_at);
          const seteDiasAtras = new Date();
          seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
          return created > seteDiasAtras;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      
      voluntariosRecentes.forEach(v => {
        atividades.push({
          id: `inscricao_${v.id}`,
          tipo: 'inscricao',
          voluntario: v.nome,
          descricao: 'Nova inscrição como voluntário',
          data: v.created_at,
          status: 'sucesso'
        });
      });
      
      // Adicionar formações concluídas recentemente
      const formacoesRecentes = participacoesData
        .filter(p => p.status === 'concluido' && p.data_avaliacao)
        .sort((a, b) => new Date(b.data_avaliacao).getTime() - new Date(a.data_avaliacao).getTime())
        .slice(0, 5);
      
      formacoesRecentes.forEach(p => {
        atividades.push({
          id: `formacao_${p.id}`,
          tipo: 'formacao',
          voluntario: p.voluntario?.nome || 'Voluntário',
          descricao: `Completou ${p.acao_formacao?.nome_acao || 'formação'} - ${p.resultado}`,
          data: p.data_avaliacao,
          status: p.resultado === 'aprovado' ? 'sucesso' : 'alerta'
        });
      });
      
      // Adicionar responsabilidades recentes
      const responsabilidadesRecentes = responsabilidadesData
        .filter(r => r.ativo && r.created_at)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
      
      responsabilidadesRecentes.forEach(r => {
        atividades.push({
          id: `resp_${r.id}`,
          tipo: 'responsabilidade',
          voluntario: r.voluntario?.nome || 'Voluntário',
          descricao: `Assumiu responsabilidade por ${r.animal?.nome || 'animal'}`,
          data: r.created_at,
          status: 'sucesso'
        });
      });
      
      // Ordenar todas as atividades por data (mais recente primeiro)
      atividades.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      
      // Limitar a 10 atividades mais recentes
      const atividadesLimitadas = atividades.slice(0, 10);

      setAtividadesRecentes(atividadesLimitadas);

      // Gerar alertas REAIS baseados nos dados
      const alertasData: AlertaVoluntario[] = [];
      
      // Alerta: Voluntários sem formação
      const voluntariosSemFormacao = voluntariosData.filter(v => 
        v.ativo && !participacoesData.some(p => p.voluntario_id === v.id && p.resultado === 'aprovado')
      );
      
      if (voluntariosSemFormacao.length > 0) {
        alertasData.push({
          id: 'sem_formacao',
          tipo: 'formacao_pendente',
          titulo: 'Voluntários Sem Formação',
          descricao: `${voluntariosSemFormacao.length} voluntários ativos ainda não têm formação aprovada`,
          voluntario: voluntariosSemFormacao.map(v => v.nome).join(', '),
          prioridade: 'alta',
          data: new Date().toISOString()
        });
      }
      
      // Alerta: Formações em avaliação há muito tempo
      const formacoesPendentes = participacoesData.filter(p => {
        if (p.status !== 'em_avaliacao') return false;
        const dataInscricao = new Date(p.created_at);
        const quinzeDiasAtras = new Date();
        quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
        return dataInscricao < quinzeDiasAtras;
      });
      
      if (formacoesPendentes.length > 0) {
        alertasData.push({
          id: 'avaliacao_pendente',
          tipo: 'formacao_pendente',
          titulo: 'Avaliações Pendentes',
          descricao: `${formacoesPendentes.length} formações aguardam avaliação há mais de 15 dias`,
          voluntario: 'Vários',
          prioridade: 'media',
          data: new Date().toISOString()
        });
      }
      
      // Alerta: Voluntários inativos
      if (voluntariosInativos > 0) {
        alertasData.push({
          id: 'voluntarios_inativos',
          tipo: 'inatividade',
          titulo: 'Voluntários Inativos',
          descricao: `${voluntariosInativos} voluntários marcados como inativos`,
          voluntario: 'Vários',
          prioridade: 'baixa',
          data: new Date().toISOString()
        });
      }

      setAlertas(alertasData);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Erro ao Carregar</CardTitle>
              <CardDescription>
                Não foi possível carregar os dados do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadDashboardData}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
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
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                Sistema de Voluntários Valentão
              </h1>
              <p className="text-gray-600 mt-1">
                Gestão completa de voluntários e formações
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link to="/voluntarios/novo">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Voluntário
              </Button>
            </Link>
            <Link to="/sistema-formacao">
              <Button variant="outline">
                <GraduationCap className="h-4 w-4 mr-2" />
                Sistema Formação
              </Button>
            </Link>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Voluntários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVoluntarios}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.novasInscricoes}</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voluntários Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.voluntariosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.voluntariosAtivos / stats.totalVoluntarios) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Formação</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.voluntariosComFormacao}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.voluntariosComFormacao / stats.voluntariosAtivos) * 100)}% dos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Responsabilidades</CardTitle>
              <Shield className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.voluntariosComResponsabilidades}</div>
              <p className="text-xs text-muted-foreground">
                {stats.responsabilidadesAtivas} responsabilidades ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Conteúdo Detalhado */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="formacao">Formação</TabsTrigger>
            <TabsTrigger value="atividade">Atividade</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição por Especialidade */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Distribuição por Especialidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.distribuicaoPorEspecialidade).map(([especialidade, count]) => (
                      <div key={especialidade} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{especialidade}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalVoluntarios) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/voluntarios/gestao">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Gerir Voluntários
                      </Button>
                    </Link>
                    <Link to="/voluntarios/novo">
                      <Button variant="outline" className="w-full justify-start">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Novo Voluntário
                      </Button>
                    </Link>
                    <Link to="/sistema-formacao">
                      <Button variant="outline" className="w-full justify-start">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Sistema Formação
                      </Button>
                    </Link>
                    <Link to="/voluntarios/relatorios">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Relatórios
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Formação */}
          <TabsContent value="formacao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formações Completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.formacoesCompletadas}
                  </div>
                  <p className="text-sm text-gray-600">Total de formações concluídas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.formacoesEmAndamento}
                  </div>
                  <p className="text-sm text-gray-600">Formações em curso</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round((stats.formacoesCompletadas / (stats.formacoesCompletadas + stats.formacoesEmAndamento)) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600">Formações bem-sucedidas</p>
                </CardContent>
              </Card>
            </div>

            {/* Distribuição por Formação */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo de Formação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.distribuicaoPorFormacao).map(([formacao, count]) => (
                    <div key={formacao} className="flex items-center justify-between">
                      <span className="font-medium">{formacao}</span>
                      <div className="flex items-center space-x-3">
                        <Progress 
                          value={(count / stats.voluntariosComFormacao) * 100} 
                          className="w-32"
                        />
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Atividade */}
          <TabsContent value="atividade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {atividadesRecentes.map((atividade) => (
                    <div key={atividade.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        atividade.status === 'sucesso' ? 'bg-green-100' :
                        atividade.status === 'pendente' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        {atividade.tipo === 'inscricao' && <UserPlus className="h-4 w-4 text-green-600" />}
                        {atividade.tipo === 'formacao' && <GraduationCap className="h-4 w-4 text-blue-600" />}
                        {atividade.tipo === 'responsabilidade' && <Shield className="h-4 w-4 text-orange-600" />}
                        {atividade.tipo === 'avaliacao' && <Star className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{atividade.voluntario}</p>
                        <p className="text-sm text-gray-600">{atividade.descricao}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(atividade.data).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Alertas */}
          <TabsContent value="alertas" className="space-y-6">
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <Card key={alerta.id} className={`border-l-4 ${
                  alerta.prioridade === 'alta' ? 'border-l-red-500' :
                  alerta.prioridade === 'media' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{alerta.titulo}</CardTitle>
                      <Badge variant={
                        alerta.prioridade === 'alta' ? 'destructive' :
                        alerta.prioridade === 'media' ? 'default' : 'secondary'
                      }>
                        {alerta.prioridade.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-2">{alerta.descricao}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(alerta.data).toLocaleDateString('pt-PT')}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{alerta.titulo}</DialogTitle>
                            <DialogDescription>
                              Detalhes do alerta de {alerta.tipo.replace('_', ' ')}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Descrição:</h4>
                              <p className="text-sm text-gray-600">{alerta.descricao}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Voluntários Afetados:</h4>
                              <p className="text-sm text-gray-600">{alerta.voluntario}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Prioridade:</h4>
                              <Badge variant={alerta.prioridade === 'alta' ? 'destructive' : alerta.prioridade === 'media' ? 'default' : 'secondary'}>
                                {alerta.prioridade.charAt(0).toUpperCase() + alerta.prioridade.slice(1)}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Data:</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(alerta.data).toLocaleDateString('pt-PT', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VoluntariosDashboard;