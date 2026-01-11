import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Dialog removido - agora usa página dedicada
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  PawPrint,
  Loader2,
  AlertCircle,
  MapPin,
  Home,
  Clock,
  User,
  Navigation
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, LocalizacaoAnimal, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

// Tipos de localizações predefinidos
const TIPOS_LOCALIZACOES = [
  { id: 'canil', nome: '🏠 Canil da Associação', emoji: '🏠' },
  { id: 'clinica', nome: '🏥 Clínica Veterinária', emoji: '🏥' },
  { id: 'acolhimento', nome: '👨‍👩‍👧‍👦 Casa de Acolhimento', emoji: '👨‍👩‍👧‍👦' },
  { id: 'lar_definitivo', nome: '🏡 Lar Definitivo', emoji: '🏡' },
  { id: 'hotel', nome: '🏨 Hotel para Animais', emoji: '🏨' },
  { id: 'reabilitacao', nome: '🚑 Centro de Reabilitação', emoji: '🚑' },
  { id: 'quinta', nome: '🌳 Quinta/Santuário', emoji: '🌳' },
  { id: 'outra_associacao', nome: '🏢 Outra Associação', emoji: '🏢' },
  { id: 'desconhecida', nome: '🔍 Localização Desconhecida', emoji: '🔍' },
  { id: 'especial', nome: '⭐ Localização Especial', emoji: '⭐' }
];

const AnimalLocalizacoes = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para localizações
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoAnimal[]>([]);
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [editingLocalizacao, setEditingLocalizacao] = useState<LocalizacaoAnimal | null>(null);

  // Estados do modal removidos - agora usa página dedicada

  // Debug do estado do formulário removido para evitar loops

  // Função para carregar dados do animal
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
        setError('Erro ao carregar dados do animal');
        return;
      }

      if (!data) {
        setError('Animal não encontrado');
        return;
      }

      setAnimal(data);
      await loadRelatedData();
    } catch (error) {
      setError('Erro inesperado ao carregar animal');
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar dados relacionados
  const loadRelatedData = async () => {
    try {
      // Carregar localizações
      const { data: localizacoesData, error: localizacoesError } = await supabase
        .from('localizacoes_animal')
        .select('*')
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      console.log('DEBUG - Localizações carregadas:', localizacoesData);
      console.log('DEBUG - Erro ao carregar:', localizacoesError);
      
      if (localizacoesError) {
        console.error('Erro ao carregar localizações:', localizacoesError);
      }

      setLocalizacoes(localizacoesData || []);

      // Carregar tipos de localizações
      const { data: tiposLocalizacoesData } = await supabase
        .from('localizacoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      console.log('DEBUG - Localizações carregadas:', tiposLocalizacoesData);
      console.log('DEBUG - Primeira localização estrutura:', tiposLocalizacoesData?.[0]);
      console.log('DEBUG - IDs das localizações:', tiposLocalizacoesData?.map(t => ({ id: t.id, nome: t.nome })));
      setTiposLocalizacoes(tiposLocalizacoesData || []);

      // Carregar voluntários
      const { data: voluntariosData } = await supabase
        .from('voluntarios')
        .select('id, nome, nickname, display_name, email, telefone, especialidade, ativo')
        .eq('ativo', true)
        .order('display_name'); // Ordenar por display_name

      setVoluntarios(voluntariosData || []);

    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  // Funções do modal removidas - agora usa página dedicada

  const handleDeleteLocalizacao = async (localizacaoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta localização?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('localizacoes_animal')
        .delete()
        .eq('id', localizacaoId);

      if (error) {
        toast({
          title: "Erro ao eliminar",
          description: "Não foi possível eliminar a localização",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Localização eliminada",
        description: "Localização eliminada com sucesso",
      });

      await loadRelatedData();

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Função para obter informações do tipo de localização
  const getTipoLocalizacaoInfo = (localizacaoId: string) => {
    const localizacaoInfo = tiposLocalizacoes.find(t => t.id === localizacaoId);
    return {
      emoji: '📍',
      nome: localizacaoInfo?.nome || 'Localização'
    };
  };

  // Função para formatar duração
  const getDuracao = (dataInicio: string, dataFim?: string) => {
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : new Date();
    const diffTime = fim.getTime() - inicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "1 dia";
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} anos`;
  };

  // Obter localização atual
  const localizacaoAtual = localizacoes.find(loc => loc.ativo);
  const historicoLocalizacoes = localizacoes.filter(loc => !loc.ativo);
  
  // Debug logs removidos para evitar loops

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar localizações...</p>
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
      
      <PageActionBar
        breadcrumbs={[
          { label: 'Animais', href: '/animais', icon: <PawPrint className="h-4 w-4" /> },
          { label: animal?.nome || 'Animal', href: `/animal/${id}` },
          { label: 'Localizações', icon: <MapPin className="h-4 w-4" /> }
        ]}
        primaryActions={
          <Link to={`/animal/${id}/nova-localizacao`}>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-9">
              <Plus className="h-4 w-4 mr-2" />
              Nova Localização
            </Button>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Localização Atual */}
        {localizacaoAtual && (
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Navigation className="h-6 w-6 mr-2" />
                Localização Atual
              </CardTitle>
              <CardDescription className="text-blue-600">
                Onde o animal se encontra atualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                  {getTipoLocalizacaoInfo(localizacaoAtual.localizacao).emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {getTipoLocalizacaoInfo(localizacaoAtual.localizacao).nome}
                    </h3>
                    <Badge className="bg-green-100 text-green-800">ATUAL</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Desde: {new Date(localizacaoAtual.data_inicio).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Duração: {getDuracao(localizacaoAtual.data_inicio)}
                    </div>
                  </div>

                  {localizacaoAtual.endereco_detalhes && (
                    <div className="mt-2 p-2 bg-white rounded text-sm">
                      <strong>Endereço:</strong> {localizacaoAtual.endereco_detalhes}
                    </div>
                  )}

                  {localizacaoAtual.observacoes && (
                    <div className="mt-2 p-2 bg-white rounded text-sm">
                      <strong>Observações:</strong> {localizacaoAtual.observacoes}
                    </div>
                  )}

                  {/* Botão de editar removido - funcionalidade pode ser implementada depois */}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Localizações */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Home className="h-6 w-6 mr-2" />
              Histórico de Localizações ({historicoLocalizacoes.length})
            </CardTitle>
            <CardDescription className="text-gray-600">
              Histórico completo de todas as localizações anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historicoLocalizacoes.length > 0 ? (
              <div className="space-y-4">
                {historicoLocalizacoes.map((localizacao) => {
                  const tipoInfo = getTipoLocalizacaoInfo(localizacao.localizacao); // Corrigido: tabela usa 'localizacao'
                  return (
                    <div key={localizacao.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg">
                          {tipoInfo.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{tipoInfo.nome}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span>
                                  {new Date(localizacao.data_inicio).toLocaleDateString('pt-PT')} - 
                                  {localizacao.data_fim ? new Date(localizacao.data_fim).toLocaleDateString('pt-PT') : 'Atual'}
                                </span>
                                <span>({getDuracao(localizacao.data_inicio, localizacao.data_fim)})</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {/* Botão de editar removido - funcionalidade pode ser implementada depois */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLocalizacao(localizacao.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {localizacao.endereco_detalhes && (
                            <div className="mt-2 text-sm text-gray-700">
                              <strong>Endereço:</strong> {localizacao.endereco_detalhes}
                            </div>
                          )}

                          {localizacao.motivo_transferencia && (
                            <div className="mt-2 text-sm text-gray-700">
                              <strong>Motivo:</strong> {localizacao.motivo_transferencia}
                            </div>
                          )}

                          {localizacao.observacoes && (
                            <div className="mt-2 text-sm text-gray-700">
                              <strong>Observações:</strong> {localizacao.observacoes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma localização anterior</p>
                <p className="text-sm">O histórico de localizações aparecerá aqui conforme forem registradas.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Modal removido - agora usa página dedicada */}
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimalLocalizacoes;