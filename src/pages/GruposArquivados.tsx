import { useState, useEffect } from "react";
import PageActionBar from '@/components/PageActionBar';
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  RotateCcw,
  Users,
  MapPin,
  Calendar,
  Phone,
  User,
  PawPrint,
  Cat,
  Dog,
  Loader2,
  AlertCircle,
  Archive,
  Power
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Grupo } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const GruposArquivados = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchGruposArquivados();
  }, []);

  const fetchGruposArquivados = async () => {
    try {
      setLoading(true);
      console.log('📦 [GRUPOS DESATIVADOS] Carregando grupos desativados...');

      const { data, error } = await supabase
        .from('grupos')
        .select(`
          *,
          voluntarios(nome)
        `)
        .eq('ativo', false) // Grupos desativados em vez de arquivados
        .order('tipo')
        .order('nome');

      if (error) {
        console.error('❌ [GRUPOS DESATIVADOS] Erro ao carregar:', error);
        throw error;
      }

      console.log('✅ [GRUPOS DESATIVADOS] Grupos carregados:', data?.length || 0);
      setGrupos(data || []);
    } catch (error: any) {
      console.error('💥 [GRUPOS DESATIVADOS] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os grupos desativados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurar = async (grupo: Grupo) => {
    const confirmRestaurar = confirm(
      `Tem certeza que deseja ativar o grupo "${grupo.nome}"?\n\n` +
      `O grupo voltará a aparecer na listagem normal e em formulários de seleção.`
    );
    
    if (!confirmRestaurar) return;

    try {
      console.log('🔄 [GRUPOS DESATIVADOS] Ativando grupo:', grupo.nome);

      const { error } = await supabase
        .from('grupos')
        .update({ ativo: true }) // Apenas ativar
        .eq('id', grupo.id);

      if (error) throw error;

      toast({
        title: "✅ Grupo ativado",
        description: `${grupo.nome} foi ativado com sucesso`,
      });

      await fetchGruposArquivados();
    } catch (error: any) {
      console.error('💥 [GRUPOS DESATIVADOS] Erro ao ativar:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível ativar o grupo",
        variant: "destructive",
      });
    }
  };

  // Filtrar grupos
  const gruposFiltrados = grupos.filter(grupo => {
    const matchesSearch = grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grupo.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grupo.localidade?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === "todos" || grupo.tipo === filterTipo;
    
    return matchesSearch && matchesTipo;
  });

  const getStatusBadge = (grupo: Grupo) => {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        <Power className="h-3 w-3 mr-1" />
        Desativado
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      'Matilha': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Colónia': 'bg-green-100 text-green-800 border border-green-200',
      'Canil': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Gatil': 'bg-pink-100 text-pink-800 border border-pink-200',
      'Lar Temporário': 'bg-orange-100 text-orange-800 border border-orange-200'
    };
    
    return variants[tipo as keyof typeof variants] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar grupos desativados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Título da Página */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Grupos Desativados
          </h1>
          <p className="text-gray-600">
            Gestão de grupos desativados da associação
          </p>
        </div>

        {/* Filtros e Pesquisa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Pesquisar Grupos Desativados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Pesquisar por nome, localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="Matilha">Matilha</SelectItem>
                    <SelectItem value="Colónia">Colónia</SelectItem>
                    <SelectItem value="Canil">Canil</SelectItem>
                    <SelectItem value="Gatil">Gatil</SelectItem>
                    <SelectItem value="Lar Temporário">Lar Temporário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {searchTerm && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {gruposFiltrados.length} grupo(s) encontrado(s)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  Limpar pesquisa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Grupos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Archive className="h-5 w-5 mr-2" />
                Grupos Desativados ({gruposFiltrados.length})
              </div>
            </CardTitle>
            <CardDescription>
              Grupos que foram desativados e não aparecem em listagens normais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gruposFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo desativado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Tente ajustar os filtros de pesquisa'
                    : 'Não há grupos desativados no momento'
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar pesquisa
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gruposFiltrados.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {grupo.tipo === 'Matilha' && <Dog className="h-4 w-4 mr-2 text-blue-600" />}
                            {grupo.tipo === 'Colónia' && <Cat className="h-4 w-4 mr-2 text-green-600" />}
                            {grupo.tipo === 'Canil' && <PawPrint className="h-4 w-4 mr-2 text-purple-600" />}
                            {grupo.tipo === 'Gatil' && <Cat className="h-4 w-4 mr-2 text-pink-600" />}
                            {grupo.tipo === 'Lar Temporário' && <Users className="h-4 w-4 mr-2 text-orange-600" />}
                            {grupo.nome}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTipoBadge(grupo.tipo)}>
                            {grupo.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {grupo.localizacao || 'N/A'}
                            {grupo.localidade && (
                              <span className="ml-1">• {grupo.localidade}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {grupo.voluntarios?.nome || grupo.cuidador_informal || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(grupo)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link to={`/grupo/${grupo.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {hasPermission('update') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestaurar(grupo)}
                                className="text-green-600 hover:text-green-800"
                                title="Ativar grupo"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
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

      <EnhancedFooter />
    </div>
  );
};

export default GruposArquivados;