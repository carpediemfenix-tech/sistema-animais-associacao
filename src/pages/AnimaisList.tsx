import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
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
  if (estado === 'Arquivado') return 'bg-gray-600 text-white';
  return 'bg-gray-600 text-white';
};

const AnimaisList: React.FC = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroSexo, setFiltroSexo] = useState("todos");
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [filtroIdade, setFiltroIdade] = useState("todas");
  
  // Estados para dados dinâmicos
  const [especies, setEspecies] = useState<any[]>([]);
  const [sexos, setSexos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  
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
        .eq('arquivado', false)
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

  // Carregar dados dinâmicos para filtros
  const loadFilterData = async () => {
    try {
      const [especiesData, sexosData, gruposData] = await Promise.all([
        supabase.from('especies').select('nome').eq('ativo', true).order('nome'),
        supabase.from('sexos').select('nome').eq('ativo', true).order('nome'),
        supabase.from('grupos').select('id, nome, tipo').eq('ativo', true).neq('arquivado', true).order('nome')
      ]);
      
      setEspecies(especiesData.data || []);
      setSexos(sexosData.data || []);
      setGrupos(gruposData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de filtros:', error);
    }
  };

  useEffect(() => {
    fetchAnimais();
    loadFilterData();
  }, []);

  const filteredAnimais = animais.filter(animal => {
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.raca && animal.raca.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (animal.numero_processo && animal.numero_processo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (animal.grupos?.nome && animal.grupos.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (animal.cor && animal.cor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (animal.local_encontrado && animal.local_encontrado.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEspecie = filtroEspecie === "todas" || animal.especie === filtroEspecie;
    const matchesEstado = filtroEstado === "todos" || animal.estado === filtroEstado;
    const matchesSexo = filtroSexo === "todos" || animal.sexo === filtroSexo;
    const matchesGrupo = filtroGrupo === "todos" || 
                        (filtroGrupo === "sem_grupo" && !animal.grupos?.nome) ||
                        animal.grupos?.nome === filtroGrupo;
    
    const matchesIdade = filtroIdade === "todas" || (() => {
      const idade = animal.idade_estimada || 0;
      switch (filtroIdade) {
        case "filhote": return idade <= 12;
        case "jovem": return idade > 12 && idade <= 36;
        case "adulto": return idade > 36 && idade <= 84;
        case "senior": return idade > 84;
        default: return true;
      }
    })();

    return matchesSearch && matchesEspecie && matchesEstado && matchesSexo && matchesGrupo && matchesIdade;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        
        {/* Título da Página */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Lista de Animais
          </h1>
          <p className="text-gray-600">
            Gestão completa dos animais da associação
          </p>
        </div>

        {/* Filtros e Pesquisa */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Filtros e Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Pesquisa Expandida */}
              <div className="sm:col-span-2 lg:col-span-3">
                <Input
                  placeholder="Pesquisar animais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm sm:text-base"
                />
              </div>
              
              {/* Espécie Dinâmica */}
              <div>
                <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
                  <SelectTrigger>
                    <SelectValue placeholder="Espécie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as espécies</SelectItem>
                    {especies.map((especie) => (
                      <SelectItem key={especie.nome} value={especie.nome}>
                        {especie.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado Corrigido */}
              <div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os estados</SelectItem>
                    <SelectItem value="Ativo">🟢 Ativo</SelectItem>
                    <SelectItem value="Adotado">🏠 Adotado</SelectItem>
                    <SelectItem value="Óbito">💀 Óbito</SelectItem>
                    <SelectItem value="Não Adotável">⚠️ Não Adotável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sexo Dinâmico */}
              <div>
                <Select value={filtroSexo} onValueChange={setFiltroSexo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {sexos.map((sexo) => (
                      <SelectItem key={sexo.nome} value={sexo.nome}>
                        {sexo.nome === 'Macho' && '♂️'}
                        {sexo.nome === 'Fêmea' && '♀️'}
                        {sexo.nome === 'Indeterminado' && '❓'}
                        {' '}{sexo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grupo Dinâmico */}
              <div>
                <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os grupos</SelectItem>
                    <SelectItem value="sem_grupo">Sem grupo</SelectItem>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.nome}>
                        {grupo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Idade */}
              <div>
                <Select value={filtroIdade} onValueChange={setFiltroIdade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Idade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as idades</SelectItem>
                    <SelectItem value="filhote">🐶 Filhote (0-1 ano)</SelectItem>
                    <SelectItem value="jovem">🐕 Jovem (1-3 anos)</SelectItem>
                    <SelectItem value="adulto">🐈 Adulto (3-7 anos)</SelectItem>
                    <SelectItem value="senior">🐕‍🦳 Sénior (7+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botão Limpar */}
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setFiltroEspecie("todas");
                    setFiltroEstado("todos");
                    setFiltroSexo("todos");
                    setFiltroGrupo("todos");
                    setFiltroIdade("todas");
                  }}
                  className="w-full"
                >
                  🗑️ Limpar Filtros
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredAnimais.map((animal) => (
              <Card 
                key={animal.id} 
                className={`hover:shadow-lg transition-shadow duration-200 ${getCardColorBySex(animal.sexo)}`}
              >
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900 truncate">
                          {animal.nome}
                        </CardTitle>
                        <Badge className={`${getSexBadge(animal.sexo)} text-xs shrink-0`}>
                          <span className="hidden sm:inline">
                            {animal.sexo === 'Macho' ? '♂️' : animal.sexo === 'Fêmea' ? '♀️' : '❓'} {animal.sexo}
                          </span>
                          <span className="sm:hidden">
                            {animal.sexo === 'Macho' ? '♂️' : animal.sexo === 'Fêmea' ? '♀️' : '❓'}
                          </span>
                        </Badge>
                      </div>
                      <CardDescription className="text-xs sm:text-sm text-gray-600 truncate">
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
                
                <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
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
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Link to={`/animal/${animal.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Ver Detalhes</span>
                        <span className="sm:hidden">Ver</span>
                      </Button>
                    </Link>
                    <Link to={`/animal/${animal.id}/editar`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimaisList;