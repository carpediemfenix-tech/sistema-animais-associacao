import { useState, useEffect } from "react";
import PageActionBar from "@/components/PageActionBar";
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
  Edit,
  Heart,
  Cross,
  ArrowRight,
  Zap,
  UserCheck,
  AlertTriangle,
  Activity,
  MoreHorizontal,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

// Interface para motivos de arquivamento
interface MotivoArquivamento {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  categoria: string;
  requer_observacoes: boolean;
  ativo: boolean;
  ordem: number;
}

// Interface estendida para Animal com dados de arquivamento
interface AnimalArquivado extends Animal {
  motivo_arquivamento_id?: string;
  observacoes_arquivamento?: string;
  data_arquivamento?: string;
  motivo_arquivamento?: MotivoArquivamento;
}

const AnimaisArquivados = () => {
  const [animais, setAnimais] = useState<AnimalArquivado[]>([]);
  const [motivosArquivamento, setMotivosArquivamento] = useState<MotivoArquivamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecie, setFilterEspecie] = useState("todos");
  const [filterMotivo, setFilterMotivo] = useState("todos");
  const [filterSexo, setFilterSexo] = useState("todos");
  const [filterDataArquivo, setFilterDataArquivo] = useState("todos");
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalArquivado | null>(null);
  
  // Estados para dados dinâmicos
  const [especies, setEspecies] = useState<string[]>([]);
  const [sexos, setSexos] = useState<string[]>([]);
  
  // Estados do modal de arquivamento
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArchive, setEditingArchive] = useState<AnimalArquivado | null>(null);
  const [archiveForm, setArchiveForm] = useState({
    motivo_arquivamento_id: '',
    observacoes_arquivamento: '',
    data_arquivamento: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  
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
    loadFilterData();
    loadMotivosArquivamento();
  }, []);

  const fetchAnimaisArquivados = async () => {
    try {
      setLoading(true);
      console.log('📦 [ARQUIVO] Carregando animais arquivados...');

      const { data, error } = await supabase
        .from('animais')
        .select(`
          *,
          motivo_arquivamento:motivos_arquivamento_2025_12_11_04_00(*)
        `)
        .eq('arquivado', true)
        .order('data_arquivamento', { ascending: false });

      if (error) {
        console.error('❌ [ARQUIVO] Erro ao carregar animais:', error);
        throw error;
      }

      console.log(`✅ [ARQUIVO] ${data?.length || 0} animais arquivados carregados`);
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

  const loadFilterData = async () => {
    try {
      // Carregar espécies únicas dos animais arquivados
      const { data: especiesData } = await supabase
        .from('animais')
        .select('especie')
        .eq('arquivado', true);

      // Carregar sexos únicos dos animais arquivados
      const { data: sexosData } = await supabase
        .from('animais')
        .select('sexo')
        .eq('arquivado', true);

      const especiesUnicas = [...new Set(especiesData?.map(item => item.especie).filter(Boolean))];
      const sexosUnicos = [...new Set(sexosData?.map(item => item.sexo).filter(Boolean))];
      
      // Garantir que todos os sexos possíveis estão disponíveis
      const todosSexos = ['Macho', 'Fêmea', 'Indeterminado'];
      const sexosCompletos = [...new Set([...sexosUnicos, ...todosSexos])];

      setEspecies(especiesUnicas);
      setSexos(sexosCompletos);
    } catch (error) {
      console.error('Erro ao carregar dados de filtro:', error);
    }
  };

  const loadMotivosArquivamento = async () => {
    try {
      const { data, error } = await supabase
        .from('motivos_arquivamento_2025_12_11_04_00')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setMotivosArquivamento(data || []);
    } catch (error) {
      console.error('Erro ao carregar motivos de arquivamento:', error);
    }
  };

  const openEditArchiveDialog = (animal: AnimalArquivado) => {
    setEditingArchive(animal);
    setArchiveForm({
      motivo_arquivamento_id: animal.motivo_arquivamento_id || '',
      observacoes_arquivamento: animal.observacoes_arquivamento || '',
      data_arquivamento: animal.data_arquivamento ? 
        new Date(animal.data_arquivamento).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]
    });
    setDialogOpen(true);
  };

  const handleSaveArchive = async () => {
    if (!editingArchive) return;

    try {
      setSubmitting(true);

      const selectedMotivo = motivosArquivamento.find(m => m.id === archiveForm.motivo_arquivamento_id);
      
      // Validar se observações são obrigatórias
      if (selectedMotivo?.requer_observacoes && !archiveForm.observacoes_arquivamento.trim()) {
        toast({
          title: "❌ Erro",
          description: "Este motivo de arquivamento requer observações",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('animais')
        .update({
          motivo_arquivamento_id: archiveForm.motivo_arquivamento_id,
          observacoes_arquivamento: archiveForm.observacoes_arquivamento,
          data_arquivamento: archiveForm.data_arquivamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingArchive.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Dados de arquivamento atualizados com sucesso",
      });

      setDialogOpen(false);
      setEditingArchive(null);
      setArchiveForm({
        motivo_arquivamento_id: '',
        observacoes_arquivamento: '',
        data_arquivamento: new Date().toISOString().split('T')[0]
      });
      
      await fetchAnimaisArquivados();
    } catch (error: any) {
      console.error('Erro ao salvar dados de arquivamento:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível salvar os dados de arquivamento",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestaurarAnimal = async (animal: AnimalArquivado) => {
    try {
      const { error } = await supabase
        .from('animais')
        .update({
          arquivado: false,
          motivo_arquivamento_id: null,
          observacoes_arquivamento: null,
          data_arquivamento: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', animal.id);

      if (error) throw error;

      toast({
        title: "✅ Animal Restaurado",
        description: `${animal.nome} foi restaurado com sucesso`,
      });

      await fetchAnimaisArquivados();
    } catch (error: any) {
      console.error('Erro ao restaurar animal:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível restaurar o animal",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Heart, Cross, ArrowRight, Zap, UserCheck, AlertTriangle, Activity, MoreHorizontal
    };
    return icons[iconName] || Archive;
  };

  // Filtrar animais
  const filteredAnimais = animais.filter(animal => {
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.chip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecie = filterEspecie === "todos" || animal.especie === filterEspecie;
    const matchesSexo = filterSexo === "todos" || animal.sexo === filterSexo;
    const matchesMotivo = filterMotivo === "todos" || animal.motivo_arquivamento_id === filterMotivo;
    
    let matchesData = true;
    if (filterDataArquivo !== "todos" && animal.data_arquivamento) {
      const dataArquivo = new Date(animal.data_arquivamento);
      const hoje = new Date();
      const diasAtras = parseInt(filterDataArquivo);
      const dataLimite = new Date(hoje.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
      matchesData = dataArquivo >= dataLimite;
    }

    return matchesSearch && matchesEspecie && matchesSexo && matchesMotivo && matchesData;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando animais arquivados...</p>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Archive className="h-8 w-8 mr-3 text-gray-600" />
              Animais Arquivados
            </h1>
            <p className="text-gray-600 mt-1">
              Gestão de animais arquivados do sistema
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/modulo-animais">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Módulo Animais
            </Link>
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Archive className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Arquivados</p>
                  <p className="text-2xl font-bold text-gray-900">{animais.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Adoções</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {animais.filter(a => a.motivo_arquivamento?.categoria === 'adocao').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ArrowRight className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transferências</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {animais.filter(a => a.motivo_arquivamento?.categoria === 'transferencia').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Cross className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Óbitos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {animais.filter(a => a.motivo_arquivamento?.categoria === 'obito').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Filtros de Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Pesquisa */}
              <div>
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, chip..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Espécie */}
              <div>
                <Label htmlFor="especie">Espécie</Label>
                <Select value={filterEspecie} onValueChange={setFilterEspecie}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as espécies</SelectItem>
                    {especies.map((especie) => (
                      <SelectItem key={especie} value={especie}>
                        {especie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sexo */}
              <div>
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={filterSexo} onValueChange={setFilterSexo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os sexos</SelectItem>
                    {sexos.map((sexo) => (
                      <SelectItem key={sexo} value={sexo}>
                        {sexo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Motivo de Arquivamento */}
              <div>
                <Label htmlFor="motivo">Motivo</Label>
                <Select value={filterMotivo} onValueChange={setFilterMotivo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os motivos</SelectItem>
                    {motivosArquivamento.map((motivo) => (
                      <SelectItem key={motivo.id} value={motivo.id}>
                        {motivo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data de Arquivo */}
              <div>
                <Label htmlFor="data">Data de Arquivo</Label>
                <Select value={filterDataArquivo} onValueChange={setFilterDataArquivo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as datas</SelectItem>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 3 meses</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Animais */}
        <Card>
          <CardHeader>
            <CardTitle>
              Animais Arquivados ({filteredAnimais.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAnimais.length === 0 ? (
              <div className="text-center py-8">
                <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum animal arquivado encontrado</p>
                <p className="text-gray-400">Ajuste os filtros para ver mais resultados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Espécie/Sexo</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Data Arquivo</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnimais.map((animal) => {
                      const IconComponent = animal.motivo_arquivamento ? 
                        getIconComponent(animal.motivo_arquivamento.icone) : Archive;
                      
                      return (
                        <TableRow key={animal.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <PawPrint className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium">{animal.nome}</div>
                                {animal.chip && (
                                  <div className="text-sm text-gray-500">
                                    Chip: {animal.chip}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{animal.especie}</div>
                              <div className="text-gray-500">{animal.sexo}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {animal.motivo_arquivamento ? (
                              <Badge 
                                className="text-white"
                                style={{ backgroundColor: animal.motivo_arquivamento.cor }}
                              >
                                <IconComponent className="h-3 w-3 mr-1" />
                                {animal.motivo_arquivamento.nome}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Archive className="h-3 w-3 mr-1" />
                                Não especificado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {animal.data_arquivamento ? 
                                new Date(animal.data_arquivamento).toLocaleDateString('pt-PT') :
                                'Não especificada'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {animal.observacoes_arquivamento ? (
                                <p className="text-sm text-gray-600 truncate" title={animal.observacoes_arquivamento}>
                                  {animal.observacoes_arquivamento}
                                </p>
                              ) : (
                                <span className="text-gray-400 text-sm">Sem observações</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link to={`/animal/${animal.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                              </Link>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditArchiveDialog(animal)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRestaurarAnimal(animal)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ArchiveRestore className="h-4 w-4 mr-1" />
                                Restaurar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição de Arquivamento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Editar Dados de Arquivamento
            </DialogTitle>
            <DialogDescription>
              {editingArchive && `Editando dados de arquivamento de ${editingArchive.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo">Motivo de Arquivamento *</Label>
              <Select 
                value={archiveForm.motivo_arquivamento_id} 
                onValueChange={(value) => setArchiveForm({...archiveForm, motivo_arquivamento_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivosArquivamento.map((motivo) => {
                    const IconComponent = getIconComponent(motivo.icone);
                    return (
                      <SelectItem key={motivo.id} value={motivo.id}>
                        <div className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2" style={{ color: motivo.cor }} />
                          {motivo.nome}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data">Data de Arquivamento *</Label>
              <Input
                type="date"
                value={archiveForm.data_arquivamento}
                onChange={(e) => setArchiveForm({...archiveForm, data_arquivamento: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="observacoes">
                Observações
                {motivosArquivamento.find(m => m.id === archiveForm.motivo_arquivamento_id)?.requer_observacoes && 
                  <span className="text-red-500 ml-1">*</span>
                }
              </Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre o arquivamento..."
                value={archiveForm.observacoes_arquivamento}
                onChange={(e) => setArchiveForm({...archiveForm, observacoes_arquivamento: e.target.value})}
                rows={4}
              />
              {motivosArquivamento.find(m => m.id === archiveForm.motivo_arquivamento_id)?.requer_observacoes && (
                <p className="text-sm text-red-600 mt-1">
                  Este motivo requer observações obrigatórias
                </p>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveArchive}
                disabled={submitting || !archiveForm.motivo_arquivamento_id}
                className="flex-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default AnimaisArquivados;