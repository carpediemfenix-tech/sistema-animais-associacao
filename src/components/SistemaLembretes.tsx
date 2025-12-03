import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Stethoscope,
  CheckCircle,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Lembrete {
  id: string;
  tipo: 'vacina' | 'consulta' | 'medicacao' | 'revisao' | 'intervencao' | 'localizacao';
  titulo: string;
  descricao: string;
  data_vencimento: string;
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  animal_id?: string;
  animal_nome?: string;
  ativo: boolean;
  created_at: string;
}

const SistemaLembretes = () => {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const { toast } = useToast();

  useEffect(() => {
    gerarLembretesInteligentes();
  }, []);

  const gerarLembretesInteligentes = async () => {
    try {
      setLoading(true);
      console.log('🔔 [LEMBRETES] Gerando lembretes inteligentes...');

      const lembretesGerados: Lembrete[] = [];
      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      // 1. Buscar animais ativos (excluir arquivados)
      const { data: animais, error: animaisError } = await supabase
        .from('animais')
        .select('*')
        .eq('estado', 'Ativo')
        .eq('arquivado', false);

      if (animaisError) throw animaisError;

      // 2. Buscar intervenções com próximas datas
      const { data: intervencoes, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select('*, animais(nome)')
        .not('proxima_data', 'is', null)
        .gte('proxima_data', hoje.toISOString().split('T')[0])
        .lte('proxima_data', em30Dias.toISOString().split('T')[0]);

      if (intervencoesError) throw intervencoesError;

      // 3. Buscar tipos de intervenções
      const { data: tiposIntervencoes, error: tiposError } = await supabase
        .from('tipos_intervencoes')
        .select('*');

      if (tiposError) throw tiposError;

      // 4. Gerar lembretes de intervenções próximas
      intervencoes?.forEach((intervencao) => {
        const tipo = tiposIntervencoes?.find(t => t.id === intervencao.tipo_intervencao_id);
        const diasRestantes = Math.ceil((new Date(intervencao.proxima_data).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        let urgencia: 'baixa' | 'media' | 'alta' | 'critica' = 'baixa';
        if (diasRestantes <= 3) urgencia = 'critica';
        else if (diasRestantes <= 7) urgencia = 'alta';
        else if (diasRestantes <= 15) urgencia = 'media';

        lembretesGerados.push({
          id: `intervencao_${intervencao.id}`,
          tipo: tipo?.nome?.toLowerCase().includes('vacina') ? 'vacina' : 
                tipo?.nome?.toLowerCase().includes('consulta') ? 'consulta' : 'intervencao',
          titulo: `${tipo?.nome || 'Intervenção'} - ${intervencao.animais?.nome}`,
          descricao: `Próxima ${tipo?.nome?.toLowerCase()} agendada para ${new Date(intervencao.proxima_data).toLocaleDateString('pt-PT')}`,
          data_vencimento: intervencao.proxima_data,
          urgencia,
          animal_id: intervencao.animal_id,
          animal_nome: intervencao.animais?.nome,
          ativo: true,
          created_at: new Date().toISOString()
        });
      });

      // 5. Gerar lembretes para animais sem intervenções recentes
      animais?.forEach((animal) => {
        const ultimaIntervencao = intervencoes?.find(i => i.animal_id === animal.id);
        
        if (!ultimaIntervencao) {
          // Animal sem intervenções recentes - lembrete de revisão
          lembretesGerados.push({
            id: `revisao_${animal.id}`,
            tipo: 'revisao',
            titulo: `Revisão Médica - ${animal.nome}`,
            descricao: `${animal.nome} não tem intervenções registadas recentemente. Considere agendar uma revisão.`,
            data_vencimento: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            urgencia: 'media',
            animal_id: animal.id,
            animal_nome: animal.nome,
            ativo: true,
            created_at: new Date().toISOString()
          });
        }
      });

      // 6. Lembretes baseados na idade dos animais
      animais?.forEach((animal) => {
        const idadeAnos = animal.idade || 0;
        
        if (idadeAnos >= 8) {
          // Animais idosos precisam de mais cuidados
          lembretesGerados.push({
            id: `idoso_${animal.id}`,
            tipo: 'consulta',
            titulo: `Check-up Sénior - ${animal.nome}`,
            descricao: `${animal.nome} tem ${idadeAnos} anos. Animais seniores precisam de check-ups regulares.`,
            data_vencimento: new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            urgencia: 'media',
            animal_id: animal.id,
            animal_nome: animal.nome,
            ativo: true,
            created_at: new Date().toISOString()
          });
        }
      });

      // 7. Ordenar por urgência e data
      lembretesGerados.sort((a, b) => {
        const urgenciaOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
        const urgenciaA = urgenciaOrder[a.urgencia];
        const urgenciaB = urgenciaOrder[b.urgencia];
        
        if (urgenciaA !== urgenciaB) {
          return urgenciaB - urgenciaA;
        }
        
        return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime();
      });

      console.log('✅ [LEMBRETES] Lembretes gerados:', lembretesGerados.length);
      setLembretes(lembretesGerados);

    } catch (error: any) {
      console.error('❌ [LEMBRETES] Erro ao gerar lembretes:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível gerar os lembretes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLido = (lembreteId: string) => {
    setLembretes(prev => prev.filter(l => l.id !== lembreteId));
    toast({
      title: "✅ Lembrete marcado como lido",
      description: "O lembrete foi removido da lista",
    });
  };

  const getIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case 'vacina': return <Pill className="h-4 w-4" />;
      case 'consulta': return <Stethoscope className="h-4 w-4" />;
      case 'medicacao': return <Pill className="h-4 w-4" />;
      case 'revisao': return <Heart className="h-4 w-4" />;
      case 'intervencao': return <Stethoscope className="h-4 w-4" />;
      case 'localizacao': return <MapPin className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getCorPorUrgencia = (urgencia: string) => {
    switch (urgencia) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCorCardPorUrgencia = (urgencia: string) => {
    switch (urgencia) {
      case 'critica': return 'border-l-4 border-l-red-500 bg-red-50/50';
      case 'alta': return 'border-l-4 border-l-orange-500 bg-orange-50/50';
      case 'media': return 'border-l-4 border-l-yellow-500 bg-yellow-50/50';
      case 'baixa': return 'border-l-4 border-l-green-500 bg-green-50/50';
      default: return 'border-l-4 border-l-gray-500 bg-gray-50/50';
    }
  };

  const lembretesFiltered = lembretes.filter(lembrete => {
    const matchUrgencia = filtroUrgencia === 'todos' || lembrete.urgencia === filtroUrgencia;
    const matchTipo = filtroTipo === 'todos' || lembrete.tipo === filtroTipo;
    return matchUrgencia && matchTipo;
  });

  const contarPorUrgencia = (urgencia: string) => {
    return lembretes.filter(l => l.urgencia === urgencia).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Bell className="h-12 w-12 animate-pulse mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">A gerar lembretes inteligentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-3 rounded-xl">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sistema de Lembretes</h2>
            <p className="text-sm text-gray-600">
              {lembretes.length} lembretes ativos • Atualizado automaticamente
            </p>
          </div>
        </div>
        <Button onClick={gerarLembretesInteligentes} variant="outline" size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Resumo por Urgência */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{contarPorUrgencia('critica')}</div>
            <div className="text-sm text-red-700">Críticos</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{contarPorUrgencia('alta')}</div>
            <div className="text-sm text-orange-700">Alta Prioridade</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{contarPorUrgencia('media')}</div>
            <div className="text-sm text-yellow-700">Média Prioridade</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{contarPorUrgencia('baixa')}</div>
            <div className="text-sm text-green-700">Baixa Prioridade</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filtroUrgencia === 'todos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroUrgencia('todos')}
        >
          Todos
        </Button>
        <Button
          variant={filtroUrgencia === 'critica' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroUrgencia('critica')}
          className="border-red-200 hover:bg-red-50"
        >
          Críticos
        </Button>
        <Button
          variant={filtroUrgencia === 'alta' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroUrgencia('alta')}
          className="border-orange-200 hover:bg-orange-50"
        >
          Alta
        </Button>
        <Button
          variant={filtroUrgencia === 'media' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroUrgencia('media')}
          className="border-yellow-200 hover:bg-yellow-50"
        >
          Média
        </Button>
      </div>

      {/* Lista de Lembretes */}
      <div className="space-y-4">
        {lembretesFiltered.length === 0 ? (
          <Card className="text-center p-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎉 Tudo em dia!
            </h3>
            <p className="text-gray-600">
              Não há lembretes pendentes no momento. Excelente trabalho!
            </p>
          </Card>
        ) : (
          lembretesFiltered.map((lembrete) => (
            <Card key={lembrete.id} className={`hover-lift ${getCorCardPorUrgencia(lembrete.urgencia)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      {getIconePorTipo(lembrete.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{lembrete.titulo}</h4>
                        <Badge className={getCorPorUrgencia(lembrete.urgencia)}>
                          {lembrete.urgencia.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{lembrete.descricao}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(lembrete.data_vencimento).toLocaleDateString('pt-PT')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {Math.ceil((new Date(lembrete.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lembrete.animal_id && (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/animal/${lembrete.animal_id}`}>
                          Ver Animal
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => marcarComoLido(lembrete.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SistemaLembretes;