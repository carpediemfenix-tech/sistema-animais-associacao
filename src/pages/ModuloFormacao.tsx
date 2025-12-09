import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap,
  ArrowLeft,
  Settings,
  Eye,
  Plus
} from "lucide-react";



interface ModuloFormacaoStats {
  // Tipos de Formação
  totalTiposFormacao: number;
  tiposAtivos: number;
  tiposInativos: number;
  
  // Ações de Formação
  totalAcoesFormacao: number;
  acoesAtivas: number;
  acoesCompletadas: number;
  acoesCanceladas: number;
  
  // Participações
  totalParticipacoes: number;
  participacoesAtivas: number;
  participacoesCompletadas: number;
  participacoesAprovadas: number;
  participacoesReprovadas: number;
  
  // Métricas de Qualidade
  taxaSucessoGeral: number;
  mediaNotasGeral: number;
  participantesPorAcao: number;
  
  // Distribuições
  distribuicaoPorTipo: { [key: string]: number };
  distribuicaoPorStatus: { [key: string]: number };
  distribuicaoPorMes: { [key: string]: number };
}

interface FuncionalidadeFormacao {
  id: string;
  titulo: string;
  descricao: string;
  icone: any;
  cor: string;
  link: string;
  stats?: {
    principal: number;
    secundaria: string;
  };
  ativo: boolean;
}

const ModuloFormacao = () => {
  const [stats, setStats] = useState<ModuloFormacaoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [funcionalidades, setFuncionalidades] = useState<FuncionalidadeFormacao[]>([]);
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
              Apenas administradores podem aceder ao módulo de formação
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
    loadModuloData();
  }, []);

  const loadModuloData = async () => {
    try {
      setLoading(true);

      // Carregar tipos de formação
      const { data: tiposFormacao } = await supabase
        .from('tipos_formacao')
        .select('*');

      // Carregar ações de formação
      const { data: acoesFormacao } = await supabase
        .from('acoes_formacao')
        .select('*');

      // Carregar participações
      const { data: participacoes } = await supabase
        .from('participacoes_formacao')
        .select(`
          *,
          acao_formacao:acoes_formacao(
            nome_acao,
            tipo_formacao:tipos_formacao(nome)
          )
        `);

      // Processar dados
      const tiposData = tiposFormacao || [];
      const acoesData = acoesFormacao || [];
      const participacoesData = participacoes || [];

      // Calcular estatísticas de tipos
      const tiposAtivos = tiposData.filter(t => t.ativo).length;
      const tiposInativos = tiposData.length - tiposAtivos;

      // Calcular estatísticas de ações
      const hoje = new Date();
      const acoesAtivas = acoesData.filter(a => {
        const dataFim = new Date(a.data_fim);
        return dataFim >= hoje;
      }).length;
      
      const acoesCompletadas = acoesData.filter(a => {
        const dataFim = new Date(a.data_fim);
        return dataFim < hoje;
      }).length;

      // Calcular estatísticas de participações
      const participacoesAtivas = participacoesData.filter(p => 
        p.status === 'inscrito' || p.status === 'em_avaliacao'
      ).length;
      
      const participacoesCompletadas = participacoesData.filter(p => 
        p.status === 'concluido'
      ).length;
      
      const participacoesAprovadas = participacoesData.filter(p => 
        p.resultado === 'aprovado'
      ).length;
      
      const participacoesReprovadas = participacoesData.filter(p => 
        p.resultado === 'reprovado'
      ).length;

      // Calcular métricas de qualidade
      const taxaSucessoGeral = participacoesCompletadas > 0 ? 
        Math.round((participacoesAprovadas / participacoesCompletadas) * 100) : 0;

      const notasValidas = participacoesData
        .filter(p => p.nota_final && p.nota_final > 0)
        .map(p => p.nota_final);
      
      const mediaNotasGeral = notasValidas.length > 0 ? 
        Math.round(notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length) : 0;

      const participantesPorAcao = acoesData.length > 0 ? 
        Math.round(participacoesData.length / acoesData.length) : 0;

      // Distribuições
      const distribuicaoPorTipo: { [key: string]: number } = {};
      participacoesData.forEach(p => {
        const tipo = p.acao_formacao?.tipo_formacao?.nome || 'Sem Tipo';
        distribuicaoPorTipo[tipo] = (distribuicaoPorTipo[tipo] || 0) + 1;
      });

      const distribuicaoPorStatus: { [key: string]: number } = {};
      participacoesData.forEach(p => {
        const status = p.status || 'Indefinido';
        distribuicaoPorStatus[status] = (distribuicaoPorStatus[status] || 0) + 1;
      });

      const moduloStats: ModuloFormacaoStats = {
        totalTiposFormacao: tiposData.length,
        tiposAtivos,
        tiposInativos,
        totalAcoesFormacao: acoesData.length,
        acoesAtivas,
        acoesCompletadas,
        acoesCanceladas: 0, // Placeholder
        totalParticipacoes: participacoesData.length,
        participacoesAtivas,
        participacoesCompletadas,
        participacoesAprovadas,
        participacoesReprovadas,
        taxaSucessoGeral,
        mediaNotasGeral,
        participantesPorAcao,
        distribuicaoPorTipo,
        distribuicaoPorStatus,
        distribuicaoPorMes: { 'Jan': 10, 'Fev': 15, 'Mar': 12, 'Abr': 18 } // Placeholder
      };

      setStats(moduloStats);

      // Configurar funcionalidades do módulo
      const funcionalidadesModulo: FuncionalidadeFormacao[] = [
        {
          id: 'sistema',
          titulo: 'Sistema de Formação',
          descricao: 'Gestão completa de tipos, ações e participações',
          icone: GraduationCap,
          cor: 'bg-blue-500',
          link: '/sistema-formacao',
          stats: {
            principal: moduloStats.totalAcoesFormacao,
            secundaria: `${moduloStats.acoesAtivas} ativas`
          },
          ativo: true
        },
        {
          id: 'tipos',
          titulo: 'Tipos de Formação',
          descricao: 'Gerir tipos e categorias de formação',
          icone: BookOpen,
          cor: 'bg-green-500',
          link: '/sistema-formacao#tipos',
          stats: {
            principal: moduloStats.totalTiposFormacao,
            secundaria: `${moduloStats.tiposAtivos} ativos`
          },
          ativo: true
        },
        {
          id: 'acoes',
          titulo: 'Ações de Formação',
          descricao: 'Gerir ações e sessões de formação',
          icone: Calendar,
          cor: 'bg-purple-500',
          link: '/sistema-formacao#acoes',
          stats: {
            principal: moduloStats.acoesAtivas,
            secundaria: `${moduloStats.acoesCompletadas} completadas`
          },
          ativo: true
        },
        {
          id: 'participantes',
          titulo: 'Gestão de Participantes',
          descricao: 'Gerir inscrições e avaliações',
          icone: Users,
          cor: 'bg-orange-500',
          link: '/sistema-formacao#participantes',
          stats: {
            principal: moduloStats.totalParticipacoes,
            secundaria: `${moduloStats.participacoesAtivas} ativas`
          },
          ativo: true
        },
        {
          id: 'avaliacoes',
          titulo: 'Sistema de Avaliação',
          descricao: 'Avaliar e certificar participantes',
          icone: Award,
          cor: 'bg-red-500',
          link: '/sistema-formacao#avaliacoes',
          stats: {
            principal: moduloStats.taxaSucessoGeral,
            secundaria: `${moduloStats.participacoesAprovadas} aprovados`
          },
          ativo: true
        },
        {
          id: 'relatorios',
          titulo: 'Relatórios de Formação',
          descricao: 'Análises e relatórios detalhados',
          icone: FileText,
          cor: 'bg-yellow-500',
          link: '/relatorios-formacao',
          ativo: true
        }
      ];

      setFuncionalidades(funcionalidadesModulo);

    } catch (error) {
      console.error('Erro ao carregar módulo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do módulo",
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
              <p className="text-gray-600">Carregando módulo...</p>
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
                Não foi possível carregar os dados do módulo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadModuloData}>
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
                <GraduationCap className="h-8 w-8 mr-3 text-blue-600" />
                Módulo Formação
              </h1>
              <p className="text-gray-600 mt-1">
                Sistema completo de gestão de formações e certificações
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link to="/sistema-formacao">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Ação
              </Button>
            </Link>
            <Button variant="outline" onClick={loadModuloData}>
              <Activity className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Formação</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTiposFormacao}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tiposAtivos} ativos, {stats.tiposInativos} inativos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações de Formação</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalAcoesFormacao}</div>
              <p className="text-xs text-muted-foreground">
                {stats.acoesAtivas} ativas, {stats.acoesCompletadas} completadas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participações</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalParticipacoes}</div>
              <p className="text-xs text-muted-foreground">
                {stats.participacoesAtivas} ativas, {stats.participacoesCompletadas} completadas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.taxaSucessoGeral}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.participacoesAprovadas} aprovados, {stats.participacoesReprovadas} reprovados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades do Módulo */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Funcionalidades do Módulo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funcionalidades.map((funcionalidade) => {
              const IconeFuncionalidade = funcionalidade.icone;
              return (
                <Link key={funcionalidade.id} to={funcionalidade.link}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${funcionalidade.cor} text-white`}>
                          <IconeFuncionalidade className="h-6 w-6" />
                        </div>
                        {funcionalidade.ativo && (
                          <Badge variant="default">Ativo</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-1">{funcionalidade.titulo}</h3>
                      <p className="text-sm text-gray-600 mb-3">{funcionalidade.descricao}</p>
                      {funcionalidade.stats && (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-bold">{funcionalidade.stats.principal}</div>
                            <div className="text-xs text-gray-500">{funcionalidade.stats.secundaria}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
            <TabsTrigger value="participacoes">Participações</TabsTrigger>
            <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estatísticas de Formação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Estatísticas de Formação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Tipos Ativos</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.tiposAtivos / stats.totalTiposFormacao) * 100} className="w-24" />
                        <Badge variant="default">{stats.tiposAtivos}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ações Ativas</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.acoesAtivas / stats.totalAcoesFormacao) * 100} className="w-24" />
                        <Badge variant="secondary">{stats.acoesAtivas}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Participações Ativas</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(stats.participacoesAtivas / stats.totalParticipacoes) * 100} className="w-24" />
                        <Badge variant="outline">{stats.participacoesAtivas}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/sistema-formacao">
                      <Button variant="outline" className="w-full justify-start">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Sistema
                      </Button>
                    </Link>
                    <Link to="/sistema-formacao#tipos">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Tipos
                      </Button>
                    </Link>
                    <Link to="/sistema-formacao#acoes">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Ações
                      </Button>
                    </Link>
                    <Link to="/sistema-formacao#participantes">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Participantes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Qualidade */}
          <TabsContent value="qualidade" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {stats.taxaSucessoGeral}%
                    </div>
                    <p className="text-sm text-gray-600">Participantes aprovados</p>
                    <Progress value={stats.taxaSucessoGeral} className="mt-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Média de Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {stats.mediaNotasGeral}/20
                    </div>
                    <p className="text-sm text-gray-600">Nota média geral</p>
                    <Progress value={(stats.mediaNotasGeral / 20) * 100} className="mt-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participantes por Ação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {stats.participantesPorAcao}
                    </div>
                    <p className="text-sm text-gray-600">Média de participantes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas de Qualidade Detalhadas */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Resultados das Avaliações</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aprovados</span>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(stats.participacoesAprovadas / stats.participacoesCompletadas) * 100} 
                          className="w-24"
                        />
                        <Badge variant="default">{stats.participacoesAprovadas}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reprovados</span>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(stats.participacoesReprovadas / stats.participacoesCompletadas) * 100} 
                          className="w-24"
                        />
                        <Badge variant="destructive">{stats.participacoesReprovadas}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Status das Participações</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ativas</span>
                      <Badge variant="default">{stats.participacoesAtivas}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completadas</span>
                      <Badge variant="secondary">{stats.participacoesCompletadas}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Participações */}
          <TabsContent value="participacoes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status das Participações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Status das Participações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.distribuicaoPorStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalParticipacoes) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Evolução Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Evolução Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.distribuicaoPorMes).map(([mes, count]) => (
                      <div key={mes} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{mes}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(count / 20) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Distribuição */}
          <TabsContent value="distribuicao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Distribuição por Tipo de Formação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.distribuicaoPorTipo).map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center justify-between">
                      <span className="font-medium">{tipo}</span>
                      <div className="flex items-center space-x-3">
                        <Progress 
                          value={(count / stats.totalParticipacoes) * 100} 
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
        </Tabs>
      </div>
    </div>
  );
};

export default ModuloFormacao;