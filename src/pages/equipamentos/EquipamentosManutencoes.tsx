import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft,
  Wrench,
  Plus,
  Eye,
  RefreshCw,
  Loader2,
  Calendar,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface Manutencao {
  id: string;
  equipamento_id: string;
  tipo_manutencao: string;
  status: string;
  data_agendada: string;
  data_realizada?: string;
  custo?: number;
  observacoes: string;
  equipamento?: {
    codigo_interno: string;
    tipo_equipamento?: {
      nome: string;
    };
  };
}

const EquipamentosManutencoes: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

  const loadManutencoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('manutencoes_equipamentos_2025_12_13_01_00')
        .select(`
          *,
          equipamento:equipamentos_2025_12_13_01_00(
            codigo_interno,
            tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome)
          )
        `)
        .order('data_agendada', { ascending: false });

      if (error) throw error;
      setManutencoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar manutenções",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManutencoes();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      'agendada': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'concluida': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

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
            <p className="text-gray-600">Carregando manutenções...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Manutenções de Equipamentos</h1>
                <p className="text-gray-600">Agendamento e controle de manutenções</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadManutencoes} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Agendar Manutenção
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{manutencoes.length}</div>
                <p className="text-sm text-gray-600">Total de Manutenções</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {manutencoes.filter(m => m.status === 'agendada').length}
                </div>
                <p className="text-sm text-gray-600">Agendadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {manutencoes.filter(m => m.status === 'em_andamento').length}
                </div>
                <p className="text-sm text-gray-600">Em Andamento</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {manutencoes.filter(m => m.status === 'concluida').length}
                </div>
                <p className="text-sm text-gray-600">Concluídas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Manutenções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                Manutenções ({manutencoes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data Agendada</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manutencoes.map((manutencao) => (
                      <TableRow key={manutencao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {manutencao.equipamento?.codigo_interno || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {manutencao.equipamento?.tipo_equipamento?.nome || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {manutencao.tipo_manutencao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(manutencao.data_agendada).toLocaleDateString('pt-PT')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(manutencao.status)}>
                            {manutencao.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {manutencao.custo ? formatCurrency(manutencao.custo) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {manutencao.status === 'agendada' && (
                              <Button variant="outline" size="sm" className="text-green-600">
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {manutencoes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma manutenção encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosManutencoes;