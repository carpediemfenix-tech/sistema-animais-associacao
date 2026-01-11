import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Navigation,
  Calendar,
  FileText,
  Sparkles,
  Zap,
  Globe,
  Signal,
  Activity,
  Eye,
  Layers,
  Cpu,
  Wifi,
  Battery
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, LocalizacaoAnimal, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const AnimalLocalizacoes = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<LocalizacaoAnimal | null>(null);
  const [historicoLocalizacoes, setHistoricoLocalizacoes] = useState<LocalizacaoAnimal[]>([]);
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

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
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 dia";
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return meses === 1 ? "1 mês" : `${meses} meses`;
    }
    const anos = Math.floor(diffDays / 365);
    return anos === 1 ? "1 ano" : `${anos} anos`;
  };

  // Função para eliminar localização histórica
  const handleEliminarLocalizacao = async (localizacaoId: string) => {
    if (!hasPermission('admin')) {
      toast({
        title: "Sem permissão",
        description: "Apenas administradores podem eliminar registros de localização",
        variant: "destructive",
      });
      return;
    }

    // Confirmação antes de eliminar
    if (!window.confirm("Tem certeza que deseja eliminar este registro de localização? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setDeletingId(localizacaoId);

      console.log('DEBUG - Eliminando localização:', localizacaoId);

      // Eliminar da base de dados
      const { error: deleteError } = await supabase
        .from('localizacoes_animal')
        .delete()
        .eq('id', localizacaoId);

      if (deleteError) {
        console.error('Erro ao eliminar localização:', deleteError);
        throw deleteError;
      }

      // Atualizar lista local
      setHistoricoLocalizacoes(prev => prev.filter(loc => loc.id !== localizacaoId));

      toast({
        title: "Localização eliminada",
        description: "O registro de localização foi eliminado com sucesso",
      });

    } catch (error: any) {
      console.error('Erro ao eliminar localização:', error);
      toast({
        title: "Erro ao eliminar",
        description: error.message || "Erro inesperado ao eliminar localização",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID do animal não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Carregar dados do animal
        const { data: animalData, error: animalError } = await supabase
          .from('animais')
          .select('*')
          .eq('id', id)
          .single();

        if (animalError) throw animalError;
        setAnimal(animalData);

        // Carregar localizações do animal
        const { data: localizacoesData, error: localizacoesError } = await supabase
          .from('localizacoes_animal')
          .select(`
            *,
            voluntarios(nome)
          `)
          .eq('animal_id', id)
          .order('data_inicio', { ascending: false });

        if (localizacoesError) throw localizacoesError;

        console.log('DEBUG - Localizações carregadas:', localizacoesData);
        console.log('DEBUG - Erro ao carregar:', localizacoesError);

        // Separar localização atual do histórico
        const atual = localizacoesData?.find(loc => loc.ativo) || null;
        const historico = localizacoesData?.filter(loc => !loc.ativo) || [];

        setLocalizacaoAtual(atual);
        setHistoricoLocalizacoes(historico);

        // Carregar tipos de localizações
        const { data: tiposLocalizacoesData } = await supabase
          .from('localizacoes')
          .select('*')
          .order('nome');

        console.log('DEBUG - Localizações carregadas:', tiposLocalizacoesData);
        console.log('DEBUG - Primeira localização estrutura:', tiposLocalizacoesData?.[0]);
        console.log('DEBUG - IDs das localizações:', tiposLocalizacoesData?.map(t => ({ id: t.id, nome: t.nome })));
        setTiposLocalizacoes(tiposLocalizacoesData || []);

        // Carregar voluntários
        const { data: voluntariosData } = await supabase
          .from('voluntarios')
          .select('id, nome, email, telefone, especialidade, ativo')
          .eq('ativo', true)
          .order('nome'); // Usar apenas campos que existem

        setVoluntarios(voluntariosData || []);

      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados das localizações');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto mb-4 animate-reverse"></div>
          </div>
          <p className="text-cyan-400 text-lg font-medium">Carregando localizações...</p>
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
          <Link to={`/animal/${id}`}>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Animal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
              <Link to={`/animal/${id}`}>
                <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {animal?.nome}
                </Button>
              </Link>
              <div className="h-6 w-px bg-cyan-500/30"></div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Sistema de Localização
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to={`/animal/${id}/nova-localizacao`}>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-9 shadow-lg shadow-green-500/25">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Localização
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-1 border border-cyan-500/30">
                <Signal className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section - Animal Info */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-3xl border border-cyan-500/30 p-8 shadow-2xl shadow-purple-500/20">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center border-4 border-cyan-400/50 shadow-2xl shadow-purple-500/30">
                  <PawPrint className="h-10 w-10 text-white/80" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {animal?.nome} - Localizações
                </h1>
                <p className="text-xl text-purple-300 font-medium">
                  {animal?.especie} • Histórico de Localizações Oficiais
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-400 text-sm">Conectado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Battery className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">100%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-purple-400" />
                    <span className="text-purple-400 text-sm">Localizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Localização Atual */}
        {localizacaoAtual && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6 flex items-center">
              <Activity className="h-6 w-6 mr-3 text-green-400" />
              Localização Atual
            </h2>
            
            <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 backdrop-blur-lg rounded-2xl border border-emerald-500/30 p-8 shadow-2xl shadow-emerald-500/20">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-400/30">
                    <MapPin className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-2xl font-bold text-emerald-300">
                      {getTipoLocalizacaoInfo(localizacaoAtual.localizacao).nome}
                    </h3>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-3 py-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                      ATIVO
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-emerald-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-emerald-300">Data de Início</span>
                      </div>
                      <div className="text-lg font-bold text-emerald-200">
                        {new Date(localizacaoAtual.data_inicio).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-cyan-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-cyan-300">Duração</span>
                      </div>
                      <div className="text-lg font-bold text-cyan-200">
                        {getDuracao(localizacaoAtual.data_inicio)}
                      </div>
                    </div>
                    
                    {localizacaoAtual.voluntarios?.nome && (
                      <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-purple-300">Responsável</span>
                        </div>
                        <div className="text-lg font-bold text-purple-200">
                          {localizacaoAtual.voluntarios?.nome || 'Não atribuído'}
                        </div>
                      </div>
                    )}
                  </div>

                  {localizacaoAtual.endereco_detalhes && (
                    <div className="mb-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-400/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Navigation className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">Endereço</span>
                      </div>
                      <p className="text-emerald-200">{localizacaoAtual.endereco_detalhes}</p>
                    </div>
                  )}

                  {localizacaoAtual.observacoes && (
                    <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-gray-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Observações</span>
                      </div>
                      <p className="text-gray-200">{localizacaoAtual.observacoes}</p>
                    </div>
                  )}

                  {/* Botão de Editar Localização Atual */}
                  <div className="pt-4 border-t border-emerald-500/30">
                    <Link to={`/animal/${id}/localizacao/${localizacaoAtual.id}/editar`}>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Localização Atual
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Localizações */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6 flex items-center">
            <Layers className="h-6 w-6 mr-3 text-orange-400" />
            Histórico de Localizações ({historicoLocalizacoes.length})
          </h2>
          
          {historicoLocalizacoes.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-gray-500/30 p-8 text-center">
              <Home className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-400 mb-2">Nenhum histórico disponível</p>
              <p className="text-gray-500">Este animal ainda não possui localizações anteriores registradas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {historicoLocalizacoes.map((localizacao, index) => (
                <div key={localizacao.id} className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-lg rounded-2xl border border-gray-500/30 p-6 shadow-xl">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center border border-gray-400/30">
                        <MapPin className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                        {historicoLocalizacoes.length - index}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-300">
                            {getTipoLocalizacaoInfo(localizacao.localizacao).nome}
                          </h3>
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                            HISTÓRICO
                          </Badge>
                        </div>
                        
                        {/* Botão de Eliminar */}
                        {hasPermission('admin') && (
                          <Button
                            onClick={() => handleEliminarLocalizacao(localizacao.id)}
                            disabled={deletingId === localizacao.id}
                            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-500/25 h-8 px-3"
                          >
                            {deletingId === localizacao.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {new Date(localizacao.data_inicio).toLocaleDateString('pt-PT')} - 
                            {localizacao.data_fim ? new Date(localizacao.data_fim).toLocaleDateString('pt-PT') : 'Atual'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {getDuracao(localizacao.data_inicio, localizacao.data_fim)}
                          </span>
                        </div>
                        
                        {localizacao.voluntarios?.nome && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">
                              {localizacao.voluntarios?.nome || 'Não atribuído'}
                            </span>
                          </div>
                        )}
                      </div>

                      {localizacao.endereco_detalhes && (
                        <div className="mt-3 p-3 bg-gray-500/10 rounded-lg border border-gray-400/20">
                          <div className="flex items-center space-x-2 mb-1">
                            <Navigation className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-400">Endereço</span>
                          </div>
                          <p className="text-sm text-gray-300">{localizacao.endereco_detalhes}</p>
                        </div>
                      )}

                      {localizacao.observacoes && (
                        <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-gray-500/20">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-400">Observações</span>
                          </div>
                          <p className="text-sm text-gray-300">{localizacao.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sistema de Monitoramento */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6 flex items-center">
            <Cpu className="h-6 w-6 mr-3 text-cyan-400" />
            Sistema de Monitoramento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-400/30">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300">GPS Ativo</h3>
                  <p className="text-cyan-400/70 text-sm">Rastreamento em tempo real</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Signal className="h-4 w-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm">Sinal Forte</span>
                </div>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-green-500/20 p-3 rounded-xl border border-green-400/30">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300">Histórico</h3>
                  <p className="text-green-400/70 text-sm">Registros completos</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 text-sm">{historicoLocalizacoes.length + (localizacaoAtual ? 1 : 0)} Registros</span>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-400/30">
                  <Eye className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-300">Monitoramento</h3>
                  <p className="text-purple-400/70 text-sm">Supervisão 24/7</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-300 text-sm">Ativo</span>
                </div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimalLocalizacoes;