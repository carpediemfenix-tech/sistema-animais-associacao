import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  PawPrint,
  Target,
  Shield,
  Cookie,
  Pill,
  Wrench,
  FileText,
  Sparkles,
  Camera,
  Gift,
  BarChart3,
  Edit,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  tem_numero_serie: boolean;
  tem_validade: boolean;
  permite_devolucao: boolean;
  permite_atribuicao_animais: boolean;
  requer_verificacao: boolean;
  cor_interface: string;
  icone: string;
  ativo: boolean;
  total_tipos?: number;
  total_itens?: number;
}

const AprovisionamentoDashboard = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_categorias: 0,
    total_tipos: 0,
    total_itens: 0,
    alertas_stock: 0,
    valor_total_stock: 0,
    total_movimentos: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 [DASHBOARD] Iniciando carregamento de dados...');
      console.log('🔍 [DASHBOARD] Usuário autenticado:', !!user);

      // Carregar categorias
      console.log('🔍 [DASHBOARD] Carregando categorias...');
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_aprovisionamento_2026_01_06')
        .select('*')
        .order('nome');

      console.log('🔍 [DASHBOARD] Resultado categorias:', { 
        data: categoriasData, 
        error: categoriasError,
        count: categoriasData?.length || 0
      });

      if (categoriasError) {
        console.error('❌ [DASHBOARD] Erro ao carregar categorias:', categoriasError);
        
        if (categoriasError.code === '42P01') {
          toast({
            title: "Tabela não encontrada",
            description: "A tabela categorias_aprovisionamento_2026_01_06 não existe. Execute as migrações.",
            variant: "destructive",
          });
        } else if (categoriasError.code === 'PGRST116' || categoriasError.message?.includes('JWT')) {
          toast({
            title: "Erro de autenticação",
            description: "Problema com as políticas RLS ou sessão expirada. Faça login novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao carregar categorias",
            description: `Código: ${categoriasError.code} - ${categoriasError.message}`,
            variant: "destructive",
          });
        }
        setCategorias([]);
        setStats(prev => ({ ...prev, total_categorias: 0, total_tipos: 0 }));
        return;
      }

      console.log('✅ [DASHBOARD] Categorias carregadas:', categoriasData?.length || 0);
      
      if (!categoriasData || categoriasData.length === 0) {
        console.log('⚠️ [DASHBOARD] Nenhuma categoria encontrada');
        setCategorias([]);
        setStats(prev => ({ ...prev, total_categorias: 0, total_tipos: 0 }));
        return;
      }

      // Carregar contagem de tipos para cada categoria
      console.log('🔍 [DASHBOARD] Carregando contagem de tipos...');
      
      const categoriasComContagem = await Promise.all(
        categoriasData.map(async (categoria) => {
          try {
            const { count, error: countError } = await supabase
              .from('tipos_aprovisionamento_2026_01_06')
              .select('*', { count: 'exact', head: true })
              .eq('categoria_id', categoria.id)
              .eq('ativo', true);

            if (countError) {
              console.error(`❌ [DASHBOARD] Erro ao contar tipos para categoria ${categoria.nome}:`, countError);
              return {
                ...categoria,
                total_tipos: 0,
                total_itens: 0
              };
            }

            console.log(`✅ [DASHBOARD] Categoria ${categoria.nome}: ${count || 0} tipos`);
            
            return {
              ...categoria,
              total_tipos: count || 0,
              total_itens: 0
            };
          } catch (error) {
            console.error(`❌ [DASHBOARD] Erro ao processar categoria ${categoria.nome}:`, error);
            return {
              ...categoria,
              total_tipos: 0,
              total_itens: 0
            };
          }
        })
      );
      
      setCategorias(categoriasComContagem);
      
      // Carregar estatísticas de stock
      console.log('🔍 [DASHBOARD] Carregando estatísticas de stock...');
      
      try {
        // Contar itens totais
        const { count: totalItens, error: itensError } = await supabase
          .from('itens_aprovisionamento_2026_01_06')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);

        // Contar alertas de stock baixo
        const { count: alertasStock, error: alertasError } = await supabase
          .from('itens_aprovisionamento_2026_01_06')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)
          .eq('alerta_stock_baixo', true);

        // Calcular valor total do stock
        const { data: valorData, error: valorError } = await supabase
          .from('itens_aprovisionamento_2026_01_06')
          .select('valor_total_stock')
          .eq('ativo', true);

        // Contar movimentos de stock
        const { count: totalMovimentos, error: movimentosError } = await supabase
          .from('movimentos_stock_2026_01_06')
          .select('*', { count: 'exact', head: true });

        const valorTotalStock = valorData?.reduce((sum, item) => sum + (item.valor_total_stock || 0), 0) || 0;
        
        console.log('📊 [DASHBOARD] Estatísticas de stock:', {
          totalItens: totalItens || 0,
          alertasStock: alertasStock || 0,
          valorTotalStock,
          totalMovimentos: totalMovimentos || 0
        });

        // Calcular estatísticas
        const totalTipos = categoriasComContagem.reduce((sum, cat) => sum + (cat.total_tipos || 0), 0);
        
        setStats({
          total_categorias: categoriasComContagem.length,
          total_tipos: totalTipos,
          total_itens: totalItens || 0,
          alertas_stock: alertasStock || 0,
          valor_total_stock: valorTotalStock,
          total_movimentos: totalMovimentos || 0
        });

      } catch (stockError) {
        console.error('❌ [DASHBOARD] Erro ao carregar estatísticas de stock:', stockError);
        // Manter estatísticas básicas mesmo se stock falhar
        const totalTipos = categoriasComContagem.reduce((sum, cat) => sum + (cat.total_tipos || 0), 0);
        setStats({
          total_categorias: categoriasComContagem.length,
          total_tipos: totalTipos,
          total_itens: 0,
          alertas_stock: 0,
          valor_total_stock: 0,
          total_movimentos: 0
        });
      }

    } catch (error: any) {
      console.error('❌ [DASHBOARD] Erro geral ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Package,
      Shield,
      Cookie,
      Pill,
      Wrench,
      FileText,
      Sparkles,
      Camera,
      Gift
    };
    
    const IconComponent = icons[iconName] || Package;
    return <IconComponent className="h-6 w-6" />;
  };

  const handleNavigateToCategories = () => {
    navigate('/aprovisionamento/categorias');
  };

  const handleNavigateToTypes = () => {
    navigate('/aprovisionamento/tipos');
  };

  const handleNavigateToItems = () => {
    navigate('/aprovisionamento/itens');
  };

  const handleNavigateToSettings = () => {
    navigate('/aprovisionamento/configuracoes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Carregando dados do aprovisionamento...</span>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <PageActionBar
        title="Aprovisionamento"
        subtitle="Gestão completa de recursos, equipamentos e consumíveis"
        actions={[
          {
            label: "Configurações",
            onClick: handleNavigateToSettings,
            variant: "outline" as const,
            icon: Settings
          },
          {
            label: "Gestão de Itens",
            onClick: handleNavigateToItems,
            variant: "default" as const,
            icon: Plus
          }
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Debug Info - Remover em produção */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">🔧 Debug Info (Desenvolvimento)</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Usuário autenticado: {user ? '✅ Sim' : '❌ Não'}</p>
                <p>• Categorias carregadas: {categorias.length}</p>
                <p>• Total de tipos: {stats.total_tipos}</p>
                <p>• Verifique o console do navegador para logs detalhados</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Categorias</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total_categorias}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Tipos</p>
                  <p className="text-3xl font-bold text-green-900">{stats.total_tipos}</p>
                </div>
                <Settings className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Itens em Stock</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.total_itens}</p>
                  <p className="text-xs text-purple-600 mt-1">Produtos físicos</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br border-2 ${
            stats.alertas_stock > 0 
              ? 'from-red-50 to-red-100 border-red-300 animate-pulse' 
              : 'from-orange-50 to-orange-100 border-orange-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    stats.alertas_stock > 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>Alertas Stock</p>
                  <p className={`text-3xl font-bold ${
                    stats.alertas_stock > 0 ? 'text-red-900' : 'text-orange-900'
                  }`}>{stats.alertas_stock}</p>
                  <p className={`text-xs mt-1 ${
                    stats.alertas_stock > 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {stats.alertas_stock > 0 ? '⚠️ Stock baixo!' : '✅ Stock OK'}
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${
                  stats.alertas_stock > 0 ? 'text-red-600' : 'text-orange-600'
                }`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Financeiras e de Movimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Valor Total Stock</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    €{stats.valor_total_stock.toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">Investimento atual</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Movimentos</p>
                  <p className="text-3xl font-bold text-indigo-900">{stats.total_movimentos}</p>
                  <p className="text-xs text-indigo-600 mt-1">Entradas/Saídas</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">A Vencer</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.itens_vencendo}</p>
                  <p className="text-xs text-gray-500">Próxima fase</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categorias */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Categorias de Aprovisionamento
                </CardTitle>
                <CardDescription>
                  Gerir categorias e tipos de recursos disponíveis
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleNavigateToTypes}>
                  <Settings className="h-4 w-4 mr-2" />
                  Gerir Tipos
                </Button>
                <Button onClick={handleNavigateToCategories}>
                  <Plus className="h-4 w-4 mr-2" />
                  Gerir Categorias
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {categorias.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma categoria encontrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece por criar categorias para organizar o seu aprovisionamento
                </p>
                <Button onClick={handleNavigateToCategories}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categorias.map((categoria) => (
                  <Card 
                    key={categoria.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer border-l-4"
                    style={{ borderLeftColor: categoria.cor_interface }}
                    onClick={() => navigate(`/aprovisionamento/categoria/${categoria.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${categoria.cor_interface}20` }}
                        >
                          <div style={{ color: categoria.cor_interface }}>
                            {getIconComponent(categoria.icone)}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {categoria.total_tipos || 0} tipos
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {categoria.nome}
                      </h3>
                      
                      {categoria.descricao && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {categoria.descricao}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {categoria.tem_numero_serie && (
                          <Badge variant="outline" className="text-xs">
                            Nº Série
                          </Badge>
                        )}
                        {categoria.tem_validade && (
                          <Badge variant="outline" className="text-xs">
                            Validade
                          </Badge>
                        )}
                        {categoria.permite_devolucao && (
                          <Badge variant="outline" className="text-xs">
                            Devolução
                          </Badge>
                        )}
                        {categoria.permite_atribuicao_animais && (
                          <Badge variant="outline" className="text-xs">
                            Animais
                          </Badge>
                        )}
                        {categoria.requer_verificacao && (
                          <Badge variant="outline" className="text-xs">
                            Verificação
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gestão de Itens - Fase 2 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestão de Itens
            </CardTitle>
            <CardDescription>
              Gerir itens físicos, stock e movimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50" 
                onClick={handleNavigateToItems}
              >
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900 mb-1">Itens de Stock</h4>
                  <p className="text-sm text-blue-700">Gerir produtos físicos e quantidades</p>
                  <Badge className="mt-2 bg-blue-600">Disponível</Badge>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-60" onClick={() => toast({ title: "Em desenvolvimento", description: "Funcionalidade será implementada na próxima fase" })}>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Relatórios Stock</h4>
                  <p className="text-sm text-gray-600">Análises e relatórios de stock</p>
                  <Badge variant="outline" className="mt-2">Próxima fase</Badge>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas Completas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* Gestão de Atribuições */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/aprovisionamento/atribuicoes')}>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Gestão de Atribuições</h3>
              <p className="text-sm text-gray-600">Gerir atribuições a voluntários, animais e missões</p>
              <Badge variant="default" className="mt-2 bg-blue-600">✅ Disponível</Badge>
            </CardContent>
          </Card>

          {/* Nova Atribuição */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/aprovisionamento/nova-atribuicao')}>
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Nova Atribuição</h3>
              <p className="text-sm text-gray-600">Criar nova atribuição de item</p>
              <Badge variant="default" className="mt-2 bg-green-600">✅ Disponível</Badge>
            </CardContent>
          </Card>

          {/* Itens Desativados */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/aprovisionamento/itens')}>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Itens Desativados</h3>
              <p className="text-sm text-gray-600">Ver e reativar itens desativados</p>
              <Badge variant="default" className="mt-2 bg-orange-600">✅ Disponível</Badge>
            </CardContent>
          </Card>

          {/* Relatórios (Próxima fase) */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-60" onClick={() => toast({ title: "Em desenvolvimento", description: "Relatórios serão implementados na próxima fase" })}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Relatórios</h3>
              <p className="text-sm text-gray-600">Analytics e relatórios avançados</p>
              <Badge variant="outline" className="mt-2">Próxima fase</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Menu de Administração */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Administração do Sistema
            </CardTitle>
            <CardDescription>
              Acesso completo a todas as funcionalidades para administradores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Ver Itens Desativados */}
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  navigate('/aprovisionamento/itens');
                  // Simular clique no filtro "Itens Desativados" após navegação
                  setTimeout(() => {
                    toast({
                      title: "Dica",
                      description: "Use o filtro 'Status Item' para ver itens desativados",
                    });
                  }, 1000);
                }}
              >
                <Trash2 className="h-6 w-6 text-red-600" />
                <div className="text-center">
                  <div className="font-medium">Itens Desativados</div>
                  <div className="text-xs text-gray-600">Ver e reativar</div>
                </div>
              </Button>

              {/* Editar Atribuições */}
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/aprovisionamento/atribuicoes')}
              >
                <Edit className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">Editar Atribuições</div>
                  <div className="text-xs text-gray-600">Modificar atribuições ativas</div>
                </div>
              </Button>

              {/* Gestão Completa */}
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/aprovisionamento/configuracoes')}
              >
                <Settings className="h-6 w-6 text-purple-600" />
                <div className="text-center">
                  <div className="font-medium">Configurar Regras</div>
                  <div className="text-xs text-gray-600">Quantidades máximas e permissões</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default AprovisionamentoDashboard;