import React from 'react';

// Debug logger simples para desenvolvimento
export const debugLogger = {
  log: (level: 'info' | 'error' | 'success' | 'debug', message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const prefix = {
        info: '🔵',
        error: '🔴',
        success: '🟢',
        debug: '🟡'
      }[level];
      
      console.log(`${prefix} [${timestamp}] ${message}`, data || '');
    }
  }
};

interface DebugLoggerComponentProps {
  title?: string;
}

const DebugLoggerComponent: React.FC<DebugLoggerComponentProps> = ({ title = "Debug Logger" }) => {
  // Em produção, não renderiza nada
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs opacity-50 hover:opacity-100 transition-opacity">
      {title}
    </div>
  );
};

export default DebugLoggerComponent;