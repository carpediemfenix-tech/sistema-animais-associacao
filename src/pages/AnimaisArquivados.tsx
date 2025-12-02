import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Archive, 
  Search, 
  Eye, 
  ArchiveRestore,
  Calendar,
  AlertCircle,
  Loader2,
  FileText,
  PawPrint,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LogotipoValentao from "@/components/LogotipoValentao";

const AnimaisArquivados = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecie, setFilterEspecie] = useState("todos");
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArchive, setEditingArchive] = useState<Animal | null>(null);
  const [archiveForm, setArchiveForm] = useState({
    motivo_arquivamento: '',
    data_arquivamento: ''
  });
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar se o utilizador tem permissão de administrador
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem aceder aos animais arquivados
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchAnimaisArquivados();
  }, []);

  const fetchAnimaisArquivados = async () => {
    try {
      setLoading(true);
      console.log('📦 [ARQUIVO] Carregando animais arquivados...');

      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('arquivado', true)
        .order('data_arquivamento', { ascending: false });

      if (error) {
        console.error('❌ [ARQUIVO] Erro ao carregar animais:', error);
        throw error;
      }

      console.log('✅ [ARQUIVO] Animais arquivados carregados:', data?.length || 0);
      setAnimais(data || []);
    } catch (error: any) {
      console.error('💥 [ARQUIVO] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os animais arquivados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDesarquivar = async (animal: Animal) => {
    const confirmRestore = confirm(
      `Tem certeza que deseja desarquivar o animal "${animal.nome}"?\n\n` +
      `O animal voltará a aparecer na gestão normal de animais.`
    );
    
    if (!confirmRestore) return;

    try {
      console.log('📤 [ARQUIVO] Desarquivando animal:', animal.nome);

      const { error } = await supabase
        .from('animais')
        .update({
          arquivado: false,
          estado: 'Ativo',
          data_arquivamento: null,
          motivo_arquivamento: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', animal.id);

      if (error) {
        console.error('❌ [ARQUIVO] Erro ao desarquivar:', error);
        throw error;
      }

      toast({
        title: "✅ Animal desarquivado",
        description: `${animal.nome} foi desarquivado com sucesso`,
      });

      await fetchAnimaisArquivados();
    } catch (error: any) {
      console.error('💥 [ARQUIVO] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível desarquivar o animal",
        variant: "destructive",
      });
    }
  };

  // Funções para edição de arquivo
  const openEditArchive = (animal: Animal) => {
    setEditingArchive(animal);
    setArchiveForm({
      motivo_arquivamento: animal.motivo_arquivamento || '',
      data_arquivamento: animal.data_arquivamento ? 
        new Date(animal.data_arquivamento).toISOString().slice(0, 16) : ''
    });
  };

  const handleEditArchive = async () => {
    if (!editingArchive) return;

    try {
      console.log('✏️ [ARQUIVO] Editando critérios:', editingArchive.nome);

      const { error } = await supabase
        .from('animais')
        .update({
          motivo_arquivamento: archiveForm.motivo_arquivamento || null,
          data_arquivamento: archiveForm.data_arquivamento ? 
            new Date(archiveForm.data_arquivamento).toISOString() : 
            new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingArchive.id);

      if (error) {
        console.error('❌ [ARQUIVO] Erro ao editar:', error);
        throw error;
      }

      toast({
        title: "✅ Critérios atualizados",
        description: `Arquivo de ${editingArchive.nome} foi atualizado`,
      });

      setEditingArchive(null);
      await fetchAnimaisArquivados();
    } catch (error: any) {
      console.error('💥 [ARQUIVO] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar os critérios",
        variant: "destructive",
      });
    }
  };

  // Filtrar animais
  const animaisFiltrados = animais.filter(animal => {
    const matchSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       animal.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEspecie = filterEspecie === "todos" || animal.especie === filterEspecie;
    return matchSearch && matchEspecie;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Arquivado':
        return <Badge className="bg-gray-100 text-gray-800">📦 Arquivado</Badge>;
      case 'Óbito':
        return <Badge className="bg-black text-white">💀 Óbito</Badge>;
      case 'Adotado':
        return <Badge className="bg-green-100 text-green-800">🏠 Adotado</Badge>;
      case 'Não Adotável':
        return <Badge className="bg-red-100 text-red-800">⚠️ Não Adotável</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar animais arquivados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <LogotipoValentao size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Archive className="h-6 w-6 mr-2 text-gray-600" />
                  Animais Arquivados
                </h1>
                <p className="text-sm text-gray-600">
                  Gestão de animais arquivados - Acesso restrito a administradores
                </p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Arquivados</p>
                  <p className="text-3xl font-bold text-gray-900">{animais.length}</p>
                </div>
                <Archive className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Por Óbito</p>
                  <p className="text-3xl font-bold text-black">
                    {animais.filter(a => a.estado === 'Óbito').length}
                  </p>
                </div>
                <PawPrint className="h-8 w-8 text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outros Motivos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {animais.filter(a => a.estado !== 'Óbito').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por nome ou número de processo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterEspecie} onValueChange={setFilterEspecie}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as espécies</SelectItem>
                  <SelectItem value="Cão">Cão</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Animais Arquivados */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Animais Arquivados ({animaisFiltrados.length})</CardTitle>
            <CardDescription>
              Animais que foram arquivados do sistema principal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {animaisFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum animal arquivado encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterEspecie !== "todos" 
                    ? "Tente ajustar os filtros de pesquisa"
                    : "Não há animais arquivados no sistema"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Espécie</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Data Arquivamento</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {animaisFiltrados.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{animal.nome}</div>
                            <div className="text-sm text-gray-500">
                              Processo: {animal.numero_processo || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{animal.especie}</Badge>
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(animal.estado)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {animal.data_arquivamento ? formatDate(animal.data_arquivamento) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {animal.motivo_arquivamento || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedAnimal(animal)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Animal Arquivado</DialogTitle>
                                  <DialogDescription>
                                    Informações completas sobre {selectedAnimal?.nome}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedAnimal && (
                                  <div className="grid grid-cols-2 gap-4 py-4">
                                    <div>
                                      <strong>Nome:</strong> {selectedAnimal.nome}
                                    </div>
                                    <div>
                                      <strong>Processo:</strong> {selectedAnimal.numero_processo || 'N/A'}
                                    </div>
                                    <div>
                                      <strong>Espécie:</strong> {selectedAnimal.especie}
                                    </div>
                                    <div>
                                      <strong>Sexo:</strong> {selectedAnimal.sexo}
                                    </div>
                                    <div>
                                      <strong>Estado:</strong> {selectedAnimal.estado}
                                    </div>
                                    <div>
                                      <strong>Data Entrada:</strong> {formatDate(selectedAnimal.data_entrada)}
                                    </div>
                                    <div className="col-span-2">
                                      <strong>Data Arquivamento:</strong> {selectedAnimal.data_arquivamento ? formatDate(selectedAnimal.data_arquivamento) : 'N/A'}
                                    </div>
                                    <div className="col-span-2">
                                      <strong>Motivo Arquivamento:</strong> {selectedAnimal.motivo_arquivamento || 'N/A'}
                                    </div>
                                    {selectedAnimal.observacoes && (
                                      <div className="col-span-2">
                                        <strong>Observações:</strong> {selectedAnimal.observacoes}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditArchive(animal)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Editar critérios de arquivo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDesarquivar(animal)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Desarquivar animal"
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="text-green-600 hover:text-green-800"
                              title="Editar animal (acesso completo)"
                            >
                              <Link to={`/animal/${animal.id}`}>
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
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

      {/* Modal de Edição de Arquivo */}
      <Dialog open={!!editingArchive} onOpenChange={() => setEditingArchive(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Critérios de Arquivo</DialogTitle>
            <DialogDescription>
              Alterar informações do arquivamento de {editingArchive?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="data_arquivamento">Data de Arquivamento</Label>
              <Input 
                id="data_arquivamento"
                type="datetime-local"
                value={archiveForm.data_arquivamento}
                onChange={(e) => setArchiveForm(prev => ({
                  ...prev, 
                  data_arquivamento: e.target.value
                }))}
              />
            </div>
            <div>
              <Label htmlFor="motivo_arquivamento">Motivo do Arquivamento</Label>
              <Textarea 
                id="motivo_arquivamento"
                placeholder="Descreva o motivo do arquivamento..."
                value={archiveForm.motivo_arquivamento}
                onChange={(e) => setArchiveForm(prev => ({
                  ...prev, 
                  motivo_arquivamento: e.target.value
                }))}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setEditingArchive(null)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditArchive}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimaisArquivados;