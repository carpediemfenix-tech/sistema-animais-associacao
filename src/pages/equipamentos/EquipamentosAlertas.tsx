import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft,
  AlertTriangle,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle,
  X,
  Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface Alerta {
  id: string;
  equipamento_id: string;
  tipo_alerta: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
  data_criacao: string;
  equipamento?: {
    codigo_interno: string;
    tipo_equipamento?: {
      nome: string;
    };
  };
}

const EquipamentosAlertas: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alertas_equipamentos_2025_12_16_07_00')
        .select(`
          *,
          equipamento:equipamentos_2025_12_13_01_00(
            codigo_interno,
            tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome)
          )
        `)
        .eq('status', 'ativo')
        .order('prioridade', { ascending: false })
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setAlertas(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar alertas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertas();
  }, []);

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      'baixa': 'bg-gray-100 text-gray-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return variants[prioridade as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTipoAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'manutencao_vencida':
      case 'manutencao_proxima':
        return '🔧';
      case 'atribuicao_vencida':
        return '⏰';
      case 'equipamento_danificado':
        return '⚠️';
      case 'garantia_vencendo':
        return '📋';
      case 'stock_baixo':
        return '📦';
      case 'vida_util_esgotada':
        return '🔄';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Carregando alertas...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Alertas de Equipamentos</h1>
                <p className="text-gray-600">Sistema de alertas e notificações automáticas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadAlertas} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{alertas.length}</div>
                <p className="text-sm text-gray-600">Total de Alertas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {alertas.filter(a => a.prioridade === 'critica').length}
                </div>
                <p className="text-sm text-gray-600">Críticos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {alertas.filter(a => a.prioridade === 'alta').length}
                </div>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {alertas.filter(a => a.prioridade === 'media').length}
                </div>
                <p className="text-sm text-gray-600">Média Prioridade</p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas por Prioridade */}
          <div className="space-y-6">
            {/* Alertas Críticos */}
            {alertas.filter(a => a.prioridade === 'critica').length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center text-red-700">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Alertas Críticos ({alertas.filter(a => a.prioridade === 'critica').length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2 p-4">
                    {alertas.filter(a => a.prioridade === 'critica').map((alerta) => (
                      <div key={alerta.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getTipoAlertaIcon(alerta.tipo_alerta)}</span>
                          <div>
                            <div className="font-medium text-red-900">{alerta.titulo}</div>
                            <div className="text-sm text-red-700">{alerta.descricao}</div>
                            <div className="text-xs text-red-600">
                              {alerta.equipamento?.codigo_interno} • {new Date(alerta.data_criacao).toLocaleDateString('pt-PT')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-700">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Outros Alertas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Todos os Alertas ({alertas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertas.map((alerta) => (
                        <TableRow key={alerta.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getTipoAlertaIcon(alerta.tipo_alerta)}</span>
                              <span className="text-sm">{alerta.tipo_alerta.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {alerta.equipamento?.codigo_interno || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {alerta.equipamento?.tipo_equipamento?.nome || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{alerta.titulo}</div>
                              <div className="text-sm text-gray-600">{alerta.descricao}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPrioridadeBadge(alerta.prioridade)}>
                              {alerta.prioridade.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(alerta.data_criacao).toLocaleDateString('pt-PT')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-green-600">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-gray-600">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {alertas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum alerta ativo encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosAlertas;