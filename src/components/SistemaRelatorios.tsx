import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  PawPrint,
  Stethoscope,
  DollarSign,
  MapPin,
  RefreshCw,
  Eye,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RelatorioData {
  animais: any[];
  intervencoes: any[];
  eventos: any[];
  voluntarios: any[];
  movimentos: any[];
  localizacoes: any[];
  tiposIntervencoes: any[];
}

const SistemaRelatorios = () => {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [tipoRelatorio, setTipoRelatorio] = useState('mensal');
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, [filtroMes, filtroAno]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('📊 [RELATÓRIOS] Carregando dados...');

      // Buscar todos os dados necessários
      const [
        { data: animais, error: animaisError },
        { data: intervencoes, error: intervencoesError },
        { data: eventos, error: eventosError },
        { data: voluntarios, error: voluntariosError },
        { data: movimentos, error: movimentosError },
        { data: localizacoes, error: localizacoesError },
        { data: tiposIntervencoes, error: tiposError }
      ] = await Promise.all([
        supabase.from('animais').select('*'),
        supabase.from('intervencoes').select('*'),
        supabase.from('eventos').select('*'),
        supabase.from('voluntarios').select('*'),
        supabase.from('movimentos_financeiros').select('*'),
        supabase.from('localizacoes').select('*'),
        supabase.from('tipos_intervencoes').select('*')
      ]);

      if (animaisError) throw animaisError;
      if (intervencoesError) throw intervencoesError;
      if (eventosError) throw eventosError;
      if (voluntariosError) throw voluntariosError;
      if (movimentosError) throw movimentosError;
      if (localizacoesError) throw localizacoesError;
      if (tiposError) throw tiposError;

      setData({
        animais: animais || [],
        intervencoes: intervencoes || [],
        eventos: eventos || [],
        voluntarios: voluntarios || [],
        movimentos: movimentos || [],
        localizacoes: localizacoes || [],
        tiposIntervencoes: tiposIntervencoes || []
      });

      console.log('✅ [RELATÓRIOS] Dados carregados com sucesso');

    } catch (error: any) {
      console.error('❌ [RELATÓRIOS] Erro ao carregar dados:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados dos relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioMensal = () => {
    if (!data) return null;

    const mesAtual = new Date(filtroAno, filtroMes - 1);
    const proximoMes = new Date(filtroAno, filtroMes);

    // Filtrar dados do mês
    const animaisDoMes = data.animais.filter(a => {
      const dataEntrada = new Date(a.data_entrada);
      return dataEntrada >= mesAtual && dataEntrada < proximoMes;
    });

    const intervencoesDoMes = data.intervencoes.filter(i => {
      const dataIntervencao = new Date(i.data_intervencao);
      return dataIntervencao >= mesAtual && dataIntervencao < proximoMes;
    });

    const eventosDoMes = data.eventos.filter(e => {
      const dataEvento = new Date(e.data_evento);
      return dataEvento >= mesAtual && dataEvento < proximoMes;
    });

    const movimentosDoMes = data.movimentos.filter(m => {
      const dataMovimento = new Date(m.data_movimento);
      return dataMovimento >= mesAtual && dataMovimento < proximoMes;
    });

    // Calcular estatísticas
    const totalAnimaisNovos = animaisDoMes.length;
    const totalIntervencoes = intervencoesDoMes.length;
    const totalEventos = eventosDoMes.length;
    
    const receitas = movimentosDoMes
      .filter(m => m.tipo_movimento === 'Receita')
      .reduce((sum, m) => sum + (m.valor || 0), 0);
    
    const despesas = movimentosDoMes
      .filter(m => m.tipo_movimento === 'Despesa')
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    const saldo = receitas - despesas;

    // Estatísticas por espécie
    const estatisticasEspecies = data.animais.reduce((acc: any, animal) => {
      const especie = animal.especie || 'Não especificado';
      acc[especie] = (acc[especie] || 0) + 1;
      return acc;
    }, {});

    // Estatísticas por estado
    const estatisticasEstados = data.animais.reduce((acc: any, animal) => {
      const estado = animal.estado || 'Não especificado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    return {
      periodo: `${mesAtual.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}`,
      totalAnimaisNovos,
      totalIntervencoes,
      totalEventos,
      receitas,
      despesas,
      saldo,
      estatisticasEspecies,
      estatisticasEstados,
      animaisDoMes,
      intervencoesDoMes,
      eventosDoMes,
      movimentosDoMes
    };
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const exportarPDF = () => {
    // Implementação futura para exportar PDF
    toast({
      title: "🚧 Em desenvolvimento",
      description: "A funcionalidade de exportar PDF será implementada em breve",
    });
  };

  const gerarFichaAnimal = (animalId: string) => {
    if (!data) return null;

    const animal = data.animais.find(a => a.id === animalId);
    if (!animal) return null;

    const intervencoesAnimal = data.intervencoes.filter(i => i.animal_id === animalId);
    const eventosAnimal = data.eventos.filter(e => e.animal_id === animalId);
    const localizacoesAnimal = data.localizacoes.filter(l => l.animal_id === animalId);

    return {
      animal,
      intervencoes: intervencoesAnimal,
      eventos: eventosAnimal,
      localizacoes: localizacoesAnimal
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const relatorioMensal = gerarRelatorioMensal();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-pulse mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">A carregar dados dos relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sistema de Relatórios</h2>
            <p className="text-sm text-gray-600">
              Relatórios detalhados e fichas para impressão
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={carregarDados} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={imprimirRelatorio} variant="outline" size="sm" className="no-print">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={exportarPDF} variant="outline" size="sm" className="no-print">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Relatório Mensal</SelectItem>
                  <SelectItem value="anual">Relatório Anual</SelectItem>
                  <SelectItem value="financeiro">Relatório Financeiro</SelectItem>
                  <SelectItem value="intervencoes">Relatório de Intervenções</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mes">Mês</Label>
              <Select value={filtroMes.toString()} onValueChange={(value) => setFiltroMes(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2024, i).toLocaleDateString('pt-PT', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ano">Ano</Label>
              <Select value={filtroAno.toString()} onValueChange={(value) => setFiltroAno(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={carregarDados} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatório Mensal */}
      {relatorioMensal && (
        <div className="print-section">
          {/* Cabeçalho do Relatório */}
          <Card className="mb-6">
            <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl">
                🐾 Relatório Mensal - Sistema Valentão
              </CardTitle>
              <CardDescription className="text-orange-100">
                {relatorioMensal.periodo}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Resumo Executivo */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Resumo Executivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <PawPrint className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">{relatorioMensal.totalAnimaisNovos}</div>
                  <div className="text-sm text-gray-600">Novos Animais</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{relatorioMensal.totalIntervencoes}</div>
                  <div className="text-sm text-gray-600">Intervenções</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">{relatorioMensal.totalEventos}</div>
                  <div className="text-sm text-gray-600">Eventos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(relatorioMensal.saldo)}</div>
                  <div className="text-sm text-gray-600">Saldo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Por Espécie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-orange-600" />
                  <span>Animais por Espécie</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(relatorioMensal.estatisticasEspecies).map(([especie, count]) => (
                    <div key={especie} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{especie}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Por Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Animais por Estado</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(relatorioMensal.estatisticasEstados).map(([estado, count]) => (
                    <div key={estado} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{estado}</span>
                      <Badge 
                        variant="outline"
                        className={
                          estado === 'Ativo' ? 'border-green-200 text-green-800' :
                          estado === 'Adotado' ? 'border-blue-200 text-blue-800' :
                          'border-gray-200 text-gray-800'
                        }
                      >
                        {count as number}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Financeiro */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Resumo Financeiro</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{formatCurrency(relatorioMensal.receitas)}</div>
                  <div className="text-sm text-gray-600">Receitas</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">{formatCurrency(relatorioMensal.despesas)}</div>
                  <div className="text-sm text-gray-600">Despesas</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${relatorioMensal.saldo >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <div className={`text-xl font-bold ${relatorioMensal.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {formatCurrency(relatorioMensal.saldo)}
                  </div>
                  <div className="text-sm text-gray-600">Saldo Final</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rodapé do Relatório */}
          <Card>
            <CardContent className="text-center p-6 text-sm text-gray-500">
              <p>Relatório gerado automaticamente pelo Sistema Valentão</p>
              <p>Data de geração: {new Date().toLocaleString('pt-PT')}</p>
              <p>🐾 Associação de Proteção Animal • Sistema de Gestão Integrado</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SistemaRelatorios;