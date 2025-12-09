import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users,
  ArrowLeft,
  Settings,
  Eye,
  Plus,
  GraduationCap,
  FileText
} from "lucide-react";

const ModuloVoluntarios = () => {
  const funcionalidades = [
    {
      titulo: "Dashboard de Voluntários",
      descricao: "Sistema completo de voluntários",
      icone: Users,
      rota: "/voluntarios",
      cor: "bg-blue-500"
    },
    {
      titulo: "Gestão de Voluntários",
      descricao: "Lista e gestão de voluntários",
      icone: Eye,
      rota: "/voluntarios/gestao",
      cor: "bg-green-500"
    },
    {
      titulo: "Sistema de Formação",
      descricao: "Formações e desenvolvimento",
      icone: GraduationCap,
      rota: "/sistema-formacao",
      cor: "bg-purple-500"
    },
    {
      titulo: "Relatórios",
      descricao: "Relatórios de voluntários",
      icone: FileText,
      rota: "/voluntarios/relatorios",
      cor: "bg-orange-500"
    }
  ];

  const configuracoes = [
    {
      titulo: "Especialidades dos Voluntários",
      descricao: "Configurar especialidades",
      icone: Settings,
      rota: "/configuracoes/especialidades"
    },
    {
      titulo: "Tipos de Formação",
      descricao: "Configurar tipos de formação",
      icone: GraduationCap,
      rota: "/configuracoes/formacao"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
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
                <Users className="h-10 w-10 mr-3 text-blue-600" />
                Módulo Voluntários
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema de gestão de voluntários e responsabilidades
              </p>
            </div>
          </div>
          <Link to="/voluntarios/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Voluntário
            </Button>
          </Link>
        </div>

        {/* Funcionalidades Principais */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-6 w-6 mr-2" />
              Funcionalidades Principais
            </CardTitle>
            <CardDescription>
              Acesso às principais funcionalidades do módulo de voluntários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {funcionalidades.map((func, index) => {
                const IconeFunc = func.icone;
                return (
                  <Link key={index} to={func.rota}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className={`p-3 rounded-lg ${func.cor} text-white w-fit`}>
                          <IconeFunc className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">{func.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {func.descricao}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Configurações do Módulo
            </CardTitle>
            <CardDescription>
              Configurações específicas do módulo de voluntários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configuracoes.map((config, index) => {
                const IconeConfig = config.icone;
                return (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer opacity-50">
                    <div className="flex items-center space-x-3">
                      <IconeConfig className="h-5 w-5 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-sm text-gray-500">{config.titulo}</h3>
                        <p className="text-xs text-gray-400">{config.descricao} - Em desenvolvimento</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModuloVoluntarios;