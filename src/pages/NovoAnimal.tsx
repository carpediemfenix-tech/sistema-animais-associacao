import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertCircle, CheckCircle, PawPrint, Plus, FileText, Clipboard, Heart, Paperclip } from "lucide-react";
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

  useEffect(() => {
    fetchGrupos();
    fetchEspecies();
    fetchSexos();
    fetchVoluntarios();
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

      // Limpar rascunho após sucesso
      localStorage.removeItem('novo_animal_draft');

      toast({
        title: "✅ Animal Registado com Sucesso!",
        description: `${formData.nome} foi adicionado com o número de processo ${numeroProcesso}`,
      });

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
        primaryActions={[
          {
            label: "Voltar",
            href: "/animais",
            variant: "outline",
            icon: ArrowLeft
          }
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Resumo Fixo */}
          <ResumoFixo />

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
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

                  {/* ABA 3: ADMISSÃO (PLACEHOLDER) */}
                  <TabsContent value="admissao" className="space-y-6 mt-6">
                    <div className="text-center py-12 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                      <Clipboard className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Ficha de Admissão / Condição à Entrada
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Esta seção será implementada na Fase 3 e incluirá:
                      </p>
                      <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
                        <div>• Circunstâncias da ocorrência/admissão</div>
                        <div>• Triagem imediata (estado geral, comportamento)</div>
                        <div>• Avaliação física detalhada</div>
                        <div>• Ferimentos/Lesões</div>
                        <div>• Sinais e sintomas</div>
                        <div>• Ações imediatas realizadas</div>
                      </div>
                      <p className="text-blue-600 mt-4 font-medium">
                        ✨ Funcionalidade opcional - não bloqueia a criação do animal
                      </p>
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
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default NovoAnimal;