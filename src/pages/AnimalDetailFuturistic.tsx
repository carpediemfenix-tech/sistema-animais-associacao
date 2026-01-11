import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  History,
  Activity,
  Heart,
  Star,
  Zap,
  Eye,
  Settings,
  BarChart3,
  FileText,
  Camera,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Layers,
  Cpu,
  Wifi,
  Battery,
  Signal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { convertGoogleDriveUrl } from "@/lib/utils";
import PageActionBar from "@/components/PageActionBar";
import { IntakeAssessmentDisplay } from "@/components/IntakeAssessmentDisplayFuturistic"; // Componente de ficha de admissão futurístico

const AnimalDetailFuturistic = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<any>(null);
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useClassicView, setUseClassicView] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  // Função para calcular idade a partir da data de nascimento
  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return null;
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  // Função para obter informações do tipo de localização
  const getTipoLocalizacaoInfo = (localizacaoId: string) => {
    const localizacaoInfo = tiposLocalizacoes.find(t => t.id === localizacaoId);
    return {
      emoji: '📍',
      nome: localizacaoInfo?.nome || 'Localização'
    };
  };

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
          .maybeSingle(); // ✅ Corrigido: usar maybeSingle() para evitar erro 406
        
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
      
      // Carregar tipos de localizações
      const { data: tiposLocalizacoesData, error: tiposError } = await supabase
        .from('localizacoes')
        .select('*')
        .order('nome');
      
      if (tiposLocalizacoesData && !tiposError) {
        setTiposLocalizacoes(tiposLocalizacoesData);
      }
      
      // Carregar localização atual
      const { data: localizacaoData, error: localizacaoError } = await supabase
        .from('localizacoes_animal')
        .select('*')
        .eq('animal_id', id)
        .eq('ativo', true)
        .maybeSingle(); // ✅ Corrigido: usar maybeSingle() para evitar erro 406
      
      if (localizacaoData && !localizacaoError) {
        // A localização já vem como texto na tabela localizacoes_animal
        setLocalizacaoAtual(localizacaoData);
      } else if (localizacaoError) {
        console.warn('Erro ao carregar localização:', localizacaoError);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  const handleArquivar = async () => {
    if (!animal) return;
    
    try {
      const { error } = await supabase
        .from('animais')
        .update({ arquivado: true })
        .eq('id', animal.id);

      if (error) throw error;

      toast({
        title: "Animal arquivado",
        description: "O animal foi arquivado com sucesso",
      });

      navigate('/animais');
    } catch (error: any) {
      toast({
        title: "Erro ao arquivar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Função para alternar entre visualizações
  const toggleView = () => {
    setUseClassicView(!useClassicView);
    toast({
      title: useClassicView ? "Modo Futurista Ativado" : "Modo Clássico Ativado",
      description: useClassicView ? "Interface moderna e sofisticada" : "Interface clássica e familiar",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto mb-4 animate-reverse"></div>
          </div>
          <p className="text-cyan-400 text-lg font-medium">Carregando dados do animal...</p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-red-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-red-500/30">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg text-red-400 mb-4">{error}</p>
          <Link to="/animais">
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/30">
          <PawPrint className="h-16 w-16 mx-auto mb-4 text-purple-400" />
          <p className="text-lg text-purple-400 mb-4">Animal não encontrado</p>
          <Link to="/animais">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Animais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Se modo clássico estiver ativado, renderizar a versão original
  if (useClassicView) {
    // Importar e renderizar o componente original aqui
    // Por agora, vamos mostrar uma mensagem
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
              <Button 
                onClick={toggleView}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-9"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Modo Futurista
              </Button>
              
              <Badge className={`text-sm px-3 py-1 ${
                animal.estado === 'Ativo' ? 'bg-green-600' :
                animal.estado === 'Adotado' ? 'bg-blue-600' :
                animal.estado === 'Óbito' ? 'bg-gray-600' :
                'bg-yellow-600'
              }`}>
                {animal.estado}
              </Badge>
              
              <Link to={`/animal/${id}/bi`}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-9">
                  <Shield className="h-4 w-4 mr-2" />
                  B.I.
                </Button>
              </Link>
              
              {hasPermission('admin') && (
                <>
                  <Link to={`/editar-animal-completo/${id}`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-9">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Completo
                    </Button>
                  </Link>
                  <Link to={`/animal/${id}/editar`}>
                    <Button variant="outline" className="h-9">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Rápido
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
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modo Clássico Ativo</h2>
            <p className="text-gray-600 mb-6">
              Você está visualizando a interface clássica. Para ver a versão futurista, clique no botão "Modo Futurista" acima.
            </p>
            <div className="text-left bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">{animal.nome} - {animal.especie}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Número de Processo:</strong> {animal.numero_processo}</p>
                  <p><strong>Estado:</strong> {animal.estado}</p>
                  <p><strong>Sexo:</strong> {animal.sexo}</p>
                  <p><strong>Raça:</strong> {animal.raca}</p>
                </div>
                <div>
                  <p><strong>Data de Entrada:</strong> {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}</p>
                  <p><strong>Idade:</strong> {animal.idade}</p>
                  <p><strong>Peso:</strong> {animal.peso}kg</p>
                  <p><strong>Cor:</strong> {animal.cor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <EnhancedFooter />
      </div>
    );
  }

  // Versão Futurística
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <EnhancedHeader />
      
      {/* Futuristic Navigation Bar */}
      <div className="relative z-10 bg-slate-800/30 backdrop-blur-lg border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/animais">
                <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Animais
                </Button>
              </Link>
              <div className="h-6 w-px bg-cyan-500/30"></div>
              <div className="flex items-center space-x-2">
                <PawPrint className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {animal.nome}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to={`/animal/${id}/classic`}>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-9">
                  <Eye className="h-4 w-4 mr-2" />
                  Modo Clássico
                </Button>
              </Link>
              
              <Badge className={`px-3 py-1 text-sm font-medium border ${
                animal.estado === 'Ativo' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                animal.estado === 'Adotado' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                animal.estado === 'Óbito' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  animal.estado === 'Ativo' ? 'bg-green-400' :
                  animal.estado === 'Adotado' ? 'bg-blue-400' :
                  animal.estado === 'Óbito' ? 'bg-gray-400' :
                  'bg-yellow-400'
                } animate-pulse`}></div>
                {animal.estado}
              </Badge>
              
              <Link to={`/animal/${id}/bi`}>
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-9 shadow-lg shadow-cyan-500/25">
                  <Shield className="h-4 w-4 mr-2" />
                  B.I.
                </Button>
              </Link>
              
              {hasPermission('admin') && (
                <>
                  <Link to={`/editar-animal-completo/${id}`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-9 shadow-lg shadow-purple-500/25">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Completo
                    </Button>
                  </Link>
                  <Link to={`/animal/${id}/editar`}>
                    <Button variant="outline" className="h-9 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar Rápido
                    </Button>
                  </Link>
                  <Link to={`/animal/${id}/historico-nomes`}>
                    <Button variant="outline" className="h-9 border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section - Animal Profile */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-3xl border border-cyan-500/30 p-8 shadow-2xl shadow-purple-500/20">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              
              {/* Animal Photo */}
              <div className="relative">
                {animal.url_fotografia ? (
                  <div className="relative">
                    <img 
                      src={convertGoogleDriveUrl(animal.url_fotografia)} 
                      alt={`Foto de ${animal.nome}`}
                      className="w-48 h-48 lg:w-64 lg:h-64 object-cover rounded-full border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/30"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center border-4 border-cyan-400/50 shadow-2xl shadow-purple-500/30">
                    <PawPrint className="h-24 w-24 text-white/80" />
                  </div>
                )}
                
                {/* Status Indicators */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 border border-cyan-500/30">
                    <div className="flex items-center space-x-1">
                      <Wifi className="h-3 w-3 text-cyan-400" />
                      <span className="text-xs text-cyan-400">Online</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 border border-green-500/30">
                    <div className="flex items-center space-x-1">
                      <Battery className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400">100%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Animal Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-6">
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {animal.nome}
                  </h1>
                  <p className="text-xl lg:text-2xl text-purple-300 font-medium">
                    {animal.especie} • {animal.raca}
                  </p>
                  <p className="text-cyan-400 mt-2">
                    Processo #{animal.numero_processo}
                  </p>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-400">
                      {calcularIdade(animal.data_nascimento) || 
                       (animal.idade_estimada ? Math.floor(animal.idade_estimada / 12) : 'N/A')}
                    </div>
                    <div className="text-sm text-purple-300">Anos</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/30">
                    <div className="text-2xl font-bold text-cyan-400">{animal.peso}</div>
                    <div className="text-sm text-cyan-300">Kg</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-pink-500/30">
                    <div className="text-2xl font-bold text-pink-400">{animal.sexo}</div>
                    <div className="text-sm text-pink-300">Sexo</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">{animal.cor}</div>
                    <div className="text-sm text-green-300">Cor</div>
                  </div>
                </div>

                {/* Condição Reprodutiva */}
                {animal.condicao && (
                  <div className="mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-500/30 inline-block">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {animal.condicao === 'Inteiro' ? '🐾' : 
                           animal.condicao === 'Desconhecido' ? '❓' : '✂️'}
                        </span>
                        <div>
                          <div className="text-lg font-bold text-orange-400">{animal.condicao}</div>
                          <div className="text-sm text-orange-300">Condição Reprodutiva</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estado Atual e Localização Atual - Seções Destacadas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Estado Atual */}
                  <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 backdrop-blur-lg border border-blue-500/30 shadow-2xl shadow-blue-500/20">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-blue-300 flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          Estado Atual
                        </h3>
                        <div className={`w-4 h-4 rounded-full animate-pulse ${
                          animal.estado?.toLowerCase() === 'ativo' ? 'bg-green-400' :
                          animal.estado?.toLowerCase() === 'adotado' ? 'bg-blue-400' :
                          animal.estado?.toLowerCase() === 'tratamento' ? 'bg-yellow-400' :
                          animal.estado?.toLowerCase() === 'óbito' ? 'bg-red-400' :
                          'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className={`text-3xl font-bold mb-2 ${
                        animal.estado?.toLowerCase() === 'ativo' ? 'text-green-300' :
                        animal.estado?.toLowerCase() === 'adotado' ? 'text-blue-300' :
                        animal.estado?.toLowerCase() === 'tratamento' ? 'text-yellow-300' :
                        animal.estado?.toLowerCase() === 'óbito' ? 'text-red-300' :
                        'text-gray-300'
                      }`}>
                        {animal.estado?.toUpperCase()}
                      </div>
                      <div className="text-sm text-blue-200 opacity-90">
                        {animal.estado?.toLowerCase() === 'ativo' && 'Animal disponível e saudável'}
                        {animal.estado?.toLowerCase() === 'adotado' && (
                          <div className="space-y-1">
                            <div>Já tem uma família amorosa</div>
                            {animal.adotante_nome && (
                              <div className="text-xs bg-blue-500/20 rounded-lg px-3 py-1 border border-blue-400/30">
                                Adotante: {animal.adotante_nome}
                              </div>
                            )}
                            {animal.data_adocao && (
                              <div className="text-xs opacity-75">
                                Adotado em: {new Date(animal.data_adocao).toLocaleDateString('pt-PT')}
                              </div>
                            )}
                          </div>
                        )}
                        {animal.estado?.toLowerCase() === 'tratamento' && 'Em cuidados veterinários especializados'}
                        {animal.estado?.toLowerCase() === 'quarentena' && 'Em período de observação médica'}
                        {animal.estado?.toLowerCase() === 'óbito' && 'Falecido - descanse em paz'}
                        {!['ativo', 'adotado', 'tratamento', 'quarentena', 'óbito'].includes(animal.estado?.toLowerCase()) && 'Estado especial monitorado'}
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-indigo-400/10 rounded-full blur-lg"></div>
                  </div>

                  {/* Localização Atual */}
                  <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-600/30 to-green-600/30 backdrop-blur-lg border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-emerald-300 flex items-center">
                          <MapPin className="h-5 w-5 mr-2" />
                          Localização Atual
                        </h3>
                        <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-2xl font-bold mb-2 text-emerald-200 break-words">
                        {localizacaoAtual?.localizacao ? 
                          getTipoLocalizacaoInfo(localizacaoAtual.localizacao).nome : 
                          'Localização não definida'
                        }
                      </div>
                      <div className="text-sm text-emerald-200 opacity-90 mb-2">
                        {localizacaoAtual?.localizacao ? 
                          `Tipo: ${getTipoLocalizacaoInfo(localizacaoAtual.localizacao).nome}` : 
                          'Aguardando atualização de localização'
                        }
                      </div>
                      {localizacaoAtual?.endereco_detalhes && (
                        <div className="text-xs bg-emerald-500/20 rounded-lg px-3 py-1 border border-emerald-400/30 mb-2">
                          📍 Endereço: {localizacaoAtual.endereco_detalhes}
                        </div>
                      )}
                      {localizacaoAtual?.data_inicio && (
                        <div className="text-xs text-emerald-300 opacity-75">
                          📅 Desde: {new Date(localizacaoAtual.data_inicio).toLocaleDateString('pt-PT')}
                        </div>
                      )}

                    </div>
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-green-400/10 rounded-full blur-lg"></div>
                  </div>
                </div>
                
                {/* Informações Técnicas Detalhadas */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-cyan-400" />
                    Informações Técnicas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Número do Processo */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-orange-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-orange-300">Processo</span>
                      </div>
                      <div className="text-lg font-bold text-orange-200 break-all">
                        {animal.numero_processo || 'N/A'}
                      </div>
                    </div>

                    {/* Transponder */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-cyan-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Cpu className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-cyan-300">Transponder</span>
                      </div>
                      <div className="text-lg font-bold text-cyan-200 break-all">
                        {animal.transponder || 'Não implantado'}
                      </div>
                    </div>

                    {/* Raça */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <PawPrint className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-purple-300">Raça</span>
                      </div>
                      <div className="text-lg font-bold text-purple-200 break-words">
                        {animal.raca || 'Não especificada'}
                      </div>
                    </div>

                    {/* Idade Estimada */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-pink-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-pink-400" />
                        <span className="text-sm text-pink-300">Idade Estimada</span>
                      </div>
                      <div className="text-lg font-bold text-pink-200">
                        {animal.idade_estimada ? 
                          `${Math.floor(animal.idade_estimada / 12)} anos e ${animal.idade_estimada % 12} meses` : 
                          'Não estimada'
                        }
                      </div>
                    </div>

                    {/* Data de Entrada */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-green-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-300">Data Entrada</span>
                      </div>
                      <div className="text-lg font-bold text-green-200">
                        {animal.data_entrada ? 
                          new Date(animal.data_entrada).toLocaleDateString('pt-PT') : 
                          'N/A'
                        }
                      </div>
                    </div>

                    {/* Porte */}
                    {animal.porte && (
                      <div className="bg-slate-800/30 rounded-xl p-4 border border-yellow-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-yellow-300">Porte</span>
                        </div>
                        <div className="text-lg font-bold text-yellow-200">
                          {animal.porte}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-300">
                      Entrada: {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  
                  {animal.grupos && (
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-300">
                        Grupo: {animal.grupos.nome}
                      </span>
                    </div>
                  )}
                  
                  {animal.voluntario_responsavel_nome && (
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <User className="h-4 w-4 text-pink-400" />
                      <span className="text-pink-300">
                        Responsável: {animal.voluntario_responsavel_nome}
                      </span>
                    </div>
                  )}
                  
                  {localizacaoAtual && (
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <MapPin className="h-4 w-4 text-green-400" />
                      <span className="text-green-300">
                        Local: {localizacaoAtual.localizacao ? 
                          getTipoLocalizacaoInfo(localizacaoAtual.localizacao).nome : 
                          'Não especificado'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Observations */}
            {animal.observacoes && (
              <div className="mt-8 p-6 bg-slate-800/30 rounded-2xl border border-yellow-500/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Observações
                </h3>
                <p className="text-yellow-200 leading-relaxed">{animal.observacoes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Management Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center">
            <Cpu className="h-6 w-6 mr-3 text-cyan-400" />
            Módulos de Gestão
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Intervenções */}
            <Link to={`/animal/${id}/intervencoes`}>
              <div className="group bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-400/30">
                    <Stethoscope className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300">Intervenções</h3>
                    <p className="text-blue-400/70 text-sm">Histórico médico</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Signal className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">Sistema Ativo</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Eventos */}
            <Link to={`/animal/${id}/eventos`}>
              <div className="group bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6 hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-green-500/20 p-3 rounded-xl border border-green-400/30">
                    <Calendar className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-300">Eventos</h3>
                    <p className="text-green-400/70 text-sm">Timeline de marcos</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 text-sm">Sincronizado</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-green-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Localizações */}
            <Link to={`/animal/${id}/localizacoes`}>
              <div className="group bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-400/30">
                    <MapPin className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300">Localizações</h3>
                    <p className="text-purple-400/70 text-sm">Rastreamento GPS</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">Localizado</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Estados */}
            <Link to={`/animal/${id}/estados`}>
              <div className="group bg-gradient-to-br from-teal-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl border border-teal-500/30 p-6 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/25">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-teal-500/20 p-3 rounded-xl border border-teal-400/30">
                    <Activity className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-teal-300">Estados</h3>
                    <p className="text-teal-400/70 text-sm">Histórico de status</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-teal-400" />
                    <span className="text-teal-300 text-sm">Monitorado</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Responsabilidades */}
            <Link to={`/animal/${id}/responsabilidades`}>
              <div className="group bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-400/30">
                    <Users className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-300">Responsabilidades</h3>
                    <p className="text-orange-400/70 text-sm">Gestão de cuidadores</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-300 text-sm">Atribuído</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            {/* Financeiro */}
            <Link to={`/animal/${id}/financeiro`}>
              <div className="group bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg rounded-2xl border border-yellow-500/30 p-6 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-yellow-500/20 p-3 rounded-xl border border-yellow-400/30">
                    <DollarSign className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300">Financeiro</h3>
                    <p className="text-yellow-400/70 text-sm">Custos e despesas</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm">Calculado</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        {hasPermission('admin') && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-6 flex items-center">
              <Settings className="h-6 w-6 mr-3 text-red-400" />
              Ações Administrativas
            </h2>
            
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleArquivar}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/25"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar Animal
                </Button>
                
                <Link to={`/animal/${id}/intervencoes-autoridades`}>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25">
                    <Shield className="h-4 w-4 mr-2" />
                    Intervenções Autoridades
                  </Button>
                </Link>
                
                <Link to={`/animal/${id}/historico-nomes`}>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
                    <Edit className="h-4 w-4 mr-2" />
                    Histórico de Nomes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Seção da Ficha de Admissão Futuristica */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-blue-400" />
            Ficha de Admissão
          </h2>
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <IntakeAssessmentDisplay 
              animalId={id!} 
              onEdit={(assessment) => {
                // TODO: Implementar edição da ficha de admissão
                toast({
                  title: "Funcionalidade em desenvolvimento",
                  description: "A edição da ficha de admissão estará disponível em breve.",
                });
              }}
              showEditButton={hasPermission('admin') || hasPermission('tecnico')}
            />
          </div>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimalDetailFuturistic;