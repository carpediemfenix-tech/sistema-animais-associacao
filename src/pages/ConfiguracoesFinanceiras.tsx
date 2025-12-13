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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Settings, 
  Tag, 
  Target, 
  Palette,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoriaFinanceira {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  cor: string;
  icone: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
}

interface OrcamentoFinanceiro {
  id: string;
  ano: number;
  categoria_id: string;
  categoria: {
    nome: string;
    codigo: string;
    tipo: string;
  };
  valor_orcado: number;
  valor_executado: number;
  observacoes?: string;
  created_at: string;
}

const ConfiguracoesFinanceiras = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categorias');
  
  // Estados para categorias
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaFinanceira | null>(null);
  
  // Estados para orçamentos
  const [orcamentos, setOrcamentos] = useState<OrcamentoFinanceiro[]>([]);
  const [orcamentoDialogOpen, setOrcamentoDialogOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<OrcamentoFinanceiro | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEscopo, setFilterEscopo] = useState('');

  // Formulários
  const [categoriaForm, setCategoriaForm] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    tipo: '',
    escopo: '',
    cor: '#3B82F6',
    icone: 'DollarSign'
  });

  const [orcamentoForm, setOrcamentoForm] = useState({
    ano: new Date().getFullYear().toString(),
    categoria_id: '',
    valor_orcado: '',
    observacoes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCategorias(),
        loadOrcamentos()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as configurações financeiras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    const { data } = await supabase
      .from('categorias_financeiras_2025_12_13_06_00')
      .select('*')
      .order('ordem');

    if (data) {
      setCategorias(data);
    }
  };

  const loadOrcamentos = async () => {
    const { data } = await supabase
      .from('orcamentos_2025_12_13_06_00')
      .select(`
        *,
        categoria:categorias_financeiras_2025_12_13_06_00(nome, codigo, tipo)
      `)
      .order('ano', { ascending: false });

    if (data) {
      setOrcamentos(data as OrcamentoFinanceiro[]);
    }
  };

  const resetCategoriaForm = () => {
    setCategoriaForm({
      codigo: '',
      nome: '',
      descricao: '',
      tipo: '',
      escopo: '',
      cor: '#3B82F6',
      icone: 'DollarSign'
    });
    setEditingCategoria(null);
  };

  const resetOrcamentoForm = () => {
    setOrcamentoForm({
      ano: new Date().getFullYear().toString(),
      categoria_id: '',
      valor_orcado: '',
      observacoes: ''
    });
    setEditingOrcamento(null);
  };

  const openCategoriaDialog = (categoria?: CategoriaFinanceira) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setCategoriaForm({
        codigo: categoria.codigo,
        nome: categoria.nome,
        descricao: categoria.descricao,
        tipo: categoria.tipo,
        escopo: categoria.escopo,
        cor: categoria.cor,
        icone: categoria.icone
      });
    } else {
      resetCategoriaForm();
    }
    setCategoriaDialogOpen(true);
  };

  const openOrcamentoDialog = (orcamento?: OrcamentoFinanceiro) => {
    if (orcamento) {
      setEditingOrcamento(orcamento);
      setOrcamentoForm({
        ano: orcamento.ano.toString(),
        categoria_id: orcamento.categoria_id,
        valor_orcado: orcamento.valor_orcado.toString(),
        observacoes: orcamento.observacoes || ''
      });
    } else {
      resetOrcamentoForm();
    }
    setOrcamentoDialogOpen(true);
  };

  const handleCategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoriaData = {
        codigo: categoriaForm.codigo,
        nome: categoriaForm.nome,
        descricao: categoriaForm.descricao,
        tipo: categoriaForm.tipo,
        escopo: categoriaForm.escopo,
        cor: categoriaForm.cor,
        icone: categoriaForm.icone,
        ativo: true,
        ordem: categorias.length + 1
      };

      if (editingCategoria) {
        const { error } = await supabase
          .from('categorias_financeiras_2025_12_13_06_00')
          .update(categoriaData)
          .eq('id', editingCategoria.id);

        if (error) throw error;

        toast({
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('categorias_financeiras_2025_12_13_06_00')
          .insert([categoriaData]);

        if (error) throw error;

        toast({
          title: "Categoria criada",
          description: "A nova categoria foi criada com sucesso",
        });
      }

      setCategoriaDialogOpen(false);
      resetCategoriaForm();
      loadCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro ao salvar categoria",
        description: "Não foi possível salvar a categoria",
        variant: "destructive",
      });
    }
  };

  const handleOrcamentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orcamentoData = {
        ano: parseInt(orcamentoForm.ano),
        categoria_id: orcamentoForm.categoria_id,
        valor_orcado: parseFloat(orcamentoForm.valor_orcado),
        valor_executado: 0,
        observacoes: orcamentoForm.observacoes || null
      };

      if (editingOrcamento) {
        const { error } = await supabase
          .from('orcamentos_2025_12_13_06_00')
          .update(orcamentoData)
          .eq('id', editingOrcamento.id);

        if (error) throw error;

        toast({
          title: "Orçamento atualizado",
          description: "O orçamento foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('orcamentos_2025_12_13_06_00')
          .insert([orcamentoData]);

        if (error) throw error;

        toast({
          title: "Orçamento criado",
          description: "O novo orçamento foi criado com sucesso",
        });
      }

      setOrcamentoDialogOpen(false);
      resetOrcamentoForm();
      loadOrcamentos();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        title: "Erro ao salvar orçamento",
        description: "Não foi possível salvar o orçamento",
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
    return tipo === 'receita' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'receita' ? 
      'bg-green-100 text-green-800' : 
      'bg-red-100 text-red-800';
  };

  const getEscopoColor = (escopo: string) => {
    switch (escopo) {
      case 'animal': return 'bg-blue-100 text-blue-800';
      case 'associacao': return 'bg-purple-100 text-purple-800';
      case 'ambos': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar categorias
  const categoriasFiltradas = categorias.filter(categoria => {
    const matchSearch = categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       categoria.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = !filterTipo || categoria.tipo === filterTipo;
    const matchEscopo = !filterEscopo || categoria.escopo === filterEscopo;

    return matchSearch && matchTipo && matchEscopo;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Carregando configurações...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Configurações Financeiras</h1>
            <p className="text-gray-600 mt-1">Gestão de categorias e orçamentos</p>
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
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categorias" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="orcamentos" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Orçamentos</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Categorias */}
          <TabsContent value="categorias" className="space-y-6">
            {/* Estatísticas Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Categorias</p>
                      <p className="text-2xl font-bold text-blue-700">{categorias.length}</p>
                    </div>
                    <Tag className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Receitas</p>
                      <p className="text-2xl font-bold text-green-700">
                        {categorias.filter(c => c.tipo === 'receita').length}
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
                        {categorias.filter(c => c.tipo === 'despesa').length}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Ativas</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {categorias.filter(c => c.ativo).length}
                      </p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros Categorias */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-blue-600" />
                    Filtros
                  </CardTitle>
                  <Button onClick={() => openCategoriaDialog()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Pesquisar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nome, código..."
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
                        <SelectItem value="">Todos</SelectItem>
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
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="animal">Animal</SelectItem>
                        <SelectItem value="associacao">Associação</SelectItem>
                        <SelectItem value="ambos">Ambos</SelectItem>
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
                      }}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista Categorias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-blue-600" />
                  Categorias Financeiras ({categoriasFiltradas.length})
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
                        <TableHead>Escopo</TableHead>
                        <TableHead>Cor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoriasFiltradas.map((categoria) => (
                        <TableRow key={categoria.id}>
                          <TableCell className="font-mono text-sm font-bold">
                            {categoria.codigo}
                          </TableCell>
                          <TableCell className="font-medium">
                            {categoria.nome}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTipoIcon(categoria.tipo)}
                              <Badge className={getTipoColor(categoria.tipo)} variant="secondary">
                                {categoria.tipo}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getEscopoColor(categoria.escopo)} variant="secondary">
                              {categoria.escopo}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: categoria.cor }}
                              />
                              <span className="text-sm font-mono">{categoria.cor}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={categoria.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} variant="secondary">
                              {categoria.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => openCategoriaDialog(categoria)}>
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
          </TabsContent>

          {/* Tab Orçamentos */}
          <TabsContent value="orcamentos" className="space-y-6">
            {/* Estatísticas Orçamentos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Orçamentos</p>
                      <p className="text-2xl font-bold text-blue-700">{orcamentos.length}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Valor Orçado</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(orcamentos.reduce((sum, o) => sum + o.valor_orcado, 0))}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Valor Executado</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {formatCurrency(orcamentos.reduce((sum, o) => sum + o.valor_executado, 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Ano Atual</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {orcamentos.filter(o => o.ano === new Date().getFullYear()).length}
                      </p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista Orçamentos */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Orçamentos Anuais ({orcamentos.length})
                  </CardTitle>
                  <Button onClick={() => openOrcamentoDialog()} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Orçamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ano</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor Orçado</TableHead>
                        <TableHead>Valor Executado</TableHead>
                        <TableHead>% Execução</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orcamentos.map((orcamento) => {
                        const percentual = orcamento.valor_orcado > 0 ? 
                          (orcamento.valor_executado / orcamento.valor_orcado) * 100 : 0;
                        
                        return (
                          <TableRow key={orcamento.id}>
                            <TableCell className="font-bold">
                              {orcamento.ano}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{orcamento.categoria.nome}</div>
                                <div className="text-sm text-gray-500">{orcamento.categoria.codigo}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTipoColor(orcamento.categoria.tipo)} variant="secondary">
                                {orcamento.categoria.tipo}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-blue-600">
                                {formatCurrency(orcamento.valor_orcado)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-green-600">
                                {formatCurrency(orcamento.valor_executado)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${percentual > 100 ? 'bg-red-500' : percentual > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(percentual, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${percentual > 100 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {percentual.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => openOrcamentoDialog(orcamento)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Nova/Editar Categoria */}
      <Dialog open={categoriaDialogOpen} onOpenChange={setCategoriaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategoria ? 'Atualize os dados da categoria' : 'Crie uma nova categoria financeira'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategoriaSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={categoriaForm.codigo}
                  onChange={(e) => setCategoriaForm({...categoriaForm, codigo: e.target.value})}
                  placeholder="R001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={categoriaForm.tipo} onValueChange={(value) => setCategoriaForm({...categoriaForm, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={categoriaForm.nome}
                onChange={(e) => setCategoriaForm({...categoriaForm, nome: e.target.value})}
                placeholder="Nome da categoria"
                required
              />
            </div>

            <div>
              <Label htmlFor="escopo">Escopo *</Label>
              <Select value={categoriaForm.escopo} onValueChange={(value) => setCategoriaForm({...categoriaForm, escopo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="animal">Animal</SelectItem>
                  <SelectItem value="associacao">Associação</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cor">Cor</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="cor"
                    type="color"
                    value={categoriaForm.cor}
                    onChange={(e) => setCategoriaForm({...categoriaForm, cor: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={categoriaForm.cor}
                    onChange={(e) => setCategoriaForm({...categoriaForm, cor: e.target.value})}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="icone">Ícone</Label>
                <Input
                  id="icone"
                  value={categoriaForm.icone}
                  onChange={(e) => setCategoriaForm({...categoriaForm, icone: e.target.value})}
                  placeholder="DollarSign"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={categoriaForm.descricao}
                onChange={(e) => setCategoriaForm({...categoriaForm, descricao: e.target.value})}
                placeholder="Descrição da categoria"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setCategoriaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingCategoria ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova/Editar Orçamento */}
      <Dialog open={orcamentoDialogOpen} onOpenChange={setOrcamentoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
            <DialogDescription>
              {editingOrcamento ? 'Atualize os dados do orçamento' : 'Crie um novo orçamento anual'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrcamentoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ano">Ano *</Label>
                <Input
                  id="ano"
                  type="number"
                  value={orcamentoForm.ano}
                  onChange={(e) => setOrcamentoForm({...orcamentoForm, ano: e.target.value})}
                  placeholder="2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria_id">Categoria *</Label>
                <Select value={orcamentoForm.categoria_id} onValueChange={(value) => setOrcamentoForm({...orcamentoForm, categoria_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.filter(c => c.ativo).map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.codigo} - {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="valor_orcado">Valor Orçado (€) *</Label>
              <Input
                id="valor_orcado"
                type="number"
                step="0.01"
                value={orcamentoForm.valor_orcado}
                onChange={(e) => setOrcamentoForm({...orcamentoForm, valor_orcado: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={orcamentoForm.observacoes}
                onChange={(e) => setOrcamentoForm({...orcamentoForm, observacoes: e.target.value})}
                placeholder="Observações sobre o orçamento"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOrcamentoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingOrcamento ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default ConfiguracoesFinanceiras;