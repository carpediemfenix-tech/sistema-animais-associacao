import React from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import EnhancedFooter from '@/components/EnhancedFooter';

const PaginaAnalytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AnalyticsDashboard />
      <EnhancedFooter />
    </div>
  );
};

export default PaginaAnalytics;