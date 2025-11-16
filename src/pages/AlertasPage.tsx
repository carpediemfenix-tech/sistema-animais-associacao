import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Calendar, Clock, Heart, Pill, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAlertas } from "@/hooks/useAlertas";

const AlertasPage = () => {
  const { alertas, loading } = useAlertas();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterPrioridade, setFilterPrioridade] = useState("todos");

  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'vacina_atraso': return <Heart className="h-5 w-5 text-red-500" />;
      case 'consulta_pendente': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'sem_adocao': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'medicacao_continua': return <Pill className="h-5 w-5 text-purple-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
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
      case 'vacina_atraso': return 'Vacina em Atraso';
      case 'consulta_pendente': return 'Consulta Pendente';
      case 'sem_adocao': return 'Sem Adoção';
      case 'medicacao_continua': return 'Medicação Contínua';
      default: return 'Alerta';
    }
  };

  const filteredAlertas = alertas.filter((alerta) => {
    const matchesSearch = alerta.animal_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alerta.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "todos" || alerta.tipo === filterTipo;
    const matchesPrioridade = filterPrioridade === "todos" || alerta.prioridade === filterPrioridade;
    
    return matchesSearch && matchesTipo && matchesPrioridade;
  });

  // Ordenar por prioridade (alta -> média -> baixa)
  const sortedAlertas = filteredAlertas.sort((a, b) => {
    const prioridadeOrder = { 'alta': 3, 'media': 2, 'baixa': 1 };
    return prioridadeOrder[b.prioridade as keyof typeof prioridadeOrder] - 
           prioridadeOrder[a.prioridade as keyof typeof prioridadeOrder];
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">A carregar alertas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/images/BackgroundEraser_20250411_205630024.png" 
            alt="Valentão ao Resgate" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold">Alertas do Sistema - Valentão ao Resgate</h1>
            <p className="text-muted-foreground">
              Monitorização automática de cuidados veterinários e adoções
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">
            Voltar ao Início
          </Link>
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {alertas.filter(a => a.prioridade === 'alta').length}
              </div>
              <p className="text-sm text-muted-foreground">Prioridade Alta</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {alertas.filter(a => a.prioridade === 'media').length}
              </div>
              <p className="text-sm text-muted-foreground">Prioridade Média</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {alertas.filter(a => a.prioridade === 'baixa').length}
              </div>
              <p className="text-sm text-muted-foreground">Prioridade Baixa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {alertas.length}
              </div>
              <p className="text-sm text-muted-foreground">Total de Alertas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por animal ou tipo de alerta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="vacina_atraso">Vacinas</SelectItem>
            <SelectItem value="consulta_pendente">Consultas</SelectItem>
            <SelectItem value="sem_adocao">Sem Adoção</SelectItem>
            <SelectItem value="medicacao_continua">Medicação</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as prioridades</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Alertas */}
      {sortedAlertas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-green-600 mb-4">
                <AlertTriangle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground">
                {alertas.length === 0 
                  ? "Parabéns! Todos os animais estão com os cuidados em dia."
                  : "Tente ajustar os filtros para ver mais alertas."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAlertas.map((alerta) => (
            <Card key={alerta.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertaIcon(alerta.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{alerta.titulo}</h3>
                        <Badge className={getPrioridadeColor(alerta.prioridade)}>
                          {alerta.prioridade.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {getTipoLabel(alerta.tipo)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        <strong>Animal:</strong> {alerta.animal_nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {alerta.descricao}
                      </p>
                      {alerta.data_limite && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Data limite:</strong> {new Date(alerta.data_limite).toLocaleDateString('pt-PT')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/animal/${alerta.animal_id}`}>
                        Ver Animal
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertasPage;