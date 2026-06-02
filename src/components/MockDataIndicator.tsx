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
  AlertTriangle,
  TestTube
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

      const { data, error } = await supabase
        .rpc('get_animal_intake_assessment', { animal_uuid: animalId });

      if (error) {
        console.error('Erro ao carregar ficha de admissão:', error);
        if (error.code === 'PGRST116') {
          // Função não encontrada - sem ficha de admissão
          setAssessment(null);
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        const assessmentData = data[0];
        // Converter JSONB para arrays
        assessmentData.symptoms = assessmentData.symptoms || [];
        assessmentData.immediate_actions = assessmentData.immediate_actions || [];
        setAssessment(assessmentData);
      } else {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-blue-600" />
            Ficha de Admissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">A carregar ficha de admissão...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-red-600" />
            Ficha de Admissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-8 w-8 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-gray-400" />
            Ficha de Admissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clipboard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Nenhuma ficha de admissão registada para este animal.
            </p>
            <p className="text-sm text-gray-500">
              A ficha de admissão é criada durante o registo do animal e contém informações sobre as condições de entrada.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Ficha */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-blue-600" />
              Ficha de Admissão
            </CardTitle>
            <div className="flex items-center gap-2">
              {assessment.is_complete ? (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completa
                </Badge>
              ) : (
                <Badge className="bg-yellow-600 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  Incompleta
                </Badge>
              )}
              {showEditButton && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(assessment)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>
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

// IntakeAssessmentDisplay component - exported as named export
export { IntakeAssessmentDisplay };

// ===== COMPONENTE ORIGINAL MOCK DATA INDICATOR =====

import { isMockData, getMockDataClassName } from '@/lib/mockUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MockDataIndicatorProps {
  data: any;
  children: React.ReactNode;
  variant?: 'subtle' | 'normal' | 'strong' | 'warning';
  showBadge?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * Componente que automaticamente detecta e marca dados mock em vermelho
 */
export const MockDataIndicator: React.FC<MockDataIndicatorProps> = ({
  data,
  children,
  variant = 'normal',
  showBadge = false,
  showTooltip = true,
  className = ''
}) => {
  const isDataMock = isMockData(data);

  if (!isDataMock) {
    return <>{children}</>;
  }

  const getVariantClass = () => {
    switch (variant) {
      case 'subtle':
        return 'mock-data-subtle';
      case 'strong':
        return 'mock-data-strong';
      case 'warning':
        return 'mock-data-warning';
      default:
        return 'mock-data';
    }
  };

  const mockClassName = getMockDataClassName(data, `${getVariantClass()} ${className}`);

  const content = (
    <div className={mockClassName}>
      {children}
      {showBadge && (
        <Badge variant="destructive" className="mock-data-badge ml-2">
          <TestTube className="w-3 h-3 mr-1" />
          TESTE
        </Badge>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Dados de exemplo/teste</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

/**
 * Componente para marcar cards inteiros como mock
 */
export const MockDataCard: React.FC<{
  data: any;
  children: React.ReactNode;
  className?: string;
}> = ({ data, children, className = '' }) => {
  const isDataMock = isMockData(data);
  
  if (!isDataMock) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`mock-data-card ${className}`}>
      {children}
    </div>
  );
};

/**
 * Componente para texto simples mock
 */
export const MockDataText: React.FC<{
  data: any;
  children: React.ReactNode;
  className?: string;
}> = ({ data, children, className = '' }) => {
  const isDataMock = isMockData(data);
  
  if (!isDataMock) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={`mock-data-text ${className}`}>
      {children}
    </span>
  );
};

/**
 * Hook para usar classes mock condicionalmente
 */
export const useMockDataClass = (data: any, baseClass: string = '') => {
  return getMockDataClassName(data, baseClass);
};

export default MockDataIndicator;
