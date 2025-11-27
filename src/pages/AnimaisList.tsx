import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit,
  Heart,
  Calendar,
  MapPin,
  Phone,
  PawPrint,
  User,
  Archive,
  ArchiveRestore
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

const AnimaisList = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchAnimais();
  }, []);

  const fetchAnimais = async () => {
    try {
      setLoading(true);
      console.log('🔍 [ANIMAIS] Buscando animais...');
      
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ANIMAIS] Erro ao buscar:', error);
        throw error;
      }

      console.log('✅ [ANIMAIS] Animais carregados:', data?.length || 0);
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

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Ativo': return 'default';
      case 'Adotado': return 'secondary';
      case 'Óbito': return 'destructive';
      case 'Não Adotável': return 'outline';
      default: return 'default';
    }
  };

  const getIdadeTexto = (idadeMeses?: number) => {
    if (!idadeMeses) return 'Idade não informada';
    
    if (idadeMeses < 12) {
      return `${idadeMeses} ${idadeMeses === 1 ? 'mês' : 'meses'}`;
    } else {
      const anos = Math.floor(idadeMeses / 12);
      const mesesRestantes = idadeMeses % 12;
      
      if (mesesRestantes === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
      } else {
        return `${anos}a ${mesesRestantes}m`;
      }
    }
  };

  const animaisFiltrados = animais.filter(animal => {
    // Filtro de arquivados
    if (!mostrarArquivados && animal.arquivado) return false;
    if (mostrarArquivados && !animal.arquivado) return false;

    // Filtro de busca
    if (searchTerm && !animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !animal.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(animal.raca?.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // ✅ EKO: FILTRO DE ESPÉCIE CORRIGIDO
    if (filtroEspecie !== "todos") {
      if (filtroEspecie === "Outro") {
        // "Outro" inclui todas as espécies EXCETO Cão e Gato
        if (animal.especie === "Cão" || animal.especie === "Gato") {
          console.log(`🔍 [FILTRO] Animal ${animal.nome} (${animal.especie}) excluído do filtro "Outro"`);
          return false;
        }
        console.log(`✅ [FILTRO] Animal ${animal.nome} (${animal.especie}) incluído no filtro "Outro"`);
      } else {
        // Filtros específicos (Cão, Gato)
        if (animal.especie !== filtroEspecie) {
          console.log(`🔍 [FILTRO] Animal ${animal.nome} (${animal.especie}) não corresponde ao filtro "${filtroEspecie}"`);
          return false;
        }
        console.log(`✅ [FILTRO] Animal ${animal.nome} (${animal.especie}) corresponde ao filtro "${filtroEspecie}"`);
      }
    }

    // Filtro de estado
    if (filtroEstado !== "todos" && animal.estado !== filtroEstado) return false;

    return true;
  });

  // 🐞 Debug: Log das espécies únicas para verificação
  useEffect(() => {
    const especiesUnicas = [...new Set(animais.map(a => a.especie))].sort();
    console.log('🐾 [DEBUG] Espécies encontradas na base de dados:', especiesUnicas);
    
    const animaisOutros = animais.filter(a => a.especie !== "Cão" && a.especie !== "Gato");
    console.log('🔍 [DEBUG] Animais que devem aparecer no filtro "Outro":', 
      animaisOutros.map(a => `${a.nome} (${a.especie})`));
  }, [animais]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar animais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ EKO: HEADER COM BOTÃO DE REGRESSO */}
      <UserHeader 
        title="Lista de Animais"
        description={`${animaisFiltrados.length} ${mostrarArquivados ? 'arquivados' : 'animais'} encontrados`}
      />
      
      {/* Botão de Regresso */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mostrarArquivados ? 'Animais Arquivados' : 'Lista de Animais'}
            </h1>
            <p className="text-gray-600">
              {animaisFiltrados.length} {mostrarArquivados ? 'arquivados' : 'animais'} encontrados
            </p>
          </div>
          <div className="flex space-x-2">
            {hasPermission('admin') && (
              <Button
                variant={mostrarArquivados ? "default" : "outline"}
                onClick={() => setMostrarArquivados(!mostrarArquivados)}
              >
                {mostrarArquivados ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Ver Ativos
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Ver Arquivados
                  </>
                )}
              </Button>
            )}
            {hasPermission('create') && !mostrarArquivados && (
              <Button asChild>
                <Link to="/novo-animal">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Animal
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Pesquisa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por nome, processo ou raça..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as espécies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as espécies</SelectItem>
                  <SelectItem value="Cão">Cão</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Outro">Outro (Ovelha, Coelho, etc.)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Adotado">Adotado</SelectItem>
                  <SelectItem value="Óbito">Óbito</SelectItem>
                  <SelectItem value="Não Adotável">Não Adotável</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFiltroEspecie("todos");
                  setFiltroEstado("todos");
                }}
              >
                Limpar Filtros
              </Button>

              <Select value={mostrarArquivados ? "arquivados" : "ativos"} onValueChange={(value) => setMostrarArquivados(value === "arquivados")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativos">Animais Ativos</SelectItem>
                  <SelectItem value="arquivados">Animais Arquivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Animais */}
        {animaisFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum animal encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filtroEspecie !== "todos" || filtroEstado !== "todos" 
                  ? "Tente ajustar os filtros de pesquisa"
                  : "Comece cadastrando o primeiro animal"
                }
              </p>
              {!searchTerm && filtroEspecie === "todos" && filtroEstado === "todos" && (
                <Button asChild>
                  <Link to="/novo-animal">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Animal
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animaisFiltrados.map((animal) => (
              <Card key={animal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{animal.nome}</span>
                        {animal.arquivado && (
                          <Badge variant="outline" className="text-xs">Arquivado</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-1">
                        <span>{animal.especie}</span>
                        {animal.raca && (
                          <>
                            <span>•</span>
                            <span>{animal.raca}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={getEstadoBadgeVariant(animal.estado)}>
                      {animal.estado}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Informações básicas */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Processo:</span>
                        <p className="font-mono text-blue-600">{animal.numero_processo}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Sexo:</span>
                        <p>{animal.sexo}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Idade:</span>
                        <p>{getIdadeTexto(animal.idade_estimada)}</p>
                      </div>
                      {animal.peso && (
                        <div>
                          <span className="font-medium text-gray-600">Peso:</span>
                          <p>{animal.peso} kg</p>
                        </div>
                      )}
                    </div>

                    {/* Informações adicionais */}
                    {animal.cor && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-600">Cor:</span>
                        <span className="ml-2">{animal.cor}</span>
                      </div>
                    )}

                    {animal.local_encontrado && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{animal.local_encontrado}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Entrada: {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}</span>
                    </div>

                    {animal.estado === 'Adotado' && animal.data_adocao && (
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          <span>Adotado em {new Date(animal.data_adocao).toLocaleDateString('pt-PT')}</span>
                        </div>
                        {animal.adotante_nome && (
                          <p className="mt-1">Por: {animal.adotante_nome}</p>
                        )}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex space-x-2 pt-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/animal/${animal.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Link>
                      </Button>
                      {hasPermission('update') && (
                        <Button asChild size="sm" className="flex-1">
                          <Link to={`/animal/${animal.id}/editar`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimaisList;