import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PawPrint, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Printer, 
  Grid3X3, 
  List, 
  Calendar,
  MapPin,
  Activity,
  FileText,
  Camera,
  ArrowLeft,
  RefreshCw,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Heart,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const GestaoAnimaisDesktop = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnimais, setSelectedAnimais] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table');
  const [sortField, setSortField] = useState<keyof Animal>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    especie: '',
    estado: '',
    sexo: '',
    idade_min: '',
    idade_max: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimais();
  }, []);

  const fetchAnimais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('arquivado', false)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      setAnimais(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar animais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de animais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Animal) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    fetchAnimais();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAnimais(filteredAnimais.map(animal => animal.id));
    } else {
      setSelectedAnimais([]);
    }
  };

  const handleSelectAnimal = (animalId: string, checked: boolean) => {
    if (checked) {
      setSelectedAnimais([...selectedAnimais, animalId]);
    } else {
      setSelectedAnimais(selectedAnimais.filter(id => id !== animalId));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'export') => {
    if (selectedAnimais.length === 0) {
      toast({
        title: "Nenhum animal selecionado",
        description: "Selecione pelo menos um animal para realizar esta ação",
        variant: "destructive",
      });
      return;
    }

    try {
      switch (action) {
        case 'archive':
          await supabase
            .from('animais')
            .update({ arquivado: true })
            .in('id', selectedAnimais);
          toast({
            title: "Animais arquivados",
            description: `${selectedAnimais.length} animais foram arquivados com sucesso`,
          });
          break;
        case 'export':
          // Implementar exportação
          toast({
            title: "Exportação iniciada",
            description: `Exportando dados de ${selectedAnimais.length} animais`,
          });
          break;
      }
      setSelectedAnimais([]);
      fetchAnimais();
    } catch (error: any) {
      toast({
        title: "Erro na ação em lote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filtrar animais
  const filteredAnimais = animais.filter(animal => {
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.especie.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecie = !filters.especie || animal.especie === filters.especie;
    const matchesEstado = !filters.estado || animal.estado === filters.estado;
    const matchesSexo = !filters.sexo || animal.sexo === filters.sexo;
    
    return matchesSearch && matchesEspecie && matchesEstado && matchesSexo;
  });

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Adotado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Óbito': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Não Adotável': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIdadeDisplay = (animal: Animal) => {
    if (animal.data_nascimento) {
      const hoje = new Date();
      const nascimento = new Date(animal.data_nascimento);
      const diffTime = Math.abs(hoje.getTime() - nascimento.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const anos = Math.floor(diffDays / 365);
      const meses = Math.floor((diffDays % 365) / 30);
      
      if (anos > 0) {
        return `${anos}a ${meses}m`;
      } else {
        return `${meses}m`;
      }
    }
    return animal.idade_estimada ? `${animal.idade_estimada}m (est.)` : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar gestão de animais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <PawPrint className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gestão de Animais</h1>
                  <p className="text-sm text-gray-500">
                    {filteredAnimais.length} de {animais.length} animais
                    {selectedAnimais.length > 0 && ` • ${selectedAnimais.length} selecionados`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={fetchAnimais} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/novo-animal">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Animal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Pesquisa */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome, processo ou espécie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <Select value={filters.especie} onValueChange={(value) => setFilters({...filters, especie: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Cão">Cão</SelectItem>
                <SelectItem value="Gato">Gato</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.estado} onValueChange={(value) => setFilters({...filters, estado: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Adotado">Adotado</SelectItem>
                <SelectItem value="Óbito">Óbito</SelectItem>
                <SelectItem value="Não Adotável">Não Adotável</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sexo} onValueChange={(value) => setFilters({...filters, sexo: value})}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Macho">Macho</SelectItem>
                <SelectItem value="Fêmea">Fêmea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modos de Visualização */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ações em Lote */}
        {selectedAnimais.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedAnimais.length} animais selecionados
            </span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('archive')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Arquivar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-full mx-auto px-6 py-6">
        {/* Visualização em Tabela */}
        {viewMode === 'table' && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedAnimais.length === filteredAnimais.length && filteredAnimais.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-20">Foto</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('numero_processo')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Processo</span>
                        {sortField === 'numero_processo' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Nome</span>
                        {sortField === 'nome' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Espécie</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('data_entrada')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Data Entrada</span>
                        {sortField === 'data_entrada' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnimais.map((animal) => (
                    <TableRow key={animal.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedAnimais.includes(animal.id)}
                          onCheckedChange={(checked) => handleSelectAnimal(animal.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {animal.foto_url ? (
                            <img 
                              src={animal.foto_url} 
                              alt={animal.nome}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <PawPrint className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {animal.numero_processo || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">{animal.nome}</TableCell>
                      <TableCell>{animal.especie}</TableCell>
                      <TableCell>{animal.sexo}</TableCell>
                      <TableCell>{getIdadeDisplay(animal)}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeColor(animal.estado)}>
                          {animal.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {animal.data_entrada ? new Date(animal.data_entrada).toLocaleDateString('pt-PT') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/animal/${animal.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/animal/${animal.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Visualização em Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimais.map((animal) => (
              <Card key={animal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Checkbox
                      checked={selectedAnimais.includes(animal.id)}
                      onCheckedChange={(checked) => handleSelectAnimal(animal.id, checked as boolean)}
                    />
                    <Badge className={getEstadoBadgeColor(animal.estado)}>
                      {animal.estado}
                    </Badge>
                  </div>

                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    {animal.foto_url ? (
                      <img 
                        src={animal.foto_url} 
                        alt={animal.nome}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <PawPrint className="h-16 w-16 text-gray-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{animal.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {animal.numero_processo && `Processo: ${animal.numero_processo}`}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{animal.especie} • {animal.sexo}</span>
                      <span>{getIdadeDisplay(animal)}</span>
                    </div>
                    {animal.data_entrada && (
                      <p className="text-xs text-gray-500">
                        Entrada: {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/animal/${animal.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/animal/${animal.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {filteredAnimais.length === 0 && (
          <Card>
            <CardContent className="text-center py-16">
              <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum animal encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? "Tente ajustar os filtros de pesquisa"
                  : "Comece adicionando o primeiro animal ao sistema"
                }
              </p>
              <Button asChild>
                <Link to="/novo-animal">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Animal
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GestaoAnimaisDesktop;