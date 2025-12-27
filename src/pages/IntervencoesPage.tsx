import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Activity,
  Calendar,
  Euro,
  User,
  Building
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Intervencao } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const IntervencoesPage = () => {
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const { toast } = useToast();

  useEffect(() => {
    fetchIntervencoes();
  }, []);

  const fetchIntervencoes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('intervencoes')
        .select(`
          *,
          animal:animais(nome, numero_processo, especie),
          tipo_intervencao:tipos_intervencoes(nome, cor),
          voluntario:voluntarios(nome)
        `)
        .order('data_intervencao', { ascending: false });

      if (error) throw error;

      setIntervencoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar intervenções:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as intervenções",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const intervencoesFiltradasPorBusca = intervencoes.filter(intervencao => {
    if (!searchTerm) return true;
    
    const termo = searchTerm.toLowerCase();
    return (
      intervencao.animal?.nome.toLowerCase().includes(termo) ||
      intervencao.animal?.numero_processo.toLowerCase().includes(termo) ||
      intervencao.tipo_intervencao?.nome.toLowerCase().includes(termo) ||
      intervencao.veterinario?.toLowerCase().includes(termo) ||
      intervencao.clinica?.toLowerCase().includes(termo)
    );
  });

  const intervencoesFiltradas = intervencoesFiltradasPorBusca.filter(intervencao => {
    if (filtroTipo === "todos") return true;
    return intervencao.tipo_intervencao?.nome === filtroTipo;
  });

  const tiposUnicos = [...new Set(intervencoes.map(i => i.tipo_intervencao?.nome).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar intervenções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/images/BackgroundEraser_20250411_205630024.png" 
                  alt="Valentão ao Resgate" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Intervenções Médicas</h1>
                  <p className="text-sm text-gray-500">{intervencoesFiltradas.length} intervenções encontradas</p>
                </div>
              </div>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por animal, processo, tipo, veterinário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {tiposUnicos.map((tipo) => (
                    <SelectItem key={tipo} value={tipo!}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Intervenções */}
        {intervencoesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma intervenção encontrada</h3>
              <p className="text-gray-500">
                {searchTerm || filtroTipo !== "todos" 
                  ? "Tente ajustar os filtros de pesquisa"
                  : "Ainda não há intervenções registadas"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {intervencoesFiltradas.map((intervencao) => (
              <Card key={intervencao.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge 
                          style={{ 
                            backgroundColor: intervencao.tipo_intervencao?.cor || '#3B82F6',
                            color: 'white'
                          }}
                        >
                          {intervencao.tipo_intervencao?.nome}
                        </Badge>
                        {intervencao.urgente && (
                          <Badge variant="destructive">Urgente</Badge>
                        )}
                        {!intervencao.concluida && (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Animal</h3>
                          <p className="text-sm text-gray-600">{intervencao.animal?.nome}</p>
                          <p className="text-xs text-blue-600 font-mono">{intervencao.animal?.numero_processo}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Data
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                        
                        {intervencao.veterinario && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              Veterinário
                            </h3>
                            <p className="text-sm text-gray-600">{intervencao.veterinario}</p>
                          </div>
                        )}
                        
                        {intervencao.clinica && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              Clínica
                            </h3>
                            <p className="text-sm text-gray-600">{intervencao.clinica}</p>
                          </div>
                        )}
                      </div>
                      
                      {intervencao.observacoes && (
                        <div className="mt-3">
                          <h3 className="font-semibold text-gray-900 mb-1">Observações</h3>
                          <p className="text-sm text-gray-600">{intervencao.observacoes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div className="flex items-center space-x-4">
                          {intervencao.custo && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Euro className="h-4 w-4 mr-1" />
                              <span>€{intervencao.custo.toFixed(2)}</span>
                            </div>
                          )}
                          
                          {intervencao.voluntario && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Responsável:</span> {intervencao.voluntario.nome}
                            </div>
                          )}
                        </div>
                        
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/animal/${intervencao.animal_id}`}>
                            Ver Animal
                          </Link>
                        </Button>
                      </div>
                      
                      {intervencao.proxima_data && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                          <span className="font-medium text-yellow-800">Próxima consulta:</span>
                          <span className="text-yellow-700 ml-2">
                            {new Date(intervencao.proxima_data).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
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

export default IntervencoesPage;