import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2,
  ArrowLeft,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  RefreshCw,
  Hospital,
  Stethoscope,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Users,
  Percent,
  Activity,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";

interface ClinicaVeterinaria {
  id: string;
  nome: string;
  codigo?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  website?: string;
  contacto_responsavel?: string;
  especialidades: string[];
  tem_protocolo: boolean;
  desconto_protocolo: number;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface EstatisticasClinicas {
  totalClinicas: number;
  clinicasAtivas: number;
  clinicasComProtocolo: number;
  descontoMedio: number;
  totalIntervencoes: number;
  custoTotalMes: number;
  especialidadesUnicas: number;
  clinicasUnicas: number;
}

const ModuloClinicas = () => {
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasClinicas | null>(null);
  const [clinicas, setClinicas] = useState<ClinicaVeterinaria[]>([]);
  const [intervencoes, setIntervencoes] = useState<any[]>([]);
  const [tabelaClinicasExiste, setTabelaClinicasExiste] = useState(false);
  
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
              Apenas administradores podem aceder ao módulo de clínicas
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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Verificar se a tabela de clínicas existe e carregar dados
      let clinicasData: ClinicaVeterinaria[] = [];
      let tabelaExiste = false;
      
      try {
        const { data, error } = await supabase
          .from('clinicas_veterinarias')
          .select('*')
          .order('nome');
        
        if (!error) {
          clinicasData = data || [];
          tabelaExiste = true;
          setTabelaClinicasExiste(true);
        }
      } catch (error) {
        console.log('Tabela clinicas_veterinarias não existe ainda');
        setTabelaClinicasExiste(false);
      }

      // Carregar intervenções
      let intervencoesData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('intervencoes')
          .select(`
            *,
            animal:animais(nome, numero_processo)
          `)
          .order('data_intervencao', { ascending: false })
          .limit(50);
        
        if (!error) {
          intervencoesData = data || [];
        }
      } catch (error) {
        console.log('Erro ao carregar intervenções:', error);
      }

      // Calcular estatísticas
      const clinicasAtivas = clinicasData.filter(c => c.ativo).length;
      const clinicasComProtocolo = clinicasData.filter(c => c.tem_protocolo).length;
      
      const descontoMedio = clinicasComProtocolo > 0
        ? clinicasData
            .filter(c => c.tem_protocolo)
            .reduce((acc, c) => acc + c.desconto_protocolo, 0) / clinicasComProtocolo
        : 0;

      const especialidadesUnicas = [...new Set(clinicasData.flatMap(c => c.especialidades || []))].length;

      // Calcular custos do mês atual
      const agora = new Date();
      const custoTotalMes = intervencoesData
        .filter(i => {
          const dataIntervencao = new Date(i.data_intervencao);
          return dataIntervencao.getMonth() === agora.getMonth() && 
                 dataIntervencao.getFullYear() === agora.getFullYear() &&
                 i.custo;
        })
        .reduce((total, i) => total + (i.custo || 0), 0);

      // Contar clínicas únicas nas intervenções (se não temos tabela de clínicas)
      const clinicasUnicasIntervencoes = [...new Set(
        intervencoesData
          .map(i => i.clinica)
          .filter(c => c && c.trim() !== '')
      )].length;

      const stats: EstatisticasClinicas = {
        totalClinicas: tabelaExiste ? clinicasData.length : clinicasUnicasIntervencoes,
        clinicasAtivas,
        clinicasComProtocolo,
        descontoMedio,
        totalIntervencoes: intervencoesData.length,
        custoTotalMes,
        especialidadesUnicas,
        clinicasUnicas: clinicasUnicasIntervencoes
      };

      setEstatisticas(stats);
      setClinicas(clinicasData);
      setIntervencoes(intervencoesData);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do módulo clínicas",
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
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando módulo clínicas...</p>
            </div>
          </div>
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
                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                Módulo Clínicas Veterinárias
              </h1>
              <p className="text-gray-600 mt-1">
                {tabelaClinicasExiste 
                  ? "Gestão integrada de clínicas parceiras e intervenções"
                  : "Análise de clínicas utilizadas nas intervenções"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            {tabelaClinicasExiste ? (
              <Link to="/configuracoes/clinicas">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Gerir Clínicas
                </Button>
              </Link>
            ) : (
              <Link to="/configuracoes/clinicas">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Clínicas
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Aviso se tabela não existe */}
        {!tabelaClinicasExiste && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Sistema de Clínicas em Configuração</p>
                  <p className="text-sm text-orange-700">
                    A gestão avançada de clínicas ainda não está configurada. 
                    <Link to="/configuracoes/clinicas" className="underline ml-1">
                      Clique aqui para configurar
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {tabelaClinicasExiste ? "Clínicas Cadastradas" : "Clínicas Utilizadas"}
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tabelaClinicasExiste ? estatisticas?.totalClinicas || 0 : estatisticas?.clinicasUnicas || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {tabelaClinicasExiste 
                  ? `${estatisticas?.clinicasAtivas || 0} ativas`
                  : "Nas intervenções"
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {tabelaClinicasExiste ? "Com Protocolo" : "Intervenções"}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tabelaClinicasExiste 
                  ? estatisticas?.clinicasComProtocolo || 0
                  : estatisticas?.totalIntervencoes || 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {tabelaClinicasExiste 
                  ? `Desconto médio: ${(estatisticas?.descontoMedio || 0).toFixed(1)}%`
                  : "Total registadas"
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custos do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{(estatisticas?.custoTotalMes || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Em intervenções veterinárias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {tabelaClinicasExiste ? "Especialidades" : "Custo Médio"}
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tabelaClinicasExiste 
                  ? estatisticas?.especialidadesUnicas || 0
                  : `€${(estatisticas?.totalIntervencoes || 0) > 0 
                      ? ((estatisticas?.custoTotalMes || 0) / (estatisticas?.totalIntervencoes || 1)).toFixed(0)
                      : '0'}`
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {tabelaClinicasExiste 
                  ? "Diferentes especialidades"
                  : "Por intervenção"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="clinicas">
              {tabelaClinicasExiste ? "Clínicas Parceiras" : "Clínicas Utilizadas"}
            </TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Tab Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status das Clínicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {tabelaClinicasExiste ? "Status das Clínicas" : "Análise de Custos"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tabelaClinicasExiste ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Clínicas Ativas</span>
                        <span className="font-medium">{estatisticas?.clinicasAtivas || 0}</span>
                      </div>
                      <Progress value={(estatisticas?.clinicasAtivas || 0) / (estatisticas?.totalClinicas || 1) * 100} />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Com Protocolo</span>
                        <span className="font-medium">{estatisticas?.clinicasComProtocolo || 0}</span>
                      </div>
                      <Progress value={(estatisticas?.clinicasComProtocolo || 0) / (estatisticas?.totalClinicas || 1) * 100} className="bg-green-100" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          €{(estatisticas?.custoTotalMes || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Custos do Mês</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {estatisticas?.clinicasUnicas || 0} clínicas diferentes
                        </p>
                        <p className="text-sm text-gray-600">Utilizadas nas intervenções</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Intervenções Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Intervenções Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {intervencoes.slice(0, 5).map((intervencao) => (
                      <div key={intervencao.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{intervencao.animal?.nome || 'Animal'}</p>
                          <p className="text-xs text-gray-500">
                            {intervencao.clinica || 'Clínica não especificada'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {intervencao.custo ? `€${intervencao.custo}` : '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {intervencoes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma intervenção registada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso rápido às funcionalidades principais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/configuracoes/clinicas">
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                      {tabelaClinicasExiste ? <Settings className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                      <span className="font-medium">
                        {tabelaClinicasExiste ? "Gerir Clínicas" : "Configurar Clínicas"}
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        {tabelaClinicasExiste 
                          ? "Adicionar, editar e configurar clínicas"
                          : "Configurar sistema de gestão de clínicas"
                        }
                      </span>
                    </Button>
                  </Link>
                  <Link to="/intervencoes">
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                      <Stethoscope className="h-6 w-6" />
                      <span className="font-medium">Ver Intervenções</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Consultar histórico de intervenções
                      </span>
                    </Button>
                  </Link>
                  <Link to="/relatorios">
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="font-medium">Relatórios</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Análises e estatísticas detalhadas
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Clínicas */}
          <TabsContent value="clinicas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {tabelaClinicasExiste ? "Clínicas Parceiras" : "Clínicas Utilizadas"}
                    </CardTitle>
                    <CardDescription>
                      {tabelaClinicasExiste 
                        ? "Lista de clínicas veterinárias cadastradas"
                        : "Clínicas mencionadas nas intervenções"
                      }
                    </CardDescription>
                  </div>
                  <Link to="/configuracoes/clinicas">
                    <Button>
                      {tabelaClinicasExiste ? (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Gerir Clínicas
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Configurar Sistema
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {tabelaClinicasExiste ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clinicas.map((clinica) => (
                      <Card key={clinica.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{clinica.nome}</CardTitle>
                              {clinica.codigo && (
                                <p className="text-sm text-gray-500">{clinica.codigo}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant={clinica.ativo ? "default" : "secondary"}>
                                {clinica.ativo ? "Ativa" : "Inativa"}
                              </Badge>
                              {clinica.tem_protocolo && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  -{clinica.desconto_protocolo}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {clinica.endereco && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{clinica.endereco}</span>
                            </div>
                          )}
                          {clinica.telefone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {clinica.telefone}
                            </div>
                          )}
                          {clinica.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="truncate">{clinica.email}</span>
                            </div>
                          )}
                          
                          {clinica.especialidades && clinica.especialidades.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {clinica.especialidades.slice(0, 3).map((esp, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {esp}
                                </Badge>
                              ))}
                              {clinica.especialidades.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{clinica.especialidades.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...new Set(intervencoes.map(i => i.clinica).filter(c => c && c.trim() !== ''))].map((clinica, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{clinica}</p>
                            <p className="text-sm text-gray-500">
                              {intervencoes.filter(i => i.clinica === clinica).length} intervenções
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            €{intervencoes
                              .filter(i => i.clinica === clinica && i.custo)
                              .reduce((total, i) => total + (i.custo || 0), 0)
                              .toFixed(2)
                            }
                          </p>
                          <p className="text-xs text-gray-500">Total gasto</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(tabelaClinicasExiste ? clinicas.length === 0 : intervencoes.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">
                      {tabelaClinicasExiste 
                        ? "Nenhuma clínica cadastrada"
                        : "Nenhuma intervenção com clínica registada"
                      }
                    </p>
                    <Link to="/configuracoes/clinicas">
                      <Button>
                        {tabelaClinicasExiste ? (
                          <>
                            <Settings className="h-4 w-4 mr-2" />
                            Cadastrar Primeira Clínica
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Configurar Sistema de Clínicas
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Relatórios */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        €{(estatisticas?.custoTotalMes || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Custos do Mês</p>
                    </div>
                    {tabelaClinicasExiste && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          €{((estatisticas?.custoTotalMes || 0) * (estatisticas?.descontoMedio || 0) / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Poupança com Descontos</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        €{(estatisticas?.totalIntervencoes || 0) > 0 
                          ? ((estatisticas?.custoTotalMes || 0) / (estatisticas?.totalIntervencoes || 1)).toFixed(2)
                          : '0.00'}
                      </p>
                      <p className="text-sm text-gray-600">Custo Médio por Intervenção</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tabelaClinicasExiste ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Taxa de Clínicas com Protocolo</span>
                          <span className="font-medium">
                            {((estatisticas?.clinicasComProtocolo || 0) / (estatisticas?.totalClinicas || 1) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Desconto Médio</span>
                          <span className="font-medium">{(estatisticas?.descontoMedio || 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Especialidades Disponíveis</span>
                          <span className="font-medium">{estatisticas?.especialidadesUnicas || 0}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Clínicas Diferentes</span>
                          <span className="font-medium">{estatisticas?.clinicasUnicas || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Custo Médio por Clínica</span>
                          <span className="font-medium">
                            €{(estatisticas?.clinicasUnicas || 0) > 0 
                              ? ((estatisticas?.custoTotalMes || 0) / (estatisticas?.clinicasUnicas || 1)).toFixed(2)
                              : '0.00'}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intervenções Registadas</span>
                      <span className="font-medium">{estatisticas?.totalIntervencoes || 0}</span>
                    </div>
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

export default ModuloClinicas;