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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, ResponsabilidadeVoluntario, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";
import VoluntarioSelector from "@/components/VoluntarioSelector";


// Tipos de responsabilidades predefinidos
const TIPOS_RESPONSABILIDADES = [
  { id: "cuidador_principal", nome: "👨‍⚕️ Cuidador Principal" },
  { id: "veterinario_responsavel", nome: "🩺 Veterinário Responsável" },
  { id: "transporte", nome: "🚗 Transporte" },
  { id: "alimentacao", nome: "🍽️ Alimentação" },
  { id: "exercicio", nome: "🏃‍♂️ Exercício e Passeios" },
  { id: "socializacao", nome: "🤝 Socialização" },
  { id: "medicacao", nome: "💊 Administração de Medicação" },
  { id: "higiene", nome: "🛁 Higiene e Limpeza" },
  { id: "adocao", nome: "🏡 Processo de Adoção" },
  { id: "emergencia", nome: "🚨 Contacto de Emergência" }
];
const AnimalResponsabilidades = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para responsabilidades
  const [responsabilidades, setResponsabilidades] = useState<ResponsabilidadeVoluntario[]>([]);
  const [tiposResponsabilidades, setTiposResponsabilidades] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [responsabilidadeDialogOpen, setResponsabilidadeDialogOpen] = useState(false);
  const [editingResponsabilidade, setEditingResponsabilidade] = useState<ResponsabilidadeVoluntario | null>(null);

  // Formulário de responsabilidade
  const [responsabilidadeForm, setResponsabilidadeForm] = useState({
    tipo_responsabilidade: '',
    data_inicio: '',
    observacoes: '',
    voluntario_id: '',
    ativo: false
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
      setError(null);

      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

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
      await loadRelatedData();
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro inesperado ao carregar animal');
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar dados relacionados
  const loadRelatedData = async () => {
    try {
      // Carregar responsabilidades com joins robustos
      const { data: responsabilidadesData, error: responsabilidadesError } = await supabase
        .from('responsabilidades_animal')
        .select(`
          *,
          
voluntarios(id, nome, email, telefone, display_name, full_name)
        `)
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      if (responsabilidadesError) {
        console.error('Erro ao carregar responsabilidades:', responsabilidadesError);
        // Fallback: carregar responsabilidades sem joins se houver erro
        const { data: responsabilidadesFallback } = await supabase
          .from('responsabilidades_animal')
          .select('*')
          .eq('animal_id', id)
          .order('data_inicio', { ascending: false });
        
        setResponsabilidades(responsabilidadesFallback || []);
      } else {
        setResponsabilidades(responsabilidadesData || []);
      }


      // Carregar tipos de responsabilidades
      const { data: tiposResponsabilidadesData } = await supabase
        .from('tipos_responsabilidades')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      setTiposResponsabilidades(tiposResponsabilidadesData || []);

      // Carregar voluntários
      const { data: voluntariosData } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      setVoluntarios(voluntariosData || []);

    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  // Funções de gestão de responsabilidades
  const resetResponsabilidadeForm = () => {
    setResponsabilidadeForm({
      tipo_responsabilidade: '',
      data_inicio: new Date().toISOString().split('T')[0], // Data atual por padrão
      observacoes: '',
      voluntario_id: '',
      ativo: true // Novas responsabilidades são ativas por padrão
    });
  };

  const openResponsabilidadeDialog = (responsabilidade?: ResponsabilidadeVoluntario) => {
    if (responsabilidade) {
      setEditingResponsabilidade(responsabilidade);
      setResponsabilidadeForm({
        tipo_responsabilidade: responsabilidade.tipo_responsabilidade?.toString() || '',
        data_inicio: responsabilidade.data_inicio || '',
        observacoes: responsabilidade.observacoes || '',
        voluntario_id: responsabilidade.voluntario_id || '',
        ativo: responsabilidade.ativo || false
      });
    } else {
      setEditingResponsabilidade(null);
      resetResponsabilidadeForm();
    }
    setResponsabilidadeDialogOpen(true);
  };

  const handleResponsabilidadeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const responsabilidadeData = {
        animal_id: id,
        tipo_responsabilidade: responsabilidadeForm.tipo_responsabilidade,
        data_inicio: responsabilidadeForm.data_inicio,
        observacoes: responsabilidadeForm.observacoes,
        voluntario_id: responsabilidadeForm.voluntario_id || null,
        ativo: responsabilidadeForm.ativo
      };

      let error;
      if (editingResponsabilidade) {
        const { error: updateError } = await supabase
          .from('responsabilidades_animal')
          .update(responsabilidadeData)
          .eq('id', editingResponsabilidade.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('responsabilidades_animal')
          .insert([responsabilidadeData]);
        error = insertError;
      }

      if (error) {
        console.error('Erro ao salvar responsabilidade:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar o responsabilidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: editingResponsabilidade ? "Responsabilidade atualizado" : "Responsabilidade registrado",
        description: editingResponsabilidade ? "Responsabilidade atualizado com sucesso" : "Novo responsabilidade registrado com sucesso",
      });

      setResponsabilidadeDialogOpen(false);
      resetResponsabilidadeForm();
      setEditingResponsabilidade(null);
      await loadRelatedData();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Função para encerrar responsabilidade (nova funcionalidade)
  const handleEncerrarResponsabilidade = async (responsabilidadeId: string) => {
    if (!confirm('Tem certeza que deseja encerrar esta responsabilidade? Ela será movida para o histórico.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('responsabilidades_animal')
        .update({
          ativo: false,
          data_fim: new Date().toISOString().split('T')[0]
        })
        .eq('id', responsabilidadeId);

      if (error) {
        console.error('Erro ao encerrar responsabilidade:', error);
        toast({
          title: "Erro ao encerrar",
          description: "Não foi possível encerrar a responsabilidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Responsabilidade encerrada",
        description: "Responsabilidade movida para o histórico com sucesso",
      });

      await loadRelatedData();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResponsabilidade = async (responsabilidadeId: string) => {
    if (!confirm('Tem certeza que deseja eliminar este responsabilidade? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('responsabilidades_animal')
        .delete()
        .eq('id', responsabilidadeId);

      if (error) {
        console.error('Erro ao eliminar responsabilidade:', error);
        toast({
          title: "Erro ao eliminar",
          description: "Não foi possível eliminar o responsabilidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Responsabilidade eliminado",
        description: "Responsabilidade eliminado com sucesso",
      });

      await loadRelatedData();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Função para reativar responsabilidade
  const handleReativarResponsabilidade = async (responsabilidadeId: string) => {
    if (!confirm('Tem certeza que deseja reativar esta responsabilidade?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('responsabilidades_animal')
        .update({
          ativo: true,
          data_fim: null
        })
        .eq('id', responsabilidadeId);

      if (error) {
        console.error('Erro ao reativar responsabilidade:', error);
        toast({
          title: "Erro ao reativar",
          description: "Não foi possível reativar a responsabilidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Responsabilidade reativada",
        description: "Responsabilidade reativada com sucesso",
      });

      await loadRelatedData();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  // Função para formatar data relativa
  const getRelativeDate = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays === -1) return "Ontem";
    if (diffDays > 0) return `Em ${diffDays} dias`;
    if (diffDays < 0) return `Há ${Math.abs(diffDays)} dias`;
    return eventDate.toLocaleDateString('pt-PT');
  };

  // Função para obter emoji do tipo de responsabilidade
  const getTipoResponsabilidadeInfo = (tipo: string) => {
    const tipoInfo = tiposResponsabilidades.find(t => t.id === tipo);
    return {
      emoji: tipoInfo?.nome?.split(' ')[0] || '👥',
      nome: tipoInfo?.nome || 'Responsabilidade'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-lg text-gray-600">A carregar responsabilidades...</p>
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
          { label: 'Responsabilidades', icon: <Star className="h-4 w-4" /> }
        ]}
        primaryActions={
          <Button onClick={() => openResponsabilidadeDialog()} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-9">
            <Plus className="h-4 w-4 mr-2" />
            Nova Responsabilidade
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">

        {/* Responsabilidades Ativas */}
        <Card className="border-green-300 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-green-800 text-xl">
                  <div className="bg-green-600 p-2 rounded-lg mr-3">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  Responsabilidades Ativas
                  <Badge className="ml-3 bg-green-600 text-white">
                    {responsabilidades.filter(r => r.ativo).length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-green-700 mt-1">
                  👥 Voluntários atualmente responsáveis pelos cuidados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {responsabilidades.filter(r => r.ativo).length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {responsabilidades.filter(r => r.ativo).map((responsabilidade) => {
                  const tipoInfo = getTipoResponsabilidadeInfo(responsabilidade.tipo_responsabilidade);
                  return (
                    <Card key={responsabilidade.id} className="border-l-4 border-green-500 bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl shadow-lg">
                              {tipoInfo.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-2 text-base">{tipoInfo.nome}</h3>
                              {responsabilidade.voluntarios && (
                                <div className="flex items-center gap-2 mb-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                  <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  <span className="font-semibold text-blue-900 text-sm truncate">
                                    {responsabilidade.voluntarios.display_name || responsabilidade.voluntarios.nome}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md">
                                <Calendar className="h-3.5 w-3.5 text-green-600" />
                                <span className="font-medium">Desde {new Date(responsabilidade.data_inicio).toLocaleDateString('pt-PT')}</span>
                              </div>
                              {responsabilidade.observacoes && (
                                <div className="mt-3 pt-3 border-t border-green-200">
                                  <p className="text-xs text-gray-500 mb-1 font-semibold">📝 Observações:</p>
                                  <p className="text-sm text-gray-700 bg-yellow-50 p-2.5 rounded-lg border border-yellow-200">
                                    {responsabilidade.observacoes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openResponsabilidadeDialog(responsabilidade)}
                              className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-300"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEncerrarResponsabilidade(responsabilidade.id)}
                              className="h-9 w-9 p-0 hover:bg-orange-50 hover:border-orange-300"
                              title="Encerrar"
                            >
                              <Clock className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteResponsabilidade(responsabilidade.id)}
                              className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="bg-gray-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">🔍 Nenhuma responsabilidade ativa</p>
                <p className="text-sm text-gray-600 mb-4">Atribua voluntários para cuidar de {animal?.nome}</p>
                <Button 
                  onClick={() => openResponsabilidadeDialog()} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Responsabilidade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Responsabilidades */}
        <Card className="border-gray-300 bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-gray-800 text-xl">
                  <div className="bg-gray-600 p-2 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Histórico
                  <Badge className="ml-3 bg-gray-600 text-white">
                    {responsabilidades.filter(r => !r.ativo).length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  📅 Responsabilidades anteriores já encerradas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {responsabilidades.filter(r => !r.ativo).length > 0 ? (
              <div className="space-y-4">
                {responsabilidades.filter(r => !r.ativo).map((responsabilidade, index) => {
                  const tipoInfo = getTipoResponsabilidadeInfo(responsabilidade.tipo_responsabilidade);
                  return (
                    <div key={responsabilidade.id} className="relative">
                      {/* Linha da timeline */}
                      {index < responsabilidades.filter(r => !r.ativo).length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                      )}
                      
                      {/* Card do histórico */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-lg shadow-md">
                          {tipoInfo.emoji}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Card className="border-gray-200 bg-gray-50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-gray-700">{tipoInfo.nome}</h3>
                                    <Badge variant="outline" className="text-xs bg-gray-100">
                                      Encerrada
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(responsabilidade.data_inicio).toLocaleDateString('pt-PT')}
                                      {responsabilidade.data_fim && (
                                        <span> - {new Date(responsabilidade.data_fim).toLocaleDateString('pt-PT')}</span>
                                      )}
                                    </div>
                                  </div>
                                  
{responsabilidade.voluntarios && (
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                      <User className="h-4 w-4 mr-1" />
                                      {responsabilidade.voluntarios.display_name || responsabilidade.voluntarios.nome}
                                    </div>
                                  )}
                                  
                                  {responsabilidade.observacoes && (
                                    <p className="text-sm text-gray-600 mt-2 p-2 bg-white rounded">
                                      {responsabilidade.observacoes}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openResponsabilidadeDialog(responsabilidade)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReativarResponsabilidade(responsabilidade.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteResponsabilidade(responsabilidade.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma responsabilidade no histórico</p>
                <p className="text-sm">As responsabilidades encerradas aparecerão aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Diálogo de Responsabilidade */}
      <Dialog open={responsabilidadeDialogOpen} onOpenChange={setResponsabilidadeDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {editingResponsabilidade ? '✏️ Editar Responsabilidade' : '⭐ Nova Responsabilidade'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {editingResponsabilidade ? 'Atualizar dados da responsabilidade' : `Atribuir voluntário para cuidar de ${animal?.nome}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleResponsabilidadeSubmit} className="space-y-5 pt-4">
            {/* Tipo de Responsabilidade */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Label htmlFor="tipo_responsabilidade" className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Tipo de Responsabilidade *
              </Label>
              <Select 
                value={responsabilidadeForm.tipo_responsabilidade} 
                onValueChange={(value) => setResponsabilidadeForm({ ...responsabilidadeForm, tipo_responsabilidade: value })}
              >
                <SelectTrigger className="mt-1.5 bg-white border-green-300 focus:border-green-500 h-11">
                  <SelectValue placeholder="🎯 Selecionar tipo de responsabilidade" />
                </SelectTrigger>
                <SelectContent>
                  {tiposResponsabilidades.length === 0 && (
                    <SelectItem value="loading" disabled>
                      ⏳ Carregando tipos...
                    </SelectItem>
                  )}
                  {tiposResponsabilidades.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id} className="py-2.5">
                      <span className="font-medium">{tipo.nome}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Data de Início */}
            <div>
              <Label htmlFor="data_inicio" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Data de Atribuição *
              </Label>
              <Input
                id="data_inicio"
                type="date"
                value={responsabilidadeForm.data_inicio}
                onChange={(e) => setResponsabilidadeForm({ ...responsabilidadeForm, data_inicio: e.target.value })}
                className="mt-1.5 border-gray-300 focus:border-green-500 h-11"
                required
              />
            </div>
            
            {/* Voluntário */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Label className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Voluntário Responsável
              </Label>
              <VoluntarioSelector
                value={responsabilidadeForm.voluntario_id}
                onValueChange={(voluntarioId, voluntario) => {
                  setResponsabilidadeForm({ ...responsabilidadeForm, voluntario_id: voluntarioId });
                }}
                label=""
                placeholder="👥 Selecionar voluntário (opcional)..."
                showFullName={true}
                required={false}
                className="mt-1.5 bg-white border-blue-300 focus:border-blue-500 h-11"
              />
            </div>
            
            {/* Observações */}
            <div>
              <Label htmlFor="observacoes" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={responsabilidadeForm.observacoes}
                onChange={(e) => setResponsabilidadeForm({ ...responsabilidadeForm, observacoes: e.target.value })}
                className="mt-1.5 border-gray-300 focus:border-green-500 min-h-[100px] resize-y"
                placeholder="Detalhes sobre a responsabilidade, horários, instruções especiais, etc..."
              />
            </div>

            {/* Status Ativo */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="ativo"
                  checked={responsabilidadeForm.ativo}
                  onCheckedChange={(checked) => setResponsabilidadeForm({ ...responsabilidadeForm, ativo: !!checked })}
                  className="h-5 w-5"
                />
                <Label htmlFor="ativo" className="text-sm font-semibold text-green-900 cursor-pointer flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-600" />
                  Responsabilidade Ativa
                </Label>
              </div>
              <p className="text-xs text-green-700 mt-2 ml-8">
                Responsabilidades ativas aparecem na secção principal e podem ser encerradas a qualquer momento.
              </p>
            </div>

            {/* Nota Informativa */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    <strong>💡 Dica:</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    Atribua diferentes tipos de responsabilidades a voluntários específicos. Pode ter múltiplas responsabilidades ativas simultaneamente.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white pb-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setResponsabilidadeDialogOpen(false);
                  resetResponsabilidadeForm();
                }}
                className="w-full sm:w-auto h-11 border-gray-300 hover:bg-gray-50"
              >
                ❌ Cancelar
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all"
              >
                {editingResponsabilidade ? '✅ Atualizar Responsabilidade' : '⭐ Registar Responsabilidade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <EnhancedFooter />
    </div>
  );
};

export default AnimalResponsabilidades;
