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
  Users,
  MapPin,
  Calendar,
  Phone,
  User,
  PawPrint,
  Cat,
  Dog,
  Loader2,
  AlertCircle,
  DollarSign,
  CalendarDays,
  Eye,
  UserMinus,
  UserPlus,
  Heart,
  Archive,
  ArchiveRestore,
  UserCheck,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Stethoscope,
  Home,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Animal, 
  Intervencao, 
  EventoAnimal, 
  LocalizacaoAnimal, 
  ResponsabilidadeAnimal,
  Voluntario, 
  TipoIntervencao 
} from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import LogotipoValentao from "@/components/LogotipoValentao";
import UserHeader from "@/components/UserHeader";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para intervenções
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [intervencaoDialogOpen, setIntervencaoDialogOpen] = useState(false);
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);
  const [intervencaoForm, setIntervencaoForm] = useState({
    tipo_intervencao_id: '',
    voluntario_id: '',
    data_intervencao: '',
    veterinario: '',
    clinica: '',
    observacoes: '',
    custo: '',
    proxima_data: '',
    urgente: false,
    concluida: false
  });

  // Estados para eventos
  const [eventos, setEventos] = useState<EventoAnimal[]>([]);
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoAnimal | null>(null);
  const [eventoForm, setEventoForm] = useState({
    tipo_evento: '',
    data_evento: '',
    titulo: '',
    descricao: '',
    observacoes: ''
  });

  // Estados para localizações
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoAnimal[]>([]);
  const [localizacaoDialogOpen, setLocalizacaoDialogOpen] = useState(false);
  const [editingLocalizacao, setEditingLocalizacao] = useState<LocalizacaoAnimal | null>(null);
  const [localizacaoForm, setLocalizacaoForm] = useState({
    tipo_localizacao: '',
    data_inicio: '',
    observacoes: ''
  });

  // Estados para responsabilidades
  const [responsabilidades, setResponsabilidades] = useState<ResponsabilidadeAnimal[]>([]);
  const [responsabilidadeDialogOpen, setResponsabilidadeDialogOpen] = useState(false);
  const [editingResponsabilidade, setEditingResponsabilidade] = useState<ResponsabilidadeAnimal | null>(null);
  const [responsabilidadeForm, setResponsabilidadeForm] = useState({
    voluntario_id: '',
    data_inicio: '',
    tipo_responsabilidade: '',
    observacoes: ''
  });

  // Função para carregar dados do animal
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

      // Carregar dados relacionados
      await Promise.all([
        fetchIntervencoes(),
        fetchEventos(),
        fetchLocalizacoes(),
        fetchResponsabilidades(),
        fetchTiposIntervencoes(),
        fetchVoluntarios()
      ]);

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

  // ========================================
  // FUNÇÕES DE INTERVENÇÕES
  // ========================================

  const fetchIntervencoes = async () => {
    if (!id) return;

    try {
      console.log('🏥 [INTERVENCOES] Carregando intervenções...');
      
      const { data, error } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipos_intervencoes (
            id,
            nome,
            cor
          ),
          voluntarios (
            id,
            nome
          )
        `)
        .eq('animal_id', id)
        .order('data_intervencao', { ascending: false });

      if (error) {
        console.error('❌ [INTERVENCOES] Erro ao carregar:', error);
        setIntervencoes([]);
        return;
      }

      console.log('✅ [INTERVENCOES] Carregadas:', data?.length || 0);
      setIntervencoes(data || []);
    } catch (error: any) {
      console.error('💥 [INTERVENCOES] Erro geral:', error);
      setIntervencoes([]);
    }
  };

  const fetchTiposIntervencoes = async () => {
    try {
      console.log('📋 [TIPOS] Carregando tipos de intervenções...');
      
      const { data, error } = await supabase
        .from('tipos_intervencoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ [TIPOS] Erro ao carregar:', error);
        setTiposIntervencoes([]);
        return;
      }

      console.log('✅ [TIPOS] Carregados:', data?.length || 0);
      setTiposIntervencoes(data || []);
    } catch (error: any) {
      console.error('💥 [TIPOS] Erro geral:', error);
      setTiposIntervencoes([]);
    }
  };

  const fetchVoluntarios = async () => {
    try {
      console.log('👥 [VOLUNTARIOS] Carregando voluntários...');
      
      const { data, error } = await supabase
        .from('voluntarios')
        .select('id, nome')
        .order('nome');

      if (error) {
        console.error('❌ [VOLUNTARIOS] Erro ao carregar:', error);
        setVoluntarios([]);
        return;
      }

      console.log('✅ [VOLUNTARIOS] Carregados:', data?.length || 0);
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('💥 [VOLUNTARIOS] Erro geral:', error);
      setVoluntarios([]);
    }
  };

  // ========================================
  // FUNÇÕES DE EVENTOS
  // ========================================

  const fetchEventos = async () => {
    if (!id) return;

    try {
      console.log('📅 [EVENTOS] Carregando eventos...');
      
      const { data, error } = await supabase
        .from('eventos_animal')
        .select('*')
        .eq('animal_id', id)
        .order('data_evento', { ascending: false });

      if (error) {
        console.error('❌ [EVENTOS] Erro ao carregar:', error);
        setEventos([]);
        return;
      }

      console.log('✅ [EVENTOS] Carregados:', data?.length || 0);
      setEventos(data || []);
    } catch (error: any) {
      console.error('💥 [EVENTOS] Erro geral:', error);
      setEventos([]);
    }
  };

  // ========================================
  // FUNÇÕES DE LOCALIZAÇÕES
  // ========================================

  const fetchLocalizacoes = async () => {
    if (!id) return;

    try {
      console.log('📍 [LOCALIZACOES] Carregando localizações...');
      
      const { data, error } = await supabase
        .from('localizacoes_animal')
        .select('*')
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      if (error) {
        console.error('❌ [LOCALIZACOES] Erro ao carregar:', error);
        setLocalizacoes([]);
        return;
      }

      console.log('✅ [LOCALIZACOES] Carregadas:', data?.length || 0);
      setLocalizacoes(data || []);
    } catch (error: any) {
      console.error('💥 [LOCALIZACOES] Erro geral:', error);
      setLocalizacoes([]);
    }
  };

  // ========================================
  // FUNÇÕES DE RESPONSABILIDADES
  // ========================================

  const fetchResponsabilidades = async () => {
    if (!id) return;

    try {
      console.log('👥 [RESPONSABILIDADES] Carregando responsabilidades...');
      
      const { data, error } = await supabase
        .from('responsabilidades_animal')
        .select(`
          *,
          voluntarios (
            id,
            nome
          )
        `)
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      if (error) {
        console.error('❌ [RESPONSABILIDADES] Erro ao carregar:', error);
        setResponsabilidades([]);
        return;
      }

      console.log('✅ [RESPONSABILIDADES] Carregadas:', data?.length || 0);
      setResponsabilidades(data || []);
    } catch (error: any) {
      console.error('💥 [RESPONSABILIDADES] Erro geral:', error);
      setResponsabilidades([]);
    }
  };

  // ========================================
  // GESTÃO DE INTERVENÇÕES
  // ========================================

  const resetIntervencaoForm = () => {
    setIntervencaoForm({
      tipo_intervencao_id: '',
      voluntario_id: '',
      data_intervencao: '',
      veterinario: '',
      clinica: '',
      observacoes: '',
      custo: '',
      proxima_data: '',
      urgente: false,
      concluida: false
    });
    setEditingIntervencao(null);
  };

  const openIntervencaoDialog = (intervencao?: Intervencao) => {
    if (intervencao) {
      setEditingIntervencao(intervencao);
      setIntervencaoForm({
        tipo_intervencao_id: intervencao.tipo_intervencao_id,
        voluntario_id: intervencao.voluntario_id || '',
        data_intervencao: intervencao.data_intervencao.split('T')[0],
        veterinario: intervencao.veterinario || '',
        clinica: intervencao.clinica || '',
        observacoes: intervencao.observacoes || '',
        custo: intervencao.custo?.toString() || '',
        proxima_data: intervencao.proxima_data ? intervencao.proxima_data.split('T')[0] : '',
        urgente: intervencao.urgente,
        concluida: intervencao.concluida
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
        voluntario_id: intervencaoForm.voluntario_id || null,
        data_intervencao: intervencaoForm.data_intervencao,
        veterinario: intervencaoForm.veterinario || null,
        clinica: intervencaoForm.clinica || null,
        observacoes: intervencaoForm.observacoes || null,
        custo: intervencaoForm.custo ? parseFloat(intervencaoForm.custo) : null,
        proxima_data: intervencaoForm.proxima_data || null,
        urgente: intervencaoForm.urgente,
        concluida: intervencaoForm.concluida
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
      fetchIntervencoes();
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

      fetchIntervencoes();
    } catch (error: any) {
      console.error('Erro ao eliminar intervenção:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao eliminar intervenção",
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

        {/* Abas de Informações Detalhadas */}
        <Tabs defaultValue="intervencoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="intervencoes">🏥 Intervenções</TabsTrigger>
            <TabsTrigger value="eventos">📅 Eventos</TabsTrigger>
            <TabsTrigger value="localizacoes">📍 Localizações</TabsTrigger>
            <TabsTrigger value="responsabilidades">👥 Responsabilidades</TabsTrigger>
            <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
          </TabsList>

          {/* Aba de Intervenções */}
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
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                              </span>
                              {intervencao.proxima_data && (
                                <span className="text-xs text-blue-600">
                                  Próxima: {new Date(intervencao.proxima_data).toLocaleDateString('pt-PT')}
                                </span>
                              )}
                            </div>
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
                          <TableCell>{intervencao.clinica || '-'}</TableCell>
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

          {/* Aba de Eventos */}
          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <CardTitle>Eventos da Vida do Animal</CardTitle>
                      <CardDescription>
                        Marcos importantes na vida do animal (nascimento, adoção, retorno, etc.)
                      </CardDescription>
                    </div>
                  </div>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => {
                        toast({
                          title: "🚧 Em Desenvolvimento",
                          description: "Funcionalidade de eventos será implementada em breve",
                        });
                      }}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhum evento registrado</p>
                  <p className="text-sm mb-4">Funcionalidade em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Localizações */}
          <TabsContent value="localizacoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-purple-600" />
                    <div>
                      <CardTitle>Localizações do Animal</CardTitle>
                      <CardDescription>
                        Histórico de localizações - apenas uma localização ativa por vez
                      </CardDescription>
                    </div>
                  </div>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => {
                        toast({
                          title: "🚧 Em Desenvolvimento",
                          description: "Funcionalidade de localizações será implementada em breve",
                        });
                      }}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Localização
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhuma localização registrada</p>
                  <p className="text-sm mb-4">Funcionalidade em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Responsabilidades */}
          <TabsContent value="responsabilidades">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                    <CardTitle>Responsabilidades</CardTitle>
                  </div>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => {
                        toast({
                          title: "🚧 Em Desenvolvimento",
                          description: "Funcionalidade de responsabilidades será implementada em breve",
                        });
                      }}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Responsabilidade
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhuma responsabilidade registrada</p>
                  <p className="text-sm mb-4">Funcionalidade em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Financeiro */}
          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                    <CardTitle>Movimentos Financeiros</CardTitle>
                  </div>
                  <Button
                    onClick={() => {
                      toast({
                        title: "🚧 Em Desenvolvimento",
                        description: "Funcionalidade financeira será implementada em breve",
                      });
                    }}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Associar Movimento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhum movimento financeiro</p>
                  <p className="text-sm mb-4">Funcionalidade em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de Intervenção */}
      <Dialog open={intervencaoDialogOpen} onOpenChange={setIntervencaoDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              {editingIntervencao ? 'Editar Intervenção' : 'Nova Intervenção Médica'}
            </DialogTitle>
            <DialogDescription className="text-blue-600">
              {editingIntervencao ? 'Editar informações da intervenção' : `Registar nova intervenção médica para ${animal?.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleIntervencaoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="clinica" className="text-blue-700">
                  Clínica
                </Label>
                <Input
                  id="clinica"
                  value={intervencaoForm.clinica}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, clinica: e.target.value })}
                  placeholder="Nome da clínica"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="proxima_data" className="text-blue-700">
                  Próxima Consulta
                </Label>
                <Input
                  id="proxima_data"
                  type="date"
                  value={intervencaoForm.proxima_data}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, proxima_data: e.target.value })}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="voluntario_id" className="text-blue-700">
                Voluntário Responsável
              </Label>
              <Select 
                value={intervencaoForm.voluntario_id} 
                onValueChange={(value) => setIntervencaoForm({ ...intervencaoForm, voluntario_id: value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecionar voluntário (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum voluntário</SelectItem>
                  {voluntarios.map((voluntario) => (
                    <SelectItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="observacoes" className="text-blue-700">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={intervencaoForm.observacoes}
                onChange={(e) => setIntervencaoForm({ ...intervencaoForm, observacoes: e.target.value })}
                placeholder="Detalhes da intervenção, diagnóstico, tratamento..."
                className="border-blue-200 focus:border-blue-400"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-6">
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
              
              <div className="flex items-center space-x-2">
                <input
                  id="concluida"
                  type="checkbox"
                  checked={intervencaoForm.concluida}
                  onChange={(e) => setIntervencaoForm({ ...intervencaoForm, concluida: e.target.checked })}
                  className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="concluida" className="text-blue-700">
                  Intervenção Concluída
                </Label>
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
                {editingIntervencao ? 'Atualizar' : 'Registar'} Intervenção
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalDetail;