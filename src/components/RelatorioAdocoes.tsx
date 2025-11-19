import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Heart,
  Calendar,
  TrendingUp,
  Users,
  PawPrint,
  Clock,
  MapPin,
  User
} from "lucide-react";
import LayoutRelatorio from "@/components/LayoutRelatorio";

interface RelatorioAdocoesProps {
  data: any;
  filtroAno: number;
  filtroMes: number;
}

const RelatorioAdocoes = ({ data, filtroAno, filtroMes }: RelatorioAdocoesProps) => {
  const [estatisticasAdocoes, setEstatisticasAdocoes] = useState<any>(null);

  useEffect(() => {
    if (data) {
      calcularEstatisticasAdocoes();
    }
  }, [data, filtroAno, filtroMes]);

  const calcularEstatisticasAdocoes = () => {
    // Filtrar animais adotados
    const animaisAdotados = data.animais.filter((a: any) => a.estado === 'Adotado');
    
    // Filtrar eventos de adoção
    let eventosAdocao = data.eventos.filter((e: any) => 
      e.tipo_evento === 'Adoção' || e.tipo_evento === 'Adocao'
    );

    // Aplicar filtros de período
    if (filtroAno && filtroAno !== 0) {
      eventosAdocao = eventosAdocao.filter((e: any) => 
        new Date(e.data_evento).getFullYear() === filtroAno
      );
    }

    if (filtroMes && filtroMes !== 0) {
      eventosAdocao = eventosAdocao.filter((e: any) => 
        new Date(e.data_evento).getMonth() + 1 === filtroMes
      );
    }

    // Calcular tempo médio até adoção
    const temposAdocao = eventosAdocao.map((evento: any) => {
      const animal = data.animais.find((a: any) => a.id === evento.animal_id);
      if (animal && animal.data_entrada) {
        const dataEntrada = new Date(animal.data_entrada);
        const dataAdocao = new Date(evento.data_evento);
        return Math.ceil((dataAdocao.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
      }
      return 0;
    }).filter(tempo => tempo > 0);

    const tempoMedioAdocao = temposAdocao.length > 0 
      ? Math.round(temposAdocao.reduce((sum, tempo) => sum + tempo, 0) / temposAdocao.length)
      : 0;

    // Análise por espécie
    const adocoesPorEspecie = eventosAdocao.reduce((acc: any, evento: any) => {
      const animal = data.animais.find((a: any) => a.id === evento.animal_id);
      if (animal) {
        const especie = animal.especie || 'Não especificado';
        acc[especie] = (acc[especie] || 0) + 1;
      }
      return acc;
    }, {});

    // Análise por idade na adoção
    const adocoesPorIdade = eventosAdocao.reduce((acc: any, evento: any) => {
      const animal = data.animais.find((a: any) => a.id === evento.animal_id);
      if (animal && animal.idade) {
        let faixaEtaria;
        if (animal.idade < 1) faixaEtaria = 'Filhote (< 1 ano)';
        else if (animal.idade <= 3) faixaEtaria = 'Jovem (1-3 anos)';
        else if (animal.idade <= 7) faixaEtaria = 'Adulto (4-7 anos)';
        else faixaEtaria = 'Sénior (> 7 anos)';
        
        acc[faixaEtaria] = (acc[faixaEtaria] || 0) + 1;
      }
      return acc;
    }, {});

    // Análise mensal (últimos 12 meses)
    const adocoesMensais = [];
    for (let i = 11; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;

      const adocoesMes = eventosAdocao.filter((e: any) => {
        const dataEvento = new Date(e.data_evento);
        return dataEvento.getFullYear() === ano && dataEvento.getMonth() + 1 === mes;
      }).length;

      adocoesMensais.push({
        periodo: `${mes.toString().padStart(2, '0')}/${ano}`,
        adocoes: adocoesMes
      });
    }

    // Animais com mais tempo esperando adoção
    const animaisEsperando = data.animais
      .filter((a: any) => a.estado === 'Ativo')
      .map((animal: any) => {
        const diasEspera = Math.ceil((new Date().getTime() - new Date(animal.data_entrada).getTime()) / (1000 * 60 * 60 * 24));
        const localizacaoAtual = data.localizacoes
          .filter((l: any) => l.animal_id === animal.id && l.ativo)
          .sort((a: any, b: any) => new Date(b.data_entrada).getTime() - new Date(a.data_entrada).getTime())[0];
        
        return {
          ...animal,
          diasEspera,
          localizacaoAtual: localizacaoAtual?.localizacao || 'N/A'
        };
      })
      .sort((a, b) => b.diasEspera - a.diasEspera)
      .slice(0, 10);

    // Detalhes das adoções recentes
    const adocoesRecentes = eventosAdocao
      .sort((a: any, b: any) => new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime())
      .slice(0, 10)
      .map((evento: any) => {
        const animal = data.animais.find((a: any) => a.id === evento.animal_id);
        const diasAteAdocao = animal 
          ? Math.ceil((new Date(evento.data_evento).getTime() - new Date(animal.data_entrada).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        return {
          ...evento,
          animal,
          diasAteAdocao
        };
      });

    setEstatisticasAdocoes({
      totalAdocoes: eventosAdocao.length,
      totalAnimaisAdotados: animaisAdotados.length,
      tempoMedioAdocao,
      adocoesPorEspecie,
      adocoesPorIdade,
      adocoesMensais,
      animaisEsperando,
      adocoesRecentes
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (!estatisticasAdocoes) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Heart className="h-12 w-12 animate-pulse mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">A calcular estatísticas de adoções...</p>
        </div>
      </div>
    );
  }

  const periodoTexto = filtroAno && filtroAno !== 0 
    ? (filtroMes && filtroMes !== 0 
        ? `${new Date(2024, filtroMes - 1).toLocaleDateString('pt-PT', { month: 'long' })} de ${filtroAno}`
        : `Ano ${filtroAno}`)
    : 'Todos os períodos';

  const dadosEstatisticos = {
    totalRegistros: estatisticasAdocoes.totalAdocoes,
    periodoAnalise: periodoTexto
  };

  return (
    <LayoutRelatorio
      titulo="Relatório de Adoções"
      subtitulo="Análise detalhada do processo de adoção de animais"
      tipoRelatorio="Relatório de Adoções e Bem-Estar Animal"
      periodo={periodoTexto}
      dadosEstatisticos={dadosEstatisticos}
    >
      <div className="space-y-6">
      {/* Resumo de Adoções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
            <div className="text-3xl font-bold text-pink-600">
              {estatisticasAdocoes.totalAdocoes}
            </div>
            <div className="text-sm text-pink-700">Adoções no Período</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <PawPrint className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {estatisticasAdocoes.totalAnimaisAdotados}
            </div>
            <div className="text-sm text-blue-700">Total de Animais Adotados</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {estatisticasAdocoes.tempoMedioAdocao}
            </div>
            <div className="text-sm text-green-700">Dias Médios até Adoção</div>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Espécie e Idade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PawPrint className="h-5 w-5 text-orange-600" />
              <span>Adoções por Espécie</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticasAdocoes.adocoesPorEspecie).map(([especie, quantidade]) => (
                <div key={especie} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{especie}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ 
                          width: `${((quantidade as number) / estatisticasAdocoes.totalAdocoes) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <Badge variant="outline">{quantidade as number}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Adoções por Faixa Etária</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticasAdocoes.adocoesPorIdade).map(([faixa, quantidade]) => (
                <div key={faixa} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{faixa}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${((quantidade as number) / estatisticasAdocoes.totalAdocoes) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <Badge variant="outline">{quantidade as number}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Evolução Mensal de Adoções</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Adoções</TableHead>
                  <TableHead>Tendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estatisticasAdocoes.adocoesMensais.map((mes: any, index: number) => {
                  const mesAnterior = index > 0 ? estatisticasAdocoes.adocoesMensais[index - 1] : null;
                  const tendencia = mesAnterior ? mes.adocoes - mesAnterior.adocoes : 0;
                  
                  return (
                    <TableRow key={mes.periodo}>
                      <TableCell className="font-medium">{mes.periodo}</TableCell>
                      <TableCell>
                        <Badge className="bg-pink-100 text-pink-800">{mes.adocoes}</Badge>
                      </TableCell>
                      <TableCell>
                        {mesAnterior && (
                          <div className="flex items-center space-x-1">
                            {tendencia > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : tendencia < 0 ? (
                              <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                            ) : (
                              <div className="h-4 w-4" />
                            )}
                            <span className={`text-sm ${
                              tendencia > 0 ? 'text-green-600' : 
                              tendencia < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {tendencia > 0 ? `+${tendencia}` : tendencia < 0 ? tendencia : 'Estável'}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Animais Esperando Adoção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>Animais com Mais Tempo Esperando Adoção</span>
          </CardTitle>
          <CardDescription>
            Top 10 animais ativos há mais tempo na associação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estatisticasAdocoes.animaisEsperando.map((animal: any, index: number) => (
              <div key={animal.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{animal.nome}</p>
                    <p className="text-sm text-gray-600">
                      {animal.especie} • {animal.raca} • {animal.sexo}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{animal.localizacaoAtual}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">{animal.diasEspera}</div>
                  <div className="text-xs text-gray-600">dias</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adoções Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-pink-600" />
            <span>Adoções Recentes</span>
          </CardTitle>
          <CardDescription>
            Últimas 10 adoções realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Espécie/Raça</TableHead>
                  <TableHead>Tempo até Adoção</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estatisticasAdocoes.adocoesRecentes.map((adocao: any) => (
                  <TableRow key={adocao.id}>
                    <TableCell>{formatDate(adocao.data_evento)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{adocao.animal?.nome || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{adocao.animal?.numero_processo || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {adocao.animal ? `${adocao.animal.especie} • ${adocao.animal.raca}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {adocao.diasAteAdocao} dias
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {adocao.observacoes || adocao.descricao || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </LayoutRelatorio>
  );
};

export default RelatorioAdocoes;