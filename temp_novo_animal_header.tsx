import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Stethoscope, 
  Heart, 
  Activity, 
  MapPin, 
  Calendar, 
  User, 
  Camera, 
  FileText, 
  Weight, 
  Thermometer 
} from 'lucide-react';

interface FormData {
  nome: string;
  especie: string;
  raca: string;
  sexo: string;
  idade_estimada: string;
  data_nascimento: string;
  peso: string;
  cor: string;
  caracteristicas_fisicas: string;
  transponder: string;
  local_encontrado: string;
  observacoes: string;
  grupo_id: string;
  url_fotografia: string;
  voluntario_responsavel: string;
  data_entrada: string;
}

interface AdmissaoData {
  // Origem e razão da admissão
  intake_origin: string;
  intake_reason: string;
  // Triagem imediata
  general_condition: string;
  behavior: string;
  body_condition: string;
  // Sintomas e sinais observados
  symptoms: string[];
  // Ações imediatas realizadas
  immediate_actions: string[];
  // Observações médicas
  physical_exam_notes: string;
  behavioral_notes: string;
  // Informações adicionais
  special_needs: string;
  // Campos de peso e temperatura
  weight_kg: string;
  temperature_celsius: string;
  // Campos condicionais para entrega pelo proprietário
  owner_name: string;
  owner_contact: string;
  owner_reason: string;
  // Campos condicionais para encontrado na rua
  finder_name: string;
  finder_contact: string;
  location_details: string;
  // Campos condicionais para resgate
  rescue_team: string;
  rescue_circumstances: string;
  emergency_actions: string;
  // Campos condicionais para transferência
  origin_institution: string;
  origin_contact: string;
  transfer_documents: string;
  transfer_reason: string;
  // Campos condicionais para nascimento
  mother_id: string;
  litter_size: string;
  birth_conditions: string;
  // Campos para exame físico detalhado
  physical_exam_cardiovascular: string[];
  physical_exam_respiratory: string[];
  physical_exam_neurological: string[];
  physical_exam_gastrointestinal: string[];
  physical_exam_musculoskeletal: string[];
  physical_exam_integumentary: string[];
  // Campos para avaliação comportamental
  behavioral_assessment_temperament: string[];
  behavioral_assessment_human_social: string[];
  behavioral_assessment_animal_social: string[];
  behavioral_assessment_stimuli: string[];
  // Campos para plano de cuidados
  care_plan_immediate: string[];
  care_plan_medium: string[];
  care_plan_long: string[];
  care_plan_notes: string;
}

// Auto-save draft quando muda de aba
const [draftSaved, setDraftSaved] = useState(false);

// Função para salvar rascunho
const saveDraft = () => {
  try {
    const draftData = {
      formData,
      admissaoData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('novo_animal_draft', JSON.stringify(draftData));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);
  }
};

