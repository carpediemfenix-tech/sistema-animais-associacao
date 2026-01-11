import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VoluntarioSelector from "@/components/VoluntarioSelector";
import { 
  ArrowLeft, 
  Save,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";

const EditarLocalizacao = () => {
  const { id, localizacaoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [localizacao, setLocalizacao] = useState<any>(null);
  const [tiposLocalizacoes, setTiposLocalizacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulário de localização
  const [localizacaoForm, setLocalizacaoForm] = useState({
    localizacao: '',
    data_inicio: '',
    endereco_detalhes: '',
    responsavel_id: '',
    motivo_transferencia: '',
    observacoes: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !localizacaoId) {
        setError("IDs não fornecidos");
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

        // Carregar tipos de localizações
        const { data: tiposLocalizacoesData, error: tiposError } = await supabase
          .from('localizacoes')
          .select('*')
          .order('nome');

        if (tiposError) throw tiposError;
        setTiposLocalizacoes(tiposLocalizacoesData || []);

        // Carregar dados da localização específica
        const { data: localizacaoData, error: localizacaoError } = await supabase
          .from('localizacoes_animal')
          .select('*')
          .eq('id', localizacaoId)
          .single();

        if (localizacaoError) throw localizacaoError;
        
        setLocalizacao(localizacaoData);
        
        // Preencher formulário com dados existentes
        setLocalizacaoForm({
          localizacao: localizacaoData.localizacao || '',
          data_inicio: localizacaoData.data_inicio ? localizacaoData.data_inicio.split('T')[0] : '',
          endereco_detalhes: localizacaoData.endereco_detalhes || '',
          responsavel_id: localizacaoData.responsavel_id || '',
          motivo_transferencia: localizacaoData.motivo_transferencia || '',
          observacoes: localizacaoData.observacoes || ''
        });

      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados da localização');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, localizacaoId]);

  // Função para salvar alterações
  const handleSave = async () => {
    if (!localizacao) return;

    try {
      setSaving(true);

      // Validações básicas
      if (!localizacaoForm.localizacao) {
        toast({
          title: "Erro de validação",
          description: "Tipo de localização é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!localizacaoForm.data_inicio) {
        toast({
          title: "Erro de validação", 
          description: "Data de início é obrigatória",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para atualização
      const updateData = {
        localizacao: localizacaoForm.localizacao,
        data_inicio: localizacaoForm.data_inicio,
        endereco_detalhes: localizacaoForm.endereco_detalhes || null,
        responsavel_id: localizacaoForm.responsavel_id || null,
        motivo_transferencia: localizacaoForm.motivo_transferencia || null,
        observacoes: localizacaoForm.observacoes || null
      };

      console.log('DEBUG - Atualizando localização:', {
        id: localizacaoId,
        data: updateData,
        formData: localizacaoForm
      });

      // Atualizar localização
      const { error: updateError } = await supabase
        .from('localizacoes_animal')
        .update(updateData)
        .eq('id', localizacaoId);

      if (updateError) {
        console.error('Erro ao atualizar localização:', updateError);
        throw updateError;
      }

      toast({
        title: "Localização atualizada",
        description: "As alterações foram salvas com sucesso",
      });

      // Redirecionar de volta para a página de localizações
      navigate(`/animal/${id}/localizacoes`);

    } catch (error: any) {
      console.error('Erro ao salvar localização:', error);
      
      let errorMessage = "Erro inesperado ao salvar alterações";
      
      if (error.code === 'PGRST204') {
        errorMessage = "Erro de estrutura da base de dados. Contacte o administrador.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-700 text-lg">Carregando dados da localização...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <p className="text-lg text-red-700 mb-4">{error}</p>
          <Link to={`/animal/${id}/localizacoes`}>
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Localizações
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      {/* Barra de Navegação e Ações */}
      <PageActionBar
        breadcrumbs={[
          { label: 'Animais', href: '/animais', icon: <MapPin className="h-4 w-4" /> },
          { label: animal?.nome || 'Animal', href: `/animal/${id}` },
          { label: 'Localizações', href: `/animal/${id}/localizacoes` },
          { label: 'Editar Localização' }
        ]}
        primaryActions={
          <>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-9"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            
            <Link to={`/animal/${id}/localizacoes`}>
              <Button variant="outline" className="h-9">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </Link>
          </>
        }
      />

      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Cabeçalho */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <MapPin className="h-6 w-6 mr-3" />
              Editar Localização - {animal?.nome}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Formulário de Edição */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Informações da Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Tipo de Localização e Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="localizacao" className="text-blue-700 font-medium">
                  Tipo de Localização *
                </Label>
                <Select 
                  value={localizacaoForm.localizacao} 
                  onValueChange={(value) => setLocalizacaoForm({ ...localizacaoForm, localizacao: value })}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Selecionar tipo de localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposLocalizacoes.map((tipo) => (
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
                  value={localizacaoForm.data_inicio}
                  onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, data_inicio: e.target.value })}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Endereço/Detalhes */}
            <div>
              <Label htmlFor="endereco_detalhes" className="text-blue-700 font-medium">
                Endereço/Detalhes
              </Label>
              <Input
                id="endereco_detalhes"
                value={localizacaoForm.endereco_detalhes}
                onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, endereco_detalhes: e.target.value })}
                placeholder="Endereço completo ou detalhes da localização"
                className="border-blue-200 focus:border-blue-400"
              />
            </div>

            {/* Responsável e Motivo */}
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
                  placeholder="Motivo da mudança de localização"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes" className="text-blue-700 font-medium">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={localizacaoForm.observacoes}
                onChange={(e) => setLocalizacaoForm({ ...localizacaoForm, observacoes: e.target.value })}
                placeholder="Observações adicionais sobre a localização"
                className="border-blue-200 focus:border-blue-400 min-h-[100px]"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-blue-200">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex-1"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Salvando Alterações...' : 'Salvar Alterações'}
              </Button>
              
              <Link to={`/animal/${id}/localizacoes`} className="flex-1">
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar e Voltar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EditarLocalizacao;