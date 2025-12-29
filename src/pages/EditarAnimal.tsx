import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VoluntarioSelector from "@/components/VoluntarioSelector";
import { convertGoogleDriveUrl } from "@/lib/utils";
import PageActionBar from "@/components/PageActionBar";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { PawPrint, Archive } from "lucide-react";

// Interfaces para tipos de dados
interface Especie {
  id: string;
  nome: string;
  icone?: string;
  ativo: boolean;
}

interface Sexo {
  id: string;
  nome: string;
  ativo: boolean;
}

const EditarAnimal = () => {
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
    local_encontrado: "",
    estado: "",
    data_adocao: "",
    adotante_nome: "",
    adotante_contacto: "",
    observacoes: "",
    data_entrada: "",
    voluntario_responsavel: "",
    grupo_id: "",
    url_fotografia: "" // URL da fotografia
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [sexos, setSexos] = useState<Sexo[]>([]);
  const [numeroProcesso, setNumeroProcesso] = useState<string>("");
  const [grupoNome, setGrupoNome] = useState<string>("");
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupoAtual, setGrupoAtual] = useState<any>(null);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [tiposEstado, setTiposEstado] = useState<any[]>([]);
  const [estadoOriginal, setEstadoOriginal] = useState<string>("");
  const [incompatibilityAlert, setIncompatibilityAlert] = useState<{show: boolean, message: string}>({show: false, message: ""});

  useEffect(() => {
    if (id) {
      fetchAnimal();
      fetchEspecies();
      fetchSexos();
      fetchGrupos();
      fetchVoluntarios();
      fetchTiposEstado();
    }
  }, [id]);

  const fetchAnimal = async () => {
    try {
      setLoadingData(true);
      
      const { data, error } = await supabase
        .from('animais')
        .select(`
          *,
          grupos(nome, tipo)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Definir número do processo e grupo
      setNumeroProcesso(data.numero_processo || "N/A");
      setGrupoNome(data.grupos?.nome || "Sem grupo");
      setGrupoAtual(data.grupos || null);

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
        data_entrada: data.data_entrada || "",
        voluntario_responsavel: data.voluntario_responsavel || "",
        grupo_id: data.grupo_id || "",
        url_fotografia: data.url_fotografia || "" // URL da fotografia
      });

      // Armazenar estado original para detectar mudanças
      setEstadoOriginal(data.estado || "");

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

  const fetchGrupos = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setGrupos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const fetchVoluntarios = async () => {
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('id, nome, ativo')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setVoluntarios(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar voluntários:', error);
    }
  };

  const fetchTiposEstado = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_estado')
        .select('id, nome, cor, ativo')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setTiposEstado(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar tipos de estado:', error);
    }
  };

  // Funções de validação de grupos
  const isGrupoIncompativel = (especie: string, grupo: any) => {
    if (!grupo || !grupo.tipo) return false;
    
    const tipoGrupo = grupo.tipo.toLowerCase();
    
    if (especie === 'Cão') {
      return tipoGrupo.includes('colónia') || tipoGrupo.includes('colonia');
    } else if (especie === 'Gato') {
      return tipoGrupo.includes('matilha');
    } else {
      return tipoGrupo.includes('matilha') || 
             tipoGrupo.includes('colónia') || 
             tipoGrupo.includes('colonia');
    }
  };

  const getIncompatibilityMessage = (especie: string, grupoAnterior: any) => {
    const nomeGrupo = grupoAnterior?.nome || 'grupo atual';
    const tipoGrupo = grupoAnterior?.tipo || '';
    
    if (especie === 'Cão') {
      return `🐕 Cão não pode estar em "${nomeGrupo}" (${tipoGrupo}). Selecione Matilha ou outro grupo adequado.`;
    } else if (especie === 'Gato') {
      return `🐱 Gato não pode estar em "${nomeGrupo}" (${tipoGrupo}). Selecione Colónia ou outro grupo adequado.`;
    } else {
      return `🐾 ${especie} não pode estar em "${nomeGrupo}" (${tipoGrupo}). Selecione um grupo adequado.`;
    }
  };

  // Função para obter ícone da espécie
  const getEspecieIcon = (especie: Especie) => {
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
  const getSexoIcon = (sexo: Sexo) => {
    const nome = sexo.nome.toLowerCase();
    if (nome.includes('macho')) return '♂️';
    if (nome.includes('fêmea') || nome.includes('femea')) return '♀️';
    if (nome.includes('indeterminado')) return '❓';
    return '';
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

    // Validação específica de grupo após mudança de espécie
    if (incompatibilityAlert.show && !formData.grupo_id) {
      newErrors.grupo_id = "Selecione um grupo adequado para esta espécie";
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
      const updateData = {
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
        estado: formData.estado,
        data_adocao: formData.data_adocao || null,
        adotante_nome: formData.adotante_nome.trim() || null,
        adotante_contacto: formData.adotante_contacto.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        data_entrada: formData.data_entrada,
        voluntario_responsavel: formData.voluntario_responsavel || null,
        grupo_id: formData.grupo_id || null,
        url_fotografia: formData.url_fotografia.trim() || null, // URL da fotografia
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('animais')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Se o estado mudou, criar registro no histórico de estados
      if (formData.estado !== estadoOriginal && formData.estado) {
        try {
          // 1. Buscar o ID do tipo de estado
          const { data: tipoEstado, error: tipoError } = await supabase
            .from('tipos_estado')
            .select('id')
            .eq('nome', formData.estado)
            .single();

          if (tipoError) {
            console.warn('Aviso: Não foi possível encontrar tipo de estado:', tipoError);
          } else {
            // 2. Desativar estados anteriores
            await supabase
              .from('estados_animal')
              .update({ 
                ativo: false, 
                data_fim: new Date().toISOString().split('T')[0]
              })
              .eq('animal_id', id)
              .eq('ativo', true);

            // 3. Criar novo registro de estado
            await supabase
              .from('estados_animal')
              .insert({
                animal_id: id,
                tipo_estado_id: tipoEstado.id,
                data_inicio: new Date().toISOString().split('T')[0],
                ativo: true,
                observacoes: `Estado alterado via edição do animal`,
                usuario_id: 'admin' // TODO: Usar usuário atual
              });
          }
        } catch (estadoError) {
          console.warn('Aviso: Não foi possível atualizar histórico de estados:', estadoError);
          // Não falha a operação principal
        }
      }

      toast({
        title: "Animal atualizado com sucesso!",
        description: `${formData.nome} foi atualizado`,
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
    // Validação especial para mudança de espécie
    if (field === 'especie') {
      const especieAnterior = formData.especie;
      
      // Atualizar espécie
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Verificar incompatibilidade apenas se mudou de espécie
      if (especieAnterior !== value && grupoAtual) {
        if (isGrupoIncompativel(value, grupoAtual)) {
          // Limpar grupo
          setFormData(prev => ({ ...prev, grupo_id: '' }));
          setGrupoAtual(null);
          
          // Mostrar aviso
          setIncompatibilityAlert({
            show: true,
            message: getIncompatibilityMessage(value, grupoAtual)
          });
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dados do animal...</p>
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
          { label: 'Animais', href: '/animais', icon: <PawPrint className="h-4 w-4" /> },
          { label: formData.nome || 'Editar Animal' }
        ]}
        primaryActions={
          <>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-9"
            >
              {loading ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </>
        }
        secondaryActions={[
          {
            label: 'Arquivar Animal',
            onClick: () => {
              if (confirm('Tem certeza que deseja arquivar este animal?')) {
                // Lógica de arquivar
              }
            },
            icon: <Archive className="h-4 w-4" />
          }
        ]}
      />

      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Alerta de Incompatibilidade */}
        {incompatibilityAlert.show && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div className="flex-1">
                <h4 className="text-yellow-800 font-semibold">Grupo Incompatível</h4>
                <p className="text-yellow-700 text-sm mt-1">{incompatibilityAlert.message}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIncompatibilityAlert({show: false, message: ""})}
                >
                  Entendi
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados essenciais do animal (campos obrigatórios marcados com *)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              {/* Campos em Destaque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <Label className="text-blue-700 font-semibold flex items-center">
                    <span className="mr-2">📋</span>
                    Número do Processo
                  </Label>
                  <div className="text-lg font-bold text-blue-900 mt-1">{numeroProcesso}</div>
                </div>
                <div>
                  <Label className="text-blue-700 font-semibold flex items-center">
                    <span className="mr-2">🏠</span>
                    Grupo
                  </Label>
                  <div className="text-lg font-bold text-blue-900 mt-1">{grupoNome}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    placeholder="Onde foi encontrado"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEstado.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.nome}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tipo.cor }}
                            />
                            {tipo.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grupo_id">Grupo (Matilha/Colónia)</Label>
                  <Select 
                    value={formData.grupo_id || "none"} 
                    onValueChange={(value) => handleInputChange("grupo_id", value === "none" ? "" : value)}
                  >
                    <SelectTrigger className={errors.grupo_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecionar grupo (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum grupo</SelectItem>
                      {grupos
                        .filter(grupo => {
                          // LÓGICA: Exclusões específicas por espécie
                          if (!formData.especie) return true;
                          
                          if (formData.especie === 'Cão') {
                            // Cães: todos os grupos EXCETO colónias
                            return !(grupo.tipo && (grupo.tipo.toLowerCase().includes('colónia') || grupo.tipo.toLowerCase().includes('colonia')));
                          } else if (formData.especie === 'Gato') {
                            // Gatos: todos os grupos EXCETO matilhas
                            return !(grupo.tipo && grupo.tipo.toLowerCase().includes('matilha'));
                          } else {
                            // Outras espécies: todos os grupos EXCETO matilhas e colónias
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
                  {errors.grupo_id && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.grupo_id}
                    </p>
                  )}
                  {formData.especie && grupos.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.especie === 'Cão' 
                        ? '🐕 Cães podem escolher todos os grupos exceto colónias'
                        : formData.especie === 'Gato'
                        ? '🐱 Gatos podem escolher todos os grupos exceto matilhas'
                        : '🏠 Esta espécie pode escolher grupos exceto matilhas e colónias'
                      }
                    </p>
                  )}
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

                {/* Voluntário Responsável */}
                <div>
                  <Label htmlFor="voluntario_responsavel">Voluntário Responsável</Label>
                  <Select
                    value={formData.voluntario_responsavel || ""}
                    onValueChange={(value) => handleInputChange("voluntario_responsavel", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um voluntário responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem responsável</SelectItem>
                      {voluntarios
                        .filter(v => v.ativo)
                        .map((voluntario) => (
                          <SelectItem key={voluntario.id} value={voluntario.id}>
                            {voluntario.nome}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos de Adoção */}
              {formData.estado === "Adotado" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        placeholder="Nome completo do adotante"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="adotante_contacto">Contacto do Adotante</Label>
                    <Input
                      id="adotante_contacto"
                      value={formData.adotante_contacto}
                      onChange={(e) => handleInputChange("adotante_contacto", e.target.value)}
                      placeholder="Telefone ou email do adotante"
                    />
                  </div>
                </>
              )}

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
                  Aceita URLs do Google Drive (serão convertidos automaticamente)
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
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'text-xs text-red-600 bg-red-50 p-2 rounded mt-2';
                        errorMsg.innerHTML = '⚠️ Erro ao carregar imagem. Verifique se o arquivo do Google Drive está com permissões públicas ("Qualquer pessoa com o link pode visualizar")';
                        target.parentElement?.appendChild(errorMsg);
                      }}
                      onLoad={(e) => {
                        console.log('✅ Imagem carregada com sucesso!');
                      }}
                    />
                  </div>
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
            </CardContent>
          </Card>

          {/* Botões removidos - agora estão no PageActionBar */}
        </form>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EditarAnimal;