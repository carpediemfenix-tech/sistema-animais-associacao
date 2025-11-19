import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  tipo_movimento: 'Receita' | 'Despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data_movimento: string;
  voluntario_id?: string;
  observacoes?: string;
  animal?: { nome: string };
  voluntario?: { nome: string };
}

const GestaoFinanceira = () => {
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Formulário simplificado - apenas campos essenciais
  const [tipoMovimento, setTipoMovimento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataMovimento, setDataMovimento] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchMovimentos();
  }, []);

  const fetchMovimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💰 [FINANCEIRO] Carregando movimentos...');

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .select('*')
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [FINANCEIRO] INICIANDO SUBMISSÃO...');
    console.log('📝 [FINANCEIRO] Dados do formulário:', {
      tipoMovimento,
      categoria,
      descricao,
      valor,
      dataMovimento,
      observacoes
    });
    
    // Log do estado atual da tabela
    console.log('🔍 [FINANCEIRO] Verificando conexão com Supabase...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('movimentos_financeiros')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ [FINANCEIRO] Erro de conexão:', testError);
        throw new Error(`Erro de conexão: ${testError.message}`);
      }
      
      console.log('✅ [FINANCEIRO] Conexão OK');
    } catch (connectionError: any) {
      console.error('💥 [FINANCEIRO] Falha na conexão:', connectionError);
      toast({
        title: "❌ Erro de Conexão",
        description: "Não foi possível conectar à base de dados",
        variant: "destructive",
      });
      return;
    }
    
    // Validação básica
    if (!tipoMovimento) {
      toast({
        title: "❌ Campo obrigatório",
        description: "Selecione o tipo de movimento",
        variant: "destructive",
      });
      return;
    }

    if (!categoria) {
      toast({
        title: "❌ Campo obrigatório", 
        description: "Selecione uma categoria",
        variant: "destructive",
      });
      return;
    }

    if (!descricao.trim()) {
      toast({
        title: "❌ Campo obrigatório",
        description: "Insira uma descrição",
        variant: "destructive",
      });
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (!valor || valorNumerico <= 0) {
      toast({
        title: "❌ Valor inválido",
        description: "Insira um valor positivo maior que zero",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log('💾 [FINANCEIRO] Preparando inserção...');
      
      // Dados mínimos para inserção
      const dadosInserir = {
        tipo_movimento: tipoMovimento,
        categoria: categoria,
        descricao: descricao.trim(),
        valor: valorNumerico,
        data_movimento: dataMovimento,
        observacoes: observacoes.trim() || null
      };

      console.log('📤 [FINANCEIRO] Dados para inserir:', dadosInserir);

      // Inserção simples sem JOINs
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

      // Fechar modal e resetar
      setDialogOpen(false);
      resetForm();
      
      // Recarregar lista
      console.log('🔄 [FINANCEIRO] Recarregando lista...');
      await fetchMovimentos();

    } catch (error: any) {
      console.error('💥 [FINANCEIRO] Erro ao registar:', error);
      
      let mensagem = "Não foi possível registar o movimento";
      
      if (error.message?.includes('check constraint')) {
        mensagem = "Valores inválidos. Verifique o tipo de movimento e categoria.";
      } else if (error.message?.includes('not-null')) {
        mensagem = "Todos os campos obrigatórios devem ser preenchidos.";
      } else if (error.message) {
        mensagem = error.message;
      }

      toast({
        title: "❌ Erro ao registar",
        description: mensagem,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar gestão financeira...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchMovimentos}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gestão Financeira</h1>
                  <p className="text-sm text-gray-500">
                    {movimentos.length} movimentos registados
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={fetchMovimentos} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Movimento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      Novo Movimento Financeiro
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDialogOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogTitle>
                    <DialogDescription>
                      Registar nova receita ou despesa
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="tipo_movimento">Tipo *</Label>
                      <Select value={tipoMovimento} onValueChange={setTipoMovimento}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Receita">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span>Receita</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Despesa">
                            <div className="flex items-center space-x-2">
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span>Despesa</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select value={categoria} onValueChange={setCategoria}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Veterinário">Veterinário</SelectItem>
                          <SelectItem value="Medicação">Medicação</SelectItem>
                          <SelectItem value="Alimentação">Alimentação</SelectItem>
                          <SelectItem value="Transporte">Transporte</SelectItem>
                          <SelectItem value="Doação">Doação</SelectItem>
                          <SelectItem value="Adoção">Adoção</SelectItem>
                          <SelectItem value="Equipamento">Equipamento</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Input
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descrição do movimento"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valor">Valor (€) *</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="999999.99"
                          value={valor}
                          onChange={(e) => setValor(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="data_movimento">Data *</Label>
                        <Input
                          id="data_movimento"
                          type="date"
                          value={dataMovimento}
                          onChange={(e) => setDataMovimento(e.target.value)}
                        />
                      </div>
                    </div>
                    
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Receitas</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalReceitas)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Despesas</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalDespesas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-r ${saldoAtual >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${saldoAtual >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm font-medium`}>
                    Saldo Atual
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(saldoAtual)}</p>
                </div>
                <DollarSign className={`h-8 w-8 ${saldoAtual >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Movimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Movimentos Financeiros</span>
            </CardTitle>
            <CardDescription>
              Histórico de receitas e despesas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movimentos.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum movimento registado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece registando o primeiro movimento financeiro
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Primeiro Movimento
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentos.map((movimento) => (
                      <TableRow key={movimento.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(movimento.data_movimento)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              movimento.tipo_movimento === 'Receita' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {movimento.tipo_movimento}
                          </Badge>
                        </TableCell>
                        <TableCell>{movimento.categoria}</TableCell>
                        <TableCell className="max-w-xs">
                          <div>
                            <div className="font-medium">{movimento.descricao}</div>
                            {movimento.observacoes && (
                              <div className="text-sm text-gray-500 truncate">
                                {movimento.observacoes}
                              </div>
                            )}
                          </div>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoFinanceira;