import React from 'react';

interface LogotipoValentaoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const LogotipoValentao: React.FC<LogotipoValentaoProps> = ({ 
  size = 'md', 
  className = '',
  showText = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto', 
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="./images/media-_3_.gif" 
        alt="Associação Valentão" 
        className={`${sizeClasses[size]} object-contain drop-shadow-sm`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">
            Associação Valentão
          </span>
          <span className="text-xs text-gray-600">
            Operacionais
          </span>
        </div>
      )}
    </div>
  );
};

export default LogotipoValentao;
