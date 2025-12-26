import React, { useState, useEffect } from 'react';
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
  Euro, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  Edit,
  Trash2,
  DollarSign
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
  orcamento_previsto: number;
}

interface MovimentoFinanceiro {
  id: string;
  missao_id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data_movimento: string;
  categoria: string;
  observacoes?: string;
}

const MissaoFinanceiro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados principais
  const [missao, setMissao] = useState<Missao | null>(null);
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para diálogos
  const [movimentoDialogOpen, setMovimentoDialogOpen] = useState(false);
  const [editingMovimento, setEditingMovimento] = useState<MovimentoFinanceiro | null>(null);

  // Estados para formulários
  const [movimentoForm, setMovimentoForm] = useState({
    tipo: 'despesa',
    descricao: '',
    valor: '',
    data_movimento: new Date().toISOString().split('T')[0],
    categoria: 'geral',
    observacoes: ''
  });

  // Carregar dados
  useEffect(() => {
    console.log('🎯 ID da missão capturado (Financeiro):', id);
    if (id) {
      loadData();
    } else {
      console.error('❌ ID da missão não encontrado');
      setError('ID da missão não encontrado');
      setLoading(false);
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadMissao(),
        loadMovimentos()
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
      .select('id, codigo, titulo, data_inicio, data_fim, status, orcamento_previsto')
      .eq('id', id)
      .single();

    if (error) throw error;
    setMissao(data);
  };

  const loadMovimentos = async () => {
    const { data, error } = await supabase
      .from('movimentos_financeiros_2025_12_22_03_00')
      .select('*')
      .eq('missao_id', id)
      .order('data_movimento', { ascending: false });

    if (error) throw error;
    setMovimentos(data || []);
  };

  // Calcular estatísticas
  const receitas = movimentos.filter(m => m.tipo === 'receita').reduce((sum, m) => sum + m.valor, 0);
  const despesas = movimentos.filter(m => m.tipo === 'despesa').reduce((sum, m) => sum + m.valor, 0);
  const saldo = receitas - despesas;

  // Funções para gestão de movimentos
  const handleCreateMovimento = async () => {
    try {
      // Validação básica
      if (!movimentoForm.descricao || !movimentoForm.valor) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha a descrição e o valor",
          variant: "destructive",
        });
        return;
      }

      const movimentoData = {
        missao_id: id,
        tipo: movimentoForm.tipo,
        descricao: movimentoForm.descricao,
        valor: parseFloat(movimentoForm.valor),
        data_movimento: movimentoForm.data_movimento,
        categoria: movimentoForm.categoria,
        observacoes: movimentoForm.observacoes || null
      };

      if (editingMovimento) {
        // Atualizar movimento existente
        const { error: updateError } = await supabase
          .from('movimentos_financeiros_2025_12_22_03_00')
          .update(movimentoData)
          .eq('id', editingMovimento.id);

        if (updateError) throw updateError;
        
        toast({
          title: "Movimento atualizado",
          description: "Movimento financeiro atualizado com sucesso!",
        });
      } else {
        // Inserir novo movimento
        const { error: insertError } = await supabase
          .from('movimentos_financeiros_2025_12_22_03_00')
          .insert([movimentoData]);

        if (insertError) throw insertError;
        
        toast({
          title: "Movimento criado",
          description: "Movimento financeiro criado com sucesso!",
        });
      }

      setMovimentoDialogOpen(false);
      resetMovimentoForm();
      await loadMovimentos(); // Recarregar a lista
    } catch (error: any) {
      console.error('❌ Erro ao criar movimento:', error);
      toast({
        title: "Erro ao criar movimento",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const resetMovimentoForm = () => {
    setMovimentoForm({
      tipo: 'despesa',
      descricao: '',
      valor: '',
      data_movimento: new Date().toISOString().split('T')[0],
      categoria: 'geral',
      observacoes: ''
    });
    setEditingMovimento(null);
  };

  const handleEditMovimento = (movimento: MovimentoFinanceiro) => {
    setEditingMovimento(movimento);
    setMovimentoForm({
      tipo: movimento.tipo,
      descricao: movimento.descricao,
      valor: movimento.valor.toString(),
      data_movimento: movimento.data_movimento,
      categoria: movimento.categoria,
      observacoes: movimento.observacoes || ''
    });
    setMovimentoDialogOpen(true);
  };

  const handleDeleteMovimento = async (movimento: MovimentoFinanceiro) => {
    if (!confirm('Tem certeza que deseja excluir este movimento financeiro?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('movimentos_financeiros_2025_12_22_03_00')
        .delete()
        .eq('id', movimento.id);

      if (error) throw error;

      toast({
        title: "Movimento excluído",
        description: "Movimento financeiro excluído com sucesso!",
      });

      await loadMovimentos();
    } catch (error: any) {
      console.error('❌ Erro ao excluir movimento:', error);
      toast({
        title: "Erro ao excluir movimento",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <DollarSign className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados financeiros...</p>
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
                Financeiro - {missao?.codigo}
              </h1>
              <p className="text-gray-600">{missao?.titulo}</p>
            </div>
          </div>
        </div>

        {/* Estatísticas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orçamento Previsto</p>
                  <p className="text-3xl font-bold text-blue-600">€{missao?.orcamento_previsto || 0}</p>
                </div>
                <Euro className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receitas</p>
                  <p className="text-3xl font-bold text-green-600">€{receitas.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas</p>
                  <p className="text-3xl font-bold text-red-600">€{despesas.toFixed(2)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{saldo.toFixed(2)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Movimentos */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Movimentos Financeiros</span>
                </CardTitle>
                <CardDescription>
                  Gestão de receitas e despesas da missão
                </CardDescription>
              </div>
              <Button onClick={() => setMovimentoDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Movimento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {movimentos.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum movimento registado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece por adicionar o primeiro movimento financeiro desta missão.
                </p>
                <Button onClick={() => setMovimentoDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Movimento
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell>
                        {new Date(movimento.data_movimento).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={movimento.tipo === 'receita' ? 'default' : 'destructive'}>
                          {movimento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell>{movimento.descricao}</TableCell>
                      <TableCell>{movimento.categoria}</TableCell>
                      <TableCell className={movimento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        €{movimento.valor.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditMovimento(movimento)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteMovimento(movimento)}
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

      {/* Modal para Novo/Editar Movimento */}
      <Dialog open={movimentoDialogOpen} onOpenChange={setMovimentoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMovimento ? 'Editar Movimento' : 'Novo Movimento Financeiro'}
            </DialogTitle>
            <DialogDescription>
              {editingMovimento ? 'Edite os dados do movimento financeiro' : 'Adicione um novo movimento financeiro à missão'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select value={movimentoForm.tipo} onValueChange={(value) => setMovimentoForm(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={movimentoForm.descricao}
                onChange={(e) => setMovimentoForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição do movimento"
              />
            </div>

            <div>
              <Label htmlFor="valor">Valor (€)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={movimentoForm.valor}
                onChange={(e) => setMovimentoForm(prev => ({ ...prev, valor: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="data_movimento">Data</Label>
              <Input
                id="data_movimento"
                type="date"
                value={movimentoForm.data_movimento}
                onChange={(e) => setMovimentoForm(prev => ({ ...prev, data_movimento: e.target.value }))}
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <Select value={movimentoForm.categoria} onValueChange={(value) => setMovimentoForm(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="veterinario">Veterinário</SelectItem>
                  <SelectItem value="doacao">Doação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={movimentoForm.observacoes}
                onChange={(e) => setMovimentoForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais (opcional)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setMovimentoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMovimento}>
              {editingMovimento ? 'Atualizar' : 'Criar'} Movimento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default MissaoFinanceiro;