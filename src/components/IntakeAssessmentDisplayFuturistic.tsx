import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Clipboard,
  Stethoscope,
  Activity,
  Heart,
  FileText,
  Thermometer,
  Weight,
  Calendar,
  User,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import { AnimalIntakeAssessment, IntakeConfigOption } from '@/types/animal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IntakeAssessmentDisplayProps {
  animalId: string;
  onEdit?: (assessment: AnimalIntakeAssessment) => void;
  showEditButton?: boolean;
}

const IntakeAssessmentDisplay: React.FC<IntakeAssessmentDisplayProps> = ({
  animalId,
  onEdit,
  showEditButton = true
}) => {
  const [assessment, setAssessment] = useState<AnimalIntakeAssessment | null>(null);
  const [intakeOptions, setIntakeOptions] = useState<Record<string, IntakeConfigOption[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar ficha de admissão
  const fetchIntakeAssessment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [INTAKE_DISPLAY] Carregando ficha de admissão para animal:', animalId);
      const timestamp = new Date().getTime();
      console.log('🕐 [INTAKE_DISPLAY] Timestamp para cache busting:', timestamp);

      const { data, error } = await supabase
        .rpc('get_animal_intake_assessment', { animal_uuid: animalId });

      if (error) {
        console.error('❌ [INTAKE_DISPLAY] Erro ao carregar ficha:', error);
        console.error('❌ [INTAKE_DISPLAY] Código do erro:', error.code);
        console.error('❌ [INTAKE_DISPLAY] Mensagem:', error.message);
        
        if (error.code === 'PGRST116') {
          // Função não encontrada - sem ficha de admissão
          console.log('ℹ️ [INTAKE_DISPLAY] Função RPC não encontrada - sem ficha');
          setAssessment(null);
          return;
        }
        
        setError(`Erro ao carregar ficha: ${error.message}`);
        return;
      }

      console.log('📊 [INTAKE_DISPLAY] Dados recebidos da RPC:', data);

      if (data && data.length > 0) {
        const assessmentData = data[0];
        console.log('✅ [INTAKE_DISPLAY] Primeira ficha encontrada:', assessmentData);
        
        // Converter JSONB para arrays com parse correto
        const parseJsonField = (field: any) => {
          if (Array.isArray(field)) {
            return field;
          }
          if (typeof field === 'string') {
            try {
              const parsed = JSON.parse(field);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              return [field];
            }
          }
          return field ? [field] : [];
        };
        
        assessmentData.symptoms = parseJsonField(assessmentData.symptoms);
        assessmentData.immediate_actions = parseJsonField(assessmentData.immediate_actions);
        
        console.log('🔍 [INTAKE_DISPLAY] Symptoms processados:', assessmentData.symptoms);
        console.log('🔍 [INTAKE_DISPLAY] Immediate actions processadas:', assessmentData.immediate_actions);
        
        setAssessment(assessmentData);
        console.log('✅ [INTAKE_DISPLAY] Assessment definido no estado');
      } else {
        console.log('ℹ️ [INTAKE_DISPLAY] Nenhuma ficha encontrada para este animal');
        setAssessment(null);
      }
    } catch (error: any) {
      console.error('❌ [INTAKE_DISPLAY] Erro ao buscar ficha:', error);
      setError('Erro ao carregar ficha de admissão');
    } finally {
      setLoading(false);
    }
  };

  // Carregar opções de configuração
  const fetchIntakeOptions = async () => {
    try {
      const { data, error } = await supabase.rpc('get_intake_config_options');
      if (error) throw error;
      
      const optionsMap: Record<string, IntakeConfigOption[]> = {};
      data.forEach((option: IntakeConfigOption) => {
        if (!optionsMap[option.domain]) {
          optionsMap[option.domain] = [];
        }
        optionsMap[option.domain].push(option);
      });
      
      setIntakeOptions(optionsMap);
    } catch (error: any) {
      console.error('Erro ao carregar opções de configuração:', error);
    }
  };

  useEffect(() => {
    fetchIntakeAssessment();
    fetchIntakeOptions();
  }, [animalId]);

  // Função para obter nome da opção
  const getOptionName = (domain: string, code: string): string => {
    const options = intakeOptions[domain] || [];
    const option = options.find(opt => opt.code === code);
    
    if (option?.name) {
      return option.name;
    }
    
    // Fallback local para opções básicas
    const fallbackOptions: Record<string, Record<string, string>> = {
      intake_origin: {
        'owner_surrender': 'Entrega pelo proprietário',
        'stray_found': 'Encontrado na rua',
        'rescue_operation': 'Operação de resgate',
        'transfer': 'Transferência',
        'birth': 'Nascimento'
      },
      general_condition: {
        'excellent': 'Excelente',
        'good': 'Bom',
        'fair': 'Razoável',
        'poor': 'Mau',
        'critical': 'Crítico'
      },
      behavior: {
        'friendly': 'Amigável',
        'shy': 'Tímido',
        'fearful': 'Medroso',
        'aggressive': 'Agressivo',
        'lethargic': 'Letárgico'
      },
      symptoms: {
        'lethargy': 'Letargia',
        'weakness': 'Fraqueza',
        'dehydration': 'Desidratação',
        'fever': 'Febre',
        'hypothermia': 'Hipotermia',
        'pale_mucous': 'Mucosas pálidas',
        'jaundice': 'Icterícia',
        'shock': 'Estado de choque',
        'coughing': 'Tosse',
        'dyspnea': 'Dispneia',
        'nasal_discharge': 'Corrimento nasal',
        'sneezing': 'Espirros',
        'open_mouth_breathing': 'Respiração ofegante',
        'wheezing': 'Sibilos',
        'cyanosis': 'Cianose',
        'vomiting': 'Vómito',
        'diarrhea': 'Diarreia',
        'constipation': 'Obstipação',
        'blood_stool': 'Sangue nas fezes',
        'blood_vomit': 'Vómito com sangue',
        'loss_appetite': 'Perda de apetite',
        'excessive_salivation': 'Salivação excessiva',
        'abdominal_distension': 'Distensão abdominal',
        'seizures': 'Convulsões',
        'ataxia': 'Ataxia',
        'head_tilt': 'Inclinação da cabeça',
        'blindness': 'Cegueira',
        'altered_consciousness': 'Alteração da consciência',
        'tremors': 'Tremores',
        'circling': 'Movimento circular',
        'limping': 'Coxear',
        'paralysis': 'Paralisia',
        'joint_swelling': 'Inchaço articular',
        'muscle_atrophy': 'Atrofia muscular',
        'fractures': 'Fraturas',
        'luxations': 'Luxações',
        'wounds': 'Feridas',
        'skin_lesions': 'Lesões cutâneas',
        'hair_loss': 'Perda de pelo',
        'itching': 'Prurido',
        'skin_infections': 'Infecções cutâneas',
        'burns': 'Queimaduras',
        'abscesses': 'Abcessos',
        'parasites': 'Parasitas externos',
        'internal_parasites': 'Parasitas internos',
        'mange': 'Sarna',
        'aggression': 'Agressividade',
        'excessive_fear': 'Medo excessivo',
        'disorientation': 'Desorientação',
        'excessive_vocalization': 'Vocalização excessiva',
        'depression': 'Depressão',
        'hyperactivity': 'Hiperatividade',
        'eye_discharge': 'Corrimento ocular',
        'eye_redness': 'Vermelhidão ocular',
        'eye_swelling': 'Inchaço ocular',
        'corneal_opacity': 'Opacidade corneal',
        'ear_discharge': 'Corrimento auricular',
        'ear_odor': 'Odor auricular',
        'head_shaking': 'Balançar a cabeça',
        'urinary_retention': 'Retenção urinária',
        'blood_urine': 'Sangue na urina',
        'frequent_urination': 'Micção frequente'
      },
      immediate_actions: {
        'first_aid': 'Primeiros socorros',
        'veterinary_exam': 'Exame veterinário',
        'vital_signs': 'Avaliação de sinais vitais',
        'physical_restraint': 'Contenção física',
        'sedation': 'Sedação',
        'muzzle_application': 'Aplicação de açaime',
        'isolation': 'Isolamento',
        'oxygen_therapy': 'Oxigenoterapia',
        'airway_clearance': 'Desobstrução das vias aéreas',
        'intubation': 'Entubação',
        'hemorrhage_control': 'Controlo de hemorragias',
        'pressure_bandage': 'Penso compressivo',
        'tourniquet': 'Garrote',
        'fracture_stabilization': 'Estabilização de fraturas',
        'splinting': 'Aplicação de tala',
        'bandaging': 'Enfaixamento',
        'wound_cleaning': 'Limpeza de feridas',
        'wound_suturing': 'Sutura de feridas',
        'burn_treatment': 'Tratamento de queimaduras',
        'antiseptic_application': 'Aplicação de antisséptico',
        'pain_relief': 'Alívio da dor',
        'antibiotic_administration': 'Administração de antibióticos',
        'anti_inflammatory': 'Anti-inflamatórios',
        'emergency_drugs': 'Fármacos de emergência',
        'fluid_therapy': 'Fluidoterapia',
        'cardiac_massage': 'Massagem cardíaca',
        'shock_treatment': 'Tratamento de choque',
        'seizure_control': 'Controlo de convulsões',
        'head_trauma_care': 'Cuidados de trauma craniano',
        'decontamination': 'Descontaminação',
        'eye_irrigation': 'Irrigação ocular',
        'gastric_lavage': 'Lavagem gástrica',
        'parasite_treatment': 'Tratamento de parasitas',
        'flea_treatment': 'Tratamento de pulgas',
        'tick_removal': 'Remoção de carrapatos',
        'temperature_regulation': 'Regulação da temperatura',
        'nutritional_support': 'Suporte nutricional',
        'hydration': 'Hidratação',
        'photo_documentation': 'Documentação fotográfica',
        'emergency_contact': 'Contacto de emergência',
        'owner_notification': 'Notificação do proprietário'
      }
    };
    
    return fallbackOptions[domain]?.[code] || code;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
      case 'excelente':
      case 'good':
      case 'bom':
        return 'from-green-600/30 to-emerald-600/30 border-green-500/30 text-green-300';
      case 'fair':
      case 'razoável':
      case 'stable':
      case 'estável':
        return 'from-yellow-600/30 to-orange-600/30 border-yellow-500/30 text-yellow-300';
      case 'poor':
      case 'mau':
      case 'critical':
      case 'crítico':
        return 'from-red-600/30 to-pink-600/30 border-red-500/30 text-red-300';
      default:
        return 'from-blue-600/30 to-cyan-600/30 border-blue-500/30 text-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          <span className="text-cyan-300 font-medium">Carregando ficha de admissão...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-300">Erro ao carregar ficha</h3>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-gradient-to-br from-slate-600/20 to-gray-600/20 backdrop-blur-lg rounded-2xl border border-gray-500/30 p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gray-500/20 p-4 rounded-xl border border-gray-400/30">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Ficha de Admissão não encontrada</h3>
            <p className="text-gray-400/70 text-sm mb-2">Nenhuma ficha de admissão foi registrada para este animal.</p>
            <p className="text-gray-500/60 text-xs">A ficha é criada durante o registo e contém informações sobre as condições de entrada.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Ficha */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-400/30">
            <Clipboard className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-300">Avaliação de Admissão</h3>
            <p className="text-blue-400/70 text-sm">
              Registrada em {formatDate(assessment.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {assessment.is_complete ? (
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completa
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Incompleta
            </Badge>
          )}
          
          {showEditButton && onEdit && (
            <Button
              onClick={() => onEdit(assessment)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Ficha
            </Button>
          )}
        </div>
      </div>

      {/* Grid de Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Origem da Admissão */}
        {assessment.intake_origin && (
          <div className="relative bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/20 overflow-hidden">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-400/30">
                <MapPin className="h-5 w-5 text-cyan-400" />
              </div>
              <h4 className="text-lg font-semibold text-cyan-300">Origem</h4>
            </div>
            <p className="text-cyan-200 font-medium">
              {getOptionName('intake_origin', assessment.intake_origin)}
            </p>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-cyan-400/10 rounded-full blur-lg"></div>
          </div>
        )}

        {/* Condição Geral */}
        {assessment.general_condition && (
          <div className={`relative bg-gradient-to-br ${getConditionColor(assessment.general_condition)} backdrop-blur-lg rounded-2xl border p-6 shadow-2xl overflow-hidden`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white/10 p-2 rounded-lg border border-white/20">
                <Heart className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-semibold">Condição Geral</h4>
            </div>
            <p className="font-medium text-lg">
              {getOptionName('general_condition', assessment.general_condition)}
            </p>
            <div className="absolute bottom-0 right-0 -mb-4 -mr-4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          </div>
        )}

        {/* Comportamento */}
        {assessment.behavior_entry && (
          <div className="relative bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20 overflow-hidden">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-400/30">
                <User className="h-5 w-5 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-purple-300">Comportamento</h4>
            </div>
            <p className="text-purple-200 font-medium">
              {getOptionName('behavior_entry', assessment.behavior_entry)}
            </p>
            <div className="absolute top-0 left-0 -mt-4 -ml-4 w-16 h-16 bg-purple-400/10 rounded-full blur-lg"></div>
          </div>
        )}
      </div>

      {/* Informações Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dados Médicos */}
        <div className="relative bg-gradient-to-br from-emerald-600/20 to-green-600/20 backdrop-blur-lg rounded-2xl border border-emerald-500/30 p-6 shadow-2xl shadow-emerald-500/20 overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-400/30">
              <Stethoscope className="h-6 w-6 text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-emerald-300">Dados Médicos</h4>
          </div>
          
          <div className="space-y-4">
            {/* Peso e Temperatura */}
            <div className="grid grid-cols-2 gap-4">
              {assessment.weight_kg && (
                <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-400/20">
                  <div className="flex items-center space-x-2 mb-1">
                    <Weight className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Peso</span>
                  </div>
                  <p className="text-emerald-200 font-bold text-lg">{assessment.weight_kg} kg</p>
                </div>
              )}
              
              {assessment.temperature_celsius && (
                <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-400/20">
                  <div className="flex items-center space-x-2 mb-1">
                    <Thermometer className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Temperatura</span>
                  </div>
                  <p className="text-emerald-200 font-bold text-lg">{assessment.temperature_celsius}°C</p>
                </div>
              )}
            </div>

            {/* Condição Corporal */}
            {assessment.body_condition && (
              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-400/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-medium">Condição Corporal</span>
                </div>
                <p className="text-emerald-200">
                  {getOptionName('body_condition', assessment.body_condition)}
                </p>
              </div>
            )}

            {/* Avaliador */}
            {assessment.assessor_name && (
              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-400/20">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-medium">Avaliado por</span>
                </div>
                <p className="text-emerald-200">{assessment.assessor_name}</p>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 right-0 -mb-6 -mr-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl"></div>
        </div>

        {/* Observações Clínicas */}
        <div className="relative bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6 shadow-2xl shadow-orange-500/20 overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-500/20 p-3 rounded-xl border border-orange-400/30">
              <FileText className="h-6 w-6 text-orange-400" />
            </div>
            <h4 className="text-xl font-bold text-orange-300">Observações Clínicas</h4>
          </div>
          
          <div className="space-y-4">
            {/* Exame Físico */}
            {assessment.physical_exam_notes && (
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-400/20">
                <h5 className="text-orange-300 font-semibold mb-2 flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Exame Físico
                </h5>
                <p className="text-orange-200 text-sm leading-relaxed">
                  {assessment.physical_exam_notes}
                </p>
              </div>
            )}

            {/* Observações Comportamentais */}
            {assessment.behavioral_notes && (
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-400/20">
                <h5 className="text-orange-300 font-semibold mb-2 flex items-center">
                  <Heart className="h-4 w-4 mr-2" />
                  Comportamento
                </h5>
                <p className="text-orange-200 text-sm leading-relaxed">
                  {assessment.behavioral_notes}
                </p>
              </div>
            )}

            {/* Ações Imediatas */}
            {assessment.immediate_actions_notes && (
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-400/20">
                <h5 className="text-orange-300 font-semibold mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Ações Imediatas
                </h5>
                <p className="text-orange-200 text-sm leading-relaxed">
                  {assessment.immediate_actions_notes}
                </p>
              </div>
            )}
          </div>
          
          <div className="absolute top-0 left-0 -mt-6 -ml-6 w-20 h-20 bg-orange-400/10 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Sintomas e Ações Imediatas */}
      {(assessment.symptoms?.length > 0 || assessment.immediate_actions?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sintomas */}
          {assessment.symptoms?.length > 0 && (
            <div className="relative bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6 shadow-2xl shadow-red-500/20 overflow-hidden">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-500/20 p-3 rounded-xl border border-red-400/30">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h4 className="text-xl font-bold text-red-300">Sintomas Observados</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(assessment.symptoms) ? assessment.symptoms : []).map((symptom: string, index: number) => (
                  <Badge 
                    key={index}
                    className="bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1"
                  >
                    {getOptionName('symptoms', symptom)}
                  </Badge>
                ))}
              </div>
              
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-red-400/10 rounded-full blur-lg"></div>
            </div>
          )}

          {/* Ações Imediatas */}
          {assessment.immediate_actions?.length > 0 && (
            <div className="relative bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl border border-indigo-500/30 p-6 shadow-2xl shadow-indigo-500/20 overflow-hidden">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-400/30">
                  <Activity className="h-6 w-6 text-indigo-400" />
                </div>
                <h4 className="text-xl font-bold text-indigo-300">Ações Imediatas</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(assessment.immediate_actions) ? assessment.immediate_actions : []).map((action: string, index: number) => (
                  <Badge 
                    key={index}
                    className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1"
                  >
                    {getOptionName('immediate_actions', action)}
                  </Badge>
                ))}
              </div>
              
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-indigo-400/10 rounded-full blur-xl"></div>
            </div>
          )}
        </div>
      )}

      {/* Plano de Tratamento e Prognóstico */}
      {(assessment.treatment_plan || assessment.prognosis || assessment.special_needs) && (
        <div className="relative bg-gradient-to-br from-violet-600/20 to-purple-600/20 backdrop-blur-lg rounded-2xl border border-violet-500/30 p-6 shadow-2xl shadow-violet-500/20 overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-violet-500/20 p-3 rounded-xl border border-violet-400/30">
              <Heart className="h-6 w-6 text-violet-400" />
            </div>
            <h4 className="text-xl font-bold text-violet-300">Plano de Cuidados</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Prognóstico */}
            {assessment.prognosis && (
              <div className="bg-violet-500/10 rounded-lg p-4 border border-violet-400/20">
                <h5 className="text-violet-300 font-semibold mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Prognóstico
                </h5>
                <Badge className={`${getConditionColor(assessment.prognosis)} px-3 py-1 text-sm font-medium`}>
                  {getOptionName('prognosis', assessment.prognosis)}
                </Badge>
              </div>
            )}

            {/* Plano de Tratamento */}
            {assessment.treatment_plan && (
              <div className="bg-violet-500/10 rounded-lg p-4 border border-violet-400/20">
                <h5 className="text-violet-300 font-semibold mb-3 flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Tratamento
                </h5>
                <p className="text-violet-200 text-sm leading-relaxed">
                  {assessment.treatment_plan}
                </p>
              </div>
            )}

            {/* Necessidades Especiais */}
            {assessment.special_needs && (
              <div className="bg-violet-500/10 rounded-lg p-4 border border-violet-400/20">
                <h5 className="text-violet-300 font-semibold mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Cuidados Especiais
                </h5>
                <p className="text-violet-200 text-sm leading-relaxed">
                  {assessment.special_needs}
                </p>
              </div>
            )}
          </div>
          
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-violet-400/10 rounded-full blur-2xl"></div>
        </div>
      )}

      {/* Footer com informações de atualização */}
      <div className="bg-gradient-to-r from-slate-700/30 to-gray-700/30 backdrop-blur-lg rounded-xl border border-gray-600/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Última atualização: {formatDate(assessment.updated_at)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">Sistema Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { IntakeAssessmentDisplay };

// ===== DEBUG LOGGER ORIGINAL =====

// Debug logger simples para desenvolvimento
export const debugLogger = {
  log: (level: 'info' | 'error' | 'success' | 'debug', message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const prefix = {
        info: '🔵',
        error: '🔴',
        success: '🟢',
        debug: '🟡'
      }[level];
      
      console.log(`${prefix} [${timestamp}] ${message}`, data || '');
    }
  }
};

interface DebugLoggerComponentProps {
  title?: string;
}

const DebugLoggerComponent: React.FC<DebugLoggerComponentProps> = ({ title = "Debug Logger" }) => {
  // Em produção, não renderiza nada
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs opacity-50 hover:opacity-100 transition-opacity">
      {title}
    </div>
  );
};

export default DebugLoggerComponent;