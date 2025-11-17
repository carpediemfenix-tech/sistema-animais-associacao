import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";

const EditarAnimal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [animal, setAnimal] = useState<Animal | null>(null);

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
    estado: "",
    data_adocao: "",
    adotante_nome: "",
    adotante_contacto: "",
    observacoes: "",
    data_entrada: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchAnimal();
    }
  }, [id]);

  const fetchAnimal = async () => {
    try {
      setLoadingData(true);
      
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setAnimal(data);
      
      // Calcular data de nascimento aproximada se só temos idade
      let dataNascimento = "";
      if (data.idade_estimada && !data.data_nascimento) {
        const hoje = new Date();
        const nascimento = new Date(hoje);
        nascimento.setMonth(nascimento.getMonth() - data.idade_estimada);
        dataNascimento = nascimento.toISOString().split('T')[0];
      }

      setFormData({
        nome: data.nome || "",
        especie: data.especie || "",
        raca: data.raca || "",
        sexo: data.sexo || "",
        idade_estimada: data.idade_estimada?.toString() || "",
        data_nascimento: data.data_nascimento || dataNascimento,
        peso: data.peso?.toString() || "",
        cor: data.cor || "",
        caracteristicas_fisicas: data.caracteristicas_fisicas || "",
        transponder: data.transponder || "",
        local_encontrado: data.local_encontrado || "",
        estado: data.estado || "",
        data_adocao: data.data_adocao || "",
        adotante_nome: data.adotante_nome || "",
        adotante_contacto: data.adotante_contacto || "",
        observacoes: data.observacoes || "",
        data_entrada: data.data_entrada || ""
      });

    } catch (error: any) {
      console.error('Erro ao carregar animal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do animal",
        variant: "destructive",
      });
      navigate('/animais');
    } finally {
      setLoadingData(false);
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

    if (!formData.data_entrada) {
      newErrors.data_entrada = "Data de entrada é obrigatória";
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
      // Calcular idade estimada se temos data de nascimento
      let idadeEstimada = formData.idade_estimada ? parseInt(formData.idade_estimada) : null;
      if (formData.data_nascimento && !formData.idade_estimada) {
        const nascimento = new Date(formData.data_nascimento);
        const hoje = new Date();
        const diffTime = Math.abs(hoje.getTime() - nascimento.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
        idadeEstimada = diffMonths;
      }

      const dataToUpdate = {
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
        estado: formData.estado,
        data_adocao: formData.data_adocao || null,
        adotante_nome: formData.adotante_nome.trim() || null,
        adotante_contacto: formData.adotante_contacto.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('animais')
        .update(dataToUpdate)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar animal:', error);
        throw error;
      }

      toast({
        title: "Animal atualizado com sucesso!",
        description: `${formData.nome} foi atualizado com sucesso`,
      });

      navigate(`/animal/${id}`);

    } catch (error: any) {
      console.error('Erro ao atualizar animal:', error);
      toast({
        title: "Erro ao atualizar animal",
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar dados do animal...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Animal não encontrado</h2>
          <p className="text-gray-600 mb-4">O animal solicitado não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/animais">Voltar à Lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/animal/${id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Detalhes
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/images/BackgroundEraser_20250411_205630024.png" 
                  alt="Valentão ao Resgate" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Editar Animal</h1>
                  <p className="text-sm text-gray-500">{animal.nome} - {animal.numero_processo}</p>
                </div>
              </div>
            </div>
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
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                  />
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
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Adotado">Adotado</SelectItem>
                      <SelectItem value="Óbito">Óbito</SelectItem>
                      <SelectItem value="Não Adotável">Não Adotável</SelectItem>
                    </SelectContent>
                  </Select>
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
            </CardContent>
          </Card>

          {/* Informações de Entrada */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Entrada e Estado</CardTitle>
              <CardDescription>
                Dados sobre como o animal chegou à associação e estado atual
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

              {/* Campos de adoção - só mostrar se estado for "Adotado" */}
              {formData.estado === 'Adotado' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                  <div>
                    <Label htmlFor="data_adocao">Data de Adoção</Label>
                    <Input
                      id="data_adocao"
                      type="date"
                      value={formData.data_adocao}
                      onChange={(e) => handleInputChange("data_adocao", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adotante_nome">Nome do Adotante</Label>
                    <Input
                      id="adotante_nome"
                      value={formData.adotante_nome}
                      onChange={(e) => handleInputChange("adotante_nome", e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adotante_contacto">Contacto do Adotante</Label>
                    <Input
                      id="adotante_contacto"
                      value={formData.adotante_contacto}
                      onChange={(e) => handleInputChange("adotante_contacto", e.target.value)}
                      placeholder="Telefone ou email"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Informações adicionais, comportamento, estado de saúde..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link to={`/animal/${id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  A atualizar...
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
    </div>
  );
};

export default EditarAnimal;