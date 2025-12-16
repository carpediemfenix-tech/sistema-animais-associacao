import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Heart,
  Package,
  RefreshCw,
  Download,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ExecutiveDashboardSimple: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnimais: 0,
    totalVoluntarios: 0,
    totalEquipamentos: 0,
    saldoAtual: 0
  });

  const loadBasicStats = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas básicas
      const [animaisResult, equipamentosResult] = await Promise.all([
        supabase.from('animais').select('id', { count: 'exact', head: true }),
        supabase.from('equipamentos_2025_12_13_01_00').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalAnimais: animaisResult.count || 0,
        totalVoluntarios: 0, // Será implementado posteriormente
        totalEquipamentos: equipamentosResult.count || 0,
        saldoAtual: 0 // Será implementado posteriormente
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Aviso",
        description: "Alguns dados podem não estar disponíveis",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBasicStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando dashboard executivo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600">Visão geral e KPIs em tempo real</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={loadBasicStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-lg">Status do Sistema: NORMAL</h3>
                <p className="text-sm text-gray-600">
                  Última atualização: {new Date().toLocaleString('pt-PT')}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              NORMAL
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
            <div className="p-2 rounded-full bg-blue-500">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnimais}</div>
            <p className="text-xs text-muted-foreground">
              Animais registrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
            <div className="p-2 rounded-full bg-purple-500">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVoluntarios}</div>
            <p className="text-xs text-muted-foreground">
              Em desenvolvimento
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos</CardTitle>
            <div className="p-2 rounded-full bg-orange-500">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEquipamentos}</div>
            <p className="text-xs text-muted-foreground">
              Equipamentos registrados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <div className="p-2 rounded-full bg-green-600">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.saldoAtual.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Em desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funcionalidades em Desenvolvimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-600">
            <Activity className="h-5 w-5 mr-2" />
            Sistema em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
              <h4 className="font-medium text-blue-900">Dashboard Avançado</h4>
              <p className="text-sm text-blue-700 mt-1">
                KPIs avançados, gráficos interativos e analytics preditivos serão implementados em breve.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
              <h4 className="font-medium text-green-900">Sistema de Notificações</h4>
              <p className="text-sm text-green-700 mt-1">
                Notificações em tempo real e alertas automáticos estão sendo desenvolvidos.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50">
              <h4 className="font-medium text-purple-900">Relatórios Executivos</h4>
              <p className="text-sm text-purple-700 mt-1">
                Relatórios detalhados e exportação de dados serão disponibilizados em breve.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Ver Animais</div>
                <div className="text-sm text-gray-600">Gestão de animais</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Equipamentos</div>
                <div className="text-sm text-gray-600">Gestão de equipamentos</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Configurações</div>
                <div className="text-sm text-gray-600">Configurar sistema</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboardSimple;