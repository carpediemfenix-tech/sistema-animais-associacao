import { useState, useEffect } from "react";
import PageActionBar from '@/components/PageActionBar';
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  CreditCard, 
  Building, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Banknote
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContaFinanceira {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  banco?: string;
  numero_conta?: string;
  saldo_inicial: number;
  saldo_atual: number;
  ativo: boolean;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

const GestaoContas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [contas, setContas] = useState<ContaFinanceira[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaFinanceira | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<ContaFinanceira | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Formulário
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    tipo: '',
    banco: '',
    numero_conta: '',
    saldo_inicial: '',
    descricao: ''
  });

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contas_financeiras_2025_12_13_06_00')
        .select('*')
        .order('codigo');

      if (error) throw error;

      if (data) {
        setContas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        title: "Erro ao carregar contas",
        description: "Não foi possível carregar as contas financeiras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      tipo: '',
      banco: '',
      numero_conta: '',
      saldo_inicial: '',
      descricao: ''
    });
    setEditingConta(null);
  };

  const openDialog = (conta?: ContaFinanceira) => {
    if (conta) {
      setEditingConta(conta);
      setFormData({
        codigo: conta.codigo,
        nome: conta.nome,
        tipo: conta.tipo,
        banco: conta.banco || '',
        numero_conta: conta.numero_conta || '',
        saldo_inicial: conta.saldo_inicial.toString(),
        descricao: conta.descricao || ''
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contaData = {
        codigo: formData.codigo,
        nome: formData.nome,
        tipo: formData.tipo,
        banco: formData.banco || null,
        numero_conta: formData.numero_conta || null,
        saldo_inicial: parseFloat(formData.saldo_inicial) || 0,
        saldo_atual: parseFloat(formData.saldo_inicial) || 0,
        descricao: formData.descricao || null,
        ativo: true
      };

      if (editingConta) {
        const { error } = await supabase
          .from('contas_financeiras_2025_12_13_06_00')
          .update(contaData)
          .eq('id', editingConta.id);

        if (error) throw error;

        toast({
          title: "Conta atualizada",
          description: "A conta foi atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('contas_financeiras_2025_12_13_06_00')
          .insert([contaData]);

        if (error) throw error;

        toast({
          title: "Conta criada",
          description: "A nova conta foi criada com sucesso",
        });
      }

      setDialogOpen(false);
      resetForm();
      loadContas();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      toast({
        title: "Erro ao salvar conta",
        description: "Não foi possível salvar a conta",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!contaToDelete) return;

    try {
      const { error } = await supabase
        .from('contas_financeiras_2025_12_13_06_00')
        .update({ ativo: false })
        .eq('id', contaToDelete.id);

      if (error) throw error;

      toast({
        title: "Conta desativada",
        description: "A conta foi desativada com sucesso",
      });

      setDeleteDialogOpen(false);
      setContaToDelete(null);
      loadContas();
    } catch (error) {
      console.error('Erro ao desativar conta:', error);
      toast({
        title: "Erro ao desativar conta",
        description: "Não foi possível desativar a conta",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'banco': return <Building className="h-4 w-4 text-blue-600" />;
      case 'caixa': return <Wallet className="h-4 w-4 text-green-600" />;
      case 'poupanca': return <CreditCard className="h-4 w-4 text-purple-600" />;
      default: return <Banknote className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'banco': return 'bg-blue-100 text-blue-800';
      case 'caixa': return 'bg-green-100 text-green-800';
      case 'poupanca': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar contas
  const contasFiltradas = contas.filter(conta => {
    const matchSearch = conta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       conta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       conta.banco?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = !filterTipo || filterTipo === 'todos' || conta.tipo === filterTipo;
    const matchStatus = filterStatus === '' || filterStatus === 'todos' || 
                       (filterStatus === 'ativo' && conta.ativo) ||
                       (filterStatus === 'inativo' && !conta.ativo);

    return matchSearch && matchTipo && matchStatus;
  });

  // Calcular estatísticas
  const totalContas = contas.length;
  const contasAtivas = contas.filter(c => c.ativo).length;
  const saldoTotal = contas.filter(c => c.ativo).reduce((sum, c) => sum + c.saldo_atual, 0);
  const saldoBancos = contas.filter(c => c.ativo && c.tipo === 'banco').reduce((sum, c) => sum + c.saldo_atual, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Carregando contas financeiras...</span>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Contas</h1>
            <p className="text-gray-600 mt-1">Administração de contas bancárias e caixas</p>
          </div>
          <div className="flex space-x-3">
            <Link to="/financeiro">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button onClick={loadContas} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Contas</p>
                  <p className="text-2xl font-bold text-blue-700">{totalContas}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Contas Ativas</p>
                  <p className="text-2xl font-bold text-green-700">{contasAtivas}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Saldo Total</p>
                  <p className="text-2xl font-bold text-purple-700">{formatCurrency(saldoTotal)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Saldo Bancos</p>
                  <p className="text-2xl font-bold text-orange-700">{formatCurrency(saldoBancos)}</p>
                </div>
                <Building className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, código, banco..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="banco">Banco</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterTipo('');
                    setFilterStatus('');
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Contas Financeiras ({contasFiltradas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Saldo Atual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasFiltradas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-mono text-sm font-bold">
                        {conta.codigo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {conta.nome}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTipoIcon(conta.tipo)}
                          <Badge className={getTipoColor(conta.tipo)} variant="secondary">
                            {conta.tipo}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {conta.banco || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {conta.numero_conta || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${conta.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(conta.saldo_atual)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={conta.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} variant="secondary">
                          {conta.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openDialog(conta)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setContaToDelete(conta);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Nova/Editar Conta */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingConta ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
            <DialogDescription>
              {editingConta ? 'Atualize os dados da conta financeira' : 'Crie uma nova conta financeira'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  placeholder="BCO001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banco">Banco</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Conta Corrente Principal"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  value={formData.banco}
                  onChange={(e) => setFormData({...formData, banco: e.target.value})}
                  placeholder="CGD"
                />
              </div>
              <div>
                <Label htmlFor="numero_conta">Número da Conta</Label>
                <Input
                  id="numero_conta"
                  value={formData.numero_conta}
                  onChange={(e) => setFormData({...formData, numero_conta: e.target.value})}
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="saldo_inicial">Saldo Inicial (€)</Label>
              <Input
                id="saldo_inicial"
                type="number"
                step="0.01"
                value={formData.saldo_inicial}
                onChange={(e) => setFormData({...formData, saldo_inicial: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição opcional da conta"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingConta ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Desativação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desativar a conta "{contaToDelete?.nome}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Desativar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoContas;