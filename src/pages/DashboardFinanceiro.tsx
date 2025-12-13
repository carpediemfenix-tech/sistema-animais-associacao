import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
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
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  PawPrint,
  CreditCard,
  Wallet,
  FileText,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResumoFinanceiro {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  movimentos_pendentes: number;
}

interface MovimentoFinanceiro {
  id: string;
  numero_movimento: string;
  tipo: 'receita' | 'despesa' | 'transferencia';
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
  created_at: string;
}

interface ContaFinanceira {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  saldo_atual: number;
}

const DashboardFinanceiro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [resumoGeral, setResumoGeral] = useState<ResumoFinanceiro>({
    total_receitas: 0,
    total_despesas: 0,
    saldo: 0,
    movimentos_pendentes: 0
  });
  const [resumoAssociacao, setResumoAssociacao] = useState<ResumoFinanceiro>({
    total_receitas: 0,
    total_despesas: 0,
    saldo: 0,
    movimentos_pendentes: 0
  });
  const [resumoAnimais, setResumoAnimais] = useState<ResumoFinanceiro>({
    total_receitas: 0,
    total_despesas: 0,
    saldo: 0,
    movimentos_pendentes: 0
  });
  const [movimentosRecentes, setMovimentosRecentes] = useState<MovimentoFinanceiro[]>([]);
  const [contas, setContas] = useState<ContaFinanceira[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadResumoFinanceiro(),
        loadMovimentosRecentes(),
        loadContas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadResumoFinanceiro = async () => {
    // Carregar resumo geral
    const { data: movimentos } = await supabase
      .from('movimentos_financeiros_2025_12_13_06_00')
      .select(`
        tipo,
        escopo,
        valor,
        status
      `);

    if (movimentos) {
      // Resumo Geral
      const receitasGeral = movimentos
        .filter(m => m.tipo === 'receita' && m.status === 'pago')
        .reduce((sum, m) => sum + m.valor, 0);
      
      const despesasGeral = movimentos
        .filter(m => m.tipo === 'despesa' && m.status === 'pago')
        .reduce((sum, m) => sum + m.valor, 0);

      const pendentesGeral = movimentos
        .filter(m => m.status === 'pendente').length;

      setResumoGeral({
        total_receitas: receitasGeral,
        total_despesas: despesasGeral,
        saldo: receitasGeral - despesasGeral,
        movimentos_pendentes: pendentesGeral
      });

      // Resumo Associação
      const receitasAssoc = movimentos
        .filter(m => m.tipo === 'receita' && m.escopo === 'associacao' && m.status === 'pago')
        .reduce((sum, m) => sum + m.valor, 0);
      
      const despesasAssoc = movimentos
        .filter(m => m.tipo === 'despesa' && m.escopo === 'associacao' && m.status === 'pago')
        .reduce((sum, m) => sum + m.valor, 0);

      const pendentesAssoc = movimentos
        .filter(m => m.escopo === 'associacao' && m.status === 'pendente').length;

      setResumoAssociacao({
        total_receitas: receitasAssoc,
        total_despesas: despesasAssoc,
        saldo: receitasAssoc - despesasAssoc,
        movimentos_pendentes: pendentesAssoc
      });

      // Resumo Animais
      const receitasAnimais = movimentos
        .filter(m => m.tipo === 'receita' && m.escopo === 'animal' && m.status === 'pago')
        .reduce((sum, m) => sum + m.valor, 0);
      
      const despesasAnimais = movimentos
        .filter(m => m.tipo === 'despesa' && m.escopo === 'animal' && m.status === 'pago')
        .reduce((sum, m) => sum + m.valor, 0);

      const pendentesAnimais = movimentos
        .filter(m => m.escopo === 'animal' && m.status === 'pendente').length;

      setResumoAnimais({
        total_receitas: receitasAnimais,
        total_despesas: despesasAnimais,
        saldo: receitasAnimais - despesasAnimais,
        movimentos_pendentes: pendentesAnimais
      });
    }
  };

  const loadMovimentosRecentes = async () => {
    const { data } = await supabase
      .from('movimentos_financeiros_2025_12_13_06_00')
      .select(`
        *,
        categoria:categorias_financeiras_2025_12_13_06_00(nome, cor, icone),
        animal:animais(nome, especie)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setMovimentosRecentes(data as MovimentoFinanceiro[]);
    }
  };

  const loadContas = async () => {
    const { data } = await supabase
      .from('contas_financeiras_2025_12_13_06_00')
      .select('*')
      .eq('ativo', true)
      .order('codigo');

    if (data) {
      setContas(data);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'parcial': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Carregando dados financeiros...</span>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
            <p className="text-gray-600 mt-1">Gestão completa das finanças da associação e animais</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link to="/financeiro/movimentos/novo">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Movimento
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumo por Abas */}
        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">📊 Visão Geral</TabsTrigger>
            <TabsTrigger value="associacao">🏢 Associação</TabsTrigger>
            <TabsTrigger value="animais">🐾 Animais</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="geral" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Receitas</p>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(resumoGeral.total_receitas)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Total Despesas</p>
                      <p className="text-2xl font-bold text-red-700">{formatCurrency(resumoGeral.total_despesas)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${resumoGeral.saldo >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Saldo Total</p>
                      <p className={`text-2xl font-bold ${resumoGeral.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {formatCurrency(resumoGeral.saldo)}
                      </p>
                    </div>
                    <DollarSign className={`h-8 w-8 ${resumoGeral.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-700">{resumoGeral.movimentos_pendentes}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

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
                          <div className={`p-2 rounded-full ${movimento.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {movimento.tipo === 'receita' ? 
                              <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">{movimento.descricao}</p>
                            <p className="text-xs text-gray-500">
                              {movimento.categoria?.nome} • {formatDate(movimento.data_movimento || movimento.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${movimento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                            {movimento.tipo === 'receita' ? '+' : '-'}{formatCurrency(movimento.valor)}
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
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso direto às principais funcionalidades financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Novo Movimento */}
              <Link to="/financeiro/movimentos/novo">
                <Button className="w-full h-24 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-6 w-6" />
                  <div className="text-center">
                    <div className="text-sm font-medium">Novo Movimento</div>
                    <div className="text-xs opacity-90">Registar receita/despesa</div>
                  </div>
                </Button>
              </Link>
              
              {/* Ver Todos os Movimentos */}
              <Link to="/financeiro/movimentos">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 border-blue-200 hover:bg-blue-50">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-700">Ver Movimentos</div>
                    <div className="text-xs text-blue-600">Histórico completo</div>
                  </div>
                </Button>
              </Link>
              
              {/* Contas */}
              <Link to="/financeiro/contas">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 border-purple-200 hover:bg-purple-50">
                  <Wallet className="h-6 w-6 text-purple-600" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-700">Contas</div>
                    <div className="text-xs text-purple-600">Bancos e caixas</div>
                  </div>
                </Button>
              </Link>

              {/* Configurações */}
              <Link to="/financeiro/configuracoes">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2 border-gray-200 hover:bg-gray-50">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700">Configurações</div>
                    <div className="text-xs text-gray-600">Categorias e contas</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Contas Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
              Contas Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {contas.map((conta) => (
                <div key={conta.id} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{conta.nome}</p>
                      <p className="text-xs text-gray-500">{conta.codigo}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {conta.tipo}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-purple-700">
                    {formatCurrency(conta.saldo_atual)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default DashboardFinanceiro;