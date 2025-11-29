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
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2,
  PawPrint,
  Loader2,
  AlertCircle,
  Users,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, ResponsabilidadeVoluntario, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";

// Tipos de responsabilidades predefinidos
const TIPOS_RESPONSABILIDADES = [
  { id: 'cuidador_principal', nome: '👨‍⚕️ Cuidador Principal', emoji: '👨‍⚕️' },
  { id: 'veterinario_responsavel', nome: '🩺 Veterinário Responsável', emoji: '🩺' },
  { id: 'transporte', nome: '🚗 Transporte', emoji: '🚗' },
  { id: 'alimentacao', nome: '🍽️ Alimentação', emoji: '🍽️' },
  { id: 'exercicio', nome: '🏃‍♂️ Exercício e Passeios', emoji: '🏃‍♂️' },
  { id: 'socializacao', nome: '🤝 Socialização', emoji: '🤝' },
  { id: 'medicacao', nome: '💊 Administração de Medicação', emoji: '💊' },
  { id: 'higiene', nome: '🛁 Higiene e Limpeza', emoji: '🛁' },
  { id: 'adocao', nome: '🏡 Processo de Adoção', emoji: '🏡' },
  { id: 'emergencia', nome: '🚨 Contacto de Emergência', emoji: '🚨' }
];

// Níveis de prioridade
const PRIORIDADES = [
  { value: 'alta', label: 'Alta Prioridade', color: 'bg-red-100 text-red-800', icon: '🔴' },
  { value: 'media', label: 'Média Prioridade', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  { value: 'baixa', label: 'Baixa Prioridade', color: 'bg-green-100 text-green-800', icon: '🟢' }
];

const AnimalResponsabilidades = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para responsabilidades - CORRIGIDO: ResponsabilidadeVoluntario
  const [responsabilidades, setResponsabilidades] = useState<ResponsabilidadeVoluntario[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [responsabilidadeDialogOpen, setResponsabilidadeDialogOpen] = useState(false);
  const [editingResponsabilidade, setEditingResponsabilidade] = useState<ResponsabilidadeVoluntario | null>(null);

  // Formulário de responsabilidade
  const [responsabilidadeForm, setResponsabilidadeForm] = useState({
    voluntario_id: '',
    tipo_responsabilidade: '',
    data_inicio: '',
    observacoes: '',
    prioridade: 'media'
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
      setError('Erro inesperado ao carregar animal');
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar dados relacionados
  const loadRelatedData = async () => {
    try {
      // Carregar responsabilidades - CORRIGIDO: tabela responsabilidades_animal
      const { data: responsabilidadesData, error: responsabilidadesError } = await supabase
        .from('responsabilidades_animal')
        .select(`
          *,
          voluntarios(id, nome, email, telefone)
        `)
        .eq('animal_id', id)
        .order('data_inicio', { ascending: false });

      console.log('DEBUG - Responsabilidades carregadas:', responsabilidadesData);
      console.log('DEBUG - Erro ao carregar:', responsabilidadesError);
      
      if (responsabilidadesError) {
        console.error('Erro ao carregar responsabilidades:', responsabilidadesError);
        // Fallback: carregar sem joins
        const { data: responsabilidadesFallback } = await supabase
          .from('responsabilidades_animal')
          .select('*')
          .eq('animal_id', id)
          .order('data_inicio', { ascending: false });
        
        setResponsabilidades(responsabilidadesFallback || []);
      } else {
        setResponsabilidades(responsabilidadesData || []);
      }

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
      voluntario_id: '',
      tipo_responsabilidade: '',
      data_inicio: '',
      observacoes: '',
      prioridade: 'media'
    });
  };

  const openResponsabilidadeDialog = (responsabilidade?: ResponsabilidadeVoluntario) => {
    if (responsabilidade) {
      setEditingResponsabilidade(responsabilidade);
      setResponsabilidadeForm({
        voluntario_id: responsabilidade.voluntario_id || '',
        tipo_responsabilidade: responsabilidade.tipo_responsabilidade || '',
        data_inicio: responsabilidade.data_inicio || '',
        observacoes: responsabilidade.observacoes || '',
        prioridade: 'media' // Campo não existe na interface original, usar default
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
        voluntario_id: responsabilidadeForm.voluntario_id,
        tipo_responsabilidade: responsabilidadeForm.tipo_responsabilidade,
        data_inicio: responsabilidadeForm.data_inicio,
        observacoes: responsabilidadeForm.observacoes,
        ativo: true
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
          description: "Não foi possível salvar a responsabilidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: editingResponsabilidade ? "Responsabilidade atualizada" : "Responsabilidade registrada",
        description: editingResponsabilidade ? "Responsabilidade atualizada com sucesso" : "Nova responsabilidade registrada com sucesso",
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

  const handleFinalizarResponsabilidade = async (responsabilidadeId: string) => {
    if (!confirm('Tem certeza que deseja finalizar esta responsabilidade?')) {
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
        console.error('Erro ao finalizar responsabilidade:', error);
        toast({
          title: "Erro ao finalizar",
          description: "Não foi possível finalizar a responsabilidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Responsabilidade finalizada",
        description: "Responsabilidade finalizada com sucesso",
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
    if (!confirm('Tem certeza que deseja eliminar esta responsabilidade?')) {
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
          description: "Não foi possível eliminar a responsabilidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Responsabilidade eliminada",
        description: "Responsabilidade eliminada com sucesso",
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

  // Função para obter informações do tipo de responsabilidade
  const getTipoResponsabilidadeInfo = (tipo: string) => {
    const tipoInfo = TIPOS_RESPONSABILIDADES.find(t => t.id === tipo);
    return {
      emoji: tipoInfo?.emoji || '👥',
      nome: tipoInfo?.nome || tipo
    };
  };

  // Função para obter informações da prioridade - SIMPLIFICADO
  const getPrioridadeInfo = (prioridade?: string) => {
    return PRIORIDADES[1]; // Default: média (já que prioridade não existe na interface)
  };

  // Função para formatar duração
  const getDuracao = (dataInicio: string, dataFim?: string) => {
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : new Date();
    const diffTime = fim.getTime() - inicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "1 dia";
    if (diffDays < 30) return `${diffDays} dias`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} anos`;
  };

  // Separar responsabilidades ativas e finalizadas
  const responsabilidadesAtivas = responsabilidades.filter(resp => resp.ativo);
  const responsabilidadesFinalizadas = responsabilidades.filter(resp => !resp.ativo);
  
  console.log('DEBUG - Total responsabilidades:', responsabilidades.length);
  console.log('DEBUG - Responsabilidades ativas:', responsabilidadesAtivas.length, responsabilidadesAtivas);
  console.log('DEBUG - Responsabilidades finalizadas:', responsabilidadesFinalizadas.length, responsabilidadesFinalizadas);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
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
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title={`${animal.nome} - Responsabilidades`}
        subtitle={`${animal.especie} • ${animal.sexo} • ${animal.estado}`}
        backTo={`/animal/${id}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navegação */}
        <div className="flex items-center space-x-4">
          <Link to={`/animal/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Ficha
            </Button>
          </Link>
          <div className="flex-1" />
          <Button onClick={() => openResponsabilidadeDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Responsabilidade
          </Button>
        </div>

        {/* Responsabilidades Ativas */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Users className="h-6 w-6 mr-2" />
              Responsabilidades Ativas ({responsabilidadesAtivas.length})
            </CardTitle>
            <CardDescription className="text-green-600">
              Voluntários atualmente responsáveis pelo animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responsabilidadesAtivas.length > 0 ? (
              <div className="space-y-4">
                {responsabilidadesAtivas.map((responsabilidade) => {
                  const tipoInfo = getTipoResponsabilidadeInfo(responsabilidade.tipo_responsabilidade);
                  const prioridadeInfo = getPrioridadeInfo();
                  return (
                    <div key={responsabilidade.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-lg">
                          {tipoInfo.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{tipoInfo.nome}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {responsabilidade.voluntario?.nome || 'Voluntário não encontrado'}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={prioridadeInfo.color}>
                                  {prioridadeInfo.icon} {prioridadeInfo.label}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Desde: {new Date(responsabilidade.data_inicio).toLocaleDateString('pt-PT')}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({getDuracao(responsabilidade.data_inicio)})
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openResponsabilidadeDialog(responsabilidade)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFinalizarResponsabilidade(responsabilidade.id)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Clock className="h-4 w-4" />
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

                          {responsabilidade.observacoes && (
                            <div className="mt-2 text-sm text-gray-700">
                              <strong>Observações:</strong> {responsabilidade.observacoes}
                            </div>
                          )}

                          {responsabilidade.voluntario?.email && (
                            <div className="mt-2 text-xs text-gray-500">
                              📧 {responsabilidade.voluntario.email}
                              {responsabilidade.voluntario.telefone && (
                                <span className="ml-3">📞 {responsabilidade.voluntario.telefone}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma responsabilidade ativa</p>
                <p className="text-sm">Adicione voluntários responsáveis pelo cuidado deste animal.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Responsabilidades */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <CheckCircle className="h-6 w-6 mr-2" />
              Histórico de Responsabilidades ({responsabilidadesFinalizadas.length})
            </CardTitle>
            <CardDescription className="text-gray-600">
              Responsabilidades anteriores já finalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responsabilidadesFinalizadas.length > 0 ? (
              <div className="space-y-4">
                {responsabilidadesFinalizadas.map((responsabilidade) => {
                  const tipoInfo = getTipoResponsabilidadeInfo(responsabilidade.tipo_responsabilidade);
                  const prioridadeInfo = getPrioridadeInfo();
                  return (
                    <div key={responsabilidade.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg">
                          {tipoInfo.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{tipoInfo.nome}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {responsabilidade.voluntario?.nome || 'Voluntário não encontrado'}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={prioridadeInfo.color}>
                                  {prioridadeInfo.icon} {prioridadeInfo.label}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(responsabilidade.data_inicio).toLocaleDateString('pt-PT')} - 
                                  {responsabilidade.data_fim ? new Date(responsabilidade.data_fim).toLocaleDateString('pt-PT') : 'Atual'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({getDuracao(responsabilidade.data_inicio, responsabilidade.data_fim)})
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
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

                          {responsabilidade.observacoes && (
                            <div className="mt-2 text-sm text-gray-700">
                              <strong>Observações:</strong> {responsabilidade.observacoes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma responsabilidade finalizada</p>
                <p className="text-sm">O histórico de responsabilidades aparecerá aqui conforme forem finalizadas.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Diálogo de Responsabilidade */}
      <Dialog open={responsabilidadeDialogOpen} onOpenChange={setResponsabilidadeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              {editingResponsabilidade ? 'Editar Responsabilidade' : 'Nova Responsabilidade'}
            </DialogTitle>
            <DialogDescription className="text-blue-600">
              {editingResponsabilidade ? 'Editar informações da responsabilidade' : `Atribuir nova responsabilidade para ${animal?.nome}`}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleResponsabilidadeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="voluntario_id" className="text-blue-700 font-medium">
                Voluntário Responsável *
              </Label>
              <Select 
                value={responsabilidadeForm.voluntario_id} 
                onValueChange={(value) => setResponsabilidadeForm({ ...responsabilidadeForm, voluntario_id: value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
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
              <Label htmlFor="tipo_responsabilidade" className="text-blue-700 font-medium">
                Tipo de Responsabilidade *
              </Label>
              <Select 
                value={responsabilidadeForm.tipo_responsabilidade} 
                onValueChange={(value) => setResponsabilidadeForm({ ...responsabilidadeForm, tipo_responsabilidade: value })}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_RESPONSABILIDADES.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_inicio" className="text-blue-700 font-medium">
                Data de Início *
              </Label>
              <Input
                id="data_inicio"
                type="date"
                value={responsabilidadeForm.data_inicio}
                onChange={(e) => setResponsabilidadeForm({ ...responsabilidadeForm, data_inicio: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes" className="text-blue-700 font-medium">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={responsabilidadeForm.observacoes}
                onChange={(e) => setResponsabilidadeForm({ ...responsabilidadeForm, observacoes: e.target.value })}
                className="border-blue-200 focus:border-blue-400"
                placeholder="Informações adicionais sobre a responsabilidade..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> O voluntário será notificado sobre esta nova responsabilidade e poderá visualizá-la no seu painel.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setResponsabilidadeDialogOpen(false);
                  resetResponsabilidadeForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingResponsabilidade ? 'Atualizar' : 'Atribuir Responsabilidade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalResponsabilidades;