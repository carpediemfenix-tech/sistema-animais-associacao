import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Search, 
  Calendar,
  FileText,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Evento } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const EventosPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          animal:animais(nome, numero_processo, especie)
        `)
        .order('data_evento', { ascending: false });

      if (error) throw error;

      setEventos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const eventosFiltrados = eventos.filter(evento => {
    if (!searchTerm) return true;
    
    const termo = searchTerm.toLowerCase();
    return (
      evento.animal?.nome.toLowerCase().includes(termo) ||
      evento.animal?.numero_processo.toLowerCase().includes(termo) ||
      evento.tipo_evento.toLowerCase().includes(termo) ||
      evento.descricao.toLowerCase().includes(termo)
    );
  });

  const getEventoBadgeVariant = (tipoEvento: string) => {
    switch (tipoEvento) {
      case 'Entrada': return 'default';
      case 'Adoção': return 'secondary';
      case 'Transferência': return 'outline';
      case 'Visita Veterinária': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar eventos...</p>
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
                  <h1 className="text-xl font-bold text-gray-900">Eventos & Histórico</h1>
                  <p className="text-sm text-gray-500">{eventosFiltrados.length} eventos encontrados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pesquisa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Pesquisar Eventos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar por animal, processo, tipo de evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eventos */}
        {eventosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Tente ajustar o termo de pesquisa"
                  : "Ainda não há eventos registados"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {eventosFiltrados.map((evento) => (
              <Card key={evento.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant={getEventoBadgeVariant(evento.tipo_evento)}>
                          {evento.tipo_evento}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(evento.data_evento).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Animal</h3>
                          <p className="text-sm text-gray-600">{evento.animal?.nome}</p>
                          <p className="text-xs text-blue-600 font-mono">{evento.animal?.numero_processo}</p>
                          <p className="text-xs text-gray-500">{evento.animal?.especie}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            Descrição
                          </h3>
                          <p className="text-sm text-gray-600">{evento.descricao}</p>
                        </div>
                      </div>
                      
                      {evento.observacoes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <h3 className="font-semibold text-gray-900 mb-1">Observações</h3>
                          <p className="text-sm text-gray-600">{evento.observacoes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div className="text-xs text-gray-500">
                          Registado em {new Date(evento.created_at).toLocaleDateString('pt-PT')} às {new Date(evento.created_at).toLocaleTimeString('pt-PT')}
                        </div>
                        
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/animal/${evento.animal_id}`}>
                            Ver Animal
                          </Link>
                        </Button>
                      </div>
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

export default EventosPage;