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

import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  PawPrint,
  Loader2,
  AlertCircle,
  Calendar,
  Star,
  Clock,
  User,
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
  Battery,
  Navigation,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, EventoAnimal, TipoEvento, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const AnimalEventos = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para eventos
  const [eventos, setEventos] = useState<EventoAnimal[]>([]);
  const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Função para formatar data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para obter informações do tipo de evento
  const getTipoEventoInfo = (tipoEventoId: string) => {
    const tipoEvento = tiposEventos.find(t => t.id === tipoEventoId);
    return {
      nome: tipoEvento?.nome || 'Evento',
      emoji: tipoEvento?.emoji || '📅'
    };
  };

  // Função para obter nome do voluntário
  const getVoluntarioNome = (voluntarioId: string) => {
    const voluntario = voluntarios.find(v => v.id === voluntarioId);
    return voluntario?.nome || 'Não atribuído';
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

        // Carregar eventos do animal
        const { data: eventosData, error: eventosError } = await supabase
          .from('eventos_animal')
          .select('*')
          .eq('animal_id', id)
          .order('data_evento', { ascending: false });

        if (eventosError) throw eventosError;
        setEventos(eventosData || []);

        // Carregar tipos de eventos
        const { data: tiposEventosData, error: tiposEventosError } = await supabase
          .from('tipos_eventos')
          .select('*')
          .order('nome');

        if (tiposEventosError) throw tiposEventosError;
        setTiposEventos(tiposEventosData || []);

        // Carregar voluntários - com fallback para evitar quebrar a aplicação
        try {
          const { data: voluntariosData, error: voluntariosError } = await supabase
            .from('voluntarios')
            .select('id, nome, email, telefone, especialidade, ativo')
            .eq('ativo', true)
            .order('nome');

          if (voluntariosError) {
            console.warn('Aviso: Não foi possível carregar voluntários:', voluntariosError);
            setVoluntarios([]);
          } else {
            setVoluntarios(voluntariosData || []);
          }
        } catch (voluntariosError) {
          console.warn('Aviso: Erro ao carregar voluntários:', voluntariosError);
          setVoluntarios([]);
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados dos eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Função para eliminar evento
  // Função para eliminar evento
  const handleEliminarEvento = async (eventoId: string) => {
    if (!hasPermission('admin')) {
      toast({
        title: "Sem permissão",
        description: "Apenas administradores podem eliminar eventos",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Tem certeza que deseja eliminar este evento? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setDeletingId(eventoId);

      const { error } = await supabase
        .from('eventos_animal')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;

      setEventos(prev => prev.filter(e => e.id !== eventoId));

      toast({
        title: "Evento eliminado",
        description: "O evento foi eliminado com sucesso",
      });

    } catch (error: any) {
      console.error('Erro ao eliminar evento:', error);
      toast({
        title: "Erro ao eliminar",
        description: error.message || "Erro inesperado ao eliminar evento",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto mb-4 animate-reverse"></div>
          </div>
          <p className="text-cyan-400 text-lg font-medium">Carregando eventos...</p>
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
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Sistema de Eventos
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to={`/animal/${id}/novo-evento`}>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-9 shadow-lg shadow-green-500/25">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
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
                  {animal?.nome} - Eventos
                </h1>
                <p className="text-xl text-purple-300 font-medium">
                  {animal?.especie} • Timeline de Marcos Importantes
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
                    <span className="text-purple-400 text-sm">Sincronizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de Eventos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6 flex items-center">
            <Layers className="h-6 w-6 mr-3 text-orange-400" />
            Timeline de Eventos ({eventos.length})
          </h2>
          
          {eventos.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-gray-500/30 p-8 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-400 mb-2">Nenhum evento registrado</p>
              <p className="text-gray-500">Este animal ainda não possui eventos registrados.</p>
              <Link to={`/animal/${id}/novo-evento`}>
                <Button className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Evento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {eventos.map((evento, index) => (
                <div key={evento.id} className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-lg rounded-2xl border border-gray-500/30 p-6 shadow-xl">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        evento.importante 
                          ? 'bg-yellow-500/20 border-yellow-400/30' 
                          : 'bg-blue-500/20 border-blue-400/30'
                      }`}>
                        {evento.importante ? (
                          <Star className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <Calendar className="h-6 w-6 text-blue-400" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                        {eventos.length - index}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-300">
                            {getTipoEventoInfo(evento.tipo_evento_id).emoji} {getTipoEventoInfo(evento.tipo_evento_id).nome}
                          </h3>
                          {evento.importante && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              <Star className="h-3 w-3 mr-1" />
                              IMPORTANTE
                            </Badge>
                          )}
                        </div>
                        
                        {/* Botões de Ação */}
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => openEventoDialog(evento)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 h-8 px-3"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {hasPermission('admin') && (
                            <Button
                              onClick={() => handleEliminarEvento(evento.id)}
                              disabled={deletingId === evento.id}
                              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-500/25 h-8 px-3"
                            >
                              {deletingId === evento.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {formatarData(evento.data_evento)}
                          </span>
                        </div>
                        
                        {evento.responsavel_id && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">
                              {getVoluntarioNome(evento.responsavel_id)}
                            </span>
                          </div>
                        )}
                      </div>

                      {evento.descricao && (
                        <div className="mb-3 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="h-3 w-3 text-blue-400" />
                            <span className="text-xs font-medium text-blue-400">Descrição</span>
                          </div>
                          <p className="text-sm text-blue-300">{evento.descricao}</p>
                        </div>
                      )}

                      {evento.observacoes && (
                        <div className="p-3 bg-slate-800/30 rounded-lg border border-gray-500/20">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-400">Observações</span>
                          </div>
                          <p className="text-sm text-gray-300">{evento.observacoes}</p>
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
                  <h3 className="text-lg font-semibold text-cyan-300">Timeline Ativa</h3>
                  <p className="text-cyan-400/70 text-sm">Cronologia em tempo real</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Signal className="h-4 w-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm">Sincronizado</span>
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
                  <h3 className="text-lg font-semibold text-green-300">Eventos</h3>
                  <p className="text-green-400/70 text-sm">Marcos registrados</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 text-sm">{eventos.length} Registros</span>
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
                  <h3 className="text-lg font-semibold text-purple-300">Importantes</h3>
                  <p className="text-purple-400/70 text-sm">Eventos destacados</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-300 text-sm">{eventos.filter(e => e.importante).length} Marcados</span>
                </div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <EnhancedFooter />
      <EnhancedFooter />
    </div>
  );
};

export default AnimalEventos;