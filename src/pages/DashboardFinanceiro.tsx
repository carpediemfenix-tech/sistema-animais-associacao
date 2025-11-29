import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  BarChart3,
  Calendar,
  AlertTriangle,
  Target,
  Users,
  PawPrint,
  Building,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResumoFinanceiro {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
}

interface MovimentoFinanceiro {
  id: string;
  numero_movimento: string;
  tipo_movimento: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao';
  categoria: {
    nome: string;
    cor: string;
    icone: string;
  };
  animal?: {
    nome: string;
    especie: string;
  };
  descricao: string;
  valor: number;
  data_movimento: string;
  status: string;
}

const DashboardFinanceiro = () => {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumoAssociacao, setResumoAssociacao] = useState<ResumoFinanceiro>({ total_receitas: 0, total_despesas: 0, saldo: 0 });
  const [resumoAnimais, setResumoAnimais] = useState<ResumoFinanceiro>({ total_receitas: 0, total_despesas: 0, saldo: 0 });
  const [movimentosRecentes, setMovimentosRecentes] = useState<MovimentoFinanceiro[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchResumoFinanceiro = async () => {
    try {
      setLoading(true);

      // Resumo da Associação
      const { data: resumoAssoc, error: errorAssoc } = await supabase
        .from('vw_resumo_financeiro_associacao')
        .select('*')
        .single();

      if (!errorAssoc && resumoAssoc) {
        setResumoAssociacao(resumoAssoc);
      }

      // Resumo dos Animais (soma de todos)
      const { data: resumoAnim, error: errorAnim } = await supabase
        .rpc('get_resumo_animais_total');

      if (!errorAnim && resumoAnim) {
        setResumoAnimais(resumoAnim);
      }

      // Movimentos Recentes
      const { data: movimentos, error: errorMov } = await supabase
        .from('movimentos_financeiros')
        .select(`
          *,
          categoria:categorias_financeiras(nome, cor, icone),
          animal:animais(nome, especie)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!errorMov && movimentos) {
        setMovimentosRecentes(movimentos);
      }

    } catch (error: any) {
      console.error('Erro ao carregar resumo financeiro:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar o resumo financeiro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumoFinanceiro();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalGeral = {
    receitas: resumoAssociacao.total_receitas + resumoAnimais.total_receitas,
    despesas: resumoAssociacao.total_despesas + resumoAnimais.total_despesas,
    saldo: resumoAssociacao.saldo + resumoAnimais.saldo
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dashboard financeiro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="Dashboard Financeiro" 
        subtitle="Visão completa da saúde financeira da associação"
        backTo="/"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Receitas</p>
                  <p className="text-3xl font-bold text-blue-700">{formatCurrency(totalGeral.receitas)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Despesas</p>
                  <p className="text-3xl font-bold text-red-700">{formatCurrency(totalGeral.despesas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border-2 ${totalGeral.saldo >= 0 ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                  <p className={`text-3xl font-bold ${totalGeral.saldo >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                    {formatCurrency(totalGeral.saldo)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${totalGeral.saldo >= 0 ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Movimentos</p>
                  <p className="text-3xl font-bold text-purple-700">{movimentosRecentes.length}</p>
                  <p className="text-xs text-purple-500">últimos 10</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Separação por Escopo */}
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">📊 Visão Geral</TabsTrigger>
            <TabsTrigger value="associacao">🏢 Associação</TabsTrigger>
            <TabsTrigger value="animais">🐾 Animais</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="geral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Comparação Associação vs Animais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                    Distribuição por Escopo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blue-600" />
                        <span className="font-medium">Associação</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700">{formatCurrency(resumoAssociacao.saldo)}</p>
                        <p className="text-xs text-blue-600">
                          R: {formatCurrency(resumoAssociacao.total_receitas)} | 
                          D: {formatCurrency(resumoAssociacao.total_despesas)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <PawPrint className="h-5 w-5 mr-2 text-green-600" />
                        <span className="font-medium">Animais</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">{formatCurrency(resumoAnimais.saldo)}</p>
                        <p className="text-xs text-green-600">
                          R: {formatCurrency(resumoAnimais.total_receitas)} | 
                          D: {formatCurrency(resumoAnimais.total_despesas)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Movimentos Recentes */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      Movimentos Recentes
                    </CardTitle>
                    <Link to="/financeiro/movimentos">
                      <Button variant="outline" size="sm">
                        Ver Todos
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {movimentosRecentes.slice(0, 5).map((movimento) => (
                      <div key={movimento.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${movimento.tipo_movimento === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {movimento.tipo_movimento === 'receita' ? 
                              <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">{movimento.descricao}</p>
                            <p className="text-xs text-gray-500">
                              {movimento.categoria?.nome} • {formatDate(movimento.data_movimento)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${movimento.tipo_movimento === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                            {movimento.tipo_movimento === 'receita' ? '+' : '-'}{formatCurrency(movimento.valor)}
                          </p>
                          <Badge className={getStatusColor(movimento.status)} variant="secondary">
                            {movimento.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Associação */}
          <TabsContent value="associacao" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Receitas Associação</p>
                      <p className="text-2xl font-bold text-blue-700">{formatCurrency(resumoAssociacao.total_receitas)}</p>
                    </div>
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Despesas Associação</p>
                      <p className="text-2xl font-bold text-red-700">{formatCurrency(resumoAssociacao.total_despesas)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${resumoAssociacao.saldo >= 0 ? 'border-green-200' : 'border-orange-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Saldo Associação</p>
                      <p className={`text-2xl font-bold ${resumoAssociacao.saldo >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                        {formatCurrency(resumoAssociacao.saldo)}
                      </p>
                    </div>
                    <DollarSign className={`h-8 w-8 ${resumoAssociacao.saldo >= 0 ? 'text-green-600' : 'text-orange-600'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Animais */}
          <TabsContent value="animais" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Receitas Animais</p>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(resumoAnimais.total_receitas)}</p>
                    </div>
                    <PawPrint className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Despesas Animais</p>
                      <p className="text-2xl font-bold text-red-700">{formatCurrency(resumoAnimais.total_despesas)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${resumoAnimais.saldo >= 0 ? 'border-green-200' : 'border-orange-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Saldo Animais</p>
                      <p className={`text-2xl font-bold ${resumoAnimais.saldo >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                        {formatCurrency(resumoAnimais.saldo)}
                      </p>
                    </div>
                    <DollarSign className={`h-8 w-8 ${resumoAnimais.saldo >= 0 ? 'text-green-600' : 'text-orange-600'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/financeiro/movimentos/novo">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Plus className="h-6 w-6" />
                  <span>Novo Movimento</span>
                </Button>
              </Link>
              
              <Link to="/financeiro/relatorios">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Relatórios</span>
                </Button>
              </Link>
              
              <Link to="/financeiro/orcamentos">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Target className="h-6 w-6" />
                  <span>Orçamentos</span>
                </Button>
              </Link>
              
              <Link to="/financeiro/categorias">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <PieChart className="h-6 w-6" />
                  <span>Categorias</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;