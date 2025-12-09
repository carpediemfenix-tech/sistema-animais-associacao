import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart,
  ArrowLeft,
  Plus,
  List,
  Archive,
  Settings
} from "lucide-react";

const ModuloAnimais = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
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
                <Heart className="h-10 w-10 mr-3 text-green-600" />
                Módulo Animais
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema de gestão de animais e cuidados
              </p>
            </div>
          </div>
        </div>

        {/* Funcionalidades Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/animais">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="p-3 rounded-lg bg-green-500 text-white w-fit">
                  <List className="h-6 w-6" />
                </div>
                <CardTitle>Lista de Animais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visualizar e gerir todos os animais
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/novo-animal">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="p-3 rounded-lg bg-blue-500 text-white w-fit">
                  <Plus className="h-6 w-6" />
                </div>
                <CardTitle>Novo Animal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Registar um novo animal no sistema
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/animais-arquivados">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="p-3 rounded-lg bg-orange-500 text-white w-fit">
                  <Archive className="h-6 w-6" />
                </div>
                <CardTitle>Animais Arquivados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visualizar animais arquivados
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/configuracoes/especies">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="p-3 rounded-lg bg-purple-500 text-white w-fit">
                  <Settings className="h-6 w-6" />
                </div>
                <CardTitle>Gestão de Espécies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Configurar espécies de animais
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/configuracoes/localizacoes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="p-3 rounded-lg bg-indigo-500 text-white w-fit">
                  <Settings className="h-6 w-6" />
                </div>
                <CardTitle>Gestão de Localizações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Configurar localizações dos animais
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-50">
            <CardHeader>
              <div className="p-3 rounded-lg bg-gray-400 text-white w-fit">
                <Settings className="h-6 w-6" />
              </div>
              <CardTitle className="text-gray-500">Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Relatórios de animais - Em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModuloAnimais;