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
  Archive,
  Clock,
  User,
  Shield,
  History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { convertGoogleDriveUrl } from "@/lib/utils";
import PageActionBar from "@/components/PageActionBar";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<any>(null);
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
      
      // Carregar localização atual
      const { data: localizacaoData, error: localizacaoError } = await supabase
        .from('localizacoes_animal')
        .select('*')
        .eq('animal_id', id)
        .eq('ativo', true)
        .single();
      
      if (localizacaoData && !localizacaoError) {
        // Buscar localização separadamente
        const { data: localizacaoInfo } = await supabase
          .from('localizacoes')
          .select('nome, descricao')
          .eq('id', localizacaoData.localizacao_id)
          .single();
        
        if (localizacaoInfo) {
          localizacaoData.localizacao = localizacaoInfo;
        }
        
        setLocalizacaoAtual(localizacaoData);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      {/* Barra de Navegação e Ações */}
      <PageActionBar
        breadcrumbs={[
          { label: 'Animais', href: '/animais', icon: <PawPrint className="h-4 w-4" /> },
          { label: animal.nome }
        ]}
        primaryActions={
          <>
            <Badge className={`text-sm px-3 py-1 ${
              animal.estado === 'Ativo' ? 'bg-green-600' :
              animal.estado === 'Adotado' ? 'bg-blue-600' :
              animal.estado === 'Óbito' ? 'bg-gray-600' :
              'bg-yellow-600'
            }`}>
              {animal.estado}
            </Badge>
            
            {hasPermission('admin') && (
              <>
                <Link to={`/animal/${id}/editar`}>
                  <Button variant="outline" className="h-9">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Link to={`/animal/${id}/historico-nomes`}>
                  <Button variant="outline" className="h-9">
                    <History className="h-4 w-4 mr-2" />
                    Histórico Nomes
                  </Button>
                </Link>
              </>
            )}
          </>
        }
        secondaryActions={
          hasPermission('admin') ? [
            {
              label: 'Arquivar Animal',
              onClick: handleArquivar,
              icon: <Archive className="h-4 w-4" />
            }
          ] : []
        }
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Informações Básicas do Animal */}
        <Card className="border-l-4 border-orange-500 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-6 border-b-2 border-orange-200">
            <div className="text-center mb-4">
              {/* Fotografia do Animal */}
              {animal.url_fotografia && (
                <div className="mb-6">
                  <img 
                    src={convertGoogleDriveUrl(animal.url_fotografia)} 
                    alt={`Foto de ${animal.nome}`}
                    className="w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 object-cover rounded-full mx-auto border-8 border-white shadow-2xl ring-4 ring-orange-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Nome e Espécie */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 break-words">
                <span className="block sm:inline">{animal.nome}</span>
                <span className="text-orange-600 mx-1 sm:mx-3 hidden sm:inline">-</span>
                <span className="block sm:inline text-orange-700">{animal.especie}</span>
              </h1>
              <div className="flex items-center justify-center text-orange-600">
                <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-lg font-medium">Informações Básicas</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {/* Estado e Localização em Grande Destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Estado do Animal */}
              <div className="relative overflow-hidden rounded-xl p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">Estado Atual</h3>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      animal.estado?.toLowerCase() === 'disponivel' ? 'bg-green-400' :
                      animal.estado?.toLowerCase() === 'adotado' ? 'bg-blue-300' :
                      animal.estado?.toLowerCase() === 'tratamento' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${
                    animal.estado?.toLowerCase() === 'disponivel' ? 'text-green-100' :
                    animal.estado?.toLowerCase() === 'adotado' ? 'text-blue-100' :
                    animal.estado?.toLowerCase() === 'tratamento' ? 'text-yellow-100' :
                    'text-gray-100'
                  }`}>
                    {animal.estado?.toUpperCase()}
                  </div>
                  <div className="text-sm opacity-75">
                    {animal.estado?.toLowerCase() === 'disponivel' && 'Pronto para adoção'}
                    {animal.estado?.toLowerCase() === 'adotado' && (
                      <div>
                        <div>Já tem uma família</div>
                        {animal.adotante_nome && (
                          <div className="text-xs mt-1 bg-white bg-opacity-20 rounded px-2 py-1">
                            Adotante: {animal.adotante_nome}
                          </div>
                        )}
                        {animal.data_adocao && (
                          <div className="text-xs mt-1">
                            Adotado em: {new Date(animal.data_adocao).toLocaleDateString('pt-PT')}
                          </div>
                        )}
                      </div>
                    )}
                    {animal.estado?.toLowerCase() === 'tratamento' && 'Em cuidados veterinários'}
                    {animal.estado?.toLowerCase() === 'quarentena' && 'Em período de observação'}
                    {!['disponivel', 'adotado', 'tratamento', 'quarentena'].includes(animal.estado?.toLowerCase()) && 'Estado especial'}
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
              </div>

              {/* Localização Atual */}
              <div className="relative overflow-hidden rounded-xl p-4 sm:p-6 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">Localização Atual</h3>
                    <MapPin className="w-5 h-5 opacity-75" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold mb-1 text-emerald-100 break-words">
                    {localizacaoAtual?.localizacao?.nome || 'Não definida'}
                  </div>
                  <div className="text-sm opacity-75">
                    {localizacaoAtual?.localizacao?.descricao || 'Localização não especificada'}
                  </div>
                  {localizacaoAtual?.endereco_detalhes && (
                    <div className="text-xs opacity-60 mt-1">
                      Endereço: {localizacaoAtual.endereco_detalhes}
                    </div>
                  )}
                  {localizacaoAtual?.data_inicio && (
                    <div className="text-xs opacity-60 mt-1">
                      Desde: {new Date(localizacaoAtual.data_inicio).toLocaleDateString('pt-PT')}
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
              </div>
            </div>

            {/* Informações Secundárias em Destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div>
                <label className="text-orange-700 font-semibold flex items-center">
                  <span className="mr-2">📋</span>
                  Número do Processo
                </label>
                <p className="text-sm sm:text-lg font-bold text-orange-900 mt-1 break-all">{animal.numero_processo || "N/A"}</p>
              </div>
              <div>
                <label className="text-orange-700 font-semibold flex items-center">
                  <span className="mr-2">🏠</span>
                  Grupo
                </label>
                <p className="text-sm sm:text-lg font-bold text-orange-900 mt-1 break-words">{animal.grupos?.nome || "Sem grupo"}</p>
              </div>
            </div>

            {/* Informações Detalhadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {/* Nome do Animal */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-blue-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <PawPrint className="w-4 h-4 mr-2" />
                  Nome
                </label>
                <p className="text-gray-900 text-lg sm:text-xl font-bold mt-1 break-words">{animal.nome}</p>
              </div>

              {/* Espécie */}
              {/* Espécie */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-green-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <span className="mr-2">🐾</span>
                  Espécie
                </label>
                <p className="text-gray-900 text-sm sm:text-lg font-semibold mt-1 break-words">{animal.especie}</p>
              </div>

              {/* Sexo */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-purple-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <span className="mr-2">{animal.sexo === 'Macho' ? '♂️' : animal.sexo === 'Fêmea' ? '♀️' : '⚪'}</span>
                  Sexo
                </label>
                <p className="text-gray-900 text-sm sm:text-lg font-semibold mt-1">{animal.sexo}</p>
              </div>

              {/* Data de Entrada */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-yellow-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Data de Entrada</span>
                  <span className="sm:hidden">Entrada</span>
                </label>
                <p className="text-gray-900 text-sm sm:text-lg font-semibold mt-1">
                  {animal.data_entrada ? new Date(animal.data_entrada).toLocaleDateString('pt-PT') : 'N/A'}
                </p>
              </div>

              {/* Idade Estimada */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-indigo-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Idade Estimada</span>
                  <span className="sm:hidden">Idade</span>
                </label>
                <p className="text-gray-900 text-xs sm:text-lg font-semibold mt-1">
                  {animal.idade_estimada ? `${Math.floor(animal.idade_estimada / 12)} anos e ${animal.idade_estimada % 12} meses` : 'N/A'}
                </p>
              </div>

              {/* Peso */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-red-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <span className="mr-2">⚖️</span>
                  Peso
                </label>
                <p className="text-gray-900 text-sm sm:text-lg font-semibold mt-1">{animal.peso ? `${animal.peso} kg` : 'N/A'}</p>
              </div>

              {/* Cor */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-pink-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <span className="mr-2">🎨</span>
                  Cor
                </label>
                <p className="text-gray-900 text-sm sm:text-lg font-semibold mt-1 break-words">{animal.cor || 'N/A'}</p>
              </div>

              {/* Transponder */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-teal-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <span className="mr-2">📶</span>
                  <span className="hidden sm:inline">Transponder</span>
                  <span className="sm:hidden">Chip</span>
                </label>
                <p className="text-gray-900 text-xs sm:text-lg font-semibold mt-1 break-all">{animal.transponder || 'N/A'}</p>
              </div>

              {/* Voluntário Responsável */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-l-orange-500 shadow-sm">
                <label className="text-gray-600 text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Voluntário Responsável</span>
                  <span className="sm:hidden">Responsável</span>
                </label>
                <p className="text-gray-900 text-sm sm:text-lg font-semibold mt-1 break-words">{animal.voluntario_responsavel_nome || 'Sem responsável'}</p>
              </div>
            </div>
            
            {animal.caracteristicas_fisicas && (
              <div className="mt-4 sm:mt-6">
                <label className="text-orange-700 font-medium text-sm sm:text-base">Características Físicas</label>
                <p className="text-orange-900 mt-1 text-sm sm:text-base break-words">{animal.caracteristicas_fisicas}</p>
              </div>
            )}
            
            {animal.observacoes && (
              <div className="mt-4 sm:mt-6">
                <label className="text-orange-700 font-medium text-sm sm:text-base">Observações</label>
                <p className="text-orange-900 mt-1 text-sm sm:text-base break-words">{animal.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegação para Funcionalidades */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
              <span className="hidden sm:inline">Gestão do Animal</span>
              <span className="sm:hidden">Gestão</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Intervenções */}
              <Link to={`/animal/${id}/intervencoes`}>
                <Card className="border-l-4 border-blue-500 bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-blue-600 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-blue-800 text-sm sm:text-base truncate">Intervenções</h3>
                        <p className="text-xs sm:text-sm text-blue-600 truncate">Histórico médico e consultas</p>
                      </div>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Eventos */}
              <Link to={`/animal/${id}/eventos`}>
                <Card className="border-l-4 border-green-500 bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-green-600 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-green-800 text-sm sm:text-base truncate">Eventos</h3>
                        <p className="text-xs sm:text-sm text-green-600 truncate">Timeline e marcos importantes</p>
                      </div>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Localizações */}
              <Link to={`/animal/${id}/localizacoes`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-purple-600 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-purple-800 text-sm sm:text-base truncate">Localizações</h3>
                        <p className="text-xs sm:text-sm text-purple-600 truncate">Histórico de transferências</p>
                      </div>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Responsabilidades */}
              <Link to={`/animal/${id}/responsabilidades`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-orange-600 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-orange-800 text-sm sm:text-base truncate">Responsabilidades</h3>
                        <p className="text-xs sm:text-sm text-orange-600 truncate">Atribuições e voluntários</p>
                      </div>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Financeiro */}
              <Link to={`/animal/${id}/financeiro`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-emerald-600 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-emerald-800 text-sm sm:text-base truncate">Financeiro</h3>
                        <p className="text-xs sm:text-sm text-emerald-600 truncate">Custos e investimentos</p>
                      </div>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Histórico de Nomes */}
              <Link to={`/animal/${id}/historico-nomes`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-indigo-800 text-sm sm:text-base truncate">Histórico de Nomes</h3>
                        <p className="text-xs sm:text-sm text-indigo-600 truncate">Alterações de nomes do animal</p>
                      </div>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
</Link>
              
              {/* Intervenções das Autoridades */}
              <Link to={`/animal/${id}/intervencoes-autoridades`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="bg-red-600 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-800 text-sm sm:text-base truncate">
                          <span className="hidden sm:inline">Intervenções das Autoridades</span>
                          <span className="sm:hidden">Autoridades</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-red-600 truncate">
                          <span className="hidden sm:inline">Denúncias, resgates e processos legais</span>
                          <span className="sm:hidden">Denúncias e resgates</span>
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
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