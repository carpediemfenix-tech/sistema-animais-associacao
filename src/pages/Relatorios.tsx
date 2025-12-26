import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import EnhancedHeader from "@/components/EnhancedHeader";
import EnhancedFooter from "@/components/EnhancedFooter";
import SistemaRelatoriosProfissional from "@/components/SistemaRelatoriosProfissional";

const Relatorios = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <EnhancedHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <SistemaRelatoriosProfissional />
      </div>
      
      <EnhancedFooter />
    </div>
  );
};

export default Relatorios;