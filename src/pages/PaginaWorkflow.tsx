import React from 'react';
import WorkflowAprovacoes from '@/components/WorkflowAprovacoes';
import EnhancedFooter from '@/components/EnhancedFooter';

const PaginaWorkflow: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <WorkflowAprovacoes />
      <EnhancedFooter />
    </div>
  );
};

export default PaginaWorkflow;