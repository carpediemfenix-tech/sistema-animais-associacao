import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Euro,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Building,
  PawPrint,
  Stethoscope
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LayoutRelatorio from "@/components/LayoutRelatorio";

interface RelatorioFinanceiroProps {
  data: any;
  filtroAno: number;
  filtroMes: number;
}

const RelatorioFinanceiro = ({ data, filtroAno, filtroMes }: RelatorioFinanceiroProps) => {
  const [estatisticasFinanceiras, setEstatisticasFinanceiras] = useState<any>(null);

  useEffect(() => {
    if (data) {
      calcularEstatisticasFinanceiras();
    }
  }, [data, filtroAno, filtroMes]);

  const calcularEstatisticasFinanceiras = () => {
    console.log('💰 [FINANCEIRO] Iniciando cálculo com dados:', {
      movimentos: data?.movimentos?.length || 0,
      intervencoes: data?.intervencoes?.length || 0,
      filtroAno,
      filtroMes
    });

    if (!data) {
      console.log('⚠️ [FINANCEIRO] Nenhum dado fornecido');
      return;
    }
    
    if (!data.movimentos && !data.intervencoes) {
      console.log('⚠️ [FINANCEIRO] Sem movimentos nem intervenções');
      setEstatisticasFinanceiras({
        receitas: 0,
        despesas: 0,
        custosIntervencoes: 0,
        saldoTotal: 0,
        receitasPorCategoria: {},
        despesasPorCategoria: {},
        custosPorClinica: {},
        top10AnimaisCustos: [],
        analiseMenual: []
      });
      return;
    }

    let movimentosFiltrados = data.movimentos || [];
    let intervencoesFiltradas = data.intervencoes || [];

    // Aplicar filtros de período
    if (filtroAno && filtroAno !== 0) {
      movimentosFiltrados = movimentosFiltrados.filter((m: any) => 
        new Date(m.data_movimento).getFullYear() === filtroAno
      );
      intervencoesFiltradas = intervencoesFiltradas.filter((i: any) => 
        new Date(i.data_intervencao).getFullYear() === filtroAno
      );
    }

    if (filtroMes && filtroMes !== 0) {
      movimentosFiltrados = movimentosFiltrados.filter((m: any) => 
        new Date(m.data_movimento).getMonth() + 1 === filtroMes
      );
      intervencoesFiltradas = intervencoesFiltradas.filter((i: any) => 
        new Date(i.data_intervencao).getMonth() + 1 === filtroMes
      );
    }

    // Calcular totais
    const receitas = movimentosFiltrados
      .filter((m: any) => m.tipo_movimento === 'Receita')
      .reduce((sum: number, m: any) => sum + (m.valor || 0), 0);

    const despesas = movimentosFiltrados
      .filter((m: any) => m.tipo_movimento === 'Despesa')
      .reduce((sum: number, m: any) => sum + (m.valor || 0), 0);

    const custosIntervencoes = intervencoesFiltradas
      .reduce((sum: number, i: any) => sum + (i.custo || 0), 0);

    const saldoTotal = receitas - despesas;

    console.log('📊 [FINANCEIRO] Totais calculados:', {
      receitas,
      despesas,
      custosIntervencoes,
      saldoTotal,
      movimentosFiltrados: movimentosFiltrados.length,
      intervencoesFiltradas: intervencoesFiltradas.length
    });

    // Análise por categoria
    const receitasPorCategoria = movimentosFiltrados
      .filter((m: any) => m.tipo_movimento === 'Receita')
      .reduce((acc: any, m: any) => {
        acc[m.categoria] = (acc[m.categoria] || 0) + (m.valor || 0);
        return acc;
      }, {});

    const despesasPorCategoria = movimentosFiltrados
      .filter((m: any) => m.tipo_movimento === 'Despesa')
      .reduce((acc: any, m: any) => {
        acc[m.categoria] = (acc[m.categoria] || 0) + (m.valor || 0);
        return acc;
      }, {});

    // Análise por clínica
    const custosPorClinica = intervencoesFiltradas
      .filter((i: any) => i.clinica && i.custo)
      .reduce((acc: any, i: any) => {
        acc[i.clinica] = (acc[i.clinica] || 0) + (i.custo || 0);
        return acc;
      }, {});

    // Análise por animal (top 10 mais caros)
    const custosPorAnimal = intervencoesFiltradas
      .reduce((acc: any, i: any) => {
        const animal = data.animais.find((a: any) => a.id === i.animal_id);
        if (animal && i.custo) {
          const key = `${animal.nome} (${animal.numero_processo})`;
          acc[key] = (acc[key] || 0) + (i.custo || 0);
        }
        return acc;
      }, {});

    const top10AnimaisCustos = Object.entries(custosPorAnimal)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10);

    // Análise mensal (últimos 12 meses)
    const analiseMenual = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;

      const movimentosMes = data.movimentos.filter((m: any) => {
        const dataMovimento = new Date(m.data_movimento);
        return dataMovimento.getFullYear() === ano && dataMovimento.getMonth() + 1 === mes;
      });

      const receitasMes = movimentosMes
        .filter((m: any) => m.tipo_movimento === 'Receita')
        .reduce((sum: number, m: any) => sum + (m.valor || 0), 0);

      const despesasMes = movimentosMes
        .filter((m: any) => m.tipo_movimento === 'Despesa')
        .reduce((sum: number, m: any) => sum + (m.valor || 0), 0);

      analiseMenual.push({
        periodo: `${mes.toString().padStart(2, '0')}/${ano}`,
        receitas: receitasMes,
        despesas: despesasMes,
        saldo: receitasMes - despesasMes
      });
    }

    setEstatisticasFinanceiras({
      receitas,
      despesas,
      custosIntervencoes,
      saldoTotal,
      receitasPorCategoria,
      despesasPorCategoria,
      custosPorClinica,
      top10AnimaisCustos,
      analiseMenual
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  if (!estatisticasFinanceiras) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Euro className="h-12 w-12 animate-pulse mx-auto mb-4 text-green-500" />
          <p className="text-gray-600">A calcular estatísticas financeiras...</p>
        </div>
      </div>
    );
  }

  // Verificar se há dados para mostrar
  const temDados = estatisticasFinanceiras.receitas > 0 || 
                   estatisticasFinanceiras.despesas > 0 || 
                   estatisticasFinanceiras.custosIntervencoes > 0;

  if (!temDados) {
    return (
      <LayoutRelatorio
        titulo="Relatório Financeiro"
        subtitulo="Nenhum dado financeiro encontrado para o período selecionado"
        tipoRelatorio="Relatório Financeiro Executivo"
        periodo={filtroAno && filtroAno !== 0 
          ? (filtroMes && filtroMes !== 0 
              ? `${new Date(2024, filtroMes - 1).toLocaleDateString('pt-PT', { month: 'long' })} de ${filtroAno}`
              : `Ano ${filtroAno}`)
          : 'Todos os períodos'}
        dadosEstatisticos={{ totalRegistros: 0, periodoAnalise: 'Sem dados' }}
      >
        <div className="text-center py-12">
          <Euro className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Sem Dados Financeiros</h3>
          <p className="text-gray-500 mb-4">
            Não foram encontrados movimentos financeiros ou custos de intervenções para o período selecionado.
          </p>
          <p className="text-sm text-gray-400">
            Experimente alterar os filtros ou verificar se existem dados registados no sistema.
          </p>
        </div>
      </LayoutRelatorio>
    );
  }

  const periodoTexto = filtroAno && filtroAno !== 0 
    ? (filtroMes && filtroMes !== 0 
        ? `${new Date(2024, filtroMes - 1).toLocaleDateString('pt-PT', { month: 'long' })} de ${filtroAno}`
        : `Ano ${filtroAno}`)
    : 'Todos os períodos';

  const dadosEstatisticos = {
    totalRegistros: (estatisticasFinanceiras.receitas + estatisticasFinanceiras.despesas) > 0 
      ? Object.keys(estatisticasFinanceiras.receitasPorCategoria).length + Object.keys(estatisticasFinanceiras.despesasPorCategoria).length
      : 0,
    periodoAnalise: periodoTexto
  };

  return (
    <LayoutRelatorio
      titulo="Relatório Financeiro"
      subtitulo="Análise detalhada de receitas, despesas e custos operacionais"
      tipoRelatorio="Relatório Financeiro Executivo"
      periodo={periodoTexto}
      dadosEstatisticos={dadosEstatisticos}
    >
      <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estatisticasFinanceiras.receitas)}
            </div>
            <div className="text-sm text-green-700">Receitas Totais</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(estatisticasFinanceiras.despesas)}
            </div>
            <div className="text-sm text-red-700">Despesas Totais</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(estatisticasFinanceiras.custosIntervencoes)}
            </div>
            <div className="text-sm text-blue-700">Custos Médicos</div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br border-2 ${
          estatisticasFinanceiras.saldoTotal >= 0 
            ? 'from-emerald-50 to-green-50 border-emerald-200' 
            : 'from-orange-50 to-red-50 border-orange-200'
        }`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Euro className={`h-8 w-8 ${
                estatisticasFinanceiras.saldoTotal >= 0 ? 'text-emerald-600' : 'text-orange-600'
              }`} />
            </div>
            <div className={`text-2xl font-bold ${
              estatisticasFinanceiras.saldoTotal >= 0 ? 'text-emerald-600' : 'text-orange-600'
            }`}>
              {formatCurrency(estatisticasFinanceiras.saldoTotal)}
            </div>
            <div className={`text-sm ${
              estatisticasFinanceiras.saldoTotal >= 0 ? 'text-emerald-700' : 'text-orange-700'
            }`}>
              Saldo {estatisticasFinanceiras.saldoTotal >= 0 ? 'Positivo' : 'Negativo'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-green-600" />
              <span>Receitas por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticasFinanceiras.receitasPorCategoria).map(([categoria, valor]) => (
                <div key={categoria} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{categoria}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${((valor as number) / estatisticasFinanceiras.receitas) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(valor as number)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-red-600" />
              <span>Despesas por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticasFinanceiras.despesasPorCategoria).map(([categoria, valor]) => (
                <div key={categoria} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{categoria}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: `${((valor as number) / estatisticasFinanceiras.despesas) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(valor as number)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custos por Clínica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-indigo-600" />
            <span>Custos por Clínica Veterinária</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clínica</TableHead>
                  <TableHead>Custo Total</TableHead>
                  <TableHead>% do Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(estatisticasFinanceiras.custosPorClinica)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([clinica, custo]) => (
                    <TableRow key={clinica}>
                      <TableCell className="font-medium">{clinica}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(custo as number)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(((custo as number) / estatisticasFinanceiras.custosIntervencoes) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Animais Mais Caros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PawPrint className="h-5 w-5 text-orange-600" />
            <span>Top 10 Animais com Maiores Custos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estatisticasFinanceiras.top10AnimaisCustos.map(([animal, custo], index) => (
              <div key={animal} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{animal}</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(custo as number)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Evolução Mensal (Últimos 12 Meses)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Receitas</TableHead>
                  <TableHead>Despesas</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Tendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estatisticasFinanceiras.analiseMenual.map((mes: any, index: number) => {
                  const mesAnterior = index > 0 ? estatisticasFinanceiras.analiseMenual[index - 1] : null;
                  const tendencia = mesAnterior ? mes.saldo - mesAnterior.saldo : 0;
                  
                  return (
                    <TableRow key={mes.periodo}>
                      <TableCell className="font-medium">{mes.periodo}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(mes.receitas)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(mes.despesas)}</TableCell>
                      <TableCell className={`font-semibold ${
                        mes.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(mes.saldo)}
                      </TableCell>
                      <TableCell>
                        {mesAnterior && (
                          <div className="flex items-center space-x-1">
                            {tendencia > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : tendencia < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : (
                              <div className="h-4 w-4" />
                            )}
                            <span className={`text-sm ${
                              tendencia > 0 ? 'text-green-600' : 
                              tendencia < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {tendencia !== 0 ? formatCurrency(Math.abs(tendencia)) : 'Estável'}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </LayoutRelatorio>
  );
};

export default RelatorioFinanceiro;