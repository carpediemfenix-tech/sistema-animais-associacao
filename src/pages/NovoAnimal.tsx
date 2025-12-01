import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NovoAnimal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [numeroProcesso, setNumeroProcesso] = useState<string>("");

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
    url_fotografia: "", // Nova: URL da fotografia
    voluntario_responsavel_id: "", // Nova: Voluntário responsável (obrigatório)
    data_entrada: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grupos, setGrupos] = useState<any[]>([]);
  const [especies, setEspecies] = useState<any[]>([]);
  const [sexos, setSexos] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);

  // Função para obter ícone da espécie
  const getEspecieIcon = (especie: any) => {
    if (especie.icone) {
      return especie.icone;
    }
    // Ícones padrão baseados no nome
    const nome = especie.nome.toLowerCase();
    if (nome.includes('cão') || nome.includes('cao')) return '🐕';
    if (nome.includes('gato')) return '🐱';
    if (nome.includes('coelho')) return '🐰';
    if (nome.includes('hamster')) return '🐹';
    if (nome.includes('pássaro') || nome.includes('passaro') || nome.includes('ave')) return '🐦';
    if (nome.includes('peixe')) return '🐠';
    if (nome.includes('tartaruga')) return '🐢';
    return '🐾'; // Ícone padrão
  };

  // Função para obter ícone do sexo
  const getSexoIcon = (sexo: any) => {
    const nome = sexo.nome.toLowerCase();
    if (nome.includes('macho')) return '♂️';
    if (nome.includes('fêmea') || nome.includes('femea')) return '♀️';
    if (nome.includes('indeterminado')) return '❓';
    return '';
  };

  // Função para sugerir grupo automaticamente baseado na espécie - CORRIGIDA
  const suggestGroupForSpecies = (especie: string) => {
    if (!especie || grupos.length === 0) return;
    
    console.log('🔍 Sugerindo grupo para espécie:', especie);
    console.log('📋 Grupos disponíveis:', grupos.map(g => ({ nome: g.nome, tipo: g.tipo })));
    
    let suggestedGroup = null;
    
    if (especie === 'Cão') {
      // Procurar matilha disponível (tipo contém "Matilha")
      suggestedGroup = grupos.find(grupo => 
        grupo.tipo && grupo.tipo.toLowerCase().includes('matilha') && grupo.ativo
      );
      console.log('🐕 Matilha encontrada:', suggestedGroup);
    } else if (especie === 'Gato') {
      // Procurar colónia disponível (tipo contém "colónia" ou "colonia")
      suggestedGroup = grupos.find(grupo => 
        grupo.tipo && (grupo.tipo.toLowerCase().includes('colónia') || grupo.tipo.toLowerCase().includes('colonia')) && grupo.ativo
      );
      console.log('🐱 Colónia encontrada:', suggestedGroup);
    } else {
      // Para outras espécies, procurar grupos que não sejam matilha nem colónia
      suggestedGroup = grupos.find(grupo => 
        grupo.tipo && 
        !grupo.tipo.toLowerCase().includes('matilha') && 
        !grupo.tipo.toLowerCase().includes('colónia') && 
        !grupo.tipo.toLowerCase().includes('colonia') && 
        grupo.ativo
      );
      console.log('🐾 Grupo genérico encontrado:', suggestedGroup);
    }
    
    if (suggestedGroup && !formData.grupo_id) {
      setFormData(prev => ({ ...prev, grupo_id: suggestedGroup.id }));
      toast({
        title: "🏠 Grupo Sugerido",
        description: `${especie === 'Cão' ? '🐕' : especie === 'Gato' ? '🐱' : '🐾'} Sugerimos o grupo "${suggestedGroup.nome}" para esta espécie`,
      });
      console.log('✅ Grupo sugerido e selecionado:', suggestedGroup.nome);
    } else {
      console.log('❌ Nenhum grupo adequado encontrado ou já existe seleção');
    }
  };

  const generateNextProcessNumber = async (): Promise<string> => {
    try {
      console.log('Gerando número de processo...');
      
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString().slice(-2);
      
      // Buscar todos os animais para encontrar o último número
      const { data, error } = await supabase
        .from('animais')
        .select('numero_processo')
        .not('numero_processo', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar animais:', error);
        throw error;
      }

      console.log('Animais encontrados:', data?.length || 0);
      
      let nextSequence = 1;
      
      if (data && data.length > 0) {
        // Filtrar apenas os números do ano atual e encontrar o maior
        const currentYearNumbers = data
          .filter(animal => animal.numero_processo && animal.numero_processo.startsWith(`P${yearSuffix}`))
          .map(animal => {
            const match = animal.numero_processo.match(/P\d{2}(\d{3})/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => num > 0);

        if (currentYearNumbers.length > 0) {
          nextSequence = Math.max(...currentYearNumbers) + 1;
        }
      }

      const processNumber = `P${yearSuffix}${nextSequence.toString().padStart(3, '0')}`;
      console.log('Número de processo gerado:', processNumber);
      return processNumber;

    } catch (error) {
      console.error('Erro ao gerar número de processo:', error);
      // Fallback: usar timestamp
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString().slice(-2);
      const timestamp = Date.now().toString().slice(-3);
      const fallbackNumber = `P${yearSuffix}${timestamp}`;
      console.log('Usando número fallback:', fallbackNumber);
      return fallbackNumber;
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
      console.log('📋 Grupos carregados:', data?.map(g => ({ nome: g.nome, tipo: g.tipo })));
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
      console.log('⚧ Sexos carregados:', data?.map(s => s.nome));
    } catch (error: any) {
      console.error('Erro ao carregar sexos:', error);
    }
  };

  // CORREÇÃO: Implementação simples que funcionava antes
  const fetchVoluntarios = async () => {
    try {
      console.log('🔄 Carregando voluntários...');
      
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao carregar voluntários:', error);
        throw error;
      }

      console.log('✅ Voluntários carregados:', data?.length || 0);
      console.log('📋 Dados dos voluntários:', data);
      setVoluntarios(data || []);
      
    } catch (error: any) {
      console.error('❌ Erro geral ao carregar voluntários:', error);
      toast({
        title: "Erro ao carregar voluntários",
        description: error.message || "Não foi possível carregar a lista de voluntários",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        generateNextProcessNumber().then(setNumeroProcesso),
        fetchGrupos(),
        fetchEspecies(),
        fetchSexos(),
        fetchVoluntarios()
      ]);
    };

    initializeData();
  }, []);

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

    if (!formData.data_entrada) {
      newErrors.data_entrada = "Data de entrada é obrigatória";
    }

    if (!formData.voluntario_responsavel_id) {
      newErrors.voluntario_responsavel_id = "Voluntário responsável é obrigatório";
    }

    if (formData.idade_estimada && (isNaN(Number(formData.idade_estimada)) || Number(formData.idade_estimada) < 0)) {
      newErrors.idade_estimada = "Idade deve ser um número válido";
    }

    if (formData.peso && (isNaN(Number(formData.peso)) || Number(formData.peso) <= 0)) {
      newErrors.peso = "Peso deve ser um número válido maior que zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos em destaque",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const numeroProcessoGerado = numeroProcesso || await generateNextProcessNumber();

      const animalData = {
        numero_processo: numeroProcessoGerado,
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
        data_entrada: formData.data_entrada,
        local_encontrado: formData.local_encontrado.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        grupo_id: formData.grupo_id || null,
        url_fotografia: formData.url_fotografia.trim() || null,
        estado: 'Ativo',
        arquivado: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // LOGS DETALHADOS PARA DIAGNÓSTICO
      console.log('🔍 === DIAGNÓSTICO DE CADASTRO ===');
      console.log('📋 Dados do formulário:', formData);
      console.log('📋 Dados para inserção:', animalData);
      console.log('📅 Campo data_nascimento:', {
        original: formData.data_nascimento,
        processado: animalData.data_nascimento,
        tipo: typeof animalData.data_nascimento,
        vazio: !animalData.data_nascimento,
        valor: animalData.data_nascimento
      });
      console.log('🔢 Número de campos:', Object.keys(animalData).length);
      console.log('📋 Campos do objeto:', Object.keys(animalData));
      console.log('🎯 Tentando inserir na tabela animais...');

      const { data, error } = await supabase
        .from('animais')
        .insert([animalData])
        .select()
        .single();

      if (error) {
        console.error('❌ === ERRO DETALHADO ===');
        console.error('📋 Erro completo:', error);
        console.error('📋 Mensagem:', error.message);
        console.error('📋 Código:', error.code);
        console.error('📋 Detalhes:', error.details);
        console.error('📋 Hint:', error.hint);
        throw error;
      }

      console.log('✅ === SUCESSO ===');
      console.log('📋 Animal criado:', data);

      // Criar responsabilidade do voluntário
      const responsabilidadeData = {
        animal_id: data.id,
        voluntario_id: formData.voluntario_responsavel_id,
        tipo_responsabilidade: 'Cuidador Principal',
        data_inicio: formData.data_entrada,
        ativo: true,
        observacoes: `Responsabilidade atribuída automaticamente no cadastro do animal ${formData.nome}`,
        created_at: new Date().toISOString()
      };

      const { error: responsabilidadeError } = await supabase
        .from('responsabilidades_voluntarios')
        .insert([responsabilidadeData]);

      if (responsabilidadeError) {
        console.error('Erro ao criar responsabilidade:', responsabilidadeError);
        // Não falhar o cadastro por causa disso, apenas avisar
        toast({
          title: "Aviso",
          description: "Animal cadastrado, mas houve erro ao atribuir responsabilidade",
          variant: "destructive",
        });
      } else {
        console.log('Responsabilidade criada com sucesso');
      }

      toast({
        title: "Animal cadastrado com sucesso!",
        description: `${formData.nome} foi registado com o processo ${numeroProcessoGerado}`,
      });

      // Redirecionar para a página de detalhes do animal
      navigate(`/animal/${data.id}`);

    } catch (error: any) {
      console.error('❌ === ERRO GERAL DE CADASTRO ===');
      console.error('📋 Erro capturado:', error);
      console.error('📋 Mensagem do erro:', error.message);
      console.error('📋 Stack trace:', error.stack);
      
      toast({
        title: "Erro ao cadastrar animal",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Sugerir grupo automaticamente quando a espécie for alterada
    if (field === 'especie' && value) {
      // Usar setTimeout para garantir que o estado seja atualizado primeiro
      setTimeout(() => {
        suggestGroupForSpecies(value);
      }, 100);
    }
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <h1 className="text-xl font-bold text-gray-900">Cadastrar Novo Animal</h1>
                  <p className="text-sm text-gray-500">Preencha as informações do animal</p>
                </div>
              </div>
            </div>
            {numeroProcesso && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Processo: {numeroProcesso}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados essenciais do animal (campos obrigatórios marcados com *)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="especie">Espécie *</Label>
                  <Select value={formData.especie} onValueChange={(value) => handleInputChange("especie", value)}>
                    <SelectTrigger className={errors.especie ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      {especies.map((especie) => (
                        <SelectItem key={especie.id} value={especie.nome}>
                          {getEspecieIcon(especie)} {especie.nome}
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

                <div>
                  <Label htmlFor="raca">Raça</Label>
                  <Input
                    id="raca"
                    value={formData.raca}
                    onChange={(e) => handleInputChange("raca", e.target.value)}
                    placeholder="Raça do animal (opcional)"
                  />
                </div>

                <div>
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                    <SelectTrigger className={errors.sexo ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      {sexos.map((sexo) => (
                        <SelectItem key={sexo.id} value={sexo.nome}>
                          {getSexoIcon(sexo)} {sexo.nome}
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

                <div>
                  <Label htmlFor="idade_estimada">Idade Estimada (meses)</Label>
                  <Input
                    id="idade_estimada"
                    type="number"
                    min="0"
                    value={formData.idade_estimada}
                    onChange={(e) => handleInputChange("idade_estimada", e.target.value)}
                    placeholder="Ex: 24 (para 2 anos)"
                    className={errors.idade_estimada ? "border-red-500" : ""}
                  />
                  {errors.idade_estimada && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.idade_estimada}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                    className={errors.data_nascimento ? "border-red-500" : ""}
                  />
                  {errors.data_nascimento && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.data_nascimento}
                    </p>
                  )}
                </div>

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
                    className={errors.peso ? "border-red-500" : ""}
                  />
                  {errors.peso && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.peso}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => handleInputChange("cor", e.target.value)}
                    placeholder="Cor predominante"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="caracteristicas_fisicas">Características Físicas</Label>
                <Textarea
                  id="caracteristicas_fisicas"
                  value={formData.caracteristicas_fisicas}
                  onChange={(e) => handleInputChange("caracteristicas_fisicas", e.target.value)}
                  placeholder="Descreva características físicas distintivas..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transponder">Transponder/Chip</Label>
                  <Input
                    id="transponder"
                    value={formData.transponder}
                    onChange={(e) => handleInputChange("transponder", e.target.value)}
                    placeholder="Número do chip (se aplicável)"
                  />
                </div>

                <div>
                  <Label htmlFor="local_encontrado">Local Encontrado</Label>
                  <Input
                    id="local_encontrado"
                    value={formData.local_encontrado}
                    onChange={(e) => handleInputChange("local_encontrado", e.target.value)}
                    placeholder="Ex: Rua das Flores, Lisboa"
                  />
                </div>
              </div>

              {/* Voluntário Responsável - CORRIGIDO */}
              <div>
                <Label htmlFor="voluntario_responsavel_id">Voluntário Responsável *</Label>
                <Select 
                  value={formData.voluntario_responsavel_id} 
                  onValueChange={(value) => handleInputChange("voluntario_responsavel_id", value)}
                >
                  <SelectTrigger className={errors.voluntario_responsavel_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecionar voluntário responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {voluntarios.map((voluntario) => (
                      <SelectItem key={voluntario.id} value={voluntario.id}>
                        <div className="flex items-center">
                          <span className="font-medium">{voluntario.nome}</span>
                          {voluntario.email && (
                            <span className="text-sm text-gray-500 ml-2">({voluntario.email})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.voluntario_responsavel_id && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.voluntario_responsavel_id}
                  </p>
                )}
                <p className="text-sm text-blue-600 mt-1">
                  🐾 Este voluntário será responsável pelo cuidado do animal
                </p>
              </div>

              {/* Seleção de Grupo - CORRIGIDA */}
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
                        // LÓGICA CORRIGIDA: Exclusões específicas por espécie
                        if (!formData.especie) return true;
                        
                        if (formData.especie === 'Cão') {
                          // Cães: todos os grupos EXCETO colónias
                          return !(grupo.tipo && (grupo.tipo.toLowerCase().includes('colónia') || grupo.tipo.toLowerCase().includes('colonia')));
                        } else if (formData.especie === 'Gato') {
                          // Gatos: todos os grupos EXCETO matilhas
                          return !(grupo.tipo && grupo.tipo.toLowerCase().includes('matilha'));
                        } else {
                          // Outras espécies: TODOS os grupos (sem exclusões)
                          return true;
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
                {formData.especie && grupos.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.especie === 'Cão' 
                      ? '🐕 Cães podem escolher todos os grupos exceto colónias'
                      : formData.especie === 'Gato'
                      ? '🐱 Gatos podem escolher todos os grupos exceto matilhas'
                      : '🏠 Esta espécie pode escolher qualquer grupo disponível'
                    }
                  </p>
                )}
              </div>

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

              <div>
                <Label htmlFor="url_fotografia">URL da Fotografia</Label>
                <Input
                  id="url_fotografia"
                  type="url"
                  value={formData.url_fotografia}
                  onChange={(e) => handleInputChange("url_fotografia", e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  📸 URL da fotografia do animal (opcional)
                </p>
              </div>

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
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/animais">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cadastrar Animal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoAnimal;