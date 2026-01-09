import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertCircle, CheckCircle, PawPrint, Plus, FileText, Clipboard, Heart, Paperclip, Trash2, Thermometer, Weight, Stethoscope, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import VoluntarioSelector from "@/components/VoluntarioSelector";
import { convertGoogleDriveUrl } from "@/lib/utils";
import PageActionBar from "@/components/PageActionBar";

const NovoAnimal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [numeroProcesso, setNumeroProcesso] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basico");

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
    local_encontrado: "",
    observacoes: "",
    grupo_id: "",
    url_fotografia: "",
    voluntario_responsavel: "",
    data_entrada: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grupos, setGrupos] = useState<any[]>([]);
  const [especies, setEspecies] = useState<any[]>([]);
  const [sexos, setSexos] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  
  // Estados para ficha de admissão
  const [intakeOptions, setIntakeOptions] = useState<Record<string, any[]>>({});
  const [admissaoData, setAdmissaoData] = useState({
    intake_origin: "",
    intake_reason: "",
    circumstances_details: "",
    general_condition: "",
    behavior_entry: "",
    body_condition: "",
    weight_kg: "",
    temperature_celsius: "",
    symptoms: [] as string[],
    physical_exam_notes: "",
    behavioral_notes: "",
    immediate_actions: [] as string[],
    immediate_actions_notes: "",
    prognosis: "",
    treatment_plan: "",
    special_needs: "",
    injuries: [] as any[]
  });

  // Auto-save draft quando muda de aba
  const [draftSaved, setDraftSaved] = useState(false);

  // Função para salvar rascunho
  const saveDraft = () => {
    try {
      localStorage.setItem('novo_animal_draft', JSON.stringify({
        formData,
        timestamp: new Date().toISOString(),
        activeTab
      }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    }
  };

  // Carregar rascunho ao iniciar
  useEffect(() => {
    try {
      const draft = localStorage.getItem('novo_animal_draft');
      if (draft) {
        const { formData: draftData, timestamp, activeTab: draftTab } = JSON.parse(draft);
        const draftAge = Date.now() - new Date(timestamp).getTime();
        
        // Se o rascunho tem menos de 24 horas
        if (draftAge < 24 * 60 * 60 * 1000) {
          toast({
            title: "📝 Rascunho Encontrado",
            description: `Rascunho de ${new Date(timestamp).toLocaleString('pt-PT')} carregado`,
          });
          setFormData(draftData);
          setActiveTab(draftTab || "basico");
        }
      }
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
    }
  }, []);

  // Auto-save quando formData muda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.nome || formData.especie) { // Só salva se tem dados
        saveDraft();
      }
    }, 2000); // 2 segundos após parar de digitar

    return () => clearTimeout(timer);
  }, [formData]);

  // Função para obter ícone da espécie
  const getEspecieIcon = (especie: any) => {
    if (especie.icone) {
      return especie.icone;
    }
    const nome = especie.nome.toLowerCase();
    if (nome.includes('cão') || nome.includes('cao')) return '🐕';
    if (nome.includes('gato')) return '🐱';
    if (nome.includes('coelho')) return '🐰';
    if (nome.includes('hamster')) return '🐹';
    if (nome.includes('pássaro') || nome.includes('passaro') || nome.includes('ave')) return '🐦';
    if (nome.includes('peixe')) return '🐠';
    if (nome.includes('tartaruga')) return '🐢';
    return '🐾';
  };

  // Função para obter ícone do sexo
  const getSexoIcon = (sexo: any) => {
    const nome = sexo.nome.toLowerCase();
    if (nome.includes('macho')) return '♂️';
    if (nome.includes('fêmea') || nome.includes('femea')) return '♀️';
    if (nome.includes('indeterminado')) return '❓';
    return '';
  };

  // Função para sugerir grupo automaticamente baseado na espécie
  const suggestGroupForSpecies = (especie: string) => {
    if (!especie || grupos.length === 0) return;
    
    let suggestedGroup = null;
    
    if (especie === 'Cão') {
      suggestedGroup = grupos.find(grupo => 
        grupo.tipo && grupo.tipo.toLowerCase().includes('matilha') && grupo.ativo
      );
    } else if (especie === 'Gato') {
      suggestedGroup = grupos.find(grupo => 
        grupo.tipo && (grupo.tipo.toLowerCase().includes('colónia') || grupo.tipo.toLowerCase().includes('colonia')) && grupo.ativo
      );
    } else {
      suggestedGroup = grupos.find(grupo => 
        grupo.tipo && 
        !grupo.tipo.toLowerCase().includes('matilha') && 
        !grupo.tipo.toLowerCase().includes('colónia') && 
        !grupo.tipo.toLowerCase().includes('colonia') && 
        grupo.ativo
      );
    }
    
    if (suggestedGroup && !formData.grupo_id) {
      setFormData(prev => ({ ...prev, grupo_id: suggestedGroup.id }));
      toast({
        title: "🏠 Grupo Sugerido",
        description: `${especie === 'Cão' ? '🐕' : especie === 'Gato' ? '🐱' : '🐾'} Sugerimos o grupo "${suggestedGroup.nome}" para esta espécie`,
      });
    }
  };

  const generateNextProcessNumber = async (): Promise<string> => {
    try {
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString().slice(-2);
      
      const { data, error } = await supabase
        .from('animais')
        .select('numero_processo')
        .not('numero_processo', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      let nextSequence = 1;
      
      if (data && data.length > 0) {
        const currentYearNumbers = data
          .filter(animal => animal.numero_processo && animal.numero_processo.startsWith(`P${yearSuffix}`))
          .map(animal => {
            const match = animal.numero_processo.match(/P\\d{2}(\\d{3})/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => num > 0);

        if (currentYearNumbers.length > 0) {
          nextSequence = Math.max(...currentYearNumbers) + 1;
        }
      }

      return `P${yearSuffix}${nextSequence.toString().padStart(3, '0')}`;

    } catch (error) {
      console.error('Erro ao gerar número de processo:', error);
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString().slice(-2);
      const timestamp = Date.now().toString().slice(-3);
      return `P${yearSuffix}${timestamp}`;
    }
  };

  const fetchGrupos = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .eq('ativo', true)
        .order('tipo')
        .order('nome');

      if (error) throw error;
      setGrupos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const fetchEspecies = async () => {
    try {
      const { data, error } = await supabase
        .from('especies')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setEspecies(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar espécies:', error);
    }
  };

  const fetchSexos = async () => {
    try {
      const { data, error } = await supabase
        .from('sexos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setSexos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar sexos:', error);
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

  const fetchIntakeOptions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_intake_config_options');

      if (error) throw error;
      
      // Organizar por domínio
      const optionsByDomain: Record<string, any[]> = {};
      (data || []).forEach((option: any) => {
        if (!optionsByDomain[option.domain]) {
          optionsByDomain[option.domain] = [];
        }
        optionsByDomain[option.domain].push(option);
      });
      
      setIntakeOptions(optionsByDomain);
    } catch (error: any) {
      console.error('Erro ao carregar opções de admissão:', error);
    }
  };

  useEffect(() => {
    fetchGrupos();
    fetchEspecies();
    fetchSexos();
    fetchVoluntarios();
    fetchIntakeOptions();
    generateNextProcessNumber().then(setNumeroProcesso);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Sugerir grupo quando espécie muda
    if (field === 'especie') {
      suggestGroupForSpecies(value);
    }
  };

  const handleAdmissaoChange = (field: string, value: string | string[]) => {
    setAdmissaoData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string, optionCode: string, checked: boolean) => {
    setAdmissaoData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, optionCode] };
      } else {
        return { ...prev, [field]: currentArray.filter(code => code !== optionCode) };
      }
    });
  };

  const addInjury = () => {
    const newInjury = {
      id: Date.now().toString(),
      injury_type: "",
      injury_severity: "",
      body_location: "",
      description: "",
      treatment_given: "",
      requires_followup: false,
      followup_date: ""
    };
    setAdmissaoData(prev => ({
      ...prev,
      injuries: [...prev.injuries, newInjury]
    }));
  };

  const removeInjury = (injuryId: string) => {
    setAdmissaoData(prev => ({
      ...prev,
      injuries: prev.injuries.filter(injury => injury.id !== injuryId)
    }));
  };

  const updateInjury = (injuryId: string, field: string, value: any) => {
    setAdmissaoData(prev => ({
      ...prev,
      injuries: prev.injuries.map(injury => 
        injury.id === injuryId ? { ...injury, [field]: value } : injury
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.especie) {
      newErrors.especie = "Espécie é obrigatória";
    }

    if (!formData.sexo) {
      newErrors.sexo = "Sexo é obrigatório";
    }

    if (!formData.voluntario_responsavel) {
      newErrors.voluntario_responsavel = "Voluntário responsável é obrigatório";
    }

    if (!formData.data_entrada) {
      newErrors.data_entrada = "Data de entrada é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "❌ Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const animalData = {
        numero_processo: numeroProcesso,
        nome: formData.nome.trim(),
        especie: formData.especie,
        raca: formData.raca.trim() || null,
        sexo: formData.sexo,
        idade_estimada: formData.idade_estimada ? parseInt(formData.idade_estimada) : null,
        data_nascimento: formData.data_nascimento || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        cor: formData.cor.trim() || null,
        caracteristicas_fisicas: formData.caracteristicas_fisicas.trim() || null,
        transponder: formData.transponder.trim() || null,
        local_encontrado: formData.local_encontrado.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        grupo_id: formData.grupo_id || null,
        url_fotografia: formData.url_fotografia ? convertGoogleDriveUrl(formData.url_fotografia) : null,
        voluntario_responsavel: formData.voluntario_responsavel,
        data_entrada: formData.data_entrada,
        estado: 'Ativo'
      };

      const { data, error } = await supabase
        .from('animais')
        .insert([animalData])
        .select()
        .single();

      if (error) throw error;

      // Salvar ficha de admissão se preenchida
      const hasIntakeData = admissaoData.intake_origin || 
                           admissaoData.general_condition || 
                           admissaoData.symptoms.length > 0 || 
                           admissaoData.immediate_actions.length > 0 ||
                           admissaoData.physical_exam_notes ||
                           admissaoData.behavioral_notes;

      if (hasIntakeData) {
        try {
          const intakeAssessmentData = {
            animal_id: data.id,
            assessment_date: new Date().toISOString(),
            assessed_by: formData.voluntario_responsavel || null,
            intake_origin: admissaoData.intake_origin || null,
            intake_reason: admissaoData.intake_reason || null,
            circumstances_details: admissaoData.circumstances_details || null,
            general_condition: admissaoData.general_condition || null,
            behavior_entry: admissaoData.behavior_entry || null,
            body_condition: admissaoData.body_condition || null,
            weight_kg: admissaoData.weight_kg ? parseFloat(admissaoData.weight_kg) : null,
            temperature_celsius: admissaoData.temperature_celsius ? parseFloat(admissaoData.temperature_celsius) : null,
            symptoms: JSON.stringify(admissaoData.symptoms),
            physical_exam_notes: admissaoData.physical_exam_notes || null,
            behavioral_notes: admissaoData.behavioral_notes || null,
            immediate_actions: JSON.stringify(admissaoData.immediate_actions),
            immediate_actions_notes: admissaoData.immediate_actions_notes || null,
            prognosis: admissaoData.prognosis || null,
            treatment_plan: admissaoData.treatment_plan || null,
            special_needs: admissaoData.special_needs || null,
            is_complete: true
          };

          const { error: intakeError } = await supabase
            .from('animal_intake_assessments')
            .insert([intakeAssessmentData]);

          if (intakeError) {
            console.error('Erro ao salvar ficha de admissão:', intakeError);
            // Não bloquear a criação do animal por erro na ficha
            toast({
              title: "⚠️ Animal Criado com Aviso",
              description: "Animal registado, mas houve erro ao salvar a ficha de admissão",
              variant: "destructive",
            });
          } else {
            toast({
              title: "✅ Animal e Ficha Registados!",
              description: `${formData.nome} foi adicionado com ficha de admissão completa`,
            });
          }
        } catch (intakeError) {
          console.error('Erro ao processar ficha de admissão:', intakeError);
        }
      } else {
        toast({
          title: "✅ Animal Registado com Sucesso!",
          description: `${formData.nome} foi adicionado com o número de processo ${numeroProcesso}`,
        });
      }

      // Limpar rascunho após sucesso
      localStorage.removeItem('novo_animal_draft');

      navigate(`/animal/${data.id}`);

    } catch (error: any) {
      console.error('Erro ao criar animal:', error);
      toast({
        title: "❌ Erro ao Registar Animal",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Componente de resumo fixo
  const ResumoFixo = () => (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <PawPrint className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-800">
                {formData.nome || "Novo Animal"}
              </span>
            </div>
            {formData.especie && (
              <div className="flex items-center space-x-1">
                <span className="text-lg">
                  {especies.find(e => e.nome === formData.especie) ? 
                    getEspecieIcon(especies.find(e => e.nome === formData.especie)) : '🐾'}
                </span>
                <span className="text-sm text-gray-600">{formData.especie}</span>
              </div>
            )}
            {formData.sexo && (
              <div className="flex items-center space-x-1">
                <span className="text-lg">
                  {sexos.find(s => s.nome === formData.sexo) ? 
                    getSexoIcon(sexos.find(s => s.nome === formData.sexo)) : ''}
                </span>
                <span className="text-sm text-gray-600">{formData.sexo}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div>
              <strong>Data Entrada:</strong> {formData.data_entrada || 'Não definida'}
            </div>
            <div>
              <strong>Processo:</strong> {numeroProcesso}
            </div>
            {draftSaved && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Rascunho salvo</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <PageActionBar
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Animais", href: "/animais" },
          { label: "Novo Animal", href: "/novo-animal" }
        ]}
        primaryActions={
          <Button
            variant="outline"
            onClick={() => navigate('/animais')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto"> {/* Expandido para aproveitar mais espaço */}
          
          {/* Layout Responsivo: 2 colunas em desktop, 1 coluna em mobile */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Coluna Principal - Formulário (3/4 da largura em desktop) */}
            <div className="xl:col-span-3">
              {/* Sistema de Abas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-6 w-6" />
                    Registar Novo Animal
                  </CardTitle>
                  <CardDescription>
                    Preencha as informações do animal. A ficha de admissão é opcional e pode ser preenchida posteriormente.
                  </CardDescription>
                </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basico" className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4" />
                      Básico
                    </TabsTrigger>
                    <TabsTrigger value="adicionais" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Adicionais
                    </TabsTrigger>
                    <TabsTrigger value="admissao" className="flex items-center gap-2">
                      <Clipboard className="h-4 w-4" />
                      Admissão
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Opcional</span>
                    </TabsTrigger>
                    <TabsTrigger value="anexos" className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Anexos
                    </TabsTrigger>
                  </TabsList>

                  {/* ABA 1: BÁSICO */}
                  <TabsContent value="basico" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"> {/* 3 colunas em desktop */}
                      
                      {/* Nome */}
                      <div>
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => handleInputChange("nome", e.target.value)}
                          placeholder="Nome do animal"
                          className={errors.nome ? "border-red-500" : ""}
                        />
                        {errors.nome && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.nome}
                          </p>
                        )}
                      </div>

                      {/* Espécie */}
                      <div>
                        <Label htmlFor="especie">Espécie *</Label>
                        <Select 
                          value={formData.especie} 
                          onValueChange={(value) => handleInputChange("especie", value)}
                        >
                          <SelectTrigger className={errors.especie ? "border-red-500" : ""}>
                            <SelectValue placeholder="Selecionar espécie" />
                          </SelectTrigger>
                          <SelectContent>
                            {especies.map((especie) => (
                              <SelectItem key={especie.id} value={especie.nome}>
                                <div className="flex items-center">
                                  <span className="mr-2">{getEspecieIcon(especie)}</span>
                                  {especie.nome}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.especie && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.especie}
                          </p>
                        )}
                      </div>

                      {/* Raça */}
                      <div>
                        <Label htmlFor="raca">Raça</Label>
                        <Input
                          id="raca"
                          value={formData.raca}
                          onChange={(e) => handleInputChange("raca", e.target.value)}
                          placeholder="Raça do animal (opcional)"
                        />
                      </div>

                      {/* Sexo */}
                      <div>
                        <Label htmlFor="sexo">Sexo *</Label>
                        <Select 
                          value={formData.sexo} 
                          onValueChange={(value) => handleInputChange("sexo", value)}
                        >
                          <SelectTrigger className={errors.sexo ? "border-red-500" : ""}>
                            <SelectValue placeholder="Selecionar sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            {sexos.map((sexo) => (
                              <SelectItem key={sexo.id} value={sexo.nome}>
                                <div className="flex items-center">
                                  <span className="mr-2">{getSexoIcon(sexo)}</span>
                                  {sexo.nome}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.sexo && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.sexo}
                          </p>
                        )}
                      </div>

                      {/* Idade Estimada */}
                      <div>
                        <Label htmlFor="idade_estimada">Idade Estimada (meses)</Label>
                        <Input
                          id="idade_estimada"
                          type="number"
                          min="0"
                          max="300"
                          value={formData.idade_estimada}
                          onChange={(e) => handleInputChange("idade_estimada", e.target.value)}
                          placeholder="Ex: 24"
                        />
                      </div>

                      {/* Data de Nascimento */}
                      <div>
                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                        <Input
                          id="data_nascimento"
                          type="date"
                          value={formData.data_nascimento}
                          onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                        />
                      </div>

                      {/* Peso */}
                      <div>
                        <Label htmlFor="peso">Peso (kg)</Label>
                        <Input
                          id="peso"
                          type="number"
                          step="0.1"
                          min="0"
                          value={formData.peso}
                          onChange={(e) => handleInputChange("peso", e.target.value)}
                          placeholder="Ex: 15.5"
                        />
                      </div>

                      {/* Cor */}
                      <div>
                        <Label htmlFor="cor">Cor</Label>
                        <Input
                          id="cor"
                          value={formData.cor}
                          onChange={(e) => handleInputChange("cor", e.target.value)}
                          placeholder="Ex: Castanho, Preto e branco"
                        />
                      </div>
                    </div>

                    {/* Características Físicas */}
                    <div>
                      <Label htmlFor="caracteristicas_fisicas">Características Físicas</Label>
                      <Textarea
                        id="caracteristicas_fisicas"
                        value={formData.caracteristicas_fisicas}
                        onChange={(e) => handleInputChange("caracteristicas_fisicas", e.target.value)}
                        placeholder="Descreva características distintivas do animal..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  {/* ABA 2: ADICIONAIS */}
                  <TabsContent value="adicionais" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"> {/* 3 colunas em desktop */}
                      
                      {/* Transponder/Chip */}
                      <div>
                        <Label htmlFor="transponder">Transponder/Chip</Label>
                        <Input
                          id="transponder"
                          value={formData.transponder}
                          onChange={(e) => handleInputChange("transponder", e.target.value)}
                          placeholder="Número do chip (se aplicável)"
                        />
                      </div>

                      {/* Local Encontrado */}
                      <div>
                        <Label htmlFor="local_encontrado">Local Encontrado</Label>
                        <Input
                          id="local_encontrado"
                          value={formData.local_encontrado}
                          onChange={(e) => handleInputChange("local_encontrado", e.target.value)}
                          placeholder="Ex: Rua das Flores, Lisboa"
                        />
                      </div>

                      {/* Data de Entrada */}
                      <div>
                        <Label htmlFor="data_entrada">Data de Entrada *</Label>
                        <Input
                          id="data_entrada"
                          type="date"
                          value={formData.data_entrada}
                          onChange={(e) => handleInputChange("data_entrada", e.target.value)}
                          className={errors.data_entrada ? "border-red-500" : ""}
                        />
                        {errors.data_entrada && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.data_entrada}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Voluntário Responsável - BUG CORRIGIDO */}
                    <div>
                      <VoluntarioSelector
                        value={formData.voluntario_responsavel}
                        onValueChange={(voluntarioId, voluntario) => {
                          handleInputChange("voluntario_responsavel", voluntarioId);
                        }}
                        label="Voluntário Responsável" // REMOVIDO asterisco duplicado
                        placeholder="Selecionar voluntário responsável..."
                        showFullName={true}
                        required={true}
                        className={errors.voluntario_responsavel ? "border-red-500" : ""}
                      />
                      {errors.voluntario_responsavel && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.voluntario_responsavel}
                        </p>
                      )}
                      <p className="text-sm text-blue-600 mt-1">
                        🐾 Este voluntário será responsável pelo cuidado do animal
                      </p>
                    </div>

                    {/* Seleção de Grupo */}
                    <div>
                      <Label htmlFor="grupo_id">Grupo (Matilha/Colónia)</Label>
                      <Select 
                        value={formData.grupo_id} 
                        onValueChange={(value) => handleInputChange("grupo_id", value === "none" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar grupo (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum grupo</SelectItem>
                          {grupos
                            .filter(grupo => {
                              if (!formData.especie) return true;
                              
                              if (formData.especie === 'Cão') {
                                return !(grupo.tipo && (grupo.tipo.toLowerCase().includes('colónia') || grupo.tipo.toLowerCase().includes('colonia')));
                              } else if (formData.especie === 'Gato') {
                                return !(grupo.tipo && grupo.tipo.toLowerCase().includes('matilha'));
                              } else {
                                return !(grupo.tipo && (
                                  grupo.tipo.toLowerCase().includes('matilha') || 
                                  grupo.tipo.toLowerCase().includes('colónia') || 
                                  grupo.tipo.toLowerCase().includes('colonia')
                                ));
                              }
                            })
                            .map((grupo) => (
                              <SelectItem key={grupo.id} value={grupo.id}>
                                <div className="flex items-center">
                                  {grupo.tipo && grupo.tipo.toLowerCase().includes('matilha') ? '🐕' : 
                                   grupo.tipo && (grupo.tipo.toLowerCase().includes('colónia') || grupo.tipo.toLowerCase().includes('colonia')) ? '🐱' : '🏠'} {grupo.nome}
                                  <span className="text-xs text-gray-500 ml-2">({grupo.tipo})</span>
                                </div>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Observações */}
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange("observacoes", e.target.value)}
                        placeholder="Observações gerais sobre o animal..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  {/* ABA 3: FICHA DE ADMISSÃO COMPLETA */}
                  <TabsContent value="admissao" className="space-y-6 mt-6">
                    
                    {/* Cabeçalho da Ficha */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Clipboard className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Ficha de Admissão / Condição à Entrada
                          </h3>
                          <p className="text-sm text-gray-600">
                            ✨ Opcional - Preencha para um registo mais completo
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 1. CIRCUNSTÂNCIAS DA ADMISSÃO */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Circunstâncias da Admissão
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Origem */}
                          <div>
                            <Label>Origem da Admissão</Label>
                            <Select 
                              value={admissaoData.intake_origin} 
                              onValueChange={(value) => handleAdmissaoChange("intake_origin", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Como chegou à instituição?" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.intake_origin || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Razão */}
                          <div>
                            <Label>Razão da Admissão</Label>
                            <Select 
                              value={admissaoData.intake_reason} 
                              onValueChange={(value) => handleAdmissaoChange("intake_reason", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Motivo principal" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.intake_reason || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Detalhes das Circunstâncias */}
                        <div>
                          <Label>Detalhes das Circunstâncias</Label>
                          <Textarea
                            value={admissaoData.circumstances_details}
                            onChange={(e) => handleAdmissaoChange("circumstances_details", e.target.value)}
                            placeholder="Descreva as circunstâncias detalhadas da admissão..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. TRIAGEM IMEDIATA */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Stethoscope className="h-5 w-5 text-green-600" />
                          Triagem Imediata
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Estado Geral */}
                          <div>
                            <Label>Estado Geral</Label>
                            <Select 
                              value={admissaoData.general_condition} 
                              onValueChange={(value) => handleAdmissaoChange("general_condition", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Condição geral" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.general_condition || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Comportamento */}
                          <div>
                            <Label>Comportamento</Label>
                            <Select 
                              value={admissaoData.behavior_entry} 
                              onValueChange={(value) => handleAdmissaoChange("behavior_entry", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Comportamento observado" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.behavior_entry || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Condição Corporal */}
                          <div>
                            <Label>Condição Corporal</Label>
                            <Select 
                              value={admissaoData.body_condition} 
                              onValueChange={(value) => handleAdmissaoChange("body_condition", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Condição física" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.body_condition || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Peso na Admissão */}
                          <div>
                            <Label className="flex items-center gap-2">
                              <Weight className="h-4 w-4" />
                              Peso na Admissão (kg)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              value={admissaoData.weight_kg}
                              onChange={(e) => handleAdmissaoChange("weight_kg", e.target.value)}
                              placeholder="Ex: 15.5"
                            />
                          </div>

                          {/* Temperatura */}
                          <div>
                            <Label className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4" />
                              Temperatura (°C)
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="30"
                              max="45"
                              value={admissaoData.temperature_celsius}
                              onChange={(e) => handleAdmissaoChange("temperature_celsius", e.target.value)}
                              placeholder="Ex: 38.5"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 3. SINAIS E SINTOMAS */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Activity className="h-5 w-5 text-orange-600" />
                          Sinais e Sintomas Observados
                        </CardTitle>
                        <CardDescription>
                          Selecione todos os sintomas observados no momento da admissão
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(intakeOptions.symptoms || []).map((symptom) => (
                            <div key={symptom.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={`symptom-${symptom.code}`}
                                checked={admissaoData.symptoms.includes(symptom.code)}
                                onCheckedChange={(checked) => 
                                  handleMultiSelectChange("symptoms", symptom.code, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`symptom-${symptom.code}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {symptom.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 4. AÇÕES IMEDIATAS */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Heart className="h-5 w-5 text-red-600" />
                          Ações Imediatas Realizadas
                        </CardTitle>
                        <CardDescription>
                          Selecione todas as ações que foram tomadas imediatamente
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(intakeOptions.immediate_actions || []).map((action) => (
                            <div key={action.code} className="flex items-center space-x-2">
                              <Checkbox
                                id={`action-${action.code}`}
                                checked={admissaoData.immediate_actions.includes(action.code)}
                                onCheckedChange={(checked) => 
                                  handleMultiSelectChange("immediate_actions", action.code, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`action-${action.code}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {action.name}
                              </Label>
                            </div>
                          ))}
                        </div>

                        {/* Detalhes das Ações */}
                        <div>
                          <Label>Detalhes das Ações Realizadas</Label>
                          <Textarea
                            value={admissaoData.immediate_actions_notes}
                            onChange={(e) => handleAdmissaoChange("immediate_actions_notes", e.target.value)}
                            placeholder="Descreva detalhadamente as ações tomadas..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* 5. OBSERVAÇÕES CLÍNICAS */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-5 w-5 text-purple-600" />
                          Observações Clínicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Notas do Exame Físico */}
                          <div>
                            <Label>Notas do Exame Físico</Label>
                            <Textarea
                              value={admissaoData.physical_exam_notes}
                              onChange={(e) => handleAdmissaoChange("physical_exam_notes", e.target.value)}
                              placeholder="Observações do exame físico..."
                              rows={4}
                            />
                          </div>

                          {/* Observações Comportamentais */}
                          <div>
                            <Label>Observações Comportamentais</Label>
                            <Textarea
                              value={admissaoData.behavioral_notes}
                              onChange={(e) => handleAdmissaoChange("behavioral_notes", e.target.value)}
                              placeholder="Comportamento, temperamento, socialização..."
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Prognóstico */}
                          <div>
                            <Label>Prognóstico Inicial</Label>
                            <Select 
                              value={admissaoData.prognosis} 
                              onValueChange={(value) => handleAdmissaoChange("prognosis", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Avaliação do prognóstico" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">Excelente</SelectItem>
                                <SelectItem value="good">Bom</SelectItem>
                                <SelectItem value="fair">Razoável</SelectItem>
                                <SelectItem value="guarded">Reservado</SelectItem>
                                <SelectItem value="poor">Mau</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Plano de Tratamento */}
                          <div>
                            <Label>Plano de Tratamento</Label>
                            <Textarea
                              value={admissaoData.treatment_plan}
                              onChange={(e) => handleAdmissaoChange("treatment_plan", e.target.value)}
                              placeholder="Plano de cuidados e tratamento..."
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Necessidades Especiais */}
                        <div>
                          <Label>Necessidades Especiais</Label>
                          <Textarea
                            value={admissaoData.special_needs}
                            onChange={(e) => handleAdmissaoChange("special_needs", e.target.value)}
                            placeholder="Cuidados especiais, restrições, medicação..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Resumo da Ficha */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-800 mb-2">Resumo da Ficha de Admissão</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Origem:</span>
                          <div className="font-medium">
                            {admissaoData.intake_origin ? 
                              intakeOptions.intake_origin?.find(o => o.code === admissaoData.intake_origin)?.name || 'N/A'
                              : 'Não definida'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Estado Geral:</span>
                          <div className="font-medium">
                            {admissaoData.general_condition ? 
                              intakeOptions.general_condition?.find(o => o.code === admissaoData.general_condition)?.name || 'N/A'
                              : 'Não avaliado'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Sintomas:</span>
                          <div className="font-medium">{admissaoData.symptoms.length} selecionados</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Ações:</span>
                          <div className="font-medium">{admissaoData.immediate_actions.length} realizadas</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ABA 4: ANEXOS */}
                  <TabsContent value="anexos" className="space-y-6 mt-6">
                    <div>
                      <Label htmlFor="url_fotografia">URL da Fotografia</Label>
                      <Input
                        id="url_fotografia"
                        type="url"
                        value={formData.url_fotografia}
                        onChange={(e) => handleInputChange("url_fotografia", e.target.value)}
                        placeholder="Cole o URL do Google Drive ou link direto da imagem"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        📸 Aceita URLs do Google Drive (serão convertidos automaticamente)
                      </p>
                      {formData.url_fotografia && (
                        <div className="mt-2 space-y-2">
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>URL convertido:</strong>
                            <br />
                            <code className="text-xs break-all">{convertGoogleDriveUrl(formData.url_fotografia)}</code>
                          </div>
                          <img 
                            src={convertGoogleDriveUrl(formData.url_fotografia)} 
                            alt="Pré-visualização" 
                            className="max-w-xs h-32 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Anexos Adicionais
                      </h3>
                      <p className="text-gray-600">
                        Funcionalidade para múltiplas fotos e documentos será implementada futuramente
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Botões de Ação */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem('novo_animal_draft');
                      navigate('/animais');
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveDraft}
                    >
                      💾 Salvar Rascunho
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Registando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Registar Animal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
            </div>
            
            {/* Sidebar - Resumo e Informações (1/4 da largura em desktop) */}
            <div className="xl:col-span-1">
              <div className="sticky top-8 space-y-6">
                
                {/* Resumo do Animal */}
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PawPrint className="h-5 w-5 text-blue-600" />
                      Resumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Nome e Espécie */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Nome:</span>
                        <span className="font-semibold text-gray-800">
                          {formData.nome || "Não definido"}
                        </span>
                      </div>
                      
                      {formData.especie && (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {especies.find(e => e.nome === formData.especie) ? 
                              getEspecieIcon(especies.find(e => e.nome === formData.especie)) : '🐾'}
                          </span>
                          <span className="text-sm text-gray-600">{formData.especie}</span>
                          {formData.raca && (
                            <span className="text-xs text-gray-500">({formData.raca})</span>
                          )}
                        </div>
                      )}
                      
                      {formData.sexo && (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {sexos.find(s => s.nome === formData.sexo) ? 
                              getSexoIcon(sexos.find(s => s.nome === formData.sexo)) : ''}
                          </span>
                          <span className="text-sm text-gray-600">{formData.sexo}</span>
                        </div>
                      )}
                    </div>

                    {/* Informações Básicas */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processo:</span>
                        <span className="font-medium">{numeroProcesso}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Entrada:</span>
                        <span className="font-medium">
                          {formData.data_entrada ? 
                            new Date(formData.data_entrada).toLocaleDateString('pt-PT') : 
                            'Não definida'
                          }
                        </span>
                      </div>
                      
                      {formData.peso && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Peso:</span>
                          <span className="font-medium">{formData.peso} kg</span>
                        </div>
                      )}
                      
                      {formData.idade_estimada && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Idade:</span>
                          <span className="font-medium">{formData.idade_estimada} meses</span>
                        </div>
                      )}
                    </div>

                    {/* Status do Rascunho */}
                    {draftSaved && (
                      <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Rascunho salvo</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Progresso das Abas */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Progresso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    
                    {/* Aba Básico */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        formData.nome && formData.especie && formData.sexo ? 
                        'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Informações Básicas</span>
                    </div>
                    
                    {/* Aba Adicionais */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        formData.voluntario_responsavel && formData.data_entrada ? 
                        'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Informações Adicionais</span>
                    </div>
                    
                    {/* Aba Admissão */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        admissaoData.intake_origin || admissaoData.general_condition ? 
                        'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Ficha de Admissão</span>
                    </div>
                    
                    {/* Aba Anexos */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        formData.url_fotografia ? 'bg-purple-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Anexos</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Dicas Rápidas */}
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-amber-800">💡 Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-amber-700">
                    <p>• Campos com * são obrigatórios</p>
                    <p>• A ficha de admissão é opcional</p>
                    <p>• O rascunho é salvo automaticamente</p>
                    <p>• URLs do Google Drive são convertidos automaticamente</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default NovoAnimal;