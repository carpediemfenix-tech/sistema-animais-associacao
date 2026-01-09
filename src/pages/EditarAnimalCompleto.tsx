import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertCircle, CheckCircle, PawPrint, Plus, FileText, Clipboard, Heart, Paperclip, Trash2, Thermometer, Weight, Stethoscope, Activity, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import VoluntarioSelector from "@/components/VoluntarioSelector";
import { convertGoogleDriveUrl } from "@/lib/utils";
import PageActionBar from "@/components/PageActionBar";
import AnimalAttachments from "@/components/AnimalAttachments";

const EditarAnimalCompleto = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [numeroProcesso, setNumeroProcesso] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basico");

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
    observacoes: "",
    grupo_id: "",
    url_fotografia: "",
    voluntario_responsavel: "",
    data_entrada: new Date().toISOString().split('T')[0],
    estado: "" // 🆕 ADICIONADO: Campo estado do animal
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grupos, setGrupos] = useState<any[]>([]);
  const [especies, setEspecies] = useState<any[]>([]);
  const [sexos, setSexos] = useState<any[]>([]);
  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  
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
    injuries: [] as any[],
    // Campos condicionais para entrega pelo proprietário
    owner_name: "",
    owner_contact: "",
    owner_address: "",
    surrender_reason: "",
    // Campos condicionais para encontrado na rua
    found_location: "",
    finder_name: "",
    found_conditions: "",
    // Campos condicionais para resgate
    rescue_type: "",
    authorities_involved: "",
    rescue_circumstances: "",
    // Campos condicionais para transferência
    origin_institution: "",
    origin_contact: "",
    transfer_documents: "",
    transfer_reason: "",
    // Campos condicionais para nascimento
    mother_id: "",
    litter_size: "",
    birth_conditions: "",
    // Campos para exame físico detalhado
    physical_cardiovascular: [] as string[],
    physical_respiratory: [] as string[],
    physical_neurological: [] as string[],
    physical_gastrointestinal: [] as string[],
    physical_musculoskeletal: [] as string[],
    physical_integumentary: [] as string[],
    // Campos para avaliação comportamental
    behavioral_general_temperament: [] as string[],
    behavioral_human_socialization: [] as string[],
    behavioral_animal_socialization: [] as string[],
    behavioral_stimulus_reactions: [] as string[],
    // Campos para plano de cuidados
    care_immediate: [] as string[],
    care_medium_term: [] as string[],
    care_long_term: [] as string[],
    care_plan_notes: ""
  });

  // Auto-save draft quando muda de aba
  const [draftSaved, setDraftSaved] = useState(false);

  // Função para salvar rascunho (específico por animal)
  const saveDraft = () => {
    if (!id) return;
    
    try {
      localStorage.setItem(`editar_animal_draft_${id}`, JSON.stringify({
        formData,
        admissaoData,
        timestamp: new Date().toISOString(),
        activeTab
      }));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    }
  };

  // Carregar dados do animal
  const loadAnimalData = async () => {
    if (!id) return;

    try {
      setLoadingData(true);

      // Carregar dados básicos do animal
      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select('*')
        .eq('id', id)
        .single();

      if (animalError) throw animalError;

      if (animalData) {
        setFormData({
          nome: animalData.nome || "",
          especie: animalData.especie || "",
          raca: animalData.raca || "",
          sexo: animalData.sexo || "",
          idade_estimada: animalData.idade_estimada?.toString() || "",
          data_nascimento: animalData.data_nascimento || "",
          peso: animalData.peso?.toString() || "",
          cor: animalData.cor || "",
          caracteristicas_fisicas: animalData.caracteristicas_fisicas || "",
          transponder: animalData.transponder || "",
          local_encontrado: animalData.local_encontrado || "",
          observacoes: animalData.observacoes || "",
          grupo_id: animalData.grupo_id || "",
          url_fotografia: animalData.url_fotografia || "",
          voluntario_responsavel: animalData.voluntario_responsavel || "",
          data_entrada: animalData.data_entrada || ""
        });
        setNumeroProcesso(animalData.numero_processo || "");
      }

      // Carregar ficha de admissão se existir
      const { data: intakeData, error: intakeError } = await supabase
        .from('animal_intake_assessments')
        .select('*')
        .eq('animal_id', id)
        .maybeSingle();

      if (!intakeError && intakeData) {
        setAdmissaoData({
          intake_origin: intakeData.intake_origin || "",
          intake_reason: intakeData.intake_reason || "",
          circumstances_details: intakeData.circumstances_details || "",
          general_condition: intakeData.general_condition || "",
          behavior_entry: intakeData.behavior_entry || "",
          body_condition: intakeData.body_condition || "",
          weight_kg: intakeData.weight_kg?.toString() || "",
          temperature_celsius: intakeData.temperature_celsius?.toString() || "",
          symptoms: intakeData.symptoms ? JSON.parse(intakeData.symptoms) : [],
          physical_exam_notes: intakeData.physical_exam_notes || "",
          behavioral_notes: intakeData.behavioral_notes || "",
          immediate_actions: intakeData.immediate_actions ? JSON.parse(intakeData.immediate_actions) : [],
          immediate_actions_notes: intakeData.immediate_actions_notes || "",
          prognosis: intakeData.prognosis || "",
          treatment_plan: intakeData.treatment_plan || "",
          special_needs: intakeData.special_needs || "",
          injuries: [],
          // Campos condicionais - podem não existir na BD
          owner_name: intakeData.owner_name || "",
          owner_contact: intakeData.owner_contact || "",
          owner_address: intakeData.owner_address || "",
          surrender_reason: intakeData.surrender_reason || "",
          found_location: intakeData.found_location || "",
          finder_name: intakeData.finder_name || "",
          found_conditions: intakeData.found_conditions || "",
          rescue_type: intakeData.rescue_type || "",
          authorities_involved: intakeData.authorities_involved || "",
          rescue_circumstances: intakeData.rescue_circumstances || "",
          origin_institution: intakeData.origin_institution || "",
          origin_contact: intakeData.origin_contact || "",
          transfer_documents: intakeData.transfer_documents || "",
          transfer_reason: intakeData.transfer_reason || "",
          mother_id: intakeData.mother_id || "",
          litter_size: intakeData.litter_size || "",
          birth_conditions: intakeData.birth_conditions || "",
          // Campos de exame físico - podem ser JSON ou arrays vazios
          physical_cardiovascular: intakeData.physical_cardiovascular ? 
            (typeof intakeData.physical_cardiovascular === 'string' ? 
              JSON.parse(intakeData.physical_cardiovascular) : intakeData.physical_cardiovascular) : [],
          physical_respiratory: intakeData.physical_respiratory ? 
            (typeof intakeData.physical_respiratory === 'string' ? 
              JSON.parse(intakeData.physical_respiratory) : intakeData.physical_respiratory) : [],
          physical_neurological: intakeData.physical_neurological ? 
            (typeof intakeData.physical_neurological === 'string' ? 
              JSON.parse(intakeData.physical_neurological) : intakeData.physical_neurological) : [],
          physical_gastrointestinal: intakeData.physical_gastrointestinal ? 
            (typeof intakeData.physical_gastrointestinal === 'string' ? 
              JSON.parse(intakeData.physical_gastrointestinal) : intakeData.physical_gastrointestinal) : [],
          physical_musculoskeletal: intakeData.physical_musculoskeletal ? 
            (typeof intakeData.physical_musculoskeletal === 'string' ? 
              JSON.parse(intakeData.physical_musculoskeletal) : intakeData.physical_musculoskeletal) : [],
          physical_integumentary: intakeData.physical_integumentary ? 
            (typeof intakeData.physical_integumentary === 'string' ? 
              JSON.parse(intakeData.physical_integumentary) : intakeData.physical_integumentary) : [],
          // Campos de avaliação comportamental
          behavioral_general_temperament: intakeData.behavioral_general_temperament ? 
            (typeof intakeData.behavioral_general_temperament === 'string' ? 
              JSON.parse(intakeData.behavioral_general_temperament) : intakeData.behavioral_general_temperament) : [],
          behavioral_human_socialization: intakeData.behavioral_human_socialization ? 
            (typeof intakeData.behavioral_human_socialization === 'string' ? 
              JSON.parse(intakeData.behavioral_human_socialization) : intakeData.behavioral_human_socialization) : [],
          behavioral_animal_socialization: intakeData.behavioral_animal_socialization ? 
            (typeof intakeData.behavioral_animal_socialization === 'string' ? 
              JSON.parse(intakeData.behavioral_animal_socialization) : intakeData.behavioral_animal_socialization) : [],
          behavioral_stimulus_reactions: intakeData.behavioral_stimulus_reactions ? 
            (typeof intakeData.behavioral_stimulus_reactions === 'string' ? 
              JSON.parse(intakeData.behavioral_stimulus_reactions) : intakeData.behavioral_stimulus_reactions) : [],
          // Campos de plano de cuidados
          care_immediate: intakeData.care_immediate ? 
            (typeof intakeData.care_immediate === 'string' ? 
              JSON.parse(intakeData.care_immediate) : intakeData.care_immediate) : [],
          care_medium_term: intakeData.care_medium_term ? 
            (typeof intakeData.care_medium_term === 'string' ? 
              JSON.parse(intakeData.care_medium_term) : intakeData.care_medium_term) : [],
          care_long_term: intakeData.care_long_term ? 
            (typeof intakeData.care_long_term === 'string' ? 
              JSON.parse(intakeData.care_long_term) : intakeData.care_long_term) : [],
          care_plan_notes: intakeData.care_plan_notes || ""
        });
      }

      // Carregar rascunho se existir
      try {
        const draft = localStorage.getItem(`editar_animal_draft_${id}`);
        if (draft) {
          const { formData: draftFormData, admissaoData: draftAdmissaoData, timestamp, activeTab: draftTab } = JSON.parse(draft);
          const draftAge = Date.now() - new Date(timestamp).getTime();
          
          // Se o rascunho tem menos de 24 horas
          if (draftAge < 24 * 60 * 60 * 1000) {
            toast({
              title: "📝 Rascunho Encontrado",
              description: `Rascunho de ${new Date(timestamp).toLocaleString('pt-PT')} carregado`,
            });
            setFormData(draftFormData);
            setAdmissaoData(draftAdmissaoData);
            setActiveTab(draftTab || "basico");
          }
        }
      } catch (error) {
        console.error('Erro ao carregar rascunho:', error);
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados do animal:', error);
      toast({
        title: "❌ Erro ao Carregar",
        description: error.message || "Não foi possível carregar os dados do animal",
        variant: "destructive",
      });
      navigate('/animais');
    } finally {
      setLoadingData(false);
    }
  };

  // Auto-save quando formData ou admissaoData mudam
  useEffect(() => {
    if (loadingData || loading) return; // Não salvar durante carregamento ou submissão
    
    // Evitar auto-save se o usuário está interagindo com anexos
    if (activeTab === 'anexos') return;
    
    const timer = setTimeout(() => {
      if (formData.nome || admissaoData.intake_origin) { // Só salva se tem dados
        saveDraft();
      }
    }, 5000); // 5 segundos para dar mais tempo ao usuário

    return () => clearTimeout(timer);
  }, [formData, admissaoData, loadingData, loading, activeTab]);

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
        // Sintomas gerais
        { code: 'lethargy', name: 'Letargia', description: 'Animal apático ou sem energia' },
        { code: 'weakness', name: 'Fraqueza', description: 'Animal fraco ou debilitado' },
        { code: 'dehydration', name: 'Desidratação', description: 'Sinais de desidratação' },
        { code: 'fever', name: 'Febre', description: 'Temperatura corporal elevada' },
        { code: 'hypothermia', name: 'Hipotermia', description: 'Temperatura corporal baixa' },
        { code: 'pale_mucous', name: 'Mucosas pálidas', description: 'Mucosas com coloração pálida' },
        { code: 'jaundice', name: 'Icterícia', description: 'Mucosas amareladas' },
        { code: 'shock', name: 'Estado de choque', description: 'Sinais de choque circulatório' },
        
        // Sintomas respiratórios
        { code: 'coughing', name: 'Tosse', description: 'Tosse persistente ou ocasional' },
        { code: 'dyspnea', name: 'Dispneia', description: 'Dificuldade respiratória' },
        { code: 'nasal_discharge', name: 'Corrimento nasal', description: 'Secreção nasal' },
        { code: 'sneezing', name: 'Espirros', description: 'Espirros frequentes' },
        { code: 'open_mouth_breathing', name: 'Respiração ofegante', description: 'Respiração com boca aberta' },
        { code: 'wheezing', name: 'Sibilos', description: 'Ruídos respiratórios anormais' },
        { code: 'cyanosis', name: 'Cianose', description: 'Mucosas azuladas por falta de oxigénio' },
        
        // Sintomas gastrointestinais
        { code: 'vomiting', name: 'Vómito', description: 'Episódios de vómito' },
        { code: 'diarrhea', name: 'Diarreia', description: 'Fezes líquidas ou pastosas' },
        { code: 'constipation', name: 'Obstipação', description: 'Dificuldade para defecar' },
        { code: 'blood_stool', name: 'Sangue nas fezes', description: 'Presença de sangue nas fezes' },
        { code: 'blood_vomit', name: 'Vómito com sangue', description: 'Presença de sangue no vómito' },
        { code: 'loss_appetite', name: 'Perda de apetite', description: 'Recusa alimentar' },
        { code: 'excessive_salivation', name: 'Salivação excessiva', description: 'Produção excessiva de saliva' },
        { code: 'abdominal_distension', name: 'Distensão abdominal', description: 'Abdómen inchado' },
        
        // Sintomas neurológicos
        { code: 'seizures', name: 'Convulsões', description: 'Episódios convulsivos' },
        { code: 'ataxia', name: 'Ataxia', description: 'Incoordenação motora' },
        { code: 'head_tilt', name: 'Inclinação da cabeça', description: 'Cabeça inclinada para um lado' },
        { code: 'blindness', name: 'Cegueira', description: 'Perda de visão' },
        { code: 'altered_consciousness', name: 'Alteração da consciência', description: 'Nível de consciência alterado' },
        { code: 'tremors', name: 'Tremores', description: 'Tremores musculares' },
        { code: 'circling', name: 'Movimento circular', description: 'Animal anda em círculos' },
        
        // Sintomas locomotores
        { code: 'limping', name: 'Coxear', description: 'Dificuldade de locomoção' },
        { code: 'paralysis', name: 'Paralisia', description: 'Perda de movimento' },
        { code: 'joint_swelling', name: 'Inchaço articular', description: 'Articulações inchadas' },
        { code: 'muscle_atrophy', name: 'Atrofia muscular', description: 'Perda de massa muscular' },
        { code: 'fractures', name: 'Fraturas', description: 'Ossos partidos' },
        { code: 'luxations', name: 'Luxações', description: 'Articulações deslocadas' },
        
        // Sintomas cutâneos
        { code: 'wounds', name: 'Feridas', description: 'Feridas visíveis' },
        { code: 'skin_lesions', name: 'Lesões cutâneas', description: 'Lesões na pele' },
        { code: 'hair_loss', name: 'Perda de pelo', description: 'Alopecia ou perda de pelagem' },
        { code: 'itching', name: 'Prurido', description: 'Coceira intensa' },
        { code: 'skin_infections', name: 'Infecções cutâneas', description: 'Infecções na pele' },
        { code: 'burns', name: 'Queimaduras', description: 'Lesões por queimadura' },
        { code: 'abscesses', name: 'Abcessos', description: 'Acumulação de pus' },
        
        // Parasitas
        { code: 'parasites', name: 'Parasitas externos', description: 'Pulgas, carrapatos, ácaros' },
        { code: 'internal_parasites', name: 'Parasitas internos', description: 'Vermes intestinais' },
        { code: 'mange', name: 'Sarna', description: 'Infestação por ácaros' },
        
        // Sintomas comportamentais
        { code: 'aggression', name: 'Agressividade', description: 'Comportamento agressivo' },
        { code: 'excessive_fear', name: 'Medo excessivo', description: 'Medo extremo ou pânico' },
        { code: 'disorientation', name: 'Desorientação', description: 'Animal desorientado' },
        { code: 'excessive_vocalization', name: 'Vocalização excessiva', description: 'Miados, latidos ou choros excessivos' },
        { code: 'depression', name: 'Depressão', description: 'Comportamento deprimido' },
        { code: 'hyperactivity', name: 'Hiperatividade', description: 'Atividade excessiva' },
        
        // Sintomas oculares
        { code: 'eye_discharge', name: 'Corrimento ocular', description: 'Secreção nos olhos' },
        { code: 'eye_redness', name: 'Vermelhidão ocular', description: 'Olhos vermelhos' },
        { code: 'eye_swelling', name: 'Inchaço ocular', description: 'Olhos inchados' },
        { code: 'corneal_opacity', name: 'Opacidade corneal', description: 'Córnea opaca' },
        
        // Sintomas auditivos
        { code: 'ear_discharge', name: 'Corrimento auricular', description: 'Secreção nos ouvidos' },
        { code: 'ear_odor', name: 'Odor auricular', description: 'Mau cheiro nos ouvidos' },
        { code: 'head_shaking', name: 'Balançar a cabeça', description: 'Movimento repetitivo da cabeça' },
        
        // Sintomas urinários
        { code: 'urinary_retention', name: 'Retenção urinária', description: 'Dificuldade para urinar' },
        { code: 'blood_urine', name: 'Sangue na urina', description: 'Urina com sangue' },
        { code: 'frequent_urination', name: 'Micção frequente', description: 'Urinar com frequência' }
      ],
      immediate_actions: [
        // Cuidados básicos
        { code: 'first_aid', name: 'Primeiros socorros', description: 'Cuidados imediatos básicos' },
        { code: 'veterinary_exam', name: 'Exame veterinário', description: 'Avaliação veterinária completa' },
        { code: 'vital_signs', name: 'Avaliação de sinais vitais', description: 'Verificação de temperatura, pulso, respiração' },
        
        // Contenção e segurança
        { code: 'physical_restraint', name: 'Contenção física', description: 'Imobilização segura do animal' },
        { code: 'sedation', name: 'Sedação', description: 'Administração de sedativos' },
        { code: 'muzzle_application', name: 'Aplicação de açaime', description: 'Colocação de açaime por segurança' },
        { code: 'isolation', name: 'Isolamento', description: 'Isolamento preventivo ou terapêutico' },
        
        // Cuidados respiratórios
        { code: 'oxygen_therapy', name: 'Oxigenoterapia', description: 'Administração de oxigénio' },
        { code: 'airway_clearance', name: 'Desobstrução das vias aéreas', description: 'Limpeza de vias respiratórias' },
        { code: 'intubation', name: 'Entubação', description: 'Colocação de tubo endotraqueal' },
        
        // Controlo de hemorragias
        { code: 'hemorrhage_control', name: 'Controlo de hemorragias', description: 'Estancamento de sangramentos' },
        { code: 'pressure_bandage', name: 'Penso compressivo', description: 'Aplicação de penso para controlar sangramento' },
        { code: 'tourniquet', name: 'Garrote', description: 'Aplicação de garrote em emergência' },
        
        // Estabilização de fraturas
        { code: 'fracture_stabilization', name: 'Estabilização de fraturas', description: 'Imobilização de ossos partidos' },
        { code: 'splinting', name: 'Aplicação de tala', description: 'Colocação de tala para imobilização' },
        { code: 'bandaging', name: 'Enfaixamento', description: 'Aplicação de ligaduras' },
        
        // Cuidados de feridas
        { code: 'wound_cleaning', name: 'Limpeza de feridas', description: 'Desinfecção e limpeza de ferimentos' },
        { code: 'wound_suturing', name: 'Sutura de feridas', description: 'Costura de ferimentos' },
        { code: 'burn_treatment', name: 'Tratamento de queimaduras', description: 'Cuidados específicos para queimaduras' },
        { code: 'antiseptic_application', name: 'Aplicação de antisséptico', description: 'Desinfecção com produtos antissépticos' },
        
        // Medicação de emergência
        { code: 'pain_relief', name: 'Alívio da dor', description: 'Administração de analgésicos' },
        { code: 'antibiotic_administration', name: 'Administração de antibióticos', description: 'Tratamento com antibióticos' },
        { code: 'anti_inflammatory', name: 'Anti-inflamatórios', description: 'Medicação anti-inflamatória' },
        { code: 'emergency_drugs', name: 'Fármacos de emergência', description: 'Medicamentos para situações críticas' },
        { code: 'fluid_therapy', name: 'Fluidoterapia', description: 'Administração de fluidos intravenosos' },
        
        // Suporte cardiovascular
        { code: 'cardiac_massage', name: 'Massagem cardíaca', description: 'Reanimação cardiopulmonar' },
        { code: 'shock_treatment', name: 'Tratamento de choque', description: 'Medidas para tratar estado de choque' },
        
        // Cuidados neurológicos
        { code: 'seizure_control', name: 'Controlo de convulsões', description: 'Medicação anticonvulsivante' },
        { code: 'head_trauma_care', name: 'Cuidados de trauma craniano', description: 'Tratamento específico para lesões na cabeça' },
        
        // Descontaminação
        { code: 'decontamination', name: 'Descontaminação', description: 'Limpeza de substâncias tóxicas' },
        { code: 'eye_irrigation', name: 'Irrigação ocular', description: 'Lavagem dos olhos' },
        { code: 'gastric_lavage', name: 'Lavagem gástrica', description: 'Limpeza do estômago' },
        
        // Controlo de parasitas
        { code: 'parasite_treatment', name: 'Tratamento de parasitas', description: 'Medicação antiparasitária' },
        { code: 'flea_treatment', name: 'Tratamento de pulgas', description: 'Eliminação de pulgas' },
        { code: 'tick_removal', name: 'Remoção de carrapatos', description: 'Retirada manual de carrapatos' },
        
        // Cuidados de suporte
        { code: 'temperature_regulation', name: 'Regulação da temperatura', description: 'Aquecimento ou arrefecimento do animal' },
        { code: 'nutritional_support', name: 'Suporte nutricional', description: 'Alimentação assistida ou suplementação' },
        { code: 'hydration', name: 'Hidratação', description: 'Fornecimento de água ou fluidos' },
        
        // Documentação e comunicação
        { code: 'photo_documentation', name: 'Documentação fotográfica', description: 'Registo fotográfico das lesões' },
        { code: 'emergency_contact', name: 'Contacto de emergência', description: 'Comunicação com veterinário de urgência' },
        { code: 'owner_notification', name: 'Notificação do proprietário', description: 'Contacto com o dono do animal' }
      ]
    };
    
    // ESTRUTURA DA BASE DE DADOS CORRIGIDA - USAR BASE DE DADOS PRIMEIRO
    console.log('🔄 [INTAKE] Tentando carregar da base de dados (estrutura corrigida)');
    
    try {
      // Tentar carregar opções expandidas da base de dados
      const { data, error } = await supabase
        .rpc('get_expanded_intake_options');

      if (error) {
        console.warn('⚠️ [INTAKE] Erro ao carregar opções expandidas:', error);
      } else if (data && data.length > 0) {
        console.log('✅ [INTAKE] Dados carregados da base de dados:', data.length, 'opções');
        
        // Organizar por domínio
        const optionsByDomain: Record<string, any[]> = {};
        data.forEach((option: any) => {
          if (!optionsByDomain[option.domain]) {
            optionsByDomain[option.domain] = [];
          }
          optionsByDomain[option.domain].push(option);
        });
        
        setIntakeOptions(optionsByDomain);
        console.log('🎆 [INTAKE] Opções da BD organizadas:', Object.keys(optionsByDomain));
        console.log('📊 [INTAKE] Contagens por domínio:', 
          Object.entries(optionsByDomain).map(([domain, opts]) => `${domain}: ${opts.length}`).join(', '));
        return;
      } else {
        console.warn('⚠️ [INTAKE] Base de dados retornou dados vazios');
        
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
    
    // Log final para verificar estado
    setTimeout(() => {
      console.log('🔍 [INTAKE] Estado final das opções:', {
        general_condition: intakeOptions.general_condition?.length || 0,
        behavior: intakeOptions.behavior?.length || 0,
        body_condition: intakeOptions.body_condition?.length || 0,
        total_domains: Object.keys(intakeOptions).length,
        all_keys: Object.keys(intakeOptions),
        sample_data: {
          general_condition: intakeOptions.general_condition?.[0],
          behavior: intakeOptions.behavior?.[0],
          body_condition: intakeOptions.body_condition?.[0]
        }
      });
    }, 100);
  };

  // Função para obter opções condicionais baseadas na origem e razão
  const fetchConditionalOptions = async (origin: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_conditional_intake_options_2026', {
          origin_code: origin || null,
          reason_code: reason || null
        });

      if (error) {
        console.error('Erro ao carregar opções condicionais:', error);
        return;
      }

      // Organizar opções condicionais por domínio
      const conditionalOptions: Record<string, any[]> = {};
      (data || []).forEach((option: any) => {
        if (option.is_relevant) {
          if (!conditionalOptions[option.domain]) {
            conditionalOptions[option.domain] = [];
          }
          conditionalOptions[option.domain].push(option);
        }
      });

      // Mesclar com opções existentes, priorizando as condicionais
      const mergedOptions = { ...intakeOptions };
      Object.keys(conditionalOptions).forEach(domain => {
        if (mergedOptions[domain]) {
          // Adicionar opções condicionais no início
          mergedOptions[domain] = [
            ...conditionalOptions[domain],
            ...mergedOptions[domain].filter(existing => 
              !conditionalOptions[domain].some(conditional => conditional.code === existing.code)
            )
          ];
        } else {
          mergedOptions[domain] = conditionalOptions[domain];
        }
      });

      setIntakeOptions(mergedOptions);
    } catch (error: any) {
      console.error('Erro ao processar opções condicionais:', error);
    }
  };

  useEffect(() => {
    fetchGrupos();
    fetchEspecies();
    fetchSexos();
    fetchVoluntarios();
    fetchIntakeOptions();
    loadAnimalData();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Sugerir grupo quando espécie muda
    if (field === 'especie') {
      suggestGroupForSpecies(value);
    }
  };

  const handleAdmissaoChange = (field: string, value: string | string[]) => {
    setAdmissaoData(prev => ({ ...prev, [field]: value }));
    
    // Atualizar opções condicionais quando origem ou razão mudam
    if (field === 'intake_origin' || field === 'intake_reason') {
      const newData = { ...admissaoData, [field]: value };
      if (newData.intake_origin || newData.intake_reason) {
        fetchConditionalOptions(
          newData.intake_origin as string, 
          newData.intake_reason as string
        );
      }
    }
  };

  const handleMultiSelectChange = (field: string, optionCode: string, checked: boolean) => {
    setAdmissaoData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, optionCode] };
      } else {
        return { ...prev, [field]: currentArray.filter(code => code !== optionCode) };
      }
    });
  };

  const addInjury = () => {
    const newInjury = {
      id: Date.now().toString(),
      injury_type: "",
      injury_severity: "",
      body_location: "",
      description: "",
      treatment_given: "",
      requires_followup: false,
      followup_date: ""
    };
    setAdmissaoData(prev => ({
      ...prev,
      injuries: [...prev.injuries, newInjury]
    }));
  };

  const removeInjury = (injuryId: string) => {
    setAdmissaoData(prev => ({
      ...prev,
      injuries: prev.injuries.filter(injury => injury.id !== injuryId)
    }));
  };

  const updateInjury = (injuryId: string, field: string, value: any) => {
    setAdmissaoData(prev => ({
      ...prev,
      injuries: prev.injuries.map(injury => 
        injury.id === injuryId ? { ...injury, [field]: value } : injury
      )
    }));
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

    if (!formData.estado) {
      newErrors.estado = "Estado é obrigatório";
    }

    if (!formData.voluntario_responsavel) {
      newErrors.voluntario_responsavel = "Voluntário responsável é obrigatório";
    }

    if (!formData.data_entrada) {
      newErrors.data_entrada = "Data de entrada é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "❌ Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!id) {
      toast({
        title: "❌ Erro",
        description: "ID do animal não encontrado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const animalData = {
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
        observacoes: formData.observacoes.trim() || null,
        grupo_id: formData.grupo_id || null,
        url_fotografia: formData.url_fotografia ? convertGoogleDriveUrl(formData.url_fotografia) : null,
        voluntario_responsavel: formData.voluntario_responsavel,
        data_entrada: formData.data_entrada
      };

      // Atualizar dados básicos do animal
      const { error: updateError } = await supabase
        .from('animais')
        .update(animalData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Atualizar ou criar ficha de admissão se preenchida
      const hasIntakeData = admissaoData.intake_origin || 
                           admissaoData.general_condition || 
                           admissaoData.symptoms.length > 0 || 
                           admissaoData.immediate_actions.length > 0 ||
                           admissaoData.physical_exam_notes ||
                           admissaoData.behavioral_notes;

      if (hasIntakeData) {
        try {
          const intakeAssessmentData = {
            animal_id: id,
            assessment_date: new Date().toISOString(),
            assessed_by: formData.voluntario_responsavel || null,
            intake_origin: admissaoData.intake_origin || null,
            intake_reason: admissaoData.intake_reason || null,
            circumstances_details: admissaoData.circumstances_details || null,
            general_condition: admissaoData.general_condition || null,
            behavior_entry: admissaoData.behavior_entry || null,
            body_condition: admissaoData.body_condition || null,
            weight_kg: admissaoData.weight_kg ? parseFloat(admissaoData.weight_kg) : null,
            temperature_celsius: admissaoData.temperature_celsius ? parseFloat(admissaoData.temperature_celsius) : null,
            symptoms: JSON.stringify(admissaoData.symptoms),
            physical_exam_notes: admissaoData.physical_exam_notes || null,
            behavioral_notes: admissaoData.behavioral_notes || null,
            immediate_actions: JSON.stringify(admissaoData.immediate_actions),
            immediate_actions_notes: admissaoData.immediate_actions_notes || null,
            prognosis: admissaoData.prognosis || null,
            treatment_plan: admissaoData.treatment_plan || null,
            special_needs: admissaoData.special_needs || null,
            is_complete: true,
            // Campos condicionais
            owner_name: admissaoData.owner_name || null,
            owner_contact: admissaoData.owner_contact || null,
            owner_address: admissaoData.owner_address || null,
            surrender_reason: admissaoData.surrender_reason || null,
            found_location: admissaoData.found_location || null,
            finder_name: admissaoData.finder_name || null,
            found_conditions: admissaoData.found_conditions || null,
            rescue_type: admissaoData.rescue_type || null,
            authorities_involved: admissaoData.authorities_involved || null,
            rescue_circumstances: admissaoData.rescue_circumstances || null,
            origin_institution: admissaoData.origin_institution || null,
            origin_contact: admissaoData.origin_contact || null,
            transfer_documents: admissaoData.transfer_documents || null,
            transfer_reason: admissaoData.transfer_reason || null,
            mother_id: admissaoData.mother_id || null,
            litter_size: admissaoData.litter_size || null,
            birth_conditions: admissaoData.birth_conditions || null,
            // Campos de exame físico
            physical_cardiovascular: JSON.stringify(admissaoData.physical_cardiovascular),
            physical_respiratory: JSON.stringify(admissaoData.physical_respiratory),
            physical_neurological: JSON.stringify(admissaoData.physical_neurological),
            physical_gastrointestinal: JSON.stringify(admissaoData.physical_gastrointestinal),
            physical_musculoskeletal: JSON.stringify(admissaoData.physical_musculoskeletal),
            physical_integumentary: JSON.stringify(admissaoData.physical_integumentary),
            // Campos de avaliação comportamental
            behavioral_general_temperament: JSON.stringify(admissaoData.behavioral_general_temperament),
            behavioral_human_socialization: JSON.stringify(admissaoData.behavioral_human_socialization),
            behavioral_animal_socialization: JSON.stringify(admissaoData.behavioral_animal_socialization),
            behavioral_stimulus_reactions: JSON.stringify(admissaoData.behavioral_stimulus_reactions),
            // Campos de plano de cuidados
            care_immediate: JSON.stringify(admissaoData.care_immediate),
            care_medium_term: JSON.stringify(admissaoData.care_medium_term),
            care_long_term: JSON.stringify(admissaoData.care_long_term),
            care_plan_notes: admissaoData.care_plan_notes || null
          };

          // Usar upsert por animal_id (solução robusta)
          console.log('🔍 [INTAKE_SAVE] animal_id:', id, 'tipo:', typeof id);
          console.log('📝 [INTAKE_SAVE] payload keys:', Object.keys(intakeAssessmentData));
          
          // Validar se o animal_id é um UUID válido
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
            throw new Error(`animal_id inválido: ${id} (tipo: ${typeof id})`);
          }
          
          // Filtrar payload para incluir APENAS campos que existem na tabela
          const validFields = [
            'animal_id', 'assessment_date', 'assessed_by', 'intake_origin', 'intake_reason',
            'general_condition', 'behavior_entry', 'body_condition', 'symptoms', 'immediate_actions',
            'clinical_observations', 'intake_summary', 'weight_kg', 'temperature_celsius',
            // Campos condicionais por origem
            'authorities_involved', 'rescue_type', 'rescue_circumstances',
            'owner_name', 'owner_contact', 'owner_address', 'surrender_reason',
            'found_location', 'finder_name', 'found_conditions',
            'origin_institution', 'origin_contact', 'transfer_documents', 'transfer_reason',
            'mother_id', 'litter_size', 'birth_conditions',
            // Campos de exame físico
            'physical_exam_notes', 'physical_cardiovascular', 'physical_respiratory',
            'physical_neurological', 'physical_gastrointestinal', 'physical_musculoskeletal', 'physical_integumentary',
            // Campos comportamentais
            'behavioral_notes', 'behavioral_general_temperament', 'behavioral_human_socialization',
            'behavioral_animal_socialization', 'behavioral_stimulus_reactions',
            // Campos de plano de cuidados
            'treatment_plan', 'care_immediate', 'care_medium_term', 'care_long_term', 'care_plan_notes',
            'special_needs', 'immediate_actions_notes'
          ];
          
          const rawPayload = { ...intakeAssessmentData, animal_id: id };
          const payload = {};
          
          // Filtrar apenas campos válidos
          validFields.forEach(field => {
            if (rawPayload.hasOwnProperty(field)) {
              payload[field] = rawPayload[field];
            }
          });
          
          console.log('📝 [INTAKE_SAVE] Payload filtrado:', Object.keys(payload).length, 'campos');
          console.log('📝 [INTAKE_SAVE] Campos:', Object.keys(payload));
          
          // Validar e corrigir tipos críticos
          if (payload.animal_id && typeof payload.animal_id !== 'string') {
            payload.animal_id = String(payload.animal_id);
          }
          
          // Garantir que arrays JSON sejam strings JSON válidas
          const jsonFields = ['symptoms', 'immediate_actions', 'physical_cardiovascular', 'physical_respiratory',
                             'physical_neurological', 'physical_gastrointestinal', 'physical_musculoskeletal', 
                             'physical_integumentary', 'behavioral_general_temperament', 'behavioral_human_socialization',
                             'behavioral_animal_socialization', 'behavioral_stimulus_reactions', 'care_immediate', 
                             'care_medium_term', 'care_long_term'];
          
          jsonFields.forEach(field => {
            if (payload[field]) {
              if (Array.isArray(payload[field])) {
                payload[field] = JSON.stringify(payload[field]);
              } else if (typeof payload[field] !== 'string') {
                payload[field] = JSON.stringify(payload[field]);
              }
            }
          });
          
          // Garantir que campos numéricos sejam números
          if (payload.weight_kg && typeof payload.weight_kg === 'string') {
            const weight = parseFloat(payload.weight_kg);
            payload.weight_kg = isNaN(weight) ? null : weight;
          }
          
          if (payload.temperature_celsius && typeof payload.temperature_celsius === 'string') {
            const temp = parseFloat(payload.temperature_celsius);
            payload.temperature_celsius = isNaN(temp) ? null : temp;
          }
          
          // Garantir que assessment_date seja uma data válida
          if (!payload.assessment_date) {
            payload.assessment_date = new Date().toISOString();
          }
          
          const { data: savedIntake, error: intakeUpsertError } = await supabase
            .from('animal_intake_assessments')
            .upsert(payload, { onConflict: 'animal_id' })
            .select()
            .single();

          if (intakeUpsertError) {
            console.error('❌ [INTAKE_SAVE] Erro detalhado:');
            console.error('Code:', intakeUpsertError.code);
            console.error('Message:', intakeUpsertError.message);
            console.error('Details:', intakeUpsertError.details);
            console.error('Hint:', intakeUpsertError.hint);
            console.error('Payload enviado:', payload);
            throw intakeUpsertError;
          }
          
          console.log('✅ [INTAKE_SAVE] Ficha salva com sucesso:', savedIntake?.id);

          toast({
            title: "✅ Animal e Ficha Atualizados!",
            description: `${formData.nome} foi atualizado com ficha de admissão completa`,
          });
        } catch (intakeError) {
          console.error('Erro ao salvar ficha de admissão:', intakeError);
          toast({
            title: "⚠️ Animal Atualizado com Aviso",
            description: "Animal atualizado, mas houve erro ao salvar a ficha de admissão",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "✅ Animal Atualizado com Sucesso!",
          description: `${formData.nome} foi atualizado`,
        });
      }

      // Limpar rascunho após sucesso
      localStorage.removeItem(`editar_animal_draft_${id}`);

      navigate(`/animal/${id}`);

    } catch (error: any) {
      console.error('Erro ao atualizar animal:', error);
      toast({
        title: "❌ Erro ao Atualizar Animal",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading enquanto carrega dados
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do animal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <EnhancedHeader />
      
      <PageActionBar
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Animais", href: "/animais" },
          { label: formData.nome || "Animal", href: `/animal/${id}` },
          { label: "Editar Completo", href: `/editar-animal-completo/${id}` }
        ]}
        primaryActions={
          <Button
            variant="outline"
            onClick={() => navigate(`/animal/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Layout Responsivo: 2 colunas em desktop, 1 coluna em mobile */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Coluna Principal - Formulário (3/4 da largura em desktop) */}
            <div className="xl:col-span-3">
              {/* Sistema de Abas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-6 w-6" />
                    Editar Animal Completo
                  </CardTitle>
                  <CardDescription>
                    Edite todas as informações do animal. Todas as alterações são salvas automaticamente como rascunho.
                  </CardDescription>
                </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basico" className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4" />
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

                  {/* ABA 1: BÁSICO */}
                  <TabsContent value="basico" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      
                      {/* Nome */}
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

                      {/* Espécie */}
                      <div>
                        <Label htmlFor="especie">Espécie *</Label>
                        <Select 
                          value={formData.especie} 
                          onValueChange={(value) => handleInputChange("especie", value)}
                        >
                          <SelectTrigger className={errors.especie ? "border-red-500" : ""}>
                            <SelectValue placeholder="Selecionar espécie" />
                          </SelectTrigger>
                          <SelectContent>
                            {especies.map((especie) => (
                              <SelectItem key={especie.id} value={especie.nome}>
                                <div className="flex items-center">
                                  <span className="mr-2">{getEspecieIcon(especie)}</span>
                                  {especie.nome}
                                </div>
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

                      {/* Raça */}
                      <div>
                        <Label htmlFor="raca">Raça</Label>
                        <Input
                          id="raca"
                          value={formData.raca}
                          onChange={(e) => handleInputChange("raca", e.target.value)}
                          placeholder="Raça do animal (opcional)"
                        />
                      </div>

                      {/* Sexo */}
                      <div>
                        <Label htmlFor="sexo">Sexo *</Label>
                        <Select 
                          value={formData.sexo} 
                          onValueChange={(value) => handleInputChange("sexo", value)}
                        >
                          <SelectTrigger className={errors.sexo ? "border-red-500" : ""}>
                            <SelectValue placeholder="Selecionar sexo" />
                          </SelectTrigger>
                          <SelectContent>
                            {sexos.map((sexo) => (
                              <SelectItem key={sexo.id} value={sexo.nome}>
                                <div className="flex items-center">
                                  <span className="mr-2">{getSexoIcon(sexo)}</span>
                                  {sexo.nome}
                                </div>
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

                      {/* Estado do Animal */}
                      <div>
                        <Label htmlFor="estado">Estado *</Label>
                        <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponivel">Disponível para Adoção</SelectItem>
                            <SelectItem value="adotado">Adotado</SelectItem>
                            <SelectItem value="em_tratamento">Em Tratamento</SelectItem>
                            <SelectItem value="quarentena">Em Quarentena</SelectItem>
                            <SelectItem value="resgate">Em Resgate</SelectItem>
                            <SelectItem value="transferido">Transferido</SelectItem>
                            <SelectItem value="obito">Óbito</SelectItem>
                            <SelectItem value="fugiu">Fugiu</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.estado && (
                          <p className="text-sm text-red-500 mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.estado}
                          </p>
                        )}
                      </div>

                      {/* Idade Estimada */}
                      <div>
                        <Label htmlFor="idade_estimada">Idade Estimada (meses)</Label>
                        <Input
                          id="idade_estimada"
                          type="number"
                          min="0"
                          max="300"
                          value={formData.idade_estimada}
                          onChange={(e) => handleInputChange("idade_estimada", e.target.value)}
                          placeholder="Ex: 24"
                        />
                      </div>

                      {/* Data de Nascimento */}
                      <div>
                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                        <Input
                          id="data_nascimento"
                          type="date"
                          value={formData.data_nascimento}
                          onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                        />
                      </div>

                      {/* Peso */}
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
                        />
                      </div>

                      {/* Cor */}
                      <div>
                        <Label htmlFor="cor">Cor</Label>
                        <Input
                          id="cor"
                          value={formData.cor}
                          onChange={(e) => handleInputChange("cor", e.target.value)}
                          placeholder="Ex: Castanho, Preto e branco"
                        />
                      </div>
                    </div>

                    {/* Características Físicas */}
                    <div>
                      <Label htmlFor="caracteristicas_fisicas">Características Físicas</Label>
                      <Textarea
                        id="caracteristicas_fisicas"
                        value={formData.caracteristicas_fisicas}
                        onChange={(e) => handleInputChange("caracteristicas_fisicas", e.target.value)}
                        placeholder="Descreva características distintivas do animal..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  {/* ABA 2: ADICIONAIS */}
                  <TabsContent value="adicionais" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      
                      {/* Transponder/Chip */}
                      <div>
                        <Label htmlFor="transponder">Transponder/Chip</Label>
                        <Input
                          id="transponder"
                          value={formData.transponder}
                          onChange={(e) => handleInputChange("transponder", e.target.value)}
                          placeholder="Número do chip (se aplicável)"
                        />
                      </div>

                      {/* Local Encontrado */}
                      <div>
                        <Label htmlFor="local_encontrado">Local Encontrado</Label>
                        <Input
                          id="local_encontrado"
                          value={formData.local_encontrado}
                          onChange={(e) => handleInputChange("local_encontrado", e.target.value)}
                          placeholder="Ex: Rua das Flores, Lisboa"
                        />
                      </div>

                      {/* Data de Entrada */}
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
                    </div>

                    {/* Voluntário Responsável */}
                    <div>
                      <VoluntarioSelector
                        value={formData.voluntario_responsavel}
                        onValueChange={(voluntarioId, voluntario) => {
                          handleInputChange("voluntario_responsavel", voluntarioId);
                        }}
                        label="Voluntário Responsável"
                        placeholder="Selecionar voluntário responsável..."
                        showFullName={true}
                        required={true}
                        className={errors.voluntario_responsavel ? "border-red-500" : ""}
                      />
                      {errors.voluntario_responsavel && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.voluntario_responsavel}
                        </p>
                      )}
                      <p className="text-sm text-blue-600 mt-1">
                        🐾 Este voluntário será responsável pelo cuidado do animal
                      </p>
                    </div>

                    {/* Seleção de Grupo */}
                    <div>
                      <Label htmlFor="grupo_id">Grupo (Matilha/Colónia)</Label>
                      <Select 
                        value={formData.grupo_id} 
                        onValueChange={(value) => handleInputChange("grupo_id", value === "none" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar grupo (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum grupo</SelectItem>
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
                    </div>

                    {/* Observações */}
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
                  </TabsContent>

                  {/* ABA 3: FICHA DE ADMISSÃO COMPLETA - IGUAL AO NOVO ANIMAL */}
                  <TabsContent value="admissao" className="space-y-6 mt-6">
                    
                    {/* Cabeçalho da Ficha */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <Clipboard className="h-6 w-6 text-emerald-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Ficha de Admissão / Condição à Entrada
                          </h3>
                          <p className="text-sm text-gray-600">
                            ✨ Edite ou complete a ficha de admissão
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 1. CIRCUNSTÂNCIAS DA ADMISSÃO */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-5 w-5 text-emerald-600" />
                          Circunstâncias da Admissão
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Origem */}
                          <div>
                            <Label>Origem da Admissão</Label>
                            <Select 
                              value={admissaoData.intake_origin} 
                              onValueChange={(value) => handleAdmissaoChange("intake_origin", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Como chegou à instituição?" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.intake_origin || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Razão */}
                          <div>
                            <Label>Razão da Admissão</Label>
                            <Select 
                              value={admissaoData.intake_reason} 
                              onValueChange={(value) => handleAdmissaoChange("intake_reason", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Motivo principal" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.intake_reason || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Detalhes das Circunstâncias */}
                        <div>
                          <Label>Detalhes das Circunstâncias</Label>
                          <Textarea
                            value={admissaoData.circumstances_details}
                            onChange={(e) => handleAdmissaoChange("circumstances_details", e.target.value)}
                            placeholder="Descreva as circunstâncias detalhadas da admissão..."
                            rows={3}
                          />
                        </div>

                        {/* CAMPOS CONDICIONAIS BASEADOS NA ORIGEM */}
                        {admissaoData.intake_origin && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
                            <h4 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
                              📝 Informações Específicas - {intakeOptions.intake_origin?.find(o => o.code === admissaoData.intake_origin)?.name}
                            </h4>
                            
                            {/* Campos para Entrega pelo Proprietário */}
                            {admissaoData.intake_origin.includes('owner_surrender') && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Nome do Proprietário</Label>
                                  <Input
                                    value={admissaoData.owner_name || ''}
                                    onChange={(e) => handleAdmissaoChange("owner_name", e.target.value)}
                                    placeholder="Nome completo do proprietário"
                                  />
                                </div>
                                <div>
                                  <Label>Contacto do Proprietário</Label>
                                  <Input
                                    value={admissaoData.owner_contact || ''}
                                    onChange={(e) => handleAdmissaoChange("owner_contact", e.target.value)}
                                    placeholder="Telefone ou email"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Morada do Proprietário</Label>
                                  <Input
                                    value={admissaoData.owner_address || ''}
                                    onChange={(e) => handleAdmissaoChange("owner_address", e.target.value)}
                                    placeholder="Morada completa"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Motivo da Entrega</Label>
                                  <Textarea
                                    value={admissaoData.surrender_reason || ''}
                                    onChange={(e) => handleAdmissaoChange("surrender_reason", e.target.value)}
                                    placeholder="Explique o motivo da entrega do animal..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campos para Encontrado na Rua */}
                            {admissaoData.intake_origin.includes('stray') && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Local Exato do Encontro</Label>
                                  <Input
                                    value={admissaoData.found_location || ''}
                                    onChange={(e) => handleAdmissaoChange("found_location", e.target.value)}
                                    placeholder="Rua, número, freguesia, concelho"
                                  />
                                </div>
                                <div>
                                  <Label>Pessoa que Encontrou</Label>
                                  <Input
                                    value={admissaoData.finder_name || ''}
                                    onChange={(e) => handleAdmissaoChange("finder_name", e.target.value)}
                                    placeholder="Nome e contacto de quem encontrou"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Condições do Encontro</Label>
                                  <Textarea
                                    value={admissaoData.found_conditions || ''}
                                    onChange={(e) => handleAdmissaoChange("found_conditions", e.target.value)}
                                    placeholder="Descreva as condições em que o animal foi encontrado..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campos para Resgate */}
                            {admissaoData.intake_origin.includes('rescue') && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Tipo de Resgate</Label>
                                  <Select 
                                    value={admissaoData.rescue_type || ''} 
                                    onValueChange={(value) => handleAdmissaoChange("rescue_type", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="emergency">Emergência</SelectItem>
                                      <SelectItem value="planned">Planeado</SelectItem>
                                      <SelectItem value="seizure">Apreensão</SelectItem>
                                      <SelectItem value="voluntary">Voluntário</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Autoridades Envolvidas</Label>
                                  <Input
                                    value={admissaoData.authorities_involved || ''}
                                    onChange={(e) => handleAdmissaoChange("authorities_involved", e.target.value)}
                                    placeholder="PSP, GNR, SEPNA, etc."
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Circunstâncias do Resgate</Label>
                                  <Textarea
                                    value={admissaoData.rescue_circumstances || ''}
                                    onChange={(e) => handleAdmissaoChange("rescue_circumstances", e.target.value)}
                                    placeholder="Descreva as circunstâncias detalhadas do resgate..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campos para Transferência */}
                            {admissaoData.intake_origin.includes('transfer') && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Instituição de Origem</Label>
                                  <Input
                                    value={admissaoData.origin_institution || ''}
                                    onChange={(e) => handleAdmissaoChange("origin_institution", e.target.value)}
                                    placeholder="Nome da instituição de origem"
                                  />
                                </div>
                                <div>
                                  <Label>Contacto da Instituição</Label>
                                  <Input
                                    value={admissaoData.origin_contact || ''}
                                    onChange={(e) => handleAdmissaoChange("origin_contact", e.target.value)}
                                    placeholder="Telefone ou email"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Documentos de Transferência</Label>
                                  <Textarea
                                    value={admissaoData.transfer_documents || ''}
                                    onChange={(e) => handleAdmissaoChange("transfer_documents", e.target.value)}
                                    placeholder="Liste os documentos recebidos (boletim sanitário, historial médico, etc.)"
                                    rows={2}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Motivo da Transferência</Label>
                                  <Textarea
                                    value={admissaoData.transfer_reason || ''}
                                    onChange={(e) => handleAdmissaoChange("transfer_reason", e.target.value)}
                                    placeholder="Explique o motivo da transferência..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campos para Nascimento */}
                            {admissaoData.intake_origin.includes('birth') && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Mãe do Animal</Label>
                                  <Input
                                    value={admissaoData.mother_id || ''}
                                    onChange={(e) => handleAdmissaoChange("mother_id", e.target.value)}
                                    placeholder="ID ou nome da mãe"
                                  />
                                </div>
                                <div>
                                  <Label>Tamanho da Ninhada</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={admissaoData.litter_size || ''}
                                    onChange={(e) => handleAdmissaoChange("litter_size", e.target.value)}
                                    placeholder="Número total de crias"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Condições do Nascimento</Label>
                                  <Textarea
                                    value={admissaoData.birth_conditions || ''}
                                    onChange={(e) => handleAdmissaoChange("birth_conditions", e.target.value)}
                                    placeholder="Descreva as condições do nascimento e estado da mãe..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* 2. TRIAGEM IMEDIATA */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Stethoscope className="h-5 w-5 text-emerald-600" />
                          Triagem Imediata
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Estado Geral */}
                          <div>
                            <Label>Estado Geral</Label>
                            <Select 
                              value={admissaoData.general_condition} 
                              onValueChange={(value) => handleAdmissaoChange("general_condition", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Condição geral" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.general_condition || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Comportamento */}
                          <div>
                            <Label>Comportamento</Label>
                            <Select 
                              value={admissaoData.behavior_entry} 
                              onValueChange={(value) => handleAdmissaoChange("behavior_entry", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Comportamento observado" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.behavior || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Condição Corporal */}
                          <div>
                            <Label>Condição Corporal</Label>
                            <Select 
                              value={admissaoData.body_condition} 
                              onValueChange={(value) => handleAdmissaoChange("body_condition", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Condição física" />
                              </SelectTrigger>
                              <SelectContent>
                                {(intakeOptions.body_condition || []).map((option) => (
                                  <SelectItem key={option.code} value={option.code}>
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Peso na Admissão */}
                          <div>
                            <Label className="flex items-center gap-2">
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
                            />
                          </div>

                          {/* Temperatura */}
                          <div>
                            <Label className="flex items-center gap-2">
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
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 3. SINAIS E SINTOMAS */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Activity className="h-5 w-5 text-teal-600" />
                          Sinais e Sintomas Observados
                        </CardTitle>
                        <CardDescription>
                          Selecione todos os sintomas observados no momento da admissão
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
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
                      </CardContent>
                    </Card>

                    {/* 4. AÇÕES IMEDIATAS */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Heart className="h-5 w-5 text-emerald-600" />
                          Ações Imediatas Realizadas
                        </CardTitle>
                        <CardDescription>
                          Selecione todas as ações que foram tomadas imediatamente
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
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
                        <div>
                          <Label>Detalhes das Ações Realizadas</Label>
                          <Textarea
                            value={admissaoData.immediate_actions_notes}
                            onChange={(e) => handleAdmissaoChange("immediate_actions_notes", e.target.value)}
                            placeholder="Descreva detalhadamente as ações tomadas..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* 5. OBSERVAÇÕES CLÍNICAS */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-5 w-5 text-green-600" />
                          Observações Clínicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Notas do Exame Físico */}
                          <div>
                            <Label>Notas do Exame Físico</Label>
                            <Textarea
                              value={admissaoData.physical_exam_notes}
                              onChange={(e) => handleAdmissaoChange("physical_exam_notes", e.target.value)}
                              placeholder="Observações do exame físico..."
                              rows={4}
                            />
                          </div>

                          {/* Observações Comportamentais */}
                          <div>
                            <Label>Observações Comportamentais</Label>
                            <Textarea
                              value={admissaoData.behavioral_notes}
                              onChange={(e) => handleAdmissaoChange("behavioral_notes", e.target.value)}
                              placeholder="Comportamento, temperamento, socialização..."
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Prognóstico */}
                          <div>
                            <Label>Prognóstico Inicial</Label>
                            <Select 
                              value={admissaoData.prognosis} 
                              onValueChange={(value) => handleAdmissaoChange("prognosis", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Avaliação do prognóstico" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">Excelente</SelectItem>
                                <SelectItem value="good">Bom</SelectItem>
                                <SelectItem value="fair">Razoável</SelectItem>
                                <SelectItem value="guarded">Reservado</SelectItem>
                                <SelectItem value="poor">Mau</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Plano de Tratamento */}
                          <div>
                            <Label>Plano de Tratamento</Label>
                            <Textarea
                              value={admissaoData.treatment_plan}
                              onChange={(e) => handleAdmissaoChange("treatment_plan", e.target.value)}
                              placeholder="Plano de cuidados e tratamento..."
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Necessidades Especiais */}
                        <div>
                          <Label>Necessidades Especiais</Label>
                          <Textarea
                            value={admissaoData.special_needs}
                            onChange={(e) => handleAdmissaoChange("special_needs", e.target.value)}
                            placeholder="Cuidados especiais, restrições, medicação..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Resumo da Ficha */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-800 mb-2">Resumo da Ficha de Admissão</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Origem:</span>
                          <div className="font-medium">
                            {admissaoData.intake_origin ? 
                              intakeOptions.intake_origin?.find(o => o.code === admissaoData.intake_origin)?.name || 'N/A'
                              : 'Não definida'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Estado Geral:</span>
                          <div className="font-medium">
                            {admissaoData.general_condition ? 
                              intakeOptions.general_condition?.find(o => o.code === admissaoData.general_condition)?.name || 'N/A'
                              : 'Não avaliado'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Sintomas:</span>
                          <div className="font-medium">{admissaoData.symptoms.length} selecionados</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Ações:</span>
                          <div className="font-medium">{admissaoData.immediate_actions.length} realizadas</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ABA 4: ANEXOS */}
                  <TabsContent value="anexos" className="space-y-6 mt-6">
                    <AnimalAttachments 
                      animalId={id}
                      showUrlInput={true}
                      initialUrl={formData.url_fotografia}
                      onUrlChange={(url) => handleInputChange("url_fotografia", url)}
                      maxFiles={15}
                      maxFileSize={100}
                    />
                  </TabsContent>
                </Tabs>

                {/* Botões de Ação */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem(`editar_animal_draft_${id}`);
                      navigate(`/animal/${id}`);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveDraft}
                    >
                      💾 Salvar Rascunho
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Atualizar Animal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
            </div>
            
            {/* Sidebar - Resumo e Informações (1/4 da largura em desktop) */}
            <div className="xl:col-span-1">
              <div className="sticky top-8 space-y-6">
                
                {/* Resumo do Animal */}
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Edit className="h-5 w-5 text-emerald-600" />
                      Resumo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Nome e Espécie */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Nome:</span>
                        <span className="font-semibold text-gray-800">
                          {formData.nome || "Não definido"}
                        </span>
                      </div>
                      
                      {formData.especie && (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {especies.find(e => e.nome === formData.especie) ? 
                              getEspecieIcon(especies.find(e => e.nome === formData.especie)) : '🐾'}
                          </span>
                          <span className="text-sm text-gray-600">{formData.especie}</span>
                          {formData.raca && (
                            <span className="text-xs text-gray-500">({formData.raca})</span>
                          )}
                        </div>
                      )}
                      
                      {formData.sexo && (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {sexos.find(s => s.nome === formData.sexo) ? 
                              getSexoIcon(sexos.find(s => s.nome === formData.sexo)) : ''}
                          </span>
                          <span className="text-sm text-gray-600">{formData.sexo}</span>
                        </div>
                      )}
                    </div>

                    {/* Informações Básicas */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Processo:</span>
                        <span className="font-medium">{numeroProcesso}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Entrada:</span>
                        <span className="font-medium">
                          {formData.data_entrada ? 
                            new Date(formData.data_entrada).toLocaleDateString('pt-PT') : 
                            'Não definida'
                          }
                        </span>
                      </div>
                      
                      {formData.peso && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Peso:</span>
                          <span className="font-medium">{formData.peso} kg</span>
                        </div>
                      )}
                      
                      {formData.idade_estimada && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Idade:</span>
                          <span className="font-medium">{formData.idade_estimada} meses</span>
                        </div>
                      )}
                    </div>

                    {/* Status do Rascunho */}
                    {draftSaved && (
                      <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Rascunho salvo</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Progresso das Abas */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Progresso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    
                    {/* Aba Básico */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        formData.nome && formData.especie && formData.sexo ? 
                        'bg-emerald-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Informações Básicas</span>
                    </div>
                    
                    {/* Aba Adicionais */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        formData.voluntario_responsavel && formData.data_entrada ? 
                        'bg-emerald-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Informações Adicionais</span>
                    </div>
                    
                    {/* Aba Admissão */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        admissaoData.intake_origin || admissaoData.general_condition ? 
                        'bg-teal-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Ficha de Admissão</span>
                    </div>
                    
                    {/* Aba Anexos */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        formData.url_fotografia ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm">Anexos</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Dicas Rápidas */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-800">💡 Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-green-700">
                    <p>• Campos com * são obrigatórios</p>
                    <p>• Alterações são salvas automaticamente</p>
                    <p>• A ficha de admissão pode ser editada</p>
                    <p>• URLs do Google Drive são convertidos automaticamente</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default EditarAnimalCompleto;