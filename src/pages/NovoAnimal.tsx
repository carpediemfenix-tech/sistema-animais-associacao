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
    data_entrada: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grupos, setGrupos] = useState<any[]>([]);

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
        
        console.log('Números do ano atual:', currentYearNumbers);
        
        if (currentYearNumbers.length > 0) {
          nextSequence = Math.max(...currentYearNumbers) + 1;
        }
      }

      const formattedSequence = nextSequence.toString().padStart(3, '0');
      const numeroProcesso = `P${yearSuffix}${formattedSequence}`;
      
      console.log('Número de processo gerado:', numeroProcesso);
      return numeroProcesso;
      
    } catch (error) {
      console.error('Erro ao gerar número de processo:', error);
      // Fallback: gerar um número baseado no timestamp
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
    } catch (error: any) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  useEffect(() => {
    fetchGrupos();
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

    if (formData.idade_estimada && (isNaN(Number(formData.idade_estimada)) || Number(formData.idade_estimada) < 0)) {
      newErrors.idade_estimada = "Idade deve ser um número válido";
    }

    // CORREÇÃO: Validar data de nascimento não pode ser futura
    if (formData.data_nascimento) {
      const dataNascimento = new Date(formData.data_nascimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
      
      if (dataNascimento > hoje) {
        newErrors.data_nascimento = "Data de nascimento não pode ser no futuro";
      }
      
      // Verificar se a data não é muito antiga (mais de 30 anos)
      const trintaAnosAtras = new Date();
      trintaAnosAtras.setFullYear(trintaAnosAtras.getFullYear() - 30);
      
      if (dataNascimento < trintaAnosAtras) {
        newErrors.data_nascimento = "Data de nascimento muito antiga (máximo 30 anos)";
      }
    }

    if (formData.peso && (isNaN(Number(formData.peso)) || Number(formData.peso) <= 0)) {
      newErrors.peso = "Peso deve ser um número válido maior que zero";
    }

    // CORREÇÃO: Validar data de entrada não pode ser futura
    if (formData.data_entrada) {
      const dataEntrada = new Date(formData.data_entrada);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Permitir data de hoje
      
      if (dataEntrada > hoje) {
        newErrors.data_entrada = "Data de entrada não pode ser no futuro";
      }
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
      // Gerar número de processo automático
      const numeroProcessoGerado = await generateNextProcessNumber();
      setNumeroProcesso(numeroProcessoGerado);

      // Calcular idade estimada se temos data de nascimento
      let idadeEstimada = formData.idade_estimada ? parseInt(formData.idade_estimada) : null;
      if (formData.data_nascimento && !formData.idade_estimada) {
        const nascimento = new Date(formData.data_nascimento);
        const hoje = new Date();
        const diffTime = Math.abs(hoje.getTime() - nascimento.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
        idadeEstimada = diffMonths;
      }

      // Preparar dados para inserção
      const dataToInsert = {
        numero_processo: numeroProcessoGerado,
        nome: formData.nome.trim(),
        especie: formData.especie,
        raca: formData.raca.trim() || null,
        sexo: formData.sexo,
        idade_estimada: idadeEstimada,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        cor: formData.cor.trim() || null,
        caracteristicas_fisicas: formData.caracteristicas_fisicas.trim() || null,
        transponder: formData.transponder.trim() || null,
        data_entrada: formData.data_entrada,
        local_encontrado: formData.local_encontrado.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        estado: 'Ativo',
        arquivado: false,
        grupo_id: formData.grupo_id || null
      };

      console.log('Dados para inserção:', dataToInsert);

      const { data, error } = await supabase
        .from('animais')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir animal:', error);
        throw error;
      }

      console.log('Animal inserido com sucesso:', data);

      toast({
        title: "Animal cadastrado com sucesso!",
        description: `${formData.nome} foi registado com o processo ${numeroProcessoGerado}`,
      });

      // Redirecionar para a página de detalhes do animal
      navigate(`/animal/${data.id}`);

    } catch (error: any) {
      console.error('Erro ao cadastrar animal:', error);
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
                      <SelectItem value="Cão">Cão</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
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
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
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
                  <p className="text-xs text-gray-500 mt-1">Se informada, a idade será calculada automaticamente</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Características Físicas */}
          <Card>
            <CardHeader>
              <CardTitle>Características Físicas</CardTitle>
              <CardDescription>
                Descrição física e identificação do animal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => handleInputChange("cor", e.target.value)}
                    placeholder="Ex: Preto e branco"
                  />
                </div>

                <div>
                  <Label htmlFor="transponder">Transponder/Chip</Label>
                  <Input
                    id="transponder"
                    value={formData.transponder}
                    onChange={(e) => handleInputChange("transponder", e.target.value)}
                    placeholder="Número do chip (se aplicável)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="caracteristicas_fisicas">Características Físicas</Label>
                <Textarea
                  id="caracteristicas_fisicas"
                  value={formData.caracteristicas_fisicas}
                  onChange={(e) => handleInputChange("caracteristicas_fisicas", e.target.value)}
                  placeholder="Descreva características distintivas, cicatrizes, marcas especiais..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="url_fotografia">URL da Fotografia</Label>
                <Input
                  id="url_fotografia"
                  type="url"
                  value={formData.url_fotografia}
                  onChange={(e) => handleInputChange("url_fotografia", e.target.value)}
                  placeholder="https://exemplo.com/foto-do-animal.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Link para a fotografia do animal (opcional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Entrada */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Entrada</CardTitle>
              <CardDescription>
                Dados sobre como o animal chegou à associação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        // Filtrar grupos compatíveis com a espécie
                        if (!formData.especie) return true;
                        return (
                          (grupo.tipo === 'matilha' && formData.especie === 'Cão') ||
                          (grupo.tipo === 'colonia' && formData.especie === 'Gato')
                        );
                      })
                      .map((grupo) => (
                        <SelectItem key={grupo.id} value={grupo.id}>
                          <div className="flex items-center">
                            {grupo.tipo === 'matilha' ? '🐕' : '🐱'} {grupo.nome}
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {formData.especie && grupos.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.especie === 'Cão' 
                      ? 'Apenas matilhas são compatíveis com cães'
                      : formData.especie === 'Gato'
                      ? 'Apenas colónias são compatíveis com gatos'
                      : 'Outros animais não podem pertencer a grupos'
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
                  placeholder="Informações adicionais, comportamento, estado de saúde inicial..."
                  rows={4}
                />
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  A cadastrar...
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