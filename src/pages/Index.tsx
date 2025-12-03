import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PawPrint, 
  Users, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Activity,
  BarChart3,
  Target,
  ArrowRight,
  Plus,
  Eye,
  Stethoscope,
  Settings,
  FileText,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserHeader from "@/components/UserHeader";
// import SistemaLembretes from "@/components/SistemaLembretes"; // Temporariamente desativado

interface DashboardStats {
  // 🐾 ANIMAIS - Estatísticas Avançadas
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisArquivados: number;
  animaisSemResponsavel: number;
  animaisUrgentes: number;
  totalCaes: number;
  totalGatos: number;
  totalOutros: number;
  adocoesAno: number;
  adocoesMes: number;
  adocoesUltimos30Dias: number;
  mediaIdadeAnimais: number;
  
  // 👥 VOLUNTÁRIOS - Estatísticas Avançadas
  totalVoluntarios: number;
  voluntariosAtivos: number;
  voluntariosComFormacao: number;
  novasInscricoesMes: number;
  
  // 💰 FINANCEIRO - Estatísticas Avançadas
  saldoTotal: number;
  receitasMes: number;
  despesasMes: number;
  receitasAno: number;
  despesasAno: number;
  tendenciaFinanceira: 'positiva' | 'negativa' | 'estavel';
  
  // 🏥 INTERVENÇÕES - Estatísticas Avançadas
  intervencoesPendentes: number;
  intervencoesUrgentes: number;
  intervencoesMes: number;
  custoMedioIntervencao: number;
  
  // 📋 SISTEMA - Estatísticas Gerais
  gruposAtivos: number;
  responsabilidadesAtivas: number;
  totalMovimentosFinanceiros: number;
  ultimaAtualizacao: string;
}

interface AlertaCritico {
  id: string;
  tipo: 'animal' | 'financeiro' | 'intervencao' | 'sistema' | 'voluntario';
  titulo: string;
  descricao: string;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  icone: string;
  cor: string;
  link?: string;
  acao?: string;
  contador?: number;
}

