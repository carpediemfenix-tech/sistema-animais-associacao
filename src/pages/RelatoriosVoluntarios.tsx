import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  TrendingUp,
  Calendar,
  Award,
  Target,
  PieChart,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Sprout,
  Shield,
  Sword,
  Crown,
  Heart,
  Zap,
  User,
  Star,
  FileText,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { VoluntarioValentao, NivelFormacao, Especializacao, VoluntarioProgressao, VoluntarioConquista } from "@/types/voluntarios";

interface RelatorioEstatisticas {
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosInativos: number;
  distribuicaoPorNivel: Array<{
    nivel: NivelFormacao;
    quantidade: number;
    percentual: number;
  }>;
  especializacoesObtidas: Array<{
    especializacao: Especializacao;
    quantidade: number;
  }>;
  conquistasRecentes: VoluntarioConquista[];
  progressoesUltimoMes: number;
  tempoMedioProgressao: number;
  taxaRetencao: number;
}

const RelatoriosVoluntarios = () => {
  const [estatisticas, setEstatisticas] = useState<RelatorioEstatisticas | null>(null);
  const [voluntarios, setVoluntarios] = useState<VoluntarioValentao[]>([]);
  const [niveisFormacao, setNiveisFormacao] = useState<NivelFormacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoFiltro, setPeriodoFiltro] = useState("30"); // dias
  const [tipoRelatorio, setTipoRelatorio] = useState("geral");

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
              Apenas administradores podem ver relatórios
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
    loadRelatorios();
  }, [periodoFiltro]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);

      // Calcular data de início baseada no filtro
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - parseInt(periodoFiltro));

      // Carregar voluntários
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select(`
          *,
          nivel_formacao:nivel_formacao_atual(*)
        `)
        .order('nome');

      if (voluntariosError) throw voluntariosError;

      // Carregar níveis de formação
      const { data: niveisData, error: niveisError } = await supabase
        .from('niveis_formacao')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (niveisError) throw niveisError;

      // Carregar especializações
      const { data: especializacoesData, error: especializacoesError } = await supabase
        .from('especializacoes')
        .select('*')
        .eq('ativo', true);

      if (especializacoesError) throw especializacoesError;

      // Carregar progressões do período
      const { data: progressoesData, error: progressoesError } = await supabase
        .from('voluntario_progressao')
        .select('*')
        .gte('created_at', dataInicio.toISOString());

      if (progressoesError) throw progressoesError;

      // Carregar conquistas recentes
      const { data: conquistasData, error: conquistasError } = await supabase
        .from('voluntario_conquistas')
        .select(`
          *,
          conquista:conquista_id(*),
          voluntario:voluntario_id(nome)
        `)
        .gte('created_at', dataInicio.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (conquistasError) throw conquistasError;

      // Carregar especializações obtidas
      const { data: especializacoesObtidas, error: especObtError } = await supabase
        .from('voluntario_especializacoes')
        .select(`
          *,
          especializacao:especializacao_id(*)
        `);

      if (especObtError) throw especObtError;

      // Processar estatísticas
      const totalVoluntarios = voluntariosData?.length || 0;
      const voluntariosAtivos = voluntariosData?.filter(v => v.ativo).length || 0;
      const voluntariosInativos = totalVoluntarios - voluntariosAtivos;

      // Distribuição por nível
      const distribuicaoPorNivel = niveisData?.map(nivel => {
        const quantidade = voluntariosData?.filter(v => v.nivel_formacao_atual === nivel.id).length || 0;
        return {
          nivel,
          quantidade,
          percentual: totalVoluntarios > 0 ? (quantidade / totalVoluntarios) * 100 : 0
        };
      }) || [];

      // Especializações obtidas
      const especializacoesAgrupadas = especializacoesData?.map(esp => ({
        especializacao: esp,
        quantidade: especializacoesObtidas?.filter(eo => eo.especializacao_id === esp.id).length || 0
      })) || [];

      // Calcular métricas adicionais
      const progressoesUltimoMes = progressoesData?.length || 0;
      const tempoMedioProgressao = 3; // Simulado - implementar cálculo real
      const taxaRetencao = voluntariosAtivos > 0 ? (voluntariosAtivos / totalVoluntarios) * 100 : 0;

      const estatisticasCalculadas: RelatorioEstatisticas = {
        totalVoluntarios,
        voluntariosAtivos,
        voluntariosInativos,
        distribuicaoPorNivel,
        especializacoesObtidas: especializacoesAgrupadas,
        conquistasRecentes: conquistasData || [],
        progressoesUltimoMes,
        tempoMedioProgressao,
        taxaRetencao
      };

      setEstatisticas(estatisticasCalculadas);
      setVoluntarios(voluntariosData || []);
      setNiveisFormacao(niveisData || []);

    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exportação de relatórios será implementada em breve",
    });
  };

  const getNivelIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_BASE': return <Sprout className="h-4 w-4" />;
      case 'FORMA_N1': return <Shield className="h-4 w-4" />;
      case 'FORMA_N2': return <Sword className="h-4 w-4" />;
      case 'FORMA_N3': return <Crown className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getEspecializacaoIcon = (codigo: string) => {
    switch (codigo) {
      case 'FORMA_VET': return <Heart className="h-4 w-4" />;
      case 'FORMA_RESCUE': return <Zap className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando relatórios...</p>
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
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              Relatórios de Voluntários
            </h1>
            <p className="text-gray-600 mt-1">
              Análises e estatísticas do sistema de voluntários Valentão
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Voluntários
              </Button>
            </Link>
            <Button onClick={exportarRelatorio} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Período */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 3 meses</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Relatório
                </label>
                <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Relatório Geral</SelectItem>
                    <SelectItem value="formacao">Formação</SelectItem>
                    <SelectItem value="atividade">Atividade</SelectItem>
                    <SelectItem value="conquistas">Conquistas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botão Atualizar */}
              <div className="flex items-end">
                <Button onClick={loadRelatorios} className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Voluntários</p>
                  <p className="text-2xl font-bold">{estatisticas?.totalVoluntarios || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Retenção</p>
                  <p className="text-2xl font-bold text-green-600">
                    {estatisticas?.taxaRetencao.toFixed(1) || 0}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progressões</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {estatisticas?.progressoesUltimoMes || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conquistas</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {estatisticas?.conquistasRecentes.length || 0}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="distribuicao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
            <TabsTrigger value="especializacoes">Especializações</TabsTrigger>
            <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
            <TabsTrigger value="atividade">Atividade</TabsTrigger>
          </TabsList>

          {/* Tab: Distribuição por Nível */}
          <TabsContent value="distribuicao">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Distribuição por Nível
                  </CardTitle>
                  <CardDescription>
                    Percentual de voluntários por nível de formação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {estatisticas?.distribuicaoPorNivel.map((item) => (
                    <div key={item.nivel.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${item.nivel.cor}20` }}
                        >
                          <span style={{ color: item.nivel.cor }}>
                            {getNivelIcon(item.nivel.codigo)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{item.nivel.nome}</p>
                          <p className="text-sm text-gray-500">{item.quantidade} voluntários</p>
                        </div>
                      </div>
                      <Badge 
                        style={{ backgroundColor: `${item.nivel.cor}20`, color: item.nivel.cor }}
                      >
                        {item.percentual.toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Status dos Voluntários
                  </CardTitle>
                  <CardDescription>
                    Distribuição por status de atividade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Voluntários Ativos</p>
                        <p className="text-sm text-gray-500">Atualmente ativos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {estatisticas?.voluntariosAtivos || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        {estatisticas?.totalVoluntarios ? 
                          `${Math.round((estatisticas.voluntariosAtivos / estatisticas.totalVoluntarios) * 100)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-red-100">
                        <Clock className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Voluntários Inativos</p>
                        <p className="text-sm text-gray-500">Temporariamente inativos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-600">
                        {estatisticas?.voluntariosInativos || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        {estatisticas?.totalVoluntarios ? 
                          `${Math.round((estatisticas.voluntariosInativos / estatisticas.totalVoluntarios) * 100)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Especializações */}
          <TabsContent value="especializacoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Especializações Obtidas
                </CardTitle>
                <CardDescription>
                  Número de voluntários com cada especialização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {estatisticas?.especializacoesObtidas.map((item) => (
                    <Card key={item.especializacao.id} className="border-2" style={{ borderColor: `${item.especializacao.cor}40` }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="p-2 rounded-full"
                              style={{ backgroundColor: `${item.especializacao.cor}20` }}
                            >
                              <span style={{ color: item.especializacao.cor }}>
                                {getEspecializacaoIcon(item.especializacao.codigo)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{item.especializacao.nome}</p>
                              <p className="text-sm text-gray-500">{item.especializacao.codigo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-2xl" style={{ color: item.especializacao.cor }}>
                              {item.quantidade}
                            </p>
                            <p className="text-xs text-gray-500">voluntários</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Conquistas */}
          <TabsContent value="conquistas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Conquistas Recentes
                </CardTitle>
                <CardDescription>
                  Últimas conquistas obtidas pelos voluntários
                </CardDescription>
              </CardHeader>
              <CardContent>
                {estatisticas?.conquistasRecentes.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma conquista recente
                    </h3>
                    <p className="text-gray-500">
                      As conquistas aparecerão aqui quando forem obtidas pelos voluntários
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {estatisticas.conquistasRecentes.map((conquista) => (
                      <div key={conquista.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${conquista.conquista?.cor}20` }}
                        >
                          <Award className="h-4 w-4" style={{ color: conquista.conquista?.cor }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{conquista.conquista?.nome}</p>
                          <p className="text-sm text-gray-600">{conquista.conquista?.descricao}</p>
                          <p className="text-xs text-gray-500">
                            {conquista.voluntario?.nome} • {new Date(conquista.data_obtencao).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        <Badge 
                          style={{ backgroundColor: conquista.conquista?.cor, color: 'white' }}
                        >
                          {conquista.conquista?.categoria}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Atividade */}
          <TabsContent value="atividade">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Métricas de Performance
                  </CardTitle>
                  <CardDescription>
                    Indicadores de desempenho do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Retenção</span>
                    <span className="font-bold text-green-600">
                      {estatisticas?.taxaRetencao.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progressões no Período</span>
                    <span className="font-bold text-blue-600">
                      {estatisticas?.progressoesUltimoMes}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tempo Médio de Progressão</span>
                    <span className="font-bold text-purple-600">
                      {estatisticas?.tempoMedioProgressao} meses
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conquistas Obtidas</span>
                    <span className="font-bold text-yellow-600">
                      {estatisticas?.conquistasRecentes.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Resumo Executivo
                  </CardTitle>
                  <CardDescription>
                    Principais insights do período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Total de {estatisticas?.totalVoluntarios} voluntários</strong> no sistema, 
                      com {estatisticas?.voluntariosAtivos} ativos ({estatisticas?.taxaRetencao.toFixed(1)}% de retenção).
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>{estatisticas?.progressoesUltimoMes} progressões</strong> registadas no período selecionado, 
                      demonstrando atividade formativa constante.
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>{estatisticas?.conquistasRecentes.length} conquistas</strong> obtidas recentemente, 
                      indicando engagement dos voluntários.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RelatoriosVoluntarios;