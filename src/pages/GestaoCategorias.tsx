import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Grid3X3,
  Search,
  Save,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoriaFinanceira {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'receita' | 'despesa';
  escopo: 'animal' | 'associacao' | 'ambos';
  cor: string;
  ativo: boolean;
  created_at: string;
}

const GestaoCategorias = () => {
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaFinanceira | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "despesa" as 'receita' | 'despesa',
    escopo: "ambos" as 'animal' | 'associacao' | 'ambos',
    cor: "#3B82F6",
    ativo: true
  });

  const coresDisponiveis = [
    { nome: "Azul", valor: "#3B82F6" },
    { nome: "Verde", valor: "#10B981" },
    { nome: "Vermelho", valor: "#EF4444" },
    { nome: "Amarelo", valor: "#F59E0B" },
    { nome: "Roxo", valor: "#8B5CF6" },
    { nome: "Rosa", valor: "#EC4899" },
    { nome: "Laranja", valor: "#F97316" },
    { nome: "Cinza", valor: "#6B7280" }
  ];

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.nome.trim()) {
        toast({
          title: "Erro",
          description: "Nome da categoria é obrigatório",
          variant: "destructive"
        });
        return;
      }

      if (editingCategoria) {
        // Atualizar
        const { error } = await supabase
          .from('categorias_financeiras')
          .update({
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim(),
            tipo: formData.tipo,
            escopo: formData.escopo,
            cor: formData.cor,
            ativo: formData.ativo
          })
          .eq('id', editingCategoria.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso"
        });
      } else {
        // Criar nova
        const { error } = await supabase
          .from('categorias_financeiras')
          .insert([{
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim(),
            tipo: formData.tipo,
            escopo: formData.escopo,
            cor: formData.cor,
            ativo: formData.ativo
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso"
        });
      }

      setDialogOpen(false);
      resetForm();
      loadCategorias();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar categoria",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (categoria: CategoriaFinanceira) => {
    try {
      const { error } = await supabase
        .from('categorias_financeiras')
        .delete()
        .eq('id', categoria.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria eliminada com sucesso"
      });

      loadCategorias();
    } catch (error: any) {
      console.error('Erro ao eliminar categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar categoria",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (categoria: CategoriaFinanceira) => {
    setEditingCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || "",
      tipo: categoria.tipo,
      escopo: categoria.escopo || "ambos",
      cor: categoria.cor || "#3B82F6",
      ativo: categoria.ativo
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategoria(null);
    setFormData({
      nome: "",
      descricao: "",
      tipo: "despesa",
      escopo: "ambos",
      cor: "#3B82F6",
      ativo: true
    });
  };

  const filteredCategorias = categorias.filter(categoria => {
    const matchesSearch = categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = filterTipo === "all" || categoria.tipo === filterTipo;
    const matchesStatus = showInactive || categoria.ativo;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const receitas = filteredCategorias.filter(c => c.tipo === 'receita');
  const despesas = filteredCategorias.filter(c => c.tipo === 'despesa');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      {/* Barra de Navegação e Ações */}
      <PageActionBar
        breadcrumbs={[
          { label: 'Configurações', href: '/configuracoes' },
          { label: 'Categorias Financeiras', icon: <Grid3X3 className="h-4 w-4" /> }
        ]}
        primaryActions={
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-9">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        }
      />
      
      <div className="max-w-6xl mx-auto px-6 py-6 flex-1">
        {/* Dialog de Criação/Edição */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategoria ? 'Edite os dados da categoria' : 'Adicione uma nova categoria financeira'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Categoria *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Alimentação, Veterinário, Doações..."
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
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
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional da categoria"
              />
            </div>

            <div>
              <Label htmlFor="cor">Cor</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="cor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-20 h-10"
                />
                <span className="text-sm text-gray-600">{formData.cor}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo">Categoria ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingCategoria ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Pesquisar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filterTipo">Tipo</Label>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="receita">Receitas</SelectItem>
                    <SelectItem value="despesa">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showInactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <Label htmlFor="showInactive">Mostrar inativas</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredCategorias.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{receitas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{despesas.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receitas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Receitas ({receitas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receitas.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma categoria de receita encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receitas.map((categoria) => (
                    <div key={categoria.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <h3 className="font-semibold">{categoria.nome}</h3>
                        </div>
                        <Badge variant={categoria.ativo ? "default" : "secondary"}>
                          {categoria.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      {categoria.descricao && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {categoria.descricao}
                        </p>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(categoria)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar Categoria</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem a certeza que deseja eliminar a categoria "{categoria.nome}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(categoria)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                Despesas ({despesas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {despesas.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma categoria de despesa encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {despesas.map((categoria) => (
                    <div key={categoria.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <h3 className="font-semibold">{categoria.nome}</h3>
                        </div>
                        <Badge variant={categoria.ativo ? "default" : "secondary"}>
                          {categoria.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>

                      {categoria.descricao && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {categoria.descricao}
                        </p>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(categoria)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar Categoria</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem a certeza que deseja eliminar a categoria "{categoria.nome}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(categoria)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoCategorias;