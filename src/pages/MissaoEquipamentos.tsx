import React, { useState, useEffect } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Plus, 
  Wrench, 
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interfaces
interface Missao {
  id: string;
  codigo: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  status: string;
}

interface EquipamentoMissao {
  id: string;
  missao_id: string;
  equipamento_id: string;
  data_atribuicao: string;
  data_devolucao_prevista?: string;
  data_devolucao_real?: string;
  estado: string;
  observacoes?: string;
}

interface Equipamento {
  id: string;
  codigo_interno: string;
  nome: string;
  tipo: string;
  estado: string;
}

const MissaoEquipamentos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principais
  const [missao, setMissao] = useState<Missao | null>(null);
  const [equipamentosMissao, setEquipamentosMissao] = useState<EquipamentoMissao[]>([]);
  const [equipamentosDisponiveis, setEquipamentosDisponiveis] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para diálogos
  const [equipamentoDialogOpen, setEquipamentoDialogOpen] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<EquipamentoMissao | null>(null);

  // Estados para formulários
  const [equipamentoForm, setEquipamentoForm] = useState({
    equipamento_id: '',
    data_atribuicao: new Date().toISOString().split('T')[0],
    data_devolucao_prevista: '',
    observacoes: ''
  });

  // Carregar dados
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadMissao(),
        loadEquipamentosMissao(),
        loadEquipamentosDisponiveis()
      ]);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMissao = async () => {
    const { data, error } = await supabase
      .from('missoes_2025_12_21_19_00')
      .select('id, codigo, titulo, data_inicio, data_fim, status')
      .eq('id', id)
      .single();

    if (error) throw error;
    setMissao(data);
  };

  const loadEquipamentosMissao = async () => {
    // Por enquanto, usar dados mock até criar a tabela de equipamentos
    setEquipamentosMissao([]);
  };

  const loadEquipamentosDisponiveis = async () => {
    // Por enquanto, usar dados mock até integrar com a tabela de equipamentos
    setEquipamentosDisponiveis([]);
  };

  // Obter badge de estado
  const getEstadoBadge = (estado: string) => {
    const estadoConfig = {
      'atribuido': { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Atribuído' },
      'em_uso': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Em Uso' },
      'devolvido': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Devolvido' },
      'danificado': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Danificado' }
    };

    const config = estadoConfig[estado as keyof typeof estadoConfig] || estadoConfig.atribuido;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Wrench className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando equipamentos...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dados</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/modulo-missoes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Missões
            </Button>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/missao/${id}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar à Missão</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Equipamentos - {missao?.codigo}
              </h1>
              <p className="text-gray-600">{missao?.titulo}</p>
            </div>
          </div>
        </div>

        {/* Estatísticas de Equipamentos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Atribuído</p>
                  <p className="text-3xl font-bold text-blue-600">{equipamentosMissao.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Uso</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {equipamentosMissao.filter(e => e.estado === 'em_uso').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Devolvidos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {equipamentosMissao.filter(e => e.estado === 'devolvido').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-3xl font-bold text-gray-600">{equipamentosDisponiveis.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Equipamentos */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5" />
                  <span>Equipamentos da Missão</span>
                </CardTitle>
                <CardDescription>
                  Gestão de equipamentos atribuídos à missão
                </CardDescription>
              </div>
              <Button onClick={() => setEquipamentoDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Atribuir Equipamento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {equipamentosMissao.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum equipamento atribuído
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece por atribuir o primeiro equipamento a esta missão.
                </p>
                <Button onClick={() => setEquipamentoDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Atribuir Primeiro Equipamento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Atribuição</TableHead>
                    <TableHead>Devolução Prevista</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipamentosMissao.map((equipamento) => (
                    <TableRow key={equipamento.id}>
                      <TableCell className="font-medium">
                        EQ-001
                      </TableCell>
                      <TableCell>Nome do Equipamento</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>
                        {new Date(equipamento.data_atribuicao).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell>
                        {equipamento.data_devolucao_prevista 
                          ? new Date(equipamento.data_devolucao_prevista).toLocaleDateString('pt-PT')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(equipamento.estado)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para Atribuir/Editar Equipamento */}
      <Dialog open={equipamentoDialogOpen} onOpenChange={setEquipamentoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEquipamento ? 'Editar Atribuição' : 'Atribuir Equipamento'}
            </DialogTitle>
            <DialogDescription>
              {editingEquipamento ? 'Edite os dados da atribuição do equipamento' : 'Atribua um equipamento à missão'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Equipamento</Label>
              <Select value={equipamentoForm.equipamento_id} onValueChange={(value) => setEquipamentoForm(prev => ({ ...prev, equipamento_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mock">Nenhum equipamento disponível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_atribuicao">Data de Atribuição</Label>
              <Input
                id="data_atribuicao"
                type="date"
                value={equipamentoForm.data_atribuicao}
                onChange={(e) => setEquipamentoForm(prev => ({ ...prev, data_atribuicao: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="data_devolucao_prevista">Data de Devolução Prevista</Label>
              <Input
                id="data_devolucao_prevista"
                type="date"
                value={equipamentoForm.data_devolucao_prevista}
                onChange={(e) => setEquipamentoForm(prev => ({ ...prev, data_devolucao_prevista: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={equipamentoForm.observacoes}
                onChange={(e) => setEquipamentoForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre a atribuição (opcional)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setEquipamentoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button>
              {editingEquipamento ? 'Atualizar' : 'Atribuir'} Equipamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default MissaoEquipamentos;