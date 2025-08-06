import React from 'react';
import { Info, RotateCcw, AlertTriangle } from 'lucide-react';
import { Environment } from '../types/sigtap';

interface ApiInfoProps {
  environment: Environment;
  onToggleEnvironment: () => void;
}

const ApiInfo: React.FC<ApiInfoProps> = ({ environment, onToggleEnvironment }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Info size={20} />
        Informações da API
      </h3>
      
      <div className="space-y-3 text-sm">
        <p>
          <strong>Ambiente:</strong>{' '}
          <code className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">
            {environment === 'homologacao' ? 'Homologação' : 'Produção'}
          </code>
        </p>
        
        <p>
          <strong>Autenticação:</strong>{' '}
          <code className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">
            SIGTAP.PUBLICO / sigtap#2015public
          </code>
        </p>
        
        <p>
          <strong>Base URL Homologação:</strong>{' '}
          <code className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">
            https://servicoshm.saude.gov.br/sigtap/
          </code>
        </p>
        
        <p>
          <strong>Base URL Produção:</strong>{' '}
          <code className="bg-slate-700 text-gray-100 px-2 py-1 rounded text-xs font-mono">
            https://servicos.saude.gov.br/sigtap/
          </code>
        </p>
      </div>

      <button
        onClick={onToggleEnvironment}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 mt-4"
      >
        <RotateCcw size={16} />
        Alternar para {environment === 'homologacao' ? 'Produção' : 'Homologação'}
      </button>

      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">⚠️ Nota Importante:</p>
            <p className="text-red-700 text-sm mt-1">
              Este frontend é uma demonstração. Para que as chamadas à API funcionem em um ambiente real, 
              é obrigatório usar um servidor backend (proxy) para evitar erros de CORS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiInfo;