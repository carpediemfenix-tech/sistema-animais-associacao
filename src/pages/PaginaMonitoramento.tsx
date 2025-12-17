import React from 'react';
import MonitoringDashboard from '@/components/MonitoringDashboard';
import EnhancedFooter from '@/components/EnhancedFooter';

const PaginaMonitoramento: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MonitoringDashboard />
      <EnhancedFooter />
    </div>
  );
};

export default PaginaMonitoramento;