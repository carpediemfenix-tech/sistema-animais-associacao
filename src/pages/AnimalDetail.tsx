import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Calendar, Activity, FileText, MapPin, Heart, Phone, User, Plus, Trash2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, Evento, Localizacao, TipoIntervencao, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modais
  const [intervencaoDialogOpen, setIntervencaoDialogOpen] = useState(false);
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [localizacaoDialogOpen, setLocalizacaoDialogOpen] = useState(false);
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [editingLocalizacao, setEditingLocalizacao] = useState<Localizacao | null>(null);

  // Estados para formulários
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

  const [localizacaoForm, setLocalizacaoForm] = useState({
    tipo_localizacao: "",
    endereco: "",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    observacoes: ""
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

      // Buscar dados do animal
      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (animalError) throw animalError;
      setAnimal(animalData);

      // Buscar intervenções
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipo_intervencao:tipos_intervencoes(nome, cor),
          voluntario:voluntarios(nome)
        `)
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (intervencoesError) throw intervencoesError;
      setIntervencoes(intervencoesData || []);

      // Buscar eventos
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('*')
        .eq('animal_id', id)
        .order('data_evento', { ascending: false });

      if (eventosError) throw eventosError;
      setEventos(eventosData || []);

      // Buscar localizações
      const { data: localizacoesData, error: localizacoesError } = await supabase
        .from('localizacoes')
        .select('*')
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      if (localizacoesError) throw localizacoesError;
      setLocalizacoes(localizacoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados do animal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do animal",
        variant: "destructive",
      });
      navigate('/animais');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposIntervencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_intervencoes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTiposIntervencoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tipos de intervenções:', error);
    }
  };

  const fetchVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar voluntários:', error);
    }
  };

  // Funções para Intervenções
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
      console.error('Erro ao salvar intervenção:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a intervenção",
        variant: "destructive",
      });
    }
  };

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

  // Funções para Eventos
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
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o evento",
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

  // Funções para Localizações
  const handleLocalizacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localizacaoForm.tipo_localizacao || !localizacaoForm.endereco || !localizacaoForm.data_inicio) {
      toast({
        title: "Campos obrigatórios",
        description: "Tipo, endereço e data de início são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSubmit = {
        animal_id: id,
        tipo_localizacao: localizacaoForm.tipo_localizacao,
        endereco: localizacaoForm.endereco,
        data_inicio: localizacaoForm.data_inicio,
        data_fim: localizacaoForm.data_fim || null,
        observacoes: localizacaoForm.observacoes || null
      };

      if (editingLocalizacao) {
        const { error } = await supabase
          .from('localizacoes')
          .update(dataToSubmit)
          .eq('id', editingLocalizacao.id);

        if (error) throw error;

        toast({
          title: "Localização atualizada",
          description: "A localização foi atualizada com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('localizacoes')
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: "Localização adicionada",
          description: "A nova localização foi registada com sucesso",
        });
      }

      setLocalizacaoDialogOpen(false);
      setEditingLocalizacao(null);
      resetLocalizacaoForm();
      fetchAnimalData();

    } catch (error: any) {
      console.error('Erro ao salvar localização:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a localização",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLocalizacao = async (localizacaoId: string) => {
    try {
      const { error } = await supabase
        .from('localizacoes')
        .delete()
        .eq('id', localizacaoId);

      if (error) throw error;

      toast({
        title: "Localização eliminada",
        description: "A localização foi eliminada com sucesso",
      });

      fetchAnimalData();
    } catch (error: any) {
      console.error('Erro ao eliminar localização:', error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a localização",
        variant: "destructive",
      });
    }
  };

  // Funções auxiliares
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
      tipo_localizacao: "",
      endereco: "",
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: "",
      observacoes: ""
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

  const openEditLocalizacao = (localizacao: Localizacao) => {
    setEditingLocalizacao(localizacao);
    setLocalizacaoForm({
      tipo_localizacao: localizacao.tipo_localizacao || "",
      endereco: localizacao.endereco || "",
      data_inicio: localizacao.data_inicio || "",
      data_fim: localizacao.data_fim || "",
      observacoes: localizacao.observacoes || ""
    });
    setLocalizacaoDialogOpen(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar dados do animal...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Animal não encontrado</h2>
          <p className="text-gray-600 mb-4">O animal solicitado não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/animais">Voltar à Lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/animais">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Lista
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/images/BackgroundEraser_20250411_205630024.png" 
                  alt="Valentão ao Resgate" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{animal.nome}</h1>
                  <p className="text-sm text-gray-500">{animal.numero_processo}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/animal/${id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações Básicas */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{animal.nome}</CardTitle>
                <CardDescription>
                  {animal.especie} • {animal.raca || "Raça não especificada"} • {animal.sexo}
                </CardDescription>
              </div>
              <Badge className={getEstadoBadgeColor(animal.estado || "")}>
                {animal.estado}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Idade: {animal.idade_estimada ? `${animal.idade_estimada} meses` : "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Peso: {animal.peso ? `${animal.peso} kg` : "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Cor: {animal.cor || "N/A"}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Encontrado: {animal.local_encontrado || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Entrada: {formatDate(animal.data_entrada)}</span>
                </div>
                {animal.transponder && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Chip: {animal.transponder}</span>
                  </div>
                )}
              </div>

              {animal.estado === 'Adotado' && (
                <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Informações de Adoção
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-green-600" />
                      <span>Data: {formatDate(animal.data_adocao)}</span>
                    </div>
                    {animal.adotante_nome && (
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-green-600" />
                        <span>Adotante: {animal.adotante_nome}</span>
                      </div>
                    )}
                    {animal.adotante_contacto && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-green-600" />
                        <span>Contacto: {animal.adotante_contacto}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {animal.caracteristicas_fisicas && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Características Físicas</h4>
                <p className="text-sm text-gray-600">{animal.caracteristicas_fisicas}</p>
              </div>
            )}

            {animal.observacoes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Observações</h4>
                <p className="text-sm text-blue-700">{animal.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs com Informações Detalhadas */}
        <Tabs defaultValue="intervencoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="intervencoes" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Intervenções ({intervencoes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="eventos" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Eventos ({eventos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="localizacoes" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Localizações ({localizacoes.length})</span>
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
                      Histórico de procedimentos médicos e veterinários
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
                    <DialogContent className="max-w-2xl">
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
                              value={intervencaoForm.custo}
                              onChange={(e) => setIntervencaoForm(prev => ({...prev, custo: e.target.value}))}
                              placeholder="0.00"
                            />
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
                          <Label htmlFor="observacoes">Observações</Label>
                          <Textarea
                            id="observacoes"
                            value={intervencaoForm.observacoes}
                            onChange={(e) => setIntervencaoForm(prev => ({...prev, observacoes: e.target.value}))}
                            placeholder="Detalhes da intervenção, medicação, recomendações..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIntervencaoDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
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
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
                              <Badge 
                                variant="outline" 
                                style={{ 
                                  backgroundColor: intervencao.tipo_intervencao?.cor + '20',
                                  borderColor: intervencao.tipo_intervencao?.cor,
                                  color: intervencao.tipo_intervencao?.cor
                                }}
                              >
                                {intervencao.tipo_intervencao?.nome || "Tipo não especificado"}
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
                              {intervencao.voluntario?.nome && (
                                <div>Responsável: {intervencao.voluntario.nome}</div>
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
                      Histórico de eventos importantes na vida do animal
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
                                <SelectItem value="Chegada">Chegada</SelectItem>
                                <SelectItem value="Transferência">Transferência</SelectItem>
                                <SelectItem value="Adoção">Adoção</SelectItem>
                                <SelectItem value="Fuga">Fuga</SelectItem>
                                <SelectItem value="Recuperação">Recuperação</SelectItem>
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
                          <Label htmlFor="descricao">Descrição *</Label>
                          <Input
                            id="descricao"
                            value={eventoForm.descricao}
                            onChange={(e) => setEventoForm(prev => ({...prev, descricao: e.target.value}))}
                            placeholder="Breve descrição do evento"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="observacoes_evento">Observações</Label>
                          <Textarea
                            id="observacoes_evento"
                            value={eventoForm.observacoes}
                            onChange={(e) => setEventoForm(prev => ({...prev, observacoes: e.target.value}))}
                            placeholder="Detalhes adicionais sobre o evento..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setEventoDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
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
                            
                            <h4 className="font-medium text-gray-900 mb-1">
                              {evento.descricao}
                            </h4>

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

          {/* Tab Localizações */}
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
                          <Label htmlFor="tipo_localizacao">Tipo de Localização *</Label>
                          <Select 
                            value={localizacaoForm.tipo_localizacao} 
                            onValueChange={(value) => setLocalizacaoForm(prev => ({...prev, tipo_localizacao: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Abrigo">Abrigo</SelectItem>
                              <SelectItem value="Família Acolhimento">Família de Acolhimento</SelectItem>
                              <SelectItem value="Clínica Veterinária">Clínica Veterinária</SelectItem>
                              <SelectItem value="Casa Adotiva">Casa Adotiva</SelectItem>
                              <SelectItem value="Quarentena">Quarentena</SelectItem>
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
                            <Label htmlFor="data_inicio">Data de Início *</Label>
                            <Input
                              id="data_inicio"
                              type="date"
                              value={localizacaoForm.data_inicio}
                              onChange={(e) => setLocalizacaoForm(prev => ({...prev, data_inicio: e.target.value}))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="data_fim">Data de Fim</Label>
                            <Input
                              id="data_fim"
                              type="date"
                              value={localizacaoForm.data_fim}
                              onChange={(e) => setLocalizacaoForm(prev => ({...prev, data_fim: e.target.value}))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="observacoes_localizacao">Observações</Label>
                          <Textarea
                            id="observacoes_localizacao"
                            value={localizacaoForm.observacoes}
                            onChange={(e) => setLocalizacaoForm(prev => ({...prev, observacoes: e.target.value}))}
                            placeholder="Informações adicionais sobre a localização..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setLocalizacaoDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
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
                                {localizacao.tipo_localizacao}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(localizacao.data_inicio)}
                                {localizacao.data_fim && ` - ${formatDate(localizacao.data_fim)}`}
                                {!localizacao.data_fim && " - Atual"}
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