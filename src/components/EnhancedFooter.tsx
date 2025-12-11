import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

const EnhancedFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Heart className="h-3 w-3 text-red-400" />
          <span>
            Feito com muito amor pelos animais por{' '}
            <span className="font-medium text-gray-700">Vitor Pinto</span>{' '}
            <span className="font-mono">(P)2025</span>{' '}
            para a{' '}
            <span className="font-medium text-blue-600">
              Associação Valentão ao Resgate
            </span>{' '}
            - Alter do Chão - Portalegre
          </span>
          <Sparkles className="h-3 w-3 text-yellow-400" />
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;