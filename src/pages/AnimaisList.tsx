import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Archive,
  ArrowLeft,
  Heart,
  Calendar,
  MapPin,
  Filter,
  Users,
  PawPrint,
  Hash,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Animal {
  id: string;
  numero_processo?: string;
  nome: string;
  especie: string;
  raca?: string;
  sexo: string;
  idade_estimada?: number;
  peso?: number;
  cor?: string;
  estado: string;
  data_entrada: string;
  localizacao_atual?: string;
  foto_url?: string;
  observacoes?: string;
  grupo_id?: string;
  created_at: string;
  // Dados do grupo (via join)
  grupos?: {
    nome: string;
    tipo: string;
  };
}

// Funções de coloração por sexo
const getCardColorBySex = (sexo: string) => {
  if (sexo === 'Macho') return 'border-blue-200 bg-blue-50';
  if (sexo === 'Fêmea') return 'border-pink-200 bg-pink-50';
  if (sexo === 'Indeterminado') return 'border-yellow-200 bg-yellow-50';
  return 'border-gray-200 bg-gray-50';
};

const getSexBadge = (sexo: string) => {
  if (sexo === 'Macho') return 'bg-blue-600 text-white';
  if (sexo === 'Fêmea') return 'bg-pink-600 text-white';
  if (sexo === 'Indeterminado') return 'bg-yellow-600 text-white';
  return 'bg-gray-600 text-white';
};

const getEstadoBadge = (estado: string) => {
  if (estado === 'Ativo') return 'bg-green-600 text-white';
  if (estado === 'Adotado') return 'bg-blue-600 text-white';
  if (estado === 'Óbito') return 'bg-red-600 text-white';
  if (estado === 'Não Adotável') return 'bg-orange-600 text-white';
  return 'bg-gray-600 text-white';
};

const AnimaisList: React.FC = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroSexo, setFiltroSexo] = useState("todos");
  const { toast } = useToast();

  const fetchAnimais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animais')
        .select(`
          *,
          grupos:grupo_id (
            nome,
            tipo
          )
        `)
        .neq('estado', 'arquivado')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar animais:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de animais",
          variant: "destructive",
        });
        return;
      }

      setAnimais(data || []);
    } catch (error) {
      console.error('Erro ao buscar animais:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com a base de dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimais();
  }, []);

  const filteredAnimais = animais.filter(animal => {
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.raca && animal.raca.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (animal.numero_processo && animal.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEspecie = filtroEspecie === "todas" || 
                          (filtroEspecie === "outros" && animal.especie !== "Cão" && animal.especie !== "Gato") ||
                          animal.especie === filtroEspecie;
    
    const matchesEstado = filtroEstado === "todos" || animal.estado === filtroEstado;
    const matchesSexo = filtroSexo === "todos" || animal.sexo === filtroSexo;

    return matchesSearch && matchesEspecie && matchesEstado && matchesSexo;
  });

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'disponivel': 'bg-green-100 text-green-800',
      'adotado': 'bg-blue-100 text-blue-800',
      'tratamento': 'bg-yellow-100 text-yellow-800',
      'quarentena': 'bg-orange-100 text-orange-800',
      'critico': 'bg-red-100 text-red-800'
    };
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  // Nova função para cores baseadas no sexo
  const getCardColorBySex = (sexo: string) => {
    if (sexo === 'Macho') {
      return 'border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-white';
    } else if (sexo === 'Fêmea') {
      return 'border-l-4 border-l-pink-400 bg-gradient-to-r from-pink-50 to-white';
    }
    return 'border-l-4 border-l-gray-400 bg-gradient-to-r from-gray-50 to-white';
  };

  const getSexBadge = (sexo: string) => {
    if (sexo === 'Macho') {
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    } else if (sexo === 'Fêmea') {
      return 'bg-pink-100 text-pink-800 border border-pink-200';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getIdadeTexto = (idade?: number) => {
    if (!idade) return 'Idade desconhecida';
    if (idade < 12) return `${idade} meses`;
    const anos = Math.floor(idade / 12);
    const meses = idade % 12;
    if (meses === 0) return `${anos} ano${anos > 1 ? 's' : ''}`;
    return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} mês${meses > 1 ? 'es' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando animais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="Gestão de Animais"
        subtitle={`${filteredAnimais.length} animais encontrados`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Barra de Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/novo-animal">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Animal
              </Button>
            </Link>
            <Link to="/animais-arquivados">
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Arquivados
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros e Pesquisa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros e Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Pesquisar por nome, espécie, raça ou nº processo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
                  <SelectTrigger>
                    <SelectValue placeholder="Espécie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as espécies</SelectItem>
                    <SelectItem value="Cão">🐕 Cão</SelectItem>
                    <SelectItem value="Gato">🐱 Gato</SelectItem>
                    <SelectItem value="outros">🐾 Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os estados</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="adotado">Adotado</SelectItem>
                    <SelectItem value="tratamento">Em Tratamento</SelectItem>
                    <SelectItem value="quarentena">Quarentena</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filtroSexo} onValueChange={setFiltroSexo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Macho">♂️ Macho</SelectItem>
                    <SelectItem value="Fêmea">♀️ Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setFiltroEspecie("todas");
                    setFiltroEstado("todos");
                    setFiltroSexo("todos");
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Animais */}
        {filteredAnimais.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum animal encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filtroEspecie !== "todas" || filtroEstado !== "todos" || filtroSexo !== "todos"
                  ? "Tente ajustar os filtros de pesquisa"
                  : "Comece adicionando o primeiro animal à base de dados"
                }
              </p>
              {!searchTerm && filtroEspecie === "todas" && filtroEstado === "todos" && filtroSexo === "todos" && (
                <Link to="/novo-animal">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Animal
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimais.map((animal) => (
              <Card 
                key={animal.id} 
                className={`hover:shadow-lg transition-shadow duration-200 ${getCardColorBySex(animal.sexo)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {animal.nome}
                        </CardTitle>
                        <Badge className={getSexBadge(animal.sexo)}>
                          {animal.sexo === 'Macho' ? '♂️' : animal.sexo === 'Fêmea' ? '♀️' : '❓'} {animal.sexo}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm text-gray-600">
                        {animal.especie} {animal.raca && `• ${animal.raca}`}
                      </CardDescription>
                      
                      {/* Número do Processo */}
                      {animal.numero_processo && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Hash className="h-3 w-3 mr-1" />
                          Processo: {animal.numero_processo}
                        </div>
                      )}
                      
                      {/* Grupo */}
                      {animal.grupos && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Home className="h-3 w-3 mr-1" />
                          Grupo: {animal.grupos.nome}
                        </div>
                      )}
                    </div>
                    <Badge className={getEstadoBadge(animal.estado)}>
                      {animal.estado}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {getIdadeTexto(animal.idade_estimada)}
                    </div>
                    
                    {animal.peso && (
                      <div className="flex items-center text-gray-600">
                        <span className="h-3 w-3 mr-1">⚖️</span>
                        {animal.peso}kg
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}
                    </div>
                    
                    {animal.localizacao_atual && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        {animal.localizacao_atual}
                      </div>
                    )}
                  </div>

                  {animal.cor && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Cor:</span> {animal.cor}
                    </div>
                  )}

                  {animal.observacoes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Observações:</span> {animal.observacoes.substring(0, 100)}
                      {animal.observacoes.length > 100 && '...'}
                    </div>
                  )}

                  {/* BOTÕES */}
                  <div className="flex space-x-2 pt-2">
                    <Link to={`/animal/${animal.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link to={`/animal/${animal.id}/editar`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </Link>
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