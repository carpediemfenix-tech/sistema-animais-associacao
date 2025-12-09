import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench,
  ArrowLeft,
  Construction,
  AlertTriangle
} from "lucide-react";

const ModuloEquipamentos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Wrench className="h-10 w-10 mr-3 text-orange-600" />
                Módulo Equipamentos
              </h1>
              <p className="text-gray-600 text-lg">
                Gestão de equipamentos e materiais da associação
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Construction className="h-5 w-5 mr-2" />
            Em Desenvolvimento
          </Badge>
        </div>

        {/* Aviso de Desenvolvimento */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-6 w-6 mr-2" />
              MÓDULO EM DESENVOLVIMENTO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Este módulo está atualmente em desenvolvimento. As funcionalidades estarão disponíveis em breve.
            </p>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">Funcionalidades Planeadas:</h3>
              <ul className="list-disc list-inside text-orange-700 space-y-1">
                <li>Inventário de equipamentos</li>
                <li>Controlo de stock</li>
                <li>Gestão de manutenção</li>
                <li>Histórico de utilização</li>
                <li>Alertas de reposição</li>
                <li>Relatórios de equipamentos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Preview das Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="text-gray-500">Inventário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Lista completa de equipamentos - Em desenvolvimento...</p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="text-gray-500">Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Controlo de quantidades - Em desenvolvimento...</p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="text-gray-500">Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Agendamento e histórico - Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModuloEquipamentos;