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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  PawPrint,
  Cat,
  Dog,
  Loader2,
  AlertCircle,
  Stethoscope,
  Calendar,
  Home,
  UserCheck,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, TipoIntervencao, Voluntario, ClinicaVeterinaria, EventoAnimal, TipoEvento, LocalizacaoAnimal, TipoLocalizacao } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados básicos para intervenções
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [clinicas, setClinicas] = useState<ClinicaVeterinaria[]>([]);
  const [intervencaoDialogOpen, setIntervencaoDialogOpen] = useState(false);
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);

  // Estados para eventos
  const [eventos, setEventos] = useState<EventoAnimal[]>([]);
  const [tiposEventos, setTiposEventos] = useState<TipoEvento[]>([]);
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoAnimal | null>(null);

  // Estados para localizações
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoAnimal[]>([]);
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<TipoLocalizacao[]>([]);
  const [localizacaoDialogOpen, setLocalizacaoDialogOpen] = useState(false);
  const [editingLocalizacao, setEditingLocalizacao] = useState<LocalizacaoAnimal | null>(null);
  
  // Formulário simplificado
  const [intervencaoForm, setIntervencaoForm] = useState({
    tipo_intervencao_id: '',
    data_intervencao: '',
    veterinario: '',
    clinica_id: '', // Nova referência à clínica
    observacoes: '',
    custo: '',
    urgente: false
    // Removido: concluida (será sempre true)
  });

  // Formulário de eventos
  const [eventoForm, setEventoForm] = useState({
    tipo_evento: '',
    data_evento: '',
    descricao: '',
    observacoes: '',
    voluntario_id: '',
    documento_referencia: '',
    importante: false
  });

  // Formulário de localizações
  const [localizacaoForm, setLocalizacaoForm] = useState({
    tipo_localizacao: '',
    data_inicio: '',
    endereco_detalhes: '',
    responsavel_id: '',
    motivo_transferencia: '',
    observacoes: ''
  });

  // Função básica para carregar dados do animal
  const fetchAnimalData = async () => {
    if (!id) {
      setError("ID do animal não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 [ANIMAL] Carregando dados do animal:', id);

      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (animalError) {
        console.error('❌ [ANIMAL] Erro ao carregar animal:', animalError);
        throw animalError;
      }

      if (!animalData) {
        throw new Error('Animal não encontrado');
      }

      console.log('✅ [ANIMAL] Animal carregado:', animalData.nome);
      setAnimal(animalData);
      setError(null);

      // Carregar dados relacionados de forma segura
      await loadRelatedData();

    } catch (error: any) {
      console.error('💥 [ANIMAL] Erro geral:', error);
      setError(error.message || 'Erro ao carregar dados do animal');
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao carregar dados do animal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados relacionados de forma segura
  const loadRelatedData = async () => {
    try {
      // Carregar intervenções
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipos_intervencoes (nome),
          voluntarios (nome),
          clinicas_veterinarias (nome, tem_protocolo)
        `)
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (!intervencoesError && intervencoesData) {
        setIntervencoes(intervencoesData);
        console.log('✅ [INTERVENCOES] Carregadas:', intervencoesData.length);
      } else {
        console.log('ℹ️ [INTERVENCOES] Nenhuma intervenção encontrada ou erro:', intervencoesError?.message);
        setIntervencoes([]);
      }

      // Carregar tipos de intervenções
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos_intervencoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!tiposError && tiposData) {
        setTiposIntervencoes(tiposData);
        console.log('✅ [TIPOS] Carregados:', tiposData.length);
      } else {
        console.log('ℹ️ [TIPOS] Erro ao carregar tipos:', tiposError?.message);
        setTiposIntervencoes([]);
      }

      // Carregar voluntários
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('id, nome')
        .order('nome');

      if (!voluntariosError && voluntariosData) {
        setVoluntarios(voluntariosData);
        console.log('✅ [VOLUNTARIOS] Carregados:', voluntariosData.length);
      } else {
        console.log('ℹ️ [VOLUNTARIOS] Erro ao carregar voluntários:', voluntariosError?.message);
        setVoluntarios([]);
      }

      // Carregar clínicas
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas_veterinarias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!clinicasError && clinicasData) {
        setClinicas(clinicasData);
        console.log('✅ [CLINICAS] Carregadas:', clinicasData.length);
      } else {
        console.log('ℹ️ [CLINICAS] Erro ao carregar clínicas:', clinicasError?.message);
        setClinicas([]);
      }

      // Carregar eventos do animal
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos_animal')
        .select(`
          *,
          voluntarios (nome)
        `)
        .eq('animal_id', id)
        .order('data_evento', { ascending: false });

      if (!eventosError && eventosData) {
        setEventos(eventosData);
        console.log('✅ [EVENTOS] Carregados:', eventosData.length);
      } else {
        console.log('ℹ️ [EVENTOS] Erro ao carregar eventos:', eventosError?.message);
        setEventos([]);
      }

      // Carregar tipos de eventos
      const { data: tiposEventosData, error: tiposEventosError } = await supabase
        .from('tipos_eventos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!tiposEventosError && tiposEventosData) {
        setTiposEventos(tiposEventosData);
        console.log('✅ [TIPOS_EVENTOS] Carregados:', tiposEventosData.length);
      } else {
        console.log('ℹ️ [TIPOS_EVENTOS] Erro ao carregar tipos de eventos:', tiposEventosError?.message);
        setTiposEventos([]);
      }

      // Carregar localizações do animal
      const { data: localizacoesData, error: localizacoesError } = await supabase
        .from('localizacoes_animal')
        .select(`
          *,
          voluntarios (nome)
        `)
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      if (!localizacoesError && localizacoesData) {
        setLocalizacoes(localizacoesData);
        console.log('✅ [LOCALIZACOES] Carregadas:', localizacoesData.length);
      } else {
        console.log('ℹ️ [LOCALIZACOES] Erro ao carregar localizações:', localizacoesError?.message);
        setLocalizacoes([]);
      }

      // Carregar tipos de localizações
      const { data: tiposLocalizacoesData, error: tiposLocalizacoesError } = await supabase
        .from('tipos_localizacoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!tiposLocalizacoesError && tiposLocalizacoesData) {
        setTiposLocalizacoes(tiposLocalizacoesData);
        console.log('✅ [TIPOS_LOCALIZACOES] Carregados:', tiposLocalizacoesData.length);
      } else {
        console.log('ℹ️ [TIPOS_LOCALIZACOES] Erro ao carregar tipos de localizações:', tiposLocalizacoesError?.message);
        setTiposLocalizacoes([]);
      }

    } catch (error: any) {
      console.error('💥 [RELATED_DATA] Erro ao carregar dados relacionados:', error);
    }
  };

  // Funções de gestão de intervenções
  const resetIntervencaoForm = () => {
    setIntervencaoForm({
      tipo_intervencao_id: '',
      data_intervencao: '',
      veterinario: '',
      clinica_id: '',
      observacoes: '',
      custo: '',
      urgente: false
      // Removido: concluida (sempre true)
    });
    setEditingIntervencao(null);
  };

  const openIntervencaoDialog = (intervencao?: Intervencao) => {
    if (intervencao) {
      setEditingIntervencao(intervencao);
      setIntervencaoForm({
        tipo_intervencao_id: intervencao.tipo_intervencao_id,
        data_intervencao: intervencao.data_intervencao.split('T')[0],
        veterinario: intervencao.veterinario || '',
        clinica_id: intervencao.clinica_id || '',
        observacoes: intervencao.observacoes || '',
        custo: intervencao.custo?.toString() || '',
        urgente: intervencao.urgente
        // Removido: concluida (sempre true)
      });
    } else {
      resetIntervencaoForm();
    }
    setIntervencaoDialogOpen(true);
  };

  const handleIntervencaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!intervencaoForm.tipo_intervencao_id || !intervencaoForm.data_intervencao) {
      toast({
        title: "❌ Erro",
        description: "Tipo de intervenção e data são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const intervencaoData = {
        animal_id: id,
        tipo_intervencao_id: intervencaoForm.tipo_intervencao_id,
        data_intervencao: intervencaoForm.data_intervencao,
        veterinario: intervencaoForm.veterinario || null,
        clinica_id: intervencaoForm.clinica_id || null,
        observacoes: intervencaoForm.observacoes || null,
        custo: intervencaoForm.custo ? parseFloat(intervencaoForm.custo) : null,
        urgente: intervencaoForm.urgente,
        concluida: true // Sempre concluída na data da intervenção
      };

      if (editingIntervencao) {
        const { error } = await supabase
          .from('intervencoes')
          .update(intervencaoData)
          .eq('id', editingIntervencao.id);

        if (error) throw error;

        toast({
          title: "✅ Sucesso",
          description: "Intervenção atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('intervencoes')
          .insert([intervencaoData]);

        if (error) throw error;

        toast({
          title: "✅ Sucesso",
          description: "Intervenção criada com sucesso",
        });
      }

      setIntervencaoDialogOpen(false);
      resetIntervencaoForm();
      loadRelatedData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao salvar intervenção:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao salvar intervenção",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIntervencao = async (intervencaoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta intervenção?')) return;

    try {
      const { error } = await supabase
        .from('intervencoes')
        .delete()
        .eq('id', intervencaoId);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Intervenção eliminada com sucesso",
      });

      loadRelatedData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao eliminar intervenção:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao eliminar intervenção",
        variant: "destructive",
      });
    }
  };

  // Funções de gestão de eventos
  const resetEventoForm = () => {
    setEventoForm({
      tipo_evento: '',
      data_evento: '',
      descricao: '',
      observacoes: '',
      voluntario_id: '',
      documento_referencia: '',
      importante: false
    });
    setEditingEvento(null);
  };

  const openEventoDialog = (evento?: EventoAnimal) => {
    if (evento) {
      setEditingEvento(evento);
      setEventoForm({
        tipo_evento: evento.tipo_evento,
        data_evento: evento.data_evento.split('T')[0],
        descricao: evento.descricao || '',
        observacoes: evento.observacoes || '',
        voluntario_id: evento.voluntario_id || '',
        documento_referencia: evento.documento_referencia || '',
        importante: evento.importante
      });
    } else {
      resetEventoForm();
    }
    setEventoDialogOpen(true);
  };

  const handleEventoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventoForm.tipo_evento || !eventoForm.data_evento) {
      toast({
        title: "❌ Erro",
        description: "Tipo de evento e data são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventoData = {
        animal_id: id,
        tipo_evento: eventoForm.tipo_evento,
        data_evento: eventoForm.data_evento,
        titulo: eventoForm.descricao || eventoForm.tipo_evento, // Usar descrição como título ou tipo de evento
        descricao: eventoForm.descricao || null,
        observacoes: eventoForm.observacoes || null,
        voluntario_id: eventoForm.voluntario_id || null,
        documento_referencia: eventoForm.documento_referencia || null,
        importante: eventoForm.importante
      };

      if (editingEvento) {
        const { error } = await supabase
          .from('eventos_animal')
          .update(eventoData)
          .eq('id', editingEvento.id);

        if (error) throw error;

        toast({
          title: "✅ Sucesso",
          description: "Evento atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('eventos_animal')
          .insert([eventoData]);

        if (error) throw error;

        toast({
          title: "✅ Sucesso",
          description: "Evento criado com sucesso",
        });
      }

      setEventoDialogOpen(false);
      resetEventoForm();
      loadRelatedData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao salvar evento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvento = async (eventoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este evento?')) return;

    try {
      const { error } = await supabase
        .from('eventos_animal')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Evento eliminado com sucesso",
      });

      loadRelatedData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao eliminar evento:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao eliminar evento",
        variant: "destructive",
      });
    }
  };

  // Funções de gestão de localizações
  const resetLocalizacaoForm = () => {
    setLocalizacaoForm({
      tipo_localizacao: '',
      data_inicio: '',
      endereco_detalhes: '',
      responsavel_id: '',
      motivo_transferencia: '',
      observacoes: ''
    });
    setEditingLocalizacao(null);
  };

  const openLocalizacaoDialog = (localizacao?: LocalizacaoAnimal) => {
    if (localizacao) {
      setEditingLocalizacao(localizacao);
      setLocalizacaoForm({
        tipo_localizacao: localizacao.tipo_localizacao,
        data_inicio: localizacao.data_inicio.split('T')[0],
        endereco_detalhes: localizacao.endereco_detalhes || '',
        responsavel_id: localizacao.responsavel_id || '',
        motivo_transferencia: localizacao.motivo_transferencia || '',
        observacoes: localizacao.observacoes || ''
      });
    } else {
      resetLocalizacaoForm();
    }
    setLocalizacaoDialogOpen(true);
  };

  const handleLocalizacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localizacaoForm.tipo_localizacao || !localizacaoForm.data_inicio) {
      toast({
        title: "❌ Erro",
        description: "Tipo de localização e data são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const localizacaoData = {
        animal_id: id,
        tipo_localizacao: localizacaoForm.tipo_localizacao,
        data_inicio: localizacaoForm.data_inicio,
        endereco_detalhes: localizacaoForm.endereco_detalhes || null,
        responsavel_id: localizacaoForm.responsavel_id || null,
        motivo_transferencia: localizacaoForm.motivo_transferencia || null,
        observacoes: localizacaoForm.observacoes || null,
        ativa: true // Nova localização sempre ativa (trigger desativa as outras)
      };

      if (editingLocalizacao) {
        const { error } = await supabase
          .from('localizacoes_animal')
          .update(localizacaoData)
          .eq('id', editingLocalizacao.id);

        if (error) throw error;

        toast({
          title: "✅ Sucesso",
          description: "Localização atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('localizacoes_animal')
          .insert([localizacaoData]);

        if (error) throw error;

        toast({
          title: "✅ Sucesso",
          description: "Transferência realizada com sucesso",
        });
      }

      setLocalizacaoDialogOpen(false);
      resetLocalizacaoForm();
      loadRelatedData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao salvar localização:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao salvar localização",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLocalizacao = async (localizacaoId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta localização?')) return;

    try {
      const { error } = await supabase
        .from('localizacoes_animal')
        .delete()
        .eq('id', localizacaoId);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Localização eliminada com sucesso",
      });

      loadRelatedData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao eliminar localização:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao eliminar localização",
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

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao Carregar Animal</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button asChild>
              <Link to="/animais">Voltar à Lista de Animais</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <UserHeader 
        title={`${animal.nome} - Ficha Completa`}
        description={`${animal.especie} • Processo: ${animal.numero_processo || 'N/A'}`}
        showBackButton
        backTo="/animais"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Informações Básicas do Animal */}
        <Card className="animal-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {animal.especie === 'Cão' ? (
                  <Dog className="h-8 w-8 text-orange-500" />
                ) : animal.especie === 'Gato' ? (
                  <Cat className="h-8 w-8 text-orange-500" />
                ) : (
                  <PawPrint className="h-8 w-8 text-orange-500" />
                )}
                <div>
                  <CardTitle className="text-2xl text-orange-800">{animal.nome}</CardTitle>
                  <CardDescription className="text-orange-600">
                    {animal.especie} • {animal.sexo} • {animal.raca || 'Raça não especificada'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={animal.estado === 'Ativo' ? 'default' : 'secondary'}>
                  {animal.estado}
                </Badge>
                {animal.arquivado && (
                  <Badge variant="outline" className="text-gray-600">
                    Arquivado
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-orange-700 font-medium">Número de Processo</Label>
                <p className="text-orange-900">{animal.numero_processo || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Data de Entrada</Label>
                <p className="text-orange-900">
                  {new Date(animal.data_entrada).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Idade Estimada</Label>
                <p className="text-orange-900">
                  {animal.idade_estimada ? `${Math.floor(animal.idade_estimada / 12)} anos e ${animal.idade_estimada % 12} meses` : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Peso</Label>
                <p className="text-orange-900">{animal.peso ? `${animal.peso} kg` : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Cor</Label>
                <p className="text-orange-900">{animal.cor || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-orange-700 font-medium">Transponder</Label>
                <p className="text-orange-900">{animal.transponder || 'N/A'}</p>
              </div>
            </div>
            
            {animal.caracteristicas_fisicas && (
              <div className="mt-4">
                <Label className="text-orange-700 font-medium">Características Físicas</Label>
                <p className="text-orange-900 mt-1">{animal.caracteristicas_fisicas}</p>
              </div>
            )}
            
            {animal.observacoes && (
              <div className="mt-4">
                <Label className="text-orange-700 font-medium">Observações</Label>
                <p className="text-orange-900 mt-1">{animal.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Abas Simplificadas */}
        <Tabs defaultValue="intervencoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="intervencoes">🏥 Intervenções</TabsTrigger>
            <TabsTrigger value="eventos">📅 Eventos</TabsTrigger>
            <TabsTrigger value="localizacoes">📍 Localizações</TabsTrigger>
            <TabsTrigger value="responsabilidades">👥 Responsabilidades</TabsTrigger>
            <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
          </TabsList>

          {/* Aba de Intervenções - FUNCIONAL */}
          <TabsContent value="intervencoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <CardTitle>Intervenções Médicas</CardTitle>
                  </div>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => openIntervencaoDialog()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Intervenção
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {intervencoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhuma intervenção registrada</p>
                    <p className="text-sm mb-4">Clique em "Nova Intervenção" para adicionar a primeira intervenção médica.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Veterinário</TableHead>
                        <TableHead>Clínica</TableHead>
                        <TableHead>Custo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {intervencoes.map((intervencao) => (
                        <TableRow key={intervencao.id}>
                          <TableCell>
                            <span className="font-medium">
                              {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant={intervencao.urgente ? "destructive" : "secondary"}>
                                {intervencao.tipos_intervencoes?.nome || 'N/A'}
                              </Badge>
                              {intervencao.urgente && (
                                <Badge variant="destructive" className="text-xs">
                                  URGENTE
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{intervencao.veterinario || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{intervencao.clinicas_veterinarias?.nome || intervencao.clinica || '-'}</span>
                              {intervencao.clinicas_veterinarias?.tem_protocolo && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  PROTOCOLO
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {intervencao.custo ? `€${intervencao.custo.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={intervencao.concluida ? "default" : "outline"}>
                              {intervencao.concluida ? 'Concluída' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openIntervencaoDialog(intervencao)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteIntervencao(intervencao.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas - SIMPLIFICADAS */}
          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <CardTitle>Timeline da Vida do Animal</CardTitle>
                  </div>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => openEventoDialog()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Marcos importantes na vida de {animal?.nome} - nascimento, adoção, tratamentos, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhum evento registrado</p>
                    <p className="text-sm mb-4">Clique em "Novo Evento" para adicionar o primeiro marco na vida de {animal?.nome}.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventos.map((evento, index) => (
                      <div key={evento.id} className="relative">
                        {/* Linha da timeline */}
                        {index < eventos.length - 1 && (
                          <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        
                        {/* Card do evento */}
                        <div className="flex items-start space-x-4">
                          {/* Ícone do evento */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg ${
                            evento.importante ? 'bg-red-500' : 'bg-green-500'
                          }`}>
                            {evento.tipo_evento.includes('🎂') ? '🎂' :
                             evento.tipo_evento.includes('❤️') ? '❤️' :
                             evento.tipo_evento.includes('😢') ? '😢' :
                             evento.tipo_evento.includes('🎆') ? '🎆' :
                             evento.tipo_evento.includes('🏠') ? '🏠' :
                             evento.tipo_evento.includes('🐣') ? '🐣' :
                             '📅'}
                          </div>
                          
                          {/* Conteúdo do evento */}
                          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                  <span>{evento.tipo_evento}</span>
                                  {evento.importante && (
                                    <Badge variant="destructive" className="text-xs">
                                      IMPORTANTE
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {new Date(evento.data_evento).toLocaleDateString('pt-PT', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEventoDialog(evento)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEvento(evento.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {evento.descricao && (
                              <p className="text-gray-700 mb-2">{evento.descricao}</p>
                            )}
                            
                            {evento.observacoes && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Observações:</strong> {evento.observacoes}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-4">
                                {evento.voluntarios?.nome && (
                                  <span>👥 {evento.voluntarios.nome}</span>
                                )}
                                {evento.documento_referencia && (
                                  <span>📄 {evento.documento_referencia}</span>
                                )}
                              </div>
                              <span>
                                {Math.abs(new Date().getTime() - new Date(evento.data_evento).getTime()) / (1000 * 60 * 60 * 24) < 1
                                  ? 'Hoje'
                                  : `Há ${Math.floor(Math.abs(new Date().getTime() - new Date(evento.data_evento).getTime()) / (1000 * 60 * 60 * 24))} dias`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localizacoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-purple-600" />
                    <CardTitle>Localizações do Animal</CardTitle>
                  </div>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => openLocalizacaoDialog()}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transferência
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Histórico de localizações de {animal?.nome} - apenas uma localização ativa por vez
                </CardDescription>
              </CardHeader>
              <CardContent>
                {localizacoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhuma localização registrada</p>
                    <p className="text-sm mb-4">Clique em "Nova Transferência" para registar a primeira localização de {animal?.nome}.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Localização Atual */}
                    {localizacoes.filter(loc => loc.ativa).map((localizacao) => (
                      <div key={localizacao.id} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                            <h3 className="text-lg font-semibold text-purple-800">Localização Atual</h3>
                            <Badge className="bg-purple-500 text-white">ATIVA</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openLocalizacaoDialog(localizacao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLocalizacao(localizacao.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Tipo de Localização</p>
                            <p className="text-purple-900 font-semibold">{localizacao.tipo_localizacao}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Desde</p>
                            <p className="text-purple-900">
                              {new Date(localizacao.data_inicio).toLocaleDateString('pt-PT')} 
                              ({Math.floor((new Date().getTime() - new Date(localizacao.data_inicio).getTime()) / (1000 * 60 * 60 * 24))} dias)
                            </p>
                          </div>
                          {localizacao.endereco_detalhes && (
                            <div>
                              <p className="text-sm text-purple-600 font-medium">Endereço/Detalhes</p>
                              <p className="text-purple-900">{localizacao.endereco_detalhes}</p>
                            </div>
                          )}
                          {localizacao.voluntarios?.nome && (
                            <div>
                              <p className="text-sm text-purple-600 font-medium">Responsável</p>
                              <p className="text-purple-900">👥 {localizacao.voluntarios.nome}</p>
                            </div>
                          )}
                        </div>
                        
                        {localizacao.observacoes && (
                          <div className="mt-3">
                            <p className="text-sm text-purple-600 font-medium">Observações</p>
                            <p className="text-purple-800 bg-purple-100 p-2 rounded">{localizacao.observacoes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Histórico de Localizações */}
                    {localizacoes.filter(loc => !loc.ativa).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <Home className="h-5 w-5 mr-2 text-gray-600" />
                          Histórico de Localizações
                        </h3>
                        <div className="space-y-3">
                          {localizacoes.filter(loc => !loc.ativa).map((localizacao, index) => (
                            <div key={localizacao.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                  <span className="font-medium text-gray-800">{localizacao.tipo_localizacao}</span>
                                  <Badge variant="outline" className="text-xs">HISTÓRICO</Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openLocalizacaoDialog(localizacao)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLocalizacao(localizacao.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Período:</span>
                                  <p className="text-gray-800">
                                    {new Date(localizacao.data_inicio).toLocaleDateString('pt-PT')} - 
                                    {localizacao.data_fim ? new Date(localizacao.data_fim).toLocaleDateString('pt-PT') : 'Atual'}
                                  </p>
                                </div>
                                {localizacao.motivo_transferencia && (
                                  <div>
                                    <span className="text-gray-600">Motivo:</span>
                                    <p className="text-gray-800">{localizacao.motivo_transferencia}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responsabilidades">
            <Card>
              <CardHeader>
                <CardTitle>Responsabilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">Sistema de responsabilidades será implementado em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <CardTitle>Movimentos Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">Sistema financeiro será implementado em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de Intervenção - SIMPLIFICADO */}
      <Dialog open={intervencaoDialogOpen} onOpenChange={setIntervencaoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              {editingIntervencao ? 'Editar Intervenção' : 'Nova Intervenção Médica'}
            </DialogTitle>
            <DialogDescription className="text-blue-600">
              {editingIntervencao ? 'Editar informações da intervenção' : `Registar nova intervenção médica para ${animal?.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleIntervencaoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipo_intervencao_id" className="text-blue-700 font-medium">
                Tipo de Intervenção *
              </Label>
              <Select 
                value={intervencaoForm.tipo_intervencao_id} 
                onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, tipo_intervencao_id: value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecionar tipo" />
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
              <Label htmlFor="data_intervencao" className="text-blue-700 font-medium">
                Data da Intervenção *
              </Label>
              <Input
                id="data_intervencao"
                type="date"
                value={intervencaoForm.data_intervencao}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, data_intervencao: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="veterinario" className="text-blue-700">
                Veterinário
              </Label>
              <Input
                id="veterinario"
                value={intervencaoForm.veterinario}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, veterinario: e.target.value })}
                placeholder="Nome do veterinário"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <Label htmlFor="clinica_id" className="text-blue-700">
                Clínica Veterinária
              </Label>
              <Select 
                value={intervencaoForm.clinica_id} 
                onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, clinica_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecionar clínica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Outra clínica</SelectItem>
                  {clinicas.map((clinica) => (
                    <SelectItem key={clinica.id} value={clinica.id}>
                      <div className="flex items-center space-x-2">
                        <span>{clinica.nome}</span>
                        {clinica.tem_protocolo && (
                          <Badge variant="outline" className="text-xs text-green-600 ml-2">
                            PROTOCOLO
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="custo" className="text-blue-700">
                Custo (€)
              </Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                value={intervencaoForm.custo}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, custo: e.target.value })}
                placeholder="0.00"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes" className="text-blue-700">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={intervencaoForm.observacoes}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, observacoes: e.target.value })}
                placeholder="Detalhes da intervenção..."
                className="border-blue-200 focus:border-blue-400"
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="urgente"
                  type="checkbox"
                  checked={intervencaoForm.urgente}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, urgente: e.target.checked })}
                  className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="urgente" className="text-blue-700">
                  Intervenção Urgente
                </Label>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">
                  📝 <strong>Nota:</strong> A intervenção será automaticamente marcada como concluída na data especificada.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIntervencaoDialogOpen(false);
                  resetIntervencaoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingIntervencao ? 'Atualizar' : 'Registar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Evento - COMPLETO */}
      <Dialog open={eventoDialogOpen} onOpenChange={setEventoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-green-800">
              {editingEvento ? 'Editar Evento' : 'Novo Evento da Vida do Animal'}
            </DialogTitle>
            <DialogDescription className="text-green-600">
              {editingEvento ? 'Editar informações do evento' : `Registar novo marco na vida de ${animal?.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEventoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipo_evento" className="text-green-700 font-medium">
                Tipo de Evento *
              </Label>
              <Select 
                value={eventoForm.tipo_evento} 
                onValueChange={(value) => setEventoForm({ ...eventoForm, tipo_evento: value })}
              >
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Selecionar tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEventos.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.nome}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_evento" className="text-green-700 font-medium">
                Data do Evento *
              </Label>
              <Input
                id="data_evento"
                type="date"
                value={eventoForm.data_evento}
                onChange={(e) => setEventoForm({ ...eventoForm, data_evento: e.target.value })}
                className="border-green-200 focus:border-green-400"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="descricao" className="text-green-700">
                Descrição
              </Label>
              <Input
                id="descricao"
                value={eventoForm.descricao}
                onChange={(e) => setEventoForm({ ...eventoForm, descricao: e.target.value })}
                placeholder="Breve descrição do evento"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            
            <div>
              <Label htmlFor="voluntario_id" className="text-green-700">
                Voluntário Responsável
              </Label>
              <Select 
                value={eventoForm.voluntario_id} 
                onValueChange={(value) => setEventoForm({ ...eventoForm, voluntario_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Selecionar voluntário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum voluntário</SelectItem>
                  {voluntarios.map((voluntario) => (
                    <SelectItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="documento_referencia" className="text-green-700">
                Documento/Referência
              </Label>
              <Input
                id="documento_referencia"
                value={eventoForm.documento_referencia}
                onChange={(e) => setEventoForm({ ...eventoForm, documento_referencia: e.target.value })}
                placeholder="Número de processo, documento, etc."
                className="border-green-200 focus:border-green-400"
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes" className="text-green-700">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={eventoForm.observacoes}
                onChange={(e) => setEventoForm({ ...eventoForm, observacoes: e.target.value })}
                placeholder="Detalhes adicionais sobre o evento..."
                className="border-green-200 focus:border-green-400"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="importante"
                type="checkbox"
                checked={eventoForm.importante}
                onChange={(e) => setEventoForm({ ...eventoForm, importante: e.target.checked })}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <Label htmlFor="importante" className="text-green-700">
                Evento Importante (destaque especial)
              </Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEventoDialogOpen(false);
                  resetEventoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingEvento ? 'Atualizar' : 'Registar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Localização - COMPLETO */}
      <Dialog open={localizacaoDialogOpen} onOpenChange={setLocalizacaoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-purple-800">
              {editingLocalizacao ? 'Editar Localização' : 'Nova Transferência'}
            </DialogTitle>
            <DialogDescription className="text-purple-600">
              {editingLocalizacao ? 'Editar informações da localização' : `Registar nova localização para ${animal?.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLocalizacaoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tipo_localizacao" className="text-purple-700 font-medium">
                Tipo de Localização *
              </Label>
              <Select 
                value={localizacaoForm.tipo_localizacao} 
                onValueChange={(value) => setLocalizacaoForm({ ...localizacaoForm, tipo_localizacao: value })}
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Selecionar tipo de localização" />
                </SelectTrigger>
                <SelectContent>
                  {tiposLocalizacoes.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.nome}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_inicio" className="text-purple-700 font-medium">
                Data de Início *
              </Label>
              <Input
                id="data_inicio"
                type="date"
                value={localizacaoForm.data_inicio}
                onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, data_inicio: e.target.value })}
                className="border-purple-200 focus:border-purple-400"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endereco_detalhes" className="text-purple-700">
                Endereço/Detalhes
              </Label>
              <Input
                id="endereco_detalhes"
                value={localizacaoForm.endereco_detalhes}
                onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, endereco_detalhes: e.target.value })}
                placeholder="Endereço ou detalhes da localização"
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
            
            <div>
              <Label htmlFor="responsavel_id" className="text-purple-700">
                Voluntário Responsável
              </Label>
              <Select 
                value={localizacaoForm.responsavel_id} 
                onValueChange={(value) => setLocalizacaoForm({ ...localizacaoForm, responsavel_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum responsável</SelectItem>
                  {voluntarios.map((voluntario) => (
                    <SelectItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="motivo_transferencia" className="text-purple-700">
                Motivo da Transferência
              </Label>
              <Input
                id="motivo_transferencia"
                value={localizacaoForm.motivo_transferencia}
                onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, motivo_transferencia: e.target.value })}
                placeholder="Motivo da mudança de localização"
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes" className="text-purple-700">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={localizacaoForm.observacoes}
                onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, observacoes: e.target.value })}
                placeholder="Observações sobre a localização..."
                className="border-purple-200 focus:border-purple-400"
                rows={3}
              />
            </div>
            
            <div className="bg-purple-50 p-3 rounded-md">
              <p className="text-sm text-purple-700">
                📝 <strong>Nota:</strong> Esta nova localização será automaticamente marcada como ativa, e a localização anterior será desativada.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setLocalizacaoDialogOpen(false);
                  resetLocalizacaoForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingLocalizacao ? 'Atualizar' : 'Registar Transferência'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalDetail;