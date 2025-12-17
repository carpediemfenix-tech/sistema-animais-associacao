import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft,
  User,
  Plus,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import VoluntarioSelector from "@/components/VoluntarioSelector";

interface Atribuicao {
  id: string;
  equipamento_id: string;
  voluntario_id: string;
  data_atribuicao: string;
  data_devolucao_prevista: string;
  data_devolucao_real?: string;
  estado: string;
  observacoes: string;
  equipamento?: {
    codigo_interno: string;
    tipo_equipamento?: {
      nome: string;
    };
  };
voluntario?: {
    nome: string;
    email: string;
    display_name?: string;
    full_name?: string;
  };
}

interface Voluntario {
  id: string;
  full_name: string;
  nickname?: string;
  short_name: string;
  display_name: string;
  email: string;
  telefone?: string;
  ativo: boolean;
}

const EquipamentosAtribuicoes: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>([]);
  const [showNovaAtribuicao, setShowNovaAtribuicao] = useState(false);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<any[]>([]);
  const [novaAtribuicao, setNovaAtribuicao] = useState({
    equipamento_id: '',
    voluntario_id: '',
    data_atribuicao: new Date().toISOString().split('T')[0],
    data_devolucao_prevista: '',
    observacoes: ''
  });

  const loadAtribuicoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
.select(`
          *,
          equipamento:equipamentos_2025_12_13_01_00(
            codigo_interno,
            tipo_equipamento:tipos_equipamento_2025_12_13_01_00(nome)
          ),
          voluntario:voluntarios(
            nome,
            email,
            display_name,
            full_name
          )
        `)
        .eq('ativo', true)
        .order('data_atribuicao', { ascending: false });

      if (error) throw error;
      setAtribuicoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar atribuições",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEquipamentosDisponiveis = async () => {
    try {
      const { data, error } = await supabase
        .from('equipamentos_2025_12_13_01_00')
        .select(`
          id,
          codigo_interno,
          tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(nome)
        `)
        .eq('estado', 'disponivel')
        .eq('ativo', true)
        .order('codigo_interno');

      if (error) throw error;
      setEquipamentosDisponiveis(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    }
  };

  const criarAtribuicao = async () => {
    if (!novaAtribuicao.equipamento_id || !novaAtribuicao.voluntario_id) {
      toast({
        title: "Erro",
        description: "Equipamento e voluntário são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .insert([
          {
            equipamento_id: novaAtribuicao.equipamento_id,
            voluntario_id: novaAtribuicao.voluntario_id,
            data_atribuicao: novaAtribuicao.data_atribuicao,
            data_devolucao_prevista: novaAtribuicao.data_devolucao_prevista,
            estado: 'ativa',
            observacoes: novaAtribuicao.observacoes,
            ativo: true
          }
        ]);

      if (error) throw error;

      // Atualizar estado do equipamento para 'atribuido'
      await supabase
        .from('equipamentos_2025_12_13_01_00')
        .update({ estado: 'atribuido' })
        .eq('id', novaAtribuicao.equipamento_id);

      toast({
        title: "Sucesso",
        description: "Atribuição criada com sucesso!",
      });

      setNovaAtribuicao({
        equipamento_id: '',
        voluntario_id: '',
        data_atribuicao: new Date().toISOString().split('T')[0],
        data_devolucao_prevista: '',
        observacoes: ''
      });
      
      setShowNovaAtribuicao(false);
      loadAtribuicoes();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar atribuição",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAtribuicoes();
    loadEquipamentosDisponiveis();
  }, []);

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'ativa': 'bg-green-100 text-green-800',
      'devolvida': 'bg-blue-100 text-blue-800',
      'atrasada': 'bg-red-100 text-red-800',
      'perdida': 'bg-gray-100 text-gray-800'
    };
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Carregando atribuições...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Atribuições de Equipamentos</h1>
                <p className="text-gray-600">Controle de atribuições e devoluções</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={loadAtribuicoes} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowNovaAtribuicao(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Atribuição
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{atribuicoes.length}</div>
                <p className="text-sm text-gray-600">Total de Atribuições</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {atribuicoes.filter(a => a.estado === 'ativa').length}
                </div>
                <p className="text-sm text-gray-600">Ativas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {atribuicoes.filter(a => a.estado === 'devolvida').length}
                </div>
                <p className="text-sm text-gray-600">Devolvidas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {atribuicoes.filter(a => a.estado === 'atrasada').length}
                </div>
                <p className="text-sm text-gray-600">Atrasadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Atribuições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Atribuições ({atribuicoes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Data Atribuição</TableHead>
                      <TableHead>Devolução Prevista</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atribuicoes.map((atribuicao) => (
                      <TableRow key={atribuicao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {atribuicao.equipamento?.codigo_interno || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {atribuicao.equipamento?.tipo_equipamento?.nome || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
<TableCell>
                          <div>
                            <div className="font-medium">
                              {atribuicao.voluntario?.display_name || atribuicao.voluntario?.nome || 'Voluntário não encontrado'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {atribuicao.voluntario?.email || 'Email não disponível'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell>
                          {new Date(atribuicao.data_devolucao_prevista).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getEstadoBadge(atribuicao.estado)}>
                            {atribuicao.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {atribuicao.estado === 'ativa' && (
                              <Button variant="outline" size="sm" className="text-green-600">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {atribuicoes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma atribuição encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal Nova Atribuição */}
      <Dialog open={showNovaAtribuicao} onOpenChange={setShowNovaAtribuicao}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Atribuição de Equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipamento">Equipamento *</Label>
                <Select 
                  value={novaAtribuicao.equipamento_id}
                  onValueChange={(value) => setNovaAtribuicao({...novaAtribuicao, equipamento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentosDisponiveis.map((equipamento) => (
                      <SelectItem key={equipamento.id} value={equipamento.id}>
                        {equipamento.codigo_interno} - {equipamento.tipo_equipamento?.nome || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
<div>
                <VoluntarioSelector
                  value={novaAtribuicao.voluntario_id}
                  onValueChange={(voluntarioId, voluntario) => {
                    setNovaAtribuicao({...novaAtribuicao, voluntario_id: voluntarioId});
                  }}
                  label="Voluntário"
                  placeholder="Selecione o voluntário..."
                  showFullName={true}
                  required
                />
              </div>
              <div>
                <Label htmlFor="data_atribuicao">Data de Atribuição</Label>
                <Input 
                  id="data_atribuicao" 
                  type="date"
                  value={novaAtribuicao.data_atribuicao}
                  onChange={(e) => setNovaAtribuicao({...novaAtribuicao, data_atribuicao: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="data_devolucao">Data de Devolução Prevista</Label>
                <Input 
                  id="data_devolucao" 
                  type="date"
                  value={novaAtribuicao.data_devolucao_prevista}
                  onChange={(e) => setNovaAtribuicao({...novaAtribuicao, data_devolucao_prevista: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Observações sobre a atribuição..."
                rows={3}
                value={novaAtribuicao.observacoes}
                onChange={(e) => setNovaAtribuicao({...novaAtribuicao, observacoes: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowNovaAtribuicao(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={criarAtribuicao}
            >
              Criar Atribuição
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default EquipamentosAtribuicoes;