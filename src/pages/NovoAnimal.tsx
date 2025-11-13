import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NovoAnimal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    sexo: "",
    data_nascimento: "",
    idade_estimada: "",
    peso: "",
    cor: "",
    caracteristicas_fisicas: "",
    transponder: "",
    numero_registo: "",
    estado: "Ativo",
    data_entrada: new Date().toISOString().split('T')[0],
    origem: "",
    observacoes: "",
    foto_url: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.nome || !formData.especie || !formData.sexo) {
        throw new Error("Nome, espécie e sexo são obrigatórios");
      }

      // Preparar dados para inserção
      const dataToInsert = {
        ...formData,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        data_nascimento: formData.data_nascimento || null,
        transponder: formData.transponder || null,
        numero_registo: formData.numero_registo || null,
      };

      const { data, error } = await supabase
        .from('animais_2025_11_13_03_23')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Animal cadastrado com sucesso!",
        description: `${formData.nome} foi adicionado ao sistema.`,
      });

      navigate(`/animal/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar animal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/animais">
            <Button variant="outline" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cadastrar Novo Animal</h1>
            <p className="text-gray-600 mt-2">Preencha as informações do animal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais do animal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      placeholder="Nome do animal"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="especie">Espécie *</Label>
                    <Select value={formData.especie} onValueChange={(value) => handleInputChange("especie", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cão">Cão</SelectItem>
                        <SelectItem value="Gato">Gato</SelectItem>
                        <SelectItem value="Coelho">Coelho</SelectItem>
                        <SelectItem value="Ave">Ave</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="raca">Raça</Label>
                    <Input
                      id="raca"
                      value={formData.raca}
                      onChange={(e) => handleInputChange("raca", e.target.value)}
                      placeholder="Raça do animal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sexo">Sexo *</Label>
                    <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Macho">Macho</SelectItem>
                        <SelectItem value="Fêmea">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
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
                    <Label htmlFor="idade_estimada">Idade Estimada</Label>
                    <Input
                      id="idade_estimada"
                      value={formData.idade_estimada}
                      onChange={(e) => handleInputChange("idade_estimada", e.target.value)}
                      placeholder="Ex: 2 anos, 6 meses"
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      value={formData.peso}
                      onChange={(e) => handleInputChange("peso", e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => handleInputChange("cor", e.target.value)}
                    placeholder="Cor predominante do animal"
                  />
                </div>

                <div>
                  <Label htmlFor="caracteristicas_fisicas">Características Físicas</Label>
                  <Textarea
                    id="caracteristicas_fisicas"
                    value={formData.caracteristicas_fisicas}
                    onChange={(e) => handleInputChange("caracteristicas_fisicas", e.target.value)}
                    placeholder="Descreva características distintivas, marcas, cicatrizes, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Identificação e Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Identificação e Estado</CardTitle>
                <CardDescription>Registros e situação atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transponder">Transponder/Microchip</Label>
                  <Input
                    id="transponder"
                    value={formData.transponder}
                    onChange={(e) => handleInputChange("transponder", e.target.value)}
                    placeholder="Número do microchip"
                  />
                </div>

                <div>
                  <Label htmlFor="numero_registo">Número de Registro</Label>
                  <Input
                    id="numero_registo"
                    value={formData.numero_registo}
                    onChange={(e) => handleInputChange("numero_registo", e.target.value)}
                    placeholder="Número de registro oficial"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Adotado">Adotado</SelectItem>
                      <SelectItem value="Óbito">Óbito</SelectItem>
                      <SelectItem value="Transferido">Transferido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_entrada">Data de Entrada</Label>
                  <Input
                    id="data_entrada"
                    type="date"
                    value={formData.data_entrada}
                    onChange={(e) => handleInputChange("data_entrada", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="origem">Origem</Label>
                  <Input
                    id="origem"
                    value={formData.origem}
                    onChange={(e) => handleInputChange("origem", e.target.value)}
                    placeholder="De onde veio o animal"
                  />
                </div>

                <div>
                  <Label htmlFor="foto_url">URL da Foto</Label>
                  <Input
                    id="foto_url"
                    value={formData.foto_url}
                    onChange={(e) => handleInputChange("foto_url", e.target.value)}
                    placeholder="Link para foto do animal"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Observações */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                placeholder="Observações adicionais sobre o animal, comportamento, necessidades especiais, etc."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 mt-6">
            <Link to="/animais">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Animal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoAnimal;