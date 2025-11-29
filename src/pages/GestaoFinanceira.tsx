import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
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
  ArrowLeft, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  RefreshCw,
  CheckCircle,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MovimentoFinanceiro {
  id: string;
  animal_id?: string;
  categoria_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data_movimento: string;
  metodo_pagamento?: string;
  observacoes?: string;
  animal?: { nome: string; numero_processo?: string };
  categorias_financeiras?: { nome: string; icone: string; cor: string };
}

interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  icone: string;
  cor: string;
  ativo: boolean;
}

const GestaoFinanceira = () => {
  const { hasPermission } = useAuth();
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados do formulário
  const [tipoMovimento, setTipoMovimento] = useState<'receita' | 'despesa'>('despesa');
  const [categoriaId, setCategoriaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataMovimento, setDataMovimento] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState("");
  const [animalSelecionado, setAnimalSelecionado] = useState("");
  
  // Estados para dados
  const [animais, setAnimais] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loadingAnimais, setLoadingAnimais] = useState(false);
  
  const { toast } = useToast();

  const fetchMovimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💰 [FINANCEIRO] Carregando movimentos...');

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .select(`
          *,
          animais(nome, numero_processo),
          categorias_financeiras(nome, icone, cor)
        `)
        .order('data_movimento', { ascending: false });

      if (error) {
        console.error('❌ [FINANCEIRO] Erro:', error);
        throw error;
      }

      console.log('✅ [FINANCEIRO] Movimentos carregados:', data?.length || 0);
      setMovimentos(data || []);

    } catch (error: any) {
      console.error('💥 [FINANCEIRO] Erro geral:', error);
      setError(error.message);
      toast({
        title: "❌ Erro ao carregar dados",
        description: error.message || "Não foi possível carregar os movimentos financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimais = async () => {
    try {
      setLoadingAnimais(true);
      console.log('🐶 [FINANCEIRO] Carregando animais...');
      
      const { data, error } = await supabase
        .from('animais')
        .select('id, nome, numero_processo, especie')
        .eq('arquivado', false)
        .order('nome');

      if (error) {
        console.warn('⚠️ [FINANCEIRO] Erro ao carregar animais:', error.message);
        setAnimais([]);
        return;
      }

      console.log('✅ [FINANCEIRO] Animais carregados:', data?.length || 0);
      setAnimais(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.warn('💥 [FINANCEIRO] Erro ao carregar animais:', error.message);
      setAnimais([]);
    } finally {
      setLoadingAnimais(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      console.log('💰 [FINANCEIRO] Carregando categorias...');
      
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.warn('⚠️ [FINANCEIRO] Erro ao carregar categorias:', error.message);
        setCategorias([]);
        return;
      }

      console.log('✅ [FINANCEIRO] Categorias carregadas:', data?.length || 0);
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.warn('💥 [FINANCEIRO] Erro ao carregar categorias:', error.message);
      setCategorias([]);
    }
  };

  const resetForm = () => {
    setTipoMovimento('despesa');
    setCategoriaId("");
    setDescricao("");
    setValor("");
    setDataMovimento(new Date().toISOString().split('T')[0]);
    setObservacoes("");
    setAnimalSelecionado("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipoMovimento || !categoriaId || !descricao || !valor) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast({
        title: "❌ Valor inválido",
        description: "O valor deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const dadosInserir = {
        categoria_id: categoriaId,
        tipo: tipoMovimento,
        descricao: descricao.trim(),
        valor: valorNumerico,
        data_movimento: dataMovimento,
        observacoes: observacoes.trim() || null,
        animal_id: animalSelecionado || null
      };

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .insert([dadosInserir])
        .select('*');

      if (error) throw error;

      toast({
        title: "✅ Movimento registado!",
        description: `${tipoMovimento} de €${valorNumerico.toFixed(2)} registada com sucesso`,
      });

      setDialogOpen(false);
      resetForm();
      await fetchMovimentos();

    } catch (error: any) {
      toast({
        title: "❌ Erro ao registar",
        description: error.message || "Não foi possível registar o movimento",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchMovimentos();
    fetchAnimais();
    fetchCategorias();
  }, []);

  // Cálculos financeiros
  const totalReceitas = movimentos
    .filter(m => m.tipo === 'receita')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalDespesas = movimentos
    .filter(m => m.tipo === 'despesa')
    .reduce((sum, m) => sum + m.valor, 0);

  const saldoAtual = totalReceitas - totalDespesas;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (!hasPermission('read')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Não tem permissão para aceder à gestão financeira
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="Gestão Financeira" 
        subtitle="Controlo de receitas, despesas e movimentos financeiros"
        backTo="/"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Cabeçalho com Novo Movimento */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Movimentos Financeiros</h2>
            <p className="text-gray-600">Registo e controlo de todas as transações</p>
          </div>
            
          {hasPermission('create') && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Movimento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Movimento Financeiro</DialogTitle>
                  <DialogDescription>Registar nova receita ou despesa</DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tipo */}
                  <div>
                    <Label htmlFor="tipo_movimento">Tipo *</Label>
                    <Select value={tipoMovimento} onValueChange={(value: 'receita' | 'despesa') => setTipoMovimento(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">💰 Receita</SelectItem>
                        <SelectItem value="despesa">💸 Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Categoria */}
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={categoriaId} onValueChange={setCategoriaId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias
                          .filter(c => c.tipo === tipoMovimento)
                          .map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.icone} {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Descrição */}
                  <div>
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descrição do movimento"
                      required
                    />
                  </div>
                  
                  {/* Animal */}
                  <div>
                    <Label htmlFor="animal">Animal (Opcional)</Label>
                    <Select value={animalSelecionado} onValueChange={setAnimalSelecionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar animal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Movimento geral (sem animal)</SelectItem>
                        {animais.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            🐶 {animal.nome} - {animal.especie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      📝 Associar movimento a um animal específico
                    </p>
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
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="data_movimento">Data *</Label>
                      <Input
                        id="data_movimento"
                        type="date"
                        value={dataMovimento}
                        onChange={(e) => setDataMovimento(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Observações adicionais (opcional)"
                      rows={3}
                    />
                  </div>
                  
                  {/* Botões */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setDialogOpen(false);
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
                          A registar...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Registar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Receitas</p>
                  <p className="text-3xl font-bold text-green-700">{formatCurrency(totalReceitas)}</p>
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
                  <p className="text-3xl font-bold text-red-700">{formatCurrency(totalDespesas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border-2 ${saldoAtual >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                  <p className={`text-3xl font-bold ${saldoAtual >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {formatCurrency(saldoAtual)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${saldoAtual >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Movimentos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Histórico de Movimentos</CardTitle>
                <CardDescription>
                  {movimentos.length} movimentos registados
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMovimentos}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {movimentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum movimento registado</p>
                <p className="text-sm">Os movimentos financeiros aparecerão aqui</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell>{formatDate(movimento.data_movimento)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={movimento.tipo === 'receita' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }
                        >
                          {movimento.tipo === 'receita' ? '💰' : '💸'} {movimento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movimento.categorias_financeiras ? (
                          <span>
                            {movimento.categorias_financeiras.icone} {movimento.categorias_financeiras.nome}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{movimento.descricao}</TableCell>
                      <TableCell>
                        {movimento.animal ? (
                          <span className="text-blue-600">
                            🐶 {movimento.animal.nome}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={movimento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                          {movimento.tipo === 'receita' ? '+' : '-'}{formatCurrency(movimento.valor)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoFinanceira;