import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Heart, 
  PawPrint, 
  Calendar, 
  TrendingUp, 
  Clock,
  BarChart3,
  Target
} from "lucide-react";
import PieChart from "@/components/charts/PieChart";
import TrendChart from "@/components/charts/TrendChart";
import { 
  RelatorioAnimaisAdocoes,
  EstatisticasRelatorio
} from "@/types/relatorios";

interface VisualizadorRelatorioAdocoesProps {
  dados: RelatorioAnimaisAdocoes;
  estatisticas: EstatisticasRelatorio;
}

const VisualizadorRelatorioAdocoes: React.FC<VisualizadorRelatorioAdocoesProps> = ({ 
  dados, 
  estatisticas 
}) => {
  // Preparar dados para gráficos
  const dadosEspecies = Object.entries(dados.adocoes_por_especie).map(([especie, quantidade]) => ({
    label: especie,
    value: quantidade,
    color: especie === 'Cão' ? '#3b82f6' : 
           especie === 'Gato' ? '#10b981' : 
           '#f59e0b'
  }));

  const dadosTendencia = dados.adocoes_por_mes.map(item => ({
    label: item.mes.split(' ')[0], // Apenas o mês
    value: item.quantidade,
    change: 0 // Poderia calcular variação se tivéssemos dados históricos
  }));

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            Resumo Executivo - Adoções
          </CardTitle>
          <CardDescription>
            Período: {new Date(estatisticas.periodo_analisado.inicio).toLocaleDateString('pt-PT')} a{' '}
            {new Date(estatisticas.periodo_analisado.fim).toLocaleDateString('pt-PT')} 
            ({estatisticas.periodo_analisado.dias} dias)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{dados.total_adocoes}</div>
              <p className="text-sm text-gray-600">Total de Adoções</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dados.tempo_medio_adocao}</div>
              <p className="text-sm text-gray-600">Dias Médios</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {estatisticas.totais_numericos?.['Adoções/Mês'] || 0}
              </div>
              <p className="text-sm text-gray-600">Adoções/Mês</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Object.keys(dados.adocoes_por_especie).length}
              </div>
              <p className="text-sm text-gray-600">Espécies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição por Espécies */}
        <PieChart
          title="Adoções por Espécie"
          data={dadosEspecies}
          icon={<PawPrint className="h-5 w-5 text-blue-600" />}
        />

        {/* Tendência Mensal */}
        <TrendChart
          title="Tendência Mensal"
          data={dadosTendencia}
          color="#10b981"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />
      </div>

      {/* Análise Detalhada */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Estatísticas por Espécie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Análise por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dados.adocoes_por_especie).map(([especie, quantidade]) => {
                const percentual = estatisticas.percentuais?.[especie] || 0;
                return (
                  <div key={especie} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{especie}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{quantidade} adoções</Badge>
                      <Badge variant="secondary">{percentual}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Tempo Médio de Adoção</span>
                </div>
                <Badge variant="outline">
                  {dados.tempo_medio_adocao} dias
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Taxa Mensal</span>
                </div>
                <Badge variant="outline">
                  {estatisticas.totais_numericos?.['Adoções/Mês'] || 0} adoções/mês
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span>Eficiência</span>
                </div>
                <Badge variant={dados.tempo_medio_adocao <= 30 ? "default" : "secondary"}>
                  {dados.tempo_medio_adocao <= 30 ? "Excelente" : 
                   dados.tempo_medio_adocao <= 60 ? "Boa" : "Melhorar"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista Detalhada de Adoções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            Adoções Realizadas ({dados.animais_adotados.length})
          </CardTitle>
          <CardDescription>
            Lista completa dos animais adotados no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Espécie</TableHead>
                <TableHead>Data Entrada</TableHead>
                <TableHead>Data Adoção</TableHead>
                <TableHead>Tempo (dias)</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.animais_adotados.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{animal.especie}</Badge>
                  </TableCell>
                  <TableCell>
                    {animal.data_entrada ? 
                      new Date(animal.data_entrada).toLocaleDateString('pt-PT') : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    {animal.data_adocao ? 
                      new Date(animal.data_adocao).toLocaleDateString('pt-PT') : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {animal.tempo_ate_adocao} dias
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={animal.tempo_ate_adocao <= 30 ? "default" : 
                               animal.tempo_ate_adocao <= 60 ? "secondary" : "outline"}
                    >
                      {animal.tempo_ate_adocao <= 30 ? "Rápida" : 
                       animal.tempo_ate_adocao <= 60 ? "Normal" : "Lenta"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizadorRelatorioAdocoes;