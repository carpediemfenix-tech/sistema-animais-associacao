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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  PawPrint,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  cor: string;
  icone: string;
}

interface Animal {
  id: string;
  nome: string;
  especie: string;
  numero_processo?: string;
}

interface MovimentoFinanceiro {
  id: string;
  numero_movimento: string;
  tipo_movimento: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao';
  categoria: Categoria;
  animal?: Animal;
  descricao: string;
  valor: number;
  data_movimento: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  metodo_pagamento?: string;
  observacoes?: string;
  created_at: string;
}

const GestaoMovimentos = () => {
  const { hasPermission } = useAuth();
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filtros, setFiltros] = useState({
    escopo: '',
    tipo: '',
    categoria: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    busca: ''
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo_movimento: '',
    escopo: '',
    categoria_id: '',
    animal_id: '',
    descricao: '',
    valor: '',
    data_movimento: new Date().toISOString().split('T')[0],
    metodo_pagamento: '',
    observacoes: ''
  });

  const { toast } = useToast();

  const fetchDados = async () => {
    try {
      setLoading(true);

      // Buscar movimentos
      let query = supabase
        .from('movimentos_financeiros_2025_11_28_05_52')
        .select(`
          *,
          categoria:categorias_financeiras_2025_11_28_05_52(id, nome, tipo, escopo, cor, icone),
          animal:animais(id, nome, especie, numero_processo)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.escopo) query = query.eq('escopo', filtros.escopo);
      if (filtros.tipo) query = query.eq('tipo_movimento', filtros.tipo);
      if (filtros.categoria) query = query.eq('categoria_id', filtros.categoria);
      if (filtros.status) query = query.eq('status', filtros.status);
      if (filtros.dataInicio) query = query.gte('data_movimento', filtros.dataInicio);
      if (filtros.dataFim) query = query.lte('data_movimento', filtros.dataFim);
      if (filtros.busca) query = query.ilike('descricao', `%${filtros.busca}%`);

      const { data: movimentosData, error: movimentosError } = await query;

      if (movimentosError) throw movimentosError;
      setMovimentos(movimentosData || []);

      // Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_financeiras_2025_11_28_05_52')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Buscar animais
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais')
        .select('id, nome, especie, numero_processo')
        .eq('arquivado', false)
        .order('nome');

      if (animaisError) throw animaisError;
      setAnimais(animaisData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
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
      animal_id: '',
      descricao: '',
      valor: '',
      data_movimento: new Date().toISOString().split('T')[0],
      metodo_pagamento: '',
      observacoes: ''
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

      const dadosInserir = {
        numero_movimento: numeroData,
        tipo_movimento: formData.tipo_movimento,
        escopo: formData.escopo,
        categoria_id: formData.categoria_id,
        animal_id: formData.animal_id || null,
        descricao: formData.descricao.trim(),
        valor: valorNumerico,
        data_movimento: formData.data_movimento,
        metodo_pagamento: formData.metodo_pagamento || null,
        observacoes: formData.observacoes.trim() || null,
        status: 'confirmado'
      };

      const { error } = await supabase
        .from('movimentos_financeiros_2025_11_28_05_52')
        .insert([dadosInserir]);

      if (error) throw error;

      toast({
        title: "Movimento registado!",
        description: `${formData.tipo_movimento} de €${valorNumerico.toFixed(2)} registada com sucesso`,
      });

      setDialogOpen(false);
      resetForm();
      await fetchDados();

    } catch (error: any) {
      toast({
        title: "Erro ao registar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [filtros]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categoriasFiltradasPorEscopo = categorias.filter(cat => 
    !formData.escopo || cat.escopo === formData.escopo || cat.escopo === 'ambos'
  ).filter(cat => 
    !formData.tipo_movimento || cat.tipo === formData.tipo_movimento
  );

  // Cálculos
  const totalReceitas = movimentos
    .filter(m => m.tipo_movimento === 'receita')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalDespesas = movimentos
    .filter(m => m.tipo_movimento === 'despesa')
    .reduce((sum, m) => sum + m.valor, 0);

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
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="Gestão de Movimentos" 
        subtitle="Controlo completo de receitas e despesas"
        backTo="/financeiro"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Movimentos</p>
                  <p className="text-2xl font-bold text-purple-700">{movimentos.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações e Filtros */}
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
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Novo Movimento Financeiro</DialogTitle>
                      <DialogDescription>
                        Registar nova receita ou despesa
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Tipo e Escopo */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipo_movimento">Tipo *</Label>
                          <Select value={formData.tipo_movimento} onValueChange={(value) => setFormData({...formData, tipo_movimento: value})}>
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
                          <Select value={formData.escopo} onValueChange={(value) => setFormData({...formData, escopo: value})}>
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
                        <Select value={formData.categoria_id} onValueChange={(value) => setFormData({...formData, categoria_id: value})}>
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
                      </div>
                      
                      {/* Animal (se escopo for animal) */}
                      {formData.escopo === 'animal' && (
                        <div>
                          <Label htmlFor="animal_id">Animal</Label>
                          <Select value={formData.animal_id} onValueChange={(value) => setFormData({...formData, animal_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar animal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Nenhum animal específico</SelectItem>
                              {animais.map((animal) => (
                                <SelectItem key={animal.id} value={animal.id}>
                                  🐶 {animal.nome} - {animal.especie}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
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
                      
                      {/* Método de Pagamento */}
                      <div>
                        <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
                        <Select value={formData.metodo_pagamento} onValueChange={(value) => setFormData({...formData, metodo_pagamento: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                            <SelectItem value="transferencia">🏦 Transferência</SelectItem>
                            <SelectItem value="cartao">💳 Cartão</SelectItem>
                            <SelectItem value="cheque">📝 Cheque</SelectItem>
                            <SelectItem value="mbway">📱 MB WAY</SelectItem>
                            <SelectItem value="paypal">🌐 PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Observações */}
                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={formData.observacoes}
                          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
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
                
                <Button variant="outline" onClick={fetchDados}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/* Filtros */}
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <Select value={filtros.escopo} onValueChange={(value) => setFiltros({...filtros, escopo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Escopo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="associacao">🏢 Associação</SelectItem>
                  <SelectItem value="animal">🐾 Animal</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros({...filtros, tipo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="receita">💰 Receita</SelectItem>
                  <SelectItem value="despesa">💸 Despesa</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Data início"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
              />
              
              <Input
                placeholder="Data fim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
              />
              
              <Input
                placeholder="Buscar..."
                value={filtros.busca}
                onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
              />
            </div>

            {/* Tabela */}
            {movimentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum movimento encontrado</p>
                <p className="text-sm">Os movimentos financeiros aparecerão aqui</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Escopo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell className="font-mono text-sm">{movimento.numero_movimento}</TableCell>
                      <TableCell>{formatDate(movimento.data_movimento)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {movimento.tipo_movimento === 'receita' ? 
                            <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          }
                          <span className={movimento.tipo_movimento === 'receita' ? 'text-green-600' : 'text-red-600'}>
                            {movimento.tipo_movimento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {movimento.escopo === 'associacao' ? 
                            <Building className="h-4 w-4 text-blue-600" /> : 
                            <PawPrint className="h-4 w-4 text-green-600" />
                          }
                          <span>{movimento.escopo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: movimento.categoria?.cor }}
                          />
                          <span>{movimento.categoria?.nome}</span>
                        </div>
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
                      <TableCell>
                        <Badge className={getStatusColor(movimento.status)} variant="secondary">
                          {movimento.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={movimento.tipo_movimento === 'receita' ? 'text-green-600' : 'text-red-600'}>
                          {movimento.tipo_movimento === 'receita' ? '+' : '-'}{formatCurrency(movimento.valor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default GestaoMovimentos;