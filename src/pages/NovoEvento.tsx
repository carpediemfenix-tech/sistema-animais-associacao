import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VoluntarioSelector from "@/components/VoluntarioSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Save,
  Calendar,
  Star,
  User,
  FileText,
  AlertCircle,
  Loader2,
  PawPrint,
  Sparkles,
  Zap,
  Globe,
  Signal,
  Activity,
  Wifi,
  Battery
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, TipoEvento, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const NovoEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para dados
  const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([]);

  // Formulário de evento
  const [eventoForm, setEventoForm] = useState({
    tipo_evento_id: '',
    data_evento: '',
    descricao: '',
    observacoes: '',
    responsavel_id: '',
    importante: false
  });

  // Carregar dados iniciais
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

        // Carregar tipos de eventos
        const { data: tiposEventosData, error: tiposEventosError } = await supabase
          .from('tipos_eventos')
          .select('*')
          .order('nome');

        if (tiposEventosError) throw tiposEventosError;
        setTiposEventos(tiposEventosData || []);


      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados para criar evento');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Função para salvar evento
  const handleSalvarEvento = async () => {
    try {
      if (!eventoForm.tipo_evento_id || !eventoForm.data_evento) {
        toast({
          title: "Erro de validação",
          description: "Tipo de evento e data são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      setSaving(true);

      const eventoData = {
        animal_id: id,
        tipo_evento_id: eventoForm.tipo_evento_id,
        data_evento: eventoForm.data_evento,
        descricao: eventoForm.descricao || null,
        observacoes: eventoForm.observacoes || null,
        responsavel_id: eventoForm.responsavel_id || null,
        importante: eventoForm.importante
      };

      const { data, error } = await supabase
        .from('eventos_animal')
        .insert([eventoData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso",
      });

      // Redirecionar para a página de eventos
      navigate(`/animal/${id}/eventos`);

    } catch (error: any) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro inesperado ao salvar evento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
          <p className="text-cyan-400 text-lg font-medium">Carregando formulário...</p>
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
          <Link to={`/animal/${id}/eventos`}>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Eventos
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
              <Link to={`/animal/${id}/eventos`}>
                <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Eventos
                </Button>
              </Link>
              <div className="h-6 w-px bg-cyan-500/30"></div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Novo Evento
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-1 border border-cyan-500/30">
                <Signal className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
                  {animal?.nome} - Novo Evento
                </h1>
                <p className="text-xl text-purple-300 font-medium">
                  {animal?.especie} • Registrar Marco Importante
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

        {/* Formulário de Evento */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-lg rounded-2xl border border-gray-500/30 p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-green-400" />
              Detalhes do Evento
            </h2>
            <p className="text-gray-300">Preencha as informações do novo evento para {animal?.nome}</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Evento */}
              <div>
                <Label className="text-cyan-300 font-medium flex items-center mb-2">
                  <Star className="h-4 w-4 mr-2" />
                  Tipo de Evento *
                </Label>
                <Select 
                  value={eventoForm.tipo_evento_id} 
                  onValueChange={(value) => setEventoForm({ ...eventoForm, tipo_evento_id: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-cyan-500/30 text-white h-12">
                    <SelectValue placeholder="Selecionar tipo de evento" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-cyan-500/30">
                    {tiposEventos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id} className="text-white hover:bg-slate-600">
                        {tipo.emoji} {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data do Evento */}
              <div>
                <Label className="text-cyan-300 font-medium flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Data do Evento *
                </Label>
                <Input
                  type="date"
                  value={eventoForm.data_evento}
                  onChange={(e) => setEventoForm({ ...eventoForm, data_evento: e.target.value })}
                  className="bg-slate-700 border-cyan-500/30 text-white h-12"
                />
              </div>
            </div>

            {/* Responsável */}
            <div>
              <VoluntarioSelector
                value={eventoForm.responsavel_id}
                onValueChange={(voluntarioId, voluntario) => {
                  setEventoForm({ ...eventoForm, responsavel_id: voluntarioId });
                }}
                label="Responsável pelo Evento"
                placeholder="Digite para pesquisar responsável..."
              />
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-cyan-300 font-medium flex items-center mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Descrição do Evento
              </Label>
              <Textarea
                value={eventoForm.descricao}
                onChange={(e) => setEventoForm({ ...eventoForm, descricao: e.target.value })}
                placeholder="Descreva detalhadamente o evento..."
                className="bg-slate-700 border-cyan-500/30 text-white min-h-[100px]"
              />
            </div>

            {/* Observações */}
            <div>
              <Label className="text-cyan-300 font-medium flex items-center mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Observações Adicionais
              </Label>
              <Textarea
                value={eventoForm.observacoes}
                onChange={(e) => setEventoForm({ ...eventoForm, observacoes: e.target.value })}
                placeholder="Observações, notas ou comentários adicionais..."
                className="bg-slate-700 border-cyan-500/30 text-white min-h-[100px]"
              />
            </div>

            {/* Evento Importante */}
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="importante"
                  checked={eventoForm.importante}
                  onCheckedChange={(checked) => setEventoForm({ ...eventoForm, importante: !!checked })}
                  className="border-yellow-500/50"
                />
                <Label htmlFor="importante" className="text-yellow-300 font-medium cursor-pointer flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Marcar como evento importante
                </Label>
              </div>
              <p className="text-yellow-200 text-sm mt-2 ml-6">
                Eventos importantes são destacados na timeline e têm prioridade na visualização
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-cyan-500/30">
            <Link to={`/animal/${id}/eventos`}>
              <Button 
                variant="outline" 
                className="border-gray-500 text-gray-300 hover:bg-gray-700 h-12 px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </Link>
            <Button 
              onClick={handleSalvarEvento}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 px-6 shadow-lg shadow-green-500/25"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Evento
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default NovoEvento;