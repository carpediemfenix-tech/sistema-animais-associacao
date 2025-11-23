import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  MapPin, 
  Activity, 
  DollarSign,
  User,
  Stethoscope,
  Heart,
  Home,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  Archive,
  ArchiveRestore,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, Evento, Localizacao, TipoIntervencao, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados dos modais
  const [intervencaoDialogOpen, setIntervencaoDialogOpen] = useState(false);
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [localizacaoDialogOpen, setLocalizacaoDialogOpen] = useState(false);

  // Estados de edição
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [editingLocalizacao, setEditingLocalizacao] = useState<Localizacao | null>(null);

  // Estados dos formulários
  const [intervencaoForm, setIntervencaoForm] = useState({
    tipo_intervencao_id: "",
    data_intervencao: new Date().toISOString().split('T')[0],
    veterinario: "",
    clinica: "",
    custo: "",
    observacoes: "",
    proxima_data: "",
    voluntario_id: ""
  });

  const [eventoForm, setEventoForm] = useState({
    tipo_evento: "",
    data_evento: new Date().toISOString().split('T')[0],
    descricao: "",
    observacoes: ""
  });

  // CORRIGIDO: Estado do formulário de localização
  const [localizacaoForm, setLocalizacaoForm] = useState({
    localizacao: "",
    endereco: "",
    data_entrada: new Date().toISOString().split('T')[0],
    data_saida: "",
    observacoes: "",
    ativo: true
  });

  useEffect(() => {
    if (id) {
      fetchAnimalData();
      fetchTiposIntervencoes();
      fetchVoluntarios();
    }
  }, [id]);

  const fetchAnimalData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🐕 [ANIMAL] Carregando dados do animal ID:', id);

      // Buscar dados do animal
      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (animalError) {
        console.error('❌ [ANIMAL] Erro ao buscar animal:', animalError);
        throw new Error(`Erro ao carregar animal: ${animalError.message}`);
      }

      if (!animalData) {
        throw new Error('Animal não encontrado');
      }

      console.log('✅ [ANIMAL] Animal carregado:', animalData);
      setAnimal(animalData);

      // Buscar intervenções
      console.log('🏥 [INTERVENÇÕES] Buscando intervenções...');
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select('*')
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (intervencoesError) {
        console.error('❌ [INTERVENÇÕES] Erro ao buscar intervenções:', intervencoesError);
      } else {
        console.log('✅ [INTERVENÇÕES] Intervenções carregadas:', intervencoesData?.length || 0);
        setIntervencoes(intervencoesData || []);
      }

      // Buscar eventos
      console.log('📅 [EVENTOS] Buscando eventos...');
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('*')
        .eq('animal_id', id)
        .order('data_evento', { ascending: false });

      if (eventosError) {
        console.error('❌ [EVENTOS] Erro ao buscar eventos:', eventosError);
      } else {
        console.log('✅ [EVENTOS] Eventos carregados:', eventosData?.length || 0);
        setEventos(eventosData || []);
      }

      // CORRIGIDO: Buscar localizações com campo correto
      console.log('📍 [LOCALIZAÇÕES] Buscando localizações...');
      const { data: localizacoesData, error: localizacoesError } = await supabase
        .from('localizacoes')
        .select('*')
        .eq('animal_id', id)
        .order('data_entrada', { ascending: false }); // CORRIGIDO: era data_inicio

      if (localizacoesError) {
        console.error('❌ [LOCALIZAÇÕES] Erro ao buscar localizações:', localizacoesError);
      } else {
        console.log('✅ [LOCALIZAÇÕES] Localizações carregadas:', localizacoesData?.length || 0);
        setLocalizacoes(localizacoesData || []);
      }

    } catch (error: any) {
      console.error('💥 [ANIMAL] Erro geral ao carregar dados:', error);
      setError(error.message);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível carregar os dados do animal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposIntervencoes = async () => {
    try {
      console.log('🏥 [TIPOS] Buscando tipos de intervenções...');
      const { data, error } = await supabase
        .from('tipos_intervencoes')
        .select('*')
        .order('nome');

      if (error) {
        console.error('❌ [TIPOS] Erro ao buscar tipos:', error);
        throw error;
      }

      console.log('✅ [TIPOS] Tipos carregados:', data?.length || 0);
      setTiposIntervencoes(data || []);
    } catch (error: any) {
      console.error('💥 [TIPOS] Erro geral:', error);
    }
  };

  const fetchVoluntarios = async () => {
    try {
      console.log('👥 [VOLUNTÁRIOS] Buscando voluntários...');
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ [VOLUNTÁRIOS] Erro ao buscar voluntários:', error);
        throw error;
      }

      console.log('✅ [VOLUNTÁRIOS] Voluntários carregados:', data?.length || 0);
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('💥 [VOLUNTÁRIOS] Erro geral:', error);
    }
  };

  // CORRIGIDO: Função para submeter localização
  const handleLocalizacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📍 [LOCALIZAÇÃO] Iniciando submissão...');
    console.log('📝 [LOCALIZAÇÃO] Dados do formulário:', localizacaoForm);
    
    if (!localizacaoForm.localizacao || !localizacaoForm.endereco || !localizacaoForm.data_entrada) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Localização, endereço e data de entrada são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSubmit = {
        animal_id: id,
        localizacao: localizacaoForm.localizacao,
        endereco: localizacaoForm.endereco,
        data_entrada: localizacaoForm.data_entrada,
        data_saida: localizacaoForm.data_saida || null,
        observacoes: localizacaoForm.observacoes || null,
        ativo: localizacaoForm.ativo !== undefined ? localizacaoForm.ativo : true
      };

      console.log('📤 [LOCALIZAÇÃO] Dados para submeter:', dataToSubmit);

      if (editingLocalizacao) {
        console.log('✏️ [LOCALIZAÇÃO] Atualizando localização:', editingLocalizacao.id);
        const { error } = await supabase
          .from('localizacoes')
          .update(dataToSubmit)
          .eq('id', editingLocalizacao.id);

        if (error) {
          console.error('❌ [LOCALIZAÇÃO] Erro na atualização:', error);
          throw error;
        }

        console.log('✅ [LOCALIZAÇÃO] Localização atualizada com sucesso');
        toast({
          title: "✅ Localização atualizada",
          description: "A localização foi atualizada com sucesso",
        });
      } else {
        console.log('➕ [LOCALIZAÇÃO] Inserindo nova localização');
        const { data, error } = await supabase
          .from('localizacoes')
          .insert([dataToSubmit])
          .select('*');

        if (error) {
          console.error('❌ [LOCALIZAÇÃO] Erro na inserção:', error);
          throw error;
        }

        console.log('✅ [LOCALIZAÇÃO] Nova localização inserida:', data);
        toast({
          title: "✅ Localização adicionada",
          description: "A nova localização foi registada com sucesso",
        });
      }

      setLocalizacaoDialogOpen(false);
      setEditingLocalizacao(null);
      resetLocalizacaoForm();
      
      console.log('🔄 [LOCALIZAÇÃO] Recarregando dados do animal...');
      await fetchAnimalData();

    } catch (error: any) {
      console.error('💥 [LOCALIZAÇÃO] Erro ao processar localização:', error);
      toast({
        title: "❌ Erro ao processar localização",
        description: error.message || "Não foi possível processar a localização",
        variant: "destructive",
      });
    }
  };

  // Outras funções de submissão (mantidas como estavam)
  const handleIntervencaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!intervencaoForm.tipo_intervencao_id || !intervencaoForm.data_intervencao) {
      toast({
        title: "Campos obrigatórios",
        description: "Tipo de intervenção e data são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validar custo se fornecido
    if (intervencaoForm.custo) {
      const custoNumerico = parseFloat(intervencaoForm.custo);
      if (isNaN(custoNumerico) || custoNumerico < 0 || custoNumerico > 99999.99) {
        toast({
          title: "Custo inválido",
          description: "O custo deve ser um número entre 0 e €99.999,99",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const dataToSubmit = {
        animal_id: id,
        tipo_intervencao_id: intervencaoForm.tipo_intervencao_id,
        data_intervencao: intervencaoForm.data_intervencao,
        veterinario: intervencaoForm.veterinario || null,
        clinica: intervencaoForm.clinica || null,
        custo: intervencaoForm.custo ? parseFloat(intervencaoForm.custo) : null,
        observacoes: intervencaoForm.observacoes || null,
        proxima_data: intervencaoForm.proxima_data || null,
        voluntario_id: intervencaoForm.voluntario_id || null
      };

      if (editingIntervencao) {
        const { error } = await supabase
          .from('intervencoes')
          .update(dataToSubmit)
          .eq('id', editingIntervencao.id);

        if (error) throw error;

        toast({
          title: "Intervenção atualizada",
          description: "A intervenção foi atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('intervencoes')
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: "Intervenção adicionada",
          description: "A nova intervenção foi registada com sucesso",
        });
      }

      setIntervencaoDialogOpen(false);
      setEditingIntervencao(null);
      resetIntervencaoForm();
      fetchAnimalData();

    } catch (error: any) {
      console.error('Erro ao processar intervenção:', error);
      toast({
        title: "Erro ao processar intervenção",
        description: error.message || "Não foi possível processar a intervenção",
        variant: "destructive",
      });
    }
  };

  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventoForm.tipo_evento || !eventoForm.data_evento || !eventoForm.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Tipo, data e descrição são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSubmit = {
        animal_id: id,
        tipo_evento: eventoForm.tipo_evento,
        data_evento: eventoForm.data_evento,
        descricao: eventoForm.descricao,
        observacoes: eventoForm.observacoes || null
      };

      if (editingEvento) {
        const { error } = await supabase
          .from('eventos')
          .update(dataToSubmit)
          .eq('id', editingEvento.id);

        if (error) throw error;

        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('eventos')
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: "Evento adicionado",
          description: "O novo evento foi registado com sucesso",
        });
      }

      setEventoDialogOpen(false);
      setEditingEvento(null);
      resetEventoForm();
      fetchAnimalData();

    } catch (error: any) {
      console.error('Erro ao processar evento:', error);
      toast({
        title: "Erro ao processar evento",
        description: error.message || "Não foi possível processar o evento",
        variant: "destructive",
      });
    }
  };

  // Funções de eliminação
  const handleDeleteIntervencao = async (intervencaoId: string) => {
    try {
      const { error } = await supabase
        .from('intervencoes')
        .delete()
        .eq('id', intervencaoId);

      if (error) throw error;

      toast({
        title: "Intervenção eliminada",
        description: "A intervenção foi eliminada com sucesso",
      });

      fetchAnimalData();
    } catch (error: any) {
      console.error('Erro ao eliminar intervenção:', error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a intervenção",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvento = async (eventoId: string) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;

      toast({
        title: "Evento eliminado",
        description: "O evento foi eliminado com sucesso",
      });

      fetchAnimalData();
    } catch (error: any) {
      console.error('Erro ao eliminar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o evento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLocalizacao = async (localizacaoId: string) => {
    try {
      console.log('🗑️ [LOCALIZAÇÃO] Eliminando localização:', localizacaoId);
      
      const { error } = await supabase
        .from('localizacoes')
        .delete()
        .eq('id', localizacaoId);

      if (error) {
        console.error('❌ [LOCALIZAÇÃO] Erro ao eliminar:', error);
        throw error;
      }

      console.log('✅ [LOCALIZAÇÃO] Localização eliminada com sucesso');
      toast({
        title: "✅ Localização eliminada",
        description: "A localização foi eliminada com sucesso",
      });

      await fetchAnimalData();
    } catch (error: any) {
      console.error('💥 [LOCALIZAÇÃO] Erro ao eliminar localização:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível eliminar a localização",
        variant: "destructive",
      });
    }
  };

  // CORRIGIDO: Funções auxiliares
  const resetIntervencaoForm = () => {
    setIntervencaoForm({
      tipo_intervencao_id: "",
      data_intervencao: new Date().toISOString().split('T')[0],
      veterinario: "",
      clinica: "",
      custo: "",
      observacoes: "",
      proxima_data: "",
      voluntario_id: ""
    });
  };

  const resetEventoForm = () => {
    setEventoForm({
      tipo_evento: "",
      data_evento: new Date().toISOString().split('T')[0],
      descricao: "",
      observacoes: ""
    });
  };

  const resetLocalizacaoForm = () => {
    setLocalizacaoForm({
      localizacao: "",
      endereco: "",
      data_entrada: new Date().toISOString().split('T')[0],
      data_saida: "",
      observacoes: "",
      ativo: true
    });
  };

  const openEditIntervencao = (intervencao: Intervencao) => {
    setEditingIntervencao(intervencao);
    setIntervencaoForm({
      tipo_intervencao_id: intervencao.tipo_intervencao_id || "",
      data_intervencao: intervencao.data_intervencao || "",
      veterinario: intervencao.veterinario || "",
      clinica: intervencao.clinica || "",
      custo: intervencao.custo?.toString() || "",
      observacoes: intervencao.observacoes || "",
      proxima_data: intervencao.proxima_data || "",
      voluntario_id: intervencao.voluntario_id || ""
    });
    setIntervencaoDialogOpen(true);
  };

  const openEditEvento = (evento: Evento) => {
    setEditingEvento(evento);
    setEventoForm({
      tipo_evento: evento.tipo_evento || "",
      data_evento: evento.data_evento || "",
      descricao: evento.descricao || "",
      observacoes: evento.observacoes || ""
    });
    setEventoDialogOpen(true);
  };

  // CORRIGIDO: Função de edição de localização
  const openEditLocalizacao = (localizacao: Localizacao) => {
    setEditingLocalizacao(localizacao);
    setLocalizacaoForm({
      localizacao: localizacao.localizacao || "",
      endereco: localizacao.endereco || "",
      data_entrada: localizacao.data_entrada || "",
      data_saida: localizacao.data_saida || "",
      observacoes: localizacao.observacoes || "",
      ativo: localizacao.ativo !== undefined ? localizacao.ativo : true
    });
    setLocalizacaoDialogOpen(true);
  };

  // Função para arquivar/desarquivar animal
  const handleArquivar = async () => {
    if (!animal) return;

    const isArquivando = !animal.arquivado;
    const acao = isArquivando ? 'arquivar' : 'desarquivar';
    
    const confirmMessage = isArquivando 
      ? `Tem certeza que deseja arquivar o animal "${animal.nome}"?\n\n` +
        `O animal deixará de aparecer na gestão normal e nas estatísticas.`
      : `Tem certeza que deseja desarquivar o animal "${animal.nome}"?\n\n` +
        `O animal voltará a aparecer na gestão normal.`;
    
    if (!confirm(confirmMessage)) return;

    try {
      console.log(`📎 [ARQUIVO] ${acao} animal:`, animal.nome);

      const updateData: any = {
        arquivado: isArquivando,
        updated_at: new Date().toISOString()
      };

      if (isArquivando) {
        updateData.data_arquivamento = new Date().toISOString();
        updateData.motivo_arquivamento = 'Arquivado manualmente';
      } else {
        updateData.data_arquivamento = null;
        updateData.motivo_arquivamento = null;
      }

      const { error } = await supabase
        .from('animais')
        .update(updateData)
        .eq('id', animal.id);

      if (error) {
        console.error(`❌ [ARQUIVO] Erro ao ${acao}:`, error);
        throw error;
      }

      toast({
        title: `✅ Animal ${isArquivando ? 'arquivado' : 'desarquivado'}`,
        description: `${animal.nome} foi ${isArquivando ? 'arquivado' : 'desarquivado'} com sucesso`,
      });

      // Atualizar o estado local
      setAnimal({ ...animal, ...updateData });

    } catch (error: any) {
      console.error(`💥 [ARQUIVO] Erro ao ${acao}:`, error);
      toast({
        title: "❌ Erro",
        description: `Não foi possível ${acao} o animal`,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Adotado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Óbito': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Não Adotável': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoIntervencaoNome = (tipoId: string) => {
    const tipo = tiposIntervencoes.find(t => t.id === tipoId);
    return tipo?.nome || 'Tipo não encontrado';
  };

  const getVoluntarioNome = (voluntarioId: string) => {
    const voluntario = voluntarios.find(v => v.id === voluntarioId);
    return voluntario?.nome || 'Voluntário não encontrado';
  };

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

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar animal</h2>
          <p className="text-gray-600 mb-4">{error || "Animal não encontrado"}</p>
          <div className="space-x-4">
            <Button onClick={fetchAnimalData}>
              <Loader2 className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button variant="outline" asChild>
              <Link to="/animais">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Lista
              </Link>
            </Button>
          </div>
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
                <Link to="/animais">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Lista
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-red-500" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{animal.nome}</h1>
                  <p className="text-sm text-gray-500">
                    {animal.especie} • {animal.raca} • {animal.sexo}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getEstadoBadgeColor(animal.estado)}>
                {animal.estado}
              </Badge>
              
              {/* Botão de Arquivar - Apenas para Administradores */}
              {hasPermission('admin') && (
                <Button
                  variant={animal.arquivado ? "default" : "outline"}
                  size="sm"
                  onClick={handleArquivar}
                  className={animal.arquivado ? "bg-blue-600 hover:bg-blue-700" : "border-orange-300 text-orange-600 hover:bg-orange-50"}
                >
                  {animal.arquivado ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Desarquivar
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações Básicas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Informações do Animal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Nome</Label>
                <p className="text-lg font-semibold">{animal.nome}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Espécie</Label>
                <p className="text-lg">{animal.especie}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Raça</Label>
                <p className="text-lg">{animal.raca}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Sexo</Label>
                <p className="text-lg">{animal.sexo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Idade</Label>
                <p className="text-lg">{animal.idade} anos</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Peso</Label>
                <p className="text-lg">{animal.peso} kg</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Cor</Label>
                <p className="text-lg">{animal.cor}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Data de Entrada</Label>
                <p className="text-lg">{formatDate(animal.data_entrada)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Número de Processo</Label>
                <p className="text-lg font-mono">{animal.numero_processo}</p>
              </div>
            </div>
            
            {animal.observacoes && (
              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-600">Observações</Label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{animal.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs para diferentes seções */}
        <Tabs defaultValue="intervencoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="intervencoes" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Intervenções</span>
            </TabsTrigger>
            <TabsTrigger value="eventos" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Eventos</span>
            </TabsTrigger>
            <TabsTrigger value="localizacoes" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Localizações</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Intervenções */}
          <TabsContent value="intervencoes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Intervenções Médicas</CardTitle>
                    <CardDescription>
                      Histórico de procedimentos veterinários e cuidados médicos
                    </CardDescription>
                  </div>
                  <Dialog open={intervencaoDialogOpen} onOpenChange={setIntervencaoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingIntervencao(null);
                        resetIntervencaoForm();
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Intervenção
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingIntervencao ? "Editar Intervenção" : "Nova Intervenção"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingIntervencao ? "Atualize os dados da intervenção" : "Registar nova intervenção médica para " + animal.nome}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleIntervencaoSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tipo_intervencao_id">Tipo de Intervenção *</Label>
                            <Select 
                              value={intervencaoForm.tipo_intervencao_id} 
                              onValueChange={(value) => setIntervencaoForm(prev => ({...prev, tipo_intervencao_id: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {tiposIntervencoes.map((tipo) => (
                                  <SelectItem key={tipo.id} value={tipo.id}>
                                    {tipo.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="data_intervencao">Data da Intervenção *</Label>
                            <Input
                              id="data_intervencao"
                              type="date"
                              value={intervencaoForm.data_intervencao}
                              onChange={(e) => setIntervencaoForm(prev => ({...prev, data_intervencao: e.target.value}))}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="veterinario">Veterinário</Label>
                            <Input
                              id="veterinario"
                              value={intervencaoForm.veterinario}
                              onChange={(e) => setIntervencaoForm(prev => ({...prev, veterinario: e.target.value}))}
                              placeholder="Nome do veterinário"
                            />
                          </div>
                          <div>
                            <Label htmlFor="clinica">Clínica</Label>
                            <Input
                              id="clinica"
                              value={intervencaoForm.clinica}
                              onChange={(e) => setIntervencaoForm(prev => ({...prev, clinica: e.target.value}))}
                              placeholder="Nome da clínica"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="custo">Custo (€)</Label>
                            <Input
                              id="custo"
                              type="number"
                              step="0.01"
                              min="0"
                              max="99999.99"
                              value={intervencaoForm.custo}
                              onChange={(e) => setIntervencaoForm(prev => ({...prev, custo: e.target.value}))}
                              placeholder="0.00 (opcional)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Máximo: €99.999,99</p>
                          </div>
                          <div>
                            <Label htmlFor="voluntario_id">Voluntário Responsável</Label>
                            <Select 
                              value={intervencaoForm.voluntario_id} 
                              onValueChange={(value) => setIntervencaoForm(prev => ({...prev, voluntario_id: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o voluntário" />
                              </SelectTrigger>
                              <SelectContent>
                                {voluntarios.map((voluntario) => (
                                  <SelectItem key={voluntario.id} value={voluntario.id}>
                                    {voluntario.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="proxima_data">Próxima Data (se aplicável)</Label>
                          <Input
                            id="proxima_data"
                            type="date"
                            value={intervencaoForm.proxima_data}
                            onChange={(e) => setIntervencaoForm(prev => ({...prev, proxima_data: e.target.value}))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="observacoes_intervencao">Observações</Label>
                          <Textarea
                            id="observacoes_intervencao"
                            value={intervencaoForm.observacoes}
                            onChange={(e) => setIntervencaoForm(prev => ({...prev, observacoes: e.target.value}))}
                            placeholder="Observações sobre a intervenção"
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIntervencaoDialogOpen(false);
                              setEditingIntervencao(null);
                              resetIntervencaoForm();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {editingIntervencao ? "Atualizar" : "Adicionar"} Intervenção
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {intervencoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma intervenção registada</p>
                    <p className="text-sm">Clique em "Nova Intervenção" para adicionar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {intervencoes.map((intervencao) => (
                      <div key={intervencao.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline">
                                {getTipoIntervencaoNome(intervencao.tipo_intervencao_id)}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(intervencao.data_intervencao)}
                              </span>
                              {intervencao.custo && (
                                <span className="text-sm font-medium text-green-600">
                                  {formatCurrency(intervencao.custo)}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                              {intervencao.veterinario && (
                                <div>Veterinário: {intervencao.veterinario}</div>
                              )}
                              {intervencao.clinica && (
                                <div>Clínica: {intervencao.clinica}</div>
                              )}
                              {intervencao.voluntario_id && (
                                <div>Responsável: {getVoluntarioNome(intervencao.voluntario_id)}</div>
                              )}
                              {intervencao.proxima_data && (
                                <div>Próxima: {formatDate(intervencao.proxima_data)}</div>
                              )}
                            </div>

                            {intervencao.observacoes && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {intervencao.observacoes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditIntervencao(intervencao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar Intervenção</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja eliminar esta intervenção? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteIntervencao(intervencao.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Eventos */}
          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Eventos</CardTitle>
                    <CardDescription>
                      Registro de eventos importantes na vida do animal
                    </CardDescription>
                  </div>
                  <Dialog open={eventoDialogOpen} onOpenChange={setEventoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingEvento(null);
                        resetEventoForm();
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Evento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingEvento ? "Editar Evento" : "Novo Evento"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingEvento ? "Atualize os dados do evento" : "Registar novo evento para " + animal.nome}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEventoSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tipo_evento">Tipo de Evento *</Label>
                            <Select 
                              value={eventoForm.tipo_evento} 
                              onValueChange={(value) => setEventoForm(prev => ({...prev, tipo_evento: value}))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Resgate">Resgate</SelectItem>
                                <SelectItem value="Adoção">Adoção</SelectItem>
                                <SelectItem value="Transferência">Transferência</SelectItem>
                                <SelectItem value="Fuga">Fuga</SelectItem>
                                <SelectItem value="Retorno">Retorno</SelectItem>
                                <SelectItem value="Óbito">Óbito</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="data_evento">Data do Evento *</Label>
                            <Input
                              id="data_evento"
                              type="date"
                              value={eventoForm.data_evento}
                              onChange={(e) => setEventoForm(prev => ({...prev, data_evento: e.target.value}))}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="descricao_evento">Descrição *</Label>
                          <Input
                            id="descricao_evento"
                            value={eventoForm.descricao}
                            onChange={(e) => setEventoForm(prev => ({...prev, descricao: e.target.value}))}
                            placeholder="Descrição breve do evento"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="observacoes_evento">Observações</Label>
                          <Textarea
                            id="observacoes_evento"
                            value={eventoForm.observacoes}
                            onChange={(e) => setEventoForm(prev => ({...prev, observacoes: e.target.value}))}
                            placeholder="Observações detalhadas sobre o evento"
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setEventoDialogOpen(false);
                              setEditingEvento(null);
                              resetEventoForm();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {editingEvento ? "Atualizar" : "Adicionar"} Evento
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {eventos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum evento registado</p>
                    <p className="text-sm">Clique em "Novo Evento" para adicionar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventos.map((evento) => (
                      <div key={evento.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline">
                                {evento.tipo_evento}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(evento.data_evento)}
                              </span>
                            </div>
                            
                            <div className="mb-2">
                              <p className="font-medium text-gray-900">{evento.descricao}</p>
                            </div>

                            {evento.observacoes && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {evento.observacoes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditEvento(evento)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja eliminar este evento? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteEvento(evento.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CORRIGIDO: Tab Localizações */}
          <TabsContent value="localizacoes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Localizações</CardTitle>
                    <CardDescription>
                      Histórico de locais onde o animal esteve
                    </CardDescription>
                  </div>
                  <Dialog open={localizacaoDialogOpen} onOpenChange={setLocalizacaoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingLocalizacao(null);
                        resetLocalizacaoForm();
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Localização
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingLocalizacao ? "Editar Localização" : "Nova Localização"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingLocalizacao ? "Atualize os dados da localização" : "Registar nova localização para " + animal.nome}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleLocalizacaoSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="localizacao">Localização *</Label>
                          <Select 
                            value={localizacaoForm.localizacao} 
                            onValueChange={(value) => setLocalizacaoForm(prev => ({...prev, localizacao: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a localização" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Canil">Canil</SelectItem>
                              <SelectItem value="CRO">CRO</SelectItem>
                              <SelectItem value="FAT">FAT</SelectItem>
                              <SelectItem value="Rua">Rua</SelectItem>
                              <SelectItem value="Casa Temporária">Casa Temporária</SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="endereco">Endereço *</Label>
                          <Input
                            id="endereco"
                            value={localizacaoForm.endereco}
                            onChange={(e) => setLocalizacaoForm(prev => ({...prev, endereco: e.target.value}))}
                            placeholder="Endereço completo ou descrição do local"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="data_entrada">Data de Entrada *</Label>
                            <Input
                              id="data_entrada"
                              type="date"
                              value={localizacaoForm.data_entrada}
                              onChange={(e) => setLocalizacaoForm(prev => ({...prev, data_entrada: e.target.value}))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="data_saida">Data de Saída</Label>
                            <Input
                              id="data_saida"
                              type="date"
                              value={localizacaoForm.data_saida}
                              onChange={(e) => setLocalizacaoForm(prev => ({...prev, data_saida: e.target.value}))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="observacoes_localizacao">Observações</Label>
                          <Textarea
                            id="observacoes_localizacao"
                            value={localizacaoForm.observacoes}
                            onChange={(e) => setLocalizacaoForm(prev => ({...prev, observacoes: e.target.value}))}
                            placeholder="Observações sobre a localização"
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setLocalizacaoDialogOpen(false);
                              setEditingLocalizacao(null);
                              resetLocalizacaoForm();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {editingLocalizacao ? "Atualizar" : "Adicionar"} Localização
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {localizacoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma localização registada</p>
                    <p className="text-sm">Clique em "Nova Localização" para adicionar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localizacoes.map((localizacao) => (
                      <div key={localizacao.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline">
                                {localizacao.localizacao}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(localizacao.data_entrada)}
                                {localizacao.data_saida && ` - ${formatDate(localizacao.data_saida)}`}
                                {!localizacao.data_saida && " - Atual"}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-900">{localizacao.endereco}</span>
                            </div>

                            {localizacao.observacoes && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {localizacao.observacoes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditLocalizacao(localizacao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar Localização</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja eliminar esta localização? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLocalizacao(localizacao.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnimalDetail;