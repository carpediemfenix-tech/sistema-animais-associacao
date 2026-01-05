import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  BarChart3,
  Package,
  TrendingUp,
  AlertTriangle,
  Target,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface EstatisticasEquipamentos {
  totalEquipamentos: number;
  equipamentosDisponiveis: number;
  equipamentosEmUso: number;
  equipamentosManutencao: number;
  valorTotalInventario: number;
  alertasAtivos: number;
  manutencoesPendentes: number;
  atribuicoesAtivas: number;
}

const EquipamentosDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasEquipamentos | null>(null);

  const loadEstatisticas = async () => {
    try {
      // Carregar equipamentos
      const { data: equipamentos, error: equipamentosError } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .select('*');

      if (equipamentosError) throw equipamentosError;

      // Carregar atribuições ativas
      const { data: atribuicoes, error: atribuicoesError } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .select('*')
        .eq('ativo', true);

      if (atribuicoesError) throw atribuicoesError;

      // Carregar alertas ativos
      const { data: alertas, error: alertasError } = await supabase
        .from('alertas_equipamentos_2025_12_16_07_00')
        .select('*')
        .eq('status', 'ativo');

      if (alertasError) throw alertasError;

      // Carregar manutenções pendentes
      const { data: manutencoes, error: manutencoesError } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .select('*')
        .in('status', ['agendada', 'em_andamento']);

      if (manutencoesError) throw manutencoesError;

      // Calcular estatísticas
      const stats: EstatisticasEquipamentos = {
        totalEquipamentos: equipamentos?.length || 0,
        equipamentosDisponiveis: equipamentos?.filter(e => e.estado === 'disponivel').length || 0,
        equipamentosEmUso: equipamentos?.filter(e => e.estado === 'em_uso').length || 0,
        equipamentosManutencao: equipamentos?.filter(e => e.estado === 'manutencao').length || 0,
        valorTotalInventario: equipamentos?.reduce((sum, e) => sum + (parseFloat(e.valor_aquisicao) || 0), 0) || 0,
        alertasAtivos: alertas?.length || 0,
        manutencoesPendentes: manutencoes?.length || 0,
        atribuicoesAtivas: atribuicoes?.length || 0
      };

      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstatisticas();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Carregando dashboard...</p>
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
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Equipamentos</h1>
                <p className="text-gray-600">Visão geral e métricas principais</p>
              </div>
            </div>
            <Button onClick={loadEstatisticas} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Equipamentos</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.totalEquipamentos || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.equipamentosDisponiveis || 0} disponíveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.equipamentosEmUso || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.atribuicoesAtivas || 0} atribuições ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Inventário</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(estatisticas?.valorTotalInventario || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.equipamentosManutencao || 0} em manutenção
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas?.alertasAtivos || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas?.manutencoesPendentes || 0} manutenções pendentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/equipamentos/inventario">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Equipamento
                      </div>
                      <div className="text-sm text-gray-600">Adicionar equipamento ao inventário</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/equipamentos/atribuicoes">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Nova Atribuição
                      </div>
                      <div className="text-sm text-gray-600">Atribuir equipamento a voluntário</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/equipamentos/manutencoes">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Agendar Manutenção
                      </div>
                      <div className="text-sm text-gray-600">Programar manutenção preventiva</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Navegação para Outros Módulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/equipamentos/inventario">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Package className="h-5 w-5 mr-2" />
                    Inventário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Gestão completa de equipamentos, categorias e tipos
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/equipamentos/atribuicoes">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-600">
                    <Target className="h-5 w-5 mr-2" />
                    Atribuições
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Controle de atribuições e devoluções
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/equipamentos/alertas">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Sistema de alertas e notificações
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosDashboard;