import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  PawPrint, 
  Users, 
  Euro,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Voluntario, MovimentoFinanceiro, Intervencao } from "@/types/animal";

interface RelatorioAvancadoStats {
  // Estatísticas gerais
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisObito: number;
  
  // Estatísticas por período
  adocoesPorMes: { mes: string; count: number }[];
  intervencoesPorMes: { mes: string; count: number; custo: number }[];
  movimentosPorMes: { mes: string; receitas: number; despesas: number }[];
  
  // Análises detalhadas
  animaisPorEspecie: { especie: string; count: number; adotados: number }[];
  intervencoesPorTipo: { tipo: string; count: number; custo: number }[];
  voluntariosPorEspecialidade: { especialidade: string; count: number; ativo: number }[];
  
  // Custos e financeiro
  custoMedioPorAnimal: number;
  tempoMedioAdocao: number;
  
  // Tendências
  crescimentoMensal: number;
  eficienciaAdocao: number;
}

const RelatoriosAvancados = () => {
  const [stats, setStats] = useState<RelatorioAvancadoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear().toString());
  const [filtroMes, setFiltroMes] = useState("todos");

  useEffect(() => {
    fetchRelatoriosAvancados();
  }, [filtroAno, filtroMes]);

  const fetchRelatoriosAvancados = async () => {
    try {
      setLoading(true);

      // Buscar todos os dados necessários
      const [animaisRes, voluntariosRes, movimentosRes, intervencoesRes] = await Promise.all([
        supabase.from('animais_2025_11_13_03_23').select('*'),
        supabase.from('voluntarios_2025_11_16_18_00').select('*'),
        supabase.from('movimentos_financeiros_2025_11_16_18_00').select('*'),
        supabase.from('intervencoes_2025_11_13_03_23').select(`
          *,
          tipo_intervencao:tipos_intervencoes_2025_11_13_03_23(*)
        `)
      ]);

      const animais = animaisRes.data || [];
      const voluntarios = voluntariosRes.data || [];
      const movimentos = movimentosRes.data || [];
      const intervencoes = intervencoesRes.data || [];

      // Filtrar por ano/mês se necessário
      const anoFiltro = parseInt(filtroAno);
      const animaisFiltrados = animais.filter(a => {
        const ano = new Date(a.data_entrada).getFullYear();
        return ano === anoFiltro;
      });

      // Calcular estatísticas
      const animaisAtivos = animais.filter(a => !a.arquivado && a.estado === 'Ativo');
      const animaisAdotados = animais.filter(a => a.estado === 'Adotado');
      const animaisObito = animais.filter(a => a.estado === 'Óbito');

      // Adoções por mês (últimos 12 meses)
      const adocoesPorMes = calcularAdocoesPorMes(animaisAdotados);
      
      // Intervenções por mês
      const intervencoesPorMes = calcularIntervencoesPorMes(intervencoes);
      
      // Movimentos por mês
      const movimentosPorMes = calcularMovimentosPorMes(movimentos);

      // Animais por espécie
      const animaisPorEspecie = calcularAnimaisPorEspecie(animais);

      // Intervenções por tipo
      const intervencoesPorTipo = calcularIntervencoesPorTipo(intervencoes);

      // Voluntários por especialidade
      const voluntariosPorEspecialidade = calcularVoluntariosPorEspecialidade(voluntarios);

      // Cálculos avançados
      const custoMedioPorAnimal = calcularCustoMedioPorAnimal(movimentos, animais);
      const tempoMedioAdocao = calcularTempoMedioAdocao(animaisAdotados);
      const crescimentoMensal = calcularCrescimentoMensal(animais);
      const eficienciaAdocao = calcularEficienciaAdocao(animais);

      setStats({
        totalAnimais: animais.length,
        animaisAtivos: animaisAtivos.length,
        animaisAdotados: animaisAdotados.length,
        animaisObito: animaisObito.length,
        adocoesPorMes,
        intervencoesPorMes,
        movimentosPorMes,
        animaisPorEspecie,
        intervencoesPorTipo,
        voluntariosPorEspecialidade,
        custoMedioPorAnimal,
        tempoMedioAdocao,
        crescimentoMensal,
        eficienciaAdocao
      });

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funções auxiliares de cálculo
  const calcularAdocoesPorMes = (animaisAdotados: Animal[]) => {
    const meses = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mes = data.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      const count = animaisAdotados.filter(a => {
        const dataAdocao = new Date(a.updated_at);
        return dataAdocao.getMonth() === data.getMonth() && 
               dataAdocao.getFullYear() === data.getFullYear();
      }).length;
      meses.push({ mes, count });
    }
    return meses;
  };

  const calcularIntervencoesPorMes = (intervencoes: Intervencao[]) => {
    const meses = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mes = data.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      const intervencoesMes = intervencoes.filter(i => {
        const dataIntervencao = new Date(i.data_intervencao);
        return dataIntervencao.getMonth() === data.getMonth() && 
               dataIntervencao.getFullYear() === data.getFullYear();
      });
      const count = intervencoesMes.length;
      const custo = intervencoesMes.reduce((sum, i) => sum + (i.custo || 0), 0);
      meses.push({ mes, count, custo });
    }
    return meses;
  };

  const calcularMovimentosPorMes = (movimentos: MovimentoFinanceiro[]) => {
    const meses = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mes = data.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      const movimentosMes = movimentos.filter(m => {
        const dataMovimento = new Date(m.data_movimento);
        return dataMovimento.getMonth() === data.getMonth() && 
               dataMovimento.getFullYear() === data.getFullYear();
      });
      const receitas = movimentosMes.filter(m => m.tipo_movimento === 'Receita').reduce((sum, m) => sum + m.valor, 0);
      const despesas = movimentosMes.filter(m => m.tipo_movimento === 'Despesa').reduce((sum, m) => sum + m.valor, 0);
      meses.push({ mes, receitas, despesas });
    }
    return meses;
  };

  const calcularAnimaisPorEspecie = (animais: Animal[]) => {
    const especies = animais.reduce((acc, animal) => {
      if (!acc[animal.especie]) {
        acc[animal.especie] = { total: 0, adotados: 0 };
      }
      acc[animal.especie].total++;
      if (animal.estado === 'Adotado') {
        acc[animal.especie].adotados++;
      }
      return acc;
    }, {} as Record<string, { total: number; adotados: number }>);

    return Object.entries(especies).map(([especie, dados]) => ({
      especie,
      count: dados.total,
      adotados: dados.adotados
    }));
  };

  const calcularIntervencoesPorTipo = (intervencoes: Intervencao[]) => {
    const tipos = intervencoes.reduce((acc, intervencao) => {
      const tipo = intervencao.tipo_intervencao?.nome || 'Não especificado';
      if (!acc[tipo]) {
        acc[tipo] = { count: 0, custo: 0 };
      }
      acc[tipo].count++;
      acc[tipo].custo += intervencao.custo || 0;
      return acc;
    }, {} as Record<string, { count: number; custo: number }>);

    return Object.entries(tipos).map(([tipo, dados]) => ({
      tipo,
      count: dados.count,
      custo: dados.custo
    })).sort((a, b) => b.count - a.count);
  };

  const calcularVoluntariosPorEspecialidade = (voluntarios: Voluntario[]) => {
    const especialidades = voluntarios.reduce((acc, voluntario) => {
      if (!acc[voluntario.especialidade]) {
        acc[voluntario.especialidade] = { total: 0, ativo: 0 };
      }
      acc[voluntario.especialidade].total++;
      if (voluntario.ativo) {
        acc[voluntario.especialidade].ativo++;
      }
      return acc;
    }, {} as Record<string, { total: number; ativo: number }>);

    return Object.entries(especialidades).map(([especialidade, dados]) => ({
      especialidade,
      count: dados.total,
      ativo: dados.ativo
    }));
  };

  const calcularCustoMedioPorAnimal = (movimentos: MovimentoFinanceiro[], animais: Animal[]) => {
    const totalDespesas = movimentos.filter(m => m.tipo_movimento === 'Despesa').reduce((sum, m) => sum + m.valor, 0);
    return animais.length > 0 ? totalDespesas / animais.length : 0;
  };

  const calcularTempoMedioAdocao = (animaisAdotados: Animal[]) => {
    if (animaisAdotados.length === 0) return 0;
    
    const tempos = animaisAdotados.map(animal => {
      const entrada = new Date(animal.data_entrada);
      const adocao = new Date(animal.updated_at);
      return Math.floor((adocao.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
    });
    
    return tempos.reduce((sum, tempo) => sum + tempo, 0) / tempos.length;
  };

  const calcularCrescimentoMensal = (animais: Animal[]) => {
    const mesAtual = new Date();
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    
    const animaisMesAtual = animais.filter(a => {
      const data = new Date(a.data_entrada);
      return data.getMonth() === mesAtual.getMonth() && data.getFullYear() === mesAtual.getFullYear();
    }).length;
    
    const animaisMesAnterior = animais.filter(a => {
      const data = new Date(a.data_entrada);
      return data.getMonth() === mesAnterior.getMonth() && data.getFullYear() === mesAnterior.getFullYear();
    }).length;
    
    return animaisMesAnterior > 0 ? ((animaisMesAtual - animaisMesAnterior) / animaisMesAnterior) * 100 : 0;
  };

  const calcularEficienciaAdocao = (animais: Animal[]) => {
    const totalAnimais = animais.filter(a => !a.arquivado).length;
    const animaisAdotados = animais.filter(a => a.estado === 'Adotado').length;
    return totalAnimais > 0 ? (animaisAdotados / totalAnimais) * 100 : 0;
  };

  const exportarDados = () => {
    if (!stats) return;
    
    const dados = {
      dataExportacao: new Date().toISOString(),
      estatisticas: stats,
      filtros: { ano: filtroAno, mes: filtroMes }
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-valentao-resgate-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">A carregar relatórios avançados...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Erro ao carregar relatórios.</p>
          <Button onClick={fetchRelatoriosAvancados} className="mt-4">
            Tentar Novamente
          </Button>
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
            <h1 className="text-3xl font-bold">Relatórios Avançados - Valentão ao Resgate</h1>
            <p className="text-muted-foreground">
              Análises detalhadas e tendências da associação
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportarDados} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Voltar</Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Ano</label>
              <Select value={filtroAno} onValueChange={setFiltroAno}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Mês</label>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {Array.from({length: 12}, (_, i) => {
                    const mes = new Date(2024, i, 1).toLocaleDateString('pt-PT', { month: 'long' });
                    return (
                      <SelectItem key={i} value={i.toString()}>
                        {mes.charAt(0).toUpperCase() + mes.slice(1)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Animais</p>
                <p className="text-2xl font-bold">{stats.totalAnimais}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.crescimentoMensal >= 0 ? '+' : ''}{stats.crescimentoMensal.toFixed(1)}% este mês
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
                <p className="text-sm font-medium text-muted-foreground">Taxa de Adoção</p>
                <p className="text-2xl font-bold">{stats.eficienciaAdocao.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.animaisAdotados} de {stats.totalAnimais} animais
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Médio/Animal</p>
                <p className="text-2xl font-bold">€{stats.custoMedioPorAnimal.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">
                  Por animal registado
                </p>
              </div>
              <Euro className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio Adoção</p>
                <p className="text-2xl font-bold">{Math.round(stats.tempoMedioAdocao)}</p>
                <p className="text-xs text-muted-foreground">
                  dias até adoção
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="especies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="especies">Por Espécie</TabsTrigger>
          <TabsTrigger value="intervencoes">Intervenções</TabsTrigger>
          <TabsTrigger value="voluntarios">Voluntários</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="especies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Análise por Espécie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.animaisPorEspecie.map((item) => (
                  <div key={item.especie} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{item.especie}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {item.count} total • {item.adotados} adotados ({((item.adotados / item.count) * 100).toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / stats.totalAnimais) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intervencoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Intervenções por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.intervencoesPorTipo.slice(0, 10).map((item) => (
                  <div key={item.tipo} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.tipo}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.count} intervenções
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{item.custo.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        €{(item.custo / item.count).toFixed(2)} média
                      </p>
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
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Voluntários por Especialidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.voluntariosPorEspecialidade.map((item) => (
                  <div key={item.especialidade} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.especialidade}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.ativo} ativos de {item.count} total
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(item.ativo / item.count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {((item.ativo / item.count) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tendencias">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Adoções por Mês (Últimos 12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.adocoesPorMes.map((item) => (
                    <div key={item.mes} className="flex items-center justify-between">
                      <span className="text-sm">{item.mes}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max((item.count / Math.max(...stats.adocoesPorMes.map(m => m.count))) * 100, 5)}%` 
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

            <Card>
              <CardHeader>
                <CardTitle>Movimentos Financeiros por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.movimentosPorMes.map((item) => (
                    <div key={item.mes} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.mes}</span>
                        <span className={`font-bold ${(item.receitas - item.despesas) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{(item.receitas - item.despesas).toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Receitas:</span>
                          <span className="text-green-600">€{item.receitas.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Despesas:</span>
                          <span className="text-red-600">€{item.despesas.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelatoriosAvancados;