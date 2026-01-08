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
  Clock
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
        
        // Converter JSONB para arrays
        assessmentData.symptoms = assessmentData.symptoms || [];
        assessmentData.immediate_actions = assessmentData.immediate_actions || [];
        
        setAssessment(assessmentData);
        console.log('✅ [INTAKE_DISPLAY] Assessment definido no estado');
      } else {
        console.log('ℹ️ [INTAKE_DISPLAY] Nenhuma ficha encontrada para este animal');
        setAssessment(null);
      }
    } catch (error: any) {
      console.error('Erro ao buscar ficha de admissão:', error);
      setError('Erro ao carregar ficha de admissão');
    } finally {
      setLoading(false);
    }
  };

  // Carregar opções de configuração
  const fetchIntakeOptions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_intake_config_options');

      if (error) throw error;
      
      // Organizar por domínio
      const optionsByDomain: Record<string, IntakeConfigOption[]> = {};
      (data || []).forEach((option: IntakeConfigOption) => {
        if (!optionsByDomain[option.domain]) {
          optionsByDomain[option.domain] = [];
        }
        optionsByDomain[option.domain].push(option);
      });
      
      setIntakeOptions(optionsByDomain);
    } catch (error: any) {
      console.error('Erro ao carregar opções de admissão:', error);
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
    return option?.name || code;
  };

  // Função para obter badge de prognóstico
  const getPrognosisBadge = (prognosis?: string) => {
    const variants: Record<string, string> = {
      excellent: 'bg-green-600',
      good: 'bg-blue-600', 
      fair: 'bg-yellow-600',
      guarded: 'bg-orange-600',
      poor: 'bg-red-600'
    };
    
    const labels: Record<string, string> = {
      excellent: 'Excelente',
      good: 'Bom',
      fair: 'Razoável', 
      guarded: 'Reservado',
      poor: 'Mau'
    };

    if (!prognosis) return null;

    return (
      <Badge className={`${variants[prognosis] || 'bg-gray-600'} text-white`}>
        {labels[prognosis] || prognosis}
      </Badge>
    );
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
          <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/20">
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
          <div className={`bg-gradient-to-br ${getConditionColor(assessment.general_condition)} backdrop-blur-lg rounded-2xl border p-6 shadow-2xl relative overflow-hidden`}>
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
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20">
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

      {/* Resumo da Avaliação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clipboard className="h-5 w-5 text-blue-600" />
            Resumo da Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Data da Avaliação:</span>
              <div className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(assessment.assessment_date).toLocaleDateString('pt-PT')}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Avaliado por:</span>
              <div className="font-medium flex items-center">
                <User className="h-4 w-4 mr-1" />
                {assessment.assessor_name || 'Não especificado'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Prognóstico:</span>
              <div className="mt-1">
                {getPrognosisBadge(assessment.prognosis)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circunstâncias da Admissão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-blue-600" />
            Circunstâncias da Admissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Origem:</span>
              <div className="font-medium">
                {assessment.intake_origin ? getOptionName('intake_origin', assessment.intake_origin) : 'Não especificada'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Razão:</span>
              <div className="font-medium">
                {assessment.intake_reason ? getOptionName('intake_reason', assessment.intake_reason) : 'Não especificada'}
              </div>
            </div>
          </div>
          {assessment.circumstances_details && (
            <div>
              <span className="text-sm text-gray-600">Detalhes:</span>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                {assessment.circumstances_details}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Triagem Imediata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-5 w-5 text-green-600" />
            Triagem Imediata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-600">Estado Geral:</span>
              <div className="font-medium">
                {assessment.general_condition ? getOptionName('general_condition', assessment.general_condition) : 'Não avaliado'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Comportamento:</span>
              <div className="font-medium">
                {assessment.behavior_entry ? getOptionName('behavior_entry', assessment.behavior_entry) : 'Não observado'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Condição Corporal:</span>
              <div className="font-medium">
                {assessment.body_condition ? getOptionName('body_condition', assessment.body_condition) : 'Não avaliada'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600 flex items-center">
                <Weight className="h-4 w-4 mr-1" />
                Peso na Admissão:
              </span>
              <div className="font-medium">
                {assessment.weight_kg ? `${assessment.weight_kg} kg` : 'Não medido'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 flex items-center">
                <Thermometer className="h-4 w-4 mr-1" />
                Temperatura:
              </span>
              <div className="font-medium">
                {assessment.temperature_celsius ? `${assessment.temperature_celsius}°C` : 'Não medida'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sinais e Sintomas */}
      {assessment.symptoms && assessment.symptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-orange-600" />
              Sinais e Sintomas Observados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {assessment.symptoms.map((symptomCode, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {getOptionName('symptoms', symptomCode)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Imediatas */}
      {assessment.immediate_actions && assessment.immediate_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-red-600" />
              Ações Imediatas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {assessment.immediate_actions.map((actionCode, index) => (
                <Badge key={index} variant="outline" className="text-sm bg-red-50">
                  {getOptionName('immediate_actions', actionCode)}
                </Badge>
              ))}
            </div>
            {assessment.immediate_actions_notes && (
              <div>
                <span className="text-sm text-gray-600">Detalhes das Ações:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {assessment.immediate_actions_notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observações Clínicas */}
      {(assessment.physical_exam_notes || assessment.behavioral_notes || assessment.treatment_plan || assessment.special_needs) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-purple-600" />
              Observações Clínicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment.physical_exam_notes && (
              <div>
                <span className="text-sm text-gray-600 font-medium">Exame Físico:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {assessment.physical_exam_notes}
                </div>
              </div>
            )}
            
            {assessment.behavioral_notes && (
              <div>
                <span className="text-sm text-gray-600 font-medium">Observações Comportamentais:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {assessment.behavioral_notes}
                </div>
              </div>
            )}
            
            {assessment.treatment_plan && (
              <div>
                <span className="text-sm text-gray-600 font-medium">Plano de Tratamento:</span>
                <div className="mt-1 p-3 bg-blue-50 rounded-lg text-sm">
                  {assessment.treatment_plan}
                </div>
              </div>
            )}
            
            {assessment.special_needs && (
              <div>
                <span className="text-sm text-gray-600 font-medium">Necessidades Especiais:</span>
                <div className="mt-1 p-3 bg-yellow-50 rounded-lg text-sm">
                  {assessment.special_needs}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
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