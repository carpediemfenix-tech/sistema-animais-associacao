import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Database,
  PawPrint,
  Search,
  Filter,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Especie {
  id: string;
  nome: string;
  icone: string;
  ativo: boolean;
  created_at: string;
}

const GestaoEspecies = () => {
  const { toast } = useToast();
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEspecie, setEditingEspecie] = useState<Especie | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    icone: "",
    ativo: true
  });

  useEffect(() => {
    loadEspecies();
  }, []);

  const loadEspecies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('especies')
        .select('*')
        .order('nome');

      if (error) throw error;
      setEspecies(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar espécies:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as espécies",
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
          description: "Nome da espécie é obrigatório",
          variant: "destructive"
        });
        return;
      }

      if (editingEspecie) {
        // Atualizar
        const { error } = await supabase
          .from('especies')
          .update({
            nome: formData.nome.trim(),
            icone: formData.icone.trim() || '🐾',
            ativo: formData.ativo
          })
          .eq('id', editingEspecie.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Espécie atualizada com sucesso"
        });
      } else {
        // Criar nova
        const { error } = await supabase
          .from('especies')
          .insert([{
            nome: formData.nome.trim(),
            icone: formData.icone.trim() || '🐾',
            ativo: formData.ativo
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Espécie criada com sucesso"
        });
      }

      setDialogOpen(false);
      resetForm();
      loadEspecies();
    } catch (error: any) {
      console.error('Erro ao salvar espécie:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar espécie",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (especie: Especie) => {
    try {
      const { error } = await supabase
        .from('especies')
        .delete()
        .eq('id', especie.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Espécie eliminada com sucesso"
      });

      loadEspecies();
    } catch (error: any) {
      console.error('Erro ao eliminar espécie:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar espécie",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (especie: Especie) => {
    setEditingEspecie(especie);
    setFormData({
      nome: especie.nome,
      icone: especie.icone,
      ativo: especie.ativo
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEspecie(null);
    setFormData({
      nome: "",
      icone: "",
      ativo: true
    });
  };

  const filteredEspecies = especies.filter(especie => {
    const matchesSearch = especie.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive || especie.ativo;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Database className="h-8 w-8 mr-3 text-blue-600" />
                Gestão de Espécies
              </h1>
              <p className="text-gray-600">Gerir espécies de animais do sistema</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Espécie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEspecie ? 'Editar Espécie' : 'Nova Espécie'}
                </DialogTitle>
                <DialogDescription>
                  {editingEspecie ? 'Edite os dados da espécie' : 'Adicione uma nova espécie ao sistema'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Espécie *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Cão, Gato, Coelho..."
                  />
                </div>

                <div>
                  <Label htmlFor="icone">Ícone (Emoji)</Label>
                  <Input
                    id="icone"
                    value={formData.icone}
                    onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                    placeholder="Ex: 🐕, 🐱, 🐰..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use um emoji para representar a espécie. Deixe vazio para usar 🐾
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Espécie ativa</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingEspecie ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                    placeholder="Pesquisar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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

        {/* Lista de Espécies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Espécies ({filteredEspecies.length})</span>
              <PawPrint className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">A carregar espécies...</p>
              </div>
            ) : filteredEspecies.length === 0 ? (
              <div className="text-center py-8">
                <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma espécie encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEspecies.map((especie) => (
                  <div key={especie.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{especie.icone}</span>
                        <h3 className="font-semibold">{especie.nome}</h3>
                      </div>
                      <Badge variant={especie.ativo ? "default" : "secondary"}>
                        {especie.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(especie)}
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
                            <AlertDialogTitle>Eliminar Espécie</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem a certeza que deseja eliminar a espécie "{especie.nome}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(especie)}
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
  );
};

export default GestaoEspecies;