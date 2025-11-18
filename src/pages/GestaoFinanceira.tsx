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
  AlertCircle,
  CheckCircle,
  Loader2
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

interface Animal {
  id: string;
  nome: string;
}

interface Voluntario {
  id: string;
  nome: string;
}

const GestaoFinanceira = () => {
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: "",
    tipo_movimento: "",
    categoria: "",
    descricao: "",
    valor: "",
    data_movimento: new Date().toISOString().split('T')[0],
    voluntario_id: "",
    observacoes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados financeiros...');

      // Buscar movimentos financeiros
      const { data: movimentosData, error: movimentosError } = await supabase
        .from('movimentos_financeiros')
        .select(`
          *,
          animal:animais(nome),
          voluntario:voluntarios(nome)
        `)
        .order('data_movimento', { ascending: false });

      if (movimentosError) {
        console.error('❌ Erro ao carregar movimentos:', movimentosError);
        throw movimentosError;
      }

      console.log('✅ Movimentos carregados:', movimentosData?.length || 0);

      // Buscar animais ativos
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais')
        .select('id, nome')
        .eq('arquivado', false)
        .order('nome');

      if (animaisError) {
        console.error('❌ Erro ao carregar animais:', animaisError);
        throw animaisError;
      }

      console.log('✅ Animais carregados:', animaisData?.length || 0);

      // Buscar voluntários ativos
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (voluntariosError) {
        console.error('❌ Erro ao carregar voluntários:', voluntariosError);
        throw voluntariosError;
      }

      console.log('✅ Voluntários carregados:', voluntariosData?.length || 0);

      setMovimentos(movimentosData || []);
      setAnimais(animaisData || []);
      setVoluntarios(voluntariosData || []);

    } catch (error: any) {
      console.error('❌ Erro geral ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Não foi possível carregar os dados financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CORREÇÃO: Validar campos obrigatórios e valores
    if (!formData.tipo_movimento || !formData.categoria || !formData.descricao || !formData.valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Tipo, categoria, descrição e valor são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // CORREÇÃO: Validar valor financeiro
    const valorNumerico = parseFloat(formData.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser um número positivo maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (valorNumerico > 999999.99) {
      toast({
        title: "Valor muito alto",
        description: "O valor não pode exceder €999.999,99.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log('💰 Inserindo movimento financeiro:', {
        ...formData,
        valor: valorNumerico
      });
      
      const movimentoData = {
        animal_id: formData.animal_id || null,
        tipo_movimento: formData.tipo_movimento,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: valorNumerico,
        data_movimento: formData.data_movimento,
        voluntario_id: formData.voluntario_id || null,
        observacoes: formData.observacoes || null
      };

      const { data, error } = await supabase
        .from('movimentos_financeiros')
        .insert(movimentoData)
        .select(`
          *,
          animal:animais(nome),
          voluntario:voluntarios(nome)
        `);

      if (error) {
        console.error('❌ Erro ao inserir movimento:', error);
        throw error;
      }

      console.log('✅ Movimento inserido com sucesso:', data);

      toast({
        title: "✅ Movimento registado",
        description: `${formData.tipo_movimento} de €${valorNumerico.toFixed(2)} registada com sucesso.`,
      });

      // Resetar formulário
      setFormData({
        animal_id: "",
        tipo_movimento: "",
        categoria: "",
        descricao: "",
        valor: "",
        data_movimento: new Date().toISOString().split('T')[0],
        voluntario_id: "",
        observacoes: ""
      });
      
      // Fechar diálogo
      setDialogOpen(false);
      
      // Recarregar dados
      console.log('🔄 Recarregando dados após inserção...');
      await fetchData();

    } catch (error: any) {
      console.error('❌ Erro ao registar movimento:', error);
      toast({
        title: "Erro ao registar movimento",
        description: error.message || "Não foi possível registar o movimento financeiro",
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
              <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
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
                    <DialogTitle>Registar Novo Movimento</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova receita ou despesa ao sistema financeiro
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo_movimento">Tipo de Movimento *</Label>
                        <Select 
                          value={formData.tipo_movimento} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_movimento: value }))}
                          required
                        >
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
                        <Select 
                          value={formData.categoria} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                          required
                        >
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
                    </div>
                    
                    <div>
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Input
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descrição do movimento"
                        required
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valor">Valor (€) *</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="999999.99"
                          value={formData.valor}
                          onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                          placeholder="0.00 (apenas valores positivos)"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Máximo: €999.999,99</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="data_movimento">Data do Movimento *</Label>
                        <Input
                          id="data_movimento"
                          type="date"
                          value={formData.data_movimento}
                          onChange={(e) => setFormData(prev => ({ ...prev, data_movimento: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="animal_id">Animal (Opcional)</Label>
                        <Select 
                          value={formData.animal_id} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, animal_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um animal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum animal específico</SelectItem>
                            {animais.map((animal) => (
                              <SelectItem key={animal.id} value={animal.id}>
                                {animal.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="voluntario_id">Voluntário (Opcional)</Label>
                        <Select 
                          value={formData.voluntario_id} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, voluntario_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um voluntário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum voluntário específico</SelectItem>
                            {voluntarios.map((voluntario) => (
                              <SelectItem key={voluntario.id} value={voluntario.id}>
                                {voluntario.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Observações adicionais (opcional)"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
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
                            Registar Movimento
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
              Histórico completo de receitas e despesas
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
                      <TableHead>Animal</TableHead>
                      <TableHead>Voluntário</TableHead>
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
                        <TableCell className="max-w-xs truncate">
                          {movimento.descricao}
                        </TableCell>
                        <TableCell>
                          {movimento.animal?.nome || '-'}
                        </TableCell>
                        <TableCell>
                          {movimento.voluntario?.nome || '-'}
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