import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  ExternalLink,
  Edit,
  Archive
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

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

      // Carregar dados do animal sem JOIN problemático
      const { data, error } = await supabase
        .from('animais')
        .select(`
          *,
          grupos(nome, tipo)
        `)
        .eq('id', id)
        .single();

      // Se animal carregado com sucesso, buscar voluntário responsável separadamente
      if (!error && data && data.voluntario_responsavel) {
        const { data: voluntarioData, error: voluntarioError } = await supabase
          .from('voluntarios')
          .select('nome')
          .eq('id', data.voluntario_responsavel)
          .single();
        
        if (voluntarioData && !voluntarioError) {
          data.voluntario_responsavel_nome = voluntarioData.nome;
        }
      }

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

  // Função para arquivar animal
  const handleArquivar = async () => {
    if (!animal) return;
    
    const confirmArchive = confirm(
      `Tem certeza que deseja arquivar o animal "${animal.nome}"?\n\n` +
      `O animal será removido da gestão ativa e movido para os arquivos.`
    );
    
    if (!confirmArchive) return;

    const motivo = prompt("Motivo do arquivamento (opcional):");

    try {
      console.log('📦 [ARQUIVO] Arquivando animal:', animal.nome);

      const { error } = await supabase
        .from('animais')
        .update({
          arquivado: true,
          data_arquivamento: new Date().toISOString(),
          motivo_arquivamento: motivo || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ [ARQUIVO] Erro ao arquivar:', error);
        throw error;
      }

      toast({
        title: "✅ Animal arquivado",
        description: `${animal.nome} foi arquivado com sucesso`,
      });

      navigate('/animais');
    } catch (error: any) {
      console.error('💥 [ARQUIVO] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível arquivar o animal",
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />

      {/* Navegação Adicional */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/animais">
                <Button variant="outline" size="sm">
                  <PawPrint className="h-4 w-4 mr-2" />
                  Lista de Animais
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${
                animal.estado === 'disponivel' ? 'bg-green-600' :
                animal.estado === 'adotado' ? 'bg-blue-600' :
                animal.estado === 'tratamento' ? 'bg-yellow-600' :
                'bg-gray-600'
              }`}>
                {animal.estado}
              </Badge>
              
              {/* Botões de Ação */}
              {hasPermission('admin') && (
                <>
                  <Link to={`/animal/${id}/editar`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleArquivar}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
            {/* Campos em Destaque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
              <div>
                <label className="text-blue-700 font-semibold flex items-center">
                  <span className="mr-2">📋</span>
                  Número do Processo
                </label>
                <p className="text-lg font-bold text-blue-900 mt-1">{animal.numero_processo || "N/A"}</p>
              </div>
              <div>
                <label className="text-blue-700 font-semibold flex items-center">
                  <span className="mr-2">🏠</span>
                  Grupo
                </label>
                <p className="text-lg font-bold text-blue-900 mt-1">{animal.grupos?.nome || "Sem grupo"}</p>
              </div>
            </div>

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
              <div>
                <label className="text-orange-700 font-medium">Voluntário Responsável</label>
                <p className="text-orange-900">{animal.voluntario_responsavel_nome || 'Sem responsável'}</p>
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
              
              {/* Histórico de Nomes */}
              <Link to={`/animal/${id}/historico-nomes`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-600 p-2 rounded-full">
                        <Edit className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-indigo-800">Histórico de Nomes</h3>
                        <p className="text-sm text-indigo-600">Alterações de nomes do animal</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-indigo-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
            </div>
          </CardContent>
        </Card>

      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimalDetail;