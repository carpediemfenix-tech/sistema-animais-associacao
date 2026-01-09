import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, AlertCircle, AlertTriangle, PawPrint, Archive, User, FileText, Clipboard, Paperclip, Weight, Thermometer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VoluntarioSelector from "@/components/VoluntarioSelector";
import { convertGoogleDriveUrl } from "@/lib/utils";
import PageActionBar from "@/components/PageActionBar";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

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
  const [fichaAdmissaoSalva, setFichaAdmissaoSalva] = useState<boolean>(false); // Flag para controlar recarregamento
  const [incompatibilityAlert, setIncompatibilityAlert] = useState<{show: boolean, message: string}>({show: false, message: ""});
  
  // Estado para abas
  const [activeTab, setActiveTab] = useState("basico");
  
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

  useEffect(() => {
    if (id) {
      fetchAnimal();
      fetchEspecies();
      fetchSexos();
      fetchGrupos();
      fetchVoluntarios();
      fetchTiposEstado();
      fetchIntakeOptions();
      fetchIntakeAssessment();
    }
  }, [id]);

  const fetchAnimal = async () => {
    try {
      setLoadingData(true);
      
      console.log('🔄 [EDITAR] Carregando dados do animal:', id);
      
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      console.log('🕐 [EDITAR] Timestamp para cache busting:', timestamp);
      
      const { data, error } = await supabase
        .from('animais')
        .select(`
          *,
          grupos(nome, tipo)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ [EDITAR] Erro ao carregar animal:', error);
        throw error;
      }

      console.log('📊 [EDITAR] Dados recebidos do banco:', data);
      console.log('📊 [EDITAR] Nome atual no banco:', data.nome);
      console.log('📊 [EDITAR] Estado atual no banco:', data.estado);
      console.log('📊 [EDITAR] Updated_at no banco:', data.updated_at);

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

      console.log('✅ [EDITAR] FormData será atualizado com dados do banco');
      console.log('📊 [EDITAR] Dados que serão aplicados ao formData:', {
        nome: data.nome || "",
        estado: data.estado || "",
        updated_at: data.updated_at
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

    if (!formData.estado) {
      newErrors.estado = "Estado é obrigatório";
      // Definir estado padrão se não estiver definido
      setFormData(prev => ({ ...prev, estado: 'Ativo' }));
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
    
    console.log('🔄 [EDITAR] Iniciando salvamento para animal:', id);
    console.log('📝 [EDITAR] Dados do formulário:', formData);

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

      console.log('💾 [EDITAR] Dados para atualização:', updateData);
      console.log('🔍 [EDITAR] ID do animal:', id);

      // Verificar se o animal existe antes de tentar atualizar
      const { data: existingAnimal, error: checkError } = await supabase
        .from('animais')
        .select('id, nome, created_at')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ [EDITAR] Animal não encontrado:', checkError);
        throw new Error(`Animal com ID ${id} não encontrado: ${checkError.message}`);
      }

      console.log('✅ [EDITAR] Animal encontrado:', existingAnimal);

      const { error } = await supabase
        .from('animais')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ [EDITAR] Erro na atualização:', error);
        throw error;
      }
      
      console.log('✅ [EDITAR] Animal atualizado com sucesso no banco de dados');

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

      // Salvar dados da ficha de admissão
      console.log('💾 [EDITAR] Salvando ficha de admissão...');
      console.log('📋 [EDITAR] Dados da admissão a salvar:', admissaoData);
      
      try {
        // Verificar se já existe uma avaliação de admissão
        const { data: existingAssessment, error: checkError } = await supabase
          .from('animal_intake_assessments')
          .select('id')
          .eq('animal_id', id)
          .single();

        console.log('🔍 [EDITAR] Verificação de ficha existente:', { existingAssessment, checkError });

        const assessmentData = {
          animal_id: id,
          intake_origin: admissaoData.intake_origin || null,
          intake_reason: admissaoData.intake_reason || null,
          circumstances_details: admissaoData.circumstances_details || null,
          general_condition: admissaoData.general_condition || null,
          behavior_entry: admissaoData.behavior_entry || null,
          body_condition: admissaoData.body_condition || null,
          weight_kg: admissaoData.weight_kg ? parseFloat(admissaoData.weight_kg) : null,
          temperature_celsius: admissaoData.temperature_celsius ? parseFloat(admissaoData.temperature_celsius) : null,
          symptoms: admissaoData.symptoms,
          physical_exam_notes: admissaoData.physical_exam_notes || null,
          behavioral_notes: admissaoData.behavioral_notes || null,
          immediate_actions: admissaoData.immediate_actions,
          immediate_actions_notes: admissaoData.immediate_actions_notes || null,
          prognosis: admissaoData.prognosis || null,
          treatment_plan: admissaoData.treatment_plan || null,
          special_needs: admissaoData.special_needs || null,
          is_complete: true,
          updated_at: new Date().toISOString()
        };
        
        console.log('📦 [EDITAR] Dados preparados para salvamento:', assessmentData);

        if (existingAssessment) {
          // Atualizar avaliação existente
          console.log('🔄 [EDITAR] Atualizando ficha existente com ID:', existingAssessment.id);
          const { data: updateData, error: updateError } = await supabase
            .from('animal_intake_assessments')
            .update(assessmentData)
            .eq('id', existingAssessment.id)
            .select();

          if (updateError) {
            console.error('❌ [EDITAR] Erro ao atualizar ficha:', updateError);
            throw updateError;
          }
          console.log('✅ [EDITAR] Ficha atualizada com sucesso:', updateData);
        } else {
          // Criar nova avaliação
          console.log('➕ [EDITAR] Criando nova ficha de admissão');
          const { data: insertData, error: insertError } = await supabase
            .from('animal_intake_assessments')
            .insert([{
              ...assessmentData,
              assessor_name: 'Sistema', // TODO: Usar usuário atual
              created_at: new Date().toISOString()
            }])
            .select();

          if (insertError) {
            console.error('❌ [EDITAR] Erro ao criar ficha:', insertError);
            throw insertError;
          }
          console.log('✅ [EDITAR] Nova ficha criada com sucesso:', insertData);
        }
        
        // Marcar que a ficha foi salva para não recarregar
        setFichaAdmissaoSalva(true);
        console.log('🏁 [EDITAR] Ficha de admissão salva - não será recarregada');
      } catch (admissionError: any) {
        console.error('❌ [EDITAR] ERRO CRÍTICO ao salvar ficha de admissão:', admissionError);
        console.error('❌ [EDITAR] Detalhes do erro:', {
          message: admissionError.message,
          details: admissionError.details,
          hint: admissionError.hint,
          code: admissionError.code
        });
        
        // Mostrar erro específico para o usuário
        toast({
          title: "Erro na ficha de admissão",
          description: `Problema ao salvar ficha: ${admissionError.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
        
        // Não falha a operação principal, mas registra o erro
      }

      console.log('🎉 [EDITAR] Salvamento concluído com sucesso');

      toast({
        title: "Animal atualizado com sucesso!",
        description: `${formData.nome} foi atualizado`,
      });

      // Recarregar dados para garantir sincronização
      console.log('🔄 [EDITAR] Recarregando dados do animal...');
      
      // Aguardar um momento para garantir que os dados foram commitados
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('⏱️ [EDITAR] Delay aplicado, iniciando recarregamento...');
      
      // Forçar recarregamento completo dos dados (EXCETO ficha de admissão)
      await Promise.all([
        fetchAnimal(),
        // fetchIntakeAssessment(), // ❌ NÃO recarregar ficha - manter dados que o usuário salvou
        fetchEspecies(),
        fetchSexos(),
        fetchGrupos(),
        fetchVoluntarios(),
        fetchTiposEstado(),
        fetchIntakeOptions()
      ]);
      
      console.log('✅ [EDITAR] Dados recarregados (exceto ficha de admissão para preservar alterações)');

      toast({
        title: "Animal atualizado com sucesso!",
        description: `${formData.nome} foi atualizado. Os dados foram recarregados.`,
        duration: 5000,
      });

      // Não navegar automaticamente - permitir que o usuário veja os dados atualizados
      // navigate(`/animal/${id}`);

    } catch (error: any) {
      console.error('❌ [EDITAR] Erro completo:', error);
      console.error('❌ [EDITAR] Tipo do erro:', typeof error);
      console.error('❌ [EDITAR] Stack trace:', error.stack);
      
      let errorMessage = "Ocorreu um erro inesperado";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      console.error('❌ [EDITAR] Mensagem de erro processada:', errorMessage);
      
      toast({
        title: "Erro ao atualizar animal",
        description: `${errorMessage}. Verifique os dados e tente novamente.`,
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

  // Funções para ficha de admissão
  const fetchIntakeOptions = async () => {
    try {
      const { data, error } = await supabase.rpc('get_intake_config_options');
      if (error) throw error;
      
      const groupedOptions = data.reduce((acc: any, option: any) => {
        if (!acc[option.domain]) acc[option.domain] = [];
        acc[option.domain].push(option);
        return acc;
      }, {});
      
      setIntakeOptions(groupedOptions);
    } catch (error) {
      console.error('Erro ao carregar opções de admissão:', error);
    }
  };

  const fetchIntakeAssessment = async () => {
    try {
      console.log('🔄 [EDITAR] Carregando ficha de admissão para animal:', id);
      
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      console.log('🕐 [EDITAR] Timestamp para cache busting na ficha:', timestamp);
      
      const { data, error } = await supabase.rpc('get_animal_intake_assessment', { animal_uuid: id });
      
      if (error) {
        console.error('❌ [EDITAR] Erro ao carregar ficha de admissão:', error);
        throw error;
      }
      
      console.log('📊 [EDITAR] Dados da ficha recebidos do banco:', data);
      
      if (data && data.length > 0) {
        const assessment = data[0];
        console.log('📋 [EDITAR] Primeira avaliação encontrada:', assessment);
        
        const newAdmissaoData = {
          intake_origin: assessment.intake_origin || "",
          intake_reason: assessment.intake_reason || "",
          circumstances_details: assessment.circumstances_details || "",
          general_condition: assessment.general_condition || "",
          behavior_entry: assessment.behavior_entry || "",
          body_condition: assessment.body_condition || "",
          weight_kg: assessment.weight_kg?.toString() || "",
          temperature_celsius: assessment.temperature_celsius?.toString() || "",
          symptoms: assessment.symptoms || [],
          physical_exam_notes: assessment.physical_exam_notes || "",
          behavioral_notes: assessment.behavioral_notes || "",
          immediate_actions: assessment.immediate_actions || [],
          immediate_actions_notes: assessment.immediate_actions_notes || "",
          prognosis: assessment.prognosis || "",
          treatment_plan: assessment.treatment_plan || "",
          special_needs: assessment.special_needs || "",
          injuries: []
        };
        
        console.log('📝 [EDITAR] Dados processados para admissaoData:', newAdmissaoData);
        setAdmissaoData(newAdmissaoData);
        console.log('✅ [EDITAR] AdmissaoData atualizado com sucesso');
      } else {
        console.log('ℹ️ [EDITAR] Nenhuma ficha de admissão encontrada, mantendo dados atuais');
        // Não limpar os dados se não houver ficha - manter o que o usuário preencheu
      }
    } catch (error) {
      console.error('Erro ao carregar ficha de admissão:', error);
    }
  };

  const handleAdmissaoChange = (field: string, value: any) => {
    setAdmissaoData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
    setAdmissaoData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
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
        
        {/* Resumo Fixo do Animal */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <PawPrint className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {formData.nome || 'Nome do Animal'}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Nº Processo: {numeroProcesso || 'N/A'}</span>
                    <span>•</span>
                    <span>Espécie: {especies.find(e => e.id === formData.especie)?.nome || 'N/A'}</span>
                    <span>•</span>
                    <span>Estado: {tiposEstado.find(e => e.id === formData.estado)?.nome || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Editando Animal
                </Badge>
                <p className="text-xs text-gray-500">
                  Última atualização: {new Date().toLocaleDateString('pt-PT')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basico" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="adicionais" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Adicionais
              </TabsTrigger>
              <TabsTrigger value="admissao" className="flex items-center gap-2">
                <Clipboard className="h-4 w-4" />
                Admissão
              </TabsTrigger>
              <TabsTrigger value="anexos" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anexos
              </TabsTrigger>
            </TabsList>

            {/* Aba Básico */}
            <TabsContent value="basico" className="space-y-6">
              <Card className="border-l-4 border-l-blue-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                  <CardTitle className="text-blue-800 font-bold text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informações Básicas
                  </CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    Dados essenciais do animal (campos obrigatórios marcados com *)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Informações de Destaque */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                    <div className="space-y-2">
                      <Label className="text-blue-700 font-bold text-sm uppercase tracking-wide flex items-center">
                        <span className="mr-2 text-lg">📋</span>
                        Número do Processo
                      </Label>
                      <div className="text-xl font-black text-blue-900 bg-white px-3 py-2 rounded-lg border">{numeroProcesso || 'N/A'}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-blue-700 font-bold text-sm uppercase tracking-wide flex items-center">
                        <span className="mr-2 text-lg">🏠</span>
                        Grupo
                      </Label>
                      <div className="text-xl font-black text-blue-900 bg-white px-3 py-2 rounded-lg border">{grupoNome || 'Sem grupo'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        placeholder="Nome do animal"
                        className={`h-12 text-lg font-medium border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                          errors.nome ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400"
                        }`}
                      />
                      {errors.nome && (
                        <p className="text-sm text-red-600 mt-1 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.nome}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="especie" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Espécie *</Label>
                      <Select value={formData.especie} onValueChange={(value) => handleInputChange("especie", value)}>
                        <SelectTrigger className={`h-12 text-lg font-medium border-2 transition-all duration-200 ${
                          errors.especie ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400 focus:border-blue-500"
                        }`}>
                          <SelectValue placeholder="Selecione a espécie" />
                        </SelectTrigger>
                        <SelectContent>
                          {especies.map((especie) => (
                            <SelectItem key={especie.id} value={especie.nome} className="text-lg">
                              {getEspecieIcon(especie)} {especie.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.especie && (
                        <p className="text-sm text-red-600 mt-1 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.especie}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="raca" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Raça</Label>
                      <Input
                        id="raca"
                        value={formData.raca}
                        onChange={(e) => handleInputChange("raca", e.target.value)}
                        placeholder="Raça do animal (opcional)"
                        className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sexo" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Sexo *</Label>
                      <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                        <SelectTrigger className={`h-12 text-lg font-medium border-2 transition-all duration-200 ${
                          errors.sexo ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400 focus:border-blue-500"
                        }`}>
                          <SelectValue placeholder="Selecione o sexo" />
                        </SelectTrigger>
                        <SelectContent>
                          {sexos.map((sexo) => (
                            <SelectItem key={sexo.id} value={sexo.nome} className="text-lg">
                              {getSexoIcon(sexo)} {sexo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sexo && (
                        <p className="text-sm text-red-600 mt-1 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.sexo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="idade_estimada" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Idade Estimada (meses)</Label>
                      <Input
                        id="idade_estimada"
                        type="number"
                        min="0"
                        value={formData.idade_estimada}
                        onChange={(e) => handleInputChange("idade_estimada", e.target.value)}
                        placeholder="Ex: 24 (para 2 anos)"
                        className={`h-12 text-lg font-medium border-2 transition-all duration-200 ${
                          errors.idade_estimada ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400 focus:border-blue-500"
                        }`}
                      />
                      {errors.idade_estimada && (
                        <p className="text-sm text-red-600 mt-1 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.idade_estimada}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_nascimento" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Data de Nascimento</Label>
                      <Input
                        id="data_nascimento"
                        type="date"
                        value={formData.data_nascimento}
                        onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                        className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="peso" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.peso}
                        onChange={(e) => handleInputChange("peso", e.target.value)}
                        placeholder="Ex: 15.5"
                        className={`h-12 text-lg font-medium border-2 transition-all duration-200 ${
                          errors.peso ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400 focus:border-blue-500"
                        }`}
                      />
                      {errors.peso && (
                        <p className="text-sm text-red-600 mt-1 flex items-center font-medium">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.peso}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cor" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Cor</Label>
                      <Input
                        id="cor"
                        value={formData.cor}
                        onChange={(e) => handleInputChange("cor", e.target.value)}
                        placeholder="Cor predominante"
                        className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caracteristicas_fisicas" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Características Físicas</Label>
                    <Textarea
                      id="caracteristicas_fisicas"
                      value={formData.caracteristicas_fisicas}
                      onChange={(e) => handleInputChange("caracteristicas_fisicas", e.target.value)}
                      placeholder="Descreva características físicas distintivas..."
                      rows={3}
                      className="text-lg font-medium border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* Transponder/Chip */}
                  <div className="space-y-2">
                    <Label htmlFor="transponder" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Transponder/Chip</Label>
                    <Input
                      id="transponder"
                      value={formData.transponder}
                      onChange={(e) => handleInputChange("transponder", e.target.value)}
                      placeholder="Número do chip/transponder (se aplicável)"
                      className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-all duration-200"
                    />
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      💾 Número de identificação do microchip implantado no animal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Adicionais */}
            <TabsContent value="adicionais" className="space-y-6">
              <Card className="border-l-4 border-l-green-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                  <CardTitle className="text-green-800 font-bold text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Informações Adicionais
                  </CardTitle>
                  <CardDescription className="text-green-600 font-medium">
                    Dados complementares e de gestão do animal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="local_encontrado" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Local Encontrado</Label>
                      <Input
                        id="local_encontrado"
                        value={formData.local_encontrado}
                        onChange={(e) => handleInputChange("local_encontrado", e.target.value)}
                        placeholder="Onde o animal foi encontrado"
                        className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="data_entrada" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Data de Entrada</Label>
                      <Input
                        id="data_entrada"
                        type="date"
                        value={formData.data_entrada}
                        onChange={(e) => handleInputChange("data_entrada", e.target.value)}
                        className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Voluntário Responsável</Label>
                    <VoluntarioSelector
                      value={formData.voluntario_responsavel}
                      onValueChange={(voluntarioId) => handleInputChange("voluntario_responsavel", voluntarioId)}
                      placeholder="Selecione o voluntário responsável"
                      showFullName={true}
                      className="h-12 text-lg border-2 border-gray-300 hover:border-green-400 focus:border-green-500"
                    />
                  </div>

                  {/* Grupo (Matilha/Colónia) */}
                  <div className="space-y-2">
                    <Label htmlFor="grupo_id" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Grupo (Matilha/Colónia)</Label>
                    <Select 
                      value={formData.grupo_id || "none"} 
                      onValueChange={(value) => handleInputChange("grupo_id", value === "none" ? "" : value)}
                    >
                      <SelectTrigger className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all duration-200">
                        <SelectValue placeholder="Selecionar grupo (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-lg">Nenhum grupo</SelectItem>
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
                            <SelectItem key={grupo.id} value={grupo.id} className="text-lg">
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
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      🏠 Grupos são filtrados automaticamente por espécie
                    </p>
                  </div>

                  {/* Estado do Animal */}
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Estado *</Label>
                    <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                      <SelectTrigger className={`h-12 text-lg font-medium border-2 transition-all duration-200 ${
                        errors.estado ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-green-400 focus:border-green-500"
                      }`}>
                        <SelectValue placeholder="Selecione o estado atual" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEstado.map((estado) => (
                          <SelectItem key={estado.id} value={estado.nome} className="text-lg">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: estado.cor || '#gray' }}
                              ></div>
                              {estado.nome}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-600 mt-1 flex items-center font-medium">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.estado}
                      </p>
                    )}
                  </div>

                  {/* Campos de Adotante - Aparecem apenas quando Estado = "Adotado" */}
                  {formData.estado === 'Adotado' && (
                    <>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-green-800 font-semibold mb-3 flex items-center">
                          <span className="mr-2">🏡</span>
                          Informações do Adotante
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="data_adocao" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Data de Adoção</Label>
                            <Input
                              id="data_adocao"
                              type="date"
                              value={formData.data_adocao}
                              onChange={(e) => handleInputChange("data_adocao", e.target.value)}
                              className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="adotante_nome" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Nome do Adotante</Label>
                            <Input
                              id="adotante_nome"
                              value={formData.adotante_nome}
                              onChange={(e) => handleInputChange("adotante_nome", e.target.value)}
                              placeholder="Nome completo do adotante"
                              className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label htmlFor="adotante_contacto" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Contacto do Adotante</Label>
                          <Input
                            id="adotante_contacto"
                            value={formData.adotante_contacto}
                            onChange={(e) => handleInputChange("adotante_contacto", e.target.value)}
                            placeholder="Telefone ou email do adotante"
                            className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-green-400 focus:border-green-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Admissão */}
            <TabsContent value="admissao" className="space-y-6">
              <Card className="border-l-4 border-l-purple-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
                  <CardTitle className="text-purple-800 font-bold text-lg flex items-center">
                    <Clipboard className="h-5 w-5 mr-2" />
                    Ficha de Admissão
                  </CardTitle>
                  <CardDescription className="text-purple-600 font-medium">
                    Informações sobre a condição à entrada do animal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Circunstâncias da Admissão */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <span className="mr-2">📝</span>
                      Circunstâncias da Admissão
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Origem</Label>
                        <Select 
                          value={admissaoData.intake_origin} 
                          onValueChange={(value) => handleAdmissaoChange("intake_origin", value)}
                        >
                          <SelectTrigger className="h-12 text-lg border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500">
                            <SelectValue placeholder="Como chegou à instituição?" />
                          </SelectTrigger>
                          <SelectContent>
                            {(intakeOptions.intake_origin || []).map((option) => (
                              <SelectItem key={option.code} value={option.code} className="text-lg">
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Razão da Admissão</Label>
                        <Select 
                          value={admissaoData.intake_reason} 
                          onValueChange={(value) => handleAdmissaoChange("intake_reason", value)}
                        >
                          <SelectTrigger className="h-12 text-lg border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500">
                            <SelectValue placeholder="Motivo principal" />
                          </SelectTrigger>
                          <SelectContent>
                            {(intakeOptions.intake_reason || []).map((option) => (
                              <SelectItem key={option.code} value={option.code} className="text-lg">
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Detalhes das Circunstâncias</Label>
                      <Textarea
                        value={admissaoData.circumstances_details}
                        onChange={(e) => handleAdmissaoChange("circumstances_details", e.target.value)}
                        placeholder="Descreva as circunstâncias detalhadas da admissão..."
                        rows={4}
                        className="text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  {/* Triagem Imediata */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <span className="mr-2">🩺</span>
                      Triagem Imediata
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Condição Geral</Label>
                        <Select 
                          value={admissaoData.general_condition} 
                          onValueChange={(value) => handleAdmissaoChange("general_condition", value)}
                        >
                          <SelectTrigger className="h-12 text-lg border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500">
                            <SelectValue placeholder="Estado geral" />
                          </SelectTrigger>
                          <SelectContent>
                            {(intakeOptions.general_condition || []).map((option) => (
                              <SelectItem key={option.code} value={option.code} className="text-lg">
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Comportamento</Label>
                        <Select 
                          value={admissaoData.behavior_entry} 
                          onValueChange={(value) => handleAdmissaoChange("behavior_entry", value)}
                        >
                          <SelectTrigger className="h-12 text-lg border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500">
                            <SelectValue placeholder="Comportamento observado" />
                          </SelectTrigger>
                          <SelectContent>
                            {(intakeOptions.behavior_entry || []).map((option) => (
                              <SelectItem key={option.code} value={option.code} className="text-lg">
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Condição Corporal</Label>
                        <Select 
                          value={admissaoData.body_condition} 
                          onValueChange={(value) => handleAdmissaoChange("body_condition", value)}
                        >
                          <SelectTrigger className="h-12 text-lg border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500">
                            <SelectValue placeholder="Condição física" />
                          </SelectTrigger>
                          <SelectContent>
                            {(intakeOptions.body_condition || []).map((option) => (
                              <SelectItem key={option.code} value={option.code} className="text-lg">
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Medições Físicas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <span className="mr-2">📏</span>
                      Medições Físicas
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Peso na Admissão */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
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
                          className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200"
                        />
                      </div>

                      {/* Temperatura */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
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
                          className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações Clínicas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <span className="mr-2">👩‍⚕️</span>
                      Observações Clínicas
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Exame Físico</Label>
                        <Textarea
                          value={admissaoData.physical_exam_notes}
                          onChange={(e) => handleAdmissaoChange("physical_exam_notes", e.target.value)}
                          placeholder="Observações do exame físico..."
                          rows={4}
                          className="text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Observações Comportamentais</Label>
                        <Textarea
                          value={admissaoData.behavioral_notes}
                          onChange={(e) => handleAdmissaoChange("behavioral_notes", e.target.value)}
                          placeholder="Observações sobre o comportamento..."
                          rows={4}
                          className="text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sinais e Sintomas Observados */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <span className="mr-2">🩺</span>
                      Sinais e Sintomas Observados
                    </h3>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3 block">
                        Selecione todos os sintomas observados
                      </Label>
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
                    </div>
                  </div>

                  {/* Ações Imediatas Realizadas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <span className="mr-2">⚡</span>
                      Ações Imediatas Realizadas
                    </h3>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3 block">
                        Selecione todas as ações que foram tomadas imediatamente
                      </Label>
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
                      <div className="mt-4 space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Detalhes das Ações Realizadas</Label>
                        <Textarea
                          value={admissaoData.immediate_actions_notes}
                          onChange={(e) => handleAdmissaoChange("immediate_actions_notes", e.target.value)}
                          placeholder="Descreva detalhadamente as ações tomadas..."
                          rows={3}
                          className="text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumo da Ficha de Admissão */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                      <span className="mr-2">📋</span>
                      Resumo da Ficha de Admissão
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Prognóstico */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Prognóstico</Label>
                        <Select 
                          value={admissaoData.prognosis} 
                          onValueChange={(value) => handleAdmissaoChange("prognosis", value)}
                        >
                          <SelectTrigger className="h-12 text-lg border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500">
                            <SelectValue placeholder="Prognóstico médico" />
                          </SelectTrigger>
                          <SelectContent>
                            {(intakeOptions.prognosis || []).map((option) => (
                              <SelectItem key={option.code} value={option.code} className="text-lg">
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Plano de Tratamento */}
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Plano de Tratamento</Label>
                        <Textarea
                          value={admissaoData.treatment_plan}
                          onChange={(e) => handleAdmissaoChange("treatment_plan", e.target.value)}
                          placeholder="Plano de tratamento recomendado..."
                          rows={3}
                          className="text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200 resize-none"
                        />
                      </div>
                    </div>

                    {/* Necessidades Especiais */}
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Necessidades Especiais</Label>
                      <Textarea
                        value={admissaoData.special_needs}
                        onChange={(e) => handleAdmissaoChange("special_needs", e.target.value)}
                        placeholder="Cuidados especiais necessários..."
                        rows={3}
                        className="text-lg font-medium border-2 border-gray-300 hover:border-purple-400 focus:border-purple-500 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Anexos */}
            <TabsContent value="anexos" className="space-y-6">
              <Card className="border-l-4 border-l-orange-500 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                  <CardTitle className="text-orange-800 font-bold text-lg flex items-center">
                    <Paperclip className="h-5 w-5 mr-2" />
                    Anexos e Fotografias
                  </CardTitle>
                  <CardDescription className="text-orange-600 font-medium">
                    Fotografias e documentos relacionados ao animal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <Label htmlFor="url_fotografia" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">URL da Fotografia</Label>
                    <Input
                      id="url_fotografia"
                      type="url"
                      value={formData.url_fotografia}
                      onChange={(e) => handleInputChange("url_fotografia", e.target.value)}
                      placeholder="Cole o URL do Google Drive ou link direto da imagem"
                      className="h-12 text-lg font-medium border-2 border-gray-300 hover:border-orange-400 focus:border-orange-500 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Aceita URLs do Google Drive (serão convertidos automaticamente)
                    </p>
                    {formData.url_fotografia && (
                      <div className="mt-4 space-y-4">
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border">
                          <strong className="text-gray-800">URL convertido:</strong>
                          <br />
                          <code className="text-xs break-all font-mono bg-white p-1 rounded">{convertGoogleDriveUrl(formData.url_fotografia)}</code>
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={convertGoogleDriveUrl(formData.url_fotografia)} 
                            alt="Preview" 
                            className="w-48 h-48 object-cover rounded-xl border-4 border-orange-200 shadow-lg"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const errorMsg = document.createElement('div');
                              errorMsg.className = 'text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-2 border border-red-200';
                              errorMsg.innerHTML = '⚠️ Erro ao carregar imagem. Verifique se o arquivo do Google Drive está com permissões públicas ("Qualquer pessoa com o link pode visualizar")';
                              target.parentElement?.appendChild(errorMsg);
                            }}
                            onLoad={(e) => {
                              console.log('✅ Imagem carregada com sucesso!');
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange("observacoes", e.target.value)}
                      placeholder="Observações gerais sobre o animal..."
                      rows={6}
                      className="text-lg font-medium border-2 border-gray-300 hover:border-orange-400 focus:border-orange-500 transition-all duration-200 resize-none"
                    />
                  </div>
                  
                  {/* Anexos Adicionais */}
                  <div className="text-center py-8 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-dashed border-orange-200 shadow-sm">
                    <Paperclip className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-orange-800 mb-2">
                      Anexos Adicionais
                    </h3>
                    <p className="text-orange-600 font-medium">
                      Funcionalidade para múltiplas fotos e documentos será implementada futuramente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default EditarAnimal;