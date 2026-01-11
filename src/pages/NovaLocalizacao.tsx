import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VoluntarioSelector from "@/components/VoluntarioSelector";
import { 
  ArrowLeft, 
  Save,
  PawPrint,
  Loader2,
  AlertCircle,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal, Voluntario } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

const NovaLocalizacao = () => {
  const { id } = useParams(); // animal_id
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Estados para dados relacionados
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<any[]>([]);
  // voluntarios removido - agora usa VoluntarioSelector

  // Formulário de localização
  const [localizacaoForm, setLocalizacaoForm] = useState({
    localizacao: '',
    data_inicio: '',
    endereco_detalhes: '',
    responsavel_id: '',
    motivo_transferencia: '',
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
      // Carregar tipos de localizações
      const { data: tiposLocalizacoesData } = await supabase
        .from('localizacoes')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      setTiposLocalizacoes(tiposLocalizacoesData || []);

      // Voluntários agora são carregados pelo VoluntarioSelector

    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localizacaoForm.localizacao || !localizacaoForm.data_inicio) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o tipo de localização e a data de início",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      // Desativar localizações anteriores ANTES de inserir nova
      const dataFimAnterior = localizacaoForm.data_inicio;
      
      const { error: updateError } = await supabase
        .from('localizacoes_animal')
        .update({ 
          ativo: false, 
          data_fim: dataFimAnterior
        })
        .eq('animal_id', id)
        .eq('ativo', true);

      console.log('DEBUG - Desativando localizações anteriores com data_fim:', dataFimAnterior);
      
      if (updateError) {
        console.error('Erro ao desativar localizações anteriores:', updateError);
      } else {
        console.log('DEBUG - Localizações anteriores desativadas com sucesso');
      }

      const localizacaoData = {
        animal_id: id,
        localizacao: localizacaoForm.localizacao,
        data_inicio: localizacaoForm.data_inicio,
        endereco_detalhes: localizacaoForm.endereco_detalhes,
        responsavel_id: localizacaoForm.responsavel_id || null,
        motivo_transferencia: localizacaoForm.motivo_transferencia,
        observacoes: localizacaoForm.observacoes,
        ativo: true
      };

      // === LOG DETALHADO DO PAYLOAD ===
      console.group('🔍 [NOVA_LOCALIZACAO] PAYLOAD PARA INSERT');
      console.table(localizacaoData);
      console.log('JSON:', JSON.stringify(localizacaoData, null, 2));
      console.log('animal_id:', localizacaoData.animal_id, '(tipo:', typeof localizacaoData.animal_id, ')');
      console.log('localizacao:', localizacaoData.localizacao, '(tipo:', typeof localizacaoData.localizacao, ')');
      console.log('data_inicio:', localizacaoData.data_inicio, '(tipo:', typeof localizacaoData.data_inicio, ')');
      console.log('responsavel_id:', localizacaoData.responsavel_id, '(tipo:', typeof localizacaoData.responsavel_id, ')');
      console.log('ativo:', localizacaoData.ativo, '(tipo:', typeof localizacaoData.ativo, ')');
      console.groupEnd();

      const { error } = await supabase
        .from('localizacoes_animal')
        .insert([localizacaoData]);

      if (error) {
        // === LOG DETALHADO DO ERRO ===
        console.group('❌ [NOVA_LOCALIZACAO] ERRO 400 - DETALHES COMPLETOS');
        console.error('Erro completo:', error);
        console.table({
          'Código': error.code || 'N/A',
          'Mensagem': error.message || 'N/A',
          'Detalhes': error.details || 'N/A',
          'Hint': error.hint || 'N/A',
          'Status': error.status || 'N/A'
        });
        console.log('JSON do erro:', JSON.stringify(error, null, 2));
        console.groupEnd();
        
        toast({
          title: "Erro ao salvar localização",
          description: `Erro: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Localização registrada",
        description: "Nova localização registrada com sucesso",
      });

      // Redirecionar para a página de localizações do animal
      navigate(`/animal/${id}/localizacoes`);

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar dados...</p>
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
          { label: 'Localizações', href: `/animal/${id}/localizacoes`, icon: <MapPin className="h-4 w-4" /> },
          { label: 'Nova Localização' }
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <MapPin className="h-6 w-6 mr-2" />
              Nova Localização para {animal.nome}
            </CardTitle>
            <CardDescription className="text-blue-600">
              Registar nova localização para o animal
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="localizacao" className="text-blue-700 font-medium">
                    Tipo de Localização *
                  </Label>
                  <Select 
                    value={localizacaoForm.localizacao || ""} 
                    onValueChange={(value) => {
                      setLocalizacaoForm(prev => ({ ...prev, localizacao: value }));
                    }}
                  >
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposLocalizacoes.length === 0 && (
                        <SelectItem value="loading" disabled>
                          Carregando localizações...
                        </SelectItem>
                      )}
                      {tiposLocalizacoes.map((localizacao) => (
                        <SelectItem key={localizacao.id} value={String(localizacao.id)}>
                          {localizacao.nome}
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
                    value={localizacaoForm.data_inicio}
                    onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, data_inicio: e.target.value })}
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="endereco_detalhes" className="text-blue-700 font-medium">
                  Endereço/Detalhes da Localização
                </Label>
                <Textarea
                  id="endereco_detalhes"
                  value={localizacaoForm.endereco_detalhes}
                  onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, endereco_detalhes: e.target.value })}
                  className="border-blue-200 focus:border-blue-400"
                  placeholder="Endereço completo, contactos, etc."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <VoluntarioSelector
                    value={localizacaoForm.responsavel_id}
                    onValueChange={(voluntarioId, voluntario) => {
                      setLocalizacaoForm({ ...localizacaoForm, responsavel_id: voluntarioId });
                    }}
                    label="Responsável pela Localização"
                    placeholder="Digite para pesquisar responsável..."
                    showFullName={true}
                    required={false}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="motivo_transferencia" className="text-blue-700 font-medium">
                    Motivo da Transferência
                  </Label>
                  <Input
                    id="motivo_transferencia"
                    value={localizacaoForm.motivo_transferencia}
                    onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, motivo_transferencia: e.target.value })}
                    className="border-blue-200 focus:border-blue-400"
                    placeholder="Ex: Adoção, tratamento médico, etc."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="observacoes" className="text-blue-700 font-medium">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={localizacaoForm.observacoes}
                  onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, observacoes: e.target.value })}
                  className="border-blue-200 focus:border-blue-400"
                  placeholder="Informações adicionais sobre a localização..."
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> Ao registar uma nova localização, ela será automaticamente definida como atual e as anteriores passarão para o histórico.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/animal/${id}/localizacoes`)}
                  disabled={saving}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      A registar...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registar Localização
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default NovaLocalizacao;