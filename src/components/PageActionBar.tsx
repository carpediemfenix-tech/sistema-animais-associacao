import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface SecondaryAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface PageActionBarProps {
  // Navegação
  breadcrumbs: Breadcrumb[];
  
  // Ações principais (direita)
  primaryActions?: React.ReactNode;
  
  // Ações secundárias (dropdown)
  secondaryActions?: SecondaryAction[];
  
  // Opções
  showBackToDashboard?: boolean;
  sticky?: boolean;
  className?: string;
}

const PageActionBar: React.FC<PageActionBarProps> = ({
  breadcrumbs,
  primaryActions,
  secondaryActions,
  showBackToDashboard = true,
  sticky = true,
  className = '',
}) => {
  return (
    <div 
      className={`
        bg-white border-b-2 border-blue-200 shadow-sm
        ${sticky ? 'sticky top-0 z-40' : ''}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Lado Esquerdo: Navegação */}
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            
            {/* Botão Dashboard */}
            {showBackToDashboard && (
              <>
                <Link to="/">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Home</span>
                  </Button>
                </Link>
                
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {breadcrumbs && breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.href ? (
                    <Link to={crumb.href}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-9 hover:bg-blue-50 text-blue-700 font-semibold"
                      >
                        {crumb.icon && <span className="mr-2">{crumb.icon}</span>}
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {crumb.label}
                        </span>
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex items-center h-9 px-3 text-gray-900 font-bold">
                      {crumb.icon && <span className="mr-2">{crumb.icon}</span>}
                      <span className="truncate max-w-[150px] sm:max-w-[200px]">
                        {crumb.label}
                      </span>
                    </div>
                  )}
                  
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Lado Direito: Ações */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {/* Ações Principais */}
            {primaryActions && (
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                {primaryActions}
              </div>
            )}
            
            {/* Ações Secundárias (Dropdown) */}
            {secondaryActions && secondaryActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {secondaryActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className="cursor-pointer"
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageActionBar;
