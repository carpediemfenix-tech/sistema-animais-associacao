import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck, Users, Heart, Award } from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";

const GestaoSocios: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserCheck className="h-8 w-8 mr-3 text-indigo-600" />
              Gestão de Sócios
            </h1>
            <p className="text-gray-600 mt-1">
              Gestão de sócios e apoiantes do Sistema Valentão
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard Principal
              </Button>
            </Link>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Card de Informação */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Módulo de Sócios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Módulo de Sócios em Desenvolvimento
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Este módulo permitirá a gestão completa de sócios e apoiantes da associação, 
                  incluindo registo, quotas, benefícios e comunicações.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm text-gray-700">Gestão de Quotas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm text-gray-700">Registo de Sócios</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm text-gray-700">Apoiantes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default GestaoSocios;