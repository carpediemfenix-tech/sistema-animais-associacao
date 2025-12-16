import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import ExecutiveDashboardSimple from "@/components/ExecutiveDashboardSimple";

const DashboardExecutivoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <div className="flex-1">
        {/* Cabeçalho da Página */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h1>
                <p className="text-gray-600">Visão estratégica e KPIs em tempo real</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Conteúdo Principal */}
        <ExecutiveDashboardSimple />
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default DashboardExecutivoPage;