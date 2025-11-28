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
import { CategoriaFinanceira, Animal } from "@/types/animal";

interface MovimentoFinanceiro {
  id: string;
  animal_id?: string;
  tipo_movimento: 'Receita' | 'Despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data_movimento: string;
  voluntario_id?: string;
  observacoes?: string;
  animal?: { nome: string; numero_processo?: string };
  voluntario?: { nome: string };
}

const GestaoFinanceira = () => {
  const { hasPermission } = useAuth();
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [custosIntervencoes, setCustosIntervencoes] = useState(0);
  const [historicoUnificado, setHistoricoUnificado] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoMovimento, setEditandoMovimento] = useState<MovimentoFinanceiro | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Formulário básico
  const [tipoMovimento, setTipoMovimento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataMovimento, setDataMovimento] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState("");
  
  // 🐾 EKO: Estados para animais
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [animalSelecionado, setAnimalSelecionado] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchMovimentos();
    fetchAnimais();
  }, []);

  const fetchAnimais = async () => {
    try {
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
    }
  };

  const fetchMovimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💰 [FINANCEIRO] Carregando movimentos...');

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .select(`
          *,
          animais(nome, numero_processo)
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

  const resetForm = () => {
    setTipoMovimento("");
    setCategoria("");
    setDescricao("");
    setValor("");
    setDataMovimento(new Date().toISOString().split('T')[0]);
    setObservacoes("");
    setAnimalSelecionado("");
    setEditandoMovimento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipoMovimento || !categoria || !descricao || !valor) {
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
      console.log('💾 [FINANCEIRO] Preparando inserção...');
      
      const dadosInserir = {
        tipo_movimento: tipoMovimento,
        categoria: categoria,
        descricao: descricao.trim(),
        valor: valorNumerico,
        data_movimento: dataMovimento,
        observacoes: observacoes.trim() || null,
        animal_id: animalSelecionado || null // 🐶 EKO: ID do animal
      };

      console.log('📤 [FINANCEIRO] Dados para inserir:', dadosInserir);

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .insert([dadosInserir])
        .select('*');

      if (error) {
        console.error('💥 [FINANCEIRO] Erro na inserção:', error);
        throw error;
      }

      console.log('🎉 [FINANCEIRO] Inserção bem-sucedida:', data);

      toast({
        title: "✅ Movimento registado!",
        description: `${tipoMovimento} de €${valorNumerico.toFixed(2)} registada com sucesso`,
      });

      setDialogOpen(false);
      resetForm();
      await fetchMovimentos();

    } catch (error: any) {
      console.error('💥 [FINANCEIRO] Erro:', error);
      toast({
        title: "❌ Erro ao registar",
        description: error.message || "Não foi possível registar o movimento",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos financeiros
  const totalReceitas = movimentos
    .filter(m => m.tipo_movimento === 'Receita')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalDespesas = movimentos
    .filter(m => m.tipo_movimento === 'Despesa')
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
                  <DialogTitle>
                    Novo Movimento Financeiro
                  </DialogTitle>
                  <DialogDescription>
                    Registar nova receita ou despesa
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tipo de Movimento */}
                  <div>
                    <Label htmlFor="tipo_movimento">Tipo *</Label>
                    <Select value={tipoMovimento} onValueChange={setTipoMovimento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Receita">💰 Receita</SelectItem>
                        <SelectItem value="Despesa">💸 Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Categoria */}
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Veterinário">🏥 Veterinário</SelectItem>
                        <SelectItem value="Medicação">💊 Medicação</SelectItem>
                        <SelectItem value="Alimentação">🍖 Alimentação</SelectItem>
                        <SelectItem value="Transporte">🚗 Transporte</SelectItem>
                        <SelectItem value="Doação">❤️ Doação</SelectItem>
                        <SelectItem value="Adoção">🏠 Adoção</SelectItem>
                        <SelectItem value="Equipamento">🔧 Equipamento</SelectItem>
                        <SelectItem value="Outros">📝 Outros</SelectItem>
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
                  
                  {/* 🐶 EKO: SELEÇÃO DE ANIMAL - VERSÃO SEGURA */}
                  <div>
                    <Label htmlFor="animal">Animal (Opcional)</Label>
                    <Select value={animalSelecionado} onValueChange={setAnimalSelecionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar animal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Movimento geral</SelectItem>
                        <SelectItem value="test1">Animal Teste 1</SelectItem>
                        <SelectItem value="test2">Animal Teste 2</SelectItem>
                      </SelectContent>
                    </Select>
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
                          className={movimento.tipo_movimento === 'Receita' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }
                        >
                          {movimento.tipo_movimento === 'Receita' ? '💰' : '💸'} {movimento.tipo_movimento}
                        </Badge>
                      </TableCell>
                      <TableCell>{movimento.categoria}</TableCell>
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
                        <span className={movimento.tipo_movimento === 'Receita' ? 'text-green-600' : 'text-red-600'}>
                          {movimento.tipo_movimento === 'Receita' ? '+' : '-'}{formatCurrency(movimento.valor)}
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