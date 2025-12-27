import { useState, useEffect } from "react";
import PageActionBar from "@/components/PageActionBar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Search,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

interface Localizacao {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  created_at: string;
}

const GestaoLocalizacoes = () => {
  const { toast } = useToast();
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocalizacao, setEditingLocalizacao] = useState<Localizacao | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ativo: true
  });

  useEffect(() => {
    loadLocalizacoes();
  }, []);

  const loadLocalizacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('localizacoes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setLocalizacoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar localizações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as localizações",
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
          description: "Nome da localização é obrigatório",
          variant: "destructive"
        });
        return;
      }

      if (editingLocalizacao) {
        // Atualizar
        const { error } = await supabase
          .from('localizacoes')
          .update({
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim(),
            ativo: formData.ativo
          })
          .eq('id', editingLocalizacao.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Localização atualizada com sucesso"
        });
      } else {
        // Criar nova
        const { error } = await supabase
          .from('localizacoes')
          .insert([{
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim(),
            ativo: formData.ativo
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Localização criada com sucesso"
        });
      }

      setDialogOpen(false);
      resetForm();
      loadLocalizacoes();
    } catch (error: any) {
      console.error('Erro ao salvar localização:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar localização",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (localizacao: Localizacao) => {
    try {
      const { error } = await supabase
        .from('localizacoes')
        .delete()
        .eq('id', localizacao.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Localização eliminada com sucesso"
      });

      loadLocalizacoes();
    } catch (error: any) {
      console.error('Erro ao eliminar localização:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar localização",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (localizacao: Localizacao) => {
    setEditingLocalizacao(localizacao);
    setFormData({
      nome: localizacao.nome,
      descricao: localizacao.descricao || "",
      ativo: localizacao.ativo
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLocalizacao(null);
    setFormData({
      nome: "",
      descricao: "",
      ativo: true
    });
  };

  const filteredLocalizacoes = localizacoes.filter(localizacao => {
    const matchesSearch = localizacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (localizacao.descricao && localizacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = showInactive || localizacao.ativo;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
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
                <MapPin className="h-8 w-8 mr-3 text-blue-600" />
                Gestão de Localizações
              </h1>
              <p className="text-gray-600">Gerir localizações e espaços da associação</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Localização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLocalizacao ? 'Editar Localização' : 'Nova Localização'}
                </DialogTitle>
                <DialogDescription>
                  {editingLocalizacao ? 'Edite os dados da localização' : 'Adicione uma nova localização ao sistema'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Localização *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Canil A, Gatil Principal, Quarentena..."
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada da localização..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Localização ativa</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingLocalizacao ? 'Atualizar' : 'Criar'}
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
                    placeholder="Pesquisar por nome ou descrição..."
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

        {/* Lista de Localizações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Localizações ({filteredLocalizacoes.length})</span>
              <MapPin className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">A carregar localizações...</p>
              </div>
            ) : filteredLocalizacoes.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma localização encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocalizacoes.map((localizacao) => (
                  <div key={localizacao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{localizacao.nome}</h3>
                      </div>
                      <Badge variant={localizacao.ativo ? "default" : "secondary"}>
                        {localizacao.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>

                    {localizacao.descricao && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {localizacao.descricao}
                      </p>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(localizacao)}
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
                            <AlertDialogTitle>Eliminar Localização</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem a certeza que deseja eliminar a localização "{localizacao.nome}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(localizacao)}
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
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoLocalizacoes;