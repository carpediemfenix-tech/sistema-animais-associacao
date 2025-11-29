import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  PawPrint,
  Loader2,
  AlertCircle,
  Stethoscope,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Função básica para carregar dados do animal
  const fetchAnimalData = async () => {
    if (!id) {
      setError("ID do animal não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao carregar animal:', error);
        setError('Erro ao carregar dados do animal');
        return;
      }

      if (!data) {
        setError('Animal não encontrado');
        return;
      }

      setAnimal(data);
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro inesperado ao carregar animal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dados do animal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Link to="/animais">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Animais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 mb-4">Animal não encontrado</p>
          <Link to="/animais">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Animais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title={`${animal.nome} - Ficha Completa`}
        subtitle={`${animal.especie} • ${animal.sexo} • ${animal.estado}`}
        backTo="/animais"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Informações Básicas do Animal */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <PawPrint className="h-6 w-6 mr-2" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-orange-700 font-medium">Nome</label>
                <p className="text-orange-900 text-lg font-semibold">{animal.nome}</p>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Espécie</label>
                <p className="text-orange-900">{animal.especie}</p>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Sexo</label>
                <p className="text-orange-900">{animal.sexo}</p>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Estado</label>
                <Badge className={`${
                  animal.estado === 'disponivel' ? 'bg-green-600' :
                  animal.estado === 'adotado' ? 'bg-blue-600' :
                  animal.estado === 'tratamento' ? 'bg-yellow-600' :
                  'bg-gray-600'
                }`}>
                  {animal.estado}
                </Badge>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Data de Entrada</label>
                <p className="text-orange-900">
                  {animal.data_entrada ? new Date(animal.data_entrada).toLocaleDateString('pt-PT') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Idade Estimada</label>
                <p className="text-orange-900">
                  {animal.idade_estimada ? `${Math.floor(animal.idade_estimada / 12)} anos e ${animal.idade_estimada % 12} meses` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Peso</label>
                <p className="text-orange-900">{animal.peso ? `${animal.peso} kg` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Cor</label>
                <p className="text-orange-900">{animal.cor || 'N/A'}</p>
              </div>
              <div>
                <label className="text-orange-700 font-medium">Transponder</label>
                <p className="text-orange-900">{animal.transponder || 'N/A'}</p>
              </div>
            </div>
            
            {animal.caracteristicas_fisicas && (
              <div className="mt-4">
                <label className="text-orange-700 font-medium">Características Físicas</label>
                <p className="text-orange-900 mt-1">{animal.caracteristicas_fisicas}</p>
              </div>
            )}
            
            {animal.observacoes && (
              <div className="mt-4">
                <label className="text-orange-700 font-medium">Observações</label>
                <p className="text-orange-900 mt-1">{animal.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegação para Funcionalidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PawPrint className="h-5 w-5 mr-2 text-blue-600" />
              Gestão do Animal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Intervenções */}
              <Link to={`/animal/${id}/intervencoes`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 p-2 rounded-full">
                        <Stethoscope className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-800">Intervenções</h3>
                        <p className="text-sm text-blue-600">Histórico médico e consultas</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Eventos */}
              <Link to={`/animal/${id}/eventos`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-600 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">Eventos</h3>
                        <p className="text-sm text-green-600">Timeline e marcos importantes</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Localizações */}
              <Link to={`/animal/${id}/localizacoes`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-purple-800">Localizações</h3>
                        <p className="text-sm text-purple-600">Histórico de transferências</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Responsabilidades */}
              <Link to={`/animal/${id}/responsabilidades`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-600 p-2 rounded-full">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-orange-800">Responsabilidades</h3>
                        <p className="text-sm text-orange-600">Atribuições e voluntários</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Financeiro */}
              <Link to={`/animal/${id}/financeiro`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-600 p-2 rounded-full">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-800">Financeiro</h3>
                        <p className="text-sm text-emerald-600">Custos e investimentos</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AnimalDetail;