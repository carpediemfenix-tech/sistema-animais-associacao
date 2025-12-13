import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  RefreshCw,
  CheckCircle,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  PawPrint,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DebugLoggerComponent, { debugLogger } from "@/components/DebugLogger";

const GestaoMovimentos = () => {
  const { hasPermission } = useAuth();
  const [movimentos, setMovimentos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMovimento, setEditingMovimento] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movimentoToDelete, setMovimentoToDelete] = useState<any>(null);

  // Estados do formulário melhorado
  const [formData, setFormData] = useState({
    tipo_movimento: '',
    escopo: '',
    categoria_id: '',
    descricao: '',
    valor: '',
    data_movimento: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();

  const fetchCategorias = async () => {
    try {
      debugLogger.log('info', 'Carregando categorias...');
      
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) {
        debugLogger.log('error', 'Erro ao carregar categorias', error);
        setCategorias([]);
        return;
      }

      debugLogger.log('success', `Categorias carregadas: ${data?.length || 0}`, data?.slice(0, 3));
      setCategorias(data || []);

    } catch (error: any) {
      debugLogger.log('error', 'Erro geral ao carregar categorias', error);
      setCategorias([]);
    }
  };

  const fetchMovimentos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando movimentos...');

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Erro ao carregar movimentos:', error);
        throw error;
      }

      console.log('✅ Movimentos carregados:', data?.length || 0);
      setMovimentos(data || []);

    } catch (error: any) {
      console.error('💥 Erro geral:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_movimento: '',
      escopo: '',
      categoria_id: '',
      descricao: '',
      valor: '',
      data_movimento: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo_movimento || !formData.escopo || !formData.categoria_id || !formData.descricao || !formData.valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const valorNumerico = parseFloat(formData.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Gerar número do movimento
      const { data: numeroData, error: numeroError } = await supabase
        .rpc('gerar_numero_movimento');

      if (numeroError) throw numeroError;

      // Usar categoria selecionada
      const dadosInserir = {
        numero_movimento: numeroData,
        tipo_movimento: formData.tipo_movimento,
        escopo: formData.escopo,
        categoria_id: formData.categoria_id,
        descricao: formData.descricao.trim(),
        valor: valorNumerico,
        data_movimento: formData.data_movimento,
        status: 'confirmado'
      };

      let error;
      
      if (editingMovimento) {
        // Atualizar movimento existente
        const { error: updateError } = await supabase
          .from('movimentos_financeiros_2025_12_13_03_00')
          .update(dadosInserir)
          .eq('id', editingMovimento.id);
        error = updateError;
      } else {
        // Criar novo movimento
        const { error: insertError } = await supabase
          .from('movimentos_financeiros_2025_12_13_03_00')
          .insert([dadosInserir]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingMovimento ? "Movimento atualizado!" : "Movimento registado!",
        description: `${formData.tipo_movimento} de €${valorNumerico.toFixed(2)} ${editingMovimento ? 'atualizada' : 'registada'} com sucesso`,
      });

      setDialogOpen(false);
      setEditingMovimento(null);
      resetForm();
      await fetchMovimentos();

    } catch (error: any) {
      console.error('❌ Erro ao registar:', error);
      toast({
        title: "Erro ao registar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Função para editar movimento
  const handleEditMovimento = (movimento: any) => {
    setEditingMovimento(movimento);
    setFormData({
      tipo_movimento: String(movimento.tipo_movimento || ''),
      escopo: String(movimento.escopo || ''),
      categoria_id: String(movimento.categoria_id || ''),
      descricao: String(movimento.descricao || ''),
      valor: String(movimento.valor || ''),
      data_movimento: String(movimento.data_movimento || new Date().toISOString().split('T')[0])
    });
    setDialogOpen(true);
  };

  // Função para eliminar movimento
  const handleDeleteMovimento = async () => {
    if (!movimentoToDelete) return;

    try {
      const { error } = await supabase
        .from('movimentos_financeiros_2025_12_13_03_00')
        .delete()
        .eq('id', movimentoToDelete.id);

      if (error) throw error;

      toast({
        title: "Movimento eliminado",
        description: "O movimento foi eliminado com sucesso.",
      });

      setDeleteDialogOpen(false);
      setMovimentoToDelete(null);
      await fetchMovimentos();
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Função para abrir diálogo de eliminação
  const openDeleteDialog = (movimento: any) => {
    setMovimentoToDelete(movimento);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    debugLogger.log('info', 'EKO: GestaoMovimentos iniciando...');
    fetchCategorias();
    fetchMovimentos();
  }, []);
  
  // Log quando categorias mudam
  useEffect(() => {
    debugLogger.log('debug', `EKO: Categorias atualizadas no estado: ${categorias.length}`);
    if (categorias.length > 0) {
      debugLogger.log('debug', 'EKO: Primeiras categorias no estado', categorias.slice(0, 3).map(c => c.nome));
    }
  }, [categorias]);

  // Filtrar categorias baseadas no tipo e escopo selecionados
  const categoriasFiltradasPorEscopo = categorias.filter(cat => 
    (!formData.escopo || cat.escopo === formData.escopo || cat.escopo === 'ambos') &&
    (!formData.tipo_movimento || cat.tipo === formData.tipo_movimento)
  );
  
  // Debug logs
  debugLogger.log('debug', 'Debug categorias filtradas', {
    totalCategorias: categorias.length,
    categoriasFiltradasPorEscopo: categoriasFiltradasPorEscopo.length,
    formData: { tipo: formData.tipo_movimento, escopo: formData.escopo },
    primeirasCategoriasOriginais: categorias.slice(0, 2),
    primeirasCategoriasFiltradasPorEscopo: categoriasFiltradasPorEscopo.slice(0, 2)
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  // Cálculos básicos
  const totalReceitas = movimentos
    .filter(m => m.tipo_movimento === 'receita')
    .reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);

  const totalDespesas = movimentos
    .filter(m => m.tipo_movimento === 'despesa')
    .reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);

  const saldoAtual = totalReceitas - totalDespesas;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar movimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Resumo Básico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Receitas</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReceitas)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Despesas</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(totalDespesas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border-2 ${saldoAtual >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {formatCurrency(saldoAtual)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${saldoAtual >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações e Lista */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Movimentos Financeiros</CardTitle>
              <div className="flex space-x-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Movimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingMovimento ? 'Editar Movimento Financeiro' : 'Novo Movimento Financeiro'}</DialogTitle>
                      <DialogDescription>
                        {editingMovimento ? 'Atualizar receita ou despesa existente' : 'Registar nova receita ou despesa (versão simplificada)'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Tipo e Escopo */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipo_movimento">Tipo *</Label>
                          <Select value={formData.tipo_movimento || ''} onValueChange={(value) => setFormData({...formData, tipo_movimento: value, categoria_id: ''})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receita">💰 Receita</SelectItem>
                              <SelectItem value="despesa">💸 Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="escopo">Escopo *</Label>
                          <Select value={formData.escopo || ''} onValueChange={(value) => setFormData({...formData, escopo: value, categoria_id: ''})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escopo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="associacao">🏢 Associação</SelectItem>
                              <SelectItem value="animal">🐾 Animal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Categoria */}
                      <div>
                        <Label htmlFor="categoria_id">Categoria *</Label>
                        <Select value={formData.categoria_id || ''} onValueChange={(value) => setFormData({...formData, categoria_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriasFiltradasPorEscopo.map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.id}>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: categoria.cor }}
                                  />
                                  <span>{categoria.nome}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          {categoriasFiltradasPorEscopo.length} categorias disponíveis
                        </p>
                      </div>
                      
                      {/* Descrição */}
                      <div>
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Input
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                          placeholder="Descrição do movimento"
                          required
                        />
                      </div>
                      
                      {/* Valor e Data */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="valor">Valor (€) *</Label>
                          <Input
                            id="valor"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.valor}
                            onChange={(e) => setFormData({...formData, valor: e.target.value})}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="data_movimento">Data *</Label>
                          <Input
                            id="data_movimento"
                            type="date"
                            value={formData.data_movimento}
                            onChange={(e) => setFormData({...formData, data_movimento: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Botões */}
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setDialogOpen(false);
                            setEditingMovimento(null);
                            resetForm();
                          }}
                          disabled={submitting}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {editingMovimento ? 'A atualizar...' : 'A registar...'}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {editingMovimento ? 'Atualizar' : 'Registar'}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={fetchMovimentos}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Lista Simples */}
            {movimentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum movimento encontrado</p>
                <p className="text-sm">Os movimentos financeiros aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {movimentos.map((movimento) => (
                  <div key={movimento.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${movimento.tipo_movimento === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {movimento.tipo_movimento === 'receita' ? 
                          <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{movimento.descricao}</p>
                        <p className="text-sm text-gray-500">
                          {movimento.escopo} • {formatDate(movimento.data_movimento)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-bold ${movimento.tipo_movimento === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {movimento.tipo_movimento === 'receita' ? '+' : '-'}{formatCurrency(parseFloat(movimento.valor) || 0)}
                        </p>
                        <p className="text-xs text-gray-500">{movimento.numero_movimento}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMovimento(movimento)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(movimento)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Debug Logger */}
      <DebugLoggerComponent title="Gestão Movimentos - Debug" />
      
      {/* Diálogo de Confirmação de Eliminação */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja eliminar este movimento financeiro?
            </DialogDescription>
          </DialogHeader>
          {movimentoToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{movimentoToDelete.descricao}</p>
                <p className="text-sm text-gray-600">
                  {movimentoToDelete.tipo_movimento === 'receita' ? 'Receita' : 'Despesa'} de {formatCurrency(parseFloat(movimentoToDelete.valor) || 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(movimentoToDelete.data_movimento)}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteMovimento}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoMovimentos;