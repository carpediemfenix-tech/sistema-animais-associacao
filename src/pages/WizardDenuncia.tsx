import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  Shield, 
  Target, 
  Users, 
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  MapPin,
  Clock,
  Phone,
  User,
  FileText,
  Activity
} from 'lucide-react';

interface DenunciaForm {
  // Etapa 1: Identificação da Operação
  data_denuncia: string;
  hora_denuncia: string;
  local_encontrado: string;
  descricao_situacao: string;
  canal_denuncia: string;
  denunciante_anonimo: boolean;
  denunciante_nome: string;
  denunciante_contato: string;
  denunciante_observacoes: string;
  
  // Etapa 2: Alvos da Operação (Animais)
  quantidade_animais: number;
  animais: AnimalForm[];
  
  // Etapa 3: Intervenção das Autoridades
  autoridades_contactadas: boolean;
  autoridade_tipo: string;
  autoridade_nome: string;
  autoridade_contacto: string;
  numero_ocorrencia: string;
  observacoes_autoridades: string;
  
  // Etapa 4: Suporte Médico Veterinário
  intervencao_veterinaria: boolean;
  intervencao_veterinaria_data: string;
  intervencao_veterinaria_hora: string;
  clinica_id: string;
  veterinario_nome: string;
  diagnostico_inicial: string;
  tratamentos_aplicados: string;
  
  // Etapa 5: Equipe Tática
  voluntario_responsavel_id: string;
  voluntarios_participantes: string[];
  observacoes_equipe: string;
}

interface AnimalForm {
  especie: string;
  sexo: string;
  idade_estimada: string;
  estado_aparente: string;
  observacoes: string;
}

interface Voluntario {
  id: string;
  nome: string;
  especialidades: string[];
}

interface Clinica {
  id: string;
  nome: string;
  endereco: string;
}

interface Especie {
  id: string;
  nome: string;
}

const WizardDenuncia: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  const [formData, setFormData] = useState<DenunciaForm>({
    // Etapa 1
    data_denuncia: new Date().toISOString().split('T')[0],
    hora_denuncia: new Date().toTimeString().slice(0, 5),
    local_encontrado: '',
    descricao_situacao: '',
    canal_denuncia: '',
    denunciante_anonimo: false,
    denunciante_nome: '',
    denunciante_contato: '',
    denunciante_observacoes: '',
    
    // Etapa 2
    quantidade_animais: 1,
    animais: [{
      especie: '',
      sexo: '',
      idade_estimada: '',
      estado_aparente: '',
      observacoes: ''
    }],
    
    // Etapa 3
    autoridades_contactadas: false,
    autoridade_tipo: '',
    autoridade_nome: '',
    autoridade_contacto: '',
    numero_ocorrencia: '',
    observacoes_autoridades: '',
    
    // Etapa 4
    intervencao_veterinaria: false,
    intervencao_veterinaria_data: '',
    intervencao_veterinaria_hora: '',
    clinica_id: '',
    veterinario_nome: '',
    diagnostico_inicial: '',
    tratamentos_aplicados: '',
    
    // Etapa 5
    voluntario_responsavel_id: '',
    voluntarios_participantes: [],
    observacoes_equipe: ''
  });

  // 🚨 VERIFICAÇÃO DE PERMISSÕES CORRIGIDA - SEM LOOP
  useEffect(() => {
    // Evitar múltiplas execuções
    if (initialized) return;
    
    console.log('🔍 [WIZARD] Inicializando wizard...');
    console.log('🔍 [WIZARD] User:', user);
    
    // 🚨 VERIFICAÇÃO SIMPLES SEM LOOP
    if (!user || !user.ativo) {
      console.log('❌ [WIZARD] Usuário não logado ou inativo');
      toast({
        title: "🚫 Acesso Negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    // 🚨 TOAST DE DEBUG ÚNICO
    toast({
      title: "✅ Acesso Liberado",
      description: `Usuário: ${user.username} | Perfil: ${user.perfil}`,
      variant: "default",
    });
    
    console.log('✅ [WIZARD] Acesso liberado, carregando dados...');
    setInitialized(true);
    loadInitialData();
  }, []); // 🚨 DEPENDÊNCIAS VAZIAS PARA EVITAR LOOP

  // Carregar Dados Iniciais
  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('📊 [WIZARD] Carregando dados iniciais...');

      // Carregar voluntários
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('id, nome, especialidades')
        .eq('ativo', true)
        .order('nome');

      if (!voluntariosError && voluntariosData) {
        setVoluntarios(voluntariosData);
        console.log('✅ [WIZARD] Voluntários carregados:', voluntariosData.length);
      } else {
        console.error('❌ [WIZARD] Erro ao carregar voluntários:', voluntariosError);
      }

      // Carregar clínicas
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas')
        .select('id, nome, endereco')
        .eq('ativo', true)
        .order('nome');

      if (!clinicasError && clinicasData) {
        setClinicas(clinicasData);
        console.log('✅ [WIZARD] Clínicas carregadas:', clinicasData.length);
      } else {
        console.error('❌ [WIZARD] Erro ao carregar clínicas:', clinicasError);
      }

      // Carregar espécies
      const { data: especiesData, error: especiesError } = await supabase
        .from('especies')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (!especiesError && especiesData) {
        setEspecies(especiesData);
        console.log('✅ [WIZARD] Espécies carregadas:', especiesData.length);
      } else {
        console.error('❌ [WIZARD] Erro ao carregar espécies:', especiesError);
      }

      console.log('✅ [WIZARD] Todos os dados carregados com sucesso');
    } catch (error) {
      console.error('❌ [WIZARD] Erro inesperado ao carregar dados:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao carregar dados iniciais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quantidade de animais
  const updateQuantidadeAnimais = (quantidade: number) => {
    const newAnimais = [...formData.animais];
    
    if (quantidade > newAnimais.length) {
      // Adicionar novos animais
      for (let i = newAnimais.length; i < quantidade; i++) {
        newAnimais.push({
          especie: '',
          sexo: '',
          idade_estimada: '',
          estado_aparente: '',
          observacoes: ''
        });
      }
    } else if (quantidade < newAnimais.length) {
      // Remover animais excedentes
      newAnimais.splice(quantidade);
    }
    
    setFormData({
      ...formData,
      quantidade_animais: quantidade,
      animais: newAnimais
    });
  };

  // Atualizar dados de um animal específico
  const updateAnimal = (index: number, field: keyof AnimalForm, value: string) => {
    const newAnimais = [...formData.animais];
    newAnimais[index] = {
      ...newAnimais[index],
      [field]: value
    };
    setFormData({
      ...formData,
      animais: newAnimais
    });
  };

  // Validação por etapa
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.data_denuncia &&
          formData.hora_denuncia &&
          formData.local_encontrado &&
          formData.descricao_situacao &&
          formData.canal_denuncia
        );
      case 2:
        return formData.quantidade_animais > 0 && 
               formData.animais.every(animal => 
                 animal.especie && animal.sexo && animal.estado_aparente
               );
      case 3:
        return true; // Etapa opcional
      case 4:
        return true; // Etapa opcional
      case 5:
        return !!formData.voluntario_responsavel_id;
      default:
        return false;
    }
  };

  // Navegação entre etapas
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, 5));
    } else {
      toast({
        title: "⚠️ Campos Obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  // Submissão do formulário
  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast({
        title: "⚠️ Formulário Incompleto",
        description: "Por favor, complete todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log('🚀 [WIZARD] Iniciando submissão...');

      // 1. Criar denúncia
      const { data: denunciaData, error: denunciaError } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .insert([{
          data_denuncia: formData.data_denuncia,
          hora_denuncia: formData.hora_denuncia,
          local_encontrado: formData.local_encontrado,
          descricao_situacao: formData.descricao_situacao,
          canal_denuncia: formData.canal_denuncia,
          denunciante_anonimo: formData.denunciante_anonimo,
          denunciante_nome: formData.denunciante_nome,
          denunciante_contato: formData.denunciante_contato,
          denunciante_observacoes: formData.denunciante_observacoes,
          quantidade_animais: formData.quantidade_animais,
          autoridades_contactadas: formData.autoridades_contactadas,
          autoridade_tipo: formData.autoridade_tipo,
          autoridade_nome: formData.autoridade_nome,
          autoridade_contacto: formData.autoridade_contacto,
          numero_ocorrencia: formData.numero_ocorrencia,
          observacoes_autoridades: formData.observacoes_autoridades,
          intervencao_veterinaria: formData.intervencao_veterinaria,
          intervencao_veterinaria_data: formData.intervencao_veterinaria_data,
          intervencao_veterinaria_hora: formData.intervencao_veterinaria_hora,
          clinica_id: formData.clinica_id || null,
          veterinario_nome: formData.veterinario_nome,
          diagnostico_inicial: formData.diagnostico_inicial,
          tratamentos_aplicados: formData.tratamentos_aplicados,
          voluntario_responsavel_id: formData.voluntario_responsavel_id,
          voluntarios_participantes: formData.voluntarios_participantes,
          observacoes_equipe: formData.observacoes_equipe,
          created_by: user?.username || 'admin'
        }])
        .select()
        .single();

      if (denunciaError) {
        throw denunciaError;
      }

      const codigoDenuncia = denunciaData.codigo;
      console.log('✅ [WIZARD] Denúncia criada:', codigoDenuncia);

      // 2. Criar animais automaticamente
      const animaisToCreate = formData.animais.map((animal, index) => ({
        nome: `${codigoDenuncia}-ANIM${String(index + 1).padStart(2, '0')}`,
        especie: animal.especie,
        sexo: animal.sexo,
        idade_estimada: animal.idade_estimada,
        estado: 'Em Resgate',
        local_encontrado: formData.local_encontrado,
        data_entrada: formData.data_denuncia,
        observacoes: animal.observacoes,
        responsavel_id: formData.voluntario_responsavel_id,
        created_by: user?.username || 'admin'
      }));

      const { error: animaisError } = await supabase
        .from('animais')
        .insert(animaisToCreate);

      if (animaisError) {
        console.error('❌ [WIZARD] Erro ao criar animais:', animaisError);
      } else {
        console.log('✅ [WIZARD] Animais criados:', animaisToCreate.length);
      }

      // 3. Criar missão automaticamente
      const { error: missaoError } = await supabase
        .from('missoes_2025_12_29_07_00')
        .insert([{
          codigo: `MIS-${codigoDenuncia}`,
          titulo: `Missão de Resgate - ${codigoDenuncia}`,
          descricao: `Missão de resgate baseada na denúncia ${codigoDenuncia}. Local: ${formData.local_encontrado}. ${formData.descricao_situacao}`,
          data_inicio: formData.data_denuncia,
          local_principal: formData.local_encontrado,
          prioridade: 'alta',
          status: 'ativa',
          responsavel_id: formData.voluntario_responsavel_id,
          observacoes: `Criada automaticamente pelo Wizard de Denúncias. ${formData.observacoes_equipe}`,
          created_by: user?.username || 'admin'
        }]);

      if (missaoError) {
        console.error('❌ [WIZARD] Erro ao criar missão:', missaoError);
      } else {
        console.log('✅ [WIZARD] Missão criada: MIS-' + codigoDenuncia);
      }

      toast({
        title: "✅ Operação Concluída",
        description: `Denúncia ${codigoDenuncia} criada com sucesso! Animais e missão gerados automaticamente.`,
        variant: "default",
      });

      // Redirecionar para detalhes da denúncia
      navigate(`/denuncia/${codigoDenuncia}`);

    } catch (error) {
      console.error('❌ [WIZARD] Erro ao submeter:', error);
      toast({
        title: "❌ Erro na Operação",
        description: "Erro ao criar denúncia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Se não inicializado ainda, não renderizar nada
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Activity className="h-16 w-16 animate-spin mx-auto mb-4 text-red-600" />
            <div className="absolute inset-0 h-16 w-16 animate-ping mx-auto rounded-full bg-red-400 opacity-20"></div>
          </div>
          <p className="text-lg text-gray-700 font-medium">Verificando Acesso...</p>
          <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Activity className="h-16 w-16 animate-spin mx-auto mb-4 text-red-600" />
            <div className="absolute inset-0 h-16 w-16 animate-ping mx-auto rounded-full bg-red-400 opacity-20"></div>
          </div>
          <p className="text-lg text-gray-700 font-medium">Preparando Operação...</p>
          <p className="text-sm text-gray-500 mt-2">Carregando dados táticos</p>
        </div>
      </div>
    );
  }

  const stepTitles = [
    "Identificação da Operação",
    "Alvos da Operação",
    "Intervenção das Autoridades", 
    "Suporte Médico Veterinário",
    "Equipe Tática Designada"
  ];

  const stepIcons = [
    <MapPin className="h-6 w-6" />,
    <Target className="h-6 w-6" />,
    <Shield className="h-6 w-6" />,
    <Stethoscope className="h-6 w-6" />,
    <Users className="h-6 w-6" />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header Tático */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <AlertTriangle className="h-12 w-12 text-white animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              🚨 OPERAÇÃO RESGATE 🚨
            </h1>
            <p className="text-xl text-red-100 mb-4">
              Wizard de Denúncias - Sistema Tático
            </p>
            <Badge className="bg-yellow-500 text-black font-bold px-4 py-2 text-lg">
              MISSÃO CRÍTICA - NÍVEL ALPHA
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b-2 border-red-200 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Etapa {currentStep} de 5: {stepTitles[currentStep - 1]}
            </h2>
            <div className="flex items-center space-x-2">
              {stepIcons[currentStep - 1]}
              <span className="text-sm text-gray-600">
                {Math.round((currentStep / 5) * 100)}% Completo
              </span>
            </div>
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-3" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {stepTitles.map((title, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center space-y-2 ${
                  index + 1 <= currentStep ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index + 1 <= currentStep 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs text-center max-w-20 hidden sm:block">
                  {title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-2xl border-2 border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              {stepIcons[currentStep - 1]}
              <span>ETAPA {currentStep}: {stepTitles[currentStep - 1]}</span>
            </CardTitle>
            <CardDescription className="text-red-100 text-lg">
              {currentStep === 1 && "Registre os dados básicos da denúncia e localização"}
              {currentStep === 2 && "Identifique e catalogue todos os animais envolvidos"}
              {currentStep === 3 && "Documente intervenções policiais ou de autoridades"}
              {currentStep === 4 && "Registre cuidados médicos veterinários aplicados"}
              {currentStep === 5 && "Designe a equipe responsável pela operação"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* Etapa 1: Identificação da Operação */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="data_denuncia" className="text-base font-semibold text-gray-700">
                      📅 Data da Denúncia *
                    </Label>
                    <Input
                      id="data_denuncia"
                      type="date"
                      value={formData.data_denuncia}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({...formData, data_denuncia: e.target.value})}
                      className="mt-2 h-12 border-2 border-red-200 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hora_denuncia" className="text-base font-semibold text-gray-700">
                      🕐 Hora da Denúncia *
                    </Label>
                    <Input
                      id="hora_denuncia"
                      type="time"
                      value={formData.hora_denuncia}
                      onChange={(e) => setFormData({...formData, hora_denuncia: e.target.value})}
                      className="mt-2 h-12 border-2 border-red-200 focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="canal_denuncia" className="text-base font-semibold text-gray-700">
                    📞 Canal da Denúncia *
                  </Label>
                  <Select 
                    value={formData.canal_denuncia} 
                    onValueChange={(value) => setFormData({...formData, canal_denuncia: value})}
                  >
                    <SelectTrigger className="mt-2 h-12 border-2 border-red-200 focus:border-red-500">
                      <SelectValue placeholder="Selecione o canal de denúncia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telefone">📞 Telefone</SelectItem>
                      <SelectItem value="site">🌐 Site/Online</SelectItem>
                      <SelectItem value="pessoalmente">👤 Pessoalmente</SelectItem>
                      <SelectItem value="autoridades">🚔 A pedido das autoridades</SelectItem>
                      <SelectItem value="redes_sociais">📱 Redes Sociais</SelectItem>
                      <SelectItem value="email">📧 E-mail</SelectItem>
                      <SelectItem value="outro">❓ Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="local_encontrado" className="text-base font-semibold text-gray-700">
                    📍 Local Encontrado *
                  </Label>
                  <Input
                    id="local_encontrado"
                    value={formData.local_encontrado}
                    onChange={(e) => setFormData({...formData, local_encontrado: e.target.value})}
                    placeholder="Endereço completo ou descrição detalhada do local"
                    className="mt-2 h-12 border-2 border-red-200 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao_situacao" className="text-base font-semibold text-gray-700">
                    📝 Descrição da Situação *
                  </Label>
                  <Textarea
                    id="descricao_situacao"
                    value={formData.descricao_situacao}
                    onChange={(e) => setFormData({...formData, descricao_situacao: e.target.value})}
                    placeholder="Descreva detalhadamente a situação encontrada, condições dos animais, ambiente, etc."
                    className="mt-2 min-h-32 border-2 border-red-200 focus:border-red-500"
                    required
                  />
                </div>

                <Separator className="my-6" />

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Dados do Denunciante (Opcional)
                  </h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.denunciante_anonimo}
                        onChange={(e) => setFormData({...formData, denunciante_anonimo: e.target.checked})}
                        className="w-5 h-5 text-amber-600"
                      />
                      <span className="text-base font-medium text-amber-800">
                        🕶️ Denunciante deseja anonimato
                      </span>
                    </label>
                  </div>

                  {!formData.denunciante_anonimo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="denunciante_nome" className="text-base font-medium text-amber-700">
                          Nome do Denunciante
                        </Label>
                        <Input
                          id="denunciante_nome"
                          value={formData.denunciante_nome}
                          onChange={(e) => setFormData({...formData, denunciante_nome: e.target.value})}
                          placeholder="Nome completo"
                          className="mt-2 border-amber-300 focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="denunciante_contato" className="text-base font-medium text-amber-700">
                          Contacto
                        </Label>
                        <Input
                          id="denunciante_contato"
                          value={formData.denunciante_contato}
                          onChange={(e) => setFormData({...formData, denunciante_contato: e.target.value})}
                          placeholder="Telefone ou e-mail"
                          className="mt-2 border-amber-300 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Label htmlFor="denunciante_observacoes" className="text-base font-medium text-amber-700">
                      Observações sobre o Denunciante
                    </Label>
                    <Textarea
                      id="denunciante_observacoes"
                      value={formData.denunciante_observacoes}
                      onChange={(e) => setFormData({...formData, denunciante_observacoes: e.target.value})}
                      placeholder="Informações adicionais sobre o denunciante ou contexto da denúncia"
                      className="mt-2 border-amber-300 focus:border-amber-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Alvos da Operação (Animais) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Quantificação de Alvos
                  </h3>
                  
                  <div>
                    <Label htmlFor="quantidade_animais" className="text-base font-semibold text-blue-700">
                      🎯 Quantidade de Animais *
                    </Label>
                    <Select 
                      value={formData.quantidade_animais.toString()} 
                      onValueChange={(value) => updateQuantidadeAnimais(parseInt(value))}
                    >
                      <SelectTrigger className="mt-2 h-12 border-2 border-blue-300 focus:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,15,20,25,30].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Animal' : 'Animais'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  {formData.animais.map((animal, index) => (
                    <Card key={index} className="border-2 border-green-200 bg-green-50">
                      <CardHeader className="bg-green-100 border-b border-green-200">
                        <CardTitle className="text-lg text-green-800 flex items-center">
                          <Target className="h-5 w-5 mr-2" />
                          ALVO #{index + 1} - {formData.data_denuncia ? `DEN${formData.data_denuncia.slice(2,4)}${String(index + 1).padStart(3, '0')}-ANIM${String(index + 1).padStart(2, '0')}` : `ANIM${String(index + 1).padStart(2, '0')}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-base font-semibold text-green-700">
                              🐾 Espécie *
                            </Label>
                            <Select 
                              value={animal.especie} 
                              onValueChange={(value) => updateAnimal(index, 'especie', value)}
                            >
                              <SelectTrigger className="mt-2 h-12 border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Selecione a espécie" />
                              </SelectTrigger>
                              <SelectContent>
                                {especies.map(especie => (
                                  <SelectItem key={especie.id} value={especie.nome}>
                                    {especie.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-base font-semibold text-green-700">
                              ⚥ Sexo *
                            </Label>
                            <Select 
                              value={animal.sexo} 
                              onValueChange={(value) => updateAnimal(index, 'sexo', value)}
                            >
                              <SelectTrigger className="mt-2 h-12 border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Selecione o sexo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Macho">♂️ Macho</SelectItem>
                                <SelectItem value="Fêmea">♀️ Fêmea</SelectItem>
                                <SelectItem value="Indeterminado">❓ Indeterminado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-base font-semibold text-green-700">
                              📅 Idade Estimada
                            </Label>
                            <Select 
                              value={animal.idade_estimada} 
                              onValueChange={(value) => updateAnimal(index, 'idade_estimada', value)}
                            >
                              <SelectTrigger className="mt-2 h-12 border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Selecione a idade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Filhote">🍼 Filhote (0-6 meses)</SelectItem>
                                <SelectItem value="Jovem">🐕 Jovem (6 meses - 2 anos)</SelectItem>
                                <SelectItem value="Adulto">🦮 Adulto (2-7 anos)</SelectItem>
                                <SelectItem value="Idoso">👴 Idoso (7+ anos)</SelectItem>
                                <SelectItem value="Indeterminado">❓ Indeterminado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-base font-semibold text-green-700">
                              🏥 Estado Aparente *
                            </Label>
                            <Select 
                              value={animal.estado_aparente} 
                              onValueChange={(value) => updateAnimal(index, 'estado_aparente', value)}
                            >
                              <SelectTrigger className="mt-2 h-12 border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Bom">✅ Bom</SelectItem>
                                <SelectItem value="Regular">⚠️ Regular</SelectItem>
                                <SelectItem value="Mau">❌ Mau</SelectItem>
                                <SelectItem value="Crítico">🚨 Crítico</SelectItem>
                                <SelectItem value="Ferido">🩹 Ferido</SelectItem>
                                <SelectItem value="Doente">🤒 Doente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label className="text-base font-semibold text-green-700">
                            📝 Observações do Alvo
                          </Label>
                          <Textarea
                            value={animal.observacoes}
                            onChange={(e) => updateAnimal(index, 'observacoes', e.target.value)}
                            placeholder="Descreva características físicas, comportamento, ferimentos, etc."
                            className="mt-2 border-green-300 focus:border-green-500"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Etapa 3: Intervenção das Autoridades */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Coordenação com Autoridades
                  </h3>
                  
                  <div className="mb-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.autoridades_contactadas}
                        onChange={(e) => setFormData({...formData, autoridades_contactadas: e.target.checked})}
                        className="w-5 h-5 text-purple-600"
                      />
                      <span className="text-base font-semibold text-purple-800">
                        🚔 Autoridades foram contactadas
                      </span>
                    </label>
                  </div>

                  {formData.autoridades_contactadas && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base font-semibold text-purple-700">
                            🏛️ Tipo de Autoridade
                          </Label>
                          <Select 
                            value={formData.autoridade_tipo} 
                            onValueChange={(value) => setFormData({...formData, autoridade_tipo: value})}
                          >
                            <SelectTrigger className="mt-2 h-12 border-purple-300 focus:border-purple-500">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PSP">🚔 PSP - Polícia de Segurança Pública</SelectItem>
                              <SelectItem value="GNR">🚓 GNR - Guarda Nacional Republicana</SelectItem>
                              <SelectItem value="SEPNA">🌿 SEPNA - Proteção da Natureza</SelectItem>
                              <SelectItem value="Bombeiros">🚒 Bombeiros</SelectItem>
                              <SelectItem value="Câmara Municipal">🏛️ Câmara Municipal</SelectItem>
                              <SelectItem value="DGAV">🏥 DGAV - Direção Geral de Veterinária</SelectItem>
                              <SelectItem value="Outro">❓ Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-purple-700">
                            👮 Nome do Agente/Responsável
                          </Label>
                          <Input
                            value={formData.autoridade_nome}
                            onChange={(e) => setFormData({...formData, autoridade_nome: e.target.value})}
                            placeholder="Nome do agente ou responsável"
                            className="mt-2 h-12 border-purple-300 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-purple-700">
                            📞 Contacto da Autoridade
                          </Label>
                          <Input
                            value={formData.autoridade_contacto}
                            onChange={(e) => setFormData({...formData, autoridade_contacto: e.target.value})}
                            placeholder="Telefone ou e-mail"
                            className="mt-2 h-12 border-purple-300 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-purple-700">
                            📋 Número da Ocorrência
                          </Label>
                          <Input
                            value={formData.numero_ocorrencia}
                            onChange={(e) => setFormData({...formData, numero_ocorrencia: e.target.value})}
                            placeholder="Número de processo ou ocorrência"
                            className="mt-2 h-12 border-purple-300 focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold text-purple-700">
                          📝 Observações sobre Intervenção das Autoridades
                        </Label>
                        <Textarea
                          value={formData.observacoes_autoridades}
                          onChange={(e) => setFormData({...formData, observacoes_autoridades: e.target.value})}
                          placeholder="Descreva a intervenção das autoridades, decisões tomadas, etc."
                          className="mt-2 border-purple-300 focus:border-purple-500"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 4: Suporte Médico Veterinário */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Suporte Médico Veterinário
                  </h3>
                  
                  <div className="mb-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.intervencao_veterinaria}
                        onChange={(e) => setFormData({...formData, intervencao_veterinaria: e.target.checked})}
                        className="w-5 h-5 text-teal-600"
                      />
                      <span className="text-base font-semibold text-teal-800">
                        🏥 Houve intervenção veterinária
                      </span>
                    </label>
                  </div>

                  {formData.intervencao_veterinaria && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base font-semibold text-teal-700">
                            📅 Data da Intervenção
                          </Label>
                          <Input
                            type="date"
                            value={formData.intervencao_veterinaria_data}
                            onChange={(e) => setFormData({...formData, intervencao_veterinaria_data: e.target.value})}
                            className="mt-2 h-12 border-teal-300 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-teal-700">
                            🕐 Hora da Intervenção
                          </Label>
                          <Input
                            type="time"
                            value={formData.intervencao_veterinaria_hora}
                            onChange={(e) => setFormData({...formData, intervencao_veterinaria_hora: e.target.value})}
                            className="mt-2 h-12 border-teal-300 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-teal-700">
                            🏥 Clínica Veterinária
                          </Label>
                          <Select 
                            value={formData.clinica_id} 
                            onValueChange={(value) => setFormData({...formData, clinica_id: value})}
                          >
                            <SelectTrigger className="mt-2 h-12 border-teal-300 focus:border-teal-500">
                              <SelectValue placeholder="Selecione a clínica" />
                            </SelectTrigger>
                            <SelectContent>
                              {clinicas.map(clinica => (
                                <SelectItem key={clinica.id} value={clinica.id}>
                                  {clinica.nome} - {clinica.endereco}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-teal-700">
                            👨‍⚕️ Nome do Veterinário
                          </Label>
                          <Input
                            value={formData.veterinario_nome}
                            onChange={(e) => setFormData({...formData, veterinario_nome: e.target.value})}
                            placeholder="Nome do veterinário responsável"
                            className="mt-2 h-12 border-teal-300 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold text-teal-700">
                          🔬 Diagnóstico Inicial
                        </Label>
                        <Textarea
                          value={formData.diagnostico_inicial}
                          onChange={(e) => setFormData({...formData, diagnostico_inicial: e.target.value})}
                          placeholder="Diagnóstico inicial do veterinário"
                          className="mt-2 border-teal-300 focus:border-teal-500"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label className="text-base font-semibold text-teal-700">
                          💊 Tratamentos Aplicados
                        </Label>
                        <Textarea
                          value={formData.tratamentos_aplicados}
                          onChange={(e) => setFormData({...formData, tratamentos_aplicados: e.target.value})}
                          placeholder="Descreva os tratamentos, medicamentos e procedimentos aplicados"
                          className="mt-2 border-teal-300 focus:border-teal-500"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 5: Equipe Tática Designada */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Designação da Equipe Tática
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold text-indigo-700">
                        👨‍💼 Comandante da Operação (Responsável) *
                      </Label>
                      <Select 
                        value={formData.voluntario_responsavel_id} 
                        onValueChange={(value) => setFormData({...formData, voluntario_responsavel_id: value})}
                      >
                        <SelectTrigger className="mt-2 h-12 border-indigo-300 focus:border-indigo-500">
                          <SelectValue placeholder="Selecione o voluntário responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {voluntarios.map(voluntario => (
                            <SelectItem key={voluntario.id} value={voluntario.id}>
                              {voluntario.nome} {voluntario.especialidades?.length > 0 && `(${voluntario.especialidades.join(', ')})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-indigo-700">
                        👥 Equipe de Apoio (Voluntários Participantes)
                      </Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border-2 border-indigo-200 rounded-lg p-4">
                        {voluntarios
                          .filter(v => v.id !== formData.voluntario_responsavel_id)
                          .map(voluntario => (
                          <label key={voluntario.id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.voluntarios_participantes.includes(voluntario.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    voluntarios_participantes: [...formData.voluntarios_participantes, voluntario.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    voluntarios_participantes: formData.voluntarios_participantes.filter(id => id !== voluntario.id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-indigo-600"
                            />
                            <span className="text-sm text-indigo-700">
                              {voluntario.nome} {voluntario.especialidades?.length > 0 && `(${voluntario.especialidades.join(', ')})`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-indigo-700">
                        📝 Observações da Equipe
                      </Label>
                      <Textarea
                        value={formData.observacoes_equipe}
                        onChange={(e) => setFormData({...formData, observacoes_equipe: e.target.value})}
                        placeholder="Instruções especiais, estratégia da operação, recursos necessários, etc."
                        className="mt-2 border-indigo-300 focus:border-indigo-500"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo da Operação */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Resumo da Operação
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>📅 Data/Hora:</strong> {formData.data_denuncia} às {formData.hora_denuncia}
                    </div>
                    <div>
                      <strong>📞 Canal:</strong> {formData.canal_denuncia}
                    </div>
                    <div>
                      <strong>📍 Local:</strong> {formData.local_encontrado}
                    </div>
                    <div>
                      <strong>🎯 Animais:</strong> {formData.quantidade_animais}
                    </div>
                    <div>
                      <strong>🚔 Autoridades:</strong> {formData.autoridades_contactadas ? 'Sim' : 'Não'}
                    </div>
                    <div>
                      <strong>🏥 Veterinário:</strong> {formData.intervencao_veterinaria ? 'Sim' : 'Não'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-8 py-6 border-t-2 border-gray-200 flex justify-between">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="flex items-center space-x-2 border-2 border-gray-300 hover:border-gray-400"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
                disabled={!validateStep(currentStep)}
              >
                <span>Próxima</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !validateStep(5)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Executando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>🚨 EXECUTAR OPERAÇÃO</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Footer Motivacional */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">
            🐾 "SOMOS A VOZ DOS QUE NÃO PODEM FALAR POR SI" 🐾
          </p>
          <p className="text-red-100">
            Cada denúncia é uma oportunidade de salvar vidas. Obrigado por fazer a diferença.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WizardDenuncia;