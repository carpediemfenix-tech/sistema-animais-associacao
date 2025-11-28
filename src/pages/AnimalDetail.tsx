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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Intervencao, Evento, Localizacao, Voluntario, TipoIntervencao, ResponsabilidadeVoluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import LogotipoValentao from "@/components/LogotipoValentao";
import UserHeader from "@/components/UserHeader";

const AnimalDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [responsabilidades, setResponsabilidades] = useState<ResponsabilidadeVoluntario[]>([]);
  const [tiposIntervencoes, setTiposIntervencoes] = useState<TipoIntervencao[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [tiposEventos, setTiposEventos] = useState<any[]>([]);
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<any[]>([]);
  const [grupoInfo, setGrupoInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados dos modais
  const [intervencaoDialogOpen, setIntervencaoDialogOpen] = useState(false);
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [localizacaoDialogOpen, setLocalizacaoDialogOpen] = useState(false);
  const [responsabilidadeDialogOpen, setResponsabilidadeDialogOpen] = useState(false);
  
  // 📦 EKO: Estados para arquivamento
  const [arquivarDialogOpen, setArquivarDialogOpen] = useState(false);
  const [arquivarForm, setArquivarForm] = useState({
    motivo: "",
    observacoes: ""
  });

  // 💰 EKO: Estados para movimentos financeiros
  const [movimentosFinanceiros, setMovimentosFinanceiros] = useState<any[]>([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);

  // Estados de edição
  const [editingIntervencao, setEditingIntervencao] = useState<Intervencao | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [editingLocalizacao, setEditingLocalizacao] = useState<Localizacao | null>(null);
  const [editingResponsabilidade, setEditingResponsabilidade] = useState<ResponsabilidadeVoluntario | null>(null);

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

  const [localizacaoForm, setLocalizacaoForm] = useState({
    localizacao: "",
    endereco: "",
    data_entrada: new Date().toISOString().split('T')[0],
    data_saida: "",
    observacoes: "",
    ativo: true
  });

  // 👥 NOVO: Estado do formulário de responsabilidade
  const [responsabilidadeForm, setResponsabilidadeForm] = useState({
    voluntario_id: "",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    motivo_mudanca: "",
    observacoes: ""
  });

  // Função para buscar dados do animal
  const fetchAnimalData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar dados do animal com informações do voluntário responsável e grupo
      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select(`
          *,
          voluntarios:voluntario_responsavel_id (
            id,
            nome,
            email,
            telefone
          ),
          grupos (
            id,
            nome,
            tipo
          )
        `)
        .eq('id', id)
        .single();

      if (animalError) throw animalError;
      setAnimal(animalData);

      // Buscar grupo info se existir
      if (animalData.grupo_id) {
        setGrupoInfo(animalData.grupos);
      }

      // Buscar intervenções
      const { data: intervencoesData, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipos_intervencoes (nome),
          voluntarios (nome)
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
        .order('data_entrada', { ascending: false });

      if (localizacoesError) throw localizacoesError;
      setLocalizacoes(localizacoesData || []);

      // 👥 NOVO: Buscar responsabilidades
      const { data: responsabilidadesData, error: responsabilidadesError } = await supabase
        .from('responsabilidades_voluntarios')
        .select(`
          *,
          voluntarios (
            nome,
            email,
            telefone
          )
        `)
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      if (responsabilidadesError) throw responsabilidadesError;
      setResponsabilidades(responsabilidadesData || []);

    } catch (error: any) {
      console.error('💥 [ANIMAL] Erro ao carregar dados:', error);
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

  // Buscar dados auxiliares
  const fetchAuxiliaryData = async () => {
    try {
      // Buscar tipos de intervenções
      const { data: tiposData, error: tiposError } = await supabase
        .from('tipos_intervencoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!tiposError) setTiposIntervencoes(tiposData || []);

      // Buscar voluntários
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!voluntariosError) setVoluntarios(voluntariosData || []);

      // Buscar tipos de eventos
      const { data: tiposEventosData, error: tiposEventosError } = await supabase
        .from('tipos_eventos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!tiposEventosError) setTiposEventos(tiposEventosData || []);

      // Buscar tipos de localizações
      const { data: tiposLocalizacoesData, error: tiposLocalizacoesError } = await supabase
        .from('tipos_localizacoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (!tiposLocalizacoesError) setTiposLocalizacoes(tiposLocalizacoesData || []);

    } catch (error: any) {
      console.error('💥 [AUXILIAR] Erro ao carregar dados auxiliares:', error);
    }
  };

  // 💰 EKO: Função para buscar movimentos financeiros (SISTEMA ROBUSTO)
  const fetchMovimentosFinanceiros = async () => {
    if (!id) return;
    
    try {
      console.log('💰 [ANIMAL] Carregando movimentos financeiros para animal:', id);
      
      // Usar função SQL para buscar movimentos do animal
      const { data: movimentos, error: movimentosError } = await supabase
        .rpc('get_movimentos_animal', { animal_uuid: id });

      if (movimentosError) {
        console.error('❌ [ANIMAL] Erro ao carregar movimentos:', movimentosError);
        setMovimentosFinanceiros([]);
        return;
      }

      console.log('✅ [ANIMAL] Movimentos carregados:', movimentos?.length || 0);
      setMovimentosFinanceiros(movimentos || []);
      
      // Usar função SQL para calcular resumo
      const { data: resumo, error: resumoError } = await supabase
        .rpc('get_resumo_animal', { animal_uuid: id })
        .single();

      if (!resumoError && resumo) {
        setTotalReceitas(parseFloat(resumo.total_receitas) || 0);
        setTotalDespesas(parseFloat(resumo.total_despesas) || 0);
      } else {
        setTotalReceitas(0);
        setTotalDespesas(0);
      }
      
    } catch (error: any) {
      console.error('💥 [ANIMAL] Erro ao buscar movimentos financeiros:', error);
    }
  };

  // 👥 NOVA FUNÇÃO: Adicionar responsabilidade
  const handleResponsabilidadeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responsabilidadeForm.voluntario_id || !responsabilidadeForm.data_inicio) {
      toast({
        title: "❌ Erro",
        description: "Voluntário e data de início são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Se estamos editando
      if (editingResponsabilidade) {
        const { error } = await supabase
          .from('responsabilidades_voluntarios')
          .update({
            voluntario_id: responsabilidadeForm.voluntario_id,
            data_inicio: responsabilidadeForm.data_inicio,
            data_fim: responsabilidadeForm.data_fim || null,
            motivo_mudanca: responsabilidadeForm.motivo_mudanca,
            observacoes: responsabilidadeForm.observacoes,
            ativo: !responsabilidadeForm.data_fim, // Se tem data_fim, não está ativo
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResponsabilidade.id);

        if (error) throw error;

        toast({
          title: "✅ Responsabilidade atualizada",
          description: "Responsabilidade foi atualizada com sucesso",
        });
      } else {
        // Adicionar nova responsabilidade
        // Primeiro, terminar responsabilidade ativa atual (se existir)
        const responsabilidadeAtiva = responsabilidades.find(r => r.ativo && !r.data_fim);
        
        if (responsabilidadeAtiva) {
          await supabase
            .from('responsabilidades_voluntarios')
            .update({
              data_fim: responsabilidadeForm.data_inicio,
              ativo: false,
              motivo_mudanca: 'Transferência de responsabilidade',
              updated_at: new Date().toISOString()
            })
            .eq('id', responsabilidadeAtiva.id);
        }

        // Inserir nova responsabilidade
        const { error } = await supabase
          .from('responsabilidades_voluntarios')
          .insert([{
            animal_id: id,
            voluntario_id: responsabilidadeForm.voluntario_id,
            data_inicio: responsabilidadeForm.data_inicio,
            data_fim: responsabilidadeForm.data_fim || null,
            motivo_mudanca: responsabilidadeForm.motivo_mudanca || 'Nova responsabilidade',
            observacoes: responsabilidadeForm.observacoes,
            ativo: !responsabilidadeForm.data_fim
          }]);

        if (error) throw error;

        // Atualizar o voluntário responsável na tabela animais
        await supabase
          .from('animais')
          .update({
            voluntario_responsavel_id: responsabilidadeForm.voluntario_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        toast({
          title: "✅ Responsabilidade adicionada",
          description: "Nova responsabilidade foi registada com sucesso",
        });
      }

      // Resetar formulário e fechar modal
      setResponsabilidadeDialogOpen(false);
      setEditingResponsabilidade(null);
      setResponsabilidadeForm({
        voluntario_id: "",
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: "",
        motivo_mudanca: "",
        observacoes: ""
      });

      // Recarregar dados
      await fetchAnimalData();

    } catch (error: any) {
      console.error('💥 [RESPONSABILIDADE] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível salvar a responsabilidade",
        variant: "destructive",
      });
    }
  };

  // 👥 NOVA FUNÇÃO: Eliminar responsabilidade
  const handleDeleteResponsabilidade = async (responsabilidadeId: string) => {
    try {
      const { error } = await supabase
        .from('responsabilidades_voluntarios')
        .delete()
        .eq('id', responsabilidadeId);

      if (error) throw error;

      toast({
        title: "✅ Responsabilidade eliminada",
        description: "Responsabilidade foi eliminada com sucesso",
      });

      await fetchAnimalData();
    } catch (error: any) {
      console.error('💥 [DELETE RESPONSABILIDADE] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível eliminar a responsabilidade",
        variant: "destructive",
      });
    }
  };

  // 👥 NOVA FUNÇÃO: Abrir edição de responsabilidade
  const openEditResponsabilidade = (responsabilidade: ResponsabilidadeVoluntario) => {
    setEditingResponsabilidade(responsabilidade);
    setResponsabilidadeForm({
      voluntario_id: responsabilidade.voluntario_id,
      data_inicio: responsabilidade.data_inicio,
      data_fim: responsabilidade.data_fim || "",
      motivo_mudanca: responsabilidade.motivo_mudanca || "",
      observacoes: responsabilidade.observacoes || ""
    });
    setResponsabilidadeDialogOpen(true);
  };

  // Função para resetar formulário de responsabilidade
  const resetResponsabilidadeForm = () => {
    setResponsabilidadeForm({
      voluntario_id: "",
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: "",
      motivo_mudanca: "",
      observacoes: ""
    });
    setEditingResponsabilidade(null);
  };

  // 📦 EKO: FUNÇÕES DE ARQUIVAMENTO
  const handleArquivar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!arquivarForm.motivo) {
      toast({
        title: "❌ Erro",
        description: "Motivo do arquivamento é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const confirmArchive = confirm(
      `Tem certeza que deseja arquivar o animal "${animal?.nome}"?\n\n` +
      `Motivo: ${arquivarForm.motivo}\n` +
      `Observações: ${arquivarForm.observacoes || 'Nenhuma'}\n\n` +
      `Esta ação irá remover o animal da gestão normal.`
    );
    
    if (!confirmArchive) return;

    try {
      console.log('📦 [ARQUIVO] Arquivando animal:', animal?.nome);

      const { error } = await supabase
        .from('animais')
        .update({
          arquivado: true,
          data_arquivamento: new Date().toISOString(),
          motivo_arquivamento: `${arquivarForm.motivo}${arquivarForm.observacoes ? ` - ${arquivarForm.observacoes}` : ''}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', animal?.id);

      if (error) {
        console.error('❌ [ARQUIVO] Erro ao arquivar:', error);
        throw error;
      }

      toast({
        title: "✅ Animal arquivado",
        description: `${animal?.nome} foi arquivado com sucesso`,
      });

      // Fechar modal e recarregar dados
      setArquivarDialogOpen(false);
      resetArquivarForm();
      await fetchAnimalData();
      
    } catch (error: any) {
      console.error('💥 [ARQUIVO] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível arquivar o animal",
        variant: "destructive",
      });
    }
  };

  const handleDesarquivar = async () => {
    const confirmRestore = confirm(
      `Tem certeza que deseja desarquivar o animal "${animal?.nome}"?\n\n` +
      `O animal voltará a aparecer na gestão normal de animais.`
    );
    
    if (!confirmRestore) return;

    try {
      console.log('📤 [ARQUIVO] Desarquivando animal:', animal?.nome);

      const { error } = await supabase
        .from('animais')
        .update({
          arquivado: false,
          data_arquivamento: null,
          motivo_arquivamento: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', animal?.id);

      if (error) {
        console.error('❌ [ARQUIVO] Erro ao desarquivar:', error);
        throw error;
      }

      toast({
        title: "✅ Animal desarquivado",
        description: `${animal?.nome} foi desarquivado com sucesso`,
      });

      // Recarregar dados
      await fetchAnimalData();
      
    } catch (error: any) {
      console.error('💥 [ARQUIVO] Erro:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível desarquivar o animal",
        variant: "destructive",
      });
    }
  };

  const resetArquivarForm = () => {
    setArquivarForm({
      motivo: "",
      observacoes: ""
    });
  };

  // Funções auxiliares
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'Adotado':
        return <Badge className="bg-blue-100 text-blue-800">Adotado</Badge>;
      case 'Óbito':
        return <Badge className="bg-gray-100 text-gray-800">Óbito</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{estado}</Badge>;
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchAnimalData();
    fetchAuxiliaryData();
    fetchMovimentosFinanceiros(); // 💰 EKO: Carregar movimentos financeiros
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
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar animal</h2>
          <p className="text-gray-600 mb-4">{error || "Animal não encontrado"}</p>
          <Button asChild>
            <Link to="/animais">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Lista
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <UserHeader 
        title={`${animal.nome} - Ficha Completa`}
        description={`Processo ${animal.numero_processo} • ${animal.especie} • ${animal.sexo}`}
      />
      
      {/* ✅ EKO: BOTÃO DE REGRESSO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/animais">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Animais
          </Link>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card Principal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <PawPrint className="h-6 w-6 mr-2 text-blue-600" />
                    {animal.nome}
                    {animal.arquivado && (
                      <Badge className="ml-3 bg-gray-100 text-gray-800">
                        <Archive className="h-3 w-3 mr-1" />
                        Arquivado
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Processo: {animal.numero_processo} • {getEstadoBadge(animal.estado)}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {animal.url_fotografia && (
                    <img 
                      src={animal.url_fotografia} 
                      alt={animal.nome}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                    />
                  )}
                  
                  {/* 📦 EKO: BOTÕES DE ARQUIVAMENTO */}
                  {hasPermission('admin') && (
                    <div className="flex space-x-2 mt-2">
                      {animal.arquivado ? (
                        <Button
                          onClick={handleDesarquivar}
                          variant="outline"
                          size="sm"
                          className="border-green-200 hover:bg-green-50"
                        >
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Desarquivar
                        </Button>
                      ) : (
                        <Dialog open={arquivarDialogOpen} onOpenChange={setArquivarDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 hover:bg-red-50"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Espécie</p>
                  <p className="text-lg">{animal.especie}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sexo</p>
                  <p className="text-lg">{animal.sexo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Raça</p>
                  <p className="text-lg">{animal.raca || 'Não especificada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Idade</p>
                  <p className="text-lg">{animal.idade_estimada ? `${animal.idade_estimada} meses` : 'Não especificada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Entrada</p>
                  <p className="text-lg">{formatDate(animal.data_entrada)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Peso</p>
                  <p className="text-lg">{animal.peso ? `${animal.peso} kg` : 'Não especificado'}</p>
                </div>
              </div>
              
              {animal.observacoes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Observações</p>
                  <p className="text-gray-700 mt-1">{animal.observacoes}</p>
                </div>
              )}
              
              {/* 📦 EKO: INFORMAÇÕES DE ARQUIVAMENTO */}
              {animal.arquivado && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Archive className="h-4 w-4 mr-2 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Informações do Arquivamento</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {animal.data_arquivamento && (
                      <div>
                        <span className="text-gray-500">Data:</span>
                        <span className="ml-2 text-gray-700">{formatDate(animal.data_arquivamento)}</span>
                      </div>
                    )}
                    {animal.motivo_arquivamento && (
                      <div>
                        <span className="text-gray-500">Motivo:</span>
                        <span className="ml-2 text-gray-700">{animal.motivo_arquivamento}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Responsável e Grupo */}
          <div className="space-y-6">
            {/* Voluntário Responsável */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                  Voluntário Responsável
                </CardTitle>
              </CardHeader>
              <CardContent>
                {animal.voluntarios ? (
                  <div>
                    <p className="font-medium">{animal.voluntarios.nome}</p>
                    <p className="text-sm text-gray-600">{animal.voluntarios.email}</p>
                    <p className="text-sm text-gray-600">{animal.voluntarios.telefone}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Sem responsável atribuído</p>
                )}
              </CardContent>
            </Card>

            {/* Grupo */}
            {grupoInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Grupo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{grupoInfo.nome}</p>
                  <Badge className="mt-2">
                    {grupoInfo.tipo === 'Matilha' && <Dog className="h-3 w-3 mr-1" />}
                    {grupoInfo.tipo === 'Colónia' && <Cat className="h-3 w-3 mr-1" />}
                    {grupoInfo.tipo === 'Sócios' && <Users className="h-3 w-3 mr-1" />}
                    {grupoInfo.tipo}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs com Histórico */}
        <Tabs defaultValue="intervencoes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="intervencoes">Intervenções ({intervencoes.length})</TabsTrigger>
            <TabsTrigger value="eventos">Eventos ({eventos.length})</TabsTrigger>
            <TabsTrigger value="localizacoes">Localizações ({localizacoes.length})</TabsTrigger>
            <TabsTrigger value="responsabilidades">Responsabilidades ({responsabilidades.length})</TabsTrigger>
            <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
          </TabsList>

          {/* 👥 NOVA TAB: Responsabilidades */}
          <TabsContent value="responsabilidades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Histórico de Responsabilidades</h3>
              {hasPermission('create') && (
                <Dialog open={responsabilidadeDialogOpen} onOpenChange={setResponsabilidadeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetResponsabilidadeForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Responsabilidade
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingResponsabilidade ? 'Editar Responsabilidade' : 'Nova Responsabilidade'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingResponsabilidade 
                          ? 'Editar dados da responsabilidade selecionada'
                          : 'Adicionar novo voluntário responsável. O responsável atual será automaticamente terminado.'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResponsabilidadeSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="voluntario_id">Voluntário *</Label>
                        <Select 
                          value={responsabilidadeForm.voluntario_id} 
                          onValueChange={(value) => setResponsabilidadeForm({...responsabilidadeForm, voluntario_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar voluntário" />
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

                      <div>
                        <Label htmlFor="data_inicio">Data de Início *</Label>
                        <Input
                          id="data_inicio"
                          type="date"
                          value={responsabilidadeForm.data_inicio}
                          onChange={(e) => setResponsabilidadeForm({...responsabilidadeForm, data_inicio: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="data_fim">Data de Fim</Label>
                        <Input
                          id="data_fim"
                          type="date"
                          value={responsabilidadeForm.data_fim}
                          onChange={(e) => setResponsabilidadeForm({...responsabilidadeForm, data_fim: e.target.value})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="motivo_mudanca">Motivo</Label>
                        <Select 
                          value={responsabilidadeForm.motivo_mudanca} 
                          onValueChange={(value) => setResponsabilidadeForm({...responsabilidadeForm, motivo_mudanca: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nova responsabilidade">Nova responsabilidade</SelectItem>
                            <SelectItem value="Transferência">Transferência</SelectItem>
                            <SelectItem value="Especialização">Especialização</SelectItem>
                            <SelectItem value="Disponibilidade">Disponibilidade</SelectItem>
                            <SelectItem value="Adoção">Adoção</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={responsabilidadeForm.observacoes}
                          onChange={(e) => setResponsabilidadeForm({...responsabilidadeForm, observacoes: e.target.value})}
                          placeholder="Observações sobre a responsabilidade..."
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setResponsabilidadeDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingResponsabilidade ? 'Atualizar' : 'Adicionar'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Data Fim</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      {hasPermission('update') && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responsabilidades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Nenhuma responsabilidade registada
                        </TableCell>
                      </TableRow>
                    ) : (
                      responsabilidades.map((responsabilidade) => (
                        <TableRow key={responsabilidade.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{responsabilidade.voluntarios?.nome}</p>
                              <p className="text-sm text-gray-500">{responsabilidade.voluntarios?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(responsabilidade.data_inicio)}</TableCell>
                          <TableCell>
                            {responsabilidade.data_fim ? formatDate(responsabilidade.data_fim) : (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{responsabilidade.motivo_mudanca || '-'}</TableCell>
                          <TableCell>
                            {responsabilidade.ativo ? (
                              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Terminado</Badge>
                            )}
                          </TableCell>
                          {hasPermission('update') && (
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditResponsabilidade(responsabilidade)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                {hasPermission('delete') && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Eliminar responsabilidade?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta ação não pode ser desfeita. A responsabilidade será permanentemente eliminada.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteResponsabilidade(responsabilidade.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras tabs existentes (simplificadas para este exemplo) */}
          <TabsContent value="intervencoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Intervenções Médicas</CardTitle>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => {
                        alert('Funcionalidade Nova Intervenção em desenvolvimento');
                      }}
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
                <p className="text-gray-500">Lista de intervenções será mantida igual...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eventos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Eventos</CardTitle>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => {
                        alert('Funcionalidade Novo Evento em desenvolvimento');
                      }}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Lista de eventos será mantida igual...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localizacoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Localizações</CardTitle>
                  {hasPermission('create') && (
                    <Button
                      onClick={() => {
                        alert('Funcionalidade Nova Localização em desenvolvimento');
                      }}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Localização
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Lista de localizações será mantida igual...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 💰 EKO: NOVA ABA MOVIMENTOS FINANCEIROS */}
          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Movimentos Financeiros
                    </CardTitle>
                    <CardDescription>
                      Histórico financeiro associado a este animal
                    </CardDescription>
                  </div>
                  {hasPermission('create') && (
                    <Link to="/financeiro/movimentos">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Associar Movimento
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600">Total Recebido</p>
                            <p className="text-2xl font-bold text-green-700">
                              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalReceitas)}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-600">Total Gasto</p>
                            <p className="text-2xl font-bold text-red-700">
                              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalDespesas)}
                            </p>
                          </div>
                          <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600">Saldo</p>
                            <p className="text-2xl font-bold text-blue-700">
                              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalReceitas - totalDespesas)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Lista de Movimentos */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Histórico de Movimentos</h4>
                    {movimentosFinanceiros.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhum movimento financeiro</p>
                        <p className="text-sm">Os movimentos associados a este animal aparecerão aqui</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movimentosFinanceiros.map((movimento) => (
                            <TableRow key={movimento.id}>
                              <TableCell>
                                {new Date(movimento.data_movimento).toLocaleDateString('pt-PT')}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={movimento.tipo_movimento === 'receita' 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                  }
                                >
                                  {movimento.tipo_movimento === 'receita' ? '💰' : '💸'} {movimento.tipo_movimento}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: movimento.categoria_cor }}
                                  />
                                  <span>{movimento.categoria_nome}</span>
                                </div>
                              </TableCell>
                              <TableCell>{movimento.descricao}</TableCell>
                              <TableCell className="text-right font-medium">
                                <span className={movimento.tipo_movimento === 'receita' ? 'text-green-600' : 'text-red-600'}>
                                  {movimento.tipo_movimento === 'receita' ? '+' : '-'}
                                  {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(movimento.valor)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 📦 EKO: MODAL DE ARQUIVAMENTO */}
      <Dialog open={arquivarDialogOpen} onOpenChange={setArquivarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Archive className="h-5 w-5 mr-2 text-red-600" />
              Arquivar Animal
            </DialogTitle>
            <DialogDescription>
              O animal será removido da gestão normal e movido para o arquivo.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleArquivar} className="space-y-4">
            <div>
              <Label htmlFor="motivo">Motivo do Arquivamento *</Label>
              <Select 
                value={arquivarForm.motivo} 
                onValueChange={(value) => setArquivarForm({...arquivarForm, motivo: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Óbito">🕊 Óbito</SelectItem>
                  <SelectItem value="Adoção">🏠 Adoção</SelectItem>
                  <SelectItem value="Transferência">🚚 Transferência</SelectItem>
                  <SelectItem value="Não Adotável">⚠️ Não Adotável</SelectItem>
                  <SelectItem value="Fuga">🏃 Fuga</SelectItem>
                  <SelectItem value="Devolução">🔄 Devolução</SelectItem>
                  <SelectItem value="Outros">📝 Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={arquivarForm.observacoes}
                onChange={(e) => setArquivarForm({...arquivarForm, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre o arquivamento..."
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Atenção:</p>
                  <p>Esta ação irá arquivar o animal "{animal?.nome}". O animal não aparecerá mais na gestão normal, mas poderá ser desarquivado posteriormente por administradores.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setArquivarDialogOpen(false);
                  resetArquivarForm();
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700"
              >
                <Archive className="h-4 w-4 mr-2" />
                Arquivar Animal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalDetail;