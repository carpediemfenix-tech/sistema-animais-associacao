import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  ArrowLeft,
  Construction,
  AlertTriangle
} from "lucide-react";

const ModuloAgenda = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-6">
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
                <Calendar className="h-10 w-10 mr-3 text-pink-600" />
                Módulo Agenda
              </h1>
              <p className="text-gray-600 text-lg">
                Calendário de eventos e agendamentos
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Construction className="h-5 w-5 mr-2" />
            Em Desenvolvimento
          </Badge>
        </div>

        {/* Aviso de Desenvolvimento */}
        <Card className="mb-8 border-pink-200 bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center text-pink-800">
              <AlertTriangle className="h-6 w-6 mr-2" />
              MÓDULO EM DESENVOLVIMENTO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-pink-700 mb-4">
              Este módulo está atualmente em desenvolvimento. As funcionalidades estarão disponíveis em breve.
            </p>
            <div className="bg-white p-4 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-pink-800 mb-2">Funcionalidades Planeadas:</h3>
              <ul className="list-disc list-inside text-pink-700 space-y-1">
                <li>Calendário de eventos da associação</li>
                <li>Agendamento de consultas veterinárias</li>
                <li>Gestão de turnos de voluntários</li>
                <li>Lembretes automáticos</li>
                <li>Sincronização com calendários externos</li>
                <li>Relatórios de atividades</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Preview das Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="text-gray-500">Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Calendário de atividades - Em desenvolvimento...</p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="text-gray-500">Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Consultas e compromissos - Em desenvolvimento...</p>
            </CardContent>
          </Card>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="text-gray-500">Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Gestão de voluntários - Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModuloAgenda;