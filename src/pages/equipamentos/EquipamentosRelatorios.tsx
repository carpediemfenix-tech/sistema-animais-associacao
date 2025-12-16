import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft,
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  Loader2,
  PieChart,
  DollarSign,
  Users,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface KpisDashboard {
  equipamentos?: {
    total: number;
    disponiveis: number;
    em_uso: number;
    manutencao: number;
    taxa_utilizacao: number;
  };
  financeiro?: {
    valor_total_inventario: number;
    custo_mensal_manutencoes: number;
    equipamentos_mais_custosos: number;
  };
  alertas?: {
    total_ativos: number;
    criticos: number;
    altas: number;
    medias: number;
  };
  manutencoes?: {
    agendadas: number;
    em_andamento: number;
    concluidas_mes: number;
    custo_medio: number;
  };
}

const EquipamentosRelatorios: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [kpisDashboard, setKpisDashboard] = useState<KpisDashboard>({});
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState('');
  const [dadosRelatorio, setDadosRelatorio] = useState<any[]>([]);

  const loadKpisDashboard = async () => {
    try {
      setLoading(true);
      
      // Carregar equipamentos
      const { data: equipamentos, error: equipamentosError } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .select('*');

      if (equipamentosError) throw equipamentosError;

      // Carregar alertas
      const { data: alertas, error: alertasError } = await supabase
        .from('alertas_equipamentos_2025_12_16_07_00')
        .select('*')
        .eq('status', 'ativo');

      if (alertasError) throw alertasError;

      // Carregar manutenções
      const { data: manutencoes, error: manutencoesError } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .select('*');

      if (manutencoesError) throw manutencoesError;

      // Calcular KPIs
      const kpis: KpisDashboard = {
        equipamentos: {
          total: equipamentos?.length || 0,
          disponiveis: equipamentos?.filter(e => e.estado === 'disponivel').length || 0,
          em_uso: equipamentos?.filter(e => e.estado === 'em_uso').length || 0,
          manutencao: equipamentos?.filter(e => e.estado === 'manutencao').length || 0,
          taxa_utilizacao: equipamentos?.length ? 
            ((equipamentos.filter(e => e.estado === 'em_uso').length / equipamentos.length) * 100) : 0
        },
        financeiro: {
          valor_total_inventario: equipamentos?.reduce((sum, e) => sum + (e.valor_aquisicao || 0), 0) || 0,
          custo_mensal_manutencoes: manutencoes?.reduce((sum, m) => sum + (m.custo || 0), 0) || 0,
          equipamentos_mais_custosos: equipamentos?.filter(e => (e.valor_aquisicao || 0) > 1000).length || 0
        },
        alertas: {
          total_ativos: alertas?.length || 0,
          criticos: alertas?.filter(a => a.prioridade === 'critica').length || 0,
          altas: alertas?.filter(a => a.prioridade === 'alta').length || 0,
          medias: alertas?.filter(a => a.prioridade === 'media').length || 0
        },
        manutencoes: {
          agendadas: manutencoes?.filter(m => m.status === 'agendada').length || 0,
          em_andamento: manutencoes?.filter(m => m.status === 'em_andamento').length || 0,
          concluidas_mes: manutencoes?.filter(m => m.status === 'concluida').length || 0,
          custo_medio: manutencoes?.length ? 
            (manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0) / manutencoes.length) : 0
        }
      };

      setKpisDashboard(kpis);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKpisDashboard();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleExportarRelatorio = (tipo: string) => {
    toast({
      title: "Exportação iniciada",
      description: `Relatório de ${tipo} será exportado em breve`,
    });
  };

  const handleVisualizarRelatorio = async (tipo: string) => {
    try {
      setLoading(true);
      let dados: any[] = [];
      
      switch (tipo) {
        case 'Utilização por Voluntário':
          const { data: atribuicoes } = await supabase
            .from('atribuicoes_equipamentos_2025_12_13_01_00')
            .select(`
              *,
              equipamento:equipamentos_2025_12_13_01_00(codigo_interno, tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome))
            `)
            .eq('ativo', true);
          dados = atribuicoes || [];
          break;
          
        case 'Financeiro':
          const { data: equipamentos } = await supabase
            .from('equipamentos_2025_12_13_01_00')
            .select(`
              codigo_interno,
              valor_aquisicao,
              data_aquisicao,
              tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome)
            `)
            .eq('ativo', true);
          dados = equipamentos || [];
          break;
          
        case 'Manutenções':
          const { data: manutencoes } = await supabase
            .from('manutencoes_equipamentos_2025_12_13_01_00')
            .select(`
              *,
              equipamento:equipamentos_2025_12_13_01_00(codigo_interno, tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome))
            `);
          dados = manutencoes || [];
          break;
          
        case 'Alertas':
          const { data: alertas } = await supabase
            .from('alertas_equipamentos_2025_12_13_01_00')
            .select(`
              *,
              equipamento:equipamentos_2025_12_13_01_00(codigo_interno, tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome))
            `)
            .eq('ativo', true);
          dados = alertas || [];
          break;
          
        case 'Atribuições':
          const { data: todasAtribuicoes } = await supabase
            .from('atribuicoes_equipamentos_2025_12_13_01_00')
            .select(`
              *,
              equipamento:equipamentos_2025_12_13_01_00(codigo_interno, tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome))
            `);
          dados = todasAtribuicoes || [];
          break;
          
        case 'Inventário Completo':
          const { data: inventario } = await supabase
            .from('equipamentos_2025_12_13_01_00')
            .select(`
              *,
              tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome)
            `);
          dados = inventario || [];
          break;
      }
      
      setDadosRelatorio(dados);
      setTipoRelatorio(tipo);
      setShowRelatorio(true);
      
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do relatório",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link to="/equipamentos">
                <Button variant="outline" size="sm" onClick={() => handleVisualizarRelatorio('Financeiro')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
                <p className="text-gray-600">Dashboard avançado e relatórios executivos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadKpisDashboard} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Tudo
              </Button>
            </div>
          </div>

          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Equipamentos</CardTitle>
                <BarChart3 className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpisDashboard.equipamentos?.total || 0}</div>
                <p className="text-xs opacity-80">
                  Taxa de Utilização: {formatPercentage(kpisDashboard.equipamentos?.taxa_utilizacao || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Inventário</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(kpisDashboard.financeiro?.valor_total_inventario || 0)}
                </div>
                <p className="text-xs opacity-80">
                  Custo Mensal: {formatCurrency(kpisDashboard.financeiro?.custo_mensal_manutencoes || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <Activity className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpisDashboard.alertas?.total_ativos || 0}</div>
                <p className="text-xs opacity-80">
                  Críticos: {kpisDashboard.alertas?.criticos || 0} | Altos: {kpisDashboard.alertas?.altas || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpisDashboard.manutencoes?.agendadas || 0}</div>
                <p className="text-xs opacity-80">
                  Agendadas + {kpisDashboard.manutencoes?.em_andamento || 0} em andamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Relatórios Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-600">
                  <Users className="h-5 w-5 mr-2" />
                  Utilização por Voluntário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Análise detalhada de utilização de equipamentos por voluntário
                </p>
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVisualizarRelatorio('Utilização por Voluntário')}
                  >
                    
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportarRelatorio('voluntarios')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Relatório Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Análise de custos, ROI e investimentos em equipamentos
                </p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleVisualizarRelatorio('Financeiro')}>
                    
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportarRelatorio('financeiro')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-600">
                  <Activity className="h-5 w-5 mr-2" />
                  Análise de Manutenções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Tendências e eficiência das manutenções por período
                </p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleVisualizarRelatorio('Manutenções')}>
                    
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportarRelatorio('manutencoes')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <Activity className="h-5 w-5 mr-2" />
                  Análise de Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Padrões de alertas e tempo de resolução
                </p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleVisualizarRelatorio('Alertas')}>
                    
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportarRelatorio('alertas')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Análise de Atribuições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Tendências de uso e padrões de atribuições
                </p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleVisualizarRelatorio('Atribuições')}>
                    
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportarRelatorio('atribuicoes')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-600">
                  <PieChart className="h-5 w-5 mr-2" />
                  Dashboard Executivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Visão executiva completa com todos os KPIs
                </p>
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleVisualizarRelatorio('Inventário Completo')}>
                    
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportarRelatorio('executivo')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Resumo de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {formatPercentage(kpisDashboard.equipamentos?.taxa_utilizacao || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Taxa de Utilização</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {kpisDashboard.manutencoes?.concluidas_mes || 0}
                  </div>
                  <p className="text-sm text-gray-600">Manutenções Concluídas</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatCurrency(kpisDashboard.manutencoes?.custo_medio || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Custo Médio Manutenção</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de Visualização de Relatório */}
      <Dialog open={showRelatorio} onOpenChange={setShowRelatorio}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório: {tipoRelatorio}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dadosRelatorio.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tipoRelatorio === 'Utilização por Voluntário' && (
                        <>
                          <TableHead>Voluntário ID</TableHead>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Data Atribuição</TableHead>
                          <TableHead>Data Devolução</TableHead>
                          <TableHead>Estado</TableHead>
                        </>
                      )}
                      {tipoRelatorio === 'Financeiro' && (
                        <>
                          <TableHead>Código</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Valor Aquisição</TableHead>
                          <TableHead>Data Aquisição</TableHead>
                        </>
                      )}
                      {tipoRelatorio === 'Manutenções' && (
                        <>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Tipo Manutenção</TableHead>
                          <TableHead>Data Agendada</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Custo</TableHead>
                        </>
                      )}
                      {tipoRelatorio === 'Alertas' && (
                        <>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Tipo Alerta</TableHead>
                          <TableHead>Prioridade</TableHead>
                          <TableHead>Data Criação</TableHead>
                          <TableHead>Status</TableHead>
                        </>
                      )}
                      {tipoRelatorio === 'Atribuições' && (
                        <>
                          <TableHead>Equipamento</TableHead>
                          <TableHead>Voluntário ID</TableHead>
                          <TableHead>Data Atribuição</TableHead>
                          <TableHead>Data Devolução</TableHead>
                          <TableHead>Estado</TableHead>
                        </>
                      )}
                      {tipoRelatorio === 'Inventário Completo' && (
                        <>
                          <TableHead>Código</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Condição</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Valor</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosRelatorio.slice(0, 50).map((item, index) => (
                      <TableRow key={index}>
                        {tipoRelatorio === 'Utilização por Voluntário' && (
                          <>
                            <TableCell>{item.voluntario_id}</TableCell>
                            <TableCell>{item.equipamento?.codigo_interno || 'N/A'}</TableCell>
                            <TableCell>{new Date(item.data_atribuicao).toLocaleDateString()}</TableCell>
                            <TableCell>{item.data_devolucao_real ? new Date(item.data_devolucao_real).toLocaleDateString() : 'Pendente'}</TableCell>
                            <TableCell>
                              <Badge className={item.estado === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {item.estado}
                              </Badge>
                            </TableCell>
                          </>
                        )}
                        {tipoRelatorio === 'Financeiro' && (
                          <>
                            <TableCell>{item.codigo_interno}</TableCell>
                            <TableCell>{item.tipo_equipamento?.nome || 'N/A'}</TableCell>
                            <TableCell>€{item.valor_aquisicao?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>{item.data_aquisicao ? new Date(item.data_aquisicao).toLocaleDateString() : 'N/A'}</TableCell>
                          </>
                        )}
                        {tipoRelatorio === 'Inventário Completo' && (
                          <>
                            <TableCell>{item.codigo_interno}</TableCell>
                            <TableCell>{item.tipo_equipamento?.nome || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className={item.estado === 'disponivel' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                {item.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={item.condicao === 'excelente' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                                {item.condicao}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.localizacao || 'N/A'}</TableCell>
                            <TableCell>€{item.valor_aquisicao?.toFixed(2) || '0.00'}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {dadosRelatorio.length > 50 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Mostrando primeiros 50 registros de {dadosRelatorio.length} total.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum dado encontrado para este relatório.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowRelatorio(false)}>
              Fechar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosRelatorios;