import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  PawPrint, 
  Activity, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  FileText,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RelatorioStats {
  totalAnimais: number;
  animaisAtivos: number;
  animaisAdotados: number;
  animaisObito: number;
  animaisTransferidos: number;
  totalIntervencoes: number;
  custoTotalIntervencoes: number;
  intervencoesPorTipo: { nome: string; categoria: string; count: number }[];
  animaisPorEspecie: { especie: string; count: number }[];
  adocoesPorMes: { mes: string; count: number }[];
  intervencoesPorMes: { mes: string; count: number; custo: number }[];
}

const Relatorios = () => {
  const [stats, setStats] = useState<RelatorioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    try {
      // Buscar dados dos animais (excluindo arquivados)
      const { data: animaisData, error: animaisError } = await supabase
        .from('animais')
        .select('*');
      
      if (animaisError) {
        console.error('Erro ao buscar animais:', animaisError);
        throw animaisError;
      }
      
      // Filtrar animais não arquivados no frontend
      const animais = animaisData?.filter(animal => !animal.arquivado) || animaisData || [];


      // Buscar intervenções com tipos
      const { data: intervencoes, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          *,
          tipo_intervencao:tipos_intervencoes(nome, descricao)
        `);

      if (intervencoesError) throw intervencoesError;

      // Processar estatísticas
      const totalAnimais = animais?.length || 0;
      const animaisAtivos = animais?.filter(a => a.estado === 'Ativo').length || 0;
      const animaisAdotados = animais?.filter(a => a.estado === 'Adotado').length || 0;
      const animaisObito = animais?.filter(a => a.estado === 'Óbito').length || 0;
      const animaisTransferidos = animais?.filter(a => a.estado === 'Transferido').length || 0;

      const totalIntervencoes = intervencoes?.length || 0;
      const custoTotalIntervencoes = intervencoes?.reduce((sum, i) => sum + (i.custo || 0), 0) || 0;

      // Intervenções por tipo
      const intervencoesPorTipo = intervencoes?.reduce((acc: any[], curr) => {
        const tipo = curr.tipo_intervencao;
        if (tipo) {
          const existing = acc.find(item => item.nome === tipo.nome);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ nome: tipo.nome, count: 1 });
          }
        }
        return acc;
      }, []) || [];

      // Animais por espécie
      const animaisPorEspecie = animais?.reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.especie === curr.especie);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ especie: curr.especie, count: 1 });
        }
        return acc;
      }, []) || [];

      // Adoções por mês (últimos 12 meses)
      const adocoesPorMes = processarDadosPorMes(
        animais?.filter(a => a.estado === 'Adotado') || [],
        'updated_at'
      );

      // Intervenções por mês
      const intervencoesPorMes = processarIntervencoesPorMes(intervencoes || []);

      setStats({
        totalAnimais,
        animaisAtivos,
        animaisAdotados,
        animaisObito,
        animaisTransferidos,
        totalIntervencoes,
        custoTotalIntervencoes,
        intervencoesPorTipo: intervencoesPorTipo.sort((a, b) => b.count - a.count),
        animaisPorEspecie: animaisPorEspecie.sort((a, b) => b.count - a.count),
        adocoesPorMes,
        intervencoesPorMes
      });

    } catch (error: any) {
      toast({
        title: "Erro ao carregar relatórios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processarDadosPorMes = (dados: any[], campoData: string) => {
    const meses = [];
    const hoje = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesAno = data.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      
      const count = dados.filter(item => {
        const itemData = new Date(item[campoData]);
        return itemData.getMonth() === data.getMonth() && 
               itemData.getFullYear() === data.getFullYear();
      }).length;
      
      meses.push({ mes: mesAno, count });
    }
    
    return meses;
  };

  const processarIntervencoesPorMes = (intervencoes: any[]) => {
    const meses = [];
    const hoje = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesAno = data.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      
      const intervencoesMes = intervencoes.filter(item => {
        const itemData = new Date(item.data_intervencao);
        return itemData.getMonth() === data.getMonth() && 
               itemData.getFullYear() === data.getFullYear();
      });
      
      const count = intervencoesMes.length;
      const custo = intervencoesMes.reduce((sum, i) => sum + (i.custo || 0), 0);
      
      meses.push({ mes: mesAno, count, custo });
    }
    
    return meses;
  };

  const exportarRelatorio = () => {
    if (!stats) return;

    const relatorioTexto = `
RELATÓRIO VALENTÃO AO RESGATE
Gerado em: ${new Date().toLocaleDateString('pt-PT')}

=== RESUMO GERAL ===
Total de Animais: ${stats.totalAnimais}
Animais Ativos: ${stats.animaisAtivos}
Animais Adotados: ${stats.animaisAdotados}
Óbitos: ${stats.animaisObito}
Transferidos: ${stats.animaisTransferidos}

=== INTERVENÇÕES ===
Total de Intervenções: ${stats.totalIntervencoes}
Custo Total: €${stats.custoTotalIntervencoes.toFixed(2)}

=== ANIMAIS POR ESPÉCIE ===
${stats.animaisPorEspecie.map(e => `${e.especie}: ${e.count}`).join('\n')}

=== INTERVENÇÕES MAIS COMUNS ===
${stats.intervencoesPorTipo.slice(0, 10).map(i => `${i.nome} (${i.categoria}): ${i.count}`).join('\n')}
    `;

    const blob = new Blob([relatorioTexto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-valentao-ao-resgate-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado",
      description: "O relatório foi baixado com sucesso",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Erro ao carregar dados</p>
          <Link to="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <img 
              src="/images/BackgroundEraser_20250411_205630024.png" 
              alt="Valentão ao Resgate - Logótipo Oficial" 
              className="h-16 w-auto object-contain mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatórios - Valentão ao Resgate</h1>
              <p className="text-gray-600 mt-2">Estatísticas e análises dos animais da associação</p>
            </div>
          </div>
          <Button onClick={exportarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Animais</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnimais}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Animais Ativos</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.animaisAtivos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adotados</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.animaisAdotados}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intervenções</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalIntervencoes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">€{stats.custoTotalIntervencoes.toFixed(0)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="especies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="especies">Por Espécie</TabsTrigger>
            <TabsTrigger value="intervencoes">Intervenções</TabsTrigger>
            <TabsTrigger value="adocoes">Adoções</TabsTrigger>
            <TabsTrigger value="custos">Custos</TabsTrigger>
          </TabsList>

          {/* Animais por Espécie */}
          <TabsContent value="especies">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Espécie</CardTitle>
                  <CardDescription>Quantidade de animais por espécie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.animaisPorEspecie.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-600 rounded mr-3" style={{
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}></div>
                          <span className="font-medium">{item.especie}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{item.count}</span>
                          <Badge variant="outline">
                            {((item.count / stats.totalAnimais) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado dos Animais</CardTitle>
                  <CardDescription>Situação atual dos animais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Ativos</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">{stats.animaisAtivos}</span>
                        <Badge variant="default">
                          {stats.totalAnimais > 0 ? ((stats.animaisAtivos / stats.totalAnimais) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Adotados</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">{stats.animaisAdotados}</span>
                        <Badge variant="secondary">
                          {stats.totalAnimais > 0 ? ((stats.animaisAdotados / stats.totalAnimais) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Transferidos</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-purple-600">{stats.animaisTransferidos}</span>
                        <Badge variant="outline">
                          {stats.totalAnimais > 0 ? ((stats.animaisTransferidos / stats.totalAnimais) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Óbitos</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">{stats.animaisObito}</span>
                        <Badge variant="destructive">
                          {stats.totalAnimais > 0 ? ((stats.animaisObito / stats.totalAnimais) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intervenções */}
          <TabsContent value="intervencoes">
            <Card>
              <CardHeader>
                <CardTitle>Intervenções Mais Comuns</CardTitle>
                <CardDescription>Tipos de intervenções realizadas com mais frequência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.intervencoesPorTipo.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-sm text-gray-600">{item.categoria}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{item.count}</div>
                        <div className="text-sm text-gray-600">intervenções</div>
                      </div>
                    </div>
                  ))}
                  {stats.intervencoesPorTipo.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma intervenção registrada ainda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adoções */}
          <TabsContent value="adocoes">
            <Card>
              <CardHeader>
                <CardTitle>Adoções por Mês</CardTitle>
                <CardDescription>Histórico de adoções nos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.adocoesPorMes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{item.mes}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">{item.count}</span>
                        <span className="text-sm text-gray-600">adoções</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custos */}
          <TabsContent value="custos">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Mês</CardTitle>
                <CardDescription>Gastos com intervenções nos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.intervencoesPorMes.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.mes}</div>
                        <div className="text-sm text-gray-600">{item.count} intervenções</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">€{item.custo.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">
                          {item.count > 0 ? `€${(item.custo / item.count).toFixed(2)} média` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Relatorios;