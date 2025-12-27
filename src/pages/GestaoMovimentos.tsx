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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ArrowLeft,
  Building2,
  PawPrint
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MovimentoFinanceiro {
  id: string;
  numero_movimento: string;
  tipo: 'receita' | 'despesa' | 'transferencia';
  escopo: 'animal' | 'associacao';
  categoria: {
    nome: string;
    cor: string;
    icone: string;
  };
  animal?: {
    nome: string;
    especie: string;
  };
  conta_origem?: {
    nome: string;
    codigo: string;
  };
  descricao: string;
  valor: number;
  data_movimento: string;
  status: string;
  forma_pagamento: string;
  created_at: string;
}

interface CategoriaFinanceira {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  escopo: string;
}

interface ContaFinanceira {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
}

const GestaoMovimentos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [contas, setContas] = useState<ContaFinanceira[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEscopo, setFilterEscopo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMovimentos(),
        loadCategorias(),
        loadContas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os movimentos financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMovimentos = async () => {
    const { data } = await supabase
      .from('movimentos_financeiros_2025_12_13_06_00')
      .select(`
        *,
        categoria:categorias_financeiras_2025_12_13_06_00(nome, cor, icone),
        animal:animais(nome, especie),
        conta_origem:contas_financeiras_2025_12_13_06_00!movimentos_financeiros_2025_12_13_06_00_conta_origem_id_fkey(nome, codigo)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setMovimentos(data as MovimentoFinanceiro[]);
    }
  };

  const loadCategorias = async () => {
    const { data } = await supabase
      .from('categorias_financeiras_2025_12_13_06_00')
      .select('*')
      .eq('ativo', true)
      .order('ordem');

    if (data) {
      setCategorias(data);
    }
  };

  const loadContas = async () => {
    const { data } = await supabase
      .from('contas_financeiras_2025_12_13_06_00')
      .select('*')
      .eq('ativo', true)
      .order('codigo');

    if (data) {
      setContas(data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'parcial': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'receita': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'despesa': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <DollarSign className="h-4 w-4 text-blue-600" />;
    }
  };

  const getEscopoIcon = (escopo: string) => {
    switch (escopo) {
      case 'associacao': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'animal': return <PawPrint className="h-4 w-4 text-green-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filtrar movimentos
  const movimentosFiltrados = movimentos.filter(movimento => {
    const matchSearch = movimento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       movimento.numero_movimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       movimento.animal?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = !filterTipo || filterTipo === 'todos' || movimento.tipo === filterTipo;
    const matchEscopo = !filterEscopo || filterEscopo === 'todos' || movimento.escopo === filterEscopo;
    const matchStatus = !filterStatus || filterStatus === 'todos' || movimento.status === filterStatus;
    const matchCategoria = !filterCategoria || filterCategoria === 'todas' || movimento.categoria?.nome === filterCategoria;

    return matchSearch && matchTipo && matchEscopo && matchStatus && matchCategoria;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Carregando movimentos financeiros...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Movimentos</h1>
            <p className="text-gray-600 mt-1">Histórico completo de receitas e despesas</p>
          </div>
          <div className="flex space-x-3">
            <Link to="/financeiro">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link to="/financeiro/movimentos/novo">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Movimento
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Movimentos</p>
                  <p className="text-2xl font-bold text-blue-700">{movimentos.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Receitas</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(movimentos.filter(m => m.tipo === 'receita' && m.status === 'pago').reduce((sum, m) => sum + m.valor, 0))}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Despesas</p>
                  <p className="text-2xl font-bold text-red-700">
                    {formatCurrency(movimentos.filter(m => m.tipo === 'despesa' && m.status === 'pago').reduce((sum, m) => sum + m.valor, 0))}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {movimentos.filter(m => m.status === 'pendente').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Descrição, número..."
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
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="escopo">Escopo</Label>
                <Select value={filterEscopo} onValueChange={setFilterEscopo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="associacao">Associação</SelectItem>
                    <SelectItem value="animal">Animal</SelectItem>
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
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterTipo('');
                    setFilterEscopo('');
                    setFilterStatus('');
                    setFilterCategoria('');
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Movimentos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Movimentos Financeiros ({movimentosFiltrados.length})
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Escopo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentosFiltrados.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell className="font-mono text-sm">
                        {movimento.numero_movimento}
                      </TableCell>
                      <TableCell>
                        {formatDate(movimento.data_movimento)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTipoIcon(movimento.tipo)}
                          <span className="capitalize">{movimento.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEscopoIcon(movimento.escopo)}
                          <span className="capitalize">{movimento.escopo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {movimento.descricao}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" style={{ backgroundColor: movimento.categoria?.cor + '20', color: movimento.categoria?.cor }}>
                          {movimento.categoria?.nome}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movimento.animal ? (
                          <div className="text-sm">
                            <div className="font-medium">{movimento.animal.nome}</div>
                            <div className="text-gray-500">{movimento.animal.especie}</div>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${movimento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {movimento.tipo === 'receita' ? '+' : '-'}{formatCurrency(movimento.valor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(movimento.status)} variant="secondary">
                          {movimento.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoMovimentos;