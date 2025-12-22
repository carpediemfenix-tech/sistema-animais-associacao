import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  GraduationCap,
  Plus, 
  Calendar,
  Users,
  Award,
  TrendingUp,
  BookOpen,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  UserPlus,
  Trash2,
  Star,
  Award,
  FileText,
  GraduationCap as GradIcon,
  History,
  Edit,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import { 
  TipoFormacao, 
  AcaoFormacao, 
  ParticipacaoFormacao,
  EstatisticasFormacao,
  StatusAcaoFormacao,
  getTipoFormacaoIcon,
  getTipoFormacaoCor,
  STATUS_ACAO_LABELS,
  getStatusColor
} from "@/types/formacao";

const SistemaFormacao = () => {
  const [tiposFormacao, setTiposFormacao] = useState<TipoFormacao[]>([]);
  const [acoesFormacao, setAcoesFormacao] = useState<AcaoFormacao[]>([]);
  const [participacoes, setParticipacoes] = useState<ParticipacaoFormacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasFormacao | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusAcaoFormacao | 'todos'>('todos');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  
  // Estados para modal de nova ação
  const [novaAcaoDialogOpen, setNovaAcaoDialogOpen] = useState(false);
  const [novaAcaoForm, setNovaAcaoForm] = useState({
    codigo_acao: '',
    tipo_formacao_id: '',
    nome_acao: '',
    descricao: '',
    formador: '',
    local_formacao: '',
    data_inicio: '',
    data_fim: '',
    carga_horaria_real: 0,
    vagas_maximas: 20,
    preco: 0,
    status: 'planeada' as StatusAcaoFormacao,
    observacoes: ''
  });
  const [submittingNovaAcao, setSubmittingNovaAcao] = useState(false);
  
  // Estados para modais de ações
  const [detalhesAcaoOpen, setDetalhesAcaoOpen] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState<AcaoFormacao | null>(null);
  const [editarAcaoOpen, setEditarAcaoOpen] = useState(false);
  const [participantesAcaoOpen, setParticipantesAcaoOpen] = useState(false);
  const [editarAcaoForm, setEditarAcaoForm] = useState<any>({});
  const [submittingEdicao, setSubmittingEdicao] = useState(false);
  
  // Estados para gestão de participantes
  const [voluntariosDisponiveis, setVoluntariosDisponiveis] = useState<any[]>([]);
  const [participantesAtuais, setParticipantesAtuais] = useState<any[]>([]);
  const [historicoParticipantes, setHistoricoParticipantes] = useState<any[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [submittingParticipante, setSubmittingParticipante] = useState(false);
  const [searchVoluntario, setSearchVoluntario] = useState('');
  
  // Estados para edição de tipos de formação
  const [editarTipoOpen, setEditarTipoOpen] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoFormacao | null>(null);
  const [editarTipoForm, setEditarTipoForm] = useState<any>({});
  const [submittingEdicaoTipo, setSubmittingEdicaoTipo] = useState(false);
  
  // Estados para avaliação de participantes
  const [avaliacaoOpen, setAvaliacaoOpen] = useState(false);
  const [participanteAvaliacao, setParticipanteAvaliacao] = useState<any>(null);
  const [avaliacaoForm, setAvaliacaoForm] = useState({
    nota_final: '',
    resultado: 'aprovado',
    relatorio_desempenho: ''
  });
  const [submittingAvaliacao, setSubmittingAvaliacao] = useState(false);
  
  // Estados para modal de novo tipo de formação
  const [novoTipoDialogOpen, setNovoTipoDialogOpen] = useState(false);
  const [novoTipoForm, setNovoTipoForm] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    nivel_ordem: 6,
    carga_horaria_minima: 0,
    competencias: [] as string[],
    pre_requisitos: [] as string[],
    cor: '#3B82F6',
    icone: '🎓'
  });
  const [submittingNovoTipo, setSubmittingNovoTipo] = useState(false);
  const [novaCompetencia, setNovaCompetencia] = useState('');

  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Verificar permissões
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem aceder ao sistema de formação
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/voluntarios">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar tipos de formação - CONSULTA SIMPLIFICADA
      console.log('🔍 Iniciando carregamento de tipos de formação...');
      
      let tiposData: any[] = [];
      
      try {
        const { data: tiposDataResponse, error: tiposError } = await supabase
          .from('tipos_formacao')
          .select(`
            id,
            codigo,
            nome,
            descricao,
            nivel_ordem,
            carga_horaria_minima,
            competencias,
            pre_requisitos,
            cor,
            icone,
            ativo
          `)
          .order('nivel_ordem');

        console.log('📊 Resposta da consulta tipos:', {
          data: tiposDataResponse,
          error: tiposError,
          count: tiposDataResponse?.length || 0
        });
        
        if (tiposError) {
          console.error('❌ Erro ao carregar tipos:', tiposError);
          throw tiposError;
        }

        if (!tiposDataResponse || tiposDataResponse.length === 0) {
          console.warn('⚠️ Nenhum tipo de formação encontrado!');
          toast({
            title: "Aviso",
            description: "Nenhum tipo de formação encontrado na base de dados",
            variant: "destructive",
          });
        } else {
          console.log(`✅ ${tiposDataResponse.length} tipos de formação carregados com sucesso!`);
          tiposData = tiposDataResponse; // Atribuir à variável externa
        }
      } catch (error) {
        console.error('🚫 Erro crítico ao carregar tipos:', error);
        throw error;
      }

      // Carregar ações de formação com tipos e contadores
      const { data: acoesData, error: acoesError } = await supabase
        .from('acoes_formacao')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (acoesError) throw acoesError;

      // Carregar contadores de participantes para cada ação
      const acoesComContadores = await Promise.all(
        (acoesData || []).map(async (acao) => {
          const { count } = await supabase
            .from('participacoes_formacao')
            .select('*', { count: 'exact', head: true })
            .eq('acao_formacao_id', acao.id)
            .eq('status', 'inscrito');
          
          return {
            ...acao,
            vagas_ocupadas: count || 0
          };
        })
      );

      setAcoesFormacao(acoesComContadores);

      // Carregar participações recentes
      const { data: participacoesData, error: participacoesError } = await supabase
        .from('participacoes_formacao')
        .select(`
          *,
          voluntario:voluntarios(nome, email),
          acao_formacao:acoes_formacao(codigo_acao, nome_acao)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (participacoesError) throw participacoesError;

      // Processar tipos de formação (converter JSONB para arrays)
      const tiposProcessados = (tiposData || []).map(tipo => ({
        ...tipo,
        competencias: Array.isArray(tipo.competencias) ? tipo.competencias : 
                     (typeof tipo.competencias === 'string' ? JSON.parse(tipo.competencias) : []),
        pre_requisitos: Array.isArray(tipo.pre_requisitos) ? tipo.pre_requisitos : 
                       (typeof tipo.pre_requisitos === 'string' ? JSON.parse(tipo.pre_requisitos) : [])
      }));

      console.log('Tipos de formação carregados:', tiposProcessados);
      
      setTiposFormacao(tiposProcessados);
      setParticipacoes(participacoesData || []);

      // Calcular estatísticas
      calcularEstatisticas(tiposProcessados, acoesData || [], participacoesData || []);

    } catch (error: any) {
      console.error('🚫 Erro ao carregar dados de formação:', error);
      
      // Fallback: usar dados hardcoded se não conseguir carregar
      const tiposFallback = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          codigo: 'FORMA_BASE',
          nome: 'FORMA BASE',
          descricao: 'Formação básica obrigatória',
          nivel_ordem: 1,
          carga_horaria_minima: 40,
          competencias: ['Cuidados básicos', 'Primeiros socorros'],
          pre_requisitos: [],
          cor: '#10B981',
          icone: '🌱',
          ativo: true
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          codigo: 'FORMA_N1',
          nome: 'Formação Nível 1',
          descricao: 'Primeiro nível de especialização',
          nivel_ordem: 2,
          carga_horaria_minima: 60,
          competencias: ['Técnicas de resgate', 'Trabalho em equipa'],
          pre_requisitos: [],
          cor: '#3B82F6',
          icone: '🛡️',
          ativo: true
        }
      ];
      
      console.log('🔄 Usando dados fallback:', tiposFallback);
      setTiposFormacao(tiposFallback);
      
      toast({
        title: "Aviso",
        description: "Usando dados de exemplo. Verifique a conexão com a base de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (tipos: TipoFormacao[], acoes: AcaoFormacao[], participacoes: ParticipacaoFormacao[]) => {
    const stats: EstatisticasFormacao = {
      total_tipos_formacao: tipos.length,
      total_acoes_formacao: acoes.length,
      total_participacoes: participacoes.length,
      total_certificados_emitidos: participacoes.filter(p => p.certificado_emitido).length,
      
      acoes_por_status: {
        planeada: acoes.filter(a => a.status === 'planeada').length,
        inscricoes_abertas: acoes.filter(a => a.status === 'inscricoes_abertas').length,
        em_curso: acoes.filter(a => a.status === 'em_curso').length,
        concluida: acoes.filter(a => a.status === 'concluida').length,
        cancelada: acoes.filter(a => a.status === 'cancelada').length,
      },
      
      participacoes_por_status: {
        inscrito: participacoes.filter(p => p.status_participacao === 'inscrito').length,
        confirmado: participacoes.filter(p => p.status_participacao === 'confirmado').length,
        presente: participacoes.filter(p => p.status_participacao === 'presente').length,
        ausente: participacoes.filter(p => p.status_participacao === 'ausente').length,
        aprovado: participacoes.filter(p => p.status_participacao === 'aprovado').length,
        reprovado: participacoes.filter(p => p.status_participacao === 'reprovado').length,
        desistiu: participacoes.filter(p => p.status_participacao === 'desistiu').length,
      },
      
      participacoes_por_tipo: tipos.map(tipo => {
        const participacoesTipo = participacoes.filter(p => 
          acoes.find(a => a.id === p.acao_formacao_id)?.tipo_formacao_id === tipo.id
        );
        const aprovados = participacoesTipo.filter(p => p.status_participacao === 'aprovado').length;
        
        return {
          tipo_codigo: tipo.codigo,
          tipo_nome: tipo.nome,
          total_participacoes: participacoesTipo.length,
          total_aprovados: aprovados,
          taxa_aprovacao: participacoesTipo.length > 0 ? Math.round((aprovados / participacoesTipo.length) * 100) : 0
        };
      }),
      
      participacoes_por_mes: [] // Implementar se necessário
    };

    setEstatisticas(stats);
  };

  // Filtrar ações
  const acoesFiltradas = acoesFormacao.filter(acao => {
    const matchTipo = filtroTipo === 'todos' || acao.tipo_formacao_id === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || acao.status === filtroStatus;
    const matchPesquisa = !termoPesquisa || 
      acao.nome_acao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      acao.codigo_acao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      acao.formador?.toLowerCase().includes(termoPesquisa.toLowerCase());
    
    return matchTipo && matchStatus && matchPesquisa;
  });

  // Funções para modal de nova ação
  const resetNovaAcaoForm = () => {
    setNovaAcaoForm({
      codigo_acao: '',
      tipo_formacao_id: '',
      nome_acao: '',
      descricao: '',
      formador: '',
      local_formacao: '',
      data_inicio: '',
      data_fim: '',
      carga_horaria_real: 0,
      vagas_maximas: 20,
      preco: 0,
      status: 'planeada',
      observacoes: ''
    });
  };

  const handleNovaAcaoSubmit = async () => {
    try {
      setSubmittingNovaAcao(true);

      // Validação básica
      if (!novaAcaoForm.codigo_acao || !novaAcaoForm.tipo_formacao_id || !novaAcaoForm.nome_acao) {
        toast({
          title: "Erro",
          description: "Por favor, preencha os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // Inserir nova ação
      // Validar UUID do tipo de formação
      if (!novaAcaoForm.tipo_formacao_id || novaAcaoForm.tipo_formacao_id.length < 30) {
        throw new Error('Tipo de formação inválido. Selecione um tipo válido.');
      }

      console.log('📊 Dados para inserção:', {
        codigo_acao: novaAcaoForm.codigo_acao,
        tipo_formacao_id: novaAcaoForm.tipo_formacao_id,
        nome_acao: novaAcaoForm.nome_acao
      });

      const { data, error } = await supabase
        .from('acoes_formacao')
        .insert({
          codigo_acao: novaAcaoForm.codigo_acao,
          tipo_formacao_id: novaAcaoForm.tipo_formacao_id,
          nome_acao: novaAcaoForm.nome_acao,
          descricao: novaAcaoForm.descricao || null,
          formador: novaAcaoForm.formador || null,
          local_formacao: novaAcaoForm.local_formacao || null,
          data_inicio: novaAcaoForm.data_inicio || null,
          data_fim: novaAcaoForm.data_fim || null,
          carga_horaria_real: parseInt(novaAcaoForm.carga_horaria_real) || 0,
          vagas_maximas: parseInt(novaAcaoForm.vagas_maximas) || 0,
          preco: parseFloat(novaAcaoForm.preco) || 0,
          status: novaAcaoForm.status || 'planeada',
          observacoes: novaAcaoForm.observacoes || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nova ação de formação criada com sucesso",
      });

      // Fechar modal e recarregar dados
      setNovaAcaoDialogOpen(false);
      resetNovaAcaoForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao criar nova ação:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar nova ação de formação",
        variant: "destructive",
      });
    } finally {
      setSubmittingNovaAcao(false);
    }
  };

  const handleNovaAcaoInputChange = (field: string, value: any) => {
    setNovaAcaoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para modal de novo tipo de formação
  const resetNovoTipoForm = () => {
    setNovoTipoForm({
      codigo: '',
      nome: '',
      descricao: '',
      nivel_ordem: 6,
      carga_horaria_minima: 0,
      competencias: [],
      pre_requisitos: [],
      cor: '#3B82F6',
      icone: '🎓'
    });
    setNovaCompetencia('');
  };

  const handleNovoTipoSubmit = async () => {
    try {
      setSubmittingNovoTipo(true);

      // Validação básica
      if (!novoTipoForm.codigo || !novoTipoForm.nome) {
        toast({
          title: "Erro",
          description: "Por favor, preencha o código e nome do tipo",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o código já existe
      const { data: existingTipo } = await supabase
        .from('tipos_formacao')
        .select('id')
        .eq('codigo', novoTipoForm.codigo)
        .single();

      if (existingTipo) {
        toast({
          title: "Erro",
          description: "Já existe um tipo de formação com este código",
          variant: "destructive",
        });
        return;
      }

      // Inserir novo tipo
      const { data, error } = await supabase
        .from('tipos_formacao')
        .insert([{
          codigo: novoTipoForm.codigo,
          nome: novoTipoForm.nome,
          descricao: novoTipoForm.descricao || null,
          nivel_ordem: novoTipoForm.nivel_ordem,
          carga_horaria_minima: novoTipoForm.carga_horaria_minima,
          competencias: JSON.stringify(novoTipoForm.competencias),
          pre_requisitos: JSON.stringify(novoTipoForm.pre_requisitos),
          cor: novoTipoForm.cor,
          icone: novoTipoForm.icone,
          ativo: true
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Novo tipo de formação criado com sucesso",
      });

      // Fechar modal e recarregar dados
      setNovoTipoDialogOpen(false);
      resetNovoTipoForm();
      loadData();

    } catch (error: any) {
      console.error('Erro ao criar novo tipo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar novo tipo de formação",
        variant: "destructive",
      });
    } finally {
      setSubmittingNovoTipo(false);
    }
  };

  const handleNovoTipoInputChange = (field: string, value: any) => {
    setNovoTipoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const adicionarCompetencia = () => {
    if (novaCompetencia.trim()) {
      setNovoTipoForm(prev => ({
        ...prev,
        competencias: [...prev.competencias, novaCompetencia.trim()]
      }));
      setNovaCompetencia('');
    }
  };

  const removerCompetencia = (index: number) => {
    setNovoTipoForm(prev => ({
      ...prev,
      competencias: prev.competencias.filter((_, i) => i !== index)
    }));
  };

  const togglePreRequisito = (tipoId: string) => {
    setNovoTipoForm(prev => ({
      ...prev,
      pre_requisitos: prev.pre_requisitos.includes(tipoId)
        ? prev.pre_requisitos.filter(id => id !== tipoId)
        : [...prev.pre_requisitos, tipoId]
    }));
  };

  // Funções para ações das formações
  const handleVerAcao = (acao: AcaoFormacao) => {
    console.log('👁️ [AÇÃO] Ver detalhes da ação:', acao.nome_acao);
    setAcaoSelecionada(acao);
    setDetalhesAcaoOpen(true);
  };

  const handleEditarAcao = (acao: AcaoFormacao) => {
    console.log('✏️ [AÇÃO] Editar ação:', acao.nome_acao);
    setAcaoSelecionada(acao);
    setEditarAcaoForm({
      codigo_acao: acao.codigo_acao,
      tipo_formacao_id: acao.tipo_formacao_id,
      nome_acao: acao.nome_acao,
      descricao: acao.descricao || '',
      formador: acao.formador || '',
      local_formacao: acao.local_formacao || '',
      data_inicio: acao.data_inicio || '',
      data_fim: acao.data_fim || '',
      carga_horaria_real: acao.carga_horaria_real || 0,
      vagas_maximas: acao.vagas_maximas || 20,
      preco: acao.preco || 0,
      status: acao.status || 'planeada',
      observacoes: acao.observacoes || ''
    });
    setEditarAcaoOpen(true);
  };

  const handleGerirParticipantes = async (acao: AcaoFormacao) => {
    console.log('👥 [AÇÃO] Gerir participantes da ação:', acao.nome_acao);
    setAcaoSelecionada(acao);
    await loadParticipantesData(acao.id);
    setParticipantesAcaoOpen(true);
  };

  const handleEliminarAcao = async (acao: AcaoFormacao) => {
    try {
      console.log('🗑️ [AÇÃO] Eliminar ação:', acao.nome_acao);
      
      // Verificar se a ação tem participantes
      const { data: participantes, error: checkError } = await supabase
        .from('participacoes_formacao')
        .select('id')
        .eq('acao_formacao_id', acao.id)
        .eq('status', 'inscrito')
        .limit(1);

      if (checkError) {
        console.error('Erro ao verificar participantes:', checkError);
      }

      // Se tem participantes, bloquear eliminação
      if (participantes && participantes.length > 0) {
        toast({
          title: "❌ Não é possível eliminar",
          description: `A ação "${acao.nome_acao}" tem participantes inscritos. Remova todos os participantes antes de eliminar a ação.`,
          variant: "destructive",
        });
        return;
      }

      // Se não tem participantes, pode eliminar
      const { error } = await supabase
        .from('acoes_formacao')
        .delete()
        .eq('id', acao.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: `Ação "${acao.nome_acao}" eliminada com sucesso`,
      });

      // Recarregar dados
      loadData();

    } catch (error: any) {
      console.error('🚨 [ERRO] Erro ao eliminar ação:', error);
      
      // Tratar especificamente erro de constraint de integridade referencial
      if (error.code === '23503') {
        toast({
          title: "❌ Não é possível eliminar",
          description: `A ação "${acao.nome_acao}" tem registros associados. Remova todos os participantes antes de eliminar.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "🚨 Erro",
          description: error.message || "Erro inesperado ao eliminar ação",
          variant: "destructive",
        });
      }
    }
  };

  // Funções para gestão de tipos de formação
  const handleEditarTipo = (tipo: TipoFormacao) => {
    console.log('✏️ [TIPO] Editar tipo:', tipo.nome);
    setTipoSelecionado(tipo);
    setEditarTipoForm({
      codigo: tipo.codigo,
      nome: tipo.nome,
      descricao: tipo.descricao || '',
      nivel_ordem: tipo.nivel_ordem || 1,
      carga_horaria_minima: tipo.carga_horaria_minima || 0,
      competencias: tipo.competencias || [],
      pre_requisitos: tipo.pre_requisitos || [],
      cor: tipo.cor || '#3B82F6',
      icone: tipo.icone || '🎓',
      ativo: tipo.ativo !== false
    });
    setEditarTipoOpen(true);
  };

  const handleSalvarEdicaoTipo = async () => {
    if (!tipoSelecionado) return;

    try {
      setSubmittingEdicaoTipo(true);

      const { error } = await supabase
        .from('tipos_formacao')
        .update({
          codigo: editarTipoForm.codigo,
          nome: editarTipoForm.nome,
          descricao: editarTipoForm.descricao || null,
          nivel_ordem: parseInt(editarTipoForm.nivel_ordem) || 1,
          carga_horaria_minima: parseInt(editarTipoForm.carga_horaria_minima) || 0,
          competencias: JSON.stringify(editarTipoForm.competencias || []),
          pre_requisitos: JSON.stringify(editarTipoForm.pre_requisitos || []),
          cor: editarTipoForm.cor || '#3B82F6',
          icone: editarTipoForm.icone || '🎓',
          ativo: editarTipoForm.ativo
        })
        .eq('id', tipoSelecionado.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Tipo de formação atualizado com sucesso",
      });

      setEditarTipoOpen(false);
      loadData();

    } catch (error: any) {
      console.error('Erro ao atualizar tipo:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao atualizar tipo de formação",
        variant: "destructive",
      });
    } finally {
      setSubmittingEdicaoTipo(false);
    }
  };

  const handleToggleAtivoTipo = async (tipo: TipoFormacao) => {
    try {
      const novoStatus = !tipo.ativo;
      console.log(`🔄 [TIPO] ${novoStatus ? 'Ativar' : 'Desativar'} tipo:`, tipo.nome);

      const { error } = await supabase
        .from('tipos_formacao')
        .update({ ativo: novoStatus })
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: `Tipo "${tipo.nome}" ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
      });

      loadData();

    } catch (error: any) {
      console.error('Erro ao alterar status do tipo:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao alterar status do tipo",
        variant: "destructive",
      });
    }
  };

  const handleEliminarTipo = async (tipo: TipoFormacao) => {
    try {
      console.log('🗑️ [TIPO] Eliminar tipo:', tipo.nome);
      
      // Verificar se o tipo tem ações associadas
      const { data: acoes, error: checkError } = await supabase
        .from('acoes_formacao')
        .select('id')
        .eq('tipo_formacao_id', tipo.id)
        .limit(1);

      if (checkError) {
        console.error('Erro ao verificar ações:', checkError);
      }

      // Se tem ações, bloquear eliminação
      if (acoes && acoes.length > 0) {
        toast({
          title: "❌ Não é possível eliminar",
          description: `O tipo "${tipo.nome}" tem ações de formação associadas. Elimine todas as ações primeiro ou use 'Desativar'.`,
          variant: "destructive",
        });
        return;
      }

      // Se não tem ações, pode eliminar
      const { error } = await supabase
        .from('tipos_formacao')
        .delete()
        .eq('id', tipo.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: `Tipo "${tipo.nome}" eliminado com sucesso`,
      });

      loadData();

    } catch (error: any) {
      console.error('🚨 [ERRO] Erro ao eliminar tipo:', error);
      
      if (error.code === '23503') {
        toast({
          title: "❌ Não é possível eliminar",
          description: `O tipo "${tipo.nome}" tem registros associados. Use 'Desativar' para manter o histórico.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "🚨 Erro",
          description: error.message || "Erro inesperado ao eliminar tipo",
          variant: "destructive",
        });
      }
    }
  };

  // Funções para avaliação de participantes
  const handleAvaliarParticipante = (participacao: any) => {
    console.log('⭐ [AVALIAÇÃO] Avaliar participante:', participacao.voluntario?.nome);
    setParticipanteAvaliacao(participacao);
    setAvaliacaoForm({
      nota_final: participacao.nota_final || '',
      resultado: participacao.resultado || 'aprovado',
      relatorio_desempenho: participacao.relatorio_desempenho || ''
    });
    setAvaliacaoOpen(true);
  };

  const handleSalvarAvaliacao = async () => {
    if (!participanteAvaliacao) return;

    try {
      setSubmittingAvaliacao(true);

      const notaFinal = parseFloat(avaliacaoForm.nota_final);
      
      // Validar nota (0-20)
      if (isNaN(notaFinal) || notaFinal < 0 || notaFinal > 20) {
        toast({
          title: "⚠️ Nota Inválida",
          description: "A nota deve estar entre 0 e 20",
          variant: "destructive",
        });
        return;
      }

      // Determinar resultado automaticamente baseado na nota
      // SEMPRE usar a nota para determinar o resultado (nota >= 10 = aprovado)
      const resultado = notaFinal >= 10 ? 'aprovado' : 'reprovado';

      const { error } = await supabase
        .from('participacoes_formacao')
        .update({
          nota_final: notaFinal,
          resultado: resultado,
          relatorio_desempenho: avaliacaoForm.relatorio_desempenho || null,
          data_avaliacao: new Date().toISOString(),
          status: 'concluido'
        })
        .eq('id', participanteAvaliacao.id);

      if (error) throw error;

      toast({
        title: "✅ Avaliação Salva",
        description: `Participante ${resultado === 'aprovado' ? 'aprovado' : 'reprovado'} com nota ${notaFinal}`,
      });

      setAvaliacaoOpen(false);
      
      // Recarregar dados
      if (acaoSelecionada) {
        await loadParticipantesData(acaoSelecionada.id);
      }
      await loadData();

    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao salvar avaliação",
        variant: "destructive",
      });
    } finally {
      setSubmittingAvaliacao(false);
    }
  };

  const handleMarcarEmAvaliacao = async (participacao: any) => {
    try {
      const { error } = await supabase
        .from('participacoes_formacao')
        .update({ status: 'em_avaliacao' })
        .eq('id', participacao.id);

      if (error) throw error;

      toast({
        title: "✅ Status Atualizado",
        description: "Participante marcado como 'Em Avaliação'",
      });

      // Recarregar dados
      if (acaoSelecionada) {
        await loadParticipantesData(acaoSelecionada.id);
      }

    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  // Função para salvar edição
  const handleSalvarEdicao = async () => {
    if (!acaoSelecionada) return;

    try {
      setSubmittingEdicao(true);

      const { error } = await supabase
        .from('acoes_formacao')
        .update({
          codigo_acao: editarAcaoForm.codigo_acao,
          nome_acao: editarAcaoForm.nome_acao,
          descricao: editarAcaoForm.descricao || null,
          formador: editarAcaoForm.formador || null,
          local_formacao: editarAcaoForm.local_formacao || null,
          data_inicio: editarAcaoForm.data_inicio || null,
          data_fim: editarAcaoForm.data_fim || null,
          carga_horaria_real: parseInt(editarAcaoForm.carga_horaria_real) || 0,
          vagas_maximas: parseInt(editarAcaoForm.vagas_maximas) || 20,
          preco: parseFloat(editarAcaoForm.preco) || 0,
          status: editarAcaoForm.status,
          observacoes: editarAcaoForm.observacoes || null
        })
        .eq('id', acaoSelecionada.id);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Ação de formação atualizada com sucesso",
      });

      setEditarAcaoOpen(false);
      loadData();

    } catch (error: any) {
      console.error('Erro ao atualizar ação:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao atualizar ação de formação",
        variant: "destructive",
      });
    } finally {
      setSubmittingEdicao(false);
    }
  };

  // Funções para gestão de participantes
  const loadParticipantesData = async (acaoId: string) => {
    try {
      setLoadingParticipantes(true);

      // Carregar participantes atuais da ação (apenas inscritos e em avaliação)
      const { data: participantesData, error: participantesError } = await supabase
        .from('participacoes_formacao')
        .select(`
          *,
          voluntario:voluntarios(
            id,
            nome,
            email,
            telefone,
            ativo
          )
        `)
        .eq('acao_formacao_id', acaoId)
        .in('status', ['inscrito', 'em_avaliacao']);

      // Carregar histórico de participantes (concluídos)
      const { data: historicoData, error: historicoError } = await supabase
        .from('participacoes_formacao')
        .select(`
          *,
          voluntario:voluntarios(
            id,
            nome,
            email,
            telefone,
            ativo
          )
        `)
        .eq('acao_formacao_id', acaoId)
        .eq('status', 'concluido')
        .order('data_avaliacao', { ascending: false });

      if (participantesError) {
        console.error('Erro ao carregar participantes:', participantesError);
      }
      
      if (historicoError) {
        console.error('Erro ao carregar histórico:', historicoError);
      }

      setParticipantesAtuais(participantesData || []);
      setHistoricoParticipantes(historicoData || []);

      // Carregar todos os voluntários ativos
      const { data: voluntariosData, error: voluntariosError } = await supabase
        .from('voluntarios')
        .select('id, nome, email, telefone, ativo')
        .eq('ativo', true)
        .order('nome');

      if (voluntariosError) {
        console.error('Erro ao carregar voluntários:', voluntariosError);
      }

      // Filtrar voluntários que já participaram (ativos + histórico)
      const participantesAtivosIds = (participantesData || []).map(p => p.voluntario?.id).filter(Boolean);
      const participantesHistoricoIds = (historicoData || []).map(p => p.voluntario?.id).filter(Boolean);
      const todosParticipantesIds = [...participantesAtivosIds, ...participantesHistoricoIds];
      
      const voluntariosDisponiveis = (voluntariosData || []).filter(v => !todosParticipantesIds.includes(v.id));
      
      setVoluntariosDisponiveis(voluntariosDisponiveis);

    } catch (error) {
      console.error('Erro ao carregar dados de participantes:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao carregar dados de participantes",
        variant: "destructive",
      });
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const handleInscreverVoluntario = async (voluntarioId: string) => {
    if (!acaoSelecionada) return;

    try {
      setSubmittingParticipante(true);

      // Verificar se ainda há vagas
      if (participantesAtuais.length >= (acaoSelecionada.vagas_maximas || 0)) {
        toast({
          title: "⚠️ Vagas Esgotadas",
          description: "Não há mais vagas disponíveis para esta ação",
          variant: "destructive",
        });
        return;
      }

      // Inscrever voluntário
      const { error } = await supabase
        .from('participacoes_formacao')
        .insert({
          acao_formacao_id: acaoSelecionada.id,
          voluntario_id: voluntarioId,
          status: 'inscrito',
          data_inscricao: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Voluntário inscrito com sucesso",
      });

      // Recarregar dados
      await loadParticipantesData(acaoSelecionada.id);
      await loadData(); // Atualizar contadores na tabela principal

    } catch (error: any) {
      console.error('Erro ao inscrever voluntário:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao inscrever voluntário",
        variant: "destructive",
      });
    } finally {
      setSubmittingParticipante(false);
    }
  };

  const handleRemoverParticipante = async (participacaoId: string) => {
    if (!acaoSelecionada) return;

    try {
      setSubmittingParticipante(true);

      // Remover participação
      const { error } = await supabase
        .from('participacoes_formacao')
        .delete()
        .eq('id', participacaoId);

      if (error) throw error;

      toast({
        title: "✅ Sucesso",
        description: "Participante removido com sucesso",
      });

      // Recarregar dados
      await loadParticipantesData(acaoSelecionada.id);
      await loadData(); // Atualizar contadores na tabela principal

    } catch (error: any) {
      console.error('Erro ao remover participante:', error);
      toast({
        title: "🚨 Erro",
        description: "Erro ao remover participante",
        variant: "destructive",
      });
    } finally {
      setSubmittingParticipante(false);
    }
  };

  // Atualizar a função handleGerirParticipantes
  const handleGerirParticipantesAtualizada = async (acao: AcaoFormacao) => {
    console.log('👥 [AÇÃO] Gerir participantes da ação:', acao.nome_acao);
    setAcaoSelecionada(acao);
    await loadParticipantesData(acao.id);
    setParticipantesAcaoOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando sistema de formação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="h-8 w-8 mr-3 text-blue-600" />
              Sistema de Formação Valentão
            </h1>
            <p className="text-gray-600 mt-1">
              Gestão completa de tipos, ações e participações em formação
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/voluntarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Voluntários
              </Button>
            </Link>
            <Dialog open={novaAcaoDialogOpen} onOpenChange={setNovaAcaoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetNovaAcaoForm();
                  setNovaAcaoDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ação
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipos de Formação</p>
                    <p className="text-2xl font-bold text-blue-600">{estatisticas.total_tipos_formacao}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ações de Formação</p>
                    <p className="text-2xl font-bold text-green-600">{estatisticas.total_acoes_formacao}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Participações</p>
                    <p className="text-2xl font-bold text-purple-600">{estatisticas.total_participacoes}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Certificados</p>
                    <p className="text-2xl font-bold text-orange-600">{estatisticas.total_certificados_emitidos}</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="acoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 lg:grid-cols-5">
            <TabsTrigger value="acoes">Ações de Formação</TabsTrigger>
            <TabsTrigger value="tipos">Tipos de Formação</TabsTrigger>
            <TabsTrigger value="participacoes">Participações</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Ações de Formação */}
          <TabsContent value="acoes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Ações de Formação</CardTitle>
                    <CardDescription>
                      Instâncias específicas de formação (ACC2502, ACC2506, etc.)
                    </CardDescription>
                  </div>
                  
                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Input
                      placeholder="Pesquisar ações..."
                      value={termoPesquisa}
                      onChange={(e) => setTermoPesquisa(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Tipo de formação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os tipos</SelectItem>
                        {tiposFormacao.map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {getTipoFormacaoIcon(tipo.codigo)} {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filtroStatus} onValueChange={(value) => setFiltroStatus(value as StatusAcaoFormacao | 'todos')}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="planeada">Planeada</SelectItem>
                        <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                        <SelectItem value="em_curso">Em Curso</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ação</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Formador</TableHead>
                      <TableHead>Datas</TableHead>
                      <TableHead>Vagas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acoesFiltradas.map((acao) => (
                      <TableRow key={acao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{acao.nome_acao}</div>
                            <div className="text-sm text-gray-500">{acao.codigo_acao}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {acao.tipo_formacao && (
                            <div className="flex items-center space-x-2">
                              <span style={{ color: getTipoFormacaoCor(acao.tipo_formacao.codigo) }}>
                                {getTipoFormacaoIcon(acao.tipo_formacao.codigo)}
                              </span>
                              <span className="text-sm">{acao.tipo_formacao.nome}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{acao.formador || 'Não definido'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {acao.data_inicio && acao.data_fim ? (
                              <>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span>{new Date(acao.data_inicio).toLocaleDateString('pt-PT')}</span>
                                </div>
                                <div className="text-gray-500">
                                  até {new Date(acao.data_fim).toLocaleDateString('pt-PT')}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">Datas não definidas</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-gray-400" />
                              <span>{acao.vagas_ocupadas}/{acao.vagas_maximas}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${(acao.vagas_ocupadas / acao.vagas_maximas) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: getStatusColor(acao.status),
                              color: getStatusColor(acao.status)
                            }}
                          >
                            {STATUS_ACAO_LABELS[acao.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerAcao(acao)}
                              title="Ver detalhes da ação"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditarAcao(acao)}
                              title="Editar ação de formação"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGerirParticipantes(acao)}
                              title="Gerir participantes"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            
                            {/* Botão Eliminar com Confirmação */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  title="Eliminar ação de formação"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-600">
                                    ⚠️ Eliminar Ação de Formação
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-2">
                                    <p>
                                      Tem a certeza que deseja <strong>eliminar permanentemente</strong> a ação <strong>"{acao.nome_acao}"</strong>?
                                    </p>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                      <p className="text-sm text-yellow-800">
                                        💡 <strong>Nota:</strong> Se a ação tiver participantes inscritos, 
                                        terá de removê-los primeiro na gestão de participantes.
                                      </p>
                                    </div>
                                    <p className="text-red-600 font-medium">
                                      ⚠️ Esta ação não pode ser desfeita!
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleEliminarAcao(acao)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar Ação
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tipos de Formação */}
          <TabsContent value="tipos" className="space-y-6">
            {/* Cabeçalho da aba Tipos */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Tipos de Formação</h2>
                <p className="text-gray-600">Templates base para criar ações de formação</p>
              </div>
              <Dialog open={novoTipoDialogOpen} onOpenChange={setNovoTipoDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetNovoTipoForm();
                    setNovoTipoDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tipo
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiposFormacao.map((tipo) => (
                <Card key={tipo.id} className="border-l-4" style={{ borderLeftColor: getTipoFormacaoCor(tipo.codigo) }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getTipoFormacaoIcon(tipo.codigo)}</div>
                        <div>
                          <h3 className="font-semibold">{tipo.nome}</h3>
                          <p className="text-sm text-gray-500">{tipo.codigo}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Nível {tipo.nivel_ordem}</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{tipo.descricao}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{tipo.carga_horaria_minima}h mínimas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span>{tipo.competencias.length} competências</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <Badge variant={tipo.ativo ? "default" : "secondary"}>
                          {tipo.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        
                        {/* Botões de Ação */}
                        <div className="flex space-x-1">
                          {/* Botão Editar */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditarTipo(tipo)}
                            title="Editar tipo de formação"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Botão Ativar/Desativar */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleAtivoTipo(tipo)}
                            className={tipo.ativo ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                            title={tipo.ativo ? "Desativar tipo" : "Ativar tipo"}
                          >
                            {tipo.ativo ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {/* Botão Eliminar com Confirmação */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                title="Eliminar tipo de formação"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600">
                                  ⚠️ Eliminar Tipo de Formação
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <p>
                                    Tem a certeza que deseja <strong>eliminar permanentemente</strong> o tipo <strong>"{tipo.nome}"</strong>?
                                  </p>
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                    <p className="text-sm text-yellow-800">
                                      💡 <strong>Nota:</strong> Se o tipo tiver ações de formação associadas, 
                                      terá de eliminá-las primeiro ou usar 'Desativar'.
                                    </p>
                                  </div>
                                  <p className="text-red-600 font-medium">
                                    ⚠️ Esta ação não pode ser desfeita!
                                  </p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleEliminarTipo(tipo)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar Tipo
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Participações */}
          <TabsContent value="participacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participações Recentes</CardTitle>
                <CardDescription>
                  Últimas 50 participações em ações de formação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voluntário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Data Inscrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Certificado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participacoes.slice(0, 20).map((participacao) => (
                      <TableRow key={participacao.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{participacao.voluntario?.nome}</div>
                            <div className="text-sm text-gray-500">{participacao.voluntario?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{participacao.acao_formacao?.nome_acao}</div>
                            <div className="text-sm text-gray-500">{participacao.acao_formacao?.codigo_acao}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(participacao.data_inscricao).toLocaleDateString('pt-PT')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getStatusColor(participacao.status_participacao),
                              color: getStatusColor(participacao.status_participacao)
                            }}
                          >
                            {participacao.status_participacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {participacao.certificado_emitido ? (
                            <Badge variant="default" className="bg-green-600">
                              <Award className="h-3 w-3 mr-1" />
                              Emitido
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pendente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="estatisticas" className="space-y-6">
            {estatisticas && (
              <>
                {/* Estatísticas por Tipo */}
                <Card>
                  <CardHeader>
                    <CardTitle>Participações por Tipo de Formação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {estatisticas.participacoes_por_tipo.map((item) => (
                        <div key={item.tipo_codigo} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getTipoFormacaoIcon(item.tipo_codigo)}</span>
                            <div>
                              <h4 className="font-medium">{item.tipo_nome}</h4>
                              <p className="text-sm text-gray-500">{item.tipo_codigo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">{item.total_participacoes}</div>
                            <div className="text-sm text-gray-500">
                              {item.total_aprovados} aprovados ({item.taxa_aprovacao}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Status das Ações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status das Ações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(estatisticas.acoes_por_status).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm">{STATUS_ACAO_LABELS[status as StatusAcaoFormacao]}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Status das Participações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(estatisticas.participacoes_por_status).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Módulo
                </CardTitle>
                <CardDescription>
                  Gestão avançada de tipos de formação e configurações do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gestão de Tipos de Formação */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Gestão de Tipos de Formação</h3>
                      <p className="text-sm text-gray-600">Criar, editar e gerir os templates base para formações</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {tiposFormacao.length} tipos ativos
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Resumo dos Tipos */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Tipos Disponíveis</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{tiposFormacao.length}</div>
                      <div className="text-sm text-gray-600">Templates configurados</div>
                    </div>

                    {/* Ações Criadas */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Ações Criadas</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{acoesFormacao.length}</div>
                      <div className="text-sm text-gray-600">Instâncias ativas</div>
                    </div>

                    {/* Participações */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Participações</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{participacoes.length}</div>
                      <div className="text-sm text-gray-600">Total de inscrições</div>
                    </div>
                  </div>

                  {/* Botão para Gestão Avançada */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Gestão Avançada de Tipos</h4>
                        <p className="text-sm text-gray-600">Acesso completo à criação, edição e eliminação de tipos de formação</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-2">Funcionalidade disponível na aba "Tipos de Formação"</p>
                        <Button 
                          onClick={() => {
                            // Mudar para a aba tipos
                            const tabsTrigger = document.querySelector('[value="tipos"]') as HTMLElement;
                            if (tabsTrigger) tabsTrigger.click();
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Gerir Tipos de Formação
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outras Configurações */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Configurações do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium mb-2">Avaliações</h4>
                      <p className="text-sm text-gray-600 mb-2">Nota mínima para aprovação: <strong>10/20</strong></p>
                      <p className="text-sm text-gray-600">Sistema de avaliação automático ativo</p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium mb-2">Certificações</h4>
                      <p className="text-sm text-gray-600 mb-2">Certificados gerados automaticamente</p>
                      <p className="text-sm text-gray-600">Válidos por tempo indeterminado</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Nova Ação */}
        <Dialog open={novaAcaoDialogOpen} onOpenChange={setNovaAcaoDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Ação de Formação</DialogTitle>
              <DialogDescription>
                Criar uma nova instância de formação (ex: ACC2604, ACC2605, etc.)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo_acao">Código da Ação *</Label>
                  <Input
                    id="codigo_acao"
                    placeholder="Ex: ACC2604"
                    value={novaAcaoForm.codigo_acao}
                    onChange={(e) => handleNovaAcaoInputChange('codigo_acao', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_formacao">Tipo de Formação *</Label>
                  <Select value={novaAcaoForm.tipo_formacao_id} onValueChange={(value) => handleNovaAcaoInputChange('tipo_formacao_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposFormacao.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {getTipoFormacaoIcon(tipo.codigo)} {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="nome_acao">Nome da Ação *</Label>
                <Input
                  id="nome_acao"
                  placeholder="Ex: FORMA BASE - Janeiro 2026"
                  value={novaAcaoForm.nome_acao}
                  onChange={(e) => handleNovaAcaoInputChange('nome_acao', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descrição da ação de formação"
                  value={novaAcaoForm.descricao}
                  onChange={(e) => handleNovaAcaoInputChange('descricao', e.target.value)}
                />
              </div>

              {/* Detalhes da Ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formador">Formador</Label>
                  <Input
                    id="formador"
                    placeholder="Nome do formador"
                    value={novaAcaoForm.formador}
                    onChange={(e) => handleNovaAcaoInputChange('formador', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="local_formacao">Local</Label>
                  <Input
                    id="local_formacao"
                    placeholder="Local da formação"
                    value={novaAcaoForm.local_formacao}
                    onChange={(e) => handleNovaAcaoInputChange('local_formacao', e.target.value)}
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={novaAcaoForm.data_inicio}
                    onChange={(e) => handleNovaAcaoInputChange('data_inicio', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={novaAcaoForm.data_fim}
                    onChange={(e) => handleNovaAcaoInputChange('data_fim', e.target.value)}
                  />
                </div>
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="carga_horaria">Carga Horária (h)</Label>
                  <Input
                    id="carga_horaria"
                    type="number"
                    min="0"
                    value={novaAcaoForm.carga_horaria_real}
                    onChange={(e) => handleNovaAcaoInputChange('carga_horaria_real', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="vagas_maximas">Vagas Máximas</Label>
                  <Input
                    id="vagas_maximas"
                    type="number"
                    min="1"
                    value={novaAcaoForm.vagas_maximas}
                    onChange={(e) => handleNovaAcaoInputChange('vagas_maximas', parseInt(e.target.value) || 20)}
                  />
                </div>
                <div>
                  <Label htmlFor="preco">Preço (€)</Label>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={novaAcaoForm.preco}
                    onChange={(e) => handleNovaAcaoInputChange('preco', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={novaAcaoForm.status} onValueChange={(value) => handleNovaAcaoInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planeada">Planeada</SelectItem>
                    <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                    <SelectItem value="em_curso">Em Curso</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais"
                  value={novaAcaoForm.observacoes}
                  onChange={(e) => handleNovaAcaoInputChange('observacoes', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setNovaAcaoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNovaAcaoSubmit} disabled={submittingNovaAcao}>
                {submittingNovaAcao ? 'Criando...' : 'Criar Ação'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Novo Tipo de Formação */}
        <Dialog open={novoTipoDialogOpen} onOpenChange={setNovoTipoDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Tipo de Formação</DialogTitle>
              <DialogDescription>
                Criar um novo template de formação (ex: FORMA_N4, FORMA_ADMIN, etc.)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      placeholder="Ex: FORMA_N4"
                      value={novoTipoForm.codigo}
                      onChange={(e) => handleNovoTipoInputChange('codigo', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Formação Nível 4"
                      value={novoTipoForm.nome}
                      onChange={(e) => handleNovoTipoInputChange('nome', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descrição detalhada do tipo de formação"
                    value={novoTipoForm.descricao}
                    onChange={(e) => handleNovoTipoInputChange('descricao', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nivel_ordem">Nível/Ordem</Label>
                    <Input
                      id="nivel_ordem"
                      type="number"
                      min="1"
                      value={novoTipoForm.nivel_ordem}
                      onChange={(e) => handleNovoTipoInputChange('nivel_ordem', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carga_horaria">Carga Horária Mínima (h)</Label>
                    <Input
                      id="carga_horaria"
                      type="number"
                      min="0"
                      value={novoTipoForm.carga_horaria_minima}
                      onChange={(e) => handleNovoTipoInputChange('carga_horaria_minima', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="icone">Ícone</Label>
                    <Input
                      id="icone"
                      placeholder="Ex: 🎓"
                      value={novoTipoForm.icone}
                      onChange={(e) => handleNovoTipoInputChange('icone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="cor"
                      type="color"
                      value={novoTipoForm.cor}
                      onChange={(e) => handleNovoTipoInputChange('cor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={novoTipoForm.cor}
                      onChange={(e) => handleNovoTipoInputChange('cor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Competências */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Competências</h3>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nova competência"
                    value={novaCompetencia}
                    onChange={(e) => setNovaCompetencia(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarCompetencia()}
                  />
                  <Button type="button" onClick={adicionarCompetencia}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {novoTipoForm.competencias.length > 0 && (
                  <div className="space-y-2">
                    {novoTipoForm.competencias.map((competencia, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{competencia}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerCompetencia(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pré-requisitos */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pré-requisitos</h3>
                <p className="text-sm text-gray-600">Selecione os tipos de formação necessários antes deste:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tiposFormacao
                    .filter(tipo => tipo.nivel_ordem < novoTipoForm.nivel_ordem)
                    .map(tipo => (
                    <label key={tipo.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novoTipoForm.pre_requisitos.includes(tipo.id)}
                        onChange={() => togglePreRequisito(tipo.id)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {getTipoFormacaoIcon(tipo.codigo)} {tipo.nome}
                      </span>
                    </label>
                  ))}
                  
                  {/* Fallback se não houver tipos disponíveis */}
                  {tiposFormacao.filter(tipo => tipo.nivel_ordem < novoTipoForm.nivel_ordem).length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      {tiposFormacao.length === 0 
                        ? 'Nenhum tipo de formação carregado ainda...'
                        : `Nenhum tipo disponível para nível ${novoTipoForm.nivel_ordem} (total: ${tiposFormacao.length} tipos)`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preview</h3>
                <Card className="border-l-4" style={{ borderLeftColor: novoTipoForm.cor }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{novoTipoForm.icone}</div>
                        <div>
                          <h3 className="font-semibold">{novoTipoForm.nome || 'Nome do Tipo'}</h3>
                          <p className="text-sm text-gray-500">{novoTipoForm.codigo || 'CODIGO'}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Nível {novoTipoForm.nivel_ordem}</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {novoTipoForm.descricao || 'Descrição do tipo de formação'}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{novoTipoForm.carga_horaria_minima}h mínimas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span>{novoTipoForm.competencias.length} competências</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setNovoTipoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNovoTipoSubmit} disabled={submittingNovoTipo}>
                {submittingNovoTipo ? 'Criando...' : 'Criar Tipo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes da Ação */}
        <Dialog open={detalhesAcaoOpen} onOpenChange={setDetalhesAcaoOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Detalhes da Ação de Formação</span>
              </DialogTitle>
              <DialogDescription>
                Informações completas sobre a ação de formação selecionada
              </DialogDescription>
            </DialogHeader>

            {acaoSelecionada && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Informações Básicas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Código da Ação</Label>
                        <p className="text-lg font-semibold">{acaoSelecionada.codigo_acao}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nome da Ação</Label>
                        <p className="text-lg font-semibold">{acaoSelecionada.nome_acao}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Tipo de Formação</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getTipoFormacaoIcon(acaoSelecionada.tipo_formacao?.codigo || '')}</span>
                          <span className="font-medium">{acaoSelecionada.tipo_formacao?.nome || 'N/A'}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <Badge 
                          variant="outline" 
                          style={{ 
                            borderColor: getStatusColor(acaoSelecionada.status),
                            color: getStatusColor(acaoSelecionada.status)
                          }}
                        >
                          {STATUS_ACAO_LABELS[acaoSelecionada.status]}
                        </Badge>
                      </div>
                    </div>
                    {acaoSelecionada.descricao && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                        <p className="text-gray-800 mt-1">{acaoSelecionada.descricao}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Detalhes da Formação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Detalhes da Formação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Formador</Label>
                        <p className="font-medium">{acaoSelecionada.formador || 'Não definido'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Local</Label>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{acaoSelecionada.local_formacao || 'Não definido'}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Carga Horária</Label>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{acaoSelecionada.carga_horaria_real}h</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Data de Início</Label>
                        <p>{acaoSelecionada.data_inicio ? new Date(acaoSelecionada.data_inicio).toLocaleDateString('pt-PT') : 'Não definida'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Data de Fim</Label>
                        <p>{acaoSelecionada.data_fim ? new Date(acaoSelecionada.data_fim).toLocaleDateString('pt-PT') : 'Não definida'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Preço</Label>
                        <p className="font-semibold text-green-600">€{acaoSelecionada.preco?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Participantes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Participantes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{acaoSelecionada.vagas_ocupadas || 0}</p>
                          <p className="text-sm text-gray-600">Ocupadas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-600">{acaoSelecionada.vagas_maximas}</p>
                          <p className="text-sm text-gray-600">Máximas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{(acaoSelecionada.vagas_maximas || 0) - (acaoSelecionada.vagas_ocupadas || 0)}</p>
                          <p className="text-sm text-gray-600">Disponíveis</p>
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${((acaoSelecionada.vagas_ocupadas || 0) / (acaoSelecionada.vagas_maximas || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center mt-1 text-gray-600">
                          {Math.round(((acaoSelecionada.vagas_ocupadas || 0) / (acaoSelecionada.vagas_maximas || 1)) * 100)}% ocupado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {acaoSelecionada.observacoes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>Observações</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-800">{acaoSelecionada.observacoes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setDetalhesAcaoOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setDetalhesAcaoOpen(false);
                handleEditarAcao(acaoSelecionada!);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Ação
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição da Ação */}
        <Dialog open={editarAcaoOpen} onOpenChange={setEditarAcaoOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <span>Editar Ação de Formação</span>
              </DialogTitle>
              <DialogDescription>
                Edite as informações da ação de formação selecionada
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_codigo_acao">Código da Ação *</Label>
                  <Input
                    id="edit_codigo_acao"
                    value={editarAcaoForm.codigo_acao || ''}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, codigo_acao: e.target.value }))}
                    placeholder="Ex: FORMA-001"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_nome_acao">Nome da Ação *</Label>
                  <Input
                    id="edit_nome_acao"
                    value={editarAcaoForm.nome_acao || ''}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, nome_acao: e.target.value }))}
                    placeholder="Nome da ação de formação"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_formador">Formador</Label>
                  <Input
                    id="edit_formador"
                    value={editarAcaoForm.formador || ''}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, formador: e.target.value }))}
                    placeholder="Nome do formador"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_local_formacao">Local da Formação</Label>
                  <Input
                    id="edit_local_formacao"
                    value={editarAcaoForm.local_formacao || ''}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, local_formacao: e.target.value }))}
                    placeholder="Local onde decorrerá a formação"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_data_inicio">Data de Início</Label>
                  <Input
                    id="edit_data_inicio"
                    type="date"
                    value={editarAcaoForm.data_inicio || ''}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, data_inicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_data_fim">Data de Fim</Label>
                  <Input
                    id="edit_data_fim"
                    type="date"
                    value={editarAcaoForm.data_fim || ''}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, data_fim: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_carga_horaria">Carga Horária (horas)</Label>
                  <Input
                    id="edit_carga_horaria"
                    type="number"
                    min="0"
                    value={editarAcaoForm.carga_horaria_real || 0}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, carga_horaria_real: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_vagas_maximas">Vagas Máximas</Label>
                  <Input
                    id="edit_vagas_maximas"
                    type="number"
                    min="1"
                    value={editarAcaoForm.vagas_maximas || 20}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, vagas_maximas: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_preco">Preço (€)</Label>
                  <Input
                    id="edit_preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editarAcaoForm.preco || 0}
                    onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, preco: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select 
                    value={editarAcaoForm.status || 'planeada'} 
                    onValueChange={(value) => setEditarAcaoForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planeada">Planeada</SelectItem>
                      <SelectItem value="em_curso">Em Curso</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit_descricao">Descrição</Label>
                <Textarea
                  id="edit_descricao"
                  value={editarAcaoForm.descricao || ''}
                  onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição detalhada da ação de formação"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit_observacoes">Observações</Label>
                <Textarea
                  id="edit_observacoes"
                  value={editarAcaoForm.observacoes || ''}
                  onChange={(e) => setEditarAcaoForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditarAcaoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarEdicao} disabled={submittingEdicao}>
                {submittingEdicao ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Gestão de Participantes */}
        <Dialog open={participantesAcaoOpen} onOpenChange={setParticipantesAcaoOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <span>Gerir Participantes</span>
              </DialogTitle>
              <DialogDescription>
                {acaoSelecionada && (
                  <span>Gestão de participantes para: <strong>{acaoSelecionada.nome_acao}</strong></span>
                )}
              </DialogDescription>
            </DialogHeader>

            {acaoSelecionada && (
              <div className="space-y-6">
                {/* Resumo de Vagas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Resumo de Vagas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{participantesAtuais.length}</p>
                        <p className="text-sm text-gray-600">Inscritos</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-gray-600">{acaoSelecionada.vagas_maximas}</p>
                        <p className="text-sm text-gray-600">Máximas</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">
                          {Math.max(0, (acaoSelecionada.vagas_maximas || 0) - (participantesAtuais.length + historicoParticipantes.length))}
                        </p>
                        <p className="text-sm text-gray-600">Disponíveis</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-3xl font-bold text-orange-600">{historicoParticipantes.length}</p>
                        <p className="text-sm text-gray-600">Avaliados</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">
                          {Math.round(((participantesAtuais.length + historicoParticipantes.length) / (acaoSelecionada.vagas_maximas || 1)) * 100)}%
                        </p>
                        <p className="text-sm text-gray-600">Ocupado</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${(participantesAtuais.length / (acaoSelecionada.vagas_maximas || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Participantes Atuais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>Participantes Inscritos ({participantesAtuais.length})</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingParticipantes ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-600 mt-2">Carregando...</p>
                        </div>
                      ) : participantesAtuais.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Nenhum participante inscrito</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {participantesAtuais.map((participacao) => (
                            <div key={participacao.id} className="p-4 border rounded-lg space-y-3">
                              {/* Informações do Participante */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="font-medium">{participacao.voluntario?.nome || 'Nome não disponível'}</p>
                                    <Badge 
                                      variant={participacao.status === 'concluido' ? 
                                        (participacao.resultado === 'aprovado' ? 'default' : 'destructive') : 
                                        participacao.status === 'em_avaliacao' ? 'secondary' : 'outline'
                                      }
                                      className={participacao.status === 'concluido' && participacao.resultado === 'aprovado' ? 'bg-green-600' : ''}
                                    >
                                      {participacao.status === 'concluido' ? 
                                        (participacao.resultado === 'aprovado' ? '✅ Aprovado' : '❌ Reprovado') :
                                        participacao.status === 'em_avaliacao' ? '📝 Em Avaliação' : '📝 Inscrito'
                                      }
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{participacao.voluntario?.email || 'Email não disponível'}</p>
                                  {participacao.voluntario?.telefone && (
                                    <p className="text-sm text-gray-600">{participacao.voluntario.telefone}</p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    Inscrito em: {new Date(participacao.data_inscricao || participacao.created_at).toLocaleDateString('pt-PT')}
                                  </p>
                                  
                                  {/* Informações de Avaliação */}
                                  {participacao.status === 'concluido' && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                      <div className="flex items-center space-x-4">
                                        <span className="font-medium">Nota: {participacao.nota_final}/20</span>
                                        {participacao.data_avaliacao && (
                                          <span className="text-gray-600">
                                            Avaliado em: {new Date(participacao.data_avaliacao).toLocaleDateString('pt-PT')}
                                          </span>
                                        )}
                                      </div>
                                      {participacao.relatorio_desempenho && (
                                        <p className="mt-1 text-gray-700">
                                          <strong>Relatório:</strong> {participacao.relatorio_desempenho}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Botões de Ação */}
                              <div className="flex space-x-2 pt-2 border-t">
                                {participacao.status === 'inscrito' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMarcarEmAvaliacao(participacao)}
                                      className="text-blue-600 hover:text-blue-700"
                                      title="Marcar como em avaliação"
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      Em Avaliação
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAvaliarParticipante(participacao)}
                                      className="text-green-600 hover:text-green-700"
                                      title="Avaliar participante"
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Avaliar
                                    </Button>
                                  </>
                                )}
                                
                                {participacao.status === 'em_avaliacao' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAvaliarParticipante(participacao)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Finalizar avaliação"
                                  >
                                    <Award className="h-4 w-4 mr-1" />
                                    Finalizar Avaliação
                                  </Button>
                                )}
                                
                                {participacao.status === 'concluido' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAvaliarParticipante(participacao)}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Editar avaliação"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar Avaliação
                                  </Button>
                                )}
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoverParticipante(participacao.id)}
                                  disabled={submittingParticipante}
                                  className="text-red-600 hover:text-red-700"
                                  title="Remover participante"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remover
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Histórico de Participantes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <History className="h-5 w-5 text-orange-600" />
                        <span>Histórico de Participantes ({historicoParticipantes.length})</span>
                      </CardTitle>
                      <CardDescription>
                        Voluntários que já foram avaliados nesta ação de formação
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {historicoParticipantes.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>Nenhum participante avaliado ainda</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {historicoParticipantes.map((participacao) => (
                            <div key={participacao.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-orange-600" />
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium">{participacao.voluntario?.nome}</p>
                                  <p className="text-sm text-gray-600">{participacao.voluntario?.email}</p>
                                  {participacao.data_avaliacao && (
                                    <p className="text-xs text-gray-500">
                                      Avaliado em: {new Date(participacao.data_avaliacao).toLocaleDateString('pt-PT')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {participacao.nota_final && (
                                  <Badge variant="outline" className="font-bold">
                                    {participacao.nota_final}/20
                                  </Badge>
                                )}
                                <Badge 
                                  variant={participacao.resultado === 'aprovado' ? 'default' : 'destructive'}
                                  className={participacao.resultado === 'aprovado' ? 'bg-green-600' : ''}
                                >
                                  {participacao.resultado === 'aprovado' ? '✅ Aprovado' : '❌ Reprovado'}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAvaliarParticipante(participacao)}
                                  title="Editar Avaliação"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Voluntários Disponíveis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <span>Voluntários Disponíveis ({voluntariosDisponiveis.filter(v => 
                            v.nome.toLowerCase().includes(searchVoluntario.toLowerCase()) ||
                            v.email.toLowerCase().includes(searchVoluntario.toLowerCase())
                          ).length})</span>
                        </div>
                      </CardTitle>
                      <div className="mt-2">
                        <Input
                          placeholder="Pesquisar voluntários..."
                          value={searchVoluntario}
                          onChange={(e) => setSearchVoluntario(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingParticipantes ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-600 mt-2">Carregando...</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {voluntariosDisponiveis
                            .filter(voluntario => 
                              voluntario.nome.toLowerCase().includes(searchVoluntario.toLowerCase()) ||
                              voluntario.email.toLowerCase().includes(searchVoluntario.toLowerCase())
                            )
                            .map((voluntario) => (
                            <div key={voluntario.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex-1">
                                <p className="font-medium">{voluntario.nome}</p>
                                <p className="text-sm text-gray-600">{voluntario.email}</p>
                                {voluntario.telefone && (
                                  <p className="text-sm text-gray-600">{voluntario.telefone}</p>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleInscreverVoluntario(voluntario.id)}
                                disabled={submittingParticipante || participantesAtuais.length >= (acaoSelecionada.vagas_maximas || 0)}
                                className="text-green-600 hover:text-green-700"
                              >
                                {participantesAtuais.length >= (acaoSelecionada.vagas_maximas || 0) ? 'Esgotado' : 'Inscrever'}
                              </Button>
                            </div>
                          ))}
                          {voluntariosDisponiveis.filter(v => 
                            v.nome.toLowerCase().includes(searchVoluntario.toLowerCase()) ||
                            v.email.toLowerCase().includes(searchVoluntario.toLowerCase())
                          ).length === 0 && (
                            <div className="text-center py-8">
                              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">
                                {searchVoluntario ? 'Nenhum voluntário encontrado' : 'Todos os voluntários já estão inscritos'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setParticipantesAcaoOpen(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Tipo de Formação */}
        <Dialog open={editarTipoOpen} onOpenChange={setEditarTipoOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <span>Editar Tipo de Formação</span>
              </DialogTitle>
              <DialogDescription>
                {tipoSelecionado && (
                  <span>Editando: <strong>{tipoSelecionado.nome}</strong></span>
                )}
              </DialogDescription>
            </DialogHeader>

            {tipoSelecionado && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-codigo">Código *</Label>
                    <Input
                      id="edit-codigo"
                      value={editarTipoForm.codigo || ''}
                      onChange={(e) => setEditarTipoForm({...editarTipoForm, codigo: e.target.value})}
                      placeholder="Ex: FORMA_BASE"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nome">Nome *</Label>
                    <Input
                      id="edit-nome"
                      value={editarTipoForm.nome || ''}
                      onChange={(e) => setEditarTipoForm({...editarTipoForm, nome: e.target.value})}
                      placeholder="Ex: Formação Base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-descricao">Descrição</Label>
                  <Textarea
                    id="edit-descricao"
                    value={editarTipoForm.descricao || ''}
                    onChange={(e) => setEditarTipoForm({...editarTipoForm, descricao: e.target.value})}
                    placeholder="Descrição do tipo de formação..."
                    rows={3}
                  />
                </div>

                {/* Configurações */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nivel">Nível/Ordem</Label>
                    <Input
                      id="edit-nivel"
                      type="number"
                      min="1"
                      max="10"
                      value={editarTipoForm.nivel_ordem || 1}
                      onChange={(e) => setEditarTipoForm({...editarTipoForm, nivel_ordem: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-carga">Carga Horária Mínima</Label>
                    <Input
                      id="edit-carga"
                      type="number"
                      min="0"
                      value={editarTipoForm.carga_horaria_minima || 0}
                      onChange={(e) => setEditarTipoForm({...editarTipoForm, carga_horaria_minima: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-ativo">Status</Label>
                    <Select 
                      value={editarTipoForm.ativo ? "true" : "false"} 
                      onValueChange={(value) => setEditarTipoForm({...editarTipoForm, ativo: value === "true"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Personalização Visual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-cor">Cor</Label>
                    <Input
                      id="edit-cor"
                      type="color"
                      value={editarTipoForm.cor || '#3B82F6'}
                      onChange={(e) => setEditarTipoForm({...editarTipoForm, cor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-icone">Ícone</Label>
                    <Input
                      id="edit-icone"
                      value={editarTipoForm.icone || ''}
                      onChange={(e) => setEditarTipoForm({...editarTipoForm, icone: e.target.value})}
                      placeholder="Ex: 🎓"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{editarTipoForm.icone || '🎓'}</div>
                    <div>
                      <h3 className="font-semibold">{editarTipoForm.nome || 'Nome do Tipo'}</h3>
                      <p className="text-sm text-gray-500">{editarTipoForm.codigo || 'CODIGO'}</p>
                    </div>
                    <Badge 
                      variant={editarTipoForm.ativo ? "default" : "secondary"}
                      style={{ backgroundColor: editarTipoForm.ativo ? editarTipoForm.cor : undefined }}
                    >
                      Nível {editarTipoForm.nivel_ordem || 1}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditarTipoOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvarEdicaoTipo}
                disabled={submittingEdicaoTipo || !editarTipoForm.codigo || !editarTipoForm.nome}
              >
                {submittingEdicaoTipo ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Avaliação de Participante */}
        <Dialog open={avaliacaoOpen} onOpenChange={setAvaliacaoOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Avaliar Participante</span>
              </DialogTitle>
              <DialogDescription>
                {participanteAvaliacao && (
                  <span>Avaliando: <strong>{participanteAvaliacao.voluntario?.nome}</strong></span>
                )}
              </DialogDescription>
            </DialogHeader>

            {participanteAvaliacao && (
              <div className="space-y-6">
                {/* Informações do Participante */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{participanteAvaliacao.voluntario?.nome}</h3>
                        <p className="text-sm text-gray-600">{participanteAvaliacao.voluntario?.email}</p>
                        <p className="text-xs text-gray-500">
                          Inscrito em: {new Date(participanteAvaliacao.data_inscricao || participanteAvaliacao.created_at).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Formulário de Avaliação */}
                <div className="space-y-4">
                  {/* Nota Final */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nota_final">Nota Final (0-20) *</Label>
                      <Input
                        id="nota_final"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={avaliacaoForm.nota_final}
                        onChange={(e) => setAvaliacaoForm({...avaliacaoForm, nota_final: e.target.value})}
                        placeholder="Ex: 15.5"
                      />
                      <p className="text-xs text-gray-500">
                        Nota mínima para aprovação: 10.0
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="resultado">Resultado</Label>
                      <Select 
                        value={avaliacaoForm.resultado} 
                        onValueChange={(value) => setAvaliacaoForm({...avaliacaoForm, resultado: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="reprovado">Reprovado</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Será determinado automaticamente pela nota (≥10 = Aprovado, &lt;10 = Reprovado)
                      </p>
                    </div>
                  </div>

                  {/* Relatório de Desempenho */}
                  <div className="space-y-2">
                    <Label htmlFor="relatorio_desempenho">Relatório de Desempenho</Label>
                    <Textarea
                      id="relatorio_desempenho"
                      value={avaliacaoForm.relatorio_desempenho}
                      onChange={(e) => setAvaliacaoForm({...avaliacaoForm, relatorio_desempenho: e.target.value})}
                      placeholder="Descreva o desempenho do participante, pontos fortes, áreas de melhoria, observações gerais..."
                      rows={4}
                    />
                  </div>

                  {/* Preview do Resultado */}
                  {avaliacaoForm.nota_final && (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>Preview do Resultado</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Nota:</span>
                            <Badge variant="outline">{avaliacaoForm.nota_final}/20</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Resultado:</span>
                            <Badge 
                              variant={avaliacaoForm.resultado === 'aprovado' || 
                                      (avaliacaoForm.resultado === 'em_avaliacao' && parseFloat(avaliacaoForm.nota_final) >= 10) ? 
                                      'default' : 'destructive'}
                              className={avaliacaoForm.resultado === 'aprovado' || 
                                        (avaliacaoForm.resultado === 'em_avaliacao' && parseFloat(avaliacaoForm.nota_final) >= 10) ? 
                                        'bg-green-600' : ''}
                            >
                              {avaliacaoForm.resultado === 'em_avaliacao' ? 
                                (parseFloat(avaliacaoForm.nota_final) >= 10 ? '✅ Aprovado (automático)' : '❌ Reprovado (automático)') :
                                (avaliacaoForm.resultado === 'aprovado' ? '✅ Aprovado' : '❌ Reprovado')
                              }
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setAvaliacaoOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvarAvaliacao}
                disabled={submittingAvaliacao || !avaliacaoForm.nota_final}
                className="bg-green-600 hover:bg-green-700"
              >
                {submittingAvaliacao ? "Salvando..." : "Salvar Avaliação"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default SistemaFormacao;
