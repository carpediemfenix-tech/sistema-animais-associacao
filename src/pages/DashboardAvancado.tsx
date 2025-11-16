import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PawPrint, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Euro, 
  Calendar,
  Activity,
  AlertTriangle,
  Heart,
  Clock,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Voluntario, MovimentoFinanceiro } from "@/types/animal";
import { useAlertas } from "@/hooks/useAlertas";

interface DashboardStats {
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  totalVoluntarios: number;
  voluntariosAtivos: number;
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
  intervencoesMes: number;
  adocoesMes: number;
  animaisPorEspecie: { especie: string; count: number }[];
  movimentosRecentes: MovimentoFinanceiro[];
  voluntariosMaisAtivos: { nome: string; intervencoes: number }[];
}

const DashboardAvancado = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimais: 0,
    animaisAtivos: 0,
    animaisAdotados: 0,
    totalVoluntarios: 0,
    voluntariosAtivos: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    saldoAtual: 0,
    intervencoesMes: 0,
    adocoesMes: 0,
    animaisPorEspecie: [],
    movimentosRecentes: [],
    voluntariosMaisAtivos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando carregamento do dashboard...');

      // Buscar animais
      const { data: animais, error: animaisError } = await supabase
        .from('animais_2025_11_13_03_23')
        .select('*');
      
      if (animaisError) {
        console.error('Erro ao buscar animais:', animaisError);
        throw new Error(`Erro ao carregar animais: ${animaisError.message}`);
      }
      
      console.log('Animais carregados:', animais?.length || 0);

      // Buscar voluntários
      const { data: voluntarios, error: voluntariosError } = await supabase
        .from('voluntarios_2025_11_16_18_00')
        .select('*');
      
      if (voluntariosError) {
        console.error('Erro ao buscar voluntários:', voluntariosError);
        // Não falhar se não houver voluntários
      }

      // Buscar movimentos financeiros
      const { data: movimentos, error: movimentosError } = await supabase
        .from('movimentos_financeiros_2025_11_16_18_00')
        .select(`
          *,
          animal:animais_2025_11_13_03_23(nome),
          voluntario:voluntarios_2025_11_16_18_00(nome)
        `)
        .order('data_movimento', { ascending: false })
        .limit(10);
      
      if (movimentosError) {
        console.error('Erro ao buscar movimentos:', movimentosError);
        // Não falhar se não houver movimentos
      }

      // Buscar intervenções do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const { data: intervencoesMes, error: intervencoesError } = await supabase
        .from('intervencoes_2025_11_13_03_23')
        .select(`
          *,
          voluntario:voluntarios_2025_11_16_18_00(nome)
        `)
        .gte('data_intervencao', inicioMes.toISOString().split('T')[0]);
      
      if (intervencoesError) {
        console.error('Erro ao buscar intervenções:', intervencoesError);
        // Não falhar se não houver intervenções
      }

      // Calcular estatísticas
      const animaisAtivos = animais?.filter(a => !a.arquivado) || [];
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado') || [];
      const voluntariosAtivos = voluntarios?.filter(v => v.ativo) || [];
      
      const totalReceitas = movimentos?.filter(m => m.tipo_movimento === 'Receita')
        .reduce((sum, m) => sum + m.valor, 0) || 0;
      
      const totalDespesas = movimentos?.filter(m => m.tipo_movimento === 'Despesa')
        .reduce((sum, m) => sum + m.valor, 0) || 0;

      // Animais por espécie
      const especieCount = animaisAtivos.reduce((acc, animal) => {
        acc[animal.especie] = (acc[animal.especie] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const animaisPorEspecie = Object.entries(especieCount).map(([especie, count]) => ({
        especie,
        count
      }));

      // Adoções do mês
      const adocoesMes = animaisAdotados.filter(a => {
        const dataAdocao = new Date(a.updated_at);
        return dataAdocao >= inicioMes;
      }).length;

      // Voluntários mais ativos
      const voluntarioIntervencoes = intervencoesMes?.reduce((acc, intervencao) => {
        if (intervencao.voluntario) {
          acc[intervencao.voluntario.nome] = (acc[intervencao.voluntario.nome] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const voluntariosMaisAtivos = Object.entries(voluntarioIntervencoes)
        .map(([nome, intervencoes]) => ({ nome, intervencoes }))
        .sort((a, b) => b.intervencoes - a.intervencoes)
        .slice(0, 5);

      setStats({
        totalAnimais: animais?.length || 0,
        animaisAtivos: animaisAtivos.length,
        animaisAdotados: animaisAdotados.length,
        totalVoluntarios: voluntarios?.length || 0,
        voluntariosAtivos: voluntariosAtivos.length,
        totalReceitas,
        totalDespesas,
        saldoAtual: totalReceitas - totalDespesas,
        intervencoesMes: intervencoesMes?.length || 0,
        adocoesMes,
        animaisPorEspecie,
        movimentosRecentes: movimentos || [],
        voluntariosMaisAtivos
      });

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      setError(error.message || 'Erro desconhecido ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg">A carregar dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={fetchDashboardData}>
              Tentar Novamente
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Voltar ao Início</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="/images/BackgroundEraser_20250411_205630024.png" 
            alt="Valentão ao Resgate" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold">Dashboard - Valentão ao Resgate</h1>
            <p className="text-muted-foreground">
              Visão geral completa da associação
            </p>
          </div>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          Atualizar Dados
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Animais Ativos</p>
                <p className="text-2xl font-bold">{stats.animaisAtivos}</p>
                <p className="text-xs text-muted-foreground">
                  de {stats.totalAnimais} total
                </p>
              </div>
              <PawPrint className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Voluntários Ativos</p>
                <p className="text-2xl font-bold">{stats.voluntariosAtivos}</p>
                <p className="text-xs text-muted-foreground">
                  de {stats.totalVoluntarios} total
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Atual</p>
                <p className={`text-2xl font-bold ${stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{stats.saldoAtual.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  R: €{stats.totalReceitas.toFixed(2)} | D: €{stats.totalDespesas.toFixed(2)}
                </p>
              </div>
              <Euro className={`h-8 w-8 ${stats.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-xs text-muted-foreground">
                  Sistema funcionando
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Intervenções (Mês)</p>
                <p className="text-2xl font-bold">{stats.intervencoesMes}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adoções (Mês)</p>
                <p className="text-2xl font-bold">{stats.adocoesMes}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Animais Adotados</p>
                <p className="text-2xl font-bold">{stats.animaisAdotados}</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="especies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="especies">Por Espécie</TabsTrigger>
          <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="especies">
          <Card>
            <CardHeader>
              <CardTitle>Animais por Espécie</CardTitle>
              <CardDescription>
                Distribuição dos animais ativos por espécie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.animaisPorEspecie.map((item) => (
                  <div key={item.especie} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.especie}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(item.count / stats.animaisAtivos) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voluntarios">
          <Card>
            <CardHeader>
              <CardTitle>Voluntários Mais Ativos</CardTitle>
              <CardDescription>
                Voluntários com mais intervenções este mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.voluntariosMaisAtivos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma intervenção registada este mês.
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.voluntariosMaisAtivos.map((voluntario, index) => (
                    <div key={voluntario.nome} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{voluntario.nome}</span>
                      </div>
                      <Badge variant="secondary">
                        {voluntario.intervencoes} intervenções
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle>Movimentos Recentes</CardTitle>
              <CardDescription>
                Últimos 10 movimentos financeiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.movimentosRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum movimento financeiro registado.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.movimentosRecentes.map((movimento) => (
                    <div key={movimento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          movimento.tipo_movimento === 'Receita' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {movimento.tipo_movimento === 'Receita' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{movimento.descricao}</p>
                          <p className="text-xs text-muted-foreground">
                            {movimento.categoria} • {new Date(movimento.data_movimento).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        movimento.tipo_movimento === 'Receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimento.tipo_movimento === 'Receita' ? '+' : '-'}€{movimento.valor.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/novo-animal">
                <Plus className="h-6 w-6 mb-2" />
                Novo Animal
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/gestao-animais">
                <PawPrint className="h-6 w-6 mb-2" />
                Gerir Animais
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/voluntarios">
                <Users className="h-6 w-6 mb-2" />
                Voluntários
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link to="/financeiro">
                <Euro className="h-6 w-6 mb-2" />
                Financeiro
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAvancado;