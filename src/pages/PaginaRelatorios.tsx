import React from 'react';
import RelatoriosAvancados from '@/components/RelatoriosAvancados';
import EnhancedFooter from '@/components/EnhancedFooter';

const PaginaRelatorios: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <RelatoriosAvancados />
      <EnhancedFooter />
    </div>
  );
};

export default PaginaRelatorios;