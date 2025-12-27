import React, { useState, useEffect, useMemo } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  GraduationCap,
  Target,
  Shirt,
  Package,
  Shield,
  Truck,
  Smartphone,
  Award,
  History,
  Loader2,
  FileText,
  Filter,
  X,
  RotateCcw,
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
// 📊 IMPORTS PARA GRÁFICOS (NÃO AFETAM FUNCIONALIDADE EXISTENTE)
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Componente para Material do Voluntário
const MaterialVoluntario = ({ voluntarioId }: { voluntarioId: string }) => {
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEquipamentosVoluntario();
  }, [voluntarioId]);

  const loadEquipamentosVoluntario = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atribuicoes_equipamentos_2025_12_13_01_00')
        .select(`
          *,
          equipamento:equipamentos_2025_12_13_01_00(
            *,
            tipo_equipamento:tipos_equipamentos_2025_12_13_01_00(
              *,
              categoria:categorias_equipamentos_2025_12_13_01_00(*)
            )
          )
        `)
        .eq('voluntario_id', voluntarioId)
        .eq('ativo', true)
        .order('data_atribuicao', { ascending: false });

      if (error) throw error;
      setEquipamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar equipamentos do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Shield, Truck, Heart, Smartphone, Shirt, Package
    };
    return icons[iconName] || Package;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando equipamentos...</span>
      </div>
    );
  }

  // Agrupar equipamentos por categoria
  const equipamentosPorCategoria = equipamentos.reduce((acc, atribuicao) => {
    const categoria = atribuicao.equipamento?.tipo_equipamento?.categoria;
    if (categoria) {
      if (!acc[categoria.codigo]) {
        acc[categoria.codigo] = {
          categoria,
          equipamentos: []
        };
      }
      acc[categoria.codigo].equipamentos.push(atribuicao);
    }
    return acc;
  }, {} as any);

  return (
    <div className="space-y-6">
      {Object.keys(equipamentosPorCategoria).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum equipamento atribuído</p>
            <p className="text-gray-400">Este voluntário não possui equipamentos atribuídos atualmente</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(equipamentosPorCategoria).map(([codigo, grupo]: [string, any]) => {
          const IconComponent = getIconComponent(grupo.categoria.icone);
          
          return (
            <Card key={codigo}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div 
                    className="p-2 rounded-full text-white mr-3"
                    style={{ backgroundColor: grupo.categoria.cor }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {grupo.categoria.nome}
                  <Badge variant="outline" className="ml-2">
                    {grupo.equipamentos.length} {grupo.equipamentos.length === 1 ? 'item' : 'itens'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {grupo.categoria.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {grupo.equipamentos.map((atribuicao: any) => {
                    const equipamento = atribuicao.equipamento;
                    const tipoEquipamento = equipamento?.tipo_equipamento;
                    
                    return (
                      <div key={atribuicao.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm">{equipamento?.codigo_interno}</h4>
                            <p className="text-xs text-gray-600">{tipoEquipamento?.nome}</p>
                          </div>
                          <Badge 
                            className="text-xs"
                            variant={equipamento?.estado === 'em_uso' ? 'default' : 'secondary'}
                          >
                            {equipamento?.estado}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span className="font-medium">Condição:</span>
                            <Badge variant="outline" className="text-xs">
                              {equipamento?.condicao}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="font-medium">Atribuído em:</span>
                            <span>{new Date(atribuicao.data_atribuicao).toLocaleDateString('pt-PT')}</span>
                          </div>
                          
                          {equipamento?.numero_serie && (
                            <div className="flex justify-between">
                              <span className="font-medium">Série:</span>
                              <span className="font-mono">{equipamento.numero_serie}</span>
                            </div>
                          )}
                        </div>
                        
                        {atribuicao.motivo_atribuicao && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Motivo:</span> {atribuicao.motivo_atribuicao}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

interface VoluntarioCompleto {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  nif?: string;
  data_nascimento?: string;
  profissao?: string;
  especialidade?: string;
  observacoes?: string;
  ativo: boolean;
  tem_formacao: boolean;
  data_entrada?: string;
  created_at: string;
}

interface ResponsabilidadeAtual {
  id: string;
  animal_id: string;
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
  animal: {
    nome: string;
    numero_processo: string;
    especie: string;
    estado: string;
  };
}

interface HistoricoResponsabilidade {
  id: string;
  animal_id: string;
  data_inicio: string;
  data_fim: string;
  motivo_fim?: string;
  animal: {
    nome: string;
    numero_processo: string;
    especie: string;
  };
}

interface FormacaoFrequentada {
  id: string;
  data_participacao: string;
  status: string;
  certificado_obtido: boolean;
  acao_formacao: {
    nome: string;
    data_inicio: string;
    data_fim: string;
    tipo_formacao: {
      nome: string;
      codigo: string;
    };
  };
}

interface MissaoParticipada {
  id: string;
  missao_id: string;
  codigo_missao: string;
  titulo_missao: string;
  data_inicio: string;
  data_fim: string;
  status_missao: string;
  funcao: string;
  data_participacao: string;
  horas_dedicadas: number;
  status_participacao: string;
}

interface MaterialFardamento {
  id: string;
  tipo_item: string;
  descricao: string;
  tamanho?: string;
  data_entrega: string;
  data_devolucao?: string;
  estado: string;
  observacoes?: string;
}

// 📊 COMPONENTE DE ESTATÍSTICAS (NÃO AFETA FUNCIONALIDADE EXISTENTE)
const EstatisticasMissoes = ({ missoes }: { missoes: MissaoParticipada[] }) => {
  // Cores para os gráficos
  const CORES = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // 📈 DADOS PARA GRÁFICO DE PARTICIPAÇÃO AO LONGO DO TEMPO
  const dadosTemporais = useMemo(() => {
    const agrupados = missoes.reduce((acc, missao) => {
      const mes = new Date(missao.data_participacao).toLocaleDateString('pt-PT', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[mes]) {
        acc[mes] = { mes, participacoes: 0, horas: 0 };
      }
      
      acc[mes].participacoes += 1;
      acc[mes].horas += missao.horas_dedicadas;
      
      return acc;
    }, {} as any);
    
    return Object.values(agrupados).sort((a: any, b: any) => 
      new Date(a.mes).getTime() - new Date(b.mes).getTime()
    );
  }, [missoes]);

  // 🎭 DADOS PARA GRÁFICO POR FUNÇÃO
  const dadosPorFuncao = useMemo(() => {
    const agrupados = missoes.reduce((acc, missao) => {
      if (!acc[missao.funcao]) {
        acc[missao.funcao] = { funcao: missao.funcao, count: 0, horas: 0 };
      }
      
      acc[missao.funcao].count += 1;
      acc[missao.funcao].horas += missao.horas_dedicadas;
      
      return acc;
    }, {} as any);
    
    return Object.values(agrupados);
  }, [missoes]);

  // 📊 DADOS PARA GRÁFICO POR STATUS
  const dadosPorStatus = useMemo(() => {
    const agrupados = missoes.reduce((acc, missao) => {
      if (!acc[missao.status_missao]) {
        acc[missao.status_missao] = { status: missao.status_missao, count: 0 };
      }
      
      acc[missao.status_missao].count += 1;
      
      return acc;
    }, {} as any);
    
    return Object.values(agrupados);
  }, [missoes]);

  // 🎯 MÉTRICAS GERAIS
  const metricas = useMemo(() => {
    const totalHoras = missoes.reduce((sum, m) => sum + m.horas_dedicadas, 0);
    const totalMissoes = missoes.length;
    const mediaHorasPorMissao = totalMissoes > 0 ? totalHoras / totalMissoes : 0;
    const missoesAtivas = missoes.filter(m => m.status_missao === 'ativa').length;
    const missoesConcluidas = missoes.filter(m => m.status_missao === 'concluida').length;
    
    return {
      totalHoras,
      totalMissoes,
      mediaHorasPorMissao,
      missoesAtivas,
      missoesConcluidas
    };
  }, [missoes]);

  if (missoes.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sem dados para estatísticas
        </h3>
        <p className="text-gray-600">
          As estatísticas aparecerão quando houver missões participadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🎯 MÉTRICAS GERAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{metricas.totalMissoes}</p>
                <p className="text-sm text-gray-600">Total Missões</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{metricas.totalHoras}h</p>
                <p className="text-sm text-gray-600">Total Horas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{metricas.mediaHorasPorMissao.toFixed(1)}h</p>
                <p className="text-sm text-gray-600">Média/Missão</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{metricas.missoesAtivas}</p>
                <p className="text-sm text-gray-600">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{metricas.missoesConcluidas}</p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📈 GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Participação ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Participação ao Longo do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="participacoes" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  name="Participações"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Horas por Função */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Horas por Função
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPorFuncao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="funcao" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="horas" fill="#10B981" name="Horas Dedicadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dadosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Horas ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horas Dedicadas por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosTemporais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="horas" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Horas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const VoluntarioProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [voluntario, setVoluntario] = useState<VoluntarioCompleto | null>(null);
  const [responsabilidadesAtuais, setResponsabilidadesAtuais] = useState<ResponsabilidadeAtual[]>([]);
  const [historicoResponsabilidades, setHistoricoResponsabilidades] = useState<HistoricoResponsabilidade[]>([]);
  const [formacoesFrequentadas, setFormacoesFrequentadas] = useState<FormacaoFrequentada[]>([]);
  const [missoesParticipadas, setMissoesParticipadas] = useState<MissaoParticipada[]>([]);
  const [materialFardamento, setMaterialFardamento] = useState<MaterialFardamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 🎯 NOVOS ESTADOS PARA FILTROS (NÃO AFETAM FUNCIONALIDADE EXISTENTE)
  const [filtros, setFiltros] = useState({
    periodo: 'todos', // 'todos', 'ultimo_mes', 'ultimos_3_meses', 'ultimo_ano'
    status_missao: 'todos', // 'todos', 'ativa', 'concluida', 'planeada'
    status_participacao: 'todos', // 'todos', 'ativa', 'concluida'
    funcao: 'todos' // 'todos', 'coordenador', 'voluntario', 'veterinario'
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    if (id) {
      loadVoluntarioCompleto();
    }
  }, [id]);

  const loadMissoesParticipadas = async () => {
    try {
      const { data, error } = await supabase
        .from('participacoes_missoes_2025_12_21_20_00')
        .select(`
          id,
          funcao,
          data_participacao,
          horas_dedicadas,
          status_participacao,
          missao:missoes_2025_12_21_19_00(
            id,
            codigo,
            titulo,
            data_inicio,
            data_fim,
            status
          )
        `)
        .eq('voluntario_id', id)
        .order('data_participacao', { ascending: false });

      if (error) throw error;

      // Transformar os dados para o formato esperado
      const missoesFormatadas = (data || []).map(participacao => ({
        id: participacao.id,
        missao_id: participacao.missao?.id || '',
        codigo_missao: participacao.missao?.codigo || '',
        titulo_missao: participacao.missao?.titulo || '',
        data_inicio: participacao.missao?.data_inicio || '',
        data_fim: participacao.missao?.data_fim || '',
        status_missao: participacao.missao?.status || '',
        funcao: participacao.funcao,
        data_participacao: participacao.data_participacao,
        horas_dedicadas: participacao.horas_dedicadas || 0,
        status_participacao: participacao.status_participacao
      }));

      setMissoesParticipadas(missoesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar missões participadas:', error);
      setMissoesParticipadas([]);
    }
  };

  // 🎯 FUNÇÃO DE FILTROS (NÃO MODIFICA DADOS ORIGINAIS)
  const missoesFiltered = useMemo(() => {
    let resultado = [...missoesParticipadas]; // Cópia dos dados originais

    // Filtro por período
    if (filtros.periodo !== 'todos') {
      const agora = new Date();
      let dataLimite = new Date();
      
      switch (filtros.periodo) {
        case 'ultimo_mes':
          dataLimite.setMonth(agora.getMonth() - 1);
          break;
        case 'ultimos_3_meses':
          dataLimite.setMonth(agora.getMonth() - 3);
          break;
        case 'ultimo_ano':
          dataLimite.setFullYear(agora.getFullYear() - 1);
          break;
      }
      
      resultado = resultado.filter(missao => 
        new Date(missao.data_participacao) >= dataLimite
      );
    }

    // Filtro por status da missão
    if (filtros.status_missao !== 'todos') {
      resultado = resultado.filter(missao => 
        missao.status_missao === filtros.status_missao
      );
    }

    // Filtro por status da participação
    if (filtros.status_participacao !== 'todos') {
      resultado = resultado.filter(missao => 
        missao.status_participacao === filtros.status_participacao
      );
    }

    // Filtro por função
    if (filtros.funcao !== 'todos') {
      resultado = resultado.filter(missao => 
        missao.funcao === filtros.funcao
      );
    }

    return resultado;
  }, [missoesParticipadas, filtros]);

  // 🎯 FUNÇÃO PARA RESETAR FILTROS
  const resetarFiltros = () => {
    setFiltros({
      periodo: 'todos',
      status_missao: 'todos',
      status_participacao: 'todos',
      funcao: 'todos'
    });
  };

  const loadVoluntarioCompleto = async () => {
    try {
      setLoading(true);
      
      // Carregar dados básicos do voluntário
      const { data: voluntarioData, error: voluntarioError } = await supabase
        .from('voluntarios')
        .select('*')
        .eq('id', id)
        .single();

      if (voluntarioError) throw voluntarioError;
      setVoluntario(voluntarioData);

      // Carregar responsabilidades atuais com consulta otimizada
      try {
        // Carregar responsabilidades ativas sem JOIN problemático
        const { data: responsabilidadesData, error: respError } = await supabase
          .from('responsabilidades_voluntarios')
          .select('*, tipo_responsabilidade')
          .eq('voluntario_id', id)
          .eq('ativo', true)
          .order('created_at', { ascending: false });

        // Buscar dados dos animais separadamente
        const responsabilidadesComAnimais = [];
        if (!respError && responsabilidadesData) {
          for (const resp of responsabilidadesData) {
            if (resp.animal_id) {
              const { data: animalData } = await supabase
                .from('animais')
                .select('id, nome, numero_processo, especie, estado')
                .eq('id', resp.animal_id)
                .single();
              
              if (animalData) {
                responsabilidadesComAnimais.push({
                  ...resp,
                  animais: animalData
                });
              }
            }
          }
        }

        if (respError) {
          console.error('❌ Erro ao carregar responsabilidades ativas:', respError);
          setResponsabilidadesAtuais([]);
        } else {
          console.log('✅ Responsabilidades ativas carregadas:', responsabilidadesComAnimais.length);
          setResponsabilidadesAtuais(responsabilidadesComAnimais);
        }
      } catch (error) {
        console.error('Erro ao carregar responsabilidades atuais:', error);
        setResponsabilidadesAtuais([]);
      }

      // Carregar TODAS as responsabilidades (histórico completo)
      try {
        // Carregar TODAS as responsabilidades sem JOIN problemático
        const { data: todasResponsabilidades, error: histError } = await supabase
          .from('responsabilidades_voluntarios')
          .select('*, tipo_responsabilidade')
          .eq('voluntario_id', id)
          .order('created_at', { ascending: false });

        // Buscar dados dos animais separadamente para o histórico
        const historicoComAnimais = [];
        if (!histError && todasResponsabilidades) {
          for (const resp of todasResponsabilidades) {
            if (resp.animal_id) {
              const { data: animalData } = await supabase
                .from('animais')
                .select('id, nome, numero_processo, especie, estado')
                .eq('id', resp.animal_id)
                .single();
              
              if (animalData) {
                historicoComAnimais.push({
                  ...resp,
                  animais: animalData
                });
              }
            }
          }
        }

        if (histError) {
          console.error('❌ Erro ao carregar responsabilidades:', histError);
          setHistoricoResponsabilidades([]);
        } else {
          console.log('✅ TODAS as responsabilidades carregadas:', historicoComAnimais.length);
          
          if (historicoComAnimais.length > 0) {
            console.log('🔍 Primeira responsabilidade encontrada:');
            console.log('  - ID:', historicoComAnimais[0].id);
            console.log('  - Animal ID:', historicoComAnimais[0].animal_id);
            console.log('  - Ativo:', historicoComAnimais[0].ativo);
            console.log('  - Animal:', historicoComAnimais[0].animais);
            console.log('  - Data Início:', historicoComAnimais[0].data_inicio);
            
            // Verificar se é a responsabilidade do Dodge
            historicoComAnimais.forEach((resp, index) => {
              if (resp.animais?.nome?.toLowerCase().includes('dodge')) {
                console.log(`🐶 DODGE ENCONTRADO no índice ${index}:`, resp);
              }
            });
          }
          
          // Definir histórico (todas as responsabilidades)
          setHistoricoResponsabilidades(historicoComAnimais);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico de responsabilidades:', error);
        setHistoricoResponsabilidades([]);
      }

      // Carregar formações frequentadas reais
      try {
        const { data: formacoesData, error: formacoesError } = await supabase
          .from('participacoes_formacao')
          .select(`
            id,
            status,
            data_inscricao,
            data_avaliacao,
            nota_final,
            resultado,
            relatorio_desempenho,
            acao_formacao:acoes_formacao(
              id,
              codigo_acao,
              nome_acao,
              data_inicio,
              data_fim,
              carga_horaria_real,
              tipo_formacao:tipos_formacao(
                codigo,
                nome,
                icone,
                cor
              )
            )
          `)
          .eq('voluntario_id', id)
          .order('data_inscricao', { ascending: false });

        if (formacoesError) {
          console.error('Erro ao carregar formações:', formacoesError);
          setFormacoesFrequentadas([]);
        } else {
          // Transformar dados para o formato esperado
          const formacoesFormatadas = (formacoesData || []).map(formacao => ({
            id: formacao.id,
            data_participacao: formacao.data_inscricao,
            status: formacao.status === 'concluido' ? 'concluida' : 
                   formacao.status === 'inscrito' ? 'em_curso' : formacao.status,
            certificado_obtido: formacao.resultado === 'aprovado',
            nota_final: formacao.nota_final,
            resultado: formacao.resultado,
            relatorio_desempenho: formacao.relatorio_desempenho,
            data_avaliacao: formacao.data_avaliacao,
            acao_formacao: {
              nome: formacao.acao_formacao?.nome_acao || 'N/A',
              codigo: formacao.acao_formacao?.codigo_acao || 'N/A',
              data_inicio: formacao.acao_formacao?.data_inicio || '',
              data_fim: formacao.acao_formacao?.data_fim || '',
              carga_horaria: formacao.acao_formacao?.carga_horaria_real || 0,
              tipo_formacao: {
                nome: formacao.acao_formacao?.tipo_formacao?.nome || 'N/A',
                codigo: formacao.acao_formacao?.tipo_formacao?.codigo || 'N/A',
                icone: formacao.acao_formacao?.tipo_formacao?.icone || '🎓',
                cor: formacao.acao_formacao?.tipo_formacao?.cor || '#3B82F6'
              }
            }
          }));
          
          setFormacoesFrequentadas(formacoesFormatadas);
        }
      } catch (error) {
        console.error('Erro ao carregar formações:', error);
        setFormacoesFrequentadas([]);
      }

      // Carregar missões participadas
      await loadMissoesParticipadas();

      // Carregar material e fardamento (dados fictícios)
      setMaterialFardamento([
        {
          id: '1',
          tipo_item: 'Fardamento',
          descricao: 'Camisola oficial VR',
          tamanho: 'M',
          data_entrega: '2024-01-01',
          estado: 'bom',
          observacoes: 'Em uso regular'
        },
        {
          id: '2',
          tipo_item: 'Equipamento',
          descricao: 'Kit de primeiros socorros',
          data_entrega: '2024-01-15',
          estado: 'excelente',
          observacoes: 'Completo e atualizado'
        }
      ]);

    } catch (error: any) {
      console.error('Erro ao carregar dados do voluntário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do voluntário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando perfil completo...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!voluntario) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Voluntário não encontrado</CardTitle>
              <CardDescription>
                O voluntário solicitado não foi encontrado
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/voluntarios/gestao">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Gestão
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <EnhancedFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Link to="/voluntarios/gestao">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">Voltar à Gestão</span>
                <span className="sm:hidden">Voltar</span>
              </Button>
            </Link>
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center break-words">
                <User className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <span className="truncate">{voluntario.nome}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant={voluntario.ativo ? "default" : "secondary"} className="text-xs">
                  {voluntario.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {voluntario.especialidade || "Geral"}
                </Badge>
                {voluntario.tem_formacao && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Com Formação</span>
                    <span className="sm:hidden">Formado</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <Link to={`/voluntarios/${voluntario.id}/formacoes`}>
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 w-full sm:w-auto">
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="hidden sm:inline">Formações Frequentadas</span>
                <span className="sm:hidden">Formações</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs com informações completas */}
        <Tabs defaultValue="dados-pessoais" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto">
            <TabsTrigger value="dados-pessoais" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Dados Pessoais</span>
              <span className="sm:hidden">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="animais" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Animais</span>
              <span className="sm:hidden">Animais</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
            <TabsTrigger value="formacao" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Formação</span>
              <span className="sm:hidden">Form.</span>
            </TabsTrigger>
            <TabsTrigger value="missoes" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Missões</span>
              <span className="sm:hidden">Miss.</span>
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">📊 Estatísticas</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger value="material" className="text-xs sm:text-sm p-2 sm:p-3">
              <span className="hidden sm:inline">Material</span>
              <span className="sm:hidden">Mat.</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba: Dados Pessoais */}
          <TabsContent value="dados-pessoais">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Informações Pessoais</span>
                    <span className="sm:hidden">Dados Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm font-medium text-gray-500">Nome Completo</Label>
                      <p className="text-sm font-medium break-words">{voluntario.nome}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-sm break-all">{voluntario.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium text-gray-500">Telefone</Label>
                      <p className="text-sm">{voluntario.telefone || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium text-gray-500">NIF</Label>
                      <p className="text-sm">{voluntario.nif || "Não informado"}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium text-gray-500">
                        <span className="hidden sm:inline">Data de Nascimento</span>
                        <span className="sm:hidden">Nascimento</span>
                      </Label>
                      <p className="text-sm">
                        {voluntario.data_nascimento 
                          ? (() => {
                              const dataNascimento = new Date(voluntario.data_nascimento);
                              const hoje = new Date();
                              const idade = hoje.getFullYear() - dataNascimento.getFullYear() - 
                                (hoje.getMonth() < dataNascimento.getMonth() || 
                                 (hoje.getMonth() === dataNascimento.getMonth() && hoje.getDate() < dataNascimento.getDate()) ? 1 : 0);
                              return `${dataNascimento.toLocaleDateString('pt-PT')} (${idade} anos)`;
                            })()
                          : "Não informado"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Profissão</Label>
                      <p className="text-sm">{voluntario.profissao || "Não informado"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Morada</Label>
                    <p className="text-sm">{voluntario.morada || "Não informado"}</p>
                  </div>
                  {voluntario.observacoes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Observações</Label>
                      <p className="text-sm">{voluntario.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Informações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Data de Entrada</Label>
                      <p className="text-sm">
                        {voluntario.data_entrada 
                          ? new Date(voluntario.data_entrada).toLocaleDateString('pt-PT')
                          : new Date(voluntario.created_at).toLocaleDateString('pt-PT')
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Especialidade</Label>
                      <p className="text-sm">{voluntario.especialidade || "Geral"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge variant={voluntario.ativo ? "default" : "secondary"}>
                        {voluntario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Formação</Label>
                      <Badge variant={voluntario.tem_formacao ? "default" : "outline"}>
                        {voluntario.tem_formacao ? "Com Formação" : "Sem Formação"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Animais Dependentes */}
          <TabsContent value="animais">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PawPrint className="h-5 w-5 mr-2" />
                    Animais Sob Responsabilidade ({responsabilidadesAtuais.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {responsabilidadesAtuais.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum animal sob responsabilidade atualmente
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {responsabilidadesAtuais.map((resp) => (
                        <Card key={resp.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{resp.animais?.nome || 'Nome não disponível'}</h4>
                              <Badge variant="outline">{resp.animais?.estado || 'Estado desconhecido'}</Badge>
                            </div>
                            <div className="mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {resp.tipo_responsabilidade || 'Tipo não definido'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Processo: {resp.animais?.numero_processo || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Espécie: {resp.animais?.especie || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Responsável desde: {new Date(resp.data_inicio).toLocaleDateString('pt-PT')}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Histórico de Responsabilidades */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Histórico de Responsabilidades ({historicoResponsabilidades.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🔍 <strong>Debug:</strong> Encontradas {historicoResponsabilidades.length} responsabilidades
                  </p>
                </div>
                
                {historicoResponsabilidades.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">Nenhuma responsabilidade encontrada</p>
                    <p className="text-xs text-gray-400">Verifique se as responsabilidades foram criadas corretamente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historicoResponsabilidades.map((hist, index) => {
                      console.log(`🔍 Renderizando responsabilidade ${index + 1}:`, hist);
                      return (
                        <div key={hist.id || index} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg flex items-center">
                                🐶 {hist.animais?.nome || `Animal ID: ${hist.animal_id}` || 'Nome não disponível'}
                              </h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {hist.tipo_responsabilidade || 'Tipo não definido'}
                              </Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Badge variant={hist.ativo ? 'default' : 'secondary'}>
                                {hist.ativo ? '✅ Ativa' : '📝 Finalizada'}
                              </Badge>
                              {hist.animais?.nome?.toLowerCase().includes('dodge') && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                  🐶 DODGE
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-700">Processo:</span>
                              <p className="text-gray-900">{hist.animais?.numero_processo || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-700">Espécie:</span>
                              <p className="text-gray-900">{hist.animais?.especie || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-700">Início:</span>
                              <p className="text-gray-900">
                                {hist.data_inicio ? new Date(hist.data_inicio).toLocaleDateString('pt-PT') : 'N/A'}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-700">Fim:</span>
                              <p className="text-gray-900">
                                {hist.data_fim ? new Date(hist.data_fim).toLocaleDateString('pt-PT') : 'Em andamento'}
                              </p>
                            </div>
                          </div>
                          
                          {hist.motivo_fim && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                              <p className="text-sm text-yellow-800">
                                <span className="font-medium">Motivo do fim:</span> {hist.motivo_fim}
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-gray-500">
                            ID da Responsabilidade: {hist.id} | Animal ID: {hist.animal_id}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Formações Frequentadas */}
          <TabsContent value="formacao">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Formações Frequentadas ({formacoesFrequentadas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formacoesFrequentadas.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nenhuma formação frequentada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formacoesFrequentadas.map((formacao) => (
                      <div key={formacao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div 
                              className="text-2xl p-2 rounded-lg"
                              style={{ backgroundColor: `${formacao.acao_formacao.tipo_formacao.cor}20` }}
                            >
                              {formacao.acao_formacao.tipo_formacao.icone}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{formacao.acao_formacao.nome}</h4>
                              <p className="text-sm text-gray-600">
                                {formacao.acao_formacao.tipo_formacao.nome} • {formacao.acao_formacao.codigo}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span>
                                  {new Date(formacao.acao_formacao.data_inicio).toLocaleDateString('pt-PT')} - {' '}
                                  {new Date(formacao.acao_formacao.data_fim).toLocaleDateString('pt-PT')}
                                </span>
                                <span>{formacao.acao_formacao.carga_horaria}h</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge 
                              variant={formacao.status === 'concluida' ? 
                                (formacao.resultado === 'aprovado' ? 'default' : 'destructive') : 
                                'secondary'
                              }
                              className={formacao.status === 'concluida' && formacao.resultado === 'aprovado' ? 'bg-green-600' : ''}
                            >
                              {formacao.status === 'concluida' ? 
                                (formacao.resultado === 'aprovado' ? '✅ Aprovado' : '❌ Reprovado') :
                                formacao.status === 'em_avaliacao' ? '📝 Em Avaliação' : '📝 Em Curso'
                              }
                            </Badge>
                            {formacao.nota_final && (
                              <Badge variant="outline" className="font-bold">
                                {formacao.nota_final}/20
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Informações de Avaliação */}
                        {formacao.status === 'concluida' && formacao.relatorio_desempenho && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-sm mb-2 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              Relatório de Desempenho:
                            </h5>
                            <p className="text-sm text-gray-700">{formacao.relatorio_desempenho}</p>
                            {formacao.data_avaliacao && (
                              <p className="text-xs text-gray-500 mt-2">
                                Avaliado em: {new Date(formacao.data_avaliacao).toLocaleDateString('pt-PT')}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                          Inscrito em: {new Date(formacao.data_participacao).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Missões Participadas */}
          <TabsContent value="missoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Missões Participadas ({missoesFiltered.length} de {missoesParticipadas.length})
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className="flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {mostrarFiltros ? 'Ocultar Filtros' : 'Filtros'}
                  </Button>
                </CardTitle>
                
                {/* 🎯 PAINEL DE FILTROS (COLAPSÁVEL) */}
                {mostrarFiltros && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Filtro por Período */}
                      <div>
                        <Label className="text-sm font-medium">Período</Label>
                        <Select value={filtros.periodo} onValueChange={(value) => setFiltros(prev => ({ ...prev, periodo: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os períodos</SelectItem>
                            <SelectItem value="ultimo_mes">Último mês</SelectItem>
                            <SelectItem value="ultimos_3_meses">Últimos 3 meses</SelectItem>
                            <SelectItem value="ultimo_ano">Último ano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtro por Status da Missão */}
                      <div>
                        <Label className="text-sm font-medium">Status da Missão</Label>
                        <Select value={filtros.status_missao} onValueChange={(value) => setFiltros(prev => ({ ...prev, status_missao: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os status</SelectItem>
                            <SelectItem value="ativa">Ativa</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                            <SelectItem value="planeada">Planeada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtro por Status da Participação */}
                      <div>
                        <Label className="text-sm font-medium">Status da Participação</Label>
                        <Select value={filtros.status_participacao} onValueChange={(value) => setFiltros(prev => ({ ...prev, status_participacao: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os status</SelectItem>
                            <SelectItem value="ativa">Ativa</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtro por Função */}
                      <div>
                        <Label className="text-sm font-medium">Função</Label>
                        <Select value={filtros.funcao} onValueChange={(value) => setFiltros(prev => ({ ...prev, funcao: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todas as funções</SelectItem>
                            <SelectItem value="coordenador">Coordenador</SelectItem>
                            <SelectItem value="voluntario">Voluntário</SelectItem>
                            <SelectItem value="veterinario">Veterinário</SelectItem>
                            <SelectItem value="condutor">Condutor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Botão para resetar filtros */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetarFiltros}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {missoesParticipadas.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma missão participada
                    </h3>
                    <p className="text-gray-600">
                      Este voluntário ainda não participou em nenhuma missão.
                    </p>
                  </div>
                ) : missoesFiltered.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma missão encontrada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Não há missões que correspondam aos filtros selecionados.
                    </p>
                    <Button variant="outline" onClick={resetarFiltros}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missoesFiltered.map((missao) => (
                    <div key={missao.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-lg">{missao.codigo_missao}</h4>
                          <Badge variant="outline" className="text-xs">
                            {missao.funcao}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={missao.status_missao === 'concluida' ? 'default' : 'secondary'}>
                            {missao.status_missao === 'concluida' ? 'Concluída' : 
                             missao.status_missao === 'ativa' ? 'Ativa' : 
                             missao.status_missao === 'planeada' ? 'Planeada' : missao.status_missao}
                          </Badge>
                          <Badge variant={missao.status_participacao === 'ativa' ? 'default' : 'secondary'}>
                            {missao.status_participacao === 'ativa' ? 'Participação Ativa' : 
                             missao.status_participacao === 'concluida' ? 'Participação Concluída' : missao.status_participacao}
                          </Badge>
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-2">{missao.titulo_missao}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Data de Início:</span> {new Date(missao.data_inicio).toLocaleDateString('pt-PT')}
                        </div>
                        <div>
                          <span className="font-medium">Data de Fim:</span> {new Date(missao.data_fim).toLocaleDateString('pt-PT')}
                        </div>
                        <div>
                          <span className="font-medium">Participação:</span> {new Date(missao.data_participacao).toLocaleDateString('pt-PT')}
                        </div>
                        <div>
                          <span className="font-medium">Horas Dedicadas:</span> {missao.horas_dedicadas}h
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <Link 
                          to={`/missao/${missao.missao_id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          Ver Detalhes da Missão
                          <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 📊 ABA: ESTATÍSTICAS (NÃO AFETA OUTRAS ABAS) */}
          <TabsContent value="estatisticas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Estatísticas de Participação
                </CardTitle>
                <CardDescription>
                  Análise detalhada da participação do voluntário em missões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EstatisticasMissoes missoes={missoesParticipadas} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Fardamento e Material */}
          <TabsContent value="material">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Fardamento e Material ({materialFardamento.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materialFardamento.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center">
                          {item.tipo_item === 'Fardamento' ? (
                            <Shirt className="h-4 w-4 mr-2" />
                          ) : (
                            <Package className="h-4 w-4 mr-2" />
                          )}
                          {item.descricao}
                        </h4>
                        <Badge variant={item.estado === 'excelente' ? 'default' : 'outline'}>
                          {item.estado}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tipo:</span> {item.tipo_item}
                        </div>
                        {item.tamanho && (
                          <div>
                            <span className="font-medium">Tamanho:</span> {item.tamanho}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Entregue em:</span> {new Date(item.data_entrega).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                      {item.observacoes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Observações:</span> {item.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Material */}
          <TabsContent value="material">
            <MaterialVoluntario voluntarioId={voluntario.id} />
          </TabsContent>
        </Tabs>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default VoluntarioProfile;