import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Activity, 
  CalendarDays,
  PawPrint,
  Stethoscope,
  MapPin,
  User,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface AgendaItem {
  id: string;
  tipo: 'intervencao' | 'evento';
  titulo: string;
  animal_nome: string;
  animal_id: string;
  data: string;
  urgente?: boolean;
  veterinario?: string;
  clinica?: string;
  descricao?: string;
  tipo_evento?: string;
  observacoes?: string;
}

const AgendaDashboard = () => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgendaItems();
  }, []);

  const fetchAgendaItems = async () => {
    try {
      setLoading(true);
      console.log('📅 [AGENDA] Carregando próximos eventos e intervenções...');

      const hoje = new Date();
      const proximosMeses = new Date();
      proximosMeses.setMonth(proximosMeses.getMonth() + 2); // Próximos 2 meses

      // Buscar próximas intervenções agendadas
      const { data: intervencoes, error: intervencoesError } = await supabase
        .from('intervencoes')
        .select(`
          id,
          data_intervencao,
          proxima_data,
          veterinario,
          clinica,
          observacoes,
          urgente,
          animal_id,
          tipos_intervencoes(nome),
          animais(nome)
        `)
        .not('proxima_data', 'is', null)
        .gte('proxima_data', hoje.toISOString().split('T')[0])
        .lte('proxima_data', proximosMeses.toISOString().split('T')[0])
        .order('proxima_data', { ascending: true });

      if (intervencoesError) {
        console.error('❌ [AGENDA] Erro ao buscar intervenções:', intervencoesError);
      }

      // Buscar próximos eventos agendados
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select(`
          id,
          data_evento,
          tipo_evento,
          descricao,
          observacoes,
          animal_id,
          animais(nome)
        `)
        .gte('data_evento', hoje.toISOString().split('T')[0])
        .lte('data_evento', proximosMeses.toISOString().split('T')[0])
        .order('data_evento', { ascending: true });

      if (eventosError) {
        console.error('❌ [AGENDA] Erro ao buscar eventos:', eventosError);
      }

      // Processar intervenções
      const intervencoesAgenda: AgendaItem[] = (intervencoes || []).map(i => ({
        id: i.id,
        tipo: 'intervencao' as const,
        titulo: i.tipos_intervencoes?.nome || 'Intervenção',
        animal_nome: i.animais?.nome || 'Animal não encontrado',
        animal_id: i.animal_id,
        data: i.proxima_data!,
        urgente: i.urgente,
        veterinario: i.veterinario,
        clinica: i.clinica,
        observacoes: i.observacoes
      }));

      // Processar eventos
      const eventosAgenda: AgendaItem[] = (eventos || []).map(e => ({
        id: e.id,
        tipo: 'evento' as const,
        titulo: e.tipo_evento,
        animal_nome: e.animais?.nome || 'Animal não encontrado',
        animal_id: e.animal_id,
        data: e.data_evento,
        descricao: e.descricao,
        observacoes: e.observacoes
      }));

      // Combinar e ordenar por data
      const todosItems = [...intervencoesAgenda, ...eventosAgenda]
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .slice(0, 10); // Mostrar apenas os próximos 10 itens

      console.log('✅ [AGENDA] Items carregados:', todosItems.length);
      setAgendaItems(todosItems);

    } catch (error: any) {
      console.error('💥 [AGENDA] Erro geral:', error);
      toast({
        title: "Erro ao carregar agenda",
        description: "Não foi possível carregar os próximos eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    // Verificar se é hoje
    if (date.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    }
    
    // Verificar se é amanhã
    if (date.toDateString() === amanha.toDateString()) {
      return 'Amanhã';
    }

    // Verificar se é esta semana
    const diasDiferenca = Math.ceil((date.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diasDiferenca <= 7) {
      return date.toLocaleDateString('pt-PT', { weekday: 'long' });
    }

    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== hoje.getFullYear() ? 'numeric' : undefined
    });
  };

  const getItemIcon = (item: AgendaItem) => {
    if (item.tipo === 'intervencao') {
      return <Stethoscope className="h-4 w-4" />;
    }
    return <CalendarDays className="h-4 w-4" />;
  };

  const getItemColor = (item: AgendaItem) => {
    if (item.urgente) {
      return 'border-l-red-500 bg-red-50';
    }
    if (item.tipo === 'intervencao') {
      return 'border-l-blue-500 bg-blue-50';
    }
    return 'border-l-green-500 bg-green-50';
  };

  const isOverdue = (dateString: string) => {
    const date = new Date(dateString);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return date < hoje;
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const hoje = new Date();
    return date.toDateString() === hoje.toDateString();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Agenda</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAgendaItems}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Próximos eventos e intervenções agendadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : agendaItems.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">Nenhum evento agendado</p>
            <p className="text-xs text-gray-500">
              Os próximos eventos e intervenções aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {agendaItems.map((item) => (
              <div
                key={`${item.tipo}-${item.id}`}
                className={`p-3 rounded-lg border-l-4 transition-colors hover:bg-gray-50 ${getItemColor(item)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getItemIcon(item)}
                      <span className="font-medium text-sm truncate">
                        {item.titulo}
                      </span>
                      {item.urgente && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Urgente
                        </Badge>
                      )}
                      {isToday(item.data) && (
                        <Badge className="text-xs bg-orange-100 text-orange-800">
                          Hoje
                        </Badge>
                      )}
                      {isOverdue(item.data) && (
                        <Badge variant="destructive" className="text-xs">
                          Atrasado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                      <PawPrint className="h-3 w-3" />
                      <span className="truncate">{item.animal_nome}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(item.data)}</span>
                      {item.veterinario && (
                        <>
                          <User className="h-3 w-3 ml-2" />
                          <span className="truncate">{item.veterinario}</span>
                        </>
                      )}
                      {item.clinica && (
                        <>
                          <MapPin className="h-3 w-3 ml-2" />
                          <span className="truncate">{item.clinica}</span>
                        </>
                      )}
                    </div>
                    
                    {(item.observacoes || item.descricao) && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {item.observacoes || item.descricao}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 p-0 flex-shrink-0"
                    asChild
                  >
                    <Link to={`/animal/${item.animal_id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {agendaItems.length > 0 && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/intervencoes">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Agenda Completa
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgendaDashboard;