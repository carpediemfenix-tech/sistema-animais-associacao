import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  PawPrint, 
  Camera,
  Upload,
  Eye,
  FileText,
  Calendar,
  User,
  Activity,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { convertGoogleDriveUrl } from "@/lib/utils";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const EditarAnimalFuturistic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    sexo: "",
    idade_estimada: "",
    data_nascimento: "",
    peso: "",
    cor: "",
    caracteristicas_fisicas: "",
    transponder: "",
    numero_processo: "",
    data_entrada: "",
    estado: "",
    observacoes: "",
    url_fotografia: "",
    voluntario_responsavel: "",
    grupo_id: ""
  });

  const [especies, setEspecies] = useState<any[]>([]);
  const [sexos, setSexos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAnimalData();
      loadSelectOptions();
    }
  }, [id]);

  const loadAnimalData = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          nome: data.nome || "",
          especie: data.especie || "",
          raca: data.raca || "",
          sexo: data.sexo || "",
          idade_estimada: data.idade_estimada?.toString() || "",
          data_nascimento: data.data_nascimento || "",
          peso: data.peso?.toString() || "",
          cor: data.cor || "",
          caracteristicas_fisicas: data.caracteristicas_fisicas || "",
          transponder: data.transponder || "",
          numero_processo: data.numero_processo || "",
          data_entrada: data.data_entrada || "",
          estado: data.estado || "",
          observacoes: data.observacoes || "",
          url_fotografia: data.url_fotografia || "",
          voluntario_responsavel: data.voluntario_responsavel || "",
          grupo_id: data.grupo_id || ""
        });

        if (data.url_fotografia) {
          setPhotoPreview(convertGoogleDriveUrl(data.url_fotografia));
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadSelectOptions = async () => {
    try {
      // Carregar espécies
      const { data: especiesData } = await supabase
        .from('especies')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (especiesData) setEspecies(especiesData);

      // Carregar sexos
      const { data: sexosData } = await supabase
        .from('sexos')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (sexosData) setSexos(sexosData);

      // Carregar grupos
      const { data: gruposData } = await supabase
        .from('grupos')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (gruposData) setGrupos(gruposData);

      // Carregar voluntários
      const { data: voluntariosData } = await supabase
        .from('voluntarios')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');
      
      if (voluntariosData) setVoluntarios(voluntariosData);

    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome do animal é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        nome: formData.nome.trim(),
        especie: formData.especie || null,
        raca: formData.raca.trim() || null,
        sexo: formData.sexo || null,
        idade_estimada: formData.idade_estimada ? parseInt(formData.idade_estimada) : null,
        data_nascimento: formData.data_nascimento || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        cor: formData.cor.trim() || null,
        caracteristicas_fisicas: formData.caracteristicas_fisicas.trim() || null,
        transponder: formData.transponder.trim() || null,
        numero_processo: formData.numero_processo.trim() || null,
        data_entrada: formData.data_entrada || null,
        estado: formData.estado || null,
        observacoes: formData.observacoes.trim() || null,
        url_fotografia: formData.url_fotografia || null,
        voluntario_responsavel: formData.voluntario_responsavel || null,
        grupo_id: formData.grupo_id || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('animais')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Animal atualizado",
        description: "Os dados do animal foram atualizados com sucesso",
      });

      navigate(`/animal/${id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-transparent rounded-full animate-spin mx-auto mb-4 animate-reverse"></div>
          </div>
          <p className="text-cyan-400 text-lg font-medium">Carregando dados do animal...</p>
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
      </div>

      <EnhancedHeader />
      
      {/* Navigation Bar */}
      <div className="relative z-10 bg-slate-800/30 backdrop-blur-lg border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to={`/animal/${id}`}>
                <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="h-6 w-px bg-cyan-500/30"></div>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Editar Animal
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to={`/editar-animal/${id}/classic`}>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-9">
                  <Eye className="h-4 w-4 mr-2" />
                  Modo Clássico
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-lg rounded-3xl border border-cyan-500/30 p-8 shadow-2xl shadow-purple-500/20">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              
              {/* Photo Section */}
              <div className="relative">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Preview"
                    className="w-48 h-48 lg:w-64 lg:h-64 object-cover rounded-full border-4 border-cyan-400/50 shadow-2xl shadow-cyan-500/30"
                  />
                ) : (
                  <div className="w-48 h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center border-4 border-cyan-400/50 shadow-2xl shadow-purple-500/30">
                    <Camera className="h-24 w-24 text-white/80" />
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label className="text-cyan-300 font-medium flex items-center">
                      <PawPrint className="h-4 w-4 mr-2" />
                      Nome do Animal *
                    </Label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="bg-slate-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
                      placeholder="Digite o nome do animal"
                      required
                    />
                  </div>

                  {/* Número do Processo */}
                  <div className="space-y-2">
                    <Label className="text-purple-300 font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Número do Processo
                    </Label>
                    <Input
                      value={formData.numero_processo}
                      onChange={(e) => handleInputChange('numero_processo', e.target.value)}
                      className="bg-slate-800/50 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-400"
                      placeholder="Ex: 2024/001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Espécie */}
                  <div className="space-y-2">
                    <Label className="text-green-300 font-medium">Espécie</Label>
                    <Select value={formData.especie} onValueChange={(value) => handleInputChange('especie', value)}>
                      <SelectTrigger className="bg-slate-800/50 border-green-500/30 text-white focus:border-green-400">
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-green-500/30">
                        {especies.map((especie) => (
                          <SelectItem key={especie.id} value={especie.nome} className="text-white hover:bg-green-500/20">
                            {especie.icone} {especie.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sexo */}
                  <div className="space-y-2">
                    <Label className="text-pink-300 font-medium">Sexo</Label>
                    <Select value={formData.sexo} onValueChange={(value) => handleInputChange('sexo', value)}>
                      <SelectTrigger className="bg-slate-800/50 border-pink-500/30 text-white focus:border-pink-400">
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-pink-500/30">
                        {sexos.map((sexo) => (
                          <SelectItem key={sexo.id} value={sexo.nome} className="text-white hover:bg-pink-500/20">
                            {sexo.nome === 'Macho' ? '♂️' : sexo.nome === 'Fêmea' ? '♀️' : '⚪'} {sexo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label className="text-yellow-300 font-medium">Estado</Label>
                    <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                      <SelectTrigger className="bg-slate-800/50 border-yellow-500/30 text-white focus:border-yellow-400">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-yellow-500/30">
                        <SelectItem value="Ativo" className="text-white hover:bg-yellow-500/20">🟢 Ativo</SelectItem>
                        <SelectItem value="Adotado" className="text-white hover:bg-yellow-500/20">🔵 Adotado</SelectItem>
                        <SelectItem value="Tratamento" className="text-white hover:bg-yellow-500/20">🟡 Tratamento</SelectItem>
                        <SelectItem value="Quarentena" className="text-white hover:bg-yellow-500/20">🟠 Quarentena</SelectItem>
                        <SelectItem value="Óbito" className="text-white hover:bg-yellow-500/20">🔴 Óbito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Physical Information */}
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6 shadow-xl shadow-blue-500/10">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-400" />
                Informações Físicas
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-300">Raça</Label>
                    <Input
                      value={formData.raca}
                      onChange={(e) => handleInputChange('raca', e.target.value)}
                      className="bg-slate-800/50 border-blue-500/30 text-white placeholder-gray-400"
                      placeholder="Ex: Labrador"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-blue-300">Cor</Label>
                    <Input
                      value={formData.cor}
                      onChange={(e) => handleInputChange('cor', e.target.value)}
                      className="bg-slate-800/50 border-blue-500/30 text-white placeholder-gray-400"
                      placeholder="Ex: Castanho"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-300">Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.peso}
                      onChange={(e) => handleInputChange('peso', e.target.value)}
                      className="bg-slate-800/50 border-blue-500/30 text-white placeholder-gray-400"
                      placeholder="Ex: 25.5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-blue-300">Transponder</Label>
                    <Input
                      value={formData.transponder}
                      onChange={(e) => handleInputChange('transponder', e.target.value)}
                      className="bg-slate-800/50 border-blue-500/30 text-white placeholder-gray-400"
                      placeholder="Número do chip"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-blue-300">Características Físicas</Label>
                  <Textarea
                    value={formData.caracteristicas_fisicas}
                    onChange={(e) => handleInputChange('caracteristicas_fisicas', e.target.value)}
                    className="bg-slate-800/50 border-blue-500/30 text-white placeholder-gray-400 min-h-[100px]"
                    placeholder="Descreva características físicas distintivas..."
                  />
                </div>
              </div>
            </div>

            {/* Age and Dates */}
            <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6 shadow-xl shadow-green-500/10">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-400" />
                Idade e Datas
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-green-300">Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                    className="bg-slate-800/50 border-green-500/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Idade Estimada (meses)</Label>
                  <Input
                    type="number"
                    value={formData.idade_estimada}
                    onChange={(e) => handleInputChange('idade_estimada', e.target.value)}
                    className="bg-slate-800/50 border-green-500/30 text-white placeholder-gray-400"
                    placeholder="Ex: 24"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Data de Entrada</Label>
                  <Input
                    type="date"
                    value={formData.data_entrada}
                    onChange={(e) => handleInputChange('data_entrada', e.target.value)}
                    className="bg-slate-800/50 border-green-500/30 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl border border-yellow-500/30 p-6 shadow-xl shadow-yellow-500/10">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-400" />
              Observações
            </h3>
            
            <div className="space-y-2">
              <Textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                className="bg-slate-800/50 border-yellow-500/30 text-white placeholder-gray-400 min-h-[150px]"
                placeholder="Observações gerais sobre o animal, comportamento, necessidades especiais, etc..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link to={`/animal/${id}`}>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </Link>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EditarAnimalFuturistic;