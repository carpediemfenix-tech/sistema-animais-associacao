import React from 'react';
import { AlertTriangle, TestTube } from 'lucide-react';
import { isMockData, getMockDataClassName } from '@/lib/mockUtils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MockDataIndicatorProps {
  data: any;
  children: React.ReactNode;
  variant?: 'subtle' | 'normal' | 'strong' | 'warning';
  showBadge?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * Componente que automaticamente detecta e marca dados mock em vermelho
 */
export const MockDataIndicator: React.FC<MockDataIndicatorProps> = ({
  data,
  children,
  variant = 'normal',
  showBadge = false,
  showTooltip = true,
  className = ''
}) => {
  const isDataMock = isMockData(data);

  if (!isDataMock) {
    return <>{children}</>;
  }

  const getVariantClass = () => {
    switch (variant) {
      case 'subtle':
        return 'mock-data-subtle';
      case 'strong':
        return 'mock-data-strong';
      case 'warning':
        return 'mock-data-warning';
      default:
        return 'mock-data';
    }
  };

  const mockClassName = getMockDataClassName(data, `${getVariantClass()} ${className}`);

  const content = (
    <div className={mockClassName}>
      {children}
      {showBadge && (
        <Badge variant="destructive" className="mock-data-badge ml-2">
          <TestTube className="w-3 h-3 mr-1" />
          TESTE
        </Badge>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Dados de exemplo/teste</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

/**
 * Componente para marcar cards inteiros como mock
 */
export const MockDataCard: React.FC<{
  data: any;
  children: React.ReactNode;
  className?: string;
}> = ({ data, children, className = '' }) => {
  const isDataMock = isMockData(data);
  
  if (!isDataMock) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`mock-data-card ${className}`}>
      {children}
    </div>
  );
};

/**
 * Componente para texto simples mock
 */
export const MockDataText: React.FC<{
  data: any;
  children: React.ReactNode;
  className?: string;
}> = ({ data, children, className = '' }) => {
  const isDataMock = isMockData(data);
  
  if (!isDataMock) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={`mock-data-text ${className}`}>
      {children}
    </span>
  );
};

/**
 * Hook para usar classes mock condicionalmente
 */
export const useMockDataClass = (data: any, baseClass: string = '') => {
  return getMockDataClassName(data, baseClass);
};

export default MockDataIndicator;