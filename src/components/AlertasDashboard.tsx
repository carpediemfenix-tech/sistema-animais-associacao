import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Clock, Heart, Pill } from "lucide-react";
import { AlertaSistema } from "@/types/alertas";
import { Link } from "react-router-dom";

interface AlertasDashboardProps {
  alertas: AlertaSistema[];
  loading: boolean;
}

const AlertasDashboard = ({ alertas, loading }: AlertasDashboardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A carregar alertas...</p>
        </CardContent>
      </Card>
    );
  }

  const alertasAlta = alertas.filter(a => a.prioridade === 'alta');
  const alertasMedia = alertas.filter(a => a.prioridade === 'media');
  const alertasBaixa = alertas.filter(a => a.prioridade === 'baixa');

  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'vacina_atraso': return <Heart className="h-4 w-4" />;
      case 'consulta_pendente': return <Calendar className="h-4 w-4" />;
      case 'sem_adocao': return <Clock className="h-4 w-4" />;
      case 'medicacao_continua': return <Pill className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500 text-white';
      case 'media': return 'bg-yellow-500 text-white';
      case 'baixa': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'vacina_atraso': return 'Vacina';
      case 'consulta_pendente': return 'Consulta';
      case 'sem_adocao': return 'Adoção';
      case 'medicacao_continua': return 'Medicação';
      default: return 'Alerta';
    }
  };

  if (alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Alertas do Sistema
          </CardTitle>
          <CardDescription>
            Monitorização automática de vacinas, consultas e cuidados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-green-600 mb-2">✅</div>
            <p className="text-muted-foreground">Nenhum alerta ativo no momento!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os animais estão com os cuidados em dia.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas do Sistema
          <Badge variant="outline" className="ml-auto">
            {alertas.length} {alertas.length === 1 ? 'alerta' : 'alertas'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Monitorização automática de vacinas, consultas e cuidados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resumo por prioridade */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {alertasAlta.length > 0 && (
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{alertasAlta.length}</div>
                <div className="text-xs text-red-600">Alta</div>
              </div>
            )}
            {alertasMedia.length > 0 && (
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{alertasMedia.length}</div>
                <div className="text-xs text-yellow-600">Média</div>
              </div>
            )}
            {alertasBaixa.length > 0 && (
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{alertasBaixa.length}</div>
                <div className="text-xs text-blue-600">Baixa</div>
              </div>
            )}
          </div>

          {/* Lista de alertas (máximo 5 na página inicial) */}
          <div className="space-y-2">
            {alertas.slice(0, 5).map((alerta) => (
              <div
                key={alerta.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getAlertaIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {alerta.titulo}
                      </p>
                      <Badge 
                        className={`text-xs ${getPrioridadeColor(alerta.prioridade)}`}
                      >
                        {getTipoLabel(alerta.tipo)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alerta.descricao}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/animal/${alerta.animal_id}`}>
                    Ver
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* Link para ver todos os alertas */}
          {alertas.length > 5 && (
            <div className="text-center pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to="/alertas">
                  Ver todos os {alertas.length} alertas
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertasDashboard;