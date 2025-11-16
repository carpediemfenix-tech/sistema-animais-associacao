import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AnimaisList = () => {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecie, setFilterEspecie] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimais();
  }, []);

  const fetchAnimais = async () => {
    try {
      const { data, error } = await supabase
        .from('animais_2025_11_13_03_23')
        .select('*')
        .eq('arquivado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimais(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar animais",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimais = animais.filter(animal => {
    const matchesSearch = animal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.transponder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.numero_registo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecie = filterEspecie === "todos" || animal.especie === filterEspecie;
    const matchesEstado = filterEstado === "todos" || animal.estado === filterEstado;
    
    return matchesSearch && matchesEspecie && matchesEstado;
  });

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Ativo': return 'default';
      case 'Adotado': return 'secondary';
      case 'Óbito': return 'destructive';
      case 'Transferido': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando animais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img 
              src="/images/BackgroundEraser_20250411_205630024.png" 
              alt="Valentão ao Resgate - Logótipo Oficial" 
              className="h-16 w-auto object-contain mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lista de Animais - Valentão ao Resgate</h1>
            <p className="text-gray-600 mt-2">
              {filteredAnimais.length} de {animais.length} animais
            </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="outline">Voltar ao Início</Button>
            </Link>
            <Link to="/novo-animal">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Animal
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros e Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por nome, transponder..."
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

              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Adotado">Adotado</SelectItem>
                  <SelectItem value="Óbito">Óbito</SelectItem>
                  <SelectItem value="Transferido">Transferido</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterEspecie("todos");
                  setFilterEstado("todos");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Animais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimais.map((animal) => (
            <Card key={animal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{animal.nome}</CardTitle>
                    <CardDescription>
                      {animal.especie} {animal.raca && `• ${animal.raca}`}
                    </CardDescription>
                  </div>
                  <Badge variant={getEstadoBadgeVariant(animal.estado)}>
                    {animal.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {animal.numero_registo && (
                    <div><strong>Processo:</strong> <span className="font-mono text-blue-600">{animal.numero_registo}</span></div>
                  )}
                  <div><strong>Sexo:</strong> {animal.sexo}</div>
                  {animal.idade_estimada && (
                    <div><strong>Idade:</strong> {animal.idade_estimada}</div>
                  )}
                  {animal.peso && (
                    <div><strong>Peso:</strong> {animal.peso} kg</div>
                  )}
                  {animal.transponder && (
                    <div><strong>Transponder:</strong> {animal.transponder}</div>
                  )}
                  <div><strong>Entrada:</strong> {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}</div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Link to={`/animal/${animal.id}`}>
                    <Button className="w-full" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAnimais.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg mb-4">
                {animais.length === 0 
                  ? "Nenhum animal cadastrado ainda." 
                  : "Nenhum animal encontrado com os filtros aplicados."
                }
              </p>
              <Link to="/novo-animal">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Animal
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnimaisList;