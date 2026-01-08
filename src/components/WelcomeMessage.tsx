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

// ===== COMPONENTE ORIGINAL WELCOME MESSAGE =====

import { useState } from "react";
import { CheckCircle, Shield } from "lucide-react";

interface WelcomeMessageProps {
  type: 'welcome' | 'goodbye';
  userName: string;
  onComplete?: () => void;
}

const WelcomeMessage = ({ type, userName, onComplete }: WelcomeMessageProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNextMessage = () => {
    if (type === 'welcome' && currentMessage === 0) {
      // Passar para a segunda mensagem
      setCurrentMessage(1);
    } else {
      // Finalizar e fechar
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Aguarda a animação de saída
      }
    }
  };

  if (!isVisible) return null;

  const welcomeMessages = [
    {
      icon: <Shield className="h-16 w-16 text-emerald-600 mx-auto mb-4" />,
      title: "Não Morremos nem que nos Matem!",
      message: "O nosso lema de resistência e dedicação",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-800",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      buttonText: "Continuar"
    },
    {
      icon: <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />,
      title: `Bem-vindo, ${userName}!`,
      message: "Acesso autorizado com sucesso",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      buttonColor: "bg-green-600 hover:bg-green-700",
      buttonText: "Entrar no Sistema"
    }
  ];

  const goodbyeContent = {
    icon: <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />,
    title: `Obrigado, ${userName}!`,
    message: "Por lutar pelos animais",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    buttonColor: "bg-red-600 hover:bg-red-700",
    buttonText: "OK"
  };

  const content = type === 'welcome' ? welcomeMessages[currentMessage] : goodbyeContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${content.bgColor} ${content.borderColor} border-2 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {content.icon}
        <h2 className={`text-2xl font-bold ${content.textColor} mb-2`}>
          {content.title}
        </h2>
        <p className={`${content.textColor} opacity-80 mb-6`}>
          {content.message}
        </p>
        
        {/* Botão OK/Continuar */}
        <Button
          onClick={handleNextMessage}
          className={`${content.buttonColor} text-white px-8 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
        >
          {content.buttonText}
        </Button>
        
        {/* Indicador de progresso para as duas mensagens de boas-vindas */}
        {type === 'welcome' && (
          <div className="mt-4 flex justify-center space-x-2">
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentMessage === 0 ? 'bg-emerald-600' : 'bg-emerald-300'}`}></div>
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentMessage === 1 ? 'bg-green-600' : 'bg-green-300'}`}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeMessage;