import React from 'react';

// Simple debug logger for development
export const debugLogger = {
  log: (level: 'info' | 'error' | 'success' | 'debug', message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      
      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }
};

interface DebugLoggerComponentProps {
  title?: string;
}

const DebugLoggerComponent: React.FC<DebugLoggerComponentProps> = ({ title = "Debug Logger" }) => {
  // In production, don't render anything
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <strong>{title}</strong>
      <div>Check console for debug logs</div>
    </div>
  );
};

export default DebugLoggerComponent;