// Carregar rascunho ao inicializar
useEffect(() => {
  try {
    const savedDraft = localStorage.getItem('novo_animal_draft');
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      if (draftData.formData) {
        setFormData(draftData.formData);
      }
      if (draftData.admissaoData) {
        setAdmissaoData(draftData.admissaoData);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
  }
}, []);

// Auto-save quando formData muda
useEffect(() => {
  const timer = setTimeout(() => {
    if (formData.nome || formData.especie) { // Só salva se tem dados
      saveDraft();
    }
  }, 2000); // 2 segundos após parar de digitar

  return () => clearTimeout(timer);
}, [formData]);

// Função para obter ícone da espécie
const getEspecieIcon = (especie: any) => {
  if (especie.icone) {
    return especie.icone;
  }
  const nome = especie.nome.toLowerCase();
  if (nome.includes('cão') || nome.includes('cao')) return '🐕';
  if (nome.includes('gato')) return '🐱';
  if (nome.includes('coelho')) return '🐰';
  if (nome.includes('hamster')) return '🐹';
  if (nome.includes('pássaro') || nome.includes('passaro') || nome.includes('ave')) return '🐦';
  if (nome.includes('peixe')) return '🐠';
  if (nome.includes('tartaruga')) return '🐢';
  return '🐾';
};

// Função para obter ícone do sexo
const getSexoIcon = (sexo: any) => {
  const nome = sexo.nome.toLowerCase();
  if (nome.includes('macho')) return '♂️';
  if (nome.includes('fêmea') || nome.includes('femea')) return '♀️';
  if (nome.includes('indeterminado')) return '❓';
  return '';
};

// Função para sugerir grupo automaticamente baseado na espécie
const suggestGroupForSpecies = (especie: string) => {
  if (!especie || grupos.length === 0) return;
  
  let suggestedGroup = null;
  
  if (especie === 'Cão') {
    suggestedGroup = grupos.find(grupo => 
      grupo.tipo && grupo.tipo.toLowerCase().includes('matilha') && grupo.ativo
    );
  } else if (especie === 'Gato') {
    suggestedGroup = grupos.find(grupo => 
      grupo.tipo && (grupo.tipo.toLowerCase().includes('colónia') || grupo.tipo.toLowerCase().includes('colonia')) && grupo.ativo
    );
  } else {
    suggestedGroup = grupos.find(grupo => 
      grupo.tipo && 
      !grupo.tipo.toLowerCase().includes('matilha') && 
      !grupo.tipo.toLowerCase().includes('colónia') && 
      !grupo.tipo.toLowerCase().includes('colonia') && 
      grupo.ativo
    );
  }
  
  if (suggestedGroup && !formData.grupo_id) {
    setFormData(prev => ({ ...prev, grupo_id: suggestedGroup.id }));
    toast({
      title: "🏠 Grupo Sugerido",
      description: `${especie === 'Cão' ? '🐕' : especie === 'Gato' ? '🐱' : '🐾'} Sugerimos o grupo "${suggestedGroup.nome}" para esta espécie`,
    });
  }
};

const generateNextProcessNumber = async (): Promise<string> => {
  try {
    console.log('🔢 [NOVO ANIMAL] Gerando número de processo...');
    
    // Usar função robusta da base de dados
    const { data, error } = await supabase
      .rpc('generate_next_animal_process_number');

    if (error) {
      console.error('❌ [NOVO ANIMAL] Erro na função RPC:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Função RPC retornou valor nulo');
    }

    console.log('✅ [NOVO ANIMAL] Número gerado:', data);
    
    // Validar formato do número gerado
    const isValidFormat = /^P\d{2}\d{3}$/.test(data);
    if (!isValidFormat) {
      console.warn('⚠️ [NOVO ANIMAL] Formato inválido:', data);
      throw new Error(`Formato de número inválido: ${data}`);
    }

    return data;

  } catch (error) {
    console.error('❌ [NOVO ANIMAL] Erro ao gerar número de processo:', error);
    
    // Fallback robusto em caso de erro
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    const timestamp = Date.now().toString().slice(-6, -3); // Usar 3 dígitos do timestamp
    const fallbackNumber = `P${yearSuffix}${timestamp}`;
    
    console.log('🔄 [NOVO ANIMAL] Usando fallback:', fallbackNumber);
    
    // Verificar se o fallback já existe
    try {
      const { data: existingAnimal } = await supabase
        .from('animais')
        .select('id')
        .eq('numero_processo', fallbackNumber)
        .single();
        
      if (existingAnimal) {
        // Se existe, adicionar sufixo aleatório
        const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `P${yearSuffix}${randomSuffix}${Math.floor(Math.random() * 10)}`;
      }
    } catch {
      // Se não existe, usar o fallback
    }
    
    return fallbackNumber;
  }
};

const fetchGrupos = async () => {
  try {
    const { data, error } = await supabase
      .from('grupos')
      .select('*')
      .eq('ativo', true)
      .order('tipo')
      .order('nome');

    if (error) throw error;
    setGrupos(data || []);
  } catch (error: any) {
    console.error('Erro ao carregar grupos:', error);
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

const fetchVoluntarios = async () => {
  try {
    const { data, error } = await supabase
      .from('voluntarios')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    setVoluntarios(data || []);
  } catch (error: any) {
    console.error('Erro ao carregar voluntários:', error);
  }
};

const fetchIntakeOptions = async () => {
  console.log('🔍 [INTAKE] Carregando opções de admissão...');
  
  // Definir opções básicas como fallback local (que sempre funcionam)
  const basicOptions = {
    general_condition: [
      { code: 'excellent', name: 'Excelente', description: 'Animal em excelente estado geral' },
      { code: 'good', name: 'Bom', description: 'Animal em bom estado geral' },
      { code: 'fair', name: 'Razoável', description: 'Animal em estado razoável' },
      { code: 'poor', name: 'Mau', description: 'Animal em mau estado' },
      { code: 'critical', name: 'Crítico', description: 'Animal em estado crítico' }
    ],
    behavior: [
      { code: 'friendly', name: 'Amigável', description: 'Animal amigável e sociável' },
      { code: 'shy', name: 'Tímido', description: 'Animal tímido mas não agressivo' },
      { code: 'fearful', name: 'Medroso', description: 'Animal com medo' },
      { code: 'aggressive', name: 'Agressivo', description: 'Animal com comportamento agressivo' },
      { code: 'lethargic', name: 'Letárgico', description: 'Animal apático ou letárgico' }
    ],
    body_condition: [
      { code: 'obese', name: 'Obeso (5/5)', description: 'Condição corporal 5/5 - Obeso' },
      { code: 'overweight', name: 'Acima do peso (4/5)', description: 'Condição corporal 4/5 - Acima do peso' },
      { code: 'ideal', name: 'Ideal (3/5)', description: 'Condição corporal 3/5 - Peso ideal' },
      { code: 'underweight', name: 'Abaixo do peso (2/5)', description: 'Condição corporal 2/5 - Abaixo do peso' },
      { code: 'emaciated', name: 'Emaciado (1/5)', description: 'Condição corporal 1/5 - Emaciado' }
    ],
    intake_origin: [
      { code: 'owner_surrender', name: 'Entrega pelo proprietário', description: 'Animal entregue pelo proprietário' },
      { code: 'stray_found', name: 'Encontrado na rua', description: 'Animal encontrado abandonado' },
      { code: 'rescue_operation', name: 'Operação de resgate', description: 'Animal resgatado em operação' },
      { code: 'transfer', name: 'Transferência', description: 'Animal transferido de outra instituição' },
      { code: 'birth', name: 'Nascimento', description: 'Animal nascido na instituição' }
    ],
    intake_reason: [
      { code: 'abandonment', name: 'Abandono', description: 'Animal abandonado' },
      { code: 'owner_unable', name: 'Proprietário incapaz', description: 'Proprietário não consegue cuidar' },
      { code: 'behavioral_issues', name: 'Problemas comportamentais', description: 'Problemas de comportamento' },
      { code: 'medical_issues', name: 'Problemas médicos', description: 'Problemas de saúde' },
      { code: 'overpopulation', name: 'Sobrepopulação', description: 'Controlo de população' }
    ],
    symptoms: [
      { code: 'lethargy', name: 'Letargia', description: 'Animal apático' },
      { code: 'vomiting', name: 'Vómito', description: 'Episódios de vómito' },
      { code: 'diarrhea', name: 'Diarreia', description: 'Fezes líquidas' },
      { code: 'coughing', name: 'Tosse', description: 'Tosse persistente' },
      { code: 'limping', name: 'Coxear', description: 'Dificuldade de locomoção' },
      { code: 'wounds', name: 'Feridas', description: 'Feridas visíveis' },
      { code: 'parasites', name: 'Parasitas', description: 'Presença de parasitas' }
    ],
    immediate_actions: [
      { code: 'first_aid', name: 'Primeiros socorros', description: 'Cuidados imediatos' },
      { code: 'pain_relief', name: 'Alívio da dor', description: 'Medicação para dor' },
      { code: 'wound_cleaning', name: 'Limpeza de feridas', description: 'Tratamento de feridas' },
      { code: 'isolation', name: 'Isolamento', description: 'Isolamento preventivo' },
      { code: 'veterinary_exam', name: 'Exame veterinário', description: 'Avaliação veterinária' }
    ]
  };
  
  try {
    // Tentar carregar opções expandidas da base de dados
    const { data, error } = await supabase
      .rpc('get_expanded_intake_options');

    if (error) {
      console.warn('⚠️ [INTAKE] Erro ao carregar opções expandidas:', error);
      
      // Tentar fallback para função antiga
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .rpc('get_intake_config_options');
        
        if (!fallbackError && fallbackData) {
          console.log('✅ [INTAKE] Usando função de fallback');
          
          // Organizar por domínio
          const optionsByDomain: Record<string, any[]> = {};
          (fallbackData || []).forEach((option: any) => {
            if (!optionsByDomain[option.domain]) {
              optionsByDomain[option.domain] = [];
            }
            optionsByDomain[option.domain].push(option);
          });
          
          setIntakeOptions(optionsByDomain);
          console.log('✅ [INTAKE] Opções carregadas via fallback:', Object.keys(optionsByDomain));
          return;
        }
      } catch (fallbackError) {
        console.warn('⚠️ [INTAKE] Fallback também falhou:', fallbackError);
      }
      
      // Usar opções básicas locais
      console.log('🔄 [INTAKE] Usando opções básicas locais');
      setIntakeOptions(basicOptions);
      console.log('✅ [INTAKE] Opções básicas carregadas:', Object.keys(basicOptions));
      return;
    }
    
    // Organizar por domínio
    const optionsByDomain: Record<string, any[]> = {};
    (data || []).forEach((option: any) => {
      if (!optionsByDomain[option.domain]) {
        optionsByDomain[option.domain] = [];
      }
      optionsByDomain[option.domain].push(option);
    });
    
    setIntakeOptions(optionsByDomain);
    console.log('✅ [INTAKE] Opções expandidas carregadas:', Object.keys(optionsByDomain));
    
  } catch (error: any) {
    console.error('❌ [INTAKE] Erro geral ao carregar opções:', error);
    
    // Usar opções básicas como último recurso
    console.log('🔄 [INTAKE] Usando opções básicas como último recurso');
    setIntakeOptions(basicOptions);
    console.log('✅ [INTAKE] Opções básicas aplicadas como fallback final');
  }
};

// Resto do código continua igual...