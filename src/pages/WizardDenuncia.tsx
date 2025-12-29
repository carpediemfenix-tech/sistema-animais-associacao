import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageActionBar from '@/components/PageActionBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Shield,
  Target,
  Users,
  Stethoscope,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Phone,
  Globe,
  User,
  Mail,
  Share2,
  HelpCircle,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  FileText,
  Heart,
  Activity,
  Zap
} from 'lucide-react';

// Interfaces Táticas
interface DenunciaForm {
  // Etapa 1: Identificação
  data_denuncia: string;
  canal_denuncia: string;
  canal_denuncia_outro: string;
  local_completo: string;
  descricao_situacao: string;
  denunciante_anonimo: boolean;
  denunciante_nome: string;
  denunciante_contato: string;
  denunciante_observacoes: string;
  
  // Etapa 2: Animais
  quantidade_animais: number;
  animais: AnimalForm[];
  
  // Etapa 3: Autoridades
  intervencao_policial: boolean;
  dados_intervencao_policial: {
    tipo_autoridade: string;
    numero_ocorrencia: string;
    agentes_responsaveis: string;
    observacoes: string;
  };
  
  // Etapa 4: Veterinário
  intervencao_veterinaria: boolean;
  dados_intervencao_veterinaria: {
    clinica_id: string;
    veterinario_nome: string;
    diagnostico_inicial: string;
    tratamentos_aplicados: string;
  };
  
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

const WizardDenuncia: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  // Estados Táticos
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [especies, setEspecies] = useState<string[]>([]);

  // Formulário Principal
  const [formData, setFormData] = useState<DenunciaForm>({
    // Etapa 1
    data_denuncia: new Date().toISOString().slice(0, 16),
    canal_denuncia: '',
    canal_denuncia_outro: '',
    local_completo: '',
    descricao_situacao: '',
    denunciante_anonimo: false,
    denunciante_nome: '',
    denunciante_contato: '',
    denunciante_observacoes: '',
    
    // Etapa 2
    quantidade_animais: 1,
    animais: [{ especie: '', sexo: '', idade_estimada: '', estado_aparente: '', observacoes: '' }],
    
    // Etapa 3
    intervencao_policial: false,
    dados_intervencao_policial: {
      tipo_autoridade: '',
      numero_ocorrencia: '',
      agentes_responsaveis: '',
      observacoes: ''
    },
    
    // Etapa 4
    intervencao_veterinaria: false,
    dados_intervencao_veterinaria: {
      clinica_id: '',
      veterinario_nome: '',
      diagnostico_inicial: '',
      tratamentos_aplicados: ''
    },
    
    // Etapa 5
    voluntario_responsavel_id: '',
    voluntarios_participantes: [],
    observacoes_equipe: ''
  });

  // Verificação de Permissões
  useEffect(() => {
    if (!hasPermission('admin')) {
      toast({
        title: "🚫 Acesso Negado",
        description: "Apenas administradores podem criar denúncias.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    loadInitialData();
  }, []);

  // Carregar Dados Iniciais
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Carregar voluntários
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('id, nome, especialidades')
        .eq('ativo', true)
        .order('nome');

      if (!voluntariosError && voluntariosData) {
        setVoluntarios(voluntariosData);
      }

      // Carregar clínicas
      const { data: clinicasData, error: clinicasError } = await supabase
        .from('clinicas')
        .select('id, nome, endereco')
        .eq('ativo', true)
        .order('nome');

      if (!clinicasError && clinicasData) {
        setClinicas(clinicasData);
      }

      // Carregar espécies
      const { data: especiesData, error: especiesError } = await supabase
        .from('especies')
        .select('nome')
        .eq('ativo', true)
        .order('nome');

      if (!especiesError && especiesData) {
        setEspecies(especiesData.map(e => e.nome));
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "⚠️ Erro de Carregamento",
        description: "Erro ao carregar dados iniciais. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quantidade de animais
  const updateQuantidadeAnimais = (quantidade: number) => {
    const newAnimais = Array.from({ length: quantidade }, (_, index) => 
      formData.animais[index] || { especie: '', sexo: '', idade_estimada: '', estado_aparente: '', observacoes: '' }
    );
    
    setFormData(prev => ({
      ...prev,
      quantidade_animais: quantidade,
      animais: newAnimais
    }));
  };

  // Validações por Etapa
  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.data_denuncia) errors.push('Data e hora são obrigatórias');
        if (!formData.canal_denuncia) errors.push('Canal de denúncia é obrigatório');
        if (formData.canal_denuncia === 'outro' && !formData.canal_denuncia_outro.trim()) {
          errors.push('Especifique o canal de denúncia');
        }
        if (!formData.local_completo.trim()) errors.push('Local é obrigatório');
        if (!formData.descricao_situacao.trim()) errors.push('Descrição é obrigatória');
        
        // Validar data não futura
        const dataInserida = new Date(formData.data_denuncia);
        const agora = new Date();
        if (dataInserida > agora) {
          errors.push('Data da denúncia não pode ser futura');
        }
        break;

      case 2:
        if (formData.quantidade_animais < 1) errors.push('Deve haver pelo menos 1 animal');
        formData.animais.forEach((animal, index) => {
          if (!animal.especie) errors.push(`Animal ${index + 1}: Espécie é obrigatória`);
          if (!animal.sexo) errors.push(`Animal ${index + 1}: Sexo é obrigatório`);
          if (!animal.estado_aparente) errors.push(`Animal ${index + 1}: Estado aparente é obrigatório`);
        });
        break;

      case 3:
        if (formData.intervencao_policial) {
          if (!formData.dados_intervencao_policial.tipo_autoridade) {
            errors.push('Tipo de autoridade é obrigatório');
          }
        }
        break;

      case 4:
        if (formData.intervencao_veterinaria) {
          if (!formData.dados_intervencao_veterinaria.clinica_id) {
            errors.push('Clínica é obrigatória');
          }
        }
        break;

      case 5:
        if (!formData.voluntario_responsavel_id) {
          errors.push('Voluntário responsável é obrigatório');
        }
        if (formData.voluntarios_participantes.length === 0) {
          errors.push('Deve haver pelo menos 1 voluntário participante');
        }
        break;
    }

    return errors;
  };

  // Navegação entre Etapas
  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      toast({
        title: "⚠️ Validação Falhada",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submissão Final
  const submitDenuncia = async () => {
    try {
      setLoading(true);

      // Validar todas as etapas
      for (let step = 1; step <= 5; step++) {
        const errors = validateStep(step);
        if (errors.length > 0) {
          toast({
            title: "⚠️ Validação Falhada",
            description: `Etapa ${step}: ${errors.join(', ')}`,
            variant: "destructive",
          });
          setCurrentStep(step);
          return;
        }
      }

      // Gerar código da denúncia
      const { data: codigoData, error: codigoError } = await supabase
        .rpc('gerar_proximo_codigo_denuncia');

      if (codigoError) {
        throw new Error('Erro ao gerar código da denúncia');
      }

      const codigoDenuncia = codigoData;

      // Criar denúncia
      const denunciaData = {
        codigo: codigoDenuncia,
        data_denuncia: formData.data_denuncia,
        canal_denuncia: formData.canal_denuncia,
        canal_denuncia_outro: formData.canal_denuncia === 'outro' ? formData.canal_denuncia_outro : null,
        local_completo: formData.local_completo,
        descricao_situacao: formData.descricao_situacao,
        denunciante_anonimo: formData.denunciante_anonimo,
        denunciante_nome: formData.denunciante_anonimo ? null : formData.denunciante_nome,
        denunciante_contato: formData.denunciante_anonimo ? null : formData.denunciante_contato,
        denunciante_observacoes: formData.denunciante_anonimo ? null : formData.denunciante_observacoes,
        quantidade_animais: formData.quantidade_animais,
        intervencao_policial: formData.intervencao_policial,
        dados_intervencao_policial: formData.intervencao_policial ? formData.dados_intervencao_policial : null,
        intervencao_veterinaria: formData.intervencao_veterinaria,
        dados_intervencao_veterinaria: formData.intervencao_veterinaria ? formData.dados_intervencao_veterinaria : null,
        voluntario_responsavel_id: formData.voluntario_responsavel_id,
        voluntarios_participantes: formData.voluntarios_participantes,
        status: 'aberta',
        created_by: user?.username || 'admin'
      };

      const { data: denunciaCreated, error: denunciaError } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .insert([denunciaData])
        .select()
        .single();

      if (denunciaError) {
        throw new Error('Erro ao criar denúncia: ' + denunciaError.message);
      }

      // Criar animais automaticamente
      const animaisCriados = [];
      for (let i = 0; i < formData.animais.length; i++) {
        const animal = formData.animais[i];
        const nomeAnimal = `${codigoDenuncia}-ANIM${String(i + 1).padStart(2, '0')}`;
        
        const animalData = {
          nome: nomeAnimal,
          especie: animal.especie,
          sexo: animal.sexo,
          idade_estimada: animal.idade_estimada,
          estado: 'Em Resgate',
          local_encontrado: formData.local_completo,
          observacoes: animal.observacoes,
          responsavel_id: formData.voluntario_responsavel_id,
          created_by: user?.username || 'admin'
        };

        const { data: animalCreated, error: animalError } = await supabase
          .from('animais')
          .insert([animalData])
          .select()
          .single();

        if (animalError) {
          console.error('Erro ao criar animal:', animalError);
          continue;
        }

        animaisCriados.push(animalCreated);

        // Registrar sequência
        await supabase
          .from('denuncias_animais_sequencia')
          .insert([{
            denuncia_codigo: codigoDenuncia,
            animal_id: animalCreated.id,
            sequencia: i + 1,
            nome_gerado: nomeAnimal
          }]);
      }

      // Criar missão automaticamente
      const codigoMissao = `MIS-${codigoDenuncia}`;
      const tituloMissao = `${codigoMissao} - ${formData.local_completo}`;

      const missaoData = {
        codigo: codigoMissao,
        titulo: tituloMissao,
        descricao: `Missão gerada automaticamente pela denúncia ${codigoDenuncia}. ${formData.descricao_situacao}`,
        data_inicio: formData.data_denuncia.split('T')[0],
        local_principal: formData.local_completo,
        prioridade: 'alta',
        status: 'ativa',
        responsavel_id: formData.voluntario_responsavel_id,
        observacoes: `Denúncia: ${codigoDenuncia}. Animais: ${formData.quantidade_animais}. ${formData.observacoes_equipe}`,
        created_by: user?.username || 'admin'
      };

      const { data: missaoCreated, error: missaoError } = await supabase
        .from('missoes_2025_12_29_07_00')
        .insert([missaoData])
        .select()
        .single();

      if (missaoError) {
        console.error('Erro ao criar missão:', missaoError);
      } else {
        // Atualizar denúncia com ID da missão
        await supabase
          .from('denuncias_2025_12_29_23_00')
          .update({ missao_id: missaoCreated.id })
          .eq('id', denunciaCreated.id);

        // Adicionar animais à missão
        for (const animal of animaisCriados) {
          await supabase
            .from('missoes_animais_2025_12_29_07_00')
            .insert([{
              missao_id: missaoCreated.id,
              animal_id: animal.id,
              papel: 'resgatado',
              observacoes: `Animal da denúncia ${codigoDenuncia}`
            }]);
        }

        // Adicionar participações à missão
        for (const voluntarioId of formData.voluntarios_participantes) {
          await supabase
            .from('participacoes_missoes_2025_12_29_07_00')
            .insert([{
              missao_id: missaoCreated.id,
              voluntario_id: voluntarioId,
              funcao: voluntarioId === formData.voluntario_responsavel_id ? 'responsavel' : 'participante',
              status: 'confirmada'
            }]);
        }
      }

      // Criar intervenções se necessário
      if (formData.intervencao_policial) {
        for (const animal of animaisCriados) {
          await supabase
            .from('intervencoes_autoridades')
            .insert([{
              animal_id: animal.id,
              tipo_autoridade: formData.dados_intervencao_policial.tipo_autoridade,
              data_intervencao: formData.data_denuncia,
              numero_ocorrencia: formData.dados_intervencao_policial.numero_ocorrencia,
              agentes_responsaveis: formData.dados_intervencao_policial.agentes_responsaveis,
              observacoes: `Denúncia ${codigoDenuncia}: ${formData.dados_intervencao_policial.observacoes}`,
              created_by: user?.username || 'admin'
            }]);
        }
      }

      if (formData.intervencao_veterinaria) {
        for (const animal of animaisCriados) {
          await supabase
            .from('intervencoes')
            .insert([{
              animal_id: animal.id,
              tipo: 'Emergência',
              data_intervencao: formData.data_denuncia,
              clinica_id: formData.dados_intervencao_veterinaria.clinica_id,
              veterinario: formData.dados_intervencao_veterinaria.veterinario_nome,
              diagnostico: formData.dados_intervencao_veterinaria.diagnostico_inicial,
              tratamento: formData.dados_intervencao_veterinaria.tratamentos_aplicados,
              observacoes: `Denúncia ${codigoDenuncia} - Intervenção de emergência`,
              created_by: user?.username || 'admin'
            }]);
        }
      }

      toast({
        title: "🎯 Operação Concluída!",
        description: `Denúncia ${codigoDenuncia} criada com sucesso. ${animaisCriados.length} animais registrados.`,
      });

      navigate(`/denuncia/${codigoDenuncia}`);

    } catch (error) {
      console.error('Erro ao submeter denúncia:', error);
      toast({
        title: "❌ Operação Falhada",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderização das Etapas
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderEtapa1();
      case 2:
        return renderEtapa2();
      case 3:
        return renderEtapa3();
      case 4:
        return renderEtapa4();
      case 5:
        return renderEtapa5();
      default:
        return null;
    }
  };

  // Etapa 1: Identificação da Operação
  const renderEtapa1 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white p-6 rounded-lg border-l-4 border-red-500">
        <div className="flex items-center mb-3">
          <AlertTriangle className="h-6 w-6 mr-3" />
          <h3 className="text-xl font-bold">IDENTIFICAÇÃO DA OPERAÇÃO</h3>
        </div>
        <p className="text-red-100">
          Registre com precisão militar todos os dados da denúncia. Cada detalhe pode salvar vidas.
        </p>
      </div>

      {/* Data e Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_denuncia" className="flex items-center font-semibold">
            <Clock className="h-4 w-4 mr-2" />
            Data e Hora da Denúncia *
          </Label>
          <Input
            id="data_denuncia"
            type="datetime-local"
            value={formData.data_denuncia}
            onChange={(e) => setFormData(prev => ({ ...prev, data_denuncia: e.target.value }))}
            className="mt-1"
            required
          />
        </div>

        {/* Canal de Denúncia */}
        <div>
          <Label htmlFor="canal_denuncia" className="flex items-center font-semibold">
            <Zap className="h-4 w-4 mr-2" />
            Canal de Intel *
          </Label>
          <Select 
            value={formData.canal_denuncia} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, canal_denuncia: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="telefone">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Telefone
                </div>
              </SelectItem>
              <SelectItem value="site">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Site/Online
                </div>
              </SelectItem>
              <SelectItem value="pessoalmente">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Pessoalmente
                </div>
              </SelectItem>
              <SelectItem value="autoridades">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  A pedido das autoridades
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </div>
              </SelectItem>
              <SelectItem value="redes_sociais">
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Redes sociais
                </div>
              </SelectItem>
              <SelectItem value="outro">
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Outro
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campo Outro (condicional) */}
      {formData.canal_denuncia === 'outro' && (
        <div>
          <Label htmlFor="canal_denuncia_outro" className="font-semibold">
            Especificar Canal *
          </Label>
          <Input
            id="canal_denuncia_outro"
            value={formData.canal_denuncia_outro}
            onChange={(e) => setFormData(prev => ({ ...prev, canal_denuncia_outro: e.target.value }))}
            placeholder="Especifique o canal de denúncia"
            className="mt-1"
            required
          />
        </div>
      )}

      {/* Local */}
      <div>
        <Label htmlFor="local_completo" className="flex items-center font-semibold">
          <MapPin className="h-4 w-4 mr-2" />
          Coordenadas da Operação *
        </Label>
        <Textarea
          id="local_completo"
          value={formData.local_completo}
          onChange={(e) => setFormData(prev => ({ ...prev, local_completo: e.target.value }))}
          placeholder="Endereço completo, pontos de referência, coordenadas GPS..."
          rows={3}
          className="mt-1"
          required
        />
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao_situacao" className="flex items-center font-semibold">
          <FileText className="h-4 w-4 mr-2" />
          Relatório da Situação *
        </Label>
        <Textarea
          id="descricao_situacao"
          value={formData.descricao_situacao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao_situacao: e.target.value }))}
          placeholder="Descreva detalhadamente a situação encontrada, estado dos animais, condições do local..."
          rows={4}
          className="mt-1"
          required
        />
      </div>

      {/* Seção Informante */}
      <div className="border-t-2 border-gray-300 pt-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          DADOS DO INFORMANTE
        </h3>
        
        {/* Checkbox Anonimato */}
        <div className="flex items-center space-x-3 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Checkbox
            id="denunciante_anonimo"
            checked={formData.denunciante_anonimo}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, denunciante_anonimo: !!checked }))}
          />
          <Label htmlFor="denunciante_anonimo" className="text-sm font-medium flex items-center">
            {formData.denunciante_anonimo ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            Operação Anónima (proteger identidade do informante)
          </Label>
        </div>

        {/* Campos condicionais */}
        {!formData.denunciante_anonimo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="denunciante_nome">Nome do Informante</Label>
                <Input
                  id="denunciante_nome"
                  value={formData.denunciante_nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, denunciante_nome: e.target.value }))}
                  placeholder="Nome completo (opcional)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="denunciante_contato">Contacto</Label>
                <Input
                  id="denunciante_contato"
                  value={formData.denunciante_contato}
                  onChange={(e) => setFormData(prev => ({ ...prev, denunciante_contato: e.target.value }))}
                  placeholder="Telefone, email, etc. (opcional)"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="denunciante_observacoes">Intel Adicional sobre o Informante</Label>
              <Textarea
                id="denunciante_observacoes"
                value={formData.denunciante_observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, denunciante_observacoes: e.target.value }))}
                placeholder="Informações adicionais sobre o informante, credibilidade, etc."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {formData.denunciante_anonimo && (
          <div className="bg-blue-900 text-white p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <p className="font-medium">
                OPERAÇÃO CLASSIFICADA - Os dados do informante estão protegidos e não serão registrados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Etapa 2: Alvos da Operação (Animais)
  const renderEtapa2 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-900 to-orange-800 text-white p-6 rounded-lg border-l-4 border-orange-500">
        <div className="flex items-center mb-3">
          <Target className="h-6 w-6 mr-3" />
          <h3 className="text-xl font-bold">ALVOS DA OPERAÇÃO</h3>
        </div>
        <p className="text-orange-100">
          Identifique cada animal que precisa de resgate. Cada vida conta na nossa missão.
        </p>
      </div>

      {/* Quantidade de Animais */}
      <div>
        <Label htmlFor="quantidade_animais" className="flex items-center font-semibold text-lg">
          <Heart className="h-5 w-5 mr-2" />
          Número de Alvos (Animais) *
        </Label>
        <div className="flex items-center space-x-4 mt-2">
          <Input
            id="quantidade_animais"
            type="number"
            min="1"
            max="20"
            value={formData.quantidade_animais}
            onChange={(e) => updateQuantidadeAnimais(parseInt(e.target.value) || 1)}
            className="w-24 text-center text-lg font-bold"
            required
          />
          <Badge variant="outline" className="text-lg px-3 py-1">
            {formData.quantidade_animais} {formData.quantidade_animais === 1 ? 'Animal' : 'Animais'}
          </Badge>
        </div>
      </div>

      {/* Lista de Animais */}
      <div className="space-y-4">
        {formData.animais.map((animal, index) => (
          <Card key={index} className="border-2 border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center text-lg">
                <Target className="h-5 w-5 mr-2" />
                ALVO #{String(index + 1).padStart(2, '0')}
                <Badge className="ml-auto bg-orange-600">
                  Nome: DEN25XXX-ANIM{String(index + 1).padStart(2, '0')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Espécie */}
                <div>
                  <Label className="font-semibold">Espécie *</Label>
                  <Select 
                    value={animal.especie} 
                    onValueChange={(value) => {
                      const newAnimais = [...formData.animais];
                      newAnimais[index].especie = value;
                      setFormData(prev => ({ ...prev, animais: newAnimais }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      {especies.map(especie => (
                        <SelectItem key={especie} value={especie}>{especie}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sexo */}
                <div>
                  <Label className="font-semibold">Sexo *</Label>
                  <Select 
                    value={animal.sexo} 
                    onValueChange={(value) => {
                      const newAnimais = [...formData.animais];
                      newAnimais[index].sexo = value;
                      setFormData(prev => ({ ...prev, animais: newAnimais }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="femea">Fêmea</SelectItem>
                      <SelectItem value="indeterminado">Indeterminado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Idade Estimada */}
                <div>
                  <Label className="font-semibold">Idade Estimada</Label>
                  <Select 
                    value={animal.idade_estimada} 
                    onValueChange={(value) => {
                      const newAnimais = [...formData.animais];
                      newAnimais[index].idade_estimada = value;
                      setFormData(prev => ({ ...prev, animais: newAnimais }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a idade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filhote">Filhote (0-6 meses)</SelectItem>
                      <SelectItem value="jovem">Jovem (6 meses - 2 anos)</SelectItem>
                      <SelectItem value="adulto">Adulto (2-8 anos)</SelectItem>
                      <SelectItem value="idoso">Idoso (8+ anos)</SelectItem>
                      <SelectItem value="indeterminado">Indeterminado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado Aparente */}
                <div>
                  <Label className="font-semibold">Estado Aparente *</Label>
                  <Select 
                    value={animal.estado_aparente} 
                    onValueChange={(value) => {
                      const newAnimais = [...formData.animais];
                      newAnimais[index].estado_aparente = value;
                      setFormData(prev => ({ ...prev, animais: newAnimais }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saudavel">Aparentemente Saudável</SelectItem>
                      <SelectItem value="ferido">Ferido</SelectItem>
                      <SelectItem value="doente">Doente</SelectItem>
                      <SelectItem value="desnutrido">Desnutrido</SelectItem>
                      <SelectItem value="critico">Estado Crítico</SelectItem>
                      <SelectItem value="morto">Morto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observações */}
              <div className="mt-4">
                <Label className="font-semibold">Intel Específica do Alvo</Label>
                <Textarea
                  value={animal.observacoes}
                  onChange={(e) => {
                    const newAnimais = [...formData.animais];
                    newAnimais[index].observacoes = e.target.value;
                    setFormData(prev => ({ ...prev, animais: newAnimais }));
                  }}
                  placeholder="Características específicas, ferimentos, comportamento, localização exata..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Etapa 3: Intervenção das Autoridades
  const renderEtapa3 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-lg border-l-4 border-blue-500">
        <div className="flex items-center mb-3">
          <Shield className="h-6 w-6 mr-3" />
          <h3 className="text-xl font-bold">INTERVENÇÃO DAS AUTORIDADES</h3>
        </div>
        <p className="text-blue-100">
          Registre qualquer envolvimento de forças policiais ou outras autoridades na operação.
        </p>
      </div>

      {/* Checkbox Intervenção Policial */}
      <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Checkbox
          id="intervencao_policial"
          checked={formData.intervencao_policial}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, intervencao_policial: !!checked }))}
        />
        <Label htmlFor="intervencao_policial" className="text-lg font-medium flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Houve intervenção das autoridades?
        </Label>
      </div>

      {/* Campos condicionais */}
      {formData.intervencao_policial && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              DADOS DA INTERVENÇÃO OFICIAL
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Autoridade */}
                <div>
                  <Label className="font-semibold">Tipo de Autoridade *</Label>
                  <Select 
                    value={formData.dados_intervencao_policial.tipo_autoridade} 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      dados_intervencao_policial: {
                        ...prev.dados_intervencao_policial,
                        tipo_autoridade: value
                      }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psp">PSP - Polícia de Segurança Pública</SelectItem>
                      <SelectItem value="gnr">GNR - Guarda Nacional Republicana</SelectItem>
                      <SelectItem value="bombeiros">Bombeiros</SelectItem>
                      <SelectItem value="sepna">SEPNA - Serviço de Proteção da Natureza</SelectItem>
                      <SelectItem value="municipal">Polícia Municipal</SelectItem>
                      <SelectItem value="veterinaria_municipal">Veterinária Municipal</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de Ocorrência */}
                <div>
                  <Label className="font-semibold">Número de Ocorrência/Processo</Label>
                  <Input
                    value={formData.dados_intervencao_policial.numero_ocorrencia}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dados_intervencao_policial: {
                        ...prev.dados_intervencao_policial,
                        numero_ocorrencia: e.target.value
                      }
                    }))}
                    placeholder="Ex: 2025/12345"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Agentes Responsáveis */}
              <div>
                <Label className="font-semibold">Agentes/Responsáveis</Label>
                <Input
                  value={formData.dados_intervencao_policial.agentes_responsaveis}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_intervencao_policial: {
                      ...prev.dados_intervencao_policial,
                      agentes_responsaveis: e.target.value
                    }
                  }))}
                  placeholder="Nomes dos agentes, números de identificação..."
                  className="mt-1"
                />
              </div>

              {/* Observações */}
              <div>
                <Label className="font-semibold">Relatório da Intervenção</Label>
                <Textarea
                  value={formData.dados_intervencao_policial.observacoes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_intervencao_policial: {
                      ...prev.dados_intervencao_policial,
                      observacoes: e.target.value
                    }
                  }))}
                  placeholder="Detalhes da intervenção, medidas tomadas, apreensões..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!formData.intervencao_policial && (
        <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-400">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
            <p className="text-gray-700 font-medium">
              Nenhuma intervenção oficial registrada para esta operação.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Etapa 4: Intervenção Veterinária
  const renderEtapa4 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white p-6 rounded-lg border-l-4 border-green-500">
        <div className="flex items-center mb-3">
          <Stethoscope className="h-6 w-6 mr-3" />
          <h3 className="text-xl font-bold">SUPORTE MÉDICO VETERINÁRIO</h3>
        </div>
        <p className="text-green-100">
          Documente qualquer intervenção médica veterinária realizada durante a operação.
        </p>
      </div>

      {/* Checkbox Intervenção Veterinária */}
      <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <Checkbox
          id="intervencao_veterinaria"
          checked={formData.intervencao_veterinaria}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, intervencao_veterinaria: !!checked }))}
        />
        <Label htmlFor="intervencao_veterinaria" className="text-lg font-medium flex items-center">
          <Stethoscope className="h-5 w-5 mr-2" />
          Houve encaminhamento para clínica ou intervenção veterinária?
        </Label>
      </div>

      {/* Campos condicionais */}
      {formData.intervencao_veterinaria && (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              RELATÓRIO MÉDICO VETERINÁRIO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Clínica */}
                <div>
                  <Label className="font-semibold">Clínica Veterinária *</Label>
                  <Select 
                    value={formData.dados_intervencao_veterinaria.clinica_id} 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      dados_intervencao_veterinaria: {
                        ...prev.dados_intervencao_veterinaria,
                        clinica_id: value
                      }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
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

                {/* Veterinário */}
                <div>
                  <Label className="font-semibold">Veterinário Responsável</Label>
                  <Input
                    value={formData.dados_intervencao_veterinaria.veterinario_nome}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dados_intervencao_veterinaria: {
                        ...prev.dados_intervencao_veterinaria,
                        veterinario_nome: e.target.value
                      }
                    }))}
                    placeholder="Nome do veterinário"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Diagnóstico */}
              <div>
                <Label className="font-semibold">Diagnóstico Inicial</Label>
                <Textarea
                  value={formData.dados_intervencao_veterinaria.diagnostico_inicial}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_intervencao_veterinaria: {
                      ...prev.dados_intervencao_veterinaria,
                      diagnostico_inicial: e.target.value
                    }
                  }))}
                  placeholder="Diagnóstico médico inicial dos animais..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Tratamentos */}
              <div>
                <Label className="font-semibold">Tratamentos Aplicados</Label>
                <Textarea
                  value={formData.dados_intervencao_veterinaria.tratamentos_aplicados}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dados_intervencao_veterinaria: {
                      ...prev.dados_intervencao_veterinaria,
                      tratamentos_aplicados: e.target.value
                    }
                  }))}
                  placeholder="Medicamentos, procedimentos, cirurgias realizadas..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!formData.intervencao_veterinaria && (
        <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-400">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />
            <p className="text-gray-700 font-medium">
              Nenhuma intervenção veterinária registrada para esta operação.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Etapa 5: Equipe Tática
  const renderEtapa5 = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white p-6 rounded-lg border-l-4 border-purple-500">
        <div className="flex items-center mb-3">
          <Users className="h-6 w-6 mr-3" />
          <h3 className="text-xl font-bold">EQUIPE TÁTICA DESIGNADA</h3>
        </div>
        <p className="text-purple-100">
          Defina a equipe responsável pela operação de resgate e cuidados posteriores.
        </p>
      </div>

      {/* Voluntário Responsável */}
      <div>
        <Label className="flex items-center font-semibold text-lg">
          <Target className="h-5 w-5 mr-2" />
          Comandante da Operação (Responsável) *
        </Label>
        <Select 
          value={formData.voluntario_responsavel_id} 
          onValueChange={(value) => {
            setFormData(prev => ({
              ...prev,
              voluntario_responsavel_id: value,
              voluntarios_participantes: prev.voluntarios_participantes.includes(value) 
                ? prev.voluntarios_participantes 
                : [...prev.voluntarios_participantes, value]
            }));
          }}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Selecione o voluntário responsável" />
          </SelectTrigger>
          <SelectContent>
            {voluntarios.map(voluntario => (
              <SelectItem key={voluntario.id} value={voluntario.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{voluntario.nome}</span>
                  {voluntario.especialidades && voluntario.especialidades.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {voluntario.especialidades.join(', ')}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Voluntários Participantes */}
      <div>
        <Label className="flex items-center font-semibold text-lg">
          <Users className="h-5 w-5 mr-2" />
          Equipe de Apoio (Participantes) *
        </Label>
        <p className="text-sm text-gray-600 mt-1 mb-3">
          Selecione todos os voluntários que participaram na operação (incluindo o responsável)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
          {voluntarios.map(voluntario => (
            <div key={voluntario.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <Checkbox
                id={`voluntario_${voluntario.id}`}
                checked={formData.voluntarios_participantes.includes(voluntario.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData(prev => ({
                      ...prev,
                      voluntarios_participantes: [...prev.voluntarios_participantes, voluntario.id]
                    }));
                  } else {
                    // Não permitir desmarcar o responsável
                    if (voluntario.id === formData.voluntario_responsavel_id) {
                      toast({
                        title: "⚠️ Atenção",
                        description: "O responsável deve estar sempre incluído na equipe.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setFormData(prev => ({
                      ...prev,
                      voluntarios_participantes: prev.voluntarios_participantes.filter(id => id !== voluntario.id)
                    }));
                  }
                }}
              />
              <Label htmlFor={`voluntario_${voluntario.id}`} className="flex-1 cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium">{voluntario.nome}</span>
                  {voluntario.id === formData.voluntario_responsavel_id && (
                    <Badge className="w-fit mt-1 bg-purple-600">COMANDANTE</Badge>
                  )}
                  {voluntario.especialidades && voluntario.especialidades.length > 0 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {voluntario.especialidades.join(', ')}
                    </span>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-medium text-purple-800">
            Equipe selecionada: {formData.voluntarios_participantes.length} voluntário(s)
          </p>
        </div>
      </div>

      {/* Observações da Equipe */}
      <div>
        <Label className="font-semibold">Observações da Operação</Label>
        <Textarea
          value={formData.observacoes_equipe}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes_equipe: e.target.value }))}
          placeholder="Observações sobre a equipe, estratégia, recursos necessários..."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* Resumo da Operação */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            RESUMO DA OPERAÇÃO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Data:</strong> {new Date(formData.data_denuncia).toLocaleString('pt-PT')}</p>
              <p><strong>Canal:</strong> {formData.canal_denuncia}</p>
              <p><strong>Local:</strong> {formData.local_completo.substring(0, 50)}...</p>
            </div>
            <div>
              <p><strong>Animais:</strong> {formData.quantidade_animais}</p>
              <p><strong>Equipe:</strong> {formData.voluntarios_participantes.length} voluntários</p>
              <p><strong>Intervenções:</strong> {[
                formData.intervencao_policial && 'Autoridades',
                formData.intervencao_veterinaria && 'Veterinária'
              ].filter(Boolean).join(', ') || 'Nenhuma'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative">
            <Activity className="h-16 w-16 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 h-16 w-16 animate-ping mx-auto rounded-full bg-red-400 opacity-20"></div>
          </div>
          <p className="text-xl font-bold">OPERAÇÃO EM ANDAMENTO...</p>
          <p className="text-red-200 mt-2">Preparando sistema de resgate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900">
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Operação Resgate', icon: <AlertTriangle className="h-4 w-4" /> }
        ]}
        primaryActions={
          <Badge className="bg-red-600 text-white px-3 py-1 text-lg">
            <AlertTriangle className="h-4 w-4 mr-1" />
            OPERAÇÃO ATIVA
          </Badge>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Tático */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-red-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🚨 WIZARD DE DENÚNCIAS
          </h1>
          <p className="text-xl text-red-100 mb-4">
            Sistema Tático de Resgate Animal
          </p>
          <p className="text-red-200 font-medium">
            "Somos a voz dos que não podem falar por si"
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-bold">PROGRESSO DA OPERAÇÃO</span>
            <span className="text-white font-bold">{currentStep}/5</span>
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-3 bg-red-800" />
          <div className="flex justify-between mt-2 text-sm text-red-200">
            <span className={currentStep >= 1 ? 'text-white font-bold' : ''}>Identificação</span>
            <span className={currentStep >= 2 ? 'text-white font-bold' : ''}>Alvos</span>
            <span className={currentStep >= 3 ? 'text-white font-bold' : ''}>Autoridades</span>
            <span className={currentStep >= 4 ? 'text-white font-bold' : ''}>Veterinário</span>
            <span className={currentStep >= 5 ? 'text-white font-bold' : ''}>Equipe</span>
          </div>
        </div>

        {/* Conteúdo da Etapa */}
        <Card className="border-2 border-red-300 shadow-2xl">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Botões de Navegação */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            size="lg"
            className="bg-white text-red-800 border-red-300 hover:bg-red-50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Anterior
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Próximo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submitDenuncia}
              disabled={loading}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Activity className="h-5 w-5 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  EXECUTAR OPERAÇÃO
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardDenuncia;