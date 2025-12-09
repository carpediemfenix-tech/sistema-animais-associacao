import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target,
  ArrowLeft,
  Settings
} from "lucide-react";

const ModuloMissoes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-6">
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
                <Target className="h-10 w-10 mr-3 text-purple-600" />
                Módulo Missões
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema de gestão de missões e tarefas
              </p>
            </div>
          </div>
        </div>

        {/* Funcionalidades Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="opacity-50">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gray-400 text-white w-fit">
                <Settings className="h-6 w-6" />
              </div>
              <CardTitle className="text-gray-500">Gestão de Missões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Sistema de missões - Em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModuloMissoes;