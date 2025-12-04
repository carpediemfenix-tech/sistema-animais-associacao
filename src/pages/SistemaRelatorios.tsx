import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  PawPrint,
  DollarSign,
  Activity,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  FilePdf,
  FileJson,
  Send,
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/UserHeader";
import GeradorRelatorioAdocoes from "@/components/relatorios/GeradorRelatorioAdocoes";
import VisualizadorRelatorioAdocoes from "@/components/relatorios/VisualizadorRelatorioAdocoes";
import { 
  RelatorioConfig,
  RelatorioGerado,
  FiltrosRelatorio,
  TipoRelatorio,
  CategoriaRelatorio,
  FormatoExportacao,
  PeriodoPredefinido,
  PERIODOS_PREDEFINIDOS,
  calcularDatasPeriodo,
  RelatorioAnimaisAdocoes,
  EstatisticasRelatorio
} from "@/types/relatorios";

const SistemaRelatorios = () => {
  const [relatoriosDisponiveis, setRelatoriosDisponiveis] = useState<RelatorioConfig[]>([]);
  const [relatoriosGerados, setRelatoriosGerados] = useState<RelatorioGerado[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState<string | null>(null);
  
  // Estados para filtros
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaRelatorio | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  
  // Estados para geração de relatório
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<RelatorioConfig | null>(null);
  const [filtrosRelatorio, setFiltrosRelatorio] = useState<FiltrosRelatorio>({});
  const [formatoExportacao, setFormatoExportacao] = useState<FormatoExportacao>('pdf');
  const [dialogGeracao, setDialogGeracao] = useState(false);
  
  // Estados para dados do relatório gerado
  const [dadosRelatorioAdocoes, setDadosRelatorioAdocoes] = useState<RelatorioAnimaisAdocoes | null>(null);
  const [estatisticasRelatorio, setEstatisticasRelatorio] = useState<EstatisticasRelatorio | null>(null);
  const [mostrarVisualizacao, setMostrarVisualizacao] = useState(false);
  
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
              Apenas administradores podem aceder aos relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
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

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar configurações de relatórios (simulado por agora)
      const relatoriosConfig: RelatorioConfig[] = [
        {
          id: '1',
          nome: 'Relatório de Adoções',
          descricao: 'Análise completa das adoções realizadas no período',
          tipo: 'animais_adocoes',
          categoria: 'animais',
          template: 'adocoes_template',
          filtros_disponiveis: [
            { campo: 'periodo', nome: 'Período', tipo: 'periodo_predefinido', obrigatorio: true },
            { campo: 'especies', nome: 'Espécies', tipo: 'select_multiplo', obrigatorio: false }
          ],
          campos_obrigatorios: ['periodo'],
          formatos_exportacao: ['pdf', 'excel', 'csv'],
          agendamento_disponivel: true,
          icone: 'Heart',
          cor: '#10B981',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'Relatório de Intervenções Veterinárias',
          descricao: 'Detalhes das intervenções veterinárias e custos associados',
          tipo: 'animais_intervencoes',
          categoria: 'animais',
          template: 'intervencoes_template',
          filtros_disponiveis: [
            { campo: 'periodo', nome: 'Período', tipo: 'periodo_predefinido', obrigatorio: true },
            { campo: 'urgente', nome: 'Apenas Urgentes', tipo: 'boolean', obrigatorio: false }
          ],
          campos_obrigatorios: ['periodo'],
          formatos_exportacao: ['pdf', 'excel'],
          agendamento_disponivel: true,
          icone: 'Stethoscope',
          cor: '#EF4444',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          nome: 'Relatório de Formação de Voluntários',
          descricao: 'Progressão formativa e estatísticas dos voluntários',
          tipo: 'voluntarios_formacao',
          categoria: 'voluntarios',
          template: 'formacao_template',
          filtros_disponiveis: [
            { campo: 'periodo', nome: 'Período', tipo: 'periodo_predefinido', obrigatorio: true },
            { campo: 'nivel', nome: 'Nível de Formação', tipo: 'select_simples', obrigatorio: false }
          ],
          campos_obrigatorios: ['periodo'],
          formatos_exportacao: ['pdf', 'excel'],
          agendamento_disponivel: true,
          icone: 'GraduationCap',
          cor: '#8B5CF6',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          nome: 'Balanço Financeiro',
          descricao: 'Análise completa das receitas, despesas e saldo',
          tipo: 'financeiro_balanco',
          categoria: 'financeiro',
          template: 'balanco_template',
          filtros_disponiveis: [
            { campo: 'periodo', nome: 'Período', tipo: 'periodo_predefinido', obrigatorio: true },
            { campo: 'categorias', nome: 'Categorias', tipo: 'select_multiplo', obrigatorio: false }
          ],
          campos_obrigatorios: ['periodo'],
          formatos_exportacao: ['pdf', 'excel', 'csv'],
          agendamento_disponivel: true,
          icone: 'DollarSign',
          cor: '#F59E0B',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          nome: 'Dashboard Executivo',
          descricao: 'KPIs e métricas principais da associação',
          tipo: 'executivo_kpis',
          categoria: 'executivo',
          template: 'executivo_template',
          filtros_disponiveis: [
            { campo: 'periodo', nome: 'Período', tipo: 'periodo_predefinido', obrigatorio: true }
          ],
          campos_obrigatorios: ['periodo'],
          formatos_exportacao: ['pdf'],
          agendamento_disponivel: true,
          icone: 'BarChart3',
          cor: '#6366F1',
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setRelatoriosDisponiveis(relatoriosConfig);
      
      // Carregar relatórios gerados recentes (simulado)
      const relatoriosRecentesSimulados: RelatorioGerado[] = [
        {
          id: '1',
          config_id: '1',
          nome: 'Adoções - Novembro 2024',
          filtros_aplicados: { periodo: 'mes_passado' },
          formato: 'pdf',
          dados: {},
          estatisticas: {
            total_registos: 15,
            periodo_analisado: {
              inicio: '2024-11-01',
              fim: '2024-11-30',
              dias: 30
            }
          },
          status: 'concluido',
          data_geracao: new Date().toISOString(),
          gerado_por: 'admin',
          created_at: new Date().toISOString()
        }
      ];

      setRelatoriosGerados(relatoriosRecentesSimulados);

    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro ao Carregar",
        description: error.message || "Erro ao carregar dados dos relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaIcon = (categoria: CategoriaRelatorio) => {
    switch (categoria) {
      case 'animais': return PawPrint;
      case 'voluntarios': return Users;
      case 'financeiro': return DollarSign;
      case 'operacional': return Activity;
      case 'executivo': return BarChart3;
      default: return FileText;
    }
  };

  const getCategoriaColor = (categoria: CategoriaRelatorio) => {
    switch (categoria) {
      case 'animais': return '#10B981';
      case 'voluntarios': return '#8B5CF6';
      case 'financeiro': return '#F59E0B';
      case 'operacional': return '#3B82F6';
      case 'executivo': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getFormatoIcon = (formato: FormatoExportacao) => {
    switch (formato) {
      case 'pdf': return FilePdf;
      case 'excel': return FileSpreadsheet;
      case 'csv': return FileSpreadsheet;
      case 'json': return FileJson;
      default: return FileText;
    }
  };

  const handleDadosGerados = (dados: RelatorioAnimaisAdocoes, estatisticas: EstatisticasRelatorio) => {
    setDadosRelatorioAdocoes(dados);
    setEstatisticasRelatorio(estatisticas);
    setMostrarVisualizacao(true);
    setGerando(null);
    setDialogGeracao(false);
    
    toast({
      title: "Relatório Gerado",
      description: `Relatório de adoções gerado com sucesso! ${dados.total_adocoes} adoções encontradas.`,
    });
  };

  const handleGerarRelatorio = async () => {
    if (!relatorioSelecionado) return;

    try {
      setGerando(relatorioSelecionado.id);

      // Para relatório de adoções, usar o gerador específico
      if (relatorioSelecionado.tipo === 'animais_adocoes') {
        // O gerador será chamado automaticamente
        return;
      }

      // Para outros tipos de relatório, usar simulação por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000));

      const novoRelatorio: RelatorioGerado = {
        id: Date.now().toString(),
        config_id: relatorioSelecionado.id,
        nome: `${relatorioSelecionado.nome} - ${new Date().toLocaleDateString('pt-PT')}`,
        filtros_aplicados: filtrosRelatorio,
        formato: formatoExportacao,
        dados: {},
        estatisticas: {
          total_registos: Math.floor(Math.random() * 100) + 10,
          periodo_analisado: {
            inicio: filtrosRelatorio.data_inicio || '2024-01-01',
            fim: filtrosRelatorio.data_fim || new Date().toISOString().split('T')[0],
            dias: 30
          }
        },
        status: 'concluido',
        data_geracao: new Date().toISOString(),
        gerado_por: 'admin',
        created_at: new Date().toISOString()
      };

      setRelatoriosGerados(prev => [novoRelatorio, ...prev]);
      setDialogGeracao(false);
      setRelatorioSelecionado(null);
      setFiltrosRelatorio({});

      toast({
        title: "Relatório Gerado",
        description: `${relatorioSelecionado.nome} foi gerado com sucesso!`,
      });

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao Gerar",
        description: error.message || "Erro ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setGerando(null);
    }
  };

  const abrirDialogGeracao = (relatorio: RelatorioConfig) => {
    setRelatorioSelecionado(relatorio);
    
    // Definir filtros padrão
    const filtrosPadrao: FiltrosRelatorio = {};
    
    // Se tem filtro de período obrigatório, definir padrão
    const filtroPeriodo = relatorio.filtros_disponiveis.find(f => f.campo === 'periodo');
    if (filtroPeriodo) {
      filtrosPadrao.periodo = 'ultimos_30_dias';
      const datas = calcularDatasPeriodo('ultimos_30_dias');
      filtrosPadrao.data_inicio = datas.inicio;
      filtrosPadrao.data_fim = datas.fim;
    }
    
    setFiltrosRelatorio(filtrosPadrao);
    setFormatoExportacao(relatorio.formatos_exportacao[0]);
    setDialogGeracao(true);
  };

  const handlePeriodoChange = (periodo: PeriodoPredefinido) => {
    const datas = calcularDatasPeriodo(periodo);
    setFiltrosRelatorio(prev => ({
      ...prev,
      periodo,
      data_inicio: datas.inicio,
      data_fim: datas.fim
    }));
  };

  // Filtrar relatórios disponíveis
  const relatoriosFiltrados = relatoriosDisponiveis.filter(relatorio => {
    const matchCategoria = filtroCategoria === 'todos' || relatorio.categoria === filtroCategoria;
    const matchBusca = relatorio.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      relatorio.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <UserHeader />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando sistema de relatórios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <UserHeader />
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Sistema de Relatórios Avançados
              </h1>
              <p className="text-gray-600">
                Geração automática de relatórios e análises
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Relatórios Disponíveis</p>
                  <p className="text-2xl font-bold">{relatoriosDisponiveis.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Gerados Hoje</p>
                  <p className="text-2xl font-bold">
                    {relatoriosGerados.filter(r => 
                      new Date(r.data_geracao).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Em Processamento</p>
                  <p className="text-2xl font-bold">
                    {relatoriosGerados.filter(r => r.status === 'gerando').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Gerados</p>
                  <p className="text-2xl font-bold">{relatoriosGerados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar relatórios..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={filtroCategoria} onValueChange={(value: any) => setFiltroCategoria(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Categorias</SelectItem>
                  <SelectItem value="animais">Animais</SelectItem>
                  <SelectItem value="voluntarios">Voluntários</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="executivo">Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="disponiveis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="disponiveis">Relatórios Disponíveis</TabsTrigger>
            <TabsTrigger value="gerados">Relatórios Gerados</TabsTrigger>
            {mostrarVisualizacao && (
              <TabsTrigger value="visualizacao">Visualização</TabsTrigger>
            )}
            <TabsTrigger value="agendados">Agendamentos</TabsTrigger>
          </TabsList>

          {/* Tab Relatórios Disponíveis */}
          <TabsContent value="disponiveis">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relatoriosFiltrados.map((relatorio) => {
                const IconComponent = getCategoriaIcon(relatorio.categoria);
                const cor = getCategoriaColor(relatorio.categoria);
                
                return (
                  <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: cor + '20' }}
                          >
                            <IconComponent className="h-5 w-5" style={{ color: cor }} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{relatorio.nome}</CardTitle>
                            <Badge variant="outline" style={{ borderColor: cor, color: cor }}>
                              {relatorio.categoria}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2">
                        {relatorio.descricao}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            {relatorio.formatos_exportacao.map((formato) => {
                              const FormatoIcon = getFormatoIcon(formato);
                              return (
                                <FormatoIcon key={formato} className="h-4 w-4" />
                              );
                            })}
                          </div>
                          <span>•</span>
                          <span>{relatorio.formatos_exportacao.join(', ').toUpperCase()}</span>
                        </div>
                        
                        {relatorio.agendamento_disponivel && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Agendamento disponível</span>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => abrirDialogGeracao(relatorio)}
                          className="w-full"
                          disabled={gerando === relatorio.id}
                        >
                          {gerando === relatorio.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Gerar Relatório
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab Relatórios Gerados */}
          <TabsContent value="gerados">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Gerados Recentemente</CardTitle>
                <CardDescription>
                  Histórico dos relatórios gerados e disponíveis para download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatoriosGerados.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum relatório gerado ainda</p>
                    </div>
                  ) : (
                    relatoriosGerados.map((relatorio) => {
                      const FormatoIcon = getFormatoIcon(relatorio.formato);
                      
                      return (
                        <div key={relatorio.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FormatoIcon className="h-5 w-5 text-gray-500" />
                            <div>
                              <h4 className="font-medium">{relatorio.nome}</h4>
                              <p className="text-sm text-gray-600">
                                Gerado em {new Date(relatorio.data_geracao).toLocaleString('pt-PT')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {relatorio.estatisticas.total_registos} registos • {relatorio.formato.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={relatorio.status === 'concluido' ? 'default' : 'secondary'}
                            >
                              {relatorio.status === 'concluido' ? 'Concluído' : 
                               relatorio.status === 'gerando' ? 'Gerando' : 
                               relatorio.status === 'erro' ? 'Erro' : 'Expirado'}
                            </Badge>
                            
                            {relatorio.status === 'concluido' && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Visualização */}
          {mostrarVisualizacao && dadosRelatorioAdocoes && estatisticasRelatorio && (
            <TabsContent value="visualizacao">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Relatório de Adoções</h3>
                    <p className="text-sm text-gray-600">
                      Gerado em {new Date().toLocaleString('pt-PT')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setMostrarVisualizacao(false)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ocultar
                    </Button>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
                
                <VisualizadorRelatorioAdocoes 
                  dados={dadosRelatorioAdocoes}
                  estatisticas={estatisticasRelatorio}
                />
              </div>
            </TabsContent>
          )}

          {/* Tab Agendamentos */
          <TabsContent value="agendados">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Agendados</CardTitle>
                <CardDescription>
                  Configurar geração automática de relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Funcionalidade de agendamento em desenvolvimento</p>
                  <p className="text-sm mt-1">Em breve será possível agendar relatórios automáticos</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Geração de Relatório */}
        <Dialog open={dialogGeracao} onOpenChange={setDialogGeracao}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Relatório</DialogTitle>
              <DialogDescription>
                {relatorioSelecionado?.nome}
              </DialogDescription>
            </DialogHeader>
            
            {relatorioSelecionado && (
              <div className="space-y-4">
                {/* Filtro de Período */}
                {relatorioSelecionado.filtros_disponiveis.some(f => f.campo === 'periodo') && (
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <Select
                      value={filtrosRelatorio.periodo || 'ultimos_30_dias'}
                      onValueChange={(value: PeriodoPredefinido) => handlePeriodoChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PERIODOS_PREDEFINIDOS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Datas personalizadas */}
                {filtrosRelatorio.periodo === 'personalizado' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={filtrosRelatorio.data_inicio || ''}
                        onChange={(e) => setFiltrosRelatorio(prev => ({ 
                          ...prev, 
                          data_inicio: e.target.value 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={filtrosRelatorio.data_fim || ''}
                        onChange={(e) => setFiltrosRelatorio(prev => ({ 
                          ...prev, 
                          data_fim: e.target.value 
                        }))}
                      />
                    </div>
                  </div>
                )}

                {/* Formato de Exportação */}
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select
                    value={formatoExportacao}
                    onValueChange={(value: FormatoExportacao) => setFormatoExportacao(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {relatorioSelecionado.formatos_exportacao.map((formato) => (
                        <SelectItem key={formato} value={formato}>
                          <div className="flex items-center gap-2">
                            {React.createElement(getFormatoIcon(formato), { className: "h-4 w-4" })}
                            {formato.toUpperCase()}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gerador de Relatório */}
                {relatorioSelecionado.tipo === 'animais_adocoes' && gerando === relatorioSelecionado.id && (
                  <GeradorRelatorioAdocoes 
                    filtros={filtrosRelatorio}
                    onDadosGerados={handleDadosGerados}
                  />
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogGeracao(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGerarRelatorio} disabled={!!gerando}>
                    {gerando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Gerar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SistemaRelatorios;