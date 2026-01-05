import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { convertGoogleDriveUrl } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  PawPrint,
  Stethoscope,
  Activity,
  Heart,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Target,
  Star,
  Award,
  Shield,
  Megaphone,
  Clipboard,
  PlayCircle,
  XCircle,
  Package,
  Settings,
  Eye,
  RotateCcw
} from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import PageActionBar from "@/components/PageActionBar";
import { useAuth } from "@/contexts/AuthContext";
import { MockDataIndicator, MockDataCard, MockDataText } from "@/components/MockDataIndicator";
import { isMockData, hasMockData } from "@/lib/mockUtils";

interface Voluntario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  especialidade?: string;
  ativo: boolean;
  created_at: string;
}

interface EspecialidadeVoluntario {
  id: string;
  voluntario_id: string;
  especialidade_id: string;
  nivel_experiencia: string;
  certificado: boolean;
  data_certificacao?: string;
  observacoes?: string;
  ativo: boolean;
  especialidades_voluntarios_2025_12_21_22_00?: {
    codigo: string;
    nome: string;
    descricao: string;
    categoria: string;
    icone: string;
    cor: string;
  };
}

interface ResponsabilidadeAtiva {
  id: string;
  animal_id: string;
  data_inicio: string;
  animal_nome: string;
  animal_numero_processo: string;
  animal_especie: string;
  animal_estado: string;
  animal_url_fotografia?: string;
}

interface ResponsabilidadeHistorico {
  id: string;
  animal_id: string;
  data_inicio: string;
  data_fim: string;
  animal_nome: string;
  animal_numero_processo: string;
  animal_especie: string;
  animal_estado: string;
  animal_url_fotografia?: string;
}

interface Intervencao {
  id: string;
  animal_id: string;
  tipo_intervencao: string;
  data_intervencao: string;
  descricao: string;
  animal_nome: string;
  animal_numero_processo: string;
}

interface ParticipacaoMissao {
  id: string;
  missao_id: string;
  data_participacao: string;
  funcao: string;
  observacoes?: string;
  missao_titulo: string;
  missao_descricao: string;
  missao_data_inicio: string;
  missao_data_fim?: string;
  missao_status: string;
  missao_prioridade: string;
  missao_local_principal?: string;
  missao_orcamento_previsto?: number;
}

interface EquipamentoAtribuido {
  id: string;
  equipamento_id: string;
  data_atribuicao: string;
  data_devolucao_prevista?: string;
  data_devolucao_real?: string;
  estado: string;
  observacoes?: string;
  equipamento?: {
    id: string;
    numero_serie?: string;
    estado: string;
    localizacao?: string;
    valor_aquisicao?: number;
    tipo_equipamento?: {
      nome: string;
      categoria?: {
        nome: string;
        cor: string;
      };
    };
  };
}

const VoluntarioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [especialidades, setEspecialidades] = useState<EspecialidadeVoluntario[]>([]);
  const [responsabilidadesAtivas, setResponsabilidadesAtivas] = useState<ResponsabilidadeAtiva[]>([]);
  const [responsabilidadesHistorico, setResponsabilidadesHistorico] = useState<ResponsabilidadeHistorico[]>([]);
  const [intervencoes, setIntervencoes] = useState<Intervencao[]>([]);
  const [participacoesMissoes, setParticipacoesMissoes] = useState<ParticipacaoMissao[]>([]);
  const [equipamentosAtribuidos, setEquipamentosAtribuidos] = useState<EquipamentoAtribuido[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumo");

  useEffect(() => {
    if (id) {
      loadVoluntarioData();
    }
  }, [id]);

  const loadVoluntarioData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);

      // Buscar dados do voluntário
      const { data: voluntarioData, error: voluntarioError } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (voluntarioError) {
        console.error('Erro ao buscar voluntário:', voluntarioError);
        throw voluntarioError;
      }

      setVoluntario(voluntarioData);

      // Buscar responsabilidades ativas
      const { data: responsabilidadesAtivasData, error: responsabilidadesError } = await supabase
        .from('responsabilidades_voluntarios')
        .select(`
          *,
          animais!inner(
            id,
            nome,
            numero_processo,
            especie,
            estado,
            arquivado,
            url_fotografia
          )
        `)
        .eq('voluntario_id', id)
        .is('data_fim', null)
        .eq('ativo', true)
        .eq('animais.arquivado', false);

      if (responsabilidadesError) {
        console.error('Erro ao buscar responsabilidades ativas:', responsabilidadesError);
      } else {
        const responsabilidadesFormatadas = (responsabilidadesAtivasData || []).map(resp => ({
          id: resp.id,
          animal_id: resp.animal_id,
          data_inicio: resp.data_inicio,
          animal_nome: resp.animais.nome,
          animal_numero_processo: resp.animais.numero_processo,
          animal_especie: resp.animais.especie,
          animal_estado: resp.animais.estado,
          animal_url_fotografia: resp.animais.url_fotografia
        }));
        setResponsabilidadesAtivas(responsabilidadesFormatadas);
      }

      // Buscar histórico de responsabilidades
      const { data: responsabilidadesHistoricoData, error: historicoError } = await supabase
        .from('responsabilidades_voluntarios')
        .select(`
          *,
          animais!inner(
            id,
            nome,
            numero_processo,
            especie,
            estado,
            arquivado,
            url_fotografia
          )
        `)
        .eq('voluntario_id', id)
        .not('data_fim', 'is', null)
        .eq('ativo', true)
        .eq('animais.arquivado', false)
        .order('data_fim', { ascending: false });

      if (historicoError) {
        console.error('Erro ao buscar histórico de responsabilidades:', historicoError);
      } else {
        const historicoFormatado = (responsabilidadesHistoricoData || []).map(resp => ({
          id: resp.id,
          animal_id: resp.animal_id,
          data_inicio: resp.data_inicio,
          data_fim: resp.data_fim,
          animal_nome: resp.animais.nome,
          animal_numero_processo: resp.animais.numero_processo,
          animal_especie: resp.animais.especie,
          animal_estado: resp.animais.estado,
          animal_url_fotografia: resp.animais.url_fotografia
        }));
        setResponsabilidadesHistorico(historicoFormatado);
      }

      // Buscar intervenções - com tratamento de erro para tabela inexistente
      try {
        const { data: intervencoesData, error: intervencoesError } = await supabase
          .from('intervencoes_animais')
          .select(`
            *,
            animais!inner(nome, numero_processo, arquivado)
          `)
          .eq('voluntario_responsavel_id', id)
          .eq('animais.arquivado', false)
          .order('data_intervencao', { ascending: false })
          .limit(10);

        if (intervencoesError) {
          console.warn('Tabela de intervenções não encontrada ou erro na consulta:', intervencoesError);
          setIntervencoes([]); // Define array vazio se tabela não existir
        } else {
          const intervencoesFormatadas = (intervencoesData || []).map(int => ({
            id: int.id,
            animal_id: int.animal_id,
            tipo_intervencao: int.tipo_intervencao,
            data_intervencao: int.data_intervencao,
            descricao: int.descricao,
            animal_nome: int.animais.nome,
            animal_numero_processo: int.animais.numero_processo
          }));
          setIntervencoes(intervencoesFormatadas);
        }
      } catch (error) {
        console.warn('Erro ao buscar intervenções (tabela pode não existir):', error);
        setIntervencoes([]);
      }

      // Buscar participações em missões - tentativa de consulta real
      try {
        console.log('🔍 DEBUG - Buscando participações para voluntário ID:', id);
        
        // Primeiro tentar consulta direta sem embed
        const { data: participacoesData, error: participacoesError } = await supabase
          .from('participacoes_missoes_2025_12_29_07_00')
          .select('*')
          .eq('voluntario_id', id)
          .order('data_participacao', { ascending: false });
        
        console.log('🔍 DEBUG - Resultado da consulta de participações:', {
          data: participacoesData,
          error: participacoesError,
          count: participacoesData?.length || 0
        });

        if (participacoesError) {
          console.warn('Erro na consulta de participações:', participacoesError);
          throw participacoesError;
        }

        // Se temos participações, buscar dados das missões separadamente
        if (participacoesData && participacoesData.length > 0) {
          const missaoIds = participacoesData.map(p => p.missao_id);
          console.log('🔍 DEBUG - IDs das missões encontradas:', missaoIds);
          
          // Tentar buscar missões em ambas as tabelas possíveis
          let missoesData = null;
          let missoesError = null;
          
          // Primeiro tentar a tabela mais recente
          try {
            const { data: missoesData1, error: missoesError1 } = await supabase
              .from('missoes_2025_12_29_07_00')
              .select('*')
              .in('id', missaoIds);
            
            if (missoesError1) {
              console.log('🔍 DEBUG - Tabela missoes_2025_12_29_07_00 falhou, tentando missoes_2025_12_18_14_15');
              throw missoesError1;
            }
            
            missoesData = missoesData1;
            console.log('🔍 DEBUG - Missões encontradas na tabela 2025_12_29_07_00:', missoesData1?.length || 0);
            
          } catch (error1) {
            console.log('🔍 DEBUG - Tentando tabela missoes_2025_12_18_14_15...');
            
            const { data: missoesData2, error: missoesError2 } = await supabase
              .from('missoes_2025_12_18_14_15')
              .select('*')
              .in('id', missaoIds);
            
            missoesData = missoesData2;
            missoesError = missoesError2;
            console.log('🔍 DEBUG - Missões encontradas na tabela 2025_12_18_14_15:', missoesData2?.length || 0);
          }
          
          console.log('🔍 DEBUG - Resultado final da consulta de missões:', {
            data: missoesData,
            error: missoesError,
            count: missoesData?.length || 0
          });

          if (missoesError) {
            console.warn('Erro ao buscar dados das missões em ambas as tabelas:', missoesError);
            // Não lançar erro, continuar com dados parciais
          }

          // Combinar dados de participações com missões
          const participacoesCompletas = participacoesData.map(participacao => {
            const missao = missoesData?.find(m => m.id === participacao.missao_id);
            
            console.log('🔍 DEBUG - Processando participação:', {
              participacao_id: participacao.id,
              missao_id: participacao.missao_id,
              missao_encontrada: !!missao,
              missao_titulo: missao?.titulo
            });
            
            return {
              ...participacao,
              missao_titulo: missao?.titulo || `Missão ${participacao.missao_id.substring(0, 8)}...`,
              missao_descricao: missao?.descricao || 'Descrição não disponível',
              missao_data_inicio: missao?.data_inicio || participacao.data_participacao,
              missao_data_fim: missao?.data_fim || null,
              missao_status: missao?.status || 'ativo',
              missao_prioridade: missao?.prioridade || 'media',
              missao_local_principal: missao?.local_principal || 'Local não especificado',
              missao_orcamento_previsto: missao?.orcamento_previsto || 0
            };
          });

          setParticipacoesMissoes(participacoesCompletas);
          console.log('DEBUG - Participações reais carregadas:', participacoesCompletas.length, 'registos');
        } else {
          console.log('DEBUG - Nenhuma participação real encontrada');
          console.log('DEBUG - participacoesData:', participacoesData);
          console.log('DEBUG - participacoesError:', participacoesError);
          // NÃO usar dados mock, deixar vazio
          setParticipacoesMissoes([]);
          console.log('DEBUG - Lista de participações definida como vazia (sem dados mock)');
          // Removido: dados mock não são mais usados
        }

      } catch (error) {
        console.error('Erro ao buscar participações:', error);
        // NÃO usar dados mock em caso de erro, deixar vazio
        setParticipacoesMissoes([]);
        console.log('DEBUG - Erro na consulta, lista de participações definida como vazia');
      }

      // Buscar equipamentos atribuídos - com logs de debug
      try {
        console.log('DEBUG - Buscando equipamentos para voluntário ID:', id);
        
        const { data: equipamentosData, error: equipamentosError } = await supabase
          .from('atribuicoes_equipamentos_2025_12_13_01_00')
          .select(`
            *,
            equipamentos_2025_12_13_01_00(
              id,
              numero_serie,
              estado,
              localizacao,
              valor_aquisicao,
              ativo,
              tipos_equipamentos_2025_12_13_01_00(
                nome,
                categorias_equipamentos_2025_12_13_01_00(nome, cor)
              )
            )
          `)
          .eq('voluntario_id', id)
          .eq('ativo', true)
          .order('data_atribuicao', { ascending: false });

        if (equipamentosError) {
          console.error('Erro ao buscar equipamentos atribuídos:', equipamentosError);
          setEquipamentosAtribuidos([]);
        } else {
          console.log('DEBUG - Equipamentos encontrados:', equipamentosData?.length || 0);
          console.log('DEBUG - Dados dos equipamentos:', equipamentosData);
          
          // Processar todos os equipamentos encontrados (filtro já aplicado na query)
          const equipamentosAtivos = equipamentosData || [];
          console.log('DEBUG - Equipamentos após filtro:', equipamentosAtivos.length);
          
          const equipamentosFormatados = equipamentosAtivos.map(eq => ({
            id: eq.id,
            equipamento_id: eq.equipamento_id,
            data_atribuicao: eq.data_atribuicao,
            data_devolucao_prevista: eq.data_devolucao_prevista,
            data_devolucao_real: eq.data_devolucao_real,
            estado: eq.estado,
            observacoes: eq.observacoes,
            equipamento: {
              id: eq.equipamentos_2025_12_13_01_00?.id,
              numero_serie: eq.equipamentos_2025_12_13_01_00?.numero_serie,
              estado: eq.equipamentos_2025_12_13_01_00?.estado,
              localizacao: eq.equipamentos_2025_12_13_01_00?.localizacao,
              valor_aquisicao: eq.equipamentos_2025_12_13_01_00?.valor_aquisicao,
              tipo_equipamento: {
                nome: eq.equipamentos_2025_12_13_01_00?.tipos_equipamentos_2025_12_13_01_00?.nome,
                categoria: eq.equipamentos_2025_12_13_01_00?.tipos_equipamentos_2025_12_13_01_00?.categorias_equipamentos_2025_12_13_01_00
              }
            }
          }));
          
          setEquipamentosAtribuidos(equipamentosFormatados);
          console.log('DEBUG - Equipamentos formatados:', equipamentosFormatados.length, 'equipamentos');
        }
      } catch (error) {
        console.error('Erro ao buscar equipamentos atribuídos:', error);
        setEquipamentosAtribuidos([]);
      }

      // Buscar especialidades do voluntário
      const { data: especialidadesData, error: especialidadesError } = await supabase
        .from('voluntario_especialidades_2025_12_21_22_00')
        .select(`
          *,
          especialidades_voluntarios_2025_12_21_22_00(*)
        `)
        .eq('voluntario_id', id)
        .eq('ativo', true);

      if (especialidadesError) {
        console.error('Erro ao buscar especialidades:', especialidadesError);
      } else {
        setEspecialidades(especialidadesData || []);
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados do voluntário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const cores = {
      'disponivel': 'bg-green-100 text-green-800',
      'em_uso': 'bg-blue-100 text-blue-800',
      'manutencao': 'bg-yellow-100 text-yellow-800',
      'danificado': 'bg-red-100 text-red-800',
      'perdido': 'bg-gray-100 text-gray-800',
      'descartado': 'bg-black text-white'
    };
    return cores[estado as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  const getAtribuicaoEstadoBadge = (estado: string) => {
    const cores = {
      'ativo': 'bg-green-100 text-green-800',
      'devolvido': 'bg-blue-100 text-blue-800',
      'perdido': 'bg-red-100 text-red-800',
      'danificado': 'bg-orange-100 text-orange-800'
    };
    return cores[estado as keyof typeof cores] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados do voluntário...</p>
            </div>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Voluntário não encontrado</h2>
            <p className="text-gray-600 mb-4">O voluntário solicitado não foi encontrado.</p>
            <Link to="/gestao-voluntarios">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Lista
              </Button>
            </Link>
          </div>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <EnhancedHeader />
      
      <PageActionBar 
        actions={[
          {
            label: "Voltar",
            icon: ArrowLeft,
            variant: "outline",
            onClick: () => window.history.back()
          },
          {
            label: "Editar Voluntário",
            icon: User,
            variant: "default",
            onClick: () => window.location.href = `#/editar-voluntario/${voluntario.id}`
          }
        ]}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header do Voluntário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-full p-4">
              <User className="h-12 w-12 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{voluntario.nome}</h1>
                <Badge className={voluntario.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {voluntario.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{voluntario.email}</span>
                </div>
                {voluntario.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{voluntario.telefone}</span>
                  </div>
                )}
                {voluntario.morada && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{voluntario.morada}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Animais Ativos</p>
                <p className="text-3xl font-bold text-orange-600">{responsabilidadesAtivas.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Histórico</p>
                <p className="text-3xl font-bold text-purple-600">{responsabilidadesHistorico.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Intervenções</p>
                <p className="text-3xl font-bold text-green-600">{intervencoes.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Missões</p>
                <p className="text-3xl font-bold text-indigo-600">{participacoesMissoes.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipamentos</p>
                <p className="text-3xl font-bold text-blue-600">{equipamentosAtribuidos.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sistema de Abas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5 p-1 bg-gray-100 rounded-t-xl">
              <TabsTrigger value="resumo" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Resumo</span>
              </TabsTrigger>
              <TabsTrigger value="animais" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Animais</span>
              </TabsTrigger>
              <TabsTrigger value="intervencoes" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span className="hidden sm:inline">Intervenções</span>
              </TabsTrigger>
              <TabsTrigger value="missoes" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Missões</span>
              </TabsTrigger>
              <TabsTrigger value="equipamentos" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Equipamentos</span>
              </TabsTrigger>
            </TabsList>

            {/* Aba Resumo */}
            <TabsContent value="resumo" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Especialidades */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Especialidades
                  </h3>
                  {especialidades.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma especialidade registada</p>
                  ) : (
                    <div className="space-y-3">
                      {especialidades.map((esp) => (
                        <div key={esp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: esp.especialidades_voluntarios_2025_12_21_22_00?.cor || '#6B7280' }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {esp.especialidades_voluntarios_2025_12_21_22_00?.nome}
                              </p>
                              <p className="text-sm text-gray-600">
                                Nível: {esp.nivel_experiencia}
                              </p>
                            </div>
                          </div>
                          {esp.certificado && (
                            <Badge className="bg-green-100 text-green-800">
                              <Award className="h-3 w-3 mr-1" />
                              Certificado
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resumo de Atividades */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Resumo de Atividades
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Animais sob responsabilidade</span>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">
                        {responsabilidadesAtivas.length} ativos
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Intervenções realizadas</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {intervencoes.length} registos
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-indigo-600" />
                        <span className="font-medium">Participações em missões</span>
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-800">
                        {participacoesMissoes.length} missões
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Equipamentos atribuídos</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {equipamentosAtribuidos.length} equipamentos
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba Animais */}
            <TabsContent value="animais" className="p-6 space-y-6">
              {/* Animais Sob Responsabilidade Atual */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Heart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Animais Sob Responsabilidade</h2>
                    <p className="text-sm text-gray-600">Animais atualmente sob os cuidados deste voluntário</p>
                  </div>
                </div>
                
                {responsabilidadesAtivas.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum animal sob responsabilidade atual</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {responsabilidadesAtivas.map((resp) => (
                      <div key={resp.id} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="relative">
                            {resp.animal_url_fotografia ? (
                              <img 
                                src={convertGoogleDriveUrl(resp.animal_url_fotografia)} 
                                alt={resp.animal_nome}
                                className="w-12 h-12 rounded-full object-cover border-2 border-orange-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center border-2 border-orange-300 ${resp.animal_url_fotografia ? 'hidden' : ''}`}>
                              <span className="text-orange-700 font-semibold text-lg">
                                {resp.animal_nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{resp.animal_nome}</h3>
                            <p className="text-sm text-gray-600">#{resp.animal_numero_processo}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Espécie:</span>
                            <Badge variant="outline">{resp.animal_especie}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Estado:</span>
                            <Badge className="bg-blue-100 text-blue-800">{resp.animal_estado}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Desde:</span>
                            <span className="text-sm font-medium">{new Date(resp.data_inicio).toLocaleDateString('pt-PT')}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-orange-200">
                          <Link to={`/animal/${resp.animal_id}`}>
                            <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Animal
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Histórico de Responsabilidades */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Histórico de Responsabilidades</h2>
                    <p className="text-sm text-gray-600">Todos os animais que estiveram sob os cuidados deste voluntário</p>
                  </div>
                </div>
                
                {responsabilidadesHistorico.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum histórico de responsabilidades</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {responsabilidadesHistorico.map((resp) => (
                      <div key={resp.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {resp.animal_url_fotografia ? (
                                <img 
                                  src={convertGoogleDriveUrl(resp.animal_url_fotografia)} 
                                  alt={resp.animal_nome}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center border-2 border-purple-300 ${resp.animal_url_fotografia ? 'hidden' : ''}`}>
                                <span className="text-purple-700 font-semibold">
                                  {resp.animal_nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{resp.animal_nome}</h3>
                              <p className="text-sm text-gray-600">#{resp.animal_numero_processo} • {resp.animal_especie}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(resp.data_inicio).toLocaleDateString('pt-PT')} - {new Date(resp.data_fim).toLocaleDateString('pt-PT')}
                            </p>
                            <p className="text-xs text-gray-600">
                              {Math.ceil((new Date(resp.data_fim).getTime() - new Date(resp.data_inicio).getTime()) / (1000 * 60 * 60 * 24))} dias
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Aba Intervenções */}
            <TabsContent value="intervencoes" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Intervenções Acompanhadas</h2>
                  <p className="text-sm text-gray-600">
                    Intervenções médicas onde este voluntário esteve envolvido (transporte, acompanhamento, coordenação)
                  </p>
                </div>
              </div>
              
              {intervencoes.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma intervenção registada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {intervencoes.map((intervencao) => (
                    <div key={intervencao.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{intervencao.tipo_intervencao}</h3>
                          <p className="text-sm text-gray-600">
                            {intervencao.animal_nome} (#{intervencao.animal_numero_processo})
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT')}
                        </Badge>
                      </div>
                      
                      {intervencao.descricao && (
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                          {intervencao.descricao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Aba Missões */}
            <TabsContent value="missoes" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">Participações em Missões</h2>
                    {hasMockData(participacoesMissoes) && (
                      <Badge variant="destructive" className="mock-data-badge">
                        DADOS DE TESTE
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Histórico de participações em missões e eventos da associação</p>
                </div>
              </div>
              
              {participacoesMissoes.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma participação em missões registada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {participacoesMissoes.map((participacao) => (
                    <MockDataCard 
                      key={participacao.id} 
                      data={participacao}
                      className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <MockDataText data={participacao}>
                            <h3 className="font-semibold text-gray-900">{participacao.missao_titulo}</h3>
                          </MockDataText>
                          <MockDataText data={participacao}>
                            <p className="text-sm text-gray-600 mt-1">{participacao.missao_descricao}</p>
                          </MockDataText>
                        </div>
                        <div className="text-right ml-4">
                          <MockDataIndicator data={participacao} variant="subtle">
                            <Badge className="bg-indigo-100 text-indigo-800 mb-2">
                              {participacao.funcao}
                            </Badge>
                          </MockDataIndicator>
                          <p className="text-xs text-gray-600">
                            {new Date(participacao.data_participacao).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className="font-medium">{participacao.missao_status}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Prioridade:</span>
                          <p className="font-medium">{participacao.missao_prioridade}</p>
                        </div>
                        {participacao.missao_local_principal && (
                          <div>
                            <span className="text-gray-600">Local:</span>
                            <p className="font-medium">{participacao.missao_local_principal}</p>
                          </div>
                        )}
                        {participacao.missao_orcamento_previsto && (
                          <div>
                            <span className="text-gray-600">Orçamento:</span>
                            <p className="font-medium">€{participacao.missao_orcamento_previsto}</p>
                          </div>
                        )}
                      </div>
                    </MockDataCard>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Aba Equipamentos */}
            <TabsContent value="equipamentos" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Equipamentos Atribuídos</h2>
                  <p className="text-sm text-gray-600">Equipamentos atualmente sob responsabilidade deste voluntário</p>
                </div>
              </div>
              
              {equipamentosAtribuidos.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum equipamento atribuído</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equipamentosAtribuidos.map((atribuicao) => (
                    <div key={atribuicao.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-200 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {atribuicao.equipamento?.tipo_equipamento?.nome || 'Equipamento'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {atribuicao.equipamento?.numero_serie || 'Sem série'}
                            </p>
                          </div>
                        </div>
                        
                        <Badge className={getAtribuicaoEstadoBadge(atribuicao.estado)}>
                          {atribuicao.estado}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estado do Equipamento:</span>
                          <Badge className={getEstadoBadge(atribuicao.equipamento?.estado || '')}>
                            {atribuicao.equipamento?.estado}
                          </Badge>
                        </div>
                        
                        {atribuicao.equipamento?.localizacao && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Localização:</span>
                            <span className="text-sm font-medium">{atribuicao.equipamento.localizacao}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Atribuído em:</span>
                          <span className="text-sm font-medium">
                            {new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}
                          </span>
                        </div>
                        
                        {atribuicao.data_devolucao_prevista && !atribuicao.data_devolucao_real && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Devolução prevista:</span>
                            <span className="text-sm font-medium text-orange-600">
                              {new Date(atribuicao.data_devolucao_prevista).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        )}
                        
                        {atribuicao.equipamento?.tipo_equipamento?.categoria && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Categoria:</span>
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: atribuicao.equipamento.tipo_equipamento.categoria.cor + '20', 
                                color: atribuicao.equipamento.tipo_equipamento.categoria.cor 
                              }}
                            >
                              {atribuicao.equipamento.tipo_equipamento.categoria.nome}
                            </Badge>
                          </div>
                        )}
                        
                        {atribuicao.equipamento?.valor_aquisicao && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Valor:</span>
                            <span className="text-sm font-medium">
                              €{atribuicao.equipamento.valor_aquisicao.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {atribuicao.observacoes && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-gray-600 bg-white p-2 rounded">
                            <strong>Observações:</strong> {atribuicao.observacoes}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <Link to={`/equipamentos/inventario`}>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver no Inventário
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default VoluntarioDetail;