interface AtividadeRecente {
  id: string;
  tipo: 'animal' | 'intervencao' | 'evento' | 'adocao' | 'voluntario';
  titulo: string;
  descricao: string;
  data: string;
  usuario?: string;
}

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertasCriticos, setAlertasCriticos] = useState<AlertaCritico[]>([]);
  const [atividadeRecente, setAtividadeRecente] = useState<AtividadeRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  // Função otimizada para buscar estatísticas com melhor tratamento de erros
  // 🚀 FUNÇÃO AVANÇADA DE CARREGAMENTO
  const fetchDashboardStats = async () => {
    try {
      console.log('🚀 [DASHBOARD] Iniciando carregamento avançado...');
      setLoading(true);
      setError(null);
      
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      const inicioMes = new Date(anoAtual, mesAtual - 1, 1).toISOString();
      const fimMes = new Date(anoAtual, mesAtual, 0).toISOString();
      const inicioAno = new Date(anoAtual, 0, 1).toISOString();
      const ultimos30Dias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // 🐾 ANIMAIS - Carregamento Avançado
      console.log('🐾 [DASHBOARD] Carregando dados avançados de animais...');
      const { data: animais } = await supabase
        .from('animais')
        .select('id, estado, arquivado, data_entrada, data_nascimento, data_adocao, especie, sexo, grupo_id');

      // 👥 VOLUNTÁRIOS - Carregamento Avançado
      console.log('👥 [DASHBOARD] Carregando dados de voluntários...');
      const { data: voluntarios } = await supabase
        .from('voluntarios')
        .select('id, ativo, tem_formacao, especialidade, data_entrada');

      // 📋 RESPONSABILIDADES - Carregamento
      const { data: responsabilidades } = await supabase
        .from('responsabilidades_voluntarios')
        .select('id, animal_id, ativo')
        .eq('ativo', true);

      // 💰 MOVIMENTOS FINANCEIROS - Carregamento
      const { data: movimentos } = await supabase
        .from('movimentos_financeiros')
        .select('id, tipo, valor, data_movimento')
        .gte('data_movimento', inicioAno);

      // 🏥 INTERVENÇÕES - Carregamento Simplificado
      const { data: intervencoes } = await supabase
        .from('intervencoes')
        .select('id, estado, urgente, custo_estimado, data_intervencao');

      console.log('📊 [DASHBOARD] Processando estatísticas avançadas...');

      // 🧮 CÁLCULOS AVANÇADOS DE ANIMAIS
      const animaisArray = animais || [];
      const animaisAtivos = animaisArray.filter(a => a.estado === 'Ativo' && !a.arquivado);
      const animaisAdotados = animaisArray.filter(a => a.estado === 'Adotado');
      const animaisArquivados = animaisArray.filter(a => a.arquivado);
      
      // Animais sem responsável
      const animaisComResponsavel = new Set(responsabilidades?.map(r => r.animal_id) || []);
      const animaisSemResponsavel = animaisAtivos.filter(a => !animaisComResponsavel.has(a.id)).length;
      
      // Distribuição por espécie
      const totalCaes = animaisArray.filter(a => a.especie === 'Cão' && !a.arquivado).length;
      const totalGatos = animaisArray.filter(a => a.especie === 'Gato' && !a.arquivado).length;
      const totalOutros = animaisArray.filter(a => a.especie !== 'Cão' && a.especie !== 'Gato' && !a.arquivado).length;
      
      // Adoções recentes
      const adocoesUltimos30Dias = animaisAdotados.filter(a => 
        a.data_adocao && new Date(a.data_adocao) >= new Date(ultimos30Dias)
      ).length;
      
      const adocoesMes = animaisAdotados.filter(a => 
        a.data_adocao && 
        new Date(a.data_adocao) >= new Date(inicioMes) &&
        new Date(a.data_adocao) <= new Date(fimMes)
      ).length;
      
      const adocoesAno = animaisAdotados.filter(a => 
        a.data_adocao && new Date(a.data_adocao).getFullYear() === anoAtual
      ).length;
      
      // 🧮 CÁLCULOS AVANÇADOS DE VOLUNTÁRIOS
      const voluntariosArray = voluntarios || [];
      const voluntariosAtivos = voluntariosArray.filter(v => v.ativo).length;
      const voluntariosComFormacao = voluntariosArray.filter(v => v.tem_formacao).length;
      
      const novasInscricoesMes = voluntariosArray.filter(v => 
        v.data_entrada && 
        new Date(v.data_entrada) >= new Date(inicioMes) &&
        new Date(v.data_entrada) <= new Date(fimMes)
      ).length;
      
      // 🧮 CÁLCULOS AVANÇADOS FINANCEIROS
      const movimentosArray = movimentos || [];
      const receitasAno = movimentosArray
        .filter(m => m.tipo === 'receita')
        .reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);
      
      const despesasAno = movimentosArray
        .filter(m => m.tipo === 'despesa')
        .reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);
      
      const receitasMes = movimentosArray
        .filter(m => m.tipo === 'receita' && 
          new Date(m.data_movimento) >= new Date(inicioMes) &&
          new Date(m.data_movimento) <= new Date(fimMes))
        .reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);
      
      const despesasMes = movimentosArray
        .filter(m => m.tipo === 'despesa' && 
          new Date(m.data_movimento) >= new Date(inicioMes) &&
          new Date(m.data_movimento) <= new Date(fimMes))
        .reduce((sum, m) => sum + (parseFloat(m.valor) || 0), 0);
      
      const saldoTotal = receitasAno - despesasAno;
      const saldoMes = receitasMes - despesasMes;
      
      // Tendência financeira
      let tendenciaFinanceira: 'positiva' | 'negativa' | 'estavel' = 'estavel';
      if (saldoMes > 0) tendenciaFinanceira = 'positiva';
      else if (saldoMes < 0) tendenciaFinanceira = 'negativa';
      
      // 🧮 CÁLCULOS AVANÇADOS DE INTERVENÇÕES
      const intervencoesArray = intervencoes || [];
      const intervencoesPendentes = intervencoesArray.filter(i => i.estado === 'Agendada').length;
      const intervencoesUrgentes = intervencoesArray.filter(i => i.urgente && i.estado !== 'Concluída').length;
      
      const intervencoesMes = intervencoesArray.filter(i => 
        new Date(i.data_intervencao) >= new Date(inicioMes) &&
        new Date(i.data_intervencao) <= new Date(fimMes)
      ).length;
      
      const custoMedioIntervencao = intervencoesArray.length > 0 ? 
        intervencoesArray.reduce((sum, i) => sum + (parseFloat(i.custo_estimado) || 0), 0) / intervencoesArray.length : 0;

      try {
        const { data: movimentosData } = await supabase
          .from('movimentos_financeiros')
          .select('id, valor, tipo, data_movimento');
        // movimentos = movimentosData || []; // Removido pois já foi declarado anteriormente
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar movimentos financeiros:', e);
      }

      try {
        const { data: intervencoesData } = await supabase
          .from('intervencoes')
          .select('id, estado, data_intervencao');
        // intervencoes = intervencoesData || []; // Removido pois já foi declarado anteriormente
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar intervenções:', e);
      }

      try {
        const { data: gruposData } = await supabase
          .from('grupos')
          .select('id, ativo');
        const grupos = gruposData || [];
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar grupos:', e);
      }

      try {
        const { data: responsabilidadesData } = await supabase
          .from('responsabilidades_voluntarios')
          .select('id, ativo');
        // responsabilidades = responsabilidadesData || []; // Removido pois já foi declarado anteriormente
      } catch (e) {
        console.warn('⚠️ [DASHBOARD] Erro ao carregar responsabilidades:', e);
      }

      console.log('✅ [DASHBOARD] Dados carregados com sucesso');

      // Usar os dados já calculados anteriormente

      // 🏠 GRUPOS - Carregamento Simplificado
      const { data: grupos } = await supabase
        .from('grupos')
        .select('id, ativo')
        .eq('ativo', true);

      // Outras estatísticas
      const gruposAtivos = (grupos || []).length;
      const responsabilidadesAtivasCount = (responsabilidades || []).filter(r => r.ativo).length;

      const dashboardStats: DashboardStats = {
        // 🐾 ANIMAIS - Estatísticas Avançadas
        totalAnimais: animaisArray.length,
        animaisAtivos: animaisAtivos.length,
        animaisAdotados: animaisAdotados.length,
        animaisArquivados: animaisArquivados.length,
        animaisSemResponsavel,
        animaisUrgentes: intervencoesUrgentes,
        totalCaes,
        totalGatos,
        totalOutros,
        adocoesAno,
        adocoesMes,
        adocoesUltimos30Dias,
        mediaIdadeAnimais: 0, // Implementar depois se necessário
        
        // 👥 VOLUNTÁRIOS - Estatísticas Avançadas
        totalVoluntarios: voluntariosArray.length,
        voluntariosAtivos,
        voluntariosComFormacao,
        novasInscricoesMes,
        
        // 💰 FINANCEIRO - Estatísticas Avançadas
        saldoTotal,
        receitasMes,
        despesasMes,
        receitasAno,
        despesasAno,
        tendenciaFinanceira,
        
        // 🏥 INTERVENÇÕES - Estatísticas Avançadas
        intervencoesPendentes,
        intervencoesUrgentes,
        intervencoesMes,
        custoMedioIntervencao,
        
        // 📋 SISTEMA - Estatísticas Gerais
        gruposAtivos,
        responsabilidadesAtivas: responsabilidadesAtivasCount,
        totalMovimentosFinanceiros: movimentosArray.length,
        ultimaAtualizacao: new Date().toISOString()
      };

      setStats(dashboardStats);

      // 🚨 SISTEMA AVANÇADO DE ALERTAS INTELIGENTES
      console.log('🚨 [DASHBOARD] Gerando alertas inteligentes...');
      const alertas: AlertaCritico[] = [];

      // 🐾 ALERTAS DE ANIMAIS
      if (animaisSemResponsavel > 0) {
        alertas.push({
          id: 'sem-responsavel',
          tipo: 'animal',
          titulo: 'Animais sem Responsável',
          descricao: `${animaisSemResponsavel} animais ativos precisam de voluntário responsável`,
          prioridade: animaisSemResponsavel > 10 ? 'critica' : 'alta',
          icone: '🐾',
          cor: animaisSemResponsavel > 10 ? '#dc2626' : '#ea580c',
          link: '/animais',
          acao: 'Atribuir Responsáveis',
          contador: animaisSemResponsavel
        });
      }

      if (intervencoesUrgentes > 0) {
        alertas.push({
          id: 'intervencoes-urgentes',
          tipo: 'intervencao',
          titulo: 'Intervenções Urgentes',
          descricao: `${intervencoesUrgentes} intervenções marcadas como urgentes`,
          prioridade: 'critica',
          icone: '🚨',
          cor: '#dc2626',
          link: '/intervencoes',
          acao: 'Ver Urgentes',
          contador: intervencoesUrgentes
        });
      }

      // 💰 ALERTAS FINANCEIROS
      if (saldoTotal < 0) {
        alertas.push({
          id: 'saldo-negativo',
          tipo: 'financeiro',
          titulo: 'Saldo Negativo',
          descricao: `Saldo atual: €${saldoTotal.toFixed(2)}`,
          prioridade: 'critica',
          icone: '💸',
          cor: '#dc2626',
          link: '/dashboard-financeiro',
          acao: 'Ver Finanças'
        });
      }

      if (despesasMes > receitasMes * 1.5) {
        alertas.push({
          id: 'despesas-altas',
          tipo: 'financeiro',
          titulo: 'Despesas Elevadas',
          descricao: `Despesas do mês 50% acima das receitas`,
          prioridade: 'alta',
          icone: '📊',
          cor: '#ea580c',
          link: '/gestao-financeira',
          acao: 'Analisar Gastos'
        });
      }

      // 🏥 ALERTAS DE INTERVENÇÕES
      if (intervencoesPendentes > 5) {
        alertas.push({
          id: 'intervencoes-pendentes',
          tipo: 'intervencao',
          titulo: 'Muitas Intervenções Pendentes',
          descricao: `${intervencoesPendentes} intervenções aguardando atendimento`,
          prioridade: 'alta',
          icone: '⏰',
          cor: '#ea580c',
          link: '/intervencoes',
          acao: 'Agendar',
          contador: intervencoesPendentes
        });
      }

      // 👥 ALERTAS DE VOLUNTÁRIOS
      if (voluntariosAtivos < 5) {
        alertas.push({
          id: 'poucos-voluntarios',
          tipo: 'voluntario',
          titulo: 'Poucos Voluntários Ativos',
          descricao: `Apenas ${voluntariosAtivos} voluntários ativos`,
          prioridade: 'media',
          icone: '👥',
          cor: '#d97706',
          link: '/voluntarios/gestao',
          acao: 'Recrutar Mais'
        });
      }

      if (saldoTotal < 0) {
        alertas.push({
          id: 'saldo-negativo',
          tipo: 'financeiro',
          titulo: 'Saldo Negativo',
          descricao: `Saldo atual: €${saldoTotal.toFixed(2)}`,
          prioridade: 'alta',
          link: '/dashboard-financeiro'
        });
      }

      setAlertasCriticos(alertas);

      // Gerar atividade recente (simulada por agora)
      const atividades: AtividadeRecente[] = [
        {
          id: '1',
          tipo: 'animal',
          titulo: 'Sistema Atualizado',
          descricao: 'Dashboard carregado com sucesso',
          data: new Date().toISOString()
        }
      ];

      setAtividadeRecente(atividades);

      console.log('✅ [DASHBOARD] Dashboard carregado com sucesso');

    } catch (error: any) {
      console.error('💥 [DASHBOARD] Erro ao carregar dashboard:', error);
      setError(error.message || 'Erro ao carregar dados do dashboard');
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard. Tentando novamente...",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 [DASHBOARD] Componente montado, iniciando carregamento...');
    fetchDashboardStats();
    
    // Atualizar dados a cada 5 minutos (apenas se não houver erro)
    const interval = setInterval(() => {
      if (!error) {
        fetchDashboardStats();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      console.log('🔄 [DASHBOARD] Limpando interval...');
      clearInterval(interval);
    };
  }, []);

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <UserHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <div className="absolute inset-0 h-12 w-12 mx-auto border-4 border-blue-200 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Carregando Dashboard Avançado</h3>
              <p className="text-gray-600">Processando estatísticas, alertas e atividades...</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <UserHeader />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardStats} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <UserHeader />
        
        {/* 🚨 ALERTAS INTELIGENTES AVANÇADOS */}
        {alertasCriticos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                Alertas Críticos
                <Badge variant="destructive" className="ml-2">{alertasCriticos.length}</Badge>
              </h2>
              <p className="text-sm text-gray-600">Requer atenção imediata</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alertasCriticos.map((alerta) => {
                const borderColor = alerta.prioridade === 'critica' ? 'border-l-red-500' : 
                                   alerta.prioridade === 'alta' ? 'border-l-orange-500' : 'border-l-yellow-500';
                const bgColor = alerta.prioridade === 'critica' ? 'bg-red-50' : 
                               alerta.prioridade === 'alta' ? 'bg-orange-50' : 'bg-yellow-50';
                
                return (
                  <Card key={alerta.id} className={`border-l-4 ${borderColor} ${bgColor} hover:shadow-lg transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{alerta.icone}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{alerta.titulo}</h3>
                            <Badge 
                              variant={alerta.prioridade === 'critica' ? 'destructive' : 'secondary'}
                              className="text-xs mt-1"
                            >
                              {alerta.prioridade.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        {alerta.contador && (
                          <div className="text-right">
                            <div className="text-2xl font-bold" style={{color: alerta.cor}}>
                              {alerta.contador}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{alerta.descricao}</p>
                      {alerta.link && (
                        <Link to={alerta.link}>
                          <Button size="sm" className="w-full" style={{backgroundColor: alerta.cor}}>
                            {alerta.acao || 'Ver Detalhes'}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 📊 ESTATÍSTICAS PRINCIPAIS AVANÇADAS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Estatísticas em Tempo Real
            </h2>
            <Badge variant="outline" className="ml-2">
              Atualizado: {stats ? new Date(stats.ultimaAtualizacao).toLocaleTimeString('pt-PT', {hour: '2-digit', minute: '2-digit'}) : '--'}
            </Badge>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* 🐾 ANIMAIS - Card Avançado */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <PawPrint className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm font-medium">ANIMAIS</p>
                      <p className="text-3xl font-bold">{stats?.totalAnimais || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Ativos:</span>
                    <span className="font-semibold">{stats?.animaisAtivos || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Sem Responsável:</span>
                    <span className={`font-semibold ${(stats?.animaisSemResponsavel || 0) > 0 ? 'text-yellow-300' : ''}`}>
                      {stats?.animaisSemResponsavel || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Cães/Gatos:</span>
                    <span className="font-semibold">{(stats?.totalCaes || 0) + (stats?.totalGatos || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ❤️ ADOÇÕES - Card Avançado */}
            <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm font-medium">ADOÇÕES</p>
                      <p className="text-3xl font-bold">{stats?.adocoesAno || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-200">Este Mês:</span>
                    <span className="font-semibold">{stats?.adocoesMes || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-200">Últimos 30 dias:</span>
                    <span className="font-semibold">{stats?.adocoesUltimos30Dias || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-200">Taxa Mensal:</span>
                    <span className="font-semibold">{stats?.adocoesAno ? Math.round((stats.adocoesAno / 12) * 10) / 10 : 0}/mês</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 👥 VOLUNTÁRIOS - Card Avançado */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-purple-100 text-sm font-medium">VOLUNTÁRIOS</p>
                      <p className="text-3xl font-bold">{stats?.totalVoluntarios || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Ativos:</span>
                    <span className="font-semibold">{stats?.voluntariosAtivos || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Com Formação:</span>
                    <span className="font-semibold">{stats?.voluntariosComFormacao || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">Novos (mês):</span>
                    <span className="font-semibold">{stats?.novasInscricoesMes || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 💰 FINANCEIRO - Card Avançado */}
            <Card className={`bg-gradient-to-br ${(stats?.saldoTotal || 0) >= 0 ? 'from-emerald-500 to-emerald-700' : 'from-red-500 to-red-700'} text-white hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">SALDO TOTAL</p>
                      <p className="text-3xl font-bold">€{(stats?.saldoTotal || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {stats?.tendenciaFinanceira === 'positiva' ? (
                      <TrendingUp className="h-8 w-8 text-white/60" />
                    ) : stats?.tendenciaFinanceira === 'negativa' ? (
                      <TrendingDown className="h-8 w-8 text-white/60" />
                    ) : (
                      <Target className="h-8 w-8 text-white/60" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Receitas (mês):</span>
                    <span className="font-semibold text-green-200">€{(stats?.receitasMes || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Despesas (mês):</span>
                    <span className="font-semibold text-red-200">€{(stats?.despesasMes || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                    <span className="text-white/70">Saldo Mensal:</span>
                    <span className={`font-semibold ${((stats?.receitasMes || 0) - (stats?.despesasMes || 0)) >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                      €{((stats?.receitasMes || 0) - (stats?.despesasMes || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Distribuição por Espécie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cães</span>
                <span className="text-sm text-gray-600">{stats?.totalCaes || 0}</span>
              </div>
              <Progress value={stats?.totalAnimais ? (stats.totalCaes / stats.totalAnimais) * 100 : 0} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gatos</span>
                <span className="text-sm text-gray-600">{stats?.totalGatos || 0}</span>
              </div>
              <Progress value={stats?.totalAnimais ? (stats.totalGatos / stats.totalAnimais) * 100 : 0} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outros</span>
                <span className="text-sm text-gray-600">{stats?.totalOutros || 0}</span>
              </div>
              <Progress value={stats?.totalAnimais ? (stats.totalOutros / stats.totalAnimais) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-blue-600" />
                Gestão de Animais
              </CardTitle>
              <CardDescription>
                Gerir animais, adoções e responsabilidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/animais">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos os Animais
                </Button>
              </Link>
              <Link to="/novo-animal">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Novo Animal
                </Button>
              </Link>
              <Link to="/animais-arquivados">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Animais Arquivados
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Cuidados Veterinários
              </CardTitle>
              <CardDescription>
                Intervenções e acompanhamento médico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/intervencoes">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Intervenções ({stats?.intervencoesPendentes || 0} pendentes)
                </Button>
              </Link>
              <Link to="/eventos">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Eventos da Vida
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Gestão Financeira
              </CardTitle>
              <CardDescription>
                Controlo financeiro e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/dashboard-financeiro">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard Financeiro
                </Button>
              </Link>
              <Link to="/gestao-financeira">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Gestão de Movimentos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Sistema de Voluntários
              </CardTitle>
              <CardDescription>
                Gestão de voluntários e formação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/voluntarios">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Dashboard Voluntários
                </Button>
              </Link>
              <Link to="/voluntarios/gestao">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Gestão de Voluntários
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Relatórios e Análises
              </CardTitle>
              <CardDescription>
                Relatórios detalhados e estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/relatorios">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios Gerais
                </Button>
              </Link>
              <Link to="/voluntarios/relatorios">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Relatórios Voluntários
                </Button>
              </Link>
            </CardContent>
          </Card>

          {hasPermission('admin') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Administração
                </CardTitle>
                <CardDescription>
                  Configurações e gestão do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/administracao">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Painel de Administração
                  </Button>
                </Link>
                <Link to="/configuracoes">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Configurações Gerais
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sistema de Lembretes - Temporariamente Desativado */}
        {/* <SistemaLembretes /> */}
      </div>
    </div>
  );
};

export default Index;